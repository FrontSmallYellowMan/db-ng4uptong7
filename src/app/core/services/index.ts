
/**
导出为core里面所有资源
*/
import { HttpModule, Http, ConnectionBackend, RequestOptions, XHRBackend} from '@angular/http';
import { FactoryProvider } from "@angular/core";
import { iqHttpService } from "./iq-http.service";

import { HeaderBadgeService } from "./header.service";
import { ToolsService } from "./tools.service";
import { CustomSettingService } from "./custom-setting.service";
import { WindowService } from "./window.service";


export { URLSearchParams,RequestOptions } from "./iq-http.service";

// export function httpFactory(xhrBackend, requestOptions) {
//   return new iqHttpService(xhrBackend, requestOptions);
// };
export function httpFactory(xhrBackend, requestOptions, windowservice) {
  return new iqHttpService(xhrBackend, requestOptions, windowservice);
};

// export let iqHttpProvider: FactoryProvider =
// { provide: iqHttpService, useFactory: httpFactory, deps: [XHRBackend, RequestOptions] };

export let iqHttpProvider: FactoryProvider =
{ provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions,WindowService ] };


export { iqHttpService, HeaderBadgeService, ToolsService,CustomSettingService,WindowService};

export let CORE_PROVIDERS = [iqHttpProvider, HeaderBadgeService, ToolsService,CustomSettingService,WindowService];
