
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Http } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { environment_java,dbomsPath } from "environments/environment";
import { BorrowTurnSales } from './../../turn-sale';
declare var window, Blob, document, URL;
@Component({
    templateUrl: './tracking-turn-sale.component.html',
    styleUrls: ['./tracking-turn-sale.component.scss'],
})
export class TrackingTurnSaleComponent {
    queryParam: QueryParam = new QueryParam();
    public pagerData = new Pager();
    turnSaleList: BorrowTurnSales[] = [];
    public idSort: any = false;//我的审批排序
    constructor(private http: Http, private route: ActivatedRoute, private windowService: WindowService) { }
    ngOnInit() {
        this.search(0);
    }
    getDate(date, flag) {
        let dataObj = new Date(date);
        let year = dataObj.getFullYear();
        let month = (dataObj.getMonth() + 1).toString();
        let day = dataObj.getDate().toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        if (Number(day) < 10) {
            day = "0" + day;
        }
        let temp = year + "-" + month + "-" + day;

        if (flag == "start") {
            this.queryParam.startDate = temp;
        } else if (flag == "end") {
            this.queryParam.endDate = temp;
        }
    }
    search(obj) {
        if (obj == 0) {
            this.pagerData.pageNo = 1;
        }
        this.queryParam.pageNo = "" + this.pagerData.pageNo;
        this.queryParam.pageSize = "" + this.pagerData.pageSize;
        if (this.queryParam.startDate && this.queryParam.startDate != '') {
            this.getDate(this.queryParam.startDate, "start");
        }
        if (this.queryParam.endDate && this.queryParam.endDate != '') {
            this.getDate(this.queryParam.endDate, "end");
        }
        this.http.get(environment_java.server + "borrow/turn-sales/all", { params: this.queryParam }).toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    this.turnSaleList = data.list;
                    if (data.pager && data.pager.total) {
                        this.pagerData.set({
                            total: data.pager.total,
                            totalPages: data.pager.totalPages
                        })
                    }
                } else {
                    this.windowService.alert({ message: data.message, type: "fail" });
                }
            })
    }
    clearSearch() {
        Object.keys(this.queryParam).forEach(key => this.queryParam[key] = "");
        Object.assign(this.pagerData, this.queryParam);
    }
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search(1);
    }

     isIE(){
      let  uA = window.navigator.userAgent;
      let isIE = /msie\s|trident\/|edge\//i.test(uA) && !!("uniqueID" in document || "documentMode" in document || ("ActiveXObject" in window) || "MSInputMethodContext" in window);
      return isIE;
  }
    /**
     * 导出数据
     */
    export() {
        let expParam: QueryParam = this.queryParam;
        expParam.pageNo = undefined;
        expParam.pageSize = undefined;
        this.http.post(environment_java.server + "borrow/turn-sales/export", expParam, {
            responseType: 3
        }).pipe(
            map(res => res.json()))
            .subscribe(data => {
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                
                if(this.isIE()){
                    window.navigator.msSaveBlob(blob, "turnsales.xls");
                }else{
                 var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用转销售列表');
                    a.setAttribute('id','download');
                    a.click();
                    //解决ie11不能下载的问题
                    a.addEventListener('click', function() {
                      URL.revokeObjectURL(objectUrl);
                      document.getElementById('download').remove();
                    });
                }
                
            });
    }
    /**
     * 列表页面排序
     */
    approvalSort() {
        this.idSort = !this.idSort;
        this.turnSaleList.reverse();
    }
     goDetail(itemId): void {
        window.open(dbomsPath + "borrow/approve/turn-sale;id=" + itemId);
    }
}
export class QueryParam {
    flowStatus: string = '';
    reservationNo: string;
    startDate: string;
    endDate: string;
    applyItCode: string;
    mainApplyNo: string;
    deliveryNo: string;
    baseDeptName: string;
    subDeptName: string;
    businessScope: string;
    pageNo: string;
    pageSize: string;
}