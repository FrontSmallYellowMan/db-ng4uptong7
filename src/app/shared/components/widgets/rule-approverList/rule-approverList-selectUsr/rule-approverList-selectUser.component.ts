import { Component, OnInit } from '@angular/core';

import {XcModalService, XcBaseModal, XcModalRef } from 'app/shared/modules/xc-modal-module/index';

@Component({
  selector: 'rule-approverList-selectUser',
  templateUrl: 'rule-approverList-selectUser.component.html',
  styleUrls:['rule-approverList-selectUser.component.scss']
})

export class RuleApproverListSelectUserComponent implements OnInit {
  
  modal: XcModalRef;//实例化弹出模块
  popApproverList:any=[];//保存传入弹窗的审批人列表
  popSelectApproverList:any=[];//保存选择的审批人列表
  isAllChecked:boolean;//是否全选
  approverListIndex:string;//传入弹窗的审批人列表的下标

  constructor(
    private xcModalService:XcModalService
  ) { }

  ngOnInit() { 

    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(data => {//显示弹窗
       if(data){
         console.log(data);
         this.isAllChecked=false;
         this.popApproverList=data.popApprovalList;//保存触发弹窗的审批人
         this.approverListIndex=data.index;//保存传入的审批人列表下标

         if(this.popApproverList.every(item=>item.checked)) this.isAllChecked=true;//如果传入的所有审批人为全选，则将全选按钮置为true
       }
    });

  }


  //全选判断
  allCheckedChange(){
    if(this.isAllChecked){//如果是全选，则将列表所有项目都勾选上
      this.popApproverList.forEach(element => {
        element.checked=true;
      });
    }else{//将所选项取消
      this.popApproverList.forEach(element => {
        element.checked=false;
      });
    }
  }

  //判断是否取消全选
  testIsAllChecked(){
    if(this.popApproverList.every(item=>item.checked)){
      this.isAllChecked=true;
    }else{
      this.isAllChecked=false;
    }
    
  }

  //确定
  confirm(){
    //过滤出选择审批人列表
    this.popSelectApproverList=this.popApproverList.filter(item=>item.checked);
      this.modal.hide({'selectApprovalList':this.popSelectApproverList,'index':this.approverListIndex});
    // console.log(this.popSelectApproverList);
  }

  

  //关闭
  close(){
    this.modal.hide();
  }

  
}