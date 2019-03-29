/**
 *李晨 - 2017-11-30
 *我的审批列表服务
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';

export class Query {
  TaskType: number  = 1;//1:待我审批。2：我已审批
  SearchKey: string = '';
  PageSize: number;
  CurrentPage: number;
}
export class ContractQuery {
  Type: string  = "Stock";//Stock-待备货 Print-待用印 UnSales-待开销售
  PageSize: number;
  CurrentPage: number;
}

export class Task {
  taskTitle: string;
  taskTableURL: string;
  temp_item_name: string;
  taskApproveResult: string;
  createdTime: string;
}

@Injectable()
export class IndexMyApprovalService {

  constructor(private http: Http) {}

  /**获取我的审批列表*/
  getMyApprovalList(query: Query) {
    return this.http.post(environment.server + 'SalesmanHomePage/GetMyApprovalList', query)
                    .toPromise()
                    .then(response => response.json());
  }
  /**获取销售合同列表*/
  getContractList(query: ContractQuery) {
    return this.http.post(environment.server + 'SalesmanHomePage/GetContractList', query)
      .toPromise()
      .then(response => response.json());
  }
}