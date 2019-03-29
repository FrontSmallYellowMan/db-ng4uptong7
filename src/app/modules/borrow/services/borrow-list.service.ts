import { Injectable } from '@angular/core';
import { environment_java,APIAddress } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions, Headers, RequestOptionsArgs } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
//附件下载IP
const downloadIp =APIAddress;
export class Query {
  public flowStatus: string;//原业务范围
  public pageSize: number;
  public pageNo: number;
}

export class BorrowApply {//借用申请单	
  public applyDate: string;
  public platformCode: string;//平台编码
  public flowStatus: number;//流程状态
  public baseDeptName: string;//本部
  public instId: string;
  public applyUserTel: string; //申请人电话
  public borrowDate: string; //借用日期
  public giveBackDay: string; //预计归还日期
  public projectName: string; //项目名称
  public applyUserName: string; //申请人姓名
  public org: string;
  public currApprAuthors: string;
  public applyItCode: string; //申请人ItCode
  public contractBorrow: number;//是否合同借用发起 0：否；1：是
  public subTotalAmount: number;//借用金额
  public borrowTotalAmount: number;//借用总金额
  public borrowDayCount: number;//借用天数
  public applyId: string;//申请单实体ID
  public apprReadors: string;
  public factory: string;//工厂
  public currApprUserIds: string;
  public createDate: string;
  public costcenterName: string; //成本中心名称
  public flowCurrNodeName: string;
  public creditLine: number;//信用额度
  public lastModifiedDate: string;
  public deliveryType: string; //交货方式COde
  public deliveryTypeName: string;//交货方式名称
  public borrowMemo: string; //借用说明
  public subApplyNo: string = ""; //子申请单号
  public costcenterCode: string; //成本中心编码
  public subDeptName: string; //事业部
  public borrowAttributeName: string; //借用属性
  public attachmentList: BorrowAttachment[] = [];
  public createBy: string;
  public businessScope: string; //业务范围
  public borrowAttributeCode: string; //借用属性编码
  public borrowAccord: string; //借用依据
  public approvalIds: string;
  public lastModifiedBy: string;
  public mainApplyNo: string; //主申请单号
  public operatingBorrow: number = 0;//是否经营性借用 0：否；1：是
  public version: string;
  public borrowTypeName: string; //借用类型
  public applyUserNo: string; //申请人编号
  public id: string;
  public borrowTypeCode: string; //借用类型编码
  public currApprAuthorsItcode: string;
  public flowCurrNodeId: string;
  public platformName: string; //平台名称
  public borrowCustomerName: string; //借用客户名称
  public formId: string;
  public creator: string;
  public noApplySubmit:number;
}
export class BorrowAttachment {//借用依据
  public accordId: string;//附件Id
  public applyId: string;//申请单实体ID
  public fileId: string;// 附件真实id
  public fileName: string;//附件名称
  public filePath: string;//附件路径
  public fileSize: number;
}
export class Materiel {//材料实体类
  public batch: string; //批次
  public count: number;//数量
  public createBy: string;
  public createDate: string;
  public factory: string; //工厂
  public id: string;
  public lastModifiedBy: string;
  public lastModifiedDate: string;
  public materielId: string; //物料实体ID
  public meterialMemo: string;//物料描述
  public meterialNo: string; //物料编号
  public onwayStore: string; //借用在途库
  public org: string;
  public price: number = 0;//移动平均价
  public totalAmount: number;//总价
  public transportId: string; //运输实体ID
  public unit: string; //单位

}

export class Transport {//运输实体类
  public applyId: string; //申请单实体ID
  public arrivalDate: string;//期望到货日期
  public borrowAmount: number = 0;//借用金额
  public borrowStoreHouse: string; //借用库
  public createBy: string;
  public createDate: string;
  public deliveryAddress: string; //送货地址
  public deliveryAddressId: string; //送货地址Id
  public id: string;
  public inventory: string; //库存地
  public inventoryName: string;//库存地名
  public lastModifiedBy: string;
  public lastModifiedDate: string;
  public org: string;
  public reservationNo: string; //预留号
  public transportCode: string; //运输方式编码
  public transportId: string; //运输实体ID
  public transportName: string; //运输方式
  public transportNo: string; //运输单号
  public voucherNo1: string; //凭证号1
  public voucherNo2: string; //凭证号2
  public startTransport: string;//运输起点
  public transportUrl:string;//Url
}

