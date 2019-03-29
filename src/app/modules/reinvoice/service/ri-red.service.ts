import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { environment } from "../../../../environments/environment";
declare var window: any;

/**
 * 接口地址
 */
const getBaseDataListUrl = "InitData/BaseDataList";//下拉框数据源
const getUserInfoUrl = "InitData/GetUserInfo";//获取登陆人信息
const getUserPhoneUrl = "InitData/GetCurrentUserPhone";//获取登陆人信息
const getApplyDataUrl = "InvoiceRevise/GetApplyById/";//获取页面申请数据
const saveApplyUrl = "InvoiceRevise/SaveApply";//保存或提交数据
const delDescendantInfoUrl = "InvoiceRevise/DelDescendantInfo/";//删除财务及冲退明细信息
const getInvoiceByOrderNoUrl = "InvoiceRevise/GetInvoiceByOrderNo/";//查询财务系统发票号票面信息——根据订单号
const getInvoiceByExternalNoUrl = "InvoiceRevise/GetInvoiceByExternalNo/";//查询财务系统发票号票面信息——根据外部发票号
const getMaterialUrl = "InvoiceRevise/GetMaterial";//查询冲退物料明细信息、送达方信息接口——根据订单号
const getAccountAndPayDateUrl = "InvoiceRevise/GetAccountAndPayDate";//根据系统发票号获取首付基准日和清账号
const delInvoiceInfoByInvoiceIdUrl = "InvoiceRevise/DeleteInvoice/";//根据财务信息id删除发票信息
const getCustomerNameUrl = "InvoiceRevise/GetCustomerName/";//根据客户编号查询客户名称
const getMaterialDescUrl = "InvoiceRevise/GetMaterialDesc/";//根据物料号查询物料描述
const deleteMaterialUrl = "InvoiceRevise/DeleteMaterial/";//删除一条冲退物料明细
const deleAccessoryUrl = "InvoiceRevise/DeleAccessory/";//删除单个附件
const getApproveHistoryUrl = "InvoiceRevise/GetApproveHistory/";//获取审批历史数据接口和流程进度条信息
const approveChongHongUrl = "InvoiceRevise/ApproveChongHong";//冲红流程审批接口
const approveProductReturnUrl = "InvoiceRevise/ApproveProductReturn";//退换货流程审批接口
const invoiceOverMonthUrl = "InvoiceRevise/InvoiceOverMonth/";//判断发票日期是否过月
const saveToERPUrl = "InvoiceRevise/SaveToERP";//写入EPR后返回的单据号接口
const getTaskStatusUrl = "InvoiceRevise/GetTaskStatus/";//查询流程任务是否已经处理
const getCurrentWFNodeUrl = "InvoiceRevise/GetCurrentWFNode/";//驳回时，获取流程taskid和nodeid
const getIRApplyPageDataUrl = "InvoiceRevise/GetIRApplyPageData";//我的申请
const getTaskListUrl = "InvoiceRevise/GetTaskList";//我的审批
const delApplyByApplyIDUrl = "InvoiceRevise/DelApply/";//删除我的申请
const getProvinceCityInfoUrl = "InitData/GetProvinceCityInfo";//省份城市区县信息
const WorkflowNodeUserSet = "InvoiceRevise/WorkflowNodeUserSet";//冲红退换货事业部审批人集合

@Injectable()
export class RedApplyService {
    constructor(private http: Http) { }

