import { Component, OnInit, ViewChild } from '@angular/core';
import { WindowService } from "app/core";
import { Observable } from 'rxjs/Observable';
import { dbomsPath, environment } from "environments/environment";
import { Person } from 'app/shared/services/index';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';

import { SupplierTrackService, SupplierTrackData } from "../../services/supplierTrack.service";

declare var window;

@Component({
  selector: 'edit-supplier-nct',
  templateUrl: 'edit-supplier-newCreatTrack.component.html',
  styleUrls: ['edit-supplier-newCreatTrack.component.scss', '../../scss/supplier.component.scss']
})

export class EditSupplierNewCreatTrack implements OnInit {


  public supplierTrackData: SupplierTrackData = new SupplierTrackData;

  public pageTitle: string = '新建供应商跟踪';//页面title
  public userInfo = new Person();// 登录人头像
  public companyAndCode: any;//用来保存公司代码和公司名称
  public isSubmit: boolean = false;//是否点击保存按钮
  public VendorNoAndVendor: string;//用来保存供应商编号和名称
  public isVendorStateInvalid: boolean = false;//用来标识当协议有效期超期时，锁定“供应商状态”的“有效”按钮
  
  constructor(
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute,
    private supplierTrackService: SupplierTrackService
  ) { }

  @ViewChild('form') public form: NgForm;

  ngOnInit() {
    this.getUser();//获取用户基本信息    
    this.getRouterParams();//获取路由参数
  }

  //获取路由参数
  getRouterParams() {
    this.activatedRoute.paramMap.subscribe(params => {
      let trackId = params.get("id");//获取主键参数
      if (trackId != "0") {
        this.supplierTrackData.TrackId = trackId;//保存主键Id      
        this.getDetail(trackId);//获取详情数据
      } else {
        //this.getUser();//获取用户基本信息
      }
    });
  }

  //获取供应商详情
  getDetail(trackId) {
   if(trackId){
    this.supplierTrackService.getDetail(trackId).then(data=>{
      if(data.success){
        //用来获取申请人信息
        this.userInfo["userID"] = data.data.ApplyITCode;
        this.userInfo["userEN"] = data.data.ApplyITCode.toLocaleLowerCase();
        this.userInfo["userCN"] = data.data.ApplyName;

        this.supplierTrackData=data.data;//将详情数据赋值到绑定字段
        this.VendorNoAndVendor=`${this.supplierTrackData.VendorNo} ${this.supplierTrackData.Vendor}`;//将供应商编号和供应商名称组合为绑定字段
        this.isVendorStateInvalid=this.supplierTrackData.VendorState==2?true:false;
      }
    });
   }
  }

  //获取用户基本信息
  getUser() {
    let user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {//获取登录人头像信息
      this.userInfo["userID"] = user["ITCode"];
      this.userInfo["userEN"] = user["ITCode"].toLocaleLowerCase();
      this.userInfo["userCN"] = user["UserName"];

      this.supplierTrackData.ApplyITCode = this.userInfo["userEN"].toLocaleLowerCase();
      this.supplierTrackData.ApplyName = this.userInfo["userCN"];

    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }

    //请求接口，查询登陆人的联系方式
    this.supplierTrackService.getPersonPhone().then((data) => {
      if (data.Result) {
        this.supplierTrackData.TelephoneNumber = data.Data;
      }
    });
  }

  //调用接口获取公司代码和公司名称
  getCompany(e) {
    //this.supplierTrackData.company = e[0];//保存公司名称
    //this.supplierTrackData.CompanyCode = e[1];//保存公司代码
    this.supplierTrackData.CompanyCode = `${[e[1]]}  ${[e[0]]}`;//将公司名称和代码组合绑定到视图显示
    console.log(this.supplierTrackData.CompanyCode);
  }

  //获取用户选择的本部和事业部
  getBBMC(e) {
    this.supplierTrackData.BBMC = e[0];//保存本部
    this.supplierTrackData.SYBMC = e[1];//保存事业部
  }

  //获取供应商和供应商编号
  getVendor(e) {
    this.supplierTrackData.Vendor = e[2];//保存供应商名称
    this.supplierTrackData.VendorNo = e[1];//保存供应商编号
    this.VendorNoAndVendor = `${e[1]} ${e[2]}`;//组合成视图绑定数据 

    this.isSupplierTrack(e[1]);

    if(e[1].substring(0,2)==="20"){//如果供应商编号的前两位为“20”，则供应商类型为“国内”，否则为“海外”
      this.supplierTrackData.VendorType=1;
    }else{
      this.supplierTrackData.VendorType=2;
    }
  }