export class BorrowApplytransportPoL {
  public transport: Transport = new Transport();
  public materielList: Materiel[] = [];
}

export class BorrowApplyFormData {
  public borrowApply: BorrowApply = new BorrowApply();
  public transportPoList: BorrowApplytransportPoL[] = [];
}

export class BorrowApplyPageParam {
  public baseDeptName: string;
  public borrowDate: string;
  public projectName: string;
  public applyItCode: string;
  public applyUserName: string;
  public borrowTotalAmount: number;
  public applyId: string;
  public currApprUserIds: string;
  public flowCurrNodeName: string;
  public reservationNo: string;
  public borrowAmount: number;
  public subApplyNo: string;
  public subDeptName: string;
  public borrowAttributeName: string;
  public businessScope: string;
  public mainApplyNo: string;
  public applyDate: string;
  public expireddays: number;
  public inventory: string;
  public platformName: string;
  public borrowCustomerName: string;
  public unClearIterStatus: number;
  public currApprAuthors: string;
  public createUserItCode: string;
  public createUserName: string;
  public createDate: string;
  public checked: boolean = false;
  public readonly: boolean = false;
}


@Injectable()
export class BorrowListService {

  constructor(private http: Http) { };

  //获取借用申请单列表
  getBorrowListList(query: Query) {
    //console.error(query);
    let { flowStatus, pageSize, pageNo } = query;
    //flowStatus='0';
    //pageSize=25;
    return this.http.get(environment_java.server + "borrow/borrow-applys", { params: { flowStatus, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json())
  }
  getBorrowApproval(query: Query) {
    //console.error(query);
    let { flowStatus, pageSize, pageNo } = query;
    //flowStatus='0';
    //pageSize=25;
    return this.http.get(environment_java.server + "borrow/borrow-applys/my-approval", { params: { flowStatus, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json())
  }
  getReservationNos(mainApplyNos: string, type: string) {
   // console.error("heng  ssssssss tttt" + mainApplyNos + "   " + environment_java.server);
    let params: URLSearchParams = new URLSearchParams();
    params.set('applyMainIds', mainApplyNos);
    params.set('type', type);
    // return  this.http.get( environment_java.server +'invoice/change/getApprovals', { search: params })
    // return this.http.get(environment_java.server+"borrow/borrow-applys/queryReservationNos",{params:{'applyMainIds':mainApplyNos}})
    return this.http.get(environment_java.server + "borrow/borrow-apply/queryReservationNos", { search: params })
      .toPromise()
      .then(response => response.json())
  }
  //获取页面option选项值
  getBorrowPageAttrOption(type: number) {
    return this.http.get(environment_java.server + "borrow/borrow-applys/" + type + "/base-code")
      .toPromise()
      .then(response => response.json())
  }
  //获取页面option选项值
  getBorrowPageTypeOption(type: number, subCode: string) {
    return this.http.get(environment_java.server + "borrow/borrow-applys/" + type + "/base-code?parentCode=" + subCode)
      .toPromise()
      .then(response => response.json())
  }
  getUserContext() {
    return this.http.get(environment_java.server + "common/getCurrentLoginUser")
      .toPromise()
      .then(response => response.json())
  }
  //获取用户平台库存地
  getPlatforminv(paltcode: string) {
    return this.http.get(environment_java.server + "borrow/platforminv/storages?platformCode=" + paltcode)
      .toPromise()
      .then(response => response.json())
  }
  getIqUserContext(itCode: string) {
    return this.http.get(environment_java.server + "persons/" + itCode)
      .toPromise()
      .then(response => response.json())
  }
  getUserExtendInfo(itCode: string) {
    return this.http.get(environment_java.server + "common/getUserExtendInfo/" + itCode)
      .toPromise()
      .then(response => response.json())

  }
  getCurrentLoginUser() {
    return this.http.get(environment_java.server + "common/getCurrentLoginUser/")
      .toPromise()
      .then(response => response.json())

  }
  getbusinessDepts(topDept: string) {
    return this.http.get(environment_java.server + "borrow/dept-relation/" + topDept + "/dept-names")
      .toPromise()
      .then(response => response.json())

  }
  getbusinessDeptScopes(topDept: string, bbmc: string) {
    //console.error("sybmc===" + topDept + "    bbmc===" + bbmc);
    let params: URLSearchParams = new URLSearchParams();
    params.set("subDeptName", topDept);
    params.set("baseDeptName", bbmc);
    return this.http.get(environment_java.server + "borrow/deptrelation/baseandbusinessscope-names", { search: params })
      .toPromise()
      .then(response => response.json())

  }
  getBorrowCustomer(customerName: string) {
    return this.http.get(environment_java.server + "borrow/customer-address/delivery-address/" + customerName)
      .toPromise()
      .then(response => response.json())
  }
  postBorrowApply(borrowApplyFormData: BorrowApplyFormData) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ 'headers': headers });
    return this.http.post(environment_java.server + "borrow/borrow-apply", borrowApplyFormData, options)
      .toPromise()
      .then(response => response.json())
  }
  updateBorrowApply(borrowApplyFormData: BorrowApplyFormData) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return this.http.put(environment_java.server + "borrow/borrow-apply/" + borrowApplyFormData.borrowApply.applyId, borrowApplyFormData)
      .toPromise()
      .then(response => response.json());
  }
  queryBorrowApplyById(applyId: string) {
    return this.http.get(environment_java.server + "borrow/borrow-apply/" + applyId).toPromise()
      .then(response => response.json());
  }
  submitBorrowApply(borrowApplyFormData: BorrowApplyFormData) {
    return this.http.put(environment_java.server + "borrow/borrow-apply/" + borrowApplyFormData.borrowApply.applyId, borrowApplyFormData)
      .toPromise()
      .then(response => response.json());
  }
  delRemoteMateriel(materiel: Materiel) {
    return this.http.delete(environment_java.server + "borrow/borrow-apply/materiel/" + materiel.materielId).toPromise()
      .then(response => response.json());
  }
  delRemoteTransport(transport: Transport) {
    return this.http.delete(environment_java.server + "borrow/borrow-apply/transport/" + transport.transportId).toPromise()
      .then(response => response.json());
  }
  postBorrowApplySubmit(borrowApplyFormData: BorrowApplyFormData) {
    //console.info(borrowApplyFormData);
    return this.http.put(environment_java.server + "borrow/borrow-apply/submit/" + borrowApplyFormData.borrowApply.applyId, borrowApplyFormData)
      .toPromise()
      .then(response => response.json());

  }
  postBorrowApplyUnsave(borrowApplyFormData: BorrowApplyFormData) {
    return this.http.put(environment_java.server + "borrow/borrow-apply/submit-unsave", borrowApplyFormData)
      .toPromise()
      .then(response => response.json());
  }
  queryNowMonth() {
    return this.http.get(environment_java.server + "borrow//queryServerMonth")
      .toPromise()
      .then(response => response.json());
  }

