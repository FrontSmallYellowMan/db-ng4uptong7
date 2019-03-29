import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';

import { UserInfo,InvoiceInfo,RestInfo,Query} from "../../components/apply/invoice/invoice-info";
import { environment_java } from "../../../../../environments/environment";
import { environment } from "../../../../../environments/environment.prod";
@Injectable()
export class InvoiceApplyService {
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http) { }

 
  /**
     * 获取登录人信息
     */
    getLoginUser() {
        return this.http.get(environment_java.server+"common/getCurrentLoginUser").toPromise()
            .then(res =>res.json().item);
    }

  //获取支票申请列表
  getInvoiceList(query: Query) {
    let params : URLSearchParams =new URLSearchParams();
    params.set("invoiceStatuss",query.invoiceStatus);
    params.set("param",query.keyWords);
    params.set("startDate",query.startDate);
    params.set("endDate",query.endDate);
    params.set("pageSize",query.pageSize+"");
    params.set("pageNo",query.pageNo+"");
    return this.http.get(environment_java.server+'invoice/invoice-statuspages', { search: params })
                    .toPromise()
                    .then(response => response.json())
  }

  //提交申请
  create(invoices: any): Promise<RestInfo> {
    let options = new RequestOptions({ headers: this.headers });
    let body = JSON.stringify(invoices);
    return this.http
    .post(environment_java.server+"invoice/invoice-apply", body, options)
    .toPromise()
    .then(res => res.json());
  }

  //获取可用的平台列表
  getPlatforms(){
    return this.http.get(environment_java.server+'borrow/platforminv/platforms')
                    .toPromise()
                    .then(response => response.json())
  } 
  getUserByItcode(itcode){
    return  this.http.get(environment_java.server+'common/sys-people/'+itcode)
            .map(res => res.json());
  } 
  
  getApprovals(flatcode,functionCode){
      let params: URLSearchParams = new URLSearchParams();
      params.set("flatCode",flatcode);
      params.set("functionCode",functionCode);
      return  this.http.get(environment_java.server+'invoice/getApprovals', { search: params })
              .toPromise().then(res => res.json());
  }

  getAllDelayInvoice(){
    return this.http.get(environment_java.server+"invoice/delay-apply/getalldelay").toPromise().then(
      resp => resp.json());
  }
}
