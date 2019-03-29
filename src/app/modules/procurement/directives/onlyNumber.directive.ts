/* 
    验证输入框只能输入整数
    by zhenglya 2017-11-8
*/
import { ElementRef, HostListener, Directive,Input } from '@angular/core';

@Directive({
    selector: '[onlyNumber]'
})

export class OnlyNumber {
  @Input('onlyNumber') inputValue: string;//上一步内容 keydown时取值

  @HostListener('keydown') onEvent(event) {

    event = event || window.event;
    let keyCode = event.keyCode;
    let key = event.key;
    if (((keyCode >= 48 && keyCode <= 57)//输入数字
        || keyCode == 8 //backspace
        || keyCode == 37 //光标向左
        || keyCode == 39 //光标向右
    ) && !(!this.inputValue && key == 0) //第一个不能输入0
    ) {
        event.returnValue = true;
    } else {
        event.returnValue = false;
    }

  }

  constructor(private element: ElementRef) {
  }
}
