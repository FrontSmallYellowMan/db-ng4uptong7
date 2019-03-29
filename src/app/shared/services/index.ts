import { FactoryProvider } from "@angular/core";
import { PersonAPIConfig } from "environments/environment";

import { Http } from '@angular/http';

import { AllCheckService } from "./allcheck.service";
import { AddressService } from "./address.service";
import { BreadcrumbService } from "./breadcrumb.service";
import { PersonService, Person } from "./person.service";
import { AuthenticationService } from "./authentication.service";
import { HeaderService } from "./db.header.service";
import { RecordAllowEditStateService } from "./recordalloweditstate.service";
import { DBselectService } from "./db-select.service";

export { BreadcrumbService, PersonService, Person, AuthenticationService,DBselectService};

export function iqPersonFactory(Http) {
  return new PersonService(PersonAPIConfig,Http);
}

export let iqPersonProvider: FactoryProvider =
  {
    provide: PersonService,
    useFactory: iqPersonFactory,
    deps: [Http]
  }

export let SHARED_PROVIDERS = [HeaderService,AllCheckService,AddressService,BreadcrumbService, iqPersonProvider, AuthenticationService, RecordAllowEditStateService,DBselectService];
