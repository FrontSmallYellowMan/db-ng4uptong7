import { Component, OnInit } from "@angular/core";
import { InvoiceCommonListComponent } from "../../../common/invoice-common-list.component";
import {
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { WindowService } from "app/core";
import {
    environment_java,
    environment,
    dbomsPath
} from "../../../../../../../environments/environment";
declare var window;

@Component({
    selector: "db-revoked-apply",
    templateUrl: "./revoked-apply.component.html",
    styleUrls: ["./revoked-apply.component.scss"]
})
export class RevokedApplyComponent implements OnInit {
    //申请人基本信息
    revokedPhone: string = "";
    revokedDept: string = "";
    revokedDeptName: string = "";
    revokedRemark: string = "";
    platformCode: string = "";
    //显示提交按钮
    showbtn: boolean = true;
    //model窗口对象
    modalAddForm: XcModalRef;
    //审批单的支票列表信息
    public invoicelist = new Array();
    //基本信息

    public sqr = [];
    dataSource;
    constructor(
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private http: Http
    ) {
        this.http
            .get(environment_java.server + "common/getCurrentLoginUser", {})
            .map(res => res.json())
            .subscribe(data => {
                console.log(data.item.sysUsers);
                if (data.success) {
                    var data1 = {
                        userCN: data.item.sysUsers.userName,
                        userEN: data.item.sysUsers.itcode.toLowerCase(),
                        userID: data.item.sysUsers.itcode
                    };
                    this.sqr.push(data1);
                    this.revokedPhone = data.item.mobile;
                    this.revokedDept = data.item.sysUsers.deptNO;
                    this.revokedDeptName = data.item.sysUsers.deptName;
                    this.platformCode = data.item.sysUsers.flatCode; //登录人平台
                    this.loadApprover(
                        this.person1,
                        "ChequeRiskApprove",
                        "FLATCODE='" + this.platformCode + "'"
                    ); //风险岗
                    this.loadApprover(
                        this.person2,
                        "ChequeFinanceApprove",
                        "FLATCODE='" + this.platformCode + "'"
                    ); //设置财务审批人
                }
            });
    }

    public person = []; //事业部审批人信息
    public person1 = []; //事业部审批人信息
    public person2 = []; //事业部审批人信息

    ngOnInit() {
        this.modalAddForm = this.xcModalService.createModal(
            InvoiceCommonListComponent
        );
        //模型关闭的时候 如果有改动，请求刷新
        this.modalAddForm.onHide().subscribe(data => {
            this.invoicelist = this.invoicelist.filter(
                item => item.id !== "-1"
            );
            if (data) {
                data.forEach(item => {
                    this.invoicelist.push(item);
                });
            }
        });
    }

    //增加空列信息
    instr = function() {
        var d = { id: "-1" };
        this.invoicelist.push(d);
    };
    //删除列信息
    deltr = function(e) {
        this.invoicelist.splice(e, 1);
    };
    //查询当前用户的支票列表信息
    searchInvoice(): void {
        var ids: string = "";
        this.invoicelist.forEach(item => {
            if (item.id != -1) {
                ids += item.id + ",";
            }
        });
        if (ids.length > 0) {
            ids = ids.substring(0, ids.length - 1);
        } else {
            ids = "-1";
        }
        var data1 = {
            applyids: ids,
            status: "1,2,3,5,6,8,9",
            typeval: "CP",
            sqruserItcode: this.sqr[0].userEN
        };
        this.modalAddForm.show(data1);
    }

    //发起撤票申请
    isClick: boolean = false;
    headers = new Headers({ "Content-Type": "application/json" });
    options = new RequestOptions({ headers: this.headers });
    save(): void {
        if (this.isClick) {
            this.windowService.alert({
                message: "任务处理中或已处理,请勿多次点击",
                type: "fail"
            });
            return;
        }
        var invoiceRevokedList = new Array();
        var i = 0;
        for (var index = 0; index < this.invoicelist.length; index++) {
            var element = this.invoicelist[index];
            if (element.id != "-1") {
                invoiceRevokedList[i] = {
                    applyId: element.id,
                    org: this.revokedDept,
                    ticketAmount: element.ticketAmount,
                    ticketNum: element.ticketNum,
                    customName: element.customName,
                    checkoutDate: element.checkoutDate,
                    contractNum: element.contractNum
                };
                i++;
            }
        }
        if (this.sqr.length <= 0) {
            this.windowService.alert({
                message: "申请人不能为空！",
                type: "fail"
            });
            return;
        }
        if (this.revokedDept.length <= 0) {
            this.windowService.alert({
                message: "联系电话不能为空！",
                type: "fail"
            });
            return;
        }
        if (invoiceRevokedList.length <= 0) {
            this.windowService.alert({
                message: "支票不能为空！",
                type: "fail"
            });
            return;
        }
        if (
            this.revokedDept.length <= 0 ||
            this.revokedPhone.length <= 0 ||
            this.revokedRemark.length <= 0
        ) {
            this.windowService.alert({
                message: "请填写必填项！",
                type: "fail"
            });
            return;
        }
        if (this.person.length <= 0) {
            this.windowService.alert({
                message: "请选择事业部审批人！",
                type: "fail"
            });
            return;
        }
        if (this.person1.length <= 0) {
            this.windowService.alert({
                message: "风险岗审批人不能为空！",
                type: "fail"
            });
            return;
        }
        if (this.person2.length <= 0) {
            this.windowService.alert({
                message: "财务岗审批人不能为空！",
                type: "fail"
            });
            return;
        }
        var data = {
            revokedUserId: this.sqr[0].userID,
            revokedItcode: this.sqr[0].userEN,
            revokedUserName: this.sqr[0].userCN,
            revokedDept: this.revokedDeptName,
            revokedPhone: this.revokedPhone,
            revokedRemark: this.revokedRemark,
            org: this.revokedDept,
            invoiceRevokedList: invoiceRevokedList,
            deptUser: this.getStrUser(this.person),
            riskUser: this.getStrUser(this.person1),
            financeUser: this.getStrUser(this.person2)
        };
        console.log(data);
        this.http
            .post(
                environment_java.server + "/revoked/submit-revoked-applys",
                data,
                this.options
            )
            .toPromise()
            .then(res => {
                console.log(res);
                let rdata = res.json();
                console.log(rdata.success);
                console.log(rdata.message);
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
                    }, 1000);
                } else {
                    this.windowService.alert({
                        message: rdata.message,
                        type: "fail"
                    });
                    this.isClick = false;
                }
            });
        this.isClick = true;
    }
    //查询当前审批单的支票列表信息
    load_invoicelist = function(revokedId) {
        this.http
            .get(environment_java.server + "/revoked/invoice-applys")
            .map(res => res.json())
            .subscribe(res => {
                if (res.list) {
                    this.invoicelist = res.list;
                }
            });
    };
    close() {
        window.close();
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
    fileUploadApi: string = environment_java.server + "revoked/upload-excel"; //上传文件接口
    loadChange() {
        window.location.href =
            dbomsPath + "assets/downloadtpl/支票撤票-导入模板.xls";
    }
    changePerson(pinfo?) {
        this.invoicelist = new Array();
        if (pinfo && pinfo.length > 0) {
            console.log(pinfo);
            this.revokedPhone = pinfo[0]["mobile"];
            this.revokedDept = pinfo[0]["department"].id;
            this.revokedDeptName = pinfo[0]["department"].name;
            this.http
                .get(
                    environment_java.server +
                        "common/sys-people/" +
                        pinfo[0]["userEN"],
                    {}
                )
                .map(res => res.json())
                .subscribe(data => {
                    this.person1 = []; //事业部审批人信息
                    this.person2 = []; //事业部审批人信息
                    this.platformCode = data.item.flatCode; //登录人平台
                    this.loadApprover(
                        this.person1,
                        "ChequeRiskApprove",
                        "FLATCODE='" + this.platformCode + "'"
                    ); //风险岗
                    this.loadApprover(
                        this.person2,
                        "ChequeFinanceApprove",
                        "FLATCODE='" + this.platformCode + "'"
                    ); //设置财务审批人
                });
        } else {
            this.revokedPhone = "";
            this.revokedDept = "";
            this.revokedDeptName = "";
        }
    }
    onFileCallBack(data) {
        //文件上传回传数据
        if (data.success) {
            if (
                typeof data.item.error != "undefined" &&
                data.item.error.length > 0
            ) {
                this.windowService.alert({
                    message: data.item.error,
                    type: "fail"
                });
            } else {
                this.http
                    .post(
                        environment_java.server +
                            "revoked/checked-upload-excel",
                        { itcode: this.sqr[0].userEN, list: data.item.list },
                        this.options
                    )
                    .map(res => res.json())
                    .subscribe(res => {
                        if (res.success) {
                            if (
                                typeof res.item.error != "undefined" &&
                                res.item.error.length > 0
                            ) {
                                this.windowService.alert({
                                    message: res.item.error,
                                    type: "fail"
                                });
                            } else {
                                let data2 = JSON.parse(res.item.list);
                                for (let i = 0; i < data2.length; i++) {
                                    let item = data2[i];
                                    console.log(item);
                                    var bol: boolean = false;
                                    for (
                                        var j = 0;
                                        j < this.invoicelist.length;
                                        j++
                                    ) {
                                        var idval1 = this.invoicelist[j].id;
                                        if (idval1 == item.id) {
                                            bol = true;
                                        }
                                    }
                                    if (!bol) {
                                        this.invoicelist.push(item);
                                    } else {
                                        var isnum = item.ticketNum;
                                        this.windowService.alert({
                                            message:
                                                "支票号1：" + isnum + "已存在",
                                            type: "fail"
                                        });
                                    }
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
        } else {
            this.windowService.alert({ message: data.message, type: "fail" });
        }
    }

    //审批人获取
    loadApprover(aid, functionCode, fields) {
        var data1 = {
            functionCode: functionCode,
            fields: fields
        };
        this.http
            .post(
                environment_java.server + "revoked/invoice-approver",
                data1,
                this.options
            )
            .map(res => res.json())
            .subscribe(res => {
                var userli = res.item.key1;
                for (let i = 0; i < userli.length; i++) {
                    let item1 = userli[i];
                    var data1 = {
                        userCN: item1.name,
                        userEN: item1.itcode,
                        userID: item1.id
                    };
                    aid.push(data1);
                }
            });
    }
}
