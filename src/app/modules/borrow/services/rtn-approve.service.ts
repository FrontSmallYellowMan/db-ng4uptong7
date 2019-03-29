import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BorrowReturnApplyPo,QualityTestReportPo} from './rtn-list.service';
import { environment_java } from "environments/environment";

@Injectable()
export class RtnApproveService{
    constructor(private http:Http){}
    /**
     * 查询申请单详细信息
     * @param id 
     */
    queryApplyformDetail(id:string){
        return this.http.get(environment_java.server+"borrow/rtn-apply/"+id).toPromise()
            .then(res=>res.json());
    }

        /**
     * 查询申请单详细信息
     * @param id 
     */
    queryQualityTestReport(applyId:string){
        return this.http.get(environment_java.server+"borrow/rpt-apply/"+applyId).toPromise()
            .then(res=>res.json().item as QualityTestReportPo);
    }
    /**
     * 审批通过
     * @param applyId 
     * @param remark 
     */
    agree(applyId:string,remark1:string,rptTestPo:QualityTestReportPo,rtnAppPo:BorrowReturnApplyPo){
         //console.info("applyId="+applyId+"  remark==="+remark1+" rptTestPo=="+rptTestPo.qualityTestReport.outerPackTest);
        return this.http.post(environment_java.server+"borrow/rtn-apply/"+applyId+"/agreement",{remark:remark1,qualityTestReportPo:rptTestPo,borrowReturnApplyPo:rtnAppPo}).toPromise()
            .then(res=>res.json());
    }


    


     /**
     * 手动触发提交失败的无单
     * @param applyId 
    */
  noapplySubmit(applyId:string,rtnTransportId:string){
      //console.log("rtnTransportId=="+rtnTransportId);
        return this.http.post(environment_java.server+"borrow/rtn-apply/"+applyId+"/noapply-submit",{rtnTransportId:rtnTransportId}).toPromise()
            .then(res=>res.json());
    }
    /**
     * 驳回申请单
     * @param applyId 
     * @param remark 
     * @param nodeId 
     */
    reject(applyId:string,remark:string,nodeId:string){
        
        return this.http.post(environment_java.server+"borrow/rtn-apply/"+applyId+"/reject",{remark:remark,nodeId:nodeId}).toPromise()
            .then(res=>res.json());
    }
    queryLogHistoryAndProgress(instId:string){ 
        return this.http.get(environment_java.server+"borrowflow/queryApproveHistory/"+instId).toPromise()
            .then(res=>res.json().item);
    }

     /**
     * 获取登录人信息
     */
    getApplyUserInfo() {
        return this.http.get(environment_java.server + "/common/getCurrentLoginUser").toPromise()
            .then(res =>
                res.json().item
            );
    }

   
      /**
     * 获取用户角色
     */

    getUserRole(){
        return   this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
         .then(res => res.json());
    }
}