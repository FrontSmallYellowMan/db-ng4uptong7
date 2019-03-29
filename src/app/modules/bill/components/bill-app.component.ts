
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { dbomsPath } from "environments/environment";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Pager } from 'app/shared/index';
import { billBackService } from '../services/bill-back.service';
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';

export class PageNo { }
@Component({
    templateUrl: 'bill-app.component.html',
    styleUrls: ['bill-app.component.scss']
})
export class BillAppComponent implements OnInit {

    constructor(private _location: Location, private router: Router, private dbHttp: HttpServer, private billBackService: billBackService, private WindowService: WindowService) {

    }

    public loginNodeId;
    public ApplyPageData;//申请list
    public jsondata;
    public changedata(arr) {
        let string = '';
        if (arr.length) {
            return arr.map((i) => { return string + `${i.nodename} ${i.approver}` })
        }
    };

    public getMyListData;//审批list
    public pagerData = new Pager();
    public titleli = '我的申请';
    public dataCreat = {
        title: '我的申请',
        list: [{
            label: '新建冲红申请',
            url: '/bill/creat',
        }, {
            label: '新建退换货申请',
            url: '/bill/return-new',
        }],
    };

    public searchres = false;//显示查找结果
    //申请小tab状态
    public applyPage = '审批';

    //条件查找
    public selectedCompaneyData;
    public selectedCompaney(e) {
        this.selectedCompaneyData = e.text;
    }
    public InvoicePeopleITCode;
    public myApplyShow = true;
    public myApproveShow;
    public liMyApply = true;
    public litMyList;
    public liDoneList;
    // 我的申请
    public getMyApply(e) {
        this.titleli = '我的申请';
        this.myApplyShow = true;
        this.litMyList = false;
        this.liMyApply = true;
        this.liDoneList = false;
        this.myApproveShow = false;
        this.applyPage = e;
        //修改list
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/GetIRApplyPageData";
        let backData = { "currentpage": 1, "pagesize": 10, "query": "", "company": "", "wfstatus": e };
        this.dbHttp.post(url, backData, options)
            .toPromise()
            .then(data => {
                if (!data.Result) {
                    this.WindowService.alert({ message: data.json().Message, type: 'fail' });
                    return false;
                }
                this.ApplyPageData = JSON.parse(data.Data).pagedata;
                this.PageDataFlag = JSON.parse(data.Data)
                // 重置pager
                this.pagerData.set({
                    total: this.PageDataFlag.totalnum,
                    totalPages: this.PageDataFlag.pagecount
                })
                for (let i = 0, len = this.ApplyPageData.length; i < len; i++) {
                    this.ApplyPageData[i].applydate = this.ApplyPageData[i].applydate.split(" ")[0]
                }
                // this.resetalltotal('ApplyPageData', this.applyPage);
            })
    }

