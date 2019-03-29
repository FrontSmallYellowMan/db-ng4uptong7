import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
declare var $: any;

export class Query { 
  public TrackingNumber: string;//需求跟踪号
  public ERPNumber: string;//ERP采购订单编号
  public Vendor: string;//供应商
  public Applicant: string;//申请人 itcode 或 name  搜索
  public PageIndex: number;
  public PageSize: number;
}

@Injectable()
export class NASelectService {

  constructor(private http: Http) { }

  //获取NA列表
  getNAList(query: Query) {
    console.log(query);
    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers:headers });
    let body = JSON.stringify(query);
    return this.http.post("api/PurchaseManage/MyNAOrderList",body,options)
      .toPromise()
      .then(response => response.json().Data)
  }
}