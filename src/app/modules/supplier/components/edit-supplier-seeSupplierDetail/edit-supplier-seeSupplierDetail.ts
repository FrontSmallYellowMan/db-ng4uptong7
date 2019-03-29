import { Component, OnInit } from '@angular/core';
import { WindowService } from "app/core";
import { Observable } from 'rxjs/Observable';
import { Person } from 'app/shared/services/index';
import { dbomsPath, environment,APIAddress } from "environments/environment";
import { ActivatedRoute } from "@angular/router";

import { SupplierData, SupplierService,AccessoryList,GetCompanyAndPay } from "../../services/supplier.service";

@Component({
  selector: 'edit-supplier-ssd',
  templateUrl: 'edit-supplier-seeSupplierDetail.html',
  styleUrls: ['edit-supplier-seeSupplierDetail.scss', '../../scss/supplier.component.scss']
})

export class EditSeeSupplierDetail implements OnInit {

  supplierData: SupplierData = new SupplierData();
  accessoryList:AccessoryList=new AccessoryList();
  getCompanyAndPay:GetCompanyAndPay=new GetCompanyAndPay();

  bankcountryAndCode: string;//用来保存银行国别和代码
  paymenttermsAndCode: string;//用来保存付款条件和代码
  companyAndCode:string;//用来保存公司名称和代码

  isCompanyList:boolean=false;//是否显示公司列表

  companyAndPayList:any=[];//用来保存获取到的公司和付款条款列表
  companyAndPay:any;//用来保存公司代码双向绑定的字段

  constructor(
    private windowService: WindowService,
    private aRouter: ActivatedRoute,
    private supplierService: SupplierService
  ) { }

  ngOnInit() {

    //获取路由里的值
    this.aRouter.params.subscribe(params => {
      this.getSupplierDetail(params.id);//根据id请求接口，获取详情页面的数据
    });


  }


  //根据从路由传来的值，获取详情页的数据
  getSupplierDetail(Id) {
    if(Id!="0"){
      this.supplierService.getOriginalDetail({'vendorid':Id}).then(data=>{
        this.supplierData=data.data;
        this.companyAndCode=this.supplierData.companycode+" "+this.supplierData.company;
        this.getCompanyAndPayList(this.supplierData.vendorno);//获取公司和支付条款列表
        console.log(this.supplierData);
      });
    }
  }

  //获取选择的公司
  getCompanySelect(companyAndPay){
    this.isCompanyList=true;
    if(this.companyAndPayList.every(item=>item.CompanyCode!=this.supplierData.companycode)){//判断公司列表中是否存在要加入的公司代码，如果不存在，就以固定格式，unshift进入数组
    this.companyAndPayList.unshift({CompanyCode:this.supplierData.companycode,CompanyName:this.supplierData.company,PayType:this.supplierData.paymenttermscode,PayTypeName:this.supplierData.paymentterms});      
    }
    this.supplierData.paymentterms=companyAndPay.PayTypeName;//将对应公司的付款条款赋值给绑定的字段
    this.supplierData.paymenttermscode=companyAndPay.PayType;//将对应公司的付款条款赋值给绑定的字段
    //console.log(companyAndPay);
  }

  //获取选择付款条款
  getPaymenttermsAndCodeSelect(paymenttermsAndCode){

  }
   
  //查看选择的上传文件
  seeFileUpLoad(url){
   window.open(APIAddress+url);
  }

  //获取公司代码，对应的支付条款
  getCompanyAndPayList(vendorNo){
    this.getCompanyAndPay.VendorNo=vendorNo;
    this.supplierService.getCompanyAndPay(this.getCompanyAndPay).then(data=>{
      if(data.success){
        this.companyAndPayList=data.data.list;
        console.log(this.companyAndPayList);
      }
    });
  }

  //关闭
  cancle() {
    window.close();
  }

}