import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

declare var window;

@Component({
  selector: "select-search-company",
  templateUrl: './select-search-company.component.html',
  styleUrls: ['./select-search-company.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchComponentCompany),
      multi: true
    }
  ]
})
export class SelectSearchComponentCompany implements ControlValueAccessor {
  constructor() {}

  optionShow: boolean = false;
  selectedItem: any;//被选项
  _optionList: Array<any> = [];//下拉框数据
  keyWord: any = "";

  private onChangeCallback:any={};
  private onTouchedCallback:any={};
  
  @Input() optionList: any[] = [];//下拉框数据
  @Input() disabled: boolean = false;//禁用
  @Output() onSelecte = new EventEmitter();

  ngOnInit() { }

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
      return item["companycode"].indexOf(keyWord) >= 0 || item["company"].indexOf(keyWord) >= 0;
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
