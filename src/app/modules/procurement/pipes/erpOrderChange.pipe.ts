import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'erpOrderChangePipe'
})

export class erpOrderChangePipe implements PipeTransform {
    transform(value: any, exponent: any): any {

        let stateName:any;//

        if (exponent == undefined) {

            switch (value) {
                case 0:
                    stateName = "草稿";
                    break;
                case 1:
                    stateName = "审批中";
                    break;
                case 2:
                    stateName = "驳回";
                    break;
                case 3:
                    stateName = "已完成";
                    break;
                default:
                    break;
            }
            return stateName;

        }
        
    }
}