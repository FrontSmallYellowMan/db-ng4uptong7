import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { IndexRoutingModule } from './index-routing.module';
import { INDEX_APP_ENTRYCOMPONENT, INDEX_APP_COMPONENT } from './component/index';
import { INDEX_SERVICES } from './services/index';

import { DragDirective } from './directive/drag.directive';
import { ContractInfoPipe } from "./services/index-contract.service";

@NgModule({
    imports: [
      SharedModule,
      IndexRoutingModule
    ],
    declarations: [
      INDEX_APP_COMPONENT,
      DragDirective,
      ContractInfoPipe
    ],
    entryComponents:[INDEX_APP_ENTRYCOMPONENT],
    providers: [INDEX_SERVICES]
})
export class IndexAppModule { }
