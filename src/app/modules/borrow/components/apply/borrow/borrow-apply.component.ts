
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from "@angular/core";
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
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import {
    Query,
    BorrowApply,
    BorrowListService,
    Materiel,
    Transport,
    BorrowApplytransportPoL,
    BorrowApplyFormData,
    BorrowAttachment
} from "./../../../services/borrow-list.service";
import {
    SelectOption,
    ApplyUser,
    PersonnelInfo,
    DeliveryAddress
} from "../../common/borrow-entitys";
import {
    environment_java,
    dbomsPath,
    environment
} from "environments/environment";
import { BorrowUnclearListComponent } from "../../common/borrow-unclear-list.component";

import { PopInventoryListComponent } from "../../common/pop-inventory-list.component";

import { WindowService } from "app/core";

import { Person } from "app/shared/services/index";

declare var window;

@Component({
    templateUrl: "./borrow-apply.component.html",
    styleUrls: ["./borrow-apply.component.scss"]
})
export class BorrowApplyComponent implements OnInit {
    borrowApplyFormData: BorrowApplyFormData = new BorrowApplyFormData();
    applyData: any = {}; // borrowApplyFormData的副本
    loading: boolean = true; //加载中效果
    /*!!!!表单中没有借用类型、事业部、以及业务范围编号，这些数据的来源需要确认 */
    transportTypesOpts: SelectOption[] = []; //运输方式选项
    borrowAttrOpts: SelectOption[] = []; //借用属性选项
    deliveryTypeOpts: SelectOption[] = []; //交货方式
    borrowTypeOpts: Array<SelectOption> = []; //借用类型
    applyUser: ApplyUser = new ApplyUser();
    upFileApiLink: String =
        environment.server + "InvoiceRevise/UploadIRAccessories";

    businessDepts: Array<string> = []; //事业部列表
    businessScopeDepts: Array<Object> = []; //事业部范围编号

    deliveryAddresses: Array<DeliveryAddress> = [];
    public customerName: string;

    platforminv = [];
    public applyId: string = "";

    public person = []; //申请人员信息
    public newFreezePerson: PersonnelInfo;

    public userInfo: Person = new Person(); //申请人

    public addressId: string;
    public showLocation = false;
    //model窗口对象
    modalAddForm: XcModalRef;
    public baseUserIsShow = true;

    public canOperatingBorrow: boolean = false;

    public hideTransportInfo: boolean = false;

    borrowAttachmentList: BorrowAttachment[] = [];

    public createUserInfo: Person = new Person(); //申请人

    saleRole: boolean = true;
    //model窗口对象
    modalAddForm2: XcModalRef;

