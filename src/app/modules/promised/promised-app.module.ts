// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { HttpServer } from '../../shared/services/db.http.server';
import { ReactiveFormsModule } from "@angular/forms";
import { TimeDifferenceDirective } from "./directives/time-difference.directive";

import { SUPPLIER_APP_COMPONENT,SUPPLIER_APP_ENTRY_COMPONENT } from "./index";

import { PromisedRoutingModule } from "./promised-routing.module";//引入内部路由
 import { HUAWEIPrommisedService } from "./services/HUAWEIPromised.service";//引入服务
import { DCGPromiseService } from './services/DCGPromised.service';
// import { SupplierTrackService } from "./services/supplierTrack.service";
// import { CommunicateService } from './services/communicate.service';

// import { SupplierPipe } from "./pipes/supplier.pipe";


@NgModule({
  imports: [
    SharedModule,
    SelectModule,
    PromisedRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    SUPPLIER_APP_COMPONENT,
    TimeDifferenceDirective
  ],
  entryComponents:[SUPPLIER_APP_ENTRY_COMPONENT],
  providers: [
    HttpServer,
    HUAWEIPrommisedService,
    DCGPromiseService
  ]
})
export class PromisedAppModule { }
