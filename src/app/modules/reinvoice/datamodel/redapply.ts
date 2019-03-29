 /**
 * 申请页面表单数据模型
 */
export class ApplyData {
    apply: Apply = new Apply();
    accessory: Array<Accessory> = [];
    invoice: Array<Invoice> = [];
    material: Array<Material> = [];
    defaultordertype: any = {};
}

 /**
 * 申请信息(基本信息)
 */
export class Apply {
    applyId :any = 0;//申请id
    proposer :any = "";//申请人
    ITCode :any = "";//申请人ITCode
    company :any = "";//公司
    companycode :any = "";//公司代码
    applydate :any = "";//申请日期
    phone :any = "";//电话
    costcenter :any = "";//成本中心
    biz :any = "";//业务范围
    bizcode :any = "";//业务范围编码
    invoicetype :any = "";//发票类型
    invoicetypecode :any = "";//发票类型编码
    platform :any = "";//所属平台
    platformcode :any = "";//平台编码
    revisetype :any = "";//冲红类型
    revisetypecode :any = "";//冲红类型编码
    subrevisetype :any = JSON.stringify([]);//[{\subtypecode\:\201\\subtype\:\合同约定\}{\subtypecode\:\202\\subtype\:\商务手误\}]
    subrevisetypecode :any = "";//
    reason :any = "";//申请原因
    checkbill :any = "";//检查项目
    outerpackagecheck :any = "";//外包装检查
    appearancecheck :any = "";//机器外观检查
    electroniccheck :any = "";//电性能检查
    attachmentcheck :any = "";//附件检查
    checkconlusion :any = "";//质检结论
    checkremark :any = "";//质检备注
    homepickup :any = 0;//是否上门取货
    transittype :any = "";//运输类型
    // applystatus :any = "";//弃用
    wfId :any = "{00000000-0000-0000-0000-000000000000}";//流程id
    wfstatus :any = "草稿";//草稿
    applyno :any = "";//申请单号
    applytype:any = 0;//0-冲红申请 1-退换货申请
    ApproveUsers: any = new ApproveUsers();;//审批人信息
}
/**
 * 附件信息
 */
export class Accessory {
    AccessoryID:any = "";//附件id
    AccessoryName:any = "";//附件名称
    AccessoryURL:any = "";//附件访问地址
}
/**
 * 财务信息
 */
export class Invoice {
    invoiceId: any = 0;//财务信息id;
    applyId: any = 0;//申请id;
    originalcustomercode: any = "";//客户编号;
    originalcustomer: any = "";//客户名称;
    orderno: any = "";//订单号;
    internalinvoiceno: any = "";//系统发票号;
    externalinvoiceno: any = "";//外部发票号;
    invoicedate: any = "";//原发票日期;
    originalmoney: any = "";//原金额;
    originalreceiptdate: any = "";//原收付基准日;
    originalcomplexaccount: any = "";//原清账号;
    money: any = "";//新金额;
    customercode: any = "";//冲红后客户编号;
    customer: any = "";//冲红后客户名称;
    receiptdate: any = -1;//冲红后付款账期-1: 请选择， 0：是，1：否
    AccountantRedNoticeNo:any = "";//财务发票岗红字通知单号
    Is2ERP:any = "[]";//是否写入ERP [{groupno:"-1", isERP: ["on","off"]}]
    ReturnSellFactory:any = "";//是否退入销售平台工厂
    complexaccout: any = "";//冲红后清账号;
    rednoticeno: any = "";//红字通知单号;
    ZCRorderno: any = "";//ZCR订单号;
    ZDRorderno: any = "";//ZDR订单号;
    REorderno: any = "";//RE订单号;
    REdeliveryno: any = "";//RE交货单号;
    ZTYorderno: any = "";//ZTY订单号;
    ZTYdeliveryno: any = "";//ZTY交货档单号;
    ZREorderno: any = "";//ZRE订单号;
    ZREdeliveryno: any = "";//ZRE交货单号;
    ZSDorderno: any = "";//ZSD订单号;
    ZSDdeliveryno: any = "";//ZSD交货单号;
    ZORorderno: any = "";//ZOR订单号;
    ZORdeliveryno: any = "";//ZOR交货单号;
    OrtherOrder: any = "";//其他单号;
    PURCH_NO_C: any = "";//PO号;	
    seller: any = "";//销售员;
    sellercode: any = "";//销售员编号;
    SALES_ORG: any = "";//销售组织;
    DISTR_CHAN: any = "";//分销渠道;
    DIVISION: any = "";//部门产品组;
    PRICE_DATE: any = "";//定价日期;
    PMNTTRMS: any = "";//付款条款;
    SALES_OFF: any = "";//销售办公室;
    SALES_GRP: any = "";//销售小组;
    SHIP_TYPE: any = "";//装运类型;
    TransitMode: any = "";//运输方式;
    TransitModeCode: any = "";//运输方式编码;
    SDF_KUNNR: any = "";//送达方编码;
    SDF_NAME: any = "";//收货单位;
    detailaddress: any = "";//收货地址;
    province: any = "";//省份;
    city: any = "";//城市;
    citycode: any = "";//城市代码;
    district: any = "";//区县;
    zipcode: any = "";//邮编;
    connecter: any = "";//联系人;
    phone: any = "";//电话;
    signstandard: any = "";//签收标准;
    AUART: any = "";//订单类型;
    ZTERM: any = "";//帐期代码
}
/**
 * 冲退明细
 */
