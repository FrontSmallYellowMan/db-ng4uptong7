import { Component, AfterViewInit,ViewChild,forwardRef,ComponentFactory } from '@angular/core';
import { XcHostDirective } from '../xc-host.directive';
import { XcBaseModal } from '../models/xc-base-modal';
import { XcModalRef } from '../models/xc-modal-ref';
 
@Component({
  templateUrl: 'xc-modal-container.component.html',
  styleUrls:['xc-modal-container.component.scss']
})
export class XcModalContainerComponent{
  @ViewChild(forwardRef(() => XcHostDirective))
  xcHost: XcHostDirective;

  public show = false;

  public init({_componentFactory:componentFactory,data:data}){
    let viewContainerRef = this.xcHost.viewContainerRef;
    let componentRef = viewContainerRef.createComponent(componentFactory);

    //init data
    let modalComponent = componentRef.instance;
    if(data){
      for(let k in data){
        modalComponent[k] = data[k];
      }
    }
    return componentRef;
  }
}
