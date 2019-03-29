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
import { Pager, XcModalService, XcModalRef } from "../../../../../shared/index";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import {
    Query,
    InvoiceInfo,
    UserInfo,
    InvoiceQueryPo
} from "../../apply/invoice/invoice-info";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
import { WindowService } from "../../../../../core/index";
import {
    environment_java,
    dbomsPath
} from "../../../../../../environments/environment";
import { environment } from "../../../../../../environments/environment.prod";
declare var window, Blob, document, URL;

@Component({
    templateUrl: "./invoice-list.component.html",
    styleUrls: ["./invoice-list.component.scss"]
})
export class InvoiceListComponent implements OnInit {
    //审批按钮点击后锁定效果
    public clickFlag: boolean = true;
    public clickFlag2: boolean = true;
    public clickFlag3: boolean = true;
    public invoiceStatus: string = "3";
    public sel: string = "6,7,9,10";
    public checkePayee: string = "all";
    loading: boolean = true; //加载中效果
    public invoiceList = new Array<InvoiceInfo>(); //列表数据
    public approveList = new Array<InvoiceInfo>(); //审批列表
    //列表分页
    public pagerData = new Pager();
    //审批分页
    public apprData = new Pager();
    public query: Query = new Query(); //查询条件
    //页签
    public applyPage: string = "0";
    public flag = "0";
    public count = 0;
    public salesman: boolean = true; //销售员先改为所有人可见（如果需要添加销售角色权限，则salesman=false;）
    public business: boolean = false;
    public financial: boolean = false;
    public admin: boolean = false;

    public loginUser: UserInfo = new UserInfo();
    public payeeList = [];
    public payeeOptions = [];
    public businessList = [];
    public payeeAllCount = 0;
    public fullChecked = false; //全选状态
    public fullCheckedIndeterminate = false; //半选状态
    public checkedNum = 0;
    public editForm: XcModalRef;
    public queryPo: InvoiceQueryPo;
    public bassinApprove = "";
    public finaceApprove = "";
    public clospanNum = 11;
    public totalAmount: number = 0.0;
    public pms: string = "";
    constructor(
        private http: Http,
        private invoiceApplyService: InvoiceApplyService,
        private invoiceApproveService: InvoiceApproveService,
        private xcModalService: XcModalService,
        private activatedRouter: ActivatedRoute,
        private windowService: WindowService,
        private router: Router
    ) {
        activatedRouter.queryParams.subscribe(params => {
            if (params["from"]) {
                this.pms = params["from"];
            }
        });
    }

