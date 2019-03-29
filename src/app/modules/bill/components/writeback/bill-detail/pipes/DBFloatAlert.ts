import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'DBFloatAlert',
    pure: false
})

export class DBFloatAlertComponent implements PipeTransform {
    transform(e:any): any {
        // let reg = new RegExp(/^\d+\.[0-9]{2}/);
        // if(reg.test(e)){
        //     return e;
        // }else if(!reg.test(e)){
        //     return '';
        // }
        console.log(e);
        return e;
    }

}