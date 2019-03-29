
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { RequestOptionsArgs,URLSearchParams, Http, RequestOptions } from '@angular/http';
import { environment } from '../../../../environments/environment';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';

export class ApplyItem {//个人请假申请表单对象
  id = "";
  createBy = {};//填表人
  applyUser = [];//请假人
  gender = 0;//性别
  tel = "";//电话
  email = "";//邮箱
  reason = "";//请假原由
  platform = "";//平台
  leaveDate = {};//请假时间
  syncToSchedule = false;//是否同步到工作日历
}


const FETCH_LATENCY = 500;//延迟时间
const REQUEST_URL = environment.server + "apptpl/applys";

@Injectable()
export class ApptplService {
  constructor(private http: Http, private windowService: WindowService) { };

  private apptplFilter(response) {
    let resbody = response.json();
    if (resbody.status != 200) {
      let x = { "message": resbody.info, type: "fail" };
      this.windowService.alert(x);
      return false;
    }
    return true;
  }

  getApplyList(query?: URLSearchParams | String): Observable<ApplyItem[]> {

    let requestOptions = new RequestOptions();
    if (query instanceof URLSearchParams) {
      requestOptions.search = query;
    } else if (typeof query === "string") {
      requestOptions.search = new URLSearchParams(query);
    }
    return this.http.get(REQUEST_URL, requestOptions).pipe(
      filter(this.apptplFilter),
      map(response => response.json().list as ApplyItem[]),);
  }

  addApplyItem(item): Observable<ApplyItem> {
    return this.http.post(REQUEST_URL, item).pipe(
      filter(this.apptplFilter),
      map(response => response.json().item as ApplyItem),);
  }

  getApplyItem(id: number | string): Observable<ApplyItem> {
    return this.http.get(REQUEST_URL + "/" + id).pipe(
      filter(this.apptplFilter),
      map(response => response.json().item as ApplyItem),);
  }

  updateApplyItem(item) :Observable<ApplyItem>{
    return this.http.put(REQUEST_URL + "/" + item.id, item).pipe(
      filter(this.apptplFilter),
      map(response => response.json().item as ApplyItem),);
  }

  deleteApplyItem(id) :Observable<ApplyItem>{
    return this.http.delete(REQUEST_URL + "/" + id).pipe(
      filter(this.apptplFilter),
      map(response => response.json().item as ApplyItem),);
  }
}
