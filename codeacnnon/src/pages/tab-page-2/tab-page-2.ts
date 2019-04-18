import { Component, OnChanges, Injectable } from '@angular/core';
import { ToastService } from '../../services/toast-service'
import { TabsService } from '../../services/tabs-service';
import { LoadingService } from '../../services/loading-service';
import { IonicPage } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera,CameraOptions  } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';
import { AlertController } from 'ionic-angular'; 
import { HttpClient,HttpHeaders} from "@angular/common/http";
import{MeeshoentityProvider} from "../../providers/meeshoentity/meeshoentity"

import { Observable} from 'rxjs/Observable';

// declare var SqlServer: any;
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
    meeshoDto:MeeshoentityProvider = new MeeshoentityProvider();
    loading:any;
    currentImage = null;
    currentImage2 = null;
    currentImageList:any[] = [];
    emailAttachmentList:any[]=[];
    employees: Observable < any[] > ;
    constructor(private tabsService: TabsService, private toastCtrl: ToastService,public barcodeScanner:BarcodeScanner
    ,private camera: Camera, public emailComposer: EmailComposer,public alertCtrl: AlertController,
    private loadingService: LoadingService,private http: HttpClient) {
      this.tabsService.load("tab2").subscribe(snapshot => {
        this.params = snapshot;
      });
      this.clientDetails = "";
   
      // SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip",(event) =>{
      //  console.log(event);
      // }, (error)=> {
      //   this.displaySubOrderDetails('Sql Error !'+JSON.stringify(error)); 
      //  console.log(error);
      // });
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
    this.scanReverseLabel2().subscribe((tempdate) => {
      console.log(tempdate);
  }), err => {
      console.log(err);
  }

  }
  scanReverseLabel2()
  {
   return this.http.get<any[]>("https://meeshoapiservices20190413104538.azurewebsites.net/api/base/GetDailyAccounts");
    // console.log(test,'test');
    // this.barcodeScanner.scan()
    // .then((result) => {
    //   this.todo.reverseLabel = result.text.toString(); 
    // })
    // .catch((error) => {
    //     alert(error);
    // }) 
  }

  saveReturns2()
  {
    this.loadingService.show();
    // SqlServer.executeQuery("Save_MeeshoReturns '"+this.todo.suborderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'",(suborderData)=> {
    //   if(suborderData!=null && suborderData[0].length>0)
    //   {
    //    this.displaySubOrderDetails('Return Id => '+JSON.parse(suborderData)[0][0].ReturnId);  
    //     this.todo.suborderId = "";
    //     this.todo.reverseLabel = "";
    //     this.currentImageList = [];
    //     this.emailAttachmentList = [];
    //     this.clientDetails = "";
    //   }  
    //   this.loadingService.hide();
    // }, (error)=> {
    //   this.displaySubOrderDetails('Query Error !'+JSON.stringify(error)); 
    //   this.loadingService.hide();
    // });	 
  }

  saveReturns()
  {
    
    this.loadingService.show();   
    this.meeshoDto.DateOfReturn = this.todo.returnDate;
    this.meeshoDto.SuborderId =  this.todo.suborderId;
    this.meeshoDto.ReverseLabelId = this.todo.reverseLabel;
    this.meeshoDto.ReturnType = this.todo.returnType;
    this.saveReturnService()
        .subscribe((returnId)=>{
        // console.log(returnId);
        this.displaySubOrderDetails('Saved Successfully => '+returnId);  
        this.todo.suborderId = "";
        this.todo.reverseLabel = "";
        this.currentImageList = [];
        this.emailAttachmentList = [];
        this.clientDetails = "";
        this.loadingService.hide();
    }),
    err=>{
      console.log(err);
      this.loadingService.hide();
      this.displaySubOrderDetails('Something went wrong'+err);
    }; 	 
    // SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip",(event) =>{
    //    SqlServer.executeQuery("Save_MeeshoReturns '"+this.todo.suborderId+"','"+this.todo.reverseLabel+"','"+this.todo.returnDate+"','"+this.todo.returnType+"'",(suborderData)=> {
    //      if(suborderData!=null && suborderData[0].length>0)
    //     { 
    //       this.displaySubOrderDetails('Return Id => '+JSON.parse(suborderData)[0][0].ReturnId);  
    //       this.todo.suborderId = "";
    //       this.todo.reverseLabel = "";
    //       this.currentImageList = [];
    //       this.emailAttachmentList = [];
    //       this.clientDetails = "";
    //     }  
    //     this.loadingService.hide();
    //   }, (error)=> {
    //     this.displaySubOrderDetails('Query Error !'+JSON.stringify(error)); 
    //     this.loadingService.hide();
    //   });	
    // }, (error)=> {
    //   this.displaySubOrderDetails('Sql Error !'+JSON.stringify(error)); 
    //   this.loadingService.hide();
    // }); 
  }

  saveReturnService()
  {
    const headers = new HttpHeaders().set('content-type', 'application/json');  
    return this.http.post<string>("http://localhost:52648/api/base/SaveReturn",this.meeshoDto,{headers}); 
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
    this.http.get<string>("https://meeshoapiservices20190413104538.azurewebsites.net/api/base/GetSubOrderbyid?suborderid="+this.todo.suborderId)
    .subscribe((suborderIdDetails)=>{
    this.clientDetails = suborderIdDetails
    this.loadingService.hide();
    }),
    err=>{
      console.log(err);
      this.loadingService.hide();
    }; 	  
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
