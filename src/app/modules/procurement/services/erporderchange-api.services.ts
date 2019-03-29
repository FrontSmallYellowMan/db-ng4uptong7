import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  URLSearchParams,
  Headers,
  Http,
  RequestOptionsArgs,
  RequestOptions,
  Response
} from "@angular/http";
import {
  environment,
  APIAddress,
  environment_crm
} from "../../../../environments/environment";

//接口地址

const getDepart_BU_PlatFormByItcodeApi =
  "S_Contract/GetDepartmentPlatformByItcode/";

//我的申请列表查询参数
export class MyApplyQuery {
  TrackingNumber: string; /*需求跟踪号*/
  ERPOrderChangeNo: string; /*申请单号*/
  OriginalERPOrderNo: string; /*原ERP订单号*/
  Vendor: string; /*供应商*/
  IsRedInvoice: string=""; /*是否采购冲红*/
  BeginTime: string; /*开始时间*/
  EndTime: string; /*结束时间*/
  ApproveState: string='1'; /*记录状态（0：草稿，1：提交，2：驳回，3：完成）*/
  PageIndex:number=1;//当前页
  PageSize:number=10;//分页

}

//我的审批列表查询参数
export class MyApprovalQuery {
  PageIndex:string='1';//页面
PageSize:string='10';//每页显示几条数据
BBMC:string=''; /*本部*/
SYBMC:string=""; /*事业部*/
User:string=""; /*申请人*/
TrackingNumber:string=""; /*需求跟踪号*/
Vendor:string="";/*供应商*/
OriginalERPOrderNo:string="";/*原ERP订单号*/
ERPOrderChangeNo:string=""; /*申请单号*/
IsRedInvoice:string=""; /*是否采购冲红*/	
BeginTime:string=""; /*开始时间*/
EndTime:string=""; /*结束时间*/
TaskStatus:string="0"; /*0:未处理,1:已处理,2:全部*/
}

//ERP采购订单修改Model类
export class ErpOrderChangeData {
  public Id: any = 0; //主键id
  public TrackingNumber: any = ""; //需求跟踪号
  public OriginalERPOrderNo: any = ""; //原ERP订单号（修改前）
  public ERPOrderNo: any = ""; //ERP订单号（修改后）
  public OriginalOrderAmount: any = 0; //原订单金额
  public OrderAmount: any = 0; //订单总金额（修改后）
  public IsRedInvoice: any = 0; //是否采购冲红
  public IsChangeMaterial:number = 0; //是否修改物料明细
  public Is2ERP: any = 0; //是否创建新的采购订单
  public ItemDescription: any = ""; //项目描述
  public OriginalCurrency: any = ""; //币种（修改前）
  public OriginalCurrencyCode: any = ""; //币种代码（修改前）
  public OriginalFactoryCode: any = ""; //工厂代码（修改前）
  public OriginalTaxFileNumber: any = ""; //税号（修改前）
  public OriginalVendor: any = ""; //供应商（修改前）
  public OriginalVendorNo: any = ""; //供应商代码（修改前）
  public OriginalSumNo: any = ""; //汇总号（修改前）
  public Currency: any = ""; //币种（修改后）
  public CurrencyCode: any = ""; //币种代码（修改后）
  public FactoryCode: any = ""; //工厂代码（修改后）
  public TaxFileNumber: any = ""; //税号（修改后）
  public VendorNo: any = ""; //供应商代码（修改后）
  public Vendor: any = ""; //供应商（修改后）
  public SumNo: any = ""; //汇总号（修改后）
  public WorkFlowInstanceId: any = "00000000-0000-0000-0000-000000000000"; //流程实例ID
  public ApproveState: any = ""; //记录状态（0：草稿，1：提交，2：驳回，3：完成）
  public WFApproveUserJSON: any = ""; //流程配置信息
  public CurrentApprovalNode: any = ""; //当前流程审批节点
  public AddTime: any = ""; //添加时间
  public ItCode: any = ""; //申请人ItCode
  public UserName: any = ""; //申请人
  public BBMC: any = ""; //部门
  public SYBMC: any = null; //事业部
  public YWFWDM: any = ""; //业务范围代码
  public FlatCode: any = ""; // 平台代码
  public COMP_CODE: any = ""; //公司代码
  public PURCH_ORG: any = ""; //采购组织
  public PUR_GROUP: any = ""; //采购组
  public PMNTTRMS: any = ""; //付款条款
  public DOC_TYPE: any = ""; //采购凭证类型（NA/NB/NK...）
  public ERPOrderChangeNo: any = ""; //申请单号
  public Contracts:string;//保存销售合同列表

