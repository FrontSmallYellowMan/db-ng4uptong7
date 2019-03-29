import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';


@Injectable()
export class MaterielCommunicationService {

  //用来传递物料的状态
    /**
     * 一般物料保存{name:'commonlyMaterial',state:'save'}
     * 返款服务物料保存{name:'returnMaterial',state:'save'}
     * 物料主数据修改保存{name:'dataMaterial',state:'save'}
     * 物料主数据修改提交{name:'dataMaterial',state:'submit'}
     * 扩展物料保存{name:'extentMaterial',state:'save'}
     * 扩展物料提交{name:'extentMaterial',state:'submit'}
     * 物料变更保存{name:'changeMaterial',state:'save'}
     * 物料变更提交{name:'changeMaterial',state:'submit'}
     */

  subject: Subject<any> = new Subject<any>()
  
  sendMaterialStatus(v) {
    this.subject.next(v);
  }

  getMaterialStatus(): Observable<any> {
    return this.subject.asObservable();
  }
  
}