import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'Billmoney',
    pure: false
})

export class PipeBillComponent2 implements PipeTransform {

    transform(table: Array<any>): number {
        var rex = 0;
        if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                rex += +table[i].money
            }
        }
        if(!rex){
            rex = 0;
        }
        return rex;
    }
}