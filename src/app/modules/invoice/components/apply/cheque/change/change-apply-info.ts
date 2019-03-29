export class ChangeApplyInfo{
   invoiceApplyId:string;//旧支票ID
   oldTicketNumber:string;//旧支票号
   newTicketNumber:string;//新支票号
   newCheckoutDate:string;//新支票到期日
   newCheckoutAccount:string;//新出票人账号
   newCheckoutBank:string;//新出票人银行
   newTicketAmount:number;//新支票金额
   ticketAmount:string;//原支票金额
   checkoutDate:string;//原支票到期日
   payee:string;//公司代码
   payeeName:string;//公司名称
   customCode:string;//客户编码
   customName:string;//客户名称
}