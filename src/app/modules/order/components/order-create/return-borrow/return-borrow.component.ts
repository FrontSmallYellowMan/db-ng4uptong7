import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { Person } from 'app/shared/services/index';
import { BorrowMaterialComponent } from './../borrow-material/borrow-material.component';
import { AdvanceNumberComponent } from "./../select-advance-number/select-advance-number.component";
import { OrderCreateService } from './../../../services/order-create.service';

@Component({
  selector: 'oc-return-borrow',
  templateUrl: './return-borrow.component.html',
  styleUrls: ['./return-borrow.component.scss']
})
export class ReturnBorrowComponent implements OnInit {
  @Output() returnCallBack = new EventEmitter();
  @Input() saleITCode;//销售员ITCode
  @Input() materialList;//还借用物料列表
  @Input() reservationNo;//借用预留号

  modalMaterial: XcModalRef;//物料添加模态框
  modalNumber: XcModalRef;//物料添加模态框
  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }

  ngOnInit() {
    //在初始化的时候 创建模型;;;;物料添加
    this.modalMaterial = this.xcModalService.createModal(BorrowMaterialComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modalMaterial.onHide().subscribe((data) => {
      if (data) {
        //已存在物料的合同物料ID
        let oldMaterialIdList = [];
        this.materialList.forEach(function(item, index) {
          oldMaterialIdList.push(item.UnclearMaterialId);
        });
        //新添加的物料去重
        let delrepeat = data.filter(item => oldMaterialIdList.indexOf(item.UnclearMaterialId) == -1);
        delrepeat.forEach(function(item, index) {
          item["ReservationNo"] = this.reservationNo;
          item["ReturnCount"] = item.Count - item.dbomsCp;
        }, this);
        this.materialList = delrepeat.concat(this.materialList);
        this.returnCallBack.emit(this.materialList);
      }
    })
    //在初始化的时候 创建模型;;;;预留号
    this.modalNumber = this.xcModalService.createModal(AdvanceNumberComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modalNumber.onHide().subscribe((data) => {
      if (data) {
        if (this.reservationNo !== data["ReservationNo"]) {
          let params = {
            "ReservationNo": data["ReservationNo"]
          }
          this.materialList = [];
          this.orderCreateService.getUnclearMaterial(params).subscribe(
            data => {
              if (data.Result) {
                let info = JSON.parse(data.Data);
                info.forEach(function(item, index) {
                  item["ReservationNo"] = params["ReservationNo"];
                  item["ReturnCount"] = item.Count - item.dbomsCp;
                });
                this.materialList = info;
                this.returnCallBack.emit(info);
              } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
              }
            }
          );

        }
        this.reservationNo = data["ReservationNo"];
      }
    })
  }
  /*
   *选择预留号
   */
  selectAdvanceNumber() {
    let params = {
      saleITCode: this.saleITCode,
      reservationNo: this.reservationNo
    }
    this.modalNumber.show(params);
  }
  //添加物料信息
  addMaterial() {
    if (!this.reservationNo) {
      this.windowService.alert({ message: "请先选择预留号", type: "fail" });
      return;
    }
    let params = {
      reservationNo: this.reservationNo
    }
    this.modalMaterial.show(params);
  }
  //删除物料信息
  delMaterial(list, i) {
    list.splice(i, 1);
    this.returnCallBack.emit(this.materialList);
  }
  //数量修改
  changeReturnCount(item) {
    let str = (item["ReturnCount"] || 0).toString();
    if (str.length > 0) {
      item["ReturnCount"] = Math.abs(parseInt(str.replace(/^0*/g, ""))) || 0;
    } else {
      item["ReturnCount"] = parseInt(str) || 0;
    };
    let max = item.Count - item.dbomsCp;
    if (item["ReturnCount"] > max) {
      this.windowService.alert({ message: "归还最大数量为" + max, type: "fail" });
      item["ReturnCount"] = max;
    }
    this.returnCallBack.emit(this.materialList);
  }
}
