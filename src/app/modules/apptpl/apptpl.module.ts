
//导入相应模块
import { NgModule } from '@angular/core';
import { ApptplRoutingModule } from './apptpl-routing.module';
import { SharedModule } from 'app/shared/shared.module';

import { Apptpl_COMPONENTS } from './index';

import { ApptplService } from './services/apptpl.service';
import { FiscalAdjustService } from './services/table-rank.service';

//@NgModule装饰器用来为模块定义元数据
@NgModule({
  imports: [//导入其他module，其它module暴露的出的Components、Directives、Pipes等可以在本module的组件中被使用
    SharedModule,
    ApptplRoutingModule
  ],
  declarations: [//模块内部Components/Directives/Pipes的列表，声明一下这个模块内部成员
    Apptpl_COMPONENTS
  ],
  providers:[//指定应用程序的根级别需要使用的service
    ApptplService,
    FiscalAdjustService
  ]
})

//暴露出Module
export class ApptplModule { }
