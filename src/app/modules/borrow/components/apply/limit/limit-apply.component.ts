import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { NgForm, NgModel } from "@angular/forms";
import { WindowService } from "app/core";
import { LimitListService } from "./../../../services/limit-list.service";
import {
    BorrowAmount,
    BorrowAmountBusinessScope,
    BorrowAmountPo
} from "./../../limit";
import { Person } from "app/shared/services/index";
declare var window;
@Component({
    templateUrl: "./limit-apply.component.html",
    providers: [LimitListService],
    styleUrls: ["./limit-apply.component.scss"]
})
// @View({

// })
export class LimitApplyComponent implements OnInit {
    public apply: BorrowAmount = new BorrowAmount();
    public deptRelations: BorrowAmountBusinessScope[] = [];
    public applyType: string; //新建还是编辑
    private bbmc: string; //本部名称
    private sybmc: string; //事业部名称
    private sybList: string[] = [];
    public isView: boolean = false;
    @ViewChildren(NgModel)
    inputList; //表单控件
    @ViewChildren("forminput")
    inputListDom; //表单控件DOM元素
    @ViewChild(NgForm)
    myApplyForm; //表单
    //disabled: boolean = false;//是否可用，默认可用
    userInfo = new Person(); //申请人
    notChange: boolean = false; //等到人员信息有了再带入头像
    isvisble: boolean = true;
    constructor(
        http: Http,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private limitListService: LimitListService,
        private windowService: WindowService
    ) {}
    ngOnInit() {
        //获取参数 'n' 新建 'e' 编辑
        this.route.params.subscribe(params => {
            this.applyType = params["flag"];
        });

        //新建额度申请
        if (this.applyType === "n") {
            this.limitListService.getApplyUserInfo().then(res => {
                this.apply.applyItCode = res.sysUsers.itcode;
                this.apply.applyUserName = res.sysUsers.userName;
                this.apply.applyUserNo = res.sysUsers.userNo;
                this.apply.applyUserTel = res.mobile;
                this.apply.platformCode = res.sysUsers.flatCode;
                this.apply.platformName = res.sysUsers.flatName;
                this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
                this.userInfo.userID = this.userInfo.userEN;
                this.userInfo.userCN = this.apply.applyUserName;
                this.notChange = true;
                this.bbmc = res.baseDepartment.bbmc;
                this.sybmc = res.baseDepartment.sybmc;
                //获取本部下面的事业部列表
                this.limitListService
                    .getSybList(res.baseDepartment.bbmc)
                    .then(data => {
                        this.sybList = data.list;
                    });
                //增加业务范围代码
                this.apply.businessScope = res.sysUsers.ywfwdm;
                //默认显示事业部
                this.apply.applyDimension = "1";
                this.apply.deptName = res.baseDepartment.sybmc;
                this.apply.baseDeptName = res.baseDepartment.bbmc;
                this.getOrgBusiScope();
            });
        } else {
            //查询草稿或者拒绝
            let itemid;
            this.route.params.subscribe(params => (itemid = params["itemid"]));
            this.limitListService.queryApplyDetail(itemid).then(res => {
                this.apply = res.applyData.mainData;
                this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
                this.userInfo.userID = this.userInfo.userEN;
                this.userInfo.userCN = this.apply.applyUserName;
                this.notChange = true;
                this.deptRelations = res.applyData.subData;
                this.isView = res.isCreator === "0";
            });
            //获取申请人所属事业部和本部信息(为了防止申请维度变化时带出事业部或本部)
            this.limitListService.getApplyUserInfo().then(res => {
                this.bbmc = res.baseDepartment.bbmc;
                this.sybmc = res.baseDepartment.sybmc;
                //获取本部下面的事业部列表
                this.limitListService
                    .getSybList(res.baseDepartment.bbmc)
                    .then(data => {
                        this.sybList = data.list;
                    });
            });
        }
    }

