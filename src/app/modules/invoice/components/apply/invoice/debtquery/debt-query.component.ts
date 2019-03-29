import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { environment } from "../../../../../../../environments/environment.prod";

@Component({
  templateUrl: './debt-query.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss','./debt-query.component.scss']
})
export class DebtQueryComponent implements OnInit {

  modal:XcModalRef;
  //查询条件
  public debt:any = [];

  //列表list
  public debtList: Array<any> = new Array<any>(); 
 
  constructor( 
    private windowService: WindowService,
    private xcModalService: XcModalService ,
    private http: Http) {  
  }

   ngOnInit(){
      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);
      this.modal.onShow().subscribe((data?) => {
           this.debt.index=data.index;
           this.debt.contractNum=  data.contractNum;
           this.debt.customCode = data.customCode;
           this.debt.customName = data.customName;
           this.debt.payee=  data.payee;
           this.debt.payeeName = data.payeeName;
           this.debt.department = data.department;
           this.searchDebt(); 
      })
  } 
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    this.debtList = null;
  }

  changeCheck(i){
    this.debtList.forEach(
      (k,v) => {
        if(v == i){
          k.checked = true;
        }else{
          k.checked = false;
        }
      }
    );
    this.save();
  }

  //保存数据
  save(){
    let custom :any=[];
    this.debtList.filter(item => item.checked === true).forEach(item => {
        custom = item;
        custom.index = this.debt.index;
    });
    this.hide(custom);
  }
  checkEnterKey(e){
    if(e==13){
      return false;
    }
  }
  
  searchDebt(){
    this.http.post(environment.server+'SalesmanHomePage/GetCustomerUnclear',{"KUNNR":this.debt.customCode,"BUKRS":this.debt.payee,"GSBER":"","END_DATE1":"","END_DATE2":"","AMOUNT1":"","AMOUNT2":""})
          .map(res => res.json())
          .subscribe(res => {
              if(res.Data){
                this.debtList = JSON.parse(res.Data);
                this.debtList.forEach(
                item =>{
                  //console.log(JSON.stringify(item));
                  item.DMSHB = parseFloat(item.DMSHB==""?'0':item.DMSHB)
                  item.contractNum= item.XBLNR;
                  item.customName = this.debt.customName;
                  item.payeeName = this.debt.payeeName;
                  item.department = this.debt.department;
                  if(item.FAEDT !=""){//计算超期天数
                      var dateStr = item.FAEDT.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3");
                      item.FAEDT = item.FAEDT.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
                      item.outdays = (new Date().getTime() - new Date(dateStr).getTime())/(24*60*60*1000)
                  }
                }
              )
              }else{
                this.debtList = null;
              }
     });
  } 

}
