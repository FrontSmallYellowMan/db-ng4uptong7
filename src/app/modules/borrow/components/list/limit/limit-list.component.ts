import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { NgForm, NgModel } from "@angular/forms";
import { LimitListService, QueryParams, QueryPo } from './../../../services/limit-list.service';
import { BorrowAmount } from './../../limit';
import { environment_java, dbomsPath } from 'environments/environment';
export class PageNo { }
declare var window;
@Component({
    templateUrl: './limit-list.component.html',
    providers: [LimitListService],
    styleUrls: ['./limit-list.component.scss', '../../../scss/borrow-private.component.scss']
})
export class LimitListComponent implements OnInit {
    applyPage: string = "apply1";
    currentPageSize: string;
    public pagerData = new Pager();
    params: QueryParams = new QueryParams();
    borrowAmountData: BorrowAmount[] = [];
    @ViewChild("applydiv")
    applydiv;
    applyFlag: string = "1";//1-我的申请 2-我的审批
    waitForApprovalNum: number;//待我审批的条数
    highSearchShow: boolean = false;//高级搜索
    canApply: boolean = false;//是否可以新建
    //获取不到列表的提示信息及具体信息
    tipMessage: string;//提示信息
    detailMessage: string;//详情
    img1: string;//显示的图标
    constructor(private http: Http, private route: Router, private limitListService: LimitListService, private windowService: WindowService) {

    }
    ngOnInit() {
        //this.limitListService.queryWaitForApprovalNum().then(res => { this.waitForApprovalNum = res });
        //查询有没有新建权限
        this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    let roleCodes = data.item;
                    //运作总监可新建    
                    if (roleCodes.indexOf("0000000006") >= 0 || roleCodes.indexOf("0000000013") >= 0) this.canApply = true;
                }
            }
            );
        this.search();
    }
    // querywaitForNum(){
    //     this.limitListService.queryWaitForApprovalNum().then(res => { this.waitForApprovalNum = res });
    // }
    //打开高级搜索
    openSearch() {
        this.highSearchShow = true;
    }

    //收起高级搜索
    closeSearch() {
        this.highSearchShow = false;
    }
    /**
     * 显示我的申请还是我的审批
     * @param displayPage 
     */
    applyOrApprove(displayPage: string) {
        this.applyFlag = displayPage;
        if (this.applyFlag === "1") {
            this.applyPage = "apply1";//默认显示审批中列表
        } else {
            this.applyPage = "approval1";//默认显示待我审批列表
        }
        this.search();
    }
    /**
     * 变更某个子页签
     * @param whichTab 
     */
    changeapplytype(whichTab: string) {
        this.applyPage = whichTab;
        this.search();
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
            this.params.staDate = temp;
        } else if (flag == "end") {
            this.params.endDate = temp;
        }
    }
    //查询列表
    search() {
        this.params.pageNo = this.pagerData.pageNo;
        this.params.pageSize = this.pagerData.pageSize;
        if (this.applyFlag === "1") {
            //我的申请
            this.params.flowState = this.applyPage.substring(5);
        } else {
            //我的审批
            this.params.flowState = this.applyPage.substring(8);
        }
        // console.log(this.params.staDate + " " + this.params.endDate);
        // if (this.params.staDate && this.params.staDate != '') {
        //     this.params.staDate = new Date(this.params.staDate).toLocaleDateString();
        // }
        // if (this.params.endDate && this.params.endDate != '') {
        //     this.params.endDate = new Date(this.params.endDate).toLocaleDateString();
        // }
        if (this.params.staDate != '' && this.params.staDate != undefined) {
            this.getDate(this.params.staDate, 'start');
        }
        if (this.params.endDate != '' && this.params.endDate != undefined) {
            this.getDate(this.params.endDate, 'end');
        }
        this.borrowAmountData = [];
        //console.log('22');
        this.limitListService.searchList(this.params, this.applyFlag).subscribe(data => {
            let res = data.item;
            this.waitForApprovalNum = res.waitForApprovalNum;
            if (res.list) {
                this.borrowAmountData = res.list;
                if (res.list.length > 0) {
                    for (let i = 0; i < this.borrowAmountData.length; i++) {
                        this.borrowAmountData[i].num = (this.pagerData.pageNo - 1) * this.pagerData.pageSize + (i + 1);
                    }
                } else {
                    //获取不到列表
                    this.detailMessage = "快来点击右上角“新建申请”按钮，开始新建申请吧~";
                    if (this.applyPage == "apply1") {
                        this.tipMessage = "额度申请列表-我的申请-审批中为空";
                    } else if (this.applyPage == "apply3") {
                        this.tipMessage = "额度申请列表-我的申请-已完成为空";
                        this.detailMessage = "";
                    } else if (this.applyPage == "apply") {
                        this.tipMessage = "额度申请列表-我的申请-全部为空";
                    } else if (this.applyPage == "apply0") {
                        this.tipMessage = "额度申请列表-我的申请-草稿为空";
                    } else if (this.applyPage == "approval1") {
                        this.tipMessage = "额度申请列表-我的审批-待我审批";
                        this.detailMessage = "你把小伙伴们的审批都批完啦，棒棒哒~";
                    } else if (this.applyPage == "approval3") {
                        this.tipMessage = "额度申请列表-我的审批-我已审批";
                        this.detailMessage = "你还没审批过小伙伴的申请呢~";
                    } else if (this.applyPage == "approval0") {
                        this.tipMessage = "额度申请列表-我的审批-全部";
                        this.detailMessage = "你还没审批过小伙伴的申请呢~";
                    }
                }
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    })
                }
            }
        });
    }

    //删除申请单
    deleteApply(applyId: string) {
        this.windowService.confirm({ message: `确定删除？` }).subscribe(v => {
            if (v) {
                this.limitListService.deleteLimitApply(applyId).then(data => {
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
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search();
    }
    //转化utc日期串为yyyy/MM/dd的格式
    // convertUTCStr(utcdate) {
    //     if (utcdate === undefined) {
    //         return utcdate;
    //     } else {
    //         let datestr = new Date(utcdate).getUTCFullYear() + "/" +
    //             (new Date(utcdate).getUTCMonth() > 8 ? (new Date(utcdate)).getMonth() + 1 : "0" + (new Date(utcdate).getMonth() + 1))
    //             + "/" + (new Date(utcdate).getDate() > 9 ? new Date(utcdate).getDate() : "0" + new Date(utcdate).getDate());
    //         return datestr;
    //     }
    // }
    //重置查询条件
    clearSearch() {
        Object.keys(this.params).forEach(key => this.params[key] = "");
        //this.params.isBaseStr = "1";
        Object.assign(this.pagerData, this.params);
    }
    export() {
        let expParam: QueryPo = new QueryPo();
        expParam.applyFlag = this.applyFlag;
        expParam.isDept = this.params.isBaseStr;
        expParam.deptName = this.params.deptName;
        expParam.flowState = this.params.flowState;
        if (this.params.staDate != '' && this.params.staDate != undefined) {
            this.getDate(this.params.staDate, 'start');
            expParam.staDate = this.params.staDate;
        }
        if (this.params.endDate != '' && this.params.endDate != undefined) {
            this.getDate(this.params.endDate, 'end');
            expParam.endDate = this.params.endDate;
        }
        this.limitListService.export(expParam);
    }
    newApply() {
        window.open(dbomsPath + "borrow/apply/limit;flag=n");
    }
    goDetail(itemId): void {
        window.open(dbomsPath + "borrow/approve/limit-rc;id=" + itemId);
    }
    editForm(itemId){
        window.open(dbomsPath + 'borrow/apply/limit;flag=e;itemid='+itemId);
    }
}

