
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { environment,APIAddress } from "../../../../environments/environment";
declare var window: any;

/** 接口地址 */
const getCurryBaseData = "PU_Contract/GetCurryBaseData";//获取币种下拉框数据
const getPurchaseType = "PU_Contract/GetPurchaseType";//采购类型确认
const savePurchaseContract = "PU_Contract/SavePurchaseContract";//保存采购合同用印信息
const sumitPurchaseContract = "PU_Contract/SumitPurchaseContract";//提交采购合同用印信息
const getPUBaseDataByPUCode = "PU_Contract/GetPUBaseDataByPUCode";//获取采购合同用印信息
const getPUWFInfoBaseData = "PU_Contract/GetPUWFInfoBaseData";//采购合同初始化(获取审批节点信息)
const getWFFX = "PU_Contract/GetWFFX";//根据平台号获取风险岗
const getMyApplyList = "PU_Contract/GetMyApplyList";//我的申请
const getForMyApproveList = "PU_Contract/GetForMyApproveList";//我的审批
const api_companyUrl = "PU_Contract/GetBaseCompany";//获取我方主体信息
const deletePurchaseByPU_Code = "PU_Contract/DeletePurchaseByPU_Code";//删除采购合同
const getForMyApproveCount = "PU_Contract/GetForMyApproveCount";//获取我的审批代办任务数量
const getDepartmentPlatform = "S_Contract/GetDepartmentPlatform";//我的审批查询条件下拉框数据源
export const contractAddTaskApp = "PU_Contract/ApproveAdditional";//被加签人审批
const updateForApprove = "PU_Contract/UpdateForApprove";//保存审批人对合同数据的修改
const revokPUApproval = "PU_Contract/RevokPUApproval/";//撤回合同审批流程
const getApprHistoryAndProgress = "PU_Contract/GetApprHistoryAndProgress/";//获取审批历史记录与最新的审批进度信息
const getPageDataVendorFromERP = "InitData/GetPageDataVendorFromERP";//获取供应商信息
export const serverAddress = APIAddress;//被加签人审批
@Injectable()
export class PcService {
    constructor(private http: Http) { }

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }

    /**
     * 采购合同 保存
     */
    savePurchaseContract(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + savePurchaseContract, body));
    }

    /**
     * 采购合同 提交流程
     */
    sumitPurchaseContract(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + sumitPurchaseContract, body));
    }

    /**
     * 采购合同 获取
     */
    getPUBaseDataByPUCode(pc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + getPUBaseDataByPUCode, { "PU_Code": pc_code }));
    }

    /**
     * 获取代理商认证信息
     * SYBMC 申请人事业部或页面选择的事业部
     * vendorNo 所选供应商编号
     */
    getPurchaseType(sybmc, vendorno): Observable<any> {
        return this.repJson(this.http.post(environment.server + getPurchaseType, {"SYBMC": sybmc,"vendorNo": vendorno}));
    }

    /**
     * 获取币种下拉框数据
     */
    getCurryBaseData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getCurryBaseData, null));
    }

    /**
     * 采购合同初始化(获取审批节点信息)
     */
    getPUWFInfoBaseData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getPUWFInfoBaseData, null));
    }

    /**
     * 根据平台号获取风险岗
     * YWFWDM 业务范围代码
     * FlatCode 平台编号
     */
    getWFFX(ywfwdm, flatcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getWFFX, {"YWFWDM": ywfwdm,"FlatCode": flatcode}));
    }
    
    /**
     * 采购合同 我的申请
     */
    getMyApplyList(applysearch: ApplySearch): Observable<any> {
        return this.repJson(this.http.post(environment.server + getMyApplyList, applysearch));
    }
    
    /**
     * 采购合同 我的审批
     */
    getForMyApproveList(applysearch: ApproveSearch): Observable<any> {
        return this.repJson(this.http.post(environment.server + getForMyApproveList, applysearch));
    }

    /**
     * 获取我方主体
     */
    getCompanyData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_companyUrl, null));
    }

    /**
     * 删除采购合同
     */
    deletePurchaseByPU_Code(pu_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + deletePurchaseByPU_Code, {"PU_Code": pu_code}));
    }

    /**
     * 获取我的待办任务数
     */
    getForMyApproveCount(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getForMyApproveCount, null));
    }

    /**
     * 获取我的审批  查询条件中下拉框数据
     */
    getDepartmentPlatform(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getDepartmentPlatform, null));
    }

    /**
     * 保存审批人对合同数据的修改
     */
    updateForApprove(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + updateForApprove, body));
    }

    /**
     * 撤回合同审批流程
     */
    revokPUApproval(pu_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + revokPUApproval + pu_code, null));
    }

    /**
     * 获取审批历史记录与最新的审批进度信息
     */
    getApprHistoryAndProgress(pu_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + getApprHistoryAndProgress + pu_code, null));
    }
    
    /**
     * 获取供应商信息
     */
    getPageDataVendorFromERP(query): Observable<any> {
        return this.repJson(this.http.post(environment.server + getPageDataVendorFromERP, query));
    }
}


