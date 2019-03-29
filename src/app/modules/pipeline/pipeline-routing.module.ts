import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    PipelineAppComponent,
    PipelineList,
    PipelineNew_Edit,
    PipelineScan,
    PipelineIndex
} from './index';

 const pipelineRoutes: Routes = [
    {
      path: '', component: PipelineAppComponent,
      children: [ // 首页
        { path: '', redirectTo: 'pipeline-index' },
        { 
          path: 'pipeline-index',
          data: { "breadcrumb": "" },
          component: PipelineIndex,
          children: [
            { path: '', redirectTo: 'pipeline-list' },
            { path: 'pipeline-list', data: { "breadcrumb": "" }, component: PipelineList } //列表页面
          ]
        },
        { path: 'pipeline-new', data: { "breadcrumb": "" }, component: PipelineNew_Edit },
        { path: 'pipeline-edit', data: { "breadcrumb": "" }, component: PipelineNew_Edit },
        { path: 'pipeline-scan', data: { "breadcrumb": "" }, component: PipelineScan }
      ]
    }
 ];

@NgModule({
    imports: [RouterModule.forChild(pipelineRoutes)],
    exports: [RouterModule]
})

export class PipelineRoutingModule { };
