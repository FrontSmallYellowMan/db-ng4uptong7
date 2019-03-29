
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpServer } from '../../../../shared/services/db.http.server';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/Rx';
import { WindowService } from 'app/core';

declare var window: any;

export class billBackData {
    constructor(
        public apply: any,
        public accessory: any,
        public invoice: any,
        public material: any
    ) { }
}

export class BaseInfo {
    public urlFlag;
    constructor(
        public applyItcode: string,
        public applyDate: string,
        public tel: string,
        public constCenter: string,
        public companys: Array<string>,
        public businesses: Array<string>,
        public invoicetypes: Array<string>,
        public platform: Array<any>,
        public revisetypes: Array<string>
    ) { }
}

@Component({
    templateUrl: 'bill-writeback-create.component.html',
    styleUrls: ['bill-writeback-create.component.scss']
})

export class BillWritebackCreateComponent implements OnInit {

    //接收表格
    public tabledata;
    public ReBackTableData(e) {
        console.log(e);
        this.tabledata = e;
    }
    //接受表头
    public backtabData
    public backtabDataList;
    //tab点击事件
    public invoicenoActive//显示的发票号
    public tabActive;

    public urlFlag;//url判断
    public billTypeId;//选择冲红类型判断
    public nameType;//接受选择物料或税号判断

    //基本信息
    private BaseInfoCom = [];
    private BaseInfoBiz;
    private BaseInfoInvoicetype;
    private BaseInfoPlatform;
    private BaseInfoRedtype;
    private BaseInfoReturntypes;
    public RefundTypeOut(e) {
        this.billTypeId = e;
    }
    public nameTypeOut(e) {
        this.nameType = e;
    }
    public returnMoney;
    public returnBillMoney(e) {
        if (e != undefined) {
            this.returnMoney = e;
        }
    }
    //提交数据结构
    public billBack = {
        apply: {
            'applyId': 0,
            'proposer': '',
            'uId': 0,
            'company': '',
            'companycode': '',
            'applydate': '',
            'phone': '',
            'costcenter': '',
            'biz': '',
            'bizcode': '',
            'invoicetype': '',
            'invoicetypecode': '',
            'platform': '',
            'platformcode': '',
            'revisetype': '',
            'revisetypecode': '',
            'subrevisetype': '',
            'subrevisetypecode': '',
            'reason': '申请原因',
            'checkbill': '检查项目',
            'outerpackagecheck': '外包装检查',
            'appearancecheck': '机器外观检查',
            'electroniccheck': '电性能检查',
            'attachmentcheck': '附件检查',
            'checkconlusion': '质检结论',
            'checkremark': '质检备注',
            'homepickup': 0,
            'transittype': '运输类型',
            'applystatus': 1,
            'wfId': '00000000-0000-0000-0000-000000000000',
            'wfstatus': "草稿"
        },
        accessory: [],
        invoice: [],
        material: [{
            'materialId': 0,
            'invoiceId': 0,
            internalinvoiceno: "",
            'projcode': '',
            'originalmaterialcode': null,
            'materialcode': '',
            'originaldescription': '',
            'description': '',
            'num': 0,
            'factory': '',
            'originalstoragelocation': '',
            'storagelocation': '',
            'originalbatchno': '',
            'batchno': '',
            'originalmoney': 0,
            'money': 0,
            'originalbackmoney': 0,
            'backmoney': 0,
            'returnnum': 0,
            'returnstoragelocation': '',
            'specifystoragelocation': '',
            'deliveryno': '',
            'ordertype': '',
            'groupno': 0,
            'ERPorderno': '写入EPR后返回的单据号',
            'CURRENCY': '币种编号',
            'invoiceremark': '发票备注'
        }]
    };

