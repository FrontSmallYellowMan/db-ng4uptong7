import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import {
    DbWfviewComponent,
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { WindowService } from "app/core";
import { environment_java } from "../../../../../../../environments/environment";
import { DatePipe, Location } from "@angular/common";
import { DelayApply } from "./delay-info";

declare var window;

@Component({
    templateUrl: "./apply-common.component.html",
    styleUrls: ["./apply-common.component.scss"],
    providers: [DatePipe]
})
export class ApplyCommonComponent implements OnInit {
    modalAddForm: XcModalRef;
    invoiceList = new Array(); //申请单的支票列表信息
    delayApply = new DelayApply();
    attachList = new Array(); //附件列表
    isCurrApprover = 0;
    applyId: string = "";
    isShowApproverBtn = false;
    //按钮组件校验
    public saveId6Flag = true;
    //拒绝的环节id
    public nodeId = "node1";
    //意见
    opinion: string = "同意";
    //当前流程节点id
    currentNode: string = "";
    //延期日期大于10天
    isBiggeerTen: boolean = false;
    //加签风险岗领导审批
    riskManager: string = "";
    @ViewChild("wfview")
    wfView: DbWfviewComponent;

    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };
    appParms = {};
    //加签提交连接地址,组件未开发完
    adpAppParms = {
        apiUrl: "http://10.0.1.26:88/api/InvoiceRevise/ApproveAddTask", //加签人员审批同意
        taskid: ""
    };
    @ViewChildren("sqr") sqr = new Array();
    isView: boolean = true; //是否查看页面 查看页面(true) 审批页面(false)   加签审批
    isADP: boolean = false; //是否加签审批页面
    javaurl: string = environment_java.server;
    constructor(
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private http: Http,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.applyId = params["id"];
            this.getInvoiceDelayData(this.applyId);
            this.appParms = {
                apiUrl_AR: this.javaurl + "invoice/delay-applys/reject", //拒绝
                apiUrl_Sign: this.javaurl + "invoice/delay-applys/signature", //加签
                apiUrl_Transfer:
                    this.javaurl + "invoice/delay-applys/flow-transfer", //转办
                parmsMap: {
                    id: this.applyId,
                    nodeId: this.nodeId,
                    isBiggeerTen: this.isBiggeerTen
                },
                navigateUrl: "/invoice/delaylist"
            };
        });
    }

    getInvoiceDelayData = function(applyId) {
        let url = this.javaurl + "invoice/delay-apply-detail/" + applyId;
        this.http
            .get(url)
            .map(res => res.json())
            .subscribe(res => {
                this.delayApply = res.item[0].invoiceDelayApply;
                let dataPerson = {
                    userID: this.delayApply.applyItcode,
                    userEN: this.delayApply.applyItcode,
                    userCN: this.delayApply.applyUserName
                };
                this.sqr._results[0].Obj = dataPerson;
                this.invoiceList = res.item[0].delayInvoiceList;
                this.attachList = res.item[0].attachList;
                this.wfData.wfHistoryData = res.item[1]; //流程审批记录信息
                this.wfData.wfprogress = res.item[2]; //流程图信息
                this.wfView.onInitData(this.wfData.wfprogress);
                this.isCurrApprover = res.item[3];
                if (
                    this.delayApply.flowStatus == 1 &&
                    this.isCurrApprover == 1
                ) {
                    this.isShowApproverBtn = true;
                } else {
                    this.isShowApproverBtn = false;
                }
                this.currentNode = this.delayApply.flowCurrNodeId;
                this.riskManager = this.delayApply.riskManagerApprover;
                this.isBiggeerTen = res.item[4];
            });
    };

    getRiskManager = function(applyId) {
        let url = this.javaurl + "invoice/delay-apply-detail/" + applyId;
        this.http
            .get(url)
            .map(res => res.json())
            .subscribe(res => {
                this.delayApply = res.item[0].invoiceDelayApply;
                this.riskManager = this.delayApply.riskManagerApprover;
            });
    };

    headers = new Headers({ "Content-Type": "application/json" });
    options = new RequestOptions({ headers: this.headers });

    //审批
    public saveBill(op) {
        this.opinion = op;
        var data = { id: this.applyId, opinion: this.opinion };
        this.http
            .post(this.javaurl + "invoice/delay-applys/agreement", data)
            .toPromise()
            .then(res => {
                this.windowService.alert({
                    message: "审批成功",
                    type: "success"
                });
                try {
                    window.opener.document
                        .getElementById("searchChange")
                        .click();
                } catch (e) {}
                setTimeout(function() {
                    window.close();
                }, 1000);

                //  this.windowService.confirm({ message: "审批成功,是否关闭页面？" }).subscribe({
                //         next: (v) => {
                //             if (v) {
                //             window.close();
                //             }
                //         }
                //      });
            });
    }

    reject(): void {
        var data = { id: this.applyId, opinion: "驳回", nodeId: "node1" };
        var url = this.javaurl + "invoice/delay-applys/reject";
        this.http
            .post(url, data, this.options)
            .toPromise()
            .then(res => {
                this.windowService.alert({
                    message: "审批成功！",
                    type: "success"
                });
            });
    }

    close() {
        window.close();
    }

    goBack() {
        window.close();
    }
}
