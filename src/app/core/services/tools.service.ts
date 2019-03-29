import { Injectable } from '@angular/core';
import {ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

import { Observable ,  Subject } from 'rxjs';
@Injectable()
export class ToolsService {
  private toastySubject: Subject<{type:string,option:ToastOptions}>;
  constructor() {
    this.toastySubject = new Subject();
  }
  getToastySubject(){
    return this.toastySubject;
  }
  toasty(type:string,option?:ToastOptions){
    this.toastySubject.next({
      type:type,
      option:option
    })
  }
  clearAllToasty(){
    this.toastySubject.next({
      type:"clear",
      option:undefined
    })
  }
}
