import { Injectable } from '@angular/core';

/*
  Generated class for the MeeshoentityProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MeeshoentityProvider {
  SuborderId:string;
  ReverseLabelId:string;
  DateOfReturn:string;
  ReturnType:string;
  Details:string; 
  SavedReturnId:string;
  constructor() {
  this.SuborderId="",
  this.ReverseLabelId="",
  this.DateOfReturn="",
  this.ReturnType="CR"; 
  this.Details="";
  this.SavedReturnId="0";
  }

}
