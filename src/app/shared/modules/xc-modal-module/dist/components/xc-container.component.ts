import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef } from '@angular/core';
import { XcHostDirective } from '../xc-host.directive';

import { XcComponentsLoaderService } from "../services/xc-components-loader.service";
import { XcModalContainerComponent } from "./xc-modal-container.component";

@Component({
  selector: 'xc-container',
  templateUrl: 'xc-container.component.html',
  styleUrls:["xc-container.component.scss"],
  entryComponents: [XcModalContainerComponent]
})
export class XcContainerComponent implements OnInit {

  @ViewChild(forwardRef(() => XcHostDirective))
  xcHost: XcHostDirective;
  hasModal = false;
  modalList=[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
  private xcComponentsLoaderService:XcComponentsLoaderService){ }

  loadComponent(modal){
    let viewContainerRef = this.xcHost.viewContainerRef;
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(XcModalContainerComponent);
    let componentRef = viewContainerRef.createComponent(componentFactory);
    modal._containerComponentRef = componentRef;
    let containerComponent = (<XcModalContainerComponent>componentRef.instance);
    modal._componentRef = containerComponent.init(modal);
    this.modalList.push(modal);

    let _this = this;

    let ifHide = function(){
      let modalList = _this.modalList;
      let flag = true;
      for(let i = 0;i<modalList.length&&flag;i++){
        if(!modalList[i].destroyed&&modalList[i].isOpen){
          flag = false;
        }
      }
      if(flag){
        _this.hasModal = false;
      }
    }

    modal.onShow().subscribe(()=>_this.hasModal = true);
    modal.onHide().subscribe(ifHide);
    modal.onDestroy().subscribe(ifHide);
  }

  ngOnInit() {
      this.xcComponentsLoaderService.componentsSubject
        .subscribe(x => {
          this.loadComponent(x)
        });
  }
}
