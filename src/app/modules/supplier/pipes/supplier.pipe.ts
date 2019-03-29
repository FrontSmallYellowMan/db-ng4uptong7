import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'supplierPipe'
})

export class SupplierPipe implements PipeTransform {
    transform(value: any, exponent: any): any {
         
        // let stateOne="草稿";
        // let stateTwo="已完成";

        // let stateExtendOne="未扩展";
        // let stateExtendTwo="部分扩展";
        // let stateExtendThree="全部扩展";

        let stateName:any;//

        if (exponent == undefined) {

            switch (value) {
                case 0:
                    stateName = "集团外-国内";
                    break;
                case 1:
                    stateName = "集团外-国外";
                    break;
                default:
                    break;
            }
            return stateName;

        }
        else if(exponent==="approvalType"){//供应商我的审批列表，用来匹配是新建供应商审批还是供应商修改审批

            switch (value) {
                case "1":
                    stateName = "新建供应商";
                    break;
                case "2":
                    stateName = "修改供应商";
                    break;
                default:
                    break;
            }
            return stateName;

        }
        else if(exponent==="supplierTrackPayType"){
            switch (value) {
                case 1:
                    stateName = "应付";
                    break;
                case 2:
                    stateName = "预付";
                    break;
                default:
                    break;
            }
            return stateName;

        }
        else if(exponent==="supplierTrackPaymentTerm"){
            switch (value) {
                case 1:
                    stateName = "0";
                    break;
                case 2:
                    stateName = "15";
                    break;
                case 3:
                    stateName = "30";
                    break;
                case 4:
                    stateName = "45";
                    break;
                case 5:
                    stateName = "60";
                    break;
                case 6:
                    stateName = "90";
                    break;
                case 7:
                    stateName = "银承";
                    break;
                case 8:
                    stateName = "LC";
                    break;
                case 9:
                    stateName = "其他";
                    break;
                default:
                    break;
            }
            return stateName;

        }
        
    }//账期,1:0,2:15,3:30,4:45,5:60,6:90,7:银承,8:LC,9:其他 
}