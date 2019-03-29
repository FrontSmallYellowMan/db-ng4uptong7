import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IqTlrFrameComponent } from 'app/shared/components/index';
import { LrLayoutModule } from './lr-layout.module';

import {
    BorrowApplyComponent, BorrowApproveRiskControlComponent,RtnApproveRiskControlComponent,
    LimitApplyComponent, LimitApproveRiskControlComponent,
    TrackingUndealItemsComponent,LimitManageLookComponent,LimitManageNewComponent,RtnApplyComponent,
    TurnSaleApplyComponent,TurnSaleApproveComponent,TransferApproveComponent,TranSferApplyComponent
} from './index';

const borrowRoutes: Routes = [
    { path: '', data: { 'breadcrumb': '' }, redirectTo: "list" },
    {
      path: '', data: { 'breadcrumb': '' }, component: IqTlrFrameComponent,
      children: [
         {
          path: '',
          loadChildren: './lr-layout.module#LrLayoutModule'
        }
      ]
    },
    { path: 'apply', data: { 'breadcrumb': '' },
      children: [
        { path: '', redirectTo: "list" },//重定向到 默认页面
        { path: 'borrow', data: { 'breadcrumb': '' }, component: BorrowApplyComponent },
        { path: 'borrow/:applyId', data: { 'breadcrumb': '' }, component: BorrowApplyComponent },
        { path: 'rtn', data: { 'breadcrumb': '' }, component: RtnApplyComponent },
        { path: 'limit', data: { 'breadcrumb': '' }, component: LimitApplyComponent },
        { path: 'turn-sale', data: { 'breadcrumb': '' }, component: TurnSaleApplyComponent },
        { path: 'transfer', data: { 'breadcrumb': '' }, component:TranSferApplyComponent},
      ]
    },
    { path: 'approve', data: { 'breadcrumb': '' },
      children: [
        { path: '', redirectTo: "list" },//重定向到 默认页面
        { path: 'limit-rc', component: LimitApproveRiskControlComponent },
        { path: 'rtn-rc', component: RtnApproveRiskControlComponent},
        { path: 'borrow-rc', component: BorrowApproveRiskControlComponent },
        { path:'turn-sale',component:TurnSaleApproveComponent},
        { path:'tran-sfer',component:TransferApproveComponent}
      ]
    },
    { path: 'tracking', data: { 'breadcrumb': '' },
      children: [
        { path: '', redirectTo: "list" },//重定向到 默认页面
        { path: 'freeze-items', component: TrackingUndealItemsComponent },
        {path:'tracking-look',data:{"breadcrumb":"借用额度查看"},component:LimitManageLookComponent},
        {path:'tracking-new',data:{"breadcrumb":"借用额度新建"},component:LimitManageNewComponent},
      ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(borrowRoutes)],
    exports: [RouterModule]
})

export class BorrowRoutingModule { };
