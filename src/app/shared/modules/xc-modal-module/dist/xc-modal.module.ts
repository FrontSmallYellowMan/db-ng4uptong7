import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XcContainerComponent,XcModalContainerComponent,XcHostDirective,XcModalService,XcComponentsLoaderProvider} from "./index";

@NgModule({
  imports: [CommonModule],
  exports: [XcContainerComponent],
  declarations: [XcContainerComponent,XcModalContainerComponent,XcHostDirective],
  providers: [XcModalService,XcComponentsLoaderProvider]
})
export class XcModalModule { }
