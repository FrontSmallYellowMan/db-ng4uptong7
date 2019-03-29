import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';

import { UserInfo,TradeTicketInfo,RestInfo,Query} from "../../components/apply/invoice/invoice-info";
import { environment_java } from "../../../../../environments/environment";
import { environment } from "../../../../../environments/environment.prod";

@Injectable()
export class TradeTicketService {
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http) { }
 
  //获取商票申请列表
  getTradeTicketList(query: Query) {
    let params : URLSearchParams =new URLSearchParams();
    params.set("tradeStatuss",query.tradeStatus);
    params.set("param",query.keyWords);
    params.set("startDate",query.startDate);
    params.set("endDate",query.endDate);
    params.set("pageSize",query.pageSize+"");
    params.set("pageNo",query.pageNo+"");
    return this.http.get(environment_java.server+'tradeTicket/tradeTicket-statuspages', { search: params })
                    .toPromise()
                    .then(response => response.json())
  }

  //提交申请
  create(data: any): Promise<RestInfo> {
    let options = new RequestOptions({ headers: this.headers });
    return this.http
    .post(environment_java.server+"tradeTicket/tradeTicket-apply", data, options)
    .toPromise()
    .then(res => res.json());
  } 
  
  //获取可用业务范围代码
  getYWFWDM(){
    return this.http.post(environment.server+'base/basedata/GetDepartmentYWFW',{})
                    .toPromise()
                    .then(response => response.json())
  } 

  getPayee(){
    return  this.http.post(environment.server+'BaseData/GetCompanyInfo/',{"CompanyName": "","CompanyCode":""} )
                       .toPromise()
                       .then(response => response.json())
  } 



  /**
     * 获取审批列表
     * @param query 
     */
    getApproveList(query: Query){
        let params : URLSearchParams =new URLSearchParams();
        params.set("tradeStatus",query.tradeStatus);
        params.set("param",query.keyWords);
        params.set("payee",query.payee);
        params.set("businessItcode",query.businessItcode);
        params.set("startDate",query.startDate);
        params.set("endDate",query.endDate);
        params.set("pageSize",query.pageSize+"");
        params.set("pageNo",query.pageNo+"");
        
        return this.http.get(environment_java.server+"tradeTicket/tradeTicket-pages",{search :params})
                   .toPromise()
                   .then(res => res.json());
    }
    
    /**
     * 审批申请单
     * @param ids 
     * @param invoiceStatus 
     */
    approveTradeticket(ids:string,tradeStatus:string){
        return this.http.put(environment_java.server+"tradeTicket/tradeTicket-approve/"+ids+"/"+tradeStatus,{})
                   .toPromise()
                   .then(response=>response.json());
    }
    /**
     * 获取单个申请单信息
     * @param id 申请单id 
     */
    getTradeticketById(id: string){
        let params : URLSearchParams =new URLSearchParams();
        params.set("id",id);
        return this.http.get(environment_java.server+"tradeTicket/tradeTicket-retrieve",{search:params})
                   .toPromise()
                   .then(response => response.json());
    } 

    //修改
    updateTradeticket(data: any): Promise<RestInfo> {
        let options = new RequestOptions({ headers: this.headers });
        return this.http
        .post(environment_java.server+"tradeTicket/tradeTicket-update", data, options)
        .toPromise()
        .then(res => res.json());
   } 

  //提交申请
    reCreate(data: any): Promise<RestInfo> {
        let options = new RequestOptions({ headers: this.headers });
        return this.http
        .post(environment_java.server+"tradeTicket/tradeTicket-reapply", data, options)
        .toPromise()
        .then(res => res.json());
    } 
    /**
     * 获取收款人列表
     * @param query 
     */
    getPayeeCountList(query){
        let params : URLSearchParams =new URLSearchParams();
        params.set("param",query.keyWords);
        params.set("tradeStatus",query.tradeStatus);
        params.set("businessItcode",query.businessItcode);
        params.set("startDate",query.startDate);
        params.set("endDate",query.endDate);
        return this.http.get(environment_java.server+'tradeTicket/tradeTicket-payeeCount',{search:params})
                        .toPromise()
                        .then(resp => resp.json());
    }

    /**
     * 获取商务接口人列表
     */
    getBusinessList(){
        return this.http.get(environment_java.server+'tradeTicket/tradeTicket-business')
                        .toPromise()
                        .then(resp => resp.json());
    } 
    /**
     * 获取收款人
     */
    getPayeeList(platform){
        let params : URLSearchParams =new URLSearchParams();
        params.set("platform",platform);
        return this.http.get(environment_java.server+'tradeTicket/tradeTicket-payee',{search:params})
                        .toPromise()
                        .then(resp => resp.json());
    } 


  
}
