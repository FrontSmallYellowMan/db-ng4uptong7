//ND采购订单页面-采购信息
import { Component, OnInit, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { NDOrderMessage } from '../../../services/ND-submit.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery } from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';

@Component({
    selector: "ND-submit-message",
    templateUrl: 'ND-submit-message.component.html',
    styleUrls: ['ND-submit-message.component.scss', './../../../scss/procurement.scss']
})
export class NDSubmitMessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化请求参数

    TemplateName;//模板名称-供显示
    templateShowIndex = "13";//模板选择框 显示第一列、第三列
    paymentShowIndex = "10";//付款条款框 显示列
    presellStartDate=moment(new Date()).format("YYYY-MM-DD");//预计销售时间的 开始时间
    bizdivision;//搜索模板的查询条件--事业部
    activeTaxrate;//税率-当前选项
    avtiveCurrency;//币种-当前选项
    avtiveDeliveryPeople;//收货人-当前选项
    supplierType = "";//供应商类型
    taxrateDisabled = false;//税率是否disabled
    factoryPlaceStr = "";//工厂的输入提示
    NDOrderMessage = new NDOrderMessage();//采购信息 整体数据
    selectInfo = {//下拉框数据
        company: [],
        vendor: [],
        taxrate: [],
        currency: [],
        deliveryPeople:[]//收货人
    }

    paymentProvisionList:any=[];//保存付款条款列表

    @ViewChild(NgForm)
    NDOrderForm;//表单
    beforeNDOrderFormValid;//表单的前一步校验结果
    @Input() purchaseOrderID: '';//采购订单id
    @Input() isSubmit=false;//是否提交
    @Input() NDType;//创建ND单类型  //? 不需要

    @Input() set NDOrderData(data) {//编辑状态下 读入ND单 的整体数据
        if (data["ID"]) {
            for (let key in this.NDOrderMessage) {//数据拷贝
                this.NDOrderMessage[key] = data[key];
            }
            this.avtiveCurrency = [{
                id: this.NDOrderMessage.CurrencyCode,
                text: this.NDOrderMessage.Currency
            }];
            this.activeTaxrate = [{
                id: this.NDOrderMessage.RateCode,
                text: this.NDOrderMessage.RateName
            }];

            /**
             * 问题：因为获取收货人列表是异步获取的，所以在初始化页面时，set访问器还没有获取到列表，导致内容丢失
             * 解决办法：暂时采用在set访问器里请求接口获取数据
             */

            if(this.selectInfo.deliveryPeople.length===0){

                this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
                    this.selectInfo.deliveryPeople=data.people;
                    this.copyAbroadData(data["DeliveryPeople"],true,false);
                })
            }else{
                this.copyAbroadData(data.DeliveryPeople,true,false);
            }

            this.judgeSupplier(this.NDOrderMessage.VendorNo, this.NDOrderMessage.FactoryCode, null, "");
            if (this.NDOrderMessage.TemplateID) {//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.NDOrderMessage.TemplateID).then(data => {
                    if (data.Result) {
                        this.TemplateName = data.Data.Name;
                    }
                })
            }
            if(this.NDOrderMessage.PlanSaleTime){
                this.NDOrderMessage.PlanSaleTime = moment(this.NDOrderMessage.PlanSaleTime).format("YYYY-MM-DD");
            }
        }
    };
    @Input() set preDiscountValue(data) {//折扣前合计金额
        this.NDOrderMessage.PreDiscountAmount=data;
    }
    @Input() set afterDiscountValue(data) {//折扣后合计金额
        this.NDOrderMessage.AfterDiscountAmount=data;
    }

    @Output() onNDOrderFormValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onNDOrderMessageChange = new EventEmitter();//当 采购信息整体数据 变化
    @Output() onCompanyCodeChange = new EventEmitter();//当 公司代码(我方主体) 变化
    @Output() onVendorTraceChange = new EventEmitter();//当 供应商是否过期变化 变化

    constructor(
        private windowService: WindowService,
        private dbHttp: HttpServer,
        private submitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private procurementTemplateService: ProcurementTemplateService,
        private shareMethodService: ShareMethodService
    ) { }
    ngDoCheck() {
        if (this.NDOrderForm.valid != this.beforeNDOrderFormValid) {//表单校验变化返回
            this.beforeNDOrderFormValid = this.NDOrderForm.valid;
            this.onNDOrderFormValidChange.emit(this.NDOrderForm.valid);
        }
    }
    ngOnInit() {
        this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
            this.selectInfo.currency = data;
        })
        this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
            this.selectInfo.taxrate = data.all;
        })
        this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
            this.bizdivision = data.SYBMC;
        })
        this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
            this.selectInfo.deliveryPeople=data.people;
        })

        /**
         * 新增方法，原代码为在需要时请求获取列表，
         * 因为后续增加从模板中的数据来请求接口获取付款条款和交货条件，
         * 所以讲列表的获取提前，在ngOnInit中一次性获取，但并没有改变原代码的在每次供应商变换时请求，
         * 后续有精力可以优化
         * by：weihefei
         */
        this.getPayList();//获取付款条款列表
    }

    public getTemplate(e) {//获取模板返回 
        console.log("模板数据");
        console.log(e);
        let self = this;
        let judgeCallback = function () {//判断核心后的操作
            let templateDate = e;
            self.TemplateName = e[1];
            self.activeTaxrate = [{
                id: templateDate[6],
                text: templateDate[7]
            }];
            self.avtiveCurrency = [{
                id: templateDate[10],
                text: templateDate[9]
            }];
            self.NDOrderMessage.TemplateID = e[0];
            self.NDOrderMessage.CompanyCode = templateDate[2];
            self.NDOrderMessage.CompanyName = templateDate[3];
            self.NDOrderMessage.VendorNo = templateDate[5];
            self.NDOrderMessage.Vendor = templateDate[4];
            self.NDOrderMessage.RateValue = templateDate[8];
            self.NDOrderMessage.RateCode = templateDate[6];
            self.NDOrderMessage.RateName = templateDate[7];
            self.NDOrderMessage.Currency = templateDate[9];
            self.NDOrderMessage.CurrencyCode = templateDate[10];
            self.NDOrderMessage.FactoryCode = templateDate[11];
            self.NDOrderMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr = "请输入" + self.NDOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示
            self.onNDOrderMessageChange.emit(self.NDOrderMessage);
        }
        this.judgeSupplier(e[5], e[11], judgeCallback, "selectTpl");
        this.paymentAndDelivery.companycode= e[2];//保存公司代码
        this.paymentAndDelivery.vendorcode=e[5];//保存供应商代码
        this.getPaymentAndDeliveryFormModel();//根据模板数据的变化获取付款条款和交货条件
    }

        //根据模板的供应商和我方主体，请求接口获取交货条件和付款条款的数据
        getPaymentAndDeliveryFormModel(){
            //console.log(this.paymentAndDelivery);
            this.shareMethodService.getVendorInfoFromERP(this.paymentAndDelivery).then(data=>{
                //console.log(data);
                if(data.Result){
                    //获取对应的付款条款名称，保存进入实体
                   if(data.Data.paymenttermscode){
                      this.paymentProvisionList.forEach(element => {
                          if(element.Code===data.Data.paymenttermscode){
                            this.NDOrderMessage.paymenttermscode = data.Data.paymenttermscode;
                            this.NDOrderMessage.paymentterms = element.Content;
                            this.onNDOrderMessageChange.emit(this.NDOrderMessage);//异步请求慢于后续操作 需再返回一次
                          }
                      });
                   }
    
                   //获取交货条件
                   if(data.Data.internationaltradeterms&&data.Data.internationaltradelocation){
                    //   this.copyAbroadData(data.Data.internationaltradeterms,data.Data.internationaltradelocation,null,false,true);
                   }
                }
            });
        }
    
        //获取付款条款列表
        getPayList(){
            let body={
                "queryStr": "SearchTxt","pageSize": 999,"pageNo": 1,"SearchTxt": ""
            }
            let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            this.dbHttp.post("vendor/paymentclause", body, options).subscribe(response => {
                if (response.success) {
                   this.paymentProvisionList=response.data.rows;
                   console.log(this.paymentProvisionList);
                }
            })
        }

    CompanyChange(e) {//我方主体选中
        this.NDOrderMessage.CompanyCode = e[1];
        this.factoryPlaceStr = "请输入" + this.NDOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示 修改
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
        this.onCompanyCodeChange.emit(this.NDOrderMessage.CompanyCode);
    }
    factoryCheck(e) {//工厂格式校验
        if (e == "") {
            return;
        }
        this.NDOrderMessage.FactoryCode = this.NDOrderMessage.FactoryCode.toUpperCase();
        let endOne = this.NDOrderMessage.FactoryCode.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            this.windowService.alert({ message: 'ND订单不允许使用'+endOne+'工厂', type: 'fail' });
            this.NDOrderMessage.FactoryCode="";
            return;
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.NDOrderMessage.CompanyCode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.NDOrderMessage.FactoryCode="";
                return;
            }
        }
        let self = this;
        let judgeCallback = function () {
            self.onNDOrderMessageChange.emit(self.NDOrderMessage);
        }
        this.judgeSupplier(this.NDOrderMessage.VendorNo, this.NDOrderMessage.FactoryCode, judgeCallback, "selectFactory");
    }
    VendorChange(e) {//供应商选中
        let self = this;
        let judgeCallback=function(){
            self.NDOrderMessage.Vendor = e[0];//供应商
            self.NDOrderMessage.VendorNo = e[1];
            if(e[3]){//币种
                for(let i=0,len=self.selectInfo.currency.length;i<len;i++){
                    if(self.selectInfo.currency[i]["id"]==e[3]){
                        let data = [
                            {
                                id: e[3],
                                text: self.selectInfo.currency[i]["text"]
                            }
                        ]
                        self.avtiveCurrency = data;
                        self.NDOrderMessage.Currency = self.selectInfo.currency[i]["text"];
                        self.NDOrderMessage.CurrencyCode = e[3];
                        break;
                    }
                }
            }
            if(e[5]){//付款条款
                let body={
                    "queryStr": "SearchTxt","pageSize": 999,"pageNo": 1,"SearchTxt": ""
                }
                let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
                let options = new RequestOptions({ headers: headers });
                self.dbHttp.post("vendor/paymentclause", body, options).subscribe(response => {
                    if (response.success) {
                       let paymentList=response.data.rows;
                       for(let i=0,len=paymentList.length;i<len;i++){
                            if(paymentList[i]["Code"]==e[5]){
                                self.NDOrderMessage.paymenttermscode = e[5];
                                self.NDOrderMessage.paymentterms = paymentList[i]["Content"];
                                self.onNDOrderMessageChange.emit(self.NDOrderMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.NDOrderMessage.VendorCountry = e[6];//国内外
            self.onNDOrderMessageChange.emit(self.NDOrderMessage);
        }
        this.judgeSupplier(e[1], this.NDOrderMessage.FactoryCode, judgeCallback, "selectVendor");
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.NDOrderMessage.RateValue = this.selectInfo.taxrate[i].other;
            }
        }
        this.NDOrderMessage.RateName = e.text;
        this.NDOrderMessage.RateCode = e.id;
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    getCurrency(e) {//币种选择
        this.NDOrderMessage.Currency = e.text;
        this.NDOrderMessage.CurrencyCode = e.id;
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    getReceiverPeople(e){//收货人选择
        this.NDOrderMessage.DeliveryPeople=e.id;
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.NDOrderMessage.paymenttermscode=e[0];
        this.NDOrderMessage.paymentterms=e[1];
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if (e == "") {//为空不校验
            return;
        }
        let name = "tracenoF";
        if (this.NDOrderForm.controls[name].invalid) {//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.NDOrderMessage.TrackingNumber = "";
            return;
        }
        this.NDOrderMessage.TrackingNumber = this.NDOrderMessage.TrackingNumber.toUpperCase();//转大写
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    sendData() {//返回数据
        this.onNDOrderMessageChange.emit(this.NDOrderMessage);
    }
    judgeSupplier(venStr, facStr, callback, scene) {//判断供应商类型
        let self=this;
        let resetFillIn=function(){//不同情况下 置空
            switch(scene){//不同情况下 置空
                case "selectTpl":
                    self.TemplateName="";
                    break;
                case "selectFactory":    
                    self.NDOrderMessage.FactoryCode="";
                    break;
                case "selectVendor":    
                    self.NDOrderMessage.Vendor="";
                    break;
            }
            return;
        }
        if (venStr && facStr) {
            this.shareMethodService.judgeSupplierType(facStr,venStr)
            .then(data => {//判断供应商类型
                if (data.Result) {
                    this.supplierType = data.Data;
                    if(this.supplierType=="核心" || this.supplierType=="新产品"){
                        this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                            if (data.Result) {
                                this.NDOrderMessage.VendorTrace=data.Data;
                                this.onVendorTraceChange.emit(this.NDOrderMessage.VendorTrace);
                            }
                        })
                    }else{
                        this.NDOrderMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.NDOrderMessage.VendorTrace);
                    }
                    // this.onSupplierTypeChange.emit(this.supplierType);
                    if(typeof callback === "function"){
                        callback();
                    }
                }else{
                    this.windowService.alert({ message:data.Message, type: 'success' });
                    resetFillIn();
                }
            })
        } else {
            //无确定值 供应商是否过期为Null
            this.NDOrderMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.NDOrderMessage.VendorTrace);
            if (typeof callback === "function") {
                callback();//此时没判断是否核心 执行后续获取值等操作
            }
        }
    }
    copyAbroadData(receiver,copyReceiver,copyToSubjectInfor){//国外时 复制对应值
        /*
            receiver:收货人
            copyReceiver:是否需要复制 收货人信息
            copyToSubjectInfor:是否需要 最后复制到主体信息
        */
       if(receiver && copyReceiver){//收货人
           for(let i=0,len=this.selectInfo.deliveryPeople.length;i<len;i++){
               if(this.selectInfo.deliveryPeople[i]["id"]==receiver){
                   let data = [
                       {
                           id: this.selectInfo.deliveryPeople[i]["id"],
                           text: this.selectInfo.deliveryPeople[i]["text"]
                       }
                   ]
                   this.avtiveDeliveryPeople = data;
                   if(copyToSubjectInfor){
                       this.NDOrderMessage.DeliveryPeople=this.selectInfo.deliveryPeople[i]["id"];
                   }
               }
           }
       }
    }
}