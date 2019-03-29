/* 
    验证输入框只能输入两位小数
    并且在不够两位小数时 进行补充
    by zhenglya 2017-12-1
*/
import { ElementRef, HostListener, Directive,Input } from '@angular/core';
import { WindowService } from 'app/core';

@Directive({
    selector: '[supplyZeroToTwoDecimal]'
})

export class SupplyZeroToTwoDecimal {
  @Input('supplyZeroToTwoDecimal') inputValue: string;//当下的值 keyup时取值

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

  @HostListener('blur') onUpEvent(event) {
    if(!this.inputValue && this.inputValue!="0"){//空值不校验  为0时需要校验
        return;
    }

    let value = this.inputValue + "";
    let invid_twoDeci = /^^[0-9]+(\.[0-9]{0,2})?$$/;//两位小数
    let invid_oneDeci = /^^[0-9]+\.[0-9]{1}$$/;//一位小数
    let invid_integer= /^^[0-9]+$$/;//整数
    if (!invid_twoDeci.test(value)) {
        this.windowService.alert({ message: "输入非法,小数点后最多输入两位", type: "warn" });
        this.element.nativeElement.value = "";
    }
    else if(invid_oneDeci.test(value)){//一位小数
        this.element.nativeElement.value += "0";
    }
    else if(invid_integer.test(value)){//整数
        this.element.nativeElement.value += ".00";
    }

  }

  constructor(private element: ElementRef,
    private windowService: WindowService
    ) {
  }
}
