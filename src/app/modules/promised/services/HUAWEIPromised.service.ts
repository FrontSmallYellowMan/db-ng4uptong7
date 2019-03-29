import { Injectable } from "@angular/core";
import {
  Http,
  URLSearchParams,
  RequestOptions,
  Headers,
  Response,
  ResponseType
} from "@angular/http";
import "rxjs/add/operator/toPromise";
import { environment } from "../../../../environments/environment";

//新建申请路由导航
export class NewCreateApplyRoute {
  data: any = {
    title: "新建申请",
    list: [
      {
        label: "新建DCG承诺申请",
        url: "/promised/edit-dcg-newcreatepromised/" + 0,
        unClick: false,
        alert: "您没有权限创建新申请"
      },
      {
        label: "新建华为承诺申请",
        url: "/promised/edit-huawei-newcreatepromised/" + 0,
        unClick: false,
        alert: "您没有权限创建新申请"
      }
    ]
  };
}
//我的申请列表查询参数
export class ApplyQuery {
  SalesITCode: string = ""; //销售员ItCode
  PlatformID: string = null; //平台ID
  ApplyID: string = ""; //申请编号
  CommitTypeCode: string = ""; //承诺类型代码
  BeginDate: string = ""; //开始时间
  EndDate: string = ""; //结束时间
  PageIndex: number = 1; //页码
  PageSize: number = 10; //每页显示几条数据
  WFStatus: string = "提交申请"; //审批状态
}

//我的审批查询参数
export class ApprovalQuery {
  SalesITCode: string = ""; //销售员ItCode
  PlatformName: string = null //平台ID
  ApplyID: string = ""; //申请编号
  CommitmentType: string = ""; //承诺类型代码
  BeginDate: string = ""; //开始时间
  EndDate: string = ""; //结束时间
  PageIndex: number = 1; //页码
  PageSize: number = 10; //每页显示几条数据
  //WFStatus: string = "提交申请"; //审批状态
  TaskStatus:string="0";//审批流程状态

}

//承诺申请主字段
export class CommitmentApplyData {
  ApplyID: string; //承诺申请编号,
  CommitTypeCode: string = null; //类型编号,
  SalesITCode: string; //承诺销售员ITCODE,
  SalesName: string; //销售员名称,
  RelevanceITCODE: string; //关联销售员ITCODE,
  RelevanceName: string; //关联销售员名称,
  CreateDate: string; //创建日期,
  PlatformID: string = null; //平台ID,
  PlatformName: string; //平台名称,
  BusinessTypeID: string; //业务类型ID,
  AgentName: string; //代理商名称,
  SalesDeparment: string; //承诺销售员所属事业部,
  SalesLevel: string; //承诺销售员信用评级,
  ContractID: string; //合同编号（OA系统合同编号）,
  ContractName: string; //项目名称
  ContractMoney: string; //合同金额,
  CommitMatters: string; //承诺事项,
  CommitTypeDetailedName: string; //承诺类型下的分类型
  CommitDate: string; //承诺日期,
  ReturnMoney: string; //回款金额,
  SYBApprove1: string; //事业部一级审批人,
  SYBApprove2: string; //事业部二级审批人,
  SYBApprove3: string; //事业部三级审批人,
  SYBApprove4: string; //事业部四级审批人,
  SYBApprove5: string; //事业部五级审批人,
  WFStatus: string = "草稿"; //审批流程状态,
  ReachStatus: string = "未达成"; //承诺达成状态,
  ReachDate: string; //销售员承诺达成时间,
  ReachITCode: string; //达成确认人ITCODE,
  ReachName: string; //达成确认人名称,
  CommitTypesJSON: string; //承诺类型2（多选情况）,
  CommitCodeIsReach: string; //主承诺类型是否达成,
  DaiITCODE: string; //代理申请人Code,
  DaiName: string; //代理申请人名称,
  Ycode: string; //10Y号,
  ProductLline: string; //产品线,
  ReachedDate: string; //承诺达成时间,
  ShenprJSON: string; //审批人Json（预留）,
  Accountterm: string; //账期条件,
  Fksfqrdd: string; //付款是否确认订单,
}

//上传附件列表
export class AttachmentList {
  ApplyID: string; //申请ID,
  AccessoryID: string; //ID,
}

//承诺类型的子类型
export class CommitmentTypeDetailedList {
  TypeID: string; //类型ID,
  ApplyID: string; //申请ID,
  CommitTypeName: string; //承诺类型ID
  CommitTypeDetailedName: string; //承诺类型名称,
  IsCommit: string; //是否承诺,
  IsDacheng: string; //null
  isChecked: boolean; //是否被勾选
}

//华为承诺申请请求数据
export class HUAWEIFormData {
  CommitmentApply: any;
  AttachmentList: any[] = [];
  CommitmentTypeDetailedList: any[] = [];
  WFUserJson: string; //审批流程字符串
}

//审批接口
export class ApprovaData{
  applyid:string;//承诺申请编号
  apiUrl_AR:string="CommitmentHW/ApproveCommitmentApply";// "同意、驳回审批接口地址", 
  Fksfqrdd:string;//付款是否确认订单
  apiUrl_Sign:string="CommitmentHW/AddApprovalTask";// "创建加签审批接口地址", 
  apiUrl:string="CommitmentHW/ApproveAdditional";//加签审批接口
  apiUrl_Transfer:string="CommitmentHW/HandOverApproval";// "转办审批接口地址",
  taskid:string="";// "审批任务ID", 
  // nodeid:string="";// "审批节点ID"
  // instanceid:string="";//实例Id
  //actionType:string="";//操作分类，1:供应商新建审批  2:供应商修改审批
  //classnamecode:string;//供应商分类，在审批岗审批时，作为必填项
}

