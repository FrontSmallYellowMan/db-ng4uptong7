
import {timer as observableTimer, interval as observableInterval,  Subject ,  Observable ,  Subscription } from 'rxjs';

import {take} from 'rxjs/operators/take';
import { Injectable } from '@angular/core';




//alert弹窗配置接口
interface Config {
  autoClose: boolean;//是否自动关闭
  closeTime: number;//自动关闭的毫秒数
}


@Injectable()
export class WindowService {
  private subscriber: Subscription = new Subscription();
  private _windowSubject;
  private _closeSubject;
  constructor() {
    this._windowSubject = new Subject();
  }
  //关闭的subject，方便关闭之后回调
  get closeSubject() {
    return this._closeSubject;
  }
  //弹出服务的内部subject
  get windowSubject() {
    return this._windowSubject;
  }
  show(param) {
    if (this._closeSubject) {
      return this._closeSubject;
    }
    this._closeSubject = new Subject();
    this._closeSubject.subscribe(() => {
      //延迟，如果有其他订阅者，先执行其他订阅者方法，再complete
      setTimeout(()=>{
        this._closeSubject.complete();
        this._closeSubject = null;
      },0);
    })
    this._windowSubject.next(param);
    return this._closeSubject;
  }
  close(v?) {
    this.subscriber.unsubscribe();
    if (this._closeSubject) {
      this._closeSubject.next(v);
    }
  }
  /**
   *alert调用
   *@param {message: string, type: string} p - 弹出框信息
   *@param {Config} config - 配置，可选参数
   * - autoClose: 是否自动关闭，默认true
   * - closeTime: 自动关闭毫秒数，默认3000
   */
  alert(p, config?: Config): Observable<any> {
    if(this._closeSubject) {
      return this._closeSubject;
    }

    /**
     * 2019-1-14 新增逻辑，修改该弹出窗的显示规则（当type为fail，即当出现错误提示时，窗口不自动关闭）
     */
    
     if(p.type==='fail') {//如果是错误提示，则不关闭模态窗
       config = Object.assign({autoClose: false, closeTime: 3000}, config);
     }else {//否则，自动关闭模态窗
       config = Object.assign({autoClose: true, closeTime: 3000}, config);
     }


    let reg = /[\S\s]*#\{(\d+)\}[\s\S]*/;
    let msg = p.message;
    let n = Number(msg.replace(reg, '$1'));

    if(reg.test(msg)) {

      if(isNaN(n)) {
        console.error('#{n}中，n必须为正整数数字');
        return;
      }

      p.message = msg.replace(/#\{\d+\}/, n);

      this.subscriber = observableInterval(1000).pipe(take(n)).subscribe(v => {
        if (v < n - 1) {
          p.message =  msg.replace(/#\{\d+\}/, n - 1 - v);
        } else {
          this.close();
        }
      });
    } else {
      this.subscriber = observableTimer(config.closeTime).subscribe(() => {
        this.close();
      })
    }

    if(!config.autoClose) {
      this.subscriber.unsubscribe();
    }

    return this.show({
      type: "alert",
      option: p
    });
  }
  //确认 调用
  confirm(p): Observable<any> {
    this.subscriber.unsubscribe();
    return this.show({
      type: "confirm",
      option: p
    });
  }
  //prompt调用
  prompt(p): Observable<any> {
    this.subscriber.unsubscribe();
    return this.show({
      type: "prompt",
      option: p
    });
  }
}
