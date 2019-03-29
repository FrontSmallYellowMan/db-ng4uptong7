// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { ORDER_APP_COMPONENT, ORDER_APP_ENTRY_COMPONENT, ORDER_PIPES ,ORDER_SERVICE} from "./index";

import { OrderRoutingModule } from "./order-routing.module";//引入内部路由


@NgModule({
  imports: [
    SharedModule,
    OrderRoutingModule
  ],
  declarations: [
    ORDER_APP_COMPONENT,
    ORDER_PIPES
  ],
  entryComponents:[ORDER_APP_ENTRY_COMPONENT],
  providers: [ORDER_SERVICE]
})
export class OrderAppModule { }
