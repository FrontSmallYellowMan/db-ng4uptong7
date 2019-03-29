import { Component, OnInit, ViewChild } from '@angular/core';
import { WindowService } from "app/core";
import { Observable } from 'rxjs/Observable';
import { dbomsPath, environment } from "environments/environment";
import { Person } from 'app/shared/services/index';
import { ActivatedRoute,Router } from "@angular/router";
import { NgForm } from '@angular/forms';

import { SupplierService, SupplierData, AccessoryList,ApproveData,IsEditResData } from "../../services/supplier.service";
import { SupplierTest } from "./edit-supplier-newCreateSupplier-test";
import { PinYinZiDian } from "./PinYinZiDian";

declare var window;

@Component({
  selector: 'edit-supplier-ncs',
  templateUrl: 'edit-supplier-newCreatSupplier.component.html',
  styleUrls: ['edit-supplier-newCreatSupplier.component.scss', '../../scss/supplier.component.scss']
})

export class EditSupplierNewCreatSupplier implements OnInit {

  pageTitle:string="新建供应商申请";//页面title

  userInfo = new Person();// 登录人头像
  supplierData: SupplierData = new SupplierData(); //初始化基础数据
  oldSupplierData:any;//用来保存变化之前的表单数据，已在提交时做比对
  accessoryList: AccessoryList = new AccessoryList();//初始化上传附件数组
  pyzd: PinYinZiDian = new PinYinZiDian();//初始化拼音字典
  supplierTest:SupplierTest=new SupplierTest();//初始化验证验证详情是否完全一样
  isEditResData:IsEditResData=new IsEditResData();//是否允许编辑页面的请求参数

  personInfo: any;//用来保存申请人的基本信息
  selectSYBMC: string;//用来保存选择的本部事业部
  companyAndCode: any;//用来保存公司代码和公司名称
  currencyAndCode: any = "";//用来币种代码和币种名称
  currencyAndCodeList: any;//用来保存获取到的币种列表
  bankcountryAndCode: any = "";//用来保存银行国别代码和国别名称
  paymenttermsAndCode: any = "";//用来保存付款条款代码和条款名称

  alreadyfilelUpLoadList: any[] = [];//用来保存上传过的附件列表
  filelUpLoadList: any[] = [];//用来保存新上传的附件列表

  searchDept: string;//保存获取的本部信息，用作事业部的查询条件

  upFileApiLink: string;//用来保存上传附件的接口地址

  supplierApprovalPerson: any = [{userID: "tianya", userEN: "tianyinga", userCN: "田颖"},{ userID: "erss", userEN: "erss", userCN: "耳杉杉" }];//保存供应商主数据审批岗  

  isSubmit: boolean;//是否点击了提交按钮

  isChangeSupplier:boolean;//标示是否为修改供应商
  isNewChangeSupplierState:string;////判断是否是新建供应商修改，如果是，则调用新建供应商详情接口，查询详情，值为（new:新建修改供应商,edit:编辑供应商）

  oldVendor:string;//保存从详情获取的供应商名称，用来在修改供应商时，比对两次输入是否相同，如果不同则请求接口检查供应商名称是否重复
  
  wfHistory:any[]=[];//保存审批历史记录
  actionType:string;//保存供应商的类型（1：新建供应商，2：修改供应商）

  constructor(
    private supplierService: SupplierService,
    private windowService: WindowService,
    private aRouter: ActivatedRoute,
    private router:Router
  ) { }

  @ViewChild('form') public form: NgForm;

  ngOnInit() {
    this.getPerson();//获取登录人的基本信息
    this.getCurrency();//获取币种基础数据    
    this.getApprovalNodeinit();//获取审批节点信息初始化
    this.getSupplierApprovalPerson();//获取供应商主数据审批岗审批人

    //根据路由传来的值获取相应的数据
    this.aRouter.params.subscribe(params => {
      
      //在获取路由参数时，验证是否可以编辑
      if(params.id!='0'){
        this.isEditResData.RecordID=params.id;//保存路由参数到请求id
        this.testIsEdit(params.id);
      }

      //根据路由里的参数判断，是编辑暂存供应商，还是修改供应商
      this.getRouterValue(params.id);
      this.gitFileUpLoadUrl();//生成上传附件地址
    });

  }

