import { Component, OnInit, ViewChild } from '@angular/core';
import { ScService, SCData, SCBaseData, SelectData, PlatForm, Buyer, HeadquarterList, BusinessUnitList,AccessList,Access,Seal,PersonInfo,contractAddTaskApp } from "../../service/sc-service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "app/core";
import { Person } from 'app/shared/services/index';
import { NgForm } from "@angular/forms";
import { Headers, RequestOptions } from "@angular/http";
import { DbWfviewComponent } from "../../../../shared/index";
import { EcContractCommonClass } from "../ectemplates/common/utilityclass/eccontractcommon";
import { ScTemplateService } from "../../service/sc-template.service";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { ScNoticeModalComponent } from "../sc-notice-modal/sc-notice-modal.component";
declare var document,Blob,URL,window,$;
import * as moment from 'moment';

@Component({
  selector: 'db-sc-view',
  templateUrl: './sc-view.component.html',
  styleUrls: ['./sc-view.component.scss']
})
export class ScViewComponent implements OnInit {

  constructor(
    private scService: ScService,
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private scTplService:ScTemplateService,
    private windowService: WindowService) { }

  @ViewChild('form') form: NgForm;
  @ViewChild('accessories') accessories;//上传附件组件ID注入
  ecContractCommonClass = new EcContractCommonClass();
  sc_Code;
  taskid;
  recordid;
  nodeid;
  adp;
  taskState;
  isbusiness;//是否销售订单商务岗
  uploadChapterApiUrl;
  customerAuthInfo;//代理商认证信息
  customerFrozenInfo;//代理商冻结信息
  showModalContentType: string;
  isShowModal: boolean = false;
  isAllowRevoke: boolean = false;//是否允许撤回
  formData: SCData = new SCData();//表单数据
  selectData: SelectData = new SelectData();//下拉框数据
  sealInfo: Seal = new Seal();// 用印数据
  accessList: AccessList = new AccessList();//附件数据
  userInfo: PersonInfo = new PersonInfo();//人员信息
  accessorySealUrl: any = "";//模板PDF附件制作地址
  localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  isSealRole:boolean = false;//是否印章岗
  isRiskRole:boolean = false;//是否风险岗
  approveUser: any;//审批人
  isRecoveryTxt:string = "";//合同是否回收
  accessListD:Array<any> = [];//双章扫描件
  isAnent: boolean = false;//是否可上传双章扫描件
  accessoryStatus: number = 0;//判断当前审批人，附件是否修改
  // isApping: boolean = true;//是否审批中 审批中 true 审批完成 false
  sealHasApp:boolean = false;//是否已有印章岗审批
  customerFormData = "";//自定义表单数据
  approveBeforeValid = false;//审批之前验证是否成功
  disabledOutsourcing = false;
  operaType = "";//获取合同数据类型给后台接口判断用 1：没有变更数据保存 2：已有变更数据
  currentApprovalNodeIsSeal = false;//当前审批环节是否是盖章岗
  modal: XcModalRef;//模态窗
  CustomerUnClerTotalInfo = { "Receivable" : 0.00, "Overdue" : 0.00 };//客户应收、超期欠款金额
  projectTip = "";//项目信息提示
  projectInfoEditStatus: any = false;//项目信息是否从采购申请带过来的
  ProjectRealityInfoType = [
    {ischecked:false,value:"0"},
    {ischecked:false,value:"1"},
    {ischecked:false,value:"2"},
    {ischecked:false,value:"3"},
    {ischecked:false,value:"4"}
  ];
  riskstatementdata = {
    EditOrView: "view",//是否可编辑
    ProjectNature:"请选择",//项目性质
    CustMoneySource:"请选择",//客户资金来源
    EndUserMoneySource:"请选择",//最终用户资金来源
    IsDirectSend:null,//是否直发（0-否，1-是）
    HasProjectRealityInfo:null,//是否提供项目真实性资料（0-否，1-是）
    ProjectRealityInfoType:null,//项目真实性资料类型
    ProjectRealityInfoOther:null,//其他项目真实性资料描述
    EndUserPayforType:null,//最终客户付款方式
    RiskAndControlled:null,//合同条款中存在的风险隐患和把握、以及事业部对此单回款的把控方式
    CustomerEvaluation:null,//申请人对客户的评价
    CustPaymentProcess:null,//客户付款流程
    ProjectImplementation:null,//项目履行实施安排、项目实施周期说明、项目竣工时间要求
    AccessoryRisk : []
  };//风险说明组件数据
  riskstatementcomponentselectdata = [];//风险说明组件中下拉框数据源
  ApprovalOpinion = "";//审批完成后印章岗审批意见

  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(ScNoticeModalComponent);
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onNoticeResultModalHide);
    this.uploadChapterApiUrl = this.scService.uploadSCAccessories(19);
    this.getUrlParams();
    this.getSelectData();
  }

  //获取url参数
  getUrlParams() {
    this.sc_Code = this.routerInfo.snapshot.queryParams['SC_Code'];
    this.taskid = this.routerInfo.snapshot.queryParams['taskid'];
    this.recordid = this.routerInfo.snapshot.queryParams['recordid'];
    this.nodeid = this.routerInfo.snapshot.queryParams['nodeid'];
    this.adp = this.routerInfo.snapshot.queryParams['ADP'];
    this.taskState = this.routerInfo.snapshot.queryParams['TS'];
    this.isbusiness = this.routerInfo.snapshot.queryParams['isbusiness'];
    this.operaType = this.routerInfo.snapshot.queryParams['operatype'];
    this.getUrlParamsCallBack();
  }
  //获取url参数后业务处理
  getUrlParamsCallBack(){
    this.appParms.taskid = this.taskid;
    this.adpAppParms.taskid = this.taskid;
    this.initViewByUrlParms();
  }

  //获取下拉框数据
  getSelectData(sc_code = this.sc_Code) {
    let id = sc_code || this.recordid;
    if (id) {
      this.scService.getSelectData(id).subscribe(
        data => {
          if (data.Result) {
            this.selectData = JSON.parse(data.Data);
            this.getEcData(id);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
      this.scService.GetConfigValueForRiskStatement("ProjectNature").subscribe(
        data => {
          if (data.Result) {
            this.riskstatementcomponentselectdata["ProjectNature"] = JSON.parse(JSON.parse(data.Data));
            this.riskstatementcomponentselectdata["ProjectNature"] = this.riskstatementcomponentselectdata["ProjectNature"].filter(item => { return item !== "请选择" });
          }
        }
      );
      this.scService.GetConfigValueForRiskStatement("CustMoneySource").subscribe(
        data => {
          if (data.Result) {
            this.riskstatementcomponentselectdata["CustMoneySource"] = JSON.parse(JSON.parse(data.Data));
            this.riskstatementcomponentselectdata["CustMoneySource"] = this.riskstatementcomponentselectdata["CustMoneySource"].filter(item => { return item !== "请选择" });
          }
        }
      );
      this.scService.GetConfigValueForRiskStatement("EndUserMoneySource").subscribe(
        data => {
          if (data.Result) {
            this.riskstatementcomponentselectdata["EndUserMoneySource"] = JSON.parse(JSON.parse(data.Data));
            this.riskstatementcomponentselectdata["EndUserMoneySource"] = this.riskstatementcomponentselectdata["EndUserMoneySource"].filter(item => { return item !== "请选择" });
          }
        }
      );
    }else{
      this.windowService.alert({ message: "获取信息失败！", type: "fail" });
    }
  }

  //获取销售合同数据
  getEcData(sc_code) {
    if (sc_code) {
      if (this.operaType) {
        let body = {
          sc_code: sc_code,
          itcode: this.localUserInfo["ITCode"],
          OperaType: this.operaType
        };
        this.scService.getChangeContractBySC_code(body).subscribe(
          data => {
            if (data.Result) {
              //业务处理
              this.formData = JSON.parse(data.Data);
              this.getEcDataCallBack(this.formData);
            } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }else{
        let body = {
          sc_code: sc_code,
          itcode: this.localUserInfo["ITCode"]
        };
        this.scService.getEContractByScCode(body).subscribe(
          data => {
            if (data.Result) {
              //业务处理
              this.formData = JSON.parse(data.Data);
              this.getEcDataCallBack(this.formData);
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }
    } else {
      this.windowService.alert({ message: "sc_code为空，获取数据失败!", type: "fail" });
    }

  }
  //获取销售合同数据 回调
  getEcDataCallBack(data = this.formData) {
    this.getCustomerAuthAndFrozenInfo();
    this.getWfData();
    let baseData = data.SCBaseData;
    //获取与销售合同相关联的采购申请状态
    this.GetPurchaseApplyStatus();
    let itcode = !baseData.SalesITCode ? this.localUserInfo["ITCode"] : baseData.SalesITCode;
    let name = !baseData.SalesITCode ? this.localUserInfo["UserName"] : baseData.SalesName;
    //获取个性化字段信息
    let body = {
      "BusinessID": baseData.SC_Code,
      "BusinessType": "SalesContract"
    };
    //解除类型的合同 项目信息从原合同取
    if (this.operaType === '3'){
      body.BusinessID = baseData.OriginalContractCode;
    }
    this.scService.getBussinessFieldConfig(body).subscribe(data => {
      if(data.Result){
        this.customerFormData = JSON.parse(data.Data);
        if (this.customerFormData) {
          if (this.operaType === '3' || this.operaType === '5' || this.isView || (this.nodeid == 3 && this.projectInfoEditStatus) || this.nodeid != 3) {
            this.getBussinessFieldConfigCallBack(this.customerFormData);
          }else{
            if(this.customerFormData["FieldMsg"].length > 0){
              this.customerFormData["FieldMsg"].forEach((item, i) => {
                if (item.FieldShowType == "select" || item.FieldShowType == "radio") {
                  let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.text === item.FieldValue });
                  if (tempArray.length > 0) {
                    this.customerFormData["FieldMsg"][i].FieldValue = tempArray[0].value;
                  }
                }
              });
            }
          }
        }
        this.getCustomerUnClerTotalInfo(baseData.BuyerERPCode);
      }
    });
    //初始化项目信息是否可编辑
    baseData.isFillContract == 1?this.projectInfoEditStatus = true:this.projectInfoEditStatus = false;
    //是否审批中
    // if (baseData.SC_Status == "2") {
    //   this.isApping = false;
    // }
    //是否可上传双章扫描件
    if (this.localUserInfo["ITCode"].toUpperCase() == data.SCBaseData.AgentITcode.toUpperCase()) {
      this.isAnent = true;
    }
    //附件信息
    if(this.operaType == "3" && data.AccessList){
      data.AccessList["AccessoryBus"] = data.AccessList["AccessoryBus"].concat(data.AccessList["AccessoryChange"], data.AccessList["AccessoryD"]);
    }
    if(this.operaType !== "2"&& data.AccessList){
      this.accessories.accessoriesChange(data.AccessList);
    }
    this.accessListD = data.AccessList["AccessoryD"];
    //用印信息
    if (baseData.SealInfoJson) {
      let sealData= JSON.parse(baseData.SealInfoJson);
      this.sealInfo = sealData;
    }
    //初始化选人组件
    this.userInfo["itcode"] = itcode;
    this.userInfo["name"] = name;
    // this.person.list.push(new Person(this.userInfo));
    //币种
    this.formData.SCBaseData.Currency = "0001";
    let current = this.getNameByIdForSelect(this.selectData.CurryList,"CurrencyID",this.formData.SCBaseData.Currency);
    if (current) {
      this.formData.SCBaseData.CurrencyName = current["CurrencyName"];
    }
    //系统账期
    let AccountPeriod = this.getNameByIdForSelect(this.selectData.AccountPeriodList,"AccountPeriodID",this.formData.SCBaseData.AccountPeriodType);
    if (AccountPeriod) {
      this.formData.SCBaseData.AccountPeriodName = AccountPeriod["AccountPeriodName"];
    }
    //项目类型
    let ProjectType = this.getNameByIdForSelect(this.selectData.ProjectTypeList,"ProjectTypeID",this.formData.SCBaseData.ProjectType);
    if (ProjectType) {
      this.formData.SCBaseData.ProjectTypeName = ProjectType["ProjectTypeName"];
    }
    //税率
    let TaxRate = this.getNameByIdForSelect(this.selectData.TaxRateList,"TaxRateID",this.formData.SCBaseData.TaxRateCode);
    if (TaxRate) {
      this.formData.SCBaseData.TaxRateName = TaxRate["TaxRateName"];
    }
    //付款方式
    let Payment = this.getNameByIdForSelect(this.selectData.PayMendList,"Paymentcode",this.formData.SCBaseData.PaymentMode);
    if (Payment) {
      this.formData.SCBaseData.PaymentName = Payment["PayMentName"];
    }
    //权限确认
    this.approveUser = JSON.parse(this.formData.SCBaseData.WFApproveUserJSON);
    this.roleValidation(this.localUserInfo["ITCode"]);
    if (this.operaType !== "2") {
      this.accessories.isRiskRole = this.isRiskRole;
    }
    //合同是否回收
    if (this.formData.SCBaseData.IsRecovery === 1) {
      this.disabledOutsourcing = true;
    }
    //如果客户编号是A 需要从erp查询一下客户主数据是否存在 存在需要将客户编号替换
    if (this.formData.SCBaseData.BuyerERPCode === "A") {
      this.getCustomerInfoByName(this.formData.SCBaseData.BuyerName);
    }
    //当前审批环节
    let currentApprovalNode = [];
    if (this.formData.SCBaseData.CurrentApprovalNode && this.formData.SCBaseData.CurrentApprovalNode.length > 0) {
      currentApprovalNode = JSON.parse(this.formData.SCBaseData.CurrentApprovalNode);
    }
    currentApprovalNode.forEach(item => {
      if (item["nodename"] && item["nodename"].indexOf("盖章") > 0) {
        this.currentApprovalNodeIsSeal = true;
      }
    });
    //合同是否回收  eb电子合同初始值
    if (this.formData.SCBaseData.EBContractID && !this.formData.SCBaseData.IsRecovery && this.formData.SCBaseData.IsRecovery !== 0) {
      this.formData.SCBaseData.IsRecovery = 3;
    }
    //风险说明组件数据
    for (const key in this.formData.SCBaseData) {
      if (this.formData.SCBaseData.hasOwnProperty(key)) {
        if(this.riskstatementdata[key] !== undefined){
          this.riskstatementdata[key] = this.formData.SCBaseData[key];
        }
        if (key == "ProjectRealityInfoType") {
          if (!this.formData.SCBaseData.ProjectRealityInfoType) {
            this.riskstatementdata.ProjectRealityInfoType = this.ProjectRealityInfoType;
          }else{
            this.riskstatementdata.ProjectRealityInfoType = JSON.parse(this.formData.SCBaseData.ProjectRealityInfoType);
          }
        }
      }
    }
    this.riskstatementdata.AccessoryRisk = this.formData.AccessList.AccessoryRisk;
  }

  getBussinessFieldConfigCallBack(customerformdata){
    let data = customerformdata["FieldMsg"];
    if(data.length > 0){
      data.forEach((item, i) => {
        if (item.FieldShowType == "checkbox") {
          let str = "";
          let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.ischecked === true });
          tempArray.forEach(dataSourceItem => { str += dataSourceItem.text + "," });
          if (str.indexOf(",") != -1)
            data[i].FieldValue = str.substring(0,str.length-1);
        }
        if (item.FieldShowType == "select" || item.FieldShowType == "radio") {
          let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.value === item.FieldValue });
          if (tempArray.length > 0) {
            data[i].FieldValue = tempArray[0].text;
          }
        }
      });
    }
  }

  //附件上传 回调事件
  scAccessory(e) {
    this.accessoryStatus = 1;
    this.accessList = e;
  }

  //跳转合同制作页面之前保存
  needSave(e?){
    this.scService.isToTpl = true;
    this.onSave({opType:"Reject"});// 调用保存  不验证
  }

  //用印组件 回调
  scSeals(e){
    // console.log(e);

  }

  //下拉框方法
  getNameByIdForSelect(data = [], arrt_id, arrt_id_value){
    let arrItem;
    if (data.length > 0) {
      data.map(function (item) {
        if (item[arrt_id] === arrt_id_value) {
          arrItem = item;
          return;
        }
      });
    }
    return arrItem;
  }

  //保存
  onSave(parms?:any){
    debugger
    let saveApprovalOpinionParams = {
      "SC_Code": this.sc_Code || this.recordid,
      "ApprovalOpinion": this.ApprovalOpinion,
      "nodename": "印章管理员-盖章"
    }
    this.scService.SaveApprovalOpinion(saveApprovalOpinionParams).subscribe(data => {
      //
    });
    if (!this.formData.SCBaseData.EBContractID) {//非EB电子合同对接销售合同
      if (parms["opType"] && parms["opType"] != "Reject") {
        if (this.nodeid && this.nodeid == "7") {//风险岗审批时校验
          if (this.formData.SCBaseData.ContractSource == "模板") {
            let temp = false;
            let indiaAccessList = this.formData.AccessList["AccessorySeal"];
            if (indiaAccessList && indiaAccessList.length >= 0) {
              this.formData.AccessList["AccessorySeal"].map(function (item) {
                if (item["AccessoryType"] == "16" && item["AccessoryURL"]) {
                  temp = true;
                }
              });
            }
            if (!this.formData.SCBaseData.OriginalContractCode) {//变更合同不提示十三条款
              if (!temp || (indiaAccessList && indiaAccessList.length == 0)) {
                this.windowService.alert({ message: "请完善合同争议解决方式!", type: "fail" });
                return;
              }
            }
          }

        }
        if (!this.validCustomerFormData()) {
          return;
        }else{
          this.updateBaseFieldMsg();
        }
      }
      if (parms && parms["BizConcernInfo"]) {
        this.formData.SCBaseData["BizConcernInfo"] = parms["BizConcernInfo"];
      }
      let body = {
        "SCBaseData": {
          "ItCode": this.localUserInfo["ITCode"],
          "SC_Code": this.formData.SCBaseData["SC_Code"],    //销售合同ID
          "AccountPeriodType": this.formData.SCBaseData["AccountPeriodType"],   //系统帐期类型
          "AccountPeriodValue": this.formData.SCBaseData["AccountPeriodValue"],  //系统帐期值 （手动输入的那个）
          "BizConcernInfo": this.formData.SCBaseData["BizConcernInfo"],   //商务关注信息
          "IsRecovery": this.formData.SCBaseData["IsRecovery"], //是否回收
          "RecoveryTime": this.formData.SCBaseData["RecoveryTime"], //回收时间
          "DeleteStatus": this.accessoryStatus,  //用于区别附件list为空时，是否执行删除当前登录人所有的附件）注：DeleteStatus 为0时，不执行删除操作，DeleteStatus为1时执行删除操作。
          "UserName": this.localUserInfo["UserName"],
          "TaskOpinions": "",//印章反原岗审批意见
          "BuyerERPCode": this.formData.SCBaseData.BuyerERPCode === "A"? null: this.formData.SCBaseData.BuyerERPCode,//客户erp编号
          "ScanFileUploadTime": this.formData.SCBaseData.ScanFileUploadTime,//双章扫描件上传时间
          "ScanFileUploadMan": this.formData.SCBaseData.ScanFileUploadMan//双章扫描件上传人
        },
        "AccessList": {
          // "AccessoryD":this.formData.AccessList["AccessoryD"],
          "AccessoryD": this.accessListD,
          "AccessoryS": this.accessList["AccessoryS"]
        }
      };
      this.scService.updateSCApproval(body).subscribe(
        data => {
          if (data.Result) {
            // if (this.formData.SCBaseData.IsRecovery === "0") {
            //   this.windowService.alert({ message: "流程停留在当前环节!", type: "fail" });
            //   setTimeout(function() { window.close(); }, 1000);
            //   return;
            // }
            if (parms["opType"] != "saveback" && parms["opType"] != "save") {
              this.approveBeforeValid = true;
            }
            if (parms["opType"] == "save") {
              this.windowService.alert({ message: "保存成功", type: "success" });
              setTimeout(function() { window.close(); }, 1000);
            }
            if (parms["opType"] == "saveback") {
              window.close();
            }
            if (this.scService.isToTpl) {
              this.scService.isToTpl = false;
              this.scService.returnUrl = window.location.href;
              let templateId = this.formData.SCBaseData.TemplateID;
              let sc_code = this.formData.SCBaseData.SC_Code;
              let queryParams = { queryParams: { SC_Code: sc_code, isRiskRole: this.isRiskRole } };
              let ecPageRouteUrl = this.ecContractCommonClass.returnECRouterUrlByTemplateID(templateId);
              this.router.navigate([ecPageRouteUrl], queryParams);
            }
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
    }else{
      this.approveBeforeValid = true;
      let body = {
        "SCBaseData": {
          "ItCode": this.localUserInfo["ITCode"],
          "SC_Code": this.formData.SCBaseData["SC_Code"],    //销售合同ID
          "AccountPeriodType": this.formData.SCBaseData["AccountPeriodType"],   //系统帐期类型
          "AccountPeriodValue": this.formData.SCBaseData["AccountPeriodValue"],  //系统帐期值 （手动输入的那个）
          "BizConcernInfo": this.formData.SCBaseData["BizConcernInfo"],   //商务关注信息
          "IsRecovery": this.formData.SCBaseData["IsRecovery"], //是否回收
          "RecoveryTime": this.formData.SCBaseData["RecoveryTime"], //回收时间
          "DeleteStatus": this.accessoryStatus,  //用于区别附件list为空时，是否执行删除当前登录人所有的附件）注：DeleteStatus 为0时，不执行删除操作，DeleteStatus为1时执行删除操作。
          "UserName": this.localUserInfo["UserName"],
          "TaskOpinions": "",//印章反原岗审批意见
          "BuyerERPCode": this.formData.SCBaseData.BuyerERPCode === "A"? null: this.formData.SCBaseData.BuyerERPCode,//客户erp编号
          "ScanFileUploadTime": this.formData.SCBaseData.ScanFileUploadTime,//双章扫描件上传时间
          "ScanFileUploadMan": this.formData.SCBaseData.ScanFileUploadMan//双章扫描件上传人
        },
        "AccessList": {
          // "AccessoryD":this.formData.AccessList["AccessoryD"],
          "AccessoryD": this.accessListD,
          "AccessoryS": this.accessList["AccessoryS"]
        }
      };
      this.scService.updateSCApproval(body).subscribe(
        data => {
          if (data.Result) {
            if (parms["opType"] == "saveback") {
              window.close();
            }
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );

    }
  }
  //撤销
  revoke(){
    let id = this.sc_Code || this.recordid;
    this.windowService.confirm({ message: "流程相关数据将删除!" }).subscribe({
        next: (v) => {
          if (v) {
            this.scService.contractRevoke(id).subscribe(
              data => {
                if (data.Result) {
                  this.windowService.alert({ message: "撤销成功!", type: "success" });
                  if (this.formData.SCBaseData.SCType == "2") {//解除
                    if (this.formData.SCBaseData.MainContractCode.indexOf("UD") == 0){
                      this.router.navigate(["/india/sc-udrelieve"], { queryParams: { SC_Code: id, operatype: "3" } });
                    }else{
                      this.router.navigate(["/india/sc-relieve"], { queryParams: { SC_Code: id, operatype: "3" } });
                    }
                  }else if(this.formData.SCBaseData.SCType == "3"){//变更
                    this.router.navigate(["/india/sc-change"], { queryParams: { SC_Code: id, operatype: "2" } });
                  }else if(this.formData.SCBaseData.SCType == "5"){//单章作废
                    this.router.navigate(["/india/sc-singlesealcancel"], { queryParams: { SC_Code: id, operatype: "5" } });
                  }
                  else{
                    this.router.navigate(["/india/contract"], { queryParams: { SC_Code: id } });
                  }
                } else {
                  this.windowService.alert({ message: data.Message, type: "fail" });
                }
              }
            );
          }
        }
      });
  }
  //返回
  onBack(){
    // this.onSave({opType:'saveback'});
    window.close();
  }
  //销售订单-商务岗 通知功能
  onNotice(){
    //弹出窗口
    this.modal.show({data:this.formData.SCBaseData.SC_Code});//显示弹出框
  }
  
  //通知信息模态窗关闭时事件
  onNoticeResultModalHide = invoicedata => {
    //
  }

  //上传双章扫描件回调
  onFileCallBack(e){
    this.accessoryStatus = 1;
    this.accessListD = e;
    this.formData.SCBaseData.ScanFileUploadTime = moment(new Date()).format('YYYY/M/DD HH:mm:ss');
    this.formData.SCBaseData.ScanFileUploadMan = this.localUserInfo["ITCode"] + "/" + this.localUserInfo["UserName"];
  }

  //显示
  showModal(type){
    this.isShowModal = true;
    this.showModalContentType = type;
  }
  //隐藏
  hideModal(type){
    this.isShowModal = false;
  }
  //代理商相关信息 认证及冻结信息
  getCustomerAuthAndFrozenInfo(){
    let erpCode = this.formData.SCBaseData.BuyerERPCode;
    let parms = {
      "CustomerName": this.formData.SCBaseData.BuyerName,
      "CustomerCode": erpCode
    }
    if (erpCode == "A" || !erpCode) {
      return;
    }
    this.scService.getCustomerAuth(parms).subscribe(data => {
      if (data.Result) {
        this.customerAuthInfo = JSON.parse(data.Data);
      }
    });
    this.scService.getCustomerFrozen(erpCode).subscribe(data => {
      if (data.Result) {
        this.customerFrozenInfo = JSON.parse(data.Data);
      }
    });
  }
  //权限确认
  roleValidation(itcode:string){
    let sealUerArr = [];
    let riskUerArr = [];
    let _that = this;
    this.approveUser.map(function (item) {
      if (item["NodeID"] == 14) {//印章岗审批人
        if (item["UserSettings"] && item["UserSettings"].length > 0 && !Array.isArray(item["UserSettings"])) {
          item["UserSettings"] = JSON.parse(item["UserSettings"]);
        }
        if (item["UserSettings"] && item["UserSettings"].length > 0 && Array.isArray(item["UserSettings"])) {
          item["UserSettings"].forEach(element => {
            sealUerArr.push(element["ITCode"]);
          });
        }
      } else if (item["NodeID"] == 7) {//风险岗审批人
        if (item["ApproverList"] && item["ApproverList"].length > 0 && Array.isArray(item["ApproverList"])) {
          // item["ApproverList"] = JSON.parse(item["ApproverList"]);
          item["ApproverList"].forEach(element => {
            riskUerArr.push(element["ITCode"]);
          });
        }
      }
    });
    sealUerArr.forEach((element:string) => {
      if (itcode.toUpperCase() == element.toUpperCase()) {
        _that.isSeal = true;
      }
    });
    riskUerArr.forEach((element:string) => {
      if (itcode.toUpperCase() == element.toUpperCase()) {
        // if (this.nodeid && this.nodeid == "7") {
        //   _that.isRiskRole = true;
        // }
        _that.isRiskRole = _that.isRisk = true;
      }
    });
  }

  //验证 账期 正整数
  validAccount(value){
    let valid = /^[1-9][0-9]{0,2}$/.test(value);
    if (value && !valid) {
      this.formData.SCBaseData.AccountPeriodValue = "";
      this.windowService.alert({ message: "输入非法", type: "fail" });
    }
  }

  //风险岗查看客户资信
  viewCustomerCredit(erpcode){
    if (erpcode && this.isRisk) {
      this.scService.getCrmCustomInfoById(String(erpcode).trim()).subscribe(data => {
        if(data && data.success){
          if (data.resultUrl.length > 0) {//有资信信息
            window.open(data.resultUrl[0]);
          } else {
            this.windowService.alert({ message: "该客户未创建资信信息！", type: "fail" });
          }
        }
      });
    }
  }

  //通过客户名称获取客户编号
  getCustomerInfoByName(name:string){
    if (name) {
      this.scTplService.getBuyerInfoByName(name.trim()).subscribe(
        data => {
          if (data.Result) {
            let customerInfo = JSON.parse(data.Data);
            if(customerInfo && customerInfo.length > 0){
              this.formData.SCBaseData.BuyerERPCode = customerInfo[0]["KUNNR"];
            }
          }
        }
      );
    }
  }
  //附件下载
  onClickFile(url){
    if(url.indexOf("http") >= 0){
      window.open(url);
    }else{
      if (url.indexOf("/") == 0) {
        window.open(this.scService.upFilesDownload(url));
      }else{
        console.log(url);
        window.open(this.scService.upFilesDownload("/" + url));
      }
    }
  }

  //下载产品明细
  downloadProductList(code){
    this.scService.DownLoadProductList(code).subscribe(data => {
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `产品明细.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl);
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`产品明细${newDate}`);
    a.click();
    document.body.removeChild(a);
  }
  //验证个性化字段必填
  validCustomerFormData(){
    let isValid = true;
    if(this.customerFormData){
      for (let index = 0; index < this.customerFormData["FieldMsg"].length; index++) {
        let item = this.customerFormData["FieldMsg"][index];
        if (item["IfRequired"]) {
          if (item["FieldShowType"] != "checkbox") {
            if (!item["FieldValue"]) {
              this.windowService.alert({ message: "请维护" + item["FieldShowName"], type: "warn" });
              isValid = false;
              break;
            }
          } else if(item["FieldShowType"] === "checkbox") {
            let flag = false;
            for (let i = 0; i < item["Data"].length; i++) {
              let dataSource = item["Data"][i];
              if (dataSource && dataSource["ischecked"]) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              this.windowService.alert({ message: "请维护" + item["FieldShowName"], type: "warn" });
              isValid = false;
              break;
            }
          }
        }
      }
    }
    return isValid;
  }
  //保存个性化字段信息
  updateBaseFieldMsg(){
    if (this.customerFormData) {
      this.customerFormData["BusinessID"] = this.formData.SCBaseData.SC_Code; 
      let body = {
        "SCBaseData": JSON.stringify(this.customerFormData)
      }
      this.scService.updateBaseFieldMsg(body).subscribe(data => {
        if (!data.Result) {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  //查询客户应收、超期欠款金额
  getCustomerUnClerTotalInfo(code){
    if (code) {
      this.scService.getCustomerUnClerTotalInfo(code).subscribe(data => {
        if (data.Result) {
          this.CustomerUnClerTotalInfo = JSON.parse(data.Data);
        }
      });
    }
  }
  //获取与销售合同相关联的采购申请状态
  GetPurchaseApplyStatus(){
    this.scService.GetPurchaseApplyStatus(this.formData.SCBaseData.SC_Code,this.formData.SCBaseData.isFillContract).subscribe(data => {
      this.projectTip = data.Message;
    });
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
      apiUrl_AR: "api/S_Contract/ApproveSContract",
      apiUrl_Sign: "api/S_Contract/AddApprovalTask",
      apiUrl_Transfer: "api/S_Contract/HandOverApproval",
      taskid: this.taskid,
      nodeid: this.nodeid
    };
    adpAppParms = {//加签审批组件
      apiUrl: contractAddTaskApp,
      taskid: ""
    }
    //获取审批历史、流程全景数据
    getWfData() {
      let sc_code = this.sc_Code || this.recordid;
      if (sc_code) {
        this.scService.getAppData(sc_code).subscribe(data => {
          if (data.Result) {
            this.wfData = JSON.parse(data.Data);
            if (this.wfData["wfHistory"] != null && this.wfData["wfHistory"].length > 0){
              this.wfData["wfHistory"].reverse();
            }
            this.getWfDataCallBack(this.wfData["wfHistory"]);
            this.wfView.onInitData(this.wfData["wfProgress"]);
            this.getApprovalOpinion(sc_code);
          }else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
      }
    }
    getWfDataCallBack(wfHistory){
      if (wfHistory && wfHistory.length>0) {
        let _that = this;
        wfHistory.map(function (item){
          if (item["nodename"].toString().indexOf("印章") != -1) {
            _that.sealHasApp = true;
          }
        });
      }
      this.resetApp();
    }

    //获取审批完成后印章岗追加审批意见
    getApprovalOpinion(sc_code){
      this.scService.GetApprovalOpinion(sc_code).subscribe(data => {
        if (data.Result) {
          let sealAppOption = JSON.parse(data.Data)["ApprovalOpinion"];
          this.wfData["wfHistory"] = this.wfData["wfHistory"].concat(sealAppOption);
        }
      });
    }

    //是否可以撤回流程
    resetApp() {
      let sc_status = this.formData.SCBaseData.SC_Status;
      let agentTemp = String(this.localUserInfo["ITCode"]).toUpperCase() == (String(this.formData.SCBaseData.SalesITCode).toUpperCase() || String(this.formData.SCBaseData.AgentITcode).toUpperCase());
      if (sc_status != "0" && agentTemp && !this.sealHasApp && !this.formData.SCBaseData.EBContractID) {
        this.isAllowRevoke = true;
      }
    }
    //根据url参数初始化页面显示
    initViewByUrlParms(){
      if (this.sc_Code) {//查看页面
        this.isView = true;
        return;
      } else {//审批页面
        this.isView = false;
        if (this.adp) {//加签审批
          this.isADP = true;
          return;
        }
        if (this.nodeid == "7") {//风险岗审批页面
          this.isRisk = true;
          this.viewInitParm.isRiskApp = true;
          this.viewInitParm.isEdit = true;
          return;
        }
        if (this.nodeid == "14") {//印章岗
          this.isSeal = true;
          this.viewInitParm.isRiskApp = false;
          this.viewInitParm.isEdit = false;
          return;
        }
      }

    }
  /** approve eng */

}
