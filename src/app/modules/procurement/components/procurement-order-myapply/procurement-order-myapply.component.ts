import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs/Observable';
import { dbomsPath } from "environments/environment";
declare var $: any, window;

import {
  OrderMyapplyQuery,
  ProcurementListDataService
} from '../../services/procurement-listData.service';

@Component({
  templateUrl: 'procurement-order-myapply.component.html',
  styleUrls: ['procurement-order-myapply.component.scss', './../../scss/procurement.scss']
})
export class ProcurementOrderMyApplyComponent implements OnInit {
  pagerData = new Pager();
  query: OrderMyapplyQuery = new OrderMyapplyQuery();
  highSearchShow: boolean = false;//高级搜索
  loading: boolean = true;//加载中效果

  searchList: any;//用于存储搜索结果列表

  constructor(
    private procurementListDataService: ProcurementListDataService,
    private windowService: WindowService) { }

  ngOnInit() {
    let self = this;
    window.addEventListener('focus', function () {
      self.initData(self.query);
    });
  }
  ngOnDestroy() {
    let self = this;
    window.removeEventListener('focus', function () {
      self.initData(self.query);
    });
  }
  onTab(type) {//切换选项（全部，审批中，已完成，草稿）
    this.query.WfStatus = type;//切换申请类型
    this.query.PageIndex = 1;//重置分页
    this.loading = true;
    this.initData(this.query);
  }

  search() {//点击搜索按钮的搜索
    this.searchList = [];
    this.pagerData = new Pager();
    this.loading = true;
    this.initData(this.query);
  }

  reset() {//重置搜索数据
    let state = this.query.WfStatus;
    this.query = new OrderMyapplyQuery();
    this.query.WfStatus = state;
  }

  onChangePager(e: any) {//分页代码
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.loading = true;
    this.initData(this.query);
  }

  initData(query: OrderMyapplyQuery) {//向数据库发送请求
    this.procurementListDataService.searchOrderMyapplyData(this.query).then(data => {
      let list = data.Data.List;
      console.log("列表数据");
      console.log(list);
      if(!list) return;
      for (let i = 0, len = list.length; i < len; i++) {//处理CurrentApprovalNode
        let item = list[i];
        if (item["CurrentApprovalNode"] == "[]" || !item["CurrentApprovalNode"]) {//无值
          item["CurrentApprovalNode"] = [{
            approver: "",
            nodename: ""
          }];
        } else {
          item["CurrentApprovalNode"] = JSON.parse(item["CurrentApprovalNode"]);
        }
      }
      this.searchList = list;
      //设置分页器
      this.pagerData.pageNo = data.Data.CurrentPage;//当前页
      this.pagerData.total = data.Data.TotalCount;//总条数
      this.pagerData.totalPages = data.Data.PageCount;//总页数
      this.loading = false;
    });
  }
  deleteDraft(id) {//删除草稿
    let listLength = this.searchList.length;//记录当前页的条数
    let callback = data => {
      if (data.Result) {
        this.windowService.alert({ message: "删除成功", type: "success" });
        this.loading = true;
        if (listLength == 1) {//如果删除的是 当前页的最后一项 则跳转到第一页
          this.query.PageIndex = 1;
        }
        this.initData(this.query);
      } else {
        this.windowService.alert({ message: "删除失败", type: "fail" })
      }
    }
    this.procurementListDataService.deleteOrderMyapplyData(id).then(callback);
  }
  routerJump(type, id, OrderType) {//点击列表跳转的判断
    switch (OrderType) {
      case "NA":
        {
          if (type == '驳回' || type == '草稿') {
            window.open(dbomsPath + 'procurement/submit-NA/' + id);
          } else {
            window.open(dbomsPath + 'procurement/deal-NA/' + id);
          }
          break;
        }
      case "NB":
        {
          if (type == '驳回' || type == '草稿') {
            window.open(dbomsPath + 'procurement/submit-NB/' + id);
          } else {
            window.open(dbomsPath + 'procurement/deal-NB/' + id);
          }
          break;
        }
      case "ND":
        {
          if (type == '驳回' || type == '草稿') {
            window.open(dbomsPath + 'procurement/submit-ND/' + id);
          } else {
            window.open(dbomsPath + 'procurement/deal-ND/' + id);
          }
          break;
        }
      case "NK":
        {
          if (type == '驳回' || type == '草稿') {
            window.open(dbomsPath + 'procurement/submit-NK/' + id);
          } else {
            window.open(dbomsPath + 'procurement/deal-NK/' + id);
          }
          break;
        }
      case "UB":
        {
          if (type == '驳回' || type == '草稿') {
            window.open(dbomsPath + 'procurement/submit-UB/' + id);
          } else {
            window.open(dbomsPath + 'procurement/deal-UB/' + id);
          }
          break;
        }
      default:
        this.windowService.alert({ message: OrderType + "类型采购订单正在建设中", type: "warn" });
    }
  }
}