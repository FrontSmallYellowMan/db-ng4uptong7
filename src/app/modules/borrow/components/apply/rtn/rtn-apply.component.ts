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
import { Person } from "app/shared/services/index";

import {
    RtnTransport,
    RtnMaterielApp,
    BorrowReturnApply,
    QualityTestReport,
    RtnMateriel,
    RtnTransportPo,
    BorrowReturnApplyPo,
    QualityTestReportPo,
    BorrowReturnListService
} from "./../../../services/rtn-list.service";
import { SelectOption, DeliveryAddress } from "../../common/borrow-entitys";
declare var window;

@Component({
    templateUrl: "./rtn-apply.component.html",
    styleUrls: ["./rtn-apply.component.scss"],
    providers: [BorrowReturnListService]
})
export class RtnApplyComponent implements OnInit {
    rtnAppPo: BorrowReturnApplyPo = new BorrowReturnApplyPo();
    loading: boolean = true; //加载中效果
    saleRole: boolean = true; //非销售员角色
    transportTypesOpts: SelectOption[] = []; //运输方式选项
    // private rtnTransportPoList: RtnTransportPo[] = [];
    // private rtnTransport:RtnTransport=new RtnTransport();
    //private rtnMaterielappList: RtnMaterielApp[] = [];
    isSaved: string; //新建还是编辑
    rtnAddresses: Array<DeliveryAddress> = []; //取货地址
    public customerName: string = "";
    public addressId: string;
    //public unRtnMaterielAppList: RtnMaterielApp[] = [];
    isClick = false; //是否提交
    userInfo = new Person(); //申请人

    @ViewChildren(NgModel)
    inputList; //表单控件
    @ViewChildren("forminput")
    inputListDom; //表单控件DOM元素
    @ViewChild(NgForm)
    myApplyForm; //表单
    currAppFlag: boolean = false;
    constructor(
        http: Http,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private borrowReturnListService: BorrowReturnListService,
        private windowService: WindowService
    ) {}
    name = "新建借用实物归还申请";
    ngOnInit() {
        //判断是否是销售员角色
        this.borrowReturnListService.getUserRole().then(data => {
            let roleCodes = data.item;
            // console.log("roleCodes=" +roleCodes);
            if (roleCodes.indexOf("0000000001") >= 0) {
                this.saleRole = false;
            }
        });

        //  //初始取货地址列表
        //     this.borrowReturnListService.getBorrowRtnCustomer(this.customerName).then(data=>{

        //      this.rtnAddresses=[];
        //         for (let i of data.list) {
        //             i.deliveryAddressId=i.deliveryAddressId+"_"+i.deliveryAddress;
        //                 console.log("rtnAddrwwwwwwess=" + i.deliveryAddressId);
        //             this.rtnAddresses.push(i);
        //         }
        //     });
        //初始运输方式
        this.borrowReturnListService.getBorrowPageAttrOption(3).then(data => {
            this.transportTypesOpts = [];
            for (let i of data.list) {
                i.code = i.code + "_" + i.name;
                this.transportTypesOpts.push(i);
            }
        });
        this.route.params.subscribe(params => {
            this.isSaved = params["flag"];
        });
        //console.log(this.isSaved);
        if (this.isSaved === "n") {
            //新建
            this.route.params.subscribe(params => {
                this.rtnAppPo.borrowReturnApply.reservationNo =
                    params["reservationNos"];
            });
            if (this.rtnAppPo.borrowReturnApply.reservationNo) {
                this.queryUnClearItems();
            }
        } else {
            //查询
            //this.unRtnMaterielAppList.reverse();
            let applyId;
            this.route.params.subscribe(
                params => (applyId = params["applyId"])
            );
            // console.log("applyId=" + applyId);
            this.borrowReturnListService.queryApplyDetail(applyId).then(res => {
                //console.log(JSON.stringify(res.currAppFlag));
                this.rtnAppPo = res.item;
                this.currAppFlag = res.currAppFlag;
                this.userInfo.userEN = res.item.borrowReturnApply.applyItCode;
                this.userInfo.userID = res.item.borrowReturnApply.applyItCode.toLocaleLowerCase();
                this.userInfo.userCN = res.item.borrowReturnApply.applyUserName;
                this.borrowReturnListService
                    .getUnClearItemByReservationNo(
                        this.rtnAppPo.borrowReturnApply.reservationNo
                    )
                    .then(data => {
                        if (data.list.length > 0) {
                            //  //初始取货地址列表
                            this.borrowReturnListService
                                .getBorrowRtnCustomer(
                                    data.list[0].unClearItem.borrowCustomerName
                                )
                                .then(data => {
                                    this.rtnAddresses = [];
                                    for (let i of data.list) {
                                        this.rtnAddresses.push(i);
                                    }
                                });
                            // this.queryUnClearItems();
                        }

                        //console.log("unRtnMaterielAppList=" + JSON.stringify(this.unRtnMaterielAppList));
                    });
            });
        }
    }

