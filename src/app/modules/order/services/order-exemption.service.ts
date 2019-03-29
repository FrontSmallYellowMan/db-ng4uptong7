import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
const exemptionListUrl="CustomerOverdueExemption/GetExemptConditions";//超期豁免条件列表接口地址
const exemptionCustomerUrl="CustomerOverdueExemption/GetERPCustomerInfo"//获得客户信息
const getCustomerUnClearDetailUrl = "CustomerOverdueExemption/GetCustomerUnClearList/";//查看客户应收款明细
const saveAddUrl="CustomerOverdueExemption/SaveAdd";//新建保存
const deleteConditionUrl="CustomerOverdueExemption/DeleteCondition/";//删除
const getExemptionConditionUrl="CustomerOverdueExemption/GetModelByID/"//通过ID获得实体
const saveEditUrl="CustomerOverdueExemption/SaveEdit"//编辑保存
@Injectable()
export class OrderExemptionService {
  constructor(private http: HttpServer) { }
    //设置请求头
    headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    options = new RequestOptions({ headers: this.headers });
    getExemptionList(params: any):Observable<any> {
       return this.http.post(exemptionListUrl, params, this.options);     
    }
    getExemptionCondition(params:any):Observable<any>{
      return this.http.post(getExemptionConditionUrl+params,{},this.options)
    }
     /**
   * 查看客户ERP信息
   */
  getERPCustomerInfo(params: any): Observable<any> {
    return this.http.post(exemptionCustomerUrl, params, this.options);
  }
  getCustomerUnClearDetail(params: any): Observable<any> {
    return this.http.post(getCustomerUnClearDetailUrl+params,{}, this.options);
  }
  saveAdd(params:any):Observable<any>{
    return this.http.post(saveAddUrl,params,this.options);
  }
  deleteCondition(params:any):Observable<any>{
    return this.http.post(deleteConditionUrl+params,{},this.options);
  }
  saveEdit(params:any):Observable<any>{
    return this.http.post(saveEditUrl,params,this.options)
  }
}
export class Query {
    InputCondition: any = '';//合同单号,客户名称,创建人ITCode  
    CurrentPage: any;//当前页
    PageSize: any;//每页数据条数
  }
//编辑送达方，列表信息
export class CustomerInfo {
  KTOKD: any = "";//客户类型
  KUNNR: any = "";//客户ERP编号
  NAME: any = "";//客户名称
  ORT01: any = "";//地址
  checked: any = "";//
  ExemptionConditions: CustomerExemptionCondition[]=[];
}
export class CustomerExemptionCondition{
  ID:any;//主键ID
  CustomerCode:any="";//客户编号
  CustomerName:any="";//客户名称
  StartTime:any="";//开始时间
  EndTime:any="";//结束时间
  Remark:any="";//备注
  YWFWDM:any="";
  ArrearsAmount:any="";
}
//应收账款明细
export class OverdueArrearsInfo {
  CORP: any = "";//公司代码
  DEPT: any = "";//业务范围
  ENDDATE: any = "";//预计收款日
  SALE_DATE: any = "";//销售日期
  EXPIRE_FLAG: any = "";//超期标记
  EXPIRE_DAYS: any = "";//超期天数
  AMOUNT: any = "";//欠款金额
  VBELN: any = "";//ERP订单号
  TAXINVOICE: any = "";//增值税发票号
  SALESMAN: any = "";//销售员名称
  SALESNAME: any = "";//平台
  BLART: any = "";//
  BLART_TEXT: any = "";//
  QPZT: any = "";//
  BILNO: any = "";//
  BILWR: any = "";//
  OUTDT: any = "";//
  NETDT: any = "";//
  BLDAT: any = "";//
  COMET: any = "";//
  INDT: any = "";//
  RCVER: any = "";//
  DTNM1: any = "";//
  EMSNO: any = "";//
  SDDAT: any = "";//
  SDCMT: any = "";//
  NORSN: any = "";//
  ZPCJF: any = "";//
  ZPT: any = "";//
  VKBUR: any = "";//
  HKONT: any = "";//
  ZFBDT: any = "";//
  checked:any="";//选中状态
}