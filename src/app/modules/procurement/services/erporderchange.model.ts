//ERP采购订单修改Model类
export class ErpOrderChange {
    public Id: any = 0;//主键id
    public TrackingNumber: any = "";//需求跟踪号
    public OriginalERPOrderNo: any = "";//原ERP订单号
    public OriginalOrderAmount: any = "";//原订单金额
    public ERPOrderNo: any = "";//订单总金额（修改前）
    public OrderAmount: any = "";//订单总金额（修改后）
    public IsRedInvoice: any = false;//是否采购冲红
    public IsChangeMaterial: any = false;//是否修改物料明细
    public Is2ERP: any = false;//是否创建新的采购订单
    public ItemDescription: any = "";//项目描述
    public OriginalCurrency: any = "";//币种（修改前）
    public OriginalCurrencyCode: any = "";//币种代码（修改前）
    public OriginalFactoryCode: any = "";//工厂代码（修改前）
    public OriginalTaxFileNumber: any = "";//税号（修改前）
    public OriginalVendor: any = "";//供应商（修改前）
    public OriginalVendorNo: any = "";//供应商代码（修改前）
    public OriginalSumNo: any = "";//汇总号（修改前）
    public Currency: any = "";//币种（修改后）
    public CurrencyCode: any = "";//币种代码（修改后）
    public FactoryCode: any = "";//工厂代码（修改后）
    public TaxFileNumber: any = "";//税号（修改后）
    public VendorNo: any = "";//供应商代码（修改后）
    public Vendor: any = "";//供应商（修改后）
    public SumNo: any = "";//汇总号（修改后）
    public WorkFlowInstanceId: any = "";//流程实例ID
    public ApproveState: any = "";//记录状态（0：草稿，1：提交，2：驳回，3：完成）
    public WFApproveUserJSON: any = "";//流程配置信息
    public CurrentApprovalNode: any = "";//当前流程审批节点
    public AddTime: any = "";//添加时间
    public ItCode: any = "";//申请人ItCode
    public UserName: any = "";//申请人
    public BBMC: any = "";//部门
    public SYBMC: any = null;//事业部
    public YWFWDM: any = "";//业务范围代码
    public FlatCode: any = "";// 平台代码
    public COMP_CODE: any = "";//公司代码
    public PURCH_ORG: any = "";//采购组织
    public PUR_GROUP: any = "";//采购组
    public PMNTTRMS: any = "";//付款条款
    public DOC_TYPE: any = "";//采购凭证类型（NA/NB/NK...）
    public ERPOrderChangeNo: any = "";//申请单号

    public ERPOrderChangeMaterialList: Array<ERPOrderChangeMaterial> = [];//物料清单
    public ERPOrderChangeAccessoryList: Array<ERPOrderChangeAccessory> = [];//附件列表
}

//物料明细类
export class ERPOrderChangeMaterial {
    public Id: any = 0;//主键Id
    public ItemNo: any = "";//行项目号 
    public OriginalMaterialNumber: any = "";//物料号（修改前）
    public OriginalMaterialDescription: any = "";//物料描述（修改前）
    public OriginalCount: any = "";//数据量（修改前）
    public OriginalPrice: any = "";//单价（修改前）
    public OriginalStorageLocation: any = "";//库存（修改前）
    public OriginalBatch: any = "";//批次（修改前）
    public OriginalSC_Code: any = "";//销售合同主键（修改前）
    public OriginalMainContractCode: any = "";//销售合同号（修改前）
    public MaterialNumber: any = "";//物料号（修改后）
    public MaterialDescription: any = "";//物料描述（修改后）
    public Count: any = "";//数量（修改后）
    public Price: any = "";//单价（修改后）
    public StorageLocation: any = "";//库存地（修改后）
    public Batch: any = "";//批次（修改后）
    public SC_Code: any = "";//销售合同主键(修改后)
    public MainContractCode: any = "";//销售合同号(修改后)
    public AddTime: any = "";//添加时间
    public DBOMS_ERPOrderChange_ID: any = "";//ERP订单修改外键
    public SortNum: any = "";//排序权值
    public IsNew: any = false;//本行是否是新增物料(0：否，1：是)
    public IsDeleted: any = false;//本行是否已被删除(0：否，1：是)
    public IsChanged: any = false;//是否被修改(0：否，1：是)
    public PurchaseForeignId: any = "";//采购模块物料明细（采购申请物料明细表<purchaserequisitionid>/采购订单物料明细表<PurchaseOrder_ID>）外键
    public TrackingNo: any = "";//ERP跟踪号
}

//附件
export class ERPOrderChangeAccessory {
    public AccessoryID = "";
    public AccessoryName: string = "";
    public AccessoryURL: string = "";
    public AccessoryType: string = "";
    public CreatedTime: Date = new Date;
    public CreatedByITcode: string = "";
    public CreatedByName: string = "";
    public InfoStatus = null;
}

