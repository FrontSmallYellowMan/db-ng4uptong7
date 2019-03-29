import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { environment_java, dbomsPath } from "environments/environment";
import { UserInfo } from '../../common/borrow-entitys';
declare var window;
import {
    Query,
    BorrowApply,
    BorrowListService,
    BorrowApplyPageParam
} from './../../../services/borrow-list.service';

export class PageNo { }
@Component({
    templateUrl: './borrow-list.component.html',
    styleUrls: ['./borrow-list.component.scss']
})
export class BorrowListComponent implements OnInit {

    query: Query;//查询条件
    query1: Query;//查询条件
    borrowApplyList: BorrowApplyPageParam[] = [];//借用申请列表
    borrowApplyList1: BorrowApplyPageParam[] = [];//借用申请列表
    applyUserList: UserInfo[] = [];//我的申请
    applyUserList1: UserInfo[] = [];//我的审批
    loading: boolean = true;//加载中效果
    pagerData = new Pager();
    myWaitNum: Number = 0;
    public myApplyShow = true;
    public myApplyEmpty = false;
    //public myApproveShow = false;
    public myApproveEmpty = true;
    public checkedApplyIds = [];
    public applyUserName: string = "";

    constructor(
        private router: Router,
        private http: Http,
        private borrowListService: BorrowListService,
        private xcModalService: XcModalService,
        private windowService: WindowService) {
    }

    name = '借用'
    ngOnInit() {

        this.query = new Query();
        this.query.flowStatus = "1";
        this.query.pageSize = 10;
        //---------
        this.query1 = new Query();
        this.query1.flowStatus = "1";
        this.query1.pageSize = 10;
        this.queryWaitMeNum();
        this.search1("1");
    }

    showApplyList() {
        this.myApplyShow = true;
        //this.myApplyEmpty=false;
        //this.myApproveShow = false;
        //this.myApproveEmpty = true;
        this.search1("0");
    }

