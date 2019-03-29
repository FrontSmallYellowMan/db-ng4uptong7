import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'batchMaterialPriceState'
})

export class BatchMaterialPriceStatePipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    
    let conversionValue:string;
    switch(value){
      case 0:
        conversionValue='全部成功';
        break;
      case 1:
        conversionValue='全部失败';
        break;
      case 2:
        conversionValue='部分成功';
        break;
      default:
        break;
    }

    return conversionValue;
  }
}