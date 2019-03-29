import { Injectable } from '@angular/core';
/**
徐超 2017年04月20日10:03:08
用户自定义设置，放置单页长度
*/
export class CustomSetting {
  public pageSize= 10;

  //默认赋值的解构
  init({
    "pageSize":pageSize = 10
  }){
    this.pageSize = pageSize;
  }
  constructor(setting?:string){
    let _obj;
    if(setting){
      _obj = JSON.parse(setting);
    }else{
      _obj = {};
    }
    this.init(_obj);
  }
};

let itemName = "iq_custom_setting";

@Injectable()
export class CustomSettingService {

  constructor() {
    let setting_str = window.localStorage.getItem(itemName)
    this.setting = new CustomSetting(setting_str);

  }

  private setting: CustomSetting;

  private checkAndSet(key,value){
    if(key === "pageSize" ){
      if( typeof value !== "number"){
        if(Number.parseInt(value) != value){
          return "pageSize must be number";
        }
      }
      this.setting[key] = Number.parseInt(value);
      return ;
    }
  }
  private saveStorage(){
    window.localStorage.setItem(itemName,JSON.stringify(this.setting));
  }
  public set(key, value) {
    let checkRet = this.checkAndSet(key,value);
    if(checkRet){
      //校验错误 弹出异常
      console.error(checkRet);
      return ;
    }
    this.saveStorage();
  }
  getSetting() {
    return this.setting;
  }
}
