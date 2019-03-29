import {
    Component,
    OnInit,
    Input,
    Output,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { InvoiceCommonListComponent } from "../../../common/invoice-common-list.component";
import {
    DbWfviewComponent,
    Pager,
    XcModalService,
    XcBaseModal,
    XcModalRef
} from "app/shared/index";
import { Router, ActivatedRoute } from "@angular/router";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { WindowService } from "app/core";
import { Location } from "@angular/common";
import { environment_java } from "../../../../../../../environments/environment";
declare var window;

@Component({
    selector: "db-revoked-approve",
    templateUrl: "./revoked-approve.component.html",
    styleUrls: ["./revoked-approve.component.scss"],
    providers: []
})
export class RevokedApproveComponent implements OnInit {
    revokedPhone: string = "";
    revokedRemark: string = "";
    platformCode: string = "";
    /**
     *获取流程数据信息（流程审批历史，流程审批全景）
     */
    @ViewChild("wfview")
    wfView: DbWfviewComponent;
    //标示 true为只能查看，false可以审批
    readonlyval: boolean = true;
    //申请单主键
    revokedId: string = "";
    //信息
    public revokedObj;
    public flowstates: string = "";
    //拒绝的环节id
    public nodeId = "node1";
    //意见
    opinions = "同意";
    //按钮组件校验
    public saveId6Flag = true;
    @ViewChildren("sqr") sqr = new Array();
    wfData = {
        wfHistoryData: null, //流程日志列表数据
        wfprogress: null //流程图数据
    };

    isView: boolean = true; //是否查看页面 查看页面(true) 审批页面(false)   加签审批
    isADP: boolean = false; //是否加签审批页面
    appParms = {};

    public person = []; //事业部审批人信息
    public person1 = []; //事业部审批人信息
    public person2 = []; //事业部审批人信息
    constructor(
        private routerInfo: ActivatedRoute,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private http: Http,
        private router: Router,
        private location: Location
    ) {}
    //model窗口对象
    modalAddForm: XcModalRef;
    //审批单的支票列表信息
    public invoicelist = new Array();
    ngOnInit() {
        //url获取参数值
        this.revokedId = this.routerInfo.snapshot.params["revokedId"];
        this.flowstates = this.routerInfo.snapshot.params["flowstates"];

        //流程按钮连接地址，组件未开发完
        this.appParms = {
            apiUrl_AR:
                environment_java.server + "/revoked/revoked-applys/reject", //拒绝
            apiUrl_Sign:
                environment_java.server +
                "/revoked/revoked-applys/flow-add-sign", //加签
            apiUrl_Transfer:
                environment_java.server +
                "/revoked/revoked-applys/flow-transfer", //转办
            parmsMap: { id: this.revokedId, nodeId: this.nodeId },
            navigateUrl: "/invoice/revoked/list"
        };

        //加载查询申请单数据以及审批记录以及流程图数据
        this.load_invoice();

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
                    let data = {
                        applyId: item.id,
                        org: this.revokedObj.org,
                        ticketAmount: item.ticketAmount,
                        ticketNum: item.ticketNum,
                        customName: item.customName,
                        checkoutDate: item.checkoutDate,
                        contractNum: item.contractNum
                    };
                    this.invoicelist.push(data);
                });
            }
        });
    }

    //删除列信息
    deltr = function(e) {
        this.invoicelist.splice(e, 1);
    };
    //查询当前用户的支票列表信息
    searchInvoice(): void {
        var ids: string = "";
        this.invoicelist.forEach(item => {
            if (item.id != -1) {
                ids += item.applyId + ",";
            }
        });
        if (ids.length > 0) {
            ids = ids.substring(0, ids.length - 1);
        } else {
            ids = "-1";
        }
        var data1 = {
            applyids: ids,
            status: "1,2,3",
            typeval: "CP",
            sqruserItcode: this.revokedObj.revokedItcode
        };
        this.modalAddForm.show(data1);
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
    //提交事件
    isClick: boolean = false;
    public saveBill(op) {
        if (this.isClick) {
            this.windowService.alert({
                message: "任务处理中或已处理,请勿多次点击",
                type: "fail"
            });
            return;
        }
        this.opinions = op;
        if (this.opinions.length <= 0) {
            this.opinions = "同意";
        }

        if (this.revokedObj.flowStatus == 5) {
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

            this.revokedObj.revokedPhone = this.revokedPhone;
            this.revokedObj.revokedRemark = this.revokedRemark;
            this.revokedObj.deptUser = this.getStrUser(this.person);
            this.revokedObj.riskUser = this.getStrUser(this.person1);
            this.revokedObj.financeUser = this.getStrUser(this.person2);
            this.revokedObj.invoiceRevokedList = this.invoicelist;
        }
        var data = {
            id: this.revokedId,
            opinion: this.opinions,
            apply: this.revokedObj
        };
        this.http
            .post(
                environment_java.server + "/revoked/revoked-applys/agreement",
                data,
                this.options
            )
            .toPromise()
            .then(res => {
                console.log(res);
                let rdata = res.json();
                if (rdata.success) {
                    // this.windowService
                    //     .confirm({ message: "审批成功,是否关闭页面？" })
                    //     .subscribe({
                    //         next: v => {
                    //             if (v) {
                    //                 window.close();
                    //             }
                    //         }
                    //     });
                    this.windowService.alert({
                        message: "审批成功",
                        type: "success"
                    });
                    try {
                        window.opener.document
                            .getElementById("searchChange")
                            .click();
                    } catch (error) {}
                    setTimeout(function() {
                        window.close();
                    }, 1500);
                } else {
                    this.windowService.alert({
                        message: rdata.message,
                        type: "fail"
                    });
                }
            });
        // this.isClick = true;
    }

    headers = new Headers({ "Content-Type": "application/json" });
    options = new RequestOptions({ headers: this.headers });

    //查询当前审批单
    load_invoice = function() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("revokedId", this.revokedId);
        this.http
            .get(environment_java.server + "/revoked/find-revoked-applys", {
                search: params
            })
            .map(res => res.json())
            .subscribe(res => {
                console.log(res);
                if (res.item) {
                    this.revokedObj = res.item[0]; //申请单信息
                    this.revokedRemark = this.revokedObj.revokedRemark;
                    this.revokedPhone = this.revokedObj.revokedPhone;
                    this.invoicelist = this.revokedObj.invoiceRevokedList;
                    let dataPerson = {
                        userID: this.revokedObj.revokedUserId,
                        userEN: this.revokedObj.revokedItcode,
                        userCN: this.revokedObj.revokedUserName
                    };
                    //this.sqr.push(dataPerson);
                    console.log(dataPerson);
                    this.sqr._results[0].Obj = dataPerson;

                    this.http
                        .get(
                            environment_java.server +
                                "common/sys-people/" +
                                this.revokedObj.revokedItcode,
                            {}
                        )
                        .map(res => res.json())
                        .subscribe(data => {
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
                    this.wfData.wfHistoryData = res.item[1]; //流程日志信息
                    this.wfData.wfprogress = res.item[2]; //流程图信息
                    this.readonlyval = res.item[3]; //是否当前审批人 false 可以审批
                    if (this.flowstates == "myall") {
                        this.readonlyval = true;
                    }
                    this.wfView.onInitData(this.wfData.wfprogress);

                    // 回填事业部审批人
                    this.http
                        .get(
                            environment_java.server +
                                `common/getUserInfo/${
                                    this.revokedObj.approvalIds
                                }`
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
                }
            });
    };
    goBack() {
        // this.router.navigate([this.appParms.navigateUrl]);
        // window.history.back();
        window.close();
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
