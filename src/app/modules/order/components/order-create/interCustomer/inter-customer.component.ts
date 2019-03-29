import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }
import {
    DeliveryInfo, DeliveryType,
    OrderCreateService
} from './../../../services/order-create.service';

@Component({
    templateUrl: './inter-customer.component.html',
    styleUrls: ['./inter-customer.component.scss']
})
export class InterCustomerComponent implements OnInit{
    public modal:XcModalRef;
    public loading: boolean = true;//加载中
    public submitOnce: boolean;
    public pagerData = new Pager();
    public soldToList: DeliveryInfo[] = [];//售达方列表数据
    public customerName;//公司名称

    constructor(
        private router: Router,
        private routerInfo: ActivatedRoute,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderCreateService: OrderCreateService
    ){}

    initData(data?){
        let customerName = "";
        if(data){
            customerName = data;
        }else if(this.customerName){
            customerName = this.customerName.trim();
        }else{
            this.windowService.alert({ message: "请填写客户名称！", type: "fail" });
            return ;
        }
        this.loading = true;
        this.orderCreateService.getIntermeCustomer(customerName).subscribe(
            data => {
                if(data.Result){
                    let info = JSON.parse(data.Data);
                    this.soldToList = info;
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
                this.initData(data);
            }
        })
    }

    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }



    search(){
        this.initData();
    }

    selected(sel){
        if(sel.checked){
            this.soldToList.forEach(function(item,i){
                item.checked = false;
            })
            sel.checked = true;
        }
    }

    //保存数据
    save(e?){
        let selectedList = this.soldToList.filter(item => item.checked == true);
        if(selectedList.length==0){
            if(this.soldToList.length>0){
                this.windowService.alert({ message: "请选择居间服务方", type: "fail" });
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
