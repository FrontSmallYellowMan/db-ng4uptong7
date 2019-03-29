import { Injectable } from '@angular/core';
import { WindowService } from 'app/core';

export class date {
  constructor(public id: number, public ct: Array<any>) { }
}
export class tab {

}
let dates: date[] = [
  new date
    (11, [
      { "行项目号": "000010", "物料号": "000000000038312862", "物料描述": "NETBACKUP ENT SERVER软件及服务", "数量": "1", "工厂": "21V7", "库存地": "0601", "批次": "", "原销售总额": "2", "原返款金额": "0" }
    ]),
  new date
    (12, [
      { "行项目号": "000010", "物料号": "000000000038312862", "物料描述": "NETBACKUP ENT SERVER软件及服务", "数量": "1", "工厂": "21V7", "库存地": "0601", "批次": "", "原销售总额": "2", "原返款金额": "0" }
    ]),
  new date
    (13, [
      { "行项目号": "000010", "物料号": "000000000038312862", "物料描述": "NETBACKUP ENT SERVER软件及服务", "数量": "1", "工厂": "21V7", "库存地": "0601", "批次": "", "原销售总额": "2", "原返款金额": "0" }
    ])
];

@Injectable()
export class tabService {
  constructor(private WindowService: WindowService) { };

  getTabs() {
    var tabs = [];
    for (var i = 0; i < dates.length; i++) {
      tabs.push(dates[i].id)
    }
    return tabs;
  }
  getHead(id) {
    var head = [];
    for (var i = 0; i < dates.length; i++) {
      if (id == dates[i].id) {
        for (var j = 0; j < dates[i].ct.length; j++) {
          if (j == 0) {
            for (var key in dates[i].ct[j]) {
              head.push(key);
            }
          }
        }
        return head;
      }
    }
  }
  public table = [];
  getTable(id) {
    for (var i = 0; i < dates.length; i++) {
      if (id == dates[i].id) {
        this.table = dates[i].ct;
        return this.table
      }
    }
  }
  
  addItems(e) {
    let currentId:any;
    currentId = +e[e.length - 1].projcode + 10;
    let nowIdLen=(currentId+"").length;
    for( var i=0;i<6-nowIdLen;i++){
        currentId = "0" + currentId;
    }
    e.push(
        {
          "projcode": currentId,
          "originalmaterialcode": "",
          "originaldescription": "",
          "num": "",
          "factory": "",
          "originalstoragelocation": "",
          "originalbatchno": "",
          "originalmoney": "",
          "originalbackmoney": "",
          "deliveryno": "",
          "CURRENCY": ""
        }
      )
  }
  removeItems(tab,item) {
    let index = tab.indexOf(item);
    if(tab.length>1){
       tab.splice(index, 1);
    }
  }
  //验证字符串是否是数字
  checkNumber(theObj) {
    let reg = /^[0-9]*[1-9][0-9]*$/;
    let reg1 = /^\d{2}$/;
    if (reg.test(theObj)) {
      return true;
    }
    else if (reg1.test(theObj)) {
      return true;
    }else {
       return false;
    } 
  }
  
  //验证4个字符
  checkFour(str){
    let reg=/^\w{4}$/;
    if(!reg.test(str))
    {
      this.WindowService.alert({ message: '请输入四位字符', type: 'success' });
    }
}
  //验证整数
  checkInteger(str){
    let reg=/^\+?[1-9][0-9]*$/;
    if(!reg.test(str))
    {
      this.WindowService.alert({ message: '请输入整数', type: 'success' });
    }
  }
  //验证小数
  checkFloat(item) {
    if (this.checkNumber(item) == false) {
      this.WindowService.alert({ message: '请输入规范的数字，可保留两位小数', type: 'success' });
      item = '';

      return false;
    }
  }
  //初始化首项active为true

  // getDemo(id: number | string) {
  //   return this.getDemoes()
  //     .then(Demoes => Demoes.find(Demo => Demo.id === +id));
  // }
  // else if (e < 0) {
  //   this.WindowService.alert({message:'输入不能为负数',type:'success'});
  //   e = '';
  //   return false;
  // }
}
