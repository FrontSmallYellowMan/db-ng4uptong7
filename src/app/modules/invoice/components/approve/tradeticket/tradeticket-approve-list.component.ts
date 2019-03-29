import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { RequestOptionsArgs, RequestOptions } from "@angular/http";
import { Pager, XcModalService, XcModalRef } from "../../../../../shared/index";
import {
    Query,
    UserInfo,
    TradeTicketInfo
} from "../../apply/invoice/invoice-info";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
import { WindowService } from "../../../../../core/index";
import { InvoiceDetailComponent } from "../../detail/invoice-detail.component";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import { TradeTicketService } from "../../../services/tradeticket/tradeticket-apply.service";
declare var window, Blob, document, URL;
@Component({
    templateUrl: "./tradeticket-approve-list.component.html",
    styleUrls: ["./tradeticket-approve-list.component.scss"]
})
export class TradeTicketApproveListComponent implements OnInit {
    //审批按钮点击后锁定按钮
    public clickFlag: boolean = true;
    public clickFlag2: boolean = true;
    public clickFlag3: boolean = true;
    public tradeStatus: string = "3";
    loading: boolean = true; //加载中效果
    public loginUser: UserInfo = new UserInfo();
    public tradeticketList = new Array<TradeTicketInfo>(); //列表数据
    public payeeList = [];
    public businessList = new Array<any>();
    public payeeAllCount = 0;
    //分页
    public pagerData = new Pager();
    public query: Query = new Query(); //查询条件

    public fullChecked = false; //全选状态
    public fullCheckedIndeterminate = false; //半选状态
    public checkedNum = 0;
    public clospanNum: number = 11;

    //页签
    public applyPage: string = "all";

    constructor(
        private activatedRouter: ActivatedRoute,
        private windowService: WindowService,
        private invoiceApplyService: InvoiceApplyService,
        private tradeTicketService: TradeTicketService,
        private invoiceApproveService: InvoiceApproveService
    ) {}