  //验证页面是否可以编辑
  testIsEdit(Id){  
    this.supplierService.isEdit(this.isEditResData).then(data=>{
      if(data.Result){
        switch(data.Data){
          case '0':
            //不可编辑
            this.windowService.alert({message:"页面不可编辑",type:"fail"}).subscribe(()=>{
            window.close();
            window.open(dbomsPath+'supplier/supplier-mApply/a');
              //this.router.navigate(['supplier/supplier-mApply','a']);
            });
            break;
          case '1':
            //可以编辑
            break;
          case '2':
            //页面不存在
            this.windowService.alert({message:"所访问的页面不存在",type:"fail"}).subscribe(()=>{
              //this.router.navigate(['supplier/supplier-mApply','a']);
              window.close();
            window.open(dbomsPath+'supplier/supplier-mApply/a');
            });
        }
      }
    });
  }

  //获取路由参数的值，判断是编辑暂存供应商，还是修改供应商
  getRouterValue(Id) {

    this.aRouter.queryParamMap.subscribe(data=>{
      if(data){
        this.isChangeSupplier=data.has('supplierchange');
        this.isNewChangeSupplierState=data.has('state')?data.get('state'):'edit';
      }
    });

    //let url = window.location.search;//获取链接地址
   // let paramsArray = url.split("&");
    // let isNewChangeSupplierState;//判断是否是新建供应商修改，如果是，则调用新建供应商详情接口，查询详情
    //console.log(paramsArray);
    // if(paramsArray[0]){
    //   this.isChangeSupplier = paramsArray[0].substring(paramsArray[0].indexOf("=") + 1); 
    //   paramsArray[1]?this.isNewChangeSupplierState=paramsArray[1].substring(paramsArray[1].indexOf("=") + 1):this.isNewChangeSupplierState='edit';//如果存在状态字段，则截取相应的值
    // }
    if (Id != "0") {
      if(this.isChangeSupplier&&this.isNewChangeSupplierState==='new'){//如果isChangeSupplier为真，且状态为新建修改供应商
        this.pageTitle="新建修改供应商申请";
        this.actionType='1';
        this.newCreatSupplierDetail(Id);      
      }else if(this.isChangeSupplier&&this.isNewChangeSupplierState==='edit'){//如果isChangeSupplier为真，且状态为编辑修改供应商
        this.pageTitle="修改供应商申请";
        this.actionType='2';
        this.changeSupplierDetail(Id);
      }else{//否则为新建供应商详情
        this.actionType='1';
        this.newCreatSupplierDetail(Id);
      }
      this.getApprovalHistory(Id);//获取审批历史记录
    }
  }

  //获取人员基本信息
  getPerson() {
    let user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {//获取登录人头像信息
      this.userInfo["userID"] = user["ITCode"];
      this.userInfo["userEN"] = user["ITCode"].toLocaleLowerCase();
      this.userInfo["userCN"] = user["UserName"];

      this.supplierData.itcode=this.userInfo["userEN"].toLocaleLowerCase();
      this.supplierData.username=this.userInfo["userCN"];

    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }
    //请求数据接口，查询登录人的相关信息
    this.supplierService.getPersonInformation().then((data) => {
      this.personInfo = data;//赋值给绑定字段
      if (data.Result) {//如果存在基本信息，则将信息存入
        this.supplierData.BBMC  = JSON.parse(data.Data).BBMC;
        this.supplierData.SYBMC = JSON.parse(data.Data).SYBMC;
        //console.log(this.supplierData.SYBMC);
      }
    });

    //请求接口，查询登陆人的联系方式
    this.supplierService.getPersonPhone().then((data) => {
      if (data.Result) {
        this.supplierData.phone = data.Data;
      }
    });

  }

  //获取本部和事业部
  getSYBMC(e) {
    this.supplierData.SYBMC = e[1];
  }

