// 备货单采购申请页面-采购信息
import { Component, OnInit,Input, Output, EventEmitter,DoCheck,ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { StockApplyMessage } from './../../../services/stockApply-submit.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery} from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';
import { PrepareApplyCommunicateService } from "../../../services/communicate.service";

@Component({
    selector: "stockApply-submit-message",
    templateUrl: 'stockApply-submit-message.component.html',
    styleUrls: ['stockApply-submit-message.component.scss','./../../../scss/procurement.scss']
})
export class StockApplySubmitMessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();

    TemplateName;//模板名称-供显示
    templateShowIndex = "13";//模板选择框 显示第一列、第三列
    paymentShowIndex = "10";//付款条款框 显示列
    bizdivision;//搜索模板的查询条件--事业部
    presellStartDate=moment(new Date()).format("YYYY-MM-DD");//预计销售时间的 开始时间
    activeTaxrate;//税率-当前选项
    avtiveCurrency;//币种-当前选项
    beforeCurrency;//上一步的币种值
    avtiveDeliveryLocation;//交货地点-当前选项
    avtiveDeliveryCondition;//交货条件-当前选项
    avtiveDeliveryPeople;//收货人-当前选项
    isRMB = true;//是否人民币
    supplierType="";//供应商类型
    taxrateDisabled = false;//税率是否disabled
    factoryPlaceStr="";//工厂的输入提示
    stoApplyMessage=new StockApplyMessage();//采购信息 整体数据
    facVendData = {//工厂代码和供应商代码
        factory: '',
        vendorno: ''
    };
    isTenStart = false;//供应商代码 是否10开头 “对方业务范围”是否显示标识
    beforeFactory;//上一步填写的工厂值
    taxrateAllData={//税率的完整数据 区分国内外
        "all":[],
        "domestic":[], //国内税率
        "abroad":[] //国外税率
    };
    selectInfo = {//下拉框数据
        company: [],
        vendor: [],
        taxrate: [],
        currency: [],
        deliveryLocation:[],//交货地点
        deliveryCondition:[],//交货条件
        deliveryPeople:[]//收货人
    }

    avtiveSendType:any;//绑定的发货方式
    sendTypeList:any=[
        {'id':'0','text':'直发'},
        {'id':'1','text':'非直发'}
    ];//发货方式列表

    paymentProvisionList:any=[];//保存付款条款列表

    defaultTaxratecode:string='JS';//默认税率code

    @ViewChild(NgForm)
    stoApplyMessageForm;//表单
    beforeStoApplyMessageFormValid;//表单的前一步校验结果

    @Input() set stockApplyData(data) {//编辑状态下 读入备货单申请 的整体数据
        if (data["purchaserequisitionid"]) {
            console.log(data);
            for(let key in this.stoApplyMessage){//数据拷贝
                this.stoApplyMessage[key]=data[key];
            }
            this.beforeFactory=this.stoApplyMessage.factory;//保存工厂值
            this.avtiveCurrency = [{
                id: this.stoApplyMessage.currencycode,
                text: this.stoApplyMessage.currency
            }];
            //获取发货方式
            if(this.stoApplyMessage.SendType){
                this.avtiveSendType=JSON.parse(this.stoApplyMessage.SendType);
                console.log(this.avtiveSendType);
            } 

            if (this.stoApplyMessage.currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.stoApplyMessage.taxratecode,
                text: this.stoApplyMessage.taxratename
            }];
            this.judgeIsTenStart();

            if(this.taxrateAllData.all.length===0){
                this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
                    this.taxrateAllData=data;
                    this.selectInfo.taxrate=data.all;

                    this.homeAbroadRateSet(false);
                 })
            }else{
                this.homeAbroadRateSet(false);
            }
            /**
             * 问题：因为收货人列表是异步获取的，所以在初始化页面时，set访问器还没有获取到列表，导致内容丢失
             * 解决办法：暂时采用在set访问器里请求接口获取数据
             */

            if(this.selectInfo.deliveryLocation.length===0){
                this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
                    this.selectInfo.deliveryLocation=data.location;
                    this.selectInfo.deliveryCondition=data.condition;
                    this.selectInfo.deliveryPeople=data.people;

                    this.copyAbroadData(this.stoApplyMessage.VendorCountry,this.stoApplyMessage.internationaltradeterms,
                        this.stoApplyMessage.internationaltradelocation,this.stoApplyMessage.receiver,true,false);
                })
            }else{
                this.copyAbroadData(this.stoApplyMessage.VendorCountry,this.stoApplyMessage.internationaltradeterms,
                    this.stoApplyMessage.internationaltradelocation,this.stoApplyMessage.receiver,true,false);
            }

           
            this.judgeSupplier(this.stoApplyMessage.vendorno,this.stoApplyMessage.factory,null,"");
            if(this.stoApplyMessage.TemplateID){//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.stoApplyMessage.TemplateID).then(data=>{
                    if(data.Result){
                        this.TemplateName=data.Data.Name;
                    }
                })
            }
            if(this.stoApplyMessage.preselldate){
                this.stoApplyMessage.preselldate = moment(this.stoApplyMessage.preselldate).format("YYYY-MM-DD");
            }
        }
    };
    @Input() standardTime;//标准周转天数
    @Input() purchaseListLength=0;//采购清单长度
    @Input() isSubmit=false;//是否提交
    @Input() set excludeTaxMoney(data) {//未税总金额
        this.stoApplyMessage.excludetaxmoney=data;
    }
    @Input() set taxInclusiveMoney(data) {//含税总金额
        this.stoApplyMessage.taxinclusivemoney=data;
    }
    @Input() set foreignCurrencyMoney(data) {//外币总金额
        this.stoApplyMessage.foreigncurrencymoney=data;
    }
    @Output() onStoApplyMessageFormValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onSupplierTypeChange = new EventEmitter();//当 供应商类型 变化
    @Output() onFacVendChange = new EventEmitter();//当 工厂代码和供应商代码 变化
    @Output() onStoApplyMessageChange = new EventEmitter();//当 采购信息整体数据 变化
    @Output() onCompanyCodeChange = new EventEmitter();//当 公司代码(我方主体) 变化
    @Output() onRevolveDaysChange = new EventEmitter();//当 实际周转天数 变化
    @Output() onConfirmFactoryChange = new EventEmitter();//当 确认修改工厂 时
    @Output() onVendorTraceChange = new EventEmitter();//当 供应商是否过期变化 变化
    @Input() IsHaveContractInfo;//当 是否提交合同用印 变化
    @Output() IsHaveContractInfoChange = new EventEmitter();//当 是否提交合同用印 变化

    constructor(
        private windowService: WindowService,
        private dbHttp: HttpServer,
        private submitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private procurementTemplateService: ProcurementTemplateService,
        private shareMethodService: ShareMethodService,
        private prepareApplyCommunicateService: PrepareApplyCommunicateService
    ) { }
    ngDoCheck() {
        if (this.stoApplyMessageForm.valid != this.beforeStoApplyMessageFormValid) {//表单校验变化返回
            this.beforeStoApplyMessageFormValid = this.stoApplyMessageForm.valid;
            this.onStoApplyMessageFormValidChange.emit(this.stoApplyMessageForm.valid);
        }
    }
    ngOnInit() {
        this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
            this.selectInfo.currency=data;
        })
        this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
           this.taxrateAllData=data;
           this.selectInfo.taxrate=data.all;

           this.getDefaultTaxratecode();//获取默认的税率名称和code

        //    this.stoApplyMessage.taxratename = this.selectInfo.taxrate[6].text;
        //                 this.stoApplyMessage.taxratecode = this.selectInfo.taxrate[6].id;
        //                 this.activeTaxrate = [{
        //                     id: this.selectInfo.taxrate[6].id,
        //                     text: this.selectInfo.taxrate[6].text
        //                 }];
        })
        this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
            this.bizdivision=data.SYBMC;
        })
        this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
            this.selectInfo.deliveryLocation=data.location;
            this.selectInfo.deliveryCondition=data.condition;
            this.selectInfo.deliveryPeople=data.people;
            console.log(this.selectInfo.deliveryPeople);
        })

        //获取付款条款列表
        this.getPayList();
    }

    public getTemplate(e) {//获取模板返回
        console.log("模板数据");
        console.log(e);
        let self=this;
        let assignmentTplData=function(){//赋值 模板数据 给页面
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
            self.stoApplyMessage.TemplateID = e[0];
            self.stoApplyMessage.companycode = templateDate[2];
            self.stoApplyMessage.company = templateDate[3];
            self.stoApplyMessage.vendorno = templateDate[5];
            self.stoApplyMessage.vendor = templateDate[4];
            self.stoApplyMessage.taxrate = templateDate[8];
            self.stoApplyMessage.taxratecode = templateDate[6];
            self.stoApplyMessage.taxratename = templateDate[7];
            self.stoApplyMessage.currency = templateDate[9];
            self.stoApplyMessage.currencycode = templateDate[10];
            self.stoApplyMessage.factory = templateDate[11];
            self.stoApplyMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr="请输入"+self.stoApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示
            self.beforeFactory = templateDate[11];//保存这一步的 工厂填写
            self.beforeCurrency = templateDate[9];//保存这一步的 币种选择
            self.processChange();
            self.judgeIsTenStart();
            self.homeAbroadRateSet(false);
            self.onStoApplyMessageChange.emit(self.stoApplyMessage);
        }
        let judgeCallback=function(){
            if(!self.purchaseListLength || !self.beforeFactory){//无清单 或 上一次无工厂
                assignmentTplData();
            }else{//有清单
                self.windowService.confirm({ message: "工厂修改后会清空清单，是否继续？" }).subscribe(v => {
                    if (v) {
                        self.onConfirmFactoryChange.emit(true);//清空 
                        setTimeout(()=>{
                            self.stoApplyMessage.foreigncurrencymoney=0;
                            self.stoApplyMessage.excludetaxmoney=0;
                            self.stoApplyMessage.taxinclusivemoney=0;
                            assignmentTplData();
                        },0);
                    } else {
                        self.TemplateName="";
                    }
                })
            }
        }
        this.judgeSupplier(e[5],e[11],judgeCallback,"selectTpl");
        this.paymentAndDelivery.companycode= e[2];//保存公司代码
        this.paymentAndDelivery.vendorcode=e[5];//保存供应商代码
        //根据模板获取付款条款
        this.getPaymentAndDeliveryFormModel();
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
                        this.stoApplyMessage.paymenttermscode = data.Data.paymenttermscode;
                        this.stoApplyMessage.paymentterms = element.Content;
                        this.onStoApplyMessageChange.emit(this.stoApplyMessage);//异步请求慢于后续操作 需再返回一次
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
            //    console.log(this.paymentProvisionList);
            }
        })
    }

    CompanyChange(e) {//我方主体选中
        this.stoApplyMessage.companycode = e[1];
        this.factoryPlaceStr="请输入"+this.stoApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
        this.onCompanyCodeChange.emit(this.stoApplyMessage.companycode);
    }
    factoryCheck(e) {//工厂格式校验
        let self=this;
        let assignmentData=function(){
            self.beforeFactory=self.stoApplyMessage.factory;
            self.onStoApplyMessageChange.emit(self.stoApplyMessage);
            self.processChange();
        }
        let judgeCallback=function(){
            if(!self.purchaseListLength){//无清单
                assignmentData();
            }else{//有清单
                self.windowService.confirm({ message: "工厂修改后会清空清单，是否继续？" }).subscribe(v => {
                    if (v) {
                        self.onConfirmFactoryChange.emit(true);//清空 
                        setTimeout(()=>{
                            self.stoApplyMessage.foreigncurrencymoney=0;
                            self.stoApplyMessage.excludetaxmoney=0;
                            self.stoApplyMessage.taxinclusivemoney=0;
                            assignmentData();
                        },0);
                    } else {
                        self.stoApplyMessage.factory=self.beforeFactory;
                    }
                })
            }
        }
        if(e==this.beforeFactory){//无修改
            return;
        }
        if(e==""){//置空
            judgeCallback();
            return;
        }
        this.stoApplyMessage.factory = this.stoApplyMessage.factory.toUpperCase();
        let endOne = this.stoApplyMessage.factory.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            if(endOne!="AA" && endOne!="A1"){
                this.windowService.alert({ message: '工厂输入有误，请检查', type: 'fail' });
                this.stoApplyMessage.factory=this.beforeFactory;
                return;
            }
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.stoApplyMessage.companycode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.stoApplyMessage.factory=this.beforeFactory;
                return;
            }
        }
        this.judgeSupplier(this.stoApplyMessage.vendorno,this.stoApplyMessage.factory,judgeCallback,"selectFactory");
        
        // 失去焦点时，需要将工厂值传递到父组件，用来请求接口获取标准周转天数
        this.prepareApplyCommunicateService.stockApplyRevolveDaysChangeSend(this.stoApplyMessage.factory);
    }
    VendorChange(e) {//供应商选中
        let self=this;
        let judgeCallback=function(){
            self.stoApplyMessage.vendor = e[0];//供应商
            self.stoApplyMessage.vendorno = e[1];
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
                        self.stoApplyMessage.currency = self.selectInfo.currency[i]["text"];
                        self.stoApplyMessage.currencycode = e[3];
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
                                self.stoApplyMessage.paymenttermscode = e[5];
                                self.stoApplyMessage.paymentterms = paymentList[i]["Content"];
                                self.onStoApplyMessageChange.emit(self.stoApplyMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.copyAbroadData(e[6],e[7],e[8],null,false,true);
            self.stoApplyMessage.VendorCountry = e[6];//国内外
            self.homeAbroadRateSet(true);
            self.processChange();
            self.judgeIsTenStart();
            self.onIsRMBChange.emit(self.isRMB);
            self.onStoApplyMessageChange.emit(self.stoApplyMessage);
        }
        this.judgeSupplier(e[1],this.stoApplyMessage.factory,judgeCallback,"selectVendor");
    }
    checkVendorbizscope(e) {//验证对方业务范围
        if(e==""){//为空不校验
            return;
        }
        if (e.substring(2, 4) != "01") {
            this.windowService.alert({ message: '请检查业务范围，按‘XX01’格式填写', type: 'warn' });
        }
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.stoApplyMessage.taxrate = this.selectInfo.taxrate[i].other;
            }
        }
        this.stoApplyMessage.taxratename = e.text;
        this.stoApplyMessage.taxratecode = e.id;
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.stoApplyMessage.currency = e.text;
        this.stoApplyMessage.currencycode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getOtherMoney(e) {//外币输入后 计算其他金额
        if (!this.stoApplyMessage.currency) {
            this.windowService.alert({ message: '请选择币种', type: 'warn' });
        } else {
            this.shareMethodService.getRateConvertPrice(e,this.stoApplyMessage.currency)
            .then(data => {//根据最新汇率 计算总额
                this.stoApplyMessage.excludetaxmoney=data;
                this.stoApplyMessage.taxinclusivemoney=data;
                this.onStoApplyMessageChange.emit(this.stoApplyMessage);
            })
        }
    }
    getTaxIncluSiveMoney(e) {//计算 含税总金额
        if (typeof(this.stoApplyMessage.taxrate) == "undefined" || this.stoApplyMessage.taxrate == null) {
            this.windowService.alert({ message: '请选择税率', type: 'fail' });
        } else {
            this.stoApplyMessage.taxinclusivemoney = Number((e * (1 + this.stoApplyMessage.taxrate)).toFixed(2));//计算含税
            this.onStoApplyMessageChange.emit(this.stoApplyMessage);
        }
    }
    getLocation(e){//国际贸易地点选择
        this.stoApplyMessage.internationaltradelocation=e.text;
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getCondition(e){//国际贸易条件选择
        this.stoApplyMessage.internationaltradeterms=e.id;
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getReceiverPeople(e){//收货人选择
        this.stoApplyMessage.receiver=e.id;
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.stoApplyMessage.paymenttermscode=e[0];
        this.stoApplyMessage.paymentterms=e[1];
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    clickIsHaveContractInfo(e){//是否提交合同用印 选择
        if(String(e)=="true"){
            this.stoApplyMessage.IsHaveContractInfo=Boolean(1);
        }else{
            this.stoApplyMessage.IsHaveContractInfo=Boolean(0);
        }
        //this.onConApplyMessageChange.emit(this.preApplyMessage);
        this.IsHaveContractInfoChange.emit(this.stoApplyMessage.IsHaveContractInfo);
    }
    
    sendtraceno(e) {//输入需求跟踪号后
        if(e==""){//为空不校验
            return;
        }
        let name="tracenoF";
        if(this.stoApplyMessageForm.controls[name].invalid){//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.stoApplyMessage.traceno="";
            return;
        }
        this.stoApplyMessage.traceno = this.stoApplyMessage.traceno.toUpperCase();//转大写
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    revolveDaysChange(e){//实际周转天数 变化
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
        this.onRevolveDaysChange.emit(e);
    }
    sendData() {//返回数据
        this.onStoApplyMessageChange.emit(this.stoApplyMessage);
    }
    toAddSupplier(){//跳转 添加供应商页面
        window.open(dbomsPath+'supplier/edit-supplier-ncs/0');
    }
    processChange(){//更改流程
        this.facVendData.factory = this.stoApplyMessage.factory;
        this.facVendData.vendorno = this.stoApplyMessage.vendorno;
        this.onFacVendChange.emit(this.facVendData);
    }
    judgeSupplier(venStr,facStr,callback,scene){//判断供应商类型
        let self=this;
        let resetFillIn=function(){//不同情况下 置空
            switch(scene){//不同情况下 置空
                case "selectTpl":
                    self.TemplateName="";
                    break;
                case "selectFactory":    
                    self.stoApplyMessage.factory=self.beforeFactory;
                    break;
                case "selectVendor":    
                    self.stoApplyMessage.vendor="";
                    break;
            }
            return;
        }
        if (venStr && facStr) {
            this.shareMethodService.judgeSupplierType(facStr,venStr)
            .then(data => {//判断供应商类型
                if (data.Result) {
                    this.supplierType = data.Data;
                    if(this.supplierType!="核心"){//不是核心类型
                        this.windowService.alert({ message:"备货单只允许选择核心类型的供应商", type: 'success' });
                        resetFillIn();
                        this.stoApplyMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.stoApplyMessage.VendorTrace);
                    }else{//核心
                        this.onSupplierTypeChange.emit(this.supplierType);
                        this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                            if (data.Result) {
                                if(data.Data==0&&venStr.substring(0,2)!=='10'){
                                    // 供应商是核心或新产品，但是供应商类型是无效，则按照非核心走采购申请流程,而该申请不允许提交非核心
                                    this.windowService.alert({ message:"供应商类型无效，请创建合同采购申请", type: 'success' });
                                    resetFillIn();
                                    this.stoApplyMessage.vendor="";
                                    this.stoApplyMessage.VendorTrace=null;
                                    this.onVendorTraceChange.emit(this.stoApplyMessage.VendorTrace);
                                }else if(data.Data==0&&venStr.substring(0,2)==='10'){
                                    this.stoApplyMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.stoApplyMessage.VendorTrace);
                                    if(typeof callback === "function"){
                                        callback();//若为 "核心" 执行后续获取值等操作
                                    }
                                }else{
                                    this.stoApplyMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.stoApplyMessage.VendorTrace);
                                    if(typeof callback === "function"){
                                        callback();//若为 "核心" 执行后续获取值等操作
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
        }else {
            //无确定值 供应商是否过期为Null
            this.stoApplyMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.stoApplyMessage.VendorTrace);
            if(typeof callback === "function"){
                callback();//此时没判断是否核心 执行后续获取值等操作
            }
        }
    }
    copyAbroadData(VendorCountry,condition,place,receiver,copyReceiver,copyToSubjectInfor){//国外时 复制对应值
        /*
            VendorCountry:0-国内 1国外(海外供应商)
            condition:国际贸易条件
            place:国际贸易地点
            receiver:收货人
            copyReceiver:是否需要复制 收货人信息
            copyToSubjectInfor:是否需要 最后复制到主体信息
        */
        if(VendorCountry){
            if(condition){//国际贸易条件
                for(let i=0,len=this.selectInfo.deliveryCondition.length;i<len;i++){
                    if(this.selectInfo.deliveryCondition[i]["id"]==condition){
                        let data = [
                            {
                                id: this.selectInfo.deliveryCondition[i]["id"],
                                text: this.selectInfo.deliveryCondition[i]["text"]
                            }
                        ]
                        this.avtiveDeliveryCondition = data;
                        if(copyToSubjectInfor){
                            this.stoApplyMessage.internationaltradeterms=this.selectInfo.deliveryCondition[i]["id"];
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
                            this.stoApplyMessage.internationaltradelocation=this.selectInfo.deliveryLocation[i]["text"];
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
                            this.stoApplyMessage.receiver=this.selectInfo.deliveryPeople[i]["id"];
                        }
                    }
                }
            }
        }
    }
    homeAbroadRateSet(direct){//供应商国外改变时 税率的选项变化
        // direct-表示是直接选择供应商
        if (this.stoApplyMessage.VendorCountry == 1) {//国外
            //console.log(this.taxrateAllData);
            this.activeTaxrate = [{
                id: this.taxrateAllData.abroad[0]["id"],
                text: this.taxrateAllData.abroad[0]["text"]
            }];
            this.stoApplyMessage.taxrate = this.taxrateAllData.abroad[0]["other"];
            this.stoApplyMessage.taxratecode = this.taxrateAllData.abroad[0]["id"];
            this.stoApplyMessage.taxratename = this.taxrateAllData.abroad[0]["text"];
            this.taxrateDisabled = true;
        } else {//0-国内
            this.selectInfo.taxrate = this.taxrateAllData.domestic;
            if(this.stoApplyMessage.taxrate==0 && direct){//如果是J0 则置空
                this.activeTaxrate = [{
                    id: "",text: ""
                }];
                this.stoApplyMessage.taxrate = null;
                this.stoApplyMessage.taxratecode = "";
                this.stoApplyMessage.taxratename = "";
            }
            this.taxrateDisabled = false;
        }
    }
    judgeIsTenStart(){//供应商代码 是否10开头 判断
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.stoApplyMessage.vendorno));
        if (localvendorno.substring(0, 2) == "10") {
            this.isTenStart = true;
        } else {
            this.isTenStart = false;
        }
    }


     //获得PO号
     getPo(){
        this.sendData();
       }
   
       //获得特殊情况说明
       getRemark(){
        this.sendData();
       }

       //获得发货方式
       getSendType(e){
           if(e){
               this.stoApplyMessage.SendType=JSON.stringify([e]);
               this.sendData();
           }
       }
   
       //获得是否分批发货
       getIsPartialc(){
           this.sendData();
       }

       //赋值默认的税率
       getDefaultTaxratecode(){
        this.selectInfo.taxrate.forEach(element => {
            if(element.id==this.defaultTaxratecode){
               this.stoApplyMessage.taxratename=element.text;
               this.stoApplyMessage.taxratecode=element.id;
               this.stoApplyMessage.taxrate=element.other; 
               this.activeTaxrate = [{
                id: element.id,
                text: element.text
            }];
            }
        });
       }


}