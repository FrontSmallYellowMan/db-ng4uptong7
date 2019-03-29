import { Component, OnInit } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { MaterielChangeService } from "../../services/materiel-materielChange.service";

@Component({
  templateUrl: 'edit-newMaterielChange-firstApprovalUser.component.html',
  styleUrls:['edit-newMaterielChange-firstApprovalUser.component.scss']
})

export class EditNewMaterielFirstApprovalUserComponent implements OnInit {

  firstApprovalUserModal: XcModalRef;//初始化弹窗
  approvalUserList:any[]=[];//审批人列表
  applyUser:string;//审批人信息

  selectApprovalUser:any=[];//保存选择的审批人
  

  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private materielChangeService:MaterielChangeService
  ) { }

  ngOnInit() { 

    //获取对话框对象,不能放constructor里面
    this.firstApprovalUserModal = this.xcModalService.getInstance(this);
        
    this.firstApprovalUserModal.onShow().subscribe(data => {//显示弹窗
      
      if(!data) return;

      let FactoryCode = data.substr(2).toUpperCase();
      this.materielChangeService.getFirstApprovalPerson({'FactoryCode':FactoryCode}).then(data=>{
        if(data.Result){
          this.approvalUserList=JSON.parse(data.Data).list;//获取一级预审人列表
          console.log(this.approvalUserList);
        }
      })

    });

    

  }

  //获取选择的一级预审人
  getApprovalUser(I){
    console.log(this.approvalUserList[I]);
   this.selectApprovalUser=[this.approvalUserList[I].UserName,this.approvalUserList[I].ITCode];
   //this.selectApprovalUser.approvalUserItCode=this.approvalUserList[I].ITCode;
   this.firstApprovalUserModal.hide(this.selectApprovalUser);
   console.log(this.selectApprovalUser);
  }

  cancel(){
    this.firstApprovalUserModal.hide();

}


}