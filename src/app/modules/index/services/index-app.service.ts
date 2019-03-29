/**
 *李晨 - 2017-12-13
 *首页服务
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';


@Injectable()
export class IndexAppService {

  constructor(private http: Http) {}

  /**获得首页配置信息*/
  getHomePageBaseData() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetHomePageBaseData', null)
                    .toPromise()
                    .then(response => response.json());
  }
}