    uploadAccesslUrl = "api/InvoiceRevise/UploadIRAccessories";//上传附件地址
    batchImportForDOA = "/InvoiceRevise/BatchImportForDOA";//批量上传
    approveChongHongUrl = "/InvoiceRevise/ApproveChongHong";//冲红流程审批接口
    approveProductReturnUrl = "/InvoiceRevise/ApproveProductReturn";//退换货流程审批接口
    addTaskUrl = "/InvoiceRevise/AddTask";//加签
    approveAddTransferUrl = "/InvoiceRevise/AddTransfer";//转办
    approveAddTaskUrl = "/InvoiceRevise/ApproveAddTask";//加签审批接口

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.filter(res => res["_body"].length > 0).map(res => res.json());
    }
    /**
     * 下拉框数据源
     */
    getBaseDataList(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getBaseDataListUrl, null));
    }
    /**
     * 省份城市区县信息
     */
    getProvinceCityInfo(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getProvinceCityInfoUrl, null));
    }
    /**
     * 获取登陆人信息（没有电话）
     */
    getUserInfo(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getUserInfoUrl, null));
    }
    /**
     * 获取登陆人电话
     */
    getUserPhone(): Observable<any> {
        return this.repJson(this.http.get(environment.server + getUserPhoneUrl));
    }
    /**
     * 获取页面申请数据
     */
    getApplyDataById(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + getApplyDataUrl + applyid, null));
    }
    /**
     * 提交申请信息（保存、提交）
     */
    saveApply(applydata): Observable<any> {
        return this.repJson(this.http.post(environment.server + saveApplyUrl, applydata));
    }
    /**
     * 冲红流程审批接口
     */
    approveChongHong(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + approveChongHongUrl, body));
    }
    /**
     * 退换货流程审批接口
     */
    approveProductReturn(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + approveProductReturnUrl, body));
    }
    /**
     * 删除财务及冲退明细信息
     */
    delDescendantInfo(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + delDescendantInfoUrl + applyid, null));
    }
    /**
     * 查询财务系统发票号票面信息  根据外部发票号
     */
    getInvoiceByExternalNo(externalno): Observable<any> {
        return this.repJson(this.http.post(environment.server + getInvoiceByExternalNoUrl + externalno, null));
    }
    /**
     * 查询财务系统发票号票面信息  根据订单号
     */
    getInvoiceByOrderNo(orderno): Observable<any> {
        return this.repJson(this.http.post(environment.server + getInvoiceByOrderNoUrl + orderno, null));
    }
    /**
     * 查询冲退物料明细信息、送达方信息接口——根据订单号
     */
    getMaterial(param): Observable<any> {
        return this.repJson(this.http.post(environment.server + getMaterialUrl, param));
    }
    /**
     * 根据系统发票号获取首付基准日和清账号
     */
    getAccountAndPayDate(param): Observable<any> {
        return this.repJson(this.http.post(environment.server + getAccountAndPayDateUrl, param));
    }
    /**
     * 根据财务信息id删除发票信息
     */
    delInvoiceInfoByInvoiceId(invoiceid): Observable<any> {
        return this.repJson(this.http.post(environment.server + delInvoiceInfoByInvoiceIdUrl + invoiceid, null));
    }
    /**
     * 根据客户编号查询客户名称
     */
    getCustomerName(customercode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getCustomerNameUrl + customercode, null));
    }
    /**
     * 根据物料号查询物料描述
     */
    getMaterialDesc(materialcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getMaterialDescUrl + materialcode, null));
    }
    /**
     * 删除一条冲退物料明细
     */
    deleteMaterial(materialid): Observable<any> {
        return this.repJson(this.http.post(environment.server + deleteMaterialUrl + materialid, null));
    }
    /**
     * 删除单个附件
     */
    deleAccessory(accessoryid): Observable<any> {
        return this.repJson(this.http.post(environment.server + deleAccessoryUrl + accessoryid, null));
    }
    /**
     * 获取审批历史数据和流程进度条信息
     */
    getApproveHistory(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + getApproveHistoryUrl + applyid, null));
    }
    /**
     * 判断发票日期是否过月
     */
    invoiceOverMonth(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + invoiceOverMonthUrl + applyid, null));
    }
    /**
     * 写入EPR
     */
    saveToERP(savetoerpdata): Observable<any> {
        return this.repJson(this.http.post(environment.server + saveToERPUrl, savetoerpdata));
    }
    /**
     * 查询流程任务是否已经处理
     */
    getTaskStatus(taskid): Observable<any> {
        return this.repJson(this.http.post(environment.server + getTaskStatusUrl + taskid, null));
    }
    /**
     * 驳回时，获取流程taskid和nodeid
     */
    getCurrentWFNode(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + getCurrentWFNodeUrl + applyid, null));
    }
    
    /**
     * 获取我的申请列表数据
     */
    getIRApplyPageData(param): Observable<any> {
        return this.repJson(this.http.post(environment.server + getIRApplyPageDataUrl, param));
    }
    
    /**
     * 获取我的审批列表数据
     */
    getTaskList(param): Observable<any> {
        return this.repJson(this.http.post(environment.server + getTaskListUrl, param));
    }

    /**
     * 删除我的申请
     */
    delApplyByApplyID(applyid): Observable<any> {
        return this.repJson(this.http.post(environment.server + delApplyByApplyIDUrl + applyid, null));
    }
    
    /**
     * 获取冲红退换货事业部审批人集合
     */
    WorkflowNodeUserSet(bizcode,pfcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + WorkflowNodeUserSet, {BizCode:bizcode,PlatformCode:pfcode}));
    }
}

/**
 * 
 */