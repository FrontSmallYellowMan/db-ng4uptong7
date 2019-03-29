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
import { environment_java } from "environments/environment";
import {
    TransferService,
    BorrowTransferApply,
    TransferMaterialBase,
    TransferMaterialItem,
    AdditionalProp,
    BorrowTransferPo,
    PersionInfo
} from "./../../../services/transfer.service";
import { Person } from "app/shared/services/index";
declare var window;
@Component({
    templateUrl: "./tran-sfer-apply.component.html",
    styleUrls: ["./tran-sfer-apply.component.scss"],
    providers: [TransferService]
})
export class TranSferApplyComponent implements OnInit {
    unClearItem: UnClearItem = new UnClearItem();
    unclearMaterialItemList: UnclearMaterialItem[] = [];
    apply: BorrowTransferPo = new BorrowTransferPo();
    itemKeys: string[] = [];
    waitForApprovalNum: number = 0;
    baseUserIsShow: boolean = false;
    public persion = []; //接收人员信息
    public appPerson = []; //申请人员信息
    public modalAddForm: XcModalRef; //模态框
    pageFlag: string; //新建还是编辑
    userInfo = new Person(); //申请人
    public person: Person = new Person(); //用户信息

    applyItcode: string; //当前登录人
    salerFlag: boolean = false; //是否销售员角色
    reservationNos: string = "";
    isvisble: boolean = true;
    constructor(
        private http: Http,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private transferService: TransferService
    ) {}
    currAppFlag: boolean = false; //是否可提交
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.pageFlag = params["flag"];
        });
        if (this.pageFlag === "e") {
            //编辑页面，查询申请单信息
            let applyId: string; //申请单Id
            this.route.params.subscribe(params => {
                applyId = params["itemid"];
            });
            this.queryApplyDetail(applyId);
        }
        if (this.pageFlag === "n") {
            //编辑页面，查询申请单信息
            //申请单Id
            this.currAppFlag = true;
            this.route.params.subscribe(params => {
                this.reservationNos = params["reservationNos"];
            });
        }
        //获取登录人信息
        this.http
            .get(environment_java.server + "common/getcontext", null)
            .toPromise()
            .then(res => {
                let data = res.json();
                if (this.pageFlag === "n") {
                    this.applyItcode = data.item.itcode;
                    this.apply.brwTrsfApply.oPersonName = data.item.name;
                    this.apply.brwTrsfApply.oPersonItCode = data.item.itcode;

                    this.userInfo.userEN = data.item.itcode;
                    this.userInfo.userID = data.item.itcode.toLocaleLowerCase();
                    this.userInfo.userCN = data.item.name;

                    this.appPerson.push(this.userInfo);
                }
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
            });

        this.modalAddForm = this.xcModalService.createModal(
            PopUnclearListComponent,
            this.itemKeys
        );
        this.modalAddForm.onHide().subscribe(data => {
            if (data.length > 0) {
                this.initTransferinfo(this.apply, data);
            }
        });
    }

    popupReservation() {
        if (
            typeof this.apply.brwTrsfApply.oPersonItCode == "undefined" ||
            this.apply.brwTrsfApply.oPersonItCode == null
        ) {
            this.windowService.alert({
                message: "请先选择申请人",
                type: "fail"
            });
        } else {
            this.modalAddForm.show({
                userItCode: this.apply.brwTrsfApply.oPersonItCode,
                reservationNos: this.reservationNos
            });
        }
    }
    //删除物料信息
    delMaterial(id: string) {
        this.unclearMaterialItemList = this.unclearMaterialItemList.filter(
            item => item.unclearMaterialId !== id
        );
        this.calculateMaterialAmount();
    }
    //计算物料总金额
    calculateMaterialAmount() {
        let total = 0;
        this.unclearMaterialItemList.map(item => {
            total = +total + item.count * item.price;
        });
        //this.apply.totalAmount = "" + total;
    }
    //暂存
    saveTransfer() {
        // if (!this.apply.brwTrsfApply.nPersonName) {
        //     this.apply.brwTrsfApply.nPersonName = this.person.userCN;
        //     this.apply.brwTrsfApply.nPersonItCode = this.person.userEN;
        // }
        if (!this.apply.brwTrsfApply.oPersonItCode) {
            this.windowService.alert({
                message: "申请人为必选项",
                type: "fail"
            });
            return false;
        }
        if (Reflect.ownKeys(this.apply.trsfMtrMap).length == 0) {
            this.windowService.alert({ message: "请选择未清项", type: "fail" });
            return false;
        }
        this.applyDateToString();
        this.isvisble = false;
        this.transferService.saveTransfer(this.apply).then(res => {
            if (res.success) {
                //this.windowService.alert({ message: '保存成功', type: "success" });
                //this.router.navigate(["/borrow/transferlist"]);
                try {
                    window.opener.document.getElementById("searchBtn").click();
                } catch (error) {}
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
            } else if (res.status === "2001") {
                //验证失败
                this.isvisble = true;
                let errorMessage = "";
                res.list.forEach(item => {
                    errorMessage += JSON.parse(item).message + ";";
                });
                this.windowService.alert({
                    message: errorMessage,
                    type: "fail"
                });
            } else if (res.status === "500") {
                this.isvisble = true;
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
            }
        });
    }
    //新建提交
    submitApply() {
        // if (!this.apply.brwTrsfApply.nPersonName) {
        //     this.apply.brwTrsfApply.nPersonName = this.person.userCN;
        //     this.apply.brwTrsfApply.nPersonItCode = this.person.userEN;
        // }
        if (!this.apply.brwTrsfApply.oPersonItCode) {
            this.windowService.alert({
                message: "申请人为必选项",
                type: "fail"
            });
            return false;
        }
        if (Reflect.ownKeys(this.apply.trsfMtrMap).length == 0) {
            this.windowService.alert({ message: "请选择未清项", type: "fail" });
            return false;
        }
        if (!this.apply.brwTrsfApply.nPersonItCode) {
            this.windowService.alert({ message: "请选择接收人", type: "fail" });
            return false;
        }

        this.applyDateToString();
        this.isvisble = false;
        this.transferService
            .checkTranSfer(
                this.apply.brwTrsfApply.oPersonItCode,
                this.apply.brwTrsfApply.nPersonItCode
            )
            .then(res => {
                //console.error("res==ffffffffffff=" + JSON.stringify(res));
                if (res) {
                    this.transferService.submitForm(this.apply).then(res => {
                        // console.error("res===" + JSON.stringify(res));
                        if (res.success) {
                            if (
                                window.opener.document.getElementById(
                                    "searchBtn"
                                )
                            ) {
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
                            //this.router.navigate(["/borrow/transferlist"]);
                        } else if (res.status == "2001") {
                            //验证失败
                            this.isvisble = true;
                            let errorMessage = "";
                            res.list.forEach(item => {
                                errorMessage += JSON.parse(item).message + ";";
                            });
                            this.windowService.alert({
                                message: errorMessage,
                                type: "fail"
                            });
                        } else if (res.status == "500") {
                            this.isvisble = true;
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
                } else {
                    this.windowService.alert({
                        message: "申请人和接收人不在同一本部事业部不能做转移",
                        type: "fail"
                    });
                    this.isvisble = true;
                }
            });
    }
    //查询申请单详细
    queryApplyDetail(applyId: string) {
        this.transferService.queryApplyDetail(applyId).then(data => {
            if (data.success) {
                Object.assign(this.apply, data.item);
                this.currAppFlag = data.currAppFlag;
                for (let key of Reflect.ownKeys(this.apply.trsfMtrMap)) {
                    this.itemKeys.push(key.toString());
                }
                this.userInfo.userCN = this.apply.brwTrsfApply.oPersonName;
                this.userInfo.userEN = this.apply.brwTrsfApply.oPersonItCode;
                this.userInfo.userID = this.apply.brwTrsfApply.oPersonItCode.toLocaleLowerCase();
                this.appPerson.push(this.userInfo);
                this.person.userCN = this.apply.brwTrsfApply.nPersonName;
                this.person.userEN = this.apply.brwTrsfApply.nPersonItCode;
                if (!this.apply.brwTrsfApply.nPersonItCode) {
                    this.person.userID = this.apply.brwTrsfApply.nPersonItCode.toLocaleLowerCase();
                }
                this.persion.push(this.person);
                this.baseUserIsShow = true;
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
        //this.location.back();
        window.close();
    }
    //草稿提交
    //submitDraft() {
    // this.transferService.saveTransfer(this.apply, this.unclearMaterialItemList).then(data => {
    //     if (data.success) {
    //         this.windowService.alert({ message: data.message, type: "success" });
    //     } else {
    //         this.windowService.alert({ message: data.message, type: "fail" });
    //     }
    // })
    //}

    initTransferinfo(apply: BorrowTransferPo, data: any) {
        this.itemKeys = [];
        //this.apply = new BorrowTransferPo();
        this.apply.trsfMtrMap = new Object();
        this.unClearItem = data[0].unClearItem;
        this.apply.brwTrsfApply.platformName = this.unClearItem.platformName;
        this.apply.brwTrsfApply.platformCode = this.unClearItem.platformCode;
        this.apply.brwTrsfApply.subDeptName = this.unClearItem.subDeptName;
        this.apply.brwTrsfApply.oPersonName = this.unClearItem.applyUserName;
        this.apply.brwTrsfApply.oPersonItCode = this.unClearItem.applyItCode;
        this.apply.brwTrsfApply.applyUserNo = this.unClearItem.applyUserNo;
        this.apply.brwTrsfApply.baseDeptName = this.unClearItem.baseDeptName;
        this.apply.brwTrsfApply.contactPhone = this.unClearItem.contactPhone;
        // this.apply.brwTrsfApply.applyDate=this.unClearItem.borrowDate;
        let i = 0;
        //console.error("ppppppppppppppppppppppppppppppppp");
        // console.error(data);
        for (let itemInfo of data) {
            let unClearItem1: UnClearItem = data[i].unClearItem;
            this.unclearMaterialItemList = itemInfo.unclearMaterialItemList;
            let additionalProp: AdditionalProp = new AdditionalProp();
            // //如果已经存在预留号
            if (this.apply.trsfMtrMap[unClearItem1.reservationNo + ""]) {
                additionalProp = this.apply.trsfMtrMap[
                    unClearItem1.reservationNo + ""
                ];
            } else {
                //如果已经不存在预留号
                additionalProp.mItemInfo.borrowCustomerName =
                    unClearItem1.borrowCustomerName;
                additionalProp.mItemInfo.borrowDate = unClearItem1.borrowDate;
                additionalProp.mItemInfo.giveBackDay = unClearItem1.giveBackDay;
                //additionalProp.mItemInfo.applyId=this.unClearItem.;
                additionalProp.mItemInfo.oreservationNo =
                    unClearItem1.reservationNo;
                additionalProp.mItemInfo.ovoucherNo1 = unClearItem1.voucherNo1;
                additionalProp.mItemInfo.ovoucherNo2 = unClearItem1.voucherNo2;
                additionalProp.mItemInfo.projectName = unClearItem1.projectName;
                additionalProp.mItemInfo.factory = unClearItem1.factory;
                additionalProp.mItemInfo.borrowTypeCode =
                    unClearItem1.borrowTypeCode;
                additionalProp.mItemInfo.borrowTypeName =
                    unClearItem1.borrowTypeName;
                //additionalProp.mItemInfo.contcenterCode=unClearItem1.
                additionalProp.mItemInfo.deliveryAddress =
                    unClearItem1.deliveryAddress;
                additionalProp.mItemInfo.borrowStoreHouse =
                    unClearItem1.borrowStoreHouse;
            }
            //console.error(itemInfo.unclearMaterialItemList.unClearItem.reservationNo);
            //additionalProp.mItemInfo.trnMtrBaseId=this.unClearItem.
            //UnclearMaterialItem
            for (let item of this.unclearMaterialItemList) {
                var materialItem: TransferMaterialItem = new TransferMaterialItem();
                materialItem.batch = item.batch;
                materialItem.count = item.usableCount;
                materialItem.factory = item.factory;
                materialItem.meterialMemo = item.meterialMemo;
                materialItem.meterialNo = item.meterialNo;
                materialItem.onwayStore = item.onwayStore;
                materialItem.price = item.price;
                materialItem.totalAmount = item.usableCount * item.price;
                materialItem.unit = item.unit;
                additionalProp.mItemDetail.push(materialItem);
            }
            //console.error(additionalProp.mItemInfo.oreservationNo);
            this.apply.trsfMtrMap[
                additionalProp.mItemInfo.oreservationNo
            ] = additionalProp;
            // this.itemKeys.push(additionalProp.mItemInfo.oreservationNo);
            if (
                this.itemKeys.indexOf(
                    additionalProp.mItemInfo.oreservationNo + ""
                ) < 0
            ) {
                this.itemKeys.push(
                    additionalProp.mItemInfo.oreservationNo + ""
                );
            }
            i++;
        }
        // console.error("ddddddddddddddddddddddddddddddddddddddddddddddddddd");
        // console.error(this.apply);
        //apply.brwTrsfApply.org=this.unClearItem.
    }
    changePerson(info) {
        if (info && info.length > 0) {
            this.apply.brwTrsfApply.nPersonName = info[0]["name"];
            this.apply.brwTrsfApply.nPersonItCode = info[0]["itcode"];
        } else {
            this.apply.brwTrsfApply.nPersonName = undefined;
            this.apply.brwTrsfApply.nPersonItCode = undefined;
        }
        // console.log("choose=" + this.apply.brwTrsfApply.nPersonItCode);
    }

    changeAppPerson(info) {
        if (info && info.length > 0) {
            this.apply.brwTrsfApply.oPersonName = info[0]["name"];
            this.apply.brwTrsfApply.oPersonItCode = info[0]["itcode"];
        } else {
            this.apply.brwTrsfApply.oPersonName = undefined;
            this.apply.brwTrsfApply.oPersonItCode = undefined;
        }
    }
    getDate(date, obj: any) {
        let dataObj = new Date(date);
        let year = dataObj.getFullYear();
        let month = (dataObj.getMonth() + 1).toString();
        let day = dataObj.getDate().toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        if (Number(day) < 10) {
            day = "0" + day;
        }
        let temp = year + "-" + month + "-" + day;
        obj = temp;
    }

    getDate1(date) {
        let dataObj = new Date(date);
        let year = dataObj.getFullYear();
        let month = (dataObj.getMonth() + 1).toString();
        let day = dataObj.getDate().toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        if (Number(day) < 10) {
            day = "0" + day;
        }
        let temp = year + "-" + month + "-" + day;
        return temp;
    }
    dateToString(obj: any): any {
        if (obj != null && obj != "null" && (obj + "").length == 13) {
            obj = this.getDate1(obj);
        }
        return obj;
    }
    applyDateToString() {
        this.apply.brwTrsfApply.applyDate = this.dateToString(
            this.apply.brwTrsfApply.applyDate
        );
        this.apply.brwTrsfApply.createDate = this.dateToString(
            this.apply.brwTrsfApply.createDate
        );
        this.apply.brwTrsfApply.lastModifiedDate = this.dateToString(
            this.apply.brwTrsfApply.lastModifiedDate
        );
        for (let key of this.itemKeys) {
            let additionalProp: AdditionalProp = this.apply.trsfMtrMap[
                "" + key
            ];
            this.apply.trsfMtrMap[
                "" + key
            ].mItemInfo.borrowDate = this.dateToString(
                additionalProp.mItemInfo.borrowDate
            );
            this.apply.trsfMtrMap[
                "" + key
            ].mItemInfo.giveBackDay = this.dateToString(
                additionalProp.mItemInfo.giveBackDay
            );
        }
    }
}
