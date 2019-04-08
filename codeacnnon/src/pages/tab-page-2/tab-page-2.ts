import { Component, OnChanges } from '@angular/core';
import { ToastService } from '../../services/toast-service'
import { TabsService } from '../../services/tabs-service';
import { IonicPage,normalizeURL } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera,CameraOptions  } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';

declare var SqlServer: any;

@IonicPage()
@Component({
  templateUrl: 'tab-page-2.html',
  providers: [TabsService, ToastService,EmailComposer]
})


export class TabPage2 implements OnChanges {
    params:any = {};
    returnIdResponse:string = "";
    subOrderDetails:string = "";
    todo = {
      suborderId: '',
      reverseLabel: '',
      returnType:'CR',
      returnDate:''
    };
    currentImage = null;
    currentImage2 = null;
    currentImageList:any[] = [];
    constructor(private tabsService: TabsService, private toastCtrl: ToastService,public barcodeScanner:BarcodeScanner
    ,private camera: Camera, public emailComposer: EmailComposer) {
      this.tabsService.load("tab2").subscribe(snapshot => {
        this.params = snapshot;
      });
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
          this.getSubOrderIdDetails(result.text.toString());
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
    console.log(this.todo,'save');
    SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip", function(event) {
      console.log(JSON.stringify(event),'sql'); 
      // console.log("Save_MeeshoReturns '"+this.todo.subOrderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'","testing");
      SqlServer.executeQuery("Save_MeeshoReturns '"+this.todo.subOrderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'", function(suborderData) {
        console.log(JSON.parse(suborderData));
        this.returnIdResponse = JSON.stringify(suborderData);
      }, function(error) {
        console.log("QuerryError : " + JSON.stringify(error));
      });	
    }, function(error) {
      console.log(JSON.stringify(error),'sqlerror');
    });

  }

  captureImage() {
    const options: CameraOptions = {
      // sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.currentImage = normalizeURL(imageData);
      // let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.currentImageList.push(this.currentImage);
      // this.currentImage2 = base64Image;
      // console.log(base64Image,'64');
      console.log(this.currentImage,'imageData');
    }, (err) => {
      // Handle error
      console.log('Image error: ', err);
    });
  }

  
  getSubOrderIdDetails(subOrderId:string)
  {
    SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip", function(event) {
      console.log(JSON.stringify(event),'sql'); 
      SqlServer.executeQuery("Meesh_GetSubOrderIdDetail '"+subOrderId+"'", function(suborderData) {
        console.log(JSON.parse(suborderData));
        this.subOrderDetails = JSON.stringify(suborderData);
      }, function(error) {
        console.log("QuerryError : " + JSON.stringify(error));
      });	
    }, function(error) {
      console.log(JSON.stringify(error),'sqlerror');
    }); 
  }

  sendEmail() {
     let emailBody  = "";
     let emailSub = "";
    if(this.todo.returnType == "IM")
    {
        emailBody = "We received wrong return on "+this.todo.returnDate+".\n Sub order id - "+this.todo.suborderId +" \n  Reverse Label Id - "+this.todo.reverseLabel+" \n PFA images for reference ";
        emailSub = "Wrong Product Received for Sub Order id ->"+this.todo.suborderId;
    }
    else (this.todo.returnType == "WP")
    {
      emailBody = "We received a return on "+this.todo.returnDate+"However, item was missing from the return .\n Sub order id - "+this.todo.suborderId +" \n  Reverse Label Id - "+this.todo.reverseLabel+" \n PFA images for reference ";
      emailSub = "Item Missing for Sub Order Id ->"+this.todo.suborderId; 
    }

    let email = {
      to: 'amitbadala07@gmail.com',
      // cc: 'amitbadala07@gmail.com',
      attachments:this.currentImageList ,
      subject: emailSub,
      body: emailBody,
      isHtml: true
    };

    this.emailComposer.open(email);
  }

}
