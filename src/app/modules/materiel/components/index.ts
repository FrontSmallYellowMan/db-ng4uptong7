import { MaterielAppComponent } from './materiel-app.component';
import { MaterielContainerComponent } from './materiel-container/materiel-container.component';
import { MaterielCommonlyComponent } from "./materiel-commonly/materiel-commonly.component";
import { MaterielDataModifyComponent } from "./materiel-dataModify/materiel-DataModify.component";
import { ReturnServiceComponent } from "./materiel-returnService/materiel-returnService.component";
import { MaterielApplyTemplateComponent } from "./materiel-applyTemplate/materiel-applyTemplate.component";
import { ExtendPlatformComponent } from "./materiel-extendPlatform/materiel-extendPlatform.component";
import { ExtendMaterielComponent } from "./materiel-extendMateriel/materiel-extendMateriel.component";
import { ExtendMaterielMyApplyComponent } from "./materiel-extendMateriel-myApply/materiel-extendMateriel-myApply.component";
import { ExtendMaterielMyApprovalComponent } from "./materiel-extendMateriel-myApproval/materiel-extendMateriel-myApproval.component";
import { BatchCreateMaterielComponent } from "./materiel-batchCreateMateriel/materiel-batchCreateMateriel.component";
import { MaterielChangeComponent  } from "./materiel-materielChange/materiel-materielChange.component";
import { CreateNewMaterielComponent } from "./edit-materiel-createNewMateriel/edit-materiel-createNewMateriel.component";
import { MaterielDataModifyMyApplyComponent } from "./materiel-dataModify-myapply/materiel-dataModify-myapply.component"
import { MaterielDataModifyMyApprovalComponent } from "./materiel-dataModify-myapproval/materiel-dataModify-myapproval.component"
import { MaterielChangeMyApplyComponent } from "./materiel-materielChange-myApply/materiel-materielChange-myapply.component";
import { MaterielChangeMyApprovalComponent } from "./materiel-materielChange-myApproval/materiel-materielChange-myapproval.component";

import { EditMaterielDataModifyComponent } from "./edit-materiel-dataModify/edit-materiel-dataModify.component";
import { EditMaterielApplyTemplateComponent } from "./edit-materiel-applyTemplate/edit-materiel-applyTemplate.component";
import { EditMaterielNewReturnService } from "./edit-materiel-newReturnService/edit-materiel-newReturnService.component";
import { EditSeeReturnServiceComponent } from "./edit-materiel-seeReturnService/edit-materiel-seeReturnService.component";
import { EditMaterielPlatComponent } from './edit-materiel-plat/edit-materiel-plat.component';
import { EditMaterielExtendMaterielComponent } from './edit-materiel-extendMateriel/edit-materiel-extendMateriel.component';
import { EditSeeCommonlyMateriel } from "./edit-materiel-seeCommonlyMateriel/edit-materiel-seeCommonlyMateriel.component";
import { EditNewMaterielChangeComponent } from "./edit-newMaterielChange/edit-newMaterielChange.component";
import { EditNewMaterielChangeSalesListComponent } from "./edit-newMaterielChange-salesList/edit-newMaterielChange-salesList.component";
import { EditApprovalMaterielChangeComponent } from "./edit-materiel-approvalMaterielChange/edit-materiel-approvalMaterielChange.component";
import { EditExtendMaterileApprovalDetail } from "./edit-materiel-extendMateriel-appvovalDetail/edit-materiel-extendMateriel-approvalDetail.component";
import { EditNewMaterielFirstApprovalUserComponent } from "./edit-newMaterielChange-firstApprovalUser/edit-newMaterielChange-firstApprovalUser.component";

//新增批量修改物料价格模块
import { BatchMaterialPriceEditComponent } from "./batch-material-price/batch-material-price-edit/batch-material-price-edit.component";
import { BatchMaterialPriceListComponent } from "./batch-material-price/batch-material-price-list/batch-material-price-list.component";
import { BatchMaterialPricePopErrMesComponent } from "./batch-material-price/batch-material-price-popErrMes/batch-material-price-popErrMes.component";

import { SelectSearchComponent } from "./select-search/select-search.component";
import { SelectSearchDialogComponent } from "./select-search/select-search-dialog.component";
import { TreeComponent } from "./select-search/select-search-tree.component";
import { SearchTreeComponent } from "./select-search/searchTree.component";

