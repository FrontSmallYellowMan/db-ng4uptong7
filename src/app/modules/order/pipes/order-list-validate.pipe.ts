import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderType'
})

export class OrderListValidatePipe implements PipeTransform {
  transform(value: any, type:string): any {
    let typeName:string;

    if(type==='orderType') {
      
      switch(value) {
        case '0001':
          typeName='欠款';
          break;
        case '0002':
          typeName='现金';
           break;
        case '0003':
           typeName='送货取支票';
           break;
        case '0005':
           typeName='厂商直发';
           break;
        case '0010':
           typeName='ZOC';
           break;
        case '0011':
           typeName='还借用';
           break;
        default:
           break;
      }
    }

    return typeName;
  }
}