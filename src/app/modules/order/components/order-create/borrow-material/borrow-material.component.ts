import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';

import {
  UnclearMaterialInfo,
  OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './borrow-material.component.html',
  styleUrls: ['./borrow-material.component.scss']
})
export class BorrowMaterialComponent implements OnInit {
  modal: XcModalRef;
  loading: boolean = true;//加载中
  defauls: boolean = false;//暂无相关数据
  materialList: UnclearMaterialInfo[] = [];//合同列表数据
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  reservationNo;//预留号
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }

  //初始化数据
  initData() {
    let params = {
      "ReservationNo": this.reservationNo
    }
    this.fullChecked = false;//全选状态
    this.fullCheckedIndeterminate = false;//半选状态
    //模态框初始化后，再次弹出时。可能记录上次选择物料个数，影响后面逻辑
    this.checkedNum = 0;
    this.orderCreateService.getUnclearMaterial(params).subscribe(
      data => {
        if (data.Result) {
          this.defauls = false;
          let info = JSON.parse(data.Data);
          this.materialList = info;
        } else {
          this.defauls = true;
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
      if (data) {
        this.reservationNo = data["reservationNo"];
        this.initData()
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }
  search() {
    this.initData();
  }

  //保存数据
  save() {
    let selectedList = this.materialList.filter(item => item.checked == true);
    if (selectedList.length == 0) {
      if (this.materialList.length > 0) {
        this.windowService.alert({ message: "请选择要归还的物料！", type: "fail" });
      } else {
        this.hide();
      }
      return;
    }
    this.hide(selectedList);
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
}
