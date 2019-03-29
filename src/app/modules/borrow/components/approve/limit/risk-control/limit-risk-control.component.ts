import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { WindowService } from "app/core";
import { Location } from "@angular/common";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { LimitApproveService } from "./../../../../services/limit-approve.service";
import {
    BorrowAmount,
    BorrowAmountBusinessScope,
    BorrowAmountPo
} from "./../../../limit";
import { DbWfviewComponent } from "app/shared/index";
import { FlowInfoParam } from "./../../../common-entity";
import { environment_java } from "./../../../../../../../environments/environment";
import { Person } from "app/shared/services/index";
declare var window;
@Component({
    templateUrl: "./limit-risk-control.component.html",
    styleUrls: ["./limit-risk-control.component.scss"],
    providers: [LimitApproveService]
})
export class LimitApproveRiskControlComponent implements OnInit {
    pageType: string;
    applyId: string;
    mainData: BorrowAmount = new BorrowAmount();
    subData: BorrowAmountBusinessScope[];
    remark: string;
    @ViewChild("wfview")
    wfView: DbWfviewComponent; //展示流程图
    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };
    isView: boolean = false; //是否只读页面
    appParms = {};
    public nodeId = "node1"; //拒绝环节的nodeId
    userInfo = new Person(); //申请人
    notChange: boolean = false; //等到人员信息有了再带入头像
    isvisble: boolean = true; //审批拒绝按钮是否可点击，默认可点击
    //按钮组件校验
    //public saveId6Flag = true;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private limitApproveService: LimitApproveService,
        private location: Location,
        private windowService: WindowService
    ) {}
    name = "额度申请审批";
    ngOnInit() {
        //获取是审批页面还是查看页面
        this.route.params.subscribe(params => {
            this.applyId = params["id"];
        });
        //this.applyId = this.route.snapshot.queryParams["id"];
        //查询申请单信息
        this.limitApproveService
            .queryApplyformDetail(this.applyId)
            .then(res => {
                this.mainData = res.applyData.mainData;
                this.subData = res.applyData.subData;
                //console.log(res.isCurrentAuditor === "0" + " " + res.isCurrentAuditor);
                this.isView = res.isCurrentAuditor === "0";
                this.wfData.wfHistoryData = res.wfHistoryData;
                this.wfData.wfprogress = res.wfprogress;
                this.wfView.onInitData(this.wfData.wfprogress);
                //console.log(this.mainData);
                // this.userInfo.userEN = this.mainData.applyItCode.toLocaleLowerCase();
                // this.userInfo.userID = this.userInfo.userEN;
                // this.userInfo.userCN = this.mainData.applyUserName;
                // this.notChange = true;

                // let instId: string = res.mainData.instId;
                // //console.log(instId);
                // this.limitApproveService.queryReadOnlyFlag(instId).then(data => {
                //     if (data.success) {
                //         //只有当处于流程中，并且canSubmit为1时不只读
                //         if (this.mainData.flowStatus === 1) {
                //             this.isView = data.item.canSubmit === '0';//被拒绝重新发起canSubmit也为1
                //         }
                //     }
                // });
                //流程按钮连接地址
                let flowParam: FlowInfoParam = new FlowInfoParam();

                // this.appParms = {
                //     apiUrl_AR: environment_java.server + "borrow/borrow-amount/" + this.mainData.id + "/reject",//拒绝
                //     apiUrl_Sign: environment_java.server + "borrow/borrow-amount/" + this.mainData.id + "/addSign",//加签
                //     apiUrl_Transfer: environment_java.server + "borrow/borrow-amount/" + this.mainData.id + "/replaceAuth",//转办
                //     navigateUrl: "/borrow/limit",
                //     nodeId: this.nodeId,
                // };
                //查询审批日志和流程图

                // this.limitApproveService.queryLogHistoryAndProgress(this.mainData.instId)
                //     .then(data => {

                //         this.wfData = data;
                //         this.wfView.onInitData(this.wfData.wfprogress);
                //     })
            });
    }
    agree() {
        //this.remark = opinion;
        this.isvisble = false;
        this.limitApproveService.agree(this.applyId, this.remark).then(data => {
            if (data.success) {
                if (window.opener.document.getElementById("searchBtn")) {
                    window.opener.document.getElementById("searchBtn").click();
                }
                // this.windowService.confirm({ message: "操作成功,是否关闭页面？" }).subscribe({
                //     next: (v) => {
                //         if (v) {
                //             window.close();
                //         }
                //     }
                // });
                this.windowService.alert({
                    message: "审批成功",
                    type: "success"
                });
                setTimeout(function() {
                    window.close();
                }, 1000);
            } else {
                this.windowService.alert({
                    message: data.message,
                    type: "fail"
                });
                this.isvisble = true;
            }
        });
    }
    reject() {
        if (!this.remark) {
            this.windowService.alert({
                message: "请填写审批意见 ",
                type: "fail"
            });
            return;
        }
        this.isvisble = false;
        this.limitApproveService
            .reject(this.applyId, this.remark, "node1")
            .then(data => {
                if (data.success) {
                    if (window.opener.document.getElementById("searchBtn")) {
                        window.opener.document
                            .getElementById("searchBtn")
                            .click();
                    }
                    this.windowService.alert({
                        message: "审批成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                    // this.windowService
                    //     .confirm({ message: "操作成功,是否关闭页面？" })
                    //     .subscribe({
                    //         next: v => {
                    //             if (v) {
                    //                 window.close();
                    //             }
                    //         }
                    //     });
                } else {
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                    this.isvisble = true;
                }
            });
    }
    goback() {
        window.close();
    }
}
