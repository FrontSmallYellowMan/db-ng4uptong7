import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Headers, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { UnclearMaterialItem } from './../components/common/borrow-entitys';
import { BorrowTurnSalesPo, BorrowTurnSales } from './../components/turn-sale';
import { FlowInfoParam } from './../components/common-entity';
import { environment_java } from "./../../../../environments/environment";
@Injectable()
export class TurnSaleApproveService {
    constructor(private http: Http) { }
    /**
     * 查询转销售申请单信息
     * @param turnSaleId 
     */
    queryTurnSaleApplyDetail(turnSaleId: string) {
        return this.http.get(environment_java.server + "borrow/turn-sales/" + turnSaleId).toPromise()
            .then(res => res.json());
    }
    /**
     * 查询审批记录
     * @param instId 
     */
    queryLogHistoryAndProgress(instId: string) {
        return this.http.get(environment_java.server + "borrowflow/queryApproveHistory/" + instId).toPromise()
            .then(res => res.json());
    }
    /**
     * 审批通过
     * @param applyId 
     * @param remark 
     */
    agree(applyId: string, flowParam: FlowInfoParam) {
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http.post(environment_java.server + "borrow/turn-sales/" + applyId + "/agreement", flowParam).toPromise()
            .then(res => res.json());
    }
    /**
    * 驳回申请单
    * @param applyId 
    * @param remark 
    * @param nodeId 
    */
    reject(applyId: string, remark: string, nodeId: string) {
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      //  let options = new RequestOptions({ headers: headers });
        let flowParam: FlowInfoParam = new FlowInfoParam();
        flowParam.remark = remark;
        flowParam.nodeId = nodeId;
        //console.log(flowParam);
        return this.http.post(environment_java.server + "borrow/turn-sales/" + applyId + "/reject", flowParam).toPromise()
            .then(res => res.json());
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
