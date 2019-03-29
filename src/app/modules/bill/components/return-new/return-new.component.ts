
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
    templateUrl: 'return-new.component.html',
    styleUrls: ['return-new.component.scss']
})
export class returnNewComponent implements OnInit {
    //接收送货类型
    public transitmodesList;
    public transitmodes(e) {
        this.transitmodesList = e;
    }
    //保存接货类型
    public transitmodesBack(e) {
        for (let i = 0, len = this.billBack.invoice.length; i < len; i++) {
            if (this.billBack.invoice[i].internalinvoiceno == this.invoicenoActive) {
                this.billBack.invoice[i].TransitMode = e.text;
                this.billBack.invoice[i].TransitModeCode = e.id;
            }
        }
    }

    //接收表格
    public tabledata;
    public ReBackTableData(e) {
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
            'reason': '',
            'checkbill': '',
            'outerpackagecheck': '',
            'appearancecheck': '',
            'electroniccheck': '',
            'attachmentcheck': '',
            'checkconlusion': '',
            'checkremark': '',
            'homepickup': null,
            'transittype': '',
            'applystatus': 1,
            'wfId': 'aca1151e-3fa2-4511-8cdb-8e5c9337c32f',
            'wfstatus': "草稿"
        },
        accessory: [],
        invoice: [{
            'invoiceId': 0,
            'applyId': 0,
            'originalcustomercode': '',
            'originalcustomer': '',
            'orderno': '',
            'internalinvoiceno': '',
            'externalinvoiceno': '',
            'invoicedate': '',
            'originalmoney': 0,
            'originalreceiptdate': '',
            'originalcomplexaccount': '',
            'money': '',
            'customercode': '',
            'customer': '',
            'receiptdate': '',
            'complexaccout': '',
            'rednoticeno': '',
            'ZCRorderno': '',
            'ZDRorderno': '',
            'REorderno': '',
            'REdeliveryno': '',
            'ZTYorderno': '',
            'ZTYdeliveryno': '',
            'ZREorderno': '',
            'ZREdeliveryno': '',
            'ZSDorderno': '',
            'ZSDdeliveryno': '',
            'PURCH_NO_C': '',
            'seller': '',
            'sellercode': '',
            'SALES_ORG': '',
            'DISTR_CHAN': '',
            'DIVISION': '',
            'PRICE_DATE': '',
            'PMNTTRMS': '',
            'SALES_OFF': '',
            'SALES_GRP': '',
            'SHIP_TYPE': '',
            'TransitMode': '',
            'TransitModeCode': '',
            'SDF_KUNNR': '',
            'SDF_NAME': '',
            'detailaddress': '',
            'province': '',
            'city': '',
            'citycode': '',
            'district': '',
            'zipcode': '',
            'connecter': '',
            'phone': '',
            'signstandard': '',
            "AUART":"",
            "ZTERM":""
        }],
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
        console.log(e);
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
    public detailaddressData;//获取地址
    public backInvoice(e) {
        this.billBack.invoice = e;
        //地址获取
        let getdetailaddress = [];
        for (let i = 0, len = this.billBack.invoice.length; i < len; i++) {
            getdetailaddress.push(
                new detailaddress(
                    this.billBack.invoice[i].internalinvoiceno, this.billBack.invoice[i].detailaddress
                )
            );
        }
        if (getdetailaddress) {
            for (let i = 0, len = getdetailaddress.length; i < len; i++) {
                if (getdetailaddress[i].internalinvoiceno == this.invoicenoActive) {
                    this.detailaddressData = getdetailaddress[i].detailaddress;
                }
            }
        }
    }
    //物料
    public materialMoney//合计金额
    public materialList//合计返款金额 
    public returnMaterialData(e) {
        this.billBack.material = e;
        //初始化
        this.materialList = [];
        for (let i = 0, len = this.billBack.material.length; i < len; i++) {
            this.billBack.material[i].originalmaterialcode = +this.billBack.material[i].originalmaterialcode + 0;
            if (this.billBack.material[i].internalinvoiceno == this.backtabData[0].value) {
                this.invoicenoActive = this.backtabData[0].value;
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
    //保存事件
    public returnAddress(e) {
        if (e.signstandard != '') {
            this.detailaddressData = "A-地址";
        }
        if (this.billBack.invoice) {
            for (let i = 0, len = this.billBack.invoice.length; i < len; i++) {
                if (this.billBack.invoice[i].internalinvoiceno == this.invoicenoActive) {
                    this.billBack.invoice[i].SDF_NAME = e.SDF_NAME,
                        this.billBack.invoice[i].detailaddress = e.detailaddress,
                        this.billBack.invoice[i].province = e.province,
                        this.billBack.invoice[i].city = e.city,
                        this.billBack.invoice[i].citycode = e.citycode,
                        this.billBack.invoice[i].district = e.district,
                        this.billBack.invoice[i].zipcode = e.zipcode,
                        this.billBack.invoice[i].connecter = e.connecter,
                        this.billBack.invoice[i].phone = e.phone,
                        this.billBack.invoice[i].signstandard = e.signstandard
                }
            }
        }
    }
    public saveBillDraft() {
        let sendFlag = true;
        let billData = this.billBack;
        //判断基本信息选择
        let billBackApply = this.billBack.apply;
        //判断物料信息
        let billBackMaterial = this.billBack.material;
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        console.log(billData);
        if (sendFlag) {
            this.dbhttp.post("InvoiceRevise/SaveApply", body, options).pipe(
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
    public saveBill() {
        let sendFlag = true;
        this.billBack.apply.wfstatus = "提交";
        let billData = this.billBack;
        //判断基本信息选择
        let billBackApply = this.billBack.apply;
        if (!billBackApply.phone) {
            this.WindowService.alert({ message: '请输入电话', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.biz) {
            this.WindowService.alert({ message: '请选择业务范围', type: 'fail' });
            sendFlag = false;
        }
        if (billBackApply.company == '') {
            this.WindowService.alert({ message: '请选择公司', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.invoicetype) {
            this.WindowService.alert({ message: '请选择发票类型', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.platform) {
            this.WindowService.alert({ message: '请选择平台', type: 'fail' });
            sendFlag = false;
        }
        if (billBackApply.homepickup != 0 && billBackApply.homepickup != 1) {
            this.WindowService.alert({ message: '请选择是否上门取货', type: 'fail' });
        }
        if (billBackApply.homepickup == 0) {
            console.log(billBackApply.transittype);
            if (billBackApply.transittype == '') {
                this.WindowService.alert({ message: '请选择运输类型', type: 'fail' });
                sendFlag = false;
            }
        }
        if (!billBackApply.revisetype) {
            this.WindowService.alert({ message: '请选择冲退类型', type: 'fail' });
            sendFlag = false;
        }
        if (this.billBack.invoice.length == 0) {
            sendFlag = false;
            this.WindowService.alert({ message: '请添加订单', type: 'success' });
        }
        //判断物料信息
        let billBackMaterial = this.billBack.material;
        if (this.billTypeId == 'refund') {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].returnstoragelocation == '') {
                    this.WindowService.alert({ message: '请输入"退入库存地"', type: 'fail' });
                    sendFlag = false;
                }
            }
        }
        if (this.billTypeId == 'exchange') {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].returnstoragelocation == '') {
                    this.WindowService.alert({ message: '请输入"退入库存地"', type: 'fail' });
                    sendFlag = false;
                }
            }
        }
        //判断检查项
        if (!billBackApply.checkbill) {
            this.WindowService.alert({ message: '检验项目', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.outerpackagecheck) {
            this.WindowService.alert({ message: '外包装检查', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.appearancecheck) {
            this.WindowService.alert({ message: '机器外观检查', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.electroniccheck) {
            this.WindowService.alert({ message: '电性能检查', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.attachmentcheck) {
            this.WindowService.alert({ message: '附件检查', type: 'fail' });
            sendFlag = false;
        }
        if (!billBackApply.checkconlusion) {
            this.WindowService.alert({ message: '质检结论', type: 'fail' });
            sendFlag = false;
        }
        
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        console.log(billData);
        if (sendFlag) {
            this.dbhttp.post("InvoiceRevise/SaveApply", body, options).pipe(
                map(res => res))
                .subscribe(res => {
                    let urlFlag = false;
                    if (res.Result == false) {
                        urlFlag = false;
                        this.WindowService.alert({ message: res.Message, type: 'fail' });
                        return;
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
    constructor(private location: Location, private dbhttp: HttpServer, private router: Router, private WindowService: WindowService) {

    }

    ngOnInit() {
        this.urlFlag = this.location.path().toString().substring(6);//url获取    
        // window.location.href="http://www.baidu.com"
    }

}
export class detailaddress {
    constructor(
        public internalinvoiceno: any,
        public detailaddress: any
    ) { }
}