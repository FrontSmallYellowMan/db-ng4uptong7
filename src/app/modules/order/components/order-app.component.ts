import { Component, OnInit } from '@angular/core';

@Component({
    templateUrl: 'order-app.component.html',
    styleUrls:['order-app.component.scss']
})

export class OrderAppComponent implements OnInit {
    
    public isShowOrderManageList=false;//是否显示销售订单管理列表

    constructor() {}
    ngOnInit() {}

    //切换显示列表或隐藏列表
    toggleShowList() {
        this.isShowOrderManageList = !this.isShowOrderManageList;//隐藏或显示销售订单管理列表
    }
}
