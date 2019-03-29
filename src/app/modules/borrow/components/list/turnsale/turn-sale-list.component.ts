import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { TurnSaleService } from './../../../services/turn-sale.service';
import { BorrowTurnSales } from './../../turn-sale';
import { dbomsPath } from 'environments/environment';
declare var window;
@Component({
    templateUrl: "./turn-sale-list.component.html",
    styleUrls: ["./turn-sale-list.component.scss"],
    providers: [TurnSaleService]
})
export class TurnSaleListComponent implements OnInit {
    applyFlag: string = "1";//1-我的申请 2-我的审批 显示哪个页签
    applyPage: string = "apply1";//草稿，待我审批，审批过的，审批中，全部 0-草稿
    turnSaleList: BorrowTurnSales[] = [];//列表
    waitForApprovalNum: number;//待我审批条数
    pagerData = new Pager();
    loading: boolean = true;//加载中
    public idSort: any = false;//我的审批排序
    //提示信息，详细信息
    detailMessage: string;
    tipMessage: string;
    constructor(private http: Http, private route: Router, private windowService: WindowService, private service: TurnSaleService) { }
    ngOnInit() {
        //初始化方法
        // this.applyPage = "apply0";
        // this.service.queryWaitForApprovalNum().then(res => { this.waitForApprovalNum = res });
        this.search();
    }
    applyOrApprove(displayPage: string) {
        this.applyFlag = displayPage;
        if (this.applyFlag === "1") {
            this.applyPage = "apply1";//默认显示审批中
        } else {
            this.applyPage = "approval0";//默认待我审批
        }
        this.search();
    }
    changeapplytype(whichTab: string) {
        this.applyPage = whichTab;
        this.search();
    }
    search() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("pageNo", "" + this.pagerData.pageNo);
        params.set("pageSize", "" + this.pagerData.pageSize);
        let flowStatus: string;
        if (this.applyFlag === "1") {
            //我的申请
            flowStatus = this.applyPage.substring(5);
        } else {
            //我的审批
            flowStatus = this.applyPage.substring(8);
        }
        params.set("flowStatus", flowStatus);
        this.service.queryTurnSaleList(params, this.applyFlag).then(data => {
            let res = data.item;
            this.waitForApprovalNum = res.waitForApprovalNum;
            this.turnSaleList = res.list;
            if (res.pager && res.pager.total) {
                this.pagerData.set({
                    total: res.pager.total,
                    totalPages: res.pager.totalPages
                })
            }
            //获取不到列表
            if (res.list.length < 1) {
                this.detailMessage = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
                if (this.applyPage == "apply1") {
                    this.tipMessage = "借用转销售列表-我的申请-审批中为空";
                } else if (this.applyPage == "apply3") {
                    this.tipMessage = "借用转销售列表-我的申请-已完成为空";
                    this.detailMessage = "";
                } else if (this.applyPage == "apply") {
                    this.tipMessage = "借用转销售列表-我的申请-全部为空";
                } else if (this.applyPage == "apply0") {
                    this.tipMessage = "借用转销售列表-我的申请-草稿为空";
                } else if (this.applyPage == "approval0") {
                    this.tipMessage = "借用转销售列表-我的审批-待我审批";
                    this.detailMessage = "你把小伙伴们的审批都批完啦，棒棒哒~";
                } else if (this.applyPage == "approval1") {
                    this.tipMessage = "借用转销售列表-我的审批-我已审批";
                    this.detailMessage = "你还没审批过小伙伴的申请呢~";
                } else if (this.applyPage == "approval") {
                    this.tipMessage = "借用转销售列表-我的审批-全部";
                    this.detailMessage = "你还没审批过小伙伴的申请呢~";
                }
            }
        });
        this.loading = false;
    }
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search();
    }
    deleteApply(turnSalesId: string) {
        this.windowService.confirm({ message: `确定删除？` }).subscribe(v => {
            if (v) {
                this.service.deleteApply(turnSalesId).then(data => {
                    if (data.success) {
                        this.search();
                        this.windowService.alert({ message: "操作成功", type: "success" });
                    } else {
                        this.windowService.alert({ message: data.message, type: "fail" });
                    }
                })
            }
        })
    }

    //排序功能
    approvalSort() {
        this.idSort = !this.idSort;
        this.turnSaleList.reverse();
    }
    newApply() {
        window.open(dbomsPath + "borrow/apply/turn-sale;flag=n");
    }
    goDetail(itemId): void {
        window.open(dbomsPath + "borrow/approve/turn-sale;id=" + itemId);
    }
    editForm(itemId) {
        window.open(dbomsPath + 'borrow/apply/turn-sale;flag=e;itemid=' + itemId);
    }
}

