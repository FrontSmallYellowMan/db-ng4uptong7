import { FactoryProvider } from "@angular/core";
import { Http } from '@angular/http';

import { ContractListService } from './contract-list.service';
import { SubmitMessageService } from './submit-message.service';
import { ProcurementListDataService } from './procurement-listData.service';
import { ProcumentOrderNewService } from './procumentOrder-new.service';
import { ProcurementTemplateService } from './procurement-template.service';
import { ShareDataService } from './share-data.service';
import { ShareMethodService } from "./share-method.service";
import { ApprovalMethodService } from "./approval-method.service";
import { NASelectService } from "./NA-select.service";
import { SelectSealsService } from "./purchase-contractInfo.service";
import { ERPOrderChangeApiServices } from "./erporderchange-api.services";
import { PrepareApplyCommunicateService } from "./communicate.service";
import { ScTemplateService } from "../../india/service/sc-template.service";

// UB
import { UB_RelatedService } from './UB-related.service';



export { ContractListService, SubmitMessageService,ProcurementListDataService,
        ProcumentOrderNewService,ProcurementTemplateService,ShareDataService,
        ShareMethodService,ApprovalMethodService,NASelectService,SelectSealsService,ERPOrderChangeApiServices,PrepareApplyCommunicateService,
        ScTemplateService, UB_RelatedService };


export let PROCUREMENT_PROVIDERS = [
    ContractListService, SubmitMessageService,ProcurementListDataService,
    ProcumentOrderNewService,ProcurementTemplateService,ShareDataService,
    ShareMethodService,ApprovalMethodService,NASelectService,SelectSealsService,ERPOrderChangeApiServices,PrepareApplyCommunicateService,
    ScTemplateService, UB_RelatedService
];
