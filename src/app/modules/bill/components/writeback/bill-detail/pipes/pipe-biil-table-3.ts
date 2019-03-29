import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'BillTableAddNum3',
    pure: false
})

export class PipeBillComponent3 implements PipeTransform {
    transform(table: any): any {
        let rex =0;
        // rex = value.新销售总额-value.新返款金额 
         if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                rex += +table[i].originalbackmoney
            }
        }
        if(!rex){
            rex = 0;
        }
        return rex;
    }

}