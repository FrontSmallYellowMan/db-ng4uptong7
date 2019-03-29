import { Component, OnInit, ViewChild } from '@angular/core';
import { ScService, SCData, SCBaseData, SelectData, PlatForm, Buyer, HeadquarterList, BusinessUnitList,AccessList,Access,Seal,PersonInfo } from "../../service/sc-service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "app/core";
import { NgForm } from "@angular/forms";
import { EcContractCommonClass } from "../ectemplates/common/utilityclass/eccontractcommon";
import { PageRefresh } from "../../service/pagerefresh.service";
import { ScTemplateService } from "../../service/sc-template.service";
import { RecordAllowEditStateService, RecordAllowEditStateQuery, RecordState } from "../../../../shared/services/recordalloweditstate.service";
declare var window: any;

@Component({
  selector: 'db-sc-singlesealcancel',
  templateUrl: './sc-singlesealcancel.component.html',
  styleUrls: ['../sc-change/sc-change.component.scss']
})
export class ScSingleSealCancelComponent implements OnInit {

  constructor(
    private recordAllowEditStateService: RecordAllowEditStateService,
    private scService: ScService,
    private routerInfo: ActivatedRoute,
    private windowService: WindowService) { }
  
  ecContractCommonClass = new EcContractCommonClass();
  sc_Code;
  formData: SCData = new SCData();//表单数据
  wfHistory: Array<any> = [];//审批历史
  selectData: SelectData = new SelectData();//下拉框数据
  sealInfo: Seal = new Seal();// 用印数据
  accessList: AccessList = new AccessList();//附件数据
  isSubmit:boolean = true;
  isRiskRole:boolean = false;//是否风险岗
  localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  ApproverInfo;//审核数据
  customerFormData = "";//自定义表单数据
  isUserChange = false;//申请人是否变化
  hasInitBaseInfo = false;//是否已经初始化基本信息
  operaType = "1";//获取合同数据类型给后台接口判断用 1：没有变更数据保存 2：已有变更数据
  WFApproverDataComponent;//审批信息
  CustomerUnClerTotalInfo = { "Receivable" : 0.00, "Overdue" : 0.00 };//客户应收、超期欠款金额
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
  hasUploadedFilesRisk = [];//风险说明组件中附件信息
  @ViewChild('form') form: NgForm;
  @ViewChild('seals') seals;//用印组件ID注入
  ngOnInit() {
    this.getUrlParams();
    if (this.sc_Code && this.operaType === "2") {
      let recordAllowEditStateQuery = new RecordAllowEditStateQuery();
      recordAllowEditStateQuery.FunctionCode = RecordState.indiaSaleContract;
      recordAllowEditStateQuery.RecordID = this.sc_Code;
      recordAllowEditStateQuery.NotAllowEditLink = "/india/contractview?SC_Code=" + this.sc_Code +"&operatype=2";
      recordAllowEditStateQuery.NotFoundRecordLink = "india/sclist";
      this.recordAllowEditStateService.getRecordAllowEditState(recordAllowEditStateQuery,()=>{
        this.getBaseData();
      });
    }else{
      this.getBaseData();
    }
  }
  //获取url参数
  getUrlParams() {
    this.sc_Code = this.routerInfo.snapshot.queryParams['SC_Code'] || this.routerInfo.snapshot.queryParams['sc_code'];
    this.operaType = this.routerInfo.snapshot.queryParams['operatype'];
  }
  //获取下拉框数据
  getSelectData(sc_code = this.sc_Code) {
    if (sc_code) {
      this.scService.getSelectData(sc_code).subscribe(
        data => {
          if (data.Result) {
            this.selectData = JSON.parse(data.Data);
            this.getEcData(this.sc_Code);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
    }
  }
  //获取下拉框数据 不包含审批人序列信息
  getBaseData() {
    this.scService.getBaseData().subscribe(
      data => {
        if (data.Result) {
          this.selectData = JSON.parse(data.Data);
          this.getEcData(this.sc_Code);
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
  }
  //获取销售合同数据
  getEcData(sc_code) {
    if (sc_code) {
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
    } else {
      this.windowService.alert({ message: "sc_code为空，获取数据失败!", type: "fail" });
    }
  }
  //获取销售合同数据 回调
  getEcDataCallBack(data = this.formData) {
    let baseData = data.SCBaseData;
    //获取个性化字段信息
    let body = {
      "BusinessID": baseData.SC_Code,
      "BusinessType": "SalesContract"
    };
    this.scService.getBussinessFieldConfig(body).subscribe(data => {
      if(data.Result){
        this.customerFormData = JSON.parse(data.Data);
        this.getCustomerUnClerTotalInfo(baseData.BuyerERPCode);
      }
    });
    let itcode = !baseData.SalesITCode ? this.localUserInfo["ITCode"] : baseData.SalesITCode;
    let name = !baseData.SalesITCode ? this.localUserInfo["UserName"] : baseData.SalesName;
    //流程历史
    if (baseData.SC_Code && baseData.SC_Status == "3") {
      this.getWfData(baseData.SC_Code);
    }
    //是否含外购
    if (!this.formData.SCBaseData.Outsourcing) {
      this.formData.SCBaseData.Outsourcing = "0";
    }
    //代理商
    if (this.formData.SCBaseData.BuyerERPCode) {
      let code = this.formData.SCBaseData.BuyerERPCode;
      let name = code + "-"+ this.formData.SCBaseData.BuyerName;
      this.selectData.Buyer = [new Buyer(code, name)];
    }
    //币种业务处理
    if (!this.formData.SCBaseData.Currency) {
      this.formData.SCBaseData.Currency = "0001";
    }
    if (!this.formData.SCBaseData.ApplyTel) {
      this.scService.getUserPhone().subscribe(data => {
        if (data.Result) {
          this.formData.SCBaseData.ApplyTel = data.Data;
        }
      });
    }
    //自定义类型合同 获取我方主体信息
    if (baseData.ContractSource && baseData.ContractSource =="自定义") {
      this.getCompanyByitcode(itcode);
    }
    this.getDepartmentPlatformByItcode(itcode);
    //用印信息
    if (baseData.SealInfoJson) {
      let sealData= JSON.parse(baseData.SealInfoJson);
      this.sealInfo = sealData;
      //原审批组件
      // this.approvers.sealChange(sealData["SealData"]);//初始化时传入审核组件，用印管理数据
    }
    //业务范围代码
    if (!this.formData.SCBaseData.YWFWDM) {
      this.formData.SCBaseData.YWFWDM = this.localUserInfo["YWFWDM"];
    }
    //审核信息
    if (baseData.WFApproveUserJSON&&baseData.WFApproveUserJSON!=null) {
      //原审批组件
      // this.approvers.approversChange(JSON.parse(baseData.WFApproveUserJSON));
      //重做审批人组件
      this.WFApproverDataComponent = this.wfDataConversion(JSON.parse(baseData.WFApproveUserJSON), true);
    }else{
      this.getSCheckBaseDataByRole(this.sc_Code, this.formData.SCBaseData.YWFWDM);
    }
    //申请人信息
    baseData.ApplyITcode = this.localUserInfo["ITCode"];
    baseData.ApplyName = this.localUserInfo["UserName"];
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
    this.formData.AccessList.AccessoryRisk.forEach(item => {
      item["name"] = item["AccessoryName"];
      this.hasUploadedFilesRisk.push(item);
    });
  }
  //获取销售合同审批人序列信息
  getSCheckBaseDataByRole(sc_code, ywfwdm) {
    let body = {
      "sc_code": sc_code,
      "YWFWDM": ywfwdm
    }
    this.scService.getSCheckBaseDataByRole(body).subscribe(
      data => {
        if (data.Result) {
          //原审批组件
          // this.selectData["WFApproveUserJSON"] = JSON.parse(data.Data)["WFApproveUserJSON"];
          // this.selectData["WFApproveUserJSON"].forEach(item => {
          //   item["NodeSelectItCode"] = null;
          // });
          // this.approvers.approversChange(this.selectData["WFApproveUserJSON"]);

          //审批组件重做
          this.WFApproverDataComponent = this.wfDataConversion(JSON.parse(data.Data)["WFApproveUserJSON"], true);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //我方主体信息
  getCompanyByitcode(itcode) {
    this.scService.getCompanyByitcode(itcode).subscribe(
      data => {
        if (data.Result) {
          this.selectData.SellerCompanys = JSON.parse(data.Data)["CompanyList"];
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //事业部平台信息
  getDepartmentPlatformByItcode(itcode) {
    this.scService.getDepartmentPlatformByItcode(itcode).subscribe(
      data => {
        if (data.Result) {
          let resultData = JSON.parse(data.Data);
          this.selectData.HeadquarterList = [new HeadquarterList(resultData["BBMC"], resultData["BBMC"])];
          this.selectData.BusinessUnitList = resultData["SYCMC"];
          this.selectData.PlatForm = resultData["PlatformList"];
          this.getUserDeptmentByItcode(itcode);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //根据销售员itcode获取所有本部事业部及平台，电话
  getUserDeptmentByItcode(itcode){
    this.scService.getUserDeptmentByItcode(itcode).subscribe(
      data => {
        if(data.Result){
          let userDeptmentInfo = JSON.parse(data.Data);
          if (userDeptmentInfo["UserInfo"]) {
            this.getUserDeptmentByItcodeCallBack(userDeptmentInfo);
            //接口返回值增加ywfwdm信息，用来判断是否需要重新获取审批规则
            let ywfwdm = userDeptmentInfo["UserInfo"][0]["YWFWDM"];
            if (ywfwdm != this.formData.SCBaseData.YWFWDM) {
              this.formData.SCBaseData.YWFWDM = userDeptmentInfo["UserInfo"][0]["YWFWDM"];
              this.getSCheckBaseDataByRole(this.sc_Code, this.formData.SCBaseData.YWFWDM);
            }
          }else{
            this.windowService.alert({ message: "获取人员组织信息失败！", type: "fail" });
          }
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //获取人员组织信息后业务处理 回调
  getUserDeptmentByItcodeCallBack(userDeptmentInfo){
    let temp;
    if(userDeptmentInfo["UserInfo"].length > 0){
      temp = userDeptmentInfo["UserInfo"][0];
    }
    if(temp){
      let oldPlatformID = this.formData.SCBaseData.PlatformID;
      if((!this.hasInitBaseInfo && !this.formData.SCBaseData.BusinessUnit) || this.isUserChange){
        this.hasInitBaseInfo = true;
        this.isUserChange = false;
        this.formData.SCBaseData.Headquarter = temp.BBMC;
        this.formData.SCBaseData.BusinessUnit = temp.SYBMC;
        this.formData.SCBaseData.PlatformID = temp.FlatCode;
        this.formData.SCBaseData.Platform = temp.FlatName;
      }
      // 判断平台 当前选择人平台 != 已选人平台 清空用印信息(调用用印组件清空用印信息事件) 否则 return
      if (this.formData.SCBaseData.PlatformID != oldPlatformID) {
        this.sealInfo = new Seal();
        this.formData.SCBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
      }else{
        return;
      }
    }
  }
  //提交流程
  onSubmit(form: any){
    if(form.valid && this.wfApproverRequireValid(this.WFApproverDataComponent)){//验证通过
      //检测用印信息
      if(this.sealInfo.SealData.length == 0){
        this.windowService.alert({ message: "请选择印章", type: "warn" });
        return;
    }
      if(this.sealInfo.SealData.length !== 1){
          this.windowService.alert({ message: "请选择一个地区统一对合同做报废处理", type: "warn" });
          return;
      }
      let reg = /^\+?[1-9][0-9]*$/;
      if(!reg.test(this.sealInfo.PrintCount)){
          this.windowService.alert({ message: "请填写正确的用印份数", type: "warn" });
          return;
      }
      if(this.isSubmit){
        if (!this.formData.SCBaseData.BuyerERPCode) {
          this.formData.SCBaseData.BuyerERPCode = "A";
        }
        this.formData.OperaType = this.operaType;
        this.formData.SCBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
        let WFApproveUserJSON = this.wfDataConversion(this.WFApproverDataComponent, false);
        this.formData.SCBaseData.WFApproveUserJSON = JSON.stringify(WFApproveUserJSON);
        //风险说明组件数据
        for (const key in this.riskstatementdata) {
          if (this.riskstatementdata.hasOwnProperty(key)) {
            if(this.formData.SCBaseData[key] !== undefined){
              this.formData.SCBaseData[key] = this.riskstatementdata[key];
            }
            if (key == "ProjectRealityInfoType") {
              this.formData.SCBaseData.ProjectRealityInfoType = JSON.stringify(this.riskstatementdata.ProjectRealityInfoType);
            }
          }
        }
        this.formData.AccessList.AccessoryRisk = this.riskstatementdata.AccessoryRisk;
        this.scService.submitContractChange(this.formData).subscribe(
          data => {
            if (data.Result) {
              let sc_code = data.Data;
              this.updateBaseFieldMsg(sc_code);
              this.windowService.alert({ message: "提交成功", type: "success" });
              setTimeout(function() { window.close(); }, 1000);
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }
    }else{
      this.windowService.alert({ message: "请将必填信息填写完整", type: "warn" });
    }
  }
  //暂存
  onSave(){
    if (!this.formData.SCBaseData.BuyerERPCode) {
      this.formData.SCBaseData.BuyerERPCode = "A";
    }
    this.formData.OperaType = this.operaType;
    this.formData.SCBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
    let WFApproveUserJSON = this.wfDataConversion(this.WFApproverDataComponent, false);
    this.formData.SCBaseData.WFApproveUserJSON = JSON.stringify(WFApproveUserJSON);
    //风险说明组件数据
    for (const key in this.riskstatementdata) {
      if (this.riskstatementdata.hasOwnProperty(key)) {
        if(this.formData.SCBaseData[key] !== undefined){
          this.formData.SCBaseData[key] = this.riskstatementdata[key];
        }
        if (key == "ProjectRealityInfoType") {
          this.formData.SCBaseData.ProjectRealityInfoType = JSON.stringify(this.riskstatementdata.ProjectRealityInfoType);
        }
      }
    }
    this.formData.AccessList.AccessoryRisk = this.riskstatementdata.AccessoryRisk;
    this.scService.saveChangeContract(this.formData).subscribe(
      data => {
        if (data.Result) {
          let sc_code = data.Data;
          this.updateBaseFieldMsg(sc_code);
          this.windowService.alert({ message: "保存成功", type: "success" });
          setTimeout(function() { window.close(); }, 1000);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //取消
  onCancel(){
    window.close();
  }
  //获取个性化字段信息
  getRoleFieldConfig(businesscode){
    let body = {
      "BusinessCode": businesscode,
      "BusinessType": "SalesContract",
    }
    this.scService.getRoleFieldConfig(body).subscribe(data => {
      if(data.Result){
        this.customerFormData = JSON.parse(data.Data);
      }
    });
  }
  //保存个性化字段信息
  updateBaseFieldMsg(sc_code){
    if (this.customerFormData) {
      this.customerFormData["BusinessID"] = sc_code;
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
  //用印选择 确定 回调事件
  scSeals(e) {
    //重做审批人组件 用印选择逻辑处理
    this.sealSelectData(e['SealData']);
  }
  //原审批组件 输出事件
  scApprover(e) {
    this.formData.SCBaseData.WFApproveUserJSON = JSON.stringify(e);
  }
  //获取审批历史
  getWfData(sc_code) {
    if (sc_code) {
      this.scService.getAppData(sc_code).subscribe(data => {
        if (data.Result) {
          let temp = JSON.parse(data.Data);
          if (temp["wfHistory"] && temp["wfHistory"].length > 0)
            this.wfHistory = temp["wfHistory"].reverse();
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  //平台 change事件
  onPlatformChange(platformid){
    let temp = this.selectData.PlatForm.filter(item => { return item.FlatCode === platformid });
    this.formData.SCBaseData.PlatformID = temp[0].FlatCode;
    this.formData.SCBaseData.Platform = temp[0].FlatName;
    let body = { "sc_code": this.sc_Code, "YWFWDM": this.formData.SCBaseData.YWFWDM, "FlatCode": this.formData.SCBaseData.PlatformID };
    this.scService.getWFFXByRole(body).subscribe(data => {
      if (data.Result) {
        let riskNodeInfo = JSON.parse(data.Data)["WFApproveUserJSON"];
        this.riskSelectData(riskNodeInfo);
      }
    });
  }

  //将后端审批人序列数据转换成审批组件需要的数据
  //转换原因：审批组件中使用了选人组件，选人组件要求的数据格式跟后台审批人序列数据格式不匹配
  //转换逻辑：
  //1、UserSettings:[{ "Group":"0601", "ITCode":"wanghld", "UserName":"王宏凌" }] ==> UserSettings:[{"userID":"yangglc","userEN":"yangglc","userCN":"杨桂林"}]
  //2、ApproverList":[{ "ITCode":"chengjina", "UserName":"程锦"}] ==> 2、ApproverList:[{"userID":"yangglc","userEN":"yangglc","userCN":"杨桂林"}]
  wfDataConversion(data,forward){
    if (forward) {//将后台数据转化成组件数据
      let approveComponentData = JSON.parse(JSON.stringify(data));
      data.forEach((nodedata,i) => {
        if (nodedata.UserSettings && !Array.isArray(nodedata.UserSettings)) {
            nodedata["UserSettings"] = [nodedata["UserSettings"]];
        }
        if (nodedata.UserSettings && nodedata.UserSettings.length > 0) {
          if(typeof nodedata["UserSettings"] == "string"){
            nodedata["UserSettings"] = JSON.parse(nodedata["UserSettings"]);
          }
          approveComponentData[i].UserSettings = [];
          nodedata.UserSettings.forEach(useritem => {
            let approverItem = { "userID": useritem.ITCode,"userEN": useritem.ITCode,"userCN":useritem.UserName};
            if (useritem.Group) {
              approverItem["Group"] = useritem.Group;
            }
            approveComponentData[i].UserSettings.push(approverItem);
          });
        }
        if (nodedata.ApproverList && nodedata.ApproverList.length > 0) {
          if(typeof nodedata["ApproverList"] == "string"){
            nodedata["ApproverList"] = JSON.parse(nodedata["ApproverList"]);
          }
          approveComponentData[i].ApproverList = [];
          nodedata.ApproverList.forEach(useritem => {
            let approverItem = { "userID": useritem.ITCode,"userEN": useritem.ITCode,"userCN":useritem.UserName};
            approveComponentData[i].ApproverList.push(approverItem);
          });
        }
      });
      return approveComponentData;
    }else{//将组件数据转化成后台数据
      let backwfData = JSON.parse(JSON.stringify(data));
      data.forEach((nodedata,i) => {
        if (nodedata.UserSettings && nodedata.UserSettings.length > 0) {
          backwfData[i].UserSettings = [];
          nodedata.UserSettings.forEach(useritem => {
            let approverItem = { "ITCode": useritem.userEN,"UserName": useritem.userCN};
            if (useritem.Group) {
              approverItem["Group"] = useritem.Group;
            }
            backwfData[i].UserSettings.push(approverItem);
          });
        }
        if (nodedata.ApproverList && nodedata.ApproverList.length > 0) {
          backwfData[i].ApproverList = [];
          nodedata.ApproverList.forEach(useritem => {
            let approverItem = { "ITCode": useritem.userEN,"UserName":useritem.userCN};
            backwfData[i].ApproverList.push(approverItem);
          });
        }
      });
      return backwfData;
    }
    
  }

  //用印信息与用印审批人处理
  sealSelectData(sealdata){
    if (sealdata && sealdata.length > 0) {
      let sealApprover = [];
      let tempArr = [];//去重
      sealdata.forEach(item => {
        let itcodeArr = item.ManagerItcodes.split(";");
        let nameArr = item.ManagerNames.split(";");
        itcodeArr.forEach((itcode,i) => {
          if (tempArr.indexOf(itcode) == -1) {
            tempArr.push(itcode);
            let approverItem = { "userID": itcode,"userEN": itcode,"userCN":nameArr[i], "Group":item.SealCode};
            sealApprover.push(approverItem);
          }
        });
      });
      this.WFApproverDataComponent[this.WFApproverDataComponent.length-1]["UserSettings"] = sealApprover;
    }else{
      this.WFApproverDataComponent[this.WFApproverDataComponent.length-1]["UserSettings"] = [];
    }
  }

  //平台与风险岗审批人处理
  riskSelectData(risknodeinfo){
    if (risknodeinfo && risknodeinfo.length>0) {
      let retultRiskApprover = JSON.parse(risknodeinfo[0]["ApproverList"]);
      let newRiskApprover = [];
      retultRiskApprover.forEach(item => {
        let approverItem = { "userID": item.ITCode,"userEN": item.ITCode,"userCN":item.UserName };
        newRiskApprover.push(approverItem);
      });
      if (this.WFApproverDataComponent && this.WFApproverDataComponent.length>0) {
        this.WFApproverDataComponent.forEach((item, index) => {
          if (item.NodeID === 7) {//风险岗
            this.WFApproverDataComponent[index]["ApproverList"] = newRiskApprover;
          }
        });
      }
    }
  }

  //审批人必填项校验
  wfApproverRequireValid(wfdata){
    let valid = true;
    let needValidAppData = wfdata.filter((item) => {
      return item["IsOpened"] == 1 && item["NodeAttribute"] == "Editable" && item["IfRequired"] == 1;
    });
    for (var index = 0; index < needValidAppData.length; index++) {
      var element = needValidAppData[index];
      if (!element["UserSettings"] || (element["UserSettings"] && element["UserSettings"].length == 0)) {
        valid = false;
        this.windowService.alert({ message: "请选择" + element["NodeName"] + "审批人", type: "warn" });
        break;
      }
    }
    return valid;
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
  
  //附件下载
  onClickFile(ev){
    if(ev.indexOf("http") >= 0){
      window.open(ev);
    }else{
      window.open(this.scService.upFilesDownload(ev));
    }
  }

}
