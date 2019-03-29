import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }


@Component({
  templateUrl: './material-change.component.html',
  styleUrls: ['./material-change.component.scss']
})
export class MaterialChangeComponent implements OnInit {
  public modal: XcModalRef;
  public loading: boolean = true;//加载中
  public submitOnce: boolean;
  public shipToParty = [];//送达各方
  public materCountList = [];//物料数量
  public newShipTo;//转移后送达方
  public changeCount: number;//转移物料数量
  public count: number;//转移物料总数量
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService
  ) { }

  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
      if (data) {
        let shipTo = [];
        let materCount = [];
        for (let i = 0; i < data.num; i++) {
          if (i != data.index) {
            shipTo.push(i);
          }
        }
        // for(let i = 1; i < data.count+1; i++) {
        //     materCount.push(i);
        // }
        this.shipToParty = shipTo;
        // this.materCountList = materCount;
        //默认显示
        this.newShipTo = shipTo[0];
        // this.changeCount = materCount[0];
        this.changeCount = 0;
        this.count = data.count;
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  //确认转移
  save() {
    let data = {
      shipToParty: this.newShipTo,//转移送达方
      changeCount: this.changeCount,//转移数量
      surplusCount: this.count - this.changeCount//剩余数量
    }
    this.hide(data);
  }
  //数量修改,验证方法
  countFormat(num?) {
    num = parseInt(num);
    if (num < 0) {
      num = 1;
    } else if (num > this.count) {
      num = this.count;
    }
    this.changeCount = num;
  }
}
