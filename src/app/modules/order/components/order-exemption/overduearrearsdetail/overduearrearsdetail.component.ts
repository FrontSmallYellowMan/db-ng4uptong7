import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }

import {
  OverdueArrearsInfo,
  OrderExemptionService
} from './../../../services/order-exemption.service';

@Component({
  templateUrl: './overduearrearsdetail.component.html',
  styleUrls: ['./overduearrearsdetail.component.scss']
})
export class OverdueArrearsDetailComponent implements OnInit{
    public modal:XcModalRef;
    public loading: boolean = true;//加载中
    public overdueArrears: OverdueArrearsInfo[] = [];//合同列表数据
    public defauls: boolean = false;//暂无相关数据
    constructor(
        private router: Router,
        private routerInfo: ActivatedRoute,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderExemptionService: OrderExemptionService
    ){}

    initData(data?){
       
        this.orderExemptionService.getCustomerUnClearDetail(data).subscribe(
            data => {
                if(data.Result){
                    if(data.Data){
                        let list = JSON.parse(data.Data);
                        if(list.length>0){
                            this.defauls = false;
                            this.overdueArrears = list;
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
  choose(e?){
    let selectedList = this.overdueArrears.filter(item => item.checked == true);
    if(selectedList.length==0){
        if(this.overdueArrears.length>0){
            this.windowService.alert({ message: "请选择超期欠款", type: "fail" });
        }else{
            this.hide();
        }
        return ;
    }
    if(selectedList.length>0){
        this.hide(selectedList);
    }
}
}
