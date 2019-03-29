import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Pager, XcModalService, XcModalRef } from "app/shared/index";
import { WindowService } from "app/core";
import { InvoiceTakebackService } from "../../../services/invoice/invoice-takeback.service";
import { InvoiceInfo } from "../invoice/invoice-info";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import { TakebackAddComponent } from "./addform/takeback-add.component";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
import { InvoiceCommonListComponent } from "../../common/invoice-common-list.component";
declare var window;

@Component({
    templateUrl: "./takeback-apply.component.html",
    styleUrls: ["./takeback-apply.component.scss"]
})
export class TakebackApplyComponent implements OnInit {
    public invoicelist = new Array();
    public takebackRemark = "";
    public itcodeAndName = "";
    public phone = "";
    public addFlag: boolean = false;
    public modalAddForm: XcModalRef;
    public submitFlag = "0";
    person = [];
    public constructor(
        private windowService: WindowService,
        private activatedRouter: ActivatedRoute,
        private invoiceTakebackService: InvoiceTakebackService,
        private invoiceApplyService: InvoiceApplyService,
        private xcModalService: XcModalService
    ) {}

    ngOnInit() {
        this.activatedRouter.params.subscribe((params: Params) => {
            let id = params["id"];
            if (id != "-1") {
                this.invoiceTakebackService.getTakebackInfo(id).then(res => {
                    this.invoicelist.push(res.item);
                    this.takebackRemark = res.item.takebackRemark;
                });
            } else {
                this.addFlag = true;
            }
        });

        //查看组件
        this.modalAddForm = this.xcModalService.createModal(
            InvoiceCommonListComponent
        );

        //模型关闭的时候 如果有改动，请求刷新
        this.modalAddForm.onHide().subscribe(data => {
            this.invoicelist = this.invoicelist.filter(
                item => item.id !== "-1"
            );
            if (data) {
                data.forEach(item => {
                    this.invoicelist.push(item);
                });
            }
        });

        this.invoiceApplyService.getLoginUser().then(user => {
            let plantformCode =
                user.sysUsers.flatCode.length === 1
                    ? "0" + user.sysUsers.flatCode
                    : user.sysUsers.flatCode;
            this.itcodeAndName =
                user.sysUsers.itcode + "/" + user.sysUsers.userName;
            this.phone = user.mobile;
            let aperson = {
                userID: user.sysUsers.userNo,
                userEN: user.sysUsers.itcode,
                userCN: user.sysUsers.userName
            };
            this.person.push(aperson);
        });
    }

    changePerson(info?) {
        if (info) {
            this.phone = info[0]["mobile"];
        }
    }
    //查询当前用户的支票列表信息
    //查询当前用户的支票列表信息
    searchInvoice(): void {
        var ids: string = "";
        this.invoicelist.forEach(item => {
            if (item.id != -1) {
                ids += item.id + ",";
            }
        });
        if (ids.length > 0) {
            ids = ids.substring(0, ids.length - 1);
        } else {
            ids = "-1";
        }
        var data1 = {
            applyids: ids,
            status: "",
            typeval: "QH",
            sqruserItcode: this.person[0].userEN
        };
        this.modalAddForm.show(data1);
    }

    //删除列信息
    deltr = function(e) {
        this.invoicelist.splice(e, 1);
    };
    close() {
        window.close();
    }
    //批量取回
    takeback() {
        if (this.takebackRemark === "") {
            this.windowService.alert({
                message: "请填写取回原因",
                type: "warn"
            });
            return;
        }
        if (this.invoicelist.length == 0) {
            this.windowService.alert({ message: "请添加支票", type: "warn" });
            return;
        }
        // this.windowService.confirm({message:'确定取回支票吗？'}).subscribe(r =>{
        //     if(r){
        this.submitFlag = "1";
        let idStr = "";
        this.invoicelist.forEach(invoice => {
            idStr += invoice.id + ",";
        });
        this.invoiceTakebackService
            .takebackApply(
                idStr.substring(0, idStr.length - 1),
                this.takebackRemark
            )
            .then(res => {
                if (res.success) {
                    this.windowService.alert({
                        message: "提交成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        try {
                            window.opener.document
                                .getElementById("getTakebackApprove")
                                .click();
                        } catch (error) {}
                        window.close();
                    }, 2000);
                } else {
                    this.submitFlag = "0";
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
        //     }
        // })
    }
    //重新取回
    takeback2() {
        if (this.takebackRemark === "") {
            this.windowService.alert({
                message: "请填写取回原因",
                type: "warn"
            });
            return;
        }

        // this.windowService
        //     .confirm({ message: "确定重新发起取回申请吗？" })
        //     .subscribe(r => {
        //         if (r) {
        this.submitFlag = "1";
        this.invoiceTakebackService
            .approveTakeback(
                this.invoicelist[0].id,
                this.phone,
                this.takebackRemark
            )
            .then(res => {
                if (res.success) {
                    this.windowService.alert({
                        message: "提交成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        if (
                            window.opener.document
                                .getElementById("getTakebackApprove")
                                .click() != null
                        ) {
                            window.opener.document
                                .getElementById("getTakebackApprove")
                                .click();
                        }
                        window.close();
                    }, 1000);
                } else {
                    this.submitFlag = "0";
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
        //     }
        // });
    }

    // //单个取回
    // takebackSingle(id){
    //     if(this.takebackRemark===""){
    //       this.windowService.alert({ message: "请填写退回原因", type: 'warn' });
    //       return;
    //     }
    //     this.windowService.confirm({message:'确定取回该支票吗？'}).subscribe(r =>{
    //         if(r){
    //             this.invoiceTakebackService.takebackApply(id,this.takebackRemark)
    //             .then(res =>{
    //                 if(res.success){
    //                     this.fullCheckedIndeterminate = false;
    //                     this.fullChecked = false;
    //                     this.getTakebackList();
    //                     this.windowService.alert({message:res.message,type:"success"});
    //                 }else{
    //                     this.windowService.alert({message:res.message,type:"fail"});
    //                 }
    //             })
    //         }
    //     })
    // }
}
