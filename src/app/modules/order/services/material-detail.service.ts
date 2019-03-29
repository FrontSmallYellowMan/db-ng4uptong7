import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, ResponseContentType, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

/**
 * 接口地址
 */
const orderMaterial = "SaleOrder/ContractMaterialDetail/";//合同物料明细表单初始数据
const uploadFilesUrl = "api/SaleOrder/UploadMaterialFileNoContract";//上传附件
const downloadFilesUrl = "api/SaleOrder/DownloadExcelFile/NoContract";//下载附件
const downloadMaterialFilesUrl = "api/SaleOrder/DownloadContractMaterialExcelFile";//下载附件
const SaveContractUrl = "SaleOrder/SaveContractMaterialInfo";//保存合同物料信息
const MaterialChangeUrl = "materialchange/sponsor";//物料变更
const MaterialDeleteUrl = "SaleOrder/DeleteContractMaterialInfo";//物料删除
const MaterialChangeHisUrl = "materialchange/historysaleorder";//物料变更历史记录
//附件下载IP
const downloadIp = "http://10.0.1.26:88/";

@Injectable()
export class MaterialDetailService {
  constructor(private http: HttpServer,
  private https:Http) { }

  //设置请求头
  headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
  options = new RequestOptions({ headers: this.headers });
  /**
   * 获取我的申请列表数据
   */
  getOrderMaterialData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.get(orderMaterial + params, this.options);
  }

  /**
   * 上传附件
   */
  uploadFilesApi() {
    return uploadFilesUrl;
  }

  /**
   * 下载附件
   */
  filesDownload(contractcode?) {
    if(contractcode)
      return downloadIp + downloadMaterialFilesUrl + "/" + contractcode;
    else
      return downloadIp + downloadFilesUrl;
  }

  //导出无合同物料列表
  exportNoContractMaterialList(){
    return this.https.get(environment.server+'SaleOrder/DownloadExcelFile/NoContract',{responseType: 3}).map(res=>res.blob());
  }


  //导出物料模板
  exportMaterileTemplate(MainContractCode){
    return this.https.get(environment.server+'SaleOrder/DownloadContractMaterialExcelFile/'+MainContractCode,{responseType: 3}).map(res=>res.blob());
  }

  /** 
   * 保存合同物料信息
   */
  SaveContracData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(SaveContractUrl, params, this.options);
  }
  /**
   * 物料删除
   */
  MaterialDeleteData(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(MaterialDeleteUrl, params, this.options);
  }
  /**
   * 物料变更
   */
  MaterialInfoChange(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(MaterialChangeUrl, params, this.options);
  }
  /**
   * 物料变更历史记录
   */
  MaterialInfoHisChange(params: any): Observable<any> {
    this.headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    this.options = new RequestOptions({ headers: this.headers });
    return this.http.post(MaterialChangeHisUrl, params, this.options);
  }


/**
 * 获取预收款列表
 */
getPrePaymentList(queryPrePaymentList:QueryPrePaymentList){
  return this.https.post(environment.server+'SaleOrder/GetPrepaymentByDelivery',queryPrePaymentList).toPromise().then(res=>res.json());
}

 //根据物料号获取物料描述
 getMaterialContent(materialNumber){
  return this.https
  .get(environment.server + "PurchaseManage/GetMaterialInfo/" + materialNumber)
  .toPromise()
  .then(response => response.json());
}

//清空合同物料
 resetContractMaterial(contractCode){
   return this.https.post(environment.server+'SaleOrder/DeleteContractALLMaterialInfos',{"ContractCode":contractCode}).toPromise().then(Response=>Response.json());
 }


}
export class MaterialForm {
  SaleContractInfo: SaleContractInfo = new SaleContractInfo();
  MaterialList: MaterialInfo[] = [];
}
export class SaleContractInfo {
  SalesName: any = "";//销售员名称
  SalesItcode: any = "";//销售员itcode
  ProductPostName: any = "";//产品岗
  ProductPostITCode: any = "";//产品岗
  MainContractCode: any = "";//合同编号
  ProjectName: any = "";//项目名称
  ContractMoney: any = "";//合同金额
  BuyerName: any = "";//客户名称
  FinalUserName: any = "";//最终用户名称
  Currency: any = "";//币种
}
export class MaterialInfo {
  MaterialNumber: any = "";//物料编码
  MaterialDescription: any = "";//物料名称
  Count: any = "";//采购数量
  Price: any = "";//单价\
  MaxAvailableCount: any = "";//最大可用数量
  AvailableCount: any = "";//可用数量
  FactoryCode: any = "";//工厂
  Batch: any = "";//批次
  Remark: any = "";//备注
  SalesUnit: any = "";//销售单位
  StorageLocation: any = "";//库存地
  Status: any = "";//是否备货，0：采购；1：备货，2：物料变更
  PurchaseID: any = "";
  originalAvailableCount: any = "";//原始可用数量，调取数据后初始可用数量
  checked: any = "";//是否选择
  isEdit: any = "";//是否可编辑
  partEdit: any = "";//是否部分可编辑
  newAddMaterialID: any = "";//新加物料删除识别ID
  // Sort: any = 1;
}

export class MaterialChangeInfo {
  Id: any = 0;
  ChangeId: any = 0;
  ExportMaterialNo: any = "";//转出物料编号
  ExportMaterial: any = "";//转出物料名称
  ExportSC_Code: any = "";//转出销售合同号
  ExportSalesUnit: any = "";//转出销售单位
  ExportCount: any = "";// 转出数量
  ExportStorageLocation: any = "";//转出库存地
  ExportFactory: any = "";//转出工厂
  ExportBatch: any = "";//转出批次
  InStorageThirtyDays: any = 1;//是否入库30天
  ApplicationState: any = 0;
  ExportUnitPrice: any = 0.0;
  ExportAmount: any = 0.0;
  ApplyTime: any = "";
  ApplyName: any = "";
  ApplyItCode: any = "";
}
export class MaterialInfoHisChange {
  ChangeNo: any = "";//申请编号
  ApplyName: any = "";//申请人
  ApplyTime: any = "";//申请时间
  ApplicationState: any = "";//申请状态
  ApplicationStateName: any = "";//申请状态
  LinkUrl: any = "";//查看的链接
  Id: any;
}

//获取预收款列表请求参数
export class QueryPrePaymentList{
  SalesOrderID:string;//销售订单号
  SDFID:string;//送达方ID
}
