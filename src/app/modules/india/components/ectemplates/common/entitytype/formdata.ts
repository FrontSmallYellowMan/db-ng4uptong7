import { ProductDetail } from './producdetail';

export class ElectronicContract {
    BaseData: BaseData = new BaseData();
    ProductDetails: ProductDetail[] = [];
    MultiDeliveryAddress: AccessItem = null;
    Accessories: AccessItem[] = [];
    PaymentDetails: PaymentItem[] = [];
}

export class BaseData {
    EC_Code: string = "";
    SC_Code: string = "";
    DeliveryAddressType: number;
    SellerERPCode: string = "";
    SellerName: string = "";
    PaymentType: string = "";
    PayType_Ticket_TypeID: string = null;
    PayType_Ticket_TypeName: string = "";
    PayType_OP_TicketID: string = null;
    PayType_OP_TicketName: string = "";
    PayType_PP_TicketID: string = null;
    PayType_PP_TicketName: string = "";
    SignedCityCode: string = "";
    SignedCityName: string = "";
    SignedCounty: string = "";        
    Barcode: string = "";
    BuyerName: string = "";
    Brand: string = "";
    Product: string = "";
    DiscountRatio: any;
    DiscountMoney: any;
    TotalMoney: number;
    TotalMoneyUpper: string = "";
    FinalUserName_CN: string = "";
    FinalUserName_EN: string = "";
    FinalUserContact: string = "";
    FinalUserAddress_CN: string = "";
    FinalUserAddress_EN: string = "";
    FinalUserTel: string = "";
    FinalUserFax: string = "";
    FinalUserEmail: string = "";
    RecipientName: string = "";
    RecipientProvinceCode:string;
    RecipientProvinceName:string;
    RecipientCityCode:string;
    RecipientCityName:string;
    RecipientCountyName:string;
    RecipientTheStreet:string;
    TheContactName: string = "";
    TheContactPhone: string = "";
    TheReceivedType: string = "";
    DeliveryTime: string = "";
    PayType_Ticket_Day: string = "";
    PayType_Transfer_Day: string = "";
    PayType_OP_Ratio: string = "";
    PayType_OP_Money: string = "";
    PayType_OP_Day: string = "";
    PayType_PP_Ratio: string = "";
    PayType_PP_Money: string = "";
    PayType_PP_Day: string = "";
    PayType_Full_Day: string = "";
    PayType_OP2_SignDay:string;
    PayType_OP2_Ratio:string;
    PayType_OP2_Money:string;
    PayType_OP2_SendDay:string;
    PayType_Customize: string = "";
    DisputeDealtType: string = "";
    BuyerAddress: string = "";
    BuyerTelephone: string = "";
    BuyerBankName: string = "";
    BuyerBankNo: string = "";
    CreateITCode: string = "";
    CreateName: string = "";
    CreateTime: string = "";
    EditITCode: string = "";
    EditName: string = "";
    EditTime: string = "";
    ContractTime: string = "";
    SellerCompanyCode: string = "";
    SellerAddress: string = "";
    SellerTelephone: string = "";
    SellerBankName: string = "";
    SellerBankNo: string = "";
    TemplateID: string = "";
    ContractType: string = "";
    BuyerERPCode: string = "";
    PaymentTerms: string = "";
    ContractDomain: string = "";
    FinalUserReportNum: string = "";
    TakeDeliveryTypeID: string = "";
    TakeDeliveryTypeName: string = "";
    TakeDeliveryTime: any;
    PayType_Ticket_EffectiveDay: string = "";
    PaymentTypeDesc: string = "";
    DeliveryMode: string = "";
    DeliveryModeDesc: string = "";
    SupplierName :any = "";//原厂商名称 
    SupplierCodeSAP :any = "";//原厂商ID 
    ServiceStartTime :any = "";//服务开始时间
    ServiceEndTime :any = "";//服务结束时间
    Payment_InvoiceTaxRate :any = "";//发票税率 
    PayType_OP_SigDay :any = "";//签定之日起几天内(五付款条款（2）里的（3) 一次性交付，第一个日期)
    PayType_PP_EffectiveDay :any = "";//(本合同生效之日起??日内)
    PayType_OP2_TicketID :any = null;//票据ID
    PayType_OP2_TicketName :any = "";//票据名称
    ServiceAddress: string = "";//服务地址
    ServiceContacts: string = "";//服务联系人
    ContractMoneyPayMode: any = ""; //合同款项支付方式
    Payment_BillDate: any = ""; //付款条款入账日期
    SellerProjectMgr: any = ""; //卖方项目负责人
    SellerRepresentative: any = ""; //卖方代表人
    BuyerRepresentative: any = ""; //买方代表人
    RawManufacturerOrderNo: any = ""; //原厂商订单号
    RelatedService: string = "";//服务内容
    PayType_OP_MoneyOther: any = "";//
    BuyerContractNo: any = "";
}
/** 付款 */
export class PaymentItem{
    SC_Code = "";
    PayTime = "";//付款时间
    TermOfService = "";//服务期限
    PayMoney = "";//付款金额
}

/**
 * 附件信息
 */
export class AccessItem {
    AccessoryID: any = null;//附件id
    AccessoryName: any = null;//附件名称
    AccessoryURL: any = null;//附件访问地址
}

export class SelectInfo{
    CompanyList: Array<any> = [];
    TicketTypeList: Array<any> = [];
    CityList: Array<any> = [];
    CountyList: Array<any> = [];
    Payment: Array<any> = [];
    ReceivingProvinceList:Array<any> = [];
    ReceivingCityList:Array<any> = [];
    ReceivingDistrictList:Array<any> = [];
    TakeDeliveryTypes:Array<any> = [];
    DeliveryMode:Array<any> = [];
}

export class Selected {
    Seller: SelectItem[] = [];//卖方
    PaymentType: SelectItem[] = [];//付款方式
    PayType_Ticket_Type: Array<any> = [];//买方交付的票据类型
    PayType_OP_Ticket: SelectItem[] = [];//OP票据类型
    PayType_PP_Ticket: SelectItem[] = [];//PP票据类型
    City: SelectItem[] = [];//城市
    County: SelectItem[] = [];//市区
    ReceivingProvince: SelectItem[] = [];//收货人省份
    ReceivingCity: SelectItem[] = [];//收货人市
    ReceivingCounty: SelectItem[] = [];//收货人区/县
    TakeDeliveryType: SelectItem[] = [];//提货方式
    DeliveryMode: SelectItem[] = [];//交付与验收
    
}

export class SelectItem{
    id: string = "";
    text: string = "";
    other: string = "";
}

export class ProductRelated{
    Brand: string = "";
    Product: string = "";
    DiscountRatio: string = "";
    DiscountMoney: string = "";
    TotalMoney: number = 0;
    TotalMoneyUpper: string = "";
}

export class BuyerInfo {
    KTOKD: string = "";
    KUNNR: string = "";
    NAME: any = "";
    ORT01: any = "";
}