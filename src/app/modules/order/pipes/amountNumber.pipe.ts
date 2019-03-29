import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'iqNumber'
})
/**
 * @ngModule CommonModule
 * @whatItDoes Formats a number according to locale rules.
 * @howToUse `number_expression | number[:digitInfo]`
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * where `expression` is a number:
 *  - `digitInfo` is a `string` which has a following format: <br>
 *     <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>
 *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
 *   - `minFractionDigits` is the minimum number of digits after fraction. Defaults to `0`.
 *   - `maxFractionDigits` is the maximum number of digits after fraction. Defaults to `3`.
 *
 *
 */
export class IqNumberPipe implements PipeTransform {
    transform(value: any ,digits?: string): string {
        let initValue = value.toString();
        //数值拆分
        let interNumber = initValue.split(".")[0];
        let floatNumber = initValue.split(".")[1] || "0";

        //格式拆分
        digits = digits || "1.0-3";
        let digitsArr = digits.split(".");
        let minIntegerDigits = parseInt(digitsArr[0]);
        let digitsArr1 = digits.split(".")[1];
        let minFractionDigits = parseInt(digitsArr1.split("-")[0]);
        let maxFractionDigits = parseInt(digitsArr1.split("-")[1]);

        //整数
        let interNumberLength = interNumber.length;
        if(interNumberLength < minIntegerDigits){
            for(let i = 0; i < (minIntegerDigits-interNumberLength); i++){
                interNumber = "0" + interNumber;
            }
        }
        //整数位每三位加个","
        let num = interNumber.toString(), result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        //区分整数部分,仅剩一个字符时,是否是"-".避免(-,123.00)出现
        if (num && num !="-") {
            result = num + result;
        }else{
            result = num + result.slice(1);
        }
        interNumber = result;

        //小数部分
        if(minFractionDigits == 0 && floatNumber == "0"){
            return interNumber;
        }else{
            let floatNumberLength = floatNumber.length;
            if(floatNumberLength < minFractionDigits){
                for(let i = 0; i < (minFractionDigits-floatNumberLength); i++){
                    floatNumber = floatNumber + "0";
                }
            }
            if(floatNumberLength > maxFractionDigits){
                floatNumber = floatNumber.slice(0,maxFractionDigits);
            }
        }
        return interNumber + "." + floatNumber;
    };
}
