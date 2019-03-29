import { Component, forwardRef, ViewChild, OnInit, Input, Output, ComponentRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

import { Person, PersonService } from 'app/shared/services/index';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { IqDialogPersonSelectComponent } from './iq-dialog-person-select.component';

/**
选人组件。包括单选多选功能
徐超 2017年05月10日15:32:52
*/
@Component({
  selector: "iq-person-select",
  templateUrl: 'iq-person-select.component.html',
  styleUrls: ['./iq-person-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IqPersonSelectComponent),
    multi: true
  }]
})
export class IqPersonSelectComponent implements OnInit, ControlValueAccessor {
  constructor(private personService: PersonService, private modalService: XcModalService) { }

  list;//选中列表
  queryObservable: any;
  modal: XcModalRef;//multi select modal

  private onChangeCallback:any={};
  private onTouchedCallback:any={};
  writeValue(value) {
    //校验是数组
    if(value && value instanceof Array){
      this.list = value;
    }else{
      this.list = [];//不绑定数据
    }
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

  @ViewChild("popoverselect")
  popoverselect

  @Output()
  onChange = new EventEmitter();

  @Output()
  onFocus = new EventEmitter();

  focus(){
    this.onFocus.emit();
  }

  @Input("max")
  max: number;//数量最大值，用以限定能选择的人数


  /** 人员查询方法，调用personService查询人员信息
  */
  query(term: string) {
    return this.queryObservable = this.personService.query(term);
  }
  chooseOne(item) {
    //如果max为1 单选，清空数组后添加
    if (this.max == 1) {
      this.list.length = 0;
    } else if (this.list.length < this.max) {
      //如果超出长度、暂时不处理
    }
    let flag = false;
    for (let i = 0; i < this.list.length && flag == false; i++) {
      if (this.list[i].id == item.id) {
        flag = true;
      }
    }
    if (!flag) {
      this.list.push(item);
      this.onChange.emit(this.list);
      this.onChangeCallback(this.list);
      this.onTouchedCallback();
    }
    //clear query
    this.query(null);
    this.popoverselect.hide();
  }
  removeOne(item) {
    let index = this.list.indexOf(item);
    this.list.splice(index, 1);
    this.onChange.emit(this.list);
    this.onChangeCallback(this.list);
    this.onTouchedCallback();
  }
  //打开弹框选择
  openSelect(term) {
    this.popoverselect.hide();

    let modal = this.modal;
    if (!modal) {//如果没有弹出框、初始化弹出框
      let data = {
        "list": this.list,
        "title": "人员选择",
        "KEY": "userID"
      };
      this.modal = this.modalService.createModal(IqDialogPersonSelectComponent, data);
      // modal = this.modal;
      // let t_this = this;
      // let c = <IqDialogPersonSelectComponent>modal._componentRef.instance;
      // c.onQuery.subscribe((x) => {
      //   t_this.query.call(t_this, x);
      //   c["queryObservable"] = t_this.queryObservable;
      // })
    }
    let ins = this.modal._componentRef.instance;
    ins["searchkey"] = term;
    // this.query(term);
    // ins["queryObservable"] = this.queryObservable;

    this.modal.show(this.list);
    //关闭后 触发  修改方法
    this.modal.onHide().subscribe((data) => {
      if (data) {
        this.onChange.emit(this.list);
        this.onTouchedCallback();
        this.onChangeCallback(this.list);
      }
    })
  }
  ngOnInit() {
    this.list = [];
  }
}
