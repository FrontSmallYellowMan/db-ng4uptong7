/**
 *lichen - 2017-11-30
 *首页MAP操作
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { WindowService } from "app/core";

import { Collection, ChildCollection, IndexMyCollectionService } from '../../services/index-collection.service';

@Component({
  templateUrl: './index-map.component.html',
  styleUrls: ['./index-map.component.scss']
})
export class IndexMapComponent implements OnInit {

  mapList: Collection[] = [];
  mapListLeft: Collection[] = [];
  mapListRight: Collection[] = [];
  requesting: boolean;//正在请求
  loading: boolean = true;//加载

  constructor(
    private router: Router,
    private windowService: WindowService,
    private indexMyCollectionService: IndexMyCollectionService) {}

  ngOnInit() {
    function sum(arr: Collection[]) {
      let num = 0;
      arr.forEach(item => {
        num += Math.ceil(item.ChildrenFuncList.length/2);
      });
      return num;
    }

    this.indexMyCollectionService.getMapList().then(data => {
      this.loading = false;
      this.mapList = JSON.parse(data.Data);

      this.mapList.forEach(item => {
        if(sum(this.mapListLeft) <= sum(this.mapListRight)) {
          this.mapListLeft.push(item);
        }else{
          this.mapListRight.push(item);
        }
      })
    })
  }

  /**添加到我得收藏*/
  addMyCollection(item: ChildCollection) {
    if(this.requesting){return}
    this.requesting = true;
    this.indexMyCollectionService.addMyCollection(item).then(data => {
      this.requesting = false;
      item.Check = data.Result;
      item.CID = JSON.parse(data.Data)['ID'];
      if(!data.Result) {
        this.windowService.alert({message: data.Message, type: 'fail'});
      }
    });
  }

  /**删除我的收藏*/
  deleteMyCollection(item: ChildCollection) {
    if(this.requesting){return}
    this.requesting = true;
    this.indexMyCollectionService.deleteMyCollection(item.CID).then(data => {
      this.requesting = false;
      item.Check = !data.Result;
    })
  }

  //返回
  goBack() {
    this.router.navigate(['index']);
  }
}