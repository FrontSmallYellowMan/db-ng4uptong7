import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment.prod';

/**
 * 接口地址
 */
const orderListData = "SaleOrder/SaleOrderContractList";
const orderListDataOther = "SaleOrder/NoContractSaleOrderList";
const approveListData = "SaleOrder/GetMyAproove";
const deleteSaleOrderUrl = 'SaleOrder/DeleteSaleOrder';
const getContractListUrl = 'SaleOrder/GetCompletedContractList';
const getApproveCountUrl = 'SaleOrder/GetMyAproveCount';
@Injectable()
export class OrderListService {
  constructor(
    private http: HttpServer,
    private https:Http) { }

  //设置请求头
  headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
  options = new RequestOptions({ headers: this.headers });
  /**
   * 获取我的申请列表数据(其他订单)
   */
  getOrderListDataOther(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(orderListDataOther, params, this.options);
  }
  /**
   * 获取我的申请列表数据（标准、澳门）
   */
  getOrderListData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(orderListData, params, this.options);
  }
  /**
   * 获取我的审批列表数据
   */
  getApproveListData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(approveListData, params, this.options);
  }
  /**
   * 删除订单号
   */
  deleteOrder(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(deleteSaleOrderUrl, params, this.options);
  }
  /**
   * 获取销售合同选择列表数据
   */
  getContractList(params: any): Observable<any> {
    return this.http.post(getContractListUrl, params, this.options);
  }
  /**
   * 获取待我审批的总数
   */
  getApproveCount(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getApproveCountUrl, params, this.options);
  }

  /**
   * 获取物料销售订单验证列表(订单物料验证列表接口)
   */
  getSaleOrderMaterialList(reqData:ReqGetOrderListData){
     return this.https.post(environment.server+'SaleOrder/GetSaleOrderListMaterial',reqData).toPromise().then(Response=>Response.json());
   }

   /**
   * 获取物料销售订单验证列表(验证预收款列表接口)
   */
  getSaleOrderPrePaymentList(reqData:ReqGetOrderListData){
    return this.https.post(environment.server+'SaleOrder/GetSaleOrderListPrePayment',reqData).toPromise().then(Response=>Response.json());
  }

  /**
   * 获取物料销售订单验证列表(删除销售订单列表接口)
   */
  getSaleOrderRevokeList(reqData:ReqGetOrderListData){
    return this.https.post(environment.server+'SaleOrder/GetSaleOrderListRevoke',reqData).toPromise().then(Response=>Response.json());
  }


   GetSaleOrderListMaterial
   GetSaleOrderListPrePayment
   GetSaleOrderListRevoke
   /**
    * 是否验证物料
    */
    isMaterialValidate(reqData:ReqMaterialValidate) {
      return this.https.post(environment.server+'SaleOrder/SetIsVerifyMaterial',reqData).toPromise().then(Response=>Response.json())
    }

    /**
    * 是否需要验证预收款
    */
   isSetIsChoosePrePayment(reqData:ReqSetIsChoosePrePayment) {
    return this.https.post(environment.server+'SaleOrder/SetIsChoosePrePayment',reqData).toPromise().then(Response=>Response.json())
  }

  /**
   * 删除销售订单
   */
  deleteSaleOrder(saleOrderID) {
     return this.https.post(environment.server+'SaleOrder/RevokeSaleOrder', {SaleOrderID:saleOrderID}).toPromise().then(Response=>Response.json());
  }

}
//Status:0-草稿 1-提交申请 3-审批通过 4-审批驳回 5-变更订单
//我的申请传送数据
export class Query {
  InputCondition: any = '';//合同单号,客户名称,创建人ITCode
  Status: any = '';//订单合同状态
  // CurrentITCode: any='';//用户itcode
  CreatedTimeStart: any = '';//申请开始时间
  CreatedTimeEnd: any = '';//申请结束时间
  OType: any = '';//订单类型标准单 OType值是0，澳门是1
  POCode:string = '';// 厂商PO号
  SalesAmountTotal:number = null;// 开单金额（验证，两位金额）
  DeliveryOrderCode:string = '';// 交货单号
  ERPOrderCode:string = '';// ERP销售单号
  MainContractCode:string = '';// 合同号
  BuyerName:string = '';// 客户名称

  CurrentPage: any = 1;//当前页
  PageSize: any = 10;//每页数据条数
}
// 我是审批传送数据
export class ExamineQuery {
  // itcode: any='';//当前登录人ITCODE
  taskstatus: any = '';//查询状态（0待我审批列表1.我己审批列表 2全部）
  OType: any = '';//订单类型标准单 OType值是0，澳门是1
  applydateStart: any = '';//申请开始时间
  applydateEnd: any = '';//申请结束时间
  POCode:string = '';// 厂商PO号
  SalesAmountTotal:number = null;// 开单金额（验证，两位金额）
  ERPOrderCode:string = '';// ERP销售单号
  ApplyName:string = '';// 申请人
  BuyerName:string = '';// 客户名称
  currentpage: any = 1;
  pagesize: any = 10;
  query:any='';

}



//销售合同选择数据
export class PostContractData {
  Flag: any = "";
  InputCondition: string = '';//合同单号,客户名称,创建人ITCode
  // CurrentITCode: string='';//用户itcode
  OType: any = "";//标准单是0，澳门是1
  CurrentPage: any = "";//当前页
  PageSize: any = "";//每页数据条数
}



//我的申请数据
export class CurrentTableData {
  SC_Code: string;//跳转单号
  MainContractCode: string;//合同编号
  BuyerName: string;//客户名称
  ContractMoney: string;//合同金额
  SalesAmount: string;//已开编号
  RemainingSum: string;//未开编号
  SalesOrderList: SalesOrderList[] = [];;//未开编号
  isOpen:boolean;//是否打开关闭合同列表
}
export class SalesOrderList {
  SalesOrderID: string = '';//销售单
  SalesOrderNum: string = '';//销售单编号
  OrderType: string = '';//订单类型
  CustomerName: string = '';//名称
  SalesAmountTotal: string = '';//销售金额
  CreatedTime: string = '';//申请时间
  CurrentApproveNode: string = '';//当前环节
  Status: string = '';//当前状态
  IsEdit: any = "";//是否可编辑
  ERPOrderCode: "";//-ERP订单号
  DeliveryAddressType: "";//否是多送达方 1-单送达发 2-多送达方
}


// 我是审批数据
export class ApproveTableData {
  SalesOrderId: string = '';//订单号
  ApplyName: string = '';//申请人
  Applydate: string = '';//申请日期
  taskTitle: string = '';//任务标题
  taskTableURL: string = '';//审批链接
  wfstatus: string = '';//审批状态
  currentapprove: string = '';//当前审批环节
  CustomerName: string = '';//客户名称
  SalesAmount: string = '';//销售金额
  ContractMoney: string = '';//合同金额
  OrderType: string = '';//订单类型
}

//获取销售订单验证列表的请求参数
 export class ReqGetOrderListData {
    SearchKey:string="";//搜索关键词
    PageIndex:string="1";
    PageSize:string="10";
 }

 //是否需要验证物料
 export class ReqMaterialValidate {
  SaleOrderID:string;//销售订单id 
  IsVerifyMaterial:boolean;//是否需要验证物料
 }

 //是否需要预收款
 export class ReqSetIsChoosePrePayment {
  SaleOrderID:string;//销售订单id 
  IsChoosePrePayment:boolean;//是否需要验证预收款
 }
