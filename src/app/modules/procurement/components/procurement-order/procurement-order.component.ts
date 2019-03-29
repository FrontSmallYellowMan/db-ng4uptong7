import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { dbomsPath } from "environments/environment";

import {
    ProcurementListDataService
} from '../../services/procurement-listData.service';

export class PageNo { }
@Component({
    templateUrl: 'procurement-order.component.html',
    styleUrls: ['./../../scss/procuList-head.scss']
})
export class ProcurementOrderComponent implements OnInit {
    constructor(
        private procurementListDataService: ProcurementListDataService,
    ) { }
    public dataCreat = {
        title: '新建订单',
        list: [{
            label: '采购订单',
            url: '/procurement/new-procurementOrder'
        }],
    };
    public approvaTtotalNum: number = 0;//总条数
    initData;
    addProcurementOrder(){
        window.open(dbomsPath+'procurement/new-procurementOrder');
    }

    ngOnInit() {
        let self = this;
        this.initData = function () {
            let body={
                TaskStatus: 0,
                 PageNo: 1,
                PageSize: 10
            }
            self.procurementListDataService.searchOrderMyapprovalData(body).then(data => {
                let orderData = JSON.parse(data.Data);
                self.approvaTtotalNum=orderData.totalnum;//总条数
                console.log("需要审批的条数",self.approvaTtotalNum);
            })
        }
        this.initData();
        window.addEventListener('focus', self.initData);
    }
    ngOnDestroy() {
        let self = this;
        window.removeEventListener('focus', self.initData);
    }
}