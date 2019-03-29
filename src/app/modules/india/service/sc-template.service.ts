
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from 'environments/environment';
declare var window: any;

/**  接口地址 */
const ConvertEContractUrl = "E_Contract/ConvertEContract";
const SaveEContractUrl = "E_Contract/SaveEContract";
const DeleteEContractUrl = "E_Contract/DeleteEContract/";
const SaveTemplateUrl = "E_Contract/SaveECFavorite";
const GetMyTemplateUrl = "E_Contract/GetFavoriteContents/";
const GetContractCodeUrl = "E_Contract/CreateECCode/";
const GetDisputeDealtUrl = "E_Contract/GetECDisputeDealtType";
export const uploadECAccessories = "api/E_Contract/UploadECAccessories";
export const getECPackageResultUrl = "E_Contract/ECPackageResult/";//获取下拉框数据 卖方和票据
export const getProvinceCityInfoUrl = "InitData/GetProvinceCityInfo";//获取下拉框数据 省 市 区县
export const getEContractUrl = "E_Contract/GetEContract/";//获取电子合同信息
export const getAbstract = "EB_Contract/GetAbstract/";//获取电子合同信息-eb
export const getERPCompanyInfoUrl = "E_Contract/GetERPCompanyInfo/";//获取买方信息
export const getBuyerInfoUrl = "E_Contract/GetBuyerInfo/";//获取买方列表
export const CheckBU = "E_Contract/CheckBU/";//是否华为本部
export const CheckTheNotice = "E_Contract/CheckTheNotice";//验证备注与单价是否一致
const GetDepartmentPlatform = "ReceivedPayments/GetDepartmentPlatform";//获取平台信息
const CreateECDisputeDealt = "E_Contract/CreateECDisputeDealt";//添加争议解决方案
const getCompanyData = "PU_Contract/GetBaseCompany";//获取我方主体信息
const GetDisputedealtList = "E_Contract/GetECDisputeDealt";//获取争议解决方式列表

@Injectable()
export class ScTemplateService {
    constructor(private http: Http) { }
    
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    /**
     * 下一步
     */
    convertEContract(body):Observable<any> {
        return this.repJson(this.http.post(environment.server + ConvertEContractUrl, body));
    }

    /**
     * 暂存 预览
     */
    saveEContract(body):Observable<any> {
        return this.repJson(this.http.post(environment.server + SaveEContractUrl, body));
    }

    /**
     * 上一步(删除)
     */
    DeleteEContract(sc_code):Observable<any> {
        return this.repJson(this.http.post(environment.server + DeleteEContractUrl + sc_code, null));
    }
    
    /**
     * 保存模板
     */
    saveTemplate(body):Observable<any> {
        return this.repJson(this.http.post(environment.server + SaveTemplateUrl, body));
    }

    /**
     * 获取我的私藏模板数据
     */
    getMyPrivateTemplate(id):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetMyTemplateUrl + id, null));
    }

    /**
     * 获取合同编码
     */
    getContractCode(sellerCompanyCode):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetContractCodeUrl + sellerCompanyCode, null));
    }

    /**
     * 获取争议解决方式
     */
    getDisputeDealtInfo(params):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetDisputeDealtUrl, params));
    }/**
     * 获取下拉框数据（卖方和票据信息）
     */
    getECPackageResult(bizScopeCode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getECPackageResultUrl + bizScopeCode,null));
    }
    /**
     * 获取下拉框数据（省 市 区县）
     */
    getProvinceCityInfo(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getProvinceCityInfoUrl, null));
    }
    /**
     * 获取电子合同信息
     */
    getEContractInfo(sc_code): Observable<any> {
        return this.repJson(this.http.get(environment.server + getEContractUrl + sc_code));
    }
    /**
     * 获取EB电子合同信息
     */
    getAbstract(EBContractID): Observable<any> {
        return this.repJson(this.http.post(environment.server + getAbstract + EBContractID, null));
    }
    /**
     * 获取买方信息
     */
    getBuyerInfoByErpCode(erpCode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getERPCompanyInfoUrl + erpCode, null));
    }
    /**
     * 获取买方信息
     */
    getBuyerInfoByName(buyerName): Observable<any> {
        return this.repJson(this.http.post(environment.server + getBuyerInfoUrl + buyerName, null));
    }
    /**
     * 是否华为本部业务范围
     */
    CheckBU(ywfwdm): Observable<any> {
        return this.repJson(this.http.get(environment.server + CheckBU + ywfwdm));
    }
    /**
     * 验证备注与单价是否一致
     */
    CheckTheNotice(productList): Observable<any> {
        return this.repJson(this.http.post(environment.server + CheckTheNotice, { Product: productList }));
    }
    /**
     * 获取平台信息
     */
    GetDepartmentPlatform():Observable<any> {
        return this.repJson(this.http.post(environment.server + GetDepartmentPlatform, null));
    }
    /**
     * 添加争议解决方式
     */
    CreateECDisputeDealt(body):Observable<any> {
        return this.repJson(this.http.post(environment.server + CreateECDisputeDealt, {"ECDisputeDealt": body}));
    }
    /**
     * 获取争议解决方式列表
     */
    GetDisputedealtList(query):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetDisputedealtList, query));
    }
    /**
     * 获取公司列表
     */
    getCompanyData():Observable<any> {
        return this.repJson(this.http.post(environment.server + getCompanyData, null));
    }

}

/** 获取争议解决方式列表 查询条件 */
export class MydisputedealtlistQuery {
    /**平台编码 */
    FlatCode: string = "";
    /**卖方编码 */
    SellerCompanyCode: string = "";
    /**买方名称*/
    BuyerName: string = "";
    /**当前页 */
    CurrentPage: number = 1;
    /**每页记录条数 */
    PageSize: number = 10;
}
