import { ReceivepaymentComponent } from './receivepayment/receivepayment.component';
import { MyreceivepaymentlistComponent } from './myreceivepaymentlist/myreceivepaymentlist.component';
import { MyarrearslistComponent } from './myarrearslist/myarrearslist.component';
import { RiskarrearslistComponent } from "./riskarrearslist/riskarrearslist.component";
import { SelectSearchBankSubjectComponent } from "./select-search-banksubject/select-search-banksubject.component";
import { FollowuplistComponent } from './followuplist/followuplist.component';
import { NewfollowComponent } from './newfollow/newfollow.component';
import { CommentComponent } from './comment/comment.component';
import { FollowupComponent } from './followup/followup.component';
import { ViewpayitemComponent } from './viewpayitem/viewpayitem.component';

export let ReceivePayment_APP_COMPONENT = [ReceivepaymentComponent, MyreceivepaymentlistComponent, MyarrearslistComponent, ViewpayitemComponent,
RiskarrearslistComponent, SelectSearchBankSubjectComponent, FollowuplistComponent, NewfollowComponent, CommentComponent, FollowupComponent];
export let ReceivePayment_APP_ENTRY_COMPONENT = [SelectSearchBankSubjectComponent, ViewpayitemComponent];
