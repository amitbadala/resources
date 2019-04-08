import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { IService } from '../../services/IService';

declare var SqlServer: any;

@IonicPage()
@Component({
  templateUrl: 'item-details-form.html'
})
export class ItemDetailsPageForm {

  page: any;
  service: IService;
  params: any = {};

  constructor(public navCtrl: NavController, navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.page = navParams.get('page');
    this.service = navParams.get('service');
    if (this.service) {
      this.params = this.service.prepareParams(this.page, navCtrl);
      this.params.data = this.service.load(this.page);
    } else {
      navCtrl.setRoot("HomePage");
    }

    // this.doSomething();

    SqlServer.init("182.50.133.111", "SQLEXPRESS", "webeskyuser", "24140246", "webesky_Cartrip", function(event) {
      console.log(JSON.stringify(event),'sql'); 
      SqlServer.executeQuery("Select * from MeeshoReturns", function(event) {
        console.log(JSON.stringify(event));
      }, function(error) {
        console.log("Error : " + JSON.stringify(error));
      });	
    }, function(error) {
      console.log(JSON.stringify(error),'sqlerror');
    });

    // this.getdata();

  }

  // doSomething() {
  //   SqlServer.init('182.50.133.111', 'MSSQLSERVER', 'webeskyuser', '24140246', result => {
  //     console.log(JSON.stringify(result),'something');
  //   })
  // }

  getdata()
  {
    
  }
}
