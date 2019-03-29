import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { WindowService } from "../../../../../core/index";
import { XcModalService, XcModalRef } from "../../../../../shared/index";
import { TradeTicketService } from "../../../services/tradeticket/tradeticket-apply.service";
import { PayeeQueryComponent } from "../invoice/payeequery/payee-query.component";
import { CustomQueryComponent } from "../invoice/customquery/custom-query.component";
import { ContractQueryComponent } from "../invoice/contractquery/contract-query.component";
import { DebtQueryComponent } from "../invoice/debtquery/debt-query.component";
import { TradeTicketInfo } from "../invoice/invoice-info";
import { FileUploader, ParsedResponseHeaders, FileItem } from "ng2-file-upload";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import { environment, APIAddress } from "environments/environment";
declare var window;

class TradeTicketAttachment {
    constructor(
        public fileId: string,
        public fileName: string,
        public filePath: string
    ) {}
}
@Component({
    templateUrl: "./tradeticket-apply.component.html",
    styleUrls: ["./tradeticket-apply.component.scss"]
})
export class TradeticketApplyComponent implements OnInit {
    tradeTicketInfo: TradeTicketInfo = new TradeTicketInfo();
    //商票列表
    tradeTickets = new Array<TradeTicketInfo>();
    //平台下拉框
    platforms = new Array();
    YWFWDMList = new Array();
    peyeeList = new Array();
    submitFlag: boolean = true;
    addFlag: boolean = false;
    department: string = "";
    public upLoadECFile: FileUploader;
    attachList = new Array(); //附件信息
    message: string = ""; //附件上传失败提醒信息
    bassinApproveList = new Array(); //商务审批
    finaceApproveList = new Array(); //财务审批
    // payeeForm :XcModalRef;
    customForm: XcModalRef;
    contractForm: XcModalRef;
    debtForm: XcModalRef;
    constructor(
        private tradeTicketService: TradeTicketService,
        private activatedRouter: ActivatedRoute,
        private invoiceApplyService: InvoiceApplyService,
        private windowService: WindowService,
        private xcModalService: XcModalService
    ) {}
    totalvoucherAmount: number = 0;

    name = "商票申请";
    person = [];
    ngOnInit(): void {
        this.activatedRouter.params.subscribe((params: Params) => {
            let id = params["id"];
            //草稿重新申请
            if (id != "-1") {
                this.tradeTicketService.getTradeticketById(id).then(res => {
                    res.item[4].forEach(element => {
                        this.tradeTickets.push(element);
                    });
                    this.attachList = res.item[3];
                    this.initData(res.item[0]);
                });
            } else {
                this.addFlag = true;
                this.initData("-1");
            }
        });

        this.getStorageList();
        this.initYWFWDM();
        this.getPayeeList();
        //客户
        this.customForm = this.xcModalService.createModal(CustomQueryComponent);
        //合同
        this.contractForm = this.xcModalService.createModal(
            ContractQueryComponent
        );
        //欠款金额
        this.debtForm = this.xcModalService.createModal(DebtQueryComponent);
        let ticket: string = localStorage.getItem("ticket")
            ? localStorage.getItem("ticket")
            : ""; //判断是否存在ticket，存在则赋值，不存在则将值赋为空
        this.upLoadECFile = new FileUploader({
            url: environment.server + "InvoiceRevise/UploadIRAccessories",
            headers: [{ name: "ticket", value: ticket }]
        });

        //客户查询模型关闭时
        this.customForm.onHide().subscribe(data => {
            if (data) {
                this.tradeTickets.forEach((item, index) => {
                    //if(index==data.index){
                    item.customCode = data.KUNNR;
                    item.customName = data.NAME;
                    item.debtAmount = null;
                    //}
                });
            }
        });

        //合同查询模型关闭时
        this.contractForm.onHide().subscribe(data => {
            if (data) {
                this.tradeTickets.forEach((item, index) => {
                    if (index == data.index) {
                        item.contractNum = data.MainContractCode;
                        item.contractAmount = data.ContractMoney;
                        item.debtAmount = null;
                    }
                });
            }
        });

        //欠款金额查询模型关闭时
        this.debtForm.onHide().subscribe(data => {
            if (data) {
                this.tradeTickets.forEach((item, index) => {
                    if (index == data.index) {
                        item.debtAmount = data.DMSHB;
                        item.voucherAmount = data.DMSHB;
                        item.voucherNum = data.BELNR;
                        item.systicketNum = data.VBELN;
                    }
                });
            }
        });
    }

