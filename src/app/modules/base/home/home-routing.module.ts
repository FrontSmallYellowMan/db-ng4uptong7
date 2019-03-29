import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
    // ,
    // outlet:'right'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  declarations: [HomeComponent]
})
export class HomeRoutingModule { }