    //接收基础信息数据保存
    public applybusz;
    public applyDataOut = e => {
        this.billBack.apply = e
        this.applybusz = {
            company: e.companycode,
            busi: e.bizcode
        }
    };
    //基础信息选择
    public redTypeFlag;
    redTypeFlagOut(e) {
        this.redTypeFlag = e;
    }
    public changeRedType;
    changeRedTypeOut(e) {
        this.changeRedType = e;

    }
    public materialSelected;
    public materialSelect(e) {
        this.materialSelected = e;
    }
    public tabListOut(e) {
        if (e) {
            this.backtabData = []
            this.materialList = []
        }
    }
    //附件信息
    public reAccessory(e) {
        this.billBack.accessory = e;
    }
    //invoice
    public backInvoice(e) {
        this.billBack.invoice = e;
    }
    //物料
    public materialMoney//合计金额
    public materialList//合计返款金额 
    public returnMaterialData(e) {
        this.billBack.material = e;
        //初始化
        this.materialList = [];
        if (this.billTypeId == "priceType") {
            for (let i = 0, len = this.billBack.material.length; i < len; i++) {
                this.billBack.material[i].backmoney = this.billBack.material[i].originalbackmoney;
                this.billBack.material[i].money = this.billBack.material[i].originalmoney;
            }
        }
        for (let i = 0, len = this.billBack.material.length; i < len; i++) {
            this.billBack.material[i].originalmaterialcode = Number(this.billBack.material[i].originalmaterialcode) + 0;
            if (this.billBack.material[i].internalinvoiceno == this.backtabData[0].value) {
                this.materialList.push(this.billBack.material[i]);
            }
        }
        this.tabActive = function (e) {
            for (let i = 0, len = this.backtabData.length; i < len; i++) {
                this.backtabData[i].active = false;
            }
            e.active = true;
            this.invoicenoActive = e.value;
            this.materialList = [];
            for (let i = 0, len = this.billBack.material.length; i < len; i++) {
                this.billBack.material[i].originalmaterialcode = +this.billBack.material[i].originalmaterialcode + 0;
                if (this.billBack.material[i].internalinvoiceno == this.invoicenoActive) {
                    this.materialList.push(this.billBack.material[i]);
                }
            }
        }
        this.backtabDataList = function (e) {
            this.backtabData = e;
            this.invoicenoActive = e[0].internalinvoiceno;
            this.materialList = [];
            for (let i = 0, len = this.billBack.material.length; i < len; i++) {
                if (this.billBack.material[i].internalinvoiceno == this.invoicenoActive) {
                    this.materialList.push(this.billBack.material[i]);
                }
            }
        }
    }
    //保存草稿
    public saveBillDraft() {
        let sendFlag = true;
        this.billBack.apply.wfstatus = "草稿";
        let billData = this.billBack;
        //保存不需要验证
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        if (sendFlag) {
            this.dbHttp.post("InvoiceRevise/SaveApply", body, options).pipe(
                map(res => res))
                .subscribe(res => {
                    let urlFlag = false;
                    if (res.Result == false) {
                        urlFlag = false;
                        this.WindowService.alert({ message: res.Message, type: 'fail' });
                    }
                    if (res.Result == true) {
                        urlFlag = true;
                    }
                    if (urlFlag) {
                        this.router.navigate(['/bill/list']);
                    }
                })
        }
        sendFlag = true;
        return false;
    }
    // 提交
    public saveBill() {
        let sendFlag = true;
        this.billBack.apply.wfstatus = "提交";
        let billData = this.billBack;
        //判断基本信息选择
        let billBackApply = this.billBack.apply;
        if (!billBackApply.company) {
            this.WindowService.alert({ message: '请选择公司', type: 'success' });
            sendFlag = false;
        }
        if (!billBackApply.platform) {
            this.WindowService.alert({ message: '请选择平台', type: 'success' });
            sendFlag = false;
        }
        if (!billBackApply.biz) {
            this.WindowService.alert({ message: '请选择业务范围', type: 'success' });
            sendFlag = false;
        }
        if (!billBackApply.revisetype) {
            this.WindowService.alert({ message: '请选择冲红类型', type: 'success' });
            sendFlag = false;
        }
        if (!billBackApply.invoicetype) {
            this.WindowService.alert({ message: '请选择冲红发票类型', type: 'success' });
            sendFlag = false;
        }
        if (billBackApply.phone == '') {
            this.WindowService.alert({ message: '请填写电话', type: 'success' });
            sendFlag = false;
        }
        //判断小类
        if (billBackApply.revisetype != "其他情况冲红") {
            if (billBackApply.subrevisetype == '' || billBackApply.subrevisetype == '[]') {
                this.WindowService.alert({ message: '请选择冲红小类', type: 'fail' });
                sendFlag = false;
            }
        }
        //财务信息
        let billBackIn = this.billBack.invoice;
        if (billBackApply.revisetype == "发票票面信息更改") {
            let data = JSON.parse(billBackApply.subrevisetype);
            for (let i = 0, len = data.length; i < len; i++) {
                if (data[i].subtype == "经工商局认定的客户名称变更" || data[i].subtype == "税号") {
                    for (let n = 0, len = billBackIn.length; n < len; n++) {
                        if (billBackIn[n].customer == '') {
                            this.WindowService.alert({ message: '请填写冲红后客户编号', type: 'fail' });
                            sendFlag = false;
                        }
                    }
                }
            }
        }
        //判断物料信息
        let billBackMaterial = this.billBack.material;
        if (this.billTypeId == "priceType") {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].money == 0) {
                    sendFlag = false;
                    this.WindowService.alert({ message: '新销售总额，不可以为空', type: 'success' });
                }
                if (billBackMaterial[i].backmoney == 0) {
                    sendFlag = false;
                    this.WindowService.alert({ message: '新返款金额，不可以为空', type: 'success' });
                }
                if (billBackMaterial[i].money != billBackMaterial[i].originalmoney) {
                    sendFlag = false;
                    this.WindowService.alert({ message: '新销售总额应与原销售总额相等', type: 'success' });
                    return;
                }
            };
        }
        if (this.billTypeId == "costType") {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].materialcode == '') {
                    sendFlag = false;
                    this.WindowService.alert({ message: '新出发票的物料号，不可以为空', type: 'success' });
                    return;
                }

            };
        }
        if (this.billTypeId == "materielType") {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].materialcode == '') {
                    sendFlag = false;
                    this.WindowService.alert({ message: '请检查物料号，不可以为空', type: 'success' });
                }
                if (billBackMaterial[i].num == 0) {
                    sendFlag = false;
                    this.WindowService.alert({ message: '请检查数量，不可以为空', type: 'success' });
                }
                if (billBackMaterial[i].factory == '') {
                    sendFlag = false;
                    this.WindowService.alert({ message: '请检查工厂，不可以为空', type: 'success' });
                }

                if (billBackMaterial[i].money == 0) {
                    sendFlag = false;
                    this.WindowService.alert({ message: '请检查销售总额，不可以为空', type: 'success' });
                }
                if (billBackMaterial[i].backmoney == 0) {
                    if (billBackApply.revisetype != '发票票面信息更改') {
                        sendFlag = false;
                        this.WindowService.alert({ message: '请检查返款金额，不可以为空', type: 'success' });
                    }
                }

            };
        }
        if(this.billBack.accessory.length==0){
            sendFlag = false;
            this.WindowService.alert({ message: '请添加至少一个附件', type: 'warn' });
        }
        if (this.billBack.invoice.length == 0) {
            sendFlag = false;
            this.WindowService.alert({ message: '请添加订单', type: 'warn' });
        }
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        if (sendFlag) {
            this.dbHttp.post("InvoiceRevise/SaveApply", body, options).pipe(
                map(res => res))
                .subscribe(res => {
                    let urlFlag = false;
                    if (res.Result == false) {
                        urlFlag = false;
                        this.WindowService.alert({ message: res.Message, type: 'fail' });
                    }
                    if (res.Result == true) {
                        urlFlag = true;
                    }
                    if (urlFlag) {
                        this.router.navigate(['/bill/list']);
                    }
                })
        }
        sendFlag = true;
        return false;
    }

    constructor(private location: Location, private dbHttp: HttpServer, private router: Router, private WindowService: WindowService) {

    }

    ngOnInit() {
        this.urlFlag = this.location.path().toString().substring(6);//url获取    
        // window.location.href="http://www.baidu.com"
    }

}