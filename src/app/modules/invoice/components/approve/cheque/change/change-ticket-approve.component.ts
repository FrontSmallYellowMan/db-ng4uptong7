import { Component, OnInit, Input, Output, ViewChild } from "@angular/core";
import { InvoiceChangeService } from "../../../../services/invoice/invoice-change.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HttpServer } from "app/shared/services/db.http.server";
import { DbWfviewComponent } from "app/shared/index";
import { WindowService } from "app/core";
import { environment_java } from "../../../../../../../environments/environment";
import { Person } from "app/shared/services/index";
declare var window;
@Component({
    selector: "db-change-approve",
    templateUrl: "./change-ticket-approve.component.html",
    styleUrls: ["./change-ticket-approve.component.scss"],
    providers: [HttpServer]
})
export class ChangeTicketApproveComponent implements OnInit {
    applyId: string = ""; //审批单ID
    applyDate: any; //申请时间
    mobile: string = ""; //联系电话
    department: string = ""; //部门
    changeReason: string = ""; //换票原因
    changeList = new Array();

    @ViewChild("wfview")
    wfView: DbWfviewComponent;
    public change; //变更信息
    userInfo = new Person(); //申请人
    isView: boolean = true; //是否查看页面 查看页面(true) 审批页面(false)   加签审批
    isClick: boolean = false; //已点击
    constructor(
        private changeService: InvoiceChangeService,
        private route: ActivatedRoute,
        private windowService: WindowService,
        private router: Router
    ) {}

    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };
    //意见
    opinions: string = "";
    //拒绝的环节id
    public nodeId = "node1";

    changeId: string = ""; //换票申请主键

    loading: boolean = true;

    agreeValue: string = "同意";
    rejectValue: string = "驳回";

    appConfirm() {
        //     this.windowService.confirm({ message: "审批成功,是否关闭页面？" }).subscribe({
        //     next: (v) => {
        //         if (v) {
        //         window.close();
        //         }
        //     }
        //  });
        this.windowService.alert({ message: "审批成功", type: "success" });
        setTimeout(function() {
            window.close();
        }, 1000);
    }
    //提交事件
    agree() {
        this.isClick = true;
        this.agreeValue = "处理中...";
        if (this.opinions.length == 0) {
            this.opinions = "同意";
        }

        var data = { id: this.changeId, opinion: this.opinions };
        this.changeService
            .submitApprove(
                environment_java.server + "invoice/change/approve/agreement",
                data
            )
            .then(res => {
                //  this.windowService.alert({ message:  res.json().message, type: 'success' });
                // this.isView = true;
                this.loading = false;
                try {
                    window.opener.document
                        .getElementById("searchChange")
                        .click();
                } catch (error) {}
                this.appConfirm();
            })
            .catch(res => {
                res = res.json();
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
                // this.isView = true;
            });
    }

    reject() {
        //   if(this.isClick){
        //    this.windowService.alert({ message: '任务处理中或已处理,请勿多次点击 ', type: "fail" });
        //     return;
        //  }
        if (!this.opinions) {
            this.windowService.alert({
                message: "请填写审批意见 ",
                type: "fail"
            });
            return;
        }
        this.isClick = true;
        this.rejectValue = "处理中...";

        var data = {
            parmsMap: { id: this.changeId, nodeId: this.nodeId },
            opinions: this.opinions
        };
        this.changeService
            .submitApprove(
                environment_java.server + "invoice/change/approve/reject",
                data
            )
            .then(res => {
                //  this.windowService.alert({ message:  res.json().message, type: 'success' });
                // this.isView = true;
                this.loading = false;
                try {
                    window.opener.document
                        .getElementById("searchChange")
                        .click();
                } catch (error) {}
                this.appConfirm();
            })
            .catch(res => {
                res = res.json();
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
                // this.isView = true;
            });
    }

    close() {
        window.close();
        // this.router.navigate(["/invoice/change/list"]);
    }
    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            let x = params["id"];
            this.changeId = x;
            this.changeService.loadChangeInfo(x).subscribe(res => {
                this.change = JSON.parse(res.item[0]);
                this.applyId = this.change.changeApplyId;
                this.applyDate = this.change.createDate;
                this.mobile = this.change.applyTelephone;
                this.department = this.change.applyDepartment;
                this.changeReason = this.change.changeReason;
                this.changeList = this.change.invoiceChangeList;
                this.userInfo.userEN = this.change.applyItCode;
                this.userInfo.userID = this.change.applyItCode.toLocaleLowerCase();
                this.userInfo.userCN = this.change.applyUserName;
                this.wfData.wfHistoryData = res.item[1]; //流程日志信息
                this.wfData.wfprogress = res.item[2]; //流程图信息

                if (this.change.flowStatus === 1 && res.item[3]) {
                    this.isView = false;
                }
                this.wfView.onInitData(this.wfData.wfprogress);
                this.loading = false;
            });
        });
    }
}
