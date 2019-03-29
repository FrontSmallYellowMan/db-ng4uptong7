import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'iqDate'
})
export class IqDatePipe implements PipeTransform {
  transform(value: any, format: string = ""): string {
    
    return moment(value).isValid()? moment(value).format(format) : value;
  }
}
