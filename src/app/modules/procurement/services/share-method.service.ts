import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Router } from "@angular/router";
import { WindowService } from 'app/core';

import * as moment from 'moment';

export class GetPaymentAndDelivery{
    vendorcode:string;//供应商编号
    companycode:string;//公司主体
}

@Injectable()
export class ShareMethodService {

    constructor(private dbHttp: HttpServer,
        private http:Http,
        private router: Router,
        private WindowService: WindowService) { }
    getRateConvertPrice(forAmount, currency) {//输入 外币金额 根据最新汇率 计算总额
        let myDate = new Date();
        let body = {
            "foreignAmount": forAmount,
            "foreignCurrency": "0",
            "localCurrency": "1",
            "dateTime": moment(myDate).format("YYYY/MM/DD")
        }
        if (currency == '美元') {
            body.foreignCurrency = '0'
        }
        if (currency == '港元') {
            body.foreignCurrency = '2'
        }
        if (currency == '欧元') {
            body.foreignCurrency = '4'
        }
        let url = "material/rateconvert";
        return this.dbHttp.post(url, body)
            .toPromise()
            .then(response =>
                response.data.localAmount
            )
    }
    judgeSupplierType(facStr, venStr) {//判断供应商类型
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.dbHttp.get("PurchaseManage/GetVendorClass" + "/" + facStr + "/" + venStr, options)
            .toPromise()
            .then(response => response)
    }
    judgeSupplierOverdue(vendorno) {//判断供应商 是否过期
        // -1 超期 0无效 1有效
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.dbHttp.get("InitData/GetVendorValidity/" + vendorno, options)
            .toPromise()
            .then(response => response)
    }
    checkApplyTracenoExist(traceno, purchaseRequisitioIid) {//采购申请 验证需求跟踪号 是否存在
        let url = "PurchaseManage/CheckTraceNo";
        let body = {
            "TraceNo": traceno,
            "IsUpdate": false,     //true 修改 ；  false 新增  ；默认false
            "PurchaseRequisitionId": purchaseRequisitioIid //采购申请主键(如果修改采购申请下的采购清单)
        };
        if (body.PurchaseRequisitionId) { body.IsUpdate = true; }
        return this.dbHttp.post(url, body)
            .toPromise()
            .then(response =>
                response.Result
            )
    }
    checkOrderTracenoExist(traceno, purchaseRequisitioIid) {//采购订单 验证需求跟踪号 是否存在
        let url = "PurchaseManage/CheckTraceNo";
        let body = {
            "TraceNo": traceno,
            "IsUpdate": false,     //true 修改 ；  false 新增  ；默认false
            "PurchaseOrder_ID": purchaseRequisitioIid //采购申请主键(如果修改采购申请下的采购清单)
        };
        if (body.PurchaseOrder_ID) { body.IsUpdate = true; }
        return this.dbHttp.post(url, body)
            .toPromise()
            .then(response =>
                response.Result
            )
    }
    getProfitCenterState(faStr) {//获取利润中心 状态
        //0-不存在 1-未锁定(可提交) 2-被锁定
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.dbHttp.get("PurchaseManage/GetProfitCenterFrozenData/" + faStr, options)
            .toPromise()
            .then(response => {
                if (response.Result) {
                    let body = { "Message": "", "Result": null };
                    switch (response.Data) {
                        case 0:
                            body.Result = false;
                            body.Message = faStr + "利润中心不存在，请重新选择";
                            break;
                        case 2:
                            body.Result = false;
                            body.Message = faStr + "利润中心被锁定，请重新选择";
                            break;
                        case 1:
                            body.Result = true;
                            break;
                    }
                    return body;
                } else {
                    return response;
                }
            })
    }

    //在采购订单获取销售合同的状态（解除或变更）
    getSaleContractStateApi(saleContract){
        return this.http.post(environment.server+'PurchaseManage/CheckSaleContractInfo',saleContract).toPromise().then(Response=>Response.json())
    }

    //获取采购申请详情API
    getPurchaseManageApi(ID){
        return this.http.get(environment.server+'PurchaseManage/GetPurchaseRequisitionById/'+ID).toPromise().then(Response=>Response.json())        
    }

    //根据供应商和我方主体的变化，获取付款条款和交货条件
    getVendorInfoFromERP(getPaymentAndDelivery){
      return this.http.post(environment.server+'InitData/GetVendorInfoFromERP',getPaymentAndDelivery).toPromise().then(Response=>Response.json());
    }

    //获取采购申请信息列表
    getSelectedRequisitionInfo(queryData){
        return this.http.post(environment.server+'PurchaseManage/SelectedRequisitionInfo',queryData).toPromise().then(Response=>Response.json());
    }

    //获取备货标准周转天数
    getRevolveDays(Product) {
        return this.http.post(environment.server + 'PurchaseRequisitionRule/GetRevolveDays', {'ProductLine':Product}).toPromise().then(Response=>Response.json());
    }
    
}