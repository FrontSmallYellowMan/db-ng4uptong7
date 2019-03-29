import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'isRecoveryPipe'
})

export class IsRecoveryPipe implements PipeTransform {
    transform(value: any): any {
        let name: any;//
        switch (value) {
            case "0":
            case 0:
                name = "否";
                break;
            case "1":
            case 1:
                name = "是";
                break;
            case "2":
            case 2:
                name = "PO";
                break;
        }
        return name;

    }
}