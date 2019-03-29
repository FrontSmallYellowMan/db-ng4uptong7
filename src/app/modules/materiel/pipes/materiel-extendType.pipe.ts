import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extendType'
})
export class MaterielExtendTypePipe implements PipeTransform {
  transform(value: string): string {
    let typeName: string;
    switch (value) {
      case "0":
        typeName = "扩展工厂";
        break;
      case "1":
        typeName = "扩展批次";
        break;
      case "2":
        typeName = "扩展库存地";
        break;
      default:
        break;
    }
    
    return typeName;
  }
}