import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import * as moment from 'moment';
export class PageNo { }
import {
  UnclearItemInfo,
  OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './select-advance-number.component.html',
  styleUrls: ['./select-advance-number.component.scss']
})
export class AdvanceNumberComponent implements OnInit {
  modal: XcModalRef;
  loading: boolean = true;//加载中
  pagerData = new Pager();
  borrowList: UnclearItemInfo[] = [];//售达方列表数据
  reservationNo;//预留号
  initDatas;//初始数据
  isSearch:boolean;//是否点击搜索按钮
  query = {
    ReservationNo: "",//预留号
    UserInfo: "",//销售员
    BeginDate: "",
    EndDate: ""
  }

@ViewChild('form') form:NgForm

  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }

  initData() {
    let params = {
      ReservationNo: this.query.ReservationNo.trim(),
      UserInfo: this.query.UserInfo.trim(),
      BeginDate: "",
      EndDate: ""
    }
    if (!params.UserInfo) {
      console.info(2)
      this.windowService.alert({ message: "请填写销售员信息", type: "fail" });
      return;
    };
    if (this.query.BeginDate && this.query.EndDate) {
      params["BeginDate"] = moment(this.query.BeginDate).format("YYYY-MM-DD");
      params["EndDate"] = moment(this.query.EndDate).add(1, 'days').format("YYYY-MM-DD");
    }
    this.loading = true;
    this.orderCreateService.getUnClearItem(params).subscribe(
      data => {
        if (data.Result) {
          let info = JSON.parse(data.Data);
          this.borrowList = info;
        }
        this.loading = false;
        this.isSearch=false;//重置搜索标示
      }
    );
    
  }

  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
      if (data) {
        this.initDatas = data;
        this.reservationNo = data["reservationNo"];
        this.query.UserInfo = data["saleITCode"];
        //初始化时间预留号
        this.query.ReservationNo = '';
        this.query.EndDate = '';
        this.query.BeginDate = '';
        this.initData();
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    this.isSearch=false;
  }

  search() {
    this.isSearch=true;
    if(this.query.ReservationNo&&this.query.BeginDate&&this.query.EndDate){
      this.initData();
    }

  }
  reset() {
    //初始化时间预留号销售员
    this.query.EndDate = '';
    this.query.BeginDate = '';
    this.query.ReservationNo = '';
    this.query.UserInfo = this.initDatas["saleITCode"];
    this.initData();
  }
  selected(sel) {
    if (sel.checked) {
      this.borrowList.forEach(function(item, i) {
        item.checked = false;
      })
      sel.checked = true;
    }
  }

  //保存数据
  save(e?) {
    let selectedList = this.borrowList.filter(item => item.checked == true);
    if (selectedList.length == 0) {
      if (this.borrowList.length > 0) {
        this.windowService.alert({ message: "请选择预留号", type: "fail" });
      } else {
        this.hide();
      }
      return;
    };
    if (selectedList.length === 0) {
      return;
    };
    if (this.reservationNo && this.reservationNo !== selectedList[0]["ReservationNo"]) {
      this.windowService.confirm({ message: "确定将预留号" + this.reservationNo + "替换为" + selectedList[0]["ReservationNo"] + "吗？" }).subscribe({
        next: (v) => {
          if (v) {
            this.hide(selectedList[0]);
          }
        }
      })
    } else {
      this.hide(selectedList[0]);
    }
  }
}
