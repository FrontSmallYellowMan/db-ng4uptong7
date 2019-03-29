import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Pager } from "app/shared/index";
import { InvoiceTakebackService } from "../../../services/invoice/invoice-takeback.service";
import { WindowService } from "../../../../../core/index";
import {
    environment_java,
    dbomsPath
} from "../../../../../../environments/environment";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
declare var window, Blob, document, URL;
@Component({
    templateUrl: "./takeback-list.component.html",
    styleUrls: ["./takeback-list.component.scss"]
})
export class TakebackListComponent implements OnInit {
    constructor(
        private windowService: WindowService,
        private invoiceTakebackService: InvoiceTakebackService,
        private invoiceApproveService: InvoiceApproveService,
        private activatedRouter: ActivatedRoute,
        private router: Router
    ) {
        activatedRouter.queryParams.subscribe(params => {
            if (params["from"]) {
                this.pms = params["from"];
            }
        });
    }
    public pms: string = "";
    loading: boolean = true; //加载中效果
    //搜索条件
    public peopleItcode: string = "";
    //列表数据
    public takebackList: Array<any> = new Array<any>();
    //审批状态
    public approveStatus: String = "0";
    public flag: string = "0";
    //分页
    public fullChecked = false; //全选状态
    public fullCheckedIndeterminate = false; //半选状态
    public pagerData = new Pager();
    public currentPageSize;
    public count = 0;
    public clickFlag: string = "0";
    public clickFlag2: string = "0";

    ngOnInit() {
        this.getApproveCount();
        this.getTakebackApprove();
    }

    // 删除草稿数据
    delDraftById(id) {
        this.windowService.confirm({ message: "是否删除？" }).subscribe(res => {
            if (res) {
                this.invoiceApproveService
                    .deleteTakebackDeldraft(id)
                    .subscribe(res => {
                        let result = JSON.parse(res["_body"]);
                        if (result["success"]) {
                            this.getTakebackApprove();
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
    changeFlag(iflag: string) {
        this.loading = true;
        this.flag = iflag;
        this.approveStatus = "0";
        this.getApproveCount();
        this.getTakebackApprove();
    }

    onChangePage(e) {
        this.loading = true;
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
        this.getTakebackApprove();
    }

    getTakebackApprove() {
        this.fullCheckedIndeterminate = false;
        this.fullChecked = false;
        let pagerData = this.pagerData;
        console.log(this.flag);
        this.invoiceTakebackService
            .getTakebackApprove(
                this.peopleItcode,
                this.flag,
                this.approveStatus,
                pagerData.pageSize.toString(),
                pagerData.pageNo.toString()
            )
            .then(res => {
                if (res.list) {
                    this.takebackList = res.list;
                    for (let i = 0; i < this.takebackList.length; i++) {
                        this.takebackList[i].num =
                            (pagerData.pageNo - 1) * pagerData.pageSize +
                            (i + 1);
                    }
                }
                this.loading = false;
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                }

                if (this.pms && this.flag != "1") {
                    this.changeFlag("1");
                    this.pms = "";
                }
            });
    }

    CheckIndeterminate(v) {
        this.fullCheckedIndeterminate = v;
    }

    getApproveCount() {
        this.invoiceTakebackService
            .getApproveCount()
            .then(res => (this.count = res.item));
    }
    //点击li事件
    changeapplytype(approveStatus, flag) {
        this.flag = flag;
        this.approveStatus = approveStatus;
        this.loading = true;
        this.getTakebackApprove();
        this.getApproveCount();
    }

    //批量取回
    approveTakeback(invoiceStatus) {
        let remark = "";
        if (invoiceStatus == "no") {
            remark = "驳回";
            this.clickFlag2 = "1";
        } else {
            remark = "同意";
            this.clickFlag = "1";
        }
        let idStr = "";
        this.takebackList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                idStr += invoice.id + ",";
            });
        this.invoiceTakebackService
            .approveTakeback(
                idStr.substring(0, idStr.length - 1),
                invoiceStatus,
                remark
            )
            .then(res => {
                if (res.success) {
                    this.fullCheckedIndeterminate = false;
                    this.fullChecked = false;
                    this.clickFlag = "0";
                    this.clickFlag2 = "0";
                    this.getTakebackApprove();
                    this.getApproveCount();
                    this.windowService.alert({
                        message: res.message,
                        type: "success"
                    });
                } else {
                    this.clickFlag = "0";
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
    }

    goDetail(id): void {
        if (this.flag == "0" && this.approveStatus == "2") {
            window.open(dbomsPath + "invoice/takeback/apply/" + id);
        } else {
            window.open(dbomsPath + "invoice/takeback/takebackDetail/" + id);
        }
    }
    addsq() {
        window.open(dbomsPath + "invoice/takeback/apply/-1");
    }
}
