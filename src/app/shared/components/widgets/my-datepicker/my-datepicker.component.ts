import { Component, OnInit, Input, ViewChild, ElementRef, forwardRef, Renderer2,EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';
import * as moment from 'moment';

declare var window;

@Component({
    selector:'my-datepicker',
    templateUrl: 'my-datepicker.component.html',
    styleUrls: ['my-datepicker.component.scss'],
    providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyDatePickerComponent),
      multi: true
    }],
    exportAs: 'DatePicker'
})
export class MyDatePickerComponent implements ControlValueAccessor,OnInit {

  today: Date = new Date();//用于设置默认选择今天

  year: number = this.today.getFullYear();
  month: number = this.today.getMonth();
  day: any = this.today.getDate();//选择高亮的day
  _day: any = '';//暂存被选择的day

  choosedDate: any = "";//显示选择的日期
  startday: any;//开始日期
  endday: any;//结束日期
  disabledStartDate: any = 0;//小于开始日期不能被选择
  disabledEndDate: any = 32;//大于开始结束不能被选择
  disabledPrevMonth: boolean = false;//禁用上个月
  disabledNextMonth: boolean = false;//禁用下个月
  bindDate: any;//双向绑定的日期

  yearList:any = [];//年份列表
  monthList:any = [];//月份列表

  prevMonth: any[] = [];//前一个月
  currentMonth: any[] = [];//当前月
  nextMonth: any[] = [];//下个月

  show: boolean = false;//日期组件展示与否
  onChangeCallback: any;
  onTouchedCallback: any;
  /**取消监听事件*/
  removeListen(): void{};
  
  @Input() isDisabled: boolean = false;//组件被禁用状态
  @Input() MinYear = this.today.getFullYear() - 80;//默认最小年份
  @Input() MaxYear = this.today.getFullYear() + 20;//默认最大年份
  @Input() PlaceHolder = "";
  @Input() Required: boolean = false;//必填
  @Input() format: string;
  @Input() set StartDate(v){
    if(!v){
      this.disabledStartDate = 0;
      this.startday = undefined;
      this.reset();
    }else{
      this.startday = new Date(v);
      this.checkStartDate();
    }
  };//起始日期

  @Input() set EndDate(v){
    if(!v){
      this.disabledEndDate = 32;
      this.endday = undefined;
      this.reset();
    }else{
      this.endday = new Date(v);
      this.checkEndDate();
    }
  };//结束日期

  @Output() getTimeSuccessCallBack=new EventEmitter<any>();//选择时间成功的回调函数

  @ViewChild("myDatePicker") myDatePicker: ElementRef;

  constructor(private renderer: Renderer2) {}

  reset(){
    this.year = this.today.getFullYear();
    this.month = this.today.getMonth();
  }

  checkStartDate(){//检查小于开始日期被禁用
    let _y = this.startday.getFullYear(),
        _m = this.startday.getMonth();


    if(this.year == _y){
      if(this.month == _m){
        this.disabledStartDate = this.startday.getDate();
      }else if(this.month > _m){
        this.disabledStartDate = 0;
      }else{
        this.disabledStartDate = 32;
      }
    }else if(this.year > _y){
      this.disabledStartDate = 0;
    }else{
      this.disabledStartDate = 32;
    }
  }

  checkEndDate(){//检查大于结束日期被禁用
    let _y = this.endday.getFullYear(),
        _m = this.endday.getMonth();


    if(this.year == _y){
      if(this.month == _m){
        this.disabledEndDate = this.endday.getDate();
      }else if(this.month > _m){
        this.disabledEndDate = 0;
      }else{
        this.disabledEndDate = 32;
      }
    }else if(this.year > _y){
      this.disabledEndDate = 0;
    }else{
      this.disabledEndDate = 32;
    }
  }

  addZero(n): string{//单位数添加0
    return Number(n) < 10 ? '0' + n : '' + n;
  }

  writeValue(value: any){
    if(!value){
      this.bindDate = "";
      this.choosedDate = "";
      this.reset();
    }else{
      this.bindDate = new Date(value);

      this._day = this.bindDate.getDate();//暂存当前存入的day
      this.year = this.bindDate.getFullYear();
      this.month = this.bindDate.getMonth();
      
      this.choosedDate = this.year + '-' + this.addZero(Number(this.month) + 1) + '-' + this.addZero(this._day);
    }
    
    this.getDate(this.year, this.month);
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean){
    this.isDisabled = isDisabled;
  }

  ngOnInit(){
    for(let i = this.MinYear; i <= this.MaxYear; i++){//获取年份列表
      this.yearList.push(i);
    }
    for(let i = 0; i < 12; i++){//获取月份列表
      this.monthList.push(i);
    }
  }

  ngOnDestroy() {
    this.removeListen();
  }

