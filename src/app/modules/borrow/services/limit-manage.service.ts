import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { BorrowAmountBusinessScope, BorrowAmount, BorrowAmountPo } from './../components/limit';
import { environment_java } from "environments/environment";
@Injectable()
export class LimitManageService {
  constructor(private http: Http) {

  }
  getLimitmanageList(params) {
    //console.log(query);
    return this.http.get(environment_java.server + "borrow/borrow-amount/list", { search: params })
      .toPromise()
      .then(response => response.json());
  }
  addLimit(limitObj: BorrowAmountBusinessScope) {
    return null;
  }
  batchImportLimit() {
    return null;
  }
  queryLimitManageInfo(applyId: string) {
    return this.http.get(environment_java.server + "borrow/borrow-amount/" + applyId).toPromise()
      .then(res => res.json().item);
  }
  /**
   * 查询部门额度使用记录
   * @param bbmc 本部名称
   * @param sybmc 事业部名称
   */
  queryDeptAmountUsedLog(baseDeptName: string,deptName:string, isBase: boolean) {
    //console.log(baseDeptName + " " + deptName + " " + isBase);
    return this.http.get(environment_java.server + "borrow/borrow-amount/amount-applies" , { params: {baseDeptName,deptName,isBase } }).toPromise()
      .then(res => res.json());
  }
  /**
   * 
   */
  analysisLimitData() {
    return environment_java.server + "borrow/borrow-amount/upload-excel";
  }
  /**
   * 下载额度管理模板
   */
  loadLimitDataTpl() {
    return '../../assets/downloadtpl/额度管理导入模板.xlsx';
  }
  /**
   * 查询用户是否有额度管理的菜单
   * @param functionCode 
   */
  querHavingTrackingManageRights() {
    let functionCodes = ["BorrowManager", "BorrowTrackingRisk"];

    return this.http.get(environment_java.server + "common/getUserFunDataFilters/" + functionCodes[0], null).toPromise()
      .then(res => {
        let data = res.json();
        if (data.success) {
          return data;
        } else {
          return this.http.get(environment_java.server + "common/getUserFunDataFilters/" + functionCodes[1], null).toPromise()
            .then(res => res.json());
        }
      });
  }
  /**
   * 判断申请的额度是否已使用
   * @param batId 
   */
  isBorrowAmountUsed(batId:string){
    return this.http.get(environment_java.server + "borrow/borrow-amount/isUsed/"+batId).toPromise()
      .then(res=>res.json());
  }
  deleteBorrowAmountApply(batId:string){
    return this.http.delete(environment_java.server + "borrow/borrow-amount/tracking/"+batId).toPromise()
      .then(res=>res.json());
  }
}

