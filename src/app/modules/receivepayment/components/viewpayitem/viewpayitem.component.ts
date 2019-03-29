import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from "../../../../shared/index";

@Component({
  selector: 'db-viewpayitem',
  templateUrl: './viewpayitem.component.html',
  styleUrls: ['./viewpayitem.component.scss']
})
export class ViewpayitemComponent implements OnInit {

  constructor(private xcModalService: XcModalService) { }
  payItem;
  modal: XcModalRef;
  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      if (data.data) {
        this.payItem = data.data;
      }
    });
  }
  close() {
    this.modal.hide();
  }

}
