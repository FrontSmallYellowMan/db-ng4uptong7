import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PcService, ApplySearch, ApproveSearch } from "../../service/pc-service";
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import { dbomsPath } from "environments/environment";
import { Pager } from "../../../../shared/index";
import { MenuOperation } from "../../service/menu-config-service";
import * as moment from 'moment';
declare var $: any;
declare var window: any;

@Component({
  selector: 'db-pc-list',
  templateUrl: './pc-list.component.html',
  styleUrls: ['./pc-list.component.scss']
})
export class PcListComponent implements OnInit {

  constructor(
    private pcService: PcService,
    private router: Router,
    private windowService: WindowService) { }
    
  menuOperation = new MenuOperation();
  applyDataList: any = [];//当前列表数据
  approveDataList: any = [];//当前列表数据
  applyQuery: ApplySearch = new ApplySearch();//我的申请 数据查询参数
  approveQuery: ApproveSearch = new ApproveSearch();//我的审批 数据查询参数
  userInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  bizScopeCode = "";//业务范围代码
  menuType = "apply";//我的申请-apply 我的审批-approval
  //approval-审批中 completed-已完成 all-全部 draft-草稿
  //waitapproval-待我审批 examinedapproved-我已审批 allapproval-全部
  secondMenuType = "approval";
  showSearch = false;//是否显示高级搜索
  applyPager: Pager = new Pager();//我的申请分页
  approvePager: Pager = new Pager();//我的审批分页
  companyData = [];//我方主体下拉框数据源
  DepartmentList = [];//本部下拉框数据源
  BusinessList = [];//事业部下拉框数据源
  PlatformList = [];//平台下拉框数据源
  departmentAndBusinessList = [];//事业部 本部
  loading: any = false;
  waitApprovalCount = 0;//待我审批任务数量
  needRefresh = false;//是否需要刷新
  needResetPageNumber = false;//是否需要重置分页控件页码
  ngOnInit() {
    if (this.userInfo)
      this.bizScopeCode = this.userInfo.YWFWDM;
    this.getBaseData();
    this.onSearch();
    this.getApproverTotal();
    window.addEventListener("focus", () => {
      if (this.needRefresh == true) {
        this.onSearch();
        this.getApproverTotal();
      }
    });
  }

  //申请、审批Tab切换
  tabMenu(menuType) {
    if (menuType != this.menuType) {
      if (menuType == "apply") {
        this.secondMenuType = "approval";
      }
      if (menuType == "approval") {
        this.secondMenuType = "waitapproval";
        this.getApproverTotal();
      }
      this.showSearch = false;
      this.menuType = menuType;
      this.onSearch();
      if (menuType == "approval" && this.PlatformList.length == 0) {
        this.getBaseData();
      }
    }
  }
  //审批中、已完成、全部、草稿Tab切换
  secondTabMenu(secondMenuType) {
    switch (secondMenuType) {
      case "approval":
        this.applyQuery.PU_Status = "1";
        break;
      case "completed":
        this.applyQuery.PU_Status = "2";
        break;
      case "all":
        this.applyQuery.PU_Status = "-1";
        break;
      case "draft":
        this.applyQuery.PU_Status = "0";
        break;
      case "waitapproval":
        this.approveQuery.taskstatus = "0";
        this.approveQuery.IsRecovery = null;
        break;
      case "examinedapproved":
        this.approveQuery.taskstatus = "1";
        break;
      case "allapproval":
        this.approveQuery.taskstatus = "2";
        break;
    }
    if (secondMenuType != this.secondMenuType) {
      this.secondMenuType = secondMenuType;
      this.needResetPageNumber = true;
      this.onSearch();
    }
  }

  //初始化下拉框数据
  getBaseData() {
    if (this.menuType == "apply") {
      this.pcService.getCompanyData().subscribe(data => {
        if (data.Result) {
          this.companyData = JSON.parse(data.Data)["CompanyList"];
        }
      });
    }else{
    this.pcService.getDepartmentPlatform().subscribe(
      data => {
        if(data.Result){
          let resuleData = JSON.parse(data.Data);
          this.departmentAndBusinessList = resuleData["DepartmentList"];
          this.PlatformList = resuleData.PlatformList;
        }else{
          this.windowService.alert({ message: "获取下拉框数据失败", type: "fail" });
        }
      }
    );
    }
  }

