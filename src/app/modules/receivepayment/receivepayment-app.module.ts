import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { MyarrearslistService } from "./service/rp-myarrears.service";
import { ReceivePaymentRoutingModule } from "./receivepayment-routing.module";
import { ReceivePayment_APP_COMPONENT, ReceivePayment_APP_ENTRY_COMPONENT } from "./components/index";
import { MyreceivepaymentlistService } from "./service/rp-myreceivepaymentlist.service";
import { FollowuplistService } from "./service/rp-followup.service";

@NgModule({
    imports: [
        SharedModule,
        ReceivePaymentRoutingModule
    ],
    declarations: [ReceivePayment_APP_COMPONENT],
    entryComponents:[ReceivePayment_APP_ENTRY_COMPONENT],
    providers: [MyarrearslistService,MyreceivepaymentlistService, FollowuplistService]
})
export class ReceivePaymentAppModule { }