    public initData(data: any): void {
        this.invoiceApplyService.getLoginUser().then(res => {
            this.department =
                res.baseDepartment == null
                    ? "云服务事业部"
                    : res.baseDepartment.bbmc; //所属本部
            if (data == "-1") {
                let plantformCode =
                    res.sysUsers.flatCode.length === 1
                        ? "0" + res.sysUsers.flatCode
                        : res.sysUsers.flatCode;
                let aperson = {
                    userID: res.sysUsers.itcode,
                    userEN: res.sysUsers.itcode,
                    userCN: res.sysUsers.userName
                };
                this.person.push(aperson);
                this.tradeTicketInfo.applyItcode = res.sysUsers.itcode; //申请人itcode
                this.tradeTicketInfo.applyUsername = res.sysUsers.userName; //申请人姓名
                this.tradeTicketInfo.applyPhone = res.mobile; //申请人电话
                this.tradeTicketInfo.platformCode = plantformCode; //平台code
                this.tradeTicketInfo.platformName =
                    res.sysUsers.flatName == "总部"
                        ? "北京"
                        : res.sysUsers.flatName; //平台名称
                this.tradeTicketInfo.applyDeptcode = res.sysUsers.deptNO;
                this.tradeTicketInfo.applyDeptname = res.sysUsers.deptName;
                this.tradeTicketInfo.businessScope = res.sysUsers.ywfwdm; //业务范围代码
                this.getApprovals(plantformCode);
            } else {
                let aperson = {
                    userID: data.applyItcode,
                    userEN: data.applyItcode,
                    userCN: data.applyUsername
                };
                this.person.push(aperson);
                this.tradeTicketInfo = data;
                this.getApprovals(data.platformCode);
            }
        });
    }
    getApprovals(plantformCode) {
        this.invoiceApplyService
            .getApprovals(plantformCode, "ChequeBusinessPost")
            .then(res => {
                let users = res.item.persons;
                if (users) {
                    this.bassinApproveList = [];
                    for (let user of users) {
                        let tperson = {
                            userEN: user.itcode,
                            userID: user.itcode.toLocaleLowerCase(),
                            userCN: user.name
                        };
                        this.bassinApproveList.push(tperson);
                    }
                }
            });
        this.invoiceApplyService
            .getApprovals(plantformCode, "ChequeFinanceApprove")
            .then(res => {
                let users = res.item.persons;
                if (users) {
                    this.finaceApproveList = [];
                    for (let user of users) {
                        let tperson = {
                            userEN: user.itcode,
                            userID: user.itcode.toLocaleLowerCase(),
                            userCN: user.name
                        };
                        this.finaceApproveList.push(tperson);
                    }
                }
            });
    }
    changePerson(info?) {
        if (info) {
            this.tradeTicketInfo.applyItcode = info[0]["userEN"];
            this.tradeTicketInfo.applyUsername = info[0]["userCN"];
            this.tradeTicketInfo.applyPhone = info[0]["mobile"];
            this.invoiceApplyService
                .getUserByItcode(info[0]["userEN"])
                .subscribe(data => {
                    this.tradeTicketInfo.platformCode = data.item.flatCode; //申请人平台
                    this.tradeTicketInfo.platformName = data.item.flatName; //平台名称
                    this.tradeTicketInfo.applyDeptcode = data.item.deptNO; //部门名称
                    this.tradeTicketInfo.applyDeptname = data.item.deptName; //部门名称
                    this.tradeTicketInfo.businessScope = data.item.ywfwdm; //业务范围代码
                    this.getApprovals(data.item.flatCode);
                });
        }
    }
    /*新增一行 */
    addTr() {
        let invoice: TradeTicketInfo = new TradeTicketInfo();
        this.tradeTickets.push(invoice);
    }

