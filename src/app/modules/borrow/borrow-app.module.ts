// Angular Imports
import { NgModule } from '@angular/core';
import { BorrowRoutingModule } from './borrow-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { BORROW_APP_COMPONENT,BORROW_APP_ENTRY_COMPONENT } from './index';
import { HttpServer } from '../../shared/services/db.http.server';
import { SHARED_PROVIDERS } from './services/index';

@NgModule({
    imports: [
        SharedModule,
        BorrowRoutingModule,
        SelectModule
    ],
    declarations: [
        BORROW_APP_COMPONENT
    ],
    entryComponents:[BORROW_APP_ENTRY_COMPONENT],
    providers: [//服务
        SHARED_PROVIDERS,HttpServer
    ]
})
export class BorrowAppModule { }
