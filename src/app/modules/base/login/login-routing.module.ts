import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
    // ,
    // outlet:'right'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class LoginRoutingModule { }