    tranSportIndex: number = 0;
    checkBorrowDate: string = "";
    isVisible: boolean = true;
    currAppFlag: boolean = false; //是否创建人
    isDisable: boolean = false; // 默认可以点
    constructor(
        private router: Router,
        private http: Http,
        private route: ActivatedRoute,
        private location: Location,
        private borrowListService: BorrowListService,
        private xcModalService: XcModalService,
        private windowService: WindowService
    ) {
        this.route.params.subscribe(params => {
            this.applyId = params["applyId"];
        });
    }
    name = "借用申请新建";
    ngOnInit() {
        this.borrowListService.getUserRole().then(data => {
            let roleCodes = data.item;
            // console.log("roleCodes=" +roleCodes);
            if (roleCodes.indexOf("0000000001") >= 0) {
                this.saleRole = false;
            }
        });

        this.checkBorrowDate = this.getDate1(new Date());

        this.newFreezePerson = new PersonnelInfo();

        this.borrowListService.getBorrowPageAttrOption(1).then(data => {
            for (let i of data.list) {
                i.code = i.code + "_" + i.name;
                this.borrowAttrOpts.push(i);
            }
            // console.info(data.list);
        });
        this.borrowListService.getPlatforminv("21").then(data => {
            this.platforminv = data.list;
        });
        this.borrowListService.queryNowMonth().then(data => {
            let month = data.item.month;
            if (month == 11 || month == 12) {
                this.canOperatingBorrow = true;
            }
        });

        this.borrowListService.getBorrowPageAttrOption(2).then(data => {
            this.deliveryTypeOpts = [];
            for (let i of data.list) {
                i.code = i.code + "_" + i.name;
                this.deliveryTypeOpts.push(i);
            }
        });
        this.borrowListService.getBorrowPageAttrOption(3).then(data => {
            this.transportTypesOpts = [];
            for (let i of data.list) {
                i.code = i.code + "_" + i.name;
                this.transportTypesOpts.push(i);
            }
        });
        this.borrowListService.getUserContext().then(data => {
            if (!this.applyId) {
                this.userInfo.userEN = data.item.sysUsers.itcode.toLocaleLowerCase();
                this.userInfo.userID = data.item.sysUsers.itcode.toLocaleLowerCase();
                this.userInfo.userCN = data.item.sysUsers.userName;
                this.person.push(this.userInfo);
            }
            this.applyUser.itcode = data.item.sysUsers.itcode;
            this.applyUser.name = data.item.sysUsers.userName;
            this.applyUser.personNo = data.item.sysUsers.userNo;
            this.applyUser.mobile = data.item.mobile;
            this.applyUser.platformCode = data.item.sysUsers.flatCode;
            this.applyUser.platformName = data.item.sysUsers.flatName;
            this.baseUserIsShow = true;
            if (!this.applyId) {
                this.initPerson(data);
            }
        });
        this.modalAddForm = this.xcModalService.createModal(
            BorrowUnclearListComponent
        );
        this.modalAddForm.onHide().subscribe(data => {
            if (data) {
                //子组件将数据回写
            }
        });

        this.modalAddForm2 = this.xcModalService.createModal(
            PopInventoryListComponent
        );
        this.modalAddForm2.onHide().subscribe(data => {
            if (data) {
                if (data.type == "save") {
                    this.borrowApplyFormData.transportPoList[
                        this.tranSportIndex
                    ].transport.inventory = data.inventoryNo;

                    this.borrowApplyFormData.transportPoList[
                        this.tranSportIndex
                    ].transport.inventoryName = data.inventoryNo;
                }
                //子组件将数据回写
            }
            this.tranSportIndex = 0;
        });
        if (this.applyId) {
            console.log("applyId", this.applyId);
            //新建
            this.borrowListService
                .queryBorrowApplyById(this.applyId)
                .then(data => {
                    this.borrowApplyFormData = data.item as BorrowApplyFormData;
                    this.applyData = JSON.parse(
                        JSON.stringify(this.borrowApplyFormData.borrowApply)
                    );
                    console.log("applyData", this.applyData);
                    console.log(
                        "borrowApplyFormData",
                        this.borrowApplyFormData
                    );
                    this.currAppFlag = data.currAppFlag;
                    if (this.borrowApplyFormData.borrowApply.flowStatus != 5) {
                        this.borrowApplyDateToString();
                        this.getUserExtendsInfo(
                            this.borrowApplyFormData.borrowApply.applyItCode,
                            {
                                subDeptName: this.applyData.subDeptName,
                                businessScope: this.applyData.businessScope,
                                platformName: this.applyData.platformName
                            }
                        );
                        this.initBorrowPageTypeOption();
                    } else {
                        this.borrowListService
                            .queryUserInfoById(
                                this.borrowApplyFormData.borrowApply.creator
                            )
                            .then(data => {
                                this.createUserInfo.userEN = data.item.itcode.toLocaleUpperCase();
                                this.createUserInfo.userID = data.item.itcode.toLocaleLowerCase();
                                this.createUserInfo.userCN = data.item.name;
                            });
                    }
                    this.userInfo.userEN = this.borrowApplyFormData.borrowApply.applyItCode.toLocaleLowerCase();
                    this.userInfo.userID = this.borrowApplyFormData.borrowApply.applyItCode.toLocaleLowerCase();
                    this.userInfo.userCN = this.borrowApplyFormData.borrowApply.applyUserName;
                    this.person.push(this.userInfo);

                    this.changeBorrowCustomer(
                        this.borrowApplyFormData.borrowApply.borrowCustomerName
                    );
                    this.borrowAttachmentList = this.borrowApplyFormData.borrowApply.attachmentList;
                    if (
                        this.borrowApplyFormData.borrowApply.deliveryType ==
                            "CUSTSELF" ||
                        this.borrowApplyFormData.borrowApply.deliveryType ==
                            "SALEMAN"
                    ) {
                        this.hideTransportInfo = true;
                    }
                });
        } else {
            //查询
            this.borrowApplyFormData.borrowApply.borrowDate = this.getDate1(
                new Date()
            );
            this.currAppFlag = true;
        }
    }
    i: number = 0;
    borrowAttrChange(e: any) {
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        this.borrowApplyFormData.borrowApply.borrowAttributeCode = values[0];
        this.borrowApplyFormData.borrowApply.borrowAttributeName = values[1];
        this.initBorrowPageTypeOption();
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowDayCount !=
                "undefined" &&
            this.borrowApplyFormData.borrowApply.borrowDayCount != 0
        ) {
            let isout: boolean = true;
            if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "LOGBOR" &&
                this.borrowApplyFormData.borrowApply.borrowDayCount > 30
            ) {
                //物流借用
                isout = false;
            } else if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "SALESIGN" &&
                this.borrowApplyFormData.borrowApply.borrowDayCount > 70
            ) {
                //售前签单
                isout = false;
            } else if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "REVIEW" &&
                this.borrowApplyFormData.borrowApply.borrowDayCount > 30
            ) {
                //评测
                isout = false;
            } else if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "PROPAGA" &&
                this.borrowApplyFormData.borrowApply.borrowDayCount > 30
            ) {
                //宣传
                isout = false;
            } else if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "MAINTEN" &&
                this.borrowApplyFormData.borrowApply.borrowDayCount > 60
            ) {
                //维修
                isout = false;
            }
            if (!isout) {
                this.windowService.alert({
                    message: "借用天数超过规定天数，会加签至总经理和风控审批！",
                    type: "success"
                });
            }
        }
    }
    paltforminvChange(
        e: any,
        borrowApplytransportPoL: BorrowApplytransportPoL
    ) {
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        borrowApplytransportPoL.transport.inventory = values[0];
        borrowApplytransportPoL.transport.inventoryName = values[1];
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

    dataChange(type: string) {
        if (type == "start") {
            //   console.error("12312312===="+ this.getDate1(new Date()));
            //      let cdate=new Date();
            //     let startDate = new Date(this.dateDiff2(this.borrowApplyFormData.borrowApply.borrowDate,1));
            //    if(cdate.getTime()>startDate.getTime()){
            //      this.windowService.alert({ message: "借用日期必须大于等于今天", type: "fail" });
            //      this.borrowApplyFormData.borrowApply.borrowDate =null;
            //       return false;
            //    }

            if (
                this.borrowApplyFormData.borrowApply.borrowDayCount &&
                this.borrowApplyFormData.borrowApply.giveBackDay
            ) {
                // console.error("12312312====2");
                let days =
                    this.borrowApplyFormData.borrowApply.borrowDayCount - 1;
                let startDate = this.borrowApplyFormData.borrowApply.borrowDate;
                this.borrowApplyFormData.borrowApply.giveBackDay = this.dateDiff2(
                    startDate,
                    days
                );
                return;
            }
        } else if (type == "days") {
            if (
                typeof this.borrowApplyFormData.borrowApply
                    .borrowAttributeCode == "undefined" ||
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "undefined"
            ) {
                this.windowService.alert({
                    message: "请先选择借用属性",
                    type: "fail"
                });
                this.borrowApplyFormData.borrowApply.borrowDayCount = null;
                return false;
            }
            if (!this.borrowApplyFormData.borrowApply.borrowDate) {
                this.windowService.alert({
                    message: "请先填写借用日期",
                    type: "fail"
                });
                this.borrowApplyFormData.borrowApply.borrowDayCount = null;
                return false;
            }
            if (
                typeof this.borrowApplyFormData.borrowApply
                    .borrowAttributeCode != "undefined" &&
                this.borrowApplyFormData.borrowApply.borrowAttributeCode != ""
            ) {
                let isout: boolean = true;
                if (
                    this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                        "LOGBOR" &&
                    this.borrowApplyFormData.borrowApply.borrowDayCount > 30
                ) {
                    //物流借用
                    isout = false;
                } else if (
                    this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                        "SALESIGN" &&
                    this.borrowApplyFormData.borrowApply.borrowDayCount > 70
                ) {
                    //售前签单
                    isout = false;
                } else if (
                    this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                        "REVIEW" &&
                    this.borrowApplyFormData.borrowApply.borrowDayCount > 30
                ) {
                    //评测
                    isout = false;
                } else if (
                    this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                        "PROPAGA" &&
                    this.borrowApplyFormData.borrowApply.borrowDayCount > 30
                ) {
                    //宣传
                    isout = false;
                } else if (
                    this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                        "MAINTEN" &&
                    this.borrowApplyFormData.borrowApply.borrowDayCount > 60
                ) {
                    //维修
                    isout = false;
                }
                if (!isout) {
                    this.windowService.alert({
                        message:
                            "借用天数超过规定天数，会加签至总经理和风控审批！",
                        type: "success"
                    });
                }
            }
            // console.error("22333223");
            if (this.borrowApplyFormData.borrowApply.borrowDate) {
                let days =
                    this.borrowApplyFormData.borrowApply.borrowDayCount - 1;
                let startDate = this.borrowApplyFormData.borrowApply.borrowDate;
                this.borrowApplyFormData.borrowApply.giveBackDay = this.dateDiff2(
                    startDate,
                    days
                );
                return;
            }
        } else {
            if (
                this.borrowApplyFormData.borrowApply.borrowDate &&
                this.borrowApplyFormData.borrowApply.giveBackDay
            ) {
                //  console.error("444444444444");
                let startDate = this.borrowApplyFormData.borrowApply.borrowDate;
                let endDate = this.borrowApplyFormData.borrowApply.giveBackDay;
                this.borrowApplyFormData.borrowApply.borrowDayCount =
                    this.dateDiff(
                        this.getDate1(startDate),
                        this.getDate1(endDate)
                    ) + 1;
                return;
            }
            if (
                !this.borrowApplyFormData.borrowApply.borrowDate &&
                this.borrowApplyFormData.borrowApply.borrowDayCount &&
                this.borrowApplyFormData.borrowApply.giveBackDay
            ) {
                let days =
                    (this.borrowApplyFormData.borrowApply.borrowDayCount - 1) *
                    -1;
                let startDate = this.borrowApplyFormData.borrowApply
                    .giveBackDay;
                this.borrowApplyFormData.borrowApply.borrowDate = this.dateDiff2(
                    startDate,
                    days
                );
                return;
            }
        }
        //console.error(type);
    }
    contrastDate(sDate1: string, sDate2: string, sDate3: string): boolean {
        let start = new Date(sDate1);
        let end = new Date(sDate2);
        let send = new Date(sDate3);
        if (
            start.getTime() <= send.getTime() &&
            send.getTime() <= end.getTime() + 24 * 3600 * 1000
        ) {
            return true;
        }
        return false;
    }
    backDateChange(backdate: string) {
        if (
            this.borrowApplyFormData.borrowApply.borrowDate &&
            this.borrowApplyFormData.borrowApply.giveBackDay
        ) {
            let valadata = this.contrastDate(
                this.borrowApplyFormData.borrowApply.borrowDate,
                this.borrowApplyFormData.borrowApply.giveBackDay,
                backdate
            );
            if (!valadata) {
                this.windowService.alert({
                    message: "归还日期不合法，请重新填写",
                    type: "fail"
                });
            }
        } else {
            this.windowService.alert({
                message: "请先填写借用日期和归还日期",
                type: "fail"
            });
            return false;
        }
    }
    dateDiff(sDate1: string, sDate2: string): number {
        //sDate1和sDate2是2002-12-18格式
        sDate1 = this.getDate1(sDate1);
        sDate2 = this.getDate1(sDate2);

        let aDate, oDate1: Date, oDate2: Date, iDays;

        aDate = sDate1.split("-");

        oDate1 = new Date(aDate[1] + "-" + aDate[2] + "-" + aDate[0]); //转换为12-18-2002格式
        aDate = sDate2.split("-");
        oDate2 = new Date(aDate[1] + "-" + aDate[2] + "-" + aDate[0]);

        iDays = parseInt(
            Math.abs(oDate1.getTime() - oDate2.getTime()) /
                1000 /
                60 /
                60 /
                24 +
                ""
        ); //把相差的毫秒数转换为天数
        return iDays;
    }

    dateDiff2(startDate, intValue) {
        startDate = this.getDate1(startDate);

        let aDate, oDate1: Date, endDate: Date;
        let times: number;
        aDate = startDate.split("-");
        oDate1 = new Date(aDate[1] + "-" + aDate[2] + "-" + aDate[0]);

        times = oDate1.getTime();
        times += intValue * (24 * 3600 * 1000);
        endDate = new Date(times);
        return this.getDate1(endDate);
    }

    dateToString(obj: any): any {
        if (obj != null && obj != "null" && (obj + "").length == 13) {
            obj = this.getDate1(obj);
        }
        return obj;
    }
    initBorrowPageTypeOption() {
        this.borrowListService
            .getBorrowPageTypeOption(
                1,
                this.borrowApplyFormData.borrowApply.borrowAttributeCode
            )
            .then(data => {
                this.borrowTypeOpts = [];
                for (let obj of data.list) {
                    obj.code = obj.code + "_" + obj.name;
                    this.borrowTypeOpts.push(obj);
                }
                if (!this.applyId) {
                    //初始化时默认借用类型为undefined
                    this.borrowApplyFormData.borrowApply.borrowTypeCode = undefined;
                    this.borrowApplyFormData.borrowApply.borrowTypeName = undefined;
                }
            });
    }
    borrowTypeChange(e: any) {
        // console.info(e.target);
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        this.borrowApplyFormData.borrowApply.borrowTypeCode = values[0];
        this.borrowApplyFormData.borrowApply.borrowTypeName = values[1];
    }
    deliveryTypeChange(e: any) {
        //  console.info(e.target);
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        this.borrowApplyFormData.borrowApply.deliveryType = values[0];
        this.borrowApplyFormData.borrowApply.deliveryTypeName = values[1];
        if (
            this.borrowApplyFormData.borrowApply.deliveryType == "CUSTSELF" ||
            this.borrowApplyFormData.borrowApply.deliveryType == "SALEMAN"
        ) {
            this.hideTransportInfo = true;
            return;
        } else {
            this.hideTransportInfo = false;
        }
        //this.borrowApplyFormData.borrowApply.borrowTypeName=values[1];
    }
    transportTypeChange(
        borrowApplytransportPoL: BorrowApplytransportPoL,
        e: any
    ) {
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        borrowApplytransportPoL.transport.transportCode = values[0];
        borrowApplytransportPoL.transport.transportName = values[1];
    }

    openInventoryList(index: number) {
        this.tranSportIndex = index;
        this.modalAddForm2.show();
    }

    addTransport(e: any) {
        var obj = new BorrowApplytransportPoL();
        console.log("obj", obj);
        var ooObj = JSON.parse(JSON.stringify(new BorrowApplytransportPoL()));

        this.borrowApplyFormData.transportPoList.push(obj);
    }
    delTransport(i) {
        let transport: BorrowApplytransportPoL = this.borrowApplyFormData
            .transportPoList[i];
        if (transport.transport.transportId) {
            this.windowService
                .confirm({ message: `确定删除？` })
                .subscribe(v => {
                    if (v) {
                        this.borrowListService
                            .delRemoteTransport(transport.transport)
                            .then(data => {
                                if (data.success) {
                                    this.borrowApplyFormData.transportPoList.splice(
                                        i,
                                        1
                                    );
                                    this.windowService.alert({
                                        message: "操作成功",
                                        type: "success"
                                    });
                                    this.borrowApplyFormData.borrowApply.subTotalAmount = this.totalBorrowApplyAmount();
                                    if (
                                        this.borrowApplyFormData.borrowApply
                                            .subApplyNo === "" ||
                                        this.borrowApplyFormData.borrowApply
                                            .subApplyNo === undefined
                                    ) {
                                        this.borrowApplyFormData.borrowApply.borrowTotalAmount = this.borrowApplyFormData.borrowApply.subTotalAmount;
                                    }
                                } else {
                                    this.windowService.alert({
                                        message: data.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                });
        } else {
            this.borrowApplyFormData.transportPoList.splice(i, 1);
            this.borrowApplyFormData.borrowApply.subTotalAmount = this.totalBorrowApplyAmount();
            this.borrowApplyFormData.borrowApply.borrowTotalAmount = this.borrowApplyFormData.borrowApply.subTotalAmount;
        }
    }
    addMateriel(transport: BorrowApplytransportPoL) {
        let materiel: Materiel = new Materiel();
        materiel.factory = this.borrowApplyFormData.borrowApply.factory;
        materiel.unit = "台";
        transport.materielList.push(materiel);

        //transport.transport.borrowAmount = this.totalTransportBorrowAmount(transport.materielList);
        //this.borrowApplyFormData.borrowApply.borrowTotalAmount = this.totalBorrowApplyAmount();
    }
    //获取物料信息 modify by weiyg 20171213
    meterialNoChange(materiel: Materiel) {
        if (materiel.meterialNo == undefined || materiel.meterialNo == "") {
            return;
        }
        this.borrowListService
            .meterialNoChange(materiel.meterialNo)
            .then(data => {
                if (data.success) {
                    materiel.meterialMemo = data.message;
                } else {
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                }
            });
    }
    //获取物料平均价
    getMaterialPrice(materiel: Materiel) {
        if (
            materiel.meterialNo == undefined ||
            materiel.meterialNo == "" ||
            materiel.factory == "" ||
            materiel.batch == undefined ||
            materiel.batch == ""
        ) {
            return;
        }
        this.borrowListService
            .getMaterialPrice(
                materiel.meterialNo,
                materiel.factory,
                materiel.batch
            )
            .then(data => {
                if (data.success) {
                    materiel.price = data.message;
                    //this.borrowApplyFormData..transport.borrowAmount = this.totalTransportBorrowAmount(transport.materielList);
                } else {
                    materiel.price = 0;
                    this.windowService.alert({
                        message: data.message,
                        type: "fail"
                    });
                }
            });
    }
    formatStr(str: string) {
        let strNew = "";
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "0") continue;
            else {
                strNew = str.substring(i);
                i = str.length;
            }
        }
        return strNew;
    }
    materielChange(transport: BorrowApplytransportPoL) {
        transport.transport.borrowAmount = this.totalTransportBorrowAmount(
            transport.materielList
        );
        this.borrowApplyFormData.borrowApply.subTotalAmount = this.totalBorrowApplyAmount();
        //如果没有子单
        if (
            this.borrowApplyFormData.borrowApply.subApplyNo === "" ||
            this.borrowApplyFormData.borrowApply.subApplyNo === undefined
        ) {
            this.borrowApplyFormData.borrowApply.borrowTotalAmount = this.borrowApplyFormData.borrowApply.subTotalAmount;
        }
    }
    delMateriel(transport: BorrowApplytransportPoL, i) {
        let materiel: Materiel = transport.materielList[i];
        if (materiel.materielId) {
            this.windowService
                .confirm({ message: `确定删除？` })
                .subscribe(v => {
                    if (v) {
                        this.borrowListService
                            .delRemoteMateriel(materiel)
                            .then(data => {
                                if (data.success) {
                                    transport.materielList.splice(i, 1);
                                    transport.transport.borrowAmount = this.totalTransportBorrowAmount(
                                        transport.materielList
                                    );
                                    this.borrowApplyFormData.borrowApply.subTotalAmount = this.totalBorrowApplyAmount();
                                    this.windowService.alert({
                                        message: "操作成功",
                                        type: "success"
                                    });
                                } else {
                                    this.windowService.alert({
                                        message: data.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                });
        } else {
            transport.materielList.splice(i, 1);
            transport.transport.borrowAmount = this.totalTransportBorrowAmount(
                transport.materielList
            );
            this.borrowApplyFormData.borrowApply.subTotalAmount = this.totalBorrowApplyAmount();
        }
        //如果没有子单
        if (
            this.borrowApplyFormData.borrowApply.subApplyNo === "" ||
            this.borrowApplyFormData.borrowApply.subApplyNo === undefined
        ) {
            this.borrowApplyFormData.borrowApply.borrowTotalAmount = this.borrowApplyFormData.borrowApply.subTotalAmount;
        }
    }
    materielNumberChange(item: Materiel) {
        item.totalAmount = item.price * item.count;
    }
    totalTransportBorrowAmount(materielList: Materiel[]): number {
        let totalAmount = 0;
        for (let i of materielList) {
            i.totalAmount = this.fmoney(i.price * i.count + "", 2);
            totalAmount += i.price * i.count;
        }
        //this.fmoney(totalAmount+"",2)
        totalAmount = this.fmoney(totalAmount + "", 2);
        return totalAmount;
    }

    totalBorrowApplyAmount(): number {
        try {
            let totalAmount = 0;
            for (let i of this.borrowApplyFormData.transportPoList) {
                totalAmount += i.transport.borrowAmount;
            }
            //this.fmoney(totalAmount+"",2)
            totalAmount = this.fmoney(totalAmount + "", 2);
            return totalAmount;
        } catch (error) {
            console.error(error);
        }
    }

    changePerson(info) {
        console.log("info", info);
        if (info && info.length > 0) {
            if (info[0]["personNo"].length <= 0) {
                this.windowService.alert({
                    message: "人员编号为空，请重新选择！",
                    type: "fail"
                });
            }
            this.applyUser.itcode = info[0]["itcode"];
            this.applyUser.personNo = info[0]["personNo"];
            this.applyUser.name = info[0]["name"];
            this.applyUser.mobile = info[0]["mobile"];

            this.borrowApplyFormData.borrowApply.applyItCode =
                info[0]["itcode"];
            this.borrowApplyFormData.borrowApply.applyUserNo =
                info[0]["personNo"];
            this.borrowApplyFormData.borrowApply.applyUserName =
                info[0]["name"];
            this.borrowApplyFormData.borrowApply.applyUserTel =
                info[0]["mobile"];
            //this.borrowApplyFormData.borrowApply.applyUserTel ='15249203759';
            //this.getUserExtendsInfo("wuzk");
            this.getUserExtendsInfo(this.applyUser.itcode);
            //this.newFreezePerson.freeResult = 0;
            this.baseUserIsShow = false;
        }
        if (this.applyId) {
        }
    }
    initPerson(data) {
        if (data.item.sysUsers.userNo.length <= 0) {
            this.windowService.alert({
                message: "人员编号为空，请重新选择！",
                type: "fail"
            });
        }
        this.borrowApplyFormData.borrowApply.applyItCode =
            data.item.sysUsers.itcode;
        this.borrowApplyFormData.borrowApply.applyUserNo =
            data.item.sysUsers.userNo;
        this.borrowApplyFormData.borrowApply.applyUserName =
            data.item.sysUsers.userName;
        this.borrowApplyFormData.borrowApply.applyUserTel = data.item.mobile;
        console.log("initPerson");
        this.getUserExtendsInfo(data.item.sysUsers.itcode);

        //this.newFreezePerson.freeResult = 0;
        this.baseUserIsShow = false;
    }
    getUserExtendsInfo(data, initialData?) {
        this.borrowListService.getUserExtendInfo(data).then(data => {
            console.log("extendsInfo", data);
            //获取事业部列表
            this.borrowListService
                .getbusinessDepts(data.item.baseDepartment.bbmc)
                .then(data => {
                    console.log("businessDepts", data.list);
                    this.businessDepts = data.list;
                });
            //
            try {
                //平台编号
                this.borrowApplyFormData.borrowApply.platformCode =
                    data.item.sysUsers.flatCode;
                //平台名称
                this.borrowApplyFormData.borrowApply.platformName =
                    data.item.sysUsers.flatName;
                //本部
                this.borrowApplyFormData.borrowApply.baseDeptName =
                    data.item.baseDepartment.bbmc;
                //成本中心编号
                this.borrowApplyFormData.borrowApply.costcenterCode = this.formatStr(
                    data.item.sysUsers.costCenter
                );
                //成本中心名称
                this.borrowApplyFormData.borrowApply.costcenterName =
                    data.item.sysUsers.costCenterName;

                this.borrowApplyFormData.borrowApply.subDeptName =
                    data.item.baseDepartment.sybmc;
                this.borrowApplyFormData.borrowApply.businessScope =
                    data.item.baseDepartment.ywfwdm;
                console.log(typeof initialData);
                if (typeof initialData === "object") {
                    this.borrowApplyFormData.borrowApply.subDeptName =
                        initialData.subDeptName;
                    this.borrowApplyFormData.borrowApply.businessScope =
                        initialData.businessScope;
                    this.borrowApplyFormData.borrowApply.platformName =
                        initialData.platformName;
                    console.log(
                        "initialData",
                        this.borrowApplyFormData.borrowApply.businessScope
                    );
                    //获取事业部业务范围列表
                    this.borrowListService
                        .getbusinessDeptScopes(
                            this.borrowApplyFormData.borrowApply.subDeptName,
                            data.item.baseDepartment.bbmc
                        )
                        .then(data => {
                            console.log("业部业务范围列表", data);
                            this.businessScopeDepts = data.list;
                        });
                    return;
                }

                //获取事业部业务范围列表
                this.borrowListService
                    .getbusinessDeptScopes(
                        data.item.baseDepartment.sybmc,
                        data.item.baseDepartment.bbmc
                    )
                    .then(data => {
                        console.log("业部业务范围列表", data);
                        this.businessScopeDepts = data.list;
                    });
            } catch (error) {
                console.info(error);
            }
        });
    }
    borrowsybchange(e: any) {
        //获取事业部业务范围列表
        this.borrowListService
            .getbusinessDeptScopes(
                this.borrowApplyFormData.borrowApply.subDeptName,
                this.borrowApplyFormData.borrowApply.baseDeptName
            )
            .then(data => {
                this.borrowApplyFormData.borrowApply.businessScope = ""; //把业务范围清空
                this.businessScopeDepts = data.list;
            });
    }
    //运输信息，送货地址
    changeBorrowCustomer(e: any) {
        // this.customerName=this.borrowApplyFormData.borrowApply.borrowCustomerName;
        this.borrowListService
            .getBorrowCustomer(
                this.borrowApplyFormData.borrowApply.borrowCustomerName
            )
            .then(data => {
                this.deliveryAddresses = [];
                for (let i of data.list) {
                    i.deliveryAddressId =
                        i.deliveryAddressId + "_" + i.deliveryAddress;
                    this.deliveryAddresses.push(i);
                }
            });
    }
    deliveryAddressesChange(
        borrowApplytransportPoL: BorrowApplytransportPoL,
        e: any
    ) {
        let codeValue = e.target.value;
        let values: string[] = codeValue.split("_");
        borrowApplytransportPoL.transport.deliveryAddressId = values[0];
        borrowApplytransportPoL.transport.deliveryAddress = values[1];
    }
    clickSaveBorrowApply(e: any) {
        if (this.borrowApplyFormData.transportPoList.length > 0) {
            for (let transport of this.borrowApplyFormData.transportPoList) {
                if (
                    transport.transport.inventory === undefined ||
                    transport.transport.inventory === ""
                ) {
                    this.windowService.alert({
                        message: "库存地不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (transport.materielList.length > 0) {
                    for (let materiel of transport.materielList) {
                        if (
                            materiel.meterialNo === undefined ||
                            materiel.meterialNo === ""
                        ) {
                            this.windowService.alert({
                                message: "物料编号不能为空",
                                type: "fail"
                            });
                            return false;
                        }

                        if (
                            materiel.factory === undefined ||
                            materiel.factory === "" ||
                            materiel.factory === null
                        ) {
                            this.windowService.alert({
                                message: "物料工厂不能为空",
                                type: "fail"
                            });
                            return false;
                        }
                        if (materiel.count != undefined) {
                            let reg = /^[1-9]\d*$/;
                            if (!reg.test(materiel.count + "")) {
                                this.windowService.alert({
                                    message: "物料数量只能为整数",
                                    type: "fail"
                                });
                                return false;
                            }
                        }
                    }
                }
            }
        }
        if (this.borrowApplyFormData.borrowApply.applyId) {
            this.isVisible = false;
            this.borrowListService
                .updateBorrowApply(this.borrowApplyFormData)
                .then(res => {
                    if (res.success) {
                        // this.appCloseConfirm();
                        this.windowService.alert({
                            message: "审批成功",
                            type: "success"
                        });
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    } else if (res.status + "" === "2001") {
                        //验证失败
                        this.isVisible = true;
                        let errorMessage = "";
                        res.list.forEach(item => {
                            errorMessage += item.message + ";";
                        });
                        this.windowService.alert({
                            message: errorMessage,
                            type: "fail"
                        });
                    } else if (res.status + "" === "500") {
                        this.isVisible = true;
                        this.windowService.alert({
                            message: res.message,
                            type: "fail"
                        });
                    } else {
                        this.isVisible = true;
                        console.info(res);
                    }
                });
        } else {
            this.isVisible = false;
            this.borrowListService
                .postBorrowApply(this.borrowApplyFormData)
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
                        // this.router.navigate(["/borrow/list"]);
                    } else if (res.status + "" === "2001") {
                        //验证失败
                        let errorMessage = "";
                        res.list.forEach(item => {
                            errorMessage += item.message + ";";
                        });
                        this.isVisible = true;
                        this.windowService.alert({
                            message: errorMessage,
                            type: "fail"
                        });
                    } else if (res.status + "" === "500") {
                        this.isVisible = true;
                        this.windowService.alert({
                            message: res.message,
                            type: "fail"
                        });
                    } else {
                        this.isVisible = true;
                        // console.info(res)
                    }
                });
        }
        // }
    }
    postBorrowApplySubmit(e: any) {
        // 经过测试，问题可能出在从库里拿出来的数据经过渲染过程，造成丢失
        console.log("data", this.borrowApplyFormData);
        if (this.validateFormData()) {
            this.isVisible = false;
            this.isDisable = true;
            if (this.borrowApplyFormData.borrowApply.applyId) {
                this.borrowListService
                    .postBorrowApplySubmit(this.borrowApplyFormData)
                    .then(res => {
                        res.status = res.status + "";
                        if (res.success) {
                            // this.appCloseConfirm();
                            this.windowService.alert({
                                message: "提交成功",
                                type: "success"
                            });
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                            //this.router.navigate(["/borrow/list"]);
                        } else if (res.status + "" == "2001") {
                            //验证失败
                            let errorMessage = "";
                            res.list.forEach(item => {
                                errorMessage += item.message + ";";
                            });
                            this.isVisible = true;
                            this.windowService.alert({
                                message: errorMessage,
                                type: "fail"
                            });
                        } else if (res.status + "" == "500") {
                            this.isVisible = true;
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            } else {
                //  console.info(" Add borrowApply 223344 ");
                // console.info(this.borrowApplyFormData);
                this.borrowListService
                    .postBorrowApplyUnsave(this.borrowApplyFormData)
                    .then(res => {
                        res.status = res.status + "";
                        if (res.success) {
                            //this.isVisible = false;
                            //   this.appCloseConfirm();
                            this.windowService.alert({
                                message: "提交成功",
                                type: "success"
                            });
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                            // this.router.navigate(["/borrow/list"]);
                        } else if (res.status + "" == "2001") {
                            //验证失败
                            this.isVisible = true;
                            let errorMessage = "";
                            res.list.forEach(item => {
                                errorMessage += item.message + ";";
                            });
                            this.windowService.alert({
                                message: errorMessage,
                                type: "fail"
                            });
                        } else if (res.status + "" == "500") {
                            this.isVisible = true;
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            }
        }
    }
    openUnClearItems() {
        if (
            typeof this.borrowApplyFormData.borrowApply.applyItCode ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.applyItCode == null
        ) {
            this.windowService.alert({
                message: "请先选择申请人",
                type: "fail"
            });
        } else {
            this.http
                .get(
                    environment_java.server +
                        "borrow/unclear-item/" +
                        this.borrowApplyFormData.borrowApply.applyItCode +
                        "/itcode"
                ).pipe(
                map(res => res.json()))
                .subscribe(res => {
                    if (res.list) {
                        if (res.list.length > 0) {
                            this.modalAddForm.show({
                                userItCode: this.borrowApplyFormData.borrowApply
                                    .applyItCode
                            });
                        } else {
                            this.windowService.alert({
                                message: "用户没有查询到未清项信息！",
                                type: "fail"
                            });
                        }
                    } else {
                        this.windowService.alert({
                            message: "用户没有查询到未清项信息！",
                            type: "fail"
                        });
                    }
                });
        }
    }
    backPage(e: any) {
        window.close();
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
        window.opener.document.getElementById("searchBtn").click();
        window.close();
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
    //附件信息
    public attachmentList(e) {
        this.borrowApplyFormData.borrowApply.attachmentList = [];
        for (let i of e) {
            let borrowAttachment: BorrowAttachment = new BorrowAttachment();
            //  console.log("file==" + JSON.stringify(i));
            borrowAttachment.filePath = i.filePath;
            borrowAttachment.fileName = i.fileName;
            borrowAttachment.accordId = i.AccessoryID;
            borrowAttachment.applyId = this.borrowApplyFormData.borrowApply.applyId;
            this.borrowApplyFormData.borrowApply.attachmentList.push(
                borrowAttachment
            );
        }
    }
    public editTimeMap(aid: string) {
        if (typeof aid == "undefined") {
            //this.showTimeMap();
            this.windowService.alert({
                message: "该客户没有送货地址,请先添加!",
                type: "fail"
            });
            return false;
        } else {
            this.addressId = aid;
            this.showLocation = true;
        }
    }
    public showTimeMap() {
        this.addressId = "";
        this.showLocation = true;
    }
    public missData(e) {
        this.showLocation = e;
    }

    public fmoney(s, n): number {
        /*
         * 参数说明：
         * s：要格式化的数字
         * n：保留几位小数
         * */
        n = n > 0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        let l = s
                .split(".")[0]
                .split("")
                .reverse(),
            r = s.split(".")[1];
        let t: string = "";
        for (let i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? "" : "");
        }
        //console.error(t.split("").reverse().join("") + "." + r);
        return parseFloat(
            t
                .split("")
                .reverse()
                .join("") +
                "." +
                r
        );
    }

    public validateFormData() {
        if (this.borrowApplyFormData.borrowApply.subDeptName === "") {
            this.windowService.alert({
                message: "事业部不能为空",
                type: "fail"
            });
            return false;
        }
        //console.log(this.borrowApplyFormData.borrowApply.businessScope);
        if (this.borrowApplyFormData.borrowApply.businessScope === "") {
            this.windowService.alert({
                message: "业务范围不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            this.borrowApplyFormData.borrowApply.factory === undefined ||
            this.borrowApplyFormData.borrowApply.factory === ""
        ) {
            this.windowService.alert({ message: "工厂不能为空", type: "fail" });
            return false;
        }
        if (this.borrowApplyFormData.borrowApply.factory.length > 0) {
            let length = this.borrowApplyFormData.borrowApply.factory.length;
            let scope = this.borrowApplyFormData.borrowApply.factory
                .substring(length - 2, length)
                .toLocaleLowerCase();
            let scopevalue = this.borrowApplyFormData.borrowApply.businessScope.toLocaleLowerCase();
            if (scopevalue.indexOf(scope) == -1) {
                this.windowService.alert({
                    message: "请确保业务范围前两位等于工厂后两位",
                    type: "fail"
                });
                return false;
            }
        }
        if (
            this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                undefined ||
            this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                "undefined"
        ) {
            this.windowService.alert({
                message: "借用属性不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowTypeCode ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.borrowTypeCode == "undefined"
        ) {
            this.windowService.alert({
                message: "借用类型不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.projectName !=
                "undefined" &&
            this.borrowApplyFormData.borrowApply.projectName != null
        ) {
            if (this.borrowApplyFormData.borrowApply.projectName.length > 40) {
                this.windowService.alert({
                    message: "项目名称不能超过40个字符",
                    type: "fail"
                });
                return false;
            }
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.projectName ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.projectName == "" ||
            this.borrowApplyFormData.borrowApply.projectName == null
        ) {
            if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                "SALESIGN"
            ) {
                this.windowService.alert({
                    message: "售前签单项目名称不能为空",
                    type: "fail"
                });
                return false;
            }
            if (
                this.borrowApplyFormData.borrowApply.borrowAttributeCode ==
                    "REVIEW" &&
                this.borrowApplyFormData.borrowApply.borrowTypeCode == "69"
            ) {
                this.windowService.alert({
                    message: "外部评测项目名称不能为空",
                    type: "fail"
                });
                return false;
            }
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowCustomerName ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.borrowCustomerName == ""
        ) {
            this.windowService.alert({
                message: "借用客户名称不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowDate ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.borrowDate == null ||
            this.borrowApplyFormData.borrowApply.borrowDate == ""
        ) {
            this.windowService.alert({
                message: "借用日期不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowDayCount ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.borrowDayCount == null ||
            this.borrowApplyFormData.borrowApply.borrowDayCount < 1
        ) {
            this.windowService.alert({
                message: "借用天数不能为空或小于1",
                type: "fail"
            });
            return false;
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.borrowDayCount !=
                "undefined" &&
            this.borrowApplyFormData.borrowApply.borrowDayCount != null &&
            this.borrowApplyFormData.borrowApply.borrowDayCount > 1
        ) {
            let reg = /^\+?[1-9][0-9]*$/;
            if (
                !reg.test(
                    this.borrowApplyFormData.borrowApply.borrowDayCount + ""
                )
            ) {
                this.windowService.alert({
                    message: "借用天数只能为整数",
                    type: "fail"
                });
                return false;
            }
        }
        if (
            typeof this.borrowApplyFormData.borrowApply.deliveryType ==
                "undefined" ||
            this.borrowApplyFormData.borrowApply.deliveryType == "undefined"
        ) {
            this.windowService.alert({
                message: "交货方式不能为空",
                type: "fail"
            });
            return false;
        }
        if (
            this.borrowApplyFormData.borrowApply.borrowMemo != null &&
            typeof this.borrowApplyFormData.borrowApply.borrowMemo !=
                "undefined" &&
            this.borrowApplyFormData.borrowApply.borrowMemo != ""
        ) {
            if (this.borrowApplyFormData.borrowApply.borrowMemo.length > 140) {
                this.windowService.alert({
                    message: "借用说明不能超过40个字符",
                    type: "fail"
                });
                return false;
            }
        }
        if (this.borrowApplyFormData.borrowApply.attachmentList.length == 0) {
            this.windowService.alert({
                message: "借用依据不能为空",
                type: "fail"
            });
            return false;
        }
        if (this.borrowApplyFormData.transportPoList.length == 0) {
            this.windowService.alert({
                message: "物料与运输信息不能为空",
                type: "fail"
            });
            return false;
        }

        for (let transport of this.borrowApplyFormData.transportPoList) {
            if (
                typeof transport.transport.inventory == "undefined" ||
                transport.transport.inventory == ""
            ) {
                this.windowService.alert({
                    message: "库存地不能为空",
                    type: "fail"
                });
                return false;
            } else {
                transport.transport.inventoryName =
                    transport.transport.inventory; //给库存地名称赋值
            }

            if (!this.hideTransportInfo) {
                if (
                    typeof transport.transport.arrivalDate == "undefined" ||
                    transport.transport.arrivalDate == ""
                ) {
                    this.windowService.alert({
                        message: "期望到货日期不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (
                    typeof transport.transport.transportCode == "undefined" ||
                    transport.transport.transportCode == "undefined"
                ) {
                    this.windowService.alert({
                        message: "运输方式不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (
                    typeof transport.transport.deliveryAddressId ==
                        "undefined" ||
                    transport.transport.deliveryAddressId == "undefined"
                ) {
                    this.windowService.alert({
                        message: "送货地址不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (
                    typeof transport.transport.startTransport == "undefined" ||
                    transport.transport.startTransport == ""
                ) {
                    this.windowService.alert({
                        message: "运输起点不能为空",
                        type: "fail"
                    });
                    return false;
                }
            }

            if (transport.materielList.length == 0) {
                this.windowService.alert({
                    message: "运输单内物料不能为空",
                    type: "fail"
                });
                return false;
            }
            for (let materiel of transport.materielList) {
                if (
                    typeof materiel.meterialNo == "undefined" ||
                    materiel.meterialNo == ""
                ) {
                    this.windowService.alert({
                        message: "物料编号不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (
                    typeof materiel.batch == "undefined" ||
                    materiel.batch == ""
                ) {
                    this.windowService.alert({
                        message: "物料批次不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (
                    typeof materiel.unit == "undefined" ||
                    materiel.unit == ""
                ) {
                    this.windowService.alert({
                        message: "物料单位不能为空",
                        type: "fail"
                    });
                    return false;
                }
                if (typeof materiel.count == "undefined") {
                    this.windowService.alert({
                        message: "物料数量不能为空",
                        type: "fail"
                    });
                    return false;
                } else {
                    let reg = /^[1-9]\d*$/;
                    if (!reg.test(materiel.count + "")) {
                        this.windowService.alert({
                            message: "物料数量只能为整数",
                            type: "fail"
                        });
                        return false;
                    }
                }
                if (materiel.price == undefined || materiel.price == 0) {
                    let msg: string =
                        materiel.meterialNo +
                        "物料在" +
                        materiel.factory +
                        "工厂," +
                        transport.transport.inventory +
                        "库存地," +
                        materiel.batch +
                        "批次下不存在";
                    this.windowService.alert({ message: msg, type: "fail" });
                    return false;
                }
            }
        }
        return true;
    }
    loadFile(filepath: string) {
        window.open(this.borrowListService.filesDownload(filepath));
    }
    transUpper(item: Materiel) {
        item.batch = item.batch.toUpperCase();
    }
    transFacotry(borrowApply: BorrowApply) {
        borrowApply.factory = borrowApply.factory.toUpperCase();
        for (let item of this.borrowApplyFormData.transportPoList) {
            for (let materiel of item.materielList) {
                materiel.factory = borrowApply.factory;
                this.getMaterialPrice(materiel);
            }
        }
    }
}
//
