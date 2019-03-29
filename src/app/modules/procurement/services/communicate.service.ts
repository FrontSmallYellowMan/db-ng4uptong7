import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

@Injectable()
export class  PrepareApplyCommunicateService {
  subject: Subject<any> = new Subject<any>();
  stockApplyGetStandardRevolveDays: Subject<any> = new Subject<any>()
  
  prepareApplySendMsg(v) {
    this.subject.next(v);
  }

  prepareApplyGetMsg(): Observable<any> {
    return this.subject.asObservable();
  }

  nbChangeSaleContractSend(v){
    this.subject.next(v);
  }

  nbChangeSaleContractGet():Observable<any>{
    return this.subject.asObservable(); 
  }

  erporderChangeSendState(v){//采购订单修改，用来传递父组件的状态给子组件
     this.subject.next(v);
  }

  erporderChangeGetState():Observable<any>{
    return this.subject.asObservable(); 
  }


  stockApplyRevolveDaysChangeSend(v){//采购订单修改，用来传递父组件的状态给子组件
    this.stockApplyGetStandardRevolveDays.next(v);
 }

 stockApplyRevolveDaysChangeGet():Observable<any>{
   return this.stockApplyGetStandardRevolveDays.asObservable(); 
 }



}
