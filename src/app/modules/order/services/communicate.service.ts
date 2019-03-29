import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class CommunicateService {
  subject: Subject<any> = new Subject<any>();
  materialAmountSubject: Subject<any> = new Subject<any>();
  SDFAdvanceSubject: Subject<any> = new Subject<any>();
  isClickBatchButtonSubject: Subject<any> = new Subject<any>();
  isDisabledButtonSubject: Subject<any> = new Subject<any>();
  
  sendMsg(v) {
    this.subject.next(v);
  }

  getMsg(): Observable<any> {
    return this.subject.asObservable();
  }

  sendMaterialAmount(v) {//当物料变化时传递的状态，用来重新计算物料数量
    this.materialAmountSubject.next(v);
  }

  getSendMaterialAmount():Observable<any>  {// 接收变化的数据，计算物料总数量
    return this.materialAmountSubject.asObservable();
  }

  sendSDFAdvance(v) {//当送达方预收款变化时，传递参数
    this.SDFAdvanceSubject.next(v);
  }

  getSDFAdvance():Observable<any>  {// 接收变化的数据，用来在表单实体写入预收款数据
    return this.SDFAdvanceSubject.asObservable();
  }

  sendIsClickBatchButton(v) {//当单独添加送达方下物料或批量上传送达方时，是否显示批量上传送达方按钮，单独添加和批量上传为互斥逻辑，选择其中任意一种方式，则禁用另一种方式，此方法用于传递参数
    this.isClickBatchButtonSubject.next(v);
  }

  getIsClickBatchButton():Observable<any>  {// //当单独添加送达方下物料或批量上传送达方时，是否显示批量上传送达方按钮，单独添加和批量上传为互斥逻辑，选择其中任意一种方式，则禁用另一种方式，此方法用于接收参数
    return this.isClickBatchButtonSubject.asObservable();
  }

  sendDisabledButton(v) {//当单独添加送达方下物料或批量上传送达方时，是否显示批量上传送达方按钮，单独添加和批量上传为互斥逻辑，选择其中任意一种方式，则禁用另一种方式，此方法用于传递参数
    this.isDisabledButtonSubject.next(v);
  }

  getDisabledButton():Observable<any>  {// //当单独添加送达方下物料或批量上传送达方时，是否显示批量上传送达方按钮，单独添加和批量上传为互斥逻辑，选择其中任意一种方式，则禁用另一种方式，此方法用于接收参数
    return this.isDisabledButtonSubject.asObservable();
  }




}