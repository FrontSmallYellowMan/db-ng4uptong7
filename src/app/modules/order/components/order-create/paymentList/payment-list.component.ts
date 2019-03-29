import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }

import {
  PaymentInfo,
  OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit{
    public modal:XcModalRef;
    public loading: boolean = true;//加载中
    public pagerData = new Pager();
    public paymentList: PaymentInfo[] = [];//合同列表数据
    public keyWord;
    public query = {
        QueryCondition: "",
        PageSize:"10",
        CurrentPage:"1"
    };//搜索条件

    constructor(
        private router: Router,
        private routerInfo: ActivatedRoute,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderCreateService: OrderCreateService
    ){}

    //初始化数据
    initData(){
        if(this.keyWord){
            this.query.QueryCondition = this.keyWord.trim();
        }else{
            this.query.QueryCondition = "";
        }
        this.orderCreateService.getPaymentList(this.query).subscribe(
            data => {
                if(data.Result){
                    let info = JSON.parse(data.Data);
                    this.paymentList = info.ListPayment;
                    this.pagerData.set({
                        total: info.TotalCount,
                        totalPages: info.PageCount
                    })
                }
                this.loading = false;
            }
        );
    }


    ngOnInit(){

        //获得弹出框自身
        this.modal = this.xcModalService.getInstance(this);

        this.modal.onShow().subscribe((data) => {
            // if(data){
            //     this.initData()
            // }
            this.initData()
        })
    }

    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }



    search(){
      this.initData();
    }

    public initChange = true;
    onChangePage(e: any) {
        if(this.initChange){
            this.initChange = false;
            return ;
        }
        this.query.CurrentPage = e.pageNo;
        this.loading = true;
        this.initData();
    }

    selected(sel){
        if(sel.checked){
            this.paymentList.forEach(function(item,i){
                item.checked = false;
            })
            sel.checked = true;
        }
    }

    //保存数据
    save(){
        let selectedList = this.paymentList.filter(item => item.checked == true);
        if(selectedList.length==0){
            if(this.paymentList.length>0){
                this.windowService.alert({ message: "请选择付款条件", type: "fail" });
            }else{
                this.hide();
            }
            return ;
        }
        if(selectedList.length>0){
            this.hide(selectedList[0]);
        }
    }

}
