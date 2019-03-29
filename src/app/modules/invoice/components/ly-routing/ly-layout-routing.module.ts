import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



import {
    InvoiceNavComponent,InvoiceListComponent,InvoiceDelayApplyListComponent,
    RevokedListComponent,ChangeTicketListComponent,InvoiceApproveListComponent,
    TakebackListComponent,TradeTicketListComponent,TradeTicketApproveListComponent,
    InvoiceStatusListComponent
} from '../index';
const routes: Routes = [//定义路由
  { path: '', component: InvoiceNavComponent, outlet: 'left' },//左侧
  {//右侧根据路径变化
    path: '',
    children: [
      { path: '', redirectTo: "list" },//重定向到 默认页面
      { path: 'list',data: {"breadcrumb": ""}, component: InvoiceListComponent },//根据路径激活相应组件
      { path: 'delaylist',data: {"breadcrumb": ""}, component: InvoiceDelayApplyListComponent },
      { path: 'revoked' ,data: {"breadcrumb": ""},
        children: [
          { path: 'list', data: {"breadcrumb": ""},component: RevokedListComponent }
        ]
      },
      { path: 'takeback',data: {"breadcrumb": ""},
        children: [
          { path: 'list', data: {"breadcrumb": ""},component: TakebackListComponent }
        ]
      },
      { path: 'change',data: {"breadcrumb": ""},
        children: [
          { path: 'list', data: {"breadcrumb": ""},component: ChangeTicketListComponent }
        ]
      },
      { path: 'approve', data: {"breadcrumb": ""},
        children: [
          { path: 'approveList/:flowStatus', data: {"breadcrumb": ""},component: InvoiceApproveListComponent }
          // { path: 'tracking-limit', data: {"breadcrumb": "借用额度管理"},component: TrackingLimitComponent },
          // { path: 'tracking-fiscal', data: {"breadcrumb": "财年调整规则"},component: TrackingFiscalComponent },
          // { path: 'platform-inventory', data: {"breadcrumb": "发货平台和库存地的对应关系"},component: TrackingPlatformComponent }
        ]
      },
      { path: 'tradeticket', data: {"breadcrumb": ""},
        children: [
          { path: 'list', data: {"breadcrumb": ""},component: TradeTicketListComponent },
          { path: 'approveList/:flowStatus/:clospanNum', data: {"breadcrumb": ""},component: TradeTicketApproveListComponent }
        ]
      },
     { path: 'invoicestatuslist',data: {"breadcrumb": ""}, component: InvoiceStatusListComponent },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)//异步加载特性模块
    ],
  exports: [RouterModule] //用来控制将哪些内部成员暴露给外部使用
})
export class LyLayoutRoutingModule {
}
