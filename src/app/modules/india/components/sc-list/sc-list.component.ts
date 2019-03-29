import { Component, OnInit } from '@angular/core';
import { ScService,ApplySearch,ApproveSearch } from "../../service/sc-service";
import { Pager } from 'app/shared/index';
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import { EcContractCommonClass } from "../ectemplates/common/utilityclass/eccontractcommon";
import { dbomsPath } from "environments/environment";
import { MenuOperation } from "../../service/menu-config-service";
import * as moment from 'moment';
import { ScRelieveService } from "../../service/sc-relieve.service";
declare var $: any;
declare var window: any;

@Component({
  selector: 'db-sc-list',
  templateUrl: './sc-list.component.html',
  styleUrls: ['./sc-list.component.scss']
})
export class ScListComponent implements OnInit {

  constructor(
    private scService:ScService, 
    private relieveService : ScRelieveService,
    private router: Router,
    private windowService: WindowService) { }
  menuOperation = new MenuOperation();
  ecContractCommonClass = new EcContractCommonClass();
  //缺省时模板中绑定使用
  currentDataTypeName:string = "审批中";
  // apply/我的申请 approval/我的审批
  currentMenuType:string = "apply";
  // 我的申请 approval/审批中 completed/已完成 all/全部 draft/草稿
  // 我的审批 waitapproval/待我审批 examinedapproved/我已审批 allapproval/全部
  currentDataState:string = "approval";
  //当前列表数据
  currentTableData: any = [];
  //我的申请 数据查询参数
  query: ApplySearch = new ApplySearch();
  //我的审批 数据查询参数
  approveQuery: ApproveSearch = new ApproveSearch();
  userInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  //待我审批任务数量
  myApproverTotal: any = 0;
  //是否首次加载
  isInitLoad: boolean = true;
  //分页
  pagerData = new Pager();
  //缺省标识
  default: boolean = true;
  //是否显示高级搜索
  searchState: boolean = false;
  //表格 列呈现描述
  table_col_isView = {
    currentNode: true,
    currentUser: true,
    SubmitTime: true,
    operation: true,
    SalesName: true,
    ApplyName: true
  }
  departmentAndBusinessList = [];//事业部 本部
  companyData = [];//我方主体
  DepartmentList = [];//本部
  BusinessList = [];//事业部
  PlatformList = [];//平台
  bizScopeCode = "GQ01";
  noticeIsOpre: boolean = true;//采购通知是可点击
  needRefresh = false;//是否需要刷新
  loading: any = false;
  sortRule: string = "up";//列表排序 up-升序 down-降序
  ngOnInit() {
    if (this.userInfo) {
      this.query.CreateITcode = this.approveQuery.CreateITcode = this.userInfo.ITCode;
      if(this.userInfo.YWFWDM){
        this.bizScopeCode = this.userInfo.YWFWDM;
      }else{
        this.bizScopeCode = "GQ01";
      }
    } else {
      // 未登录 跳转到登录页面
      this.router.navigate(['/login']);
    }
    this.initBaseData();
    this.initTableView(this.currentMenuType, this.currentDataState);
    this.onReset();
    this.initMyApproverTotal();

    window.addEventListener("focus", () => {
      if (this.needRefresh == true) {
        this.onSearch();
      }
    });
  }

  //申请、审批Tab切换
  tabMenu(menuType){
    let _flag = false;
    this.searchState = false;
    if(menuType === "approval"){
      this.currentDataState = "waitapproval";
    }else{
      this.currentDataState = "approval";
    }
    this.stateChange(this.currentDataState);
    _flag = menuType !== this.currentMenuType;
    this.currentMenuType = menuType;
    if (_flag) {
      this.onReset();
    }    
    this.initTableView(this.currentMenuType, this.currentDataState);
  }
  //审批中、已完成、全部、草稿Tab切换
  tabData(dataState){
    this.stateChange(dataState);
    if (dataState !== this.currentDataState) {
      this.currentDataState = dataState;
      this.onReset();
    }
    this.initTableView(this.currentMenuType, this.currentDataState);
  }

