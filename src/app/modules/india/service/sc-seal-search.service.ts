
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from 'environments/environment';

/**  接口地址 */
const getCompanyData = "PU_Contract/GetBaseCompany";//获取我方主体信息
const GetDepartmentPlatform = "ReceivedPayments/GetDepartmentPlatform";//获取平台信息
const GetContractInfoFromWorkflow = "S_Contract/GetContractInfoFromWorkflow";//印章岗查询列表
const getAppSelectData = "S_Contract/GetDepartmentPlatform";//获取下拉框数据源（本部，事业部，平台）

@Injectable()
export class SealSearchService {
    constructor(private http: Http) { }
    
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    /**
     * 获取公司列表
     */
    getCompanyData():Observable<any> {
        return this.repJson(this.http.post(environment.server + getCompanyData, null));
    }
    /**
     * 盖章岗查询
     */
    GetContractInfoFromWorkflow(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetContractInfoFromWorkflow, query));
    }
    /**
     * 获取平台信息
     */
    GetDepartmentPlatform():Observable<any> {
        return this.repJson(this.http.post(environment.server + GetDepartmentPlatform, null));
    }

    /**
     * 获取我的审批  查询条件中下拉框数据
     */
    getAppSelectData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getAppSelectData,null));
    }

}

/** 查询条件 */
export class SealSearchQuery {
    /**合同主信息编号 */
    MainContractCode: string = "";
    /**我方主体 */
    SellerCompanyCode: string = "";
    /**客户名称*/
    BuyerName: string = "";
    /**项目名称 */
    ProjectName: string = "";
    /**平台ID */
    PlatformID: string = "";
    /**本部名称*/
    Headquarter: any = "";
    /**事业部名称 */
    BusinessUnit: string = "";
    /**印章岗审批完成时间 */
    FinishTimeBegin: string = "";
    /**印章岗审批完成时间 */
    FinishTimeEnd: string = "";
    /**合同创建来源 */
    ContractSource: string = "";
    /**合同类型 */
    ContractType: string = "";
    /**是否已回收 */
    IsRecovery: string = "";
    /**销售员[ItCode或Name] */
    ApplyInfo: string = "";
    /**当前页 */
    currentpage: number = 1;
    /**每页记录数 */
    pagesize: number = 10;
    /**合同金额 开始 */
    StartMoney: string = "";
    /**合同金额 结束 */
    EndMoney: string = "";
    /**合同金额*/
    SCMoney: string = "";
}