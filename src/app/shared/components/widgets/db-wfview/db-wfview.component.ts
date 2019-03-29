import { Component, OnInit } from '@angular/core';

import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { DbWfviewApproverLinksComponent } from "./db-wfview-approverLinks/db-wfview-approverLinks.component";

@Component({
  selector: 'db-wfview',
  templateUrl: './db-wfview.component.html',
  styleUrls: ['./db-wfview.component.scss']
})
export class DbWfviewComponent implements OnInit {

  /**
   * 流程进度数据
   */
  _wfProgressData: Array<any>;
  modal: XcModalRef;//弹出框模型

  constructor(
    private xcModalService:XcModalService,
  ) { }

  ngOnInit() {

    //创建弹出窗
    this.modal = this.xcModalService.createModal(DbWfviewApproverLinksComponent);
    this.modal.onHide().subscribe((data?) => {//弹出窗关闭事件
      if (data) {}
    });

  }
  onInitData(wfProgressData: Array<any>) {
    if (!!wfProgressData) {
      this._wfProgressData = this._onFilterData(wfProgressData);
    }
  }

  _onFilterData(wfProgressData: Array<any>) {
    let newArray: Array<any> = [];
    let temp: boolean = false;
    if (wfProgressData.length > 0) {
      wfProgressData.map(function (item) {
        if (item.IsShow) {
          newArray.push(item);
        } else {
          return;
        }
      });
    }
    if (newArray.length > 0) {
      let currentItem;
      newArray.map(function (item) {
        let index = newArray.indexOf(currentItem);
        if (!item.IsAlready && index == -1) {
          item.isCurrent = true;
          currentItem = item;
        }
      });
    }
    return newArray;
  }

  //获取审批人链接
  getApproverLink(InstanceID) {
    console.log("show approverLink");
    this.modal.show(InstanceID);
   }


}
