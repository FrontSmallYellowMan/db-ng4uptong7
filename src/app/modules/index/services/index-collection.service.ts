/**
 *李晨 - 2017-11-30
 *添加删除我的收藏服务
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';

export class ChildCollection {
  CID: string;
  Check: boolean;
  FuctionName: string;
  MapID: number;
  Sorting: string;
  URL: string;
}

export class Collection {
  MapID: number;
  FuctionName: string;
  FunctionName: string;
  URL: string;
  Check: boolean;
  Sorting: number;
  ChildrenFuncList: ChildCollection[];
}

@Injectable()
export class IndexMyCollectionService {

  constructor(private http: Http) {}

  /**获取Map列表*/
  getMapList() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetSalesmanMap', '')
                    .toPromise()
                    .then(response => response.json());
  }

  /**获取我的收藏列表*/
  getMyCollection() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetMyCollection', '')
                    .toPromise()
                    .then(response => response.json());
  }

  /**排序我的收藏列表*/
  sortMyCollection(list: Collection[]) {
    return this.http.post(environment.server + 'SalesmanHomePage/UpdateCollectionSorting', {ListCollection: list})
                    .toPromise()
                    .then(response => response.json());
  }

  /**添加到我得收藏*/
  addMyCollection(item: ChildCollection) {
    return this.http.post(environment.server + 'SalesmanHomePage/AddMyCollection', {MapID: item.MapID, FunctionName: item.FuctionName, URL: item.URL})
                    .toPromise()
                    .then(response => response.json());
  }

  /**删除我得收藏*/
  deleteMyCollection(cid: string) {
    return this.http.post(environment.server + 'SalesmanHomePage/DeleteMyCollection/' + cid, '')
                    .toPromise()
                    .then(response => response.json());
  }
}