import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HttpServer } from '../../shared/services/db.http.server';
import { IndiaRoutingModule } from "./india-routing.module";
import { India_APP_COMPONENT } from './components/index';
import { India_APP_ENTRY_COMPONENT, IndiaDirective } from './components/index';
import { ScService } from "./service/sc-service";
import { ScSelectService } from "./service/sc-selecttpl.service";
import { PageRefresh } from "./service/pagerefresh.service";
import { ScTemplateService } from "./service/sc-template.service";
import { PcService } from "./service/pc-service";
import { CurrencyPipe } from "./pipes/currency.pipe";
import { IsRecoveryPipe } from "./pipes/isrecovery.pipe";
import { RecordAllowEditStateService } from "../../shared/services/recordalloweditstate.service";
import { ScRelieveService } from "./service/sc-relieve.service";
import { SealSearchService } from "./service/sc-seal-search.service";

@NgModule({
    imports: [
        SharedModule,
        IndiaRoutingModule
    ],
    declarations: [ India_APP_COMPONENT,CurrencyPipe,IsRecoveryPipe,IndiaDirective ],
    entryComponents:[India_APP_ENTRY_COMPONENT],
    providers: [ HttpServer,ScService,ScSelectService,ScTemplateService,ScRelieveService, PageRefresh, PcService, RecordAllowEditStateService, SealSearchService ]
})
export class IndiaAppModule { }
