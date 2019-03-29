import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { RedApplyService } from "../../service/ri-red.service";
import { dbomsPath } from "environments/environment";
declare var window;

export class PageNo { }
@Component({
    templateUrl: 'ri-list.component.html',
    styleUrls: ['ri-list.component.scss']
})
export class ReInvoiceComponent implements OnInit {

    constructor(
        private router: Router,
        private redApplyService: RedApplyService,
        private WindowService: WindowService) {
    }

    dataCreat = {//新建申请路由数据配置
        title: '我的申请',
        list: [{
            label: '新建冲红申请',
            url: '/reinvoice/red-apply',
        }, {
            label: '新建退换货申请',
            url: '/reinvoice/return-apply',
        }],
    };
    pager = new Pager();
    companys;//search 下拉框数据源
    leftNavName = '我的申请';//左侧导航名称
    myApplyList;//我的申请list
    applyPage = '审批';//我的申请tab状态
    myApproveList;//我的审批list
    approvePage = "未处理";
    myApplySearchParam = {"currentpage":1,"pagesize":10,"query":"","company":"","wfstatus":"审批"};//审批/草稿/完成
    myApproveSearchParam = {"currentpage":1,"pagesize":10,"query":"","company":"","taskstatus":"未处理"};//已处理/未处理/全部
    waitForApproveTotal = 0;
    needRefresh = false;//是否需要刷新
    loading: any = false;
    
    ngOnInit() {
        this.initTotalTask();
        this.search(this.leftNavName, this.applyPage);
        this.redApplyService.getBaseDataList().subscribe(data => {
            if (data.Result) {
                let tempArray = JSON.parse(data.Data)["companys"];
                this.companys = this.transSelectInfos(tempArray, "companycode", "company");
            } else {
                this.WindowService.alert({ message: data.Message, type: 'fail' });
            }
        });
        
        window.addEventListener("focus", () => {
            if (this.needRefresh == true) {
                this.initTotalTask();
                if (this.leftNavName == "我的申请") this.search(this.leftNavName, this.applyPage);
                if (this.leftNavName == "我的审批") this.search(this.leftNavName, this.approvePage);
            }
        });
    }

    //查询
    search(leftnavname, status, type?) {
        this.loading = true;
        this.leftNavName = leftnavname;
        if (leftnavname == "我的申请") {
            if (type == "clickSearch") this.myApplySearchParam.currentpage = 1;
            this.myApplySearchParam.wfstatus = this.applyPage = status;
            this.redApplyService.getIRApplyPageData(this.myApplySearchParam).subscribe(data => {
                this.loading = false;
                this.needRefresh = false;
                if (data.Result) {
                    this.myApplyList = JSON.parse(data.Data).pagedata;
                    // 重置pager
                    let pageSet = {
                        pageNo: 1,
                        total: JSON.parse(data.Data).totalnum,
                        totalPages: JSON.parse(data.Data).pagecount
                    };
                    if (type == "changePage") pageSet["pageNo"] = this.myApplySearchParam.currentpage;
                    this.pager.set(pageSet);
                }else{
                    this.WindowService.alert({ message: data.json().Message, type: 'fail' });
                }
            });
        }
        if (leftnavname == "我的审批") {
            if (type == "clickSearch") this.myApproveSearchParam.currentpage = 1;
            this.myApproveSearchParam.taskstatus = this.approvePage = status;
            this.redApplyService.getTaskList(this.myApproveSearchParam).subscribe(data => {
                this.loading = false;
                this.needRefresh = false;
                if (data.Result) {
                    this.myApproveList = JSON.parse(data.Data).pagedata;
                    // 重置pager
                    let pageSet = {
                        pageNo: 1,
                        total: JSON.parse(data.Data).totalnum,
                        totalPages: JSON.parse(data.Data).pagecount
                    };
                    if (type == "changePage") pageSet["pageNo"] = this.myApproveSearchParam.currentpage;
                    this.pager.set(pageSet);
                }else{
                    this.WindowService.alert({ message: data.json().Message, type: 'fail' });
                }
            });
        }
    }

