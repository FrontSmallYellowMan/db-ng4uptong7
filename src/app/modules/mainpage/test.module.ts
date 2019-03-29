import { NgModule } from '@angular/core';
import { TestRoutingModule } from './test-routing.module';
import { SharedModule } from 'app/shared/shared.module';

import { TEST_APP_COMPONENTS } from './index';


@NgModule({
  imports: [
    SharedModule,
    TestRoutingModule
  ],
  declarations: [
    TEST_APP_COMPONENTS
  ]
})
export class TestModule { }
