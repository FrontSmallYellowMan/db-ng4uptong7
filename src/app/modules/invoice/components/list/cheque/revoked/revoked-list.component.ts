import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Pager } from "app/shared/index";
import { WindowService } from "app/core";
import {
    environment_java,
    dbomsPath
} from "../../../../../../../environments/environment";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { InvoiceApproveService } from "../../../../services/invoice/invoice-approve.service";
@Component({
    selector: "db-revoked-list",
    templateUrl: "./revoked-list.component.html",
    styleUrls: ["./revoked-list.component.scss"]
})
export class RevokedListComponent implements OnInit {
    constructor(
        private windowService: WindowService,
        private router: Router,
        private http: Http,
        private invoiceApproveService: InvoiceApproveService
    ) {}

    ngOnInit() {}
    isSearchResult: boolean = false; //是否显示搜索结果，默认为不显示
    img1 = "iqon-report";
    msg1 = "支票撤票-我的申请-审批中为空";
    msg2 = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
    //搜索条件
    InvoicePeopleITCode: string = "";
    //列表数据
    public freezePersonnelData;

    //我的审批cout
    // count1=0;
    count2 = 0;
    //流程状态
    flowstates: String = "1";

    flag: string = "0";
    //分页
    public pagerData = new Pager();

    public currentPageSize;
    onChangePage = function(e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
        this.getFreezeInfo();
    };
    changeFlag(iflag: string) {
        this.flag = iflag;
        if (iflag == "0") {
            this.flowstates = "1";
        } else {
            this.flowstates = "01";
        }
        this.changeapplytype(this.flowstates);
    }
    goto(id) {
        window.open(
            dbomsPath + "invoice/revoked/approve/" + id + "/" + this.flowstates
        );
    }
    addsq() {
        window.open(dbomsPath + "invoice/revoked/apply");
    }

    getCount = function() {
        this.http
            .get(environment_java.server + "/revoked/invoice-revoked-dwsp", {})
            .map(res => res.json())
            .subscribe(res => {
                /* if (res.item.key1>0) {
                 this.count1=res.item.key1;
              }*/
                if (res.item.key2 > 0) {
                    this.count2 = res.item.key2;
                }
            });
    };
    // 删除草稿数据
    delDraftById(id) {
        this.windowService.confirm({ message: "是否删除？" }).subscribe(res => {
            if (res) {
                this.invoiceApproveService
                    .deleteRevokeDraft(id)
                    .subscribe(res => {
                        let result = JSON.parse(res["_body"]);
                        if (result["success"]) {
                            this.getFreezeInfo();
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
    //搜索冻结人员
    getFreezeInfo = function() {
        this.isSearchResult = true;
        let pagerData = this.pagerData;
        let url = environment_java.server + "/revoked/invoice-revoked-applys";
        let params: URLSearchParams = new URLSearchParams();
        params.set("flowStatus", this.flowstates);
        params.set("InvoicePeopleITCode", this.InvoicePeopleITCode);
        params.set("pageNo", pagerData.pageNo.toString());
        params.set("pageSize", pagerData.pageSize.toString());
        this.http
            .get(url, { search: params })
            .map(res => res.json())
            .subscribe(res => {
                if (res.list) {
                    this.freezePersonnelData = res.list;
                    for (let i = 0; i < this.freezePersonnelData.length; i++) {
                        this.freezePersonnelData[i].num =
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
                if (res.pager.total <= 0) {
                    this.isSearchResult = false;
                }
                //查询数量
                this.getCount();
            });
    };
    //点击li事件
    changeapplytype = function(flowstates) {
        this.flowstates = flowstates;
        this.img1 = "iqon-report";
        if (flowstates == "1") {
            this.msg1 = "支票撤票-我的申请-审批中为空";
            this.msg2 = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
        } else if (flowstates == "3") {
            this.msg1 = "支票撤票-我的申请-已完成";
            this.msg2 = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
        } else if (flowstates == "0") {
            this.msg1 = "支票撤票-我的申请-草稿为空";
            this.msg2 = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
        } else if (flowstates == "myall") {
            this.msg1 = "支票撤票-我的申请-全部";
            this.msg2 = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
        } else if (flowstates == "01") {
            this.img1 = "iqon-more";
            this.msg1 = "支票撤票-我的申请-待我审批";
            this.msg2 = "你把小伙伴的申请都审批完啦，棒棒哒~";
        } else if (flowstates == "02") {
            this.img1 = "iqon-right";
            this.msg1 = "支票撤票-我的审批-我已审批";
            this.msg2 = "你还没有审批过小伙伴的申请呢~";
        } else if (flowstates == "all") {
            this.msg1 = "支票撤票-我的审批-全部";
            this.msg2 = "你还没有审批过小伙伴的申请呢~";
        }
        this.getFreezeInfo();
    };
    mykeydown() {
        this.getFreezeInfo();
    }
}