    /**
     * 变更申请维度
     */
    changeApplyDimension(applyDimension: string) {
        this.apply.applyDimension = applyDimension;
        //申请维度为事业部
        if (applyDimension === "1") {
            this.apply.deptName = this.sybmc;
            this.apply.baseDeptName = this.bbmc;
        } else if (applyDimension === "0") {
            this.apply.deptName = "";
            this.apply.baseDeptName = this.bbmc;
        }
        //查询业务范围
        this.getOrgBusiScope();
        //更新当前额度
        this.apply.currentAmount = 0;
    }
    /**
     * 计算常规额度
     */
    calculateCurrAmount() {
        if (this.deptRelations && this.deptRelations.length > 0) {
            let currentAmount = 0;
            for (let i = 0; i < this.deptRelations.length; i++) {
                let deptRelation = this.deptRelations[i];
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
    /**
     * 查询事业部或本部的业务范围
     */
    getOrgBusiScope() {
        let isbase: boolean = this.apply.applyDimension === "0"; //是否本部
        this.limitListService
            .getBusinessScopeByDeptName(
                this.apply.baseDeptName,
                this.apply.deptName,
                this.apply.applyDimension === "0"
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
                    }
                    this.deptRelations = subData;
                } else {
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
    }
    /**
     * 暂存
     */
    saveDraft() {
        //判断是否保存过同事业部或本部的
        if (this.authticateForm("0")) {
            return; //验证未通过
        }

        this.limitListService
            .checkHaveDeptAmount(this.apply.baseDeptName, this.apply.deptName)
            .then(data => {
                if (data.success) {
                    if (data.message === "1") {
                        this.windowService.alert({
                            message: "该部门已经申请过额度",
                            type: "success"
                        });
                    } else if (data.message === "0") {
                        //this.disabled = true;//置按钮为不能用
                        this.isvisble = false;
                        //新建草稿
                        if (this.applyType === "n") {
                            this.limitListService
                                .saveDraft(this.apply, this.deptRelations)
                                .then(res => {
                                    if (res.success) {
                                        //window.alert("操作成功");
                                        if (
                                            window.opener.document.getElementById(
                                                "searchBtn"
                                            )
                                        ) {
                                            window.opener.document
                                                .getElementById("searchBtn")
                                                .click();
                                        }
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
                                        // this.windowService.alert({ message: "操作成功", type: "success" });
                                        // this.router.navigateByUrl("/borrow/limit");
                                    } else {
                                        this.windowService.alert({
                                            message: res.message,
                                            type: "fail"
                                        });
                                        this.isvisble = true;
                                    }
                                });
                        } else {
                            //已存的草稿保存草稿
                            this.limitListService
                                .submitEditForm(
                                    this.apply.id,
                                    this.apply,
                                    this.deptRelations
                                )
                                .then(res => {
                                    if (res.success) {
                                        //this.windowService.alert({ message: "操作成功", type: "success" });
                                        //this.router.navigateByUrl("/borrow/limit");
                                        //window.alert("操作成功");
                                        // if (window.confirm("操作成功,确认要关闭窗口？")) {
                                        //     window.close();
                                        // }
                                        if (
                                            window.opener.document.getElementById(
                                                "searchBtn"
                                            )
                                        ) {
                                            window.opener.document
                                                .getElementById("searchBtn")
                                                .click();
                                        }
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
                                        this.windowService.alert({
                                            message: "保存成功",
                                            type: "success"
                                        });
                                        setTimeout(function() {
                                            window.close();
                                        }, 1500);
                                    } else {
                                        this.windowService.alert({
                                            message: res.message,
                                            type: "fail"
                                        });
                                        this.isvisble = true;
                                    }
                                });
                        }
                    }
                } else {
                    this.windowService.alert({
                        message: "运行出错",
                        type: "fail"
                    });
                }
            });
    }
    authticateForm(submitType: string) {
        let flag: boolean = false;
        this.deptRelations.forEach(item => {
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
    //取消
    goBack() {
        //this.location.back();
        window.close();
    }
    //新建提交
    submitApply() {
        if (this.authticateForm("1")) {
            return; //验证未通过
        }
        this.limitListService
            .checkHaveDeptAmount(this.apply.baseDeptName, this.apply.deptName)
            .then(data => {
                if (data.success) {
                    if (data.message === "1") {
                        this.windowService.alert({
                            message: "该部门已经申请过额度",
                            type: "success"
                        });
                    } else {
                        this.isvisble = false;
                        if (this.applyType === "n") {
                            //新建提交
                            this.limitListService
                                .submitApply(this.apply, this.deptRelations)
                                .then(data => {
                                    if (data.success) {
                                        //this.disabled = true;//置按钮为不能用
                                        if (
                                            window.opener.document.getElementById(
                                                "searchBtn"
                                            )
                                        ) {
                                            window.opener.document
                                                .getElementById("searchBtn")
                                                .click();
                                        }
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
                                        this.windowService.alert({
                                            message: "提交成功",
                                            type: "success"
                                        });
                                        setTimeout(function() {
                                            window.close();
                                        }, 1500);
                                    } else {
                                        this.windowService.alert({
                                            message: data.message,
                                            type: "fail"
                                        });
                                        this.isvisble = true;
                                    }
                                });
                        } else if (this.applyType === "e") {
                            //草稿提交

                            this.limitListService
                                .submitDraft(
                                    this.apply.id,
                                    this.apply,
                                    this.deptRelations
                                )
                                .then(data => {
                                    if (data.success) {
                                        //this.disabled = true;//置按钮为不能用
                                        if (
                                            window.opener.document.getElementById(
                                                "searchBtn"
                                            )
                                        ) {
                                            window.opener.document
                                                .getElementById("searchBtn")
                                                .click();
                                        }
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
                                        this.windowService.alert({
                                            message: "提交成功",
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
                    }
                } else {
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                }
            });
    }
    //草稿提交
    // submitDraft() {
    //     if (this.authticateForm("1")) {
    //         return;//验证未通过
    //     }
    //     this.limitListService.checkHaveDeptAmount(this.apply.baseDeptName, this.apply.deptName).then(data => {
    //         if (data.success) {
    //             if (data.message === "1") {
    //                 this.windowService.alert({ message: "该部门已经申请过额度", type: "success" });
    //             } else {
    //                 this.limitListService.submitDraft(this.apply.id, this.apply, this.deptRelations)
    //                     .then(data => {
    //                         if (data.success) {
    //                             this.disabled = true;//置按钮为不能用
    //                             this.windowService.alert({ message: "操作成功", type: "success" });
    //                             this.router.navigateByUrl("/borrow/limit");
    //                         } else {
    //                             this.windowService.alert({ message: data.message, type: "fail" });
    //                             this.router.navigateByUrl("/borrow/limit");
    //                         }
    //                     })
    //             }
    //         } else {
    //             this.windowService.alert({ message: data.message, type: "fail" });
    //         }
    //     })

    // }
    /**
     * 获取事业部下面所有的业务范围
     * @param event
     */
    getSybYWFW(event) {
        this.apply.deptName = event.target.value;
        this.apply.currentAmount = 0;
        this.getOrgBusiScope();
    }
}
