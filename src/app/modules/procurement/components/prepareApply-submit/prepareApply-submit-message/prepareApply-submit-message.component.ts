// 预下单采购申请页面-采购信息
import { Component, OnInit,Input, Output, EventEmitter,DoCheck,ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import * as moment from 'moment';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { PrepareApplyMessage } from './../../../services/prepareApply-submit.service';
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareDataService } from './../../../services/share-data.service';
import { ShareMethodService,GetPaymentAndDelivery } from './../../../services/share-method.service';
import { ProcurementTemplateService } from './../../../services/procurement-template.service';

@Component({
    selector: "prepareApply-submit-message",
    templateUrl: 'prepareApply-submit-message.component.html',
    styleUrls: ['prepareApply-submit-message.component.scss','./../../../scss/procurement.scss']
})
export class PrepareApplySubmitMessageComponent implements OnInit {

    paymentAndDelivery:GetPaymentAndDelivery=new GetPaymentAndDelivery();//实例化请求参数

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
    isCopyRate=false;//新建时 复制税率信息
    factoryPlaceStr="";//工厂的输入提示
    preApplyMessage=new PrepareApplyMessage();//采购信息 整体数据
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

    avtiveSendType:any;//绑定的发货方式
    sendTypeList:any=[
        {'id':'0','text':'直发'},
        {'id':'1','text':'非直发'}
    ];//发货方式列表

    paymentProvisionList:any=[];//保存付款条款列表

    defaultTaxratecode:string='JS';//默认税率code

    @ViewChild(NgForm)
    prepareApplyMessage;//表单
    beforePrepareApplyMessageValid;//表单的前一步校验结果