export class Material {
    materialId: any = 0;//物料id
    invoiceId: any = 0;//财务信息Id
    internalinvoiceno: any = "";//系统发票号
    projcode: any = "";//行项目号
    originalmaterialcode: any = "";//原物料号
    materialcode: any = "";//新物料号
    originaldescription: any = "";//原物料描述
    description: any = "";//新物料描述
    num: any = "";//数量
    originalnum: any = "";//原单数量
    factory: any = "";//工厂
    originalstoragelocation: any = "";//原库存地
    storagelocation: any = "";//新库存地
    originalbatchno: any = "";//原批次
    batchno: any = "";//新批次\\要求发货批次
    originalmoney: any = null;//原金额
    money: any = null;//新金额
    originalbackmoney: any = null;//原返款金额
    backmoney: any = null;//新返款金额
    returnnum: any = 0;//退货数量
    returnstoragelocation: any = "";//退入库存地
    specifystoragelocation: any = "";//要求发货库存地
    deliveryno: any = "";//交货单号
    ordertype: any = "";//订单类型
    groupno: any = 0;//明细组别（0(申请)-1(虚退)1(虚出第一组)2(虚出第二组)
    ERPorderno: any = "";//写入EPR后返回的单据号
    CURRENCY: any = "";//币种编号
    invoiceremark: any = "";//发票备注
    isDiffMaterialDescription?: boolean = false;//冲成本类型时  新旧物料描述是否一致
}

/**
 * 下拉框数据源
 */
export class BaseDataSource {
    companys: any = [];//公司
    businesses: any = [];//业务范围
    invoicetypes: any = [];//发票类型
    platforms: any = [];//平台
    redtypes: any = [];//冲红类型
    returntypes: any = [];//退换货
    transitmodes: any = [];//运输方式
}
/**
 * 冲退明细  前端组件数据结构
 */
export class MaterialList {
    // valid: boolean = true;//tableList中必填项是否填写
    internalinvoiceno: any = "";//系统发票号
    active: boolean = false;//是否当前项
    isBeyond?: boolean = false;//冲成本、物料号类型时  新返款金额是否超出新销售总额（总计）
    originalMoneyTotalAmount: any = 0;//原销售金额  总计
    moneyTotalAmount: any = 0;//新销售金额  总计
    originalBackMoneyTotalAmount: any = 0;//原返款金额  总计
    backMoneyTotalAmount: any = 0;//新返款金额  总计
    // TransitMode: any = "";
    // TransitModeCode: any = "";
    tableList: Material[] = [];//表格数据
    // detailaddress: any = {};//临时地址选中项
    // temporaryAddressDataSource: TemporaryAddress[] = [];//临时地址
}
/**
 * 冲退明细  商务审批 写入erp结构
 */
export class SaveToERPData {
    active: boolean = false;//是否当前项
    hasSaveToERPXuchu: boolean = false;//xuchu 是否已经写入erp并产生订单号
    hasSaveToERPXutui: boolean = false;//xutui 是否已经写入erp并产生订单号
    invoice: Invoice = null;//发票信息
    group: Group[] = [];//物料组信息
    returnsellfactory: any = "";//退入销售平台工厂
    materialSubType: any = 4;//1-退货-服务 2-退货-全单实物 3-退货-部分实物 4-其他
    // detailaddress: any = {};//临时地址选中项
    // temporaryAddressDataSource: TemporaryAddress[] = [];//临时地址
}
/**
 * 商务审批 物料组信息
 */
export class Group {
    groupno: any = "1";//明细组别（0(申请)-1(虚退)1(虚出第一组)2(虚出第二组),
    ordertype: any = "";//订单类型
    rednoticeno: any = "";//红字通知单号
    invoiceremark: any = "";//发票备注
    hasERP: any = false;//是否写入erp
    isERP: any = ["off","off"];//是否写入erp
    isShowDelMaterTab: boolean = false;//是否显示删除订单按钮
    material: Material[] = [];//物料数据
    temporaryAddressDataSource: TemporaryAddress[] = [];//临时地址
}
/**
 * 附件信息
 */
export class AccessItem {
    AccessoryID: any = null;//附件id
    AccessoryName: any = null;//附件名称
    AccessoryURL: any = null;//附件访问地址
}
/**
 * 临时地址
 */
export class TemporaryAddress {
    "active": boolean = false;//是否选中项
    "SDF_NAME": any = "";//收货单位"
    "detailaddress": any = "";//收货地址"
    "province": any = "";//省份"
    "provincecode": any = "";//省份编码
    "city": any = "";//城市"
    "citycode": any = "";//城市代码"
    "district": any = "";//区县"
    "zipcode": any = "";//邮编"
    "connecter": any = "";//联系人"
    "phone": any = "";//电话"
    "signstandard": any = "";//签收标准"
}
/**审批人信息 */
export class ApproveUsers{
    bizDivision:any = [];
    bizDivisionFirst:any = [];
    bizDivisionSecond:any = [];
}