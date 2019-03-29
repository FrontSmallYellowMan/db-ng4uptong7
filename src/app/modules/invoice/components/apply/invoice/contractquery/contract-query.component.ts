import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { InvoiceInfo } from "../invoice-info";
import { environment } from "../../../../../../../environments/environment.prod";
@Component({
  templateUrl: './contract-query.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss','./contract-query.component.scss']
})
export class ContractQueryComponent implements OnInit {

  modal:XcModalRef;
  //查询条件
  public contractParam:string = "";
  public department:string ="";
  public index=0

  //列表list
  public contractList: Array<any> = new Array<any>(); 
 
  constructor( 
    private windowService: WindowService,
    private xcModalService: XcModalService ,
    private http: Http) {  
  }

   ngOnInit(){
      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);
      this.modal.onShow().subscribe((index?) => {
        if(index){
          this.department = index.split("|")[1];
          this.index=index.split("|")[0];
          this.contractParam="";
          this.searchContrac();
        }
    })
  } 
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  changeCheck(MainContractCode){
    this.contractList.forEach(
      item => {
        if(item.MainContractCode == MainContractCode){
          item.checked = true;
        }else{
          item.checked = false;
        }
      }
    );
    this.save();
  }

  //保存数据
  save(){
    let contract :any=null;
    this.contractList.filter(item => item.checked === true).forEach(item => {
        contract = item;
        contract.index = this.index;
    });
    this.hide(contract);
  }

  checkEnterKey(e){
    if(e==13){
      return false;
    }
  }
  
  searchContrac(){
    this.http.post(environment.server+'S_Contract/GetDeptSalesContract',{"BBName": this.department, "SYBName":"" })
          .map(res => res.json())
          .subscribe(res => {
              if(res.Data){
                if(this.contractParam !=""){//查询条件过滤
                  this.contractList = JSON.parse(res.Data).filter(
                      item => 
                        (item.MainContractCode==null?"":item.MainContractCode).indexOf(this.contractParam) >= 0 ||
+                       (item.SalesITCode==null?"":item.SalesITCode).indexOf(this.contractParam) >= 0 ||
+                       (item.SalesName==null?"":item.SalesName).indexOf(this.contractParam) >= 0 ||
+                       (item.SellerCompanyCode==null?"":item.SellerCompanyCode).indexOf(this.contractParam) >= 0 ||
+                       (item.BuyerName==null?"":item.BuyerName).indexOf(this.contractParam) >= 0
                    );
                }else{
                  this.contractList = JSON.parse(res.Data);
                } 
              }
          });
  } 
}