    @Input() set prepareApplyData(data) {
        if (data["purchaserequisitionid"]) {//编辑状态下 读入预下单申请 的整体数据
            for(let key in this.preApplyMessage){//数据拷贝
                this.preApplyMessage[key]=data[key];
            }
            /**
             * 新增字段，按照原逻辑不能读取保存的数据，后续再具体研究原因，
             * 临时采用单独赋值的方式，增加特殊情况说明字段的赋值
             */
            this.preApplyMessage.Remark=data.Remark;
            
            this.avtiveCurrency = [{
                id: this.preApplyMessage.currencycode,
                text: this.preApplyMessage.currency
            }];

            console.log('特殊情况说明',this.preApplyMessage,data);

            //获取发货方式
            if(this.preApplyMessage.SendType){
                this.avtiveSendType=JSON.parse(this.preApplyMessage.SendType);
            } 

            if (this.preApplyMessage.currency == "人民币") {
                this.isRMB = true;
            } else {
                this.isRMB = false;
            }
            this.onIsRMBChange.emit(this.isRMB);
            this.activeTaxrate = [{
                id: this.preApplyMessage.taxratecode,
                text: this.preApplyMessage.taxratename
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

                    this.copyAbroadData(this.preApplyMessage.VendorCountry,this.preApplyMessage.internationaltradeterms,
                        this.preApplyMessage.internationaltradelocation,this.preApplyMessage.receiver,true,false);
                }) 
            }else{
                this.copyAbroadData(this.preApplyMessage.VendorCountry,this.preApplyMessage.internationaltradeterms,
                    this.preApplyMessage.internationaltradelocation,this.preApplyMessage.receiver,true,false);
            }

        
            this.judgeSupplier(this.preApplyMessage.vendorno,this.preApplyMessage.factory,null,"");
            if(this.preApplyMessage.TemplateID){//获取模板名称
                this.procurementTemplateService.getProcurementTplOne(this.preApplyMessage.TemplateID).then(data=>{
                    if(data.Result){
                        this.TemplateName=data.Data.Name;
                    }
                })
            }
            if(this.preApplyMessage.preselldate){
                this.preApplyMessage.preselldate = moment(this.preApplyMessage.preselldate).format("YYYY-MM-DD");
            }
        }else if(window.localStorage.getItem("createPreApplyType")=="hasContract"){//有合同 新建
            let list = JSON.parse(window.localStorage.getItem("prepareContractList"));
            if(list.length==1){//只选 一个合同时 带入信息
                //我方主体
                this.preApplyMessage.company = list[0]["CompanyName"];
                this.preApplyMessage.companycode = list[0]["CompanyCode"];
                this.factoryPlaceStr="请输入"+this.preApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示 修改
                this.onCompanyCodeChange.emit(this.preApplyMessage.companycode);
                //税率
                this.preApplyMessage.taxrate=parseInt(list[0]["taxRate"])/100;//转化税率值
                this.isCopyRate=true;
                //币种
                if (list[0]["CurrencyCode"] == "RMB") {
                    this.isRMB = true;
                } else {
                    this.isRMB = false;
                }
                this.preApplyMessage.currency = list[0]["CurrencyName"];
                this.preApplyMessage.currencycode = list[0]["CurrencyCode"];
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
    @Input() set excludeTaxMoney(data) {//未税总金额
        this.preApplyMessage.excludetaxmoney=data;
    }
    @Input() set taxInclusiveMoney(data) {//含税总金额
        this.preApplyMessage.taxinclusivemoney=data;
    }
    @Input() set foreignCurrencyMoney(data) {//外币总金额
        this.preApplyMessage.foreigncurrencymoney=data;
    }
    @Input() hasContract=true;//表示创建 预下合同的方式：有合同-true；无合同-false
    @Input() totalAmountIsFillin=true;//无合同时 外币总金额 未税总金额 是否可输入标识
    @Output() onPrepareApplyMessageValidChange = new EventEmitter<any>();//当 采购信息表单校验 变化
    @Output() onIsRMBChange = new EventEmitter();//当 是否人民币 变化
    @Output() onSupplierTypeChange = new EventEmitter();//当 供应商类型 变化
    @Output() onFacVendChange = new EventEmitter();//当 工厂代码和供应商代码 变化
    @Output() onPreApplyMessageChange = new EventEmitter();//当 采购信息整体数据 变化
    @Output() onCompanyCodeChange = new EventEmitter();//当 公司代码(我方主体) 变化
    @Output() onVendorTraceChange = new EventEmitter();//当 供应商是否过期变化 变化
    @Output() onAmountMoney = new EventEmitter();//当 未税金额变化时
    @Input() IsHaveContractInfo;//当 是否提交合同用印 变化
    @Output() IsHaveContractInfoChange = new EventEmitter();//当 是否提交合同用印 变化

    constructor(
        private windowService: WindowService,
        private dbHttp: HttpServer,
        private submitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private procurementTemplateService: ProcurementTemplateService,
        private shareMethodService: ShareMethodService
    ) { }
    ngDoCheck() {
        if (this.prepareApplyMessage.valid != this.beforePrepareApplyMessageValid) {//表单校验变化返回
            this.beforePrepareApplyMessageValid = this.prepareApplyMessage.valid;
            this.onPrepareApplyMessageValidChange.emit(this.prepareApplyMessage.valid);
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
            //因为Input 发生在ngOnInit前，所以获取税率列表后 再进行赋值，并且返回信息(onPreApplyMessageChange)
                for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
                    if (this.preApplyMessage.taxrate == this.selectInfo.taxrate[i].other) {
                        this.preApplyMessage.taxratename = this.selectInfo.taxrate[i].text;
                        this.preApplyMessage.taxratecode = this.selectInfo.taxrate[i].id;
                        this.activeTaxrate = [{
                            id: this.selectInfo.taxrate[i].id,
                            text: this.selectInfo.taxrate[i].text
                        }];

                        return;
                    }
                }
                this.onPreApplyMessageChange.emit(this.preApplyMessage);
            }else{
                //如果不存在税率，则默认赋值
                if(!this.preApplyMessage.taxratecode){
                    this.getDefaultTaxratecode();//获取采购申请的默认值
                }
                this.onPreApplyMessageChange.emit(this.preApplyMessage);
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

        //获得付款条款列表
        this.getPayList();
    }

    public getTemplate(e) {//获取模板返回
        console.log("模板数据");
        console.log(e);
        let self=this;
        let judgeCallback=function(){//判断核心后的操作
            let templateDate = e;
            self.TemplateName = e[1];
            console.log(self.TemplateName,e);
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
            self.preApplyMessage.TemplateID = e[0];
            self.preApplyMessage.companycode = templateDate[2];
            self.preApplyMessage.company = templateDate[3];
            self.preApplyMessage.vendorno = templateDate[5];
            self.preApplyMessage.vendor = templateDate[4];
            self.preApplyMessage.taxrate = templateDate[8];
            self.preApplyMessage.taxratecode = templateDate[6];
            self.preApplyMessage.taxratename = templateDate[7];
            self.preApplyMessage.currency = templateDate[9];
            self.preApplyMessage.currencycode = templateDate[10];
            self.preApplyMessage.factory = templateDate[11];
            self.preApplyMessage.VendorCountry = templateDate[16];
            self.factoryPlaceStr="请输入"+self.preApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示
            self.beforeCurrency = templateDate[9];//保存这一步的 币种选择
            if(!self.hasContract && self.totalAmountIsFillin){//无合同 可输入时 重置为0
                self.resetPriceToZero();
            }
            self.processChange();
            self.judgeIsTenStart();
            self.homeAbroadRateSet(false);
            self.onPreApplyMessageChange.emit(self.preApplyMessage);
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
                            this.preApplyMessage.paymenttermscode = data.Data.paymenttermscode;
                            this.preApplyMessage.paymentterms = element.Content;
                            this.onPreApplyMessageChange.emit(this.preApplyMessage);//异步请求慢于后续操作 需再返回一次
                          }
                      });
                   }
    
