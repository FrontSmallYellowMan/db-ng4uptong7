// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
// import {SelectModule} from 'ng2-select';
import { Contpl_APP_COMPONENT } from './index';
import { HttpServer } from '../../shared/services/db.http.server';
import { ContplRoutingModule } from './contpl-routing.module';
// import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
    imports: [
        SharedModule,
        ContplRoutingModule
    ],
    declarations: [
        Contpl_APP_COMPONENT
    ],
    providers: [ HttpServer ]
})
export class ContplAppModule { }
