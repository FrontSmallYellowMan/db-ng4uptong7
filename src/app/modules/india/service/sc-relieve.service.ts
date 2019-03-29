
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';
declare var window: any;

/**
 * 接口地址
 */
const getBaseBySc_code = "RescissionContractChange/GetBaseBySc_code";
const saveRelieveContract = "RescissionContractChange/SaveRelieveContract";
const sumitRelieveContract = "RescissionContractChange/SumitRelieveContract";
const getRelieveContractWithPDF = "RescissionContractChange/GetRelieveContractWithPDF/";
const checkRelieveStatus = "RescissionContractChange/CheckRelieveStatus/";
const checkNullifyStatus = "RescissionContractChange/CheckNullifyStatus/";

export class RelieveContract {
    SC_Code:any = "";//null,                      
    RE_Code:any = "";//SDXS03201802289045-JC ,   --协议编号
    SellerName:any = "";//广州神州数码有限公司, --卖方 名称
    BuyerName:any = "";//杭州力普电子有限公司,   --买方 名称
    Re_Status:any = "";//null,                          --解除协议状态
    MainContractCode:any = "";//SDXS03201802289045,   --电子合同号
    QDTime:any = null;//2018-03-02,        --电子合同签定日期
    ContractMoney:any = "";//10000,         --合同金额
    ContractName:any = "";//null,            --合同名称
    RelieveReason:any = "";//null,     --解除原因
    ContractTime:any = "";//null,      --卖方签定时间
    BuyTime:any = "";//null            --买方签定时间
    Barcode:any = "";//null            --条形码
    REAccessoryJson:any = null;//null  --自定义销售合同解除  附件信息
}

@Injectable()
export class ScRelieveService {
    constructor(private http: Http) { }
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    /**
     * 根据sc_code初始化解除协议信息
     */
    getBaseBySc_code(sc_code):Observable<any> {
        return this.repJson(this.http.post(environment.server + getBaseBySc_code, {sc_code: sc_code}));
    }
    /**
     * 解除协议暂存接口
     */
    saveRelieveContract(relievecontractdata: RelieveContract):Observable<any> {
        return this.repJson(this.http.post(environment.server + saveRelieveContract, {"ReModel":relievecontractdata}));
    }
    /**
     * 解除协议提交接口
     */
    sumitRelieveContract(relievecontractdata: RelieveContract):Observable<any> {
        return this.repJson(this.http.post(environment.server + sumitRelieveContract, {"ReModel":relievecontractdata}));
    }
    /**
     * 预览解除协议
     */
    getRelieveContractWithPDF(sc_code) {
        window.open(environment.server + getRelieveContractWithPDF + sc_code);
    }
    /**
     * 根据sc_code判断合同是否可以进行解除
     */
    checkRelieveStatus(sc_code) {
        return this.repJson(this.http.get(environment.server + checkRelieveStatus + sc_code));
    }
    /**
     * 根据sc_code判断合同是否可以进行单章作废
     */
    checkNullifyStatus(sc_code) {
        return this.repJson(this.http.get(environment.server + checkNullifyStatus + sc_code));
    }

}
