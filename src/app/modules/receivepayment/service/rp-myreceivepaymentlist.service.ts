import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from 'environments/environment';
declare var window: any;

/**  接口地址 */
const getCompanyData = "PU_Contract/GetBaseCompany";//获取我方主体信息
const GetBankSubject = "ReceivedPayments/GetBankSubject";//获取核销系统科目列表
const GetBankBills = "ReceivedPayments/GetBankBills";//获取我的到款列表

@Injectable()
export class MyreceivepaymentlistService {
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
     * 获取核销系统科目列表
     */
    getBankSubject():Observable<any> {
        return this.repJson(this.http.post(environment.server + GetBankSubject, null));
    }
    /**
     * 获取我的到款列表
     */
    getBankBills(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetBankBills, query));
    }

}
/** 获取我的到款列表 查询条件 */
export class MyreceivepaymentlistQuery {
    /**公司名称或编码 */
    corpCode: string = "";
    /**客户名称或编码 */
    custCode: string = "";
    /**到帐开始时间 */
    startDate: string = "";
    /**到帐结束时间 */
    EndDate: string = "";
    /**当前页 */
    currage: number = 1;
    /**每页记录条数 */
    pagesize: number = 10;
    /**0 -全部 1未认领 2已认领 */
    ClaimState: number = 1;
    /**科目-银行号 */
    bankAcc: string = "";
}