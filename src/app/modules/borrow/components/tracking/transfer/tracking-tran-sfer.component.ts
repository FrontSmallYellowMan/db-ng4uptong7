import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Http } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { environment_java,dbomsPath } from "./../../../../../../environments/environment";
import {
    BorrowTransferQueryPo, BorrowTransferApply, TranSferService
} from './../../../services/tran-sfer.service';
declare var window, Blob, document, URL;
@Component({
    templateUrl: './tracking-tran-sfer.component.html',
    styleUrls: ['./tracking-tran-sfer.component.scss'],
    providers: [TranSferService]
})
export class TrackingTranSferComponent {
    query: BorrowTransferQueryPo = new BorrowTransferQueryPo();
    borrowTransferApplyList: BorrowTransferApply[] = [];//借用转移申请列表
    loading: boolean = true;//加载中效果
    pagerData = new Pager();
    public idSort: any = false;//我的审批排序
    //流程状态
    public flowStatuslist: Array<any> = [{ code: 4, name: '草稿' }, { code: 1, name: '审批中' }, { code: 3, name: '已完成' }];
    constructor(http: Http, private tranSferService: TranSferService, private windowService: WindowService) {

    }

    ngOnInit() {
        this.query = new BorrowTransferQueryPo();
        this.query.needFilter = true;
        this.query.needCreaterFilter = true;
        this.query.needQueryFilte = true;

        // this.search();

    }
    search(obj) {
        if (obj == 0) {
            this.pagerData.pageNo = 1;
        }
        let params = new URLSearchParams();
        params.set("pageNo", "" + this.pagerData.pageNo);
        params.set("pageSize", "" + this.pagerData.pageSize);

        this.loading = true;
        this.tranSferService.findTransApplys(params.get("pageNo"), params.get("pageSize"), this.query).then(res => {
            // if (res.list) {
            //     this.limitData = res.list;
            //     for (let i = 0; i < this.limitData.length; i++) {
            //         this.limitData[i].num = (this.pagerData.pageNo - 1) * this.pagerData.pageSize + (i + 1);
            //     }
            // }
            // if (res.pager && res.pager.total) {
            //     this.pagerData.set({
            //         total: res.pager.total,
            //         totalPages: res.pager.totalPages
            //     })
            // }
            this.borrowTransferApplyList = res.list;
            console.log("borrowTransferApplyList=" + JSON.stringify(this.borrowTransferApplyList));
            //设置分页器
            this.pagerData.set(res.pager);
            //this.loading = false;
        }
        );
        this.loading = false;
    }
    tranSferExcelfile() {
        this.tranSferService.tranSferExcelfile(this.query);
    }

    //重置
    clearSearch() {
        this.query = new BorrowTransferQueryPo();
        this.query.needFilter = true;
        this.query.needCreaterFilter = true;
        this.query.needQueryFilte = true;
    }
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search(1);
    }

    //排序功能
    approvalSort() {
        this.idSort = !this.idSort;
        this.borrowTransferApplyList.reverse();
    }
    goDetail(itemId, flowStatus): void {
        window.open(dbomsPath + "borrow/approve/tran-sfer;itemid=" + itemId + ";applypage=" + flowStatus);
    }
}
