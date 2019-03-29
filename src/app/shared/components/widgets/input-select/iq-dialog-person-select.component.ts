
import {distinctUntilChanged} from 'rxjs/operators/distinctUntilChanged';

import {debounceTime} from 'rxjs/operators/debounceTime';
import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { XcBaseModal, XcModalService } from 'app/shared/modules/xc-modal-module/index';
import { ControlValueAccessor, DefaultValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validators} from '@angular/forms';

import { environment } from 'environments/environment';
import { Person, PersonService } from 'app/shared/services/index';


const HIDE_DEBOUNCE_TIME = 300;
/**
徐超 2017年05月10日15:32:03
弹出选择组件
*/
@Component({
  templateUrl: 'iq-dialog-person-select.component.html',
  styleUrls: ['./iq-dialog-person-select.component.scss']
  // ,
  // providers: [{
  //   provide: NG_VALUE_ACCESSOR,
  //   useExisting: forwardRef(() => IqDialogSelectComponent),
  //   multi: true
  // }]
})
export class IqDialogPersonSelectComponent implements XcBaseModal, OnInit {
  constructor(private xcModalService: XcModalService,
    private personService: PersonService) {
      let sub = null;
    this.searchTermStream.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),)
      .subscribe((term: string) => {
        if(sub){//如果有订阅，取消订阅。（即可以取消之前发送请求）
          sub.unsubscribe();
        }
        sub = this.query(term);
        // return null;
      });
  }

  config = { 'backdrop': 'static' };
  count = 0;//已选数值

  searchList = [];//搜索结果列表
  selectList = [];//已选则列表
  isShow = false;

  list = [];//原数据

  _searchkey;
  set searchkey(key) {
    this._searchkey = key;
    this.search(this._searchkey);
  }
  get searchkey() {
    return this._searchkey;
  }

  queryObservable: Observable<any[]>;
  @Input("title") title;//弹出框标题

  @Input("key") KEY = "id";//匹配list中对象是否相同识别的属性，默认id
  @Output()//查询方法，
  onQuery = new EventEmitter();

  modal;
  choosed = {};

  searchTermStream = new Subject<string>();
  //查询
  search(term: string) {
    this.searchTermStream.next(term);
  }
  //内置的显示调用方法
  show(list) {
    if (list) {
      this.list = list;
      this.selectList = [].concat(list);
    } else {
      this.selectList = [].concat(this.list);
    }
    this.count = this.selectList.length;

    this.choosed = {};

    this.selectList.forEach((k, v) => {
      this.choosed[k[this.KEY]] = true;
    })
    if (this.modal) {
      this.modal.show();
      this.isShow = true;
    } else {
      this.isShow = true;
    }
  }
  //隐藏调用方法
  hide(list = null) {
    if (this.modal) {
      this.isShow = false;
      setTimeout( ()=>{
        this.modal.hide(list);
      }, HIDE_DEBOUNCE_TIME)
    } else {
      this.isShow = false;
    }
  }
  //清空操作
  clear() {
    this.selectList = [];
    this.choosed = {};
    this.count = 0;
  }
  toggle(item) {
    let flag = false;
    let i = 0;
    for (i = 0; i < this.selectList.length && !flag; i++) {
      if (this.selectList[i][this.KEY] == item[this.KEY]) {
        flag = true;
      }
    }
    if (!flag) {
      this.choosed[item[this.KEY]] = true;
      this.selectList.push(item);
      this.count = this.selectList.length;
    } else {
      this.choosed[item[this.KEY]] = false;
      this.selectList.splice(i - 1, 1);
      this.count = this.selectList.length;
    }
  }
  //添加一条数据操作
  add(item) {
    let flag = false;
    this.selectList.forEach((k, v) => {
      if (k[this.KEY] == item[this.KEY]) {
        flag = true;
      }
    })
    if (!flag) {
      this.choosed[item[this.KEY]] = true;
      this.selectList.push(item);
      this.count = this.selectList.length;
    }
  }
  //删除一条
  remove(item) {
    let index = this.selectList.indexOf(item);
    if (index > -1) {
      this.choosed[item[this.KEY]] = false;
      this.selectList.splice(index, 1);
      this.count = this.selectList.length;
    }
  }
  //确认按钮 将选中的值 覆盖到原数组
  confirm() {
    if (!this.list) {
      this.list = [];
    }
    this.list.length = 0;
    this.selectList.forEach((v) => {
      this.list.push(v);
    });
    // this.onChangeCallback(this.selectList);
    this.hide(this.list);
  }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    if (this.modal) {
      //生命周期方法中有个内置的_this指向this
      let t_this = this;
      let initdata = function(list?) {
        if (list) {
          t_this.list = list;
          t_this.selectList = [].concat(list);
        } else {
          t_this.selectList = [].concat(t_this.list);
        }
        t_this.count = t_this.selectList.length;
        t_this.choosed = {};

        t_this.selectList.forEach((k, v) => {
          t_this.choosed[k[t_this.KEY]] = true;
        })
        setTimeout(()=>{
          t_this.isShow = true;
        })
      }
      this.modal.onShow().subscribe(initdata);
      //如果创建了模型直接打开，onshow可能不会触发（先广播了，再绑定的）。因此手工调一次初始化数据
      initdata(this.list);
    }
  }

  query(term: string) {
    let sub = this.personService.query(term).subscribe( list => this.searchList = list);
    return sub;
  }
}