//表单数据
export class PCData {
    AccessList: any = {
　　　　AccessoryBus:[],
　　　　AccessorySub:[],
　　　　AccessorySeal:[],
　　　　AccessoryD:[]
　　};
    PUBaseData: PCBaseData = new PCBaseData();
}
//采购合同
export class PCBaseData {
    "MainContractCode": any = "";
    "PU_Code": any = "";
    "AgentITcode": any = "";
    "AgentName": any = "";
    "ApplyITcode": any = "";
    "ApplyName": any = "";
    "ApplyTel": any = "";
    "Headquarter": any = "";
    "BusinessUnit": any = "";
    "Platform": any = "";
    "PlatformID": any = "";
    "Platform_C": any = "";
    "PlatformID_C": any = "";
    "SellerCompanyCode": any = "";
    "SellerName": any = "";
    "BuyerERPCode": any = "";
    "BuyerName": any = "";
    "Currency": any = "";
    "ContractMoney": any = null;
    "ContractName": any = "";
    "PurchaseType": any = null;
    "litigantName": any = "";
    "litigantTel": any = "";
    "ContractContent": any = "";
    "PU_Status": any = "0";
    // "CreateTime": any = "";
    "SealInfoJson": any = "";
    "IsRecovery": any = null;
    "RecoveryTime": any = "";
    "WFApproveUserJSON": any = "";
    "InstanceItemID": any = "";
    "YWFWDM": any = "PU01";
    "CurrentApprovalNode": any = "";
    "ApproveFinishTime": any = "";
    "PurchaseApplyCode": any = "";
    "Remark": any = "";
    "isUploadDoubleChapter": any = "0";
}
/**
 * 附件信息
 */
export class AccessItem {
    AccessoryID: any = null;//附件id
    AccessoryName: any = null;//附件名称
    AccessoryURL: any = null;//附件访问地址
}
/** * 我的申请 查询条件*/
export class ApplySearch {
    PU_Status = "1";//状态：-1 全部  0草稿  1提交  2己完成  3驳回
    SellerCompanyCode = "";//我方主体
    SealApprovalTimeStart = "";//印章岗审批完成开始日期
    SealApprovalTimeEnd = "";//印章岗审批完成结束日期
    SubmitTimeStart = "";//申请时间
    SubmitTimeEnd = "";//申请时间（结束）
    ContractName = "";//合同名称
    BuyerName = "";//对方主体名称
    MainContractCode = "";//合同编号
    currentpage = 1;//当前页
    pagesize = 10;//每页记录数
}
/** * 我的审批 查询条件*/
export class ApproveSearch {
 taskstatus = "0";//待办0，己办1，全部2
 SellerCompanyCode = "";//我方主体
 ApplyItcode = "";//申请人itcode
 Headquarter = "";//本部
 BusinessUnit = "";//事业部
 Platform = "";//平台
 SealApprovalTimeStart = "";//印章岗审批完成开始日期
 SealApprovalTimeEnd = "";//印章岗审批完成结束日期
 SubmitTimeStart = "";//申请时间
 SubmitTimeEnd = "";//申请时间（结束）
 ContractName = "";//合同名称
 BuyerName = "";//对方主体名称
 MainContractCode = "";//合同编号
 currentpage = 1;//当前页
 pagesize = 10;//每页记录数
 IsRecovery = null;//合同是否回收
}
/** */
export class PCApproveData {
    PUBaseData = {
        ItCode: "",//当前登录审批人itcode
        PU_Code: "",
        IsRecovery: null,//是否回收   (  0-否, 1-是, 2-PO   )
        RecoveryTime: null,//回收时间
        DeleteStatus: null,//删除状态 为1时表示删除所有附件,不为1时表示修改
        UserName: "",
        TaskOpinions: "",
        isUploadDoubleChapter : 0 //是否己上传双章扫描件( 0 否  1 是 )
    };
    AccessList = {
        AccessoryD: [],//双章扫描 附件(19)
        AccessoryS: [],//双章扫描 附件(19)
    }
}