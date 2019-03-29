import { PurchaseContractInfo } from "./purchase-contractInfo.service";
// 预下单采购申请 整体提交的数据结构
export class StockApply {//整体数据结构
  public purchaserequisitionid = null;//采购申请id
  public TemplateID = null;//模板id
  public companycode = '';//公司代码
  public company = '';//公司
  public factory = '';//工厂
  public vendorno = '';//供应商代码
  public vendor = '';//供应商
  public VendorClass="";//供应商类型
  public vendorbizscope = '';//对方业务范围
  public taxrate: number = null;//税率
  public taxratecode = '';//税率编码
  public taxratename = '';//税率名称
  public currency = '';//币种
  public currencycode = '';//币种代码
  public preselldate = null;//预售日期
  public RevolveDays: number = 0;//备货采购字段-实际周转天数
  public excludetaxmoney = 0;//未税总金额
  public foreigncurrencymoney = 0;//外币总金额
  public taxinclusivemoney = 0;//含税总金额
  public internationaltradelocation = 0;//国际贸易地点
  public internationaltradeterms: string = '';//国际贸易条件
  public receiver: string = '';//收货人
  public traceno: string = '';//需求跟踪号
  public purchasetype: string = '';//采购类型
  public purchaseorg: string = '';//采购组织
  public purchasegroup: string = '';//采购组
  public VendorTrace=null;//供应商追踪 -1 超期 0无效 1有效
  public paymentterms: string = '';//付款条款
  public paymenttermscode: string = '';
  public istoerp: boolean = true;//是否写入erp
  public sealmoney: any = null;//用印金额
  public itcode: string = '';//申请人ITCode
  public username: string = '';//申请人名称
  public addtime: Date = new Date;//申请时间
  public phone: string = '';//电话
  public homeoffice: string = '';//本部
  public FlatCode: string = '';//平台代码
  public plateform: string = '';//平台
  public bizdivision: string = '';//事业部
  public YWFWDM: string = '';//业务范围代码
  public VendorCountry = 0;//0-国内 1国外(海外供应商)
  public orderno=null;//采购订单号
  public purchaserequisitiontype: string = "";//采购申请类型：合同单采购，预下单采购_有合同，预下单采购_无合同，备货单采购
  // public wfid: string = '00000000-0000-0000-0000-000000000000';//流程id
  public wfstatus: string = '';//采购申请状态：提交/草稿/驳回/审批/完成
  public requisitionnum: string = '';//申请单号
  public currentapprove: string = '';//当前审批环节
  public WFApproveUserJSON: string = "";
  public PurchaseRequisitionDetailsList: Array<PurchaseRequisitionDetailsList> = [];
  public AccessoryList: Array<AccessoryList> = [];
  public PurchaseContractInfo : PurchaseContractInfo = new PurchaseContractInfo();
  public IsHaveContractInfo=null;//是否提交合同用印
  public IsPartial='';//是否分批采购
  public SendType:string;//发货方式
  public Po:string;//Po号
  public Remark:any='';//特殊情况说明
}
export class PurchaseRequisitionDetailsList {//采购清单-物料信息
  public ID = 0;
  public MaterialNumber = '';//物料号
  public MaterialDescription = '';//物料描述
  public Count:any = 0;//数量
  public Price:any = 0;//未税单价
  public Amount:any = 0;//未税总价
  public StorageLocation = "";//库存地
  public traceno = "";//需求跟踪号
  public Batch = "";//批次
  public MaterialSource = "";//物料来源
  public MaterialSourceType = "";//物料来源类型
  public AddTime = new Date;//添加时间
  public purchaserequisitionid = 0;//采购申请外键 
  public InTransit = null;//在途
  public  InStock = null;//在库
  public OverStock = null;// 积压
  public CurrentMonth = null;//清理计划-当月
  public NextMonth = null;//清理计划-下月
  public AfterNextMonth = null;//清理计划-下下月
}
export class AccessoryList {//附件列表
  public AccessoryID;
  public AccessoryName;
  public AccessoryURL;
  public AccessoryType;
  public CreatedTime;
  public CreatedByITcode;
  public CreatedByName;
  public InfoStatus
}
/*————————————————————————————————————————————— 以下是需要的其他结构 ————————————————————————————————————————————*/
export class StockApplyMessage {//预下单采购申请-采购信息-数据结构
  public TemplateID = null;//模板id
  public companycode = '';//公司代码
  public company = '';//公司
  public factory = '';//工厂
  public vendorno = '';//供应商代码
  public vendor = '';//供应商
  public VendorClass="";//供应商类型
  public vendorbizscope = '';//对方业务范围
  public taxrate : number = null;//税率
  public taxratecode = '';//税率编码
  public taxratename = '';//税率名称
  public currency = '';//币种
  public currencycode = '';//币种代码
  public preselldate = null;//预售日期
  public RevolveDays: number = 0;//备货采购字段-实际周转天数
  public foreigncurrencymoney = 0;//外币总金额
  public taxinclusivemoney = 0;//含税总金额
  public excludetaxmoney = 0;//未税总金额
  public receiver: string = '';//收货人
  public traceno: string = '';//需求跟踪号
  public VendorTrace=null;//供应商追踪 -1 超期 0无效 1有效
  public paymentterms: string = '';//付款条款
  public paymenttermscode: string = '';
  public VendorCountry = 0;//0-国内 1国外(海外供应商)
  public internationaltradelocation: string = '';//国际贸易地点
  public internationaltradeterms: string = '';//国际贸易条件
  public IsHaveContractInfo=null;//是否提交合同用印
  public IsPartial='';//是否分批采购
  public SendType:string='';//发货方式
  public Po:string='';//Po号
  public Remark:any='';//特殊情况说明

}
export class StockPersonElement {//预审人员的 单位信息 (在暂存情况下)
  public UserSettings="[]";//用户信息
  public IsOpened=0;//是否展示
}