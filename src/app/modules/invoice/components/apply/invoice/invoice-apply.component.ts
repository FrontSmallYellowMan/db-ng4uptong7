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
import { InvoiceInfo } from "./invoice-info";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import { WindowService } from "../../../../../core/index";
import { XcModalService, XcModalRef } from "../../../../../shared/index";
import { PayeeQueryComponent } from "./payeequery/payee-query.component";
import { CustomQueryComponent } from "./customquery/custom-query.component";
import { ContractQueryComponent } from "./contractquery/contract-query.component";
import { DebtQueryComponent } from "./debtquery/debt-query.component";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
declare var window;

@Component({
    templateUrl: "./invoice-apply.component.html",
    styleUrls: ["./invoice-apply.component.scss"]
})
export class InvoiceApplyComponent implements OnInit {
    //登录人信息
    invoiceInfo: InvoiceInfo = new InvoiceInfo();
    //支票列表
    invoices = new Array<InvoiceInfo>();
    bassinApproveList = new Array(); //商务审批
    finaceApproveList = new Array(); //财务审批
    //平台下拉框
    platforms = new Array();
    submitFlag: boolean = true;
    department: string;
    payeeForm: XcModalRef;
    customForm: XcModalRef;
    contractForm: XcModalRef;
    debtForm: XcModalRef;
    addFlag: boolean = false;
    constructor(
        private invoiceApplyService: InvoiceApplyService,
        private invoiceApproveService: InvoiceApproveService,
        private windowService: WindowService,
        private activatedRouter: ActivatedRoute,
        private xcModalService: XcModalService
    ) {}
    name = "支票申请";
    person = [];
    ngOnInit(): void {
        this.activatedRouter.params.subscribe((params: Params) => {
            let id = params["id"];
            //草稿重新申请
            if (id != "-1") {
                this.invoiceApproveService.getInvoiceById(id).then(res => {
                    this.invoices.push(res.item[0]);
                    this.initData(res.item[0]);
                });
            } else {
                this.addFlag = true;
                this.initData("-1");
            }
        });

        this.getStorageList();
        //收款人
        this.payeeForm = this.xcModalService.createModal(PayeeQueryComponent);
        //客户
        this.customForm = this.xcModalService.createModal(CustomQueryComponent);
        //合同
        this.contractForm = this.xcModalService.createModal(
            ContractQueryComponent
        );
        //合同
        this.debtForm = this.xcModalService.createModal(DebtQueryComponent);

        //模型关闭的时候 如果有改动，请求刷新
        this.payeeForm.onHide().subscribe(data => {
            if (data) {
                this.invoices.forEach((item, index) => {
                    if (index == data.index) {
                        item.payee = data.companycode;
                        item.payeeName = data.company;
                        item.debtAmount = null;
                    }
                });
            }
        });

        //客户查询模型关闭时
        this.customForm.onHide().subscribe(data => {
            if (data) {
                this.invoices.forEach((item, index) => {
                    if (index == data.index) {
                        item.customCode = data.KUNNR;
                        item.customName = data.NAME;
                        item.debtAmount = null;
                    }
                });
            }
        });

        //合同查询模型关闭时
        this.contractForm.onHide().subscribe(data => {
            if (data) {
                this.invoices.forEach((item, index) => {
                    if (index == data.index) {
                        item.contractNum = data.MainContractCode;
                        item.debtAmount = null;
                    }
                });
            }
        });

        //欠款金额模型关闭时
        this.debtForm.onHide().subscribe(data => {
            if (data) {
                this.invoices.forEach((item, index) => {
                    if (index == data.index) {
                        item.debtAmount = parseFloat(data.DMSHB);
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
                    userID: res.sysUsers.userNo,
                    userEN: res.sysUsers.itcode,
                    userCN: res.sysUsers.userName
                };
                this.person.push(aperson);
                this.invoiceInfo.applyItcode = res.sysUsers.itcode; //申请人itcode
                this.invoiceInfo.applyUserName = res.sysUsers.userName; //申请人姓==
                this.invoiceInfo.applyPhone = res.mobile; //申请人电话
                this.invoiceInfo.platformCode = plantformCode; //平台code
                this.invoiceInfo.platformName =
                    res.sysUsers.flatName == "总部"
                        ? "北京"
                        : res.sysUsers.flatName; //平台名称
                this.invoiceInfo.isPawnTicket = "0"; //是否押票
                this.getApprovals(plantformCode);
            } else {
                let aperson = {
                    userID: data.applyItcode,
                    userEN: data.applyItcode,
                    userCN: data.applyUserName
                };
                this.person.push(aperson);
                this.invoiceInfo.applyItcode = data.applyItcode; //申请人itcode
                this.invoiceInfo.applyUserName = data.applyUserName; //申请人姓==
                this.invoiceInfo.applyPhone = data.applyPhone; //申请人电话
                this.invoiceInfo.platformCode = data.platformCode; //平台code
                this.invoiceInfo.platformName = data.platformName; //平台名称
                this.invoiceInfo.isPawnTicket = data.isPawnTicket; //是否押票
                this.invoiceInfo.id = data.id;
                this.getApprovals(data.platformCode);
            }
        });
    }

    changePerson(info?) {
        if (info) {
            this.invoiceInfo.applyItcode = info[0]["userEN"];
            this.invoiceInfo.applyUserName = info[0]["userCN"];
            this.invoiceInfo.applyPhone = info[0]["mobile"];
            this.invoiceApplyService
                .getUserByItcode(info[0]["userEN"])
                .subscribe(data => {
                    this.invoiceInfo.platformCode = data.item.flatCode; //申请人平台
                    this.invoiceInfo.platformName = data.item.flatName; //平台名称
                    this.getApprovals(data.item.flatCode);
                });
        }
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
    /*新增一行 */
    addTr() {
        let invoice: InvoiceInfo = new InvoiceInfo();
        this.invoices.push(invoice);
    }

    isDigital(invoiceNum) {
        let reg = /^\d{8}$/;
        if (reg.test(invoiceNum)) {
            return true;
        }
        return false;
    }

    checkNumber(theObj) {
        let reg = /^\d+(?:\.\d{1,2})?$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    }
    /**
     * 查询收款人公司信息
     */
    toQueryPayee(index) {
        this.payeeForm.show(index);
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
    toQueryDebt(index, invoiceInfo: InvoiceInfo) {
        if (
            invoiceInfo.customCode == "" ||
            invoiceInfo.customCode == undefined
        ) {
            this.windowService.alert({ message: "请先选择客户", type: "warn" });
            return;
        }
        if (invoiceInfo.payee == "" || invoiceInfo.payee == undefined) {
            this.windowService.alert({
                message: "请先选择收款人",
                type: "warn"
            });
            return;
        }
        //  if(invoiceInfo.contractNum=="" || invoiceInfo.contractNum== undefined){
        //     this.windowService.alert({ message: "请先选择合同编号", type: 'warn' });
        //     return;
        // }
        let date = {
            index: index,
            customCode: invoiceInfo.customCode,
            customName: invoiceInfo.customName,
            payee: invoiceInfo.payee,
            payeeName: invoiceInfo.payeeName,
            contractNum: invoiceInfo.contractNum,
            department: this.department
        };
        this.debtForm.show(date);
    }

    /**
     * 删除一行
     * @param index 行序号
     */
    deleteInvoice(index): void {
        this.invoices.splice(index, 1);
    }

    /**
     * 提交申请，保存到数据库
     */
    creatInvoice(): void {
        if (this.invoices == [] || this.invoices.length == 0) {
            this.windowService.alert({
                message: "请添加支票信息",
                type: "warn"
            });
            return;
        }
        //检查必填项
        if (this.invoiceInfo.platformCode === undefined) {
            this.windowService.alert({
                message: "接收平台为必填",
                type: "warn"
            });
            return;
        }

        //检查申请列表是否都保存
        this.invoices.forEach((inv, k) => {
            if (inv.ticketNum === undefined) {
                //必填验证
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票号不能为空",
                    type: "warn"
                });
            } else if (!this.isDigital(inv.ticketNum)) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票号必须为8位数字",
                    type: "warn"
                });
            } else if (inv.checkoutDate === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票日期不能为空",
                    type: "warn"
                });
            } else if (inv.ticketAmount === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票金额不能为空",
                    type: "warn"
                });
            } else if (!this.checkNumber(inv.ticketAmount)) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行支票金额必须为数字，可保留两位小数",
                    type: "warn"
                });
            } else if (inv.ticketAmount == 0) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票金额不能为0",
                    type: "warn"
                });
            } else if (inv.checkoutAccount === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票人账号不能为空",
                    type: "warn"
                });
            } else if (inv.checkoutBank === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票人银行不能为空",
                    type: "warn"
                });
            } else if (inv.payee === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行收款人不能为空",
                    type: "warn"
                });
            } else if (inv.customCode === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户代码不能为空",
                    type: "warn"
                });
            } else if (inv.customName === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户名称不能为空",
                    type: "warn"
                });
                // }else if(inv.contractNum===undefined){
                //     this.windowService.alert({ message: "第"+(k+1)+"行合同编号不能为空", type: 'warn' });
                //
            } else if (
                inv.debtAmount != undefined &&
                !this.checkNumber(inv.debtAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行欠款金额必须为数字，可保留两位小数",
                    type: "warn"
                });
            } else if (!this.checkTheDate(inv.checkoutDate)) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票日期不能小于9天前",
                    type: "warn"
                });
            }
            return false;
        });

        //支票基本信息循环到支票列表里
        this.invoices.forEach(invoice => {
            invoice.applyItcode = this.invoiceInfo.applyItcode.toLocaleLowerCase(); //申请人itcode
            invoice.applyUserName = this.invoiceInfo.applyUserName; //申请人姓==
            invoice.applyPhone = this.invoiceInfo.applyPhone; //申请人电话
            invoice.platformCode = this.invoiceInfo.platformCode; //平台code
            invoice.platformName = this.invoiceInfo.platformName; //平台名称
            invoice.isPawnTicket = this.invoiceInfo.isPawnTicket; //是否押票
        });
        // this.windowService.confirm({ message: "确定提交？" }).subscribe(r => {
        //     if (r) {
        this.submitFlag = false;
        this.invoiceApplyService.create(this.invoices).then(res => {
            if (res.success) {
                this.windowService.alert({
                    message: "提交成功",
                    type: "success"
                });
                setTimeout(function() {
                    window.opener.document
                        .getElementById("invoiceQuery")
                        .click();
                    window.close();
                }, 2000);
            } else {
                this.submitFlag = true;
                this.windowService.alert({
                    message: res.message,
                    type: "fail"
                });
            }
        });
        // }
        // });
    }

    //重新提交支票
    reCreatInvoice(): void {
        if (this.invoices == [] || this.invoices.length == 0) {
            this.windowService.alert({
                message: "请添加支票信息",
                type: "warn"
            });
            return;
        }
        //检查必填项
        if (this.invoiceInfo.platformCode === undefined) {
            this.windowService.alert({
                message: "接收平台为必填",
                type: "warn"
            });
            return;
        }

        //检查申请列表是否都保存
        this.invoices.forEach((inv, k) => {
            if (inv.ticketNum === undefined) {
                //必填验证
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票号空",
                    type: "warn"
                });
            } else if (!this.isDigital(inv.ticketNum)) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票号必须为8位数字",
                    type: "warn"
                });
            } else if (inv.checkoutDate === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票日期空",
                    type: "warn"
                });
            } else if (inv.ticketAmount === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行支票金额空",
                    type: "warn"
                });
            } else if (!this.checkNumber(inv.ticketAmount)) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行支票金额必须为数字，可保留两位小数",
                    type: "warn"
                });
            } else if (inv.checkoutAccount === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票人账号空",
                    type: "warn"
                });
            } else if (inv.checkoutBank === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行出票人银行空",
                    type: "warn"
                });
            } else if (inv.payee === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行收款人空",
                    type: "warn"
                });
            } else if (inv.customCode === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户代码空",
                    type: "warn"
                });
            } else if (inv.customName === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行客户名称空",
                    type: "warn"
                });
            } else if (inv.contractNum === undefined) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "行合同编号空",
                    type: "warn"
                });
            } else if (
                inv.debtAmount != undefined &&
                !this.checkNumber(inv.debtAmount)
            ) {
                this.windowService.alert({
                    message:
                        "第" + (k + 1) + "行欠款金额必须为数字，可保留两位小数",
                    type: "warn"
                });
            } else if (!this.checkTheDate(inv.checkoutDate)) {
                this.windowService.alert({
                    message: "第" + (k + 1) + "出票日期不得小于9天之前",
                    type: "warn"
                });
            }
            return false;
        });

        //支票基本信息循环到支票列表里
        let invoiceStatus = 0;
        if (this.invoiceInfo.platformCode == "21") {
            invoiceStatus = 0;
        } else {
            invoiceStatus = 2;
        }
        this.invoices.forEach(invoice => {
            invoice.applyItcode = this.invoiceInfo.applyItcode.toLocaleLowerCase(); //申请人itcode
            invoice.applyUserName = this.invoiceInfo.applyUserName; //申请人姓==
            invoice.applyPhone = this.invoiceInfo.applyPhone; //申请人电话
            invoice.platformCode = this.invoiceInfo.platformCode; //平台code
            invoice.platformName = this.invoiceInfo.platformName; //平台名称
            invoice.isPawnTicket = this.invoiceInfo.isPawnTicket; //是否押票
            invoice.invoiceStatus = invoiceStatus;
        });
        // this.windowService.confirm({ message: "确定提交？" }).subscribe(r => {
        //     if (r) {
        this.submitFlag = false;
        this.invoiceApproveService
            .reapplyInvoice(this.invoices[0])
            .then(res => {
                if (res.success) {
                    this.windowService.alert({
                        message: "提交成功",
                        type: "success"
                    });
                    setTimeout(function() {
                        if (
                            window.opener.document.getElementById(
                                "invoiceQuery"
                            ) != null
                        ) {
                            window.opener.document
                                .getElementById("invoiceQuery")
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

    //获取平台code和名称
    getPlatForms(event): void {
        let platform = event.target.value;
        this.invoiceInfo.platformCode = platform.split("|")[0];
        this.invoiceInfo.platformName = platform.split("|")[1];
        this.getApprovals(platform.split("|")[0]);
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

    //获取可用平台列表
    getStorageList() {
        this.invoiceApplyService.getPlatforms().then(data => {
            this.platforms = data.list;
        });
    }
    //关闭
    close() {
        window.close();
    }
}
