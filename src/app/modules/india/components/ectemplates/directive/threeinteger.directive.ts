/**
 * 作用：只能输入最大三位正整数
 * 开发者：haojianyang
 */

import { Directive, HostListener, Optional, Input } from '@angular/core';
import { NgModel, NgControl } from "@angular/forms";
import { WindowService } from "../../../../../core/index";

@Directive({ selector: 'input[largest-three-integer]' })
export class LargestThreeInteger {

  constructor(
    private windowService: WindowService,
    @Optional() private ng: NgModel, 
    @Optional() private nc: NgControl) { }

  @HostListener('blur', ['$event'])
  inputNumber(el) {
    if (typeof el.target.value !== 'number' && isNaN(el.target.value)) {
      el.target.focus()
      el.target.value = "";
      this.windowService.alert({ message: "请输入数字", type: "fail" });
    }else{
      if(el.target.value.length > 3){
        el.target.focus()
        el.target.value = "";
        this.windowService.alert({ message: "请输入最大三位正整数", type: "fail" });
      }
    }
  }

}