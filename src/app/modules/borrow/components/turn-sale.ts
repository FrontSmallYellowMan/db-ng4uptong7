import { UnclearMaterialItem } from './common/borrow-entitys';
export class BorrowTurnSales {
    public turnSalesId: string;
    public mainApplyNo: string;
    public reservationNo: string;//预留号
    public applyItCode: string;//申请人ItCode
    public applyUserName: string;//申请人姓名
    public applyUserNo: string;//申请人编号
    public contactPhone: string;//联系方式
    public baseDeptName: string;//本部
    public subDeptName: string;//事业部
    public platformCode: string;//平台编码
    public platformName: string;//平台名称
    public businessScope: string;//业务范围
    public factory: string;//工厂
    public borrowCustomerName: string;//借用客户名称
    public deliveryNo: string;//交货单号
    public totalAmount: string;//
    public salesMemo: string;//销售说明
    public inventory: string;//库存地
    public applyDate: Date;//申请日期
    public voucherNo1?: string;//凭证号1
    public voucherNo2?: string;//凭证号2
    public flowCurrNodeName?: string;//当前环节
    public CurrApprAuthors?: string;//当前处理人
    public flowStatus?: number;//申请单状态
    public operatingBorrow: number;//经营性借用
    public instId?: string;
}
export class BorrowTurnSalesPo {
    borrowTurnSales: BorrowTurnSales = new BorrowTurnSales();
    turnSalesMaterialItemList: Array<UnclearMaterialItem> = [];
}