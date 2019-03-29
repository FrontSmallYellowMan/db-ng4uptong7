import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import * as moment from 'moment';
import { Pager } from 'app/shared/index';
import { SealSearchService, SealSearchQuery } from "../../service/sc-seal-search.service";
import { dbomsPath } from "environments/environment";
declare var window;

@Component({
  selector: 'db-sc-seal-search',
  templateUrl: './sc-seal-search.component.html',
  styleUrls: ['./sc-seal-search.component.scss']
})
export class ScSealSearchComponent implements OnInit {


  constructor(
    private router: Router,
    private sealService: SealSearchService,
    private windowService: WindowService) { }

  query: SealSearchQuery = new SealSearchQuery();//查询条件
  companyData: any[] = [];//所属公司
  platformData: any[] = [];//所属公司
  departmentAndBusinessList = [];//事业部 本部
  DepartmentList = [];//本部
  BusinessList = [];//事业部
  listData;//列表数据
  loading: boolean = false;
  pagerData = new Pager();//分页
  sortRule: string = "up";//列表排序 up-升序 down-降序
  
  ngOnInit() {
    this.getCompanyData();
    this.getAppSelectData();
    // this.search(this.query,'searchbtn');
  }

  //获取公司列表
  getCompanyData(){
    this.sealService.getCompanyData().subscribe(data => {
      if (data.Result) {
        this.companyData = JSON.parse(data.Data).CompanyList;
      }
    });
  }
  //获取本部，事业部，平台下拉框数据源
  getAppSelectData(){
    this.sealService.getAppSelectData().subscribe(
      data => {
        if(data.Result){
          let resuleData = JSON.parse(data.Data);
          this.departmentAndBusinessList = resuleData["DepartmentList"];
          let tempdata = this.analysisDepartmentList(this.departmentAndBusinessList);
          this.DepartmentList = tempdata["DepartmentList"];
          this.BusinessList = tempdata["BusinessList"];
          this.platformData = resuleData.PlatformList;
        }else{
          this.windowService.alert({ message: "获取下拉框数据失败", type: "fail" });
        }
      }
    );
  }
  //查询
  search(query,type?){
    this.loading = true;
    if (query.FinishTimeBegin) {
      query.FinishTimeBegin = moment(query.FinishTimeBegin).format("YYYY-MM-DD");
    }
    if (query.FinishTimeEnd) {
      query.FinishTimeEnd = moment(query.FinishTimeEnd).format("YYYY-MM-DD");
    }
    if (type) {//点击查询、重置按钮
      this.query.currentpage = 1;
    }else{//分页
      this.query.currentpage = this.pagerData.pageNo;
    }
    this.query.pagesize = this.pagerData.pageSize;
    this.sealService.GetContractInfoFromWorkflow(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.listData = JSON.parse(data.Data);
        this.pagerData.set({
          total: this.listData.allcount,
          totalPages: Math.ceil(this.listData.allcount / this.pagerData.pageSize)
        });
        if (type) {
          this.pagerData.set({pageNo: 1});
        }
      }
    });
  }
  
  //列表排序 盖章完成时间
  sortCurrentTableData(){
    if (this.sortRule == "up") {
      this.sortRule = "down";
      this.listData.TaskList = this.listData.TaskList.sort(function(a, b) {
        return a.SealApprovalTime > b.SealApprovalTime ? 1 : -1;
      });
    }else {
      this.sortRule = "up";
      this.listData.TaskList = this.listData.TaskList.sort(function(a, b) {
        return a.SealApprovalTime < b.SealApprovalTime ? 1 : -1;
      });
    }
  }
  //重置查询条件
  reset(){
    this.query = new SealSearchQuery();
    this.search(this.query,"resetbtn");
  }

  onDepartmentChange(value){
    if (value) {
      let _that = this;
      for(let i = 0; i<this.departmentAndBusinessList.length-1; i++){
        let tempItem = this.departmentAndBusinessList[i];
        if (tempItem["BBMC"] === value) {
          _that.query["BusinessUnit"] = "";
          _that.BusinessList.length = 0;
          tempItem["SYBMC"].forEach(element => {
            _that.BusinessList.push({ SYBMC: element });
          });
          break;
        }
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

  //页面跳转
  routerContractPage(item){
    if (item["ApprovalTaskUrl"]) {//审批
      if (item.EBContractID) {//eb合同
        window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"]);
      } else {
        window.open(dbomsPath + item["ApprovalTaskUrl"].substr(item["ApprovalTaskUrl"].indexOf("india")));
      }
    } else {//查看
      if (item.SCType == "3") {//变更合同
        window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"] + "&operatype=2");
      } else if (item.SCType == "2") {//解除合同
        window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"] + "&operatype=3");
      } else {
        window.open(dbomsPath + "india/contractview" + "?SC_Code=" + item["SC_Code"]);
      }
    }
  }

}
