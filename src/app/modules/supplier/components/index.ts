import { SupplierAppComponent } from "./supplier-app.component";
import { SupplierContainerComponent } from "./supplier-container/supplier-container.component";
import { SupplierManageComponent } from "./supplier-supplierManage/supplier-supplierManage.component";
import { SupplierMyApplyComponent } from "./supplier-myApply/supplier-myApply.component";
import { SupplierMyApprovalComponent } from "./supplier-myApproval/supplier-myApproval.component";
import { SupplierTrack } from "./supplier-supplierTrack/supplier-supplierTrack.component";

import { EditSupplierExtendClassComponentd } from "./edit-supplier-extendClass/edit-supplier-extendClass.component";
import { EditSupplierNewCreatSupplier } from "./edit-supplier-newCreatSupplier/edit-supplier-newCreatSupplier.component";
import { EditSeeSupplierDetail } from "./edit-supplier-seeSupplierDetail/edit-supplier-seeSupplierDetail";
import { EditSupplierApprovalSupplier } from "./edit-supplier-approvalSupplier/edit-supplier-approvalSupplier";
import { EditApprovalSupplierChange } from "./edit-supplier-approvalSupplierChange/edit-supplier-approvalSupplierChange";
import { EditSupplierNewCreatTrack } from "./edit-supplier-newCreatTrack/edit-supplier-newCreatTrack.component";

import { NoIdentity } from "./edit-noIdentity/edit-noIdentity.component";

//import { SupplierRoutingModule } from "../supplier-routing.module";//导入内部路由

export {
    SupplierAppComponent,
    SupplierContainerComponent,
    SupplierManageComponent,
    SupplierMyApplyComponent,
    SupplierMyApprovalComponent,
    SupplierTrack,
    EditSupplierExtendClassComponentd,
    EditSupplierNewCreatSupplier,
    EditSeeSupplierDetail,
    EditSupplierApprovalSupplier,
    EditApprovalSupplierChange,
    EditSupplierNewCreatTrack,
    NoIdentity
  
};

export let SUPPLIER_APP_ENTRY_COMPONENT = [
    EditSupplierExtendClassComponentd,
    EditSupplierNewCreatSupplier,
    EditSeeSupplierDetail,
    EditSupplierApprovalSupplier,
    EditApprovalSupplierChange,
    EditSupplierNewCreatTrack,
    NoIdentity
]

export let SUPPLIER_APP_COMPONENT = [
    SupplierAppComponent,
    SupplierContainerComponent,
    SupplierManageComponent,
    SupplierMyApplyComponent,
    SupplierMyApprovalComponent,
    SupplierTrack,
    EditSupplierExtendClassComponentd,
    EditSupplierNewCreatSupplier,
    EditSeeSupplierDetail,
    EditSupplierApprovalSupplier,
    EditApprovalSupplierChange,
    EditSupplierNewCreatTrack,
    NoIdentity
];