  //调用接口获取公司代码和公司名称
  getCompany(e) {
    this.supplierData.company = e[0];//保存公司名称
    this.supplierData.companycode = e[1];//保存公司代码
    this.companyAndCode = `${[e[1]]}  ${[e[0]]}`;//将公司名称和代码组合绑定到视图显示
    //console.log(this.supplierData.company, this.supplierData.companycode, this.companyAndCode, e);
  }

  //调用接口获取币种
  getCurrency() {
    this.supplierService.getCurrency().then((data) => {
      if (data.Result) {
        this.currencyAndCodeList = JSON.parse(data.Data);
        //console.log(this.currencyAndCode);
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }

  //获取选择的币种
  getCurrencySelect(currencyAndCode) {
    let reg: RegExp = /[\u4e00-\u9fa5]/;
    //console.log(currencyAndCode);
    this.supplierData.currency = currencyAndCode.substring(currencyAndCode.search(reg));
    //console.log(this.supplierData.currency);
    this.supplierData.currencycode = currencyAndCode.substring(0, currencyAndCode.search(reg));
  }

  //获取供应商类别
  getVendorcountry(vendorcountry){
    if(vendorcountry==='0'){
      this.bankcountryAndCode = "CN 中国";this.supplierData.bankcountrycode = "CN";this.supplierData.bankcountry = "中国";
      this.currencyAndCode = "RMB人民币";this.supplierData.currency = "人民币";this.supplierData.currencycode = "RMB";
    }
  }

  //银行国别名称和代码
  getBankcountry(e) {
    this.bankcountryAndCode = e[0] + " " + e[1];
    this.supplierData.bankcountrycode = e[0];
    this.supplierData.bankcountry = e[1];

    if (this.supplierData.bankcountrycode === "CN") {
      this.currencyAndCode = "RMB人民币";
      this.supplierData.currency = "人民币";
      this.supplierData.currencycode = "RMB";
    }
    //this.supplierData.bankcountrycode === "CN" ? this.currencyAndCode = "RMB人民币" : this.currencyAndCode = "";   
  }

  //获取付款条款代码和名称
  getPaymenttermsAndCode(e) {
    //console.log(e);
    this.supplierData.paymenttermscode = e[0];
    this.supplierData.paymentterms = e[1];
    this.paymenttermsAndCode = e[0] + " " + e[1];
  }

  //获取国际贸易条件
  getInternationaltradeterms(e) {
    this.supplierData.internationaltradeterms = e[1] + e[0];
  }

  //生成上传附件地址
  gitFileUpLoadUrl() {
    let user = JSON.parse(localStorage.getItem("UserInfo"));
    let userItcode = user["ITCode"].toLocaleLowerCase();//获取申请人的Itcode
    if(this.isChangeSupplier){
    this.upFileApiLink = environment.server + "vendor/uploadfile/2_" + userItcode;//用来保存上传附件的接口地址     
    }else{
      this.upFileApiLink = environment.server + "vendor/uploadfile/1_" + userItcode;//用来保存上传附件的接口地址
    }
  }

  //如果从路由获取的Id,并请求数据库获取新建供应商详情
  newCreatSupplierDetail(Id) {
    this.supplierService.getSupplierDetail({ vendorid: Id }).then(data => {
      if(data.success){
        
        //将原始供应商数据存入变量
        this.oldSupplierData=JSON.stringify(data.data);
        this.getDetail(data.data);//获取详情，并赋值绑定字段
      }
    });
  }

  //如果从路由获取的Id,并请求数据库获取修改供应商详情
  changeSupplierDetail(Id) {
    this.supplierService.changeSuppliergetDetail(Id).then(data => {
       if(data.success){
        this.oldSupplierData=JSON.stringify(data.data.Vendor);//保存数据到修改前数据
        this.getDetail(data.data.VendorModify);//获取详情，并赋值绑定字段
       }
      
    });
  }

  //获取详情，并赋值给绑定字段
  getDetail(data){
    console.log(data);
      this.supplierData = data;
      this.oldVendor=data.vendor;//保存初始供应商名称
      
      this.companyAndCode = this.supplierData.companycode ? this.supplierData.companycode + " " + this.supplierData.company : "";//保存公司名称和代码到绑定字段
      this.bankcountryAndCode = this.supplierData.bankcountrycode ? this.supplierData.bankcountrycode + " " + this.supplierData.bankcountry : "";//保存银行国别名称和代码到绑定字段
      this.paymenttermsAndCode = this.supplierData.paymenttermscode ? this.supplierData.paymenttermscode + " " + this.supplierData.paymentterms : "";//保存付款条款和代码到绑定字段
      this.currencyAndCode = this.supplierData.currencycode ? this.supplierData.currencycode + this.supplierData.currency : "";//保存币种到名称和代码到绑定字段
      this.supplierData.AccessoryList===null?this.supplierData.AccessoryList=[]:this.supplierData.AccessoryList=this.supplierData.AccessoryList;//如果附件列表为null，转换为空数组
      
    if (this.isNewChangeSupplierState==='edit') {//如果为编辑供应商
      this.userInfo["userID"] = this.supplierData.itcode;
      this.userInfo["userEN"] = this.supplierData.itcode.toLocaleLowerCase();
      this.userInfo["userCN"] = this.supplierData.username;
    }

    if(this.isNewChangeSupplierState==="new"){//如果为新建修改供应商，则重新获取申请人的信息
      this.getPerson();
    }

      //console.log(this.currencyAndCode);
      if (this.supplierData.AccessoryList.length > 0) {//如果存在已上传的附件列表
        this.alreadyfilelUpLoadList = JSON.parse(JSON.stringify(this.supplierData.AccessoryList));//将已上传的附件列表存入新的变量中
        this.supplierData.AccessoryList = [];//将原来保存上传列表的字段清空，以备再次提交时保存上传附件列表
        this.alreadyfilelUpLoadList.forEach(item => {//遍历新保存的已上传附件列表字段，添加name属性，用来附件上传组件显示名称
          item['name'] = item.AccName;
        });
        //console.log(this.supplierData.AccessoryList);
      };
  }

  //提交和暂存
  save(type) {
    
    this.supplierData.AccessoryList = [...this.alreadyfilelUpLoadList, ...this.filelUpLoadList];//合并上传附件数组
    //this.formatString();//格式化字符串，去除空格
    //console.log(this.supplierData);
    this.supplierData.wfstatus = type;//申请状态

    if (this.isChangeSupplier) {
      if(type==='0'){
        this.changeSupplierTempSave();//暂存修改供应商
      }else{
        this.isSubmit = true;
        this.changeSupplierSubmitData();//提交修改供应商
      }
    }else{
      //新建供应商的提交和暂存
      if (type === '0') {
        this.tempSave();//暂存
      } else {
        this.isSubmit = true;
        this.submitData();//提交
      }
    }
  }

  //取消
  cancle() {
    window.close();
  }

  //暂存
  tempSave(){
    this.supplierService.supplierSave(this.supplierData).then((data) => {

      if (data.success) {
        //data.data.Id?this.supplierData.vendorid = data.data.Id:this.supplierData.vendorid=null;        
        this.tempSaveSuccess(data.data);//成功的提示消息
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
        return;
      }

    });
  }

  //新建供应商提交
  submitData(){

    if(this.supplierData.AccessoryList.length===0){
      //console.log(this.supplierData.AccessoryList);
      this.windowService.alert({message:"请至少上传一份附件",type:"fail"});
      return;
    }

    if (this.form.invalid) {
      this.windowService.alert({ message: "请检查所有必填项，是否填写错误或者为空", type: "fail" });
      return;
    } else {

      //格式化提交参数
      this.formatSupplierData();

      //请求接口
      this.saveSubmitData();
    }
  }

  //新建供应商提交表单的保存数据接口
  saveSubmitData(){
    this.supplierService.supplierSave(this.supplierData).then(data => {
      if (data.success) {
        this.windowService.alert({ message: "提交成功", type: "success" }).subscribe(()=>{
         localStorage.setItem("editFinsh","submit");//保存标示，用来确认是否触发列表的刷新   
         window.close();//关闭窗口        
        });    
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
        return;
      }
      //console.log(data);
    });
  }

  //暂存成功的提示
  tempSaveSuccess(data){
    if (data) {
      this.supplierData.vendorid = data.Id;
      this.windowService.alert({ message: "保存成功", type: "success" }).subscribe(()=>{
         localStorage.setItem("editFinsh","tempSave");//保存标示，用来确认是否触发列表的刷新
        window.close();//关闭窗口    
      });
      return;
    } else {
      this.windowService.alert({ message: "更新成功", type: "success" }).subscribe(()=>{
         localStorage.setItem("editFinsh","tempSave"+0);//保存标示，用来确认是否触发列表的刷新
        window.close();//关闭窗口    
      });
      return;
    }
  }

  //修改供应商暂存
  changeSupplierTempSave(){
    this.isNewChangeSupplierState==="new"?this.supplierData.InstanceId="":this.supplierData.InstanceId=this.supplierData.InstanceId;
    this.supplierService.changeSupplierTempSave(this.supplierData).then(data=>{
      if (data.success) {
        this.tempSaveSuccess(data.data);//成功的提示消息
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
        return;
      }
    });
  }

  //修改供应商提交
  changeSupplierSubmitData(){

    if(this.supplierData.AccessoryList.length===0){
      //console.log(this.supplierData.AccessoryList);
      this.windowService.alert({message:"请至少上传一份附件",type:"fail"});
      return;
    }

    if(this.supplierTest.testDatailIsSame(this.oldSupplierData,this.supplierData)){
      this.windowService.alert({message:"供应商信息和修改前相同，不允许提交！",type:"fail"});
      return;
    }

    if (this.form.invalid) {
      this.windowService.alert({ message: "请检查所有必填项，是否填写错误或着为空", type: "fail" });
      return;
    } else { 
      this.formatSupplierData();//格式化提交参数      
      this.changeSupplierSaveSubmitData();//请求接口
    }
  }

  //修改供应商提交表单的保存数据接口
  changeSupplierSaveSubmitData(){
    this.isNewChangeSupplierState==="new"?this.supplierData.InstanceId="":this.supplierData.InstanceId=this.supplierData.InstanceId;//如果为新建供应商修改，则InstanceId为“”
    this.supplierData.modifyid=this.supplierData.modifyid?this.supplierData.modifyid:"-1";//如果存在modifyid则存入，没有则赋值为“0”  
  
    

    this.supplierService.changeSupplierTempSave(this.supplierData).then(data => {
      if (data.success) {
        this.windowService.alert({ message: "提交成功", type: "success" }).subscribe(()=>{
          // this.supplierData.vendorid = data.data.Id;
          localStorage.setItem("editFinsh","submit");//保存标示，用来确认是否触发列表的刷新
         window.close();//关闭窗口
      
        });     
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
        return;
      }
    });
  }

  //上传附件成功的回调函数
  fileUploadSuccess(e) {
    if(e.success){
      this.accessoryList = e.data;
      this.filelUpLoadList.push(this.accessoryList);
      console.log(this.filelUpLoadList);
    }else{
      this.windowService.alert({message:e.message,type:"fail"});
    } 
  }

  //删除上传附件的回调函数
  deleteUploadFile(e){
    //console.log(this.filelUpLoadList.length);
    if(this.filelUpLoadList.length!=0&&this.alreadyfilelUpLoadList.length!==0){
      this.filelUpLoadList.splice(Math.abs(e-(this.alreadyfilelUpLoadList.length)),1);
    }else if(this.filelUpLoadList.length!==0&&this.alreadyfilelUpLoadList.length===0){
      this.filelUpLoadList.splice(e,1);
    }
    // console.log(e);
    // console.log(this.filelUpLoadList);
  }

  //获取供应商名称的拼音首字母
  getIndexesPinYin(vendor) {

    if (vendor) {
      let cnReg: RegExp = /^[\u4e00-\u9fa5]$/;//中文正则
      let enReg: RegExp = /^[a-zA-Z0-9]$/;//英文正则
      let pinYinFirst: any = [];//用来存储转换的字符串

      [].forEach.call(vendor, (element) => {//遍历字符串

        if (element.search(cnReg) != -1) {//如果为中文
          let uni = element.charCodeAt(0);
          pinYinFirst.push(this.pyzd.PinYinfirstletter.charAt(uni - 19968));
        } else if (element.search(enReg) != -1) {//如果为英文        
          pinYinFirst.push(element.toLocaleUpperCase());
        }

      });

      this.supplierData.SearchWord = pinYinFirst.join("").slice(0, 6);//截取转化后的拼音首字母的前6位
      if(this.isChangeSupplier&&this.oldVendor!=this.supplierData.vendor){
        this.searchSupplierName(vendor);//查询接口，是否存在相同名称的供应商
      }else if(!this.isChangeSupplier&&this.supplierData.wfstatus===undefined){
        this.searchSupplierName(vendor);//查询接口，是否存在相同名称的供应商
      }else if(!this.isChangeSupplier&&this.supplierData.wfstatus==='0'&&this.oldVendor!=this.supplierData.vendor){
        this.searchSupplierName(vendor);//查询接口，是否存在相同名称的供应商
      }
      
    }

  }

  //格式化供应商名称
  formatString() {
    this.supplierData.vendor = this.supplierData.vendor ? this.supplierData.vendor.replace(/(^\s*)|(\s*$)/g, "") : "";
    //console.log(this.supplierData.vendor);
    this.supplierData.registeredaddress = this.supplierData.registeredaddress ? this.supplierData.registeredaddress.replace(/(^\s*)|(\s*$)/g, "") : "";
  }

  //请求接口查询供应商名称是否重复
  searchSupplierName(vendor) {
    if(!vendor) return;
    let searchStatus: boolean;
    vendor=vendor.replace(/[\/\s<>%*+#]*/g,"");//过滤特殊字符
   // console.log(vendor);
    this.supplierService.searchSupplierData(vendor).then(data => {
      if (data.success) {
        if (data.data) {
          this.windowService.alert({ message: "供应商名称已存在，请重新输入", type: "fail" });
          this.supplierData.vendor = "";
        }
      }
    });
  }

  //格式化银行账户
  formatSupplierData():void{
    let bankCard:RegExp=/[\s-]*/g;
    let bankaccount=this.supplierData.bankaccount;
    this.supplierData.bankaccount=bankaccount.replace(bankCard,'');
  }

  //获取审批结点初始化信息
  getApprovalNodeinit(){
    let WFCategory="供应商管理";
    this.supplierService.getApprovalNodeInit({WFCategory:WFCategory}).then(data=>{
     if(data.success){
       this.supplierData.WFApproveUserJSON=data.data;
       //console.log(WFCategory,this.supplierData.WFApproveUserJSON);
     }
    });
  }

  //判断是否上传附件
  isFileUpLoad(){
    if(this.filelUpLoadList.length===0){
      //console.log(this.filelUpLoadList);
      this.windowService.alert({message:"请至少上传一份附件",type:"fail"});
      return;
    }
  }

  //获取供应商主数据审批岗
  getSupplierApprovalPerson(){
    this.supplierService.getSupplierApprovalPerson().then(data=>{
      if(data.success){
        let arr=[];
        for(let key in data.data.WFUser){
          arr.push({ userID: key.toLocaleLowerCase(), userEN: key.toLocaleLowerCase(), userCN: data.data.WFUser[key]});
        }
        
        this.supplierApprovalPerson=arr;
        
      }
    })
  }

  //获取审批历史记录
  getApprovalHistory(ID){

    this.supplierService.getHistory({ID:ID,actionType:this.actionType}).then(data=>{
      if(data.success){
        this.wfHistory=data.data;
      }
    });
   // console.log(this.approveData);
  }



}