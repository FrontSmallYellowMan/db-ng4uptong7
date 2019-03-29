import { FactoryProvider } from "@angular/core";
import { Http } from '@angular/http';

import { FiscalAdjustService } from './fiscal-adjust.service';
import { FreezePersonnelService } from './freeze-personnal.service';
import { PlatformInventoryService } from './platform-inventory.service';
import { BorrowListService } from './borrow-list.service';
export { FiscalAdjustService, PlatformInventoryService, FreezePersonnelService,BorrowListService };


export let SHARED_PROVIDERS = [FiscalAdjustService, PlatformInventoryService, FreezePersonnelService,BorrowListService];
