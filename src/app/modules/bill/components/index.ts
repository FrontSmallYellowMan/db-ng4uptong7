import { BillWritebackCreateComponent } from './writeback/bill-writeback-create.component';
import { BillAppComponent } from './bill-app.component';
import { BillLeftNavComponent } from './common/left-nav/left-nav.component';
// import { IqNavDropComponent } from './common/left-nav/iq-nav-drop/iq-nav-drop.component';
import { BillDetailComponent } from './writeback/bill-detail/bill-detail.component';
import { PipeBillComponent1 } from './writeback/bill-detail/pipes/pipe-biil-table-1';
import { PipeBillComponent2 } from './writeback/bill-detail/pipes/pipe-biil-table-2';
import { PipeBillComponent3 } from './writeback/bill-detail/pipes/pipe-biil-table-3';
import { PipeBillComponent4 } from './writeback/bill-detail/pipes/pipe-bill-table-4';
import { PipeBillSurplus } from './writeback/bill-detail/pipes/pipe-bill-table-surplus';
import { backZeroComponent } from './writeback/bill-detail/pipes/backZero';
import { DBFloatAlertComponent } from './writeback/bill-detail/pipes/DBFloatAlert';
import { BaseinfoComponent } from './writeback/baseinfo/baseinfo.component';
import { FinanceinfoComponent } from './writeback/financeinfo/financeinfo.component';
import { FileUpComponent } from './writeback/fileUp/fileUp.component';
import { BillExamineComponent } from './examine/bill-examine.component';
import { BillCheckComponent } from './check/bill-check.component';
import { moreMessageComponent } from './writeback/financeinfo/moreMessage/moreMessage.component';
import { returnNewComponent } from './return-new/return-new.component';
import { returnBaseinfoComponent } from './return-new/baseinfo/baseinfo.component';
import { returnFinanceinfoComponent } from './return-new/financeinfo/financeinfo.component';
import { returnBillDetailComponent } from './return-new/bill-detail/bill-detail.component';
import { showTimeMapComponent } from './return-new/bill-detail/showTimeMap/showTimeMap.component';
import { returnBillCheckComponent } from './return-check/breturn-check.component';
import { returnBillExamineComponent } from './return-examine/return-examine.component';

export {
    BillWritebackCreateComponent, BillAppComponent, BillLeftNavComponent,
    BillDetailComponent, PipeBillComponent1, PipeBillComponent2,
    PipeBillComponent3, PipeBillComponent4, BaseinfoComponent, FinanceinfoComponent,
    DBFloatAlertComponent, FileUpComponent, BillExamineComponent,
    BillCheckComponent, moreMessageComponent, PipeBillSurplus, backZeroComponent,returnNewComponent,
    returnBaseinfoComponent, returnFinanceinfoComponent,returnBillDetailComponent,showTimeMapComponent,
    returnBillCheckComponent,returnBillExamineComponent
};
export let BILL_APP_COMPONENT = [
    BillWritebackCreateComponent,
    BillAppComponent,
    BillLeftNavComponent,
    BillDetailComponent,
    PipeBillComponent1,
    PipeBillComponent2,
    PipeBillComponent3,
    PipeBillComponent4,
    PipeBillSurplus,
    BaseinfoComponent,
    FinanceinfoComponent,
    DBFloatAlertComponent,
    FileUpComponent,
    BillExamineComponent,
    BillCheckComponent,
    moreMessageComponent,
    backZeroComponent,
    returnNewComponent,
    returnBaseinfoComponent,
    returnFinanceinfoComponent,
    returnBillDetailComponent,
    showTimeMapComponent,
    returnBillCheckComponent,
    returnBillExamineComponent
];
