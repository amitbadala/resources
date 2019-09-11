import { Component } from "@angular/core";
import { ToastService } from "../../services/toast-service";
// import { TabsService } from '../../services/tabs-service';
import { LoadingService } from "../../services/loading-service";
// import { IonicPage } from 'ionic-angular';
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { EmailComposer } from "@ionic-native/email-composer";
import { AlertController, Platform } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MeeshoentityProvider } from "../../providers/meeshoentity/meeshoentity";

import { Observable } from "rxjs/Observable";
import { IonicPage, NavController, NavParams } from "ionic-angular";

// declare var SqlServer: any;
declare let window: any;

@IonicPage()
@Component({
  templateUrl: "tab-page-2.html",
  providers: [ToastService, EmailComposer]
})
export class TabPage2 {
  params: any = {};
  returnIdResponse: string = "";
  subOrderDetails: any;
  clientDetails: string;
  meeshoDto: MeeshoentityProvider;
  returnList: MeeshoentityProvider[];
  showReturnList: boolean;
  loading: any;
  currentImage = null;
  currentImage2 = null;
  currentImageList: any[] = [];
  emailAttachmentList: any[] = [];
  employees: Observable<any[]>;
  page: any;
  apiUrl: string;
  constructor(
    private toastCtrl: ToastService,
    public barcodeScanner: BarcodeScanner,
    private camera: Camera,
    public emailComposer: EmailComposer,
    public alertCtrl: AlertController,
    private loadingService: LoadingService,
    private http: HttpClient,
    public navCtrl: NavController,
    navParams: NavParams,
    public platform: Platform
  ) {
    this.page = navParams.get("page");
    // this.tabsService.load("tab2").subscribe(snapshot => {
    //   this.params = snapshot;
    // });
    this.clientDetails = "";
    this.meeshoDto = new MeeshoentityProvider();
    this.returnList = [];
    this.showReturnList = false;
    this.apiUrl = "http://api.webesky.com/api/base";

    this.platform.registerBackButtonAction(() => {
      console.log("backbutton Clicked");
      this.toastCtrl.presentToast("Back button Clicked");
    });
  }

  // ngOnChanges(changes: { [propKey: string]: any }) {
  //   this.params = changes['data'].currentValue;
  // }

  // onItemClick(item:any) {
  //     this.toastCtrl.presentToast("Folow");
  // }

  scanSubOrder() {
    this.barcodeScanner
      .scan()
      .then(result => {
        this.meeshoDto.SuborderId = result.text.toString();
        this.getSubOrderIdDetails();
      })
      .catch(error => {
        alert(error);
      });
  }

  scanReverseLabel() {
    this.barcodeScanner
      .scan()
      .then(result => {
        this.meeshoDto.ReverseLabelId = result.text.toString();
      })
      .catch(error => {
        alert(error);
      });
  }

  saveReturns() {
    let datedaved: string;
    this.loadingService.show();
    this.saveReturnService().subscribe(returnId => {
      // console.log(returnId);
      this.displaySubOrderDetails("Saved Successfully => " + returnId);
      this.meeshoDto.SavedReturnId = returnId;
      this.returnList.push(this.meeshoDto);
      datedaved = this.meeshoDto.DateOfReturn;
      this.meeshoDto = new MeeshoentityProvider();
      this.meeshoDto.DateOfReturn = datedaved;
      // this.meeshoDto.SavedReturnId = "0";
      // this.meeshoDto.SuborderId= "";
      // this.meeshoDto.ReverseLabelId = "";
      // this.meeshoDto.Details = "";
      this.currentImageList = [];
      this.emailAttachmentList = [];
      this.clientDetails = "";

      this.loadingService.hide();
    }),
      err => {
        console.log(err);
        this.loadingService.hide();
        this.displaySubOrderDetails("Something went wrong" + err);
      };
  }

  saveReturnService() {
    const headers = new HttpHeaders().set("content-type", "application/json");
    return this.http.post<string>(this.apiUrl + "/SaveReturn", this.meeshoDto, {
      headers
    });
  }

  captureImage() {
    const options: CameraOptions = {
      quality: 65,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: true
    };

    this.camera.getPicture(options).then(
      imageData => {
        this.emailAttachmentList.push(imageData);
        this.currentImage = window.Ionic.WebView.convertFileSrc(imageData);
        this.currentImageList.push(this.currentImage);
        console.log(this.currentImage, "imageData");
      },
      err => {
        // Handle error
        console.log("Image error: ", err);
      }
    );
  }

  // Old url : https://meeshoapiservices20190413104538.azurewebsites.net/api/base/GetSubOrderbyid?suborderid
  getSubOrderIdDetails() {
    if (this.meeshoDto.SuborderId.length > 0) {
      this.loadingService.show();
      this.http
        .get<string>(
          this.apiUrl +
            "/GetSubOrderbyid?suborderid=" +
            this.meeshoDto.SuborderId
        )
        .subscribe(suborderIdDetails => {
          this.clientDetails = suborderIdDetails;
          this.meeshoDto.Details = this.clientDetails;
          this.loadingService.hide();
        }),
        err => {
          console.log(err);
          this.loadingService.hide();
        };
    }
  }

  displaySubOrderDetails(subtitle) {
    // console.log(suborderData);
    let alert = this.alertCtrl.create({
      title: "Details",
      subTitle: subtitle,
      buttons: ["OK"]
    });
    alert.present();
  }

  sendEmail() {
    let emailBody = "";
    let emailSub = "";
    if (this.meeshoDto.ReturnType == "WP") {
      emailBody =
        "We received wrong return on " +
        this.meeshoDto.DateOfReturn +
        ".\n Sub order id - " +
        this.meeshoDto.SuborderId +
        " \n  Reverse Label Id - " +
        this.meeshoDto.ReverseLabelId +
        " \n PFA images for reference ";
      emailSub =
        "Wrong Product Received for Sub Order id ->" +
        this.meeshoDto.SuborderId;
    } else if (this.meeshoDto.ReturnType == "IM") {
      emailBody =
        "We received a return on " +
        this.meeshoDto.DateOfReturn +
        "\n. However, item was missing from the return .\n Sub order id - " +
        this.meeshoDto.SuborderId +
        " \n  Reverse Label Id - " +
        this.meeshoDto.ReverseLabelId +
        " \n PFA images for reference ";
      emailSub = "Item Missing for Sub Order Id ->" + this.meeshoDto.SuborderId;
    }

    let email = {
      to: "suppliersupport@meesho.com",
      // cc: 'amitbadala07@gmail.com',
      attachments: this.emailAttachmentList,
      subject: emailSub,
      body: emailBody,
      isHtml: true
    };

    this.emailComposer.open(email);
  }
}
