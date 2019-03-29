import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
       PromisedAppComponent,
       PromisedContainerComponent,
       DCGPromisedTrackComponent,
       DCGPromistedMyApplyComponent,
       DCGMyAoorovalComponent,
       DCGUploadCreditInfoComponent,
       HUAWEIPromisedTrackComponent,
       HUAWEIPromisedMyApplyComponent,
       HUAWEIPromisedMyApprovalComponent,
       EditHUAWEINewCreatePromisedComponent,
       EditHUAWEIApprovalDetailComponent,
       EditHUAWEITrackDetailComponent,
       EditDCGNewCreatePromisedComponent,
       EditDCGApprovalDetailComponent,
       EditDCGTrackDetailComponent
 
} from './index';

 const promisedRoutes: Routes = [
    {
       path: '', component: PromisedAppComponent,
       children: [//列表页面
         {path: '', redirectTo: "DCG-myApply/a"},
         {path: 'DCG-myApply/:id',data: { "breadcrumb": "" }, component: DCGPromistedMyApplyComponent },         
         {path: 'DCG-promisedTrack',data: { "breadcrumb": "" }, component: DCGPromisedTrackComponent },
         {path: 'DCG-myApproval/:id', data: { "breadcrumb": "" },component: DCGMyAoorovalComponent },             
         {path: 'DCG-uploadCreditInfo', data: { "breadcrumb": "" },component: DCGUploadCreditInfoComponent },
         {path: 'HUAWEI-promisedTrack',data: { "breadcrumb": "" }, component: HUAWEIPromisedTrackComponent},
         {path: 'HUAWEI-myApply/:id', data: { "breadcrumb": "" },component: HUAWEIPromisedMyApplyComponent },
         {path: 'HUAWEI-myApproval/:id', data: { "breadcrumb": "" },component: HUAWEIPromisedMyApprovalComponent },
       ]
    },
    {
       path: '', component: PromisedContainerComponent,
       children: [//弹出页面
         {path: 'edit-huawei-newcreatepromised/:id',data: { "breadcrumb": ""},component: EditHUAWEINewCreatePromisedComponent},
         {path: 'edit-huawei-approvaldetail/:id',data: { "breadcrumb": ""},component: EditHUAWEIApprovalDetailComponent},
         {path: 'edit-HUAWEI-trackDetail/:id',data: { "breadcrumb": ""},component: EditHUAWEITrackDetailComponent},
         {path: 'edit-dcg-newcreatepromised/:id',data: { "breadcrumb": ""},component: EditDCGNewCreatePromisedComponent},
         {path: 'edit-dcg-aprovaldetail/:id',data: { "breadcrumb": ""},component: EditDCGApprovalDetailComponent},
         {path: 'edit-DCG-trackDetail/:id',data: { "breadcrumb": ""},component: EditDCGTrackDetailComponent},
      //   {path: 'fatherForm', data: { "breadcrumb": "" },component: FatherFormComponent }
        
       ]
    }
 ];

@NgModule({
    imports: [RouterModule.forChild(promisedRoutes)],
    exports: [RouterModule]
})

export class PromisedRoutingModule { };
