import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { Server } from 'selenium-webdriver/safari';

/**
 * 接口地址
 */
const getSOBaseData = "SaleOrder/GetBasicDataDropList";//获取下拉列表基础信息
const createSalesOrder = "SaleOrder/AddSalesOrder";//创建销售单
const createNoCSalesOrder = "SaleOrder/NewNoContractSaleOrder";//创建无合同销售单
const getSOFullData = "SaleOrder/GetSaleOrderModel";//销售订单信息获取
const getAdvancesData = "SaleOrder/GetAdvancesReceived";//查询预收款信息
const saveAdvancesData = "SaleOrder/ConfirmPrepayment";//保存预收款
const delAdvancesData = "SaleOrder/DeletePrepanyment";//删除预收款
const deletePrepanyment = "SaleOrder/DeletePrepanymentByOrderID";//切换删除预收款
const getCustomerUnClearDetail = "SaleOrder/GetCustomerUnClearDetail";//查看客户应收款明细
const getCustomerUnClerData = "SaleOrder/GetCustomerUnClerTotalInfo";//查询客户应收、超期欠款金额
const getERPCustomerInfo = "SaleOrder/GetERPCustomerInfo";//查询售达方信息
const getMaterialInfo = "SaleOrder/GetMaterialInfo";//获取合同物料信息
const getProvinceCityInfo = "InitData/GetProvinceCityInfo";//获取省市区信息
const getGetInvoiceInfo = "SaleOrder/GetInvoiceList";//获取关联发票信息
const uploadFilesUrl = "api/SaleOrder/UploadSOAccessories";//上传附件
const uploadAmountFilesUrl = "api/SaleOrder/GetMaterialInfoByExcel";//上传附件，物料金额
const downloadAmountFilesUrl = "api/SaleOrder/DownloadExcelFile/Contract";//下载附件，物料金额
const modifyCustomerTaxCode = "SaleOrder/InputCustomerTaxNumber";//维护税号
const getDeliveryInfo = "SaleOrder/GetDeliveryInformation/";//送达方信息获取
const getDeliveryList = "SaleOrder/GetDeliveryByCustomer";//送达方列表信息获取
const getPaymentList = "SaleOrder/GetPaymentConditions";//付款条件信息获取
const addDeliveryInfo = "SaleOrder/AddDeliveryInformation";//保存送达方信息
const delDeliveryInfo = "SaleOrder/DeleteDeliveryMaterial";//删除送达方及物料
const updateDeliveryInfo = "SaleOrder/UpdateDeliveryInformation";//更新送达方信息
const getIntermeCustomer = "SaleOrder/GetCustomer/";//查询居间服务方
const checkMaterialAmount = "SaleOrder/CheckSalesOrderTotalAmount";//验证物料金额
const getRebateAmountInfo = "SystemConfig/SalesOrderYWFWDM";//是否判断最大返款率
const getUnclearMaterial = "SaleOrder/SeachUnclearMaterial";//获取未清物料
const getUnClearItem = "SaleOrder/SeachUnClearItem";//查询借用未清项
const getSalesUnClearMaterial = "SaleOrder/GetUnclearMaterialItems";//获取订单中未清项物料接口
const saveSalesUnClearMaterial = "SaleOrder/SaveUnclearMaterialItems";//保存订单中未清项物料接口
const getWFApproveUserJSON = "SaleOrder/GetWFApproveUserJSON/";//切换商务审批平台，获取审批信息
const saveSaleOrderData = "SaleOrder/SaveSalesOrder";//保存销售订单
const submitSaleOrder = "SaleOrder/SubmitSaleOrder";//提交销售订单
//附件下载IP
const downloadIp = "http://10.0.1.26:88/";

//无合同物料模板下载
export class NoContractDownLoadFile {
  DowloadType:string="NoContract";
  MaterialList:any[]=[new DownLoadFileMaterialInfo()];
}

//有合同物料模板下载
export class ContractDownLoadFile {
  DowloadType:string="Contract";
  MaterialList:any[]=[new DownLoadFileMaterialInfo()];
}

export class DownLoadFileMaterialInfo {
  MaterialCode:string="";//物料编号
  MaterialName:string="";//物料名称
  Quantity:string="";//数量
  Price:string="";//价格
  RebateAmount:string="";//返款金额
  StorageLocation:string="";//库存地
  Factory:string="";//工厂
  Batch:string="";//批次
  ConsignmentModeID:string="";//发货方式
  Remark:string="";//备注
  SalesUnit:string="";//销售单位
}


