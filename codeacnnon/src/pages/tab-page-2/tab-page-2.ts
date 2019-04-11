import { Component, OnChanges } from '@angular/core';
import { ToastService } from '../../services/toast-service'
import { TabsService } from '../../services/tabs-service';
import { IonicPage } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera,CameraOptions  } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';
import { AlertController } from 'ionic-angular';
import { LoadingService } from '../../services/loading-service'

declare var SqlServer: any;
declare let window: any; 

@IonicPage()
@Component({
  templateUrl: 'tab-page-2.html',
  providers: [TabsService, ToastService,EmailComposer]
})


export class TabPage2 implements OnChanges {
    params:any = {};
    returnIdResponse:string = "";
    subOrderDetails:any;
    clientDetails:string;
    todo = {
      suborderId: '',
      reverseLabel: '',
      returnType:'CR',
      returnDate:''
    };
    currentImage = null;
    currentImage2 = null;
    currentImageList:any[] = [];
    emailAttachmentList:any[]=[];
    constructor(private tabsService: TabsService, private toastCtrl: ToastService,public barcodeScanner:BarcodeScanner
    ,private camera: Camera, public emailComposer: EmailComposer,public alertCtrl: AlertController,
    private loadingService: LoadingService) {
      this.tabsService.load("tab2").subscribe(snapshot => {
        this.params = snapshot;
      });
      this.clientDetails = "";
    }

    ngOnChanges(changes: { [propKey: string]: any }) {
      this.params = changes['data'].currentValue;
    }

    onItemClick(item:any) {
        this.toastCtrl.presentToast("Folow");
    }

    scanSubOrder() {
      this.barcodeScanner.scan()
      .then((result) => {
        this.todo.suborderId = result.text.toString();
          this.getSubOrderIdDetails();
      })
      .catch((error) => {
          alert(error);
      })
  }

  scanReverseLabel()
  {
    this.barcodeScanner.scan()
    .then((result) => {
      this.todo.reverseLabel = result.text.toString(); 
    })
    .catch((error) => {
        alert(error);
    }) 
  }

  saveReturns()
  {
    this.loadingService.show();
    // console.log(this.todo,'save');
    // var _suborderId =  this.todo.suborderId;
    // var _reverseLabel =  this.todo.reverseLabel;
    // var _returnType =  this.todo.returnType;
    // var _returnDate =  this.todo.returnDate;
    SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip",(event) =>{
      // console.log(JSON.stringify(event),'sql'); 
      // console.log(this.todo,'todo inside'); 
      // console.log("Save_MeeshoReturns '"+_suborderId+"','"+_reverseLabel+"','"+_returnType+"','"+_returnDate+"'");
      //console.log("Save_MeeshoReturns '"+this.todo.suborderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'","testing");
      SqlServer.executeQuery("Save_MeeshoReturns '"+this.todo.suborderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'",(suborderData)=> {
        // console.log(JSON.parse(suborderData));
        if(suborderData!=null)
        {
          // this.returnIdResponse = ;
          this.displaySubOrderDetails('Return Id => '+JSON.parse(suborderData)[0][0].ReturnId);  
          this.todo.suborderId = "";
          this.todo.reverseLabel = "";
          this.currentImageList = [];
          this.emailAttachmentList = [];
          this.clientDetails = "";
        }  
        this.loadingService.hide();
      }, function(error) {
        this.displaySubOrderDetails('Query Error !'+JSON.stringify(error)); 
        this.loadingService.hide();
      });	
    }, function(error) {
      this.displaySubOrderDetails('Sql Error !'+JSON.stringify(error)); 
      this.loadingService.hide();
    });

  }

  captureImage() {
    const options: CameraOptions = {
      quality: 65,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: true,
    }
  

    this.camera.getPicture(options).then((imageData) => {
      this.emailAttachmentList.push(imageData);
      this.currentImage = window.Ionic.WebView.convertFileSrc(imageData); 
      this.currentImageList.push(this.currentImage);
      // this.currentImage2 = base64Image;
      // console.log(base64Image,'64');
      console.log(this.currentImage,'imageData');
    }, (err) => {
      // Handle error
      console.log('Image error: ', err);
    });
  }

  
  getSubOrderIdDetails()
  { 
    this.loadingService.show();
    SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip",(event)=> {
      // console.log(JSON.stringify(event),'sql'); 
      SqlServer.executeQuery("Meesh_GetSubOrderIdDetail '"+this.todo.suborderId+"'",(suborderData)=> {
        var result = JSON.parse(suborderData); 
        if(result != null)
        {
          this.clientDetails = 'NAME: '+result[0][0].ClientName+' || SKU:'+result[0][0].SKU; 
        }
        else
        {
          this.clientDetails = 'SubOrderId not found';
        }
        this.loadingService.hide();
        // this.displaySubOrderDetails(details);
      }, function(error) {
        this.displaySubOrderDetails('Query Error !'+JSON.stringify(error)); 
        this.loadingService.hide();
      });	
    }, function(error) {
      this.displaySubOrderDetails('Sql Error !'+JSON.stringify(error)); 
      this.loadingService.hide();
    }); 
  }

  displaySubOrderDetails(subtitle){
    // console.log(suborderData);
    let alert = this.alertCtrl.create({
       title: 'Details',
       subTitle:subtitle,
       buttons: ['OK']
     });
     alert.present();
  }

  sendEmail() {
     let emailBody  = "";
     let emailSub = "";
    if(this.todo.returnType == "WP")
    {
        emailBody = "We received wrong return on "+this.todo.returnDate+".\n Sub order id - "+this.todo.suborderId +" \n  Reverse Label Id - "+this.todo.reverseLabel+" \n PFA images for reference ";
        emailSub = "Wrong Product Received for Sub Order id ->"+this.todo.suborderId;
    }
    else if(this.todo.returnType == "IM")
    {
      emailBody = "We received a return on "+this.todo.returnDate+"\n. However, item was missing from the return .\n Sub order id - "+this.todo.suborderId +" \n  Reverse Label Id - "+this.todo.reverseLabel+" \n PFA images for reference ";
      emailSub = "Item Missing for Sub Order Id ->"+this.todo.suborderId; 
    }

    let email = {
      to: 'suppliersupport@meesho.com',
      // cc: 'amitbadala07@gmail.com',
      attachments:this.emailAttachmentList ,
      subject: emailSub,
      body: emailBody,
      isHtml: true
    };

    this.emailComposer.open(email);
  }

}
