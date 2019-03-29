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
import {
    UnClearItem,
    UnclearMaterialItem
} from "./../../common/borrow-entitys";
import { PopUnclearListComponent } from "./../../common/pop-unclear-list.component";
import { XcModalService, XcBaseModal, XcModalRef } from "app/shared/index";
import { BorrowTurnSales } from "./../../turn-sale";
import { TurnSaleService } from "./../../../services/turn-sale.service";
import { environment_java } from "environments/environment";
import { Person } from "app/shared/services/index";
declare var window;
@Component({
    templateUrl: "./turn-sale-apply.component.html",
    styleUrls: ["./turn-sale-apply.component.scss"],
    providers: [TurnSaleService]
})
export class TurnSaleApplyComponent implements OnInit {
    // unClearItem: UnClearItem = new UnClearItem();
    unclearMaterialItemList: UnclearMaterialItem[] = [];
    apply: BorrowTurnSales = new BorrowTurnSales();
    @ViewChildren(NgModel)
    inputList; //表单控件
    @ViewChildren("forminput")
    inputListDom; //表单控件DOM元素
    @ViewChild(NgForm)
    myApplyForm; //表单

    public modalAddForm: XcModalRef; //模态框
    pageFlag: string; //新建还是编辑
    applyItcode: string; //当前登录人
    // disabled: boolean = false;//是否不可用，默认可用
    salerFlag: boolean = false; //是否销售员角色
    notChange: boolean = false;
    userInfo = new Person(); //申请人
    isvisble: boolean = true;
    currAppFlag: boolean = false; //是否创建人
    constructor(
        private http: Http,
        private route: ActivatedRoute,
        private location: Location,
        private router: Router,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private turnSaleService: TurnSaleService
    ) {}
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageFlag = params["flag"];
        });

        //查询登录人角色
        this.http
            .get(environment_java.server + "common/getUserRoles", null)
            .toPromise()
            .then(res => {
                let roleCodes = res.json().item;
                if (
                    roleCodes.indexOf("0000000001") >= 0 ||
                    roleCodes.indexOf("0000000002") >= 0
                ) {
                    this.salerFlag = true;
                }
            });
        if (this.pageFlag === "n") {
            //新建
            this.route.params.subscribe(params => {
                this.apply.reservationNo = params["reservationNos"];
            });
            if (this.apply.reservationNo) {
                this.queryReservation();
            }
        }
        //console.log(this.pageFlag);
        if (this.pageFlag === "e") {
            //编辑页面，查询申请单信息
            let applyId: string; //申请单Id
            this.route.params.subscribe(params => {
                applyId = params["itemid"];
            });
            this.queryApplyDetail(applyId);
        }
        // this.modalAddForm = this.xcModalService.createModal(PopUnclearListComponent);
        // this.modalAddForm.onHide().subscribe((data) => {

        //     if (data.length > 0) {
        //         this.unclearMaterialItemList = [];
        //         for (let i = 0; i < data.length; i++) {
        //             let unClearItem: UnClearItem = data[i].unClearItem;
        //             this.unclearMaterialItemList = this.unclearMaterialItemList.concat(data[i].unclearMaterialItemList);
        //         }
        //         //处理未清项物料列表为转销售物料列表，区别在于转销售的count=未清项物料的usableCount,转销售的totalAmount字段重新计算
        //         this.unclearMaterialItemList.forEach(function (item) {
        //             item.count = item.usableCount;//
        //             item.totalAmount = item.count * item.price;
        //         })
        //         Object.assign(this.apply, data[0].unClearItem);
        //         this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
        //         this.userInfo.userID = this.userInfo.userEN;
        //         this.userInfo.userCN = this.apply.applyUserName;
        //         this.notChange = true;
        //         this.apply.voucherNo1 = '';
        //         this.apply.voucherNo2 = '';
        //         this.calculateMaterialAmount();
        //     }
        // });
    }
    queryReservation() {
        if (
            this.apply.reservationNo === undefined ||
            this.apply.reservationNo === ""
        ) {
            this.windowService.alert({
                message: "预留号不能为空",
                type: "success"
            });
            Object.keys(this.apply).forEach(key => (this.apply[key] = ""));
            this.unclearMaterialItemList = [];
        } else {
            this.turnSaleService
                .queryReservation(this.apply.reservationNo)
                .then(data => {
                    let poList: any = data.list;
                    //console.log(poList);
                    if (poList.length <= 0) {
                        this.windowService.alert({
                            message: "该预留号下没有未清项",
                            type: "success"
                        });
                        Object.keys(this.apply).forEach(
                            key => (this.apply[key] = "")
                        );
                        this.unclearMaterialItemList = [];
                    } else {
                        this.unclearMaterialItemList = [];
                        for (let i = 0; i < poList.length; i++) {
                            let unClearItem: UnClearItem =
                                poList[i].unClearItem;
                            this.unclearMaterialItemList = this.unclearMaterialItemList.concat(
                                poList[i].unclearMaterialItemList
                            );
                        }
                        //处理未清项物料列表为转销售物料列表，区别在于转销售的count=未清项物料的usableCount,转销售的totalAmount字段重新计算
                        this.unclearMaterialItemList.forEach(function(item) {
                            item.count = item.usableCount; //
                            item.totalAmount = item.count * item.price;
                        });
                        Object.assign(this.apply, poList[0].unClearItem);
                        this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
                        this.userInfo.userID = this.userInfo.userEN;
                        this.userInfo.userCN = this.apply.applyUserName;
                        this.notChange = true;
                        this.apply.voucherNo1 = "";
                        this.apply.voucherNo2 = "";
                        this.calculateMaterialAmount();
                    }
                });
        }
    }
    // popupReservation() {
    //     this.modalAddForm.show(this.applyItcode);
    // }
    //删除物料信息
    delMaterial(id: string) {
        this.unclearMaterialItemList = this.unclearMaterialItemList.filter(
            item => item.unclearMaterialId !== id
        );
        this.calculateMaterialAmount();
    }
    //变更物料数量
    changeCount(item: UnclearMaterialItem) {
        item.totalAmount = item.count * item.price;
        this.calculateMaterialAmount();
    }
    //计算物料总金额
    calculateMaterialAmount() {
        let total = 0;
        this.unclearMaterialItemList.map(item => {
            total = +total + item.count * item.price;
        });
        this.apply.totalAmount = "" + total;
    }
    //暂存
    saveDraft() {
        if (
            this.apply.reservationNo == undefined ||
            this.apply.reservationNo == ""
        ) {
            this.windowService.alert({
                message: "预留号不能为空",
                type: "fail"
            });
            return;
        }
        if (
            this.apply.applyItCode == undefined ||
            this.apply.applyItCode == ""
        ) {
            this.windowService.alert({
                message: "申请人不能为空",
                type: "fail"
            });
            return;
        }
        this.isvisble = false;
        this.turnSaleService
            .saveDraft(this.apply, this.unclearMaterialItemList)
            .then(res => {
                if (res.success) {
                    if (window.opener.document.getElementById("searchBtn")) {
                        window.opener.document
                            .getElementById("searchBtn")
                            .click();
                    }
                    // this.windowService
                    //     .confirm({ message: "操作成功,是否关闭页面？" })
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
                    this.isvisble = true;
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                    //this.router.navigateByUrl("/borrow/turnsalelist");
                }
            });
    }
    authenticateForm() {
        let flag = false;
        if (!this.myApplyForm.valid) {
            //表单验证未通过
            for (let i = 0; i < this.inputList.length && !flag; i++) {
                //遍历表单控件
                if (this.inputList._results[i].invalid) {
                    //验证未通过
                    let ele = this.inputListDom._results[i]; //存储该表单控件元素
                    if (ele && ele.nativeElement) {
                        ele.nativeElement.focus(); //使该表单控件获取焦点
                    }
                    flag = true;
                }
            }
        } else {
            let reg = /^[0-9]{1,10}$/;
            let valid = reg.test(this.apply.deliveryNo);
            // console.log(valid);
            if (!valid) {
                flag = true;
                this.windowService.alert({
                    message: "交货单号只能输入数字",
                    type: "fail"
                });
            } else {
                this.unclearMaterialItemList.forEach(item => {
                    if (item.count.toString().trim() === "") {
                        this.windowService.alert({
                            message: "数量不能为空",
                            type: "fail"
                        });
                        flag = true;
                        return;
                    } else {
                        let reg = /^[1-9]\d*$/;
                        if (!reg.test(item.count.toString())) {
                            this.windowService.alert({
                                message: "数量必须为整数",
                                type: "fail"
                            });
                            flag = true;
                            return;
                        }
                    }
                });
            }
        }
        return flag;
    }
    //新建提交或者草稿提交
    submitApply() {
        if (this.authenticateForm()) {
            return;
        }
        this.isvisble = false;
        this.turnSaleService
            .submitForm(this.apply, this.unclearMaterialItemList)
            .then(res => {
                if (res.success) {
                    if (window.opener.document.getElementById("searchBtn")) {
                        window.opener.document
                            .getElementById("searchBtn")
                            .click();
                    }
                    // this.windowService.confirm({ message: "操作成功,是否关闭页面？" }).subscribe({
                    //     next: (v) => {
                    //         if (v) {
                    //             window.close();
                    //         }
                    //     }
                    // });
                    this.windowService.alert({
                        message: "提交成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                } else if (res.status === 2001) {
                    this.isvisble = true;
                    //验证失败
                    let errorMessage = "";
                    res.list.forEach(item => {
                        errorMessage += item.message + ";";
                    });
                    errorMessage = errorMessage.substring(
                        0,
                        errorMessage.length - 1
                    );
                    this.windowService.alert({
                        message: errorMessage,
                        type: "fail"
                    });
                } else if (res.status === 500) {
                    this.isvisble = true;
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                    //this.router.navigateByUrl("/borrow/turnsalelist");
                }
            });
    }
    //查询申请单详细
    queryApplyDetail(applyId: string) {
        this.turnSaleService.queryApplyDetail(applyId).then(data => {
            if (data.success) {
                //console.log(JSON.stringify(data));
                let res = data.item;
                Object.assign(this.apply, res.applyData.borrowTurnSales);
                Object.assign(
                    this.unclearMaterialItemList,
                    res.applyData.turnSalesMaterialItemList
                );
                this.userInfo.userEN = this.apply.applyItCode.toLocaleLowerCase();
                this.userInfo.userID = this.userInfo.userEN;
                this.userInfo.userCN = this.apply.applyUserName;
                this.notChange = true;

                this.currAppFlag = res.currAppFlag;
            } else {
                this.windowService.alert({
                    message: data.message,
                    type: "fail"
                });
            }
        });
    }
    //取消
    goBack() {
        window.close();
    }
    //草稿提交
    // submitDraft() {
    //     if (this.authenticateForm()) {
    //         return;
    //     }
    //     this.turnSaleService.submitDraft(this.apply, this.unclearMaterialItemList).then(data => {
    //         if (data.success) {
    //             this.disabled = true;
    //             window.opener.document.getElementById("searchBtn").click();
    //             this.windowService.confirm({ message: "操作成功,是否关闭页面？" }).subscribe({
    //                 next: (v) => {
    //                     if (v) {
    //                         window.close();
    //                     }
    //                 }
    //             });
    //             //this.router.navigateByUrl("/borrow/turnsalelist");
    //         } else {
    //             this.windowService.alert({ message: data.message, type: "fail" });
    //             //this.router.navigateByUrl("/borrow/turnsalelist");
    //         }
    //     })

    // }
}
