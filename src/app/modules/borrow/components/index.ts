import { BorrowNavComponent } from './layout/nav/borrow-nav.component';
import { BorrowListComponent } from './list/borrow/borrow-list.component';
import { BorrowApplyComponent } from './apply/borrow/borrow-apply.component';
import { BorrowApproveRiskControlComponent } from './approve/borrow/risk-control/borrow-risk-control.component'
import { TurnSaleApplyComponent } from './apply/turnsale/turn-sale-apply.component';
import { TranSferApplyComponent } from './apply/transfer/tran-sfer-apply.component';

import { LimitListComponent } from './list/limit/limit-list.component';
import { LimitApplyComponent } from './apply/limit/limit-apply.component';
import { LimitApproveRiskControlComponent } from './approve/limit/risk-control/limit-risk-control.component';

import { TrackingFrozenComponent } from './tracking/freeze-personnel/freeze-personnel.component';
import { TrackingUndealItemsComponent } from './tracking/freeze-personnel/undeal-items/undeal-items.component';
import { TrackingLimitComponent } from './tracking/limit-manage/limit-manage.component';
import { TrackingFiscalComponent } from './tracking/fiscal-adjust/fiscal-adjust.component';
import { TrackingPlatformComponent } from './tracking/platform-inventory/platform-inventory.component';

//组件
import { FiscalModalDataComponent } from './tracking/fiscal-adjust/modalData/modal-data.component';
import { FiscalAddFormComponent } from './tracking/fiscal-adjust/addForm/add-form.component';
import { FreezeAddFormComponent } from './tracking/freeze-personnel/addForm/add-form.component';
import { PlatformModalDataComponent } from './tracking/platform-inventory/modalData/modal-data.component';
import { PlatformEditFormComponent } from './tracking/platform-inventory/editForm/edit-form.component';
//增加 weiyg
import{LimitManageLookComponent} from './tracking/limit-manage/limit-manage-look.component';
import{LimitManageNewComponent} from './tracking/limit-manage/limit-manage-new.component';
import {TurnSaleListComponent} from './list/turnsale/turn-sale-list.component';

//未清项组件
import{BorrowUnclearListComponent} from './common/borrow-unclear-list.component';

import {BorrowFileUpComponent} from './common/fileUp/borrowFileUp.component';

//增加 lx
import{RtnListComponent} from './list/rtn/rtn-list.component';
import{RtnApplyComponent} from './apply/rtn/rtn-apply.component';
import{PopUnclearListComponent} from './common/pop-unclear-list.component';
import{PopInventoryListComponent} from './common/pop-inventory-list.component';
import {RtnApproveRiskControlComponent } from './approve/rtn/risk-control/rtn-risk-control.component'
import {AddressComponent} from './common/address/address.component';
import {AddressDetailComponent} from './common/addressDetail/addressdetail.component';
import {TrackingRtnComponent} from './tracking/rtn-manage/rtn-manage.component';
import {TrackingBorrowComponent} from './tracking/borrow-manage/borrow-manage.component';
import {TrackingTurnSaleComponent} from './tracking/turnsale/tracking-turn-sale.component';
import {JyWfapprovalComponent} from './common/wfApprove/jy-wfapproval.component';
import {JIqSelectComponent} from './common/iq-select/j-iq-select.component';
import {JIqSelectDialogComponent} from './common/iq-select/j-iq-select-dialog.component';
import {TurnSaleApproveComponent} from './approve/turnsale/turn-sale-approve.component';
import {TrackingTranSferComponent} from './tracking/transfer/tracking-tran-sfer.component';
import{TranSferListComponent} from './list/transfer/tran-sfer-list.component';
import{TransferApproveComponent} from './approve/transfer/tran-sfer-approve.component';
import {UnclearItemListComponent} from './tracking/unclearitem/unclearitem-list.component';
export {
    BorrowNavComponent, BorrowListComponent, BorrowApplyComponent, BorrowApproveRiskControlComponent,RtnApproveRiskControlComponent,
    LimitListComponent, LimitApplyComponent, LimitApproveRiskControlComponent,TurnSaleListComponent,
    TrackingFrozenComponent,TrackingLimitComponent,TrackingFiscalComponent,TrackingPlatformComponent,
    JIqSelectComponent,JyWfapprovalComponent,JIqSelectDialogComponent,
    TrackingUndealItemsComponent,LimitManageLookComponent,LimitManageNewComponent,RtnListComponent,RtnApplyComponent,BorrowUnclearListComponent,AddressDetailComponent,
    TurnSaleApplyComponent,PopUnclearListComponent,PopInventoryListComponent,BorrowFileUpComponent,TurnSaleApproveComponent,TrackingTurnSaleComponent,AddressComponent,TrackingRtnComponent,TrackingBorrowComponent,TrackingTranSferComponent,TranSferListComponent,
    UnclearItemListComponent,TranSferApplyComponent,TransferApproveComponent
};

export let BORROW_LR_COMPONENT = [//左侧模块内部列表
    BorrowNavComponent, BorrowListComponent,
    LimitListComponent,TurnSaleListComponent,TrackingTurnSaleComponent,
    TrackingFrozenComponent,TrackingLimitComponent,TrackingFiscalComponent,TrackingPlatformComponent,RtnListComponent,TranSferListComponent,
    TrackingRtnComponent,TrackingBorrowComponent,TrackingTranSferComponent,UnclearItemListComponent
];
export let BORROW_APP_ENTRY_COMPONENT = [//borrow模块entryComponents
    FiscalAddFormComponent,FiscalModalDataComponent,PlatformModalDataComponent,PlatformEditFormComponent, FreezeAddFormComponent,BorrowUnclearListComponent,PopUnclearListComponent,AddressComponent,AddressDetailComponent,
    JIqSelectDialogComponent,PopInventoryListComponent
];
export let BORROW_APP_COMPONENT = [//borrow模块内部列表
    BorrowApplyComponent, BorrowApproveRiskControlComponent,RtnApproveRiskControlComponent,
    LimitApplyComponent, LimitApproveRiskControlComponent,TurnSaleApproveComponent,
    TrackingUndealItemsComponent,FiscalAddFormComponent,FiscalModalDataComponent,PlatformModalDataComponent,PlatformEditFormComponent,
    FreezeAddFormComponent,LimitManageLookComponent,LimitManageNewComponent,RtnApplyComponent,BorrowUnclearListComponent,
    TurnSaleApplyComponent,PopUnclearListComponent,PopInventoryListComponent,BorrowFileUpComponent,AddressComponent,AddressDetailComponent,JyWfapprovalComponent,JIqSelectComponent,
    JIqSelectDialogComponent,TranSferApplyComponent,TransferApproveComponent
];
