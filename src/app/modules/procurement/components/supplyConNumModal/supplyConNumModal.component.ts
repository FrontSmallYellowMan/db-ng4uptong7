// 输入框 模态框
import { Component,OnInit,ViewChild } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

import { XcModalService, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';

@Component({
  templateUrl: './supplyConNumModal.component.html',
  styleUrls:['./supplyConNumModal.component.scss']
})
export class SupplyConNumModalComponent implements OnInit {

  modal: XcModalRef;
  content;//用户输入内容
  selectArr;//已选申请

  @ViewChild(NgForm)
  contractAddInputForm;//表单

  constructor(
    private xcModalService: XcModalService,
    private WindowService: WindowService,
    private dbHttp: HttpServer
  ) { }

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
      this.selectArr=data;
    })
  }
  
  onAdd(){
    if(!this.contractAddInputForm.valid){
      this.WindowService.alert({ message: '合同号填写有误,请检查', type: "fail" });
      return;
    }

    let body={
      "PurchaseRequisitionIdList":this.selectArr,  //预下无合同 主键
      "MainContractCode":this.content   //销售合同号
    }
    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
      this.dbHttp.post("PurchaseManage/AddSC_Code",body, options).subscribe(data => {
        this.modal.hide(data);
      })
  }
  onCancel(){
    this.modal.hide(null);
    this.content='';
  }

}