import { ApplyModulesComponent } from "./apply-modules/apply-modules.component";//审批组件引入
import { MaterialMaintenanceHuaweiComponent} from "./material-maintenance-huawei/material-maintenance-huawei.component";
import { EditMaterialMaintenancehwComponent } from './edit-material-maintenancehw/edit-material-maintenancehw.component'
import { BatchMaterialCreatComponent } from './batch-material-creat/batch-material-creat.component';

export {
  MaterielAppComponent,
  MaterielContainerComponent,
  MaterielCommonlyComponent,
  MaterielDataModifyComponent,
  ReturnServiceComponent,
  MaterielApplyTemplateComponent,
  ExtendPlatformComponent,
  ExtendMaterielComponent,
  ExtendMaterielMyApplyComponent,
  ExtendMaterielMyApprovalComponent,
  BatchCreateMaterielComponent,
  MaterielChangeComponent,
  CreateNewMaterielComponent,
  MaterielDataModifyMyApplyComponent,
  MaterielDataModifyMyApprovalComponent,
  ApplyModulesComponent,
  TreeComponent,
  SearchTreeComponent,
  MaterielChangeMyApplyComponent,
  MaterielChangeMyApprovalComponent,
  EditMaterielDataModifyComponent,
  EditMaterielApplyTemplateComponent,
  EditMaterielNewReturnService,
  EditSeeReturnServiceComponent,
  EditMaterielExtendMaterielComponent,
  EditSeeCommonlyMateriel,
  EditNewMaterielChangeComponent,
  EditNewMaterielChangeSalesListComponent,
  EditApprovalMaterielChangeComponent,
  EditExtendMaterileApprovalDetail,
  EditNewMaterielFirstApprovalUserComponent,
  MaterialMaintenanceHuaweiComponent,
  EditMaterialMaintenancehwComponent,
  BatchMaterialPriceEditComponent,
  BatchMaterialPriceListComponent,
  BatchMaterialPricePopErrMesComponent,
  BatchMaterialCreatComponent
};

export let MATERIEL_APP_ENTRY_COMPONENT = [
  EditMaterielApplyTemplateComponent,
  EditNewMaterielChangeSalesListComponent,
  EditNewMaterielFirstApprovalUserComponent,
  SelectSearchDialogComponent,
  EditMaterielPlatComponent,
  TreeComponent,
  SearchTreeComponent,
  EditMaterialMaintenancehwComponent,
  BatchMaterialPricePopErrMesComponent
]

export let Materiel_APP_COMPONENT = [
  MaterielAppComponent,
  MaterielContainerComponent,
  MaterielCommonlyComponent,
  MaterielDataModifyComponent,
  ReturnServiceComponent,
  MaterielApplyTemplateComponent,
  ExtendPlatformComponent,
  ExtendMaterielComponent,
  ExtendMaterielMyApplyComponent,
  ExtendMaterielMyApprovalComponent,
  BatchCreateMaterielComponent,
  MaterielChangeComponent,
  CreateNewMaterielComponent,
  MaterielDataModifyMyApplyComponent,
  MaterielDataModifyMyApprovalComponent,
  EditMaterielDataModifyComponent,
  EditMaterielApplyTemplateComponent,
  EditMaterielNewReturnService,
  SelectSearchComponent,
  SelectSearchDialogComponent,
  EditSeeReturnServiceComponent,
  EditMaterielPlatComponent,
  EditMaterielExtendMaterielComponent,
  EditSeeCommonlyMateriel,
  ApplyModulesComponent,
  TreeComponent,
  SearchTreeComponent,
  MaterielChangeMyApplyComponent,
  MaterielChangeMyApprovalComponent,
  EditNewMaterielChangeComponent,
  EditNewMaterielChangeSalesListComponent,
  EditApprovalMaterielChangeComponent,
  EditExtendMaterileApprovalDetail,
  EditNewMaterielFirstApprovalUserComponent,
  MaterialMaintenanceHuaweiComponent,
  EditMaterialMaintenancehwComponent,
  BatchMaterialPriceEditComponent,
  BatchMaterialPriceListComponent,
  BatchMaterialPricePopErrMesComponent,
  BatchMaterialCreatComponent
];
