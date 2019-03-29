import { Component, forwardRef, ViewChild, OnInit, Input, Output, ElementRef, ComponentRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import { Http } from '@angular/http';




import { Subject ,  Observable } from 'rxjs';

import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { Query, JIqSelectService } from './j-iq-select.service';
import { JIqSelectDialogComponent } from './j-iq-select-dialog.component';
//import {IqSelectDialogComponent} from 'app/shared/components/widgets/iq-select/iq-select-dialog.component';
declare var $;

@Component({
  selector: "j-iq-select",
  templateUrl: './j-iq-select.component.html',
  styleUrls: ['./j-iq-select.component.scss'],
  providers: [
    JIqSelectService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JIqSelectComponent),
      multi: true
    }
  ]
})
export class JIqSelectComponent implements OnInit, ControlValueAccessor {
  constructor(
    private el: ElementRef, 
    private xcModalService: XcModalService,
    private iqSelectService: JIqSelectService) {}

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
  @Input() showIndex: string = '01';//
  @Input() modalShow: boolean;//现在为无用属性

  @Output() onSelect = new EventEmitter();
  
  ngOnInit(){
    if(this.disabled){
      return;
    }
    this.modal = this.xcModalService.createModal(JIqSelectDialogComponent);
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

    this.modal.show({api: this.listApi, queryParams: this.queryParams, dataModal: this.dataModal, showIndex: this.showIndex, noSearch: this.noSearch,java:this.java});
  }

  writeValue(value) {
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
