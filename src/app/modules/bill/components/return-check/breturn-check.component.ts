import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { billBackService } from '../../services/bill-back.service';
import { DbWfviewComponent } from 'app/shared/index';
import { HttpServer } from 'app/shared/services/db.http.server';
import { WindowService } from 'app/core';

export class PageNo { }
@Component({
    templateUrl: 'return-check.component.html',
    styleUrls: ['return-check.scss']
})
export class returnBillCheckComponent implements OnInit {
    /**
    *获取流程数据信息（流程审批历史，流程审批全景）
    */
    @ViewChild('wfview')
    wfView: DbWfviewComponent;
    constructor(private WindowService: WindowService, private router: Router, private billBackService: billBackService,
        private location: Location, private dbHttp: HttpServer, private routerInfo: ActivatedRoute) { }

    //基本信息
    public selectInfo = {
        applyItcode: '凤姐',
        applyDate: '2017-05-20',
        tel: '110',
        constCenter: '2321-1dsa',
        companys: [],
        businesses: [],
        invoicetypes: [],
        platforms: [],
        redtypes: []
    };
    public selected;//选中事件
    public examineMoney;
    public isCheck;
    private reviseTypeChildren: Array<any> = [];
    //判断选择小类及保存
    //输出type改动
    public nameFlag = false;//判断显示名称更改
    public priceFlag = false;
    public materielFlag = false;
    public otherTypeFlag = false;
    public trackBy(hero) {
        return hero ? hero.id : undefined;
    };
    public TypeOut;
    public subrevisetypeData: subrevisetypeData;
    public subrevisetypeArray = [];

    public changeRefundTypeOut(fa, item) {
        if (this.materielFlag) {
            if (fa[4].slect) {
                this.TypeOut = "materielType";
                if (fa[0].slect || fa[1].slect) {
                    this.nameFlag = true;
                } else {
                    this.nameFlag = false;
                }
            } else if (fa[0].slect || fa[1].slect) {
                if (fa[4].slect) {
                    this.TypeOut = "materielType"
                } else {
                    this.TypeOut = "";
                }
                this.nameFlag = true;
            }
            else {
                this.TypeOut = undefined;
                this.nameFlag = false;
            }
            this.subrevisetypeArray = [];
            for (let n in fa) {
                if (fa[n].slect) {
                    this.subrevisetypeArray.push(new subrevisetypeData(
                        fa[n].revisetypecode, fa[n].revisetype
                    ));
                }
            }
        }
        else if (item == "冲成本") {
            this.TypeOut = "costType";
        }
        else if (this.priceFlag) {
            this.TypeOut = "priceType";
        }
        else if (item == "提供冲红通知单原件及折扣折让证明") {
            this.TypeOut = "breakType";
        }
        if (!this.materielFlag) {
            this.subrevisetypeArray = [];
            for (let i in fa) {
                if (item == fa[i].revisetype) {
                    this.subrevisetypeArray.push(new subrevisetypeData(
                        fa[i].revisetypecode, fa[i].revisetype
                    ));
                }
            }
        }
        let subrevise = JSON.stringify(this.subrevisetypeArray);
        this.applyDate.subrevisetype = subrevise;
    }

    public defaultList: defaultdata;//下拉框默认显示
    public defaultCompany;
    public defaultBuse;
    public defaultinvoicetypes;
    public defaultplatforms;
    public defaultredtypes

    public accessoryExamine;//附件信息
    public materialExamine = [];//物料表单信息
    // public billTypeId;//选中小类
    public billType=true;//选中小类
    public examineApply;//
    public momentData;//临时类型集合
    public redReviseSubType;//小类box

