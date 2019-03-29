import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestContainerComponent } from './components/test-container.component';
import { TestPageComponent } from './index';

const routes: Routes = [
    {
      path: '', component: TestContainerComponent,
      children: [
        { path: '', redirectTo:"index" },
        { path: 'index', data:{"breadcrumb":"测试"}, component: TestPageComponent }
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestRoutingModule { }
