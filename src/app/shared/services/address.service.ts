import { Injectable} from '@angular/core';
import { IcheckDirective } from '../directives/icheck.directive';
/**
时间：2017-05-27
xuchaoh

全选服务-提供icheck使用
*/
@Injectable()
export class AddressService {
  constructor() {  }

      // var cityconfig = null;
      // var getCityConfig = function() {
      //     var url = "../../data/city.json";
      //     // var def = $q.defer();
      //     if (cityconfig == null) {
      //         $iq_http.http({
      //             url: url,
      //             type: "JSON",
      //             method: "GET"
      //         }).then(function(re) {
      //             cityconfig = re.data;
      //             def.resolve(re.data);
      //         }, function(e) {
      //             console.log(e);
      //         })
      //     } else {
      //         def.resolve(cityconfig);
      //     }
      //     return def.promise;
      // }
      // return {
      //     getCityConfig: getCityConfig,
      //     returnCityConfig: function() {
      //         return cityConfig;
      //     }
      // }


}
