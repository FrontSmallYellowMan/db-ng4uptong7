// 审批公用方法
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Router } from "@angular/router";

@Injectable()
export class ApprovalMethodService {
    applyApprovalUrlParms = {//采购申请 的审批各接口
        apiUrl_AR: "PurchaseManage/ApproveRequisition",//审批&驳回 接口
        apiUrl_Sign: "PurchaseManage/AddTask",//加签接口
        apiUrl_Transfer: "PurchaseManage/AddTransferTask",//转办接口
        apiUrl_AddTask: "PurchaseManage/ApproveAddTask",//加签审批类-同意
    };
    orderApprovalUrlParms = {//采购订单 的审批各接口
        apiUrl_AR: "PurchaseManage/ApproveOrder",//审批&驳回 接口
        apiUrl_Sign: "PurchaseManage/AddTask",//加签接口
        apiUrl_Transfer: "PurchaseManage/AddTransferTask",//转办接口
        apiUrl_AddTask: "PurchaseManage/ApproveAddTask",//加签审批类-同意
    };
    constructor(private dbHttp: HttpServer,
         private router: Router) { }
    agree(taskid,opinion,approvalType, extraParams = null) {//非-加签审批类-同意
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body={
            "taskid":taskid,//任务id
            "opinions": opinion,//审批意见
            "approveresult": "Approval"//同意：Approval，驳回：Reject
        }
        
        body = this.excuteExtraParams(extraParams, body);
        
        let url;
        if(approvalType=="Apply"){//采购申请
            url=this.applyApprovalUrlParms.apiUrl_AR;
        }
        if(approvalType=="Order"){//采购订单
            url=this.orderApprovalUrlParms.apiUrl_AR;
        }
        console.log(body);
        return this.dbHttp.post(url,body,options)
        .toPromise()
        .then(response => response)
    }
    reject(taskid,opinion,approvalType) {//非-加签审批类-驳回
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body={
            "taskid":taskid,//任务id
            "opinions": opinion,//审批意见
            "approveresult": "Reject"//同意：Approval，驳回：Reject
        }
        let url;
        if(approvalType=="Apply"){//采购申请
            url=this.applyApprovalUrlParms.apiUrl_AR;
        }
        if(approvalType=="Order"){//采购订单
            url=this.orderApprovalUrlParms.apiUrl_AR;
        }
        console.log(body);
        return this.dbHttp.post(url,body,options)
        .toPromise()
        .then(response => response)
    }
    sign(taskid,opinion,approvalType,itcode,username, extraParams = null) {//非-加签审批类-加签
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body={
            "taskid":taskid,//任务id
            "opinions":opinion,//审批意见
            "itcode":itcode,//
            "username":username//
        }
        
        body = this.excuteExtraParams(extraParams, body);
        
        let url;
        if(approvalType=="Apply"){//采购申请
            url=this.applyApprovalUrlParms.apiUrl_Sign;
        }
        if(approvalType=="Order"){//采购订单
            url=this.orderApprovalUrlParms.apiUrl_Sign;
        }
        console.log(body);
        return this.dbHttp.post(url,body,options)
        .toPromise()
        .then(response => response)
    }
    turnTo(taskid,opinion,approvalType,itcode,username, extraParams = null) {//非-加签审批类-转办
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body={
            "taskid":taskid,//任务id
            "opinions":opinion,//审批意见
            "itcode":itcode,//
            "username":username//
        }

        body = this.excuteExtraParams(extraParams, body);

        let url;
        if(approvalType=="Apply"){//采购申请
            url=this.applyApprovalUrlParms.apiUrl_Transfer;
        }
        if(approvalType=="Order"){//采购订单
            url=this.orderApprovalUrlParms.apiUrl_Transfer;
        }
        console.log(body);
        return this.dbHttp.post(url,body,options)
        .toPromise()
        .then(response => response)
    }
    signApprovalAgree(taskid,opinion,approvalType, extraParams = null) {//加签审批类-同意
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body={
            "taskid":taskid,//任务id
            "opinions":opinion,//审批意见
        }
        
        body = this.excuteExtraParams(extraParams, body);

        let url;
        if(approvalType=="Apply"){//采购申请
            url=this.applyApprovalUrlParms.apiUrl_AddTask;
        }
        if(approvalType=="Order"){//采购订单
            url=this.orderApprovalUrlParms.apiUrl_AddTask;
        }
        console.log(body);
        return this.dbHttp.post(url,body,options)
        .toPromise()
        .then(response => response)
    }
    /**
     * 处理额外参数
     * @param params 需要处理的参数 {key : value, isCover: boolean} isCover为是否覆盖的值
     * @param postData 最终请求体
     */ 
    excuteExtraParams(params, postData){
        if(params){
            if(params['isCover']){
                for(var key in params){
                    postData[key] = params[key];
                }
            } else {
                for(var key in params){
                    if(!postData[key]){
                        postData[key] = params[key];
                    }
                }
            }

            delete postData['isCover'];
        }

        return postData;
    }
}