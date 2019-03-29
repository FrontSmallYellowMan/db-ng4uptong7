import { Component, OnInit,ViewChild, ViewChildren } from '@angular/core';
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { NgForm, NgModel } from "@angular/forms";

import { PlatformInvInfo,PlatformInventoryService } from './../../../../services/platform-inventory.service';

@Component({
  templateUrl: './edit-form.component.html',
  styleUrls: ['./../../../../scss/borrow-private.component.scss']
})
export class PlatformEditFormComponent implements OnInit{
  modal:XcModalRef;
  loading: boolean = true;//加载中
  submitOnce: boolean;
  id: string;
  title:string;
  platformInvObj: PlatformInvInfo;
  platformsList;//可用平台列表
  storageList;//库房名称列表

   @ViewChildren(NgModel)
    inputList;//表单控件
  @ViewChildren('forminput')
    inputListDom;//表单控件DOM元素
  @ViewChild("form") form;

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private platformInventoryService:PlatformInventoryService){}

  ngOnInit(){
   
    this.platformInvObj = new PlatformInvInfo();

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((id?) => {
      this.loading = true;
      console.log("id==="+id);
      if(id){
        this.platformInvObj.id = id;
         console.log("id=2=="+id);
        this.title = '编辑';
        this.platformInventoryService.getPlatformInvConfig(id).then(data => {
          this.platformInvObj = data.item;
        })
        
      }else{
        this.title = '新增';
      }
      this.platformInventoryService.getPlatforms().then(data => {//获取可用平台列表
          this.platformsList = data.list;
          this.loading = false;
      })
    })
  }
  //获取平台关联的库房名称列表
  getStorageList(){
     console.log("id=33==");
    console.log("this.platformInvObj.platformCode==="+this.platformInvObj.platformCode);
     this.platformInventoryService.getStorages(this.platformInvObj.platformCode).then(data => {
        console.log("id=3222=="+JSON.stringify(data.list));
          this.storageList = data.list;
        })
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    //清空数据
    this.form.resetForm();
    this.submitOnce = false;
  }

  //保存数据
  save(e){
    this.submitOnce = true;
    if (!this.form.valid) {//表单未验证通过
      let flag = false;
      for (let i = 0; i < this.inputList.length&&!flag; i++) {//遍历表单控件
        if (this.inputList._results[i].invalid) {//验证未通过
          let ele = this.inputListDom._results[i];//存储该表单控件元素
          if (ele && ele.nativeElement) {
           ele.nativeElement.focus();//使该表单控件获取焦点
           //console.log("liuxing1=="+JSON.stringify(ele.nativeElement));
           return;
          }
          flag = true;
        }
      }
    }
    for(let k=0;k<this.platformsList.length;k++){//获取相应平台名称
      if(this.platformInvObj.platformCode==this.platformsList[k].platcode){
        this.platformInvObj.platformName=this.platformsList[k].platname;
        break;
      }
    }
    let callback = (data) => {//回调函数
      if(data.success){
        this.windowService.alert({message:"操作成功",type:'success'});
        this.hide(true);//关闭弹出框并刷新
      }else{
        this.windowService.alert({message:data.message,type:'fail'});
        //this.hide();
      }
    };
    if(this.platformInvObj.id){
      this.platformInventoryService.updatePlatformInv(this.platformInvObj).then(callback);//更新
    }else{
      this.platformInventoryService.addPlatformInv(this.platformInvObj).then(callback);//添加
    }
  
  }
}