                   //获取交货条件
                   if(data.Data.internationaltradeterms&&data.Data.internationaltradelocation&&this.preApplyMessage.VendorCountry==1){
                    this.copyAbroadData(this.preApplyMessage.VendorCountry,data.Data.internationaltradeterms,data.Data.internationaltradelocation,null,false,true);
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
        this.preApplyMessage.companycode = e[1];
        this.factoryPlaceStr="请输入"+this.preApplyMessage.companycode.substring(2, 4)+"xx或axxx";//工厂输入提示 修改
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
        this.onCompanyCodeChange.emit(this.preApplyMessage.companycode);
    }
    factoryCheck(e) {//工厂格式校验
        if(e==""){
            return;
        }
        this.preApplyMessage.factory = this.preApplyMessage.factory.toUpperCase();
        let endOne = this.preApplyMessage.factory.substring(0, 2);
        if(endOne[0]=="A"){//以"A"开头
            if(endOne!="AA" && endOne!="A1"){
                this.windowService.alert({ message: '工厂输入有误，请检查', type: 'fail' });
                this.preApplyMessage.factory="";
                return;
            }
        }else{//不是 "AA"或"A1"开头，要检查前两位等于我方主体后两位
            let endTwo = this.preApplyMessage.companycode.substring(2, 4);
            if (endOne != endTwo) {
                this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
                this.preApplyMessage.factory="";
                return;
            }
        }
        let self=this;
        let judgeCallback=function(){
            self.onPreApplyMessageChange.emit(self.preApplyMessage);
            self.processChange();
        }
        this.judgeSupplier(this.preApplyMessage.vendorno,this.preApplyMessage.factory,judgeCallback,"selectFactory");
    }
    VendorChange(e) {//供应商选中
        let self=this;
        let judgeCallback=function(){
            self.preApplyMessage.vendor = e[0];//供应商
            self.preApplyMessage.vendorno = e[1];
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
                        self.preApplyMessage.currency = self.selectInfo.currency[i]["text"];
                        self.preApplyMessage.currencycode = e[3];
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
                                self.preApplyMessage.paymenttermscode = e[5];
                                self.preApplyMessage.paymentterms = paymentList[i]["Content"];
                                self.onPreApplyMessageChange.emit(self.preApplyMessage);//异步请求慢于后续操作 需再返回一次
                                break;
                            }
                       }
                    }
                })
            }
            self.copyAbroadData(e[6],e[7],e[8],null,false,true);
            self.preApplyMessage.VendorCountry = e[6];//国内外
            self.homeAbroadRateSet(true);
            self.processChange();
            self.judgeIsTenStart();
            self.onIsRMBChange.emit(self.isRMB);
            self.onPreApplyMessageChange.emit(self.preApplyMessage);
        }
        this.judgeSupplier(e[1],this.preApplyMessage.factory,judgeCallback,"selectVendor");
    }
    checkVendorbizscope(e) {//验证对方业务范围
        if(e==""){//为空不校验
            return;
        }
        if (e.substring(2, 4) != "01") {
            this.windowService.alert({ message: '请检查业务范围，按‘XX01’格式填写', type: 'warn' });
        }
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    getTaxrate(e) {// 税率选中
        for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
            if (e.id == this.selectInfo.taxrate[i].id) {
                this.preApplyMessage.taxrate = this.selectInfo.taxrate[i].other;
            }
        }
        this.preApplyMessage.taxratename = e.text;
        this.preApplyMessage.taxratecode = e.id;
        if(!this.hasContract && this.totalAmountIsFillin && this.isRMB){//无合同 可输入,是人民币情况
            this.preApplyMessage.taxinclusivemoney = this.preApplyMessage.excludetaxmoney * (1 + this.preApplyMessage.taxrate);//计算含税
        }
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    getCurrency(e) {//币种选择
        if (e.id == "RMB") {
            this.isRMB = true;
        } else {
            this.isRMB = false;
        }
        this.preApplyMessage.currency = e.text;
        this.preApplyMessage.currencycode = e.id;
        this.onIsRMBChange.emit(this.isRMB);
        if(!this.hasContract && this.totalAmountIsFillin){//无合同 可输入
            if(this.preApplyMessage.currency=="人民币"){//人民币 情况
                this.resetPriceToZero();
            }else if(this.beforeCurrency=="人民币"){//外币 情况，上一步是人民币
                this.resetPriceToZero();
            }else{//外币 情况，上一步也是外币
                this.shareMethodService.getRateConvertPrice(this.preApplyMessage.foreigncurrencymoney,this.preApplyMessage.currency)
                .then(data => {//根据最新汇率 计算总额
                    this.preApplyMessage.excludetaxmoney=data;
                    this.preApplyMessage.taxinclusivemoney=data;
                    this.onPreApplyMessageChange.emit(this.preApplyMessage);
                })
            }
            this.beforeCurrency=e.text;
        }else{//其他情况直接返回变化
            this.onPreApplyMessageChange.emit(this.preApplyMessage);
        }
    }
    getOtherMoney(e) {//外币输入后 计算其他金额
        if (!this.preApplyMessage.currency) {
            this.windowService.alert({ message: '请选择币种', type: 'warn' });
        } else {
            this.shareMethodService.getRateConvertPrice(e,this.preApplyMessage.currency)
            .then(data => {//根据最新汇率 计算总额
                this.preApplyMessage.excludetaxmoney=data;
                this.preApplyMessage.taxinclusivemoney=data;
                this.onPreApplyMessageChange.emit(this.preApplyMessage);
            })
        }
    }
    getTaxIncluSiveMoney(e) {//计算 含税总金额
        if (typeof(this.preApplyMessage.taxrate) == "undefined" || this.preApplyMessage.taxrate == null) {
            this.windowService.alert({ message: '请选择税率', type: 'fail' });
        } else {
            this.preApplyMessage.taxinclusivemoney = Number((e * (1 + this.preApplyMessage.taxrate)).toFixed(2));//计算含税
            this.onPreApplyMessageChange.emit(this.preApplyMessage);
            this.onAmountMoney.emit();//用于变更检查，获取流程审批人
        }

    }
    getLocation(e){//国际贸易地点选择
        this.preApplyMessage.internationaltradelocation=e.text;
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    getCondition(e){//国际贸易条件选择
        this.preApplyMessage.internationaltradeterms=e.id;
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    getReceiverPeople(e){//收货人选择
        this.preApplyMessage.receiver=e.id;
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    getPaymenttermsAndCode(e){//付款条款选择
        this.preApplyMessage.paymenttermscode=e[0];
        this.preApplyMessage.paymentterms=e[1];
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    clickIsHaveContractInfo(e){//是否提交合同用印 选择
        if(String(e)=="true"){
            this.preApplyMessage.IsHaveContractInfo=Boolean(1);
        }else{
            this.preApplyMessage.IsHaveContractInfo=Boolean(0);
        }
        //this.onConApplyMessageChange.emit(this.preApplyMessage);
        this.IsHaveContractInfoChange.emit(this.preApplyMessage.IsHaveContractInfo);
    }
    sendtraceno(e) {//输入需求跟踪号后
        if(e==""){//为空不校验
            return;
        }
        let name="tracenoF";
        if(this.prepareApplyMessage.controls[name].invalid){//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            this.preApplyMessage.traceno="";
            return;
        }
        this.preApplyMessage.traceno = this.preApplyMessage.traceno.toUpperCase();//转大写
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    sendData() {//返回数据
        this.onPreApplyMessageChange.emit(this.preApplyMessage);
    }
    toAddSupplier(){//跳转 添加供应商页面
        window.open(dbomsPath+'supplier/edit-supplier-ncs/0');
    }
    processChange(){//更改流程
        this.facVendData.factory = this.preApplyMessage.factory;
        this.facVendData.vendorno = this.preApplyMessage.vendorno;
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
                    self.preApplyMessage.factory="";
                    break;
                case "selectVendor":    
                    self.preApplyMessage.vendor="";
                    break;
            }
            return;
        }
        if (venStr && facStr) {
            this.shareMethodService.judgeSupplierType(facStr,venStr)
            .then(data => {//判断供应商类型
                if (data.Result) {
                    this.supplierType = data.Data;
                    if(this.supplierType=="非核心"){//非核心
                        this.windowService.alert({ message:"预下单不允许选择非核心类型的供应商", type: 'success' });
                        resetFillIn();
                        this.preApplyMessage.VendorTrace=null;
                        this.onVendorTraceChange.emit(this.preApplyMessage.VendorTrace);
                    }else{//核心 或者 新产品
                        this.onSupplierTypeChange.emit(this.supplierType);
                        this.shareMethodService.judgeSupplierOverdue(venStr).then(data => {
                            if (data.Result) {
                                if(data.Data==0&&venStr.substring(0,2)!=='10'){
                                    // 供应商是核心或新产品，但是供应商类型是无效，则按照非核心走采购申请流程,而该申请不允许提交非核心
                                    this.windowService.alert({ message:"供应商类型无效，请创建合同采购申请", type: 'success' });
                                    resetFillIn();
                                    this.preApplyMessage.vendor="";
                                    this.preApplyMessage.VendorTrace=null;
                                    this.onVendorTraceChange.emit(this.preApplyMessage.VendorTrace);
                                }else if(venStr.substring(0,2)==='10'&&data.Data==0){
                                    this.preApplyMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.preApplyMessage.VendorTrace);
                                    if(typeof callback === "function"){
                                        callback();//若不为 "非核心" 执行后续获取值等操作
                                    }
                                }else{
                                    this.preApplyMessage.VendorTrace=data.Data;
                                    this.onVendorTraceChange.emit(this.preApplyMessage.VendorTrace);
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
        }else {
            //无确定值 供应商是否过期为Null
            this.preApplyMessage.VendorTrace=null;
            this.onVendorTraceChange.emit(this.preApplyMessage.VendorTrace);
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
                            this.preApplyMessage.internationaltradeterms=this.selectInfo.deliveryCondition[i]["id"];
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
                            this.preApplyMessage.internationaltradelocation=this.selectInfo.deliveryLocation[i]["text"];
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
                            this.preApplyMessage.receiver=this.selectInfo.deliveryPeople[i]["id"];
                        }
                    }
                }
            }
        }
    }
    homeAbroadRateSet(direct){//供应商国外改变时 税率的选项变化
        // direct-表示是直接选择供应商

        /**
         * 2019-1-14 新增逻辑，去掉供应商为国外，就锁定税率的限制
         */

        this.selectInfo.taxrate = this.taxrateAllData.domestic;
        if(this.preApplyMessage.taxrate==0 && direct){//如果是J0 则置空
            this.activeTaxrate = [{
                id: "",text: ""
            }];
            this.preApplyMessage.taxrate = null;
            this.preApplyMessage.taxratecode = "";
            this.preApplyMessage.taxratename = "";
        }
        this.taxrateDisabled = false;
        
        // 注销原逻辑
        // if (this.preApplyMessage.VendorCountry == 1) {//国外
        //     this.activeTaxrate = [{
        //         id: this.taxrateAllData.abroad[0]["id"],
        //         text: this.taxrateAllData.abroad[0]["text"]
        //     }];
        //     this.preApplyMessage.taxrate = this.taxrateAllData.abroad[0]["other"];
        //     this.preApplyMessage.taxratecode = this.taxrateAllData.abroad[0]["id"];
        //     this.preApplyMessage.taxratename = this.taxrateAllData.abroad[0]["text"];
        //     this.taxrateDisabled = true;
        // } else {//0-国内
        //     this.selectInfo.taxrate = this.taxrateAllData.domestic;
        //     if(this.preApplyMessage.taxrate==0 && direct){//如果是J0 则置空
        //         this.activeTaxrate = [{
        //             id: "",text: ""
        //         }];
        //         this.preApplyMessage.taxrate = null;
        //         this.preApplyMessage.taxratecode = "";
        //         this.preApplyMessage.taxratename = "";
        //     }
        //     this.taxrateDisabled = false;
        // }
    }
    judgeIsTenStart(){//供应商代码 是否10开头 判断
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.preApplyMessage.vendorno));
        if (localvendorno.substring(0, 2) == "10") {
            this.isTenStart = true;
        } else {
            this.isTenStart = false;
        }
    }
    resetPriceToZero(){//重置 外币、未税、含税金额 为零
        this.preApplyMessage.foreigncurrencymoney=0;
        this.preApplyMessage.excludetaxmoney=0;
        this.preApplyMessage.taxinclusivemoney=0;
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
               this.preApplyMessage.SendType=JSON.stringify([e]);
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
               this.preApplyMessage.taxratename=element.text;
               this.preApplyMessage.taxratecode=element.id;
               this.preApplyMessage.taxrate=element.other;
               this.activeTaxrate = [{
                id: element.id,
                text: element.text
            }];
            }
        });
       }
}