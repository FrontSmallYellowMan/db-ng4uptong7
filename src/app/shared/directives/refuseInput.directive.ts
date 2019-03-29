import { Directive, HostListener, ElementRef, Input, Optional } from '@angular/core';
import { NgModel, NgControl } from "@angular/forms";

@Directive({
    selector: '[refuse-input]'
})
/**
 * 用于处理禁止输入项
 * '-'用于连接多个正则
 */
export class RefuseInputDirective {
    constructor(private el: ElementRef, @Optional() private ng: NgModel, @Optional() private nc: NgControl) {
        console.log(222);
    }
    public refuseRegExp: string = ''; // 用于过滤的正则

    public isRefused: boolean = true; // 是否过滤

    @Input() leftSpace: boolean = false; // 是否留下空格
    // 过滤指令传值
    @Input() refuseWhat: string = '';

    @HostListener('input', ['$event.target']) onInput(el) {
        this.useReg(el);
    }
    @HostListener('blur', ['$event.target']) onBlur(el) {
        this.useReg(el);
    }
    /**
     * 分析出正则
     * @param singalRefuse 单个的指示符
     */
    analyseReg(singalRefuse) {
        let temp;

        switch (singalRefuse) {
            case 'chinese': temp = '[\\u4e00-\\u9fa5]'; break;
            case 'lowercase': temp = '[a-z]'; break;
            case 'uppercase': temp = '[A-Z]'; break;
            case 'special': temp = '[`\~\!@#\$\^\&\*\(\)=\|{}\':;,\\[\\].<>\\/\?~！￥……《》（）——｛｝【】‘’；：”“。，、？%\+-]'; break;
            default: temp = '';
        }

        return temp;
    }
    // 出正则
    createReg() {
        let regArray = this.refuseWhat.split('-');

        let result = '';

        if (regArray && regArray.length) {
            if(this.leftSpace){
                result += '\s*|';
            }

            for (let i = 0; i < regArray.length; i++) {
                let temp = this.analyseReg(regArray[i]);

                if(i != regArray.length - 1){
                    result += `${temp}|`;
                } else {
                    result += `${temp}`;
                }
            }

            if (result !== '') {
                this.isRefused = true;

                return result;
            }
        } else {
            this.isRefused = false;
        }
    }
    // 用正则
    useReg(el) {
        if (!this.isRefused) {
            return false;
        } else {
            this.refuseRegExp = this.createReg();

            let reg = new RegExp(this.refuseRegExp, 'g');

            // 这里直接替换不允许输入的值
            el.value = el.value.replace(reg, '');
            // 表单内交互
            if (this.nc) {
                if (el.value) {
                    this.nc.control.reset(el.value);
                } else {
                    this.nc.control.touched;
                }
            }

            if (this.ng) {
                this.ng.update.emit(el.value);
            }

        }
    }
}