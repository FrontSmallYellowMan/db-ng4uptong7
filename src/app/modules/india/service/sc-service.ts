
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { environment,APIAddress, environment_crm } from "../../../../environments/environment";
declare var window: any;

/**
 * 接口地址
 */
const getAppSelectData = "S_Contract/GetDepartmentPlatform";
const api_applyUrl = "S_Contract/GetMyApplyContracts";
const api_approvUrl = "S_Contract/GetMyApprovals";//我的审批列表
const api_companyUrl = "S_Contract/GetBaseCompany/";//根据当前登陆人ywfwdm取对应公司数据
const api_allcompanyUrl = "PU_Contract/GetBaseCompany";//获取我方主体信息
const api_companyByitcodeUrl = "S_Contract/GetBaseCompanyByitcode/";
const getDepartmentPlatformByItcodeUrl = "S_Contract/GetDepartmentPlatformByItcode/";
const api_deleteUrl = "S_Contract/DeleteSContract/";
const getscbyscUrl = "S_Contract/GetSCBaseDataBySCode";
const getChangeContractBySC_code = "RescissionContractChange/GetChangeContractBySC_code";
const getSelectDataUrl = "S_Contract/GetSCheckBaseData/";
const getBaseDataUrl = "S_Contract/GetBaseData";
const getSCheckBaseDataByRoleUrl = "S_Contract/GetSCheckBaseDataByRole";
const getWFFXByRoleUrl = "S_Contract/GetWFFXByRole";
const getUserDeptmentUrl = "S_Contract/GetUserDeptmentByItcode/";
const deleteStepUp = "S_Contract/DeleteStepUp/";
const saveContractData = "S_Contract/UpdateScContract";
const saveChangeContract = "RescissionContractChange/SaveChangeContract";
const contractRevoke = "S_Contract/RevokSCApproval/";//撤销
const getCustomerAuth = "S_Contract/GetCustomerCreate";
const getCustomerFrozen = "S_Contract/GetCustomerFreeze/";
const api_getSealsUrl = "S_Contract/GetOASealList";//获取用印数据
const api_uploadFilesUrl ="S_Contract/UploadSCAccessories/";//上传附件
const UpdatePurchaseNotified ="S_Contract/UpdatePurchaseNotified/";//采购通知
const deleteEContract = "E_Contract/DeleteEContract/";
const getUserPhoneUrl = "InitData/GetCurrentUserPhone";//获取登陆人信息
const checkPurchaseSaleContractInfoUrl = "PurchaseManage/CheckPurchaseSaleContractInfo/";//采购模块 验证是否可以解除合同
const sendMsgForSales = "S_Contract/SendMsgForSales";//销售订单-商务岗 发送消息通知
const SaveApprovalOpinion = "S_Contract/SaveApprovalOpinion";//添加审批意见
const GetApprovalOpinion = "S_Contract/GetApprovalOpinion";//获取审批完成后印章岗追加意见
//审批相关接口
const contractSubmit = "S_Contract/SubmitSContract";//提交、重新提交
const submitContractChange = "RescissionContractChange/SubmitContractChange";//提交、重新提交 变更
const getAppData = "S_Contract/GetApprHistoryAndProgress/";//加签
const contractApp = "S_Contract/ApproveSContract";//同意、驳回、同意并加签风险总监
const contractSignApp = "S_Contract/AddApprovalTask";//加签
const contractTransferApp = "S_Contract/HandOverApproval";//转办
export const contractAddTaskApp = "S_Contract/ApproveAdditional";//被加签人审批
const updateSCData = "S_Contract/UpdateSCForApprover";//审批暂存
const getRoleFieldConfigUrl = "BaseData/GetRoleFieldConfig";//根据销售员业务范围及业务类型获取规则信息
const updateBaseFieldMsgUrl = "BaseData/UpdateBaseFieldMsg";//更新个性化字段信息
const getBussinessFieldConfigUrl = "BaseData/GetBussinessFieldConfig";//根据销售合同ID获取扩展字段
const getCrmCustomInfoById = "new/clientInf/getCrmCustomInfoById/";//根据客户编号获取客户资信信息
const DownLoadProductList = "S_Contract/DownLoadProductList";//下载产品明细
const getCustomerUnClerTotalInfo = "SaleOrder/GetCustomerUnClerTotalInfo";//查询客户应收、超期欠款金额
const MyRequisitionList = "PurchaseManage/MyRequisitionList";//获取预下无合同采购申请
const GetPurchaseApplyStatus = "PurchaseManage/GetPurchaseApplyStatus";//获取与销售合同相关联的采购申请状态
const AddSC_Code = "PurchaseManage/AddSC_Code2";//关联销售合同与采购申请数据
const DelSC_Code = "PurchaseManage/DelSC_Code/";//删除销售合同与采购申请的关联
const GetConfigValueForRiskStatement = "SystemConfig/GetConfigValue/";//获取风险说明中各下拉框的数据源

