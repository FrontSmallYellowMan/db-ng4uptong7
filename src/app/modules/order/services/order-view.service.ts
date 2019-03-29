import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
import {
  SaleOrderInfo,
  AdvancesInfo,
  InvoiceInfo,
  AccoriesInfo,
  MaterialInfo,
} from "./order-create.service";
import { environment } from '../../../../environments/environment.prod';

/**
 * 接口地址
 */
export const downloadIp = "http://10.0.1.26:88";
const contractRevokeUrl = "SaleOrder/GetApprHistoryAndProgress/";
export const contractAppUrl = "SaleOrder/ApproveSaleOrder";//同意、驳回审批接口地址
export const contractAddTaskUrl = "SaleOrder/AddApprovalTask";//加签审批接口地址
export const contractTransferUrl = "SaleOrder/HandOverApproval";//转办审批接口地址
export const contractSignUrl = "SaleOrder/ApproveAdditional";//审批加签
const getAppDataUrl = "SaleOrder/RevokeSaleOrderApproval/";
const isAutoDelyUrl = "SaleOrder/CheckOrderAutoDelivery/";//自动交货类型
const wrERPUrl = "SaleOrder/BusiApproveInsertERP";//自动交货类型
const salesOrderYWFWDM = "SystemConfig/SalesOrderYWFWDM";//是否判断 最大返款率
const unclearMaterialItems = "SaleOrder/GetUnclearMaterialItems";//获取订单下的原始借用物料列表
const updateUncleardbomsCp = "SaleOrder/UpdateUncleardbomsCp";//更新未清项dbomsCp（更新已还借用的数量）
const saveFilesUrl= 'SaleOrder/UpdateAccessory'; // 存储修改的附件

@Injectable()
export class OrderViewService {
  constructor(
    private http: HttpServer,
    private https:Http
  ) { }
  //设置请求头
  headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
  options = new RequestOptions({ headers: this.headers });
  /**
   * 获取销售合同审批历史及流程全景数据
   */
  contractRevoke(sc_code): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(contractRevokeUrl + sc_code, {}, this.options);
    // return this.http.post('S_Contract/GetApprHistoryAndProgress/733bb74c99364dd498833c6541056643');
  }

  /**
   * 撤销合同审批
   */
  getAppData(sc_code): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getAppDataUrl + sc_code, {}, this.options);
  }
  //商务审批写入ERP时，先要检查销售单是否是自动交货类型。
  isAutoDelivery(sc_code): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(isAutoDelyUrl + sc_code, {}, this.options)
  }

  // 写入erp
  wrERPAuto(param): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(wrERPUrl, param, this.options);
  }
  /**是否判断 最大返款率
  *华为事业部，判断物料的返款金额是否大于最大返款率（最大返款率即是金额的30%）
  *注，澳门订单不用调用此接口，直接判断最大返款率,显示是否整单
  */
  getSalesOrderYWFWDM(param): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(salesOrderYWFWDM, param, this.options);
  }
  /*
  *获取订单下的原始借用物料列表
  */
  getUnclearMaterialItems(param): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(unclearMaterialItems, param, this.options);
  }
  /*
  *更新未清项dbomsCp（更新已还借用的数量）
  */
  updateUncleardbomsCp(param): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(updateUncleardbomsCp, param, this.options);
  }
  /*
  *存储附件
  */
 saveFiles(param): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(saveFilesUrl, param, this.options);
  }

  //清除ERP订单编号
  clearERPcode(clearERPcodeData){
    return this.https.post(environment.server+'SaleOrder/ClearERPCode',clearERPcodeData).toPromise().then(Response=>Response.json());
  }

}

export class OrderViewForm {
  SalesOrderData: SaleOrderInfo = new SaleOrderInfo();
  UnSalesAmount: any = '';
  IsBackContract: any = '';
  ListPrePayment: AdvancesInfo[] = [];//预收款
  AccessoryList: AccoriesInfo[] = [];//附件
  ReceiptData: InvoiceInfo[] = [];
  DeliveryData: DeliveryMaterialInfo[] = [];
}
//送达方与物料信息
export class DeliveryMaterialInfo {
  Deliverinfo: Deliverinfo = new Deliverinfo();
  MaterialList: MaterialInfo[] = [];
}
//送达方信息
export class Deliverinfo {
  SDFID: any = "";//送达方ID
  SDFName: any = "";//送达方名称
  SDFAddress: any = "";//送达方地址
  SignatureMethod: any = ''; // 签收方式
  SDFCode: any = "";
  AreaID: any = "";
  SDFCity: any = "";
  SDFDistrict: any = "";
  ERPOrderCode: any = "";
  IsDelegate: any = "";
}

//清除ERP销售订单编号请求参数
export class ClearERPcodeData{
  SalesOrderID:string="";//销售订单号
  ERPOrderCode:string="";//ERP订单编号
}
