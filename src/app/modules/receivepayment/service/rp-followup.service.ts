import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from 'environments/environment';
declare var window: any;

/**  接口地址 */
const GetArrearsInfo = "ReceivedPayments/GetArrearsInfo";//获取欠款明细
const GetFollowUpList = "ReceivedPayments/GetFollowUpList";//获取跟进记录列表
const SaveArrears = "ReceivedPayments/SaveArrears";//保存跟进记录
const GetFollowInfo = "ReceivedPayments/GetFollowInfo";//根据AFU_Code获取欠款跟进详细信息实体
const GetReviewList = "ReceivedPayments/GetReviewList";//根据跟进code获取所有评论
const SaveReview = "ReceivedPayments/SaveReview";//保存跟进评论信息
const GetFollowUpImportExcel = "ReceivedPayments/GetFollowUpImportExcel";//跟进记录导出

@Injectable()
export class FollowuplistService {
    constructor(private http: Http) { }
    
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.filter(res => res["_body"].length > 0).map(res => res.json());
    }
    /**
     * 获取欠款明细
     */
    GetArrearsInfo(query: ArrearsInfoQuery):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetArrearsInfo, query));
    }
    /**
     * 获取跟进记录列表
     */
    GetFollowUpList(query: ArrearsListQuery):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetFollowUpList, query));
    }
    /**
     * 保存跟进记录
     */
    SaveArrears(body):Observable<any> {
        return this.repJson(this.http.post(environment.server + SaveArrears, body));
    }
    /**
     * 根据AFU_Code获取欠款跟进详细信息实体
     */
    GetFollowInfo(code):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetFollowInfo, {AFU_Code: code}));
    }
    /**
     * 根据跟进code获取所有评论
     */
    GetReviewList(code):Observable<any> {
        return this.repJson(this.http.post(environment.server + GetReviewList, {AFU_Code: code}));
    }
    /**
     * 保存跟进评论信息
     */
    SaveReview(code, reviewcontent):Observable<any> {
        return this.repJson(this.http.post(environment.server + SaveReview, {AFU_Code: code, ReviewContent: reviewcontent}));
    }
    /**
     * 跟进记录导出
     */
    GetFollowUpImportExcel(query: ArrearsInfoQuery) {
        return this.http.post(environment.server + GetFollowUpImportExcel, query, {responseType: 3}).map(res=>res.blob());
    }

}

/** 查询条件 */
export class ArrearsListQuery {
    /**凭证号 */
    PZDM: string = "";
    /**行项目编号 */
    HXMDM: string = "";
    /**会计年度*/
    KJND: string = "";
    /**公司代码 */
    GSDM: string = "";
    /**每页记录数 */
    PageSize: number = 10;
    /**当前页 */
    CurrentPage: number = 1;
}

/** 欠款信息 */
export class ArrearsInfo {
    /**销售员姓名 */
        ZWMC: string = "";
    /**合同号 */
        ContractCode: string = "";
    /**客户名称 */
        KHMC: string = "";
    /**我方主体 */
        GSName: string = "";
    /**本部 */
        SYBMC: string = "";
    /**事业部 */
        YWFL: string = "";
    /**应还款日期 */
        CREDITDATE: string = "";
    /**欠款天 */
        CQTS: string = "";
    /**最终用户 */
        EndUserName: string = "";
    /**付款条款 */
        PayItem: string = "";
    /**凭证号 */
        PZDM: string = "";
    /**行项目编号 */
        HXMDM: string = "";
    /**会计年度 */
        KJND: string = "";
    /**公司代码 */
        GSDM: string = "";
    /**销售单单号 */
        XSDDM: string = "";
    /**客户代码 */
        KHDM: string = "";
    /**销售员itcode */
        ITCODE: string = "";
}

/**
 * 查询条件 获取欠款明细
 */
export class ArrearsInfoQuery {
    /**凭证号 */
    PZDM: string = "";
    /**行项目编号 */
    HXMDM: string = "";
    /**会计年度 */
    KJND: string = "";
    /**公司代码 */
    GSDM: string = "";
}

/** 跟进信息 表单数据 */
export class ArrearsModel {
    AFModel: ArrearsFollowUp = new ArrearsFollowUp();
    Accessory: AccessoryItem[] = [];
}
class ArrearsFollowUp {
    AFU_Code : string = "";
    PZDM : string = "";
    HXMDM : string = "";
    KJND : string = "";
    GSDM : string = "";
    Title : string = "";
    ArrearsContent : string = "";
    CreateItcode : string = "";
    CreateName : string = "";
    CreateTime : string = "";
    ReviewCount: number = 0;
}
export class AccessoryItem {
    AccessoryID:string = "";
    AccessoryName:string = "";
    AccessoryURL:string = "";
    AccessoryType:string = "";
    CreatedTime:string = "";
    CreatedByITcode:string = "";
    CreatedByName:string = "";
    InfoStatus:string = "";
}
/** 评论内容 */
export class ReviewModel{
    AFU_Code:string = "";
    ReviewContent:string = "";
    ReviewItcode:string = "";
    ReviewName:string = "";
    ReviewTime:string = "";
}