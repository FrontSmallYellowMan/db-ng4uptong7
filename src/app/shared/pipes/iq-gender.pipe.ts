
import { Pipe, PipeTransform } from '@angular/core';
import { iqRefactorPipe } from "./iq-refactor.pipe";
/**
不知道为什么用./index 导入的iqRefactorPipe 不识别
*/
@Pipe({ 'name': 'iq_gender' })
export class iqGenderPipe extends iqRefactorPipe {

    constructor(){
      super();
    }

    transform(key: string, expression: any[]) : string {
      return super.transform(key,"男,1;女,2;不详,3");
    }
}
