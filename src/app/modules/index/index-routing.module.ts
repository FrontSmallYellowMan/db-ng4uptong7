import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  IndexAppComponent, 
  IndexMapComponent,
  IndexContainerComponent, 
  IndexSalesComponent, 
  IndexMyApprovalComponent,
  IndexMyMessageComponent,
  IndexContractComponent
} from './component/index';

const INDEX_ROUTES: Routes = [
  {
    path: '', component: IndexAppComponent,
    children: [
      { path: '', data: {breadcrumb: '销售员首页'}, redirectTo: 'index-sales' },
      { path: 'index-sales', data: {breadcrumb: '销售员首页'}, component: IndexSalesComponent }
    ]
  },
  {
    path: '', component: IndexContainerComponent,
    children: [
      { path: 'index-map', data: {breadcrumb: '网址地图'}, component: IndexMapComponent },
      { path: 'index-my-approval', data: {breadcrumb: '我的审批'}, component: IndexMyApprovalComponent },
      { path: 'index-contract', data: {breadcrumb: '销售合同'}, component: IndexContractComponent },
      { path: 'index-my-message', data: {breadcrumb: '我的消息'}, component: IndexMyMessageComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(INDEX_ROUTES)],
  exports: [RouterModule]
})
export class IndexRoutingModule {};
