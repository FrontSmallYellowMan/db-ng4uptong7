import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from 'environments/environment';
declare var window: any;

/**  接口地址 */
const getCompanyData = "PU_Contract/GetBaseCompany";//获取我方主体信息
const GetMyArrearsList = "ReceivedPayments/GetMyArrearsList";//获取我的欠款列表
const GetALLArrearsList = "ReceivedPayments/GetALLArrearsList";//获取我的欠款列表
const GetDepartmentPlatform = "ReceivedPayments/GetDepartmentPlatform";//获取平台信息
const GetArrearImportExcel = "ReceivedPayments/GetArrearImportExcel";//导出欠款
const SendMailCB = "ReceivedPayments/SendMailCB";//邮件催办通知接口

@Injectable()
export class MyarrearslistService {
    constructor(private http: Http) { }
    
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.filter(res => res["_body"].length > 0).map(res => res.json());
    }
    /**
     * 获取公司列表
     */
    getCompanyData():Observable<any> {
        return this.repJson(this.http.post(environment.server + getCompanyData, null));
    }
    /**
     * 获取我的欠款列表
     */
    GetMyArrearsList(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetMyArrearsList, query));
    }
    /**
     * 获取我的欠款列表 风控
     */
    GetALLArrearsList(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetALLArrearsList, query));
    }
    /**
     * 获取平台信息
     */
    GetDepartmentPlatform():Observable<any> {
        return this.repJson(this.http.post(environment.server + GetDepartmentPlatform, null));
    }
    /**
     * 导出欠款
     */
    GetArrearImportExcel(query) {
        return this.http.post(environment.server + GetArrearImportExcel, query, {responseType: 3}).map(res=>res.blob());
    }
    /**
     * 邮件催办通知接口
     */
    SendMailCB(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + SendMailCB, query));
    }

}

/** 获取我的欠款列表 查询条件 */
export class MyarrearslistQuery {
    /**客户名称或编码 */
    KH: string = "";
    /**合同编号 */
    ContractCode: string = "";
    /**欠款类型 0全部欠款1 超期预警 2 超期欠款*/
    Type: string = "";
    /**到帐搜索开始时间 */
    StartTime: string = "";
    /**到帐搜索结束时间 */
    EndTime: string = "";
    /**金额类型0 不限 1 100万以下 2 100万-300万 3大于300万 */
    CQJE: any = "";
    /**我方主体 */
    ContractSubject: string = "";
    /**平台 */
    SSPT: string = "";
    /**销售员 */
    ZWMC: string = "";
    /**当前页 */
    CurrentPage: number = 1;
    /**每页记录条数 */
    PageSize: number = 10;
}
/** 导出 */
export class ImportArrearslistQuery {
    /**客户名称或编码 */
    KH: string = "";
    /**合同编号 */
    ContractCode: string = "";
    /**欠款类型 0全部欠款1 超期预警 2 超期欠款*/
    Type: string = "";
    /**到帐搜索开始时间 */
    StartTime: string = "";
    /**到帐搜索结束时间 */
    EndTime: string = "";
    /**金额类型0 不限 1 100万以下 2 100万-300万 3大于300万 */
    CQJE: any = "";
    /**我方主体 */
    ContractSubject: string = "";
    /**平台 */
    SSPT: string = "";
    /**销售员 */
    ZWMC: string = "";
    /**导出类型  0销售员   1事业部*/
    ExprotType: string = "0";
}