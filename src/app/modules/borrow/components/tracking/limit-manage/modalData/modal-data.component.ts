/*import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { Location } from '@angular/common';
import { WindowService } from 'app/core';

import { LimitManageService } from './../../../../services/limit-manage.service';

@Component({
  selector: 'limit-modal-data',
  templateUrl: './modal-data.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss']
})
export class LimitModalDataComponent implements OnInit {
  modal: XcModalRef;
  modalData = {
    checkDataList: [],
    headDataList: [],
    headFlagList: [],
    identical: false
  };//table显示数据

  overallIdentical;//整体通过验证标志

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private limitManageService: LimitManageService
  ) { }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
      this.modalData = data;
      this.identical(this.modalData);
    })
  }
  identical(modalData) {//验证overallIdentical
    if (modalData.identical) {
      let i;
      let j;
      let checkList = modalData.checkDataList;
      let len = checkList.length;
      for (i = 0; i < len; i++) {
        for (j = 0; j < 7; j++) {
          if (checkList[i]['0' + j].flag == 0) {
            this.overallIdentical = false;
            return;
          }
        }
      }
    } else {
      this.overallIdentical = false;
      return;
    }
    this.overallIdentical = true;
  }
  hide(data?: any) {
    this.modal.hide(data);
  }
  saveModalData() {//保存数据
    let callback = (data) => {//回调函数
      if (data.success) {
        this.windowService.alert({ message: data.message, type: 'success' });
        this.hide(true);//关闭弹出框并刷新
      } else {
        this.windowService.alert({ message: data.message, type: 'fail' });
        this.hide();
      }
    };
    this.limitManageService.batchImportLimit().then(callback);//导入数据
  }
}*/