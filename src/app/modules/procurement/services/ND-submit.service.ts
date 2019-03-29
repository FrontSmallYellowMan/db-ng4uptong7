export class PurchaseOrderObj {//采购订单-整体数据结构
  public ID = null;
  public PurchaseRequisitionType = null;
  /*
    以NA采购订单为基础建立的ND单 = 4,
    直接创建ND = 5
  */
  public ApplicantOrderNumber: string = "";//申请订单号
  public TemplateID = null;//模板id
  public ApplicantName: string = "";//申请人名字
  public ApplicantItCode: string = "";//申请人ItCode
  public ERPOrderNumber = null;
  public VendorClass: string = ""; //新产品
  public ApproveID = null;
  public UpdateTime: Date = new Date;
  public AddTime: Date = new Date;
  public WFApproveUserJSON = null;
  public CurrentApprovalNode = null;
  public CostCenter: string = ""; //成本中心
  public Department: string = "";   //申请人部门
  public Platform: string = "";    //平台
  public Telephone: string = "";//申请人电话
  public BBMC: string = "";//本部名称
  public SYBMC: string = "";//事业部名称
  public YWFWDM: string = "";//业务范围代码
  public FlatCode: string = "";//平台代码
  public OrderType: string = "ND";//采购订单类型（ND）
  public CompanyName: string = "";//公司名称
  public CompanyCode: string = "";//公司代码
  public FactoryCode: string = "";//工厂编号
  public Vendor: string = "";//供应商名称
  public VendorNo: string = "";//供应商代码
  public VendorCountry = 0;//0-国内 1国外(海外供应商)
  public IsInternalGroup = 0; //是否集团内供应商（0:集团内；1:集团外）
  public BusinessRange: string = "";//对方业务范围
  public RateCode: string = "";//税率在ERP中的标识
  public RateName: string = "";//税率显示名称 
  public RateValue: number = null;//税率值，两位小数
  public Currency: string = "";//币种
  public CurrencyCode: string = "";//币种编码
  public TrackingNumber: string = "";//需求跟踪号
  public PurchaseOrganization = null;//采购组织，根据根据选择的我方主体自动带出
  public PurchaseGroup: string = "";//采购组，默认为默认A01
  public ApproveState: string = '';//提交/草稿/驳回/审批/完成
  public PurchaseForeignAmount: number = 0;//外币总金额
  public PruchaseAmount: number = 0;//未税采购金额统计（采购清单汇总）
  public PruchaseAmountTax: number = 0;//含税采购金额统计（采购清单汇总）
  public VendorTrace=null;//供应商追踪 -1 超期 0无效 1有效
  public PlanSaleTime = null;//预售日期
  public DeliveryLocation: string = '';//国际贸易地点
  public DeliveryCondition: string = '';//国际贸易条件
  public DeliveryPeople: string = '';//收货人
  public paymentterms: string = '';
  public paymenttermscode: string = '';

  public TransportMode: string = '';// 运输方式
  public Discount = 1;// 折扣系数
  public PreDiscountAmount = 0;// 折扣前合计金额（报关总价之和）
  public AfterDiscountAmount = 0;// 折扣后合计金额
     
  public PurchaseOrderDetails: Array<PurchaseOrderDetails> = [];//采购清单
  public PurchaseOrderAccessories: Array<PurchaseOrderAccessory> = [];//附件
}
export class PurchaseOrderDetails {//采购清单-物料信息
  public ID = "00000000-0000-0000-0000-000000000000";
  public MaterialNumber = '';//物料号
  public MaterialDescription = '';//物料描述
  public Count = null;//数量
  public Price = 0;//未税单价
  public Amount = 0;//未税总价
  public StorageLocation = "";//库存地
  public Batch = "";//批次
  public isImport = false;//是否为导入
  public AddTime = new Date;//添加时间
  public PartNo  = null;//PartNo
  public TrackingNumber = "";//需求跟踪号
  public PurchaseOrder_ID = "00000000-0000-0000-0000-000000000000";//采购订单主键
  public MaterialSource = "";//物料来源，当不是BH或PL时 表示采购合同主键
  public PurchaseRequisitionNum = "";//采购申请单号
  public MainContractCode = "";//采购合同号
  public DBOMS_PurchaseRequisitionSaleContract_ID = "";//采购申请、采购合同  关系表主键 ID

  public CostPrice = null;//成本价
  public Discount = null;//系数
  public CustomsPrice = null;//报关单价
  public CustomsPriceAfterDiscount = null;//折扣后报关单价
  public CustomsSumPrice = null;//报关总价
  public CustomsSumPriceAfterDiscount = null;//折扣后报关总价
  public DeliveryStoreLocation = "";// 发货存储地点
  public NAOrderId = null;// ND订单物料明细，对应NA订单号 唯一标识
  public NA_ERPOrderNumber = null;// ND订单物料明细，对应NA订单号
  public ResidualQuantity = null;// 剩余数量

}
export class PurchaseOrderAccessory {//附件
  public AccessoryID = "";
  public AccessoryName: string = "";
  public AccessoryURL: string = "";
  public AccessoryType: string = "";
  public CreatedTime: Date = new Date;
  public CreatedByITcode: string = "";
  public CreatedByName: string = "";
  public InfoStatus = null;
}
/*————————————————————————————————————————————— 以下是需要的其他结构 ————————————————————————————————————————————*/
export class NDOrderMessage {//NA单采购订单-采购信息-数据结构
  public TemplateID = null;//模板id
  public CompanyName: string = "";//公司名称
  public CompanyCode: string = "";//公司代码
  public FactoryCode: string = "";//工厂编号
  public Vendor: string = "";//供应商名称
  public VendorNo: string = "";//供应商代码
  public VendorCountry = 0;//0-国内 1国外(海外供应商)
  public BusinessRange: string = "";//对方业务范围
  public RateCode: string = "";//税率在ERP中的标识
  public RateName: string = "";//税率显示名称 
  public RateValue: number = null;//税率值，两位小数
  public Currency: string = "";//币种
  public CurrencyCode: string = "";//币种编码
  public TrackingNumber: string = "";//需求跟踪号
  public VendorTrace=null;//供应商追踪 -1 超期 0无效 1有效
  public PlanSaleTime = null;//预售日期
  public DeliveryLocation: string = '';//国际贸易地点
  public DeliveryCondition: string = '';//国际贸易条件
  public DeliveryPeople: string = '';//收货人
  public paymentterms: string = '';
  public paymenttermscode: string = '';

  public TransportMode: string = '';// 运输方式
  public Discount = 1;// 折扣系数
  public PreDiscountAmount = 0;// 折扣前合计金额（报关总价之和）
  public AfterDiscountAmount = 0;// 折扣后合计金额
}
export class NDNewPersonElement {//预审人员的 单位信息 (在暂存情况下)
  public UserSettings="[]";//用户信息
  public IsOpened=0;//是否展示
}