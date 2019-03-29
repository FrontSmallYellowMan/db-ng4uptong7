//NB采购订单页面-采购信息
import { Component, OnInit, Input, Output, EventEmitter, DoCheck, ViewChild, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { NKOrderMessage } from './../../../services/NK-new.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery } from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';

@Component({
    selector: "NK-new-message",
    templateUrl: 'NK-new-message.component.html',
    styleUrls: ['NK-new-message.component.scss', './../../../scss/procurement.scss']
})
export class NKNewMessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化请求参数

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
    NKOrderMessage = new NKOrderMessage();//采购信息 整体数据
    isTenStart = false;//供应商代码 是否10开头 “对方业务范围”是否显示标识
    messageCanModify = false;//根据有无选择 采购申请 决定采购信息部分可否修改
    presellStartDate = moment(new Date()).format("YYYY-MM-DD");//预计销售时间的 开始时间
    taxrateAllData = {//税率的完整数据 区分国内外
        "all": [],
        "domestic": [], //国内税率
        "abroad": [] //国外税率
    };
    selectInfo = {//下拉框数据
        company: [],
        vendor: [],
        taxrate: [],
        currency: []
    }

    paymentProvisionList:any=[];//保存付款条款列表

    @ViewChild(NgForm)
    NKOrderForm;//表单
    beforeNBOrderFormValid;//表单的前一步校验结果
    @Input() purchaseOrderID: '';//采购订单id
    @Input() isSubmit = false;//是否提交
    @Input() NBType;//创建NB单类型 （目前三种类型：hasApply，directNB，prepareApplyNoContract）

    @Input() set NKOrderData(data) {//编辑状态下 输入NK单的整体数据
        if (data["ID"]) {
            for (let key in this.NKOrderMessage) {//数据拷贝NKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessageNKOrderMessage
                this.NKOrderMessage[key] = data[key];
            }
            this.avtiveCurrency = [{
                id: this.NKOrderMessage.CurrencyCode,
                text: this.NKOrderMessage.Currency
            }];
            if (this.NKOrderMessage.Currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.NKOrderMessage.RateCode,
                text: this.NKOrderMessage.RateName
            }];
            if (this.NKOrderMessage.preselldatetime) {
                this.NKOrderMessage.preselldatetime = moment(this.NKOrderMessage.preselldatetime).format("YYYY-MM-DD");
            }
            //供应商代码 是否10开头 判断
            this.judgeIsTenStart();

            //供应商国外改变时 税率的选项变化
            if(this.taxrateAllData.all.length===0){
                this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
                    this.taxrateAllData = data;
                    this.selectInfo.taxrate = data.all;
                    this.homeAbroadRateSet(false);
                })
            }else{
                this.homeAbroadRateSet(false);
            }
            

            //判断供应商类型
            this.judgeSupplier(this.NKOrderMessage.VendorNo, this.NKOrderMessage.FactoryCode, null, "");
            if (this.NKOrderMessage.TemplateID) {//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.NKOrderMessage.TemplateID).then(data => {
                    if (data.Result) {
                        this.TemplateName = data.Data.Name;
                    }
                })
            }
        }
    };
    @Output() onNKOrderFormValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onNKOrderMessageChange = new EventEmitter();//当 采购信息整体数据 变化
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
        if (this.NKOrderForm.valid != this.beforeNBOrderFormValid) {//表单校验变化返回
            this.beforeNBOrderFormValid = this.NKOrderForm.valid;
            this.onNKOrderFormValidChange.emit(this.NKOrderForm.valid);
        }
    }
    ngOnInit() {
        this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
            this.selectInfo.currency = data;
            this.avtiveCurrency = [{ id: "RMB", text: "人民币" }];
            this.NKOrderMessage.Currency = "人民币";
            this.NKOrderMessage.CurrencyCode = "RMB";
            this.onIsRMBChange.emit(this.isRMB);
            this.onNKOrderMessageChange.emit(this.NKOrderMessage);
        })
        this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
            this.taxrateAllData = data;
            this.selectInfo.taxrate = data.all;
        })
        this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
            this.bizdivision = data.SYBMC;
        })

        this.getPayList();//获取付款条款列表
    }

    public getTemplate(e) {//获取模板返回 
        console.log("模板数据");
        console.log(e);
        if (e[16] == 1) {//国外
            this.windowService.alert({ message: "国外供应商不能提交NK采购订单", type: 'success' });
            this.TemplateName = "";
            return;
        }
        else if (e[5] == "2020443") {
            this.windowService.alert({ message: "供应商2020443不能提交NK采购订单，请提交WX采购订单", type: 'success' });
            this.TemplateName = "";
            return;
        }
        else if (this.vendornoIsTenStart(e[5])) {
            this.windowService.alert({ message: "内部供应商不能提交NK采购订单", type: "success" });
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
            self.NKOrderMessage.TemplateID = e[0];
            self.NKOrderMessage.CompanyCode = templateDate[2];
            self.NKOrderMessage.CompanyName = templateDate[3];
            self.NKOrderMessage.VendorNo = templateDate[5];
            self.NKOrderMessage.Vendor = templateDate[4];
            self.NKOrderMessage.RateValue = templateDate[8];
            self.NKOrderMessage.RateCode = templateDate[6];
            self.NKOrderMessage.RateName = templateDate[7];
            self.NKOrderMessage.Currency = templateDate[9];
            self.NKOrderMessage.CurrencyCode = templateDate[10];
            self.NKOrderMessage.FactoryCode = templateDate[11];
            self.NKOrderMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr = "请输入" + self.NKOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示
            self.judgeIsTenStart();
            self.homeAbroadRateSet(false);
            self.onNKOrderMessageChange.emit(self.NKOrderMessage);
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
                    //console.log(data);
                    if(data.Result){
                        //获取对应的付款条款名称，保存进入实体
                       if(data.Data.paymenttermscode){
                          this.paymentProvisionList.forEach(element => {
                              if(element.Code===data.Data.paymenttermscode){
                                this.NKOrderMessage.paymenttermscode = data.Data.paymenttermscode;
                                this.NKOrderMessage.paymentterms = element.Content;
                                this.onNKOrderMessageChange.emit(this.NKOrderMessage);//异步请求慢于后续操作 需再返回一次
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
        this.NKOrderMessage.CompanyCode = e[1];
        this.factoryPlaceStr = "请输入" + this.NKOrderMessage.CompanyCode.substring(2, 4) + "xx";//工厂输入提示 修改
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
        this.onCompanyCodeChange.emit(this.NKOrderMessage.CompanyCode);
    }
    factoryCheck(e) {//工厂格式校验
        if (e == "") {
            return;
        }
        this.NKOrderMessage.FactoryCode = this.NKOrderMessage.FactoryCode.toUpperCase();
        let endOne = this.NKOrderMessage.FactoryCode.substring(0, 2);
        if (endOne[0] == "A") {//以"A"开头
            this.windowService.alert({ message: 'NB订单不允许使用' + endOne + '工厂', type: 'fail' });
            this.NKOrderMessage.FactoryCode = "";
            return;
        } else {//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.NKOrderMessage.CompanyCode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.NKOrderMessage.FactoryCode = "";
                return;
            }
        }
        let self = this;
        let judgeCallback = function () {
            self.onNKOrderMessageChange.emit(self.NKOrderMessage);
        }
        this.judgeSupplier(this.NKOrderMessage.VendorNo, this.NKOrderMessage.FactoryCode, judgeCallback, "selectFactory");
    }
    VendorChange(e) {//供应商选中
        let self = this;
        let judgeCallback = function () {
            //供应商的付款条款信息
            if (e[4] && e[5]) {
                self.NKOrderMessage.paymentterms = e[4];
                self.NKOrderMessage.paymenttermscode = e[5];
            }
            else if (e[5]) {
                let body = {
                    "queryStr": "SearchTxt", "pageSize": 999, "pageNo": 1, "SearchTxt": ""
                }
                let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
                let options = new RequestOptions({ headers: headers });
                self.dbHttp.post("vendor/paymentclause", body, options).subscribe(response => {
                    if (response.success) {
                        let paymentList = response.data.rows;
                        for (let i = 0, len = paymentList.length; i < len; i++) {
                            if (paymentList[i]["Code"] == e[5]) {
                                self.NKOrderMessage.paymenttermscode = e[5];
                                self.NKOrderMessage.paymentterms = paymentList[i]["Content"];
                                break;
                            }
                        }
                    }
                })
            }
            //当供应商币种和币种code都不等于null时，才带入供应商的币种信息
            if (e[2] != null && e[3] != null) {
                //供应商币种信息
                let data = [
                    {
                        id: e[3],
                        text: e[2]
                    }
                ]
                self.NKOrderMessage.Currency = e[2];
                self.NKOrderMessage.CurrencyCode = e[3];
                self.avtiveCurrency = data;
            }
            self.NKOrderMessage.VendorNo = e[1];
            self.NKOrderMessage.Vendor = e[0];
            self.NKOrderMessage.VendorCountry = e[6];
            self.homeAbroadRateSet(true);
            self.judgeIsTenStart();
            self.isRMB = true;
            self.onIsRMBChange.emit(self.isRMB);
            self.onNKOrderMessageChange.emit(self.NKOrderMessage);
        }
        this.judgeSupplier(e[1], this.NKOrderMessage.FactoryCode, judgeCallback, "selectVendor");
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.NKOrderMessage.RateValue = this.selectInfo.taxrate[i].other;
            }
        }
        this.NKOrderMessage.RateName = e.text;
        this.NKOrderMessage.RateCode = e.id;
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
    }
    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.NKOrderMessage.Currency = e.text;
        this.NKOrderMessage.CurrencyCode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
    }
    getPaymenttermsAndCode(e) {//付款条款选择
        this.NKOrderMessage.paymenttermscode = e[0];
        this.NKOrderMessage.paymentterms = e[1];
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if (e == "") {//为空不校验
            return;
        }
        let name = "tracenoF";
        if (this.NKOrderForm.controls[name].invalid) {//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.NKOrderMessage.TrackingNumber = "";
            return;
        }
        this.NKOrderMessage.TrackingNumber = this.NKOrderMessage.TrackingNumber.toUpperCase();//转大写
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
    }
    toAddSupplier() {//跳转 添加供应商页面
        window.open(dbomsPath + 'supplier/edit-supplier-ncs/0');
    }
    //判断供应商类型
    judgeSupplier(venStr, facStr, callback, scene) {
        let self = this;
        let resetFillIn = function () {//不同情况下 置空
            switch (scene) {//不同情况下 置空
                case "selectTpl":
                    self.TemplateName = "";
                    break;
                case "selectFactory":
                    self.NKOrderMessage.FactoryCode = "";
                    break;
                case "selectVendor":
                    self.NKOrderMessage.Vendor = "";
                    break;
            }
            return;
        }
        if (venStr && facStr) {
            if (venStr == "2020443") {
                this.windowService.alert({ message: "供应商2020443不能提交NK采购订单，请提交WX采购订单", type: "success" });
                resetFillIn();
            }
            else if (this.vendornoIsTenStart(venStr)) {
                this.windowService.alert({ message: "内部供应商不能提交NK采购订单", type: "success" });
                resetFillIn();
            }
            this.shareMethodService.judgeSupplierType(facStr, venStr)
                .then(data => {//判断供应商类型
                    console.log(data);
                    if (data.Result) {
                        this.supplierType = data.Data;
                        //核心 或者 新产品
                        if (this.supplierType == "核心" || this.supplierType == "新产品") {
                            this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                                if (data.Result) {
                                    // 供应商是核心或新产品，并且供应商类型是有效或者超期，则不允许提交NK订单
                                    if (data.Data != 0) {
                                        this.windowService.alert({ message: "此供应商不允许提交NK采购订单!(供应商是核心或新产品，并且供应商类型是有效或者超期，则不允许提交NK订单)", type: 'success' });
                                        resetFillIn();
                                    } else {
                                        this.NKOrderMessage.VendorTrace = data.Data;
                                        this.onVendorTraceChange.emit(this.NKOrderMessage.VendorTrace);
                                        if (typeof callback === "function") {
                                            callback();
                                        }
                                    }
                                }
                            })
                        }
                        else {//非核心
                            callback();
                        }
                    } else {
                        this.windowService.alert({ message: data.Message, type: 'success' });
                        resetFillIn();
                    }
                })
        } else {
            //无确定值 供应商是否过期为Null
            this.NKOrderMessage.VendorTrace = null;
            this.onVendorTraceChange.emit(this.NKOrderMessage.VendorTrace);
            if (typeof callback === "function") {
                callback();//此时没判断是否核心 执行后续获取值等操作
            }
        }
    }
    homeAbroadRateSet(direct) {//供应商国别改变时 税率的选项变化
        // direct-表示是直接选择供应商
        if (this.NKOrderMessage.VendorCountry == 0) {//0-国内
            this.selectInfo.taxrate = this.taxrateAllData.domestic;
            if (this.NKOrderMessage.RateValue == 0 && direct) {//如果是J0 则置空
                this.activeTaxrate = [{
                    id: "", text: ""
                }];
                this.NKOrderMessage.RateValue = null;
                this.NKOrderMessage.RateCode = "";
                this.NKOrderMessage.RateName = "";
            }
            this.taxrateDisabled = false;
        } else {//国外供应商默认为J0
            this.selectInfo.taxrate = this.taxrateAllData.all;
            this.activeTaxrate = [{ id: this.taxrateAllData.abroad[0]["id"], text: this.taxrateAllData.abroad[0]["text"] }];
            this.NKOrderMessage.RateValue = this.taxrateAllData.abroad[0]["other"];
            this.NKOrderMessage.RateCode = this.taxrateAllData.abroad[0]["id"];
            this.NKOrderMessage.RateName = this.taxrateAllData.abroad[0]["text"];
        }
    }
    judgeIsTenStart() {//供应商代码 是否10开头 判断
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.NKOrderMessage.VendorNo));
        if (localvendorno.substring(0, 2) == "10") {
            this.isTenStart = true;
        } else {
            this.isTenStart = false;
        }
    }
    vendornoIsTenStart(vendorno) {
        if (vendorno.substring(0, 2) == "10") {
            return true;
        }
        else {
            return false;
        }
    }
    //输出数据到父组件
    OutputData() {
        this.onNKOrderMessageChange.emit(this.NKOrderMessage);
    }
}