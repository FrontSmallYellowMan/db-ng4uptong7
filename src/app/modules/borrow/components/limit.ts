//借用金额申请实体
export class BorrowAmount{
    id:string;
    applyDimension: string;
    applyItCode: string;
    applyReason: string;
    applyUserName: string;
    applyUserNo: string;
    applyUserTel: string;
    currentAmount: number;
    deptName: string;//事业部名称
    baseDeptName:string;//本部名称
    platformCode: string;
    platformName: string;
    usedAmount: number;
    flowCurrNodeName:string;
    applyNo:string;
    applyDate:string;
    businessScope?:string;
    instId?:string;
    num?:number;
    flowStatus?:number;
    currApprAuthors?:string;//当前环节处理人
}
//事业部本部业务范围实体
export class BorrowAmountBusinessScope{
    borrowAmountId:string;
    businessScopeCode:string;
    businessScopeName:string;
    setAmount:number;
}
//借用金额申请单实体
export class BorrowAmountPo{
    mainData:BorrowAmount;
    subData:BorrowAmountBusinessScope[];
}
//额度使用记录实体
export class LimitUsedLog{
  applyId:string;//申请单实体Id
  applyNo:string;//申请单号
  applyDate:Date;//申请日期
  applyItcode:string;//申请人
  applyUserName:string;//申请人姓名
  applyType:string;//申请单类型
  currentNodeName:string;//当前环节
  applyAmount:number;//已使用额度
  totalAmount:number;//当前常规额度
}