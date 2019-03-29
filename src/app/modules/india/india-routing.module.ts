import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndiaMainComponent } from './components/india-main/india-main.component';
import { ScListComponent } from './components/sc-list/sc-list.component';
import { ScSelecttplComponent } from './components/sc-selecttpl/sc-selecttpl.component';
import { ScCreatComponent } from './components/sc-creat/sc-creat.component';
import { ScViewComponent } from './components/sc-view/sc-view.component';
import { HardwareGeneralComponent } from "./components/ectemplates/compnents/hardwaregeneral/hardwaregeneral.component";
import { HardwareChinaThree } from "./components/ectemplates/compnents/hardchinathree/hardchinathree.component";
import { SoftwareStandardComponent } from "./components/ectemplates/compnents/softwarestandard/softwarestandard.component";
import { SoftwareMicroComponent } from "./components/ectemplates/compnents/softwaremicro/softwaremicro.component";
import { SoftwareAdobeComponent } from "./components/ectemplates/compnents/softwareadobe/softwareadobe.component";
import { InlandserviceoriginalComponent } from './components/ectemplates/compnents/inlandserviceoriginal/inlandserviceoriginal.component';
import { PcListComponent } from './components/pc-list/pc-list.component';
import { PcApplyComponent } from './components/pc-apply/pc-apply.component';
import { PcViewComponent } from './components/pc-view/pc-view.component';
import { ScChangeComponent } from './components/sc-change/sc-change.component';
import { ScRelieveComponent } from './components/sc-relieve/sc-relieve.component';
import { InlandservicenonoriginalComponent } from "./components/ectemplates/compnents/inlandservicenonoriginal/inlandservicenonoriginal.component";
import { HardwaregeneralRedoComponent } from "./components/ectemplates/compnents/hardwaregeneral-redo/hardwaregeneral-redo.component";
import { ScSealSearchComponent } from './components/sc-seal-search/sc-seal-search.component';
import { EcDisputedealtListComponent } from './components/ec-disputedealt-list/ec-disputedealt-list.component';
import { EcDisputedealttypeMaintenanceComponent } from "./components/ec-disputedealttype-maintenance/ec-disputedealttype-maintenance.component";
import { HuaweiserviceresaleComponent } from './components/ectemplates/compnents/huaweiserviceresale/huaweiserviceresale.component';
import { HuaweiownserviceComponent } from './components/ectemplates/compnents/huaweiownservice/huaweiownservice.component';
import { ScSingleSealCancelComponent } from './components/sc-singlesealcancel/sc-singlesealcancel.component';
import { ScUDRelieveComponent } from './components/sc-udrelieve/sc-udrelieve.component';

const IndiaRoutes: Routes = [
    { path :'', data:{'breadcrumb':''}, component: IndiaMainComponent,
      children: [
          { path :'', redirectTo: 'sclist' },
          {path :'sclist', component: ScListComponent},
          {path :'disputedealttype', component: EcDisputedealtListComponent},
          { path: 'new-dis', component: EcDisputedealttypeMaintenanceComponent },
          {path :'pclist', component: PcListComponent},
          {path :'sealsearch', component: ScSealSearchComponent}
      ]
    },
    {  path :'selecttpl',data:{'breadcrumb':''}, component: ScSelecttplComponent },
    {  path :'contract',data:{'breadcrumb':''}, component:  ScCreatComponent},
    {  path :'sc-change',data:{'breadcrumb':''}, component:  ScChangeComponent},
    {  path :'sc-singlesealcancel',data:{'breadcrumb':''}, component:  ScSingleSealCancelComponent},
    {  path :'sc-relieve',data:{'breadcrumb':''}, component:  ScRelieveComponent},
    {  path :'sc-udrelieve',data:{'breadcrumb':''}, component:  ScUDRelieveComponent},
    {  path :'contractview',data:{'breadcrumb':''}, component:  ScViewComponent},
    {  path :'tplmake',data:{'breadcrumb':''}, component: HardwareGeneralComponent },
    {  path :'hardwaregeneralredo',data:{'breadcrumb':''}, component: HardwaregeneralRedoComponent },
    {  path :'hchinathree',data:{'breadcrumb':''}, component: HardwareChinaThree },
    {  path :'softwarestandard',data:{'breadcrumb':''}, component: SoftwareStandardComponent },
    {  path :'softwaremicro',data:{'breadcrumb':''}, component: SoftwareMicroComponent },
    {  path :'softwareadobe',data:{'breadcrumb':''}, component: SoftwareAdobeComponent },
    {  path :'inlandserviceoriginal',data:{'breadcrumb':''}, component: InlandserviceoriginalComponent },
    {  path :'inlandservicenonoriginal',data:{'breadcrumb':''}, component: InlandservicenonoriginalComponent },
    {  path :'huaweiserviceresale',data:{'breadcrumb':''}, component: HuaweiserviceresaleComponent },
    {  path :'huaweiownservice',data:{'breadcrumb':''}, component: HuaweiownserviceComponent },
    {  path :'pc-apply',data:{'breadcrumb':''}, component: PcApplyComponent },
    {  path :'pc-view',data:{'breadcrumb':''}, component: PcViewComponent }
]

@NgModule({
    imports: [RouterModule.forChild(IndiaRoutes)],
    exports: [RouterModule]
})
export class IndiaRoutingModule {};
