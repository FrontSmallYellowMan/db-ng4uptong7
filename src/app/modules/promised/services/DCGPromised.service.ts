import { Http, ResponseContentType } from "@angular/http";
import { environment } from "../../../../environments/environment";
import { Inject, Injectable } from "@angular/core";

/**
 * 我的申请查询参数Model
 */
export class CommitMyApply {
  WFStatus: string = "提交申请"; //流程状态:草稿|提交申请|已完成
  SalesITCode: string = ""; //销售员ITCode
  SalesLevel: string = ""; //信用评级
  PlatformID: string = ""; //平台ID
  BeginDate: string = ""; //开始日期
  EndDate: string = ""; //结束日期
  PageIndex: number = 1; //页码
  PageSize: number = 10; //页大小
}

//我的审批列表
export class QueryMyApproval{
  TaskStatus: string = "0"; //流程状态:0：带我审批|1：我已审批|2：全部
  SalesITCode: string = ""; //销售员ITCode
  SalesLevel: string = ""; //信用评级
  PlatformName: string = ""; //平台ID
  BeginDate: string = ""; //开始日期
  EndDate: string = ""; //结束日期
  PageIndex: number = 1; //页码
  PageSize: number = 10; //页大小

}

//承诺申请主字段
export class CommitmentData {
  ApplyID: string; //承诺申请编号,
  CommitTypeCode: string = null; //类型编号,
  SalesITCode: string; //承诺销售员ITCODE,
  SalesName: string; //销售员名称,
  RelevanceITCODE: string; //关联销售员ITCODE,
  RelevanceName: string; //关联销售员名称,
  CreateDate: string; //创建日期,
  PlatformID: string = null; //平台ID,
  PlatformName: string=null; //平台名称,
  BusinessTypeID: string; //业务类型ID,
  AgentName: string; //代理商名称,
  SalesDeparment: string; //承诺销售员所属事业部,
  SalesLevel: string; //承诺销售员信用评级,
  ContractID: string; //合同编号（OA系统合同编号）,
  ContractMoney: string=""; //合同金额,
  CommitMatters: string; //承诺事项,
  CommitDate: string; //承诺日期,
  ReturnMoney: string; //回款金额,
  SYBApprove1: any; //事业部一级审批人,
  SYBApprove2: any; //事业部二级审批人,
  DCGRiskApprove: any; //风险岗审批人,
  DCGBusiApprove: any; //销售商务岗审批人,
  WFStatus: string; //审批流程状态,
  ReachStatus: string='未达成'; //承诺达成状态,
  ReachDate: string; //达成时间,
  ReachITCode: string; //达成确认人ITCODE,
  ReachNames: string; //达成确认人名称,
  CommitTypesJSON: string; //承诺类型2（多选情况）,
  CommitCodeIsReach: string; //主承诺类型是否达成,
  ReturnContractResult: string; //合同收回情况
}

//上传附件列表
export class AttachmentList {
  ApplyID: string; //申请ID,
  AccessoryID: string; //ID,
  AccessoryURL:string;//附加地址
  AccessoryName:string;//附加名称
}

//DCG承诺申请请求数据
export class DCGIData {
  CommitmentApply: any;
  AttachmentList: any[] = [];
  WFUserJson:string;//审批流程字符串
  //CommitmentTypeDetailedList: any[] = [];
}

const createIdFn = () => {
  let i = 0;
  return () => i++;
}
const createId = createIdFn();
//多条承诺类型存储字段
export class CommitTypesListData{
    Code:string='';//承诺类型编号
    Name:string='';//承诺类型名称
    IsReach:string='';//是否达成承诺
    id: number;
    constructor() {
      this.id = createId();
    }
}

