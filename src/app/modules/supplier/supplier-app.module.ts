// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { HttpServer } from '../../shared/services/db.http.server';
import { ReactiveFormsModule } from "@angular/forms";

import { SUPPLIER_APP_COMPONENT,SUPPLIER_APP_ENTRY_COMPONENT } from "./index";

import { SupplierRoutingModule } from "./supplier-routing.module";//引入内部路由
import { SupplierService } from "./services/supplier.service";//引入服务
import { SupplierTrackService } from "./services/supplierTrack.service";

import { SupplierPipe } from "./pipes/supplier.pipe";


@NgModule({
  imports: [
    SharedModule,
    SelectModule,
    SupplierRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    SUPPLIER_APP_COMPONENT,
    SupplierPipe
  ],
  entryComponents:[SUPPLIER_APP_ENTRY_COMPONENT],
  providers: [
    HttpServer,
    SupplierService,
    SupplierTrackService
  ]
})
export class SupplierAppModule { }
