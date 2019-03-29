import { Component, OnInit, ViewChild } from '@angular/core';
import { ScService, AccessList, Access, Seal, PersonInfo } from "../../service/sc-service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "app/core";
import { Person } from 'app/shared/services/index';
import { Headers, RequestOptions } from "@angular/http";
import { DbWfviewComponent } from "../../../../shared/index";
import { PCData, PCApproveData, PcService, AccessItem,contractAddTaskApp, serverAddress } from "../../service/pc-service";
declare var window: any;

@Component({
  selector: 'db-pc-view',
  templateUrl: './pc-view.component.html',
  styleUrls: ['./pc-view.component.scss']
})
export class PcViewComponent implements OnInit {

  constructor(
    private scService: ScService,
    private pcService: PcService,
    private router: Router,
    private routerInfo: ActivatedRoute,
    private windowService: WindowService) { }

  pu_code;
  taskid;
  recordid;
  nodeid;
  adp;
  taskState;
  uploadContractApiUrl;
  uploadChapterApiUrl;
  isAllowRevoke: boolean = false;//是否允许撤回
  formData: PCData = new PCData();//表单数据
  PCApproveData: PCApproveData = new PCApproveData();//表单数据
  sealInfo: Seal = new Seal();// 用印数据
  accessList: AccessList = new AccessList();//附件数据
  userInfo: PersonInfo = new PersonInfo();//人员信息
  accessorySealUrl: any = "";//模板PDF附件制作地址
  localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  isSealRole: boolean = false;//是否印章岗
  isRiskRole: boolean = false;//是否风险岗
  approveUser: any;//审批人
  isRecoveryTxt: string = "";//合同是否回收
  accessListD: Array<any> = [];//双章扫描件
  isAnent: boolean = false;//是否可上传双章扫描件
  isSealView: boolean = false;//是否印章岗回收查看页面
  accessoryStatus: number = 0;//判断当前审批人，附件是否修改
  TaskOpinions: string = "";//印章反原岗审批意见
  showRecoveryTxt: boolean = false;
  sealHasApp: boolean = false;//是否已有印章岗审批
  customerFormData = "";//自定义表单数据
  loading: any = false;
  approveBeforeValid = false;//审批之前验证是否成功
  isClickUploadFile = false;//是否删除或者上传附件
  disabledOutsourcing = false;
  currentApprovalNodeIsSeal = false;//当前审批环节是否是盖章岗

  ngOnInit() {
    this.uploadContractApiUrl = this.scService.uploadSCAccessories(10);
    this.uploadChapterApiUrl = this.scService.uploadSCAccessories(19);
    this.getUrlParams();
    this.getPcData(this.pu_code || this.recordid);
  }

  //获取url参数
  getUrlParams() {
    this.pu_code = this.routerInfo.snapshot.queryParams['pu_code'];
    this.taskid = this.routerInfo.snapshot.queryParams['taskid'];
    this.recordid = this.routerInfo.snapshot.queryParams['recordid'];
    this.nodeid = this.routerInfo.snapshot.queryParams['nodeid'];
    this.adp = this.routerInfo.snapshot.queryParams['ADP'];
    this.taskState = this.routerInfo.snapshot.queryParams['TS'];
    this.appParms.taskid = this.taskid;
    this.adpAppParms.taskid = this.taskid;
    this.initViewByUrlParms();
  }

