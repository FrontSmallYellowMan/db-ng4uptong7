import { Component, OnInit,ViewChild } from '@angular/core';
import { Person } from 'app/shared/services/index';
import { WindowService } from "app/core";
import { dbomsPath,environment,APIAddress } from "environments/environment";
import { ActivatedRoute,Router } from "@angular/router";
import { DbWfviewComponent } from 'app/shared/index';

import { SupplierService,SupplierData,ApproveData } from "../../services/supplier.service";
import { Route } from '@angular/router/src/config';

declare var window;

@Component({
  selector: 'edit-supplier-asc',
  templateUrl: 'edit-supplier-approvalSupplierChange.html',
  styleUrls:["edit-supplier-approvalSupplierChange.scss",'../../scss/supplier.component.scss']
})

export class EditApprovalSupplierChange implements OnInit {

  userInfo = new Person();// 登录人头像
  supplierDetailData:SupplierData=new SupplierData();//供应商详情页数据
  changeSupplierDetailData:SupplierData=new SupplierData();//修改供应商详情页数据
  approveData:ApproveData=new ApproveData();//初始化审批字段

  mySupplierRouterType:string;//获取路由里的id值，判断是“我的申请”，还是“我的审批”

  isApproval:boolean=false;//是否允许提交审批
  taskState:string;//是否审批 0:未审批，1:已审批
  ADP:string;//是否加签

  wfHistory:any=[];//保存审批历史记录
  wfviewData:any;//保存流程全景图
  
  constructor(
    private supplierService:SupplierService,
    private windowService:WindowService,
    private activatedRoute:ActivatedRoute,
    private router:Router

  ) { }

  @ViewChild('wfView') public wfView: DbWfviewComponent;

  ngOnInit() {   
    
    //获取路由Id
    this.activatedRoute.paramMap.subscribe(params => {   
      if(params.has('id')){
        this.getUrl(params.get('id'));//获取地址栏链接里的值
      }
    }); 

  }

  //获取地址栏链接，并取出对应的字段
  getUrl(Id){
    let modifyId:string;//修改Id
    let vendorId:string;//原始Id
    let paramArray:any=[];//用来保存分割后的字符串数组

    this.mySupplierRouterType=Id.substring(0,1);//用来判断是我的申请，还是我的审批，用以区别是否显示审批按钮
    paramArray=Id.split('*');//分割Id数组，取出参数
    modifyId=this.approveData.ID=paramArray[0].substring(1);//保存修改后的供应商id
    vendorId=paramArray[1];//保存供应商id
    this.approveData.actionType=paramArray[2];//保存状态


    this.activatedRoute.queryParamMap.subscribe(data=>{
      if(data){
        this.approveData.apiUrl_AR="/common/approve";//同意，驳回接口地址
        this.approveData.apiUrl_Sign="/common/addtask";//加签审批接口
        this.approveData.apiUrl="common/approveaddtask";//被加签人审批接口地址
        this.approveData.apiUrl_Transfer="common/addtransfertask";//转办审批接口

        this.approveData.nodeid=data.has('nodeid')?data.get('nodeid'):'';
        this.approveData.taskid=data.has('taskid')?data.get('taskid'):'';
        this.approveData.instanceid=data.has('instanceid')?data.get('instanceid'):'';
        this.taskState=data.has('TS')?'1':'0'//保存审批状态，0:未处理，1:已处理
        this.ADP=data.has('ADP')?'1':'0';//是否为加签审批，0：不是，1：是
      }
    })

    this.getSupplierDetail(vendorId);//获取供应商详情
    this.getChangeSupplierDetail(modifyId);//获取修改供应商的详情
    this.getApprovalHistory();//获取审批历史记录
    this.getPanorama();//获取审批全景图 

    // this.mySupplierRouterType=Id.substring(0,1);//用来判断是我的申请，还是我的审批，用以区别是否显示审批按钮
    // let url=window.location.search;
    // let paramsArray:any[]=url.split("&");
    //let modifyId:string;
    //let vendorId:string;


    // if(paramsArray.length===2){//表示是从我的申请跳转来查看修改供应商详情页
    //   this.approveData.ID=modifyId=Id.substring(1); 
    //   vendorId=paramsArray[0].substr(paramsArray[0].indexOf("=")+1);
    //   this.approveData.actionType=paramsArray[1].substr(paramsArray[1].indexOf("=")+1);
    // }

    // if(paramsArray.length>2){//表示从“我的审批”跳转来的修改供应商审批页
    //   modifyId=Id.substring(1);
    //   vendorId=paramsArray[0].substr(paramsArray[0].indexOf("=")+1);

    //   this.approveData.apiUrl_AR="/common/approve";//同意，驳回接口地址
    //   this.approveData.apiUrl_Sign="/common/addtask";//加签审批接口
    //   this.approveData.apiUrl="common/approveaddtask";//被加签人审批接口地址
    //   this.approveData.apiUrl_Transfer="common/addtransfertask";//转办审批接口

    //   this.approveData.ID=modifyId;
    //   this.approveData.nodeid = paramsArray[1].substr(-1, 1);//保存链接中的nodeID 
    //   this.approveData.taskid =  paramsArray[2].substring(paramsArray[2].indexOf("=") + 1);//保存链接中的TaskId
    //   this.approveData.instanceid = paramsArray[3].substring(paramsArray[3].indexOf("=") + 1);//保存instanceid
    //   this.approveData.actionType = paramsArray[4].substring(paramsArray[4].indexOf("=") + 1);//appcate
    //   this.taskState=paramsArray[5].substring(paramsArray[5].indexOf("=") + 1);//保存审批状态，0:未处理，1:已处理
    //   this.ADP=paramsArray[6].substring(paramsArray[6].indexOf("=") + 1);//是否为加签审批 

    // }
    
    // this.getSupplierDetail(vendorId);//获取供应商详情
    // this.getChangeSupplierDetail(modifyId);//获取修改供应商的详情
    // this.getApprovalHistory();//获取审批历史记录
    // this.getPanorama();//获取审批全景图 
  }

