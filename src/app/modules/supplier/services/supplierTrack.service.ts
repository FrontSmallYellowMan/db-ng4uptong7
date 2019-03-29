import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { environment } from '../../../../environments/environment';

//供应商跟踪基础数据
export class SupplierTrackData{
  TrackId:string;//主键ID
  BBMC:string;//本部名称
  SYBMC:string;//事业部名称
  VendorState:number;//1:有效,2:超期,3:无效
  Vendor:string;//供应商名称
  VendorNo:string;//供应商编号
  SettledTime:string;//入驻时间
  VendorType:number=null;//供应商类型1:集团外国内,2海外
  CompanyCode:string;//公司名称和代码
  Brand:string;//品牌
  ProductSummarize:string;//产品概述
  LastYearPurchaseScale:string;//去年采购规模
  ValidityOfAgreement:string;//协议有效期
  AutoRenewal:number=2;//自动续签,1:是,2:否
  PayType:number=null;//付款类型,1:应付,2:预付
  PaymentTermBeginning:number=null;//账期起始点,1:发票,2:收货,3:收货收发票,4:下单,5:背靠背付款,6:其他
  PTBText:string;//账期起始点为其他时文本
  PaymentTerm:number=null;//账期,1:0,2:15,3:30,4:45,5:60,6:90,7:银承,8:LC,9:其他 
  PTText:string;//账期为其他时文本内容
  FiscalYear:number=null;//财年,1:1月,...
  Opponent:string;//竞争对手
  AnnualTaskRequirment:string;//年度任务要求
  HowToOrder:number=null;//下单方式:1-厂商系统下单,2-双方盖章,3-双方签字,4-我司单章,5-PO下单,6-邮件下单
  IsRebates:number=null;//是否有回佣:1-有,2-否
  RebatesType:number=null;//回佣方式:1-抵货款,2:现金返还,3-开销售
  IsReturnGoodsClause:number=null;//退换货条款,1-是,2-否
  AskPriceInterfacePerson:string;//询价接口人
  SignAuthorityContractOrder:string;//签字权限(合同单)
  SignAuthorityPreviousOrder:string;//签字权限(预下单)
  SignAuthorityPendingStock:string;//签字权限(备货)
  ApplyITCode:string;//申请人ITCode
  ApplyName:string;//申请人姓名
  TelephoneNumber:string;//电话
  CreateTime:string;//创建时间
  UpdateTime:string;//更新时间
}

export class Query{
  BBMC:string;//本部名称
  SYBMC:string;//事业部名称
  VendorState:number=2;//1:有效,2:超期,3:无效
  Vendor:string;//供应商名称
  CompanyCode:string;//代码
  PayType:number=null;//付款类型,1:应付,2:预付
  ValidityOfAgreement:string;//协议有效期
  BeginDate:string;//开始时间
  EndDate:string;//结束时间
  AutoRenewal:number=null;//自动续签,1:是,2:否
  pageNo:number=1;//页码
  pageSize:number=10;//每页显示多少条
}

@Injectable()
export class SupplierTrackService {

  constructor(private http: Http) { }

  //获取申请人的联系方式
  getPersonPhone(){
    return this.http.get(environment.server+"InitData/GetCurrentUserPhone").toPromise().then(response => response.json());     
  }

  //保存供应商跟踪信息
  saveSupplierTrack(supplierDate:SupplierTrackData){
    return this.http.post(environment.server+"vendortrack/add",supplierDate).toPromise().then(response=>response.json());
  }

  //获取供应商跟踪详情
  getDetail(trackId:string){
    return this.http.post(environment.server+"vendortrack/detail",{"TrackId":trackId}).toPromise().then(respones=>respones.json());
  }

  //获取供应商跟踪列表
  getSupplierTrackList(query:Query){
    return this.http.post(environment.server+"vendortrack/list",query).toPromise().then(respones=>respones.json());
  }

  //验证所选供应商是否已存在跟踪信息
  isSupplierTrack(VendorNo){
    return this.http.post(environment.server+"vendortrack/GetVendorTrackState",VendorNo).toPromise().then(Response=>Response.json());                                         
  }

}