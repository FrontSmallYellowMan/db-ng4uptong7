import { Component, OnInit } from '@angular/core';
import { Pager,XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';
import { element } from 'protractor';


@Component({
  selector: 'erporderchange-pop-storageRCWAppprovers',
  templateUrl: 'erporderchange-pop-storageRCWAppprovers.component.html',
  styleUrls:['erporderchange-pop-storageRCWAppprovers.component.scss','../../../scss/erp-order-change.scss']
})

export class ErporderchangePopStorageRCWAppprovers implements OnInit {
  modal: XcModalRef;//初始化弹窗组件
  originalApproverList:any=[];//保存从接口获取的原始审批人列表
  ApproverList:any=[];//保存按照平台重新组合的审批人列表
  approverFlatNameList:any=[];//保存过滤出的平台名称数组，用来在后续对比列表获取审批人
  constructor(
    private xcModalService:XcModalService
  ) { }

  ngOnInit() { 

    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(data => {//显示弹窗
      if(data){
        
        this.ApproverList=[];//清空保存的列表
        this.originalApproverList=[];//清空保存从接口获取的原始审批人列表
        this.approverFlatNameList=[];//清空保存过滤出的平台名称数组

        this.originalApproverList=data;//保存获取审批人列表
        this.originalApproverList.forEach(element => {//将平台名称存入新数组
          this.approverFlatNameList.push(element.FlatName);
        });

        //数组去重
        this.approverFlatNameList=Array.from(new Set(this.approverFlatNameList));

        this.approverFlatNameList.forEach((element,index)=>{//遍历平台名称数组
          let userName="";//保存审批人
          //过滤出对应平台的审批人
          this.originalApproverList.filter(item=>item.FlatName===element).forEach(content => {
            userName+='，'+content.UserName;
          });
          this.ApproverList.push({'FlatName':element,'UserName':userName});//将整合好的平台和审批人信息push进数组         
        });

      }
    });

  }

  //获取库房冲红审批人
  getApprover(I){
    console.log(this.ApproverList[I]);
    let flatName:string=this.ApproverList[I].FlatName;//审批人
    this.modal.hide(flatName);
  }

  //关闭弹窗
  cancel(){
    this.ApproverList=[];//清空保存的列表
    this.originalApproverList=[];//清空保存从接口获取的原始审批人列表
    this.approverFlatNameList=[];//清空保存过滤出的平台名称数组
    this.modal.hide();
   }

}