  /**打开选日期框，监听点击事件*/
  showPicker() {
    if(this.isDisabled){return};

    this.show = true;
    this.onTouchedCallback();

    this.removeListen();
    let datePickerElement = this.myDatePicker.nativeElement;
    this.removeListen = this.renderer.listen(window, 'click', (e) => {
      if(e.target != datePickerElement && !datePickerElement.contains(e.target)) {
        this.hidePicker();
      }
    });
  }

  /**关闭选日期框，并取消事件监听*/
  hidePicker() {
    this.show = false;
    this.removeListen();
  }

  //根据年份月份获得日期
  getDate(year, month){
    if(this.startday){
      this.checkStartDate();
    }
    if(this.endday){
      this.checkEndDate();
    }

    this.prevMonth.length = 0;
    this.currentMonth.length = 0;
    this.nextMonth.length = 0;

    this.year = Number(this.year);
    this.month = Number(this.month);

    let tmpday = new Date(year, month);
    let currentday = new Date(year, month);

    var prev = new Date(tmpday.setDate(0));
    let prevMonthMax = prev.getDate(),//上个月最大日期
        prevMonthLen = prev.getDay();//上一个月长度
    for(let i = prevMonthMax; i > prevMonthMax - prevMonthLen; i--){
      this.prevMonth.push(i);
    }
    this.prevMonth.reverse();

    let daysInMonth = (date) => {
        date.setMonth(date.getMonth()+1);
        date.setDate(0);
        return date.getDate(0);
    }

    let monthLen: number = daysInMonth(currentday);//当前月份长度

    for(let i = 1; i <= monthLen; i++){
      this.currentMonth.push(i);
    }

    for(let i = 1; i <= 42 - prevMonthLen - monthLen; i++){
      this.nextMonth.push(i);
    }

    if(this.bindDate){
      this.day = this.bindDate.getFullYear() == this.year && this.bindDate.getMonth() == this.month ? this._day : "";
    }else{
      this.day = "";
    }
  }

  //选择日期
  chooseDate(i){
    if((!!this.startday && i < this.disabledStartDate) || (!!this.endday && i > this.disabledEndDate))return;
    this.day = i;
    this._day = this.day;
    this.choosedDate = `${this.year}-${this.addZero(Number(this.month) + 1)}-${this.addZero(this.day)}`;
    this.bindDate = new Date(this.year, this.month, this.day);
    this.hidePicker();
    this.getTimeSuccessCallBack.emit(this.choosedDate);
    this.onChangeCallback(this.format ? moment(this.bindDate).format(this.format) : this.bindDate);
  }

  //去上个月
  toPrevMonth(i?){
    if(!!this.startday){
      if(this.startday.getFullYear() - this.year > 0 || (this.startday.getFullYear() - this.year == 0  && this.startday.getMonth() - this.month >= 0)){
        this.disabledPrevMonth = true;
        return;
      }else{
        this.disabledPrevMonth = false;
      }
    };
    if(this.year <= this.MinYear && this.month == 0){//如果超出时间范围无效
      window.alert('超出最小时间范围');
      return false;
    }
    if(this.month == 0){
      this.year -= 1;
      this.month = 11;
    }else{
      this.month -= 1;
    }
    this.getDate(this.year, this.month);
    if(!!i){this.chooseDate(i);}
  }

  //去下个月
  toNextMonth(i?){
    if(!!this.endday){
      if(this.endday.getFullYear() - this.year < 0 || (this.endday.getFullYear() - this.year == 0 && this.endday.getMonth() - this.month <= 0)){
        this.disabledNextMonth = true;
        return;
      }else{
        this.disabledNextMonth = false;
      }
    };
    if(this.year >= this.MaxYear && this.month == 11){//如果超出时间范围无效
      window.alert('超出最大时间范围');
      return false;
    }
    if(this.month == 11){
      this.year += 1;
      this.month = 0;
    }else{
      this.month += 1;
    }
    this.getDate(this.year, this.month);
    if(!!i){this.chooseDate(i)};
  }

  //获取的今天的日期
  getToday() {
    
    this.choosedDate = moment().format('YYYY-MM-DD');// 获取今天的年月日
    this.day = moment().format('D');// 保存当前日期，用于在视图高亮显示
    this.month=Number(moment().format('MM'))-1;// 获取当前的月份
    this.year=Number(moment().format('YYYY'));// 获取当前的年份
    this.bindDate = new Date(this.choosedDate);// 将当前日期存入双向绑定的数据
    this.hidePicker();//关闭日期组件
    this.getTimeSuccessCallBack.emit(this.choosedDate);//获取时间成功的回调函数
    this.onChangeCallback(this.format ? moment(this.today).format(this.format) : this.today);// 格式化日期数据
  }
}