//附件下载IP
const downloadIp = environment.server.replace('/api/','');
@Injectable()
export class ScService {
    constructor(private http: Http) { }

    //页面加载时，分页组件会多调用一次获取数据，防止重复调用数据
    _flag = false;
    /** 上一个页面 url地址(查看电子合同制作内容) */
    returnUrl:any = "";
    isToTpl:boolean = false;//是否跳转到合同制作页面

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    /**
     * 获取我的申请列表数据
     */
    getMyApplyData(params: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_applyUrl, params));
    }

    /**
     * 获取我的审批列表数据
     */
    getMyApprovData(params: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_approvUrl, params));
    }

    /**
     * 获取我方主体
     */
    getCompanyData(params): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_companyUrl + params, null));
    }

    /**
     * 获取我方主体 所有
     */
    getAllCompanyData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_allcompanyUrl, null));
    }

    /**
     * 获取我的审批  查询条件中下拉框数据
     */
    getAppSelectData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getAppSelectData,null));
    }

    /**
     * 列表 删除 销售合同
     */
    deleteSContract(scCode): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_deleteUrl + scCode,null));
    }

    /**
     * 列表 删除 电子合同
     */
    deleteEContract(scCode): Observable<any> {
        return this.repJson(this.http.post(environment.server + deleteEContract + scCode,null));
    }

    /**
     * 获取销售合同信息
     */
    getEContractByScCode(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getscbyscUrl, body));
    }

    /**
     * 获取下拉框数据
     */
    getSelectData(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + getSelectDataUrl+sc_code,null));
    }

    /**
     * 获取下拉框数据 不包含审批人序列信息
     */
    getBaseData(): Observable<any> {
        return this.repJson(this.http.post(environment.server + getBaseDataUrl,null));
    }

    /**
     * 获取销售合同审批人序列信息
     */
    getSCheckBaseDataByRole(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getSCheckBaseDataByRoleUrl, body));
    }

    /**
     * 获取销售合同审批人序列信息 根据平台编号
     */
    getWFFXByRole(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getWFFXByRoleUrl, body));
    }

    /**
     * 根据销售员itcode获取所有本部事业部及平台，电话
     */
    getUserDeptmentByItcode(itcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getUserDeptmentUrl + itcode,null));
    }

    /**
     * 销售合同 上一步
     */
    deleteStepUp(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + deleteStepUp + sc_code,null));
    }

    /**
     * 销售合同 暂存
     */
    saveContractData(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + saveContractData, body));
    }

    /**
     * 销售合同 暂存 变更
     */
    saveChangeContract(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + saveChangeContract, body));
    }

    /**
     * 获取销售合同审批历史及流程全景数据
     */
    contractRevoke(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractRevoke + sc_code,null));
    }

    /**
     * 销售合同审批 同意 驳回 同意并加签风险总监
     */
    contractApp(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractApp, body));
    }

    /**
     * 销售合同审批 加签
     */
    contractSignApp(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractSignApp, body));
    }

    /**
     * 销售合同审批 转办
     */
    contractTransferApp(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractTransferApp, body));
    }

    /**
     * 销售合同审批 被加签人审批
     */
    contractAddTaskApp(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractAddTaskApp, body));
    }

    /**
     * 撤销合同审批
     */
    getAppData(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + getAppData + sc_code,null));
    }

    /**
     * 获取代理商认证信息
     */
    getCustomerAuth(params): Observable<any> {
        return this.repJson(this.http.post(environment.server + getCustomerAuth, params));
    }

    /**
     * 获取代理商冻结信息
     */
    getCustomerFrozen(customercode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getCustomerFrozen + customercode,null));
    }
    /**
     * 获取印章信息数据
     */
    getSealsData(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_getSealsUrl, body));
    }

    /**
     * 选择上传风险附件时:accessoryType=1 ;
     * 选择上传事业部附件时，accessoryType= 3;
     * 选择自定义附件时，accessoryType=18
     */
     uploadSCAccessories(params: any) {
       return environment.server+api_uploadFilesUrl+params;
     }

    /**
     * 销售合同 提交、重新提交
     */
    submitContractData(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + contractSubmit, body));
    }

    /**
     * 销售合同 提交、重新提交 变更
     */
    submitContractChange(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + submitContractChange, body));
    }

    /**
     * 销售合同 审批暂存
     */
    updateSCApproval(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + updateSCData, body));
    }

    /**
     * 附件下载
     */
    upFilesDownload(params: any) {
        return APIAddress +params;
    }

    /**
     * 采购通知
     */
    UpdatePurchaseNotified(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + UpdatePurchaseNotified + sc_code,null));
    }
    /**
     * 获取登陆人电话
     */
    getUserPhone(): Observable<any> {
        return this.repJson(this.http.get(environment.server + getUserPhoneUrl));
    }

    /**
     * 根据itcode获取本部事业部及平台信息
     */
    getDepartmentPlatformByItcode(itcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + getDepartmentPlatformByItcodeUrl + itcode,null));
    }

    /**
     * 根据itcode获取我方主体信息
     */
    getCompanyByitcode(itcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_companyByitcodeUrl + itcode,null));
    }

    /**
     * 根据业务范围及业务类型获取规则信息
     */
    getRoleFieldConfig(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getRoleFieldConfigUrl, body));
    }

    /**
     * 更新个性化字段信息
     */
    updateBaseFieldMsg(customerformdata): Observable<any> {
        return this.repJson(this.http.post(environment.server + updateBaseFieldMsgUrl, customerformdata));
    }

    /**
     * 根据销售合同ID获取扩展字段
     */
    getBussinessFieldConfig(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getBussinessFieldConfigUrl, body));
    }

    /**
     * 获取客户资信信息
     */
    getCrmCustomInfoById(agentId): Observable<any> {
        return this.repJson(this.http.get(environment_crm.server + getCrmCustomInfoById + agentId));
    }

    /**
     * 获取变更销售合同信息
     */
    getChangeContractBySC_code(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + getChangeContractBySC_code, body));
    }

    /**
     * 采购模块 验证是否可以解除合同
     */
    checkPurchaseSaleContractInfo(sc_code): Observable<any> {
        return this.repJson(this.http.post(environment.server + checkPurchaseSaleContractInfoUrl + sc_code, null));
    }

    /**
     * 发送消息
     */
    sendMsgForSales(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + sendMsgForSales, body));
    }
    /**
     * 下载产品明细
     */
    DownLoadProductList(sc_code) {
        return this.http.post(environment.server + DownLoadProductList, {SC_Code:sc_code}, {responseType: 3}).pipe(map(res=>res.blob()));
    }
    /**
     * 查询客户应收、超期欠款金额
     */
    getCustomerUnClerTotalInfo(CustomerERPCode) {
        return this.repJson(this.http.post(environment.server + getCustomerUnClerTotalInfo, {"CustomerERPCode":CustomerERPCode}));
    }
    /**
     * 获取预下无合同采购申请
     */
    MyRequisitionList(query) {
        return this.repJson(this.http.post(environment.server + MyRequisitionList, query));
    }
    /**
     * 获取与销售合同相关联的采购申请状态
     */
    GetPurchaseApplyStatus(code, isfill) {
        return this.repJson(this.http.post(environment.server + GetPurchaseApplyStatus + "/" + code + "/" + isfill, null));
    }
    /**
     * 关联销售合同与采购申请数据
     */
    AddSC_Code(idarr,maincode) {
        return this.repJson(this.http.post(environment.server + AddSC_Code, { PurchaseRequisitionId: idarr, MainContractCode: maincode }));
    }
    /**
     * 删除销售合同与采购申请的关联
     */
    DelSC_Code(code) {
        return this.repJson(this.http.post(environment.server + DelSC_Code + code, null));
    }
    /**
     * 获取风险说明中各下拉框的数据源
     */
    GetConfigValueForRiskStatement(configdey) {
        return this.repJson(this.http.post(environment.server + GetConfigValueForRiskStatement + configdey, null));
    }

    /**
     * 添加审批意见
     */
    SaveApprovalOpinion(body): Observable<any> {
        return this.repJson(this.http.post(environment.server + SaveApprovalOpinion, body));
    }

    /**
     * 获取审批完成后印章岗追加意见
     */
    GetApprovalOpinion(sccode): Observable<any> {
        return this.repJson(this.http.post(environment.server + GetApprovalOpinion, {SC_Code: sccode}));
    }
}