    name = "交存审批";
    ngOnInit() {
        this.http
            .get(environment_java.server + "/common/getUserRoles", null)
            .toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    let roleCodes = data.item;
                    //财务人员可见
                    if (roleCodes.indexOf("0000000009") >= 0) {
                        this.financial = true;
                        if (this.pms) {
                            this.changeFlag("1");
                        }
                    }
                    //商务人员可见
                    if (roleCodes.indexOf("0000000008") >= 0) {
                        this.business = true;
                        if (this.pms) {
                            this.changeFlag("1");
                        }
                    }
                    //销售人员可见
                    if (
                        roleCodes.indexOf("0000000001") >= 0 ||
                        roleCodes.indexOf("0000000002") >= 0
                    ) {
                        this.salesman = true;
                    }
                    //管理员
                    if (roleCodes.indexOf("0000000010") >= 0) {
                        this.admin = true;
                        if (this.pms) {
                            this.changeFlag("1");
                        }
                    }
                }
            });
        this.queryPo = new InvoiceQueryPo();
        //获取登录人信息
        this.getLoginUser();
        //默认进入“审批中”中页面
        this.query.invoiceStatus = "0,1,2,3,4";
        this.getInvoiceList();
    }

    public calTotalMoney(): void {
        this.totalAmount = 0.0;
        this.approveList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                //console.log("&&&"+invoice.checked);
                //  console.log(invoice.ticketAmount+" "+invoice.checked);
                this.totalAmount += invoice.ticketAmount;
            });
    }

    public getLoginUser(): void {
        this.invoiceApplyService.getLoginUser().then(user => {
            let plantformCode =
                user.sysUsers.flatCode.length === 1
                    ? "0" + user.sysUsers.flatCode
                    : user.sysUsers.flatCode;
            //初始化表单
            this.loginUser.itcode = user.sysUsers.itcode; //申请人itcode
            this.loginUser.name = user.sysUsers.userName; //申请人姓名
            this.loginUser.plantFormCode = plantformCode; //平台code
            this.loginUser.plantFormName = user.sysUsers.flatName; //平台名称
        });
    }
    //检查是否全选
    CheckIndeterminate(v) {
        this.fullCheckedIndeterminate = v;
        // this.calTotalMoney();
    }

    getQueryData() {
        this.loading = true;
        if (this.flag == "1") {
            this.query.pageNo = 1;
            this.getApproveList();
            this.getPayeeCountList();
        } else if (this.flag == "0") {
            this.getInvoiceList();
        }
    }

    //点击页签头
    changeFlag(iflag: string) {
        this.loading = true;
        this.flag = iflag;
        this.query.startDate = "";
        this.query.endDate = "";
        this.query.keyWords = "";
        this.applyPage = "0";

        // 点击我的审批，要提前设置colspan
        this.clospanNum = 8;

        if (iflag == "0") {
            //我的申请-审批中
            this.query.invoiceStatus = "0,1,2,3,4";
            //日期初始化为空
            this.getInvoiceList();
            this.count = 0;
        } else {
            //我的审批-待我接收
            //每次点击页签都初始化查询条件
            this.fullChecked = false;
            this.fullCheckedIndeterminate = false;
            this.query.payee = "";
            this.query.businessItcode = "";
            this.query.invoiceStatus = "0";
            if (this.financial && !this.business && !this.admin) {
                this.applyPage = "2";
                this.query.invoiceStatus = "2";
            }
            this.query.startDate = "";
            this.query.endDate = "";
            this.getApproveList();
            this.getPayeeCountList();
            this.getBusinessList();
        }
    }
    isDraft: boolean = false;
    // 删除草稿数据
    delDraftById(id) {
        this.windowService.confirm({ message: "是否删除？" }).subscribe(res => {
            if (res) {
                this.invoiceApproveService.deleteDraft(id).subscribe(res => {
                    let result = JSON.parse(res["_body"]);
                    if (result["success"]) {
                        this.getInvoiceList();
                    } else {
                        this.windowService.alert({
                            message: result.message,
                            type: "fail"
                        });
                    }
                });
            }
        });
    }
    //点击页签事件
    changeapplytype(
        flowstates: string,
        clospanNum: number,
        flag: string
    ): void {
        if (this.applyPage == flowstates) return;
        this.loading = true;
        this.applyPage = flowstates;
        this.query.startDate = "";
        this.query.endDate = "";
        if (flag != "3") {
            // 隐藏
            this.isDraft = false;
        }
        //我的申请
        if (flag == "0") {
            if (flowstates === "0") {
                this.query.invoiceStatus = "0,1,2,3,4";
            } else if (flowstates === "1") {
                this.query.invoiceStatus = "11";
            } else if (flowstates === "3") {
                this.query.invoiceStatus = "13";
                this.isDraft = true;
            } else if (flowstates === "4") {
                this.query.invoiceStatus = "5,6,7,8,9,10";
            } else {
                this.query.invoiceStatus = "";
            }
            this.getInvoiceList();
        } else if (flag == "1") {
            //我的审批
            //清空查询条件查询
            this.clospanNum = clospanNum;
            this.query.invoiceStatus = flowstates;
            this.fullChecked = false;
            this.fullCheckedIndeterminate = false;
            this.query.endDate = "";
            this.query.startDate = "";
            this.query.keyWords = "";
            this.query.payee = "";
            this.query.businessItcode = "";
            this.query.pageNo = 1;

            this.getApproveList();
            //初始化页面信息
            this.getBusinessList();
            this.getPayeeCountList();
            this.getPayeeList();
        }
    }

    changeseltype(flowstates: string): void {
        this.loading = true;
        this.query.invoiceStatus = flowstates;
        this.applyPage = "6,7,9,10";
        this.getApproveList();
    }

    reset() {
        //重置搜索数据
        if (this.applyPage == "3") {
            this.invoiceStatus = "3";
        }
        if (this.applyPage == "6,7,9,10") {
            this.sel = "6,7,9,10";
        }
        this.changeapplytype(this.applyPage, 0, "1");
    }
    getIqDate(date, flag) {
        if (flag == "end") {
            this.query.endDate = date;
        } else {
            this.query.startDate = date;
        }
        this.getQueryData();
    }
    /**
     * 获取我的审批
     */
    getApproveList() {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        //明天的时间
        // let day = new Date();
        // day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
        // var tomorrow = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();

        // if (this.query.startDate != "" && this.query.startDate != undefined) {
        //     this.getDate(this.query.startDate, "start");
        // } else {
        //     this.getDate(day, "start");
        // }
        // if (this.query.endDate != "" && this.query.endDate != undefined) {
        //     this.getDate(this.query.endDate, "end");
        // } else {
        //     this.getDate(day, "end");
        // }
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        }
        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        }
        let apprData = this.apprData;
        this.query.pageNo = apprData.pageNo;
        this.query.pageSize = apprData.pageSize;
        // this.query.startDate = "";
        // this.query.endDate = "";
        this.invoiceApproveService.getApproveList(this.query).then(res => {
            // res.list = [];
            if (res.list) {
                this.approveList = res.list;
                this.count = res.pager.total;
                for (let i = 0; i < this.approveList.length; i++) {
                    this.approveList[i].saveStatus = 1;
                    this.approveList[i].num =
                        (apprData.pageNo - 1) * apprData.pageSize + (i + 1);
                    //添加延字
                    this.invoiceApplyService.getAllDelayInvoice().then(res => {
                        if (res.item) {
                            res.item.forEach(item => {
                                if (
                                    item.invoiceNum ==
                                        this.approveList[i].ticketNum &&
                                    item.customCode ==
                                        this.approveList[i].customCode
                                ) {
                                    this.approveList[i].yan = item.endFlag;
                                }
                            });
                        }
                    });
                }
                //设置分页器
                if (res.pager && res.pager.total) {
                    this.apprData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                } else {
                    this.apprData.set({
                        total: 0,
                        totalPages: 0
                    });
                }
            }
            this.loading = false;
        });
    }

    public currentPageSize; //当前每页显示条数
    public apprCurrentPageSize; //审批每页显示条数
    onChangePage(e: any): void {
        this.loading = true;
        //非第一页，切换条数。跳为第一页
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
        this.query.pageNo = e.pageNo;
        this.query.pageSize = e.pageSize;
        this.getInvoiceList();
    }

    onChangePage2(e: any): void {
        this.loading = true;
        //非第一页，切换条数。跳为第一页
        if (this.apprCurrentPageSize != e.pageSize) {
            this.apprData.pageNo = 1;
        }
        this.apprCurrentPageSize = e.pageSize;
        this.query.pageNo = e.pageNo;
        this.query.pageSize = e.pageSize;
        this.getApproveList();
    }

    //审批通过/拒绝
    approve(f) {
        if (f == "8" || f == "13") {
            this.clickFlag2 = false;
        } else if (f == "5") {
            this.clickFlag3 = false;
        } else {
            this.clickFlag = false;
        }
        let idStr = "";
        this.approveList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                idStr += invoice.id + ",";
            });
        this.invoiceApproveService
            .approveInvoice(idStr.substring(0, idStr.length - 1), f)
            .then(res => {
                if (res.success) {
                    this.clickFlag = true;
                    this.clickFlag2 = true;
                    this.clickFlag3 = true;
                    this.fullCheckedIndeterminate = false;
                    this.fullChecked = false;
                    this.getApproveList();
                    this.getPayeeCountList();
                    this.windowService.alert({
                        message: res.message,
                        type: "success"
                    });
                } else {
                    this.clickFlag = true;
                    this.clickFlag2 = true;
                    this.clickFlag3 = true;
                    this.windowService.alert({
                        message: res.message,
                        type: "fail"
                    });
                }
            });
    }

    //退票/拒收状态的票据审批
    approve2(f) {
        this.clickFlag = false;
        this.approveList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                //拒收取走
                if (invoice.invoiceStatus == 5 || invoice.invoiceStatus == 6) {
                    if (f == 1) {
                        //商务人员取走
                        this.invoiceApproveService
                            .approveInvoice(invoice.id, "6")
                            .then(res => {
                                if (res.success) {
                                    this.clickFlag = true;
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "success"
                                    });
                                } else {
                                    this.clickFlag = true;
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                    if (f == 2) {
                        //申请人员取走
                        this.invoiceApproveService
                            .approveInvoice(invoice.id, "7")
                            .then(res => {
                                if (res.success) {
                                    this.clickFlag = true;
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "success"
                                    });
                                } else {
                                    this.clickFlag = true;
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                }
                //退票取走
                if (invoice.invoiceStatus == 8 || invoice.invoiceStatus == 9) {
                    if (f == 1) {
                        //商务人员取走
                        this.invoiceApproveService
                            .approveInvoice(invoice.id, "9")
                            .then(res => {
                                if (res.success) {
                                    this.clickFlag = true;
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "success"
                                    });
                                } else {
                                    this.clickFlag = true;
                                    this.clickFlag2 = true;
                                    this.clickFlag3 = true;
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                    if (f == 2) {
                        //申请人员取走
                        this.invoiceApproveService
                            .approveInvoice(invoice.id, "10")
                            .then(res => {
                                if (res.success) {
                                    this.clickFlag = true;
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "success"
                                    });
                                } else {
                                    this.clickFlag = true;
                                    this.windowService.alert({
                                        message: res.message,
                                        type: "fail"
                                    });
                                }
                            });
                    }
                }
            });
    }

    refuse(id: string, invoiceStatus: string) {
        let confirmStr = "";
        if (invoiceStatus == "5") {
            confirmStr = "是否确认银行拒收该支票？";
        } else if (invoiceStatus == "8") {
            confirmStr = "是否确认银行退回该支票？";
        } else {
            confirmStr = "是否确认取回该支票？";
        }
        this.windowService.confirm({ message: confirmStr }).subscribe(r => {
            if (r) {
                this.invoiceApproveService
                    .approveInvoice(id, invoiceStatus)
                    .then(res => {
                        if (res.success) {
                            this.getApproveList();
                            this.getPayeeCountList();
                            this.windowService.alert({
                                message: res.message,
                                type: "success"
                            });
                        } else {
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            }
        });
    }

    //编辑
    toUptateForm(id: string) {
        this.editForm.show(id);
    }
    //点击收款人页签事件
    changePayee(payee: string): void {
        this.loading = true;
        if (payee == "all") {
            this.query.payee = "";
        } else {
            this.query.payee = payee;
        }
        this.getApproveList();
    }

    //点击支票状态单选按钮
    changeInvoiceStauts(invoiceStatus: string): void {
        this.loading = true;
        this.query.invoiceStatus = invoiceStatus;
        this.getApproveList();
        this.getPayeeCountList();
    }

    //选择收款人下拉框
    changePayeeData(event) {
        this.query.payee = event.target.value;
        this.getQueryData();
    }

    //选择商务接口人radio事件
    changeBusiness(businessItcode: string) {
        this.loading = true;
        this.query.businessItcode = businessItcode;
        this.getApproveList();
        this.getPayeeCountList();
    }

    getDate(date, flag) {
        console.log("date", date);
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

        if (flag == "start") {
            this.query.startDate = temp;
        } else if (flag == "end") {
            this.query.endDate = temp;
        }
    }
    /**
     * 统计查询收款人数量
     */
    getPayeeCountList() {
        // let day = new Date();
        // day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
        // if (this.query.startDate != "" && this.query.startDate != undefined) {
        //     this.getDate(this.query.startDate, "start");
        // } else {
        //     this.getDate(day, "start");
        // }

        // if (this.query.endDate != "" && this.query.endDate != undefined) {
        //     this.getDate(this.query.endDate, "end");
        // } else {
        //     this.getDate(day, "end");
        // }
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        }
        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        }
        this.payeeAllCount = 0; //全部数量
        this.invoiceApproveService.getPayeeCountList(this.query).then(resp => {
            this.payeeList = resp.list;
            if (resp.list) {
                resp.list.forEach(
                    payee => (this.payeeAllCount += parseInt(payee.payeeCount))
                );
            }
        });
    }

    // getPayeeList(platform) {
    //     this.invoiceApproveService.getPayeeList(platform)
    //         .then(resp => {
    //             this.payeeOptions = resp.list;
    //         });
    // }
    getPayeeList() {
        this.http
            .post(environment.server + "BaseData/GetCompanyInfo/", {
                CompanyName: "",
                CompanyCode: ""
            })
            .map(res => res.json())
            .subscribe(res => {
                if (res.Data) {
                    this.payeeOptions = JSON.parse(res.Data);
                }
            });
    }

    /**
     * 获取商务接口人列表
     */
    getBusinessList() {
        this.invoiceApproveService
            .getBusinessList()
            .then(resp => (this.businessList = resp.list));
    }
    getInvoiceQuery() {
        this.loading = true;
        this.getInvoiceList();
    }

    //获取我的申请列表
    getInvoiceList() {
        let pagerData = this.pagerData;
        this.query.pageNo = pagerData.pageNo;
        this.query.pageSize = pagerData.pageSize;
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        }
        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        }
        this.invoiceApplyService.getInvoiceList(this.query).then(res => {
            // res.list = [];
            if (res.list) {
                this.invoiceList = res.list;
                for (let i = 0; i < this.invoiceList.length; i++) {
                    this.invoiceList[i].num =
                        (pagerData.pageNo - 1) * pagerData.pageSize + (i + 1);
                    //获取状态名称
                    if (this.invoiceList[i].invoiceStatus == 99) {
                        if (this.invoiceList[i].platformCode == "21") {
                            this.invoiceList[i].statusName = "商务已接收";
                        } else {
                            this.invoiceList[i].statusName = "财务已接收";
                        }
                    } else {
                        this.invoiceList[i].statusName = this.getStatusName(
                            this.invoiceList[i].invoiceStatus
                        );
                    }
                    //获取下一步审批人
                    if (
                        this.invoiceList[i].invoiceStatus == 0 ||
                        this.invoiceList[i].invoiceStatus == 1 ||
                        this.invoiceList[i].invoiceStatus == 6 ||
                        this.invoiceList[i].invoiceStatus == 9
                    ) {
                        this.getBussinApproves(
                            this.invoiceList[i].platformCode
                        ).then(res => {
                            this.invoiceList[i].nextApprove = res.substring(
                                0,
                                res.length - 1
                            );
                        });
                    } else if (
                        this.invoiceList[i].invoiceStatus == 2 ||
                        this.invoiceList[i].invoiceStatus == 3 ||
                        this.invoiceList[i].invoiceStatus == 5 ||
                        this.invoiceList[i].invoiceStatus == 8
                    ) {
                        this.getFinaceApproves(
                            this.invoiceList[i].platformCode
                        ).then(res => {
                            this.invoiceList[i].nextApprove = res.substring(
                                0,
                                res.length - 1
                            );
                        });
                    } else if (
                        this.invoiceList[i].invoiceStatus == 7 ||
                        this.invoiceList[i].invoiceStatus == 10
                    ) {
                        if (this.invoiceList[i].platformCode == "21") {
                            this.getBussinApproves(
                                this.invoiceList[i].platformCode
                            ).then(res => {
                                this.invoiceList[i].nextApprove = res.substring(
                                    0,
                                    res.length - 1
                                );
                            });
                        } else {
                            this.getFinaceApproves(
                                this.invoiceList[i].platformCode
                            ).then(res => {
                                this.invoiceList[i].nextApprove = res.substring(
                                    0,
                                    res.length - 1
                                );
                            });
                        }
                    } else {
                        this.invoiceList[i].nextApprove = "";
                    }
                }
                //设置分页器
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                } else {
                    this.pagerData.set({
                        total: 0,
                        totalPages: 0
                    });
                }
            }
            this.loading = false;
        });
    }

    getStatusName(invoiceStatus: number): string {
        let statusName = "";
        switch (invoiceStatus) {
            case 0:
                statusName = "开始";
                break;
            case 1:
                statusName = "商务已接收";
                break;
            case 2:
                statusName = "已上传财务";
                break;
            case 3:
                statusName = "财务已接收";
                break;
            case 4:
                statusName = "银行已取走";
                break;
            case 5:
                statusName = "银行拒收";
                break;
            case 6:
                statusName = "拒收后商务取走";
                break;
            case 7:
                statusName = "拒收后申请人取走";
                break;
            case 8:
                statusName = "银行退票";
                break;
            case 9:
                statusName = "退票后商务取走";
                break;
            case 10:
                statusName = "退票后申请人取走";
                break;
            case 11:
                statusName = "完成";
                break;
            case 12:
                statusName = "失败";
                break;
            case 13:
                statusName = "草稿";
                break;
            case 14:
                statusName = "已取回";
                break;
            case 15:
                statusName = "已换票";
                break;
            case 99:
                statusName = "";
            default:
                statusName = "其他";
        }
        return statusName;
    }

    //获取商务审批人
    getBussinApproves(plantformCode): Promise<string> {
        return this.invoiceApplyService
            .getApprovals(plantformCode, "ChequeBusinessPost")
            .then(res => {
                let bussinApprove = "";
                if (res.item.persons) {
                    for (let user of res.item.persons) {
                        bussinApprove += user.itcode + "/" + user.name + "，";
                    }
                }
                return bussinApprove;
            });
    }
    //获取财务审批人
    getFinaceApproves(plantformCode): Promise<string> {
        return this.invoiceApplyService
            .getApprovals(plantformCode, "ChequeFinanceApprove")
            .then(res => {
                let finaceApprove = "";
                if (res.item.persons) {
                    for (let user of res.item.persons) {
                        finaceApprove += user.itcode + "/" + user.name + "，";
                    }
                }
                return finaceApprove;
            });
    }
    export() {
        //EXCEL导出
        let day = new Date();
        day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        } else {
            this.getDate(day, "start");
        }

        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        } else {
            this.getDate(day, "end");
        }

        this.http
            .post(
                environment_java.server + "invoice/invoice-apply/exportExcel",
                this.queryPo,
                {
                    responseType: 3
                }
            )
            .map(res => res.json())
            .subscribe(data => {
                var blob = new Blob([data], {
                    type: "application/vnd.ms-excel"
                });
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    //判断是否为ie浏览器
                    window.navigator.msSaveBlob(blob, "invoiceReturn.xls");
                } else {
                    var objectUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.setAttribute("style", "display:none");
                    a.setAttribute("href", objectUrl);
                    a.setAttribute("download", "银行已接受EXCEL导出");
                    a.click();
                    URL.revokeObjectURL(objectUrl);
                }
            });
    }

    goDetail(id): void {
        if (this.applyPage == "3" && this.flag == "0") {
            //重新申请
            window.open(dbomsPath + "invoice/apply/invoice/" + id);
        } else if (this.applyPage == "0" && this.flag == "1") {
            //编辑
            window.open(dbomsPath + "invoice/apply/invoiceEdit/" + id);
        } else {
            //查看详情
            window.open(dbomsPath + "invoice/apply/invoicedetail/" + id);
        }
    }

    addsq() {
        window.open(dbomsPath + "invoice/apply/invoice/-1");
    }

    resetQuery() {
        // this.query = new Query();
        this.query.startDate = "";
        this.query.endDate = "";
        this.query.keyWords = "";
        this.query.payee = "";
    }

    exportFinanceExport() {
        this.queryPo.invoiceStatus = this.query.invoiceStatus;
        this.queryPo.param = this.query.keyWords;
        this.queryPo.startDate = this.query.startDate;
        this.queryPo.endDate = this.query.endDate;
        this.queryPo.businessItcode = this.query.businessItcode;
        this.queryPo.payee = this.query.payee;

        this.invoiceApproveService.exportFinanceExcelfile(this.queryPo);
    }
}
