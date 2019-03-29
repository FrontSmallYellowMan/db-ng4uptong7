import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { Location } from "@angular/common";
import { WindowService } from "app/core";
import { XcModalService, XcModalRef } from "app/shared/index";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { InvoiceInfo } from "../../../apply/invoice/invoice-info";
import { InvoiceApproveService } from "../../../../services/invoice/invoice-approve.service";
import { PayeeQueryComponent } from "../../../apply/invoice/payeequery/payee-query.component";
import { CustomQueryComponent } from "../../../apply/invoice/customquery/custom-query.component";
import { ContractQueryComponent } from "../../../apply/invoice/contractquery/contract-query.component";
import { DebtQueryComponent } from "../../../apply/invoice/debtquery/debt-query.component";
import { InvoiceApplyService } from "../../../../services/invoice/invoice-apply.service";
declare var window;

@Component({
    templateUrl: "./invoice-approve-edit.component.html",
    styleUrls: ["./invoice-approve-edit.component.scss"]
})
export class InvoiceApproveEditComponent implements OnInit {
    payeeForm: XcModalRef;
    customForm: XcModalRef;
    contractForm: XcModalRef;
    debtForm: XcModalRef;
    department: string = "";
    title: string;
    invoiceInfo: InvoiceInfo = new InvoiceInfo();
    invoiceId: string;
    //平台下拉框
    platforms = new Array();
    subimtFlag: boolean = true;
    public dataPerson: any;
    bassinApproveList = new Array(); //商务审批
    finaceApproveList = new Array(); //财务审批
    person = [];
    constructor(
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private invoiceApplyService: InvoiceApplyService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private invoiceApproveService: InvoiceApproveService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.invoiceId = params["id"];
            this.invoiceApproveService
                .getInvoiceById(this.invoiceId)
                .then(data => {
                    this.invoiceInfo = data.item[0];
                    this.getApprovals(data.item[0].platformCode);
                    let aperson = {
                        userID: data.item[0].applyItcode,
                        userEN: data.item[0].applyItcode.toLocaleLowerCase(),
                        userCN: data.item[0].applyUsername
                    };
                    this.person.push(aperson);
                });
        });
        this.initData();
        this.getStorageList();
        //收款人
        this.payeeForm = this.xcModalService.createModal(PayeeQueryComponent);
        //客户
        this.customForm = this.xcModalService.createModal(CustomQueryComponent);
        //合同
        this.contractForm = this.xcModalService.createModal(
            ContractQueryComponent
        );
        //欠款金额
        this.debtForm = this.xcModalService.createModal(DebtQueryComponent);

        //模型关闭的时候 如果有改动，请求刷新
        this.payeeForm.onHide().subscribe(data => {
            if (data) {
                this.invoiceInfo.payee = data.companycode;
                this.invoiceInfo.payeeName = data.company;
                this.invoiceInfo.debtAmount = null;
            }
        });
        //客户查询模型关闭时
        this.customForm.onHide().subscribe(data => {
            if (data) {
                this.invoiceInfo.customCode = data.KUNNR;
                this.invoiceInfo.customName = data.NAME;
                this.invoiceInfo.debtAmount = null;
            }
        });

        //合同查询模型关闭时
        this.contractForm.onHide().subscribe(data => {
            if (data) {
                this.invoiceInfo.contractNum = data.MainContractCode;
                this.invoiceInfo.debtAmount = null;
            }
        });

        //欠款金额模型关闭时
        this.debtForm.onHide().subscribe(data => {
            if (data) {
                this.invoiceInfo.debtAmount = parseFloat(data.DMSHB);
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
    //获取平台code和名称
    getPlatForms(event): void {
        let platform = event.target.value;
        this.invoiceInfo.platformCode = platform.split("|")[0];
        this.invoiceInfo.platformName = platform.split("|")[1];
        this.getApprovals(platform.split("|")[0]);
    }
    /**
     * 查询收款人公司信息
     */
    toQueryPayee() {
        this.payeeForm.show(0);
    }
    /**
     * 查询客户信息
     */
    toQueryCustom() {
        this.customForm.show(0);
    }

    /**
     * 查询合同编号
     */
    toQueryContract() {
        this.contractForm.show(0 + "|" + this.department);
    }

    /**
     * 查询欠款金额
     */
    toQueryDebt(invoiceInfo: InvoiceInfo) {
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
        if (
            invoiceInfo.contractNum == "" ||
            invoiceInfo.contractNum == undefined
        ) {
            this.windowService.alert({
                message: "请先选择合同编号",
                type: "warn"
            });
            return;
        }
        let date = {
            index: 0,
            customCode: invoiceInfo.customCode,
            customName: invoiceInfo.customName,
            payee: invoiceInfo.payee,
            payeeName: invoiceInfo.payeeName,
            contractNum: invoiceInfo.contractNum,
            department: this.department
        };
        this.debtForm.show(date);
    }
    public initData(): void {
        this.invoiceApplyService.getLoginUser().then(res => {
            this.department =
                res.baseDepartment == null
                    ? "云服务事业部"
                    : res.baseDepartment.bbmc; //所属本部
        });
    }
    //更新数据
    updateInvoice() {
        if (this.invoiceInfo.ticketNum === undefined) {
            //必填验证
            this.windowService.alert({
                message: "支票号不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.checkoutDate === undefined) {
            this.windowService.alert({
                message: "出票日期不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.ticketAmount === undefined) {
            this.windowService.alert({
                message: "支票金额不能为空",
                type: "warn"
            });
        } else if (!this.checkNumber(this.invoiceInfo.ticketAmount)) {
            this.windowService.alert({
                message: "支票金额必须为数字，可保留两位小数",
                type: "warn"
            });
        } else if (this.invoiceInfo.ticketAmount == 0) {
            this.windowService.alert({
                message: "支票金额不能为0",
                type: "warn"
            });
        } else if (this.invoiceInfo.checkoutAccount === undefined) {
            this.windowService.alert({
                message: "出票人账号不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.checkoutBank === undefined) {
            this.windowService.alert({
                message: "出票人银行不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.payee === undefined) {
            this.windowService.alert({
                message: "收款人不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.customCode === undefined) {
            this.windowService.alert({
                message: "客户代码不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.customName === undefined) {
            this.windowService.alert({
                message: "客户名称不能为空",
                type: "warn"
            });
        } else if (this.invoiceInfo.contractNum === undefined) {
            this.windowService.alert({
                message: "合同编号不能为空",
                type: "warn"
            });
        } else if (
            this.invoiceInfo.debtAmount != undefined &&
            !this.checkNumber(this.invoiceInfo.debtAmount)
        ) {
            this.windowService.alert({
                message: "欠款金额必须为数字，可保留两位小数",
                type: "warn"
            });
        } else if (!this.checkTheDate(this.invoiceInfo.checkoutDate)) {
            this.windowService.alert({
                message: "出票日期不能小于9天前",
                type: "warn"
            });
        } else {
            this.subimtFlag = false;
            this.invoiceApproveService
                .updateInvoice(this.invoiceInfo)
                .then(data => {
                    if (data.success) {
                        this.windowService.alert({
                            message: "保存成功",
                            type: "success"
                        });
                        setTimeout(function() {
                            // window.opener.document.getElementById('getQueryData').click();
                            window.close();
                        }, 1000);
                    } else {
                        this.subimtFlag = true;
                        this.windowService.alert({
                            message: data.message,
                            type: "fail"
                        });
                    }
                });
        }
    }
    //获取可用平台列表
    getStorageList() {
        this.invoiceApplyService.getPlatforms().then(data => {
            this.platforms = data.list;
        });
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
    checkNumber(theObj) {
        let reg = /^\d+(?:\.\d{1,2})?$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    }
    goback() {
        window.close();
    }
}
