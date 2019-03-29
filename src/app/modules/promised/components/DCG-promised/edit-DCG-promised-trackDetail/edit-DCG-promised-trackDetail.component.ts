import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Person } from "app/shared/services/index";

import { dbomsPath, environment,APIAddress } from "environments/environment";
import {
  DCGPromiseService,
  CommitmentData,
  AttachmentList,
  DCGIData,
  ApprovaData
} from "../../../services/DCGPromised.service";

declare var window;

@Component({
  selector: "edit-DCG-trackDetail",
  templateUrl: "edit-DCG-promised-trackDetail.component.html",
  styleUrls: [
    "edit-DCG-promised-trackDetail.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class EditDCGTrackDetailComponent implements OnInit {
  DCGIData: DCGIData = new DCGIData(); //实例化请求字段
  commitmentData: CommitmentData = new CommitmentData(); //实例化承诺申请表单字段
  approveData: ApprovaData = new ApprovaData(); //保存审批所需字段
  attachmentList: any[] = []; //申请附件列表

  commitTypesList: any[] = []; //多承诺类型列表

  alertContent:string;//保存不同承诺状态的提示信息
  isDisabled:boolean=false;//按钮是否允许点击

  myTrack: string; //保存状态跟踪状态

  constructor(
    private DCGPromiseService: DCGPromiseService,
    private windowService: WindowService,
    private aRouter: ActivatedRoute
  ) {}

  ngOnInit() {
    //获取路由参数
    this.getRoutePromised();
  }

  //获取路由参数
  getRoutePromised() {
    this.aRouter.paramMap.subscribe(data => {
      if (data.has("id")) {
        this.myTrack = data.get("id").substring(0, 1); //保存代表承诺跟进标识
        this.commitmentData.ApplyID = data.get("id").substring(1); //保存ApplyId

        //获得详情
        this.getDetail(this.commitmentData.ApplyID);
      }
    });
  }

  //获得详情
  getDetail(applId) {
    this.DCGPromiseService.getDetail({ ApplyID: applId }).then(data => {
     // console.log(JSON.parse(data.Data));
      if (data.Result) {
        this.DCGIData = JSON.parse(data.Data);
        this.commitmentData = this.DCGIData.CommitmentApply; //保存详情主体字段
        this.attachmentList = this.DCGIData.AttachmentList; //保存附件列表

        //如果存在多条承诺类型
        if (this.commitmentData.CommitTypesJSON) {
          this.commitTypesList = JSON.parse(
            this.commitmentData.CommitTypesJSON
          );
        }

        //如果承诺状态为冻结则达成按钮不可点击
        this.isDisabled=this.commitmentData.ReachStatus==='冻结'?true:false;

      }
    });
  }

  //执行“特批达成”，“冻结”，“解除冻结”的操作
  getReachState(state) {
    switch (state) {
      case "是":
        this.commitmentData.CommitCodeIsReach = state;
        this.commitmentData.ReachStatus = "特批达成";
        this.alertContent="该承诺已特批达成";
        break;
      case "冻结":
        this.commitmentData.ReachStatus = state;
        this.alertContent="该承诺已冻结";
        break;
      case "未达成":
        this.commitmentData.ReachStatus = state;
        this.alertContent="该承诺已解除冻结";
        break;
      default:
        break;
    }

    this.commitTypesList.forEach(element => {
      if(element.checked) element.IsReach='是';//将对应的选择项的IsReach字段置为是
    });

    this.commitmentData.CommitTypesJSON=JSON.stringify(this.commitTypesList);

    this.DCGPromiseService.tempSave(this.DCGIData).then(data=>{
      if(data.Result){
        this.windowService.alert({message:`操作成功，${this.alertContent}`,type:'success'}).subscribe(()=>{
          this.writeStorage();
          window.close();  
        });
      }else{
        this.windowService.alert({message:data.Message,type:'fail'});
      }
    });
  }


  //多承诺类型的达成操作
  onReach(){
    console.log(this.commitTypesList);
    if(this.commitTypesList.some(item=>item.checked)){//如果存在选择的承诺类型
      
      this.commitTypesList.forEach(element => {
        if(element.checked) element.IsReach='是';//将对应的选择项的IsReach字段置为是
      });

      this.commitmentData.CommitTypesJSON=JSON.stringify(this.commitTypesList);
      this.DCGPromiseService.tempSave(this.DCGIData).then(data=>{
        //console.log(this.commitmentData);
        if(data.Result){
          this.windowService.alert({message:'操作成功！',type:'success'}).subscribe(()=>{
            //写入localstroage
            this.writeStorage();
            window.close();
          });
        }else{
          this.windowService.alert({message:data.Message,type:'fail'})
        }
      });

    }else{
      this.windowService.alert({message:"还未选择任何承诺类型，不允许达成承诺！",type:'fail'})
    }
   
  }

  //确认达成状态后，写入localStrorage
  writeStorage() {
    localStorage.setItem("DCGPromised", "reach"); //保存标示，用来确认是否触发列表的刷新
  }

  //查看已上传的附件
  seeFileUpLoad(url) {
    window.open(APIAddress + url);
  }

  //关闭
  cancle() {
    window.close();
  }
}
