import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/index';
import { WindowService } from "app/core";
import { NgForm } from '@angular/forms';
import { MaterialInfoHW,MaterialMaintenanceHuaweiService } from '../../services/material-maintenanceHuawei.service'

@Component({
  selector: 'db-edit-material-maintenancehw',
  templateUrl: './edit-material-maintenancehw.component.html',
  styleUrls: ['../../scss/materiel.component.scss']
})
export class EditMaterialMaintenancehwComponent implements XcBaseModal, OnInit {
  modal:XcModalRef;
  materialHWInfo:MaterialInfoHW=new MaterialInfoHW();
  hasSubmit:boolean=false;
  isEdit:boolean;
 
  @ViewChild('form') form: NgForm;
 
  constructor(private xcModalService:XcModalService,private windowService:WindowService,private materialMaintenanceHWService:MaterialMaintenanceHuaweiService) { }

  ngOnInit() {
    this.modal=this.xcModalService.getInstance(this);
    
    this.modal.onShow().subscribe((data?: MaterialInfoHW) => {
      this.materialHWInfo = data || new MaterialInfoHW();
    })
  }
    //关闭
    hide(data?){
      this.modal.hide(data);
      this.materialHWInfo = new MaterialInfoHW();
      this.form.resetForm();
      this.hasSubmit = false;
    }
    edit(b:boolean){
      this.materialHWInfo.View=false;
      if(b){
        this.isEdit=true;
      }
    }
    save(){
      this.hasSubmit=true;
      if(this.form.invalid){
        return;
      }
      if(this.isEdit){
          this.materialMaintenanceHWService.updateMaterialHW(this.materialHWInfo).subscribe(result=>{
            if(result.Result){
              this.windowService.alert({message:"华为物料维护成功！",type:"success"});
              this.hide(true);
             }else{
               this.windowService.alert({message:result.Message,type:"fail"});
             }      
          })
      }else{
      this.materialMaintenanceHWService.addMaterialHW(this.materialHWInfo).subscribe(result=>{
        if(result.Result){
         this.windowService.alert({message:"华为物料维护成功！",type:"success"});
         this.hide(true);
        }else{
          this.windowService.alert({message:result.Message,type:"fail"});
        }      
      })
     }
   }
}
