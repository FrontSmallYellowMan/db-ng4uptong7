import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute,Router } from "@angular/router";
import { Person } from 'app/shared/services/index';
import { DbWfviewComponent } from 'app/shared/index';
import { dbomsPath,environment,APIAddress } from "environments/environment";

import { SupplierService,SupplierData,ApproveData } from "../../services/supplier.service";
//import { Route } from '@angular/router/src/config';

declare var window;

@Component({
  selector: 'edit-supplier-as',
  templateUrl: 'edit-supplier-approvalSupplier.html',
  styleUrls:['edit-supplier-approvalSupplier.scss','../../scss/supplier.component.scss']
})

export class EditSupplierApprovalSupplier implements OnInit {

  supplierData:SupplierData=new SupplierData();
  approveData:ApproveData=new ApproveData();
  companyAndCode:string;//用来保存公司名称和代码
  companyAndCodeList:any;//用来保存公司列表

  mySupplierRouterType:string;//获取路由传来的值，判断是“我的申请”还是“我的审批”

  isApproval:boolean=false;//是否允许提交审批
  isShowApprovalButton:boolean=false;//是否显示审批按钮
  taskState:string;//是否审批 0:未审批，1:已审批
  ADP:string;//是否加签

  wfHistory:any=[];//保存审批历史记录
  wfviewData:any;//保存流程全景图

  constructor(
    private windowService:WindowService,
    private aRouter:ActivatedRoute,
    private supplierService:SupplierService,
    private router:Router
  ) { }

  @ViewChild('wfView') public wfView: DbWfviewComponent;

  ngOnInit() {
  
    //获取路由里的值
    this.aRouter.paramMap.subscribe(params => {
      
          if(params.has('id')){
            this.getSupplierDetail(params.get('id'));//根据id请求接口，获取详情页面的数据
          }
            
          });
   }

   //根据从路由传来的值，获取详情页的数据
  getSupplierDetail(Id) {

    this.approveData.ID=Id.substring(1,Id.indexOf('*'));//保存供应商id
    this.approveData.actionType=Id.substr(-1,1);//保存供应商的状态，（1：新建供应商，2：修改供应商）
    this.mySupplierRouterType=Id.substring(0,1);//用来判断是“我的申请（a）”还是”我的审批(e)“

    if(this.mySupplierRouterType==="e"){//表示是我的审批
      this.isShowApprovalButton=true;
     }

     this.getRouterUrlValue(this.approveData.ID);//获取路由传来的值，赋值给审批所需字段

     this.supplierService.getSupplierDetail({'vendorid':this.approveData.ID}).then(data=>{
      if(data.success){
        this.supplierData=data.data;
        this.supplierData.addtime=this.supplierData.addtime.substr(0,this.supplierData.addtime.indexOf("T"));//截取时间
        console.log(this.supplierData.addtime);
        this.companyAndCode=this.supplierData.companycode+" "+this.supplierData.company;
        
        this.getApproveData();//获取审批相关数据
        this.getApprovalHistory();//获取审批历史记录
        this.getPanorama();//获取审批全景图    
        
        console.log(this.supplierData.AccessoryList);
      }
    });


    // if(Id!="0"){
    
    //   let vendorid=Id.substring(1);//获取主键Id
    //   this.mySupplierRouterType=Id.substring(0,1);//用来判断是“我的申请（a）”还是”我的审批(e)“
    //   if(this.mySupplierRouterType==="e"){//表示是我的审批
    //    this.isShowApprovalButton=true;
    //   }
    
    //   this.getRouterUrlValue(vendorid);//获取路由传来的值，赋值给审批所需字段

    //   this.supplierService.getSupplierDetail({'vendorid':vendorid}).then(data=>{
    //     if(data.success){
    //       this.supplierData=data.data;
    //       this.supplierData.addtime=this.supplierData.addtime.substr(0,this.supplierData.addtime.indexOf("T"));//截取时间
    //       console.log(this.supplierData.addtime);
    //       this.companyAndCode=this.supplierData.companycode+" "+this.supplierData.company;
          
    //       this.getApproveData();//获取审批相关数据
    //       this.getApprovalHistory();//获取审批历史记录
    //       this.getPanorama();//获取审批全景图    
          
    //       console.log(this.supplierData.AccessoryList);
    //     }
    //   });
    // }
  }

