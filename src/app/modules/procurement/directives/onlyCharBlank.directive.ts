/* 
    验证输入框只能输入字母和空格
    自动转化成大写
    by zhenglya 2018-04-20
*/
import { ElementRef, HostListener, Directive,Input,Optional } from '@angular/core';
import { NgModel,NgControl } from "@angular/forms";

@Directive({
    selector: '[onlyCharBlank]'
})

export class OnlyCharBlank {
  @Input('onlyCharBlank') inputValue: string;//上一步内容 keydown时取值

  @HostListener('keydown') onEvent(event) {

    event = event || window.event;
    let keyCode = event.keyCode;
    let key = event.key;
    if ((keyCode >= 65 && keyCode <= 90)//输入字母
        || keyCode == 8 //backspace
        || keyCode == 37 //光标向左
        || keyCode == 39 //光标向右
        || keyCode == 32 //空格键
    ) {
        event.returnValue = true;
    } else {
        event.returnValue = false;
    }

  }

  @HostListener('keyup') onUpEvent(event) {

    this.element.nativeElement.value = this.inputValue.toLocaleUpperCase();

    if(this.ng){//使用模板表单时，重置ngModel绑定的值
        this.ng.reset(this.element.nativeElement.value);
      }
  
      if(this.nc){//使用响应式表单时，重置formcontrol绑定的值
        this.nc.reset(this.element.nativeElement.value);
      }

  }

  constructor(private element: ElementRef,
    @Optional() private ng: NgModel,
    @Optional() private nc: NgControl) {
  }


}
