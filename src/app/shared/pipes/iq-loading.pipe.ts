import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loading'
})
export class iqLoadingPipe implements PipeTransform {
  transform(value: any, format: string = "获取中...") {
    return value === undefined || value === null ? format : value;
  }
}
