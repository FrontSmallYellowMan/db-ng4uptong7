// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { HttpServer } from '../../shared/services/db.http.server';

import { Rebate_App_Component, Rebate_Entry_Component } from "./index";

// 引入服务
import { RebateService } from './services/facturer_rebate.service';

import { RebateRoutingModule } from "./facturer_rebate-routing.module";//引入内部路由
// 管道
import { RebatePipe } from './pipes/facturer_rebate.pipe'



@NgModule({
  imports: [
    SharedModule,
    SelectModule,
    RebateRoutingModule,
    //ReactiveFormsModule
  ],
  declarations: [
    Rebate_App_Component,
    RebatePipe
  ],
  entryComponents:[ Rebate_App_Component, Rebate_Entry_Component ],
  providers: [
    HttpServer,
    RebateService
  ]
})
export class RebateAppModule { }