@Injectable()
//合同物料相关服务
export class OrderCreateService {
  constructor(
    private http: HttpServer,
    private https: Http
  ) { }



  //设置请求头
  headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
  options = new RequestOptions({ headers: this.headers });


  //送达方处下载物料模板接口
  getMaterialList(materialListData) {
    return this.https.post(environment.server + 'SaleOrder/DownloadDeliveryMaterialInfo',materialListData,{ responseType: 3 }).map(res => res.blob());
    //return downloadAmountFilesUrl;
  }


  /**
   * 获取新建销售订单基础数据
   */
  getCreateSalesOrder(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(createSalesOrder, params, this.options);
  }

  /**
   * 新建无合同销售订单
   */
  getCreateNoCSalesOrder(params?: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(createNoCSalesOrder, {}, this.options);
  }

  /**
   * 获取销售订单完整数据
   */
  getSOFullData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getSOFullData, params, this.options);
  }

  /**
   * 获取基础下拉列表数据
   */
  getSOBaseData(params?: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getSOBaseData, params, this.options);
  }

  /**
   * 判断是否需要验证最大返款率
   */
  getRebateAmountInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getRebateAmountInfo, params, this.options);
  }

  /**
   * 查询预收款列表数据
   */
  getAdvancesData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getAdvancesData, params, this.options);
  }

  /**
   * 删除预收款列表数据
   */
  delAdvancesData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(delAdvancesData, params, this.options);
  }
  /**
   * 切换删除预收款列表数据
   */
  deletePrepanyment(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(deletePrepanyment, params, this.options);
  }

  /**
   * 查询居间服务方列表数据
   */
  getIntermeCustomer(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getIntermeCustomer + params, {}, this.options);
  }

  /**
   * 保存选择预收款数据
   */
  saveAdvancesData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(saveAdvancesData, params, this.options);
  }

  /**
   * 查询客户应收、超期欠款金额
   */
  getCustomerUnClerData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getCustomerUnClerData, params, this.options);
  }

  /**
   * 查看客户应收款明细
   */
  getCustomerUnClearDetail(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getCustomerUnClearDetail, params, this.options);
  }

  /**
   * 查看客户ERP信息
   */
  getERPCustomerInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getERPCustomerInfo, params, this.options);
  }

  /**
   * 维护税号信息
   */
  modifyCustomerTaxCode(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(modifyCustomerTaxCode, params, this.options);
  }

  /**
   * 付款条件信息
   */
  getPaymentList(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getPaymentList, params, this.options);
  }

  /**
   * 获取关联发票列表数据
   */
  getGetInvoiceData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getGetInvoiceInfo, params, this.options);
  }

  /**
   * 新建-物料信息列表获取
   */
  getMaterialData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getMaterialInfo, params, this.options);
  }

  /**
   * 送达方信息获取
   */
  getDeliveryInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getDeliveryInfo + params, {}, this.options);
  }

  /**
   * 送达方列表信息获取
   */
  getDeliveryList(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getDeliveryList, params, this.options);
  }

  /**
   * 保存送达方信息
   */
  addDeliveryInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(addDeliveryInfo, params, this.options);
  }
  /**
   * 更新送达方信息
   */
  updateDeliveryInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(updateDeliveryInfo, params, this.options);
  }
  /**
   * 删除送达方信息
   */
  delDeliveryInfo(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(delDeliveryInfo, params, this.options);
  }

  /**
   * 获取省市信息
   */
  getProvinceCityInfo(): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getProvinceCityInfo, {}, this.options);
  }

  /**
   * 验证物料金额
   */
  checkMaterialAmount(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(checkMaterialAmount, params, this.options);
  }
  /**
   * 获取未清项物料
   */
  getUnclearMaterial(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getUnclearMaterial, params, this.options);
  }

  /**
   * 查看借用未清项
   */
  getUnClearItem(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getUnClearItem, params, this.options);
  }

  /**
   * 获取未清项物料
   */
  getSalesUnClearMaterial(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getSalesUnClearMaterial, params, this.options);
  }

  /**
   * 保存未清项物料
   */
  saveSalesUnClearMaterial(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(saveSalesUnClearMaterial, params, this.options);
  }

  /**
   * 获取审批信息
   */
  getWFApproveUserJSON(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(getWFApproveUserJSON + params, {}, this.options);
  }

  /**
   * 上传附件
   */
  uploadFilesApi() {
    return downloadIp + uploadFilesUrl;
  }

  /**
   * 下载附件
   */
  upFilesDownload(params: any) {
    return downloadIp + params;
  }

  /**
   * 上传附件,物料金额
   */
  uploadAmountFilesApi() {
    return uploadAmountFilesUrl;
  }

  //下载附件
  downloadAmountFilesApi() {
    return this.https.get(environment.server + 'SaleOrder/DownloadExcelFile/Contract', { responseType: 3 }).map(res => res.blob());
    //return downloadAmountFilesUrl;
  }

  /**
  * 新建订单信息保存
  */
  saveSaleOrderData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(saveSaleOrderData, params, this.options);
  }

  /**
  * 新建订单提交
  */
  submitSaleOrder(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(submitSaleOrder, params, this.options);
  }

  /**
   * 验证是否需要风险管理岗审批
   */
  isRiskApproval(saleId) {
    return this.https.post(environment.server + 'SaleOrder/RequireRiskApprove', saleId).toPromise()
      .then(response => response.json());
  }

  /**
   * 验证是否需要风险管理岗审批
   * @param CustomerERPCode 
   * 售达方code
   * @param YWFWDM 
   * 业务范围代码
   */
  isRiskApprovalNoContract (CustomerERPCode,YWFWDM) {
    return this.https.post(environment.server + 'SaleOrder/RequireRiskApproveNoContract', {'CustomerERPCode':CustomerERPCode,'YWFWDM':YWFWDM}).toPromise()
    .then(response => response.json());
  }

  //获取申请人的基本信息
  getPersonInformation() {
    return this.https
      .get(environment.server + "base/GetCurrentUserInfo")
      .toPromise()
      .then(response => response.json());
  }

  //获取销售小组
  getSalesGroup(){
    return this.https.post(environment.server+'SaleOrder/GetSaleOrderSaleTeam',null).toPromise().then(Response=>Response.json());
  }

  //获取项目信息自定义内容
  getGetBussinessFieldConfig(customConfigReq){
    return this.https.post(environment.server+"BaseData/GetBussinessFieldConfig",customConfigReq).toPromise().then(Response=>Response.json());
  }

  //获取是否提示”委托发货原件为商务“
  getIsShowAlert(ContractCode) {
    return this.https.post(environment.server+'SaleOrder/WeiTuoFaHuoYuanJian', {ContractCode:ContractCode}).toPromise().then(Response=>Response.json());
  }

  //删除批量上传的送达方及物料
  deleteBatchUploadSDF(SaleOrderID,SDFID) {
    return this.https.post(environment.server + 'SaleOrder/DeleteBatchUploadSDFMaterialInfo',{'SaleOrderID':SaleOrderID,'SDFID':SDFID}).toPromise().then(Response =>Response.json());
  }

  //清空批量上传的送达方下的物料明细
  clearBatchUploadMaterialInfo(SaleOrderID,SDFID) {
    return this.https.post(environment.server + 'SaleOrder/DeleteBatchUploadMaterialInfo',{'SaleOrderID':SaleOrderID,'SDFID':SDFID}).toPromise().then(Response =>Response.json());
  }

}

