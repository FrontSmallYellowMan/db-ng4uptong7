import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BorrowAmountPo} from './../components/limit';
import { environment_java } from "./../../../../environments/environment";
import { FlowInfoParam } from './../components/common-entity';
@Injectable()
export class LimitApproveService{
    constructor(private http:Http){}
    /**
     * 查询申请单详细信息
     * @param id 
     */
    queryApplyformDetail(id:string){
        return this.http.get(environment_java.server + "/borrow/borrow-amount/"+id).toPromise()
            .then(res=>res.json().item);
    }
    /**
     * 审批通过
     * @param applyId 
     * @param remark 
     */
    agree(applyId:string,remark:string){
        let param:FlowInfoParam = new FlowInfoParam();
        param.remark = remark;
        //console.log(remark);
        return this.http.post(environment_java.server + "borrow/borrow-amount/"+applyId+"/agreement",param).toPromise()
            .then(res=>res.json());
    }
    /**
     * 驳回申请单
     * @param applyId 
     * @param remark 
     * @param nodeId 
     */
    reject(applyId:string,remark:string,nodeId:string){
         let param:FlowInfoParam = new FlowInfoParam();
         param.remark = remark;
         param.nodeId = nodeId;
        return this.http.post(environment_java.server + "borrow/borrow-amount/"+applyId+"/reject",param).toPromise()
            .then(res=>res.json());
    }
    queryLogHistoryAndProgress(instId:string){
        console.log(environment_java.server + "borrowflow/queryApproveHistory/");
        return this.http.get(environment_java.server + "borrowflow/queryApproveHistory/"+instId).toPromise()
            .then(res=>res.json().item);
    }
     /**
     * 查询审批还是只读
     * @param instId 
     */
    queryReadOnlyFlag(instId: string) {
        return this.http.get(environment_java.server + "flow/info/" + instId).toPromise()
            .then(res => res.json());
    }
}