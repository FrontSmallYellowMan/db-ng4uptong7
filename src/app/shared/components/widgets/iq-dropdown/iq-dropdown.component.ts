
import {distinctUntilChanged} from 'rxjs/operators/distinctUntilChanged';

import {debounceTime} from 'rxjs/operators/debounceTime';
import { Component, forwardRef, ViewChild, OnInit, Input, Output, ElementRef, ComponentRef, EventEmitter, Renderer2 } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import { Http } from '@angular/http';



import { Subject ,  Observable } from 'rxjs';

declare var window;

@Component({
  selector: "iq-dropdown",
  templateUrl: './iq-dropdown.component.html',
  styleUrls: ['./iq-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IqDropdownComponent),
      multi: true
    }
  ]
})
export class IqDropdownComponent implements OnInit, ControlValueAccessor {
  constructor(private ref: ElementRef, private http: Http, private render: Renderer2) {}

  selectedItem: any;//被选项
  optionShow: boolean;//下拉框出现
  keyWord: string;
  optionList: any[] = [];
  private _optionList: any[] = [];

  searchStream = new Subject<string>();

  /**取消监听事件*/
  removeListen(): void{};

  private onChangeCallback:any={};
  private onTouchedCallback:any={};

  @Input() listApi: string;//下拉列表选项api
  @Input() method: string = 'get';//默认请求类型
  @Input() placeHolder: string;
  @Input() noSearch: boolean = false;//隐藏搜索框
  @Input() disabled: boolean = false;//禁用
  @Input() queryParams: any = {};//额外的查询参数
  @Input() keyWordAlias: string;//keyWord别名
  @Input() required: boolean = false;
  @Input() itemValue: string;//ngModel绑定值的键
  @Input() handleData: any = (arg)=>arg;

  @Output() onSelect = new EventEmitter();
  @Output() getData = new EventEmitter();

  ngOnInit(){

    if(this.disabled){
      return;
    }

    this.searchStream.pipe(
      debounceTime(500),
      distinctUntilChanged(),)
      .subscribe((keyWord: string) => {
        if(keyWord !== undefined){
          this.getOptionList();
        }
      });
  }

  getOptionList(){//获取下拉列表项

    let tmpObj = {keyWord: this.keyWord};

    if(!!this.keyWordAlias){
      tmpObj[this.keyWordAlias] = this.keyWord;
    }

    let httpObs = this.method == 'get' ? this.http.get(this.listApi, {params: Object.assign(tmpObj, this.queryParams)}) : this.http.post(this.listApi, Object.assign(tmpObj, this.queryParams));

    httpObs.toPromise()
    .then(res => res.json())
    .then(data => {
      this.getData.emit(data);
      return data;
    })
    .then(this.handleData)
    .then((list: any[]) => {
      if(!(list instanceof Array)){console.error('函数处理返回结果必须是数组');return};
      this._optionList = list;
      this.optionList = list.map(item => typeof item === 'string' ? item : Object.keys(item).map(i => item[i]).join(' '));
    });
  }

  ngOnDestroy(){
    this.removeListen();
  }

  toggle(){
    if(this.disabled){return;}

    this.optionShow = !this.optionShow;

    if(this.optionShow){
      this.getOptionList();

      this.removeListen();
      let iqSelectElement = this.ref.nativeElement;
      this.removeListen = this.render.listen(window, 'click', (e) => {
        if(e.target != iqSelectElement && !iqSelectElement.contains(e.target)) {
          this.optionShow = false;
        }
      });
    }else{
      this.removeListen();
    }
  }

  //搜索
  search(keyWord){
    this.searchStream.next(keyWord);
  }

  resetSearch(){//重置搜索条件
    this.optionShow = false;
    this.optionList.length = 0;
    this._optionList.length = 0;
    this.keyWord = '';
  }

  chooseItem(item, i){//选择下拉选项
    this.selectedItem = item;
    let callbackValue = this.itemValue === undefined ? this._optionList[i] : this._optionList[i][this.itemValue];
    this.onChangeCallback(callbackValue);
    this.onSelect.emit({item: item, index: i});
    this.resetSearch();
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
