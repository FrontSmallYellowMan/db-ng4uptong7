import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import {
    BorrowTransferQueryPo, BorrowTransferApply, TranSferService
} from './../../../services/tran-sfer.service';
import {
    Query
} from './../../../services/rtn-list.service';
import { dbomsPath } from 'environments/environment';
declare var window;
@Component({
    templateUrl: "./tran-sfer-list.component.html",
    styleUrls: ["./tran-sfer-list.component.scss"],
    providers: [TranSferService]
})
export class TranSferListComponent implements OnInit {
    query: BorrowTransferQueryPo = new BorrowTransferQueryPo();//查询条件
    applyFlag: string = "1";//1-我的申请 2-我的审批 显示哪个页签
    applyPage: string = "apply1";//草稿，待我审批，审批过的，审批中，全部 0-草稿
    tranSferList: BorrowTransferApply[] = [];//列表
    waitForApprovalNum: number;//待我审批条数
    pagerData = new Pager();
    loading: boolean = true;//加载中
    tipMessage: string = "";
    public idSort: any = false;//我的审批排序
    detailMessage: string = "";
    isShowMes: boolean = false;
    constructor(private http: Http, private route: Router, private windowService: WindowService, private service: TranSferService) { }
    ngOnInit() {
        //初始化方法
        // this.applyPage = "apply0";

        this.service.queryWaitForApprovalNum().then(res => { this.waitForApprovalNum = res });
        if (this.applyFlag === "1") {
            //我的申请
            this.query.flowStatus = this.applyPage.substring(5);
        } else {
            //我的审批
            this.query.flowStatus = this.applyPage.substring(8);
        }
    }
    applyOrApprove(displayPage: string) {
        //console.error("==============111=====ddd============");
        this.applyFlag = displayPage;
        if (this.applyFlag === "1") {
            this.applyPage = "apply1";//默认显示草稿列表
        } else {
            this.applyPage = "approval1";//默认显示待我审批列表
        }
        this.search();
    }
    search() {

        if (this.applyFlag === "1") {
            //我的申请
            this.query.flowStatus = this.applyPage.substring(5);
            this.query.needCreaterFilter = true;


        } else {
            //我的审批
            this.query.mycheckFilte = this.applyPage.substring(8);//我的审核状态：  1.待我审核  2.我已审核  3或者其他数字.全部   0.不开通
            if (this.query.mycheckFilte == "1") {
                this.query.flowStatus = "1";
            } else {
                this.query.flowStatus = "0";
            }

            this.query.needCreaterFilter = false;
        }

        //console.error("==============222222222222222=================");
        this.service.findTransApplys(this.pagerData.pageNo + "", this.pagerData.pageSize + "", this.query).then(data => {

            //console.log("data=" +JSON.stringify(data));

            this.tranSferList = data.list;
            if (data.list) {
                this.pagerData.set({
                    total: data.pager.total,
                    totalPages: data.pager.totalPages
                })
            }

            if (this.tranSferList.length < 1) {
                this.isShowMes = true;
                this.detailMessage = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
                if (this.applyFlag == "1") {
                    if (this.query.flowStatus == "1") {
                        this.tipMessage = "借用转移列表-我的申请-审批中为空";
                    } else if (this.query.flowStatus == "3") {
                        this.tipMessage = "借用转移列表-我的申请-已完成为空";
                        this.detailMessage = "";
                    } else if (this.query.flowStatus == "4") {
                        this.tipMessage = "借用转移列表-我的申请-草稿为空";
                    } else {
                        this.tipMessage = "借用转移列表-我的申请-全部为空";

                    }
                } else {
                    if (this.query.mycheckFilte == "1") {
                        this.tipMessage = "借用转移列表-我的审批-待我审批";
                        this.detailMessage = "你把小伙伴们的审批都批完啦，棒棒哒~";
                    } else if (this.query.mycheckFilte == "2") {
                        this.tipMessage = "借用转移列表-我的审批-我已审批";
                        this.detailMessage = "你还没审批过小伙伴的申请呢~";
                    } else {
                        this.tipMessage = "借用实转移列表-我的审批-全部";
                        this.detailMessage = "你还没审批过小伙伴的申请呢~";
                    }
                }
            } else {
                this.isShowMes = false;
            }

        });
        this.loading = false;
    }
    onChangePage = function (e) {
       // console.error("==============111=====222============");
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search();
    }

    //删除申请单
    deleteApply(applyId: string) {
        this.windowService.confirm({ message: `确定删除？` }).subscribe(v => {
            if (v) {
                this.service.deleteTranSfer(applyId).then(data => {
                    if (data.success) {
                        this.search();
                        this.windowService.alert({ message: "操作成功", type: "success" });
                    } else {
                        this.windowService.alert({ message: data.message, type: "fail" });
                    }
                });
            }
        })
    }



    /**
   * 变更某个子页签
   * @param whichTab 
   */
    changeapplytype(whichTab: string) {
        this.applyPage = whichTab;
        this.search();
    }

    //排序功能
    approvalSort() {
        this.idSort = !this.idSort;
        this.tranSferList.reverse();
    }
    newApply() {
        window.open(dbomsPath + "borrow/apply/transfer;flag=n");
    }
    goDetail(itemId,flowStatus): void {
        window.open(dbomsPath + "borrow/approve/tran-sfer;itemid="+itemId+";applypage=" + flowStatus);
    }
    editForm(itemId) {
        window.open(dbomsPath + 'borrow/apply/transfer;flag=e;itemid=' + itemId);
    }
}

