import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Person } from "app/shared/services/index";
import { DbWfviewComponent } from "app/shared/index";
import { dbomsPath, environment,APIAddress } from "environments/environment";

import { HUAWEIFormData,HUAWEIPrommisedService,CommitmentApplyData } from "../../../services/HUAWEIPromised.service";
import { element } from "protractor";

declare var window;

@Component({
  selector: 'edit-HUAWEI-trackDetail',
  templateUrl: 'edit-HUAWEI-promised-trackDetail.component.html',
  styleUrls:['edit-HUAWEI-promised-trackDetail.component.scss','../../../scss/promised.component.scss']
})

export class EditHUAWEITrackDetailComponent implements OnInit {
  
  HUAWEIData:HUAWEIFormData=new HUAWEIFormData();
  commitmentData: CommitmentApplyData = new CommitmentApplyData(); //实例化表单对象

  isShowApprovalButton: boolean = false; //是否显示审批按钮
  taskState: string; //是否审批 0:未审批，1:已审批
  ADP: string; //是否加签

  myApplyOrMyApproval: string; //获取详情类型标识，是“承诺跟进(t)”
  alertContent:string;//保存点击按钮后的提示内容
  isDisabled:boolean;//是否允许点击按钮

  constructor(
    private windowService: WindowService,
    private aRouter: ActivatedRoute,
    private router: Router,
    private HUAWEIPrommisedService:HUAWEIPrommisedService
  ) { }

  @ViewChild("wfView") public wfView: DbWfviewComponent;

  ngOnInit() {
    
    //获取路由参数
    this.aRouter.paramMap.subscribe(data=>{
      if(data.has('id')){
        this.commitmentData.ApplyID=data.get('id').substring(1);//获取申请编号
        this.myApplyOrMyApproval=data.get('id').substring(0,1);//获取详情类型标识
        this.getDetail(this.commitmentData.ApplyID);
      }
    });
    
   }

   //获得详情
   getDetail(ApplyID){
     this.HUAWEIPrommisedService.getDetail({ApplyID:ApplyID}).then(data=>{
      if(data.Result){
        this.HUAWEIData=JSON.parse(data.Data);
        console.log(this.HUAWEIData);
        this.commitmentData=this.HUAWEIData.CommitmentApply;
        //console.log(this.HUAWEIData);
        
        //如果承诺状态为冻结则达成按钮不可点击
        this.isDisabled=this.commitmentData.ReachStatus==='冻结'?true:false;

      }
     });
   }
 
   //获得当前登录人的itcode和name
   getReachPerson(){
    const user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {
      // 获取登录人头像信息
      this.commitmentData.ReachITCode = user["ITCode"].toLocaleLowerCase();
      this.commitmentData.ReachName =user["UserName"];
    }
   }


  //审批成功的回调函数
  writeStorage(){
    localStorage.setItem("HUAWEIPromised","reach");//保存标示，用来确认是否触发列表的刷新
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

  //执行“特批达成”，“冻结”，“解除冻结”的操作
  getReachState(state) {

    //获取承诺达成确认人
    this.getReachPerson();

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
    this.reach(this.alertContent);//调用保存接口
  }

  //执行“达成承诺”的操作
  onReach(){
    
    //获取承诺达成确认人
    this.getReachPerson();
    
    const AlertContent="承诺已达成";//承诺达成的提示消息

   if(!this.commitmentData.ReachDate){
     this.windowService.alert({message:"请选择承诺达成时间",type:"fail"});
     return;
   }

   //如果存在子类型列表
   if(this.HUAWEIData.CommitmentTypeDetailedList.length>0){

    if(this.HUAWEIData.CommitmentTypeDetailedList.some(item=>item.isChecked)){
      this.HUAWEIData.CommitmentTypeDetailedList.forEach(element=>{
        element.IsDacheng=element.isChecked?'是':'否';
      });
      this.reach(AlertContent);
    }else{
      this.windowService.alert({message:"请选择已达成的承诺类型",type:"fail"});
    }
   }else{
    this.commitmentData.CommitCodeIsReach = '是';
    this.commitmentData.ReachStatus = "已达成";
    this.reach(AlertContent);
   }
   
   
  }

  //保存接口调用
  reach(alertContent){
    this.HUAWEIPrommisedService.trackReach(this.HUAWEIData).then(data=>{
      if(data.Result){
        this.windowService.alert({message:`操作成功，${alertContent}`,type:'success'}).subscribe(()=>{
          this.writeStorage();
          window.close();  
        });
      }else{
        this.windowService.alert({message:data.Message,type:'fail'});
      }
    });
  }


}