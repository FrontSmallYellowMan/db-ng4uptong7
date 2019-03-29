import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Http } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
declare var window;
import {
  Query,
  BorrowReturnApply
} from './../../../services/rtn-list.service';

import {
  SelectOption,
  DeliveryAddress
} from '../../common/borrow-entitys';

import { RtnManageService, BorrowReturnQueryPo } from './../../../services/rtn-manage.service';
@Component({
  templateUrl: './rtn-manage.component.html',
  styleUrls: ['./rtn-manage.component.scss', '../../../scss/borrow-private.component.scss'],
  providers: [RtnManageService]
})


export class TrackingRtnComponent implements OnInit {



  query: BorrowReturnQueryPo;//查询条件
  borrowReturnApplyList: BorrowReturnApply[] = [];//借用申请列表
  loading: boolean = true;//加载中效果
  pagerData = new Pager();
  public idSort: any = false;//我的审批排序
  //取货方式
  public pickupTypeOpts: Array<any> = [{ code: 0, name: '销售员自送' }, { code: 1, name: '物流取货' }];

  //流程状态
  public flowStatuslist: Array<any> = [{ code: 4, name: '草稿' }, { code: 1, name: '审批中' }, { code: 3, name: '已完成' }];
  constructor(http: Http, private rtnManageService: RtnManageService, private windowService: WindowService) {

  }

  ngOnInit() {
    this.query = new BorrowReturnQueryPo();
    this.search(0);

  }
  search(obj) {
    if (obj == 0) {
      this.pagerData.pageNo = 1;
    }
    let params = new URLSearchParams();
    params.set("pageNo", "" + this.pagerData.pageNo);
    params.set("pageSize", "" + this.pagerData.pageSize);

    this.loading = true;
    this.rtnManageService.getRtnmanageList(params.get("pageNo"), params.get("pageSize"), this.query).then(res => {
      // if (res.list) {
      //     this.limitData = res.list;
      //     for (let i = 0; i < this.limitData.length; i++) {
      //         this.limitData[i].num = (this.pagerData.pageNo - 1) * this.pagerData.pageSize + (i + 1);
      //     }
      // }
      // if (res.pager && res.pager.total) {
      //     this.pagerData.set({
      //         total: res.pager.total,
      //         totalPages: res.pager.totalPages
      //     })
      // }
      this.borrowReturnApplyList = res.list;
      //console.log("borrowReturnApplyList=" +JSON.stringify(this.borrowReturnApplyList));
      //设置分页器
      this.pagerData.set(res.pager);

      //this.loading = false;
    }
    );
    this.loading = false;
  }
  rtnExcel() {
    this.rtnManageService.rtnExcelfile(this.query);
  }

  //重置
  clearSearch() {
    this.query = new BorrowReturnQueryPo();
  }
  //每页显示条数发生变化时
  onChangePage = function (e) {
    if (this.currentPageSize != e.pageSize) {
      this.pagerData.pageNo = 1;
    }
    this.currentPageSize = e.pageSize
    this.search(1);
  }

  //排序功能
  approvalSort() {
    this.idSort = !this.idSort;
    this.borrowReturnApplyList.reverse();
  }
  goDetail(itemId, flowStatus): void {
    window.open(dbomsPath + "borrow/approve/rtn-rc;id=" + itemId + ";applypage=" + flowStatus);
  }
}