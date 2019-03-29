import { FactoryProvider } from "@angular/core";
import { Http } from '@angular/http';

import { HttpServer } from './../../../shared/services/db.http.server';
import { ContractMaterialService } from './contract-material.service';
import { OrderCreateService } from './order-create.service';
import { OrderListService } from './order-list.service';
import { OrderViewService } from './order-view.service';
import { MaterialDetailService } from './material-detail.service';
import { OrderCompletedService } from './order-completed.service';
import { CommunicateService } from "./communicate.service";
import { OrderExemptionService } from "./order-exemption.service";
// export { FiscalAdjustService };


export let ORDER_SERVICE = [HttpServer, ContractMaterialService, OrderCreateService,
  OrderListService, OrderViewService, MaterialDetailService, OrderCompletedService,CommunicateService,OrderExemptionService
];