    queryUnClearItems() {
        this.borrowReturnListService
            .getUnClearItemByReservationNo(
                this.rtnAppPo.borrowReturnApply.reservationNo
            )
            .then(data => {
                //console.log("res=" + JSON.stringify(data));
                if (data.list.length > 0) {
                    let res = data.list[0];
                    this.userInfo.userEN = res.unClearItem.applyItCode;
                    this.userInfo.userID = res.unClearItem.applyItCode.toLocaleLowerCase();
                    this.userInfo.userCN = res.unClearItem.applyUserName;
                    this.rtnAppPo.borrowReturnApply.applyUserTel =
                        res.unClearItem.contactPhone;
                    this.rtnAppPo.borrowReturnApply.applyUserNo =
                        res.unClearItem.applyUserNo;
                    this.rtnAppPo.borrowReturnApply.businessScopeCode =
                        res.unClearItem.businessScope;
                    this.rtnAppPo.borrowReturnApply.baseDeptName =
                        res.unClearItem.baseDeptName;
                    this.rtnAppPo.borrowReturnApply.subDeptName =
                        res.unClearItem.subDeptName;
                    this.rtnAppPo.borrowReturnApply.platformCode =
                        res.unClearItem.platformCode;
                    this.rtnAppPo.borrowReturnApply.platformName =
                        res.unClearItem.platformName;
                    this.rtnAppPo.borrowReturnApply.factory =
                        res.unClearItem.factory;
                    this.rtnAppPo.borrowReturnApply.oldVoucherNo1 =
                        res.unClearItem.voucherNo1;
                    this.rtnAppPo.borrowReturnApply.oldVoucherNo2 =
                        res.unClearItem.voucherNo2;
                    this.rtnAppPo.borrowReturnApply.applyUserName =
                        res.unClearItem.applyUserName;
                    this.rtnAppPo.borrowReturnApply.applyItCode =
                        res.unClearItem.applyItCode;
                    this.rtnAppPo.borrowReturnApply.applyUserNo =
                        res.unClearItem.applyUserNo;
                    this.rtnAppPo.borrowReturnApply.operatingBorrow =
                        res.unClearItem.operatingBorrow;
                    this.customerName = res.unClearItem.borrowCustomerName;
                    //this.customerName=res.unClearItem.borrowCustomerName;
                    //this.rtnAppPo.rtnTransportPoList[0].rtnTransport.rtnAddress=res.unClearItem.deliveryAddress;
                    //this.rtnAppPo.rtnTransportPoList[0].rtnTransport.rtnAddressId=res.unClearItem.deliveryAddressId;
                    let unclearMaterialItemLists = res.unclearMaterialItemList;
                    // console.log("unclearMaterialItemLists=" + JSON.stringify(unclearMaterialItemLists));

                    let subData = new Array<RtnTransportPo>(data.list.length);
                    if (this.rtnAppPo.borrowReturnApply.id) {
                    } else {
                        this.rtnAppPo.rtnTransportPoList = [];
                    }

                    //this.unRtnMaterielAppList = [];
                    for (let i = 0; i < data.list.length; i++) {
                        let unClearItemPo = data.list[i];
                        subData[i] = new RtnTransportPo();

                        subData[i].rtnTransport.rtnAddress =
                            unClearItemPo.unClearItem.deliveryAddress;
                        subData[i].rtnTransport.rtnAddressId =
                            unClearItemPo.unClearItem.deliveryAddressId;
                        let maters = new Array<RtnMaterielApp>(
                            unClearItemPo.unclearMaterialItemList.length
                        );
                        for (
                            let j = 0;
                            j < unClearItemPo.unclearMaterialItemList.length;
                            j++
                        ) {
                            let mater =
                                unClearItemPo.unclearMaterialItemList[j];
                            if (mater.usableCount != 0) {
                                maters[j] = new RtnMaterielApp();
                                maters[j].meterialNo = mater.meterialNo;
                                maters[j].meterialMemo = mater.meterialMemo;
                                maters[j].batch = mater.batch;
                                maters[j].unit = mater.unit;
                                maters[j].count = mater.usableCount;
                                //console.log("maters[j]=" + JSON.stringify(maters[j]));

                                maters[j].price = mater.price;
                                maters[j].totalAmount = +(
                                    mater.usableCount * mater.price
                                ).toFixed(2);
                                maters[j].onwayStore = mater.onwayStore;
                                maters[j].unclearMaterialId =
                                    mater.unclearMaterialId;
                                maters[j].unRtnCount = mater.usableCount;
                                subData[i].rtnMaterielAppList.push(maters[j]);
                                //this.unRtnMaterielAppList.push(maters[j]);
                            }
                        }
                        if (this.rtnAppPo.borrowReturnApply.id) {
                        } else {
                            this.rtnAppPo.rtnTransportPoList.push(subData[i]);
                        }

                        //this.rtnAppPo.rtnTransportPoList[i].rtnTransport.rtnAddress=unClearItemPo.unClearItem.deliveryAddress;
                    }
                    this.rtnAppPo.borrowReturnApply.returnTotalAmount = this.totalBorrowApplyRtnAmount();
                    //初始取货地址列表
                    this.borrowReturnListService
                        .getBorrowRtnCustomer(this.customerName)
                        .then(data => {
                            this.rtnAddresses = [];
                            for (let i of data.list) {
                                this.rtnAddresses.push(i);
                            }
                        });
                } else {
                    this.windowService.alert({
                        message: "该预留号未找相关信息",
                        type: "fail"
                    });
                }
            });
    }

