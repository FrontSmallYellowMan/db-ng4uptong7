import { ContractruleListComponent } from './contractrule-list/contractrule-list.component'
import {RuleConfigAppComponent } from './ruleconfig-app.component';
import { ContractruleEditComponent} from './contractrule-edit/contractrule-edit.component';
import { SearchCompanyComponent} from './select-value/searchcompany.component';
import { SearchBusinessUnitComponent } from './select-value/searchbusinessunit.component'
import { PurchaseApplicationEditComponent } from "./purchase-application/purchase-application-edit/purchase-application-edit.component";
import { PurchaseApplicationListComponent } from "./purchase-application/purchase-application-list/purchase-application-list.component";

//缺省页
import { DefaultPageComponent } from "./default-page/default-page.component";

//复选弹出框
import { RuleConfigurationSelectComponent } from "./rule-configuration-select/rule-configuration-select.component";
import { RuleConfigurationSelectModalComponent } from "./rule-configuration-select/rule-configuration-select-modal.component";
//选人组件，（作用：可复选，带删除）
import { RuleConfigurationSelectPersonComponent } from "./rule-configuration-select-person/rule-configuration-select-person.component";
import { RuleConfigurationSelectPersonPopModelComponent } from "./rule-configuration-select-person/rule-configuration-select-person-pop-model/rule-configuration-select-person-pop-model.component";

export{ContractruleListComponent,RuleConfigAppComponent,ContractruleEditComponent,RuleConfigurationSelectComponent,RuleConfigurationSelectModalComponent,PurchaseApplicationEditComponent,PurchaseApplicationListComponent,DefaultPageComponent,RuleConfigurationSelectPersonComponent,RuleConfigurationSelectPersonPopModelComponent};

export let RULECONFIGCOMPONENT=[ContractruleListComponent,RuleConfigAppComponent,ContractruleEditComponent,RuleConfigurationSelectComponent,RuleConfigurationSelectModalComponent,RuleConfigurationSelectModalComponent,

  SearchCompanyComponent,SearchBusinessUnitComponent,
  PurchaseApplicationEditComponent,
  PurchaseApplicationListComponent,
  DefaultPageComponent,
  RuleConfigurationSelectPersonComponent,
  RuleConfigurationSelectPersonPopModelComponent
];



export let RULECONFIGCOMPONENT_APP_ENTRY_COMPONENT = [
  RuleConfigurationSelectModalComponent,
  RuleConfigurationSelectPersonPopModelComponent,
  SearchCompanyComponent,
  SearchBusinessUnitComponent
]