  //初始化下拉框数据
  initBaseData(){
    this.scService.getAllCompanyData().subscribe(
      data => {
        if(data.Result){
          this.companyData = JSON.parse(data.Data).CompanyList;
        }else{
          this.windowService.alert({ message: "获取我方主体信息失败", type: "fail" });
        }
      }
    );
    this.scService.getAppSelectData().subscribe(
      data => {
        if(data.Result){
          let resuleData = JSON.parse(data.Data);
          this.departmentAndBusinessList = resuleData["DepartmentList"];
          let tempdata = this.analysisDepartmentList(this.departmentAndBusinessList);
          this.DepartmentList = tempdata["DepartmentList"];
          this.BusinessList = tempdata["BusinessList"];
          this.PlatformList = resuleData.PlatformList;
        }else{
          this.windowService.alert({ message: "获取下拉框数据失败", type: "fail" });
        }
      }
    );
  }

  analysisDepartmentList(DepartmentList:any = []){
    let data = {
      DepartmentList: [],
      BusinessList: [],
    };
    DepartmentList.map(function (item) {
      let bbmcObj = {BBMC:""};
      let sybmcObj = {SYBMC:""};
      bbmcObj.BBMC = item["BBMC"];
      data.DepartmentList.push(bbmcObj);
      for (var i in item["SYBMC"]) {
        sybmcObj.SYBMC = item["SYBMC"][i];
        data.BusinessList.push(sybmcObj);
      }
    });
    return data;
  }

  onDepartmentChange(value){
    if (value) {
      let _that = this;
      for(let i = 0; i<this.departmentAndBusinessList.length-1; i++){
        let tempItem = this.departmentAndBusinessList[i];
        if (tempItem["BBMC"] === value) {
          _that.approveQuery["BusinessUnit"] = "";
          _that.BusinessList.length = 0;
          tempItem["SYBMC"].forEach(element => {
            _that.BusinessList.push({ SYBMC: element });
          });
          break;
        }
      }   
    }
  }

