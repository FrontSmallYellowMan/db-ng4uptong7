import { Directive,HostListener,Input,Optional } from '@angular/core';
import { NgModel,NgControl } from '@angular/forms';

@Directive({ selector: 'input[only-itcode]' })
export class OnlyItcodeDirective {

  reg:RegExp=/^[a-zA-z0-9,]*$/g;

  constructor(@Optional() private ng: NgModel,@Optional() private nc: NgControl) {}

  @HostListener('input',['$event.target'])
  filterContent(el){
    let dataArray=[];
    if(el.value){

      [].forEach.call(el.value,(item)=>{//遍历字符串，将符合正则验证的存入
        if(item.search(this.reg)!=-1){

          dataArray.push(item);
        } 
      });
      el.value=dataArray.join('');//将数组转为字符串
      // el.value=el.value.replace(this.reg,'');
    }

    if(this.ng){
      this.ng.reset(el.value);
    }

    if(this.nc){
      this.nc.reset(el.value);
    }
  }

  @HostListener('blur',['$event.target'])
  inputOver(el){

    if(el.value){
      el.value[el.value.length-1]==',' ? el.value=el.value.substr(0,el.value.length-1):'';

      if(this.ng){
        this.ng.reset(el.value);
      }
  
      if(this.nc){
        this.nc.reset(el.value);
      }
    }
  }


}