  public ERPOrderChangeMaterialList: Array<ERPOrderChangeMaterial> = [
    new ERPOrderChangeMaterial()
  ]; //物料清单
  public AccessoryList: Array<ERPOrderChangeAccessory> = []; //附件列表
}

// const createIdFn = () => {
//     let i = 0;
//     return () => i++;
//   }

// const createId=createIdFn();

let createId = 0;

//物料明细类
export class ERPOrderChangeMaterial {
  public Id: any = 0; //主键Id
  public ItemNo: any = 10; //行项目号
  public OriginalMaterialNumber: any = ""; //物料号（修改前）
  public OriginalMaterialDescription: any = ""; //物料描述（修改前）
  public OriginalCount: any = 0; //数据量（修改前）
  public OriginalPrice: any = 0; //单价（修改前）
  public OriginalStorageLocation: any = ""; //库存（修改前）
  public OriginalBatch: any = ""; //批次（修改前）
  public OriginalSC_Code: any = ""; //销售合同主键（修改前）
  public OriginalMainContractCode: any = ""; //销售合同号（修改前）
  public MaterialNumber: any = ""; //物料号（修改后）
  public MaterialDescription: any = ""; //物料描述（修改后）
  public Count: any = 0; //数量（修改后）
  public Price: any = 0; //单价（修改后）
  public StorageLocation: any = ""; //库存地（修改后）
  public Batch: any = ""; //批次（修改后）
  public SC_Code: any = null; //销售合同主键(修改后)
  public MainContractCode: any = ""; //销售合同号(修改后)
  public AddTime: any = ""; //添加时间
  public DBOMS_ERPOrderChange_ID: any = 0; //ERP订单修改外键
  public SortNum: any = 0; //排序权值
  public IsNew: any = true; //本行是否是新增物料(false：否，true：是)
  public IsDeleted: any = false; //本行是否已被删除(false：否，true：是)
  public IsChanged: any = false; //是否被修改(false：否，true：是)
  public PurchaseForeignId: any = ""; //采购模块物料明细（采购申请物料明细表<purchaserequisitionid>/采购订单物料明细表<PurchaseOrder_ID>）外键
  public TrackingNo: any = ""; //ERP跟踪号
  public tableId: number; //保存id

  constructor() {
    //this.tableId=createId();
    createId++;
    this.tableId = createId;
  }
}

//附件
export class ERPOrderChangeAccessory {
  public AccessoryID = "";
  public AccessoryName: string = "";
  public AccessoryURL: string = "";
  public AccessoryType: string = "";
  public CreatedTime: Date = new Date();
  public CreatedByITcode: string = "";
  public CreatedByName: string = "";
  public InfoStatus = null;
}

//获取流程审批人
export class ERPOrderChangeApprover{
  BizScopeCode:string;//申请人所属业务范围代码
  WorkFlowCategory:string='ERPORDERCHANGE';//固定值
}

//审批参数
export class ApproveData{//审批组件内部调用参数
  ID:string;//主键Id
  apiUrl_AR:string="ERPOrderChange/ApproveChange";// "同意、驳回审批接口地址", 
  apiUrl_Sign:string="ERPOrderChange/AddTask";// "加签审批接口地址", 
  apiUrl:string="ERPOrderChange/ApproveAddTask";//加签接口
  apiUrl_Transfer:string="ERPOrderChange/AddTransferTask";// "转办审批接口地址",
  taskid:string="";// "审批任务ID", 
  nodeid:string="";// "审批节点ID"
  instanceid:string="";//实例Id
}

//验证是否可以创建采购订单修改的请求参数
export class VaildateResData{
  trackingNo:string;//需求跟踪号
  orderNo:string;//采购订单号
}


//注入模块使用的服务
@Injectable()
export class ERPOrderChangeApiServices {
  constructor(private http: Http) {}

  //获取登录人的事业部列表
  getDepart_BU_PlatFormByItCode(itcode) {
    return this.http
      .post(environment.server + getDepart_BU_PlatFormByItcodeApi + itcode, {})
      .toPromise()
      .then(response => response.json());
  }

