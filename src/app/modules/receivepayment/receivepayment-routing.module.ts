import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceivepaymentComponent } from "./components/receivepayment/receivepayment.component";
import { MyarrearslistComponent } from "./components/myarrearslist/myarrearslist.component";
import { MyreceivepaymentlistComponent } from "./components/myreceivepaymentlist/myreceivepaymentlist.component";
import { RiskarrearslistComponent } from "./components/riskarrearslist/riskarrearslist.component";
import { FollowuplistComponent } from './components/followuplist/followuplist.component';
import { NewfollowComponent } from './components/newfollow/newfollow.component';
import { CommentComponent } from './components/comment/comment.component';
import { FollowupComponent } from './components/followup/followup.component';

const ReceivePaymentRoutes: Routes = [
    {
        path: '', data: { 'breadcrumb': '' }, component: ReceivepaymentComponent,
        children: [
            { path: '', redirectTo: 'rp-myarrears' },
            { path: 'rp-myarrears', component: MyarrearslistComponent },
            { path: 'rp-riskarrears', component: RiskarrearslistComponent },
            { path: 'rp-myreceivepayment', component: MyreceivepaymentlistComponent },
            {
                path: 'followup', component: FollowupComponent,
                children: [
                    { path: '', redirectTo: 'followup-list' },
                    { path: 'followup-list', component: FollowuplistComponent },
                    { path: 'followup-new', component: NewfollowComponent },
                    { path: 'followup-comment', component: CommentComponent },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(ReceivePaymentRoutes)],
    exports: [RouterModule]
})
export class ReceivePaymentRoutingModule {};
