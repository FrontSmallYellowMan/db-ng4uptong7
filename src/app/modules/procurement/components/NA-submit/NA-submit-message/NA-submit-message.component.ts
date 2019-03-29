//NA采购订单页面-采购信息
import { Component, OnInit, Input, Output, EventEmitter, DoCheck, ViewChild,SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { NAOrderMessage } from '../../../services/NA-submit.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery } from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';
import { element } from 'protractor';

@Component({
    selector: "NA-submit-message",
    templateUrl: 'NA-submit-message.component.html',
    styleUrls: ['NA-submit-message.component.scss', './../../../scss/procurement.scss']
})
export class NASubmitMessageComponent implements OnInit {
    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化请求参数
    TemplateName;//模板名称-供显示
    templateShowIndex = "13";//模板选择框 显示第一列、第三列
    paymentShowIndex = "10";//付款条款框 显示列
    presellStartDate=moment(new Date()).format("YYYY-MM-DD");//预计销售时间的 开始时间
    bizdivision;//搜索模板的查询条件--事业部
    activeTaxrate;//税率-当前选项
    avtiveCurrency;//币种-当前选项
    avtiveDeliveryLocation;//交货地点-当前选项
    avtiveDeliveryCondition;//交货条件-当前选项
    avtiveDeliveryPeople;//收货人-当前选项
    isRMB = true;//是否人民币
    supplierType = "";//供应商类型
    taxrateDisabled = false;//税率是否disabled
    factoryPlaceStr = "";//工厂的输入提示
    NAOrderMessage = new NAOrderMessage();//采购信息 整体数据
    messageCanModify=false;//根据有无选择 采购申请 决定采购信息部分可否修改
    preselldateCanModify=false;//预计销售时间:一条不可修改,选择了多条可修改
    selectInfo = {//下拉框数据
        company: [],
        vendor: [],
        taxrate: [],
        currency: [],
        deliveryLocation:[],//交货地点
        deliveryCondition:[],//交货条件
        deliveryPeople:[]//收货人
    }

    paymentProvisionList:any=[];//保存付款条款列表

    @ViewChild(NgForm)
    NAOrderForm;//表单
    beforeNAOrderFormValid;//表单的前一步校验结果
    @Input() purchaseOrderID: '';//采购订单id
    @Input() isSubmit=false;//是否提交
    @Input() NAType;//创建NA单类型 （目前三种类型：hasApply，directNA，prepareApplyNoContract）

    @Input() set NAOrderData(data) {//编辑状态下 读入NA单 的整体数据
        if (data["ID"]) {
            for (let key in this.NAOrderMessage) {//数据拷贝
                this.NAOrderMessage[key] = data[key];
            }
            this.avtiveCurrency = [{
                id: this.NAOrderMessage.CurrencyCode,
                text: this.NAOrderMessage.Currency
            }];
            if (this.NAOrderMessage.Currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.NAOrderMessage.RateCode,
                text: this.NAOrderMessage.RateName
            }];

            //如果还没有获取到交货条件，收款人等基础列表数据，则请求接口获取
            if(this.selectInfo.deliveryCondition.length===0){
                this.shareDataService.getDeliverySelectInfo().then(data=>{
                    this.selectInfo.deliveryLocation=data.location;
                    this.selectInfo.deliveryCondition=data.condition;
                    this.selectInfo.deliveryPeople=data.people;

                    this.copyAbroadData(this.NAOrderMessage.DeliveryCondition,
                        this.NAOrderMessage.DeliveryLocation,this.NAOrderMessage.DeliveryPeople,true,false);
                });
            }else {
                this.copyAbroadData(this.NAOrderMessage.DeliveryCondition,
                    this.NAOrderMessage.DeliveryLocation,this.NAOrderMessage.DeliveryPeople,true,false);
            }
              
            
            this.judgeSupplier(this.NAOrderMessage.VendorNo, this.NAOrderMessage.FactoryCode, null, "");
            
            if (this.NAOrderMessage.TemplateID) {//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.NAOrderMessage.TemplateID).then(data => {
                    if (data.Result) {
                        this.TemplateName = data.Data.Name;
                    }
                })
            }
            if(this.NAOrderMessage.PlanSaleTime){
                this.NAOrderMessage.PlanSaleTime = moment(this.NAOrderMessage.PlanSaleTime).format("YYYY-MM-DD");
            }
        }
    };
    @Output() onNAOrderFormValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onNAOrderMessageChange = new EventEmitter();//当 采购信息整体数据 变化
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
        if (this.NAOrderForm.valid != this.beforeNAOrderFormValid) {//表单校验变化返回
            this.beforeNAOrderFormValid = this.NAOrderForm.valid;
            this.onNAOrderFormValidChange.emit(this.NAOrderForm.valid);
        }
    }
    ngOnChanges(changes: SimpleChanges){
        if(changes["NAType"] && changes["NAType"].currentValue){//NAType传入值
            if(this.NAType == "hasApply" || this.NAType == "prepareApplyNoContract"){//无论新建 编辑 该情况下 采购信息不可修改
                this.messageCanModify = true;
            }else{//可修改情况下 获取 下拉列表数据
                this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
                    this.selectInfo.currency = data;
                })
                this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
                    this.selectInfo.taxrate = data.all;
                    this.activeTaxrate = [{
                        id: data.abroad[0]["id"],
                        text: data.abroad[0]["text"]
                    }];
                    this.NAOrderMessage.RateValue = data.abroad[0]["other"];
                    this.NAOrderMessage.RateCode = data.abroad[0]["id"];
                    this.NAOrderMessage.RateName = data.abroad[0]["text"];
                    console.log(this.NAOrderMessage);
                })
                this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
                    this.bizdivision = data.SYBMC;
                })
            }
        }
    }
    ngOnInit() {
        this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
            this.selectInfo.deliveryLocation=data.location;
            this.selectInfo.deliveryCondition=data.condition;
            this.selectInfo.deliveryPeople=data.people;
            //console.log(this.selectInfo.deliveryCondition);
            this.getApplyData();
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
    getApplyData(){//读取选中采购申请的信息
        if (!this.purchaseOrderID && (this.NAType == "hasApply" || this.NAType == "prepareApplyNoContract")) {//新建 读取信息
            let applyListData = JSON.parse(window.localStorage.getItem("NAApplyList"));//获取选中采购申请
            if (applyListData) {
                //console.log(applyListData);
                this.NAOrderMessage.CompanyName = applyListData[0].company;
                this.NAOrderMessage.CompanyCode = applyListData[0].companycode;
                this.NAOrderMessage.FactoryCode = applyListData[0].factory;
                this.NAOrderMessage.Vendor = applyListData[0].vendor;
                this.NAOrderMessage.VendorNo = applyListData[0].vendorno;
                this.NAOrderMessage.VendorCountry = applyListData[0].VendorCountry;
                this.NAOrderMessage.RateValue = applyListData[0].taxrate;
                this.NAOrderMessage.RateCode = applyListData[0].taxratecode;
                this.NAOrderMessage.RateName = applyListData[0].taxratename;
                this.NAOrderMessage.Currency = applyListData[0].currency;
                this.NAOrderMessage.CurrencyCode = applyListData[0].currencycode;
                this.avtiveCurrency = [{
                    id: this.NAOrderMessage.CurrencyCode,
                    text: this.NAOrderMessage.Currency
                }];
                if (this.NAOrderMessage.Currency == "人民币") {
                    this.isRMB = true;
                } else {
                    this.isRMB = false;
                }
                this.onIsRMBChange.emit(this.isRMB);
                this.activeTaxrate = [{
                    id: this.NAOrderMessage.RateCode,
                    text: this.NAOrderMessage.RateName
                }];
                this.copyAbroadData(applyListData[0].internationaltradeterms,applyListData[0].internationaltradelocation,
                    applyListData[0].receiver,true,true);
                if(applyListData.length==1){//只有一条时
                    this.NAOrderMessage.TrackingNumber = applyListData[0].traceno;
                    this.NAOrderMessage.paymentterms = applyListData[0].paymentterms;
                    this.NAOrderMessage.paymenttermscode = applyListData[0].paymenttermscode;
                    if(applyListData[0].preselldate){//有值
                        this.NAOrderMessage.PlanSaleTime = moment(applyListData[0].preselldate).format("YYYY-MM-DD");
                        this.preselldateCanModify=true;
                    }
                }
                this.judgeSupplier(this.NAOrderMessage.VendorNo, this.NAOrderMessage.FactoryCode, null, "");
                this.onNAOrderMessageChange.emit(this.NAOrderMessage);
                this.onCompanyCodeChange.emit(this.NAOrderMessage.CompanyCode);
            }
        }
    }
    public getTemplate(e) {//获取模板返回 
        console.log("模板数据");
        console.log(e);
        if(!e[16]){//国内
            this.windowService.alert({ message:"NA单不允许选择国内的供应商", type: 'success' });
            this.TemplateName = "";
            return;
        }
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
            if (templateDate[10] == "RMB") {//是否人民币
                self.isRMB = true;
            } else {
                self.isRMB = false;
            }
            self.onIsRMBChange.emit(self.isRMB);
            self.NAOrderMessage.TemplateID = e[0];
            self.NAOrderMessage.CompanyCode = templateDate[2];
            self.NAOrderMessage.CompanyName = templateDate[3];
            self.NAOrderMessage.VendorNo = templateDate[5];
            self.NAOrderMessage.Vendor = templateDate[4];
            self.NAOrderMessage.RateValue = templateDate[8];
            self.NAOrderMessage.RateCode = templateDate[6];
            self.NAOrderMessage.RateName = templateDate[7];
            self.NAOrderMessage.Currency = templateDate[9];
            self.NAOrderMessage.CurrencyCode = templateDate[10];
            self.NAOrderMessage.FactoryCode = templateDate[11];
            self.NAOrderMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr = "请输入" + self.NAOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示
            self.onNAOrderMessageChange.emit(self.NAOrderMessage);
        }
        this.judgeSupplier(e[5], e[11], judgeCallback, "selectTpl");
        this.paymentAndDelivery.companycode= e[2];//保存公司代码
        this.paymentAndDelivery.vendorcode=e[5];//保存供应商代码
        this.getPaymentAndDeliveryFormModel();//根据模板数据的变化获取付款条款和交货条件
    }

    //根据模板的供应商和我方主体，请求接口获取交货条件和付款条款的数据
    getPaymentAndDeliveryFormModel(){
        console.log(this.paymentAndDelivery);
        this.shareMethodService.getVendorInfoFromERP(this.paymentAndDelivery).then(data=>{
            console.log(data);
            if(data.Result){
                //获取对应的付款条款名称，保存进入实体
               if(data.Data.paymenttermscode){
                  this.paymentProvisionList.forEach(element => {
                      if(element.Code===data.Data.paymenttermscode){
                        this.NAOrderMessage.paymenttermscode = data.Data.paymenttermscode;
                        this.NAOrderMessage.paymentterms = element.Content;
                        this.onNAOrderMessageChange.emit(this.NAOrderMessage);//异步请求慢于后续操作 需再返回一次
                      }
                  });
               }

               //获取交货条件
               if(data.Data.internationaltradeterms&&data.Data.internationaltradelocation){
                  this.copyAbroadData(data.Data.internationaltradeterms,data.Data.internationaltradelocation,null,false,true);
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
               //console.log(this.paymentProvisionList);
            }
        })
    }


    CompanyChange(e) {//我方主体选中
        this.NAOrderMessage.CompanyCode = e[1];
        this.factoryPlaceStr = "请输入" + this.NAOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示 修改
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
        this.onCompanyCodeChange.emit(this.NAOrderMessage.CompanyCode);
    }
    factoryCheck(e) {//工厂格式校验
        if (e == "") {
            return;
        }
        this.NAOrderMessage.FactoryCode = this.NAOrderMessage.FactoryCode.toUpperCase();
        let endOne = this.NAOrderMessage.FactoryCode.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            this.windowService.alert({ message: 'NA订单不允许使用'+endOne+'工厂', type: 'fail' });
            this.NAOrderMessage.FactoryCode="";
            return;
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.NAOrderMessage.CompanyCode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.NAOrderMessage.FactoryCode="";
                return;
            }
        }
        let self = this;
        let judgeCallback = function () {
            self.onNAOrderMessageChange.emit(self.NAOrderMessage);
        }
        this.judgeSupplier(this.NAOrderMessage.VendorNo, this.NAOrderMessage.FactoryCode, judgeCallback, "selectFactory");
    }
    VendorChange(e) {//供应商选中
        if(!e[6]){//国内
            this.windowService.alert({ message:"NA单不允许选择国内的供应商", type: 'success' });
            this.NAOrderMessage.Vendor="";
            this.TemplateName = "";
            return;
        }
        let self = this;
        let judgeCallback=function(){
            self.NAOrderMessage.Vendor = e[0];//供应商
            self.NAOrderMessage.VendorNo = e[1];
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
                        self.NAOrderMessage.Currency = self.selectInfo.currency[i]["text"];
                        self.NAOrderMessage.CurrencyCode = e[3];
                        if (e[3] == "RMB") {
                            self.isRMB = true;
                        } else {
                            self.isRMB = false;
                        }
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
                                self.NAOrderMessage.paymenttermscode = e[5];
                                self.NAOrderMessage.paymentterms = paymentList[i]["Content"];
                                self.onNAOrderMessageChange.emit(self.NAOrderMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.copyAbroadData(e[7],e[8],null,false,true);
            self.NAOrderMessage.VendorCountry = e[6];//国内外
            self.onIsRMBChange.emit(self.isRMB);
            self.onNAOrderMessageChange.emit(self.NAOrderMessage);
        }
        this.judgeSupplier(e[1], this.NAOrderMessage.FactoryCode, judgeCallback, "selectVendor");
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.NAOrderMessage.RateValue = this.selectInfo.taxrate[i].other;
            }
        }
        this.NAOrderMessage.RateName = e.text;
        this.NAOrderMessage.RateCode = e.id;
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.NAOrderMessage.Currency = e.text;
        this.NAOrderMessage.CurrencyCode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    getLocation(e){//国际贸易地点选择
        this.NAOrderMessage.DeliveryLocation=e.text;
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    getCondition(e){//国际贸易条件选择
        this.NAOrderMessage.DeliveryCondition=e.id;
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    getReceiverPeople(e){//收货人选择
        this.NAOrderMessage.DeliveryPeople=e.id;
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.NAOrderMessage.paymenttermscode=e[0];
        this.NAOrderMessage.paymentterms=e[1];
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if (e == "") {//为空不校验
            return;
        }
        let name = "tracenoF";
        if (this.NAOrderForm.controls[name].invalid) {//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.NAOrderMessage.TrackingNumber = "";
            return;
        }
        this.NAOrderMessage.TrackingNumber = this.NAOrderMessage.TrackingNumber.toUpperCase();//转大写
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    sendData() {//返回数据
        this.onNAOrderMessageChange.emit(this.NAOrderMessage);
    }
    toAddSupplier(){//跳转 添加供应商页面
        window.open(dbomsPath+'supplier/edit-supplier-ncs/0');
    }
    judgeSupplier(venStr, facStr, callback, scene) {//判断供应商类型
        let self=this;
        let resetFillIn=function(){//不同情况下 置空
            switch(scene){//不同情况下 置空
                case "selectTpl":
                    self.TemplateName="";
                    break;
                case "selectFactory":    
                    self.NAOrderMessage.FactoryCode="";
                    break;
                case "selectVendor":    
                    self.NAOrderMessage.Vendor="";
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
                                this.NAOrderMessage.VendorTrace=data.Data;
                                this.onVendorTraceChange.emit(this.NAOrderMessage.VendorTrace);
                            }
                        })
                    }else{
                        this.NAOrderMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.NAOrderMessage.VendorTrace);
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
            this.NAOrderMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.NAOrderMessage.VendorTrace);
            if (typeof callback === "function") {
                callback();//此时没判断是否核心 执行后续获取值等操作
            }
        }
    }
    copyAbroadData(condition,place,receiver,copyReceiver,copyToSubjectInfor){//国外时 复制对应值
        /*
            condition:国际贸易条件
            place:国际贸易地点
            receiver:收货人
            copyReceiver:是否需要复制 收货人信息
            copyToSubjectInfor:是否需要 最后复制到主体信息
        */
       if(condition){//国际贸易条件

        // console.log(this.selectInfo.deliveryCondition,condition);
        // [].forEach.call(this.selectInfo.deliveryCondition,element=> {
        //     if(element.id==condition) {
        //         this.avtiveDeliveryCondition= {id:element.id,text:element.text};
        //         console.log(this.avtiveDeliveryCondition);
        //         if(copyToSubjectInfor){
        //             this.NAOrderMessage.DeliveryCondition=element.id;
        //         }
        //     }
        // })

        

           for(let i=0,len=this.selectInfo.deliveryCondition.length;i<len;i++){
               if(this.selectInfo.deliveryCondition[i]["id"]==condition){
                   let data = [
                       {
                           id: this.selectInfo.deliveryCondition[i]["id"],
                           text: this.selectInfo.deliveryCondition[i]["text"]
                       }
                   ]
                   console.log(this.avtiveDeliveryCondition,)
                   this.avtiveDeliveryCondition = data;
                   if(copyToSubjectInfor){
                       this.NAOrderMessage.DeliveryCondition=this.selectInfo.deliveryCondition[i]["id"];
                   }
               }
           }
       }
       if(place){//国际贸易地点
           for(let i=0,len=this.selectInfo.deliveryLocation.length;i<len;i++){
               if(this.selectInfo.deliveryLocation[i]["text"]==place){
                   let data = [
                       {
                           id: this.selectInfo.deliveryLocation[i]["id"],
                           text:this.selectInfo.deliveryLocation[i]["text"]
                       }
                   ]
                   this.avtiveDeliveryLocation = data;
                   if(copyToSubjectInfor){
                       this.NAOrderMessage.DeliveryLocation=this.selectInfo.deliveryLocation[i]["text"];
                   }
               }
           }
       }
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
                       this.NAOrderMessage.DeliveryPeople=this.selectInfo.deliveryPeople[i]["id"];
                   }
               }
           }
       }
    }
}