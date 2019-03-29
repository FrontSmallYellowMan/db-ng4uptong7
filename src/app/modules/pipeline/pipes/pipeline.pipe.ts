import { Pipe, PipeTransform } from '@angular/core';
// import { pipe } from 'rxjs';

@Pipe({
    name: 'pipelinePipe' 
})

export class PipelinePipe implements PipeTransform{
    constructor(){}

    transform(value: any, exponent: any){
        let result: any;

        if(exponent === 'projectProgress'){ // 状态转换为进度
            switch(value){
                case 1 : result = '20%'; break;
                case 2 : result = '40%'; break;
                case 3 : result = '60%'; break;
                case 4 : result = '80%'; break;
                case 5 : result = '100%'; break;
                case 6 : result = '0%'; break;
                default: break;
            }
        }

        return result;
    }
}