import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//导入该模块所有的Component（组件）
import { ApptplContainerComponent,
  ApptplApplyComponent,ApptplRootComponent,ApptplTableRankComponent } from './index';

const routes: Routes = [//定义路由
  { path: '', component: ApptplRootComponent, outlet: 'left' },//左侧
  {//右侧根据路径变化
    path: '', component: ApptplContainerComponent,
    children: [
      { path: '', redirectTo: "apply" },//重定向到 默认页面
      { path: 'apply',data: {"breadcrumb": "表单示例"}, component: ApptplApplyComponent },//根据路径激活相应组件
      { path: 'tableBank', data: {"breadcrumb": "表格排序"},component: ApptplTableRankComponent },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)//异步加载特性模块
    ],
  exports: [RouterModule] //用来控制将哪些内部成员暴露给外部使用
})
export class ApptplRoutingModule {
}
