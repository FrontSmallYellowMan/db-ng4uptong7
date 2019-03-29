/**
 *李晨 - 2017-12-12
 *销售员首页服务
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';


@Injectable()
export class IndexSalesService {

  constructor(private http: Http) {}

  /**获得当前日期是否是每个季度前10个工作日*/
  getDateInTenth() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetShowNewLabel', null)
                    .toPromise()
                    .then(response => response.json());
  }

  /**获得超期欠款列表和查询客户到款*/
  getOverdueAndPaymentList() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetCusOverdueArrearsAndPayment', null)
                    .toPromise()
                    .then(response => response.json());
  }

  /**获得我的销售中本月合同金额、本月销售额等数据*/
  getMySalesAmount() {
    return this.http.post(environment.server + 'SalesmanHomePage/GetMySales', null)
                    .toPromise()
                    .then(response => response.json());
  }
}