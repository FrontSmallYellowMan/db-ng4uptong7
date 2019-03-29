import { Directive, HostListener, Optional, Input,ElementRef,ViewChild } from '@angular/core';
import { NgModel,NgControl } from '@angular/forms';
declare var $;

@Directive({
  selector: 'input[trim],textarea[trim]'
})
export class TrimDirective {

@Input() trimReg:string;//传入的正则

  constructor(@Optional() private ng: NgModel,@Optional() private nc: NgControl) {}

  @HostListener('input', ['$event.target', '$event.target.value']) inputEvent(ele, v: string) {


    ele.value = v.replace(this.trimReg?eval(this.trimReg):/\s/g,'');

    // this.setCursortPosition(ele,this.getCursortPosition(ele));
    
    if(this.ng){
      this.ng.reset(ele.value);
    }

    if(this.nc){
      this.nc.reset(ele.value);
    }

  }

  //获取输入字符的当前光标位置的下标
  getCursortPosition(ele){
    let CaretPos = 0;   // IE Support
    if (ele.selection) {
        ele.focus();
        let Sel = ele.selection.createRange();
        Sel.moveStart ('character', -ele.value.length);
        CaretPos = Sel.text.length;
    }else if (ele.selectionStart || ele.selectionStart == '0'){//chrome,firefox
      CaretPos = ele.selectionStart;
    }
    // console.log(this.getCursortPosition(ele));
    return CaretPos;
  }

  //设置光标位置
  setCursortPosition(ele,pos){
    if(ele.setSelectionRange)
    {
        ele.focus();
        ele.setSelectionRange(pos,pos);
    }
    else if (ele.createTextRange) {
        var range = ele.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();

    }
  }

}