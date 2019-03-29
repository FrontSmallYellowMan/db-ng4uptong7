/* 
    验证输入框只能输入两位小数
    by zhenglya 2017-11-8
*/
import { ElementRef, HostListener, Directive,Input } from '@angular/core';
import { WindowService } from 'app/core';

@Directive({
    selector: '[onlyTwoDecimal]'
})

export class OnlyTwoDecimal {
  @Input('onlyTwoDecimal') inputValue: string;//当下的值 keyup时取值

  @HostListener('keydown') onDownEvent(event) {

    event = event || window.event;
    let keyCode = event.keyCode;
    let key = event.key;
    if ((keyCode >= 48 && keyCode <= 57)//输入数字
        || keyCode == 8 //backspace
        || keyCode == 37 //光标向左
        || keyCode == 39 //光标向右
        || keyCode == 190 //输入小数点
    ){
        event.returnValue = true;
    } else {
        event.returnValue = false;
    }

  }

  @HostListener('keyup') onUpEvent(event) {
    if(!this.inputValue && this.inputValue!="0"){//空值不校验  为0时需要校验
        return;
    }

    let value = this.inputValue + "";
    let invid = /^^[0-9]+(\.[0-9]{0,2})?$$/.test(value);
    if (!invid) {
        this.windowService.alert({ message: "输入非法,小数点后最多输入两位", type: "warn" });
        this.element.nativeElement.value = "";
    }

  }

  constructor(private element: ElementRef,
    private windowService: WindowService
    ) {
  }
}
