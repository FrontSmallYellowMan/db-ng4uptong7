import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Person } from "app/shared/services/index";

import { DbWfviewComponent } from "app/shared/index";
import { dbomsPath, environment,APIAddress } from "environments/environment";

import { DCGPromiseService,CommitmentData,AttachmentList,DCGIData,ApprovaData } from "../../../services/DCGPromised.service";

declare var window;

@Component({
  selector: 'edit-dcg-aprovaldetail',
  templateUrl: 'edit-DCG-promised-approvalDetail.component.html',
  styleUrls:['edit-DCG-promised-approvalDetail.component.scss','../../../scss/promised.component.scss']
})

export class EditDCGApprovalDetailComponent implements OnInit {

  DCGIData:DCGIData=new DCGIData();//实例化请求字段
  commitmentData:CommitmentData=new CommitmentData();//实例化承诺申请表单字段
  attachmentList:AttachmentList=new AttachmentList();//实例化承诺申请附件列表
  approveData:ApprovaData=new ApprovaData();//保存审批所需字段
  
  isApproval: boolean = false; //是否允许提交审批
  isShowApprovalButton: boolean = false; //是否显示审批按钮
  taskState: string; //是否审批 0:未审批，1:已审批
  ADP: string; //是否加签
  myApplyOrMyApproval:string;//保存状态，是“我的申请(a)”,是“我的审批(e)”
  commitTypesList: any[] = []; //多条承诺类型存储列表
  commitTypeClassAndDay: any={ Class: '',Code: '',Name: '',LongDay: ''}; //承诺分类及最长承诺的天数,数据格式为,例{class:'单据类',longDay:7}

  wfHistory: any = []; //保存审批历史记录
  wfviewData: any; //保存流程全景图


  constructor(
    private windowService: WindowService,
    private aRouter: ActivatedRoute,
    private router: Router,
    private DCGPromiseService:DCGPromiseService
  ) { }

  @ViewChild("wfView") public wfView: DbWfviewComponent;

  ngOnInit() { 

    this.getRoutePromised();//获取路由参数

  }

  //获取路由参数
  getRoutePromised(){
    this.aRouter.paramMap.subscribe(data=>{

      if(data.has('id')){
        this.myApplyOrMyApproval=data.get('id').substring(0,1);//保存审批状态，我的申请（a），我的审批（e）
        this.commitmentData.ApplyID=data.get("id").substring(1);//保存申请编号
        this.aRouter.queryParamMap.subscribe(data=>{//获取查询参数
          this.taskState=data.has('TS')?'1':'0';//获取审批状态（0：未审批），（1：已审批）
          this.ADP = data.has('ADP')?'1':'0';// 是否为加签审批（1：是，0：不是）
          this.approveData.taskid = data.has('taskid')?data.get('taskid'):'';//保存taskid
        });

        //获得详情
        this.getDetail(this.commitmentData.ApplyID);
      }

    });
  }

  //获取详情数据
  getDetail(applyID){
    this.DCGPromiseService.getDetail({ApplyID:applyID}).then(data=>{
      if(data.Result){
        this.commitmentData=JSON.parse(data.Data).CommitmentApply;//赋值主字段
        this.DCGIData.AttachmentList=JSON.parse(data.Data).AttachmentList;//保存附件list
        
        if(this.commitmentData.CommitTypesJSON){//如果存在多条承诺类型 
          this.commitTypesList=JSON.parse(this.commitmentData.CommitTypesJSON);//
        }

        console.log(this.commitmentData);

        //获取审批历史记录和流程全景图
        this.getApprovalHistroyAndView();

        //将申请编号赋值到审批字段
        this.approveData.applyid=this.commitmentData.ApplyID;

      }

    });
  }


  //获取审批历史记录和流程全景图
  getApprovalHistroyAndView(){
    this.DCGPromiseService.getApprovalHistroyAndView({ApplyID:this.commitmentData.ApplyID}).then(data=>{
      
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory;//保存审批历史记录

        if (this.wfHistory.length > 0 && this.wfHistory[0].approveresult === '驳回') {//增加申请人的审批节点
          this.wfviewData = [{ IsAlready: false, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//如果审批历史记录里的第一条数据为“驳回”，表示最后一次操作为“驳回”操作，那么全景区的申请人状态为“未提交”
        } else {
          this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//否则，全景图申请人状态为“已完成”
        }

        //this.wfviewData=[{IsAlready:true,IsShow:true,NodeName:"申请人"},...JSON.parse(data.Data).wfProgress];
         this.wfView.onInitData(this.wfviewData);
      }

    });
  }

  //是否允许审批
  onApproval(e) {
    this.isApproval = true;
  }

  //审批成功的回调函数
  writeStorage(){
    localStorage.setItem("DCGPromised","approval");//保存标示，用来确认是否触发列表的刷新
    //this.router.navigate(['supplier/edit-supplier-ssd/',this.supplierData.vendorid]); 
  }


//查看已上传的附件
  seeFileUpLoad(url){
    window.open(APIAddress+url);
  }

  //关闭
  cancle() {
    window.close();
  }

  //撤销审批
  revokeApproval(){
    this.DCGPromiseService.revokeCommitmentApproval({ApplyID:this.commitmentData.ApplyID}).then(data=>{
      if(data.Result){
        this.windowService.alert({message:"撤销成功",type:"success"}).subscribe(()=>{
          localStorage.setItem("DCGPromised", "revoke"); //写入localstorage，用来确认是否触发列表的刷新
          window.close();
        });
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    });
  }


}