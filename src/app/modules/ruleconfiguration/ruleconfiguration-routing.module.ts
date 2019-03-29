import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ContractruleListComponent,RuleConfigAppComponent } from './index';
import { ContractruleEditComponent } from './components/contractrule-edit/contractrule-edit.component';
import { PurchaseApplicationEditComponent } from "./components/purchase-application/purchase-application-edit/purchase-application-edit.component";
import { PurchaseApplicationListComponent } from "./components/purchase-application/purchase-application-list/purchase-application-list.component";
import { DefaultPageComponent } from "./components/default-page/default-page.component";

const RuleConfigRoutes: Routes = [
    { path:'', component:RuleConfigAppComponent,
    children:[
    { path: '', redirectTo: 'default-page' },
    { path:'', component:DefaultPageComponent },
    { path: 'contractrule-list', data: { "breadcrumb": "" }, component: ContractruleListComponent },
    { path: 'purchase-application-list', data: { "breadcrumb": "" }, component: PurchaseApplicationListComponent }
   ]
    },
    {path:"contractrule-edit",data:{"breadcrumb":""},component:ContractruleEditComponent},
    {path:"purchase-application-edit/:id",data:{"breadcrumb":""},component:PurchaseApplicationEditComponent}//采购申请规则配置新建页面
]

@NgModule({
    imports: [RouterModule.forChild(RuleConfigRoutes)],
    exports: [RouterModule]
})
export class RuleConfigRoutingModule {};