  //获取数据
  onSearch(seatchtype?) {
    this.loading = true;
    if (this.menuType == "apply") {
      this.applyQuery.currentpage = this.applyPager.pageNo;
      this.applyQuery.pagesize = this.applyPager.pageSize;
      if (seatchtype == 'btnSearch' || this.needResetPageNumber) {
        this.applyQuery.currentpage = 1;
        this.needResetPageNumber = true;
      }
      if (this.applyQuery.SubmitTimeStart) {
        this.applyQuery.SubmitTimeStart = moment(this.applyQuery.SubmitTimeStart).format("YYYY-MM-DD");
      }
      if (this.applyQuery.SubmitTimeEnd) {
        this.applyQuery.SubmitTimeEnd = moment(this.applyQuery.SubmitTimeEnd).format("YYYY-MM-DD");
      }
      this.pcService.getMyApplyList(this.applyQuery).subscribe(data => {
        if (data.Result) {
          this.needRefresh = false;
          this.loading = false;
          let dataList = JSON.parse(data.Data);
          this.applyDataList = dataList["ContractList"];
          this.applyPager.total = dataList["totalnum"];
          this.applyPager.totalPages = Math.ceil(dataList["totalnum"]/this.applyPager.pageSize);
          if (this.needResetPageNumber) {
            this.applyPager.pageNo = 1;
            this.needResetPageNumber = false;
          }
        } else {
          this.windowService.alert({ message: "数据获取失败", type: "fail" });
        }
      });
    }else{
      //获取我的审批 查询条件下拉框数据源

      //获取我的审批列表数据
      this.approveQuery.currentpage = this.approvePager.pageNo;
      this.approveQuery.pagesize = this.approvePager.pageSize;
      if (seatchtype == 'btnSearch' || this.needResetPageNumber) {
        this.approveQuery.currentpage = 1;
        this.needResetPageNumber = true;
      }
      if (this.approveQuery.SubmitTimeStart) {
        this.approveQuery.SubmitTimeStart = moment(this.approveQuery.SubmitTimeStart).format("YYYY-MM-DD");
      }
      if (this.approveQuery.SubmitTimeEnd) {
        this.approveQuery.SubmitTimeEnd = moment(this.approveQuery.SubmitTimeEnd).format("YYYY-MM-DD");
      }
      if (this.approveQuery.SealApprovalTimeStart) {
        this.approveQuery.SealApprovalTimeStart = moment(this.approveQuery.SealApprovalTimeStart).format("YYYY-MM-DD");
      }
      if (this.approveQuery.SealApprovalTimeEnd) {
        this.approveQuery.SealApprovalTimeEnd = moment(this.approveQuery.SealApprovalTimeEnd).format("YYYY-MM-DD");
      }
      this.pcService.getForMyApproveList(this.approveQuery).subscribe(data => {
        if (data.Result) {
          this.needRefresh = false;
          this.loading = false;
          let dataList = JSON.parse(data.Data);
          this.approveDataList = dataList["listtask"];
          this.approvePager.total = dataList["TotalCount"];
          this.approvePager.totalPages = Math.ceil(dataList["TotalCount"]/this.approvePager.pageSize);
          if (this.needResetPageNumber) {
            this.approvePager.pageNo = 1;
            this.needResetPageNumber = false;
          }
        } else {
          this.windowService.alert({ message: "数据获取失败", type: "fail" });
        }
      });
    }
  }

  getDate(date, flag) {
    let dataObj = new Date(date);
    let year = dataObj.getFullYear();
    let month = (dataObj.getMonth() + 1).toString();
    let day = dataObj.getDate().toString();
    if (month.length == 1) {
      month = "0" + month
    }
    if (Number(day) < 10) {
      day = "0" + day;
    }
    let temp = year + "-" + month + "-" + day;
    if (flag == "start") {
      this.applyQuery.SealApprovalTimeStart = temp;
    } else if (flag == "end") {
      this.applyQuery.SealApprovalTimeEnd = temp;
    }
  }

  onReset() {
    if (this.menuType == "apply") {
      this.applyQuery = new ApplySearch();
      this.applyPager.pageNo = this.applyQuery.currentpage;
      this.applyPager.pageSize = this.applyQuery.pagesize;
    } else {
      this.approveQuery = new ApproveSearch();
      this.approvePager.pageNo = this.approveQuery.currentpage;
      this.approvePager.pageSize = this.approveQuery.pagesize;
    }
    switch (this.secondMenuType) {
      case "approval":
        this.applyQuery.PU_Status = "1";
        break;
      case "completed":
        this.applyQuery.PU_Status = "2";
        break;
      case "all":
        this.applyQuery.PU_Status = "-1";
        break;
      case "draft":
        this.applyQuery.PU_Status = "0";
        break;
      case "waitapproval":
        this.approveQuery.taskstatus = "0";
        break;
      case "examinedapproved":
        this.approveQuery.taskstatus = "1";
        break;
      case "allapproval":
        this.approveQuery.taskstatus = "2";
        break;
    }
    this.onSearch();
  }

  getApproverTotal() {
    this.pcService.getForMyApproveCount().subscribe(data => {
      if (data.Result) {
        this.waitApprovalCount = JSON.parse(data.Data)["TotalCount"];
      }
    });
  }

  onDelete(item) {
    this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: (v) => {
          if (v) {
            let callback = (data) => {
              if (data.Result) {
                this.windowService.alert({ message: "删除成功", type: "success" });
                this.onSearch();
              } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
              }
            }
            this.pcService.deletePurchaseByPU_Code(item["PU_Code"]).subscribe(callback);
          }
        }
      });
  }

  //点击表格行 跳转页面
  onClickTr(item) {
    this.needRefresh = true;
    //0草稿  1 提交  2己完成  3驳回
    if (item["PU_Status"] === 0 || item["PU_Status"] === 3 || item["PU_Status"] === "0" || item["PU_Status"] === "3") {
      if (item["PurchaseApplyCode"]) {//通过采购申请创建的数据不可以编辑，只能查看
        window.open(dbomsPath + "india/pc-view?pu_code=" + item["PU_Code"]);
      }else {
        window.open(dbomsPath + "india/pc-apply?pu_code=" + item["PU_Code"]);
      }
    }else if(item["PU_Status"] === 2 || item["PU_Status"] === "2") {
      window.open(dbomsPath + "india/pc-view?pu_code=" + item["PU_Code"]);
    }else{
      if (this.menuType == "approval" && this.secondMenuType === "waitapproval") {
        let str = item["taskTableURL"].slice(item["taskTableURL"].indexOf("india/"));
        window.open(dbomsPath + str);
      }else{
        window.open(dbomsPath + "india/pc-view?pu_code=" + item["PU_Code"]);
      }
    }
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
  
  toggleSearch(){
    this.showSearch ? this.showSearch = false : this.showSearch = true;
  }
  
  addCallBack(){
    this.needRefresh = true;
  }

}