//审批人JSON字符串
export class ApprovalPersonJSON{
  data:any=[{
    ID: 2,
    BizScopeCode: null,
    WFCategory: "承诺管理(DCG)",
    TemplateID: "2842EC8A-0387-4DA3-A254-5B5A17A814D8",
    NodeID: 3,
    NodeName: "事业部一级审批",
    IsOpened: 1,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 400,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 3,
    BizScopeCode: null,
    WFCategory: "承诺管理(DCG)",
    TemplateID: "2842EC8A-0387-4DA3-A254-5B5A17A814D8",
    NodeID: 4,
    NodeName: "事业部二级审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 425,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 4,
    BizScopeCode: null,
    WFCategory: "承诺管理(DCG)",
    TemplateID: "2842EC8A-0387-4DA3-A254-5B5A17A814D8",
    NodeID: 5,
    NodeName: "DCG风险岗审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 450,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 5,
    BizScopeCode: null,
    WFCategory: "承诺管理(DCG)",
    TemplateID: "2842EC8A-0387-4DA3-A254-5B5A17A814D8",
    NodeID: 6,
    NodeName: "DCG商务岗审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 475,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }]
}

//审批接口
export class ApprovaData{
  applyid:string;//承诺申请编号
  apiUrl_AR:string="Commitment/ApproveCommitmentApply";// "同意、驳回审批接口地址", 
  apiUrl_Sign:string="CommitmentHW/AddApprovalTask";// "创建加签审批接口地址", 
  apiUrl:string="CommitmentHW/ApproveAdditional";//加签审批接口
  apiUrl_Transfer:string="CommitmentHW/HandOverApproval";// "转办审批接口地址",
  taskid:string="";// "审批任务ID", 
  //nodeid:string="";// "审批节点ID"
  //instanceid:string="";//实例Id
  //actionType:string="";//操作分类，1:供应商新建审批  2:供应商修改审批
  //classnamecode:string;//供应商分类，在审批岗审批时，作为必填项
}

/**
 * 承诺跟进
 */

//承诺跟进查询参数
export class QueryPromisedTrack{
  SalesITCode:string="";//销售员ItCode
  SalesLevel:string=null;//销售员评级
  PlatformID:string=null;//平台ID
  ReachStatus:string="";//达成状态
  AgentName:string="";//代理商
  BeginDate: string = ""; //开始日期
  EndDate: string = ""; //结束日期
  PageIndex: number = 1; //页码
  PageSize: number = 10; //页大小
}

//查询信用评级参数
export class QueryCreditLevelData{
  UserInfo:string="";//销售员姓名或itcode
  DeptName:string="";//部门名称
  FlatName:string="";//平台名称
  PageIndex: number = 1; //页码
  PageSize: number = 10; //页大小

}

//设置销售员等级
export class SetLevelData{
  ITCode:string;//ItCode
  CommitLevel:string="";//承诺等级
}

/**
 * 承诺集团服务
 */
@Injectable()
export class DCGPromiseService {
  constructor(private http: Http) {}

  /**
   * 删除承诺集团
   * @param delApplyIds 删除承诺ID列表
   */
  deleteCommitList(delApplyIds: any): Promise<any> {
    return this.http
      .post(
        environment.server + `Commitment/DeleteCommitmentApply`,
        delApplyIds
      )
      .toPromise()
      .then(res => res.json());
  }

  /**
   * 获取平台列表及承诺类型
   */
  getPlatformAndCommitmentTypeList(): Promise<any> {
    return this.http
      .post(environment.server + `Commitment/GetBasicDataDropList`, {})
      .toPromise()
      .then(res => res.json());
  }

  /**
   * 获取承诺列表
   * @param searchData 查询参数
   */
  getCommitList(searchData: CommitMyApply): Promise<any> {
    //debugger;
    let promise = this.http
      .post(environment.server + `Commitment/GetCommitmentList`, searchData)
      .toPromise()
      .then(res => res.json());
    return promise;
  }

  //获取我的审批列表
  getMyApprovalList(searchData:QueryMyApproval){
    return this.http
      .post(environment.server + `Commitment/GetMyAprooveList`, searchData)
      .toPromise()
      .then(res => res.json());
  }

  /**
   * 获取时间差(t2-t1)
   * @param t1 第一个Date对象
   * @param t2 第二个Date对象
   */
  getDateDiff(t1: Date, t2: Date): number {
    let diff: number = 0;
    //let t1: Date = new Date(time1.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+/mg, '$1-$2-$3'));
    //let t2: Date = new Date(time2.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+/mg, '$1-$2-$3'));
    diff = (t2.getTime() - t1.getTime()) / (1000 * 3600 * 24);
    return Math.ceil(diff);
  }

  //获取申请人的基本信息
  getPersonInformation() {
    return this.http
      .get(environment.server + "base/GetCurrentUserInfo")
      .toPromise()
      .then(response => response.json());
  }

  /**
   * --- 新建我的申请接口 ---
   */

  //新建申请返回申请ID
  getNewApplyId() {
    return this.http
      .post(environment.server + `Commitment/AddCommitmentApply`, {})
      .toPromise()
      .then(response => response.json());
  }

  //暂存DCG承诺申请
  tempSave(DCGData:any){
    return this.http
      .post(environment.server + `Commitment/SaveCommitmentApply`, DCGData)
      .toPromise()
      .then(response => response.json());
  }

  //提交申请
  onSubmit(DCGData:any){
    return this.http
    .post(environment.server + `Commitment/SubmitCommitmentApply`, DCGData)
    .toPromise()
    .then(response => response.json());
  }

  //查看详情
  getDetail(ApplyID:any){ 
    return this.http
      .post(environment.server + `Commitment/GetCommitmentApply`, ApplyID)
      .toPromise()
      .then(response => response.json());
    
  }

  /**
   * ---- 详情页接口 ----
   */
  
   //撤销审批接口
   revokeCommitmentApproval(ApplyID){
    return this.http
    .post(environment.server + `Commitment/RevokeCommitmentApproval`, ApplyID)
    .toPromise()
    .then(response => response.json());
   }

   //审批历史记录和审批流程图接口
   getApprovalHistroyAndView(ApplyID){
    return this.http
    .post(environment.server + `Commitment/GetApprHistoryAndProgress`, ApplyID)
    .toPromise()
    .then(response => response.json());
   }

   /**
    * 承诺跟进请求接口
    */
   
  //获取承诺跟进列表接口
  getPromisedTrackList(queryPromisedTrack:QueryPromisedTrack){
    return this.http
    .post(environment.server + `Commitment/GetCommitmentTrackList`, queryPromisedTrack)
    .toPromise()
    .then(response => response.json());
  }

  //导出承诺跟进列表
  exportTrackList(queryPromisedTrack:QueryPromisedTrack){
    return this.http
    .post(environment.server + `Commitment/GetCommitmentTrackExcel`, queryPromisedTrack, {responseType: 3}).map(res=>res.blob());
  }

  //是否可以新建承诺申请
  isNewPromised(){
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
   * 信用评级
   */

//查询信用评级
queryCreditLevel(queryCreditLevelData:QueryCreditLevelData){
  return this.http
  .post(environment.server + `Commitment/SearchSalesMan`, queryCreditLevelData)
  .toPromise()
  .then(response => response.json());
}

//修改销售员承诺等级
setSaleLevel(setLevelData:SetLevelData){
  return this.http
  .post(environment.server + `Commitment/SetCommitLevel`, setLevelData)
  .toPromise()
  .then(response => response.json());
}

//导入信用评级
exportLevel(){
  return this.http
  .post(environment.server + `Commitment/UploadCommitLevel`, {})
  .toPromise()
  .then(response => response.json());
}

//验证权限空接口
testPower(){
  return this.http
  .post(environment.server + `Commitment/Authority`, {})
  .toPromise()
  .then(response => response.json());
}
  

}
