import { ComponentFactory,ViewContainerRef,ComponentRef } from '@angular/core';
import { XcBaseModal } from "./xc-base-modal";
import { XcModalContainerComponent } from "../components/xc-modal-container.component";

import { Observer ,  Observable ,  Subject } from 'rxjs';

export class XcModalRef {
  public data:any;//data pass to modal component
  private onHideOb = new Subject();
  private onShowOb = new Subject();
  private onDestroyOb = new Subject();
  public isOpen = false;
  public destroyed = false;


  public _componentFactory : ComponentFactory<XcBaseModal>;
  public _containerComponentRef:ComponentRef<XcModalContainerComponent>;
  public _componentRef:ComponentRef<XcBaseModal>;

  constructor(_componentFactory:any) {
    this._componentFactory = _componentFactory;
  }
  private checkExist(){
    if(this.destroyed == false && this._containerComponentRef){
      return true;
    }
    return false;
  }
  show(data?:any){
    if(this.checkExist()){
      this.isOpen = true;
      this._containerComponentRef.instance.show = true;
      this.onShowOb.next(data);
    }
    else{
      throw "destroyed or not inited";
    }
  }
  hide(data?:any){
    if(this.checkExist()){
      this.isOpen = false;
      this._containerComponentRef.instance.show = false;
      this.onHideOb.next(data);
    }else{
      throw "destroyed or not inited";
    }
  }
  destroy(data?:any){
    if(this.checkExist()){
      this._containerComponentRef.destroy()
    }else{
      throw "destroyed or not inited";
    }
    this.destroyed = true;
    this.onDestroyOb.next(data);

    this.onShowOb.unsubscribe();
    this.onHideOb.unsubscribe();
    this.onDestroyOb.unsubscribe();
  }
  onCreate(){
    return ;
  }
  onShow():Observable<any>{
    return this.onShowOb;
  }
  onHide():Observable<any>{
    return this.onHideOb;
  }
  onDestroy():Observable<any>{
    return this.onDestroyOb;
  }
}
