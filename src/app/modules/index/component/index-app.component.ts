/**
 *lichen - 2017-11-30
 *销售员首页
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WindowService } from 'app/core';
import { dbomsPath } from 'environments/environment';
import { NAV_CONFIG } from '../nav-config';

import { Collection, IndexMyCollectionService } from '../services/index-collection.service';
import { IndexAppService } from '../services/index-app.service';

declare var window;

@Component({
  templateUrl: './index-app.component.html',
  styleUrls: ['./index-app.component.scss']
})
export class IndexAppComponent implements OnInit {

  myApp = NAV_CONFIG.nav_my_app;
  userInfo: any;//用户信息
  rolesList: Array<{HomeRoleCode: string, HomeRoleName: string, HomeUrl: string}> = [];
  collectionList: Collection[] = [];//我的收藏列表
  approvalCount: number;//我的审批数量
  messageCount: number;//我的消息数量
  isSorting: boolean = false;//是否在排序

  private _collectionList: number[] = [];//我的收藏列表
  private _collection: number;//我的收藏
  private _startPos: number;//拖拽开始的位置
  private mapList: Collection[];//所有map
  
  constructor(
    private router: Router,
    private windowService: WindowService,
    private indexAppService: IndexAppService,
    private indexMyCollectionService: IndexMyCollectionService){}
  
  ngOnInit(){
    this.indexAppService.getHomePageBaseData().then(data => {
      if(data.Result) {
        this.rolesList = JSON.parse(data.Data)['ListHomeRoles']
        this.approvalCount = JSON.parse(data.Data)['ApprovalCount'];
        this.messageCount = JSON.parse(data.Data)['UnReadMessageCount'];
      } else {
        this.windowService.alert({message: data.Message, type: 'fail'});
      }
    });

    this.userInfo = JSON.parse(window.localStorage.getItem('UserInfo'))

    this.getMyCollection();
  }
  
  //打开我的审批
  myapproval(){
    window.open('index/index-my-approval');
  }

  //打开我的消息
  myMessage(){
    window.open('index/index-my-message');
  }

  //获取我的收藏
  getMyCollection() {
    this.indexMyCollectionService.getMyCollection().then(data => {
      if(!data.Result){
        this.windowService.alert({message: data.Message, type: 'fail'});
        return;
      }
      this.collectionList = JSON.parse(data.Data);

      //暂时
      this._collectionList = this.collectionList.map((v,i)=>i);
      this.collectionList.forEach((v,i)=>{v.Sorting = i});
      //暂时
    })
  }

  //编辑我的收藏
  editMyCollection() {
    this.router.navigate(['index/index-map']);
  }

  //打开我的收藏链接
  openMyCollection(url: string) {
    if(this.isSorting){return}
    if(/http/.test(url)){
      window.open(url);
    }else{
      window.open(dbomsPath + url);
    }
  }

  //切换是否排序
  sortCollection() {
    this.isSorting = !this.isSorting;
    if(!this.isSorting){
      this.indexMyCollectionService.sortMyCollection(this.collectionList);
    }
  }

  //拖拽开始
  dragStart(e) {
    this._startPos = e.top;
    this._collection = this._collectionList.splice(Math.floor(e.top/45), 1)[0];
  }

  //拖拽结束
  dragEnd(e) {
    let num = e.top > this._startPos ? Math.floor(e.top/45) : Math.ceil(e.top/45);
    this._collectionList.splice(num, 0, this._collection);
    this.collectionList.forEach((item, index) => {
      item.Sorting = this._collectionList.indexOf(index);
    });
    if(Math.abs(e.top - this._startPos) < 45){
      e.dom.style.top = this._startPos + 'px';
    }
  }
  
}
