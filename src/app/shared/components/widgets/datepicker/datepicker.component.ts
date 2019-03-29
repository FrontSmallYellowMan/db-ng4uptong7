import { Component, forwardRef, EventEmitter, Output, Input, OnInit,ElementRef,ViewChild,AfterViewInit,ChangeDetectorRef} from '@angular/core';
import * as moment from 'moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

@Component({
  selector: 'iq-datepicker',
  templateUrl: 'datepicker.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true
  }]
})
export class DatePickerComponent implements ControlValueAccessor,OnInit {
  private aDayTime = 24 * 60 * 60 * 1000;

  @Input() closeOnSelect = false;
  @Input("minDate") minDate;
  @Input() placeHolder;//首次提示文字
  @Input() keepTime = false;
  @Output() onChange = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  public dt: Date;
  restoreTime:Date;
  public firstClick=true;//第一次点击
  public isShow = false;//是否显示选择器
  public clickClose;
  dateDisabled = false;
  onChangeCallback: any = {};
  onTouchedCallback: any = {};

  @ViewChild ('datebox')
    dateBox: ElementRef;


  public toggleDatePicker() {
    if(this.placeHolder && this.firstClick){
        this.placeHolder='';
        this.firstClick=false;
    }
    this.isShow = !this.isShow;
    if(!this.isShow){
      let d=new Date(this.dt);
      this.onClose.emit(d);
    }
  }
  public selectOne(v) {
  
    if(this.keepTime){
      let t = this.restoreTime;
      v.setHours(t.getHours(),t.getMinutes(),t.getMinutes(),0)
    }

    //使用v由事件暴露过来，因为此时NGMODAL未更新。使用NGMODAL需要setTimeout
    this.onChangeCallback(v);
    this.onChange.emit(v);
    if(this.closeOnSelect){
      this.isShow = false;
      this.onClose.emit(v);
    }
  }
  public constructor(private changeDetectorRef:ChangeDetectorRef) {
    moment.locale('zh-cn');
    this.dt = new Date();
  }

  ngOnInit(){
    let self=this;
    let box=self.dateBox.nativeElement;
    this.clickClose=function(e){
      if(self.isShow){
        if(e.target!=box && !box.contains(e.target)) {
          self.isShow=false;
          let d=new Date(self.dt);
          self.onClose.emit(d);
        }
      }
    }
    document.addEventListener('mousedown',self.clickClose);
  }
  ngOnDestroy(){
    let self=this;
    document.removeEventListener('mousedown',self.clickClose);
  }
  writeValue(value: Date) {
    if(!value){
      this.dt = new Date();
      this.restoreTime = this.dt;
    }else{
      this.dt = new Date(value);
      this.restoreTime = this.dt;
      this.placeHolder='';
    }
    this.changeDetectorRef.detectChanges();
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }
}
