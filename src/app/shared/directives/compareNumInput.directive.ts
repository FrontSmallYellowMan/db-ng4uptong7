/**
 * 作用：比较两个关联文本框数字大小，用于范围输入
 * 日期：2018年-8月
 * 开发者：liumingyuan
 */

import { Directive, HostListener, Optional, Input } from '@angular/core';
import { NgModel, NgControl } from "@angular/forms";

import { WindowService } from '../../core';

declare var window;

@Directive({ selector: 'input[compare-number]' })
export class CompareNumInputDirective {
    // 当前目标的值
    public targetValue: any;

    // 比较目标的值
    @Input() comparedValue: any;
    // 比较类型
    @Input() comparedType: string;

    constructor(@Optional() private ng: NgModel, @Optional() private nc: NgControl, private windowService: WindowService) { }

    // @HostListener('input', ['$event.target'])
    // inputNumber(el) {
    //     setTimeout(() => {
    //         this.compareValue(el.value);
    //     }, 2000);
    // }

    //监听宿主元素的blur事件
    @HostListener("blur", ['$event.target'])
    blurInputNumber(el) {
        this.compareValue(el.value);
    }
    // 比较，并确定是否清空
    public compareValue(value) {
        let result;
        // 赋值
        this.targetValue = value;
        // 转换
        if (this.targetValue === '' || this.comparedValue === '') { // 其中一个不填写
            result = 1;
        } else {
            this.targetValue = isNaN(Number(this.targetValue)) ? 0 : Number(this.targetValue);
            this.comparedValue = isNaN(Number(this.comparedValue)) ? 0 : Number(this.comparedValue);
            // 比较
            switch (this.comparedType) {
                case 'over': result = this.targetValue - this.comparedValue; break;
                case 'under': result = this.comparedValue - this.targetValue; break;
                default: result = -1;
            }
        }

        // 不符合，不清空，提示
        if (result < 0) {
            this.windowService.alert({ message: "返款范围后者必须大于等于前者", type: "fail" })
        }
    }

    // 清空
    public resetValue() {
        if (this.nc) {
            this.nc.control.reset('');
        }
    }
}