  //获取申请人的基本信息
  getPersonInformation() {
    return this.http
      .get(environment.server + "base/GetCurrentUserInfo")
      .toPromise()
      .then(response => response.json());
  }

  //获取币种列表
  getCurrencySelectInfo() {
    //获取ngSelect格式的 币种列表数据
    return this.http
      .post(environment.server + "InitData/GetCurrencyInfo", {})
      .toPromise()
      .then(response => response.json());
  }

  //获取税率列表
  getTaxrateSelectInfo() {
    //获取ngSelect格式的 税率列表数据
    return this.http
      .post(environment.server + "InitData/GetTaxrateInfo", {})
      .toPromise()
      .then(response => response.json());
  }

  //保存表单数据
  save(erpOrderChangeData) {
    return this.http
      .post(
        environment.server + "ERPOrderChange/SaveERPOrderChange",
        erpOrderChangeData
      )
      .toPromise()
      .then(response => response.json());
  }

  //根据需求跟踪号获取ERP列表
  getERPList(trackingnumber) {
    return this.http
      .get(
        environment.server +
          "ERPOrderChange/GetERPOrdersByTrackingNumber/" +
          trackingnumber
      )
      .toPromise()
      .then(response => response.json());
  }

  //根据ERP编号获取ERP订单的详细信息
  getERPDetail(orderno) {
    return this.http
      .get(environment.server + "ERPOrderChange/GetERPOrderDetail/" + orderno)
      .toPromise()
      .then(response => response.json());
  }

  //获取详情
  getDetail(Id){
    return this.http
      .get(environment.server + "ERPOrderChange/GetChangeInfoById/" + Id)
      .toPromise()
      .then(response => response.json());
  }

  //根据物料号获取物料描述
  getMaterialContent(materialNumber){
    return this.http
    .get(environment.server + "PurchaseManage/GetMaterialInfo/" + materialNumber)
    .toPromise()
    .then(response => response.json());
  }

  //获取审批历史记录
  getHistoryAndProgress(erpChangeId){
    return this.http
    .get(environment.server + `ERPOrderChange/GetApproveHistory/${erpChangeId}`)
    .toPromise()
    .then(response => response.json());
  }

  //获取库房冲红审批人
  getStorageRCWApproversApi(){
    return this.http
    .get(environment.server + `ERPOrderChange/GetStorageRCWApprovers`)
    .toPromise()
    .then(response => response.json());
  }

  //获取流程审批人
  getFlowConfigInfo(resData){
    return this.http
    .post(environment.server + `ERPOrderChange/GetWorkFlowConfigInfo`,resData)
    .toPromise()
    .then(response => response.json());
  }

  //验证是否可以创建采购订单修改
  validateCanCreate(resData:VaildateResData){
     return this.http.post(environment.server + `ERPOrderChange/CheckUnique`,resData).toPromise().then(response => response.json());
  }

  /**
   * 我的申请列表页面接口
   */

  //我的申请查询列表
  getMyApplylist(MyApplyQuery) {
    return this.http
      .post(
        environment.server + "ERPOrderChange/ERPOrderChangeList", MyApplyQuery
      )
      .toPromise()
      .then(response => response.json());
  }

  //删除我的申请列表
  deleteMyApplyList(Id){
    return this.http
      .get(environment.server + "ERPOrderChange/DelRecord/"+Id)
      .toPromise()
      .then(response => response.json());
  }

  /**
   * 我的审批列表
   */

   //获取我的审批列表接口
   getMyApprovalList(MyApprovalQuery){
    return this.http
    .post(environment.server + "ERPOrderChange/ERPOrderChangeApprovalLsit", MyApprovalQuery)
    .toPromise()
    .then(response => response.json());
   }

   //获取库房冲红审批人
   getStorageRCW(){
     return this.http.get(environment.server+"ERPOrderChange/GetConfigApprovers/OrderChange_StorageRCW").toPromise().then(Response=>Response.json());
   }
   
   //获取(改单/删单)采购员
   getPurchaser(){
     return this.http.get(environment.server+"ERPOrderChange/GetConfigApprovers/OrderChange_Purchaser").toPromise().then(Response=>Response.json());
   }

}
