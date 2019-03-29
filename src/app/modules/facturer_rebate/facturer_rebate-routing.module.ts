import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    RebateAppComponent,
    RebateList,
    RebateNew_Edit,
    RebateScan,
    RebateIndex
} from './index';

 const rebateRoutes: Routes = [
    {
      path: '', component: RebateAppComponent,
      children: [ // 首页
        { path: '', redirectTo: 'rebate-index' },
        { 
          path: 'rebate-index',
          data: { "breadcrumb": "" },
          component: RebateIndex,
          children: [
            { path: '', redirectTo: 'rebate-list' },
            { path: 'rebate-list', data: { "breadcrumb": "" }, component: RebateList } //列表页面
          ]
        },
        { path: 'rebate-new', data: { "breadcrumb": "" }, component: RebateNew_Edit },
        { path: 'rebate-edit', data: { "breadcrumb": "" }, component: RebateNew_Edit },
        { path: 'rebate-scan', data: { "breadcrumb": "" }, component: RebateScan }
      ]
    }
 ];

@NgModule({
    imports: [RouterModule.forChild(rebateRoutes)],
    exports: [RouterModule]
})

export class RebateRoutingModule { };
