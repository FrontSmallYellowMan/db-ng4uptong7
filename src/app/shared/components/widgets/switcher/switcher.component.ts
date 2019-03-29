/**
 * Created by min on 2017/5/10.
 */

import { Component,forwardRef,Input,Output,EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

@Component({
  selector:'iq-switcher',
  templateUrl: 'switcher.component.html',
  providers:[{  //首先写一个 provide 扩展 NG_VALUE_ACCESSOR 让 ng 认识它 .
    provide:NG_VALUE_ACCESSOR,
    useExisting:forwardRef(()=>SwitcherComponent),    //******************************************
    multi:true      //Multi providers让我们可以使用相同的Token去注册多个Provider,当我们使用对应的token去获取依赖项时，我们获取的是已注册的依赖对象列表。
  }]
})

export class SwitcherComponent implements ControlValueAccessor{

  switcher:any=false;
  private onChangeCallback:any={};
  private onTouchedCallback:any={};

  @Input('checked-value') checkedValue:any = true;
  @Input('unchecked-value') unCheckedValue:any = false;
  @Output() onChange = new EventEmitter();

  clickSwitch = ()=> {
    if(this.switcher == this.checkedValue){
      this.switcher = this.unCheckedValue;
    }else{
      this.switcher = this.checkedValue;
    }
    this.onChangeCallback(this.switcher);
    this.onTouchedCallback();
    this.onChange.emit(this.switcher);
  }

  writeValue(value: boolean) {   //writeValue是当外部数据修改时被调用来更新内部的
    this.switcher = value;  //调用时赋初值可以作用
  }

  registerOnChange(fn) {   //把这个 fn 注册到内部方法上, 当内部值更新时调用它 this.onChangeCallback();
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {   //也是一样注册然后调用当 touched
    this.onTouchedCallback = fn;
  }
}
