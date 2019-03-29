import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IqTlrFrameComponent } from 'app/shared/components/index';
import { LyLayoutModule } from './components/ly-routing/ly-layout.module';

import {
  RevokedApplyComponent,
  ChangeTicketApplyComponent,
  InvoiceApplyComponent,
  RevokedApproveComponent,
  InvoiceDelayApplyComponent,
  ApplyCommonComponent,
  ChangeTicketApproveComponent,
  TakebackApplyComponent,
  TakebackApproveComponent,
  TradeticketApplyComponent,
  InvoiceDetailComponent,
  TradeTicketDetailComponent,
  InvoiceApproveEditComponent,
  TradeTicketApproveEditComponent,
  TakebackDetailComponent

} from './index';
const invoiceRoutes: Routes = [
  { path: '', redirectTo: "list" },
  {
    path: '', component: IqTlrFrameComponent,
    children: [
      {
        path: '',
        loadChildren: './components/ly-routing/ly-layout.module#LyLayoutModule'
      }
    ]
  },

  {
    path: 'delay', data: { 'breadcrumb': '' },
    children: [
      { path: 'apply', data: { 'breadcrumb': '' }, component: InvoiceDelayApplyComponent },
      { path: 'delayDetial/:id',data: { 'breadcrumb': '' }, component: ApplyCommonComponent },
      { path: 'resubmit/:id', data: { 'breadcrumb': '' },component: InvoiceDelayApplyComponent }
    ]
  },
  {
    path: 'revoked',data: { 'breadcrumb': '' },
    children: [
      { path: 'apply', data: { 'breadcrumb': '' }, component: RevokedApplyComponent },
      { path: 'approve/:revokedId/:flowstates', data: { 'breadcrumb': '' }, component: RevokedApproveComponent }
    ]
  },
  {
    path: 'change', data: { 'breadcrumb': '' },
    children: [
      { path: 'apply', data: { 'breadcrumb': '' }, component: ChangeTicketApplyComponent },
      { path: 'approve/:id', data: { 'breadcrumb': '' }, component: ChangeTicketApproveComponent },
      { path: 'reapply/:id', data: { 'breadcrumb': '' }, component: ChangeTicketApplyComponent },
    ]
  },
  {
    path: 'takeback',data: { 'breadcrumb': '' },
    children: [
      { path: 'apply/:id', data: { 'breadcrumb': '' }, component: TakebackApplyComponent },
      { path: 'takebackDetail/:id', data: { 'breadcrumb': '' }, component: TakebackDetailComponent },
      { path: 'approve/:takebackId/:flag', data: { 'breadcrumb': '' }, component: TakebackApproveComponent }
    ]
  },
  {
    path: 'apply',data: { 'breadcrumb': '' },
    children: [
      { path: '', redirectTo: "list" },//重定向到 默认页面
      { path: 'invoice/:id', data: { 'breadcrumb': '' }, component: InvoiceApplyComponent },
      { path: 'tradeticket/:id', data: { 'breadcrumb': '' }, component: TradeticketApplyComponent },
      { path: 'invoicedetail/:id', data: { 'breadcrumb': '' }, component: InvoiceDetailComponent },
      { path: 'tradeticketDetail/:id', data: { 'breadcrumb': '' }, component: TradeTicketDetailComponent },
      { path: 'invoiceEdit/:id', data: { 'breadcrumb': '' }, component: InvoiceApproveEditComponent },
       { path: 'tradeticketEdit/:id', data: { 'breadcrumb': '' }, component: TradeTicketApproveEditComponent }
    ]
  },
  {
    path: 'approve',
    children: [
      { path: '', redirectTo: "list" }//重定向到 默认页面
      // { path: 'limit-rc', component: LimitApproveRiskControlComponent },
      // { path: 'borrow-rc', component: BorrowApproveRiskControlComponent }
    ]
  },
  {
    path: 'tracking',
    children: [
      { path: '', redirectTo: "list" }//重定向到 默认页面
      // { path: 'freeze-items/:id', component: TrackingUndealItemsComponent }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(invoiceRoutes)],
  exports: [RouterModule]
})



export class InvoiceRoutingModule {

}