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
import { Query, InvoiceInfo, UserInfo } from "../../apply/invoice/invoice-info";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs";
import { InvoiceApproveService } from "../../../services/invoice/invoice-approve.service";
import { WindowService } from "../../../../../core/index";
import { InvoiceApproveEditComponent } from "./editForm/invoice-approve-edit.component";
import { InvoiceDetailComponent } from "../../detail/invoice-detail.component";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";

@Component({
    templateUrl: "./invoice-approve-list.component.html"
})
export class InvoiceApproveListComponent implements OnInit {
    public loginUser: UserInfo = new UserInfo();
    public invoiceList = new Array<InvoiceInfo>(); //列表数据
    public payeeList = [];
    public businessList = [];
    public payeeAllCount = 0;
    //分页
    public pagerData = new Pager();
    public query: Query = new Query(); //查询条件

    public fullChecked = false; //全选状态
    public fullCheckedIndeterminate = false; //半选状态
    public checkedNum = 0;
    public editForm: XcModalRef;
    public detailForm: XcModalRef;

    //页签
    public applyPage: string = "all";

    constructor(
        private http: Http,
        private router: Router,
        private activatedRouter: ActivatedRoute,
        private windowService: WindowService,
        private invoiceApplyService: InvoiceApplyService,
        private xcModalService: XcModalService,
        private invoiceApproveService: InvoiceApproveService
    ) {}

    name = "交存审批";
    ngOnInit() {
        //获取登录人信息
        this.getLoginUser();
        //每次点击左侧连接，初始化页面
        this.activatedRouter.params.subscribe((params: Params) => {
            //清空查询条件查询
            this.query.invoiceStatus = params["flowStatus"];
            this.fullChecked = false;
            this.fullCheckedIndeterminate = false;
            this.query.endDate = "";
            this.query.startDate = "";
            this.query.keyWords = "";
            this.query.payee = "";
            this.query.businessItcode = "";
            this.applyPage = "all";
            this.getApproveList();
        });

        //在初始化的时候 创建模型
        //编辑组件
        this.editForm = this.xcModalService.createModal(
            InvoiceApproveEditComponent
        );
        //查看组件
        this.detailForm = this.xcModalService.createModal(
            InvoiceDetailComponent
        );
        //模型关闭的时候 如果有改动，请求刷新
        this.editForm.onHide().subscribe(data => {
            if (data) {
                //refresh
                this.getApproveList();
            }
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
        this.query.payee = "";
        this.getApproveList();
    }

    getApproveList() {
        let day = new Date();
        day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
        //明天的时间
        var tomorrow =
            day.getFullYear() +
            "-" +
            (day.getMonth() + 1) +
            "-" +
            day.getDate();

        let pagerData = this.pagerData;
        this.query.pageNo = pagerData.pageNo;
        this.query.pageSize = pagerData.pageSize;
        if (this.query.startDate != "" && this.query.startDate != undefined) {
            this.getDate(this.query.startDate, "start");
        } else {
            this.query.startDate = tomorrow;
        }

        if (this.query.endDate != "" && this.query.endDate != undefined) {
            this.getDate(this.query.endDate, "end");
        } else {
            this.query.endDate = tomorrow;
        }

        this.getBusinessList();
        this.getPayeeCountList();
        this.invoiceApproveService.getApproveList(this.query).then(res => {
            // res.list = [];
            if (res.list) {
                this.invoiceList = res.list;
                for (let i = 0; i < this.invoiceList.length; i++) {
                    this.invoiceList[i].saveStatus = 1;
                    this.invoiceList[i].num =
                        (pagerData.pageNo - 1) * pagerData.pageSize + (i + 1);
                }
                //设置分页器
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    });
                }
            }
        });
    }

    public currentPageSize; //当前每页显示条数
    onChangePage(e: any): void {
        //非第一页，切换条数。跳为第一页
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize;
        this.query.pageNo = e.pageNo;
        this.query.pageSize = e.pageSize;
        //this.getInvoiceList();
    }

    //审批通过/拒绝
    approve(f) {
        let idStr = "";
        this.invoiceList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                idStr += invoice.id + ",";
            });
        this.invoiceApproveService
            .approveInvoice(idStr.substring(0, idStr.length - 1), f)
            .then(res => {
                if (res.success) {
                    this.fullCheckedIndeterminate = false;
                    this.fullChecked = false;
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

    //退票/拒收状态的票据审批
    approve2(f) {
        this.invoiceList
            .filter(invoice => invoice.checked === true)
            .forEach(invoice => {
                //拒收取走
                if (invoice.invoiceStatus == 5 || invoice.invoiceStatus == 6) {
                    if (f == 1) {
                        //商务人员取走
                        this.invoiceApproveService.approveInvoice(
                            invoice.id,
                            "6"
                        );
                    }
                    if (f == 2) {
                        //申请人员取走
                        this.invoiceApproveService.approveInvoice(
                            invoice.id,
                            "7"
                        );
                    }
                }
                //退票取走
                if (invoice.invoiceStatus == 8 || invoice.invoiceStatus == 9) {
                    if (f == 1) {
                        //商务人员取走
                        this.invoiceApproveService.approveInvoice(
                            invoice.id,
                            "9"
                        );
                    }
                    if (f == 2) {
                        //申请人员取走
                        this.invoiceApproveService.approveInvoice(
                            invoice.id,
                            "10"
                        );
                    }
                }
            });
        this.fullCheckedIndeterminate = false;
        this.fullChecked = false;
        this.getApproveList();
        this.getPayeeCountList();
        this.windowService.alert({ message: "操作成功", type: "success" });
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
                            if (
                                this.query.invoiceStatus == "1" ||
                                this.query.invoiceStatus == "2" ||
                                this.query.invoiceStatus == "3" ||
                                this.query.invoiceStatus == "4" ||
                                this.query.invoiceStatus == "5,8"
                            ) {
                                this.getPayeeCountList();
                            }
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
        this.applyPage = flowstates;
        this.query.invoiceStatus = flowstates;
        if (flowstates == "all") {
            this.query.invoiceStatus = "6,7,9,10";
        }
        this.getApproveList();
    }

    //点击支票状态单选按钮
    changeInvoiceStauts(invoiceStatus: string): void {
        this.query.invoiceStatus = invoiceStatus;
        this.getApproveList();
        this.getPayeeCountList();
    }

    //选择商务接口人radio事件
    changeBusiness(businessItcode: string) {
        this.query.businessItcode = businessItcode;
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
        this.invoiceApproveService.getPayeeCountList(this.query).then(resp => {
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
        this.invoiceApproveService
            .getBusinessList()
            .then(resp => (this.businessList = resp.list));
    }
}
