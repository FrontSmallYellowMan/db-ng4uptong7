import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
// export class MaterialList{};

/**
 * 接口地址
 */
const getAppSelectData = "SaleOrder/ContractMaterialList";

@Injectable()
//合同物料相关服务
export class ContractMaterialService {
    constructor(private http: HttpServer) { }
    //设置请求头
    headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    options = new RequestOptions({ headers: this.headers });
    // 查询合同物料列表
    enquiryMaterial(params: any): Observable<any>{
        this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        this.options = new RequestOptions({ headers: this.headers });
       return this.http.post(getAppSelectData,params,this.options);
   }


}
export class ContractList{
  ItCode:any = '';//申请人ItCode
  ContractInfo:any = '';//合同号
  ContractState:any = '';//合同状态
  PageIndex:number;//页码
  PageSize:number;//分页记录数
}
export class MaterialInfo{
    ContractCode: any = '';//合同编码
    BuyerName: any = '';//客户名称
    ContractMoney: any = '';//销售金额
    SaleOrderCount: any = '';//已开销售单
    HasMaterial: any = '';//是否有可开单物料
}