  //查询我的申请数据
  getListData(params, event?){
    this.loading = true;
    if(!!event){
      this.query.pagesize = event.pageSize;
      this.query.currentpage = event.pageNo;
      this.approveQuery.pagesize = event.pageSize;
      this.approveQuery.currentpage = event.pageNo;
    }
    if (this.currentMenuType == "apply") {
      if (this.query.SealApprovalTimeStart) {
        this.query.SealApprovalTimeStart = moment(this.query.SealApprovalTimeStart).format("YYYY-MM-DD");
      }
      if (this.query.SealApprovalTimeEnd) {
        this.query.SealApprovalTimeEnd = moment(this.query.SealApprovalTimeEnd).format("YYYY-MM-DD");
      }
      let observable = this.scService.getMyApplyData(params);
      if (observable) {
        this.getData_Callback(observable);
      }
    } else {
      if (this.approveQuery.FinishTimeBegin) {
        this.approveQuery.FinishTimeBegin = moment(this.approveQuery.FinishTimeBegin).format("YYYY-MM-DD");
      }
      if (this.approveQuery.FinishTimeEnd) {
        this.approveQuery.FinishTimeEnd = moment(this.approveQuery.FinishTimeEnd).format("YYYY-MM-DD");
      }
      let observable = this.scService.getMyApprovData(params);
      if (observable) {
        this.getData_Callback(observable);
      }
    }
  }
  //业务处理
  getData_Callback(observable) {
    observable.subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          if (data.Data) {
            let resData = JSON.parse(data.Data);
            let total:number;
            let totalPages:number;
            if (this.currentMenuType == "apply" && resData.ContractList) {
              this.currentTableData = resData.ContractList;
              total = Number(resData.totalnum);
              totalPages = Math.ceil(resData.totalnum / resData.pagecount);
              this.initPager(this.pagerData, total, totalPages);
            } else if (this.currentMenuType == "approval" && resData.TaskList) {
              this.currentTableData = resData.TaskList;
              total = Number(resData.allcount);
              totalPages = Math.ceil(resData.allcount / resData.pagesize);
              this.initPager(this.pagerData, total, totalPages);
              if (this.needRefresh) {
                this.initMyApproverTotal();
              }
            }
            if(this.currentTableData.length > 0){
              this.default = false;
            }else{
              this.default = true;
            } 
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
        this.needRefresh = false;
      });
  }
  //初始化分页器
  initPager(pager = this.pagerData, total, totalPages){
    let customSetting =  JSON.parse(window.localStorage.getItem('iq_custom_setting'));
    let pageSize = 10;
    if (customSetting) {
      pageSize = customSetting["pageSize"] || 10;
    }
    pager.set({
      pageSize: pageSize, //默认10条
      total: total,
      totalPages: totalPages
    });
  }

  stateChange(type){
    this.pagerData.pageNo = 1;
    this.query.currentpage = 1;
    this.query.pagesize = 10;
    this.approveQuery.currentpage = 1;
    this.approveQuery.pagesize = 10;
    switch (type) {
      case "approval":
        this.query.ContractState = "1";
        this.currentDataTypeName = "审批中";
        break;
      case "completed":
        this.query.ContractState = "2";
        this.currentDataTypeName = "已完成";
        break;
      case "all":
        this.query.ContractState = "-1";
        this.currentDataTypeName = "全部";
        break;
      case "draft":
        this.query.ContractState = "0";
        this.currentDataTypeName = "草稿";
        break;
      case "waitapproval":
        this.approveQuery.QueryType="ToDo";
        this.currentDataTypeName = "待我审批";
        break;
      case "examinedapproved":
        this.approveQuery.QueryType="Done";
        this.currentDataTypeName = "我已审批";
        break;
      case "allapproval":
        this.approveQuery.QueryType="All";
        this.currentDataTypeName = "全部";
        break;
      default:
        break;
    }
  }

  //列表排序
  sortCurrentTableData(){
    if (this.sortRule == "up") {
      this.sortRule = "down";
      this.currentTableData = this.currentTableData.sort(function(a, b) {
        return a.SubmitTime > b.SubmitTime ? 1 : -1;
      });
    }else {
      this.sortRule = "up";
      this.currentTableData = this.currentTableData.sort(function(a, b) {
        return a.SubmitTime < b.SubmitTime ? 1 : -1;
      });
    }
  }

  toggleSearchState(){
    this.searchState ? this.searchState = false : this.searchState = true;
  }

  //初始化列表显示
  initTableView(menuType,dataState){
    if (menuType == "apply") {//我的申请
      switch (dataState) {
        case "approval":
        case "all":
          this.table_col_isView = {
            currentNode: false,
            currentUser: false,
            SubmitTime: false,
            operation: true,
            SalesName: false,
            ApplyName: true
          }
          break;
        case "completed":
          this.table_col_isView = {
            currentNode: true,
            currentUser: true,
            SubmitTime: false,
            operation: true,
            SalesName: false,
            ApplyName: true
          }
          break;
        case "draft":
          this.table_col_isView = {
            currentNode: true,
            currentUser: true,
            SubmitTime: false,
            operation: false,
            SalesName: false,
            ApplyName: true
          }
          break;
        default:
          break;
      }
    } else {//我的审批
      switch (dataState) {
        case "examinedapproved":
        case "allapproval":
          this.table_col_isView = {
            currentNode: true,
            currentUser: true,
            SubmitTime: true,
            operation: true,
            SalesName: false,
            ApplyName: true
          }
          break;
        case "waitapproval":
          this.approveQuery.IsRecovery = null;
          this.table_col_isView = {
            currentNode: true,
            currentUser: true,
            SubmitTime: true,
            operation: true,
            SalesName: false,
            ApplyName: true
          }
          break;
        default:
          break;
      }
    }
  }

  onSearch(){
    this.getListData(this.currentMenuType == "apply"? this.query : this.approveQuery);
  }
  onReset() {
    let customSetting =  JSON.parse(window.localStorage.getItem('iq_custom_setting'));
    let pageSize = 10;
    if (customSetting) {
      pageSize = customSetting["pageSize"] || 10;
    }
    switch (this.currentDataState) {
      case "approval":
        this.query.ContractState = "1";
        break;
      case "completed":
        this.query.ContractState = "2";
        break;
      case "all":
        this.query.ContractState = "-1";
        break;
      case "draft":
        this.query.ContractState = "0";
        break;
      case "waitapproval":
        this.approveQuery.QueryType="ToDo";
        break;
      case "examinedapproved":
        this.approveQuery.QueryType="Done";
        break;
      case "allapproval":
        this.approveQuery.QueryType="All";
        break;
    }
    if (this.currentMenuType == "apply") {
      let state = this.query.ContractState;
      let itCode =  this.userInfo.ITCode;
      this.query = new ApplySearch();
      this.query.ContractState = state;
      this.query.CreateITcode = itCode;
      this.query.pagesize = pageSize;
    } else {
      let QueryType = this.approveQuery.QueryType;
      let itCode =  this.userInfo.ITCode
      this.approveQuery = new ApproveSearch();
      this.approveQuery.QueryType = QueryType;
      this.approveQuery.CreateITcode = itCode;
      this.approveQuery.pagesize = pageSize;
    }
    $(".iradio_square-blue").removeClass('checked');
    this.getListData(this.currentMenuType == "apply" ? this.query : this.approveQuery);
  }

  initMyApproverTotal() {
    let customSetting = JSON.parse(window.localStorage.getItem('iq_custom_setting'));
    let pageSize = 10;
    if (customSetting) {
      pageSize = customSetting["pageSize"] || 10;
    }
    let itCode = this.userInfo.ITCode;
    let QueryType = this.approveQuery.QueryType;
    this.approveQuery = new ApproveSearch();
    this.approveQuery.QueryType = QueryType;
    this.approveQuery.CreateITcode = itCode;
    this.approveQuery.pagesize = pageSize;
    this.scService.getMyApprovData(this.approveQuery).subscribe(data => {
      if (data.Result) {
        let resData = JSON.parse(data.Data);
        $("#myApproverTotal").html(resData.allcount);
      }
    });
  }

  onDelete(item) {
    let sc_code = item["SC_Code"];
    if (sc_code) {
      let scType = item["SCType"];
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: (v) => {
          if (v) {
            let temp = (data) => {
              if (data.Result) {
                this.windowService.alert({ message: "删除成功", type: "success" });
                this.onReset();
              } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
              }
            }
            if(scType == "0"){
              this.scService.deleteEContract(sc_code).subscribe(temp);
            }else {
              this.scService.deleteSContract(sc_code).subscribe(temp);
            }
            
          }
        }
      });
    }
  }

  //点击表格行 跳转页面
  onClickTr(item){
    this.needRefresh = true;
    let targetUrl:string = "india/tplmake";
    switch (this.currentDataState) {
      case "approval":
      case "completed":
      case "waitapproval":
      case "allapproval":
        let str = item["ApprovalTaskUrl"];
        if (str) {//审批
          if (item.EBContractID) {//eb合同
            window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"]);
          } else {
            window.open(dbomsPath + str.substr(str.indexOf("india")));
          }
        } else {//查看
          if (item.SCType == "3") {//变更合同
            window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"] + "&operatype=2");
          } else if (item.SCType == "2") {//解除合同
            window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"] + "&operatype=3");
          } else if (item.SCType == "5") {//单章作废合同
            window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"] + "&operatype=5");
          } else {
            window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"]);
          }
        }
        break;
      case "draft":
      case "all":
      case "examinedapproved":
        let scType = item.SCType;
        let SC_Status = item.SC_Status;
        //scType 0:电子合同阶段 1:销售合同阶段  2:解除合同阶段 3:变更合同阶段 4:EB对接销售合同 5:单章作废阶段
        if (scType == "0") {
          targetUrl = this.ecContractCommonClass.returnECRouterUrlByTemplateID(item["TemplateID"]);
        }else if(scType == "2" && (SC_Status == "0" || SC_Status == "3")){
          console.log(item.MainContractCode.indexOf("UD") == 0, this.endWith(item.MainContractCode,"JC"));
          
          
          if (item.MainContractCode.indexOf("UD") == 0 && this.endWith(item.MainContractCode,"JC")) {
            targetUrl = "india/sc-udrelieve";
          }else{
            targetUrl = "india/sc-relieve";
          }
        }else if(scType == "3" && (SC_Status == "0" || SC_Status == "3")){
          targetUrl = "india/sc-change";
        }else if(scType == "5" && (SC_Status == "0" || SC_Status == "3")){
          targetUrl = "india/sc-singlesealcancel";
        }else{
          if (SC_Status == "0" || SC_Status == "3") {
            if (item.EBContractID) {//eb合同
              targetUrl = "india/contractview";
            }else{
              targetUrl = "india/contract";
            }
          }else{
            targetUrl = "india/contractview";
          }
        }
        if(scType == "2"){
          window.open(dbomsPath + targetUrl + "?SC_Code=" + item["SC_Code"] + "&operatype=3");
        }else if(scType == "3"){
          window.open(dbomsPath + targetUrl + "?SC_Code=" + item["SC_Code"] + "&operatype=2");
        }else if(scType == "5"){
          window.open(dbomsPath + targetUrl + "?SC_Code=" + item["SC_Code"] + "&operatype=5");
        }else{
          window.open(dbomsPath + targetUrl + "?SC_Code=" + item["SC_Code"]);
        }
        break;
      default:
        break;
    }
  }
  
  //采购通知
  notice(item){
    let id = item["SC_Code"];
    let PurchaseNotified = item['PurchaseNotified'];
    if(id && (PurchaseNotified == 0 || PurchaseNotified == null)){
      this.scService.UpdatePurchaseNotified(id).subscribe(data => {
        if (data.Result) {
          this.noticeIsOpre = false;
          item['PurchaseNotified'] = 1;
          this.windowService.alert({ message: "通知成功！", type: "success" });
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }

  addCallBack(){
    this.needRefresh = true;
  }

  //变更
  contractChange(item){
    this.needRefresh = true;
    window.open(dbomsPath + "india/sc-change" + "?SC_Code=" + item["SC_Code"] + "&operatype=1");
  }
  //解除
  contractRelieve(item){
    this.needRefresh = true;
    this.relieveService.checkRelieveStatus(item["SC_Code"]).subscribe(data => {
      if (data.Result) {
        switch (data.Data) {
          case "1":
            this.windowService.alert({ message: "己有写入ERP的销售订单不允许解除合同", type: "warn" });
            break;
          case "2":
            this.windowService.confirm({ message: "此销售合同已经建立过采购申请或采购订单,是否解除" }).subscribe({
              next: (v) => {
                if (v) 
                  if (item.MainContractCode.indexOf("UD") == 0){
                    window.open(dbomsPath + "india/sc-udrelieve" + "?SC_Code=" + item["SC_Code"]);
                  }else{
                    window.open(dbomsPath + "india/sc-relieve" + "?SC_Code=" + item["SC_Code"]);
                  }
              }
            });
            break;
          case "3":
            if (item.MainContractCode.indexOf("UD") == 0){
              window.open(dbomsPath + "india/sc-udrelieve" + "?SC_Code=" + item["SC_Code"]);
            }else{
              window.open(dbomsPath + "india/sc-relieve" + "?SC_Code=" + item["SC_Code"]);
            }
            break;
          default:
            this.windowService.alert({ message: data.Message, type: "fail" });
            break;
        }
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //单章作废
  contractSingleSealCancel(item){
    this.needRefresh = true;
    this.relieveService.checkNullifyStatus(item["SC_Code"]).subscribe(data => {
      if (data.Result) {
        window.open(dbomsPath + "india/sc-singlesealcancel" + "?SC_Code=" + item["SC_Code"] + "&operatype=4");
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  endWith = function (str,endStr) {
    var d = str.length - endStr.length;
    return (d >= 0 && str.lastIndexOf(endStr) == d)
  }
}
