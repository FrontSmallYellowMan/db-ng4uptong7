import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';

import { Query } from "../../components/apply/invoice/invoice-info";
import { environment_java } from "../../../../../environments/environment";

@Injectable()
export class InvoiceTakebackService { 
    constructor(
        private http: Http
    ){}
 
    public headers = new Headers({ 'Content-Type': 'application/json' });
    public options = new RequestOptions({ headers: this.headers });

    /**
     * 获退回列表
     * @param query 
     */
    getTakebackList(){
        return this.http.get(environment_java.server+"takeback/takeback-list")
                   .toPromise()
                   .then(res => res.json());
    }


    /**
     * 获取审批列表
     * @param query 
     */
    getTakebackApprove(param,flag,approveStatus,pageSize,pageNo){
        let params : URLSearchParams =new URLSearchParams();
        params.set("flag",flag);
        params.set("approveStatus",approveStatus);
        params.set("param",param);
        params.set("pageSize",pageSize);
        params.set("pageNo",pageNo);
        return this.http.get(environment_java.server+"takeback/approve-list",{search :params})
                   .toPromise()
                   .then(res => res.json());
    }

    getApproveCount(){
        return this.http.get(environment_java.server+"takeback/approve-count")
                   .toPromise()
                   .then(res => res.json());
    }


    takebackApply(ids,takebackRemark){
        let params : URLSearchParams =new URLSearchParams();
        params.set("ids",ids);
        params.set("takebackRemark",takebackRemark);
        return this.http
                    .get(environment_java.server+"takeback/takeback-insert",{params :params})
                    .toPromise()
                    .then(res => res.json());
    }
    
    getTakebackInfo(id){
       return this.http
                .get(environment_java.server+"takeback/approve-item/"+id)
                .toPromise()
                .then(res => res.json());
    }

        /**
     * 获取单个信息
     * @param id 申请单id 
     */
    getTakebackDetail(id: string){
        let params : URLSearchParams =new URLSearchParams();
        params.set("id",id);
        return this.http.get(environment_java.server+"takeback/takeback-retrieve",{search:params})
                   .toPromise()
                   .then(response => response.json());
    }

    /**
     * 审批
     * @param ids 
     * @param invoiceStatus 
     */
    approveTakeback(ids:string,invoiceStatus:string,approveRemark:string){
        return this.http.put(environment_java.server+"takeback/takeback-approve/"+ids+"/"+invoiceStatus+"/"+approveRemark,{})
                   .toPromise()
                   .then(response=>response.json());
    }
     
     
} 