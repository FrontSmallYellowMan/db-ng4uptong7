import { Component, OnInit } from '@angular/core';

import { QueryMyApproval,SupplierService } from "../services/supplier.service";

declare var window;
//declare var localStorage;

@Component({
    selector: 'supplierApp',
    templateUrl: 'supplier-app.component.html',
    styleUrls: ['../scss/supplier.component.scss']
})

export class SupplierAppComponent implements OnInit {

    queryMyApproval: QueryMyApproval = new QueryMyApproval();
    approvalNumber:number=0;

    constructor(
        private supplierService:SupplierService
    ) {}


    ngOnInit() {
        this.initData(this.queryMyApproval);
     this.watchLocalStrong();
    }

    initData(queryMyApproval) {//向数据库发送请求

        this.supplierService.searchMyApproval(this.queryMyApproval).then(data => {
            if (data.success) {
                console.log(data);
              this.approvalNumber=data.data.pager.total;
            }
        });
    }

    //监听loaclstrong，用来确认是否刷新列表页
    watchLocalStrong() {
        let that = this;
        window.addEventListener("storage", function (e) {
            if (e.key === "editFinsh" && e.newValue.search("approval") != -1) {
                console.log(e.newValue, e);
                that.initData(that.queryMyApproval);
                localStorage.removeItem('editFinsh');
            }
        });
    }
}