  //获取协议有效期，用来确定供应商状态
  getAgreementValid(e) {
    if (e) {

      this.supplierTrackData.AutoRenewal = 2;//当选择了新时间时，重置”自动续签“按钮

      let nowDate = new Date();//获取本地时间
      let year:any = nowDate.getFullYear().toString();//获取年
      let month:any = (nowDate.getMonth() + 1).toString();//获取月份

      month=month.length===1?"0"+month:month;

      let AgreementDate: any = e.split("-");//用户选择的协议有效期

      if ((year + month) - (AgreementDate[0] + AgreementDate[1]) > 0 && this.supplierTrackData.VendorState != 2) {
        this.supplierTrackData.VendorState = 2;//供应商状态标识为超期
        this.isVendorStateInvalid = true;//协议有效期超期时，供应商状态的“有效”按钮锁定
        this.windowService.alert({ message: "所选协议有效期小于当前日期，供应商状态设为超期", type: "fail" });
      } else if ((year + month) - (AgreementDate[0] + AgreementDate[1]) > 0 && this.supplierTrackData.VendorState == 2) {
        this.isVendorStateInvalid = true;//协议有效期超期时，供应商状态的“有效”按钮锁定        
      } else {
        this.isVendorStateInvalid = false;//协议有效期没有超期，解除“有效”按钮的锁定
        this.supplierTrackData.VendorState=this.supplierTrackData.VendorState==3?3:1;//当选择时间后，没有超期，且供应商状态不为无效，则将供应商状态设为1
      }

    }
  }

  //当供应商的状态选择为有效时，检查协议有效期是否超期
  inspectTime(){
    if(this.supplierTrackData.VendorState==1&&this.supplierTrackData.ValidityOfAgreement){
      this.getAgreementValid(this.supplierTrackData.ValidityOfAgreement);
    }
  }


  //账期起算点选择非'其他'选项时，重置'其他'文本框的绑定值
  resetPTBText(v) {
    if (v !== "6") {
      this.supplierTrackData.PTBText = null;//将绑定值置为null
    }
  }

  //账期选择非’其他‘选项时，重置’其他‘文本框的绑定值
  resetPTText(v) {
    if (v !== "9") {
      this.supplierTrackData.PTText = null;//将绑定值置为null
    }
  }

  //当点击自动续签时，锁定协议有效期组件，并且附默认值
  lockAgreementValid() {
    this.supplierTrackData.ValidityOfAgreement = "2038-12-31";
    this.supplierTrackData.VendorState=1
  }

  //当选择”是否回佣“为”否“时，重置”回佣方式“为空
  resetRebatesType() {
    this.supplierTrackData.RebatesType = null;
  }

  //验证表单函数
  testForm() {
    let isInvalid: boolean = false;//是否不合法

    if (!this.supplierTrackData.ValidityOfAgreement) {//验证协议有效期是否选择
      isInvalid = true;
    }
    return isInvalid;
  }

  //保存
  save() {
    this.isSubmit = true;

    if (this.form.invalid || this.testForm()) {
      this.windowService.alert({ message: "表单填写有误，请检查后重新提交", type: "fail" });
      return;
    } else {
      this.saveSupplierTrackData();//保存供应商跟踪信息
    }
  }


  //保存供应商跟踪数据
  saveSupplierTrackData() {
    this.supplierTrackService.saveSupplierTrack(this.supplierTrackData).then(data => {
      if (data.success) {

        if (data.data.Flag) {
          if (data.data.Flag === 2) {
            this.windowService.alert({ message: `供应商：“${this.supplierTrackData.Vendor}”，已存在跟踪信息，请在列表中选择`, type: "fail" });
            return;
          } else {
            this.waritLoaclStorage();//保存成功，写入localStorage
          }
        } else {
          this.waritLoaclStorage();//保存成功，写入localStorage
        }

      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }
    });
  }

  //保存成功，写入localstorage，关闭网页
  waritLoaclStorage() {
    this.windowService.alert({ message: "保存成功", type: "success" }).subscribe(() => {
      localStorage.setItem("supplierTrack", "save");//保存标示，用来确认是否触发列表的刷新            
      window.close();
    });
  }

  //关闭
  cancle() {
    window.close();
  }

  //验证供应商是否已经存在跟踪信息
  isSupplierTrack(VendorNo){
    this.supplierTrackService.isSupplierTrack({'VendorNo':VendorNo}).then(data=>{
      if(data.success){
        if(data.data){
          this.windowService.alert({message:"所选供应商的跟踪信息已存在，请返回列表进行编辑操作",type:"fail"});
          this.supplierTrackData.Vendor = ''//重置供应商名称
          this.supplierTrackData.VendorNo = '';//重置供应商编号
          this.VendorNoAndVendor = '';//重置组合成视图绑定数据
          this.supplierTrackData.VendorType=null;//重置供应商分类
        }
        
      }
    });
  }

}