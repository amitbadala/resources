import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [HomeService]

})
export class HomePage {

  data: any = {};
  isBuyButtonEnabled = false;

  constructor(public navCtrl: NavController, public service: HomeService) { 
    service.load().subscribe(snapshot => {
      this.data = snapshot;
    });
    this.isBuyButtonEnabled = AppSettings.BUY_BUTTON;
  }

}
