import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  OrderAppComponent, OrderListComponent, OrderOthersComponent,OrderCreateComponent, OrderCreateMacaoComponent,
  OrderContainerComponent, OrderCompletedListComponent, OrderCreateOthersComponent,
  OrderContractComponent,
  OrderViewComponent,
  MaterialDetailComponent,OrderExemptionlistComponent,OrderMaterialValidateComponent,
  OrderAdvanceCollectionValidateComponent,DeleteOrderComponent
} from './index';

const orderRoutes: Routes = [
  {
    path: '', component: OrderAppComponent,
    children: [
      { path: '', data: { "breadcrumb": "" }, redirectTo: "order-normal" },
      { path: 'order-contract', data: { "breadcrumb": "" }, component: OrderContractComponent },
      { path: 'order-normal', data: { "breadcrumb": "" }, component: OrderListComponent },
      { path: 'order-macao', data: { "breadcrumb": "" }, component: OrderListComponent },
      { path: 'order-others', data: { "breadcrumb": "" }, component: OrderOthersComponent },
      { path: 'order-completed', data: { "breadcrumb": "" }, component: OrderCompletedListComponent },
      { path: "order-exemptionlist", data:{"breadcrumb":""}, component:OrderExemptionlistComponent},
      { path: "order-materialValidate", data:{"breadcrumb":""}, component:OrderMaterialValidateComponent},
      { path: "order-advanceCollectionValidate", data:{"breadcrumb":""}, component:OrderAdvanceCollectionValidateComponent},
      { path: "order-deleteOrder", data:{"breadcrumb":""}, component:DeleteOrderComponent}

      
    ]
  },
  { path: 'order-view', data: { "breadcrumb": "" }, component: OrderViewComponent },
  { path: 'material-detail', data: { "breadcrumb": "" }, component: MaterialDetailComponent },
  {
    path: 'order-create', data: { "breadcrumb": "" },
    children: [
      { path: '', redirectTo: "normal" },
      { path: 'normal', data: { "breadcrumb": "" }, component: OrderCreateComponent },
      { path: 'macao', data: { "breadcrumb": "" }, component: OrderCreateMacaoComponent },
      { path: 'others', data: { "breadcrumb": "" }, component: OrderCreateOthersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(orderRoutes)],
  exports: [RouterModule]
})

export class OrderRoutingModule { };
