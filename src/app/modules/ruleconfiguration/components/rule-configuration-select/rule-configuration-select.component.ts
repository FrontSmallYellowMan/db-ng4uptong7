
import { Component, OnInit,Input,Output,forwardRef,EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import {Pager,XcModalService,XcBaseModal,XcModalRef} from "app/shared/index";

import { RuleConfigurationSelectModalComponent } from "../rule-configuration-select/rule-configuration-select-modal.component";
import { CommunicateService } from "../../services/communicate.service";

@Component({
  selector: 'rule-configuration-select',
  templateUrl: 'rule-configuration-select.component.html',
  styleUrls:['rule-configuration-select.component.scss','../../scss/ruleconfig.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RuleConfigurationSelectComponent),
      multi: true
    }
  ]
})

export class RuleConfigurationSelectComponent implements OnInit {
  
  modal: XcModalRef; //初始化弹窗
  showModalData:any={
    'title':'',//弹出窗标题
    'listAPI':'',//接口地址
    'saveParameterIndex':'',//需要获取的值得下标
    'name':'',//组件名称
    'alreadyChosenData':'',//已选择的值
    'showIndex':'',//要显示的列下标
    'queryParameter':'' //传递查询参数
  };//保存显示弹出组件时需要传递的值
  selectValueList:any=[];//保存弹出组件中选择的值得集合

  private onChangeCallback:any={};
  private onTouchedCallback:any={};

  @Input() listAPI:string;//从父组件传入的接口地址
  @Input() title:string;//弹出窗组件上显示的名称
  @Input() name:string;//组件名称
  @Input() alreadyChosenData:any=[];//已选择的值
  @Input() saveParameterIndex:string='0';//要保存显示的值的下标
  @Input() showIndex:string;//保存要显示的列
  @Input() queryParameter:any; //请求的查询参数,用来附加查询条件及应对接口查询字段不一致的问题，格式为{'原始查询参数':需要替换的查询参数，’附加查询参数‘：’参数值‘}
  @Input() isNotClick:boolean=false; // 是否不允许点击

  @Output() onSelectValue=new EventEmitter();//选择值后传递的时间

  constructor(
    private xcModalService:XcModalService,
    private communicateService:CommunicateService
  ) { }

  ngOnInit() { 

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(RuleConfigurationSelectModalComponent);
    
    this.modal.onHide().subscribe(data=>{
      if(data){
        this.getSelectValue(data);
      }
    });


  }

  //查询按钮，弹出事业部列表
  search(){
    this.showModalData.listAPI=this.listAPI;
    this.showModalData.saveParameterIndex=this.saveParameterIndex;
    this.showModalData.title=this.title;
    this.showModalData.name=this.name;
    this.showModalData.alreadyChosenData=this.alreadyChosenData;
    this.showModalData.showIndex=this.showIndex;
    this.showModalData.queryParameter=this.queryParameter;
    this.modal.show(this.showModalData);
  }

  //获取选择列表数据的值
  getSelectValue(data){
    // this.communicateService.getValue().subscribe(data=>{
    //   console.log(data);
    //   if(data) {
    //     this.selectValueList=JSON.parse(data.value);
    //     this.onChangeCallback(this.selectValueList);
    //     this.onSelectValue.emit(data);
    //   }
    // });

    this.selectValueList=JSON.parse(data);
   this.onChangeCallback(this.selectValueList);
   this.onSelectValue.emit(data);

  }

  //删除选择的项目
  remove(I){
    this.selectValueList.splice(I,1);
    this.onChangeCallback(this.selectValueList);
  }

  writeValue(value) {
    this.selectValueList = value;
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }
  

}