  //查看已上传的附件
  seeFileUpLoad(url){
    window.open(APIAddress+url);
  }

  //获取审批操作所需的数据
  getApproveData(){
   
  }

  //获取路由里传来的参数，赋值给审批所需字段
  getRouterUrlValue(vendorid){

    this.aRouter.queryParamMap.subscribe(data=>{
      if(data){
        this.approveData.apiUrl_AR="/common/approve";//同意，驳回接口地址
      this.approveData.apiUrl_Sign="/common/addtask";//加签审批接口
      this.approveData.apiUrl="common/approveaddtask";//被加签人审批接口地址
      this.approveData.apiUrl_Transfer="common/addtransfertask";//转办审批接口

      this.approveData.nodeid=data.has('nodeid')?data.get('nodeid'):'';//保存路由中的nodeid
      this.approveData.instanceid=data.has('instanceid')?data.get('instanceid'):'';//保存路有中的instanceid
      this.approveData.taskid=data.has('taskid')?data.get('taskid'):'';//保存路由中的taskid
      this.taskState=data.has('TS')?'1':'0'//保存审批状态，0:未处理，1:已处理
      this.ADP=data.has('ADP')?'1':'0'//是否为加签审批,0：不是加签，1：加签
      }
    });

    // let routerUrl = window.location.search;//获取地址栏的链接
    // let parameterUrl = routerUrl.split("&"); //分割链接字符串，以获取链接里的值
    
    // if(parameterUrl.length===1){//如果数组中只有一个元素，表示是”我的申请“的详情页
    //   this.approveData.ID=vendorid;
    //   this.approveData.actionType=parameterUrl[0].substr(-1,1);
    // }

    //console.log(parameterUrl);   
    // if (parameterUrl.length>1) {//表示是“我的审批”的详情页

    //   this.approveData.apiUrl_AR="/common/approve";//同意，驳回接口地址
    //   this.approveData.apiUrl_Sign="/common/addtask";//加签审批接口
    //   this.approveData.apiUrl="common/approveaddtask";//被加签人审批接口地址
    //   this.approveData.apiUrl_Transfer="common/addtransfertask";//转办审批接口

    //   this.approveData.ID=vendorid;
    //   this.approveData.nodeid = parameterUrl[0].substr(-1, 1);//保存链接中的nodeID 
    //   this.approveData.taskid =  parameterUrl[1].substring(parameterUrl[1].indexOf("=") + 1);//保存链接中的TaskId
    //   this.approveData.instanceid = parameterUrl[2].substring(parameterUrl[2].indexOf("=") + 1);//保存instanceid
    //   this.approveData.actionType = parameterUrl[3].substring(parameterUrl[3].indexOf("=") + 1);//appcate
    //   this.taskState=parameterUrl[4].substring(parameterUrl[4].indexOf("=") + 1);//保存审批状态，0:未处理，1:已处理
    //   this.ADP=parameterUrl[5].substring(parameterUrl[5].indexOf("=") + 1);//是否为加签审批 
    // }
  }

  //写入供应商分类
  writeSupplierType(e){

    console.log(e);
    this.approveData.classnamecode=this.supplierData.classnamecode;//将供应商分类字段的值赋值给审批请求字段

    if(this.ADP!="1"){

      if(!this.approveData.classnamecode&&e.approvertype==="Approval"){
        this.isApproval=false;
        this.windowService.alert({message:"请选择供应商分类",type:"fail"});
        return;
      }else{
        this.isApproval=true;
      }
    }else{
      this.isApproval=true;
    }
    
  }

  //审批成功的回调函数
  writeStorage(){
    localStorage.setItem("editFinsh","approval");//保存标示，用来确认是否触发列表的刷新
    //this.router.navigate(['supplier/edit-supplier-ssd/',this.supplierData.vendorid]); 
  }
  
  //审批成功提示框弹出后的回调函数
  routerSupplierDetail(e){
    //this.router.navigate(['supplier/edit-supplier-ssd/',this.supplierData.vendorid]); 
    if(e==='Reject') return;
    window.open(dbomsPath+`supplier/edit-supplier-ssd/${this.supplierData.vendorid}`);

  }


  //获取审批历史记录
  getApprovalHistory(){
    this.supplierService.getHistory(this.approveData).then(data=>{
      if(data.success){
        this.wfHistory=data.data;
      }
    });
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

  //关闭
  cancle(){
    window.close();
  }



}