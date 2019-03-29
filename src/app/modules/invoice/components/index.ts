import { InvoiceNavComponent } from './layout/nav/invoice-nav.component';
import { InvoiceListComponent } from './list/invoice/invoice-list.component';
import { InvoiceDelayApplyListComponent } from './list/invoicedelaylist/invoice-delay-apply-list.component';
import { RevokedApplyComponent } from './apply/cheque/revoked/revoked-apply.component';
import { RevokedListComponent } from './list/cheque/revoked/revoked-list.component';
import { InvoiceCommonListComponent } from './common/invoice-common-list.component';
import { ChangeTicketApplyComponent } from './apply/cheque/change/change-ticket-apply.component';
import { ChangeTicketListComponent } from './list/cheque/change/change-ticketList.component';
import { InvoiceApplyComponent } from './apply/invoice/invoice-apply.component';
import { RevokedApproveComponent } from './approve/cheque/revoked/revoked-approve.component';
import { InvoiceDelayApplyComponent } from './apply/cheque/delay/delay-apply.component';
import { InvoiceApproveListComponent } from "./approve/invoice/invoice-approve-list.component";
import { ApplyCommonComponent } from './apply/cheque/delay/apply-common.component';
import { InvoiceApproveEditComponent } from "./approve/invoice/editForm/invoice-approve-edit.component";
import { InvoiceDetailComponent } from "./detail/invoice-detail.component";
import { ChangeTicketApproveComponent } from "./approve/cheque/change/change-ticket-approve.component";
import { WfapprovalComponent } from  "./common/wfapproval/wfapproval.component";
import { ErrorTipMessageComponent } from "./common/error-tip-message.component";
import { TakebackApplyComponent } from "./apply/takeback/takeback-apply.component";
import { TakebackListComponent } from "./list/takeback/takeback-list.component"
import { PayeeQueryComponent } from "./apply/invoice/payeequery/payee-query.component";
import { CustomQueryComponent } from "./apply/invoice/customquery/custom-query.component";
import { ContractQueryComponent } from "./apply/invoice/contractquery/contract-query.component";
import { TakebackAddComponent } from "./apply/takeback/addform/takeback-add.component";
import { TakebackApproveComponent } from "./approve/takeback/takeback-approve.component";
import { DebtQueryComponent } from "./apply/invoice/debtquery/debt-query.component";
import { TradeTicketListComponent } from "./list/tradeticket/tradeticket-list.component";
import { TradeticketApplyComponent } from "./apply/tradeticket/tradeticket-apply.component";
import { TradeTicketApproveListComponent } from "./approve/tradeticket/tradeticket-approve-list.component";
import { TradeTicketDetailComponent } from "./detail/tradeticket/tradeticket-detail.component";
import { TradeTicketApproveEditComponent } from "./approve/tradeticket/editForm/tradeticket-approve-edit.component";
import { TakebackDetailComponent } from "./detail/takeback/takeback-detail.component"; 
import { InvoiceStatusListComponent } from "./list/invoicestatuslist/invoice-status-list.component";

export {
    WfapprovalComponent,
    RevokedApproveComponent,
    InvoiceNavComponent, InvoiceListComponent,
    InvoiceDelayApplyListComponent,
    RevokedApplyComponent,
    RevokedListComponent,
    InvoiceCommonListComponent,
    ChangeTicketApplyComponent,
    ChangeTicketListComponent,
    InvoiceApplyComponent,
    InvoiceDelayApplyComponent,
    InvoiceApproveListComponent,
    ApplyCommonComponent,
    ChangeTicketApproveComponent,
    ErrorTipMessageComponent,
    TakebackListComponent,
    TakebackApplyComponent,
    TakebackAddComponent,
    TakebackApproveComponent,
    DebtQueryComponent,
    TradeTicketListComponent,
    TradeticketApplyComponent,
    InvoiceDetailComponent,
    TradeTicketApproveListComponent,
    TradeTicketDetailComponent,
    InvoiceApproveEditComponent,
    TradeTicketApproveEditComponent,
    TakebackDetailComponent,
    InvoiceStatusListComponent
};

export let INVOICE_LR_COMPONENT = [//左侧模块内部列表
    InvoiceNavComponent, InvoiceListComponent, InvoiceDelayApplyListComponent,
    RevokedListComponent,
    ChangeTicketListComponent, InvoiceApproveListComponent,TakebackListComponent,
    TradeTicketListComponent,TradeTicketApproveListComponent,InvoiceStatusListComponent

];
export let INVOICE_APP_ENTRY_COMPONENT = [//borrow模块entryComponents
    InvoiceCommonListComponent, 
    ErrorTipMessageComponent,PayeeQueryComponent,
    CustomQueryComponent,ContractQueryComponent,DebtQueryComponent,TakebackAddComponent
];
export let INVOICE_APP_COMPONENT = [//borrow模块内部列表
WfapprovalComponent,
    RevokedApproveComponent,
    RevokedApplyComponent,
    InvoiceCommonListComponent,
    ChangeTicketApplyComponent,
    InvoiceApplyComponent,
    InvoiceDelayApplyComponent,
    ApplyCommonComponent,
    InvoiceApproveEditComponent,
    InvoiceDetailComponent,
    ChangeTicketApproveComponent,
    ErrorTipMessageComponent,
    TakebackApplyComponent,
    PayeeQueryComponent,
    CustomQueryComponent,
    ContractQueryComponent,
    DebtQueryComponent,
    TakebackAddComponent,
    TakebackApproveComponent,
    TradeticketApplyComponent,
    TradeTicketDetailComponent,
    TradeTicketApproveEditComponent,
    TakebackDetailComponent
];
