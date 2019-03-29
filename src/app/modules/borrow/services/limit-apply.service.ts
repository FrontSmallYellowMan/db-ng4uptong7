import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BorrowAmountPo} from './../components/limit';
import { environment_java } from "./../../../../environments/environment";

export class FlowParam{
    nodeId: string;
    persons: string;
    remark: string;
    voucherNo1: string;
    voucherNo2: string;
}

@Injectable()
export class LimitApplyService{
    
    constructor(private http:Http){}
    /**
     * 查询申请单详细信息
     * @param id 
     */
    queryApplyformDetail(id:string){
        return this.http.get(environment_java.server + "/borrow/borrow-apply/"+id).toPromise()
            .then(res=>res.json());
    }
    /**
     * 审批通过
     * @param applyId 
     * @param remark 
     */
    agree(applyId:string,remark:string,reservationNo:string){
        
        return this.http.post(environment_java.server + "/borrow/borrow-apply/"+applyId+"/agreement",{remark:remark,reservationNo:reservationNo}).toPromise()
            .then(res=>res.json());
    }
    /**
     * 驳回申请单
     * @param applyId 
     * @param remark 
     * @param nodeId 
     */
    reject(applyId:string,remark:string,nodeId:string){

        
        let flowParam: FlowParam = new FlowParam();
        flowParam.remark = remark;
        flowParam.nodeId = "node1";
        return this.http.post(environment_java.server + "/borrow/borrow-apply/"+applyId+"/reject",flowParam).toPromise()
            .then(res=>res.json());
    }
    queryLogHistoryAndProgress(instId:string){
        return this.http.get(environment_java.server + "/borrowflow/queryApproveHistory/"+instId).toPromise()
            .then(res=>res.json().item);
    }
}