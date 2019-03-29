// Angular Imports
import { NgModule } from '@angular/core';
import { BillRoutingModule } from './bill-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { BILL_APP_COMPONENT } from './index';
import { tabService } from './components/writeback/bill-detail/service/tab.service';
import { HttpServer } from '../../shared/services/db.http.server';
import { billBackService } from './services/bill-back.service';
@NgModule({
    imports: [
        SharedModule,
        BillRoutingModule,
        SelectModule
    ],
    declarations: [
        BILL_APP_COMPONENT,
    ],
    providers: [billBackService, tabService, HttpServer]
})
export class BillAppModule { }
