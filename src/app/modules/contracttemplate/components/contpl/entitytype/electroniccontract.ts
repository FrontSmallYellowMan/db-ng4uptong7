import { ProductDetail } from './producdetail';

export class ElectronicContract {
    constructor(
        public BaseData: BaseData,
        public ProductDetails: ProductDetail[],
        public MultiDeliveryAddress: Access,
        public Accessories: Access[]
    ) { }
}

export class BaseData {
    constructor(
        public EC_Code: string,
        public SC_Code: string,
        public DeliveryAddressType: number,
        public SellerERPCode: string,
        public SellerName: string,
        public PaymentType: string,
        public PayType_Ticket_TypeID: string,
        public PayType_Ticket_TypeName: string,
        public PayType_OP_TicketID: string,
        public PayType_OP_TicketName: string,
        public PayType_PP_TicketID: string,
        public PayType_PP_TicketName: string,
        public SignedCityCode: string,
        public SignedCityName: string,
        public SignedCounty: string,        
        public Barcode: string,
        public BuyerName: string,
        public Brand: string,
        public Product: string,
        public DiscountRatio: any,
        public DiscountMoney: any,
        public TotalMoney: number,
        public TotalMoneyUpper: string,
        public FinalUserName_CN: string,
        public FinalUserName_EN: string,
        public FinalUserContact: string,
        public FinalUserAddress_CN: string,
        public FinalUserAddress_EN: string,
        public FinalUserTel: string,
        public FinalUserFax: string,
        public FinalUserEmail: string,
        public RecipientName: string,
        //public RecipientAddress: string,
        public RecipientProvinceCode:string,
        public RecipientProvinceName:string,
        public RecipientCityCode:string,
        public RecipientCityName:string,
        public RecipientCountyName:string,
        public RecipientTheStreet:string,
        public TheContactName: string,
        public TheContactPhone: string,
        public TheReceivedType: string,
        public DeliveryTime: string,
        public PayType_Ticket_Day: string,
        public PayType_Transfer_Day: string,
        public PayType_OP_Ratio: string,
        public PayType_OP_Money: string,
        public PayType_OP_Day: string,
        public PayType_PP_Ratio: string,
        public PayType_PP_Money: string,
        public PayType_PP_Day: string,
        public PayType_Full_Day: string,
        public PayType_OP2_SignDay:string,
        public PayType_OP2_Ratio:string,
        public PayType_OP2_Money:string,
        public PayType_OP2_SendDay:string,
        public PayType_Customize: string,
        public DisputeDealtType: string,
        public BuyerAddress: string,
        public BuyerTelephone: string,
        public BuyerBankName: string,
        public BuyerBankNo: string,
        public CreateITCode: string,
        public CreateName: string,
        public CreateTime: string,
        public EditITCode: string,
        public EditName: string,
        public EditTime: string,
        public ContractTime: string,
        public SellerCompanyCode: string,
        public SellerAddress: string,
        public SellerTelephone: string,
        public SellerBankName: string,
        public SellerBankNo: string,
        
    ) { }
}

export class Access{
    constructor(
        public AccessoryID: string,
        public AccessoryName: string,
        public AccessoryURL: string
    ){}
}

export class SelectInfo{
    constructor(
        public CompanyList: Array<any>,
        public TicketTypeList: Array<any>,
        public CityList: Array<any>,
        public CountyList: Array<any>,
        public Payment: Array<any> ,
        public ReceivingProvinceList:Array<any>,
        public ReceivingCityList:Array<any>,
        public ReceivingDistrictList:Array<any>
    ){}
}

export class Selected {
    constructor(
        public Seller: SelectItem[],//卖方
        public PaymentType: SelectItem[],//付款方式
        public PayType_Ticket_Type: SelectItem[],//买方交付的票据类型
        public PayType_OP_Ticket: SelectItem[],//OP票据类型
        public PayType_PP_Ticket: SelectItem[],//PP票据类型
        public City: SelectItem[],//城市
        public County: SelectItem[],//市区
        public ReceivingProvince: SelectItem[],//收货人省份
        public ReceivingCity: SelectItem[],//收货人市
        public ReceivingCounty: SelectItem[]//收货人区/县
    ){}
}

export class SellerInfo{
    constructor(
        // public CompanyName: string,
        // public CompanyAddress: string,
        // public Tel: string,
        // public Bank: string,
        // public BankAccount: string  
    ){}
}

export class SelectItem{
    constructor(
        public id: string,
        public text: string,
        public other?: string
    ){}
}

export class ProductRelated{
    constructor(
        public Brand: string,
        public Product: string,
        public DiscountRatio: string,
        public DiscountMoney: string,
        public TotalMoney: number,
        public TotalMoneyUpper: string
    ){}
}

export class BuyerInfo{
    constructor(
        public KTOKD: string,
        public KUNNR: string,
        public NAME: any,
        public ORT01: any
    ){}
}