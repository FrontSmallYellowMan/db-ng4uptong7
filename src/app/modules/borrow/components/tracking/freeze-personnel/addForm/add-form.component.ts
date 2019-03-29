import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { NgForm, NgModel } from "@angular/forms";

import {
    PersonnelInfo,
    FreezePersonnelService
} from './../../../../services/freeze-personnal.service';

@Component({
  templateUrl: './add-form.component.html',
  styleUrls: ['./../../../../scss/borrow-private.component.scss']
})
export class FreezeAddFormComponent implements OnInit{
  public modal:XcModalRef;
  public loading: boolean = true;//加载中
  public submitOnce: boolean;
  public person = [] ;//冻结人员信息
  public newFreezePerson: PersonnelInfo;

   @ViewChildren(NgModel)
    inputList;//表单控件
  @ViewChildren('forminput')
    inputListDom;//表单控件DOM元素
  @ViewChild("form") form;

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private freezePersonnelService:FreezePersonnelService){}

  ngOnInit(){

    this.newFreezePerson = new PersonnelInfo();

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(() => {
        this.loading = false;
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    //清空数据
    this.form.resetForm();
    Object.keys(this.newFreezePerson).forEach(key=>this.newFreezePerson[key]=undefined);
    this.submitOnce = false;
  }
  changePerson(info){
      if(info && info.length>0){
          this.newFreezePerson.frozenItCode = info[0]["itcode"];
          this.newFreezePerson.frozenUserNo = info[0]["personNo"];
          this.newFreezePerson.frozenUserName = info[0]["name"];
          this.newFreezePerson.freeResult = 0;
      }
  }
  save(event){
      this.submitOnce = true;
      let frozenItCode = this.newFreezePerson.frozenItCode;
      if(frozenItCode && frozenItCode != ""){
          this.freezePersonnelService.createFreezeList(this.newFreezePerson).then(res => {
              if(res.success){
                  this.hide(true);//关闭弹出框并刷新
                  this.windowService.alert({message:"操作成功",type:"success"});
              }else{
                  this.windowService.alert({message:res.message,type:"fail"});
              }
          })
         Object.keys(this.newFreezePerson).forEach(key=>this.newFreezePerson[key]=undefined);
      }
  }
}
