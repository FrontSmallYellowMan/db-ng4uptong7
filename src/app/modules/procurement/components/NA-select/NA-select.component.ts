import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { Query,NASelectService } from './../../services/NA-select.service';

@Component({
  templateUrl: 'NA-select.component.html',
  styleUrls: ['NA-select.component.scss', './../../scss/procurement.scss']
})
export class NASelectComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  pagerData = new Pager();
  searchBoxShow = false;//搜索框显示标识

  NAList = [];//NA列表
  selectedList = [];//已选列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果
  applicant = {//申请人
    person: ''
  }

  constructor(
    private NASelectService: NASelectService,
    private windowService: WindowService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.query = new Query();
  }
  clearSearch() {//重置搜索
    this.query = new Query();
    this.applicant.person = "";
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any) {
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.initData(this.query);
  }
  selectedPerson(e) {//选择人员后
    if (JSON.stringify(e) == "[]") {
      this.query.Applicant = null;
    } else {
      this.query.Applicant = e[0]["userEN"];
    }
  }
  initData(query: Query) {
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.NASelectService.getNAList(query).then(data => {
      this.NAList = data.List;
      console.log("列表");
      console.log(this.NAList);
      if (this.NAList && this.NAList.length) {
        let len = this.NAList.length;
        let index; let item;
        let hasSelec = Boolean(this.selectedList && this.selectedList.length);//是否已有选择列表
        if(hasSelec){
          for (let i = 0; i < len; i++) {
            item = this.NAList[i];
            index = this.selectedIndexOf(this.NAList[i]["ID"]);
            if (index != -1) {//检查每个的checked
                item["checked"] = true;
            }
            if (item["CompanyCode"] != this.selectedList[0]["CompanyCode"]) {//重置disabled
                // 必须选择同一我方主体（公司）的NA订单 作为ND单的供应商
                item.disabled = true;//不可选择
            }
          }
        }
        //设置分页器
        this.pagerData.pageNo = data.CurrentPage;
        this.pagerData.total = data.TotalCount;
        this.pagerData.totalPages = data.PageCount;
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }

  //搜索
  search() {
    this.NAList = [];
    this.pagerData = new Pager();
    this.isSearch = true;
    this.loading = true;
    this.initData(this.query);
  }
  selectedIndexOf(ID) {//根据ID寻找在已选列表里的index
    let len = this.selectedList.length;
    for (let i = 0; i < len; i++) {
      if (this.selectedList[i].ID == ID) {
        return i;
      }
    }
    return -1;
  }
  childClick(e, index) {//每行click时
    if (e) {
      this.selectedList.push(this.NAList[index]);
    } else {
      this.selectedList.splice(this.selectedIndexOf(this.NAList[index]["ID"]), 1);
    }
    if (e && this.selectedList && this.selectedList.length == 1) {//选中第一个时，重置disabled
      let len = this.NAList.length;
      let item;
      for (let i = 0; i < len; i++) {
        if(i==index){continue;}
        item = this.NAList[i];
        if (item["CompanyCode"] != this.selectedList[0]["CompanyCode"]) {//不可选择
          item.disabled = true;
        }
      }
    }
    if (!e && this.selectedList && this.selectedList.length == 0) {//取消最后一个选择时，重置disabled
      let len = this.NAList.length;
      for (let i = 0; i < len; i++) {
        this.NAList[i].disabled = false;
      }
    }
  }
  parentClick(e) {//全选按钮点击
    let len = this.NAList.length;
    if (e) {
      for (let i = 0; i < len; i++) {
        if (!this.NAList[i]["disabled"] && this.selectedIndexOf(this.NAList[i]["ID"]) == -1) {
          this.selectedList.push(this.NAList[i]);
        }
      }
    } else {
      let index;
      for (let i = 0; i < len; i++) {
        index = this.selectedIndexOf(this.NAList[i]["ID"]);
        if (index != -1) {
          this.selectedList.splice(index, 1);
        }
        this.NAList[i].disabled=false;//取消选择时，重置disabled
      }
    }
  }
  newNDOrder() {//下一步点击
    if (this.selectedList.length == 0) {
      // this.windowService.alert({ message: "未选择NA单，请选择", type: "warn" });
      window.localStorage.setItem("createNDType","directND");
      this.router.navigate(['/procurement/submit-ND']);
    } else {
      window.localStorage.setItem("createNDType","hasNA");
      window.localStorage.setItem("NAList", JSON.stringify(this.selectedList));
      this.router.navigate(['/procurement/submit-ND']);
    }
  }
}