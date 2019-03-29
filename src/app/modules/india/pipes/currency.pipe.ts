import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyPipe'
})

export class CurrencyPipe implements PipeTransform {
    transform(currencycode: any): any {
        let currencyName: any;//
        switch (currencycode) {
            case "0001":
                currencyName = "人民币";
                break;
            case "0002":
                currencyName = "美元";
                break;
            case "0003":
                currencyName = "港元";
                break;
            case "0004":
                currencyName = "欧元";
                break;
        }
        return currencyName;

    }
}