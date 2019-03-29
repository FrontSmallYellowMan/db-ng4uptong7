/* 
    限制输入正整数的范围
    by zhenglya 2018-4-27
*/
import { ElementRef, HostListener, Directive,Input } from '@angular/core';
import { WindowService } from 'app/core';

@Directive({
    selector: '[numberRange]'
})

export class NumberRange {
  @Input('numberRange') inputValue: string;//当下的值 keyup时取值
  @Input('maxRange') maxRange: string;//允许的最大值

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

  @HostListener('keyup') onUpEvent(event) {

    if(!this.inputValue){ 
        return;
    }

    if (this.inputValue>this.maxRange) {
        this.windowService.alert({ message: "该物料剩余数量"+this.maxRange, type: "warn" });
        this.element.nativeElement.value = "";
    }

  }

  constructor(private element: ElementRef,
    private windowService: WindowService
    ) {
  }
}
