/**
 *lichen - 2017-11-30
 *我的审批列表
 */
import { Component, OnInit } from '@angular/core';

import { WindowService } from 'app/core';
import { Pager } from 'app/shared';

import { Query, Task, IndexMyApprovalService } from '../../services/index-approval.service';

declare var window;

@Component({
  templateUrl: './index-my-approval.component.html',
  styleUrls: ['./index-my-approval.component.scss']
})
export class IndexMyApprovalComponent implements OnInit {

  loading: boolean;
  pagerData: Pager = new Pager();
  query: Query = new Query();
  approvalList: Task[] = [];//审批列表
  needRefresh: boolean = false;

  constructor(
    private windowService: WindowService,
    private indexMyApprovalService: IndexMyApprovalService) {}

  ngOnInit() {
    window.addEventListener("focus", () => {
      if (this.needRefresh == true) {
        this.initData(this.query);
      }
    });
  }

  //初始化数据
  initData(query: Query) {
    this.loading = true;
    this.indexMyApprovalService.getMyApprovalList(query).then(data => {
      this.loading = false;
      if(data.Result){
        let res = JSON.parse(data.Data);
        console.log(res);
        
        this.approvalList = res.ListTaskPage;
        this.pagerData.set({
          pageNo: res.CurrentPage, 
          pageSize: res.PageSize, 
          total: res.TotalCount, 
          totalPages: res.PageCount
        });
        this.needRefresh = false;
      }else{
        this.windowService.alert({message: data.Message, type: 'fail'});
      }

    })
  }

  onChangePager(e) {
    this.query.PageSize = e.pageSize;
    this.query.CurrentPage = e.pageNo;

    this.initData(this.query);
  }

  //切换标签
  toggle(type) {
    this.query.TaskType = type;
    this.query.CurrentPage = 1;
    this.initData(this.query);
  }

  //搜索
  search() {
    this.query.CurrentPage = 1;
    this.initData(this.query);
  }

  //打开我的审批页面
  openMyApproval(url: string) {
    this.needRefresh = true;
    window.open(url);
  }
}