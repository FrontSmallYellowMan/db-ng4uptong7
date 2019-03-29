import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { Location } from '@angular/common';
import { WindowService } from 'app/core';
import { Http } from '@angular/http';
//import { PlatformInventoryService } from './../../../../services/platform-inventory.service';
import { environment_java } from './../../../../../../../environments/environment';
@Component({
  selector: 'modal-data',
  templateUrl: './modal-data.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss']
})
//公用导入类
export class PlatformModalDataComponent implements OnInit {
  modal: XcModalRef;
  modalData = {
    impType: '1',//导入类型 1-导入平台和库存地 2-导入额度
    dataList: [],
    headDataList: [],
    headFlagList: [],
    identical: false
  };//table显示数据

  overallIdentical;//整体通过验证标志

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private http: Http
  ) { }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
      this.modalData = data;
      console.log(data);
      this.identical(this.modalData);
    })
    // console.log(imptype);
  }
  identical(modalData) {//验证overallIdentical
    if (modalData.identical) {
      let i;
      let j;
      let checkList = modalData.dataList;
      let rows = checkList.length;
      let columns = modalData.headDataList.length;
      for (i = 0; i < rows; i++) {
        for (j = 0; j < columns; j++) {
          //console.log("hello "+checkList[i]['0' + j].flag);
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
        this.windowService.alert({ message:"操作成功", type: 'success' });
        this.hide(true);//关闭弹出框并刷新
      } else {
        this.windowService.alert({ message: data.message, type: 'fail' });
        this.hide();
      }
    };
    let impType = this.modalData.impType;
    let urlStr;
    //导入平台与库存地的对应关系
    if (impType === "1") {
      urlStr = 'borrow/platforminv/data-import';
    } else if (impType === "2") {
      //导入额度管理
      urlStr = 'borrow/borrow-amount/data-import';
    }
    return this.http.post(environment_java.server + urlStr, [])
      .toPromise()
      .then(response => response.json()).then(callback);
  }
}