// 印章列表中印章信息
export class sealsQuery{
  public platfromid: string;  //平台id  (必传)
  public pagesize: number ; //每页记录数
  public currage: number ;  //当前页
  public name: string ;// 搜索关键字
}
//表单数据
export class SCData {
    AccessList: any = "";//附件信息
    SCBaseData: SCBaseData = new SCBaseData();
    Contract: any = null;//原始合同的双章扫描件
    ChangeRecorde: any = null;//变更记录
    OperaType: any = "";
    RelieveReason: any = "";//解除原因
    RelieveAccess: any = null;//解除协议
    IsStillCanOrder: any = null;//原合同是否可继续开单 0-否，1-是
}
//销售合同主数据
export class SCBaseData {
    MainContractCode: any = "";//申请单号
    SC_Code: any = "";//销售合同编号
    SCType: any = "";
    SalesITCode: any = "";//销售员itcode
    SalesName: any = "";//销售员名字
    // Headquarterid: any = "";//本部编号
    Headquarter: any = "";//本部名称
    // BusinessUnitid: any = "";//事业部编号
    BusinessUnit: any = "";//事业部名称
    PlatformID: any = "";//平台编号
    Platform: any = "";//平台名称
    BuyerERPCode: any = "";//供应商ERPcode
    BuyerName: any = "";//供应商名称
    ContractMoney: any = "";//合同金额
    Currency: any = "";//币种
    AccountPeriodType: any = "";//系统账期
    AccountPeriodValue: any = "";//系统账期值
    ProjectType: any = "";//项目类型
    TaxRateCode: any = "";//税率
    PaymentMode: any = "";//付款方式
    ProjectName: any = "";//项目名称
    PayItem: any = "";//付款条款
    Outsourcing: any = "";//是否外购
    SupplyChain1: any = "";//供应链1
    SupplyChain2: any = "";//供应链2
    SupplyChain3: any = "";//供应链3
    SupplyChain4: any = "";//供应链4
    SupplyChain5: any = "";//供应链5
    AgentITcode: any = "";//代办人itcode(当前登录人 )
    AgentName: any = "";//代办人姓名
    ApplyITcode: any = "";//销售员(申请人)
    ApplyName: any = "";//销售员名字
    ApplyTel: any = "";//销售员电话
    SC_Status: any = "";//合同状态
    SealInfoJson: any = "";//用印信息
    WFApproveUserJSON: any = "";//审批人信息
    ContractType: any = "";//合同类型
    ContractSource: any = "";//合同创建
    YWFWDM: any = "";//业务范围代码
    CurrencyName: any = "";//币种
    AccountPeriodName: any = "";//系统账期
    ProjectTypeName: any = "";//项目类型
    TaxRateName: any = "";//税率
    PaymentName: any = "";//付款方式
    SealApprovalTime: any = "";//印章岗审批时间
    IsRecovery: any = 0;//合同是否回收
    BizConcernInfo: any = "";//商务关注信息
    TemplateID: any = "";//模板ID
    SellerCompanyCode: any = "";//我方主体编号
    SellerName: any = "";//我方主体
    EBContractID: any = "";//EB合同编号
    ChangeReason: any = "";//变更原因
    OriginalContractCode: any = "";//原始合同号
    Change_Status: any = null;//变更合同状态  null：不是变更合同
    Relieve_Status: any = null;//解除合同状态 null：不是解除合同
    IsEdit: any = 1;//是否允许编辑销售合同附件字段 (1允许 0不允许)
    IsUpload: any = 0;//双章是否上传字段  （ 1己上传，0未上传）
    CurrentApprovalNode: any = "";//当前审批环节
    Remark:string = "";//备注
    CustomizedContractNo: any = "";//自定义合同编号
    isFillContract:any = null;//该合同是否绑定了无合同采购申请（0或Null：未绑定，1：已绑定）
    ProjectNature:any = "";//项目性质
	CustMoneySource:any = "";//客户资金来源
	EndUserMoneySource:any = "";//最终用户资金来源
	IsDirectSend:any = "";//是否直发（0-否，1-是）
	HasProjectRealityInfo:any = "";//是否提供项目真实性资料（0-否，1-是）
	ProjectRealityInfoType:any = [
        {ischecked:false,value:"0"},
        {ischecked:false,value:"1"},
        {ischecked:false,value:"2"},
        {ischecked:false,value:"3"},
        {ischecked:false,value:"4"}
    ];//项目真实性资料类型
	ProjectRealityInfoOther:any = "";//其他项目真实性资料描述
	EndUserPayforType:any = "";//最终客户付款方式
	RiskAndControlled:any = "";//合同条款中存在的风险隐患和把握、以及事业部对此单回款的把控方式
	CustomerEvaluation:any = "";//申请人对客户的评价
	CustPaymentProcess:any = "";//客户付款流程
    ProjectImplementation:any = "";//项目履行实施安排、项目实施周期说明、项目竣工时间要求
    SealNullifyReason: any = "";//单章作废原因
    RecoveryMan:any = "";//回收人
    ScanFileUploadTime:any = "";//扫描件上传时间
    ScanFileUploadMan:any = "";//扫描件上传人
}
//附件信息
export class AccessList {
    AccessoryBus: Access[] = [];//事业部可见类型
    AccessorySub: Access[] = [];//风险可见类型
    AccessoryZ: Access[] = [];//自定义合同类型
    AccessorySeal: Access[] = [];//用印文件
    AccessoryS: Access[] = [];//审批文件
    AccessoryRisk: Access[] = [];//风险说明附件，类型：32
}
export class Access {
    AccessoryID: any;
    AccessoryName: any;
    AccessoryType: any;
    AccessoryURL: any;
    CreatedByName: any;
    CreatedByITcode: any;
}
//用印信息
export class Seal {
    SealData: any = [];
    PrintCount: any = "4";
}
//下拉框
export class SelectData {
    HeadquarterList: HeadquarterList[] = [];
    CurryList: CurryList[] = [];
    PayMendList: PayMendList[] = [];
    TaxRateList: TaxRateList[] = [];
    ProjectTypeList: ProjectTypeList[] = [];
    AccountPeriodList: AccountPeriodList[] = [];
    BusinessUnitList: BusinessUnitList[] = [];
    AgentList: AgentList[] = [];
    PlatForm: PlatForm[] = [];
    Buyer: Buyer[] = [];
    SellerCompanys:any[] = [];
}
export class HeadquarterList {
    constructor(
        public HeadquarterID: any,
        public HeadquarterName: any
    ) { }
}
export class CurryList {
    CurrencyID: any;
    CurrencyName: any
}
export class PayMendList {
    Paymentcode: any;
    PayMentName: any
}
export class TaxRateList {
    TaxRateID: any;
    TaxRateName: any
}
export class ProjectTypeList {
    ProjectTypeID: any;
    ProjectTypeName: any
}
export class AccountPeriodList {
    AccountPeriodID: any;
    AccountPeriodName: any
}
export class BusinessUnitList {
    constructor(
        public BusinessUnitID: any,
        public BusinessUnitName: any
    ) { }
}
export class AgentList {
    AgentID: any;
    AgentName: any
}
export class PlatForm {
    constructor(
        public FlatCode: any,
        public FlatName: any
    ) { }
}
export class Buyer {
    constructor(
        public BuyerERPCode: any,
        public BuyerName: any
    ) { }
}
export class UserDeptment {
    BBMC: any;
    FlatCode: any;
    FlatName: any;
    SYBMC: any;
    UserTel: any;
}
//用户信息
export class PersonInfo {
    "id": any = "";
    "prefixId": any = "";
    "itcode": any = "";
    "personNo": any = "";
    "name": any = "";
    "enname": any = "";
    "pinyin": any = "";
    "pinyinPrefix": any = "";
    "shortname": any = "";
    "position": any = "";
    "joindate": any = "";
    "sex": any = "";
    "hometown": any = "";
    "mobile": any = "";
    "telephone": any = "";
    "fax": any = "";
    "email": any = "";
    "signature": any = "";
    "qualifications": any = "";
    "bankCard": any = "";
    "status": any = 0;
    "statusReason": any = "";
    "innerEmail": any = "";
    "innerEmailContact": any = "";
    "type": any = 0;
    "isTrialAccount": any = "";
    "department": ""
  }
