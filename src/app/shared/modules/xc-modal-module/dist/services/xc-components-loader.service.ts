
import { Observable ,  Subject } from 'rxjs';
import { Injectable, ComponentFactory,Type, Optional,FactoryProvider,ComponentFactoryResolver} from '@angular/core';

import {XcModalRef} from "../models/xc-modal-ref";
/**
由于每个 懒加载模块有自己的componentFactoryResolver，所以这个服务也得放到每个模块去自行生成实例
*/
@Injectable()
export class XcComponentsLoaderService {
  public componentsSubject: Subject<XcModalRef>;

  public modalList:XcModalRef[] = [];

  constructor(private componentFactoryResolver:ComponentFactoryResolver, @Optional() subject?:Subject<XcModalRef>) {
    this.componentsSubject = subject?subject:new Subject();
  }

  // destroy(xcModalRef){
  //   let _index = this.modalList.indexOf(xcModalRef);
  //   this.modalList.splice(_index,1,0);
  // }
  /**
    destroy all opened modal;
  */
  destroyAll(){
    this.modalList.forEach(function(k,v){
      if(k.destroyed === false){
        k._componentRef.destroy();
      }
    })
    this.modalList.length = 0;
  }
  addComponent(component:Type<any>,data:any){
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    let modal = new XcModalRef(componentFactory);
    modal.data = data;
    this.modalList.push(modal);
    this.componentsSubject.next(modal);
    return modal;
  }
}
