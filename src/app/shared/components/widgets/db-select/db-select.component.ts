/**
 * 作用：仿原生select下拉组件
 * 日期：2018-12-17
 * 开发者：weihefai
 */

/**
 * 使用方法：
 * @param：optionList 传入需要显示的下拉列表
 * @param：ngValue 绑定的需要显示的列表值
 * @param：selectValueAndName 传入需要显示的列表内容对象的名称和列表值的下标
 */
//<db-select placeholder='-请选择下拉内容' [optionList]="tempSelectList" [(ngModel)]="tempSelectValue" (ngModelChange)="getTempSelectValue()" name="testSelect" required #TestSelect="ngModel">
      //<db-select-option *ngFor="let item of tempSelectList;index as i" [ngValue]="item.value">{{item.name}}{{TestSelect.valid}}</db-select-option>
//</db-select>

import { Component, OnInit,Input,Output,ViewChild,ElementRef,forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DBselectService } from "../../../services/db-select.service";

declare var document,$;

@Component({
  selector: 'db-select',
  templateUrl: './db-select.component.html',
  styleUrls:['./db-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DBselectComponent),
      multi: true
    }
  ]
})

export class DBselectComponent implements OnInit {

  @Input() public placeholder:string="-请选择";//用来接收传入的placeholder
  @Input() public selectValueAndName:string='10';//保存需要获取的下拉列表的value和需要显示name
  @Input()
  set optionList(optionList:any) {//保存下拉列表
    if(this.selectValueAndName&&optionList) {
      this.resetOptionList(optionList);//重置下拉选择列表
    }
  }
   get optionList(): any{ return this._optionList; }

  public _optionList:any=[];//临时保存下拉列表
  public isShowOption:boolean=false;//是否显示下拉列表
  public selectValue:any='';//显示选择的列表值
  public viewSelectName:any='';//保存对应value值，需要在视图显示的名称

  private onChangeCallback:any={};//选择值变化的回调函数
  private onTouchedCallback:any={};//触发组件时的回调函数

  @ViewChild('mdbselect') mDBSelect:ElementRef;//注册为angularDOM元素

  constructor(
    private dbSelectService:DBselectService,
  ) { }

  ngOnInit() { 
   
    //接收选择下拉列表的值
    this.dbSelectService.getMySelectOptionState().subscribe(v=> {
      if(v) this.getValueToName(v);
    });

    document.addEventListener('mousedown',(e:any)=> {
      this.isCloseOptionList(e);
    });

  }

  ngOnDestroy() {
    document.removeEventListener('mousedown',(e:any)=> {
      this.isCloseOptionList(e);
    });
  }

  //判断点击组件外围时，隐藏下拉列表
  isCloseOptionList(e) {
     if($(e.target).length>0&&$(e.target)[0].className!=='m-db-select-option') {
       this.isShowOption=false;
     }
    //  if(e.target.class){}

  }


  //点击文本框，弹出下拉列表
  clickIsShowSelect() {
    this.isShowOption=true;
    this.onTouchedCallback();
  }

  //转换下拉列表为数组格式
  resetOptionList(optionList){
    optionList.forEach(element => {//遍历下拉列表
      let elementArray=[];//声明一个空数组，用来接收转换过的列表数据
      for(let key in element) {
        elementArray.push(element[key]);//将每个对象的转换为数组存储
      }
      //如果存在传入值selectValueAndName，则根据selectValueAndName的值为新字段赋值
      if(typeof this.selectValueAndName==='string'&&this.selectValueAndName.length===2) {
        element['mSelectValue']=elementArray[this.selectValueAndName[0]];//添加mSelectValue字段
        element['mSelectName']=elementArray[this.selectValueAndName[1]];//添加mSelectName字段
      }
      
    });
    
    this._optionList=optionList;//保存下拉列表
  }

  //获取选择的value，用来转换为选择值对应的name
  getValueToName(v) {
    console.log("接收选择的值",v,this.optionList);
    if(v&&this.optionList.length>0) {
      
      this.onChangeCallback(v);//调用变更方法
      this.selectValue=v;//保存选择值
      this.getSelectValueToName(v);//根据选择value值，获取对应的name
      this.isShowOption=false;
    }else{
      this.isShowOption=true;
    }
    
    
    
  }

  //获取选择值对应的要显示的名称
  getSelectValueToName(value:any) {
    if(!value) return;
    this.optionList.forEach(element => {//遍历列表
      //保存对应value值的名称
      if(element.mSelectValue===value) this.viewSelectName=element.mSelectName;
    });
  }


  //写入选择的值
  writeValue(v) {
    if(!v) return;
    this.selectValue = v;//保存选择的值
    this.getSelectValueToName(v);//获取选择值对应的要显示的名称
  }

  //注册变更事件
  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //注册touch事件
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

}