    public backtabData = []//tab头
    public materialList;
    public invoicenoActive;//当前选中项
    public tabActive = function (e) {
        //初始化
        this.materialList = [];
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine.internalinvoiceno == this.backtabData[0].value) {
                this.materialList.push(this.materialExamine[i]);
            }
        }
        for (let i = 0, len = this.backtabData.length; i < len; i++) {
            this.backtabData[i].active = false;
        }
        e.active = true;
        this.invoicenoActive = e.value;
        this.materialList = [];
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                this.materialList.push(this.materialExamine[i]);
            }
        }
        let meterial1 = [];
        let meterial2 = [];
        let meterial3 = [];
        this.materialList0 = [];
        this.materialList1 = [];
        this.materialList2 = [];
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine[i].groupno == -1) {
                meterial1.push(this.materialExamine[i])
                for (let i = 0, len = meterial1.length; i < len; i++) {
                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                        this.materialList0.push(meterial1[i]);
                    }
                }
            }
            else if (this.materialExamine.groupno == 1) {
                meterial2.push(this.materialExamine[i])
                for (let i = 0, len = meterial2.length; i < len; i++) {
                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                        this.materialList1.push(meterial2[i]);
                    }
                }

            }
            else if (this.materialExamine[i].groupno == 2) {
                meterial3.push(this.materialExamine[i])
                for (let i = 0, len = meterial3.length; i < len; i++) {
                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                        this.materialList2.push(this.materialExamine[i]);
                    }
                }
            }
        }
    };
    public urlFlag;//当前url
    //红字通知单
    public monthPass;//显示
    public redListData = [];//列表
    public subrevisetypeList = [];//小类
    public revisetypeApprove;
    public returnTypeBack = [];//返回的默认类型
    //票据类型
    public orderTypeList: Array<any> =
    [
        { id: '001', text: 'ZCR' },
        { id: '002', text: 'RE' },
        { id: '003', text: 'ZRE' },
    ];
    public orderTypeData = [
        { id: '004', text: 'ZDR' },
        { id: '005', text: 'ZTY' },
        { id: '008', text: 'ZSD' },
        { id: '010', text: 'ZOR' }
    ]
    public needReturn = [];
    public needGo = [];
    public isIdSix = false;
    public materialList0 = [];
    public materialList1 = [];
    public materialList2 = [];
    public redNumberNow = {
        internalinvoiceno: '',
        text: ''
    };
    public ducumentList = [];
    ngOnInit() {
        this._initParam();
        this._initViewParms();
        this.onGetWfHistoryData();
        this.examineMoney = [];

        if (this.urlParamObj.applyid != undefined) {
            let url = "InvoiceRevise/GetApplyById/" + this.urlParamObj.applyid
            this.dbHttp.post(url, {})
                .toPromise()
                .then(res => {
                    let data = JSON.parse(res.Data);
                    this.returnTypeBack = data.defaultordertype;
                    console.log(data);
                    this.needReturn = [{ id: '001', text: this.returnTypeBack["xutui"] }];
                    this.needGo = [{ id: '002', text: this.returnTypeBack["xuchu"] }];
                    this.erpDataSaveMinus.ordertype = this.returnTypeBack["xutui"];
                    this.erpDataSavePlus.ordertype = this.returnTypeBack["xuchu"];
                    //基础信息
                    this.changeEventObject(data.apply, this.applyDate);
                    this.applyDate.applydate = this.ChangeDateFormat(this.applyDate.applydate);
                    //判断物料信息显示类型
                    
                    //基础信息默认选项
                    this.defaultList = new defaultdata(
                        [{ id: this.applyDate.companycode, text: this.applyDate.company }],
                        [{ id: this.applyDate.bizcode, text: this.applyDate.biz }],
                        [{ id: this.applyDate.invoicetypecode, text: this.applyDate.invoicetype }],
                        [{ id: this.applyDate.platformcode, text: this.applyDate.platform }],
                        [{ id: this.applyDate.revisetypecode, text: this.applyDate.revisetype }]
                    )
                    this.defaultCompany = this.defaultList.company;
                    this.defaultBuse = this.defaultList.businesses;
                    this.defaultinvoicetypes = this.defaultList.invoicetypes;
                    this.defaultplatforms = this.defaultList.platforms;
                    this.defaultredtypes = this.defaultList.redtypes;
                    //财务信息
                    this.examineMoney = data.invoice;
                    for(let i=0,len=this.examineMoney.length;i<len;i++){
                        this.examineMoney[i].originalreceiptdate = this.ChangeDateFormat(this.examineMoney[i].originalreceiptdate);
                    }
                    //原发票日期转化及判断
                    let dataNow = new Date().getMonth() + 1;
                    for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                        this.examineMoney[i].invoicedate = this.ChangeDateFormat(this.examineMoney[i].invoicedate)
                        let dataPass = Number(String(this.examineMoney[i].invoicedate).substr(5, 2))
                        if ((dataNow - dataPass) >= 1) {
                            this.monthPass = true;
                        }

                        //redList
                        this.redListData.push(
                            new redList(
                                this.examineMoney[i].externalinvoiceno, ''
                            )
                        )
                    }
                    //tab头
                    for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                        this.backtabData.push(new tabListData(
                            this.examineMoney[i].internalinvoiceno,
                            false
                        ))
                        this.redNumberNow = {
                            internalinvoiceno: this.examineMoney[0].internalinvoiceno,
                            text: this.examineMoney[0].rednoticeno
                        };
                    }

                    //附件信息
                    this.accessoryExamine = data.accessory;
                    //物料信息
                    for (let i = 0, len = data.material.length; i < len; i++) {
                        if (data.material[i].groupno == 0) {
                            this.materialExamine.push(data.material[i])
                        }
                    }
                    //nodeId>6冲退明细 groupno
                    if (Number(this.urlParamObj.nodeid) > 6) {
                        this.ErpMinusFlag = false;
                        this.ErpPlusFlag = false;
                        this.isIdSix = true;
                        let meterial1 = [];
                        let meterial2 = [];
                        let meterial3 = [];
                        for (let i = 0, len = data.material.length; i < len; i++) {
                            if (data.material[i].groupno == -1) {
                                meterial1.push(data.material[i])
                                for (let i = 0, len = meterial1.length; i < len; i++) {
                                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                                        this.materialList0.push(meterial1[i]);
                                    }
                                }
                            }
                            else if (data.material[i].groupno == 1) {
                                meterial2.push(data.material[i])
                                for (let i = 0, len = meterial2.length; i < len; i++) {
                                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                                        this.materialList1.push(meterial2[i]);
                                    }
                                }
                            }
                            else if (data.material[i].groupno == 2) {
                                meterial3.push(data.material[i])
                                for (let i = 0, len = meterial3.length; i < len; i++) {
                                    if (meterial1[i].internalinvoiceno == this.backtabData[0].value) {
                                        this.materialList2.push(this.materialExamine[i]);
                                    }
                                }
                            }
                        }
                    }

                    //初始化
                    this.backtabData[0].active = true;
                    this.invoicenoActive = this.backtabData[0].value;
                    this.materialList = [];
                    for (let i = 0, len = this.materialExamine.length; i < len; i++) {
                        if (this.materialExamine[i].internalinvoiceno == this.backtabData[0].value) {
                            this.materialList.push(this.materialExamine[i]);
                        }
                    }

                    this.billBack.apply = this.applyDate;
                    this.billBack.accessory = this.accessoryExamine;
                    this.billBack.invoice = this.examineMoney;
                    this.billBack.material = this.materialExamine;
                    //从数据中识别默认选中类型
                    // this.examineApply = data.apply;
                    // if (this.examineApply.revisetype == "价格更改") {
                    //     this.billTypeId = "priceType";
                    // }
                    // if (this.examineApply.revisetype == "发票票面信息更改") {
                    //     let data = JSON.parse(this.examineApply.subrevisetype)
                    //     for (let i = 0, len = data.length; i < len; i++) {
                    //         if (data[i].subtype == "物料号") {
                    //             this.billTypeId = "materielType";
                    //             break;
                    //         }
                    //     }
                    // }
                    // if (this.examineApply.revisetype == "系统冲红（不涉及外部发票）") {
                    //     let data = JSON.parse(this.examineApply.subrevisetype)
                    //     for (let i = 0, len = data.length; i < len; i++) {
                    //         if (data[i].subtype == "冲成本") {
                    //             this.billTypeId = "costType";
                    //             break;
                    //         }
                    //     }
                    // }
                })
        }

    }
    public getDescription(e, item) {
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;
        console.log(e.target.value);
        this.dbHttp.post(url, [])
            .toPromise()
            .then(res => {
                let localData = res.Data;
                item.description = localData;
                console.log(item.description);
            })
    }
    //数据提交
    public billBack = {
        apply: {},
        accessory: [],
        invoice: [],
        material: []
    };
    public saveBill() {
        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
            if (this.examineMoney[i].internalinvoiceno == this.redNumberNow.internalinvoiceno) {
                this.examineMoney[i].rednoticeno = this.redNumberNow.text;
            }
        }
        this.billBack.invoice = this.examineMoney;

        let billData = this.billBack;
        console.log(billData)
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        // let body = JSON.stringify(billData);
        // this.http.post("http://10.0.1.26:88/api/InvoiceRevise/SaveApply", body, options)
        //     .map(res => res)
        //     .subscribe(res => {
        //         console.log(res)
        //     })
        // this.router.navigate(['/bill/list']);
    }
    //写入erp
    public selecteOrderTypeList(e) {
        this.erpDataSaveMinus.ordertype = e.text;
    }
    public selecteOrderTypeData(e) {
        this.erpDataSavePlus.ordertype = e.text;
    }
    public clearInput(e) {
        let data = e.replace("请输入", "").replace("交货单号", "") + "deliveryno"
        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
            let x;
            for (x in this.examineMoney[i]) {
                if (x == data) {
                    this.examineMoney[i][x] = ' ';
                }
            }
        }
    }
    public erpDataSaveMinus = {
        "groupno": -1,
        "ordertype": "",
        "invoiceremark": "",
        "material": []
    };
    public erpDataSavePlus = {
        "groupno": 1,
        "ordertype": "",
        "invoiceremark": "",
        "material": []
    };
    public ErpMinusFlag = true;
    public ErpPlusFlag = true;
    public sendErpMinus() {
        let material = [];
        let invoiceData;
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                material.push(
                    new meterialData(
                        this.materialExamine[i].projcode,
                        this.materialExamine[i].originalmaterialcode,
                        this.materialExamine[i].originaldescription,
                        this.materialExamine[i].num,
                        this.materialExamine[i].factory,
                        this.materialExamine[i].originalstoragelocation,
                        this.materialExamine[i].originalbatchno,
                        this.materialExamine[i].originalmoney,
                        this.materialExamine[i].originalbackmoney,
                        this.materialExamine[i].CURRENCY
                    )
                )
                invoiceData = new invoiceApprove(
                    this.examineMoney[i].invoiceId,
                    this.examineMoney[i].orderno,
                    this.examineMoney[i].internalinvoiceno,
                    this.examineMoney[i].originalcustomercode,
                    this.examineMoney[i].originalcustomer,
                    this.examineMoney[i].customercode,
                    this.examineMoney[i].customer,
                    this.redNumberNow.text,
                    this.examineMoney[i].PURCH_NO_C,
                    this.examineMoney[i].seller,
                    this.examineMoney[i].sellercode,
                    this.examineMoney[i].SALES_ORG,
                    this.examineMoney[i].DISTR_CHAN,
                    this.examineMoney[i].DIVISION,
                    this.examineMoney[i].SALES_OFF,
                    this.examineMoney[i].SALES_GRP,
                    this.examineMoney[i].TransitMode,
                    this.examineMoney[i].TransitModeCode,
                    this.examineMoney[i].SDF_KUNNR,
                    this.examineMoney[i].SDF_NAME,
                    this.examineMoney[i].detailaddress,
                    this.examineMoney[i].province,
                    this.examineMoney[i].city,
                    this.examineMoney[i].citycode,
                    this.examineMoney[i].district,
                    this.examineMoney[i].zipcode,
                    this.examineMoney[i].connecter,
                    this.examineMoney[i].phone,
                    this.examineMoney[i].AUART,
                    this.examineMoney[i].ZTERM
                )
            }
        }
        this.erpDataSaveMinus.material = material;
        let data = new erpData(
            invoiceData, [
                this.erpDataSaveMinus
            ]
        );
        let body = data;
        console.log(data)
        let url = "InvoiceRevise/SaveToERP";

        this.dbHttp.post(url, body)
            .toPromise()
            .then(res => {
                let data = JSON.parse(res.Data);
                let backMessage = res.Message
                if (backMessage == "success") {
                    this.ErpMinusFlag = false;
                }
                for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                    for (let n = 0, len = data.length; n < len; n++) {
                        if (this.examineMoney[i].internalinvoiceno == data[n].internalinvoiceno) {
                            let x;
                            for (x in this.examineMoney[i]) {
                                if (x == data[n].ordertype + 'orderno') {
                                    this.examineMoney[i][x] = data[i].orderno
                                }
                                else if (x == data[n].ordertype + 'deliveryno') {
                                    this.examineMoney[i][x] = "请输入" + data[n].ordertype + "交货单号"
                                }
                            }
                        }
                    }
                }
            })
    }
    public sendErpPlus() {
        let material = [];
        let invoiceData;
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                material.push(
                    new meterialData(
                        this.materialExamine[i].projcode,
                        this.materialExamine[i].materialcode,
                        this.materialExamine[i].description,
                        this.materialExamine[i].num,
                        this.materialExamine[i].factory,
                        this.materialExamine[i].storagelocation,
                        this.materialExamine[i].batchno,
                        this.materialExamine[i].money,
                        this.materialExamine[i].backmoney,
                        this.materialExamine[i].CURRENCY
                    )
                )
                invoiceData = new invoiceApprove(
                    this.examineMoney[i].invoiceId,
                    this.examineMoney[i].orderno,
                    this.examineMoney[i].internalinvoiceno,
                    this.examineMoney[i].originalcustomercode,
                    this.examineMoney[i].originalcustomer,
                    this.examineMoney[i].customercode,
                    this.examineMoney[i].customer,
                    this.redNumberNow.text,
                    this.examineMoney[i].PURCH_NO_C,
                    this.examineMoney[i].seller,
                    this.examineMoney[i].sellercode,
                    this.examineMoney[i].SALES_ORG,
                    this.examineMoney[i].DISTR_CHAN,
                    this.examineMoney[i].DIVISION,
                    this.examineMoney[i].SALES_OFF,
                    this.examineMoney[i].SALES_GRP,
                    this.examineMoney[i].TransitMode,
                    this.examineMoney[i].TransitModeCode,
                    this.examineMoney[i].SDF_KUNNR,
                    this.examineMoney[i].SDF_NAME,
                    this.examineMoney[i].detailaddress,
                    this.examineMoney[i].province,
                    this.examineMoney[i].city,
                    this.examineMoney[i].citycode,
                    this.examineMoney[i].district,
                    this.examineMoney[i].zipcode,
                    this.examineMoney[i].connecter,
                    this.examineMoney[i].phone,
                    this.examineMoney[i].AUART,
                    this.examineMoney[i].ZTERM
                )
            }
        }
        this.erpDataSavePlus.material = material;
        let data = new erpData(
            invoiceData, [
                this.erpDataSavePlus
            ]
        );
        let flag = true;
        for (let i = 0, len = data.group.length; i < len; i++) {
            console.log(data.group[i])
            for (let n = 0, len = data.group[i].material.length; n < len; n++) {
                if (data.group[i].material[n].materialcode == "") {
                    this.WindowService.alert({ message: '请输入物料号', type: 'success' });
                    flag = false;
                }
                if (data.group[i].material[n].storagelocation == "") {
                    this.WindowService.alert({ message: '请输入库存地', type: 'success' });
                    flag = false;
                }
                if (data.group[i].material[n].batchno == "") {
                    this.WindowService.alert({ message: '请输入批次', type: 'success' });
                    flag = false;
                }
            }

        }
        let body = data;
       
        let url = "InvoiceRevise/SaveToERP";
        if (flag) {
            this.dbHttp.post(url, body)
                .toPromise()
                .then(res => {
                    let data = JSON.parse(res.Data);
                    let backMessage = res.Message
                    if (backMessage == "sucess") {
                        this.ErpMinusFlag = false;
                    }
                    for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                        for (let n = 0, len = data.length; n < len; n++) {
                            if (this.examineMoney[i].internalinvoiceno == data[n].internalinvoiceno) {
                                let x;
                                for (x in this.examineMoney[i]) {
                                    if (x == data[n].ordertype + 'orderno') {
                                        this.examineMoney[i][x] = data[i].orderno
                                    }
                                    else if (x == data[n].ordertype + 'deliveryno') {
                                        this.examineMoney[i][x] = "请输入" + data[n].ordertype + "交货单号"
                                    }
                                }
                            }
                        }
                    }
                })
        }

    }
    //冲退增删
    public addERP(e) {
        console.log(e)
        let currentId: any;
        currentId = +e[e.length - 1].projcode + 10;
        let nowIdLen = (currentId + "").length;
        for (var i = 0; i < 6 - nowIdLen; i++) {
            currentId = "0" + currentId;
        }
        let data = {
            'materialId': 0,
            'invoiceId': 0,
            internalinvoiceno: "",
            'projcode': currentId,
            'originalmaterialcode': '',
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
            'ERPorderno': '',
            'CURRENCY': '',
            'invoiceremark': ''
        }
        e.push(data)
    }
    public minusERP(tab, item) {
        let index = tab.indexOf(item);
        if (tab.length > 1) {
            tab.splice(index, 1);
        }
    }
    //添加新订单
    public newTableFlag = false;
    public newlistApprove;
    public addApprove() {
        this.newlistApprove = this.materialList;
        this.newTableFlag = true;
    }
    //附件添加
    public reAccessory(e) {
        if (!this.accessoryExamine.indexOf(e)) {
            this.accessoryExamine.push(e)
        }
    }

    /**下载附件*/
    downloadFile(item) {
        window.open(item.AccessoryURL);
    }

    //转换方法
    public changeEventObject(a, b) {
        for (let i in a) {
            for (let n in b) {
                if (i == n) {
                    b[n] = a[i]
                }
            }
        }
    }
    //日期转换方法
    ChangeDateFormat(val) {
        if (val != null) {
            let date = new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));
            //月份为0-11，所以+1，月份小于10时补个0
            let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            let currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            return date.getFullYear() + "-" + month + "-" + currentDate;
        }
        return "";
    }
    //转换方法
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
    //选择类型转换转换方法
    selectTransSelectInfos(arr: Array<any>, revisetype) {
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['revisetypecode'] = item.revisetypecode;
            newItem['revisetype'] = item[revisetype];
            newItem['slect'] = false;
            newArr.push(newItem);
        });
        return newArr;
    }

    //基本信息

    public applyDate =
    {
        'applyId': 0,
        'proposer': '申请人',
        'ITCode': 0,
        'company': '公司',
        'companycode': '公司代码',
        'applydate': '2017-1-1',
        'phone': '010-12345678',
        'costcenter': '成本中心',
        'biz': '业务范围',
        'bizcode': '业务范围编码',
        'invoicetype': '发票类型',
        'invoicetypecode': '发票类型编码',
        'platform': '所属平台',
        'platformcode': '平台编码',
        'revisetype': '冲红类型',
        'revisetypecode': '冲红类型编码',
        'subrevisetype': '[{\'subtypecode\':201,\'subtype\':\'合同约定\'},{\'subtypecode\':202,\'subtype\':\'商务手误\'}]',
        'subrevisetypecode': '冲红类型小类编码',
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
        'wfId': 'aca1151e-3fa2-4511-8cdb-8e5c9337c32f',
        'wfstatus': "草稿",
        // 'myselfget': '自取',//新增字段(上门自取)，待完善
        // 'transporttype': '空运',//新增字段(运输类型)，待完善
    }


    //数据保存
    public selecteRedtypes(value) {
        this.applyDate.revisetype = value.text
        this.applyDate.revisetypecode = value.id
    }
    public selecteInvoice(value) {
        this.applyDate.invoicetype = value.text
        this.applyDate.invoicetypecode = value.id
    }
    public selecteCom(value) {
        this.applyDate.company = value.text
        this.applyDate.companycode = value.id
    }
    public selectePlat(value: any): void {
        this.applyDate.platform = value.text
        this.applyDate.platformcode = value.id
    }
    public selecteBiz(value) {
        this.applyDate.biz = value.text
        this.applyDate.bizcode = value.id
    }
    //流程信息
    public nodeDataList = {
        "taskid": "",
        "approveresult": "Approval",
        "nodeid": "",//流程节点Id
        "opinions": "同意",
    };
    /** approve begin */
    public saveId6Flag = true;
    public isPass = false;
    urlParamObj = {
        applyid: "",
        nodeid: "",
        taskid: "",
        adp: ""
    };
    wfData = {
        wfhistory: null,
        wfprogress: null
    };
    appParms = {
        apiUrl_AR: "InvoiceRevise/ApproveProductReturn",
        apiUrl_Sign: "InvoiceRevise/AddTask",
        apiUrl_Transfer: "InvoiceRevise/AddTransfer",
        taskid: "",
        nodeid: "",
        navigateUrl: ""
    };
    adpAppParms = {
        apiUrl: "InvoiceRevise/ApproveAddTask",
        taskid: ""
    };
    isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
    isADP: boolean = false;//是否加签审批页面
    isBusiness: boolean = false;//是否商务审批
    isFinance: boolean = false;//是否财务发票审批
    onGetWfHistoryData() {
        if (this.urlParamObj.applyid != undefined) {
            let url = "InvoiceRevise/GetApproveHistory/" + this.urlParamObj.applyid;
            let nodeIDUrl = "InvoiceRevise/GetCurrentWFNode/" + this.urlParamObj.applyid;
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            this.dbHttp.post(nodeIDUrl, {}, options)
                .toPromise()
                .then(res => {
                    if (res.Data) {
                        let data = JSON.parse(res.Data);
                        this.nodeDataList.taskid = data.taskid;
                        this.nodeDataList.nodeid = data.nodeid;
                    }
                })
            this.dbHttp.post(url).subscribe(
                data => {
                    if (data.Result) {
                        this.wfData = JSON.parse(data.Data);
                        let progressOne = {
                            "NodeID": "1",
                            "NodeName": "申请人",
                            "IsShow": true,
                            "IsAlready": true,
                            "AuditDate": "",
                            "TaskOpinions": "同意",
                            "ApproveUsers": {

                            }
                        }
                        if (this.nodeDataList.nodeid == "2") {
                            progressOne = {
                                "NodeID": "1",
                                "NodeName": "申请人",
                                "IsShow": true,
                                "IsAlready": false,
                                "AuditDate": "",
                                "TaskOpinions": "拒绝",
                                "ApproveUsers": {

                                }
                            }
                        }
                        this.wfData.wfprogress.splice(0, 0, progressOne);
                        if (this.wfData.wfhistory != null && this.wfData.wfhistory.length > 0)
                            this.wfData.wfhistory.reverse();
                        this.wfView.onInitData(this.wfData.wfprogress);
                    }
                }, null, null
            );
        }
    }
    _initParam() {
        this.urlParamObj.nodeid = this.routerInfo.snapshot.queryParams['nodeid'];
        if(this.urlParamObj.nodeid){
            this.isPass = true;
        }
        this.urlParamObj.taskid = this.routerInfo.snapshot.queryParams['taskid'];
        this.urlParamObj.applyid = this.routerInfo.snapshot.queryParams['applyid'];
        this.urlParamObj.adp = this.routerInfo.snapshot.queryParams['ADP'];
        let recordid = this.routerInfo.snapshot.queryParams['recordid'];
        if (this.urlParamObj.applyid == undefined || this.urlParamObj.applyid == "") {
            this.urlParamObj.applyid = recordid;
        }

        this.appParms.taskid = this.urlParamObj.taskid;
        this.appParms.nodeid = this.urlParamObj.nodeid;
        this.adpAppParms.taskid = this.urlParamObj.taskid;
    }
    _initViewParms() {
        if (this.urlParamObj.taskid != undefined && this.urlParamObj.taskid != "") {
            this.isView = false;
        }
        if (this.urlParamObj.adp != undefined && this.urlParamObj.adp != "") {
            this.isADP = true;
        }
        if (this.urlParamObj.nodeid == "6") {//商务
            this.isBusiness = true;
        }
        if (this.urlParamObj.nodeid == "9") {//财务发票
            this.isFinance = true;
        }
    }
    /** approve eng */
}
export class subrevisetypeData {
    constructor(
        public subtypecode: any,
        public subtype: any
    ) { }
}
export class ReviseTypes {
    constructor(
        public revisetypecode: string,
        public revisetype: string,
        public children: Array<string>
    ) { }
}
//默认选择数据
export class defaultdata {
    constructor(
        public company: company[],
        public businesses: businesses[],
        public invoicetypes: invoicetypes[],
        public platforms: platforms[],
        public redtypes: redtypes[],
    ) { }
}
export class company {
    constructor(
        public id: string,
        public text: string
    ) { }
}
export class businesses {
    constructor(
        public id: string,
        public text: string
    ) { }
}
export class invoicetypes {
    constructor(
        public id: string,
        public text: string
    ) { }
}
export class platforms {
    constructor(
        public id: string,
        public text: string
    ) { }
}
export class redtypes {
    constructor(
        public id: string,
        public text: string
    ) { }
}
export class tabListData {
    constructor(
        public value,
        public active
    ) { }
}
export class redList {
    constructor(
        public externalinvoiceno,
        public rednoticeno
    ) { }
}
export class erpData {
    constructor(
        public invoice,
        public group
    ) { }
}
export class groupData {
    constructor(
        public groupno: 1,//"明细组别（0(申请)-1(虚退)1(虚出第一组)2(虚出第二组)",
        public ordertype: "",
        public invoiceremark: "",
        public material
    ) { }
}
export class meterialData {
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
export class invoiceApprove {
    constructor(
        public invoiceId,
        public orderno,
        public internalinvoiceno,
        public originalcustomercode,
        public originalcustomer,
        public customercode,
        public customer,
        public rednoticeno,
        public PURCH_NO_C,
        public seller,
        public sellercode,
        public SALES_ORG,
        public DISTR_CHAN,
        public DIVISION,
        public SALES_OFF,
        public SALES_GRP,
        public TransitMode,
        public TransitModeCode,
        public SDF_KUNNR,
        public SDF_NAME,
        public detailaddress,
        public province,
        public city,
        public citycode,
        public district,
        public zipcode,
        public connecter,
        public phone,
        public AUART,
        public ZTERM
    ) { }
}
