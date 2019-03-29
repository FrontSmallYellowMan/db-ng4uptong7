import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    SupplierAppComponent,
    SupplierContainerComponent,
    SupplierManageComponent,
    SupplierMyApplyComponent,
    SupplierMyApprovalComponent,
    SupplierTrack,
    EditSupplierNewCreatSupplier,
    EditSeeSupplierDetail,
    EditSupplierApprovalSupplier,
    EditApprovalSupplierChange,
    EditSupplierNewCreatTrack,
    NoIdentity,
 
} from './index';

 const supplierRoutes: Routes = [
    {
      path: '', component: SupplierAppComponent,
      children: [//列表页面
        {path: '', redirectTo: "supplier-sm"},
        {path: 'supplier-sm',data: { "breadcrumb": "" }, component: SupplierManageComponent },
        {path: 'supplier-mApply/:id',data: { "breadcrumb": "" }, component: SupplierMyApplyComponent},
        {path: 'supplier-mApproval/:id', data: { "breadcrumb": "" },component: SupplierMyApprovalComponent },
        {path: 'supplier-track', data: { "breadcrumb": "" },component: SupplierTrack },
                      
      ]
    },
    {
      path: '', component: SupplierContainerComponent,
      children: [//弹出页面
        {path: 'edit-supplier-ncs/:id',data: { "breadcrumb": ""},component: EditSupplierNewCreatSupplier},
        {path: 'edit-supplier-ssd/:id',data: { "breadcrumb": ""},component: EditSeeSupplierDetail},
        {path: 'edit-supplier-as/:id',data: { "breadcrumb": ""},component: EditSupplierApprovalSupplier},
        {path: 'edit-supplier-asc/:id',data: { "breadcrumb": ""},component: EditApprovalSupplierChange},
        {path: 'edit-supplier-nct/:id',data: { "breadcrumb": ""},component: EditSupplierNewCreatTrack},
        {path: 'noIdentity',data: { "breadcrumb": ""},component: NoIdentity}
        
      ]
    }
 ];

@NgModule({
    imports: [RouterModule.forChild(supplierRoutes)],
    exports: [RouterModule]
})

export class SupplierRoutingModule { };
