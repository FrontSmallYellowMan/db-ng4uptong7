import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeModule } from '../modules/base/home/home.module';

import {
  PageErrorComponent,
  PageNotFoundComponent,
  HeaderComponent, IqTlrFrameComponent,
  IqTbFrameComponent, DbContentComponent,DefindexComponent
} from 'app/shared/components/index';

import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [

  // { path: '', component: DefindexComponent},
  {
    path: "login", data: { "breadcrumb": "登陆" },
    loadChildren: "app/modules/base/login/login.module#LoginModule"
  },
  {
    path: '', component: IqTbFrameComponent,
    canActivate:[AuthGuardService],
    children: [
      { path: '', component: DefindexComponent},
      {
        path: 'index', data: { "breadcrumb": "首页" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/index/index-app.module#IndexAppModule'
      },
      {
        path: 'approval',data: { "breadcrumb": "我的任务" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/approvetask/approvetask-app.module#ApproveTaskAppModule'
      },
      {
        path: 'bill', data: { "breadcrumb": "冲红" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/bill/bill-app.module#BillAppModule'
      },
      {
        path: 'reinvoice', data: { "breadcrumb": "冲红退换货" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/reinvoice/reinvoice-app.module#ReInvoiceAppModule'
      },
      {
        path: 'borrow', data: { "breadcrumb": "借用管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/borrow/borrow-app.module#BorrowAppModule'
      },
      {
        path: 'invoice', data: { "breadcrumb": "票据管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/invoice/invoice-app.module#InvoiceAppModule'
      },
      {
        path: "mate", data: { "breadcrumb": "物料管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/materiel/materiel-app.module#MaterielAppModule'
      },
      {
        path: 'india', data: { "breadcrumb": "用印管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/india/india-app.module#IndiaAppModule'
      },
      {
        path: 'receivepayment', data: { "breadcrumb": "回款管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/receivepayment/receivepayment-app.module#ReceivePaymentAppModule'
      },
      {
        path: 'procurement', data: { "breadcrumb": "采购管理" },
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/procurement/procurement-app.module#ProcurementAppModule'
      },
      {
        path: "order", data: { "breadcrumb": "销售管理" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/order/order-app.module#OrderAppModule'
      },
      {
        path: 'supplier',data: { "breadcrumb": "供应商管理" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/supplier/supplier-app.module#SupplierAppModule'
      },
      {
        path: 'promised',data: { "breadcrumb": "承诺管理" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/promised/promised-app.module#PromisedAppModule'
      },
      {
        path: 'pipeline',data: { "breadcrumb": "pipeline" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/pipeline/pipeline-app.module#PipelineAppModule'
      },
      {
        path: 'ruleconfiguration',data: { "breadcrumb": "规则配置" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/ruleconfiguration/ruleconfiguration-app.module#RuleConfigAppModule'
      },
      {
        path: 'facturer_rebate',data: { "breadcrumb": "厂商返款" }, 
        canActivateChild: [AuthGuardService],
        loadChildren: 'app/modules/facturer_rebate/facturer_rebate-app.module#RebateAppModule'
      }
    ]
  },
  {
    path: '', component: DbContentComponent,
    children: [
      {
        path: 'contpl',
        loadChildren: 'app/modules/contracttemplate/contpl-app.module#ContplAppModule'
      }
    ]
  },
  {
    path: '500', component: IqTbFrameComponent,
    children: [
      { path: '', component: PageErrorComponent }
    ]
  },
  {
    path: '**', component: IqTbFrameComponent,
    children: [
      { path: '', component: PageNotFoundComponent }
    ]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    HomeModule
  ],
  exports: [RouterModule],
  providers: [AuthGuardService]
})
export class AppRoutingModule { }