    public sendApproveList = [];
    public sendApproveData = {
        taskid: '',
        recordid: '',
        nodeid: '',
        APID: '',
        ADP: ''
    };
    public approvePage = "全部";
    public searchList;
    //我的审批
    public getMyList(e) {
        this.titleli = '我的审批';
        this.myApplyShow = false;
        this.myApproveShow = true;
        this.litMyList = true;
        this.liMyApply = false;
        // this.liDoneList = false;
        this.approvePage = e;
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let data = { "currentpage": 1, "pagesize": 10, "company": "", "taskstatus": e }
        let body = JSON.stringify(data);
        this.dbHttp.post("InvoiceRevise/GetTaskList", body, options)
            .subscribe(res => {
                if (!res.Result) {
                    this.WindowService.alert({ message: res.json().Message, type: 'fail' });
                    return false;
                }
                this.getMyListData = JSON.parse(res.Data).pagedata;
                console.log(this.getMyListData);
                //重置pager
                this.PageDataFlag = JSON.parse(res.Data);
                this.pagerData.set({
                    total: this.PageDataFlag.totalnum,
                    totalPages: this.PageDataFlag.pagecount
                })

                let urlOld = [];
                this.sendApproveList = [];
                for (let i = 0, len = this.getMyListData.length; i < len; i++) {
                    urlOld.push(this.getMyListData[i].taskTableURL);
                    let data = this.getMyListData[i].currentapprove.split(":");
                    this.getMyListData[i].currentapproveId = data[1];
                }
                this.searchList = this.getMyListData;
                if (this.searchList.length > 0) {
                    let urlOld = [];
                    for (let i = 0, len = this.searchList.length; i < len; i++) {
                        urlOld.push(this.searchList[i].taskTableURL);
                        let data = this.searchList[i].currentapprove.split(":")
                        this.searchList[i].currentapproveId = data[1];
                    }
                    console.log(this.searchList);
                    let urlArr = [];
                    let urlArrNew = [];
                    let urlParamsArr = [];
                    for (let i = 0, len = urlOld.length; i < len; i++) {
                        let urlParam = urlOld[i].split("?")[1];
                        let urlParams = urlParam.split("&");
                        urlParamsArr.push(urlParams);
                    }
                    console.log(urlParamsArr);
                    for (let n = 0, len = urlParamsArr.length; n < len; n++) {
                        for (let i = 0, len = urlParamsArr[n].length; i < len; i++) {
                            let temp = urlParamsArr[n][i].split("=");
                            let key = temp[0];
                            let value = temp[1];
                            this.sendApproveData[key] = value;
                        }
                        let obj = JSON.parse(JSON.stringify(this.sendApproveData));
                        this.sendApproveList.push(obj);
                    }
                }
                console.log(this.sendApproveList)
            })
    }

