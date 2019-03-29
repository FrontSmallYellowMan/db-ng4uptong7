
import {timer as observableTimer,  Observable ,  Subscription } from 'rxjs';
/**
 *lichen - 2017-12-18
 *可拖动指令
 */
import { Directive, OnInit, Input, Output, ElementRef, HostListener, HostBinding, EventEmitter } from '@angular/core';

@Directive({
  selector: '[drag],[dragX],[dragY]'
})
export class DragDirective implements OnInit {
  private ele: any;
  private dragSub: Subscription = new Subscription();
  private _canDrag: boolean = false;
  private startY: number;
  private startX: number;
  private _transition: string;

  @Input() stopDrag: boolean = false;
  @Input() delay: number = 0;//默认延时0毫秒
  @Input() drag: boolean = true;
  @Input() dragX: boolean = true;
  @Input() dragY: boolean = true;

  @Output() dragStart = new EventEmitter();
  @Output() dragMove = new EventEmitter();
  @Output() dragEnd = new EventEmitter();

  @HostListener('click', ['$event'])
  onClick(e){
    if(!this.stopDrag){
      return false;
    }
  }
  
  @HostListener('mousedown', ['$event'])
  moveStart(e){
    if(this.stopDrag){return}
    this.dragSub = observableTimer(this.delay).subscribe(() => {
      this._canDrag = true;
      if(!this.drag || !this.dragY){
        this.startY = e.clientY - this.ele.offsetTop;
      }
      if(!this.drag || !this.dragX){
        this.startX = e.clientX - this.ele.offsetLeft;
      }
      this.zIndex = 2;
      this.ele.style.transition = 'none';
      this.dragStart.emit({dom: this.ele, left: this.ele.offsetLeft, top: this.ele.offsetTop});
    })
  }

  @HostListener('mousemove', ['$event'])
  moveing(e){
    if(!this._canDrag){
      return false;
    }

    let top = e.clientY - this.startY,
        left = e.clientX - this.startX;

    if(top < 0){
      top = 0;
    }
    if(top > this.ele.offsetParent.offsetHeight - this.ele.offsetHeight){
      top = this.ele.offsetParent.offsetHeight - this.ele.offsetHeight;
    }
    if(left < 0){
      left = 0;
    }
    if(left > this.ele.offsetParent.offsetWidth - this.ele.offsetWidth){
      left = this.ele.offsetParent.offsetWidth - this.ele.offsetWidth;
    }

    if(!this.drag || !this.dragX){
      this.ele.style.left = left + 'px';
    }
    if(!this.drag || !this.dragY){
      this.ele.style.top = top + 'px';
    }
    this.dragMove.emit({dom: this.ele, left: left, top: top});
    return false;
  }

  @HostListener('mouseup')
  moveEnd(){
    this.reset();
  }

  @HostListener('mouseout')
  moveOut(){
    this.reset()
  }

  reset(){
    this.dragSub.unsubscribe();
    if(this._canDrag){
      this.zIndex = 1;
      this.ele.style.transition = this._transition || '';
      this.dragEnd.emit({dom: this.ele, left: this.ele.offsetLeft, top: this.ele.offsetTop});
    }
    this._canDrag = false;
  }

  @HostBinding('style.zIndex') zIndex = 1;

  constructor(private el:ElementRef) {
    this.ele = this.el.nativeElement;
  }

  ngOnInit() {
    this._transition = this.ele.style.transition;
    this.ele.style.position = 'absolute';
  }
}