
import {debounceTime} from 'rxjs/operators/debounceTime';

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomSettingService, WindowService } from 'app/core';

import { Subject ,  Observable } from 'rxjs';



/**
分页对象
*/
export class Pager {

  private changeEvent = new Subject();

  //页面大小
  private _pageSize = 10;
  //页码
  private _pageNo = 1;
  //总条数 total改变不触发事件
  private _total = 0;
  //总页数
  private _totalPages = 1;

  set pageSize(_pageSize) {
    this._pageSize = _pageSize;
    this.changeEvent.next();
  }
  get pageSize() {
    return this._pageSize;
  }
  set total(_total) {
    this._total = _total;
    this.changeEvent.next();
  }
  get total() {
    return this._total;
  }
  set pageNo(_pageNo) {
    this._pageNo = _pageNo;
    this.changeEvent.next();
  }
  get pageNo() {
    return this._pageNo;
  }
  set totalPages(_totalPages) {
    this._totalPages = _totalPages;
    this.changeEvent.next();
  }
  get totalPages() {
    return this._totalPages;
  }

  //添加change
  onChange(): Observable<any> {
    return this.changeEvent.pipe(
      debounceTime(50));
    //延迟100毫秒，防止反复执行
  }
  //通用设置方法，传入对象进行设置或传入键值对设置
  set(k, v?) {
    let properties = ["pageSize", "pageNo", "total", "totalPages"];

    if (!v && typeof k == "object") {
      properties.forEach(variable => {
        if (k[variable] !== undefined) {
          this["_" + variable] = k[variable];
        }
      });
      this.changeEvent.next();
    }
    else if (properties.indexOf(k) > -1) {
      this[k] = v;
    }
  }
}
/** 分页器组件
*/
@Component({
  selector: 'iq-pager',
  templateUrl: 'iq-pager.component.html',
  styleUrls: ['iq-pager.component.scss']
})
export class PagerPageComponent implements OnInit {
  pagerData;
  @Input() simple: boolean = false;
  @Input("data")
  set setPagerData(d){
    if (!this.pagerData) {
      this.pagerData = new Pager();
    }
    if(d && d !== this.pagerData){
      this.pagerData = d;
      this.pagerData.onChange().subscribe(() => {
        this.initPage();
      });
    }
    this.pagerData.pageSize = this.pageSize;

    this.onChange.emit(this.pagerData);
  }
  @Output() onChange = new EventEmitter();
  //获取localstrage pageSize数字
  initSetting() {
    let setting = this.CustomSettingService.getSetting();
    this.pageSize = setting.pageSize;
  }
  constructor(private CustomSettingService: CustomSettingService, private windowService: WindowService) {
      //获取pagesize
      this.initSetting();
  }
  pageSize: number;

  pageNo;
  pagerList = [];

  //分页器初始化
  initPage() {
    let {totalPages: t, pageNo: p} = this.pagerData;//解构
    t = Number(t);
    p = Number(p);
    this.pagerList.length = 0;//快速清空数组
    if (t <= 7) {
      for (var i = 1; i < t + 1; i++) {
        this.pagerList.push({
          page: i
        })
      }
      return;
    }
    this.pagerList.push({ page: 1 });
    if (p <= 4) {
      let i = 2;
      for (; i < 6; i++) {
        this.pagerList.push({ page: i });
      }
      this.pagerList.push({
        page: ''
      });
    } else if (t - p <= 3) {
      this.pagerList.push({
        page: ''
      })
      let i = t - 4;
      for (; i < t; i++) {
        this.pagerList.push({ page: i });
      }
    } else {
      this.pagerList.push({
        page: ''
      })
      let i = p - 1;
      for (; i < p + 2; i++) {
        this.pagerList.push({ page: i });
      }
      this.pagerList.push({
        page: ''
      })
    }
    this.pagerList.push({ page: t });
  }
  //上一页或下一页
  prevNextPage(_p) {
    if (_p == 'prev') {
      if (this.pagerData.pageNo <= 1) {
        return;
      }
      this.pagerData.pageNo = this.pagerData.pageNo - 1;
    } else if (_p == 'next') {
      if (this.pagerData.pageNo >= this.pagerData.totalPages) {
        return;
      }
      this.pagerData.pageNo = this.pagerData.pageNo + 1;
    }
    this.onChange.emit(this.pagerData);
  }
  //分页器点击事件
  changePage(_p) {
    let p = 1;
    if (!_p) {
      //空值不处理
      return;
    }
    else if (typeof _p == "string") {
      p = Number.parseInt(_p);
    } else if (typeof _p == "number") {
      p = _p;
    } else {
      throw "type error";
    }

    if (isNaN(p)) {
      this.windowService.alert({ "message": '请输入整数数字', type: 'fail' });
      return;
    }
    if (p < 1) {
      this.windowService.alert({ "message": '页码不能小于1', type: 'fail' });
      return;
    }
    if (p > this.pagerData.totalPages) {
      this.windowService.alert({ "message": '页码过大', type: 'fail' });
      return;
    }
    this.pagerData.pageNo = p;
    this.pageNo = '';

    this.onChange.emit(this.pagerData);
  }
  //修改pagesize,保存到通用设置
  changePageSize(size) {
    if (size != this.pageSize) {
      this.CustomSettingService.set("pageSize", size);
      this.pageSize = size;
      this.pagerData.pageSize = this.pageSize;
      this.pagerData.pageNo = 1;
      this.onChange.emit(this.pagerData);
    }
  }
  ngOnInit() {
  }
}



