import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { Pager } from "app/shared/index";
import { WindowService } from "app/core";
import {
    environment_java,
    dbomsPath
} from "../../../../../../environments/environment";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";

declare var window;

@Component({
    templateUrl: "./invoice-delay-apply-list.html",
    styleUrls: ["./invoice-delay-apply-list.scss"]
})
export class InvoiceDelayApplyListComponent implements OnInit {
    constructor(
        private windowService: WindowService,
        private router: Router,
        private http: Http,
        private invoiceApproveService: InvoiceApproveService
    ) {}
    javaurl: string = environment_java.server;
    public invoiceList; //列表数据
    //分页
    public pagerData = new Pager();

    public applyPage: string = "1";

    public tabType: string = "0"; //0 我的申请 1 我的审批

    approvalCount = 0; //待我审批条数

    invoiceCustomContract: string = ""; //支票号/客户名称/合同编码

    tipMessage: string = "";

    detailMessage: string = "";

    isShowMes: boolean = false;
    // 删除草稿数据
    delDraftById(id) {
        this.windowService.confirm({ message: "是否删除？" }).subscribe(res => {
            if (res) {
                this.invoiceApproveService
                    .deleteDelayDraft(id)
                    .subscribe(res => {
                        let result = JSON.parse(res["_body"]);
                        if (result["success"]) {
                            this.getInvoiceDelayData();
                        } else {
                            this.windowService.alert({
                                message: result.message,
                                type: "fail"
                            });
                        }
                    });
            }
        });
    }

    getInvoiceDelayData = function() {
        let pagerData = this.pagerData;
        let url = this.javaurl + "/invoice/invoice-delay-applys";
        let params: URLSearchParams = new URLSearchParams();
        params.set("tabType", this.tabType);
        params.set("flowStatus", this.applyPage);
        params.set("pageNo", pagerData.pageNo.toString());
        params.set("pageSize", pagerData.pageSize.toString());
        params.set("invoiceCustomContract", this.invoiceCustomContract);
        this.http
            .get(url, { search: params })
            .map(res => res.json())
            .subscribe(res => {
                if (res.list) {
                    this.invoiceList = res.list;
                    console.log(this.invoiceList.length);
                    for (let i = 0; i < this.invoiceList.length; i++) {
                        this.invoiceList[i].num =
                            (pagerData.pageNo - 1) * pagerData.pageSize +
                            (i + 1);
                    }
                }
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                }

                if (this.invoiceList.length < 1) {
                    this.isShowMes = true;
                    this.detailMessage =
                        "快来点击右上角“新建申请”按钮，开始新建申请吧~";
                    if (this.tabType == "0") {
                        if (this.applyPage == "1") {
                            this.tipMessage = "支票延期-我的申请-审批中为空";
                        } else if (this.applyPage == "3") {
                            this.tipMessage = "支票延期-我的申请-已完成为空";
                            this.detailMessage = "";
                        } else if (this.applyPage == "99") {
                            this.tipMessage = "支票延期-我的申请-全部为空";
                        } else {
                            this.tipMessage = "支票延期-我的申请-草稿为空";
                        }
                    } else {
                        if (this.applyPage == "1") {
                            this.tipMessage = "支票延期-我的审批-待我审批";
                            this.detailMessage =
                                "你把小伙伴们的审批都批完啦，棒棒哒~";
                        } else if (this.applyPage == "3") {
                            this.tipMessage = "支票延期-我的审批-我已审批";
                            this.detailMessage = "你还没审批过小伙伴的申请呢~";
                        } else if (this.applyPage == "99") {
                            this.tipMessage = "支票延期-我的审批-全部";
                            this.detailMessage = "你还没审批过小伙伴的申请呢~";
                        }
                    }
                } else {
                    this.isShowMes = false;
                }
            });
    };

    getWaitMeApproveAmount = function() {
        let url = this.javaurl + "/invoice/delay-applys/wait-me-approval";
        this.http
            .get(url)
            .map(res => res.json())
            .subscribe(res => {
                this.approvalCount = res.item;
            });
    };

    ngOnInit() {}

    public currentPageSize;
    onChangePage = function(e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
        this.getInvoiceDelayData();
        //  this.getWaitMeApproveAmount();
    };

    changeapplytype = function(flowstates, tabType) {
        this.applyPage = flowstates;
        this.pagerData.pageNo = 1;
        this.tabType = tabType;
        this.getInvoiceDelayData();
        // this.getWaitMeApproveAmount();
    };

    changeTab = function(iflag: string) {
        this.tabType = iflag;
        this.applyPage = 1;
        this.getInvoiceDelayData();
        // this.getWaitMeApproveAmount();
    };
    addsq() {
        window.open(dbomsPath + "invoice/delay/apply");
    }
    goto(item) {
        let id = item.applyId;
        if (this.tabType == "0" && this.applyPage == "0") {
            window.open(dbomsPath + "invoice/delay/resubmit/" + id);
            // this.router.navigate(["/invoice/delay/resubmit/" + id]);
        } else {
            window.open(dbomsPath + "invoice/delay/delayDetial/" + id);
        }
    }
}
