import { Component, forwardRef, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

declare var window;

@Component({
  selector: "select-search-banksubject",
  templateUrl: './select-search-banksubject.component.html',
  styleUrls: ['./select-search-banksubject.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchBankSubjectComponent),
      multi: true
    }
  ]
})
export class SelectSearchBankSubjectComponent implements ControlValueAccessor {
  constructor() {}

  optionShow: boolean = false;
  selectedItem: any = {SUBJECT_NO:"",BANKNAME:"请选择"};//被选项
  _optionList: Array<any> = [];//下拉框数据
  keyWord: any = "";

  private onChangeCallback:any={};
  private onTouchedCallback:any={};
  
  @Input() optionList: any[] = [];//下拉框数据
  @Input() disabled: boolean = false;//禁用
  @Input() isSubmit: boolean = false;//表单是否提交
  @Output() onSelecte = new EventEmitter();

  @ViewChild ('element') element: ElementRef;
  clickClose;

  ngOnInit() {
    let _that = this;
    this.clickClose = function (e) {
      if(_that.optionShow && e.target.id != "searchOption"){
        _that.optionShow = false;
      }
    }
    document.addEventListener('mouseup',this.clickClose);
  }

  toggle(){
    if(this.disabled){return;}
    this.keyWord = "";
    this.optionShow = !this.optionShow;
    this._optionList = [].concat(this.optionList);
  }

  //搜索
  search(keyWord: string){
    keyWord = keyWord.toUpperCase();
    this._optionList = this.optionList.filter(item => {
      return item["SUBJECT_NO"].indexOf(keyWord) >= 0 || item["BANKNAME"].indexOf(keyWord) >= 0;
    });
  }

  selectItem(item){
    this.keyWord = "";
    this.selectedItem = item;
    this.optionShow = false;
    this.onChangeCallback(item);
    this.onSelecte.emit();
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
