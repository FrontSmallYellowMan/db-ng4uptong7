import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import {UnclearMaterialItem} from './../components/common/borrow-entitys';
import { environment_java } from "./../../../../environments/environment";
import { FlowInfoParam } from './../components/common-entity';
export class FlowParam{
    nodeId: string;
    persons: string;
    remark: string;
    voucherNo1: string;
    voucherNo2: string;
}
export class BorrowTransferApply{
    platformCode:string;//平台编码
    flowStatus:	number;
    baseDeptName:	string;// 本部
    instId:	string;//
    org:	string;//
    currApprAuthors:	string;//
    apprReadors:	string;//
    brwSubTransId:	string;// 借用转移申请单子单号，拆单后系统自动指定
    currApprUserIds:	string;//
    createDate:	string;// 
    flowCurrNodeName:	string;//
    lastModifiedDate:	string;// 
    contactPhone:	string;// 联系方式
    nPersonName:	string;// *转移后借用申请人姓名
    oPersonName:	string;// *原借用申请人姓名
    subDeptName:	string;// 事业部
    createBy:	string;//
    approvalIds:	string;//
    lastModifiedBy:	string;//
    version:	string;//
    nPersonItCode:	string;// *现借用申请人ItCode
    id:	string;//
    applyDate:	string;// 申请日期，系统自动赋值
    brwTransId:	string;// 借用转移申请单单号，系统自动指定
    oPersonItCode:	string;// 原借用申请人ItCode
    applyUserNo:string;//原申请编号
    currApprAuthorsItcode:	string;//
    flowCurrNodeId:	string;//
    platformName:	string;// 平台名称
    formId:	string;//
}
export class TransferMaterialBase{
    applyId:	string;// 关联借用转移申请Id
    borrowCustomerName:	string;// 借用客户名称
    borrowDate:	string;//借用日期
    giveBackDay:	string;// ($date-time)预计归还日期
    nreservationNo:	string;// 新预留号
    nvoucherNo1:	string;// 新凭证号1
    nvoucherNo2:	string;// 新凭证号2
    oreservationNo:	string;// 原预留号
    ovoucherNo1:	string;// 原凭证号1
    ovoucherNo2:	string;// 原凭证号2
    projectName:	string;// 项目名称
    trnMtrBaseId:	string;// *实体Id
    factory:        string;//工厂
    contcenterCode: string;//成本中心
    borrowTypeName: string;//借用类型
    borrowTypeCode: string;//借用类型编号
    deliveryAddress:string;//送货地址
    borrowStoreHouse:string;//借用库
}
export class TransferMaterialItem{
    batch:	string;// *批次
    count:	number;//数量
    factory:	string;// *工厂
    meterialMemo:	string;// *物料描述
    meterialNo:	string;// *物料编号
    onwayStore:	string;// 借用在途库
    price:	number;//移动平均价
    totalAmount:number;// *($double)总价
    trsfBaseId:	string;// *借用专业物料基础信息Id
    trsfMaterialId:	string;// *实体Id
    unit:	string;// *单位
}
export class AdditionalProp{
    mItemDetail:TransferMaterialItem[]=[];
    mItemInfo:TransferMaterialBase=new TransferMaterialBase();
}
 export class BorrowTransferPo{
     brwTrsfApply:BorrowTransferApply=new BorrowTransferApply();
     trsfMtrMap:Object=new Object();
 }
 export class PersionInfo{
     userName:string="";
     userItCode:string="";
 }

@Injectable()
export class TransferService{
    constructor(private http: Http) { }
    /**
     * 新建借用转移申请(提交草稿)
     * @param apply 借用转移申请单
     */
    saveTransfer(apply:BorrowTransferPo){

          console.error("apply===="+JSON.stringify(apply.brwTrsfApply.id));
        if(apply.brwTrsfApply.id){


              return this.http.put(environment_java.server + "borrow/borrow-transfer/" + apply.brwTrsfApply.id, apply).toPromise()
            .then(response => response.json());

        }
        return this.http.post(environment_java.server+"borrow/borrow-transfer",apply).toPromise()
             .then(res=>res.json());
    }
    /**
     * 流程提交（新建流程）
     * @param apply 
     */
    submitForm(apply:BorrowTransferPo){
        //console.error("========================================JSON.stringify(apply)");
        // console.error(JSON.stringify(apply));
         if(apply.brwTrsfApply.flowCurrNodeId){
             return this.http.post(environment_java.server+"borrow/borrow-transfer/submit?isSaved=true",apply).toPromise()
             .then(res=>res.json());
         }
         return this.http.post(environment_java.server+"borrow/borrow-transfer/submit?isSaved=false",apply).toPromise()
             .then(res=>res.json());
    }

    checkTranSfer(itcode:string,nitcode:string){
        return this.http.get(environment_java.server+"borrow/borrow-transfer/checktransfer?itcode="+itcode+"&nitcode="+nitcode).toPromise()
           .then(res=>res.json().item as boolean);

      
    }

   
    /**
     * 查询转销售列表
     * @param params
     * @param applyFlag 1-我的申请 2-我的审批
     */
    queryTurnSaleList(params:URLSearchParams,applyFlag:string){
        if(applyFlag === "1"){
            return this.http.get(environment_java.server+"borrow/turn-sales",{search:params}).toPromise()
            .then(res=>res.json());
        }else{
            return this.http.get(environment_java.server+"borrow/turn-sales/my-approval",{search:params}).toPromise()
            .then(res=>res.json());
        }
        
    }
         /**
     * 获取用户角色
     */

    getUserRole(){
        return   this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
         .then(res => res.json());
    }
    /**
     * 查询借用转移申请单详细
     * @param applyId 
     */
    queryApplyDetail(applyId:string){
        return this.http.get(environment_java.server+"borrow/borrow-transfer/"+applyId).toPromise()
            .then(res=>res.json());
    }
    /**
     * 查询待我审批的条数
     */
    queryWaitForApprovalNum(){
        return this.http.get(environment_java.server + "/borrow/turn-sales/wait-me",null).toPromise()
            .then(res=>res.json().item as number);
    }
      /**
     * 查询审批还是只读
     * @param instId 
     */
    queryReadOnlyFlag(instId: string) {
        return this.http.get(environment_java.server + "flow/info/" + instId).toPromise()
            .then(res => res.json());
    }
    /**
     * 查询审批记录
     * @param instId 
     */
    queryLogHistoryAndProgress(instId: string) {
        return this.http.get(environment_java.server + "borrowflow/queryApproveHistory/" + instId).toPromise()
            .then(res => res.json().item);
    }
    /**
     * 审批通过
     * @param applyId 
     * @param remark 
     */
    agree(applyId: string, subflowParam: FlowParam) {
        let flowParam: FlowInfoParam = new FlowInfoParam();
        flowParam.remark = subflowParam.remark;
        return this.http.post(environment_java.server + "borrow/borrow-transfer/" + applyId + "/agreement", flowParam).toPromise()
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
      //  console.log(flowParam);
        return this.http.post(environment_java.server + "borrow/borrow-transfer/" + applyId + "/reject", flowParam).toPromise()
            .then(res => res.json());
    }
    /**
     * 
     * @param applyId 
     * @param brwapplyPo 
     * @param reservationNo 
     */
    writeToErp(applyId: string,brwapplyPo:BorrowTransferPo,reservationNo:string){
         return this.http.put(environment_java.server + "borrow/borrow-transfer/write-to-erp/" + applyId + "?reservationNo="+reservationNo, brwapplyPo).toPromise()
            .then(res => res.json());
    }

}