    checkNumber(theObj) {
        let reg = /^\d+(?:\.\d{1,2})?$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    }

    isDigital(invoiceNum) {
        let reg = /^\d{8}$/;
        if (reg.test(invoiceNum)) {
            return true;
        }
        return false;
    }
    /**
     * 查询客户信息
     */
    toQueryCustom(index) {
        this.customForm.show(index);
    }

    /**
     * 查询合同编号
     */
    toQueryContract(index) {
        this.contractForm.show(index + "|" + this.department);
    }

    /**
     * 查询欠款金额
     */
    toQueryDebt(index, tradeTicketInfo: TradeTicketInfo) {
        if (
            tradeTicketInfo.customCode == "" ||
            tradeTicketInfo.customCode == undefined
        ) {
            this.windowService.alert({ message: "请先选择客户", type: "warn" });
            return;
        }
        if (
            this.tradeTicketInfo.payee == "" ||
            this.tradeTicketInfo.payee == undefined
        ) {
            this.windowService.alert({
                message: "请先选择欠款公司代码",
                type: "warn"
            });
            return;
        }
        if (
            tradeTicketInfo.contractNum == "" ||
            tradeTicketInfo.contractNum == undefined
        ) {
            this.windowService.alert({
                message: "请先选择合同编号",
                type: "warn"
            });
            return;
        }
        let date = {
            index: index,
            customCode: tradeTicketInfo.customCode,
            customName: tradeTicketInfo.customName,
            payee: this.tradeTicketInfo.payee,
            payeeName: this.tradeTicketInfo.payeeName,
            contractNum: tradeTicketInfo.contractNum,
            department: this.department
        };
        this.debtForm.show(date);
    }

    /**
     * 删除一行
     * @param index 行序号
     */
    deleteInvoice(index): void {
        this.tradeTickets.splice(index, 1);
    }

