import { Injectable } from '@angular/core';
import { environment_java,dbomsPath } from '../../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ChangeQuery } from "../../components/list/cheque/change/change-query";



@Injectable()
export class InvoiceChangeService {

  constructor(private http: Http) { }

  getChangeListData(query: ChangeQuery) {
    let url = environment_java.server + 'invoice/change/getApplyChangeList';
    if(query.flag==="1"){
       url= environment_java.server + 'invoice/change/getApproveChangeList';
    }
    let params: URLSearchParams = new URLSearchParams();
    params.set("flowStatus", query.applyPage);
    params.set("pageNo", query.pageNo.toString());
    params.set("pageSize", query.pageSize.toString());
    params.set("para", query.para);
    // params.set("flag", query.flag);
    return this.http.get(url, { search: params }).map(res => res.json());
  }

  getUserData(){
    return  this.http.get( environment_java.server +'invoice/change/initApply')
            .map(res => res.json());
  }

  getUserByItcode(itcode){
    return  this.http.get( environment_java.server +'common/sys-people/'+itcode)
            .map(res => res.json());
  }
  
  submitChangeApply(data){
     return this.http.post(environment_java.server + 'invoice/change/newchangeApply', data)
      .toPromise();
  
  }

  loadChangeInfo(changeid){
    return this.http.get(environment_java.server + 'invoice/change/getInvoiceChangeInfo/'+changeid)
      .map(res=>res.json());
  }

  submitApprove(url,data){
    return this.http.post(url, data).toPromise();
  }

  loadChangeTpl(){
     return dbomsPath+'assets/downloadtpl/支票换票-导入模板.xlsx';
  }

  //根据模板分析财年调整信息
  analysisChange() {
    return environment_java.server +'invoice/change/upload-excel';
  }

  getApprovals(flatcode){
    let params: URLSearchParams = new URLSearchParams();
    params.set("flatCode",flatcode);
     return  this.http.get( environment_java.server +'invoice/change/getApprovals', { search: params })
            .map(res => res.json());
  }

  getCurrentFlowInvoiceApplys(itcode){
    let params: URLSearchParams = new URLSearchParams();
    params.set("applyItcode",itcode);
    return  this.http.get( environment_java.server +'invoice/change/getCurrentFlowInvoiceApplys', { search: params })
            .map(res => res.json());
  }
}
