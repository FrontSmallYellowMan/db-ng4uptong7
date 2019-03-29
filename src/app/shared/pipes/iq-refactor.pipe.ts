
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iq_refactor'
})
export class iqRefactorPipe implements PipeTransform {
  constructor(){}
  transform(key: string, expression?: any[] | string) : string {
      // debugger
      /*
       * 示例：{{ XXX | iq_refactor:"男,true;女,false"}}
       * array_str pattern val,key;val,key;key,value
       */
        if("string" == typeof expression){
          var tmp = expression+";";
          if(!!key){
            var r = new RegExp("([^;,]+),"+key+";")
            var result = tmp.match(r);
            if(result){
              return result[1];
            }
          }
        }else if("object" == typeof expression){
          if(!!key && "object" == typeof expression["value"]){
            for(var i in expression["value"]){
              if(expression["value"][i]==key){
                return i;
              }
            }
          }
          if(expression["def_val"]){
            return expression["def_val"];
          }
        }
      return ""
  }
}
