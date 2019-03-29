import { ModuleWithProviders, NgModule,
  Optional, SkipSelf } from '@angular/core';

import { CommonModule } from '@angular/common';

import { HttpModule, ConnectionBackend, RequestOptions, XHRBackend } from '@angular/http';
import { CORE_PROVIDERS, CORE_COMPONENTS } from './index'

import { SharedModule } from 'app/shared/shared.module';
// 
// import { XcModalModule } from 'app/core/components/xc-modal-components/index';

@NgModule({
  imports: [
    // XcModalModule,
    CommonModule,
    HttpModule,
    SharedModule
  ],
  exports: [
    CORE_COMPONENTS,
    SharedModule
  ],
  declarations: [
    CORE_COMPONENTS
  ],
  providers: [
    CORE_PROVIDERS
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }

  // static forRoot(config: UserServiceConfig): ModuleWithProviders {
  //   return {
  //     ngModule: CoreModule,
  //     providers: [
  //       {provide: UserServiceConfig, useValue: config }
  //     ]
  //   };
  // }
}
