import { Injectable} from '@angular/core';
import { IcheckDirective } from '../directives/icheck.directive';
/**
时间：2017-05-27
xuchaoh

全选服务-提供icheck使用
*/
@Injectable()
export class AllCheckService {
  constructor() {  }
  //注册器，每个全选都会再这添加监听
  regs = {};

  /*检测是否选中*/
  private checkExist(id:string){
    if(this.regs[id]){
    }else{
      this.regs[id] = {all:null,children:[],fullcheckEventStoper:false};
    }
    return this.regs[id];
  }
  /**
  注册全选
  */
  register(id:string,input:IcheckDirective){
    let r = this.checkExist(id);
    r["all"] = input;
    //全选值变化的时候，改变子对象的值
    input.onChange.subscribe(()=>{
      let len = 0;
      //关闭子对象变化的触发
      r["fullcheckEventStoper"] = true;
      for(let i=0;i<r["children"].length;i++){
        if(!r["children"][i].disabled){
          r["children"][i].writeValue(input.checked);
          r["children"][i].onChangeCallback(input.checked);
          len++;
        }
      }
      r["fullcheckEventStoper"] = false;
      r["all"].onCount.emit(len);
    })
  }
  /**
  注册全选-子对象
  */
  registerChild(id:string,input:IcheckDirective){
    let r = this.checkExist(id);
    //添加子对象到列表
    if(r["children"].indexOf(input)<0){
      r["children"].push(input);
      //如果子对象值或者半选状态变化的时候，重置父对象值
      input.onChange.subscribe(()=>{
        this.checkAll(r);
      })
      input.onIndeterminate.subscribe(()=>{
        this.checkAll(r);
      })
    }
  }
  /**
  重新计算父对象值 为选中、不选、半选
  */
  checkAll(item){
    //如果是点击全选触发的子对象修改，不触发下面的重新计算
    if(item["fullcheckEventStoper"]){
      return;
    }
    let all = 0;//选中标记
    let none = 0;//未选中标记
    let half = false;//半选

    let list = item["children"];
    for(let i=0;i<list.length;i++){
      //如果是半选状态
      if(list[i].indeterminate != 0){
        half = true;
        all++;
      }else{
        if(list[i].checked){
          all++;
        }else{
          none++;
        }
      }
    }
    //选中和未选中 如果两个都不为0了，则半选
    if(half || 0 != (all * none)){
      item["all"].indeterminate = true;
    }
    else if(all == list.length){
      item["all"].writeValue(true);
      item["all"].onChangeCallback(true);
    }
    else if(none == list.length){
      item["all"].writeValue(false);
      item["all"].onChangeCallback(false);
    }
    item["all"].onCount.emit(all);
  }
  //注销全选
  unregister(id:string,input:IcheckDirective){
    let r = this.checkExist(id);
    if(r["all"] == input){
      r["all"] = null;
    }
  }
  //注销全选其中一个子对象
  unregisterChild(id:string,input:IcheckDirective){
    let r = this.checkExist(id);
    let index = r["children"].indexOf(input);
    r["children"].splice(index,1);
  }
}
