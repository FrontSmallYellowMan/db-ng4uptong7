import { Component, OnInit,Input } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { InvoiceTakebackService } from "../../../../services/invoice/invoice-takeback.service";
@Component({
  templateUrl: './takeback-add.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss']
})
export class TakebackAddComponent implements OnInit {

  modal:XcModalRef;
  ifDisabled=false;
  ifIndeterminate=false;
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  applyids="";
  //列表list
  public invoiceApplyList;
   //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  constructor( 
    private windowService: WindowService,
    private xcModalService: XcModalService ,
    private invoiceTakebackService:InvoiceTakebackService) { 
    
  }

   ngOnInit(){
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
      this.fullChecked = false;//全选状态
      this.fullCheckedIndeterminate = false;//半选状态
      this.invoiceApplyList=new Array();
      this.applyids=data.applyids;
      this.loadApply();
    })
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  //保存数据
  save(param: any){
    let ObList = [];
    param.filter(item => item.checked === true).forEach(item => {
            ObList.push(item);
    });
    this.hide(ObList);
  }

  loadApply(): void{
  this.invoiceTakebackService.getTakebackList().then(data => {
            if(this.applyids !=''){
                this.invoiceApplyList = data.list.filter(
                   item =>{
                     let list = this.applyids.split(",");
                     for(let i=0;i<list.length;i++){
                        item == list[i];
                        break;
                     }
                   }
                  
                );
            }else{
              this.invoiceApplyList = data.list;
            }   
  })
  }

}
