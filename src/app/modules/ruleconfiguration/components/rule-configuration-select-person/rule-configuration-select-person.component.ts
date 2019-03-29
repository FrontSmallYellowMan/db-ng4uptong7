import { Component, OnInit, Input,Output,forwardRef,EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import {Pager,XcModalService,XcBaseModal,XcModalRef} from "app/shared/index";

import { RuleConfigurationSelectPersonPopModelComponent } from "./rule-configuration-select-person-pop-model/rule-configuration-select-person-pop-model.component";
import { ShowModelData } from "../../services/rule-configuration-select-pop-model.service";

@Component({
  selector: 'rule-configuration-select-person',
  templateUrl: 'rule-configuration-select-person.component.html',
  styleUrls:['rule-configuration-select-person.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RuleConfigurationSelectPersonComponent),
      multi: true
    }
  ]
})

export class RuleConfigurationSelectPersonComponent implements OnInit {

  public modal: XcModalRef; //初始化弹窗
  public showModelData:ShowModelData=new ShowModelData();// 实例化传递到选人模模态窗的参数
  
  public selectValueList:any=[];// 已选择的列表

  private onChangeCallback:any={};// 绑定值改变的回调函数
  private onTouchedCallback:any={};// 触发组件的回调函数

  @Input() public APIAddress:string;// 接口地址
  @Input() public compontentTitle: string; // 组件名称
  @Input() public readonly:boolean = false;// 是否只读，不允许编辑

  constructor(
    private xcModalService:XcModalService,
  ) { }

  ngOnInit() {

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(RuleConfigurationSelectPersonPopModelComponent);
    
    this.modal.onHide().subscribe(data=> {
      if(data) {
        console.log('关闭窗口',data);
        this.showModelData.valueList=data;// 保存关闭弹窗，传来的审批人列表
        this.onChangeCallback(this.showModelData.valueList);//当值发生变化时的回调函数
      }
    });

   }

   //查询审批人
   searchPerson() {
     this.showModelData.APIAddress=this.APIAddress;// 保存接口
     this.showModelData.compontentTitle=this.compontentTitle; // 保存要显示的组件名称

     this.modal.show(JSON.parse(JSON.stringify(this.showModelData)));//显示弹窗
   }

   //删除选择审批人
   removeRerson(I) {
     this.showModelData.valueList.splice(I,1);
     this.onChangeCallback(this.showModelData.valueList);//触发变更检查

   }

   writeValue(value) {
    this.showModelData.valueList = value;
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }



}