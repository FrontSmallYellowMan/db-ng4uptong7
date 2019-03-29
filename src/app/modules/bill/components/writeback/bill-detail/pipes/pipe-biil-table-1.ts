import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'BillTableOriginalmoney',
    pure: false
})

export class PipeBillComponent1 implements PipeTransform {

    transform(item): any {
        let rex = 0;
        if (item) {
            for (let i = 0, len = item.length; i < len; i++) {
                rex += +item[i].originalmoney
            }
        }
        return rex;
    }

}