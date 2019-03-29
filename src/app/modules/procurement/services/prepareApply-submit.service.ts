import { PurchaseContractInfo } from "./purchase-contractInfo.service";
// 预下单采购申请 整体提交的数据结构
export class PrepareApply {//整体数据结构
  public purchaserequisitionid = null;//采购申请id
  public TemplateID = null;//模板id
  public companycode = '';//公司代码
  public company = '';//公司
  public factory = '';//工厂
  public vendorno = '';//供应商代码
  public vendor = '';//供应商
  public vendorbizscope = '';//对方业务范围
  public VendorClass="";//供应商类型
  public taxrate: number = null;//税率
  public taxratecode = '';//税率编码
  public taxratename = '';//税率名称
  public currency = '';//币种
  public currencycode = '';//币种代码
  public preselldate = null;//预售日期
  public presigndate:string=null;//预计签约时间
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
  public istoerp: boolean = false;//是否写入erp
  public sealmoney: any = 0;//用印金额
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
  public SellerItCode=null;//销售员ITCode
  public SellerName=null;//销售员name
  public purchaserequisitiontype: string = "";//采购申请类型：合同单采购，预下单采购_有合同，预下单采购_无合同，备货单采购
  // public wfid: string = '00000000-0000-0000-0000-000000000000';//流程id
  public wfstatus: string = '';//采购申请状态：提交/草稿/驳回/审批/完成
  public requisitionnum: string = '';//申请单号
  public currentapprove: string = '';//当前审批环节
  public WFApproveUserJSON: string = "";
  public IsHaveContractInfo=null;//是否提交合同用印
  public PurchaseRequisitionDetailsList: Array<PurchaseRequisitionDetailsList> = [];
  public AccessoryList: Array<AccessoryList> = [];
  public PurchaseRequisitionSaleContractList: Array<PurchaseRequisitionSaleContractList> = [];
  public PurchaseContractInfo : PurchaseContractInfo = new PurchaseContractInfo();
  public IsPartial='';//是否分批采购
  public SendType:string='';//发货方式
  public Po:string='';//Po号
  public Remark:string;//特殊情况说明
  public PurchaseProjectInfo:PurchaseProjectInfoContent= new PurchaseProjectInfoContent();//项目信息

  
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
export class PurchaseRequisitionSaleContractList {//销售信息
  // public id = null;
  // public purchaserequisitionid = null;//采购申请id
  public salecontractcode = '';//销售合同号
  public MainContractCode = '';//销售合同名称
  public excludetaxmoney = null;//未税总金额
  public taxinclusivemoney = null;//含税总金额
  public foreigncurrencymoney = 0;//	外币总金额
  // public cumulativeconsumemoney = 0;//采购订单累计用掉合同未税金额
  public addtime = new Date//添加时间
}
/*————————————————————————————————————————————— 以下是需要的其他结构 ————————————————————————————————————————————*/
export class PrepareApplyMessage {//预下单采购申请-采购信息-数据结构
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
  public Remark:string;//特殊情况说明
  public presigndate:string=null;//预计签约时间
}
export class SaleTabElement {//销售信息Tab数据 的单位信息
      public id; //唯一标识
      public text: string = '';//显示文字
      public invalid: boolean = false//校验是否 无效
}
export class SellShowElement {//销售信息展示数据 的单位信息
  public salecontractcode: string = '';
  public invalid: boolean = false//校验是否 无效
  public foreignIsFillin = true;//采购外币金额-是否填写框标识
  public excludetaxIsFillin = true;//采购未税总金额-是否填写框标识


  public ProjectName: string = '';
  public BuyerName: string = '';
  public ContractMoney=0;
  public PurchaseTaxMoney=0;
  public State=null;//销售合同状态  0-草稿，1-申请中，2-已完成，3-驳回
  public Bids: Array<SaleShowAccessory> = [];//附件信息
  public ProductDetails: Array<SaleShowProductDetail> = [];//产品明细
  public PayItem:string;//付款条款
  public GrossProfitRate:string;//毛利率
  public ProtectType:string;//产品类型
  public BuyerERPCode:string;//ERPcode
  public Overdue:string;//客户超期欠款
  public Receivable:string;//应收账款 
}
export class SaleShowAccessory {//销售信息展示数据 的附件信息 单位
  public AccessoryID;
  public AccessoryName;
  public AccessoryURL;
  public AccessoryType;
  public CreatedTime;
  public CreatedByITcode;
  public CreatedByName;
  public InfoStatus
}
export class SaleShowProductDetail {//销售信息展示数据 的产品明细 单位
  public SC_Code;
  public ProductName;
  public Model;
  public Qty;
  public Price;
  public TotalPrice;
  public Remark
}
export class PreparePersonElement {//预审人员的 单位信息 (在暂存情况下)
  public UserSettings="[]";//用户信息
  public IsOpened=0;//是否展示
}

//项目信息内容字段
export class PurchaseProjectInfoContent{
  ProjectName:string;//项目名称
  ERPNumber:string='';//客户名称
  CustomName:string='';//客户名称
  FinalCustomName:string;//最终客户名称
  Currency:string='';//项目币种
  Rate:string;//毛利率
  CustomAmount:number=0.00;//客户应收账款
  CustomAmountOver:number=0.00;//客户超期欠款
  PayItem:string;//付款条款
  CSP:boolean;//是否csp
  ProductType:string;//产品类型
  ProjectInfo:any;//保存自定表单
  ProjectSalesAmount:any;//保存项目销售金额
}

//客户信息
export class BuyerInfo {
  KTOKD: string = "";
  KUNNR: string = "";
  NAME: any = "";
  ORT01: any = "";
}
