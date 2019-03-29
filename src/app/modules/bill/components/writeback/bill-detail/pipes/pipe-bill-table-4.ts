import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'BillTableAddNum4',
    pure: false
})

export class PipeBillComponent4 implements PipeTransform {
    transform(table: any): any {
        var rex = 0;

        if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                rex += +table[i].backmoney
            }
        }
        if(!rex){
            rex = 0;
        }
        return rex ;
    }

}