    //删除
    public removeRedItem(e) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/DelApply/" + e.applyId
        this.dbHttp.post(url, [], options)
            .toPromise()
            .then(res => {
                let backData = JSON.parse(res.json().Data);
                console.log(12312)
                this.getMyApply('')
            })
    }
    //查找输入
    public getmMessageList() {
        let url = "InvoiceRevise/GetIRApplyPageData"
        let body = {
            "currentpage": 1,
            "pagesize": 10,
            "externalinvoiceno": "",
            "originalcustomer": this.InvoicePeopleITCode,
            "company": this.selectedCompaneyData
        }
        console.log(123)
        // {"currentpage":1,"pagesize":20,"query":"查询条件","company":"公司","wfstatus":"审批/草稿/完成"}
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, body, options)
            .toPromise()
            .then(res => {
                // this.searchres = true;
                this.ApplyPageData = JSON.parse(res.json().Data).pagedata;
                this.PageDataFlag = JSON.parse(res.json().Data)
                // 重置pager
                this.pagerData.set({
                    total: this.PageDataFlag.totalnum,
                    totalPages: this.PageDataFlag.pagecount
                })
                for (let i = 0, len = this.ApplyPageData.length; i < len; i++) {
                    this.ApplyPageData[i].applydate = this.ApplyPageData[i].applydate.split(" ")[0]
                }
            })
    }
    public PageDataFlag;

    public CurrentNodeFlag = true;//查看判断
    public getCurrentNode(e, item) {
        let url = "InvoiceRevise/GetCurrentApproveNodeInfo/" + e;
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, {}, options).pipe(
            map(res => res.json()))
            .subscribe(
            (data) => {
                this.CurrentNodeFlag = false;
                item.currentapprove = data.Data;
            })
    }
    public changeCurrentNodeFlag(item) {
        this.CurrentNodeFlag = true;
        item.currentapprove = '';
    }
    public onChangePage(e, num) {
        let pagNum = e.pageNo;
        let url;
        let queryFlag;
        if (num == 1) {
            url = "InvoiceRevise/GetIRApplyPageData";
            queryFlag = this.applyPage;
        }
        else if (num == 2) {
            url = "InvoiceRevise/GetTaskList";
            queryFlag = this.approvePage;
        }
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, {
            currentpage: pagNum,
            pagesize: e.pageSize,
            query: "",
            wfstatus: queryFlag
        }, options).pipe(
            map(res => res))
            .subscribe(
            (data) => {
                // let goUrl = this._location.path();
                // if (data.Message == "请先登录") {
                //     this.router.navigate(['/login'], { queryParams: { returnUrl: goUrl } });
                // }
                if (num == 1) {
                    if (!data.Result) {
                        this.WindowService.alert({ message: data.json().Message, type: 'fail' });
                        return false;
                    }
                    else {
                        this.ApplyPageData = JSON.parse(data.Data).pagedata;
                        this.PageDataFlag = JSON.parse(data.Data);
                        // for (let i = 0, len = this.ApplyPageData.length; i < len; i++) {
                        //     this.ApplyPageData[i].applydate = this.ApplyPageData[i].applydate.split(" ")[0]
                        // }
                    }
                }
                if (num == 2) {
                    if (!data.Result) {
                        this.WindowService.alert({ message: data.json().Message, type: 'fail' });
                        return false;
                    }
                    this.getMyListData = JSON.parse(data.Data).pagedata;
                    //重置pager
                    this.PageDataFlag = JSON.parse(data.Data);
                    this.pagerData.set({
                        total: this.PageDataFlag.totalnum,
                        totalPages: this.PageDataFlag.pagecount
                    })
                    let urlOld = [];
                    for (let i = 0, len = this.getMyListData.length; i < len; i++) {
                        urlOld.push(this.getMyListData[i].taskTableURL);
                        this.getMyListData[i].currentapprove = this.getMyListData[i].currentapprove.split(":")[0];
                    }
                }
            });
    }
    routerJump(type, id) {//点击列表跳转的判断
        if (type == '0') {
            window.open(id);
        } else {
            window.open(dbomsPath +'bill/check/'+id);
        }
    }
    // public onChooseNo(e) {
    //     console.log(e);
    // };
    public localPersonName;//当前登陆人
    ngOnInit() {
        let localPerSon = localStorage.getItem('UserInfo');
        this.localPersonName = JSON.parse(localPerSon).UserName;
        this.getMyApply('审批');
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });

        this.dbHttp.post("InitData/BaseDataList", {}, options)
            .toPromise()
            .then(res => {
                let data = JSON.parse(res.Data);
                this.listCompany = this.onTransSelectInfos(data.companys, 'companycode', 'company');
            });
        this.dbHttp.post("InitData/GetUserInfo", {}, options)
            .toPromise()
            .then(res => {
                let data = JSON.parse(res.Data);
                this.loginNodeId = (data.ITCode).toLowerCase();
            });
    }
    onCreat() {
        this.router.navigate(['/bill/creat']);
    }
    onExamine(item) {
        this.router.navigate(['/bill/examine']);
        this.billBackService.examineApplyId = item.applyId
    }
    onCheck(item) {
        let link = '/bill/check/';
        this.router.navigate([link]);
        this.billBackService.examineApplyId = item.applyId
    }
    //转换方法
    public listCompany;
    onTransSelectInfos(arr: Array<any>, id, text) {
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['id'] = item[id];
            newItem['text'] = item[text];
            newArr.push(newItem);
        });
        return newArr;
    }
    //接口数据
    public getlistFlag(e) {
        if (!e) {
            this.WindowService.alert({ message: '接口异常', type: 'fail' });
        }
    }
}

export class sendApproveData {
    constructor(
        public projcode,
        public materialcode,
        public description,
        public num,
        public factory,
        public storagelocation,
        public batchno,
        public money,
        public backmoney,
        public CURRENCY
    ) { }
}
export class sendApprove {
    constructor(
        public taskid,
        public recordid,
        public nodeid,
        public APID,
        public ADP
    ) { }
}