    name = "交存审批";
    ngOnInit() {
        //获取登录人信息
        this.getLoginUser();
        //每次点击左侧连接，初始化页面
        this.activatedRouter.params.subscribe((params: Params) => {
            this.loading = true;
            //清空查询条件查询
            this.query.tradeStatus = params["flowStatus"];
            this.clospanNum = params["clospanNum"];
            this.fullChecked = false;
            this.fullCheckedIndeterminate = false;
            this.query.endDate = "";
            this.query.startDate = "";
            this.query.keyWords = "";
            this.query.payee = "";
            this.query.businessItcode = "";
            this.query.pageNo = 1;
            this.applyPage = "all";
            this.getApproveList();
            this.getBusinessList();
            this.getPayeeCountList();
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
    }

    getQueryData() {
        this.loading = true;
        this.query.payee = "";
        this.getApproveList();
    }

    reset() {
        //重置搜索数据
        let day = new Date();
        let day2 = new Date();
        day.setTime(day.getTime() - 7 * 24 * 60 * 60 * 1000);
        this.query.keyWords = "";
        this.query.payee = "";
        this.query.businessItcode = "";
        this.query.startDate = day;
        this.query.endDate = day2;
        if (
            this.query.tradeStatus == "3" ||
            this.query.tradeStatus == "4" ||
            this.query.tradeStatus == "5,8" ||
            this.query.tradeStatus == "3,4,5,8"
        ) {
            this.query.tradeStatus = "3";
            this.tradeStatus = "3";
        }
        if (
            this.query.tradeStatus == "6,7,9,10" ||
            this.query.tradeStatus == "6,9" ||
            this.query.tradeStatus == "7,10"
        ) {
            this.query.tradeStatus = "6,7,9,10";
            this.applyPage = "all";
        }
        this.getBusinessList();
        this.getQueryData();
    }

    getApproveList() {
        let day = new Date();
        let day2 = new Date();
        day.setTime(day.getTime() - 10 * 24 * 60 * 60 * 1000);
        let pagerData = this.pagerData;
        this.query.pageNo = pagerData.pageNo;
        this.query.pageSize = pagerData.pageSize;
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        } else {
            this.getDate(day, "start");
        }

        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        } else {
            this.getDate(day2, "end");
        }
        this.tradeTicketService.getApproveList(this.query).then(res => {
            if (res.list) {
                this.tradeticketList = res.list;
                for (let i = 0; i < this.tradeticketList.length; i++) {
                    this.tradeticketList[i].num =
                        (pagerData.pageNo - 1) * pagerData.pageSize + (i + 1);
                }
                //设置分页器
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                }
                this.loading = false;
            }
        });
    }

    public currentPageSize; //当前每页显示条数
    onChangePage(e: any): void {
        this.loading = true;
        //非第一页，切换条数。跳为第一页
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
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
        this.tradeticketList
            .filter(tradeTicket => tradeTicket.checked === true)
            .forEach(tradeTicket => {
                idStr += tradeTicket.id + ",";
            });
        this.tradeTicketService
            .approveTradeticket(idStr.substring(0, idStr.length - 1), f)
            .then(res => {
                if (res.success) {
                    this.fullCheckedIndeterminate = false;
                    this.fullChecked = false;
                    this.getApproveList();
                    this.getPayeeCountList();
                    this.clickFlag = true;
                    this.clickFlag2 = true;
                    this.clickFlag3 = true;
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
        this.tradeticketList
            .filter(tradeTicket => tradeTicket.checked === true)
            .forEach(tradeTicket => {
                //拒收取走
                if (
                    tradeTicket.tradeStatus == 5 ||
                    tradeTicket.tradeStatus == 6
                ) {
                    if (f == 1) {
                        //商务人员取走
                        this.tradeTicketService
                            .approveTradeticket(tradeTicket.id, "6")
                            .then(res => {
                                if (res.success) {
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.clickFlag = true;
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
                        this.tradeTicketService
                            .approveTradeticket(tradeTicket.id, "7")
                            .then(res => {
                                if (res.success) {
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.clickFlag = true;
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
                if (
                    tradeTicket.tradeStatus == 8 ||
                    tradeTicket.tradeStatus == 9
                ) {
                    if (f == 1) {
                        //商务人员取走
                        this.tradeTicketService
                            .approveTradeticket(tradeTicket.id, "9")
                            .then(res => {
                                if (res.success) {
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.clickFlag = true;
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
                        this.tradeTicketService
                            .approveTradeticket(tradeTicket.id, "10")
                            .then(res => {
                                if (res.success) {
                                    this.fullCheckedIndeterminate = false;
                                    this.fullChecked = false;
                                    this.getApproveList();
                                    this.getPayeeCountList();
                                    this.clickFlag = true;
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
        this.fullCheckedIndeterminate = false;
        this.fullChecked = false;
        this.getApproveList();
        this.getPayeeCountList();
        this.clickFlag = true;
        this.windowService.alert({ message: "操作成功", type: "success" });
    }

    refuse(id: string, tradeStatus: string) {
        let confirmStr = "";
        if (tradeStatus == "5") {
            confirmStr = "是否确认银行拒收该商票？";
        } else if (tradeStatus == "8") {
            confirmStr = "是否确认银行退回该商票？";
        } else {
            confirmStr = "是否确认取回该商票？";
        }
        this.windowService.confirm({ message: confirmStr }).subscribe(r => {
            if (r) {
                this.tradeTicketService
                    .approveTradeticket(id, tradeStatus)
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

    //点击收款人页签事件
    changePayee(payee: string): void {
        this.loading = true;
        if (payee == "all") {
            this.query.payee = "";
        } else {
            this.query.payee = payee;
        }
        this.applyPage = payee;
        this.getApproveList();
    }

    //点击页签事件
    changeapplytype(flowstates: string): void {
        this.loading = true;
        this.applyPage = flowstates;
        this.query.tradeStatus = flowstates;
        if (flowstates == "all") {
            this.query.tradeStatus = "6,7,9,10";
        }
        this.getApproveList();
    }

    //点击商票状态单选按钮
    changeInvoiceStauts(tradeStatus: string): void {
        this.loading = true;
        this.query.tradeStatus = tradeStatus;
        this.getApproveList();
        this.getPayeeCountList();
    }

    //选择商务接口人radio事件
    changeBusiness(businessItcode: string) {
        this.loading = true;
        this.query.businessItcode = businessItcode;
        this.getApproveList();
        this.getPayeeCountList();
    }
    getIqDate(date, flag) {
        this.loading = true;
        if (flag == "end") {
            this.query.endDate = date;
        } else {
            this.query.startDate = date;
        }
        this.getApproveList();
    }
    getDate(date, flag) {
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
        this.payeeAllCount = 0; //全部数量
        this.tradeTicketService.getPayeeCountList(this.query).then(resp => {
            this.payeeList = resp.list;
            if (resp.list) {
                resp.list.forEach(
                    payee => (this.payeeAllCount += parseInt(payee.payeeCount))
                );
            }
        });
    }

    /**
     * 获取商务接口人列表
     */
    getBusinessList() {
        this.tradeTicketService.getBusinessList().then(resp => {
            this.businessList = resp.list;
        });
    }
    goDetail(id): void {
        if (this.query.tradeStatus == "0") {
            //编辑
            window.open("/invoice/apply/tradeticketEdit/" + id);
        } else {
            //详情
            window.open("/invoice/apply/tradeticketDetail/" + id);
        }
    }
}