  /**
* 查询审批还是只读
* @param instId 
*/
  queryReadOnlyFlag(instId: string) {
    return this.http.get(environment_java.server + "flow/info/" + instId).toPromise()
      .then(res => res.json());
  }


  /**
* 查询审批还是只读
* @param instId 
*/
  queryUserInfoById(userId: string) {
    return this.http.get(environment_java.server + "common/getUserInfo/" + userId).toPromise()
      .then(res => res.json());
  }

  /**
   * 下载附件
   */
  filesDownload(downloadFilesUrl: string) {
    return downloadIp + downloadFilesUrl;
  }

  /* 获取物料描述信息
   * @param materielNo 
   */
  meterialNoChange(materielNo: string) {
    return this.http.get(environment_java.server + "borrow/borrow-apply/meterial-memo/" + materielNo).toPromise()
      .then(res => res.json());
  }
  /**
   * 获取物料移动平均价
   * @param meterialNo 
   * @param factory 
   * @param batch 
   */
  getMaterialPrice(meterialNo: string, factory: string, batch: string) {

    return this.http.get(environment_java.server + "borrow/borrow-apply/meterialprice", { params: { meterialNo, factory, batch } }).toPromise()
      .then(res => res.json());
  }
  /**
   * 获取用户角色
   */

  getUserRole() {
    return this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
      .then(res => res.json());
  }
}