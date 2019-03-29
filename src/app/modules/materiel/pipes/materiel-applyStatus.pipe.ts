import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'applyStatus'
})

export class MaterielApplyStatusPipe implements PipeTransform {
    transform(value: any, exponent: any): any {

        // let stateOne="草稿";
        // let stateTwo="已完成";

        // let stateExtendOne="未扩展";
        // let stateExtendTwo="部分扩展";
        // let stateExtendThree="全部扩展";

        let stateName: any;//

        if (exponent == undefined) {

            switch (value) {
                case "0":
                    stateName = "草稿";
                    break;
                case "1":
                    stateName = "已完成";
                    break;
                default:
                    break;
            }
            return stateName;

        } else if (exponent === "extend") {//扩展物料对应参数，当给管道赋值“extend”时自动调用

            switch (value) {
                case "0":
                    stateName = "未扩展";
                    break;
                case "1":
                    stateName = "部分扩展";
                    break;
                case "2":
                    stateName = "全部扩展";
                    break;
                case "3":
                    stateName = "扩展中";
                    break;
                default:
                    break;
            }
            return stateName;

        } else if (exponent === "status") {
            switch (value) {
                case 1:
                    stateName = "已完成";
                    break;
                case 2:
                    stateName = "部分扩展完成";
                    break;
                case 3:
                    stateName = "扩展失败";
                    break;
                case 6:
                    stateName = "待审批";
                    break;
                case 7:
                    stateName = "驳回";
                    break;
                case 8:
                    stateName = "全部";
                    break;
                default:
                    break;
            }
            return stateName;
        } else if (exponent === "extendMode") {
            switch (value) {
                case 0:
                    stateName = "扩展工厂";
                    break;
                case "0":
                    stateName = "扩展工厂";
                    break;
                case 1:
                    stateName = "扩展批次";
                    break;
                case 2:
                    stateName = "扩展库存地";
                    break;
                default:
                    break;
            }
            return stateName;
        }

    }
}