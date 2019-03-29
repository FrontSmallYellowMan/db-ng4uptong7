import { Component, OnInit } from "@angular/core";
import { LimitManageService } from "./../../../services/limit-manage.service";
import { LimitListService } from "./../../../services/limit-list.service";
import {
    BorrowAmountBusinessScope,
    BorrowAmount,
    LimitUsedLog
} from "./../../limit";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { XcModalService, XcBaseModal, XcModalRef } from "app/shared/index";
import { WindowService } from "app/core";
import { Person } from "app/shared/services/index";
import { dbomsPath } from "environments/environment";
declare var window;
@Component({
    selector: "db-change-approve",
    templateUrl: "./limit-manage-new.component.html",
    styleUrls: ["./limit-manage-new.component.scss"],
    providers: [LimitListService, LimitManageService]
})
export class LimitManageNewComponent implements OnInit {
    apply: BorrowAmount = new BorrowAmount();
    subData: BorrowAmountBusinessScope[] = [];
    public modalAddForm: XcModalRef; //模态框
    applyType: string; //n-新建 e-编辑
    itemid?: string; //表单主键
    logList: LimitUsedLog[] = [];
    disabled: boolean = false; //按钮是否可点击
    userInfo = new Person(); //申请人
    notChange: boolean = false; //等到人员信息有了再带入头像
    oldCurrentAmount: number; //旧的常规额度
    usedAmountNew: number; //单位元
    isShow: boolean = false; //默认隐藏
    constructor(
        private listService: LimitListService,
        private manageService: LimitManageService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private windowService: WindowService
    ) {}
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.applyType = params["flag"];
        });
        if (this.applyType === "n") {
            this.apply.applyDimension = "1";
            this.listService.getApplyUserInfo().then(data => {
                this.apply.applyItCode = data.sysUsers.itcode;
                this.apply.applyUserName = data.sysUsers.userName;
                this.apply.applyUserNo = data.sysUsers.userNo;
                this.apply.applyUserTel = data.mobile;
                this.apply.platformCode = data.sysUsers.flatCode;
                this.apply.platformName = data.sysUsers.flatName;
                this.userInfo.userEN = data.sysUsers.itcode.toLocaleLowerCase();
                this.userInfo.userID = this.userInfo.userEN;
                this.userInfo.userCN = data.sysUsers.userName;
                this.notChange = true;
            });
        } else if (this.applyType === "e") {
            this.route.params.subscribe(
                params => (this.itemid = params["itemid"])
            );
            this.manageService.queryLimitManageInfo(this.itemid).then(data => {
                this.apply = data.applyData.mainData;
                this.subData = data.applyData.subData;
                this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
                this.userInfo.userID = this.userInfo.userEN;
                this.userInfo.userCN = this.apply.applyUserName;
                this.notChange = true;
                this.oldCurrentAmount = this.apply.currentAmount;
                this.usedAmountNew = parseFloat(
                    (this.apply.usedAmount * 10000).toFixed(2)
                );
                //查询额度使用记录
                this.manageService
                    .queryDeptAmountUsedLog(
                        this.apply.baseDeptName,
                        this.apply.deptName,
                        this.apply.applyDimension === "0"
                    )
                    .then(data => {
                        if (data.success) {
                            this.logList = data.list;
                            for (let item of this.logList) {
                                item.applyAmount = parseFloat(
                                    (item.applyAmount * 10000).toFixed(2)
                                );
                            }
                        }
                    });
            });
        }
    }
    goBack() {
        //this.location.back();
        window.close();
    }
    getOrgBusiScope(data) {
        let isbase: boolean = this.apply.applyDimension === "0"; //是否本部
        //更新当前额度
        this.apply.currentAmount = 0;
        if (!isbase) {
            this.apply.deptName = data[0];
            this.apply.baseDeptName = data[1];
        } else {
            this.apply.baseDeptName = data[0];
            this.apply.deptName = "";
        }
        this.listService
            .getBusinessScopeByDeptName(
                this.apply.baseDeptName,
                this.apply.deptName,
                isbase
            )
            .then(res => {
                if (res.success) {
                    let list = res.list;
                    let subData = new Array<BorrowAmountBusinessScope>(
                        list.length
                    );
                    for (let i = 0; i < list.length; i++) {
                        subData[i] = new BorrowAmountBusinessScope();
                        subData[i].businessScopeCode =
                            list[i]["businessScopeCode"];
                        subData[i].businessScopeName = list[i]["YWFWMC"];
                        //this.apply.businessScope = list[i]["businessScopeCode"];
                    }
                    this.subData = subData;
                } else {
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
    }
    changeApplyDimension(applyDimension: string) {
        this.apply.applyDimension = applyDimension;
        this.apply.deptName = "";
        this.apply.baseDeptName = "";
        this.apply.currentAmount = 0;
        this.subData = [];
    }
    /**
     * 计算常规额度
     */
    calculateCurrAmount() {
        if (this.subData && this.subData.length > 0) {
            let currentAmount = 0;
            for (let i = 0; i < this.subData.length; i++) {
                let deptRelation = this.subData[i];
                if (deptRelation.setAmount && !isNaN(deptRelation.setAmount)) {
                    // console.log(deptRelation.setAmount);
                    currentAmount = +currentAmount + +deptRelation.setAmount;
                }
            }
            this.apply.currentAmount = parseFloat(currentAmount.toFixed(6));
        } else {
            this.apply.currentAmount = 0;
        }
    }
    authticateForm(submitType: string) {
        let flag: boolean = false;
        this.subData.forEach(item => {
            if (
                item.setAmount === undefined ||
                item.setAmount.toString().trim() === ""
            ) {
                //console.log("i am here");
                if (submitType === "1") {
                    this.windowService.alert({
                        message: "“" + item.businessScopeCode + "”额度不能为空",
                        type: "fail"
                    });
                    flag = true;
                    return flag;
                }
            } else {
                //判断金额是否为number型
                let reg = /^(([1-9]\d*|0)(.\d{1,6})?)$/;
                if (!reg.test("" + item.setAmount)) {
                    this.windowService.alert({
                        message:
                            "“" +
                            item.businessScopeCode +
                            "”额度必须为数字且最多只能有六位小数",
                        type: "fail"
                    });
                    flag = true;
                    return flag;
                }
            }
        });
        return flag;
    }
    //新建提交
    submitApply() {
        if (this.authticateForm("1")) {
            return;
        }
        //判断是否保存过同事业部或本部的
        this.listService
            .checkHaveDeptAmount(this.apply.baseDeptName, this.apply.deptName)
            .then(data => {
                if (data.success) {
                    if (data.message === "1") {
                        this.windowService.alert({
                            message: "该部门已经申请过额度",
                            type: "success"
                        });
                    } else if (data.message === "0") {
                        this.apply.flowStatus = 3; //借用跟踪新建额度，状态为完成
                        this.listService
                            .saveDraft(this.apply, this.subData)
                            .then(res => {
                                if (res.success) {
                                    this.disabled = true;
                                    window.opener.document
                                        .getElementById("searchBtn")
                                        .click();
                                    this.windowService.alert({
                                        message: "保存成功",
                                        type: "success"
                                    });
                                    setTimeout(function() {
                                        window.close();
                                    }, 1500);
                                    // this.windowService.confirm({ message: "操作成功,是否关闭页面？" }).subscribe({
                                    //     next: (v) => {
                                    //         if (v) {
                                    //             window.close();
                                    //         }
                                    //     }
                                    // });
                                } else {
                                    this.windowService.alert({
                                        message: "操作失败",
                                        type: "fail"
                                    });
                                    //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                }
                            });
                    }
                } else {
                    this.windowService.alert({
                        message: "运行出错",
                        type: "fail"
                    });
                    this.router.navigateByUrl(
                        "/borrow/tracking/tracking-limit"
                    );
                }
            });
    }
    //编辑提交
    submitRDraft() {
        //判断是否保存过同事业部或本部的
        this.listService
            .checkHaveDeptAmount(this.apply.baseDeptName, this.apply.deptName)
            .then(data => {
                if (data.success) {
                    if (data.message === "1") {
                        if (
                            this.oldCurrentAmount === this.apply.currentAmount
                        ) {
                            this.windowService
                                .confirm({
                                    message: `调整后的额度和当前额度相同，请确认`
                                })
                                .subscribe(v => {
                                    if (v) {
                                        this.listService
                                            .submitEditForm(
                                                this.itemid,
                                                this.apply,
                                                this.subData
                                            )
                                            .then(data => {
                                                if (data.success) {
                                                    this.disabled = true;
                                                    window.opener.document
                                                        .getElementById(
                                                            "searchBtn"
                                                        )
                                                        .click();
                                                    this.windowService.alert({
                                                        message: "保存成功",
                                                        type: "success"
                                                    });
                                                    setTimeout(function() {
                                                        window.close();
                                                    }, 1500);
                                                    // this.windowService
                                                    //     .confirm({
                                                    //         message:
                                                    //             "操作成功,是否关闭页面？"
                                                    //     })
                                                    //     .subscribe({
                                                    //         next: v => {
                                                    //             if (v) {
                                                    //                 window.close();
                                                    //             }
                                                    //         }
                                                    //     });
                                                } else {
                                                    this.windowService.alert({
                                                        message: "操作失败",
                                                        type: "fail"
                                                    });
                                                    //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                                }
                                            });
                                    }
                                });
                        } else if (
                            this.oldCurrentAmount > this.apply.currentAmount
                        ) {
                            this.windowService
                                .confirm({
                                    message: `调整后的额度小于目前额度，请确认`
                                })
                                .subscribe(v => {
                                    if (v) {
                                        this.listService
                                            .submitEditForm(
                                                this.itemid,
                                                this.apply,
                                                this.subData
                                            )
                                            .then(data => {
                                                if (data.success) {
                                                    this.disabled = true;
                                                    // this.windowService.alert({ message: '操作成功', type: "success" });
                                                    // this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                                    window.opener.document
                                                        .getElementById(
                                                            "searchBtn"
                                                        )
                                                        .click();
                                                    this.windowService.alert({
                                                        message: "保存成功",
                                                        type: "success"
                                                    });
                                                    setTimeout(function() {
                                                        window.close();
                                                    }, 1500);
                                                    // this.windowService
                                                    //     .confirm({
                                                    //         message:
                                                    //             "操作成功,是否关闭页面？"
                                                    //     })
                                                    //     .subscribe({
                                                    //         next: v => {
                                                    //             if (v) {
                                                    //                 window.close();
                                                    //             }
                                                    //         }
                                                    //     });
                                                } else {
                                                    this.windowService.alert({
                                                        message: "操作失败",
                                                        type: "fail"
                                                    });
                                                    //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                                }
                                            });
                                    }
                                });
                        } else {
                            this.listService
                                .submitEditForm(
                                    this.itemid,
                                    this.apply,
                                    this.subData
                                )
                                .then(data => {
                                    if (data.success) {
                                        this.disabled = true;
                                        window.opener.document
                                            .getElementById("searchBtn")
                                            .click();
                                        this.windowService.alert({
                                            message: "保存成功",
                                            type: "success"
                                        });
                                        setTimeout(function() {
                                            window.close();
                                        }, 1500);
                                        // this.windowService
                                        //     .confirm({
                                        //         message:
                                        //             "操作成功,是否关闭页面？"
                                        //     })
                                        //     .subscribe({
                                        //         next: v => {
                                        //             if (v) {
                                        //                 window.close();
                                        //             }
                                        //         }
                                        //     });
                                    } else {
                                        this.windowService.alert({
                                            message: "操作失败",
                                            type: "fail"
                                        });
                                        //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                    }
                                });
                        }
                    } else if (data.message === "0") {
                        this.apply.flowStatus = 3; //借用跟踪新建额度，状态为完成
                        this.listService
                            .saveDraft(this.apply, this.subData)
                            .then(res => {
                                if (res.success) {
                                    window.opener.document
                                        .getElementById("searchBtn")
                                        .click();
                                    this.windowService.alert({
                                        message: "保存成功",
                                        type: "success"
                                    });
                                    setTimeout(function() {
                                        window.close();
                                    }, 1500);
                                    // this.windowService
                                    //     .confirm({
                                    //         message: "操作成功,是否关闭页面？"
                                    //     })
                                    //     .subscribe({
                                    //         next: v => {
                                    //             if (v) {
                                    //                 window.close();
                                    //             }
                                    //         }
                                    //     });
                                } else {
                                    this.windowService.alert({
                                        message: "操作失败",
                                        type: "fail"
                                    });
                                    //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                                }
                            });
                    }
                } else {
                    this.windowService.alert({
                        message: "运行出错",
                        type: "fail"
                    });
                    //this.router.navigateByUrl("/borrow/tracking/tracking-limit");
                }
            });
    }
    toggle() {
        this.isShow = !this.isShow;
    }
}