  //获取合同数据
  getPcData(pu_code) {
    if (pu_code) {
      this.PCApproveData.PUBaseData.PU_Code = pu_code;
      this.loading = true;
      this.pcService.getPUBaseDataByPUCode(pu_code).subscribe(
        data => {
          if (data.Result) {
            this.loading = false;
            this.formData = JSON.parse(data.Data);
            this.getPcDataCallBack(this.formData);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
    } else {
      this.windowService.alert({ message: "pu_code为空，获取数据失败!", type: "fail" });
    }
  }
  //获取合同数据 回调
  getPcDataCallBack(data) {
    this.getWfData();
    // 自定义字段信息
    // this.getBussinessFieldConfig();
    //是否可上传双章扫描件
    if (this.localUserInfo["ITCode"] == data.PUBaseData.AgentITcode) {
      this.isAnent = true;
    }
    //附件信息
    if (data.AccessList) {
      this.PCApproveData.AccessList.AccessoryD = this.accessListD = data.AccessList["AccessoryD"];
    }
    //用印信息
    if (data.PUBaseData.SealInfoJson) {
      let sealData = JSON.parse(data.PUBaseData.SealInfoJson);
      this.sealInfo = sealData;
    }
    //权限确认
    this.approveUser = JSON.parse(this.formData.PUBaseData.WFApproveUserJSON);
    //合同是否回收
    if (this.formData.PUBaseData.IsRecovery === 1) {
      this.disabledOutsourcing = true;
    }
    //当前审批环节
    let currentApprovalNode = [];
    if (this.formData.PUBaseData.CurrentApprovalNode.length > 0) {
      currentApprovalNode = JSON.parse(this.formData.PUBaseData.CurrentApprovalNode);
    }
    currentApprovalNode.forEach(item => {
      if (item["nodename"] && item["nodename"].indexOf("盖章") > 0) {
        this.currentApprovalNodeIsSeal = true;
      }
    });
  }

  //获取个性化字段信息
  getBussinessFieldConfig() {
    let body = {
      "BusinessID": this.formData.PUBaseData.PU_Code,
      "BusinessType": "SalesContract"
    };
    this.scService.getBussinessFieldConfig(body).subscribe(data => {
      if (data.Result) {
        this.customerFormData = JSON.parse(data.Data);
        if (this.customerFormData) {
          let data = this.customerFormData["FieldMsg"];
          if (data.length > 0) {
            data.forEach((item, i) => {
              if (item.FieldShowType == "checkbox") {
                let str = "";
                let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.ischecked === true });
                tempArray.forEach(dataSourceItem => { str += dataSourceItem.text + "," });
                if (str.indexOf(",") != -1)
                  data[i].FieldValue = str.substring(0, str.length - 1);
              }
              if (item.FieldShowType == "select" || item.FieldShowType == "radio") {
                let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.value === item.FieldValue });
                data[i].FieldValue = tempArray[0].text;
              }
            });
          }
        }
      }
    });
  }

  //保存
  onSave(parms?:any){
    this.loading = true;
    if (parms && parms["opType"] != "Reject") {
      // if (this.nodeid == "15" && !this.isView) {//印章岗（回收） 逻辑
      //   if (parms["opType"] == "Agree" && this.accessListD.length == 0) {
      //     this.loading = false;
      //     this.windowService.alert({ message: "请通知申请人上传双章扫描件!", type: "fail" });
      //     return;
      //   }
      //   if (this.formData.PUBaseData.IsRecovery != "0" &&
      //     this.formData.PUBaseData.IsRecovery != "1" &&
      //     this.formData.PUBaseData.IsRecovery != "2") {
      //     this.loading = false;
      //     this.windowService.alert({ message: "请选择合同回收状态!", type: "fail" });
      //     return;
      //   }
      // }
    }
    //采购申请对接过来的数据在印章返原岗不能驳回
    if (parms && parms["opType"] == "Reject" && this.nodeid == "15" && this.formData.PUBaseData.PurchaseApplyCode) {
      this.loading = false;
      this.windowService.alert({ message: "采购申请数据不允许驳回", type: "fail" });
      return;
    }
    this.PCApproveData.PUBaseData.ItCode = this.localUserInfo["ITCode"];
    this.PCApproveData.PUBaseData.UserName =  this.localUserInfo["UserName"];
    this.PCApproveData.PUBaseData.TaskOpinions = this.TaskOpinions;
    this.PCApproveData.PUBaseData.RecoveryTime = this.formData.PUBaseData.RecoveryTime;
    this.PCApproveData.PUBaseData.IsRecovery = this.formData.PUBaseData.IsRecovery;
    if(this.isClickUploadFile){
      this.PCApproveData.AccessList.AccessoryS = this.PCApproveData.AccessList.AccessoryS.concat(this.formData.AccessList["AccessoryS"]);
    }
    if (this.PCApproveData.AccessList.AccessoryD.length == 0) {
      this.PCApproveData.PUBaseData.DeleteStatus = 1;
      this.PCApproveData.PUBaseData.isUploadDoubleChapter = 0;
    }
    this.pcService.updateForApprove(this.PCApproveData).subscribe(data => {
      if (data.Result) {
        this.loading = false;
        if (parms) {
          //印章返原岗 审批操作：同意 合同是否回收：否 流程需停留在当前环节
          // if (this.nodeid == "15" && parms["opType"] == "Agree" && 
          //   (this.formData.PUBaseData.IsRecovery == "0" || this.formData.PUBaseData.IsRecovery == 0)) {
          //   this.windowService.alert({ message: "流程停留在当前环节!", type: "fail" });
          //   setTimeout(function() { window.close(); }, 1000);
          //   return;
          // }
          this.approveBeforeValid = true;
        }else {
          this.windowService.alert({ message: "保存成功", type: "success" });
          setTimeout(function() { window.close(); }, 1000);
        }
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //申请人保存双章扫描件
  agentSave(type){
    if(type && type == "saveChapter"){
      this.windowService.confirm({ message: "附件保存后不可修改，请确认是否保存？" }).subscribe({
        next: (v) => {
          if (v) {
            this.onSave();
          }
        }
      });
    }else{
      this.onSave();
    }
  }
  //撤销
  revoke() {
    let id = this.pu_code || this.recordid;
    this.windowService.confirm({ message: "流程相关数据将删除!" }).subscribe({
      next: (v) => {
        if (v) {
          this.pcService.revokPUApproval(id).subscribe(data => {
            if (data.Result) {
              this.windowService.alert({ message: "成功撤销!", type: "success" });
              this.router.navigate(["/india/pc-apply"], { queryParams: { pu_code: id } });
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          });
        }
      }
    });
  }
  //返回
  onBack() {
    window.close();
  }

  //上传双章扫描件回调
  onFileCallBack(e) {
    this.isClickUploadFile = true;
    this.accessoryStatus = 1;
    this.PCApproveData.PUBaseData.isUploadDoubleChapter = 1;
    this.PCApproveData.AccessList.AccessoryD = this.accessListD = e;
  }

  //附件上传 成功
  fileUploadSuccess(event, type){
    //event = data
    if (event.Result) {
      this.isClickUploadFile = true;
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          let accessItem = new Access();
          accessItem.AccessoryID = item["AccessoryID"];
          accessItem.AccessoryName = item["AccessoryName"];
          accessItem.AccessoryURL = item["AccessoryURL"];
          accessItem.AccessoryType = type;
          accessItem.CreatedByName = this.localUserInfo["UserName"];
          accessItem.CreatedByITcode = this.localUserInfo["ITCode"];
          switch (type) {
            case 10:
              this.PCApproveData.AccessList.AccessoryS.push(accessItem);
              break;
            case 19:
              this.PCApproveData.AccessList.AccessoryD.push(accessItem);
              break;
          }
        });
        //上传成功后调用接口保存数据
        // this.onSave();
      }
    }else{
      this.windowService.alert({ message: event.Message, type: "fail" });
    }
    
  }
  //删除附件
  onDeleteFileItem(event, type) {
    //event = 删除文件的下标
    this.isClickUploadFile = true;
    let item = new Access();
    switch (type) {
      case 10:
        item = this.PCApproveData.AccessList.AccessoryS[event];
        break;
      case 19:
        item = this.PCApproveData.AccessList.AccessoryD[event];
        break;
    }
    if (item.AccessoryID) {
      switch (type) {
        case 10:
          this.PCApproveData.AccessList.AccessoryS.splice(event, 1);
          break;
        case 19:
          this.PCApproveData.AccessList.AccessoryD.splice(event, 1);
          break;
      }
    }
  }
  //点击单个已经上传的附件
  onClickFile(event, type){
    // event = {item: item, index: i}
    let url = "";
    switch (type) {
      case 10:
        url = this.formData.AccessList.AccessoryS[event.index].AccessoryURL;
        window.open(serverAddress + url);
        break;
      case 19:
        url = this.formData.AccessList.AccessoryD[event.index].AccessoryURL;
        window.open(serverAddress + url);
        break;
      default:
        window.open(serverAddress + event.AccessoryURL);
      break;
    }
  }

  /** approve begin */
  @ViewChild('wfview') wfView: DbWfviewComponent;
  isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
  isADP: boolean = false;//是否加签审批
  isRisk: boolean = false;//是否风险岗
  isSeal: boolean = false;//是否印章岗
  wfData = {
    wfHistory: null,//审批历史记录
    wfProgress: null//流程全景图
  };
  viewInitParm = {//审批组件
    isRiskApp: false,
    isEdit: false
  }
  appParms = {//审批组件 参数
    apiUrl_AR: "api/PU_Contract/ApprovePUContract",
    apiUrl_Sign: "api/PU_Contract/AddApprovalTask",
    apiUrl_Transfer: "api/PU_Contract/HandOverApproval",
    taskid: this.taskid,
    nodeid: this.nodeid
  };
  adpAppParms = {//加签审批组件
    apiUrl: contractAddTaskApp,
    taskid: ""
  }
  //获取审批历史、流程全景数据
  getWfData() {
    let pu_code = this.pu_code || this.recordid;
    if (pu_code) {
      this.pcService.getApprHistoryAndProgress(pu_code).subscribe(data => {
        if (data.Result) {
          this.wfData = JSON.parse(data.Data);
          if (this.wfData["wfHistory"] != null && this.wfData["wfHistory"].length > 0)
            this.wfData["wfHistory"].reverse();
          this.getWfDataCallBack();
          this.wfView.onInitData(this.wfData["wfProgress"]);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  getWfDataCallBack() {
    //印章岗是否已审批
    if (this.wfData["wfProgress"][this.wfData["wfProgress"].length-2]["IsAlready"] === true) {
      this.sealHasApp = true;
    }
    //流程是否可以撤回
    let pu_status = this.formData.PUBaseData.PU_Status;
    let agentTemp = this.localUserInfo["ITCode"] == (this.formData.PUBaseData.ApplyITcode || this.formData.PUBaseData.AgentITcode);
    if (pu_status != "0" && agentTemp && !this.sealHasApp && !this.formData.PUBaseData.PurchaseApplyCode) {
      this.isAllowRevoke = true;
    }
    //是否印章岗
    if (this.wfData["wfHistory"] && this.wfData["wfHistory"].length > 0) {
      let _that = this;
      let newArray = [];
      newArray = this.wfData["wfHistory"].filter(item => {
        return item["nodename"].toString().indexOf("印章") != -1;
      });
      if (newArray.length > 0) {
        let itcode = this.localUserInfo["ITCode"].toUpperCase();
        if (newArray[0]["user"].toUpperCase().indexOf(itcode) != -1) {
          this.isSeal = true;
        }
      }
    }
  }

  //根据url参数初始化页面显示
  initViewByUrlParms() {
    if (this.pu_code) {//查看页面
      this.isView = true;
      this.isSealView = true;
      return;
    } else {//审批页面
      this.isView = false;
      this.isSealView = false;
      if (this.adp) {//加签审批
        this.isADP = true;
        return;
      }
      if (this.nodeid == "8") {//风险岗审批页面
        this.isRisk = true;
        this.viewInitParm.isRiskApp = true;
        this.viewInitParm.isEdit = false;
        return;
      }
      if (this.nodeid == "14" || this.nodeid == "15") {//印章岗
        this.isSeal = true;
        this.viewInitParm.isRiskApp = false;
        this.viewInitParm.isEdit = false;
        return;
      }
    }

  }
  /** approve eng */

}