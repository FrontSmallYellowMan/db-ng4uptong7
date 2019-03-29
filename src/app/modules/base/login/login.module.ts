import { NgModule } from '@angular/core';
//import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './components/login.component';

import { LoginRoutingModule } from './login-routing.module';

import { AuthenticationService } from './index';

@NgModule({
  imports: [
    LoginRoutingModule,
    FormsModule
  ],
  providers:[AuthenticationService],
  declarations: [LoginComponent]
})
export class LoginModule { }
