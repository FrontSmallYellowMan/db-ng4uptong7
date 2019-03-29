import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ScService, SelectData, PlatForm, Buyer, HeadquarterList, BusinessUnitList,AccessList,Access,Seal,PersonInfo } from "../../service/sc-service";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "app/core";
import { Person } from 'app/shared/services/index';
import { NgForm, NgModel } from "@angular/forms";
import { EcContractCommonClass } from "../ectemplates/common/utilityclass/eccontractcommon";
import { PageRefresh } from "../../service/pagerefresh.service";
import { Pager } from 'app/shared/index';
import { BuyerInfo } from '../ectemplates/common/entitytype/electroniccontract';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ScTemplateService } from "../../service/sc-template.service";
import { PCData, PCBaseData, PcService, AccessItem, serverAddress } from "../../service/pc-service";
import { RecordAllowEditStateService, RecordAllowEditStateQuery, RecordState } from "../../../../shared/services/recordalloweditstate.service";
declare var window: any;

@Component({
  selector: 'db-pc-apply',
  templateUrl: './pc-apply.component.html',
  styleUrls: ['./pc-apply.component.scss']
})
export class PcApplyComponent  implements OnInit {

  constructor(
    private recordAllowEditStateService: RecordAllowEditStateService,
    private scService: ScService,
    private pcService: PcService,
    private router: Router,
    private routerInfo: ActivatedRoute,
    private scTplService:ScTemplateService,
    private windowService: WindowService) { }
  
  ecContractCommonClass = new EcContractCommonClass();
  PU_Code;
  formData: PCData = new PCData();//表单数据
  wfHistory: Array<any> = [];//审批历史
  selectData: SelectData = new SelectData();//下拉框数据
  sealInfo: Seal = new Seal();// 用印数据
  accessList: AccessList = new AccessList();//附件数据
  isRiskRole:boolean = false;//是否风险岗
  localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  customerFormData = "";//自定义表单数据
  loading: any = false;
  riskFileApi; //风险附件上传地址
  careerFileApi;//事业部附件上传地址
  hasUploadedFiles = {"AccessoryBus":[],"AccessorySub":[],"AccessorySeal":[],"AccessoryD":[]};
  validMessage = "";
  hasInitBaseInfo = false;//是否已经初始化基本信息
  isUserChange = false;//申请人是否变化
  WFApproverDataComponent;//审批信息
  // @ViewChild('approvers') approvers;//审批组件ID注入
  @ViewChildren(NgModel) inputList;//表单控件
  @ViewChildren("domElement") domElementList;//表单控件
  @ViewChild('form') form: NgForm;
  @ViewChild('applyperson') applyperson;//申请人
  @ViewChild('accessories') accessories;//上传附件组件ID注入
  @ViewChild('seals') seals;//用印组件ID注入
  @ViewChild('modal') modal: ModalComponent;
  ngOnInit() {
    this.riskFileApi = this.scService.uploadSCAccessories(1);
    this.careerFileApi = this.scService.uploadSCAccessories(3);
    this.PU_Code = this.routerInfo.snapshot.queryParams['pu_code'];
    if (this.PU_Code) {
      let recordAllowEditStateQuery = new RecordAllowEditStateQuery();
      recordAllowEditStateQuery.FunctionCode = RecordState.indiaPurchaseContract;
      recordAllowEditStateQuery.RecordID = this.PU_Code;
      recordAllowEditStateQuery.NotAllowEditLink = "/india/pc-view?pu_code=" + this.PU_Code;
      recordAllowEditStateQuery.NotFoundRecordLink = "india/pclist";
      this.recordAllowEditStateService.getRecordAllowEditState(recordAllowEditStateQuery,()=>{
        this.getBaseData();
      });
    }else{
      this.getBaseData();
    }
  }

