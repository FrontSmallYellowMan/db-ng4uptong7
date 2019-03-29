import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastyModule } from 'ng2-toasty';
import { FileUploadModule } from 'ng2-file-upload';
import { DatepickerModule, PaginationModule, ModalModule  } from 'ngx-bootstrap';

import { SHARED_PIPES,SHARED_ENTRY_COMPONENTS,SHARED_DIRECTIVES,SHARED_COMPONENTS,SHARED_PROVIDERS } from './index';

import { XcModalModule } from './modules/xc-modal-module/index';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SelectModule } from 'ng2-select';

@NgModule({
  imports: [XcModalModule,ToastyModule.forRoot(),ModalModule.forRoot(),DatepickerModule.forRoot(),PaginationModule.forRoot(),ModalModule.forRoot(),FileUploadModule,RouterModule,CommonModule,FormsModule,Ng2Bs3ModalModule, SelectModule],
  exports: [XcModalModule,SHARED_PIPES,SHARED_DIRECTIVES,SHARED_COMPONENTS,CommonModule,FormsModule,ToastyModule,FileUploadModule,ModalModule,DatepickerModule, PaginationModule, ModalModule, Ng2Bs3ModalModule, SelectModule],
  declarations: [SHARED_PIPES,SHARED_DIRECTIVES,SHARED_COMPONENTS],
  entryComponents:[SHARED_ENTRY_COMPONENTS],
  providers: [SHARED_PROVIDERS]
})
export class SharedModule { }
