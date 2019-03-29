import { Component, OnInit } from '@angular/core';

export class SupplierTest implements OnInit {

  SupplierDetail = {
    'vendor': "",//供应商名称
    'registeredaddress': "",//注册地址
    'valueaddedtaxno': "",//增值税号或统一社会信用代码
    'bankcountrycode': "",//银行国别代码
    "bankname": "",//银行名
    "bankaccount": "",//银行账户
    "paymenttermscode": "",//付款条款代码
    "internationaltradeterms": "",//国际贸易条件
    "internationaltradelocation": "",//国际贸易地点
    "currencycode": "",//币种代码
    "AccessoryList": [],//附件上传数组
  }

  newSupplierDetail={
    'vendor':"",//供应商名称
    'registeredaddress':"",//注册地址
    'valueaddedtaxno':"",//增值税号或统一社会信用代码
    'bankcountrycode':"",//银行国别代码
    "bankname":"",//银行名
    "bankaccount":"",//银行账户
    "paymenttermscode":"",//付款条款代码
    "internationaltradeterms":"",//国际贸易条件
    "internationaltradelocation":"",//国际贸易地点
    "currencycode":"",//币种代码
    "AccessoryList":[],//附件上传数组
    }

  constructor() { }

  ngOnInit() { }

  testDatailIsSame(oldSupplier, newSupplier) {
    let isSame: boolean;
    
    oldSupplier = JSON.parse(oldSupplier);
    this.SupplierDetail.vendor = oldSupplier.vendor;
    this.SupplierDetail.registeredaddress = oldSupplier.registeredaddress;
    this.SupplierDetail.valueaddedtaxno = oldSupplier.valueaddedtaxno;
    this.SupplierDetail.bankcountrycode = oldSupplier.bankcountrycode;
    this.SupplierDetail.bankname = oldSupplier.bankname;
    this.SupplierDetail.bankaccount = oldSupplier.bankaccount;
    this.SupplierDetail.paymenttermscode = oldSupplier.paymenttermscode;
    this.SupplierDetail.internationaltradeterms = oldSupplier.internationaltradeterms;
    this.SupplierDetail.internationaltradelocation = oldSupplier.internationaltradelocation;
    this.SupplierDetail.currencycode = oldSupplier.currencycode;
    //this.SupplierDetail.AccessoryList = oldSupplier.AccessoryList;

    this.newSupplierDetail.vendor = newSupplier.vendor;
    this.newSupplierDetail.registeredaddress = newSupplier.registeredaddress;
    this.newSupplierDetail.valueaddedtaxno = newSupplier.valueaddedtaxno;
    this.newSupplierDetail.bankcountrycode = newSupplier.bankcountrycode;
    this.newSupplierDetail.bankname = newSupplier.bankname;
    this.newSupplierDetail.bankaccount = newSupplier.bankaccount;
    this.newSupplierDetail.paymenttermscode = newSupplier.paymenttermscode;
    this.newSupplierDetail.internationaltradeterms = newSupplier.internationaltradeterms;
    this.newSupplierDetail.internationaltradelocation = newSupplier.internationaltradelocation;
    this.newSupplierDetail.currencycode = newSupplier.currencycode;
    //this.newSupplierDetail.AccessoryList = JSON.parse(JSON.stringify(newSupplier.AccessoryList));

    console.log(this.SupplierDetail);
    console.log(this.newSupplierDetail.AccessoryList);

    
    // this.newSupplierDetail.AccessoryList.forEach((item,index,input)=>{
    //   delete input[index].name;
    //   if(item.CreateTime=this.SupplierDetail.AccessoryList[index].CreateTime){
    //     item.Id=this.SupplierDetail.AccessoryList[index].Id;//因为后端每次保存会变更附件ID，所以需要将附件ID重置，用来比较不同
    //     item.ModifyId=this.SupplierDetail.AccessoryList[index].ModifyId;
    //   }
    // });
    console.log(this.SupplierDetail,this.newSupplierDetail);
    console.log(JSON.stringify(this.SupplierDetail)==JSON.stringify(this.newSupplierDetail));
    
    if(JSON.stringify(this.SupplierDetail)===JSON.stringify(this.newSupplierDetail)){
      isSame=true;
    }else{
      isSame=false;
    }

    return isSame;
  }

}