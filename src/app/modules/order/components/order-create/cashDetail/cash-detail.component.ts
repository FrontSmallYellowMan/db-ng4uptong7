import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }

import {
  CollectionInfo,
  OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './cash-detail.component.html',
  styleUrls: ['./cash-detail.component.scss']
})
export class CashDetailComponent implements OnInit{
    public modal:XcModalRef;
    public loading: boolean = true;//加载中
    public collectionList: CollectionInfo[] = [];//合同列表数据
    public defauls: boolean = false;//暂无相关数据
    constructor(
        private router: Router,
        private routerInfo: ActivatedRoute,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderCreateService: OrderCreateService
    ){}

    initData(data?){
        let params = {
            CustomerERPCode: data
        }
        this.orderCreateService.getCustomerUnClearDetail(params).subscribe(
            data => {
                if(data.Result){
                    if(data.Data){
                        let list = JSON.parse(data.Data);
                        if(list.length>0){
                            this.defauls = false;
                            this.collectionList = list;
                        }else{
                            this.defauls = true;
                        }
                    }else{
                        this.defauls = true;
                        // this.windowService.alert({ message: data.Message, type: "fail" });
                    }
                }else{
                    this.defauls = true;
                    this.windowService.alert({ message: data.Message, type: "fail" });
                }
                this.loading = false;
            }
        );
    }


  ngOnInit(){

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
        if(data){
            this.initData(data)
        }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

}
