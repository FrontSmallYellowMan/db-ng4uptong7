// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { HttpServer } from '../../shared/services/db.http.server';

import { Pipeline_App_Component } from "./index";

// 引入服务
import { PipelineService } from './services/pipeline.service';

import { PipelineRoutingModule } from "./pipeline-routing.module";//引入内部路由
// 管道
import { PipelinePipe } from './pipes/pipeline.pipe'



@NgModule({
  imports: [
    SharedModule,
    SelectModule,
    PipelineRoutingModule,
    //ReactiveFormsModule
  ],
  declarations: [
    Pipeline_App_Component,
    PipelinePipe
  ],
  entryComponents:[ Pipeline_App_Component ],
  providers: [
    HttpServer,
    PipelineService
  ]
})
export class PipelineAppModule { }