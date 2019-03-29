// Angular Imports
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HttpServer } from '../../shared/services/db.http.server';
import { RULECONFIGCOMPONENT,RULECONFIGCOMPONENT_APP_ENTRY_COMPONENT } from './index';
import { RuleConfigRoutingModule } from './ruleconfiguration-routing.module';
import { ContractRuleConfigService } from './services/contractruleconfig.service';
import { CommunicateService } from "./services/communicate.service";
import { PurchaseApplicationService } from "./services/purchaseApplication.service";
import { RuleConfigurationSelectPopModelService } from "./services/rule-configuration-select-pop-model.service";

import { OnlyItcodeDirective } from "./directives/only-itcode.directive";

@NgModule({
    imports: [
        SharedModule,
        RuleConfigRoutingModule
    ],
    declarations: [ RULECONFIGCOMPONENT,OnlyItcodeDirective ],
    entryComponents: [RULECONFIGCOMPONENT_APP_ENTRY_COMPONENT],
    providers: [ HttpServer,ContractRuleConfigService,CommunicateService,PurchaseApplicationService,RuleConfigurationSelectPopModelService ]
})
export class RuleConfigAppModule { }