import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dataModify'
})

export class MaterielDataModifyPipe implements PipeTransform {
    transform(value: any, exponent: any): any {
         
        // let stateOne="草稿";
        // let stateTwo="已完成";

        // let stateExtendOne="未扩展";
        // let stateExtendTwo="部分扩展";
        // let stateExtendThree="全部扩展";

        let stateName:any;//

        if (exponent == "通过") {
            stateName="通过";
            
            return stateName;

        }else if(exponent == "驳回"){
            stateName="驳回";
            
            return stateName;
        }else{
            stateName="申请中";           
            return stateName;
        }
        
    }
}