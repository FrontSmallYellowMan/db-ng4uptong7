//NB采购订单页面-采购信息
import { Component, OnInit, Input, Output, EventEmitter, DoCheck, ViewChild,SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { NBOrderMessage } from './../../../services/NB-new.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService ,GetPaymentAndDelivery} from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';

@Component({
    selector: "NB-new-message",
    templateUrl: 'NB-new-message.component.html',
    styleUrls: ['NB-new-message.component.scss', './../../../scss/procurement.scss']
})
export class NBNewmessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化查询付款条款和交货条件

    TemplateName;//模板名称-供显示
    templateShowIndex = "13";//模板选择框 显示第一列、第三列
    paymentShowIndex = "10";//付款条款框 显示列
    bizdivision;//搜索模板的查询条件--事业部
    activeTaxrate;//税率-当前选项
    avtiveCurrency;//币种-当前选项
    isRMB = true;//是否人民币
    supplierType = "";//供应商类型
    taxrateDisabled = false;//税率是否disabled
    factoryPlaceStr = "";//工厂的输入提示
    NBOrderMessage = new NBOrderMessage();//采购信息 整体数据
    isTenStart = false;//供应商代码 是否10开头 “对方业务范围”是否显示标识
    messageCanModify=false;//根据有无选择 采购申请 决定采购信息部分可否修改
    taxrateAllData={//税率的完整数据 区分国内外
        "all":[],
        "domestic":[], //国内税率
        "abroad":[] //国外税率
    };
    selectInfo = {//下拉框数据
        company: [],
        vendor: [],
        taxrate: [],
        currency: []
    }

    defaultTaxratecode:string="JS";//税率默认值

    paymentProvisionList:any=[];//保存付款条款列表

    @ViewChild(NgForm)
    NBOrderForm;//表单
    beforeNBOrderFormValid;//表单的前一步校验结果
    @Input() purchaseOrderID: '';//采购订单id
    @Input() isSubmit=false;//是否提交
    @Input() NBType;//创建NB单类型 （目前三种类型：hasApply，directNB，prepareApplyNoContract）

    @Input() set NBOrderData(data) {//编辑状态下 读入NB单 的整体数据
        if (data["ID"]) {
            for (let key in this.NBOrderMessage) {//数据拷贝
                this.NBOrderMessage[key] = data[key];
            }
            this.avtiveCurrency = [{
                id: this.NBOrderMessage.CurrencyCode,
                text: this.NBOrderMessage.Currency
            }];
            if (this.NBOrderMessage.Currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.NBOrderMessage.RateCode,
                text: this.NBOrderMessage.RateName
            }];
            this.judgeIsTenStart();
            this.homeAbroadRateSet(false);
            this.judgeSupplier(this.NBOrderMessage.VendorNo, this.NBOrderMessage.FactoryCode, null, "");
            if (this.NBOrderMessage.TemplateID) {//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.NBOrderMessage.TemplateID).then(data => {
                    if (data.Result) {
                        this.TemplateName = data.Data.Name;
                    }
                })
            }
        }
    };
    @Output() onNBOrderFormValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onNBOrderMessageChange = new EventEmitter();//当 采购信息整体数据 变化
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
        if (this.NBOrderForm.valid != this.beforeNBOrderFormValid) {//表单校验变化返回
            this.beforeNBOrderFormValid = this.NBOrderForm.valid;
            this.onNBOrderFormValidChange.emit(this.NBOrderForm.valid);
        }
    }
    ngOnChanges(changes: SimpleChanges){
        if(changes["NBType"] && changes["NBType"].currentValue){//NBType传入值
            if(this.NBType == "hasApply" || this.NBType == "prepareApplyNoContract"){//无论新建 编辑 该情况下 采购信息不可修改
                this.messageCanModify = true;
            }else{//可修改情况下 获取 下拉列表数据
                this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
                    this.selectInfo.currency = data;
                })
                this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
                    this.taxrateAllData=data;
                    this.selectInfo.taxrate=data.all;

                    this.getDefaultTaxratecode();//默认赋值

                    // this.activeTaxrate = [{
                    //     id: this.selectInfo.taxrate[6]["id"],
                    //     text: this.selectInfo.taxrate[6]["text"]
                    // }];
                    // this.NBOrderMessage.RateValue = this.selectInfo.taxrate[6]["other"];
                    // this.NBOrderMessage.RateValue = this.selectInfo.taxrate[6]["id"];
                    // this.NBOrderMessage.RateName = this.selectInfo.taxrate[6]["text"];
                })
                this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
                    this.bizdivision = data.SYBMC;
                })
            }
        }
    }
    ngOnInit() {
        if (!this.purchaseOrderID && (this.NBType == "hasApply" || this.NBType == "prepareApplyNoContract")) {//新建 读取信息
            let applyListData = JSON.parse(window.localStorage.getItem("applyList"));//获取选中采购申请
            if (applyListData) {
                this.NBOrderMessage.BusinessRange = applyListData[0].vendorbizscope;//对方业务范围
                this.NBOrderMessage.CompanyName = applyListData[0].company;
                this.NBOrderMessage.CompanyCode = applyListData[0].companycode;
                this.NBOrderMessage.RateValue = applyListData[0].taxrate;
                this.NBOrderMessage.RateCode = applyListData[0].taxratecode;
                this.NBOrderMessage.RateName = applyListData[0].taxratename;
                this.NBOrderMessage.Currency = applyListData[0].currency;
                this.NBOrderMessage.CurrencyCode = applyListData[0].currencycode;
                this.NBOrderMessage.FactoryCode = applyListData[0].factory;
                this.NBOrderMessage.Vendor = applyListData[0].vendor;
                this.NBOrderMessage.VendorNo = applyListData[0].vendorno;
                this.NBOrderMessage.VendorCountry = applyListData[0].VendorCountry;
                this.avtiveCurrency = [{
                    id: this.NBOrderMessage.CurrencyCode,
                    text: this.NBOrderMessage.Currency
                }];
                if (this.NBOrderMessage.Currency == "人民币") {
                    this.isRMB = true;
                } else {
                    this.isRMB = false;
                }
                this.onIsRMBChange.emit(this.isRMB);
                this.activeTaxrate = [{
                    id: this.NBOrderMessage.RateCode,
                    text: this.NBOrderMessage.RateName
                }];
                if(applyListData.length==1){//只有一条时
                    this.NBOrderMessage.TrackingNumber = applyListData[0].traceno;
                    this.NBOrderMessage.paymentterms = applyListData[0].paymentterms;
                    this.NBOrderMessage.paymenttermscode = applyListData[0].paymenttermscode;
                }
                this.judgeIsTenStart();
                this.judgeSupplier(this.NBOrderMessage.VendorNo, this.NBOrderMessage.FactoryCode, null, "");
                this.onNBOrderMessageChange.emit(this.NBOrderMessage);
                this.onCompanyCodeChange.emit(this.NBOrderMessage.CompanyCode);
            }
        }

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
        if(e[16] == 1){//国外
            this.windowService.alert({ message:"NB单不允许选择国外的供应商", type: 'success' });
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
            self.NBOrderMessage.TemplateID = e[0];
            self.NBOrderMessage.CompanyCode = templateDate[2];
            self.NBOrderMessage.CompanyName = templateDate[3];
            self.NBOrderMessage.VendorNo = templateDate[5];
            self.NBOrderMessage.Vendor = templateDate[4];
            self.NBOrderMessage.RateValue = templateDate[8];
            self.NBOrderMessage.RateCode = templateDate[6];
            self.NBOrderMessage.RateName = templateDate[7];
            self.NBOrderMessage.Currency = templateDate[9];
            self.NBOrderMessage.CurrencyCode = templateDate[10];
            self.NBOrderMessage.FactoryCode = templateDate[11];
            self.NBOrderMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr = "请输入" + self.NBOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示
            self.judgeIsTenStart();
            self.homeAbroadRateSet(false);
            self.onNBOrderMessageChange.emit(self.NBOrderMessage);
        }
        this.judgeSupplier(e[5], e[11], judgeCallback, "selectTpl");

        this.paymentAndDelivery.companycode=e[2];//保存公司代码
        this.paymentAndDelivery.vendorcode=e[5];//保存供应商代码
        this.getPaymentAndDeliveryFormModel();//获取付款条款
    }

    //根据模板的供应商和我方主体，请求接口获取交货条件和付款条款的数据
    getPaymentAndDeliveryFormModel(){
        //console.log(this.paymentAndDelivery);
        this.shareMethodService.getVendorInfoFromERP(this.paymentAndDelivery).then(data=>{
            console.log(data);
            if(data.Result){
                //获取对应的付款条款名称，保存进入实体
               if(data.Data.paymenttermscode){
                  this.paymentProvisionList.forEach(element => {
                      if(element.Code===data.Data.paymenttermscode){
                        this.NBOrderMessage.paymenttermscode = data.Data.paymenttermscode;
                        this.NBOrderMessage.paymentterms = element.Content;
                        this.onNBOrderMessageChange.emit(this.NBOrderMessage);//异步请求慢于后续操作 需再返回一次
                      }
                  });
               }

               //获取交货条件
               if(data.Data.internationaltradeterms&&data.Data.internationaltradelocation){
                 // this.copyAbroadData(data.Data.internationaltradeterms,data.Data.internationaltradelocation,null,false,true);
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
            //    console.log(this.paymentProvisionList);
            }
        })
    }

    CompanyChange(e) {//我方主体选中
        this.NBOrderMessage.CompanyCode = e[1];
        this.factoryPlaceStr = "请输入" + this.NBOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示 修改
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
        this.onCompanyCodeChange.emit(this.NBOrderMessage.CompanyCode);
    }
    factoryCheck(e) {//工厂格式校验
        if (e == "") {
            return;
        }
        this.NBOrderMessage.FactoryCode = this.NBOrderMessage.FactoryCode.toUpperCase();
        let endOne = this.NBOrderMessage.FactoryCode.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            this.windowService.alert({ message: 'NB订单不允许使用'+endOne+'工厂', type: 'fail' });
            this.NBOrderMessage.FactoryCode="";
            return;
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.NBOrderMessage.CompanyCode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.NBOrderMessage.FactoryCode="";
                return;
            }
        }
        let self = this;
        let judgeCallback = function () {
            self.onNBOrderMessageChange.emit(self.NBOrderMessage);
        }
        this.judgeSupplier(this.NBOrderMessage.VendorNo, this.NBOrderMessage.FactoryCode, judgeCallback, "selectFactory");
    }
    VendorChange(e) {//供应商选中
        if(e[6] == 1){//国外
            this.windowService.alert({ message:"NB单不允许选择国外的供应商", type: 'success' });
            this.NBOrderMessage.Vendor="";
            return;
        }
        let self = this;
        let judgeCallback=function(){
            self.NBOrderMessage.Vendor = e[0];//供应商
            self.NBOrderMessage.VendorNo = e[1];
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
                        self.NBOrderMessage.Currency = self.selectInfo.currency[i]["text"];
                        self.NBOrderMessage.CurrencyCode = e[3];
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
                                self.NBOrderMessage.paymenttermscode = e[5];
                                self.NBOrderMessage.paymentterms = paymentList[i]["Content"];
                                self.onNBOrderMessageChange.emit(self.NBOrderMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.NBOrderMessage.VendorCountry = e[6];//国内外
            self.homeAbroadRateSet(true);
            self.judgeIsTenStart();
            self.onIsRMBChange.emit(self.isRMB);
            self.onNBOrderMessageChange.emit(self.NBOrderMessage);
        }
        this.judgeSupplier(e[1], this.NBOrderMessage.FactoryCode, judgeCallback, "selectVendor");
    }
    checkVendorbizscope(e) {//验证对方业务范围
        if(e==""){//为空不校验
            return;
        }
        if (e.substring(2, 4) != "01") {
            this.windowService.alert({ message: '请检查业务范围，按‘XX01’格式填写', type: 'warn' });
        }
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.NBOrderMessage.RateValue = this.selectInfo.taxrate[i].other;
            }
        }
        this.NBOrderMessage.RateName = e.text;
        this.NBOrderMessage.RateCode = e.id;
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
    }
    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.NBOrderMessage.Currency = e.text;
        this.NBOrderMessage.CurrencyCode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.NBOrderMessage.paymenttermscode=e[0];
        this.NBOrderMessage.paymentterms=e[1];
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if (e == "") {//为空不校验
            return;
        }
        let name = "tracenoF";
        if (this.NBOrderForm.controls[name].invalid) {//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.NBOrderMessage.TrackingNumber = "";
            return;
        }
        this.NBOrderMessage.TrackingNumber = this.NBOrderMessage.TrackingNumber.toUpperCase();//转大写
        this.onNBOrderMessageChange.emit(this.NBOrderMessage);
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
                    self.NBOrderMessage.FactoryCode="";
                    break;
                case "selectVendor":    
                    self.NBOrderMessage.Vendor="";
                    break;
            }
            return;
        }
        if (venStr && facStr) {
            this.shareMethodService.judgeSupplierType(facStr,venStr)
            .then(data => {//判断供应商类型
                if (data.Result) {
                    this.supplierType = data.Data;
                    if (this.supplierType == "非核心") {//非核心
                        this.windowService.alert({ message: "NB单不允许选择非核心类型的供应商", type: 'success' });
                        resetFillIn();
                        this.NBOrderMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.NBOrderMessage.VendorTrace);
                    }else{//核心 或者 新产品
                        this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                            if (data.Result) {
                                if(data.Data==0&&venStr.substring(0,2)!=='10'){
                                    // 供应商是核心或新产品，但是供应商类型是无效，则不允许提交
                                    this.windowService.alert({ message:"此供应商为无效供应商，请提交NK采购订单", type: 'success' });
                                    resetFillIn();
                                    this.NBOrderMessage.Vendor="";
                                    this.NBOrderMessage.VendorTrace=null;
                                    this.onVendorTraceChange.emit(this.NBOrderMessage.VendorTrace);
                                }else if(data.Data==0&&venStr.substring(0,2)==='10'){
                                    this.NBOrderMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.NBOrderMessage.VendorTrace);
                                    if(typeof callback === "function"){
                                        callback();//若供应商前两位为“10”，则是 "核心供应商" ，允许提交，执行后续获取值等操作
                                    }
                                }else{
                                    this.NBOrderMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.NBOrderMessage.VendorTrace);
                                    if(typeof callback === "function"){
                                        callback();//若不为 "非核心" 执行后续获取值等操作
                                    }
                                }
                            }
                        })
                    }
                }else{
                    this.windowService.alert({ message:data.Message, type: 'success' });
                    resetFillIn();
                }
            })
        } else {
            //无确定值 供应商是否过期为Null
            this.NBOrderMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.NBOrderMessage.VendorTrace);
            if (typeof callback === "function") {
                callback();//此时没判断是否核心 执行后续获取值等操作
            }
        }
    }
    homeAbroadRateSet(direct) {//供应商国外改变时 税率的选项变化
        // direct-表示是直接选择供应商
        if (this.NBOrderMessage.VendorCountry == 0) {//0-国内
            this.selectInfo.taxrate = this.taxrateAllData.domestic;
            if (this.NBOrderMessage.RateValue == 0 && direct) {//如果是J0 则置空
                this.activeTaxrate = [{
                    id: "", text: ""
                }];
                this.NBOrderMessage.RateValue = null;
                this.NBOrderMessage.RateCode = "";
                this.NBOrderMessage.RateName = "";
            }
            this.taxrateDisabled = false;
        }
    }
    judgeIsTenStart() {//供应商代码 是否10开头 判断
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.NBOrderMessage.VendorNo));
        if (localvendorno.substring(0, 2) == "10") {
            this.isTenStart = true;
        } else {
            this.isTenStart = false;
        }
    }

    //赋值默认的税率
    getDefaultTaxratecode(){
        this.selectInfo.taxrate.forEach(element => {

            if(element.id==this.defaultTaxratecode){

               this.activeTaxrate = [{
                id: element.id,
                text: element.text
            }];
            this.NBOrderMessage.RateValue = element.other;
            this.NBOrderMessage.RateCode = element.id;
            this.NBOrderMessage.RateName = element.text;

            }
        });

        this.onNBOrderMessageChange.emit(this.NBOrderMessage);//异步请求慢于后续操作 需再返回一次
    }
}