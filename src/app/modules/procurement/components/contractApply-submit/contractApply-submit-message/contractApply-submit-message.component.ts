// 合同单采购申请页面-采购信息
import { Component, OnInit,Input, Output, EventEmitter,DoCheck,ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { ContractApplyMessage } from './../../../services/contractApply-submit.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery } from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';

@Component({
    selector: "contractApply-submit-message",
    templateUrl: 'contractApply-submit-message.component.html',
    styleUrls: ['contractApply-submit-message.component.scss','./../../../scss/procurement.scss']
})
export class ContractApplySubmitMessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化请求参数

    TemplateName;//模板名称-供显示
    templateShowIndex = "13";//模板选择框 显示第一列、第三列
    paymentShowIndex = "10";//付款条款框 显示列
    bizdivision;//搜索模板的查询条件--事业部
    presellStartDate=moment(new Date()).format("YYYY-MM-DD");//预计销售时间的 开始时间
    activeTaxrate;//税率-当前选项
    avtiveCurrency;//币种-当前选项
    avtiveDeliveryLocation;//交货地点-当前选项
    avtiveDeliveryCondition;//交货条件-当前选项
    avtiveDeliveryPeople;//收货人-当前选项
    isRMB = true;//是否人民币
    supplierType="";//供应商类型
    taxrateDisabled = false;//税率是否disabled
    isCopyRate=false;//新建时 复制税率信息
    factoryPlaceStr="";//工厂的输入提示
    contractApplyMessage=new ContractApplyMessage();//采购信息 整体数据
    facVendData = {//工厂代码和供应商代码
        factory: '',
        vendorno: ''
    };
    isTenStart = false;//供应商代码 是否10开头 “对方业务范围”是否显示标识
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
    _haveContractIsDisable=false;//是否提交合同用印按钮 选择是否禁用
    
    avtiveSendType:any;//绑定的发货方式
    sendTypeList:any=[
        {'id':'0','text':'直发'},
        {'id':'1','text':'非直发'}
    ];//发货方式列表

    defaultTaxratecode:string="JS";//税率默认值
    paymentProvisionList:any=[];//保存付款条款列表

    @ViewChild(NgForm)
    contractApplyForm;//表单
    beforeContractApplyMessageValid;//表单的前一步校验结果

    @Input() set contractApplyData(data) {
        if (data["purchaserequisitionid"]) {//编辑状态下 读入合同单申请 的整体数据
            for(let key in this.contractApplyMessage){//数据拷贝
                this.contractApplyMessage[key]=data[key];
            }

            this.contractApplyMessage.Remark=data.Remark;//保存特殊情况说明

            this.avtiveCurrency = [{
                id: this.contractApplyMessage.currencycode,
                text: this.contractApplyMessage.currency
            }];

            //获取发货方式
            if(this.contractApplyMessage.SendType){
                this.avtiveSendType=JSON.parse(this.contractApplyMessage.SendType);
            } 

            if (this.contractApplyMessage.currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.contractApplyMessage.taxratecode,
                text: this.contractApplyMessage.taxratename
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
             * 问题：在ie下保存后，再打开编辑页面交货条件和收货人丢失
             * 原因：使用set访问器，监听传值的状态，但是下拉框的列表数据是异步请求，在执行取值操作时，列表还没有数据，所以数据丢失
             * 解决方法：暂时采用，在set里请求接口返回列表数据，以同步方式执行操作
             */

            if(this.selectInfo.deliveryLocation.length===0){

                this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
                    this.selectInfo.deliveryLocation=data.location;
                    this.selectInfo.deliveryCondition=data.condition;
                    this.selectInfo.deliveryPeople=data.people;
    
                    this.copyAbroadData(this.contractApplyMessage.VendorCountry,this.contractApplyMessage.internationaltradeterms,
                        this.contractApplyMessage.internationaltradelocation,this.contractApplyMessage.receiver,true,false);
                })
                
            }else{
                this.copyAbroadData(this.contractApplyMessage.VendorCountry,this.contractApplyMessage.internationaltradeterms,
                    this.contractApplyMessage.internationaltradelocation,this.contractApplyMessage.receiver,true,false);
            }

            this.judgeSupplier(this.contractApplyMessage.vendorno,this.contractApplyMessage.factory,null,"");
            if(this.contractApplyMessage.TemplateID){//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.contractApplyMessage.TemplateID).then(data=>{
                    if(data.Result){
                        this.TemplateName=data.Data.Name;
                    }
                })
            }
            if(this.contractApplyMessage.preselldate){
                this.contractApplyMessage.preselldate = moment(this.contractApplyMessage.preselldate).format("YYYY-MM-DD");
            }
        }else{//新建
            let list = JSON.parse(window.localStorage.getItem("contractList"));
            if(list.length==1){//只选 一个合同时 带入信息
                //我方主体
                this.contractApplyMessage.company = list[0]["CompanyName"];
                this.contractApplyMessage.companycode = list[0]["CompanyCode"];
                this.factoryPlaceStr="请输入"+this.contractApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示 修改
                this.onCompanyCodeChange.emit(this.contractApplyMessage.companycode);
                //税率
                this.contractApplyMessage.taxrate=parseInt(list[0]["taxRate"])/100;//转化税率值
                this.isCopyRate=true;
                //币种
                if (list[0]["CurrencyCode"] == "RMB") {
                    this.isRMB = true;
                } else {
                    this.isRMB = false;
                }
                this.contractApplyMessage.currency = list[0]["CurrencyName"];
                this.contractApplyMessage.currencycode = list[0]["CurrencyCode"];
                this.avtiveCurrency = [{
                    id: list[0]["CurrencyCode"],
                    text: list[0]["CurrencyName"]
                }];
                this.onIsRMBChange.emit(this.isRMB);
            }
        }
    };
    @Input() isSubmit=false;//是否提交
    @Input() istoerp=false;//是否写入ERP
    @Input() set haveContractIsDisable(data){//是否提交合同用印按钮 选择是否禁用 读入
        if(data){
            this.contractApplyMessage.IsHaveContractInfo=data;
        }
        this._haveContractIsDisable=data;
    };

    @Input() set excludeTaxMoney(data) {//未税总金额
        this.contractApplyMessage.excludetaxmoney=data;
    }
    @Input() set taxInclusiveMoney(data) {//含税总金额
        this.contractApplyMessage.taxinclusivemoney=data;
    }
    @Input() set foreignCurrencyMoney(data) {//外币总金额
        this.contractApplyMessage.foreigncurrencymoney=data;
    }
    @Output() onContractApplyMessageValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onSupplierTypeChange = new EventEmitter();//当 供应商类型 变化
    @Output() onFacVendChange = new EventEmitter();//当 工厂代码和供应商代码 变化
    @Output() onConApplyMessageChange = new EventEmitter();//当 采购信息整体数据 变化
    @Output() onCompanyCodeChange = new EventEmitter();//当 公司代码(我方主体) 变化
    @Output() onVendorTraceChange = new EventEmitter();//当 供应商是否过期变化 变化
    @Output() onHaveContractInfoChange = new EventEmitter();//当 是否提交合同用印 变化

    constructor(
        private windowService: WindowService,
        private dbHttp: HttpServer,
        private submitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private procurementTemplateService: ProcurementTemplateService,
        private shareMethodService: ShareMethodService
    ) { }
    ngDoCheck() {
        if (this.contractApplyForm.valid != this.beforeContractApplyMessageValid) {//表单校验变化返回
            this.beforeContractApplyMessageValid = this.contractApplyForm.valid;
            this.onContractApplyMessageValidChange.emit(this.contractApplyForm.valid);
        }
    }
    ngOnInit() {
        this.shareDataService.getCurrencySelectInfo().then(data => {//币种列表数据
            this.selectInfo.currency=data;
        })

        this.shareDataService.getTaxrateSelectInfo().then(data => {//税率列表数据
           this.taxrateAllData=data;
           this.selectInfo.taxrate=data.all;
           if(this.isCopyRate){//需要复制税率
                //因为Input 发生在ngOnInit前，所以获取税率列表后 再进行赋值，并且返回信息(onConApplyMessageChange)
               for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
                   if (this.contractApplyMessage.taxrate == this.selectInfo.taxrate[i].other) {
                       
                       this.contractApplyMessage.taxratename = this.selectInfo.taxrate[i].text;
                       this.contractApplyMessage.taxratecode = this.selectInfo.taxrate[i].id;
                       this.activeTaxrate = [{
                           id: this.selectInfo.taxrate[i].id,
                           text: this.selectInfo.taxrate[i].text
                       }];
                       return;
                   }
               }
               this.onConApplyMessageChange.emit(this.contractApplyMessage);
           }else{
            //如果不存在税率，则默认赋值
            if(!this.contractApplyMessage.taxratecode){

                this.getDefaultTaxratecode();//赋值默认的税率

                this.contractApplyMessage.taxratename = this.selectInfo.taxrate[6].text;
                    this.contractApplyMessage.taxratecode = this.selectInfo.taxrate[6].id;
                    this.activeTaxrate = [{
                        id: this.selectInfo.taxrate[6].id,
                        text: this.selectInfo.taxrate[6].text
                    }];
            }
            this.onConApplyMessageChange.emit(this.contractApplyMessage);
        }
        })

        this.shareDataService.getCurrentUserInfo().then(data => {//获取登录人信息
            this.bizdivision=data.SYBMC;
        })
        this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
            this.selectInfo.deliveryLocation=data.location;
            this.selectInfo.deliveryCondition=data.condition;
            this.selectInfo.deliveryPeople=data.people;
        })

        //获取付款条款列表
        this.getPayList();
    }

    public getTemplate(e) {//获取模板返回
        console.log("模板数据");
        console.log(e);
        let self=this;
        let judgeCallback=function(){//判断核心后的操作
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
            self.contractApplyMessage.TemplateID = e[0];
            self.contractApplyMessage.companycode = templateDate[2];
            self.contractApplyMessage.company = templateDate[3];
            self.contractApplyMessage.vendorno = templateDate[5];
            self.contractApplyMessage.vendor = templateDate[4];
            self.contractApplyMessage.taxrate = templateDate[8];
            self.contractApplyMessage.taxratecode = templateDate[6];
            self.contractApplyMessage.taxratename = templateDate[7];
            self.contractApplyMessage.currency = templateDate[9];
            self.contractApplyMessage.currencycode = templateDate[10];
            self.contractApplyMessage.factory = templateDate[11];
            self.contractApplyMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr="请输入"+self.contractApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示
            self.processChange();
            self.judgeIsTenStart();
            // self.homeAbroadRateSet(false);
            self.onConApplyMessageChange.emit(self.contractApplyMessage); 
        }
        this.judgeSupplier(e[5],e[11],judgeCallback,"selectTpl");
        this.paymentAndDelivery.companycode= e[2];//保存公司代码
        this.paymentAndDelivery.vendorcode=e[5];//保存供应商代码
        this.getPaymentAndDeliveryFormModel();//根据模板数据的变化获取付款条款和交货条件
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
                        this.contractApplyMessage.paymenttermscode = data.Data.paymenttermscode;
                        this.contractApplyMessage.paymentterms = element.Content;
                        this.onConApplyMessageChange.emit(this.contractApplyMessage);//异步请求慢于后续操作 需再返回一次
                      }
                  });
               }

               //获取交货条件
               if(data.Data.internationaltradeterms&&data.Data.internationaltradelocation&&this.contractApplyMessage.VendorCountry==1){
                this.copyAbroadData(this.contractApplyMessage.VendorCountry,data.Data.internationaltradeterms,data.Data.internationaltradelocation,null,false,true);
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
        this.contractApplyMessage.companycode = e[1];
        this.factoryPlaceStr="请输入"+this.contractApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示 修改
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
        this.onCompanyCodeChange.emit(this.contractApplyMessage.companycode);
    }
    factoryCheck(e) {//工厂格式校验
        if(e==""){
            return;
        }
        this.contractApplyMessage.factory = this.contractApplyMessage.factory.toUpperCase();
        let endOne = this.contractApplyMessage.factory.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            if(endOne!="AA" && endOne!="A1"){
                this.windowService.alert({ message: '工厂输入有误，请检查', type: 'fail' });
                this.contractApplyMessage.factory="";
                return;
            }
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.contractApplyMessage.companycode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.contractApplyMessage.factory="";
                return;
            }
        }
        let self=this;
        let judgeCallback=function(){
            self.onConApplyMessageChange.emit(self.contractApplyMessage);
            self.processChange();
        }
        this.judgeSupplier(this.contractApplyMessage.vendorno,this.contractApplyMessage.factory,judgeCallback,"selectFactory");
    }
    VendorChange(e) {//供应商选中
        console.log(e);
        let self=this;
        let judgeCallback=function(){
            self.contractApplyMessage.vendor = e[0];//供应商
            self.contractApplyMessage.vendorno = e[1];
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
                        self.contractApplyMessage.currency = self.selectInfo.currency[i]["text"];
                        self.contractApplyMessage.currencycode = e[3];
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
                                self.contractApplyMessage.paymenttermscode = e[5];
                                self.contractApplyMessage.paymentterms = paymentList[i]["Content"];
                                self.onConApplyMessageChange.emit(self.contractApplyMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.copyAbroadData(e[6],e[7],e[8],null,false,true);
            self.contractApplyMessage.VendorCountry = e[6];//国内外
            self.homeAbroadRateSet(true);
            self.processChange();
            self.judgeIsTenStart();
            self.onIsRMBChange.emit(self.isRMB);
            self.onConApplyMessageChange.emit(self.contractApplyMessage);
        }
        this.judgeSupplier(e[1],this.contractApplyMessage.factory,judgeCallback,"selectVendor");
    }
    checkVendorbizscope(e) {//验证对方业务范围
        if(e==""){//为空不校验
            return;
        }
        if (e.substring(2, 4) != "01") {
            this.windowService.alert({ message: '请检查业务范围，按‘XX01’格式填写', type: 'warn' });
        }
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.contractApplyMessage.taxrate = this.selectInfo.taxrate[i].other;
            }
        }
        this.contractApplyMessage.taxratename = e.text;
        this.contractApplyMessage.taxratecode = e.id;
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }

    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.contractApplyMessage.currency = e.text;
        this.contractApplyMessage.currencycode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    getLocation(e){//国际贸易地点选择
        this.contractApplyMessage.internationaltradelocation=e.text;
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    getCondition(e){//国际贸易条件选择
        this.contractApplyMessage.internationaltradeterms=e.id;
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    getReceiverPeople(e){//收货人选择
        this.contractApplyMessage.receiver=e.id;
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.contractApplyMessage.paymenttermscode=e[0];
        this.contractApplyMessage.paymentterms=e[1];
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    clickIsHaveContractInfo(e){//是否提交合同用印 选择
        if(String(e)=="true"){
            this.contractApplyMessage.IsHaveContractInfo=Boolean(1);
        }else{
            this.contractApplyMessage.IsHaveContractInfo=Boolean(0);
        }
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
        this.onHaveContractInfoChange.emit(this.contractApplyMessage.IsHaveContractInfo);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if(e==""){//为空不校验
            return;
        }
        let name="tracenoF";
        if(this.contractApplyForm.controls[name].invalid){//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.contractApplyMessage.traceno="";
            return;
        }
        this.contractApplyMessage.traceno = this.contractApplyMessage.traceno.toUpperCase();//转大写
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    sendData() {//返回数据
        this.onConApplyMessageChange.emit(this.contractApplyMessage);
    }
    toAddSupplier(){//跳转 添加供应商页面
        window.open(dbomsPath+'supplier/edit-supplier-ncs/0');
    }
    processChange(){//更改流程
        this.facVendData.factory = this.contractApplyMessage.factory;
        this.facVendData.vendorno = this.contractApplyMessage.vendorno;
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
                    self.contractApplyMessage.factory="";
                    break;
                case "selectVendor":    
                    self.contractApplyMessage.vendor="";
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

                        //如果供应商的前两位为10
                        if(venStr&&venStr.substring(0,2)==='10'){
                           this.contractApplyMessage.VendorTrace=null;
                           this.onVendorTraceChange.emit(this.contractApplyMessage.VendorTrace);
                        }else{
                            this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                                if (data.Result) {
                                    this.contractApplyMessage.VendorTrace=data.Data;
                                    console.log(this.contractApplyMessage.VendorTrace);
                                    this.onVendorTraceChange.emit(this.contractApplyMessage.VendorTrace);
                                }
                            })
                        }                        
                    }else{
                        this.contractApplyMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.contractApplyMessage.VendorTrace);
                    }
                    this.onSupplierTypeChange.emit(this.supplierType);
                    if(typeof callback === "function"){
                        callback();
                    }
                }else{
                    this.windowService.alert({ message:data.Message, type: 'success' });
                    resetFillIn();
                }
            })
        }else {
            //无确定值 供应商是否过期为Null
            this.contractApplyMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.contractApplyMessage.VendorTrace);
            if(typeof callback === "function"){
                callback();//此时没判断核心 执行后续获取值等操作
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
                            this.contractApplyMessage.internationaltradeterms=this.selectInfo.deliveryCondition[i]["id"];
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
                            this.contractApplyMessage.internationaltradelocation=this.selectInfo.deliveryLocation[i]["text"];
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
                            this.contractApplyMessage.receiver=this.selectInfo.deliveryPeople[i]["id"];
                        }
                    }
                }
            }
        }
    }
    homeAbroadRateSet(direct){//供应商国外改变时 税率的选项变化
        // direct-表示是直接选择供应商
        if (this.contractApplyMessage.VendorCountry == 1) {//国外
            this.activeTaxrate = [{
                id: this.taxrateAllData.abroad[0]["id"],
                text: this.taxrateAllData.abroad[0]["text"]
            }];
            this.contractApplyMessage.taxrate = this.taxrateAllData.abroad[0]["other"];
            this.contractApplyMessage.taxratecode = this.taxrateAllData.abroad[0]["id"];
            this.contractApplyMessage.taxratename = this.taxrateAllData.abroad[0]["text"];
            this.taxrateDisabled = true;
        } else {//0-国内
            this.selectInfo.taxrate = this.taxrateAllData.domestic;
            if(this.contractApplyMessage.taxrate==0 && direct){//如果是J0 则置空
                this.activeTaxrate = [{
                    id: "",text: ""
                }];
                this.contractApplyMessage.taxrate = null;
                this.contractApplyMessage.taxratecode = "";
                this.contractApplyMessage.taxratename = "";
            }
            this.taxrateDisabled = false;
        }
    }
    judgeIsTenStart(){//供应商代码 是否10开头 判断
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.contractApplyMessage.vendorno));
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
               this.contractApplyMessage.SendType=JSON.stringify([e]);
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

               this.activeTaxrate = [{
                id: element.id,
                text: element.text
            }];
            this.contractApplyMessage.taxrate = element.other;
            this.contractApplyMessage.taxratecode = element.id;
            this.contractApplyMessage.taxratename = element.text;

            }
        });
       }

}