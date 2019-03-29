import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    BillWritebackCreateComponent,
    BillAppComponent, BillLeftNavComponent, BillExamineComponent,
    BillCheckComponent, returnNewComponent, returnBillCheckComponent,returnBillExamineComponent
} from './index';

const billRoutes: Routes = [
    {
        path: '', redirectTo: 'list'
    },
    { path: 'list', data: { 'breadcrumb': '列表' }, component: BillAppComponent },
    { path: 'creat', data: { 'breadcrumb': '申请' }, component: BillWritebackCreateComponent },
    { path: 'examine', data: { 'breadcrumb': '编辑' }, component: BillExamineComponent },
    { path: 'check', data: { 'breadcrumb': '查看' }, component: BillCheckComponent },
    { path: 'check/:id', data: { 'breadcrumb': '查看' }, component: BillCheckComponent },
    { path: 'approve', data: { 'breadcrumb': '审批' }, component: BillCheckComponent },
    { path: 'return-new', data: { 'breadcrumb': '申请' }, component: returnNewComponent },
    { path: 'return-check', data: { 'breadcrumb': '查看' }, component: returnBillCheckComponent },
    { path: 'return-check/:id', data: { 'breadcrumb': '查看' }, component: returnBillCheckComponent },
    { path: 'return-examine', data: { 'breadcrumb': '编辑' }, component: returnBillExamineComponent },
]

@NgModule({
    imports: [RouterModule.forChild(billRoutes)],
    exports: [RouterModule]
})

export class BillRoutingModule { };
