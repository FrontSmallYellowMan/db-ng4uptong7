import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import * as moment from 'moment';

@Directive({ selector: "td[timeDifference]" })
export class TimeDifferenceDirective {

  @Input("timeDifference")
  set commitDate(v) {
    if (!v) return;
    
    let newDate = moment(moment().format("YYYY-MM-DD"));//获取当前时间的毫秒数
    let commitDateMillisecond = moment(v);//获取承诺日期的毫秒数
    let timeDifference = newDate.diff(commitDateMillisecond,'days');//毫秒差转换为天数
    
    this.el.nativeElement.innerHTML=timeDifference;//将计算后的差值写入宿主元素的文本内容
    this.el.nativeElement.style.color=timeDifference>0?'firebrick':'green';//根据差值的正负，指定颜色

  }
  constructor(private el: ElementRef) {}
}