  //获取下拉框数据 不包含审批人序列信息
  getBaseData() {
    this.loading = true;
    this.pcService.getCurryBaseData().subscribe(
      data => {
        if (data.Result) {
          this.loading = false;
          this.selectData = JSON.parse(data.Data);
          if(this.PU_Code){
            this.getPcData(this.PU_Code);
          }else{
            this.getPcDataCallBack();
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  //获取销售合同数据
  getPcData(PU_Code) {
    if (PU_Code) {
      this.loading = true;
      this.pcService.getPUBaseDataByPUCode(PU_Code).subscribe(
        data => {
          if (data.Result) {
            this.loading = false;
            //业务处理
            let tempData = JSON.parse(data.Data);
            if(tempData.PUBaseData["PU_Status"] == 0 || tempData.PUBaseData["PU_Status"] == 3){
              this.formData = tempData;
              this.getPcDataCallBack(this.formData);
            }else{
                this.windowService.alert({ message: "该合同已进入审批流程", type: "fail" });
                setTimeout(function() {
                  window.close();
                }, 1000);
            }
          } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
    } else {
      this.windowService.alert({ message: "PU_Code为空，获取数据失败!", type: "fail" });
    }
  }
  //获取销售合同数据 回调
  getPcDataCallBack(data = this.formData) {
    let baseData = data.PUBaseData;
    let agentitcode = !baseData.AgentITcode ? this.localUserInfo["ITCode"] : baseData.AgentITcode;
    let agentname = !baseData.AgentITcode ? this.localUserInfo["UserName"] : baseData.AgentName;
    let applytcode = !baseData.ApplyITcode ? this.localUserInfo["ITCode"] : baseData.ApplyITcode;
    let applyname = !baseData.ApplyITcode ? this.localUserInfo["UserName"] : baseData.ApplyName;
    //申请人信息
    baseData.AgentITcode = agentitcode;
    baseData.AgentName = agentname;
    baseData.ApplyITcode = applytcode;
    baseData.ApplyName = applyname;
    let applyperson = new PersonInfo();
    applyperson["itcode"] = applytcode.toLocaleLowerCase();
    applyperson["name"] = applyname;
    applyperson["userID"] = applyperson["itcode"];
    this.applyperson.list.push(new Person(applyperson));
    //流程历史
    if (baseData.PU_Code && baseData.PU_Status == "3") {
      this.getWfData(baseData.PU_Code);
    }
    //币种业务处理
    if (!this.formData.PUBaseData.Currency) {
      this.formData.PUBaseData.Currency = "0001";
    }
    //获取申请人电话
    if (!this.formData.PUBaseData.ApplyTel) {
      this.scService.getUserPhone().subscribe(data => {
        if (data.Result) {
          this.formData.PUBaseData.ApplyTel = data.Data;
        }
      });
    }
    this.getCompanyByitcode();
    this.getDepartmentPlatformByItcode(applytcode);
    //初始化附件上传组件数据源
    this.formData.AccessList.AccessorySeal.forEach(item => {
      let hasUploadedFileItem = {name: "", size: 0};
      hasUploadedFileItem.name = item.AccessoryName;
      this.hasUploadedFiles.AccessorySeal.push(hasUploadedFileItem);
    });
    this.formData.AccessList.AccessoryBus.forEach(item => {
      let hasUploadedFileItem = {name: "", size: 0};
      hasUploadedFileItem.name = item.AccessoryName;
      this.hasUploadedFiles.AccessoryBus.push(hasUploadedFileItem);
    });
    this.formData.AccessList.AccessorySub.forEach(item => {
      let hasUploadedFileItem = {name: "", size: 0};
      hasUploadedFileItem.name = item.AccessoryName;
      this.hasUploadedFiles.AccessorySub.push(hasUploadedFileItem);
    });
    //用印信息
    if (baseData.SealInfoJson) {
      let sealData= JSON.parse(baseData.SealInfoJson);
      this.sealInfo = sealData;
      // this.approvers.sealChange(sealData["SealData"]);//初始化时传入审核组件，用印管理数据
    }
    //业务范围代码
    if (!this.formData.PUBaseData.YWFWDM) {
      this.formData.PUBaseData.YWFWDM = this.localUserInfo["YWFWDM"];
    }
    //审核信息
    if (this.formData.PUBaseData.WFApproveUserJSON&&this.formData.PUBaseData.WFApproveUserJSON!=null) {
      //原审批组件
      // this.approvers.approversChange(JSON.parse(this.formData.PUBaseData.WFApproveUserJSON));
      
      //重做审批人组件
      this.WFApproverDataComponent = this.wfDataConversion(JSON.parse(baseData.WFApproveUserJSON), true);
    }else{
      this.getPUWFInfoBaseData();
    }
    //根据登陆人初始化事业部、平台默认值
    if (!this.PU_Code) {
      this.formData.PUBaseData.PlatformID = this.formData.PUBaseData.PlatformID_C = this.localUserInfo["FlatCode"];
      this.formData.PUBaseData.Platform = this.formData.PUBaseData.Platform_C = this.localUserInfo["FlatName"];
    }
    //获取个性化字段信息
    // let body = {
    //   "BusinessID": baseData.PU_Code,
    //   "BusinessType": "SalesContract"
    // };
    // this.scService.getBussinessFieldConfig(body).subscribe(data => {
    //   if(data.Result){
    //     this.customerFormData = JSON.parse(data.Data);
    //     if (!this.customerFormData) {
    //       this.getRoleFieldConfig(baseData.YWFWDM);
    //     }
    //   }
    // });
  }

  //获取审批节点信息
  getPUWFInfoBaseData(){
    this.pcService.getPUWFInfoBaseData().subscribe(
      data => {
        if (data.Result) {
          // this.selectData["WFApproveUserJSON"] = JSON.parse(data.Data)["WFApproveUserJSON"];
          // this.selectData["WFApproveUserJSON"].forEach(item => {
          //   item["NodeSelectItCode"] = null;
          // });
          // switch (this.formData.PUBaseData.PurchaseType) {
          //   case "0"://核心 采购经理
          //     this.approveUsers[4].IsOpened = 1;
          //     break;
          //   case "2"://新产品 风险法务
          //     this.approveUsers[5].IsOpened = 1;
          //     break;
          //   case "1"://非核心 信控
          //     this.approveUsers[6].IsOpened = 1;
          //     this.getWFFX();
          //     break;
          // }
          // this.approvers.approversChange(this.selectData["WFApproveUserJSON"]);
          // if (this.sealInfo.SealData.length > 0) {
          //   this.approvers.sealChange(this.sealInfo["SealData"]);
          // }
          //审批组件重做
          let WFApproveUserJSON = JSON.parse(data.Data)["WFApproveUserJSON"];
          switch (this.formData.PUBaseData.PurchaseType) {
            case "0"://核心 采购经理
              WFApproveUserJSON[4].IsOpened = 1;
              break;
            case "2"://新产品 风险法务
              WFApproveUserJSON[5].IsOpened = 1;
              break;
            case "1"://非核心 信控
              WFApproveUserJSON[6].IsOpened = 1;
              this.getWFFX();
              break;
          }
          this.WFApproverDataComponent = this.wfDataConversion(WFApproveUserJSON, true);
          if (this.sealInfo.SealData.length > 0) {
            this.sealSelectData(this.sealInfo["SealData"]);
          }
        } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  //我方主体信息
  getCompanyByitcode() {
    this.pcService.getCompanyData().subscribe(
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
          this.formData.PUBaseData.Headquarter = resultData["BBMC"];
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
      let oldPlatformID = this.formData.PUBaseData.PlatformID;
      if((!this.hasInitBaseInfo && !this.formData.PUBaseData.BusinessUnit) || this.isUserChange){
        this.hasInitBaseInfo = true;
        this.isUserChange = false;
        this.formData.PUBaseData.Headquarter = temp.BBMC;
        this.formData.PUBaseData.BusinessUnit = temp.SYBMC;
        this.formData.PUBaseData.PlatformID = temp.FlatCode;
        this.formData.PUBaseData.Platform = temp.FlatName;
        this.formData.PUBaseData.PlatformID_C = temp.FlatCode;
        this.formData.PUBaseData.Platform_C = temp.FlatName;
        this.formData.PUBaseData.ApplyTel = temp.userTel;
      }
      // 判断平台 当前选择人平台 != 已选人平台 清空用印信息(调用用印组件清空用印信息事件) 否则 return
      // if (this.formData.PUBaseData.PlatformID != oldPlatformID) {
      //   this.sealInfo = new Seal();
      //   this.formData.PUBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
      // }else{
      //   return;
      // }
    }
  }

  //选人组件change事件
  changeApplyPerson(userInfo) {
    this.isUserChange = true;
    let oldItcode = this.formData.PUBaseData.ApplyITcode.toString().toUpperCase();
    let itcode = userInfo[0]["itcode"].toString().toUpperCase();
    let name = userInfo[0]["name"];
    if (itcode != oldItcode) {
      this.formData.PUBaseData.ApplyITcode = itcode;
      this.formData.PUBaseData.ApplyName = name;
      this.getDepartmentPlatformByItcode(itcode);
    } else {
      return;
    }
    //重新获取个性化字段信息
    this.getRoleFieldConfig(userInfo[0]["exf8"]);
  }

  //提交流程
  onSubmit() {
    if (this.form.valid && this.wfApproverRequireValid(this.WFApproverDataComponent)) {//验证通过
      //检测用印文件
      if (this.formData.AccessList.AccessorySeal == 0) {
        this.windowService.alert({ message: "请上传用印文件", type: "warn" });
        return;
      }
      //检测用印信息
      if (this.sealInfo.SealData.length == 0) {
        this.windowService.alert({ message: "印章至少应选择一个", type: "warn" });
        return;
      }
      let reg = /^\+?[1-9][0-9]*$/;
      if (!reg.test(this.sealInfo.PrintCount)) {
        this.windowService.alert({ message: "请填写正确的用印份数", type: "warn" });
        return;
      }
      if (!this.formData.PUBaseData.BuyerERPCode) {
        this.formData.PUBaseData.BuyerERPCode = "A";
      }
      this.formData.PUBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
      let WFApproveUserJSON = this.wfDataConversion(this.WFApproverDataComponent, false);
      this.formData.PUBaseData.WFApproveUserJSON = JSON.stringify(WFApproveUserJSON);
      this.pcService.sumitPurchaseContract(this.formData).subscribe(
        data => {
          if (data.Result) {
            this.windowService.alert({ message: "提交成功", type: "success" });
            setTimeout(function() { window.close(); }, 1000);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
      this.updateBaseFieldMsg();
    } else {
      for (let i = 0; i < this.inputList.length; i++) {//遍历表单控件
        if (this.inputList._results[i].invalid) {//验证未通过
          let ele = this.domElementList._results[i];//存储该表单控件元素
          if (ele && ele.nativeElement) {
            ele.nativeElement.focus();//使该表单控件获取焦点
          }
          break;
        }
      }
    }
  }
  //暂存
  onSave(type){
    if (!this.formData.PUBaseData.BuyerERPCode) {
      this.formData.PUBaseData.BuyerERPCode = "A";
    }
    this.formData.PUBaseData.SealInfoJson = JSON.stringify(this.sealInfo);
    let WFApproveUserJSON = this.wfDataConversion(this.WFApproverDataComponent, false);
    this.formData.PUBaseData.WFApproveUserJSON = JSON.stringify(WFApproveUserJSON);
    let body = this.formData;
    this.pcService.savePurchaseContract(body).subscribe(
      data => {
        if (data.Result) {
          if (type == "save") {
            this.windowService.alert({ message: "保存成功", type: "success" });
            setTimeout(function() { window.close(); }, 1000);
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
    this.updateBaseFieldMsg();
  }
  //取消
  onCancel(){
    // this.router.navigate(["/india"]);
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
  updateBaseFieldMsg(){
    if (this.customerFormData) {
      this.customerFormData["BusinessID"] = this.formData.PUBaseData.PU_Code;
      let body = {
        "PUBaseData": JSON.stringify(this.customerFormData)
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
    //原审批组件  用印选择逻辑处理
    // this.approvers.sealChange(e['SealData']);
    this.sealInfo = e;
    //重做审批人组件 用印选择逻辑处理
    this.sealSelectData(e['SealData']);
  }
  
  //附件上传 成功
  fileUploadSuccess(event, type){
    //event = data
    if (event.Result) {
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          let accessItem = new Access();
          accessItem.AccessoryID = item["AccessoryID"];
          accessItem.AccessoryName = item["AccessoryName"];
          accessItem.AccessoryURL = item["AccessoryURL"];
          accessItem.AccessoryType = type;
          switch (type) {
            case 1:
              this.formData.AccessList.AccessoryBus.push(accessItem);
              break;
            case 3:
              this.formData.AccessList.AccessorySub.push(accessItem);
              break;
            case 21:
              this.formData.AccessList.AccessorySeal.push(accessItem);
              break;
          }
        });
      }
    }else{
      this.windowService.alert({ message: event.Message, type: "fail" });
    }
    
  }
  //删除附件
  onDeleteFileItem(event, type) {
    //event = 删除文件的下标
    let item = new Access();
    switch (type) {
      case 1:
        item = this.formData.AccessList.AccessoryBus[event];
        break;
      case 3:
        item = this.formData.AccessList.AccessorySub[event];
        break;
      case 21:
        item = this.formData.AccessList.AccessorySeal[event];
        break;
    }
    if (item.AccessoryID) {
      switch (type) {
        case 1:
          this.formData.AccessList.AccessoryBus.splice(event, 1);
          break;
        case 3:
          this.formData.AccessList.AccessorySub.splice(event, 1);
          break;
        case 21:
          this.formData.AccessList.AccessorySeal.splice(event, 1);
          break;
      }
    }
  }
  //点击单个已经上传的附件
  onClickFile(event, type){
    // event = {item: item, index: i}
    let url = "";
    switch (type) {
      case 1:
        url = this.formData.AccessList.AccessoryBus[event.index].AccessoryURL;
        break;
      case 3:
        url = this.formData.AccessList.AccessorySub[event.index].AccessoryURL;
        break;
      case 21:
        url = this.formData.AccessList.AccessorySeal[event.index].AccessoryURL;
        break;
    }
    window.open(serverAddress + url);
  }

  //原审批组件 输出事件
  scApprover(e) {
    this.formData.PUBaseData.WFApproveUserJSON = JSON.stringify(e);
  }

  //获取审批历史
  getWfData(PU_Code) {
    if (PU_Code) {
      this.pcService.getApprHistoryAndProgress(PU_Code).subscribe(data => {
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

  //事业部 change事件
  onBusinessUnitChange(){
    if (this.formData.PUBaseData.BusinessUnit && this.formData.PUBaseData.BuyerERPCode) {
      this.getPurchaseType();
    }
  }

  //我方主体 change事件
  onCompanyChange(companycode){
    let temp = this.selectData.SellerCompanys.filter(item => { return item.companycode === companycode });
    this.formData.PUBaseData.SellerCompanyCode = temp[0].companycode;
    this.formData.PUBaseData.SellerName = temp[0].company;
  }

  //信控平台 change事件
  onPlatformChange(platformid){
    let temp = this.selectData.PlatForm.filter(item => { return item.FlatCode === platformid });
    this.formData.PUBaseData.PlatformID = this.formData.PUBaseData.PlatformID_C = temp[0].FlatCode;
    this.formData.PUBaseData.Platform = this.formData.PUBaseData.Platform_C = temp[0].FlatName;
    this.getWFFX();
  }
  //用印平台 change事件
  onPlatformChange_C(platformid){
    let temp = this.selectData.PlatForm.filter(item => { return item.FlatCode === platformid });
    this.formData.PUBaseData.PlatformID_C = temp[0].FlatCode;
    this.formData.PUBaseData.Platform_C = temp[0].FlatName;
  }

  //采购类型确认
  getPurchaseType() {
    this.pcService.getPurchaseType(this.formData.PUBaseData.BusinessUnit, this.formData.PUBaseData.BuyerERPCode)
      .subscribe(data => {
        if (data.Result) {
          this.formData.PUBaseData.PurchaseType = data.Data;
          this.getPUWFInfoBaseData();
          // this.approvers.approversChange(this.approveUsers);
        }
      });
  }

  //获取信控审批人信息
  getWFFX(){
    this.pcService.getWFFX(this.formData.PUBaseData.YWFWDM, this.formData.PUBaseData.PlatformID).subscribe(data => {
      if (data.Result) {
        // let riskAppUsersInfo = JSON.parse(data.Data)["WFApproveUserJSON"];
        // if (riskAppUsersInfo.length>0) {
        //   let currentWFInfo = this.approveUsers;
        //   if (currentWFInfo && currentWFInfo.length>0) {
        //     currentWFInfo.forEach((item, index) => {
        //       if (item.NodeID === 8) {//风险岗
        //         currentWFInfo[index]["ApproverList"] = JSON.parse(riskAppUsersInfo[0]["ApproverList"]);
        //       }
        //     });
        //     this.approveUsers = currentWFInfo;
        //     this.approvers.approversChange(currentWFInfo);
        //   }
        // }
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
          if (item.NodeID === 8) {//风险岗
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

/** 买方功能 begin */
  pagerData = new Pager();//
  BuyerInfo: BuyerInfo[];//买方信息 totalItems
  currentPageItems: BuyerInfo[];//当前页需要显示的数据
  totalItems: number = 0;//总共多少项数据
  currentPage: number = 1;//当前页
  pagesize: number = 10;//每页显示多少行
  open() {
    if (!this.formData.PUBaseData.BusinessUnit) {
      this.windowService.alert({ message: "请选择事业部！", type: "fail" });
      return;
    }
    if (!this.formData.PUBaseData.SellerCompanyCode) {
      this.windowService.alert({ message: "请选择我方主体！", type: "fail" });
      return;
    }
    if (this.formData.PUBaseData.BuyerName) {
      this.getBuyerList();
    }
    this.modal.open();
  }
  close() {
    this.BuyerInfo.length = 0;
    this.currentPageItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.modal.close();
  }
  onBuyerNameInput(name){
    if (name) {
      this.validMessage = "";
    }
  }
  //获取买方列表
  getBuyerList() {
    this.loading = true;
    let buyerName = this.formData.PUBaseData.BuyerName;
    if (buyerName) {
      let query = {
        "queryStr": "querycontent", 
        "pageSize": this.pagerData.pageSize, 
        "pageNo": this.pagerData.pageNo, 
        "companycode": this.formData.PUBaseData.SellerCompanyCode, 
        "querycontent": buyerName
      };
      this.pcService.getPageDataVendorFromERP(query).subscribe(
        data => {
          // let buyerArray = data.Data.pagedata;
          // if (data.Result && this.isArray(buyerArray)) {
          //   this.BuyerInfo = buyerArray;
          //   this.totalItems = buyerArray.length;
          //   this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
          //   this.pagerData.set({
          //     total: this.totalItems,
          //     totalPages: Math.ceil(this.totalItems / this.pagesize)
          //   });
          //   this.loading = false;
          // }
          this.currentPageItems = data.Data.pagedata;
          this.pagerData.set(data.Data.pager);
          this.loading = false;
        });
    }else{
      this.loading = false;
      // this.validMessage = "--请输入供应商名称";
    }
  }
  //分页
  onChangePage(event) {
    // this.pagesize = event.pageSize;
    // this.currentPage = event.pageNo;
    // if (this.BuyerInfo && this.BuyerInfo.length > 0) {
    //   this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
    // }
    this.getBuyerList();
  }
  //分页逻辑
  pagination(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
  }
  //列表选择买方
  onSelectedBuyer(item) {
    // this.formData.PUBaseData.BuyerName = item.NAME;
    // this.formData.PUBaseData.BuyerERPCode = item.KUNNR;
    this.formData.PUBaseData.BuyerName = item.vendor;
    this.formData.PUBaseData.BuyerERPCode = item.vendorno;
    this.getPurchaseType();
    this.modal.close();
  }
  //是否数组
  isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  /** 买方功能 end */

}

