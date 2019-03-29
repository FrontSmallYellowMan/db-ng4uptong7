//导入相应模块
import { NgModule } from '@angular/core';
import { LrLayoutRoutingModule } from './lr-layout-routing.module';
import { SharedModule } from 'app/shared/shared.module';

import { BORROW_LR_COMPONENT } from './index';


//@NgModule装饰器用来为模块定义元数据
@NgModule({
  imports: [//导入其他module，其它module暴露的出的Components、Directives、Pipes等可以在本module的组件中被使用
    SharedModule,
    LrLayoutRoutingModule
  ],
  declarations: [//模块内部Components/Directives/Pipes的列表，声明一下这个模块内部成员
    BORROW_LR_COMPONENT
  ]
})

//暴露出Module
export class LrLayoutModule { }
