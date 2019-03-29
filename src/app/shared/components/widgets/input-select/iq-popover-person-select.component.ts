
import {distinctUntilChanged} from 'rxjs/operators/distinctUntilChanged';

import {debounceTime} from 'rxjs/operators/debounceTime';
import { Component, OnInit, OnDestroy, ElementRef, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { environment } from 'environments/environment';
declare var $;

const getOffsetToBody = function(node) {
  var top = 0,
      left = 0;
  while(node){
      top += node.offsetTop;
      left += node.offsetLeft;
      top -= node.scrollTop;
      left -= node.scrollLeft;
      node = node.offsetParent;
  }
  return {
      top: top,
      left: left
  }
}

@Component({
  selector: 'iq-popover-select',
  templateUrl: 'iq-popover-person-select.component.html',
  styleUrls:['iq-popover-person-select.component.scss']
})
export class IqPopoverPersonSelectComponent implements OnInit,OnDestroy {
  constructor(private el: ElementRef) {  }

  _show = false;
  position = "down";
  maxHeight = 300;

  show(e){
    this._show = true;
    if(!this.searchInput){
      let $dom = $(this.el.nativeElement);
      this.searchInput = $("input",$dom);
      this.searchInput.val('');
    }

    let p = getOffsetToBody(this.el.nativeElement);
    let clientHeight = document.body.clientHeight;
    if(p.top > clientHeight - this.maxHeight){
      this.position = "up";
    }else{
      this.position = "down";
    }
    setTimeout(()=>{
      //focus can not be set when element is hidden,so set focus after element be shown
      this.searchInput.focus();
    })
  }
  hide(){
    this.clearStatusBeforeHide(this);
  }

  removeEvent = null;

  @Input("hasButton")
  hasButton = true;

  @Input("queryObservable")
  queryObservable: Observable<any[]>;

  @Output()//查询方法，
  onQuery = new EventEmitter();

  @Output()//选中值方法，
  onChoose = new EventEmitter();

  @Output()//focus方法，
  onFocus = new EventEmitter();

  @Output()//点击按钮方法
  onButton = new EventEmitter();

  searchInput;

  searchTermStream = new Subject<string>();

  //阻止点击事件
  stopClick(e){
    e.stopPropagation();
  }
  //查询
  search(term?: string) {
    this.searchTermStream.next(term);
  }
  focus(){
    this.onFocus.emit();
  }
  choose(item){
    this.onChoose.emit(item);
  }
  clickBtn(v){
    this.onButton.emit(v);
  }
  ngOnDestroy(){
    $("body").off("mousedown",this.removeEvent);
  }
  ngOnInit() {
    let t_this = this;
    let $dom = $(this.el.nativeElement);
    this.removeEvent = function(){
      t_this.clearStatusBeforeHide(t_this);
    }
    //阻止冒泡
    $dom.on("mousedown",($event)=>{
      $event.stopPropagation();
    })
    $("body").on("mousedown",this.removeEvent);

    this.searchTermStream.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),)
      .subscribe((term: string) => {
        if(term !== undefined){
          this.onQuery.emit(term);
        }
      });
  }
  clearStatusBeforeHide(pthis){
    if(pthis._show){
      pthis.search();
      //清空查询
      if(!pthis.searchInput){
        let $dom = $(pthis.el.nativeElement);
        pthis.searchInput = $("input",$dom);
      }
      pthis.searchInput.val('');
      pthis.queryObservable = null;
      pthis._show = false;
    }
  }
}
