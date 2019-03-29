
import {map} from 'rxjs/operators/map';
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import {
    Query,
    BorrowApply,
    BorrowListService,
    Materiel,
    Transport,
    BorrowApplytransportPoL,
    BorrowApplyFormData,
    BorrowAttachment
} from "./../../../../services/borrow-list.service";
import {
    SelectOption,
    ApplyUser,
    PersonnelInfo,
    DeliveryAddress
} from "../../../common/borrow-entitys";

import { BorrowUnclearListComponent } from "../../../common/borrow-unclear-list.component";
import {
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import { WindowService } from "app/core";
import { DbWfviewComponent } from "app/shared/index";
import { LimitApplyService } from "./../../../../services/limit-apply.service";
import { Person } from "app/shared/services/index";
import { environment_java, dbomsPath } from "environments/environment";
declare var window;
@Component({
    templateUrl: "./borrow-risk-control.component.html",
    styleUrls: ["./borrow-risk-control.component.scss"],
    providers: [LimitApplyService]
})
export class BorrowApproveRiskControlComponent implements OnInit {
    public applyId: string = "";
    borrowApplyFormData: BorrowApplyFormData = new BorrowApplyFormData();
    borrowAttachmentList: BorrowAttachment[] = [];
    pageType: string;
    remark: string;
    applyPage: string;
    exceedType: number;
    myCurrentAmount: number = 0;
    myExceedAmount: number = 0;
    isView: boolean = true; //是否只读页面
    // exceedinfoobj:ExceedInfo;
    @ViewChild("wfview")
    wfView: DbWfviewComponent; //展示流程图
    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };
    isWritedToERP: number = 1;
    isClick = false; //是否提交
    saleRole: boolean = true;
    public createUserInfo: Person = new Person(); //申请人
    public hideTransportInfo: boolean = false;
    //为了显示地址详细信息，添加两个字段by weiyg
    //增加查看地址详细信息功能
    public addressId: string;
    public showLocation: boolean = false;
    public isvisible: boolean = true;
    constructor(
        private http: Http,
        private route: ActivatedRoute,
        private location: Location,
        private borrowListService: BorrowListService,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private limitApplyService: LimitApplyService
    ) {}
    name = "借用申请";
    ngOnInit() {
        this.borrowListService.getUserRole().then(data => {
            let roleCodes = data.item;
            if (roleCodes.indexOf("0000000001") >= 0) {
                this.saleRole = false;
            }
        });
        this.route.params.subscribe(params => {
            this.applyId = params["applyId"];
            this.applyPage = params["applypage"];
        });
        this.borrowListService.queryBorrowApplyById(this.applyId).then(data => {
            console.log("data", data);
            this.borrowApplyFormData = data.item as BorrowApplyFormData;
            for (let item of this.borrowApplyFormData.transportPoList) {
                item.transport.borrowAmount = +item.transport.borrowAmount.toFixed(
                    2
                );
            }
            this.isView = !data.currAppFlag;

            this.borrowApplyDateToString();

            this.borrowListService
                .queryUserInfoById(this.borrowApplyFormData.borrowApply.creator)
                .then(data => {
                    //console.error("createUserInfo ==="+JSON.stringify(data));
                    this.createUserInfo.userEN = data.item.itcode.toLocaleUpperCase();
                    this.createUserInfo.userID = data.item.itcode.toLocaleLowerCase();
                    this.createUserInfo.userCN = data.item.name;
                });

            this.borrowAttachmentList = this.borrowApplyFormData.borrowApply.attachmentList;
            //console.error("ddddsssssss==========="+JSON.stringify(this.borrowApplyFormData.borrowApply.attachmentList));
            if (this.borrowApplyFormData.borrowApply.instId) {
                this.limitApplyService
                    .queryLogHistoryAndProgress(
                        this.borrowApplyFormData.borrowApply.instId
                    )
                    .then(data => {
                        this.wfData = data;
                        this.wfView.onInitData(this.wfData.wfprogress);
                    });
            }

            this.getExceedAmount(this.applyId);
            console.log(this.borrowApplyFormData.borrowApply.flowCurrNodeName);
            if (
                this.borrowApplyFormData.borrowApply.flowCurrNodeName ==
                    "器材岗审批" &&
                this.borrowApplyFormData.transportPoList[0].transport
                    .reservationNo != null
            ) {
                this.isWritedToERP = 2;
            }
            if (
                this.borrowApplyFormData.borrowApply.deliveryType ==
                    "CUSTSELF" ||
                this.borrowApplyFormData.borrowApply.deliveryType == "SALEMAN"
            ) {
                this.hideTransportInfo = true;
                return;
            } else {
                this.hideTransportInfo = false;
            }
        });
    }
    borrowApplyDateToString() {
        this.borrowApplyFormData.borrowApply.borrowDate = this.dateToString(
            this.borrowApplyFormData.borrowApply.borrowDate
        );
        this.borrowApplyFormData.borrowApply.lastModifiedDate = this.dateToString(
            this.borrowApplyFormData.borrowApply.lastModifiedDate
        );
        this.borrowApplyFormData.borrowApply.createDate = this.dateToString(
            this.borrowApplyFormData.borrowApply.createDate
        );
        this.borrowApplyFormData.borrowApply.giveBackDay = this.dateToString(
            this.borrowApplyFormData.borrowApply.giveBackDay
        );
        this.borrowApplyFormData.borrowApply.applyDate = this.dateToString(
            this.borrowApplyFormData.borrowApply.applyDate
        );
        for (let i of this.borrowApplyFormData.transportPoList) {
            i.transport.arrivalDate = this.dateToString(
                i.transport.arrivalDate
            );
            i.transport.createDate = this.dateToString(i.transport.createDate);
            i.transport.lastModifiedDate = this.dateToString(
                i.transport.lastModifiedDate
            );
            for (let j of i.materielList) {
                j.createDate = this.dateToString(j.createDate);
                j.lastModifiedDate = this.dateToString(j.lastModifiedDate);
            }
        }
    }
    dateToString(obj: any): any {
        if (obj != null && obj != "null" && (obj + "").length == 13) {
            obj = this.getDate1(obj);
        }
        return obj;
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
    agree() {
        if (
            this.borrowApplyFormData.borrowApply.flowCurrNodeName ===
                "器材岗审批" &&
            this.borrowApplyFormData.borrowApply.noApplySubmit != 1 &&
            !this.hideTransportInfo
        ) {
            this.windowService.alert({
                message: "运输单不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            this.borrowApplyFormData.borrowApply.flowCurrNodeName ==
            "器材岗审批"
        ) {
            if (this.isWritedToERP == 1) {
                this.windowService.alert({
                    message: "请先将物料信息写入ERP",
                    type: "fail"
                });
                return false;
            }
            this.doAgree();
        } else {
            this.doAgree();
        }
    }
    doAgree() {
        let reservationNo: string = ""; //防止客户手工改预留号，需要再次存预留号 add by weiyg 20171218
        if (
            this.borrowApplyFormData.borrowApply.flowCurrNodeName ==
            "器材岗审批"
        ) {
            for (let transport of this.borrowApplyFormData.transportPoList) {
                if (
                    typeof transport.transport.reservationNo == "undefined" ||
                    transport.transport.reservationNo == "" ||
                    transport.transport.reservationNo == null
                ) {
                    this.windowService.alert({
                        message: "预留号不能为空,请填写预留号",
                        type: "fail"
                    });
                    //this.appCloseConfirm();
                    return false;
                }
            }
            reservationNo = this.borrowApplyFormData.transportPoList[0]
                .transport.reservationNo;
        }
        this.isvisible = false;
        this.limitApplyService
            .agree(this.applyId, this.remark, reservationNo)
            .then(data => {
                if (data.success) {
                    // this.appCloseConfirm();
                    // this.appCloseConfirm();
                    this.windowService.alert({
                        message: "审批成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                } else {
                    this.isvisible = true;
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
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
        this.isvisible = false;
        this.limitApplyService
            .reject(this.applyId, this.remark, null)
            .then(data => {
                if (data.success) {
                    this.appCloseConfirm();
                } else {
                    this.isvisible = true;
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                }
            });
    }
    appCloseConfirm() {
        // this.windowService
        //     .confirm({ message: "操作成功,是否关闭页面？" })
        //     .subscribe({
        //         next: v => {
        //             if (v) {
        //                 if (
        //                     window.opener.document.getElementById("searchBtn")
        //                 ) {
        //                     window.opener.document
        //                         .getElementById("searchBtn")
        //                         .click();
        //                 }
        //                 window.close();
        //             }
        //         }
        //     });
        this.windowService.alert({ message: "审批成功", type: "success" });
        if (window.opener.document.getElementById("searchBtn")) {
            window.opener.document.getElementById("searchBtn").click();
        }
        setTimeout(function() {
            window.close();
        }, 1000);
    }
    goback() {
        // window.opener.document.location.href=dbomsPath+"borrow/list";
        window.close();
    }
    getExceedAmount(applyId: string) {
        this.http
            .get(
                environment_java.server +
                    "borrow/borrow-apply/" +
                    applyId +
                    "/exceed-amount"
            )
            .toPromise()
            .then(response => response.json())
            .then(data => {
                // this.exceedinfoobj=data.item;
                //console.log("exceedAmount===="+data.item.exceedAmount);
                if (typeof data.item == "undefined") {
                    this.exceedType = 0;
                } else {
                    if (data.item.exceedAmount <= 1) {
                        this.exceedType = 0;
                    } else if (
                        data.item.exceedAmount > 1 &&
                        data.item.exceedAmount <= 1.2
                    ) {
                        this.exceedType = 1;
                        this.myCurrentAmount = data.item.currentAmount;
                        this.myExceedAmount = data.item.exceedAmount;
                    } else if (data.item.exceedAmount > 1.2) {
                        this.exceedType = 2;
                        this.myCurrentAmount = data.item.currentAmount;
                        this.myExceedAmount = data.item.exceedAmount;
                    }
                }
                //  this.exceedType=2;
                //  this.myCurrentAmount=9999999;
                //  this.myExceedAmount=1.3;
            });
    }
    postBorrowApplySubmit(borrowApplyFormData: BorrowApplyFormData) {
        //console.info(borrowApplyFormData);
        return this.http
            .put(
                environment_java.server +
                    "borrow/borrow-apply/submit/" +
                    borrowApplyFormData.borrowApply.applyId,
                borrowApplyFormData
            ).pipe(
            map(res => res.json()))
            .subscribe(res => {
                if (res.success) {
                    this.doAgree();
                } else {
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
    }
    borrowStoreHouseChange(e: any, attr: string) {
        let i: number = 0;
        for (let transportInfo of this.borrowApplyFormData.transportPoList) {
            if (i > 0) {
                transportInfo.transport[attr + ""] = e.target.value;
            }
            i++;
        }
    }
    materielOnWayStoreChange(e: any) {
        let i: number = 0;
        let j: number = 0;
        for (let transportInfo of this.borrowApplyFormData.transportPoList) {
            for (let materiel of transportInfo.materielList) {
                if (!(i == 0 && j == 0)) {
                    materiel.onwayStore = e.target.value;
                }
                j++;
            }
            i++;
        }
    }
    writeERP() {
        ///borrow/borrow-apply/write-to-erp/{applyId}
        if (this.validateFormData()) {
            this.isClick = true;
            return this.http
                .put(
                    environment_java.server +
                        "borrow/borrow-apply/write-to-erp/" +
                        this.borrowApplyFormData.borrowApply.applyId,
                    this.borrowApplyFormData
                ).pipe(
                map(res => res.json()))
                .subscribe(res => {
                    if (res.success) {
                        this.isWritedToERP = 2;
                        this.borrowApplyFormData.transportPoList.forEach(
                            item => (item.transport.reservationNo = res.message)
                        );
                        this.windowService.alert({
                            message: "写入ERP成功",
                            type: "success"
                        });
                        this.isWritedToERP = 2;
                    } else {
                        this.isClick = false;
                        this.windowService.alert({
                            message: res.message,
                            type: "fail"
                        });
                    }
                });
        }
    }
    public validateFormData() {
        //console.error(this.borrowApplyFormData.transportPoList+"jjdjdjdjd");
        for (let transport of this.borrowApplyFormData.transportPoList) {
            //  console.error(transport);
            if (
                typeof transport.transport.borrowStoreHouse == "undefined" ||
                transport.transport.borrowStoreHouse == "" ||
                transport.transport.borrowStoreHouse == null
            ) {
                //   console.error(transport.transport.borrowStoreHouse+"jjdjdjdjd");
                this.windowService.alert({
                    message: "借用库不能为空",
                    type: "fail"
                });
                return false;
            }
            if (!transport.transport.voucherNo1) {
                this.windowService.alert({
                    message: "凭证号(1)不能为空",
                    type: "fail"
                });
                return false;
            }
            if (!transport.transport.voucherNo2) {
                this.windowService.alert({
                    message: "凭证号(2)不能为空",
                    type: "fail"
                });
                return false;
            }
            for (let materiel of transport.materielList) {
                if (
                    typeof materiel.onwayStore == "undefined" ||
                    materiel.onwayStore == "" ||
                    materiel.onwayStore == null
                ) {
                    this.windowService.alert({
                        message: "借用在途库不能为空",
                        type: "fail"
                    });
                    return false;
                }
            }
        }
        return true;
    }

    loadFile(filepath: string) {
        window.open(this.borrowListService.filesDownload(filepath));
    }

    public viewTimeMap(aid: string) {
        console.log(aid);
        this.addressId = aid;
        this.showLocation = true;
    }
    public missData(e) {
        this.showLocation = e;
    }
    noapplySubmit() {
        //console.log(environment_java.server + "borrow-apply/submitNoApply/" + this.applyId);
        this.http
            .post(
                environment_java.server +
                    "borrow/borrow-apply/submitNoApply/" +
                    this.applyId,
                null
            )
            .toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    let list: Transport[] = data.item;
                    for (let transport of list) {
                        let poList: BorrowApplytransportPoL[] = this.borrowApplyFormData.transportPoList.filter(
                            item => item.transport.id === transport.id
                        );
                        poList[0].transport.transportNo = transport.transportNo;
                        poList[0].transport.transportUrl =
                            transport.transportUrl;
                    }
                    this.borrowApplyFormData.borrowApply.noApplySubmit = 1;
                } else {
                    let list: Transport[] = data.item;
                    for (let transport of list) {
                        let poList: BorrowApplytransportPoL[] = this.borrowApplyFormData.transportPoList.filter(
                            item => item.transport.id === transport.id
                        );
                        poList[0].transport.transportNo = transport.transportNo;
                        poList[0].transport.transportUrl =
                            transport.transportUrl;
                    }
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                }
            });
    }
}
