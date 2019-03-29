/**
 * 作用：只能输入数字的指令
 * 日期：2018年-4月
 * 开发者：weihefei
 */

import { Directive, HostListener, Renderer2, ElementRef, Optional, Input } from '@angular/core';
import { NgModel,NgControl } from "@angular/forms";

@Directive({ selector: 'input[only-number]' })
export class OnlyNumberDirective {

  numberReg: RegExp = /^[\d]*$/g;//验证数字的正则
  spotReg:RegExp=/[.]/g;//验证小数点的正则
   @Input() onlyNumberSeveralDigits: string = "2";//保留几位小数

  constructor(@Optional() private ng: NgModel, @Optional() private nc: NgControl) { }

  @HostListener('input', ['$event.target'])
  inputNumber(el) {
    let elArray: any = [];
    if (el.value) {

      [].forEach.call(el.value, element => {//遍历输入的字符串
 
        if(elArray.indexOf('.')!==-1&&(elArray.length-elArray.indexOf('.'))>parseInt(this.onlyNumberSeveralDigits)){return;}//如果包含'.',则判断位数，达到指定位数，则返回

        if (element.search(this.numberReg) != -1) {//如果输入的字符是数字        
          elArray.push(element);//将字符push进数组   
        }

        if(this.onlyNumberSeveralDigits!='0'&&element.search(this.spotReg) != -1&&elArray.indexOf('.')===-1){//如果输入的是小数点且数组中不存在小数点，则将点push进数组
          elArray.push(element);//将字符push进数组
        }

        if (elArray.indexOf(".") != -1) {//如果包含一个小数点，那么小数点后面显示指定的位数
          elArray = elArray.slice(0, elArray.indexOf(".")+1 + parseInt(this.onlyNumberSeveralDigits));//分割数组，保存指定的位数
        }
        el.value = elArray.join("");//将数组合并为字符串

      })
    }
  }

  //监听宿主元素的blur事件
  @HostListener("blur", ['$event.target'])
  blurInputNumber(el) {
    //console.log(el.value);
    if (el.value && el.value.indexOf(".") === -1&&this.onlyNumberSeveralDigits!='0') {//如果输入值不包含小数点
      el.value = el.value + '.';//则在输入值的末尾增加小数点
      for (let i = 0; i < parseInt(this.onlyNumberSeveralDigits); i++) {//根据输入属性的值，来判断保留几位小数（在末尾补充几个0）
        el.value += "0";
      }
      el.value = el.value.substring(el.value.search(/[1-9]/g));//去掉字符串中小数点前多余的“0”，例如“0000434”，结果为：“434”
    }

    if (el.value && el.value.indexOf(".") != -1) {//如果输入数据是小数

      if (el.value.indexOf(".") > el.value.search(/[1-9]/g)) {//如果小数点的下标值大于第一个非“0”数字的下标值
        el.value = el.value.substring(el.value.search(/[1-9]/g));//去掉字符串中小数点前多余的“0”，例如“0000434.44”，结果为：“434.44”                
      } else {
        // el.value = '0.' + el.value.substring(el.value.search(/[1-9]/g));//去掉字符串中小数点前多余的“0”，例如“0000434.44”，结果为：“434.44”                        
      }

      let elValueLastDigit:string=el.value.split(".")[1];//获取输入数据的后两位
      if(!elValueLastDigit){
        for(let i=0;i<parseInt(this.onlyNumberSeveralDigits);i++){
          el.value=el.value+"0";//在输入字符串的末尾补“0”
        }
      }

      if(elValueLastDigit.length>0&&elValueLastDigit.length<parseInt(this.onlyNumberSeveralDigits)){//如果输入数据的后两位的位数小于指定的位数
        for(let i=0;i<(parseInt(this.onlyNumberSeveralDigits)-elValueLastDigit.length);i++){
          el.value=el.value+"0";//在输入字符串的末尾补“0”
        }
      }

    }else{
      el.value = el.value.substring(el.value.search(/[1-9]/g));//去掉字符串中小数点前多余的“0”，例如“0000434.44”，结果为：“434.44”                      
    }

    if(this.nc) {
      if(el.value){
        this.nc.control.reset(el.value);
      }else{
        this.nc.control.touched;
      }
    }

    if (this.ng) {
      this.ng.update.emit(el.value);
    }

    
  }

      //监听宿主元素keydown的事件
      @HostListener("keydown", ['$event'])
      keydownEvent(el) { 
      if(el.ctrlKey&&el.keyCode===90&&el.target.value) {//如果在宿主元素上使用ctrl+z，则清空宿主元素的值
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