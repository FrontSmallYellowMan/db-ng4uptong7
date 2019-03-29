import { Component, OnInit, Input, Output, ViewChild } from "@angular/core";
import {
    DbWfviewComponent,
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import { Router, ActivatedRoute, Params } from "@angular/router";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { WindowService } from "app/core";
import { Location } from "@angular/common";
import { InvoiceTakebackService } from "../../../services/invoice/invoice-takeback.service";

declare var window;

@Component({
    templateUrl: "./takeback-approve.component.html"
})
export class TakebackApproveComponent implements OnInit {
    takebackId: string = "";
    //信息
    public takebackObj: any = [];
    clickFlag = "0";
    flag = "";
    constructor(
        private routerInfo: ActivatedRoute,
        private windowService: WindowService,
        private invoiceTakebackService: InvoiceTakebackService,
        private router: Router
    ) {}
    ngOnInit() {
        //url获取参数值
        //this.takebackId = this.routerInfo.snapshot.params['takebackId'];
        this.routerInfo.params.subscribe((params: Params) => {
            this.takebackId = params["takebackId"];
            this.flag = params["flag"];
        });
        this.load_invoice();
    }

    //查询当前审批单
    load_invoice() {
        this.invoiceTakebackService
            .getTakebackInfo(this.takebackId)
            .then(res => {
                if (res.item) {
                    this.takebackObj = res.item; //申请单信息
                }
            });
    }

    //审批
    approveTakeback(invoiceStatus) {
        if (invoiceStatus == "no" && this.takebackObj.approveNote == "") {
            this.windowService.alert({
                message: "请填写审批原因",
                type: "warn"
            });
            return;
        }
        if (this.takebackObj.approveNote == "") {
            this.takebackObj.approveNote = "同意";
        }
        // this.windowService
        //     .confirm({ message: "确定此操作吗？" })
        //     .subscribe(r => {
        //         if (r) {
        this.invoiceTakebackService
            .approveTakeback(
                this.takebackObj.id,
                invoiceStatus,
                this.takebackObj.approveNote
            )
            .then(res => {
                if (res.success) {
                    // this.clickFlag = "1";
                    this.windowService.alert({
                        message: "审批成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                } else {
                    this.clickFlag = "0";
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
        //     }
        // });
    }
    //关闭页面
    close() {
        window.close();
    }
}
