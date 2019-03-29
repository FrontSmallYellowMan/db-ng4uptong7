import { IndiaMainComponent } from './india-main/india-main.component';
import { ScListComponent } from './sc-list/sc-list.component';
import { ScCreatComponent } from './sc-creat/sc-creat.component';
import { ScSelecttplComponent } from './sc-selecttpl/sc-selecttpl.component';
import { ScUploadComponent } from './sc-creat/sc-accessory/sc-upload.component';
import { ScAccessoryComponent } from './sc-creat/sc-accessory/sc-accessory.component';
import { ScSealsComponent } from './sc-creat/sc-seals/sc-seals.component';
import { scSealsAddComponent } from './sc-creat/sc-seals/add-seals.component';
import { ScApproverComponent } from './sc-creat/sc-approver/sc-approver.component';
import { ScViewComponent } from './sc-view/sc-view.component';
import { ScWfApprovalComponent } from './sc-wf-approval/sc-wf-approval.component';
import { ProductdetailComponent } from "./ectemplates/common/productdetail/productdetail.component";
import { HardwareGeneralComponent } from "./ectemplates/compnents/hardwaregeneral/hardwaregeneral.component";
import { HardwareChinaThree } from "./ectemplates/compnents/hardchinathree/hardchinathree.component";
import { SoftwareStandardComponent } from "./ectemplates/compnents/softwarestandard/softwarestandard.component";
import { SoftwareMicroComponent } from "./ectemplates/compnents/softwaremicro/softwaremicro.component";
import { SoftwareAdobeComponent } from "./ectemplates/compnents/softwareadobe/softwareadobe.component";
import { InlandserviceoriginalComponent } from './ectemplates/compnents/inlandserviceoriginal/inlandserviceoriginal.component';
import { PcListComponent } from './pc-list/pc-list.component';
import { PcApplyComponent } from './pc-apply/pc-apply.component';
import { PcViewComponent } from './pc-view/pc-view.component';
import { EcHardwareComponent } from './ebecdetailtemplate/ec-hardware/ec-hardware.component';
import { EcDetailComponent } from './ebecdetailtemplate/ec-detail/ec-detail.component';
import { IndiaFirstmenuComponent } from './india-firstmenu/india-firstmenu.component';
import { ScChangeComponent } from './sc-change/sc-change.component';
import { ScRelieveComponent } from './sc-relieve/sc-relieve.component';
import { SelectSearchComponentCompany } from "./ectemplates/common/select-search-company/select-search-company.component";
import { SelectSearchBuyerComponent } from "./ectemplates/common/select-search-buyer/select-search-buyer.component";
import { LargestThreeInteger } from "./ectemplates/directive/threeinteger.directive";
import { SelectSearchComponentCity } from "./ectemplates/common/select-search-city/select-search-city.component";
import { SelectSearchComponentDistrict } from "./ectemplates/common/select-search-district/select-search-district.component";
import { MyEcTemplateComponent } from './ectemplates/common/my-ec-template/my-ec-template.component';
import { PaymentdetailComponent } from "./ectemplates/common/paymentdetail/paymentdetail.component";
import { InlandservicenonoriginalComponent } from "./ectemplates/compnents/inlandservicenonoriginal/inlandservicenonoriginal.component";
import { HardwaregeneralRedoComponent } from './ectemplates/compnents/hardwaregeneral-redo/hardwaregeneral-redo.component';
import { ScNoticeModalComponent } from './sc-notice-modal/sc-notice-modal.component';
import { ScApproverRedoComponent } from './sc-approver-redo/sc-approver-redo.component';
import { MultiApproverSelectComponent } from './multi-approver-select/multi-approver-select.component';
import { ScSealSearchComponent } from './sc-seal-search/sc-seal-search.component';
import { EcDisputedealttypeMaintenanceComponent } from './ec-disputedealttype-maintenance/ec-disputedealttype-maintenance.component';
import { SelectProjectComponent } from './select-project/select-project.component';
import { EcDisputedealtListComponent } from './ec-disputedealt-list/ec-disputedealt-list.component';
import { HuaweiserviceresaleComponent } from './ectemplates/compnents/huaweiserviceresale/huaweiserviceresale.component';
import { HuaweiownserviceComponent } from './ectemplates/compnents/huaweiownservice/huaweiownservice.component';
import { ScriskstatementComponent } from './sc-riskstatement/sc-riskstatement.component';
import { ScSingleSealCancelComponent } from './sc-singlesealcancel/sc-singlesealcancel.component';
import { ScUDRelieveComponent } from './sc-udrelieve/sc-udrelieve.component';

export let India_APP_COMPONENT = [
    IndiaMainComponent, ScListComponent, ScCreatComponent, ScSelecttplComponent,
    HardwareGeneralComponent, HardwareChinaThree, SoftwareStandardComponent, 
    ProductdetailComponent, ScUploadComponent, ScAccessoryComponent,
    ScSealsComponent, scSealsAddComponent, ScApproverComponent, ScApproverRedoComponent,MultiApproverSelectComponent,
    ScViewComponent, ScWfApprovalComponent, SoftwareMicroComponent,
    SoftwareAdobeComponent,PcListComponent,PcApplyComponent, 
    PcViewComponent, EcDetailComponent, EcHardwareComponent,
    IndiaFirstmenuComponent, ScChangeComponent, ScRelieveComponent,
    InlandserviceoriginalComponent,SelectSearchComponentCompany,HuaweiserviceresaleComponent,
    SelectSearchBuyerComponent,SelectSearchComponentCity,SelectSearchComponentDistrict,
    MyEcTemplateComponent, PaymentdetailComponent,InlandservicenonoriginalComponent,EcDisputedealtListComponent,
    HardwaregeneralRedoComponent,ScNoticeModalComponent,ScSealSearchComponent,EcDisputedealttypeMaintenanceComponent,SelectProjectComponent,
    HuaweiownserviceComponent,ScriskstatementComponent,ScSingleSealCancelComponent,ScUDRelieveComponent
];
export let India_APP_ENTRY_COMPONENT = [//entryComponents
    scSealsAddComponent, EcHardwareComponent, SelectSearchBuyerComponent, MyEcTemplateComponent,ScNoticeModalComponent,MultiApproverSelectComponent,SelectProjectComponent
];
export let IndiaDirective = [LargestThreeInteger];
