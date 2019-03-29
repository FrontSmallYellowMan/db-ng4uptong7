import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  ProcurementAppComponent, ProcurementApplyComponent, ProcurementOrderComponent,
  ContainerComponent,
  ProcurementApplyMyApprovalComponent, ProcurementApplyMyApplyComponent,
  ProcurementOrderMyApplyComponent, ProcurementOrderMyApprovalComponent,
  ProcurementApplyNewComponent, ContractApplySubmitComponent, ContractApplyViewComponent,
  ProcurementOrderNewComponent, NBNewComponent, NBViewComponent,
  ProcurementTemplateList, ProcurementTemplateEdit,
  PrepareApplySubmitComponent, PrepareApplyDealComponent,
  StockApplySubmitComponent, StockApplyDealComponent,
  NASubmitComponent, NADealComponent, NKNewComponent, NKViewComponent, UBComponent, UBViewComponent,
  NASelectComponent,NDDealComponent,NDSubmitComponent,ErpOrderChangeApplyComponent,ERPOrderChangeApplyListComponent,
  ERPOrderChangeApprovalListComponent,ERPOrderChangeViewComponent,ERPOrderChangeNewComponent
} from './index';


const procurementRoutes: Routes = [
  {
    path: '', component: ProcurementAppComponent,
    children: [
      { path: '', data: { "breadcrumb": "" }, redirectTo: "new-procurementApply" },
      { path: 'new-procurementOrder', data: { "breadcrumb": "" }, component: ProcurementOrderNewComponent },
      { path: 'new-procurementApply', data: { "breadcrumb": "" }, component: ProcurementApplyNewComponent },
      {//采购申请
        path: 'procurement-apply', data: { "breadcrumb": "" }, component: ProcurementApplyComponent,
        children: [
          { path: '', redirectTo: "my-apply" },
          { path: 'my-apply', data: { "breadcrumb": "" }, component: ProcurementApplyMyApplyComponent },
          { path: 'my-approval', data: { "breadcrumb": "" }, component: ProcurementApplyMyApprovalComponent }
        ]
      },
      {//采购订单
        path: 'procurement-order', data: { "breadcrumb": "" }, component: ProcurementOrderComponent,
        children: [
          { path: '', redirectTo: "my-apply",pathMatch: 'full' },
          { path: 'my-apply', data: { "breadcrumb": "" }, component: ProcurementOrderMyApplyComponent },
          { path: 'my-approval', data: { "breadcrumb": "" }, component: ProcurementOrderMyApprovalComponent }
        ]
      },
      {//采购订单修改
        path: 'erporderchange-apply', data: { "breadcrumb": "" }, component: ErpOrderChangeApplyComponent,
        children: [
          { path: '', redirectTo: "my-apply" },
          { path: 'my-apply', data: { "breadcrumb": "" }, component: ERPOrderChangeApplyListComponent },
          { path: 'my-approval', data: { "breadcrumb": "" }, component: ERPOrderChangeApprovalListComponent }
        ]
      },
      { path: 'procurementTpl-list', data: { "breadcrumb": "" }, component: ProcurementTemplateList }//模板列表
    ]
  },
  {
    path: '', component: ContainerComponent,
    children: [
      //合同单采购申请
      // { path: 'new-procurementApply', data: { "breadcrumb": "" }, component: ProcurementApplyNewComponent },
      { path: 'submit-contractapply', data: { "breadcrumb": "" }, component: ContractApplySubmitComponent },
      { path: 'submit-contractapply/:id', data: { "breadcrumb": "" }, component: ContractApplySubmitComponent },
      { path: 'deal-contractapply', data: { "breadcrumb": "" }, component: ContractApplyViewComponent },
      { path: 'deal-contractapply/:id', data: { "breadcrumb": "" }, component: ContractApplyViewComponent },

      //采购订单-NB类型
      { path: 'submit-NB', data: { "breadcrumb": "" }, component: NBNewComponent },
      { path: 'submit-NB/:id', data: { "breadcrumb": "" }, component: NBNewComponent },
      { path: 'deal-NB', data: { "breadcrumb": "" }, component: NBViewComponent },
      { path: 'deal-NB/:id', data: { "breadcrumb": "" }, component: NBViewComponent },

      //采购订单-NK
      { path: 'submit-NK', data: { "breadcrumb": "" }, component: NKNewComponent },
      { path: 'submit-NK/:id', data: { "breadcrumb": "" }, component: NKNewComponent },
      { path: 'deal-NK', data: { "breadcrumb": "" }, component: NKViewComponent },
      { path: 'deal-NK/:id', data: { "breadcrumb": "" }, component: NKViewComponent },
      //采购订单-UB
      { path: 'submit-UB', data: { "breadcrumb": "" }, component: UBComponent },
      { path: 'submit-UB/:id', data: { "breadcrumb": "" }, component: UBComponent },
      { path: 'deal-UB', data: { "breadcrumb": "" }, component: UBViewComponent },
      { path: 'deal-UB/:id', data: { "breadcrumb": "" }, component: UBViewComponent },
      //模板
      { path: 'procurementTpl-edit', data: { "breadcrumb": "" }, component: ProcurementTemplateEdit },
      { path: 'procurementTpl-edit/:id', data: { "breadcrumb": "" }, component: ProcurementTemplateEdit },

      //预下单采购申请
      { path: 'submit-prepareapply', data: { "breadcrumb": "" }, component: PrepareApplySubmitComponent },
      { path: 'submit-prepareapply/:id', data: { "breadcrumb": "" }, component: PrepareApplySubmitComponent },
      { path: 'deal-prepareapply', data: { "breadcrumb": "" }, component: PrepareApplyDealComponent },
      { path: 'deal-prepareapply/:id', data: { "breadcrumb": "" }, component: PrepareApplyDealComponent },

      //备货采购申请
      { path: 'submit-stockapply', data: { "breadcrumb": "" }, component: StockApplySubmitComponent },
      { path: 'submit-stockapply/:id', data: { "breadcrumb": "" }, component: StockApplySubmitComponent },
      { path: 'deal-stockapply', data: { "breadcrumb": "" }, component: StockApplyDealComponent },
      { path: 'deal-stockapply/:id', data: { "breadcrumb": "" }, component: StockApplyDealComponent },

      //采购订单-NA类型
      { path: 'submit-NA', data: { "breadcrumb": "" }, component: NASubmitComponent },
      { path: 'submit-NA/:id', data: { "breadcrumb": "" }, component: NASubmitComponent },
      { path: 'deal-NA', data: { "breadcrumb": "" }, component: NADealComponent },
      { path: 'deal-NA/:id', data: { "breadcrumb": "" }, component: NADealComponent },

      //采购订单-ND类型
      { path: 'select-NA', data: { "breadcrumb": "" }, component: NASelectComponent },
      { path: 'submit-ND', data: { "breadcrumb": "" }, component: NDSubmitComponent },
      { path: 'submit-ND/:id', data: { "breadcrumb": "" }, component: NDSubmitComponent },
      { path: 'deal-ND', data: { "breadcrumb": "" }, component: NDDealComponent },
      { path: 'deal-ND/:id', data: { "breadcrumb": "" }, component: NDDealComponent },

      //采购订单修改
      { path: 'erporderchange-new/:id', data: { "breadcrumb": "" }, component: ERPOrderChangeNewComponent },
      { path: 'erporderchange-view/:id', data: { "breadcrumb": "" }, component: ERPOrderChangeViewComponent },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(procurementRoutes)],
  exports: [RouterModule]
})

export class procurementRoutingModule { };
