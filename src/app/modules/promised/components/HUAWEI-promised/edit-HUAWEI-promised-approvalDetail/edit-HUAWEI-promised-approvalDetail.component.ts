import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Person } from "app/shared/services/index";
import { DbWfviewComponent } from "app/shared/index";
import { dbomsPath, environment,APIAddress } from "environments/environment";

import {
  HUAWEIPrommisedService,
  HUAWEIFormData,
  CommitmentApplyData,
  ApprovaData
} from "../../../services/HUAWEIPromised.service";

declare var window;

@Component({
  selector: "edit-huawei-approvaldetail",
  templateUrl: "edit-HUAWEI-promised-approvalDetail.component.html",
  styleUrls: [
    "edit-HUAWEI-promised-approvalDetail.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class EditHUAWEIApprovalDetailComponent implements OnInit {
  HUAWEIData: HUAWEIFormData = new HUAWEIFormData(); //实例化请求参数
  commitmentData: CommitmentApplyData = new CommitmentApplyData(); //实例化表单对象
  approveData: ApprovaData=new ApprovaData(); //保存审批所需字段

  myApplyOrMyApproval: string; //保存状态，是“我的申请(a)”,是“我的审批(e)”

  isApproval: boolean = false; //是否允许提交审批
  isShowApprovalButton: boolean = false; //是否显示审批按钮
  taskState: string; //是否审批 0:未审批，1:已审批
  ADP: string; //是否加签

  wfHistory: any = []; //保存审批历史记录
  wfviewData: any; //保存流程全景图

  formData: any; //临时变量

  constructor(
    private windowService: WindowService,
    private aRouter: ActivatedRoute,
    private router: Router,
    private HUAWEIPrommisedService: HUAWEIPrommisedService
  ) {}

  @ViewChild("wfView") public wfView: DbWfviewComponent;

  ngOnInit() {
    
    //获取路由参数
    this.getRouter();
  }

  //获取路由ID
  getRouter(){
    this.aRouter.paramMap.subscribe(data => {
      if (data.has("id")) {
        this.myApplyOrMyApproval = data.get("id").substring(0, 1); //保存标识
        this.commitmentData.ApplyID = data.get("id").substring(1); //保存申请编号
       
        //获取路由的查询参数
        if (this.myApplyOrMyApproval === "e") {
          this.isShowApprovalButton=true;
          this.getRouterQueryPromise();
        }else{
          this.isShowApprovalButton=false;
        }

        //获得详情
        this.getDetail(this.commitmentData.ApplyID);

        //获取审批历史记录和审批流程全景图
        this.getApprHistoryAndProgress(this.commitmentData.ApplyID);

        //将申请编号存入审批请求参数
        this.approveData.applyid=this.commitmentData.ApplyID;

      }
    });
  }

  //获路由的查询参数
  getRouterQueryPromise() {
    this.aRouter.queryParamMap.subscribe(data => {
      if(data){
        this.taskState=data.has('TS')?'1':'0';
        this.ADP = data.has('ADP')?'1':'0';//获取是否加签
        this.approveData.taskid = data.get('taskid');// 保存taskid

      }
    });
  }

  //获得详情
  getDetail(ApplyID){
    this.HUAWEIPrommisedService.getDetail({ApplyID:ApplyID}).then(data=>{
      
      if(data.Result){
        this.HUAWEIData=JSON.parse(data.Data);
        this.commitmentData=this.HUAWEIData.CommitmentApply;
        //console.log(this.HUAWEIData);
        
      }
    });
  }


  //获得审批历史记录和审批流程全景图
  getApprHistoryAndProgress(ApplyID){
    this.HUAWEIPrommisedService.getApprHistoryAndProgress({'ApplyID':ApplyID}).then(data=>{
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory.reverse();
        if (this.wfHistory.length > 0 && this.wfHistory[0].approveresult === '驳回') {//增加申请人的审批节点
          this.wfviewData = [{ IsAlready: false, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//如果审批历史记录里的第一条数据为“驳回”，表示最后一次操作为“驳回”操作，那么全景区的申请人状态为“未提交”
        } else {
          this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//否则，全景图申请人状态为“已完成”
        }

        //this.wfviewData=[{IsAlready:false,IsShow:true,NodeName:"申请人"},...JSON.parse(data.Data).wfProgress];
         this.wfView.onInitData(this.wfviewData);
      }
    });
  }

  //是否允许审批
  onApproval(e) {
    this.approveData.Fksfqrdd=this.HUAWEIData.CommitmentApply.Fksfqrdd;
    this.isApproval = true;
  }

  //审批成功的回调函数
  writeStorage() {
    localStorage.setItem("HUAWEIPromised", "approval"); //保存标示，用来确认是否触发列表的刷新
    //this.router.navigate(['supplier/edit-supplier-ssd/',this.supplierData.vendorid]);
  }

  //查看已上传的附件
  seeFileUpLoad(url) {
    window.open(APIAddress + url);
  }

  //撤销审批
  revokeApproval(){
    this.HUAWEIPrommisedService.RevokeApproval({ApplyID:this.commitmentData.ApplyID}).then(data=>{
      if(data.Result){
        this.windowService.alert({message:"撤销成功",type:"success"}).subscribe(()=>{
          localStorage.setItem("HUAWEIPromised", "revoke"); //写入localstorage，用来确认是否触发列表的刷新
          window.close();
        });
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    })
  }

  //关闭
  cancle() {
    window.close();
  }
}
