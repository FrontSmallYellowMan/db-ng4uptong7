import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'BillSurplus',
    pure: false
})

export class PipeBillSurplus implements PipeTransform {

    transform(table): any {
        var rex = 0;
        if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                rex += +table[i].money
            }
        }
        var lex = 0;

        if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                lex += +table[i].backmoney
            }
        }
        if(!(rex - lex)){
           return 0;
        }
        return rex - lex;
    }

}