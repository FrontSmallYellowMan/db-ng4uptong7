import { Component, OnInit,OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';

export class PageNo { }
@Component({
    templateUrl: 'procurement-apply.component.html',
    styleUrls: ['./../../scss/procuList-head.scss']
})
export class ProcurementApplyComponent implements OnInit {
    constructor(
        private dbHttp: HttpServer
    ) { }
    public dataCreat = {
        title: '新建申请',
        list: [{
            label: '合同采购申请',
            url: '/procurement/new-procurementApply'
        }, {
            label: '预下采购申请',
            url: '/procurement/new-prepareApply'
        }, {
            label: '备货采购申请',
            url: '/procurement/submit-stockapply'
        }],
    };

    public approvaTtotalNum: number = 0;//总条数
    initData;

    ngOnInit() {
        let self = this;
        this.initData=function(){
            let url = "PurchaseManage/GetTaskList"
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            let body = {
                PageNo: 1,
                PageSize: 10,
                TaskStatus: "0" //待我审批
            }
            self.dbHttp.post(url, body, options).subscribe(data => {
                if (data.Result) {
                    let list = JSON.parse(data.Data).pagedata;
                    let localPager = JSON.parse(data.Data);
                    self.approvaTtotalNum = localPager.totalnum;//总条数
                }
            })
        }
        this.initData();
        window.addEventListener('focus',self.initData);
      }
      ngOnDestroy(){
        let self =this;
        window.removeEventListener('focus',self.initData);
    }
}