export class ApplySearch {
    ContractState: any = 1; //状态(0-草稿&&驳回，1-申请中，2-已完成)
    SellerCompanyCode: any = ""; //我方主体 //0001
    BuyerName: any = null; //客户名称
    ProjectName: any = null; //项目名称
    ContractType: any = null; //合同类型
    ContractSource: any = null; //合同创建
    SealApprovalTimeStart: any = null; //盖章完成起始日期
    SealApprovalTimeEnd: any = null; //盖章完成 结束日期
    currentpage: any = 1; //页码
    pagesize: any = 10; //每页大小
    CreateITcode: any = null //当前登录人itcode
    Saler: any = null; //销售员
}
export class ApproveSearch {
    QueryType: any = "ToDo";    //ToDo待审批 Done己审批 All全部
    SellerCompanyCode: any = "";//我方主体公司代码
    ApplyInfo: any = null;//申请人名称/ItCode
    BuyerName: any = null;//客户名称
    MainContractCode: any = null;//申请单号
    ProjectName: any = null;//项目名称
    Headquarter: any = "";//本部
    BusinessUnit: any = "";//事业部
    //SubmitTimeBegin:any =  ;//申请日期开始值：yyyy-MM-dd
    //SubmitTimeEnd:any =  ;//申请日期结束值：yyyy-MM-dd
    FinishTimeBegin: any = null;//完成日期开始值：yyyy-MM-dd
    FinishTimeEnd: any = null;//完成日期结束值：yyyy-MM-dd
    pagesize: any = 10; //每页记录数
    currentpage: any = 1;   //当前页数
    CreateITcode: any = null;   //当前登录人itcode
    PlatformID: any = "";  //平台ID
    ContractType: any = null;  //合同类型
    ContractSource: any = null;  //合同创建
    IsRecovery: any = null;  //合同是否回收
}

/**
 * 获取预下无合同采购申请 查询条件
 */
export class RequisitionListQuery {
    IsModify:any = null;//null
    WfStatus:any = "完成";//
    PageIndex:any = 1;//1
    PageSize:any = 10;//10
    SellerItCode:any = "";//销售员ItCode
    ProjectName:any = "";//项目名称
    PO:any = "";//厂商PO号
    PurchaseRequisitionType:any = "预下单采购_无合同";//预下单采购_无合同
    SortName:any = "addtime";//addtime
    SortType:any = "desc";//desc
    WebAPI_Invoker:any = "SC";
}