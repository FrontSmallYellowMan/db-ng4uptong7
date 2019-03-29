import { FactoryProvider } from "@angular/core";
import { Http } from '@angular/http';

import { InvoiceApplyService } from './invoice/invoice-apply.service';
import { InvoiceApproveService } from "./invoice/invoice-approve.service";
import { InvoiceChangeService } from "./invoice/invoice-change.service";
import { InvoiceTakebackService } from "./invoice/invoice-takeback.service";
import { TradeTicketService } from "./tradeticket/tradeticket-apply.service";

// export { FiscalAdjustService };


export let INVOICE_SERVICE = [InvoiceApplyService, InvoiceApproveService, InvoiceChangeService,InvoiceTakebackService,TradeTicketService];