/**
 * 作用：转换大小写指令
 * 日期：2018年-6月
 * 开发者：weihefei
 */


import { Directive,HostListener,Input,Optional } from '@angular/core';
import { NgModel,NgControl } from '@angular/forms';

@Directive({ selector: 'input[conversionCase],textarea[conversionCase]' })
export class ConversionCaseDirective {

  @Input() conversionStatus:string="upper";//是转化大写还是小写（upper：大写，lower：小写）
  @Input() savePlace:string='';//为了解决与maxlength的不兼容问题，设置保留几位输入数据

  constructor(@Optional() private ng: NgModel,@Optional() private nc: NgControl) { }

  //监听宿主元素的input事件
  @HostListener("input", ['$event.target'])
  inputEvent(el){

    //如果设置了保留的位数，就截取输入的值
    if(this.savePlace&&el.value.length > parseInt(this.savePlace)) {
      el.value=el.value.substring(0,parseInt(this.savePlace)); 
  
    }

    if(el&&this.conversionStatus==='upper'){
      el.value=el.value.toUpperCase();
    }else if(el&&this.conversionStatus==='lower'){
      el.value=el.value.toLowerCase();
    }else{
      return
    }

    if(this.ng){//使用模板表单时，重置ngModel绑定的值
      this.ng.reset(el.value);
    }

    if(this.nc){//使用响应式表单时，重置formcontrol绑定的值
      this.nc.reset(el.value);
    }
  }

    //监听宿主元素keydown的事件
    @HostListener("keydown", ['$event'])
    keydownEvent(el) { 
    if(el.ctrlKey&&el.keyCode===90&&el.target.value) {//如果在宿主元素上使用ctrl+z，则清空宿主元素的值
      console.log('触发事件');
      el.target.value='';

      if(this.ng){//使用模板表单时，重置ngModel绑定的值
        this.ng.reset(el.target.value);
      }
  
      if(this.nc){//使用响应式表单时，重置formcontrol绑定的值
        this.nc.reset(el.target.value);
      }

    }else {
      return;
    }
        
    }

}