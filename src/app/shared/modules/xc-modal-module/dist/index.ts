import { XcContainerComponent } from "./components/xc-container.component";
import { XcModalContainerComponent } from "./components/xc-modal-container.component";

import { XcHostDirective } from "./xc-host.directive";

//模型
import { XcModalRef } from './models/xc-modal-ref';
import { XcBaseModal } from "./models/xc-base-modal";

//服务
import { XcModalService } from "./services/xc-modal.service";
import { XcComponentsLoaderService } from "./services/xc-components-loader.service";

import { FactoryProvider, ComponentFactoryResolver} from '@angular/core';

import { Subject } from 'rxjs';

let staticSubject = new Subject<XcModalRef>();

export function XcComponentsLoaderFactory(componentFactoryResolver) {
  return new XcComponentsLoaderService(componentFactoryResolver, staticSubject);
  // return new XcComponentsLoaderService();
}

export let XcComponentsLoaderProvider: FactoryProvider = { deps: [ComponentFactoryResolver], provide: XcComponentsLoaderService, useFactory: XcComponentsLoaderFactory };


export {XcModalRef, XcBaseModal, XcModalContainerComponent, XcContainerComponent, XcHostDirective, XcModalService, XcComponentsLoaderService};
