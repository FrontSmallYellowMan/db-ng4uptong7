// 所以的 加签转办审批窗口
import { Component,OnInit } from '@angular/core';

import { XcModalService, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';

@Component({
  templateUrl: './approval-modal.component.html',
  styleUrls:['./approval-modal.component.scss']
})
export class ApprovalModalComponent implements OnInit {
  modal: XcModalRef;
  appTypeName;//审批的方式 名称
  selectUsers: Array<any> = [];//已选择的人员
  person={
    info:''
  }
  opinions='';//审批意见
  constructor(
    private xcModalService: XcModalService,
    private WindowService: WindowService
  ) { }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
       data == "sign" ? this.appTypeName = "加签" : this.appTypeName = "转办";
    })
  }
  
  changePerson(userInfo) {//选人组件change事件
    if (userInfo) {
      this.selectUsers.push(userInfo[0]);
    }
  }
  onApproval(){//确认审批
    if (!this.selectUsers || !this.selectUsers.length) {
      this.WindowService.alert({ message: '未选择审批人', type: "fail" });
      return;
    }
    let backData={
      itcode:this.selectUsers[this.selectUsers.length - 1]["userEN"],
      username:this.selectUsers[this.selectUsers.length - 1]["userCN"],
      opinions:this.opinions
    }
    this.modal.hide(backData);
    this.selectUsers.length = 0;
    this.opinions='';
  }
  onCancel(){
    this.modal.hide(null);
    this.selectUsers.length = 0;
    this.opinions='';
  }

}