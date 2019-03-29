import { Component, forwardRef, ViewChild, OnInit, Input, Output, ElementRef, ComponentRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';



import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { TreeComponent } from "./select-search-tree.component";

import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';

import { SelectSearchDialogComponent } from './select-search-dialog.component';
import { Query, SelectSearchService } from '../../services/select-search.service';
declare var $;

@Component({
  selector: "my-select",
  templateUrl: './select-search.component.html',
  styleUrls: ['./select-search.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectSearchComponent),
    multi: true
  }]
})
export class SelectSearchComponent implements OnInit, ControlValueAccessor {
  constructor(
    private el: ElementRef, 
    private xcModalService: XcModalService,
    private selectSearchService: SelectSearchService) {}

  selectedItem: any;//被选项
  optionShow: boolean;//下拉框出现
  resetEvent: any;//重置
  modal: XcModalRef;//弹出框模型
  modalTree:XcModalRef;//弹出框模型
  query: Query;
  optionList: any[] = [];

  searchStream = new Subject<string>();

  private onChangeCallback:any={};
  private onTouchedCallback:any={};

  @Input() tabName: number = 1;
  @Input() placeHolder: string;
  @Input() modalShow: boolean = true;//弹出框出现
  @Input() noSearch: boolean = false;//隐藏搜索框
  @Input() multi: boolean = false;//多选
  @Input() disabled: boolean = false;//禁用
  @Input() applyName: number = 1;//判断是一般物料还是返款服务（1：一般物料，2:返款服务）
  @Input() treelists:any;//用来保存列表数据

  //用来设置科目设置组的类型(1:一般物料科目设置组，2：返款服务物料科目设置组)
  @Input()
  set subjectType(v){
    if(this.query){
      this.query.applyType=v;
    }
  }
  
  private _filterPromis: any;
  @Input() 
  set filterPromis(v) {
    if(this.query) {
      this.query.filterPromis = v;
    }
    this._filterPromis = v;
  };//用来过滤查询到的列表项
  get filterPromis() {
    return this._filterPromis;
  }

  @Output() onSelectData=new EventEmitter();//但选择参数后的回调函数

  ngOnInit() {
    this.query = new Query(this.tabName, this.applyName);
    

    if(this.disabled){
      return;
    }

    if(this.modalShow){
      this.modal = this.xcModalService.createModal(SelectSearchDialogComponent);
      this.modalTree = this.xcModalService.createModal(TreeComponent);
      this.modal.onHide().subscribe((data?) => {
        if (data){
          //refresh
          //this.initData(this.query);
          this.selectedItem = data[0] + (!!data[1] ? ' ' + data[1] : '');
          this.onSelectData.emit(this.selectedItem);
          this.onChangeCallback(data);
        }
      });
      this.modalTree.onHide().subscribe((data?) => {
        if (data){
          //refresh
          //this.initData(this.query);
          this.selectedItem = data.id + ' ' + data.title;
          this.onChangeCallback(data);
        }
      });
    }else{
      let $dom = $(this.el.nativeElement);//获得当前元素

      this.resetEvent = () => this.resetSearch();

      //阻止冒泡
      $dom.on("mousedown",($event)=>{
        $event.stopPropagation();
      });

      $("body").on("mousedown", this.resetEvent);

      this.searchStream
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe((keyWord: string) => {
          if(keyWord !== undefined){
            this.getOptionList();
          }
        });
    }
  }

  getOptionList(){
    this.query.queryStr = this.query.queryStr || "";
    this.selectSearchService.getOptionList(this.query).then(result => {
      this.optionList = result.data.rows;
    })
  }

  ngOnDestroy(){
    if(!this.modalShow){
      $("body").off("mousedown", this.resetEvent);
    }
  }

  toggle(){
    if(this.disabled){
      return;
    }

    if(this.modalShow){

      if(this.tabName==8){
       this.modalTree.show(this.query);
      }else{
        this.modal.show(this.query);
      }

      
      return;
    }

    this.optionShow = !this.optionShow;

    if(this.optionShow){
      this.getOptionList();
    }
  }

  //搜索
  search(keyWord){
    this.searchStream.next(keyWord);
  }

  resetSearch(){//重置搜索条件
    this.optionShow = false;
    this.query.queryStr = "";
    this.optionList.length = 0;
  }

  chooseItem(item){//选择下拉选项
    this.selectedItem = item;
    this.onChangeCallback(item);
    this.resetSearch();
  }

  writeValue(v) {
    if(!v){return}
    if(v instanceof Array){
      this.selectedItem = v[0] + (!!v[1] ? ' ' + v[1] : '');
    }else{
      this.selectedItem = v.id + ' ' + v.title;
    }
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

}
