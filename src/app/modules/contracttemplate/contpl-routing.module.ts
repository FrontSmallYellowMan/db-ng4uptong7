import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LeftNavComponent, ContplComponent, ContplCreatComponent,ConChoiceComponent} from './index';

const contplRoutes: Routes = [
    {
       path :'', redirectTo: 'list'
    },
    {  path :'list',data:{'breadcrumb':'列表'}, component: ContplComponent },
    {  path :'creat',data:{'breadcrumb':'申请'}, component: ContplCreatComponent },
    {  path :'choice',data:{'breadcrumb':'申请'}, component: ConChoiceComponent }
]

@NgModule({
    imports: [RouterModule.forChild(contplRoutes)],
    exports: [RouterModule]
})

export class ContplRoutingModule {};