  //获取供应商详情
  getSupplierDetail(vendorId){
    this.supplierService.getSupplierDetail({'vendorid':vendorId}).then(data=>{
      if(data.success){
         this.supplierDetailData=data.data;
      }
    });
  }

  //获取修改后的供应商详情
  getChangeSupplierDetail(modifyId){
  this.supplierService.changeSuppliergetDetail(modifyId).then(data=>{
    if(data.success){
      this.changeSupplierDetailData=data.data.VendorModify;
      //this.changeSupplierDetailData.addtime=this.changeSupplierDetailData.addtime.substring(0,this.changeSupplierDetailData.addtime.indexOf("T"));//截取时间
      this.userInfo["userID"] = this.changeSupplierDetailData.itcode;
      this.userInfo["userEN"] = this.changeSupplierDetailData.itcode.toLocaleLowerCase();
      this.userInfo["userCN"] = this.changeSupplierDetailData.username;
    
      console.log(this.changeSupplierDetailData);
      
    }
  });
  }

  //获取审批历史记录
  getApprovalHistory(){
    this.supplierService.getHistory(this.approveData).then(data=>{
      if(data.success){
        this.wfHistory=data.data;
      }
    });
    console.log(this.approveData);
  }

  //流程审批全景图
  getPanorama(){
    this.supplierService.getPanorama(this.approveData).then(data=>{
     if(data.success){
      console.log(JSON.parse(data.data).wfProgress);
      this.wfviewData=[{IsAlready:true,IsShow:true,NodeName:"申请人"},...JSON.parse(data.data).wfProgress];
      this.wfView.onInitData(this.wfviewData);
     }
    });
  }

  //允许审批
  writeSupplierType(){
    this.isApproval=true;
  }

  //审批成功，写入webStorage
  wariteStorage(){
    localStorage.setItem("editFinsh","approval");//保存标示，用来确认是否触发列表的刷新
    //this.router.navigate(['supplier/edit-supplier-ssd/',this.supplierDetailData.vendorid]);
  }
  
  //审批成功提示框弹出后的回调函数
  // routerSupplierDetail(e){
  //   if(e==='Reject') return;
  //   window.open(dbomsPath+`supplier/edit-supplier-ssd/${this.supplierDetailData.vendorid}`)
  // }

  //查看已上传的附件
  seeFileUpLoad(url){
    window.open(APIAddress+url);
  }

  //关闭
  cancel(){
    window.close();
  }

}