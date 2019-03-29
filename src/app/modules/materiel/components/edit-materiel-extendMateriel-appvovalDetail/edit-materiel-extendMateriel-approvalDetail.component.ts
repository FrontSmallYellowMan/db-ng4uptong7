import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { dbomsPath, environment } from "environments/environment";
import { WindowService } from "app/core";
import { DbWfviewComponent } from 'app/shared/index';

import { ExtendMaterl, MaterielExtendMaterielService, AddMaterileList, ExtendMaterielDetail, ApproveData } from '../../services/materiel-extendMateriel.service';

//import { element } from 'protractor';

declare var window;

@Component({
  selector: 'edit-em-approvaldetail',
  templateUrl: 'edit-materiel-extendMateriel-approvalDetail.component.html',
  styleUrls: ["edit-materiel-extendMateriel-approvalDetail.component.scss", "../../scss/materiel.component.scss"]
})

export class EditExtendMaterileApprovalDetail implements OnInit {

  extendMaterielDetail: ExtendMaterielDetail = new ExtendMaterielDetail();//详情页数据
  addMaterileList: AddMaterileList = new AddMaterileList();//添加的物料列表
  approveData: ApproveData = new ApproveData();//初始化审批相关基础数据

  extendType: string;
  extendList: any[] = [];

  materileList: string;//用来绑定添加的物料好字符串
  title: string = '编辑';//标题
  isAddingMateriel: boolean;//添加物料，防止重复添加
  factoryValid: boolean;//工厂合法
  hasError: boolean;//提交结果有错误
  hasSubmited: boolean;//已经提交过
  fileUploadApi: string;//文件导入api
  loading: boolean;//加载效果
  codeError: string = "";//物料编号错误信息

  detailType: string;//用来保存详情类型，是我的申请（a），还是我的审批(e)a
  applyName: string;//用来保存获取的申请人姓名
  applyItcode: string;//用来保存获取的申请人itcode
  applyTime: string;//用来保存获取的申请时间

  extendNo: string;//保存扩展物料编号

  isSeeDetail: boolean;//是否能够继续添加，显示或者隐藏提交按钮

  unSubmit: boolean = true;//是否点击提交按钮

  taskState:string;//审批状态
  ADP:string;//是否是加签
  isApproval:boolean=false;//是否允许提交审批
  wfHistory: any = [];//保存审批历史记录
  wfviewData: any;//保存流程全景图

  @ViewChild('form') form: NgForm;
  @ViewChild('wfView') public wfView: DbWfviewComponent;

  constructor(
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute,
    private materielExtendMaterielService: MaterielExtendMaterielService,) { }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe(params => {
      //获取路由中的值
      if (params.get("id") != "0") {

        this.detailType = params.get("id").substring(0, 1);
        this.extendNo =this.approveData.ID= params.get("id").substring(1);//将扩展物料订单号，存入变量

        this.getRouterParams();//获取路由里的所有参数
        this.getApprovalHistory();//获取审批历史记录
        this.getPanorama();//获取审批全景图
        this.getExtendMaterileDetail(this.detailType, this.extendNo);//请求接口，获取详情

      }

    });

  }

  //根据路由参数，请求接口获取详情
  getExtendMaterileDetail(detailType, extendNo) {
    if (detailType == 'a') {
      this.isSeeDetail = false;
    } else {
      this.isSeeDetail = true;
    }

    this.detailInterface();//请求详情接口

  }

  //获取详情接口
  detailInterface() {
    this.loading = true;
    this.materielExtendMaterielService.getMaterielDetail(this.extendNo).then(result => {
      this.loading = false;
      this.extendType = result.data.list[0].ExtendType.toString();
      this.applyName = result.data.list[0].ApplyName;//保存申请人的姓名
      this.applyItcode = result.data.list[0].ApplyItCode;//保存申请人的Itcode
      this.applyTime = result.data.list[0].UpdateTime;//保存申请时间

      this.extendList = result.data.list;
      this.extendList.forEach(item => {
        item.isSucceed = true;
      });
      this.hasSubmited = true;
    })
  }

  //删除该行扩展
  removeExtend(i) {
    if (this.extendList[i].isSucceed) { return };
    this.extendList.splice(i, 1);
    this.hasError = this.extendList.some(item => !item.isSucceed);
  }

  //获取审批历史记录
  getApprovalHistory() {
    this.materielExtendMaterielService.getApprovalHistory(this.approveData).then(data => {
      if (data.success) {
        this.wfHistory = data.data;
      }
    });
  }

  //流程审批全景图
  getPanorama() {
    this.materielExtendMaterielService.getPanoramagram(this.approveData).then(data => {
      if (data.success) {
        console.log(JSON.parse(data.data).wfProgress);
        
        if (this.wfHistory.length > 0 && this.wfHistory[0].approveresult === '驳回') {//增加申请人的审批节点
          this.wfviewData = [{ IsAlready: false, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.data).wfProgress];//如果审批历史记录里的第一条数据为“驳回”，表示最后一次操作为“驳回”操作，那么全景区的申请人状态为“未提交”
        } else {
          this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.data).wfProgress];//否则，全景图申请人状态为“已完成”
        }
        //this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.data).wfProgress];
        this.wfView.onInitData(this.wfviewData);
      }
    });
  }

  //获取路由里的所有参数
  getRouterParams(){
    if(this.detailType==="e"){

      //获取路由里的查询参数
      this.activatedRoute.queryParamMap.subscribe(params=>{
        console.log(params);
        if(params){
          this.approveData.nodeid=params.has('nodeid')?params.get("nodeid"):'';
          this.approveData.taskid=params.has("taskid")?params.get("taskid"):'';
          this.approveData.instanceid=params.has("instanceid")?params.get("instanceid"):'';
          this.taskState=params.has("TS")?'1':'0';
          this.ADP=params.has("ADP")?'1':'0';
          console.log(this.approveData.taskid);
        }
        
      });

    }else{

      //获取路由里的查询参数
      this.activatedRoute.queryParamMap.subscribe(params=>{
        this.approveData.instanceid=params.get("instanceid");
      });

    }   

  }

  //允许审批
  writeSupplierType(){
    this.isApproval=true;
    this.loading=true;
  }

  //审批成功，写入localstorage
  writeStorage(){
    this.loading=false;
    localStorage.setItem("extendMateriel","approval");//保存标示，用来确认是否触发列表的刷新   
  }

  //审批失败后，刷新页面
  refreshPage(){
    this.loading=false;
    this.detailInterface();//重新获取详情
    //window.location.reload();//审批失败后刷新页面
    
  }

  //加签审批成功后的回调函数
  addWariteLocalStorage(){
    localStorage.setItem("extendMateriel","addApproval");//保存标示，用来确认是否触发列表的刷新       
  }

  //取消
  cancel() {
    window.close();
  }
}