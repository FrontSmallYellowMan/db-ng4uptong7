import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'backZero',
    pure: false
})

export class backZeroComponent implements PipeTransform {
    transform(e:any): any {
        if(!e){
            e = 0;
        }
        return e;
    }

}