//承诺跟进查询参数
export class TrackQueryData{
  SalesITCode:string="";//销售员ItCode
  PlatformID:string="";//平台ID
  ReachStatus:string="";//达成状态
  AgentName:string="";//代理商
  ApplyID: string = ""; //申请编号
  CommitmentType: string = ""; //承诺类型代码
  BeginDate: string = ""; //开始日期
  EndDate: string = ""; //结束日期
  PageIndex: number = 1; //页码
  PageSize: number = 10; //页大小
}

//承诺跟进查询参数
export class TrackQueryDataExport{
  SalesITCode:string="";//销售员ItCode
  PlatformID:string="";//平台ID
  ReachStatus:string="";//达成状态
  AgentName:string="";//代理商
  ApplyID: string = ""; //申请编号
  CommitmentType: string = ""; //承诺类型代码
  BeginDate: string = ""; //开始日期
  EndDate: string = ""; //结束日期
}

@Injectable()
export class HUAWEIPrommisedService {
  constructor(private http: Http) {}

  //基础数据（平台列表，承诺列表）
  getBasicDate(queryData) {
    return this.http
      .post(environment.server + `CommitmentHW/GetBasicDataDropList`, queryData)
      .toPromise()
      .then(response => response.json());
  }

  //获取登录人的基本信息
  getPersonInformation() {
    return this.http
      .get(environment.server + "base/GetCurrentUserInfo")
      .toPromise()
      .then(response => response.json());
  }

  //我的申请查询
  MyApplyQuery(applyQuery: ApplyQuery) {
    return this.http
      .post(environment.server + `CommitmentHW/GetCommitmentList`, applyQuery)
      .toPromise()
      .then(response => response.json());
  }

  //我的申请列表删除
  deleteMyApplyList(ID) {
    return this.http
      .post(environment.server + `CommitmentHW/DeleteCommitmentApply`, ID)
      .toPromise()
      .then(response => response.json());
  }

  //我的审批列表查询
  myApprovalQuery(approvalQuery:ApprovalQuery){
    return this.http
    .post(environment.server + `CommitmentHW/GetMyAprooveList`, approvalQuery)
    .toPromise()
    .then(response => response.json());
  }

  //是否可以新建（DCG）承诺
  isNewPromisedDCG() {
    return this.http
      .post(environment.server + `Commitment/CanCreateCommitment`, {})
      .toPromise()
      .then(response => response.json());
  }

  //是否可以新建（HUAWEI）承诺
  isNewPromisedHUAWEI() {
    return this.http
      .post(environment.server + `CommitmentHW/CanCreateCommitment`, {})
      .toPromise()
      .then(response => response.json());
  }

  /**
   * --- 新建我的申请接口 ---
   */

  //新建申请返回申请ID
  getNewApplyId(nullData) {
    return this.http
      .post(environment.server + `CommitmentHW/AddCommitmentApply`, nullData)
      .toPromise()
      .then(response => response.json());
  }

  //获得详情
  getDetail(ApplyID) {
    return this.http
      .post(environment.server + `CommitmentHW/GetCommitmentApply`, ApplyID)
      .toPromise()
      .then(response => response.json());
  }

  //暂存接口
  tempSave(HUAWEIFormData: HUAWEIFormData) {
    return this.http
      .post(
        environment.server + `CommitmentHW/SaveCommitmentApply`,
        HUAWEIFormData
      )
      .toPromise()
      .then(response => response.json());
  }

  //提交接口
  onSubmit(HUAWEIFormData: HUAWEIFormData) {
    return this.http
      .post(
        environment.server + `CommitmentHW/SubmitCommitmentApply`,
        HUAWEIFormData
      )
      .toPromise()
      .then(response => response.json());
  }

  //撤销审批接口 
  RevokeApproval(ApplyID){
    return this.http
    .post(
      environment.server + `CommitmentHW/RevokeCommitmentApproval`,
      ApplyID
    )
    .toPromise()
    .then(response => response.json());
  }

  //获取审批全景图和审批历史记录
  getApprHistoryAndProgress(ApplyID){
    return this.http
    .post(
      environment.server + `CommitmentHW/GetApprHistoryAndProgress`,ApplyID
    )
    .toPromise()
    .then(response => response.json());
  }

  //承诺跟进列表接口
  getTrackList(trackQueryData:TrackQueryData){
    return this.http
    .post(
      environment.server + `CommitmentHW/GetCommitmentTrackList`,trackQueryData
    )
    .toPromise()
    .then(response => response.json());
  }

  //承诺跟进达成接口
  trackReach(HUAWEIFormData){
    return this.http
    .post(
      environment.server + `CommitmentHW/SetCommitmentApplyReachStatus`,HUAWEIFormData
    )
    .toPromise()
    .then(response => response.json());
  }

  //导出跟进列表
  exportTrackList(trackQueryData){
    return this.http
    .post(
      environment.server + `CommitmentHW/GetCommitmentTrackExcel`,trackQueryData,{responseType: 3}
    ).map(res=>res.blob());
  }
  

}