    clickSaveBorrowRtnApply(e: any) {
        if (this.validateFormData()) {
            if (this.rtnAppPo.borrowReturnApply.pickupType == 1) {
                for (let i of this.rtnAppPo.rtnTransportPoList) {
                    if (
                        typeof i.rtnTransport.transportCode == "undefined" ||
                        i.rtnTransport.transportCode == ""
                    ) {
                        this.windowService.alert({
                            message: "请选择运输方式",
                            type: "fail"
                        });
                        return false;
                    }
                }
            }
            this.isClick = true;
            if (this.rtnAppPo.borrowReturnApply.applyId) {
                this.borrowReturnListService
                    .putBorrowRtnApply(this.rtnAppPo)
                    .then(res => {
                        if (res.success) {
                            // this.appCloseConfirm();
                            this.windowService.alert({
                                message: "提交成功",
                                type: "success"
                            });
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                            //this.windowService.alert({ message: "操作成功", type: "success" });
                            //this.router.navigate(["/borrow/rtnlist"]);
                            //this.location.back();
                        } else {
                            this.isClick = false;
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            } else {
                this.borrowReturnListService
                    .postBorrowRtnApply(this.rtnAppPo)
                    .then(res => {
                        if (res.success) {
                            this.appCloseConfirm();
                            //this.windowService.alert({ message: "操作成功", type: "success" });
                            //this.router.navigate(["/borrow/rtnlist"]);
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
    }
    delRtnMaterielApp(transport: RtnTransportPo, j, i) {
        transport.rtnMaterielAppList.splice(j, 1);
        if (transport.rtnMaterielAppList.length === 0) {
            this.rtnAppPo.rtnTransportPoList.splice(i, 1);
        }
        this.rtnAppPo.borrowReturnApply.returnTotalAmount = this.totalBorrowApplyRtnAmount();
    }
    materielNumberChange(item: RtnMaterielApp) {
        if (item.count < 1) {
            this.windowService.alert({
                message: "物料的归还数量必须大于0",
                type: "fail"
            });
        }
        if (item.count > item.unRtnCount) {
            this.windowService.alert({
                message: "数量不能大于未归还数量" + item.unRtnCount,
                type: "fail"
            });
            item.count = 1;
            item.totalAmount = +(item.price * item.count).toFixed(2);
            this.rtnAppPo.borrowReturnApply.returnTotalAmount = this.totalBorrowApplyRtnAmount();
        } else {
            item.totalAmount = item.price * item.count;
            item.totalAmount = +(item.price * item.count).toFixed(2);
            this.rtnAppPo.borrowReturnApply.returnTotalAmount = this.totalBorrowApplyRtnAmount();
        }
    }
    //计算归还总金额
    totalBorrowApplyRtnAmount(): number {
        try {
            let totalAmount = 0;
            for (let i of this.rtnAppPo.rtnTransportPoList) {
                for (let j of i.rtnMaterielAppList) {
                    totalAmount += j.totalAmount;
                }
            }
            totalAmount = +totalAmount.toFixed(2);
            return totalAmount;
        } catch (error) {
            console.error(error);
        }
    }

    //新建直接提交
    submitApply() {
        //提交表单

        if (this.validateFormData()) {
            this.isClick = true;
            //   console.error("22");
            this.borrowReturnListService
                .submitApply(this.rtnAppPo)
                .then(data => {
                    if (data.success) {
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
                        this.isClick = false;
                    }
                });
        }
    }
    //取消
    goBack() {
        window.close();
    }

    public showLocation = false;
    public showTimeMap() {
        this.addressId = "";
        this.showLocation = true;
    }

    public editTimeMap(rtnTransportPo: RtnTransportPo, aid: string) {
        if (this.rtnAddresses.length == 0) {
            this.windowService.alert({
                message: "该客户没有取货地址请先添加取货地址",
                type: "fail"
            });
        } else {
            //  console.log("aid=" + (aid == 'string') + "   aid===" + aid);
            if (aid != "undefined") {
                this.addressId = aid;
                this.showLocation = true;
            } else {
                this.windowService.alert({
                    message: "请选择取货地址",
                    type: "fail"
                });
            }
        }
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
        if (window.opener.document.getElementById("searchBtn")) {
            window.opener.document.getElementById("searchBtn").click();
        }
        this.windowService.alert({
            message: "保存成功",
            type: "success"
        });
        setTimeout(function() {
            window.close();
        }, 1500);
    }
    public missData(e) {
        this.showLocation = e;
    }
    public addressData(e) {
        //初始取货地址列表
        //初始取货地址列表
        this.borrowReturnListService
            .getBorrowRtnCustomer(this.customerName)
            .then(data => {
                this.rtnAddresses = data.list;
                for (let i of this.rtnAppPo.rtnTransportPoList) {
                    for (let j of this.rtnAddresses) {
                        if (
                            i.rtnTransport.rtnAddressId == j.deliveryAddressId
                        ) {
                            i.rtnTransport.rtnAddress = j.deliveryAddress;
                            break;
                        }
                    }
                }
            });
    }

    transportAddressesChange(rtnTransportPo: RtnTransportPo, e: any) {
        for (let i of this.rtnAddresses) {
            if (i.deliveryAddressId == e.target.value) {
                rtnTransportPo.rtnTransport.rtnAddressId = i.deliveryAddressId;
                rtnTransportPo.rtnTransport.rtnAddress = i.deliveryAddress;
                break;
            }
        }
    }

    transportTypeChange(rtnTransportPo: RtnTransportPo, e: any) {
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        rtnTransportPo.rtnTransport.transportCode = values[0];
        rtnTransportPo.rtnTransport.transportName = values[1];
    }

    public validateFormData() {
        if (this.rtnAppPo.borrowReturnApply.reservationNo.length == 0) {
            this.windowService.alert({ message: "请选择预留号", type: "fail" });
            return false;
        }
        // if (this.unRtnMaterielAppList.length == 0) {
        //     this.windowService.alert({ message: "该预留号下没有需要归还物料，请重新选择预留号！", type: "fail" });
        //     return false;
        // }
        if (this.rtnAppPo.rtnTransportPoList.length == 0) {
            this.windowService.alert({
                message: "请至少归还一块物料信息！",
                type: "fail"
            });
            return false;
        }
        //RtnTransportPo
        for (let i of this.rtnAppPo.rtnTransportPoList) {
            if (
                typeof i.rtnTransport.rtnAddressId == "undefined" ||
                i.rtnTransport.rtnAddressId == null ||
                i.rtnTransport.rtnAddressId == ""
            ) {
                this.windowService.alert({
                    message: "请选择取货地址",
                    type: "fail"
                });
                return false;
            }

            if (this.rtnAppPo.borrowReturnApply.pickupType > 0) {
                if (
                    typeof i.rtnTransport.transportCode == "undefined" ||
                    i.rtnTransport.transportCode == null ||
                    i.rtnTransport.transportCode == ""
                ) {
                    this.windowService.alert({
                        message: "请选择运输方式",
                        type: "fail"
                    });
                    return false;
                }
            }
            for (let j of i.rtnMaterielAppList) {
                if (j.count <= 0) {
                    this.windowService.alert({
                        message:
                            "编号为" +
                            j.meterialNo +
                            "物料,归还数量必须大于0，请从新选择预留号！",
                        type: "fail"
                    });
                    return false;
                }
            }
        }
        return true;
    }
    //增加删除物料块的方法add by weiyg 20180116
    delTransport(i) {
        this.windowService.confirm({ message: `确定删除？` }).subscribe(v => {
            if (v) {
                this.rtnAppPo.rtnTransportPoList.splice(i, 1);
            }
        });
    }
}
//