    createBorrowPage() {
        window.open(dbomsPath + 'borrow/apply/borrow');
    }
    showApproveList() {
        this.myApplyShow = false;
        //this.myApplyEmpty=false;
        //this.myApproveShow = true;
        this.search2("0");
    }
    initData(query: Query) {
        query.pageSize = this.pagerData.pageSize;
        query.pageNo = this.pagerData.pageNo;
        this.applyUserList = [];
        this.borrowListService.getBorrowListList(query).then(data => {
            Object.assign(this.borrowApplyList, data.list);
            for (let item of this.borrowApplyList) {
                let user = new UserInfo();
                user.userCN = item.applyUserName;
                user.userEN = item.applyItCode.toLocaleLowerCase();
                user.userID = user.userEN;
                user.headName = item.baseDeptName;
                user.departName = item.subDeptName;
                user.platName = item.platformName;
                this.applyUserList.push(user);
                if (item.borrowAmount) {
                    item.borrowTotalAmount = +(item.borrowTotalAmount.toFixed(2));
                    item.borrowAmount = +(item.borrowAmount.toFixed(2));
                }

            }
            //console.error(this.checkedApplyIds.length+"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");
            if (this.checkedApplyIds.length > 0) {
                for (let apply of this.borrowApplyList) {
                    if (this.checkedApplyIds.indexOf(apply.mainApplyNo) != -1) {
                        apply.checked = true;
                    }
                    if (this.applyUserName != "") {
                        if (apply.applyUserName != this.applyUserName) {
                            apply.readonly = true;
                        }
                    }
                }
            }

            //设置分页器
            this.pagerData.set(data.pager);
            this.loading = false;
        })
    }
    gotoApplyRtn(applyId: string) {
        return false;
    }
    gotoApplySaleRtn(applyId: string) {

        return false;
    }
    gotoApplyTransfer() {
        return false;
    }
    clickTransferApply(e: any, apply: BorrowApplyPageParam) {
        if (e.target.checked) {
            if (this.checkedApplyIds.length == 0) {
                this.applyUserName = apply.applyUserName;
                for (var borrowApply of this.borrowApplyList) {
                    if (borrowApply.applyUserName != this.applyUserName) {
                        borrowApply.readonly = true;
                    }
                }
            }
            this.checkedApplyIds.push(apply.reservationNo);
        } else {
            this.checkedApplyIds.splice(this.checkedApplyIds.indexOf(apply.reservationNo), 1);
            if (this.checkedApplyIds.length == 0) {
                this.applyUserName = apply.applyUserName;
                for (var borrowApply of this.borrowApplyList) {
                    if (borrowApply.applyUserName != this.applyUserName) {
                        borrowApply.readonly = false;
                    }
                }
                this.applyUserName = "";
            }

        }
    }
    toTransferApply() {
        window.open(dbomsPath + "borrow/apply/transfer;flag=n;reservationNos=" + this.checkedApplyIds.join(","));
    }
    toRtnApply(item: BorrowApplyPageParam) {
        this.getReservationNos2(item.applyId).then(data => {
            window.open(dbomsPath + "borrow/apply/rtn;flag=n;reservationNos=" + data.message.split(",")[0]);
        });
    }
    toSealRtnApply(item: BorrowApplyPageParam) {
        this.getReservationNos2(item.applyId).then(data => {
            window.open(dbomsPath + "borrow/apply/turn-sale;flag=n;reservationNos=" + data.message.split(",")[0]);
        });
    }
    getReservationNos() {
        return this.borrowListService.getReservationNos(this.checkedApplyIds.join(","), '1');
    }
    getReservationNos2(checkedApplyId: string) {
        return this.borrowListService.getReservationNos(checkedApplyId, '2');
    }
    initData1(query: Query) {
        query.pageSize = this.pagerData.pageSize;
        query.pageNo = this.pagerData.pageNo;
        this.applyUserList1 = [];
        this.borrowListService.getBorrowApproval(query).then(data => {
            this.borrowApplyList1 = data.list;
            for (let item of this.borrowApplyList1) {
                let user = new UserInfo();
                user.userCN = item.applyUserName;
                user.userEN = item.applyItCode.toLocaleLowerCase();
                user.userID = user.userEN;
                user.headName = item.baseDeptName;
                user.departName = item.subDeptName;
                user.platName = item.platformName;
                this.applyUserList1.push(user);
                if (item.borrowAmount) {
                    item.borrowTotalAmount = +(item.borrowTotalAmount.toFixed(2));
                    item.borrowAmount = +(item.borrowAmount.toFixed(2));
                }
            }
            if (data.list) {
                this.pagerData.set({
                    total: data.pager.total,
                    totalPages: data.pager.totalPages
                })
            }
            //设置分页器
            this.pagerData.set(data.pager);
            this.loading = false;
        })
        this.loading = false;
       
    }
    onChangePager(e: any) {
        this.query.pageNo = e.pageNo;
        this.query.pageSize = e.pageSize;
        //console.log("pageSize=1==" + this.query1.pageSize);
        this.loading = true;
        this.initData(this.query);
    }
    onChangePager2(e: any) {
        this.loading = true;
        this.initData1(this.query1);
    }
    //搜索1
    search1(flowStatus) {
        this.query.flowStatus = flowStatus;
        this.loading = true;
        this.initData(this.query);
    }
    //搜索1
    search2(flowStatus) {
        this.query1.flowStatus = flowStatus;
        this.loading = true;
        this.initData1(this.query1);
        this.queryWaitMeNum();
    }
    //弹出窗口关闭页面后刷新
    search() {
       // console.log(this.myApplyShow);
        if (this.myApplyShow) {
            this.loading = true;
            this.initData(this.query);
        } else {
            this.loading = true;
            this.initData1(this.query1);
            this.queryWaitMeNum();
        }
    }
    openBorrowPage(applyId: string) {
        // 
        if (this.myApplyShow) {
            if (this.query.flowStatus != '0') {
                window.open(dbomsPath + "borrow/approve/borrow-rc;applyId=" + applyId + ";applypage=-1");
            }
            else {
                window.open(dbomsPath + "borrow/apply/borrow/" + applyId);
                //this.router.navigate(["/borrow/apply/borrow/"+applyId]);
            }
        } else {
            window.open(dbomsPath + "borrow/approve/borrow-rc;applyId=" + applyId + ";applypage=" + this.query1.flowStatus);
        }
    }
    queryWaitMeNum() {
        this.http.get(environment_java.server + "borrow/borrow-apply/wait-me")
            .toPromise().then(response => response.json()).then(data => {
                this.myWaitNum = data.item;
               // console.info(this.myWaitNum);
            });
    }
}