//项目信息请求字段
export class CustomConfigReq{
  BusinessID:string = "cacaad8c684c42a79d110a68d0271568";
  BusinessType:string = "SalesContract";
}

export class CurrentUserInfo {
  UserNo: any = "";
  ITCode: any = "";
  UserName: any = "";
  Gender: any = "";
  FlatName: any = "";
  FlatCode: any = "";
  CompanyCode: any = "";
  CompanyName: any = "";
  DeptNO: any = "";
  DeptName: any = "";
  CostCenter: any = "";
  CostCenterName: any = "";
  YWFWDM: any = "";//业务范围
  CommitLevel: any = "";
  UserType: any = "";
}
export class SaleOrderForm {
  SalesOrderData: SaleOrderInfo = new SaleOrderInfo();
  DeliveryData: DeliveryMaterialInfo[] = [];
  ReceiptData: ReceiptInfo[] = [];//发票信息
  AccessoryList: AccoriesInfo[] = [];
  UnSalesAmount: any = "";//未开销售金额
  Type: any = "";//订单类型
}
//销售订单主体信息
export class SaleOrderInfo {
  SalesOrderID: any = "";//销售单编号
  OrderTypeId: any = "";//订单类型ID
  ContractCode: any = "";//合同编号
  SalesITCode: any = "";//销售员ITCODE
  SalesName: any = "";//销售员姓名
  AgentITCode: any = "";//收款人员工编号
  AgentName: any = "";//收款人姓名
  POCode: any = "";//PO号
  CurrencyID: any = "";//货币币种
  DepartmentProductGroupID: any = "";//部门产品组
  PaymentMode: any = "";//合同付款方式
  Receivable: any = "";//应收账款
  Overdue: any = "";//超期欠款
  DeliveryAddressType: any = "";//送达方类型（1：单送达方，2：多送达方）
  CustomerName: any = "";//售达方名称
  CustomerERPCode: any = "";//售达方编号
  CustomerPost: any = "";//售达方邮编
  CustomerCity: any = "";//售达方城市
  CustomerAddress: any = "";//售达方地址电话
  CustomerBank: any = "";//售达方开户银行
  CustomerBankAccount: any = "";//售达方开户银行账号
  CustomerTaxNumber: any = "";//售达方税号
  // InputTaxNumberMsg: any = "";//写入税号失败信息W
  AccountPeriod: any = "";//系统账期
  ChannelOfDistributionID: any = "";//分销渠道ID
  PaymentTermsCode: any = "";//付款条件代码
  PaymentTerms: any = "";//付款条件
  IsContractPayment: any = "";//付款条件来源。0首选，1带出
  RebatePercentageID: any = "";//
  InvoiceTypeID: any = "";//订单发票类型ID
  RebateAmount: any = "";//是否有无返款
  DeliveryNote: any = "";//交货备注
  InvoiceNote: any = "";//发票备注
  ManufacturerProNo: any = "";//厂商项目编号
  EndUserName: any = "";//最终用户全称
  CustomerRegion: any = "";//最终用户区域
  BusiApprovePlatform: any = "";//商务审批平台
  IndustryID: any = "";//DC行业大类
  ProjectIndustryID: any = "";//部门行业
  InvoiceCompanyName: any = "";//发票公司名称
  InvoiceRecipient: any = "";//发票收件人
  InvoiceAreaID: any = "";//发票收件人地区（省份）
  InvoiceCity: any = "";//发票收件人城市
  InvoiceDistrict: any = "";//发票收件人区县
  InvoiceAddress: any = "";//发票收件人地址
  InvoicePostCode: any = "";//发票收件人邮编
  InvoicePhone: any = "";//发票收件人电话
  SalesAmountTotal: any = "";//销售总金额
  RebateAmountTotal: any = "";//返款总金额
  ContractMoney: any = "";//合同金额
  Remark: any = "";//订单备注
  IntermediateCustomerERPCode: any = "";//居间服务方ERP客户编号（00M5，00M6，云服务事业部专用）
  IntermediateCustomerName: any = "";//居间服务方名称（00M5，00M6，云服务事业部专用）
  CooperationMode: any = "";//合作模式（合同主体00M5，00M6）
  IsSuperDiscount: any = "";//是否为特折单，0-否 1-是
  CustomerEmail: any = "";//客户EMail地址
  WFApproveUserJSON: any = "";//流程审批人信息JSON
  ContractSubjectCode: any = "";//合同主体编号
  ContractSubject: any = "";//合同主体名称
  Status: any = "";//订单状态
  CreaterITCode: any = "";//创建人ITCODE
  CreatedTime: any = "";//创建时间
  CreateName: any = "";//创建人姓名
  EditITCode: any = "";//编辑人ITCODE
  EditTime: any = "";//编辑时间
  EditName: any = "";//编辑人姓名
  BusinessItCode: any = "";//商务审批人ITCode
  IsChoosePrePayment: any = "";//是否选择预收款
  IsVerifyMaterial: any = "";//是否验证物料
  TermsofShipment: any = "";//装运条件（合同主体是0080）
  DeliveredTermACode: any = "";//国际贸易条款编号（合同主体是0080）
  DepartmentContCode: any = "";//事业部内部合同号（合同主体是0080）
  UnloadingPointCode: any = "";//卸货点（合同主体是0080）
  LoadingPointCode: any = "";//装货点（合同主体是0080）
  DeliveredTermInfo: any = "";//国际贸易条款内容（合同主体是0080）
  CounterFeePercentage: any = "";//手续费百分比（云服务事业部阿里云客户定制字段）
  ERPOrderCode: any = "";//写入ERP的订单号
  IsMailingInvoice: any = "";//是否邮寄发票
  IsRelateCheque: any = "";//票据类型（1支票   2商票）
  IsRelateBusiTicket: any = "";//
  IsMaintTaxN: any = "";//税号是否维护成功
  BizConcernInfo: any = "";//商务审批信息
  YWFWDM: any = "";//业务范围
  SalesOrganizationID: any = "";//销售组织
  isCompleteOrder: any = '0';//是否整单发货
  SaleContractStatus:string;//销售合同状态（0-正常、1-合同已变更、2-合同已解除）
  IsContainCSP:string='0';//是否包含CSP（0：否，1：是）
  SalesGroup:string='';//销售小组
  SC_Code:string;//销售合同编号
  AccountPeriodType:string;//账期类型（0001：一次性账期）
  AccountPeriod_SaleContract:string;// 从合同中获取的原始系统账期
}
//送达方与物料信息
export class DeliveryMaterialInfo {
  Deliverinfo: Deliverinfo = new Deliverinfo();
  MaterialList: MaterialInfo[] = [];
  isCheckReMoy?: any = "";
}
//送达方信息
export class Deliverinfo {
  SDFID: any = "";//送达方ID
  SDFName: any = "";//送达方名称
  SDFAddress: any = "";//送达方地址
  SDFCode: any = "";
  AreaID: any = "";
  SDFCity: any = "";
  SDFDistrict: any = "";
  IsDelegate: any = "";//送达方是否修改
  // isEditComplete: any = false;//送达方编辑完整
}
//物料信息
export class MaterialInfo {
  MaterialCode: any = "";//商品编码
  MaterialName: any = "";//商品名称
  ContractMaterialID: any = "";//合同物料号
  Quantity: any = "";//数量
  Price: any = "";//销售金额
  UnitPrice:any=""//华为物料销售价格
  RebateAmount: any = "";//返款金额
  TotalPrice: any = "";//销售的总金额
  StorageLocation: any = "";//库存地
  Factory: any = "";//工厂
  Batch: any = "";//批次
  Remark: any = "";//备注
  SalesUnit: any = "";//销售
  ConsignmentModeID: any = "";//发货方式
  checked: any = "";//
  ifDisable: any = "";
  AvailableQuantity: any = "";//可用数量
  isEdit: boolean = false;//是否时新添加物料
  partEdit: boolean = false;//是否时新添加物料
  isError: boolean = false;//物料数量是否小于零
}
//还借用物料信息
export class UnclearMaterialInfo {
  SaleOrderID: any = "";//订单ID
  ReservationNo: any = "";//预留号
  UnClearId: any = "";//未清项ID
  UnclearMaterialId: any = "";//未清项物料ID
  MaterialNo: any = "";//物料编号
  MaterialName: any = "";//物料名称
  Factory: any = "";//工厂
  Batch: any = "";//批次
  OnwayStore: any = "";//借用在途库
  Count: any = "";//借用数量
  ReturnCount: any = "";//本订单还借用数量
  dbomsCp: any = "";//已还借用数量
  Unit: any = "";//单位
  Price: any = "";//移动平均价
  checked: any = "";//
}
//还借用物料信息
export class UnclearItemInfo {
  UnClearId: any = "";//未清项ID
  ApplyItCode: any = "";//申请人员Itcode
  ApplyUserName: any = "";//申请人员名字
  ReservationNo: any = "";//借用预留号
  BorrowDate: any = "";//借用时间
  GiveBackDay: any = "";//预计归还时间
  Factory: any = "";//工厂
  checked: any = "";//
}
//支票信息
export class InvoiceInfo {
  InvoiceID: any = "";//支票ID
  apply_user_name: any = "";//申请人
  invoice_status_name: any = "";//支票状态
  ticket_num: any = "";//支票号
  checkout_date: any = "";//出票日期
  ticket_amount: any = "";//支票金额
  amount: any = "";//本次使用金额
  Ticket_AvailableAmount: any = "";//可使用金额
  tick_amount_used: any = "";//支票已使用金额
  payee: any = "";//收款人
  custom_name: any = "";//客户名称
  ReceiptType: any = "";//支票类型
  checked: any = "";
}
//发票信息
export class ReceiptInfo {
  SaleOrderID: any = "";//销售单 ID
  ReceiptType: any = "";//票据类型
  Status: any = "";//状态
  ReceiptNo: any = "";//
  CreateDate: any = "";//关联时间
  Amount: any = "";//支票金额
  PayeeNo: any = "";//
}
//附件信息
export class AccoriesInfo {
  AccessoryID: any = "";//附件ID
  AccessoryName: any = "";//附件名称
  AccessoryURL: any = "";//附件地址
  AccessoryType: any = "";//附件类型
  CreatedTime: any = "";//附件创建时间
  CreatedByITcode: any = "";//创建人itcode
  CreatedByName: any = "";//创建人姓名
  InfoStatus: any = "";//附件状态
}
//分销渠道
export class ChannelType {
  ChannelOfDistributionID: any = "";//分销渠道编号
  Name: any = "";//分销渠道名称
  FullInfo: any = "";//完整信息
  Remark: any = "";//备注
  Enable: any = "";//
}
//币种
export class CurrencyType {
  CurrencyCode: any = "";//币种编号
  CurrencyID: any = "";//币种ID
  CurrencyName: any = "";//币种名称
}
//发票类型
export class InvoiceType {
  InvoiceTypeID: any = "";//发票类型id
  Name: any = "";//发票类型名称
  Remark: any = "";//
  Enable: any = "";//
}
//订单类型
export class OrderType {
  ERPOrderTypeCode: any = "";//
  OrderTypeId: any = "";//订单类型ID
  OrderName: any = "";//订单类型名称
  Remark: any = "";//
  Normal: any = "";//
  Enable: any = "";//
}
//平台
export class Platform {
  PlatformNo: any = "";//
  platform: any = "";//平台名称
  platformId: any = "";//
  platformcode: any = "";//平台编号
  usable: any = "";//
}
//部门产品组
export class DepProGroupInfo {
  DepartmentProductGroupID: any = "";
  Name: any = "";
}
//发货方式
export class DeliveryType {
  ConsignmentModeID: any = "";//
  Enable: any = "";//
  Name: any = "";//
  Remark: any = "";//
}
//DC部门行业大类
export class DCIndustryInfo {
  BusinessTypeID: any = "";
  CreatedByITcode: any = "";
  CreatedByName: any = "";
  CreatedTime: any = "";
  EndDate: any = "";
  IfNode: any = "";
  IndustryID: any = "";//
  IndustryName: any = "";//
  ModifiedByITCODE: any = "";
  ModifiedByName: any = "";
  ModifiedTime: any = "";
  ParentIndustryID: any = "";
  StartDate: any = "";
}
//部门行业
export class IndustryInfo {
  CreatedByITcode: any = "";
  CreatedByName: any = "";
  CreatedTime: any = "";
  EndDate: any = "";
  IndustryName: any = "";//名称
  ModifiedByITCODE: any = "";
  ModifiedByName: any = "";
  ModifiedTime: any = "";
  ParentIndustryID: any = "";
  ProjectIndustryID: any = "";//ID
  StartDate: any = "";
  checked: any = "";
}
//装货点
export class LoadingInfo {
  LoadingPointName: any = "";//名称
  LoadingPointCode: any = "";//编码
}
//卸货点
export class UnadingInfo {
  UnloadingPointName: any = "";//名称
  UnloadingPointCode: any = "";//编码
}
//国际货易条款
export class TermInfo {
  DeliveredTermACode: any = "";//
  DeliveredTermAName: any = "";//
}
//返款
export class Rebatetype {
  RebatePercentageID: any = "";//返款比例ID
  Name: any = "";//返款比例名称
  RebatePercentageValue: any = "";//
  Enable: any = "";//
}
//预收款查询
export class QueryAdvances {
  SalesOrderID: any = "";//销售单ID
  StartDate: any = "";//开始时间
  EndDate: any = "";//截止时间
  isACustomer: any = "";//是否是一次性收款账户0-不是 1-是
  CustomerERPCode: any = "";//客户ERP编号
  CompanyCode: any = "";//公司代码
  // CurrentItCode: any = "";//当前登录人ITCode
  CurrentPage: any = "";//
  PageSize: any = "";//
  SDFID: any = "";
}
//预收款信息
export class AdvancesInfo {
  SHEET_NO: any = "";//凭证编号
  GSDM: any = "";//公司代码
  TICKET_DATE: any = "";//凭证日期
  YWFWDM: any = "";//业务范围
  AMOUNT: any = "";//金额
  END_DATE: any = "";//预计到期日
  TICKET_ID: any = "";//发票号
  ERP_ID1: any = "";//ERP订单号
  ERP_ID2: any = "";//ERP订单号
  ERP_ID3: any = "";//ERP订单号
  KHMC: any = "";//客户名称
  KHDM: any = "";//客户代码
  CITY_NAME: any = "";//城市名称
  ZUONR: any = "";//分配
  SGTXT: any = "";//项目文本
  BKTXT: any = "";//项目号
  PPC: any = "";//伙伴PC
  BUZEI: any = "";//凭证行项目号
  SUBJECT_LEDGER: any = "";//科目号
  BLART: any = "";//凭证类型
  UMSKZ: any = "";//特别总帐标识
  PSDIF: any = "";//剩余项目
  ZFBDT: any = "";//到期日，计算基准日期
  XREF3: any = "";//行项目参考码
  RL_STATUS: any = "";//是否可以认领，0-可以认领，1-不可以认领
  SalesOrderID: any = "";//DBOMS销售单号
  IsShowDelete: any = "";//是否展示删除链接
  checked: any = "";//是否选中
  SalesOrderNum: any = "";//BOMS单号
}
//应收账款明细
export class CollectionInfo {
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
}
//编辑送达方，列表信息
export class DeliveryInfo {
  KTOKD: any = "";//客户类型
  KUNNR: any = "";//客户ERP编号
  NAME: any = "";//客户名称
  ORT01: any = "";//地址
  checked: any = "";//
}
//售送达方信息
export class PartyInfo {
  SalesOrderId: any = "";//销售订单ID
  ID: any;//
  SDFID: any;
  SDFCode: any = "";//送达方编码
  SDFName: any = "";//送达方名称
  SDFLinkMan: any = "";//联系人
  TelNumber: any = "";//联系人手机
  PhoneNumber: any = "";//固定联系电话
  SDFDistrict: any = "";//送达方区
  SDFCity: any = "";//送达方城市
  SDFPostCode: any = "";//送达方邮编
  SDFAddress: any = "";//送货地址
  AreaID: any = "";//送达方省编码
  SignatureMethod: any = "";//签收方式
  EditTime: any = "";//
  EditorITCode: any = "";//
  EditorName: any = "";//
  ConsignmentModeID: any = "";//发货方式
  IsDelegate: any = "";//送达方是否修改
  MaterialAmountMoney: number;
  // isEditComplete: any = false;//送达方编辑完整
}
//合同付款条件，名称
export class PaymentInfo {
  PaymentCode: any = "";//付款条件代码
  PaymentText: any = "";//付款名称
  checked: any = "";//
}
//下拉列表数据
export class DropInfoList {
  ListChannel: ChannelType[] = [];//分销渠道
  ListCurrency: CurrencyType[] = [];//币种
  ListInvoice: InvoiceType[] = [];//发票类型
  ListOrderType: OrderType[] = [];//订单类型
  ListPlatform: Platform[] = [];//平台
  ListRebate: Rebatetype[] = [];//返款
  ListDepPro: DepProGroupInfo[] = [];//部门产品组
  ListCM: DeliveryType[] = [];//发货方式
  ListIndustry: DCIndustryInfo[] = [];//DC部门大类
  ListProIndustry: IndustryInfo[] = [];//部门行业
  ListTerm: TermInfo[] = [];//国际货易条款
  ListUnading: UnadingInfo[] = [];//卸货
  ListLoading: LoadingInfo[] = [];//装货
}
export class ProvinceCityInfo {
  province: Province[] = [];
  city: City[] = [];
  district: City[] = [];
}
export class Province {
  ProvinceCode: any = "";//省份code
  ProvinceName: any = "";//省份名称
}
export class City {
  CityCode: any = "";//城市code
  CountyName: any = "";//城市名称
}

export class DeletePrepanymentListData {
  AMOUNT: string;
  SHEET_NO: string;
  BUZEI: string;
  SalesOrderID: string;
  SDFID: string;
}
