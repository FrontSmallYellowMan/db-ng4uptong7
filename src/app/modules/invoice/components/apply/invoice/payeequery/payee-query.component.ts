import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { InvoiceInfo } from "../invoice-info";
import { environment } from "../../../../../../../environments/environment.prod";
@Component({
  templateUrl: './payee-query.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss','./payee-query.component.scss']
})
export class PayeeQueryComponent implements OnInit {

  modal:XcModalRef;
  //查询条件
  public company:string = "";
  public index=0

  //列表list
  public conpanyList: Array<any> = new Array<any>(); 
 
  constructor( 
    private windowService: WindowService,
    private xcModalService: XcModalService ,
    private http: Http) {  
  }

   ngOnInit(){
      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);
      this.modal.onShow().subscribe((index?) => {
        this.index=index;
        this.company="";
        this.searchPayee();
    })
  } 
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  changeCheck(companycode){
    this.conpanyList.forEach(
      item => {
        if(item.companycode == companycode){
          item.checked = true;
        }else{
          item.checked = false;
        }
      }
    );
    this.save();
  }
  checkEnterKey(e){
    if(e==13){
      return false;
    }
  }
  //保存数据
  save(){
    let company :any=null;
    this.conpanyList.filter(item => item.checked === true).forEach(item => {
        company = item;
        company.index = this.index;
    });
    this.hide(company);
  }

  searchPayee(){
    let params = this.company;
    this.http.post(environment.server+'BaseData/GetCompanyInfo/',{"CompanyName": params,"CompanyCode":params} )
          .map(res => res.json())
          .subscribe(res => {
              if(res.Data){
                  this.conpanyList = JSON.parse(res.Data);
              }
          });
  }

}