    initTotalTask() {
        this.redApplyService.getTaskList(this.myApproveSearchParam).subscribe(data => {
            if (data.Result) {
                this.waitForApproveTotal = JSON.parse(data.Data).totalnum;
            } else {
                this.WindowService.alert({ message: data.json().Message, type: 'fail' });
            }
        });
    }
    
    //下拉框change事件
    selectedCompaney(e) {
        if (this.leftNavName == "我的申请") this.myApplySearchParam.company = e.text;
        if (this.leftNavName == "我的审批") this.myApproveSearchParam.company = e.text;
    }

    //tr 中列数据处理 
    changedata(arr) {
        let string = '';
        if (arr.length) {
            return arr.map((i) => { return string + `${i.nodename} ${i.approver}` })
        }
    };

    //删除
    delApplyByApplyID(item, i) {
        this.redApplyService.delApplyByApplyID(item["applyId"]).subscribe(data => {
            if (data.Result) {
                this.WindowService.alert({ message: "删除成功", type: 'success' });
                this.myApplyList.splice(i,1);
            } else {
                this.WindowService.alert({ message: data.Message, type: 'fail' });
            }
        });
    }
    
    //分页
    onChangePage(e) {
        if (this.leftNavName == "我的申请") {
            this.myApplySearchParam.currentpage = e.pageNo;
            this.myApplySearchParam.pagesize = e.pageSize;
            this.search(this.leftNavName, this.applyPage,"changePage");
        }
        if (this.leftNavName == "我的审批") {
            this.myApproveSearchParam.currentpage = e.pageNo;
            this.myApproveSearchParam.pagesize = e.pageSize;
            this.search(this.leftNavName, this.approvePage,"changePage");
        }
    }

    //下拉框数据源 id text 处理
    transSelectInfos(arr: Array<any>, id, text) {
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['id'] = item[id];
            newItem['text'] = item[text];
            newArr.push(newItem);
        });
        return newArr;
    }

    //页面跳转
    onClickTrRouter(item) {
        this.needRefresh = true;
        if (item["applyno"].indexOf("CH") > -1) {//冲红
            if (item["taskTableURL"]) {
                //是否包含nodeid=2 被驳回的单子 申请人重新提交
                if (String(item["taskTableURL"]).indexOf("nodeid=2") >= 0) {
                    window.open(dbomsPath + "reinvoice/red-apply?applyid=" + item["applyid"]);
                } else {
                    let urlParam = item["taskTableURL"].split("?")[1];
                    window.open(dbomsPath + "reinvoice/red-approve?" + urlParam);
                }
            } else {//查看 编辑
                if (item["wfstatus"] == "草稿" || (item["wfstatus"] == "驳回" && item["currentapprover"] && item["currentapprover"].length > 0 && item["currentapprover"][0]["nodename"] == "申请人")) {
                    window.open(dbomsPath + "reinvoice/red-apply?applyid=" + item["applyId"]);
                } else {
                    window.open(dbomsPath + "reinvoice/red-approve?applyid=" + item["applyId"]);
                }
            }
        }
        if (item["applyno"].indexOf("THH") > -1) {//退换货
            if (item["taskTableURL"]) {
                //是否包含nodeid=2 被驳回的单子 申请人重新提交
                if (String(item["taskTableURL"]).indexOf("nodeid=2") >= 0) {
                    window.open(dbomsPath + "reinvoice/return-apply?applyid=" + item["applyid"]);
                } else {
                    let urlParam = item["taskTableURL"].split("?")[1];
                    window.open(dbomsPath + "reinvoice/return-approve?" + urlParam);
                }
            } else {//查看 编辑
                if (item["wfstatus"] == "草稿" || item["wfstatus"] == "驳回") {
                    window.open(dbomsPath + "reinvoice/return-apply?applyid=" + item["applyId"]);
                } else {
                    window.open(dbomsPath + "reinvoice/return-approve?applyid=" + item["applyId"]);
                }
            }
        }
    }
}