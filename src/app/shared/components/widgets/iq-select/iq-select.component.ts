import { Component, forwardRef, ViewChild, OnInit, Input, Output, ElementRef, ComponentRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import { Http } from '@angular/http';




import { Subject ,  Observable } from 'rxjs';

import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { Query, IqSelectService } from './iq-select.service';
import { IqSelectDialogComponent } from './iq-select-dialog.component';
declare var $;

@Component({
  selector: "iq-select",
  templateUrl: './iq-select.component.html',
  styleUrls: ['./iq-select.component.scss'],
  providers: [
    IqSelectService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IqSelectComponent),
      multi: true
    }
  ]
})
export class IqSelectComponent implements OnInit, ControlValueAccessor {
  constructor(
    private el: ElementRef, 
    private xcModalService: XcModalService,
    private iqSelectService: IqSelectService) {}

  selectedItem: any;//被选项
  modal: XcModalRef;//弹出框模型
  changeData:any;//保存变化的值

  private onChangeCallback:any={};
  private onTouchedCallback:any={};

  @Input() listApi: string;//下拉列表选项api
  @Input() dataModal: any = {};//data数据模型
  @Input() placeHolder: string;
  @Input() noSearch: boolean = false;//隐藏搜索框
  //@Input() multi: boolean = false;//多选
  @Input() disabled: boolean = false;//禁用
  @Input() queryParams: any = {};//额外的查询参数
  @Input() required: boolean = false;
  @Input() itemIndex: number = 0;//被选项的位置
  @Input() itemValue: number = 0;//ngModel绑定值的位置
  @Input() java: boolean = false;//后台环境为java
  @Input() showIndex: string = '01';//显示的哪几列数据
  @Input() modalShow: boolean;//现在为无用属性
  @Input() enterShowList:boolean=true;//弹出列表组件后，是否默认显示数据
  @Input() isControlClick:boolean=false;//是否控制组件的点击事件

  @Output() onSelect = new EventEmitter();
  
  ngOnInit(){
    // if(this.disabled){
    //   return;
    // }

    this.modal = this.xcModalService.createModal(IqSelectDialogComponent);
    this.modal.onHide().subscribe((data?) => {
      if (data){
        if(JSON.stringify(data)!=JSON.stringify(this.changeData)){
          this.selectedItem = data[this.itemIndex];
          this.onChangeCallback(data[this.itemValue]);
          this.onSelect.emit(data);
          this.changeData=data;
        }      
      }
    });
  }

  toggle(){
    if(this.disabled){
      return;
    }
    this.modal.show({api: this.listApi, queryParams: this.queryParams, dataModal: this.dataModal, showIndex: this.showIndex, noSearch: this.noSearch,enterShowList:this.enterShowList});


  }

  writeValue(value) {
    if(!value){this.changeData = undefined};
    this.selectedItem = value;
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

}
