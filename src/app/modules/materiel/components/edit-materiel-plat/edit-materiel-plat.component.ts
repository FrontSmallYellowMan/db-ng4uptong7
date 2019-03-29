import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/index';
import { WindowService } from "app/core";
import { NgForm } from '@angular/forms';

import { PlatInfo, MaterielExtendPlatService } from '../../services/materiel-extendPlat.service';

@Component({
  templateUrl: 'edit-materiel-plat.component.html',
  styleUrls: ['../../scss/materiel.component.scss']
})
export class EditMaterielPlatComponent implements XcBaseModal, OnInit {
  modal: XcModalRef;
  plat: PlatInfo = new PlatInfo();
  hasSubmit: boolean = false;
  isFactoryErr:boolean=false;//原始工厂与目标工厂是否一致

  @ViewChild('form') form: NgForm;

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private materielExtendPlatService: MaterielExtendPlatService){}

  ngOnInit(){

    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data?: PlatInfo) => {
      this.plat = data || new PlatInfo();
    })
  }

  //关闭
  hide(data?){
    this.modal.hide(data);
    this.plat = new PlatInfo();
    //this.form.resetForm();
    this.hasSubmit = false;
  }

  //保存
  save(){
    this.hasSubmit = true;
    //获取当前登录用户
    //let user = JSON.parse(window.localStorage.getItem('UserInfo'));
    //this.plat.ApplyName = this.plat.ApplyName || (user ? user.UserName : '');
    
    //验证目标工厂和参考工厂的后两位是否一致
    if(this.plat.OriginaFactory.substr(2)!=this.plat.Factory.substr(2)){
      console.log(this.plat.OriginaFactory.substring(2));
      return;
    }

    //如果目标工厂和原始工厂相同，则不允许提交
    if(this.plat.OriginaFactory===this.plat.Factory) return;

    if(this.form.invalid){
      return;
    }
    
    //console.log(this.plat);
    //添加或编辑（传不传ID的区别）平台
    this.materielExtendPlatService.addPlat(this.plat).then(result => {
      //console.log(result);
      if(result.success){
        this.windowService.alert({message:"扩展平台维护成功",type:"success"});
        this.modal.hide(true);
      }else{
        this.windowService.alert({message: result.message, type: 'fail'});
      }
    })
  }

  //编辑
  edit(){
    this.plat.View = false;//将查看置为false
  }

  //验证目标工厂不能和原始工厂一致
  testFactory(){
    if(!this.plat.OriginaFactory||!this.plat.Factory) return;
    if(this.plat.OriginaFactory===this.plat.Factory) {
      this.isFactoryErr=true
    }else{
      this.isFactoryErr=false;
    };
  }

}