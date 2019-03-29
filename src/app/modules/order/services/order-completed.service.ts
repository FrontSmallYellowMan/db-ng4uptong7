import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';

/**
 * 接口地址
 */
const getLogisticsInfo = "SaleOrder/TMSLogisticInfo";//获取物流信息
const getOrdersCompeltedList = "SalesmanHomePage/GetCompleteSalesOrderList";//获取物流信息


@Injectable()
export class OrderCompletedService {
  constructor(private http: HttpServer,
  private https:Http) { }
  //设置请求头
  headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
  options = new RequestOptions({ headers: this.headers });
  /**
   * 获取销售合同审批历史及流程全景数据
   */
  getOrdersCompeltedList(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getOrdersCompeltedList, params, this.options);
  }
  /**
   * 获取我的申请列表数据
   */
  getLogisticsInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getLogisticsInfo, params, this.options);
  }
  /**
   * 获取物流信息列表
   */
  getSalesOrderVoucher(reqData){
    return this.https.post(environment.server+'SaleOrder/GetSalesOrderVoucher',reqData).toPromise().then(Response=>Response.json())
  }
    /**
   * 读取物流信息
   * @param param { SaleOrderID: value }
   */
  getDeliveryOrder(param){
    return this.https.post(environment.server+'SaleOrder/GetDeliveryOrder',param).toPromise().then(Response=>Response.json())
  }

}
//订单数据
export class SalesOrderInfo {
  MainContractCode: any = "";//合同编码
  CustomerName: any = "";//公司名称
  ContractMoney: any = "";//合同金额
  SalesOrderNum: any = "";//订单编码
  ERPOrderCode: any = "";//订单ERP编码
  SalesAmountTotal: any = "";//订单金额
  OrderTypeId: any = "";//订单类型
  CreateTime: any = "";//创建时间
  SalesITCode: any = "";//销售员itcode
  SalesName: any = "";//销售员姓名
}
//物流数据
export class LogisticsInfo {
  logisticProviderID: any = "";//"EMS"
  doNo: any = "";//"科捷单号"
  mailNo: any = "";//"快递单号"
  tradeNo: any = "";//"交易单号"
  erpNo: any = "";//"科捷erp单号"
  orderStatus: any = "";//"状态"
  sign: any = "";//"签收人"
  signTime: any = "";//"签收时间"
  memo: any = "";//""
  steps: StepObj = new StepObj();
  DeliveryOrderCode:string='';//交货单号
  InvoiceCode:string='';//发票号
  CertificateCode:string='';//物流凭证号

}
export class StepObj {
  step: StepInfo[] = [];
}
export class StepInfo {
  operatePoint: any = "";//节点
  acceptTime: any = "";//收件时间
  acceptAddress: any = "";//收件地点
  remark: any = "";
}
export class LogisticParams {
  providerID: any = "";// 承运商简称logisticProviderID
  orderNo: any = "";//"订单号"
  doNo: any = "";//"科捷单号"
  mailNo: any = "";//"快递单号"
  erpNo: any = "";//"科捷erp单号"
  tradeNo: any = "";//"交易单号"
}
export const OrderStatus = {
  "00": "未发货",
  "01": "已发货",
  "02": "整单签收",
  "03": "部分签收",
  "05": "签收失败",
  "06": "整单签收回执",
  "07": "部分签收回执"
}
