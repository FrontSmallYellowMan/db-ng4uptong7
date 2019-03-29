import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Pager } from "app/shared/index";
import { WindowService } from "app/core";
import { URLSearchParams } from "@angular/http";
import { ChangeQuery } from "./change-query";
import { Subject } from "rxjs";
import { InvoiceChangeService } from "../../../../services/invoice/invoice-change.service";
import { dbomsPath } from "../../../../../../../environments/environment";
import { InvoiceApproveService } from "../../../../services/invoice/invoice-approve.service";
declare var window;
@Component({
    templateUrl: "./change-ticketList.component.html",
    styleUrls: ["./change-ticketList.component.scss"]
})
export class ChangeTicketListComponent implements OnInit {
    constructor(
        private changeService: InvoiceChangeService,
        private router: Router,
        private invoiceApproveService: InvoiceApproveService,
        private windowService: WindowService
    ) {}

    flag: string = "0"; //0我的申请 1我的审批
    applyPage: string = "1"; //默认 审批中
    para: string = ""; //查询条件
    changeApplyFlowData: any; //列表数据
    pagerData = new Pager(); //分页
    // public currentPageSize;
    approveCount: number = 0;
    isshow: boolean = false;
    stopQuery: any;
    private searchTermStream = new Subject<string>();
    loading: boolean = true; //加载中效果
    ngOnInit() {
        this.searchTermStream
            .debounceTime(500)
            .distinctUntilChanged()
            .map(searchTerm => {
                this.para = searchTerm;
            })
            .subscribe(() => {
                this.pagerData.pageNo = 1;
                this.getChangeListDate();
            });
        //   this.getChangeListDate();
    }
    search(terms: string) {
        this.changeApplyFlowData = [];
        this.loading = true;
        this.isshow = false;
        this.searchTermStream.next(terms);
    }

    onChangePage(e) {
        this.isshow = false;
        this.loading = true;
        this.getChangeListDate();
    }
    // 删除草稿数据
    delDraftById(id) {
        this.windowService.confirm({ message: "是否删除？" }).subscribe(res => {
            if (res) {
                this.invoiceApproveService
                    .deleteChangeDeldraft(id)
                    .subscribe(res => {
                        let result = JSON.parse(res["_body"]);
                        if (result["success"]) {
                            this.getChangeListDate();
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

    getChangeListDate() {
        let change: ChangeQuery = new ChangeQuery();
        change.flag = this.flag;
        change.applyPage = this.applyPage;
        change.pageNo = this.pagerData.pageNo;
        change.pageSize = this.pagerData.pageSize;
        change.para = this.para;
        this.stopQuery = this.changeService
            .getChangeListData(change)
            .subscribe(data => {
                this.changeApplyFlowData = data.list;
                this.pagerData.set(data.pager);
                this.approveCount = data.approveCount;
                if (
                    this.changeApplyFlowData &&
                    this.changeApplyFlowData.length > 0
                ) {
                    this.isshow = true;
                } else {
                    this.isshow = false;
                }
                this.loading = false;
            });
    }

    //点击li事件
    changeapplytype = function(flowstates) {
        this.loading = true;
        this.isshow = false;
        this.changeApplyFlowData = [];
        this.stopQuery.unsubscribe();
        this.applyPage = flowstates;
        this.pagerData.pageNo = 1;
        this.getChangeListDate();
    };
    changeFlag(iflag: string) {
        this.loading = true;
        this.isshow = false;
        this.changeApplyFlowData = [];
        this.stopQuery.unsubscribe();
        this.flag = iflag;
        this.applyPage = "1";
        this.pagerData.pageNo = 1;
        this.getChangeListDate();
    }

    get listTip(): string {
        let resulttip = "支票换票-";
        if (this.flag === "0") {
            resulttip = resulttip + "我的申请-";
            if (this.applyPage === "0") {
                resulttip = resulttip + "草稿为空";
            } else if (this.applyPage === "1") {
                resulttip = resulttip + "审批中为空";
            } else if (this.applyPage === "3") {
                resulttip = resulttip + "已完成为空";
            } else {
                resulttip = resulttip + "全部为空";
            }
        } else {
            resulttip = resulttip + "我的审批-";
            if (this.applyPage === "1") {
                resulttip = resulttip + "待我审批为空";
            } else if (this.applyPage === "3") {
                resulttip = resulttip + "我已审批为空";
            } else {
                resulttip = resulttip + "全部为空";
            }
        }
        return resulttip;
    }
    get approveTip(): string {
        let resulttip = "快来点击右上角“新建申请“按钮,开始新建申请吧~";
        if (this.flag === "0") {
            resulttip = "快来点击右上角“新建申请“按钮,开始新建申请吧~";
        } else {
            if (this.applyPage === "1") {
                resulttip = "您把小伙伴的申请都批完了，棒棒哒~";
            } else {
                resulttip = "您还没有审批过小伙伴的申请呢~";
            }
        }
        return resulttip;
    }

    get classStr(): string {
        let result = "iqon-query";
        if (this.flag === "1") {
            if (this.applyPage === "1") {
                result = "iqon-more";
            } else if (this.applyPage === "3") {
                result = "iqon-right";
            }
        }
        return result;
    }

    goDetail(changeid): void {
        if (this.applyPage === "0") {
            window.open(dbomsPath + "invoice/change/reapply/" + changeid);
        } else {
            window.open(dbomsPath + "invoice/change/approve/" + changeid);
            //  this.router.navigate(["/invoice/change/approve/",changeid]);
        }
    }

    newChangeApply(): void {
        window.open(dbomsPath + "invoice/change/apply");
    }
}
