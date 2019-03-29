
export class DelayInvoice {
    id:number = -1;
    invoiceNum: string = ""; //支票号
    invoiceAmount: string = ""; //支票金额
    customCode: string = ""; //客户代码
    customName: string = ""; //客户名称
    checkoutDate: string = "";//出票日期
    delayEnterDate: string = "";//延期入账时间
    delayDays: number = 0;// 延期天数
    contractNum: string = "";//合同编号
}

export class DelayApply {
    applyId: string = "";
    applyItcode: string = "";
    applyUserName: string = "";
    createDate: string = "";
    applyPhone: string = "";
    applyDept: string = "";
    delayReason: string = "";
    attachmentFileName: string = "";
    deptApprover: string = "";
    riskApprover: string = "";
    riskManagerApprover: string = "";
    flowStatus: number = 0;
}

export class InvoiceSelectPo {
    status: string = "";
    ids: string = "";
    type: string = "";
    applyItcode: string = "";
}