import { NgModule } from '@angular/core';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import {INVOICE_APP_COMPONENT,INVOICE_SERVICE,INVOICE_APP_ENTRY_COMPONENT  } from './index';


@NgModule({
    imports: [
        SharedModule,
        InvoiceRoutingModule,
        SelectModule
    ],
    declarations: [
        INVOICE_APP_COMPONENT
    ],
    entryComponents:[
        INVOICE_APP_ENTRY_COMPONENT
        ],
    providers: [//服务
         INVOICE_SERVICE
    ],
    bootstrap: []
})



export class InvoiceAppModule{


}