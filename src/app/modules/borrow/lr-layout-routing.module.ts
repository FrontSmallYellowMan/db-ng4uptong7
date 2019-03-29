import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
    BorrowNavComponent, BorrowListComponent,
    LimitListComponent,RtnListComponent,TurnSaleListComponent,TrackingTurnSaleComponent,
    TrackingFrozenComponent,TrackingLimitComponent,TrackingFiscalComponent,TrackingPlatformComponent,TrackingRtnComponent,TrackingBorrowComponent,TranSferListComponent
,UnclearItemListComponent,TrackingTranSferComponent
} from './index';

const routes: Routes = [//定义路由
  { path: '', component: BorrowNavComponent, outlet: 'left' },//左侧
  {//右侧根据路径变化
    path: '',
    children: [
      { path: '', redirectTo: "list" },//重定向到 默认页面
      { path: 'list', data: { 'breadcrumb': '' }, component: BorrowListComponent },//根据路径激活相应组件
       { path: 'rtnlist', data: { 'breadcrumb': '' }, component: RtnListComponent },//根据路径激活相应组件
         { path: 'transferlist', data: { 'breadcrumb': '' }, component: TranSferListComponent},//根据路径激活相应组件
      { path: 'limit', data: { 'breadcrumb': '' }, component: LimitListComponent },
      { path: 'turnsalelist', data: { 'breadcrumb': '' }, component: TurnSaleListComponent },//借用转销售列表
      { path: 'tracking', data: { 'breadcrumb': '' },
        children: [
          { path: '', redirectTo: "list" },//重定向到 默认页面
          { path: 'tracking-borrow', data: {"breadcrumb": ""},component: TrackingBorrowComponent},
          { path: 'freeze-personnel', data: {"breadcrumb": ""},component: TrackingFrozenComponent },
          { path: 'tracking-limit', data: {"breadcrumb": ""},component: TrackingLimitComponent },
          { path: 'tracking-unclearitem', data: {"breadcrumb": ""},component: UnclearItemListComponent },
          { path: 'tracking-fiscal', data: {"breadcrumb": ""},component: TrackingFiscalComponent },
          { path: 'tracking-rtn', data: {"breadcrumb": ""},component: TrackingRtnComponent },
            { path: 'tracking-transfer', data: {"breadcrumb": ""},component: TrackingTranSferComponent },
           { path: 'tracking-turnsale', data: {"breadcrumb": ""},component: TrackingTurnSaleComponent },
          { path: 'platform-inventory', data: {"breadcrumb": ""},component: TrackingPlatformComponent }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)//异步加载特性模块
    ],
  exports: [RouterModule] //用来控制将哪些内部成员暴露给外部使用
})
export class LrLayoutRoutingModule {
}
