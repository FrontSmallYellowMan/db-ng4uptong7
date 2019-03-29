import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { OrderExemptionService,CustomerInfo, OverdueArrearsInfo, CustomerExemptionCondition } from '../../../services/order-exemption.service';
import { OverdueArrearsDetailComponent } from '../overduearrearsdetail/overduearrearsdetail.component';

export class PageNo { }

@Component({
  selector: 'db-exemptioncustomerlist',
  templateUrl: './exemptioncustomerlist.component.html',
  styleUrls: ['./exemptioncustomerlist.component.scss']
})
export class ExemptioncustomerlistComponent implements OnInit {

  public modal:XcModalRef;
  public loading: boolean = true;//加载中
  public submitOnce: boolean;
  public pagerData = new Pager();
  public customerList: CustomerInfo[] = [];//售达方列表数据
  public customerName;//客户名称
  public modalUnclear:XcModalRef;
  public exemptionConditions:CustomerExemptionCondition[]=[];

  constructor(
      private router: Router,
      private routerInfo: ActivatedRoute,
      private xcModalService: XcModalService,
      private windowService: WindowService,
      private orderExemptionService: OrderExemptionService
  ){}

  initData(data?){
      let cusName = "";
      let cusCode="";
      if(data){
          cusName = data["CustomerName"];
      }else if(this.customerName){
          cusName = this.customerName.trim();
      }
      let params = {
          CustomerName: cusName,
          TypeCode: "10;30;40"
      }
      this.loading = true;
      this.orderExemptionService.getERPCustomerInfo(params).subscribe(
          data => {
              if(data.Result){
                  let info = JSON.parse(data.Data);
                  this.customerList = info;
              }
              this.loading = false;
          }
      );
  }

  ngOnInit(){

      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);

      this.modal.onShow().subscribe((data) => {
          if(data){
              this.customerName = data["CustomerName"];
              this.initData(data);
          }
      });
      this.modalUnclear=this.xcModalService.createModal(OverdueArrearsDetailComponent);
      this.modalUnclear.onHide().subscribe((data) => {
        if(data){
              data.forEach(element => {
              let condi=new CustomerExemptionCondition();
              condi.YWFWDM=element.DEPT;
              condi.ArrearsAmount=element.AMOUNT;
              this.exemptionConditions.push(condi);
              });
        }
       
      });
  }

  //关闭弹出框
  hide(data?: any) {
      this.modal.hide(data);
  }



  search(){
      this.initData();
  }

  selected(sel){
      if(sel.checked){
          this.customerList.forEach(function(item,i){
              item.checked = false;
          })
          sel.checked = true;
      }
  }

  //保存数据
  save(e?){
      let selectedList = this.customerList.filter(item => item.checked == true);
      if(selectedList.length==0){
          if(this.customerList.length>0){
              this.windowService.alert({ message: "请选择售达方", type: "fail" });
          }else{
              this.hide();
          }
          return ;
      }
      if(selectedList.length>0){
          selectedList[0].ExemptionConditions=this.exemptionConditions;
          this.hide(selectedList[0]);
      }
  }
  serachCusUnclear(customerCode:any){
       
    this.modalUnclear.show(customerCode);
  }

}
