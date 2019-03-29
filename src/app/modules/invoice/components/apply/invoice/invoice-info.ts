export  class InvoiceInfo{//支票申请表单
    public id:string;//主键id
    public saveStatus:number;//保存状态:0未保存，1保存
    public applyItcode :string;//申请人itcode
    public applyUserName:string;//申请人姓名
    public applyPhone :string;//申请人联系电话
    public createDate: string;//申请日期
    public platformCode :string;//接收平台代码
    public platformName:string;//接收平台名称
    public isPawnTicket :string;//是否押票:0：否；1：是
    public ticketNum :string;//支票号
    public checkoutDate :any;//出票日期
    public ticketAmount :number;//支票金额
    public checkoutAccount :string;//出票人账号
    public checkoutBank :string;//出票银行
    public payee :string;//收款人
    public payeeName :string;
    public customCode :string;//客户代码
    public customName :string;//客户名称
    public contractNum :string;//合同编号
    public debtAmount :number;//欠款金额
    public businessname:string;//商务接口人
    public businessItcode:string;//商务接口人
    public invoiceStatus:number;
    public statusName:string;
    public success:boolean;//是否提交
    public num:number;//序号
    public checked:boolean;//是否选择
    public ERPCode :string;
    public lastModifiedDate:Date;
    public nextApprove:string;
    public yan:string;//“延期”字样标识 0：正在审批，1：审批结束

}

export class UserInfo{//登录人信息
    public itcode :string;
    public name :string;
    public mobile :string;
    public plantFormCode :string;
    public plantFormName :string;
    public depName:string;//本部名称
}

export class RestInfo{//返回值信息
   public success: boolean;
   public message: string;
   public status: number;
}

export class Query{//查询参数
    public keyWords: string;
    public pageSize: number;
    public pageNo: number;
    public startDate: any;
    public endDate: any;
    public invoiceStatus:string;
    public tradeStatus: string;
    public payee:string;
    public businessItcode:string;
}

export  class TradeTicketInfo{//商票申请表单
    public id:string;//主键id
    public saveStatus:number;//保存状态:0未保存，1保存
    public applyItcode :string;//申请人itcode
    public applyUsername:string;//申请人姓名
    public applyPhone :string;//申请人联系电话
    public createDate: string;//申请日期
	public applyDeptcode: string; //部门代码
	public applyDeptname: string; //部门名称
	public platformCode: string ; //平台编码
	public platformName: string ; //平台名称
	public businessScope: string ;//业务代码 
	public payee: string ; //欠款公司
    public payeeName: string;
	public payer :string ; //付款人
	public tradeNumber: string ; //商票号
	public tradeAmount: number ; //商票金额
	public checkoutDate: any ; //出票日期
	public remark: string ; //备注
	public customCode: string ; //客户代码
	public customName: string ; //客户名称
	public debtAmount: number;//欠款金额
	public systicketNum: string;//系统发票号
	public voucherNum: string;//核销凭证号
	public voucherAmount: number;//核销金额
	public contractNum:string;//合同编号
	public contractAmount:number;//合同总金额
    public businessname:string;//商务接口人
    public businessItcode:string;//商务接口人
	public approveItcode: string;//审批人Itcode
    public bankName: string;//
    public bankNumber: string;//
    public accType: string;//
	public approveName: string;//审批人姓名
	public tradeStatus: number;//商票状态
    public statusName:string;//状态名称
    public success:boolean;//是否提交
    public num:number;//序号
    public checked:boolean;//是否选择
    public ERPCode :string;
    public lastModifiedDate:Date;
    public nextApprove:string;

}

export class InvoiceQueryPo {//支票交存查询参数封装实体
    public invoiceStatus: string;
    public param: string;
    public startDate: string;
    public endDate: string;
    public businessItcode: string;
    public payee: string;
}