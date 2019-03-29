/**
 *lichen - 2017-12-19
 *我的消息列表
 */
import { Component, OnInit } from '@angular/core';

import { WindowService } from 'app/core';
import { Pager } from 'app/shared';

import { Query, Message, IndexMyMessageService, ViewMessage } from '../../services/index-message.service';

declare var window;
declare var $: any;

@Component({
  templateUrl: './index-my-message.component.html',
  styleUrls: ['./index-my-message.component.scss']
})
export class IndexMyMessageComponent implements OnInit {

  loading: boolean;
  pagerData: Pager = new Pager();
  query: Query = new Query();
  viewMessage: ViewMessage = new ViewMessage();
  messageList: Message[] = [];//审批列表

  constructor(
    private windowService: WindowService,
    private indexMyMessageService: IndexMyMessageService) {}

  ngOnInit() {
    this.initData(this.query);
  }

  //初始化数据
  initData(query: Query) {
    // this.loading = true;
    this.indexMyMessageService.getMyMessageList(query).then(data => {
      this.loading = false;
      if(data.Result){
        let res = JSON.parse(data.Data);
        this.messageList = res.ListMessage;
        this.pagerData.set({
          pageNo: res.CurrentPage, 
          pageSize: res.PageSize, 
          total: res.TotalCount, 
          totalPages: Math.ceil(res.TotalCount/res.PageSize)
        });
        //设置消息总数
        $('.index-unreadercount').html(res.TotalCount);
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
    this.query.MessageState = type;
    this.query.CurrentPage = 1;
    this.query.PageSize = 10;
    this.initData(this.query);
  }

  //搜索
  search() {
    this.query.CurrentPage = 1;
    this.initData(this.query);
  }
  
  //更新消息状态
  changeMessageState(item){
    let localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));
    this.viewMessage.itcode = localUserInfo["ITCode"];
    this.viewMessage.msgID = item["id"];
    this.indexMyMessageService.ViewedMessage(this.viewMessage).then(data => {
      this.loading = false;
      if(data.Result){
        if (item["realURL"]) {
          window.open(item["realURL"]);
        }
        this.initData(this.query);
      }else{
        this.windowService.alert({message: data.Message, type: 'fail'});
      }

    })
  }
}