    /**
     * 提交申请，保存到数据库
     */
    creatInvoice(event): void {
        this.tradeTickets.forEach(tradeticket => {
            tradeticket.tradeNumber = this.tradeTicketInfo.tradeNumber;
            tradeticket.bankName = this.tradeTicketInfo.bankName;
            tradeticket.tradeStatus = 0;
        });
        //检查必填项
        if (this.tradeTicketInfo.tradeNumber === undefined) {
            this.windowService.alert({ message: "商票号为必填", type: "warn" });
            return;
        }
        if (!this.isDigital(this.tradeTicketInfo.tradeNumber)) {
            this.windowService.alert({
                message: "商票号必须为8位数字",
                type: "warn"
            });
        }
        if (this.tradeTicketInfo.tradeAmount === undefined) {
            this.windowService.alert({
                message: "商票金额为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.checkoutDate === undefined) {
            this.windowService.alert({
                message: "到期日期为必填",
                type: "warn"
            });
            return;
        }
        if (!this.checkTheDate(this.tradeTicketInfo.checkoutDate)) {
            this.windowService.alert({
                message: "到期日期不得小于9天前",
                type: "fail"
            });
            return;
        }
        if (this.tradeTicketInfo.bankName === undefined) {
            this.windowService.alert({
                message: "开户银行为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.bankNumber === undefined) {
            this.windowService.alert({
                message: "银行账号为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.accType === undefined) {
            this.windowService.alert({
                message: "请选择记账方式",
                type: "warn"
            });
            return;
        }
        if (this.tradeTickets == [] || this.tradeTickets.length == 0) {
            this.windowService.alert({
                message: "请添加商票信息",
                type: "warn"
            });
            return;
        }
        if (this.attachList.length < 1) {
            this.windowService.alert({ message: "请上传附件！", type: "fail" });
            return;
        }

        //检查申请列表
        this.tradeTickets.forEach((inv, k) => {
            if (inv.customCode === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户代码空",
                    type: "warn"
                });
                return;
            }
            if (inv.customName === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户名称空",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.debtAmount != undefined &&
                !this.checkNumber(inv.debtAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行欠款金额必须为数字，可保留两位小数",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.voucherAmount === undefined
            ) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "核销金额为空",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.voucherAmount != undefined &&
                !this.checkNumber(inv.voucherAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行核销金额必须为数字，可保留两位小数",
                    type: "warn"
                });
                return;
            }
            this.totalvoucherAmount += inv.voucherAmount;
        });
        if (
            this.tradeTicketInfo.accType == "1" &&
            this.totalvoucherAmount > this.tradeTicketInfo.tradeAmount
        ) {
            this.windowService.alert({
                message: "核销总金额必须小于商票金额",
                type: "warn"
            });
            return;
        }
        var data = {
            tradeTicketInfoList: this.tradeTickets,
            tradeTicket: this.tradeTicketInfo,
            attachList: this.attachList
        };
        // this.windowService.confirm({ message: "确定提交？" }).subscribe(r => {
        //     if (r) {
        this.submitFlag = false;
        this.tradeTicketService.create(data).then(res => {
            if (res.success) {
                this.windowService.alert({
                    message: "提交成功",
                    type: "success"
                });
                setTimeout(function() {
                    if (
                        window.opener.document.getElementById(
                            "tradeTicketQuery"
                        ) != null
                    ) {
                        window.opener.document
                            .getElementById("tradeTicketQuery")
                            .click();
                    }
                    window.close();
                }, 1000);
            } else {
                this.submitFlag = true;
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
            }
        });
        //     }
        // });
    }
    /**
     * 重新提交申请，保存到数据库
     */
    reCreatInvoice(): void {
        this.tradeTicketInfo.tradeStatus = 0;
        this.tradeTickets.forEach(tradeticket => {
            tradeticket.tradeNumber = this.tradeTicketInfo.tradeNumber;
            tradeticket.bankName = this.tradeTicketInfo.bankName;
            tradeticket.tradeStatus = 0;
        });

        //检查必填项
        if (this.tradeTicketInfo.tradeNumber === undefined) {
            this.windowService.alert({ message: "商票号为必填", type: "warn" });
            return;
        }
        if (!this.isDigital(this.tradeTicketInfo.tradeNumber)) {
            this.windowService.alert({
                message: "商票号必须为8位数字",
                type: "warn"
            });
        }
        if (this.tradeTicketInfo.tradeAmount === undefined) {
            this.windowService.alert({
                message: "商票金额为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.checkoutDate === undefined) {
            this.windowService.alert({
                message: "到期日期为必填",
                type: "warn"
            });
            return;
        }
        if (!this.checkTheDate(this.tradeTicketInfo.checkoutDate)) {
            this.windowService.alert({
                message: "到期日期不得小于9天前",
                type: "fail"
            });
            return;
        }
        if (this.tradeTicketInfo.bankName === undefined) {
            this.windowService.alert({
                message: "开户银行为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.bankNumber === undefined) {
            this.windowService.alert({
                message: "银行账号为必填",
                type: "warn"
            });
            return;
        }
        if (this.tradeTicketInfo.accType === undefined) {
            this.windowService.alert({
                message: "请选择记账方式",
                type: "warn"
            });
            return;
        }
        if (this.tradeTickets == [] || this.tradeTickets.length == 0) {
            this.windowService.alert({
                message: "请添加商票信息",
                type: "warn"
            });
            return;
        }
        if (this.attachList.length < 1) {
            this.windowService.alert({ message: "请上传附件！", type: "fail" });
            return;
        }

        //检查申请列表
        this.tradeTickets.forEach((inv, k) => {
            if (inv.customCode === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户代码空",
                    type: "warn"
                });
                return;
            }
            if (inv.customName === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户名称空",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.debtAmount != undefined &&
                !this.checkNumber(inv.debtAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行欠款金额必须为数字，可保留两位小数",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.voucherAmount === undefined
            ) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "核销金额为空",
                    type: "warn"
                });
                return;
            }
            if (
                this.tradeTicketInfo.accType == "1" &&
                inv.voucherAmount != undefined &&
                !this.checkNumber(inv.voucherAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行核销金额必须为数字，可保留两位小数",
                    type: "warn"
                });
                return;
            }
            this.totalvoucherAmount += inv.voucherAmount;
        });
        if (
            this.tradeTicketInfo.accType == "1" &&
            this.totalvoucherAmount > this.tradeTicketInfo.tradeAmount
        ) {
            this.windowService.alert({
                message: "核销总金额必须小于商票金额",
                type: "warn"
            });
            return;
        }
        var data = {
            tradeTicketInfoList: this.tradeTickets,
            tradeTicket: this.tradeTicketInfo,
            attachList: this.attachList
        };
        // this.windowService.confirm({message:'确定提交？'}).subscribe(r =>{
        //     if(r){
        this.submitFlag = false;
        this.tradeTicketService.reCreate(data).then(res => {
            if (res.success) {
                this.windowService.alert({
                    message: "提交成功",
                    type: "success"
                });
                setTimeout(function() {
                    try {
                        window.opener.document
                            .getElementById("tradeTicketQuery")
                            .click();
                    } catch (error) {}
                    window.close();
                }, 1000);
            } else {
                this.submitFlag = true;
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
            }
        });
        //     }
        // })
    }

    //检查出票日期不得小于当前日期日9天
    checkTheDate(checkDate): boolean {
        let day = new Date();
        let checkoutDate = new Date(checkDate);
        if (day.getTime() - checkoutDate.getTime() > 9 * 24 * 60 * 60 * 1000) {
            return false;
        } else {
            return true;
        }
    }
    //上传附件
    onUploadFiles(uploader: FileUploader) {
        if (uploader.queue.length) {
            if (
                uploader.queue[uploader.queue.length - 1]._file["size"] <
                52428800
            ) {
                uploader.queue.map(function(item) {
                    item.withCredentials = false;
                });
                uploader.uploadAll();
            } else {
                this.message = "文件上传不能大于50M";
            }
        }
        uploader.onCompleteItem = (
            item: FileItem,
            response: string,
            status: number,
            headers: ParsedResponseHeaders
        ) => {
            let data = JSON.parse(response);
            if (status === 200 && data.Result) {
                let access = JSON.parse(data.Data);
                this.attachList.push(
                    new TradeTicketAttachment(
                        access[0].AccessoryID,
                        access[0].AccessoryName,
                        APIAddress + access[0].AccessoryURL
                    )
                );
                this.message = "上传成功";
            } else {
                this.message = "上传失败";
            }
        };
    }

    //删除附件
    onRemoveFile(item) {
        this.removeByValue(this.attachList, item);
    }
    //删除数组元素
    removeByValue(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    }
    //获取平台code和名称
    getPlatForms(event): void {
        let platform = event.target.value;
        this.tradeTicketInfo.platformCode = platform.split("|")[0];
        this.tradeTicketInfo.platformName = platform.split("|")[1];
        this.getApprovals(platform.split("|")[0]);
    }

    //获取欠款公司名称
    getPayee(event): void {
        let payee = event.target.value;
        this.tradeTicketInfo.payee = payee.split("|")[0];
        this.tradeTicketInfo.payeeName = payee.split("|")[1];
        this.tradeTickets.forEach(element => {
            element.debtAmount = null;
        });
    }

    getPayeeList() {
        this.tradeTicketService.getPayee().then(data => {
            this.peyeeList = JSON.parse(data.Data);
        });
    }

    //获取可用平台列表
    getStorageList() {
        this.invoiceApplyService.getPlatforms().then(data => {
            this.platforms = data.list;
        });
    }

    //获取可用业务范围代码列表
    initYWFWDM() {
        this.tradeTicketService.getYWFWDM().then(data => {
            this.YWFWDMList = JSON.parse(data.Data);
        });
    }
    close() {
        window.close();
    }
}
