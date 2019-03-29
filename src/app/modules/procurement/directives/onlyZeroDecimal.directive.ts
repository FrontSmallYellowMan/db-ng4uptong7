/* 
    验证输入框只能0-1的正数 小数
    by zhenglya 2018-04-20
*/
import { ElementRef, HostListener, Directive,Input } from '@angular/core';
import { WindowService } from 'app/core';

@Directive({
    selector: '[onlyZeroDecimal]'
})

export class OnlyZeroDecimal {
  @Input('onlyZeroDecimal') inputValue: string;//上一步内容 keydown时取值

  @HostListener('keydown') onEvent(event) {

    event = event || window.event;
    let keyCode = event.keyCode;
    let key = event.key;
    if ((keyCode >= 48 && keyCode <= 57)//输入数字
        || keyCode == 8 //backspace
        || keyCode == 37 //光标向左
        || keyCode == 39 //光标向右
        || keyCode == 190 //输入小数点
    ) {
        event.returnValue = true;
    } else {
        event.returnValue = false;
    }

  }

  @HostListener('keyup') onUpEvent(event) {
    if(!this.inputValue && this.inputValue!="0"){//空值不校验  为0时需要校验
        return;
    }

    let value = parseFloat(this.inputValue);
    if (value < 0 || value > 1) {
        this.windowService.alert({ message: "输入非法,请输入0-1的小数", type: "warn" });
        this.element.nativeElement.value = "";
    }

  }

  constructor(private element: ElementRef,
    private windowService: WindowService
  ) {
  }
}
