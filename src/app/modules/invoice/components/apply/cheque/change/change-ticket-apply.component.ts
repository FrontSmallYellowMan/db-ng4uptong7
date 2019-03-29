import { Component, OnInit } from "@angular/core";
import {
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import { URLSearchParams, Http } from "@angular/http";
import { ActivatedRoute, Params } from "@angular/router";
import { InvoiceChangeService } from "../../../../services/invoice/invoice-change.service";
import { ChangeApplyInfo } from "./change-apply-info";
import { InvoiceCommonListComponent } from "../../../common/invoice-common-list.component";
import { ErrorTipMessageComponent } from "../../../common/error-tip-message.component";
import { WindowService } from "app/core";
import { Person } from "app/shared/services/index";
import { environment_java } from "../../../../../../../environments/environment";
declare var window;
@Component({
    templateUrl: "./change-ticket-apply.component.html",
    styleUrls: ["./change-ticket-apply.component.scss"]
})
export class ChangeTicketApplyComponent implements OnInit {
    name = "换票申请";
    userInfo = new Person(); // 登录人头像
    itcodeAndName: string = ""; //申请人
    itcode: string;
    userName: string;
    phone: string = ""; //联系电话
    dept: string = "";
    deptName: string = ""; //部门
    changeReson: string = "";
    platformCode: string = "";
    fileUploadApi: string; //上传文件接口
    errorMessageList = new Array(); //excel错误信息
    isClick = false; //是否提交
    salePerson = new Array(); //销售人员
    changeId: string = ""; //拒绝后重新发起id
    isReapply = false;
    changeApplyId = "";
    changeApplyDate = "";
    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };
    errorMessageForm: XcModalRef;
    modalAddForm: XcModalRef;
    public changeList = new Array();
    public person = new Array(); //事业部审批人
    showbtn = true;
    riskpersons = new Array<Person>(); //风险审批人
    constructor(
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private changeService: InvoiceChangeService,
        private route: ActivatedRoute,
        private http: Http
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            let x = params["id"];
            if (x) {
                this.changeId = x;
                this.isReapply = true;
                this.changeService.loadChangeInfo(x).subscribe(res => {
                    let change = JSON.parse(res.item[0]);
                    var changes = JSON.parse(res.item[0]);
                    this.changeApplyId = change.changeApplyId;
                    this.changeApplyDate = change.createDate;
                    this.userInfo.userEN = change.applyItCode;
                    this.userInfo.userID = change.applyItCode.toLocaleLowerCase();
                    this.userInfo.userCN = change.applyUserName;
                    this.salePerson.push(this.userInfo);
                    let invoiceChangeList = change.invoiceChangeList;
                    this.phone = change.applyTelephone;
                    this.itcode = change.applyItCode;
                    this.deptName = change.applyDepartment;
                    this.changeReson = change.changeReason;
                    for (let item of invoiceChangeList) {
                        let changeInfo = new ChangeApplyInfo();
                        changeInfo.invoiceApplyId = item.oldApplyId.id;
                        changeInfo.oldTicketNumber = item.oldApplyId.ticketNum;
                        changeInfo.newTicketNumber = item.newTicketNumber;
                        changeInfo.newCheckoutDate = item.newCheckoutDate;
                        changeInfo.newCheckoutAccount = item.newCheckoutAccount;
                        changeInfo.newCheckoutBank = item.newCheckoutBank;
                        changeInfo.newTicketAmount = item.newTicketAmount;
                        changeInfo.ticketAmount = item.oldApplyId.ticketAmount;
                        changeInfo.checkoutDate = item.oldApplyId.checkoutDate;
                        changeInfo.payee = item.oldApplyId.payee;
                        changeInfo.payeeName = item.oldApplyId.payeeName;
                        changeInfo.customCode = change.customCode;
                        changeInfo.customName = change.customName;
                        this.changeList.push(changeInfo);
                    }

                    this.wfData.wfHistoryData = res.item[1]; //流程日志信息
                    // this.wfData.wfprogress = res.item[2];//流程图信息
                    this.platformCode = res.item[4];
                    this.changeService
                        .getApprovals(this.platformCode)
                        .subscribe(data => {
                            let users = data.item.riskpersons;
                            if (users) {
                                for (let user of users) {
                                    let tperson = new Person();
                                    tperson.userEN = user.itcode;
                                    tperson.userID = user.itcode.toLocaleLowerCase();
                                    tperson.userCN = user.name;
                                    this.riskpersons.push(tperson);
                                }
                            }
                        });
                    // 回填事业部审批人
                    this.http
                        .get(
                            environment_java.server +
                                `common/getUserInfo/${changes.approvalIds}`
                        )
                        .map(res => res.json())
                        .subscribe(res => {
                            console.log("revoke", res);
                            var data1 = {
                                userCN: res["item"].name,
                                userEN: res["item"].itcode,
                                userID: res["item"].id
                            };
                            this.person.push(data1);
                        });
                });
            } else {
                this.changeService.getUserData().subscribe(data => {
                    this.itcode = data.item.sysUsers.itcode.toLowerCase();
                    this.userName = data.item.sysUsers.userName;
                    this.itcodeAndName = this.itcode + "/" + this.userName;
                    this.phone = data.item.mobile;
                    this.dept = data.item.sysUsers.deptNO;
                    this.deptName = data.item.sysUsers.deptName;
                    this.platformCode = data.item.sysUsers.flatCode; //登录人平台

                    let saleInfo = {
                        userID: this.itcode,
                        userEN: this.itcode.toLocaleLowerCase(),
                        userCN: this.userName
                    };
                    this.salePerson.push(saleInfo);
                    let users = data.item.riskpersons;
                    if (users) {
                        for (let user of users) {
                            let tperson = new Person();
                            tperson.userEN = user.itcode;
                            tperson.userID = user.itcode.toLocaleLowerCase();
                            tperson.userCN = user.name;
                            this.riskpersons.push(tperson);
                        }
                    }
                });
            }
        });

        this.fileUploadApi = this.changeService.analysisChange();

        this.errorMessageForm = this.xcModalService.createModal(
            ErrorTipMessageComponent
        );
        this.modalAddForm = this.xcModalService.createModal(
            InvoiceCommonListComponent
        );
        //模型关闭的时候 如果有改动，请求刷新
        this.modalAddForm.onHide().subscribe(data => {
            this.changeList = this.changeList.filter(
                item => item.invoiceApplyId !== "-1"
            );
            if (data) {
                data.forEach(item => {
                    let changeInfo = new ChangeApplyInfo();
                    changeInfo.invoiceApplyId = item.id;
                    changeInfo.oldTicketNumber = item.ticketNum;
                    changeInfo.ticketAmount = item.ticketAmount;
                    changeInfo.checkoutDate = item.checkoutDate;
                    changeInfo.payee = item.payee;
                    changeInfo.payeeName = item.payeeName;
                    changeInfo.customCode = item.customCode;
                    changeInfo.customName = item.customName;
                    this.changeList.push(changeInfo);
                });
            }
        });
    }
    //下载换票模板
    loadChange(): void {
        window.location.href = this.changeService.loadChangeTpl();
    }

    //删除列信息
    deltr(index): void {
        this.windowService.confirm({ message: "确定删除？" }).subscribe({
            next: v => {
                if (v) {
                    this.changeList.splice(index, 1);
                }
            }
        });
    }
    //查询当前用户的支票列表信息 商务已接收状态
    searchInvoice(): void {
        var ids: string = "-1";
        let status: string = "1,3"; //默认商务已接收、财务已接收
        if (this.platformCode === "21") {
            //总部、北京平台
            status = "1"; //商务已接收
        }
        let data = {
            applyids: ids,
            status: status,
            typeval: "HP",
            sqruserItcode: this.itcode
        };
        this.modalAddForm.show(data);
    }

    save(): void {
        if (this.itcode === "") {
            this.windowService.alert({
                message: "请选择申请人！",
                type: "fail"
            });
            return;
        }
        if (this.phone === "") {
            this.windowService.alert({
                message: "联系电话不能为空！",
                type: "fail"
            });
            return;
        }

        if (this.changeReson === "") {
            this.windowService.alert({
                message: "请填写换票原因！",
                type: "fail"
            });
            return;
        }
        if (!this.validCustom()) {
            //非同一客户
            this.windowService.alert({
                message: "非同一个客户不能提交！",
                type: "fail"
            });
            return;
        }
        let isvalid = false; //必填写不为空
        let checkNewTicketlen = false; //验证新支票号长度为8位；
        let checkSameNewTicket = false; //验证新支票号是否相同;
        let ticketNumStr = ""; //验证新支票号是否相同;
        this.changeList.forEach(item => {
            item.newTicketNumber = item.newTicketNumber || "";
            item.newCheckoutDate = item.newCheckoutDate || "";
            item.newCheckoutAccount = item.newCheckoutAccount || "";
            item.newCheckoutBank = item.newCheckoutBank || "";
            item.newTicketAmount = item.newTicketAmount || "";

            item.newTicketNumber = item.newTicketNumber.trim();
            // item.newCheckoutDate = item.newCheckoutDate.trim();
            item.newCheckoutAccount = item.newCheckoutAccount.trim();
            item.newCheckoutBank = item.newCheckoutBank.trim();
            if (
                item.newTicketNumber === "" ||
                item.newCheckoutDate === "" ||
                item.newCheckoutAccount === "" ||
                item.newCheckoutBank === "" ||
                item.newTicketAmount === ""
            ) {
                isvalid = true;
                return;
            }

            if (!this.isDigital(item.newTicketNumber)) {
                checkNewTicketlen = true;
                return;
            }
            if (
                ticketNumStr !== "" &&
                ticketNumStr.indexOf(item.newTicketNumber) !== -1
            ) {
                checkSameNewTicket = true;
                return;
            } else {
                ticketNumStr = ticketNumStr + item.newTicketNumber + ",";
            }
        });
        if (isvalid) {
            this.windowService.alert({
                message: "必填项不能为空！",
                type: "fail"
            });
            return;
        }

        if (checkNewTicketlen) {
            this.windowService.alert({
                message: "新支票号长度为8位数字!",
                type: "fail"
            });
            return;
        }
        if (checkSameNewTicket) {
            this.windowService.alert({
                message: "新支票号不能相同！",
                type: "fail"
            });
            return;
        }

        if (this.changeId !== "") {
            this.changeList.forEach(item => {
                let dataObj = new Date(item.newCheckoutDate);
                let ninedate = this.addDate(-9); //当前日期减去9个工作日
                ninedate = new Date(this.getFormatDate(ninedate));
                if (this.dateDiff(dataObj, ninedate) > 0) {
                    item.newCheckoutDate = "";
                    isvalid = true;
                    return;
                }
            });
            if (isvalid) {
                this.windowService.alert({
                    message: "新支票到期日最小为当日减9个自然日!！",
                    type: "fail"
                });
                return;
            }
        }

        if (this.person.length <= 0) {
            this.windowService.alert({
                message: "请选择审批人！",
                type: "fail"
            });
            return;
        }

        this.isClick = true;
        let data = {
            changeReason: this.changeReson,
            invoiceChangeList: this.changeList,
            deptApprovers: this.getStrUser(this.person),
            applyItCode: this.itcode,
            applyTelephone: this.phone,
            applyDepartment: this.deptName,
            changeApplyId: this.changeApplyId,
            id: this.changeId
        };
        this.changeService.submitChangeApply(data).then(res => {
            let rdata = res.json();
            if (rdata.success) {
                this.windowService.alert({
                    message: "提交成功",
                    type: "success"
                });
                this.showbtn = false;

                try {
                    window.opener.document
                        .getElementById("searchChange")
                        .click();
                } catch (error) {}
                setTimeout(function() {
                    window.close();
                }, 1500);
            } else {
                this.showbtn = true;
                this.isClick = false;
                this.windowService.alert({
                    message: rdata.message,
                    type: "fail"
                });
            }
        });
    }
    getStrUser(obj) {
        var stringuser = "";
        obj.forEach(user => {
            stringuser += user.userID + ",";
        });
        if (stringuser.length > 0) {
            stringuser = stringuser.substring(0, stringuser.length - 1);
        }
        return stringuser;
    }
    get validForm(): boolean {
        //校验提交按钮
        if (this.changeList.length <= 0) {
            return false;
        }
        return true;
    }
    validCustom(): boolean {
        //校验是否同一个客户
        let i = -1;
        let custCode = "";
        this.changeList.forEach(item => {
            if (item.customCode !== custCode) {
                custCode = item.customCode;
                i++;
            }
        });
        if (i > 0) {
            return false; //非同一个客户
        }
        return true; //同一个客户
    }

    close() {
        window.close();
    }

    getDate(date, invoice: ChangeApplyInfo) {
        let dataObj = new Date(date);
        let ninedate = this.addDate(-9); //当前日期减去9个工作日
        ninedate = new Date(this.getFormatDate(ninedate));
        if (this.dateDiff(dataObj, ninedate) > 0) {
            invoice.newCheckoutDate = "";
            this.windowService.alert({
                message: "最小日期为当日减9个自然日!",
                type: "fail"
            });
            return;
        }
        invoice.newCheckoutDate = date;
    }

    getFormatDate(dataObj): string {
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

    addDate(snum) {
        //当前日期减天数
        let tmpdate = new Date();
        let datenum = tmpdate.valueOf();
        datenum = datenum + snum * 24 * 60 * 60 * 1000;
        tmpdate = new Date(datenum);
        return tmpdate;
    }

    dateDiff(d1, d2): number {
        //获取两个日期相差天数
        let sDate = new Date(d1);
        let eDate = new Date(d2);
        let days = eDate.getTime() - sDate.getTime();
        let time = days / (1000 * 60 * 60 * 24);
        return time;
    }

    checkNumber(theObj) {
        let reg = /^\d+(?:\.\d{1,2})?$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    }
    //验证小数
    checkFloat(item) {
        if (!this.checkNumber(item.newTicketAmount)) {
            this.windowService.alert({
                message: "请输入规范的数字，可保留两位小数",
                type: "fail"
            });
            item.newTicketAmount = "";
            return false;
        }
    }

    //查看
    showErrorMesForm(errorMessageList) {
        this.errorMessageForm.show(errorMessageList);
    }

    onFileCallBack(data) {
        //文件上传回传数据
        if (data.success) {
            if (data.item.errorList.length > 0) {
                this.showErrorMesForm(data.item.errorList);
            } else {
                let data2 = JSON.parse(data.item.changeList);
                this.changeService
                    .getCurrentFlowInvoiceApplys(this.itcode)
                    .subscribe(res => {
                        let list = res.item.list; //流程中的记录
                        let clist = res.item.clist; //申请人对应的记录
                        let rmls = new Array();
                        for (let i = 0; i < data2.length; i++) {
                            let item = data2[i];
                            let isExist = false;
                            if (clist.length > 0) {
                                //是否为申请人的记录
                                for (let m = 0; m < clist.length; m++) {
                                    let apply = clist[m];
                                    if (apply.id == item.oldApplyId.id) {
                                        isExist = true;
                                    }
                                }
                                if (!isExist) {
                                    rmls.push(item.oldApplyId.ticketNum);
                                }
                            }
                            let isFlow = false;
                            if (list.length > 0) {
                                //是否在流程中
                                for (let j = 0; j < list.length; j++) {
                                    let oldApply = list[j];
                                    if (oldApply.id == item.oldApplyId.id) {
                                        isFlow = true;
                                        rmls.push(item.oldApplyId.ticketNum);
                                    }
                                }
                            }
                            if (this.changeList.length > 0) {
                                for (
                                    let k = 0;
                                    k < this.changeList.length;
                                    k++
                                ) {
                                    let tmpChangeInfo = this.changeList[k];
                                    if (
                                        tmpChangeInfo.invoiceApplyId ==
                                        item.oldApplyId.id
                                    ) {
                                        isFlow = true;
                                        rmls.push(item.oldApplyId.ticketNum);
                                    }
                                }
                            }

                            if (isExist && !isFlow) {
                                let changeInfo = new ChangeApplyInfo();
                                changeInfo.invoiceApplyId = item.oldApplyId.id;
                                changeInfo.oldTicketNumber =
                                    item.oldApplyId.ticketNum;
                                changeInfo.ticketAmount =
                                    item.oldApplyId.ticketAmount;
                                changeInfo.checkoutDate =
                                    item.oldApplyId.checkoutDate;
                                changeInfo.payee = item.oldApplyId.payee;
                                changeInfo.payeeName =
                                    item.oldApplyId.payeeName;
                                changeInfo.customCode =
                                    item.oldApplyId.customCode;
                                changeInfo.customName =
                                    item.oldApplyId.customName;
                                changeInfo.newTicketNumber =
                                    item.newTicketNumber;
                                changeInfo.newCheckoutDate = this.getFormatDate(
                                    new Date(item.newCheckoutDate)
                                );
                                changeInfo.newCheckoutAccount =
                                    item.newCheckoutAccount;
                                changeInfo.newCheckoutBank =
                                    item.newCheckoutBank;
                                changeInfo.newTicketAmount =
                                    item.newTicketAmount;
                                this.changeList.push(changeInfo);
                            }
                        }
                        if (rmls.length > 0) {
                            let rmstr = rmls.join(",");
                            // this.windowService.alert({message: "原支票号："+rmstr+" 已添加或在流程中或非申请人登录人记录不能导入。", type: 'fail'});
                            let errorList = [];
                            let msg =
                                "原支票号：" +
                                rmstr +
                                " 已添加或在流程中或非申请人登录人记录不能导入。";
                            let errorBean = { rowNum: 0, message: msg };
                            errorList.push(errorBean);
                            this.showErrorMesForm(errorList);
                        }
                    });
            }
        } else {
            this.windowService.alert({ message: data.message, type: "fail" });
        }
    }

    changePerson(info?) {
        this.changeList = new Array();
        if (info && info.length > 0) {
            this.itcode = info[0]["userEN"];
            this.phone = info[0]["mobile"];
            this.deptName = info[0]["department"].name;

            this.changeService.getUserByItcode(this.itcode).subscribe(data => {
                this.platformCode = data.item.flatCode; //申请人平台

                this.changeService
                    .getApprovals(this.platformCode)
                    .subscribe(data => {
                        let users = data.item.riskpersons;
                        if (users) {
                            this.riskpersons = new Array<Person>();
                            for (let user of users) {
                                let tperson = new Person();
                                tperson.userEN = user.itcode;
                                tperson.userID = user.itcode.toLocaleLowerCase();
                                tperson.userCN = user.name;
                                this.riskpersons.push(tperson);
                            }
                        }
                    });
            });
        } else {
            this.itcode = "";
            this.phone = "";
            this.deptName = "";
        }
    }

    isDigital(invoiceNum) {
        let reg = /^\d{8}$/;
        if (reg.test(invoiceNum)) {
            return true;
        }
        return false;
    }
}
