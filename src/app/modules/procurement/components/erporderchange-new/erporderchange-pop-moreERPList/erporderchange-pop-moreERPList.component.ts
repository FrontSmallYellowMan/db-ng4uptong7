import { Component, OnInit } from '@angular/core';
import { Pager,XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';

@Component({
  selector: 'erporderchange-pop-moreERPList',
  templateUrl: 'erporderchange-pop-moreERPList.component.html',
  styleUrls:['erporderchange-pop-moreERPList.component.scss','../../../scss/erp-order-change.scss']
})

export class ErpOrderChangePopMoreERPListComponent implements OnInit {

  modal: XcModalRef;//初始化弹窗组件
  erpList:any=[];//保存ERP订单列表

  constructor(
    private xcModalService:XcModalService
  ) { }

  ngOnInit() {

    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(data => {//显示弹窗
      if(data){
        this.erpList=data;//保存获取的erp列表
      }
    });


   }

   //获取ERP订单号
   getERPCode(I){
     let ERPCode=this.erpList[I].OrderNo;//保存erp订单号
     this.modal.hide(ERPCode);//关闭窗口，传递ERP订单号
   }


  //关闭弹窗
  cancel(){
   this.erpList=[];//清空保存的列表
   this.modal.hide();
  }

}