/*import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomSettingService } from 'app/core';

import { Subject } from 'rxjs/Subject';

export function Pager() {

  let properties = ["pageSize", "pageNo", "total", "totalPages"];
  let countdown;//倒计时，消除重复点击
  let triggerOnchange = [];
  function countdownToChange() {
    if (countdown) {
      clearTimeout(countdown);
    }
    countdown = setTimeout(() => {
      triggerOnchange.forEach(k=>{
        if(typeof k == "function"){
          k();
        }
      });
    }, 100);
  }

  properties.forEach(key => {
    let val = 0;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: true,
      get: function() {
        return val;
      },
      set: function(newVal) {
        countdownToChange();
        val = newVal;
      }
    })
  });

  this.pageSize = 10;
  this.pageNo = 1;
  this.total = 0;
  this.totalPages = 1;

  this.onChange = function(event) {
    triggerOnchange.push(event);
  }
  this.set = (k, v) => {
    if (!v && typeof k == "object") {
      properties.forEach(variable => {
        if (k[variable] !== undefined) {
          this[variable] = k[variable];
        }
      });
    }
    else if (properties.indexOf(k) > -1) {
      this[k] = v;
    }
  }
}

@Component({
  selector: 'iq-pager',
  templateUrl: 'iq-pager.component.html',
  styleUrls: ['iq-pager.component.scss']
})
export class PagerPageComponent implements OnInit {

  @Input("data") pagerData: any;
  @Input() simple: boolean = false;
  @Output() onChange = new EventEmitter();
  constructor(private CustomSettingService: CustomSettingService) {
  }
  pageSize: number;

  private pageNo;
  private pagerList = [];

  //获取localstrage pageSize数字
  private initSetting() {
    let setting = this.CustomSettingService.getSetting();
    this.pageSize = setting.pageSize;
  }
  //分页器初始化
  initPage() {
    let {totalPages:t,pageNo:p} = this.pagerData;//解构

    this.pagerList.length = 0;//快速清空数组
    if (t <= 7) {
      for (var i = 1; i < t + 1; i++) {
        this.pagerList.push({
          page: i
        })
      }
      return;
    }
    this.pagerList.push({ page: 1 });
    if (p <= 4) {
      let i = 2;
      for (; i < 6; i++) {
        this.pagerList.push({ page: i });
      }
      this.pagerList.push({
        page: -1
      });
    } else if (t - p <= 3) {
      this.pagerList.push({
        page: -1
      })
      let i = t - 4;
      for (; i < t; i++) {
        this.pagerList.push({ page: i });
      }
    } else {
      this.pagerList.push({
        page: -1
      })
      let i = p - 1;
      for (; i < p + 2; i++) {
        this.pagerList.push({ page: i });
      }
      this.pagerList.push({
        page: -1
      })
    }
    this.pagerList.push({ page: t });
  }
  prevNextPage(_p) {
    if (_p == 'prev') {
      if(this.pagerData.pageNo<=1){
        return;
      }
      this.pagerData.pageNo = this.pagerData.pageNo - 1;
    } else if (_p == 'next') {
      if(this.pagerData.pageNo>=this.pagerData.totalPages){
        return;
      }
      this.pagerData.pageNo = this.pagerData.pageNo + 1;
    }
    this.onChange.emit(this.pagerData);
  }
  //分页器点击事件
  changePage(_p) {
    let p = 1;
    if (typeof _p == "string") {
      p = Number.parseInt(_p);
    } else if (typeof _p == "number") {
      p = _p;
    } else {
      throw "type error";
    }
    //-1为不处理按钮
    if (p == -1) {
      return;
    } else {
      if (isNaN(p)) {
        alert('请输入整数数字');
        return;
      }
      if (p < 1) {
        alert('页码不能小于1')
        return;
      }
      if (p > this.pagerData.totalPages) {
        alert('页码过大')
        return;
      }
      this.pagerData.pageNo = p;
      this.pageNo = '';
    }
    this.onChange.emit(this.pagerData);
  }
  //修改pagesize,保存到通用设置
  changePageSize(size) {
    if(size != this.pageSize){
      this.CustomSettingService.set("pageSize", size);
      this.pageSize = size;
      this.pagerData.pageSize = this.pageSize;
      this.onChange.emit(this.pagerData);
    }
  }
  ngOnInit() {
    //获取pagesize
    this.initSetting();
    if (!this.pagerData) {
      this.pagerData = new Pager();
    }
    this.pagerData.pageSize = this.pageSize;
    this.pagerData.onChange(()=>{
      // setTimeout(()=>{
        this.initPage();
      // })
    })
    this.onChange.emit(this.pagerData);
  }
}
*/