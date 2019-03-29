
import {map} from 'rxjs/operators/map';
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
    templateUrl: 'bill-check.component.html',
    styleUrls: ['bill-check.scss']
})
export class BillCheckComponent implements OnInit {
    /**
    *获取流程数据信息（流程审批历史，流程审批全景）
    */
    @ViewChild('wfview')
    wfView: DbWfviewComponent;
    constructor(private WindowService: WindowService, private router: Router, private billBackService: billBackService,
        private location: Location, private dbHttp: HttpServer, private routerInfo: ActivatedRoute) { }
    //流程信息
    public nodeDataList = {
        "taskid": "",
        "approveresult": "Approval",
        "nodeid": "",//流程节点Id
        "opinions": "同意",
    };
    //延期
    public selectGroup = ["是", "否"];
    public selectedCompaneyData;
    public selectedCompaney(e, item) {
        if (e == '是') {
            item.receiptdate = 1;
            this.selectedCompaneyData = 1;
        } else {
            item.receiptdate = -1;
            this.selectedCompaneyData = -1;
        }
    }
    //数据提交
    public billBack = {
        apply: {},
        accessory: [],
        invoice: [],
        material: []
    };
    //弹出层
    public showLocation = false;
    public showTimeMap() {
        this.showLocation = true;
    }
    public missData(e) {
        this.showLocation = e;
    }
    public addressData(e) {
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
    //判断类型
    public listType: boolean;
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

    public defaultList: defaultdata;//下拉框默认显示
    public defaultCompany;
    public defaultBuse;
    public defaultinvoicetypes;
    public defaultplatforms;
    public defaultredtypes

    public accessoryExamine;//附件信息
    public materialExamine = [];//物料表单信息
    public billTypeId;//选中小类
    public examineApply;//
    public momentData;//临时类型集合
    public redReviseSubType;//小类box

    public backtabData = []//tab头
    public materialList;
    public invoicenoActive;//当前选中项
    public tabActive = function (e) {
        //初始化
        // this.materialList = [];
        // for (let i = 0, len = this.materialExamine.length; i < len; i++) {
        //     if (this.materialExamine.internalinvoiceno == this.backtabData[0].value) {
        //         this.materialList.push(this.materialExamine[i]);
        //     }
        // }

        for (let i = 0, len = this.backtabData.length; i < len; i++) {
            this.backtabData[i].active = false;
        }
        e.active = true;
        this.invoicenoActive = e.value;

        //添加一条新内容
        if (this.newlistApprove != [] && this.isBusiness) {
            for (let i = 0, len = this.newlistApprove.length; i < len; i++) {
                if (this.newlistApprove[i].internalinvoiceno != e.value) {
                    this.newTableFlag = false;
                }
            }
            if (!this.newTableFlag) {
                for (let i = 0, len = this.newlistApprove.length; i < len; i++) {
                    if (this.newlistApprove[i].internalinvoiceno == e.value) {
                        this.newTableFlag = true;
                        break;
                    }
                }
            }

            this.addMeterial = [];
            for (let f = 0, len = this.newlistApprove.length; f < len; f++) {
                if (this.newlistApprove[f].internalinvoiceno == this.invoicenoActive) {
                    this.addMeterial.push(
                        this.newlistApprove[f]
                    )
                }
            }
        }

        if (this.isBusiness) {
            //切换写入erp按钮
            for (let i = 0, len = this.erpFlagList.length; i < len; i++) {
                if (this.invoicenoActive == this.erpFlagList[i].internalinvoiceno) {
                    if (this.erpFlagList[i].plusERP) {
                        this.ErpPlusFlag = true;
                    } else {
                        this.ErpPlusFlag = false;
                    }
                    if (this.erpFlagList[i].minusERP) {
                        this.ErpMinusFlag = true;
                    } else {
                        this.ErpMinusFlag = false;
                    }
                }
            }

            //切换红字
            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
                    this.redNumberNow = {
                        internalinvoiceno: this.examineMoney[i].internalinvoiceno,
                        text: this.examineMoney[i].rednoticeno
                    };
                }
            }
            for (let i = 0, len = this.materialLocal.length; i < len; i++) {
                if (this.materialLocal[i].internalinvoiceno == this.invoicenoActive) {
                    this.invoiceremarkNow = {
                        internalinvoiceno: this.materialLocal[i].internalinvoiceno,
                        text: this.materialLocal[i].invoiceremark
                    };
                }
            }
        }

        this.materialList = [];
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                this.materialList.push(this.materialExamine[i]);
            }
        }

        this.materialList0 = [];
        this.materialList1 = [];
        this.materialList2 = [];
        for (let i = 0, len = this.meterial1.length; i < len; i++) {
            if (this.meterial1[i].internalinvoiceno == this.invoicenoActive) {
                this.materialList0.push(this.meterial1[i]);
            }
        }

        for (let i = 0, len = this.meterial2.length; i < len; i++) {
            if (this.meterial1[i].internalinvoiceno == this.invoicenoActive) {
                this.materialList1.push(this.meterial2[i]);
            }
        }
        for (let i = 0, len = this.meterial3.length; i < len; i++) {
            if (this.meterial3[i].internalinvoiceno == this.invoicenoActive) {
                this.materialList2.push(this.meterial3[i]);
            }
        }
        //默认选择项
        if (this.materialList1.length > 0) {
            this.erpDataSavePlus.invoiceremark = this.materialList1[0].invoiceremark;
            this.needGo = [{ id: '002', text: this.materialList1[0].ordertype }];
        }
        if (this.materialList0.length > 0) {
            this.needReturn = [{ id: '001', text: this.materialList0[0].ordertype }];
        }
        if (this.materialList2.length > 0) {
            this.erpDataSavePlus2.invoiceremark = this.materialList2[0].invoiceremark;
            this.needSecond = [{ id: '003', text: this.materialList2[0].ordertype }];
        }

        //禁用erp
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.invoicenoActive == this.materialExamine[i].internalinvoiceno) {
                if (this.materialExamine[i].groupno == -1) {
                    this.ErpMinusFlag = false;
                }
                if (this.materialExamine[i].groupno == 1 || this.materialExamine[i].groupno == 2) {
                    this.ErpPlusFlag = false;
                }
            }
        }
        //原单数据
        this.oldMaterrialList = []
        for (let i = 0, len = this.materrialArrayCheck.length; i < len; i++) {
            if (this.materrialArrayCheck[i].internalinvoiceno == this.invoicenoActive) {
                this.oldMaterrialList.push(this.materrialArrayCheck[i]);
            }
        }
        console.log(this.oldMaterrialList, this.materrialArrayCheck);
        this.oldMaterrialList2 = []
        for (let i = 0, len = this.materrialArrayCheck2.length; i < len; i++) {
            if (this.materrialArrayCheck2[i].internalinvoiceno == this.invoicenoActive) {
                this.oldMaterrialList2.push(this.materrialArrayCheck2[i]);
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
        { id: '003', text: 'ZRE' }
    ];
    public orderTypeData = [
        { id: '004', text: 'ZDR' },
        { id: '005', text: 'ZTY' },
        { id: '008', text: 'ZSD' },
        { id: '010', text: 'ZOR' }
    ]
    //默认订单类型
    public needReturn = [];
    public needGo = [];
    public needSecond = [];

    public isIdSix = false;
    public materialList0 = [];
    public materialList1 = [];
    public materialList2 = [];
    public redNumberNow = {
        internalinvoiceno: '',
        text: ''
    };
    let
    public invoiceremarkNow = {
        internalinvoiceno: '',
        text: ''
    }
    public ducumentList = [];
    public IsNodeId5 = false;
    public IsNodeId7 = false;
    public IsNodeId11 = false;
    public IsNodeId12 = false;
    public isBusnessPass = false;
    public rednoticenoFlag = false;
    public oldMaterialFlag;
    //加载原数据
    public materrialArrayCheck = [];
    public localDataInvoice;
    public oldMaterrialList = [];//订单原数据
    //分离数据
    public materrialArrayCheck2 = [];
    public oldMaterrialList2 = [];
    //运输类型
    public TransitModeData = {
        TransitMode: '',
        detailaddress: ''
    };
    public erpFlagList = [];
    public meterial1 = [];
    public meterial2 = [];
    public meterial3 = [];
    public materialLocal;
    ngOnInit() {
        this.urlFlag = this.location.path().toString();
        this._initParam();
        this.onGetWfHistoryData();
        this.examineMoney = [];
        if (this.urlParamObj.applyid != undefined && this.urlParamObj.applyid != '') {
            //整体数据
            let url = "InvoiceRevise/GetApplyById/" + this.urlParamObj.applyid
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            this.dbHttp.post(url, {}, options)
                .toPromise()
                .then(res => {
                    if (!res.Result) {
                        this.WindowService.alert({ message: res.Message, type: "fail" });
                    }
                    else {
                        let data = JSON.parse(res.Data);
                        this.returnTypeBack = data.defaultordertype;
                        let listTypeDate = Number(data.apply.revisetypecode);
                        if (listTypeDate < 700) {
                            this.listType = false;
                        }
                        else if (listTypeDate > 700 || listTypeDate == 700) {
                            this.listType = true;
                            if (this.urlFlag.length < 30) {
                                let locaUrl = this.urlFlag.split("?")[1].split("=")[1];
                                let routerUrl = "bill/return-check";
                                let queryParams = {
                                    applyid: locaUrl
                                }
                                this.router.navigate([routerUrl], { queryParams: queryParams });
                            }
                            // if (this.urlFlag.length > 30) {
                            //     let locaUrl = this.urlFlag.split("?")[1].split("=")[1];
                            //     let routerUrl = "bill/return-check";
                            //     let queryParams = {
                            //         taskid: this.urlParamObj.taskid,
                            //         recordid: this.urlParamObj.applyid,
                            //         nodeid: this.urlParamObj.nodeid,
                            //         APID: this.routerInfo.snapshot.queryParams['APID'],
                            //         ADP: this.urlParamObj.adp
                            //     }
                            //     this.router.navigate([routerUrl], { queryParams: queryParams });
                            // }
                            this.appParms.apiUrl_AR = "/InvoiceRevise/ApproveProductReturn";
                            if (this.returnTypeBack["xutui"] == "ZCR") {
                                this.revisetypeApprove = "typesix";
                            }
                            if (this.returnTypeBack["xutui"] == "RE" && this.returnTypeBack["xuchu"] == "") {
                                this.revisetypeApprove = "typeseven";
                            }
                            if (this.returnTypeBack["xutui"] == "RE" && this.returnTypeBack["xuchu"] != "") {
                                this.revisetypeApprove = "typeeight";
                            }
                            if (this.returnTypeBack["xutui"] == "ZRE" && this.returnTypeBack["xuchu"] != "") {
                                this.revisetypeApprove = "typenine";
                            }
                        }
                        this._initViewParms();//是否流程状态赋值
                        //订单类型默认值
                        this.needReturn = [{ id: '001', text: this.returnTypeBack["xutui"] }];
                        this.needGo = [{ id: '002', text: this.returnTypeBack["xuchu"] }];

                        this.erpDataSavePlus.ordertype = this.returnTypeBack["xuchu"];
                        this.erpDataSaveMinus.ordertype = this.returnTypeBack["xutui"];
                        this.erpDataSavePlus2.ordertype = this.returnTypeBack["xuchu"];

                        //基础信息
                        this.changeEventObject(data.apply, this.applyDate);
                        this.applyDate.applydate = this.ChangeDateFormat(this.applyDate.applydate);
                        //判断物料信息显示类型
                        let revisetypeData
                        if (this.applyDate.subrevisetype) {
                            revisetypeData = JSON.parse(this.applyDate.subrevisetype)
                        };

                        let localsubrevisetype;
                        if (this.applyDate.subrevisetype) {
                            localsubrevisetype = JSON.parse(this.applyDate.subrevisetype)
                        };
                        if (localsubrevisetype) {
                            for (let i = 0, len = localsubrevisetype.length; i < len; i++) {
                                this.subrevisetypeList.push(localsubrevisetype[i].subtype)
                            }
                        }
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
                        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                            this.examineMoney[i].originalreceiptdate = this.ChangeDateFormat(this.examineMoney[i].originalreceiptdate);
                        }
                        //原发票日期转化及判断
                        let dataNow = new Date().getMonth() + 1;
                        //判断外部发票日期
                        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
                        let options = new RequestOptions({ headers: headers });
                        let url = "InvoiceRevise/InvoiceOverMonth/" + this.urlParamObj.applyid
                        this.dbHttp.post(url, {}, options)
                            .toPromise()
                            .then(res => {
                                let data = JSON.parse(res.Data);
                                this.monthPass = data;
                            })
                        if (Number(this.urlParamObj.nodeid) == 5) {
                            this.IsNodeId5 = true;
                        } else if (Number(this.urlParamObj.nodeid) != 5) {
                            this.IsNodeId5 = false;
                        }
                        if (Number(this.urlParamObj.nodeid) == 7 && this.listType != undefined && this.listType) {
                            this.IsNodeId7 = true;
                        } else if (Number(this.urlParamObj.nodeid) != 7) {
                            this.IsNodeId7 = false;
                        }
                        if (Number(this.urlParamObj.nodeid) == 11) {
                            this.IsNodeId11 = true;
                        }
                        // else if (Number(this.urlParamObj.nodeid) == 4) {
                        //     this.IsNodeId11 = true;
                        // }
                        else if (Number(this.urlParamObj.nodeid) != 11) {
                            this.IsNodeId11 = false;
                        }
                        if (Number(this.urlParamObj.nodeid) == 12) {
                            this.IsNodeId12 = true;
                        } else if (Number(this.urlParamObj.nodeid) != 12) {
                            this.IsNodeId12 = false;
                        }
                        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                            this.examineMoney[i].invoicedate = this.ChangeDateFormat(this.examineMoney[i].invoicedate)

                            this.redListData.push(
                                new redList(
                                    this.examineMoney[i].internalinvoiceno,
                                    this.examineMoney[i].externalinvoiceno, this.examineMoney[i].rednoticeno
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
                            this.erpFlagList.push(
                                new erpFlagData(
                                    this.examineMoney[i].internalinvoiceno,
                                    true,
                                    true
                                )
                            )
                        }
                        //初始化tab
                        this.backtabData[0].active = true;
                        this.invoicenoActive = this.backtabData[0].value;

                        //附件信息
                        this.accessoryExamine = data.accessory;
                        //物料信息
                        this.materialLocal = data.material;
                        for (let i = 0, len = data.material.length; i < len; i++) {
                            if (data.material[i].groupno == null || data.material[i].groupno == 0) {
                                this.materialExamine.push(data.material[i])
                            }
                            this.invoiceremarkNow = {
                                internalinvoiceno: data.material[0].internalinvoiceno,
                                text: data.material[0].invoiceremark
                            };
                        }
                        for (let i = 0, len = data.material.length; i < len; i++) {
                            if (data.material[i].groupno == -1 || data.material[i].groupno == 1 || data.material[i].groupno == 2) {
                                this.isBusnessPass = true;
                            }
                        }
                        for (let i = 0, len = data.material.length; i < len; i++) {
                            if (data.material[i].groupno == -1 && data.material[i].ERPorderno != null && data.material[i].ERPorderno != '') {
                                this.meterial1.push(data.material[i])
                            }
                            else if (data.material[i].groupno == 1 && data.material[i].ERPorderno != null && data.material[i].ERPorderno != "") {
                                this.meterial2.push(data.material[i])
                            }
                            else if (data.material[i].groupno == 2 && data.material[i].ERPorderno != null && data.material[i].ERPorderno != '') {
                                this.meterial3.push(data.material[i])
                            }
                        }

                        for (let i = 0, len = this.meterial1.length; i < len; i++) {
                            if (this.meterial1[i].internalinvoiceno == this.invoicenoActive) {
                                this.materialList0.push(this.meterial1[i]);
                            }
                        }
                        for (let i = 0, len = this.meterial2.length; i < len; i++) {
                            if (this.meterial2[i].internalinvoiceno == this.invoicenoActive) {
                                this.materialList1.push(this.meterial2[i]);
                            }
                        }
                        for (let i = 0, len = this.meterial3.length; i < len; i++) {
                            if (this.meterial3[i].internalinvoiceno == this.invoicenoActive) {
                                this.materialList2.push(this.meterial3[i]);
                            }
                        }
                        //冲退明细默认选择项
                        if (JSON.stringify(this.materialList1) != "[]") {
                            this.erpDataSavePlus.invoiceremark = this.materialList1[0].invoiceremark;
                        }
                        if (JSON.stringify(this.materialList2) != "[]") {
                            this.erpDataSavePlus2.invoiceremark = this.materialList2[0].invoiceremark;
                        }
                        if (JSON.stringify(this.materialList0) != "[]") {
                            this.needReturn = [{ id: '001', text: this.materialList0[0].ordertype }];
                        }
                        if (JSON.stringify(this.materialList1) != "[]") {
                            this.needGo = [{ id: '002', text: this.materialList1[0].ordertype }];
                        }
                        if (JSON.stringify(this.materialList2) != "[]") {
                            this.needSecond = [{ id: '003', text: this.materialList2[0].ordertype }];
                        }
                        //运输方式
                        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                            if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
                                this.TransitModeData.TransitMode = this.examineMoney[i].TransitMode;
                                this.TransitModeData.detailaddress = this.examineMoney[i].detailaddress;
                            }
                        }
                        this.materialList = [];
                        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
                            if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                                this.materialList.push(this.materialExamine[i]);
                            }
                        }
                        //写入erp禁用
                        for (let i = 0, len = data.material.length; i < len; i++) {
                            if (this.invoicenoActive == data.material[i].internalinvoiceno) {
                                if (data.material[i].groupno == -1 && data.material[i].ERPorderno != null && data.material[i].ERPorderno != '') {
                                    this.ErpMinusFlag = false;
                                }
                                if (data.material[i].groupno == 1 && data.material[i].ERPorderno != null && data.material[i].ERPorderno != '') {
                                    this.ErpPlusFlag = false;
                                }
                            }
                        }
                        this.billBack.apply = this.applyDate;
                        this.billBack.accessory = this.accessoryExamine;
                        this.billBack.invoice = this.examineMoney;
                        this.billBack.material = this.materialExamine;
                        //从数据中识别默认选中类型
                        this.examineApply = data.apply;
                        if (this.examineApply.revisetype == "价格更改") {
                            this.billTypeId = "priceType";
                        }
                        if (this.examineApply.revisetype == "退货") {
                            this.billTypeId = "returnGoods";
                        }
                        if (this.examineApply.revisetype == "换货") {
                            this.billTypeId = "exchange";
                        }

                        if (this.examineApply.revisetype == "发票票面信息更改") {
                            let data = JSON.parse(this.examineApply.subrevisetype)
                            for (let i = 0, len = data.length; i < len; i++) {
                                if (data[i].subtype == "物料号") {
                                    this.billTypeId = "materielType";
                                    break;
                                }
                            }
                        }
                        if (this.examineApply.revisetype == "系统冲红（不涉及外部发票）") {
                            let data = JSON.parse(this.examineApply.subrevisetype)
                            for (let i = 0, len = data.length; i < len; i++) {
                                if (data[i].subtype == "冲成本") {
                                    this.billTypeId = "costType";
                                    break;
                                }
                            }
                        }
                        if (this.applyDate.revisetype == "发票票面信息更改") {
                            for (let i = 0, len = revisetypeData.length; i < len; i++) {
                                if (revisetypeData[i].subtype == "经工商局认定的客户名称变更" || revisetypeData[i].subtype == "账号、开户行、地址、电话"
                                    || revisetypeData[i].subtype == "税号" || revisetypeData[i].subtype == "物料描述（物料号不变）") {

                                    this.revisetypeApprove = "typeOne"
                                } else if (revisetypeData[i].subtype == "物料号") {
                                    this.revisetypeApprove = "typeTwo"
                                    this.oldMaterialFlag = true;
                                }
                            }
                        }
                        if (this.applyDate.revisetype == "系统冲红（不涉及外部发票）") {
                            if (revisetypeData[0].subtype == "冲系统发票") {
                                this.revisetypeApprove = "typeOne"
                            }
                            if (revisetypeData[0].subtype == "冲成本") {
                                this.revisetypeApprove = "typeTwo"
                            }
                        }
                        if (this.applyDate.revisetype == "发票类型更改") {
                            this.revisetypeApprove = "typeOne"
                        }
                        if (this.applyDate.revisetype == "价格更改") {
                            this.revisetypeApprove = "typeThree"
                        }
                        if (this.applyDate.revisetype == "折让") {
                            this.revisetypeApprove = "typeFour"
                        }
                        if (this.applyDate.revisetype == "其他情况冲红") {
                            this.revisetypeApprove = "typeFive"
                        }

                        //循环获取订单号以获取物料,物料明细时获取原数据
                        let ordernoData;
                        for (let n = 0, len = data.invoice.length; n < len; n++) {
                            // if (data.invoice[n].internalinvoiceno == this.invoicenoActive) {
                            //     ordernoData = data.invoice[n].orderno;
                            // }
                            ordernoData = data.invoice[n].orderno;
                            let invoicenoArray = [];
                            let InvoiceByOrderNoUrl = "InvoiceRevise/GetInvoiceByOrderNo/" + ordernoData;
                            this.dbHttp.post(InvoiceByOrderNoUrl, [], options)
                                .toPromise()
                                .then(res => {
                                    this.localDataInvoice = JSON.parse(res.Data);
                                    if (this.localDataInvoice.length > 0) {
                                        for (let i = 0, len = this.localDataInvoice.length; i < len; i++) {
                                            invoicenoArray.push(
                                                new ordernoinvoiceno(
                                                    this.localDataInvoice[i].internalinvoiceno,
                                                    this.localDataInvoice[i].orderno
                                                )
                                            )
                                        }
                                    }
                                    this.dbHttp.post("InvoiceRevise/GetMaterial", invoicenoArray, options
                                    )
                                        .toPromise()
                                        .then(res => {
                                            let localData = JSON.parse(res.Data);
                                            let localDataMaterial = [];
                                            for (let i = 0, len = localData.length; i < len; i++) {
                                                for (let n = 0, len = localData[i].material.length; n < len; n++) {
                                                    localData[i].material[n].internalinvoiceno = localData[i].internalinvoiceno;
                                                    localDataMaterial.push(localData[i].material[n]);
                                                }
                                            }
                                            for (let i = 0, len = localDataMaterial.length; i < len; i++) {
                                                this.materrialArrayCheck.push(
                                                    new materialCheck(
                                                        localDataMaterial[i].materialId,
                                                        localDataMaterial[i].invoiceId,
                                                        localDataMaterial[i].internalinvoiceno,
                                                        localDataMaterial[i].projcode,
                                                        localDataMaterial[i].originalmaterialcode,
                                                        localDataMaterial[i].materialcode,
                                                        localDataMaterial[i].originaldescription,
                                                        localDataMaterial[i].description,
                                                        localDataMaterial[i].num,
                                                        localDataMaterial[i].factory,
                                                        localDataMaterial[i].originalstoragelocation,
                                                        localDataMaterial[i].storagelocation,
                                                        localDataMaterial[i].originalbatchno,
                                                        localDataMaterial[i].batchno,
                                                        localDataMaterial[i].originalmoney,
                                                        localDataMaterial[i].money,
                                                        localDataMaterial[i].originalbackmoney,
                                                        localDataMaterial[i].backmoney,
                                                        localDataMaterial[i].returnnum,
                                                        localDataMaterial[i].returnstoragelocation,
                                                        localDataMaterial[i].specifystoragelocation,
                                                        localDataMaterial[i].deliveryno,
                                                        localDataMaterial[i].ordertype,
                                                        localDataMaterial[i].groupno,
                                                        localDataMaterial[i].ERPorderno,
                                                        localDataMaterial[i].CURRENCY,
                                                        localDataMaterial[i].invoiceremark
                                                    )
                                                )
                                            }
                                            for (let i = 0, len = this.materrialArrayCheck.length; i < len; i++) {
                                                for (let n = 0, len = this.localDataInvoice.length; n < len; n++) {
                                                    if (this.materrialArrayCheck[i].internalinvoiceno == this.localDataInvoice[n].internalinvoiceno) {
                                                        this.materrialArrayCheck[i].deliveryno = this.localDataInvoice[n].deliveryno,
                                                            this.materrialArrayCheck[i].externalinvoiceno = this.localDataInvoice[n].externalinvoiceno,
                                                            this.materrialArrayCheck[i].internalinvoiceno = this.localDataInvoice[n].internalinvoiceno,
                                                            this.materrialArrayCheck[i].invoicedate = this.localDataInvoice[n].invoicedate,
                                                            this.materrialArrayCheck[i].orderno = this.localDataInvoice[n].orderno,
                                                            this.materrialArrayCheck[i].originalcustomer = this.localDataInvoice[n].originalcustomer,
                                                            this.materrialArrayCheck[i].originalcustomercode = this.localDataInvoice[n].originalcustomercode,
                                                            this.materrialArrayCheck[i].originalmone = this.localDataInvoice[n].originalmoney
                                                    }
                                                }
                                            }
                                            for (let i = 0, len = this.materrialArrayCheck.length; i < len; i++) {
                                                this.materrialArrayCheck[i].originalmaterialcode = Number(this.materrialArrayCheck[i].originalmaterialcode) + 0;
                                                this.materrialArrayCheck[i].materialcode = Number(this.materrialArrayCheck[i].originalmaterialcode) + 0;
                                                this.materrialArrayCheck[i].description = this.materrialArrayCheck[i].originaldescription;
                                            }
                                            let materialStr = JSON.stringify(this.materrialArrayCheck);
                                            this.materrialArrayCheck2 = JSON.parse(materialStr);
                                            this.oldMaterrialList = [];
                                            for (let i = 0, len = this.materrialArrayCheck.length; i < len; i++) {
                                                if (this.materrialArrayCheck[i].internalinvoiceno == this.invoicenoActive) {
                                                    this.oldMaterrialList.push(this.materrialArrayCheck[i]);
                                                }
                                            }
                                            this.oldMaterrialList2 = [];
                                            for (let i = 0, len = this.materrialArrayCheck2.length; i < len; i++) {
                                                if (this.materrialArrayCheck2[i].internalinvoiceno == this.invoicenoActive) {
                                                    this.oldMaterrialList2.push(this.materrialArrayCheck2[i]);
                                                }
                                            }
                                            // if (this.urlParamObj.nodeid == "6" && this.billTypeId == "materielType") {
                                            //     this.materialList = this.materrialArrayCheck;
                                            // }
                                        })
                                })
                        }
                    }
                })
        }
        if (this.redListData.length > 0) {
            if (this.redListData[0].rednoticeno != '') {
                this.rednoticenoFlag == true;
            }
        }
    }
    
    public getDescription(e, item) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;

        this.dbHttp.post(url, [], options)
            .toPromise()
            .then(res => {
                let localData = res.Data;
                item.description = localData;
            })
    }
    

    //写入erp

    public selecteOrderTypeList(e) {
        this.erpDataSaveMinus.ordertype = e.text;
    }
    public selecteOrderTypeData(e) {
        this.erpDataSavePlus.ordertype = e.text;
    }
    public selecteOrderTypeData2(e) {
        this.erpDataSavePlus2.ordertype = e.text;
    }
    public clearInput(e, item) {
        let data = e.replace("请输入", "").replace("交货单号", "") + "deliveryno"
        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
            let x;
            if (item.internalinvoiceno == this.examineMoney[i].internalinvoiceno) {
                for (x in this.examineMoney[i]) {
                    if (x == data) {
                        this.examineMoney[i][x] = ' ';
                    }
                }
            }
        }
    }
    public erpDataSaveMinus = {
        "groupno": -1,
        "ordertype": "",
        "rednoticeno": "",
        invoiceremark: "",
        "material": []
    };
    public erpDataSavePlus = {
        "groupno": 1,
        "ordertype": "",
        "invoiceremark": "",
        "material": []
    };
    public erpDataSavePlus2 = {
        "groupno": 2,
        "ordertype": "",
        "invoiceremark": "",
        "material": []
    };
    public saveredNumber(e) {
        this.erpDataSaveMinus.rednoticeno = e;
        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
            if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
                this.examineMoney[i].rednoticeno = e;
            }
        }
        this.billBack.invoice = this.examineMoney;
        let billData = this.billBack;
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        this.dbHttp.post("InvoiceRevise/SaveApply", body, options).pipe(
            map(res => res))
            .subscribe(res => {
                console.log(res)
            })
    }

    public saveRemark(e) {
        this.erpDataSavePlus.invoiceremark = e;
        for (let i = 0, len = this.materialLocal.length; i < len; i++) {
            if (this.materialLocal[i].internalinvoiceno == this.invoicenoActive) {
                this.materialLocal[i].invoiceremark = e;
                this.invoiceremarkNow = {
                    internalinvoiceno: this.invoicenoActive,
                    text: e
                }
            }
        }
    }
    public saveComplexaccout(e) {
        this.saveBill();
    }
    public ErpMinusFlag = true;
    public ErpPlusFlag = true;

    public isSendERP(e) {
        if (e == "是") {
            this.ErpMinusFlag = false;
            this.ErpPlusFlag = false;
        }
        else if (e == "否") {
            this.ErpMinusFlag = true;
            this.ErpPlusFlag = true;
        }
    }
    public sendErpMinus() {
        for (let i = 0, len = this.redListData.length; i < len; i++) {
            if (this.redListData[i].internalinvoiceno == this.invoicenoActive) {
                this.erpDataSaveMinus.rednoticeno = this.redListData[i].rednoticeno
            }
        }
        let material = [];
        let invoiceData;
        //判断订单类型写入
        if (this.revisetypeApprove == "typenine") {
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
                }
            }
            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
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
        }
        if (this.revisetypeApprove != "typenine") {
            console.log(this.oldMaterrialList,this.materialExamine)
            for (let i = 0, len = this.oldMaterrialList.length; i < len; i++) {
                if (this.oldMaterrialList[i].internalinvoiceno == this.invoicenoActive) {
                    material.push(
                        new meterialData(
                            this.oldMaterrialList[i].projcode,
                            this.oldMaterrialList[i].originalmaterialcode,
                            this.oldMaterrialList[i].originaldescription,
                            this.oldMaterrialList[i].num,
                            this.oldMaterrialList[i].factory,
                            this.oldMaterrialList[i].originalstoragelocation,
                            this.oldMaterrialList[i].originalbatchno,
                            this.oldMaterrialList[i].originalmoney,
                            this.oldMaterrialList[i].originalbackmoney,
                            this.oldMaterrialList[i].CURRENCY
                        )
                    )
                }
            }
            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
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

        }
        this.erpDataSaveMinus.material = material;
        this.erpDataSaveMinus.invoiceremark = this.invoiceremarkNow.text;
        let data = new erpData(
            invoiceData, [
                this.erpDataSaveMinus
            ]
        );
        let body = data;
        // api.dboms.com  
        console.log(JSON.stringify(body));
        let url = "InvoiceRevise/SaveToERP";
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, body, options)
            .toPromise()
            .then(res => {
                let backMessage = res.Message
                if (res.Result == true) {
                    let data = JSON.parse(res.Data);
                    this.ErpMinusFlag = false;
                    for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                        for (let n = 0, len = data.length; n < len; n++) {
                            if (this.examineMoney[i].internalinvoiceno == data[n].internalinvoiceno) {
                                let x;
                                for (x in this.examineMoney[i]) {
                                    if (x == data[n].ordertype + 'orderno') {
                                        this.examineMoney[i][x] = data[n].orderno
                                    }
                                    if (x == data[n].ordertype + 'deliveryno') {
                                        this.examineMoney[i][x] = "请输入" + data[n].ordertype + "交货单号"
                                    }
                                }
                            }
                        }
                    }
                    this.saveBill();
                    for (let i = 0, len = this.erpFlagList.length; i < len; i++) {
                        if (data[0].internalinvoiceno == this.erpFlagList[i].internalinvoiceno) {
                            this.erpFlagList[i].minusERP = false;
                        }
                    }
                    this.hasSaved = true;
                    this.WindowService.alert({ message: "写入成功", type: "success" });
                }
                else if (res.Result == false) {
                    this.WindowService.alert({ message: backMessage, type: "fail" });
                    this.ErpMinusFlag = true;
                    return;
                }
            })
    }
    public sendErpPlus() {//正向写入erp
        let material = [];
        let material2 = [];
        let invoiceData;

        if (this.revisetypeApprove == "typeOne" || this.revisetypeApprove == "typeFive") {
            for (let i = 0, len = this.materialExamine.length; i < len; i++) {
                if (this.materialExamine[i].internalinvoiceno == this.invoicenoActive) {
                    material.push(
                        new meterialData(
                            this.oldMaterrialList2[i].projcode,
                            this.oldMaterrialList2[i].originalmaterialcode,
                            this.oldMaterrialList2[i].originaldescription,
                            this.oldMaterrialList2[i].num,
                            this.oldMaterrialList2[i].factory,
                            this.oldMaterrialList2[i].originalstoragelocation,
                            this.oldMaterrialList2[i].originalbatchno,
                            this.oldMaterrialList2[i].originalmoney,
                            this.oldMaterrialList2[i].originalbackmoney,
                            this.oldMaterrialList2[i].CURRENCY
                        )
                    )
                }
            }
            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
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
        }
        else {
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
                }
            }
            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                if (this.examineMoney[i].internalinvoiceno == this.invoicenoActive) {
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
        }
        this.erpDataSavePlus.material = material;
        this.erpDataSavePlus.invoiceremark = this.invoiceremarkNow.text;
        let data = new erpData(
            invoiceData, [
                this.erpDataSavePlus
            ]
        );
        if (this.newTableFlag) {
            for (let i = 0, len = this.addMeterial.length; i < len; i++) {
                material2.push(
                    new meterialData(
                        this.addMeterial[i].projcode,
                        this.addMeterial[i].materialcode,
                        this.addMeterial[i].description,
                        this.addMeterial[i].num,
                        this.addMeterial[i].factory,
                        this.addMeterial[i].storagelocation,
                        this.addMeterial[i].batchno,
                        this.addMeterial[i].money,
                        this.addMeterial[i].backmoney,
                        this.addMeterial[i].CURRENCY
                    )
                )
            }

            this.erpDataSavePlus2.material = material2;
            this.erpDataSavePlus2.invoiceremark = this.invoiceremarkNow.text;
            data = new erpData(
                invoiceData, [
                    this.erpDataSavePlus
                    , this.erpDataSavePlus2
                ]
            );
        }

        this.ErpPlusFlag = false;
        let flag = true;
        let body = data;
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        // 10.0.1.26:88
        let url = "InvoiceRevise/SaveToERP";
        console.log(JSON.stringify(data));
        if (flag) {
            this.dbHttp.post(url, body, options)
                .toPromise()
                .then(res => {
                    let backMessage = res.Message
                    if (res.Result == true) {
                        this.ErpPlusFlag = false;
                        let data = JSON.parse(res.Data);
                        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                            for (let n = 0, len = data.length; n < len; n++) {
                                if (this.examineMoney[i].internalinvoiceno == data[n].internalinvoiceno) {
                                    let x;
                                    for (x in this.examineMoney[i]) {
                                        if (x == data[n].ordertype + 'orderno') {
                                            if (this.examineMoney[i][x] != '' && this.examineMoney[i][x] != null) {
                                                this.examineMoney[i][x] = this.examineMoney[i][x] + ',' + data[n].orderno
                                            }
                                            else {
                                                this.examineMoney[i][x] = data[n].orderno
                                            }
                                        }
                                        else if (x == data[n].ordertype + 'deliveryno') {
                                            if (this.examineMoney[i][x] != '' && this.examineMoney[i][x] != null) {
                                                this.examineMoney[i][x] = this.examineMoney[i][x] + ','
                                            }
                                            else {
                                                this.examineMoney[i][x] = "请输入" + data[n].ordertype + "交货单号"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        this.saveBill();
                        for (let i = 0, len = this.erpFlagList.length; i < len; i++) {
                            if (data[0].internalinvoiceno == this.erpFlagList[i].internalinvoiceno) {
                                this.erpFlagList[i].plusERP = false;
                            }
                        }
                        this.hasSaved = true;
                        this.WindowService.alert({ message: "写入成功", type: "success" });
                    }
                    else if (res.Result == false) {
                        this.WindowService.alert({ message: backMessage, type: "fail" });
                        this.ErpPlusFlag = true;
                    }
                })
        }
    }
    //erp结束
    //红字保存
    public saveBillRed() {
        this.hasSaved = true;
        for (let n = 0, len = this.redListData.length; n < len; n++) {
            if (this.redListData[n].rednoticeno == null || this.redListData[n].rednoticeno == '') {
                this.hasSaved = false;
            };
        }
    }
    //保存数据
    public saveBill() {
        for (let i = 0, len = this.examineMoney.length; i < len; i++) {
            if (this.examineMoney[i].internalinvoiceno == this.redNumberNow.internalinvoiceno) {
                this.examineMoney[i].rednoticeno = this.redNumberNow.text;
                this.examineMoney[i].receiptdate = this.selectedCompaneyData;
            }

            for (let n = 0, len = this.redListData.length; n < len; n++) {
                if (this.examineMoney[i].internalinvoiceno == this.redListData[n].internalinvoiceno) {
                    this.examineMoney[i].rednoticeno = this.redListData[n].rednoticeno;
                }
            }
        }
        this.billBack.invoice = this.examineMoney;
        let billData = this.billBack;
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        this.dbHttp.post("InvoiceRevise/SaveApply", body, options).pipe(
            map(res => res))
            .subscribe(res => {
                console.log(res)
            })
    }
    public hasSaved = false;
    public saveBillID6() {
        this.hasSaved = true;
        let billData = this.billBack;
        if (this.urlParamObj.nodeid == "11" && this.monthPass) {
            for (let n = 0, len = this.redListData.length; n < len; n++) {
                if (this.redListData[n].rednoticeno == null || this.redListData[n].rednoticeno == '') {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请填写红字通知单号", type: 'fail' });
                };
            }
            this.saveBill();
        }
        if (this.urlParamObj.nodeid == "9") {
            console.log(billData.invoice)
            for (let n = 0, len = billData.invoice.length; n < len; n++) {
                if (billData.invoice[n].complexaccout == null || billData.invoice[n].complexaccout == '') {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请填写清帐号", type: 'fail' });
                    return;
                }
            }
        }
        if (this.isBusiness && (this.urlParamObj.nodeid == "6" || this.urlParamObj.nodeid == "9") && this.revisetypeApprove != "typeFour") {
            //判断是否红字
            // for (let n = 0, len = billData.invoice.length; n < len; n++) {
            //     if (billData.invoice[n].rednoticeno == '' || billData.invoice[n].rednoticeno == null) {
            //         this.hasSaved = false;
            //         this.WindowService.alert({ message: "请填写红字通知单", type: 'fail' });
            //     }
            // }
            //判断是否写入erp
            if (this.ErpMinusFlag == true || this.ErpPlusFlag == true) {
                this.hasSaved = false;
                this.WindowService.alert({ message: "请写入ERP", type: 'fail' });
            }
            //判断是否填写交货单号
            for (let n = 0, len = billData.invoice.length; n < len; n++) {
                if (billData.invoice[n].REorderno != '' && (billData.invoice[n].REdeliveryno == "请输入RE交货单号" || billData.invoice[n].REdeliveryno == " ")) {
                    this.WindowService.alert({ message: "请输入RE交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZTYorderno != '' && (billData.invoice[n].ZTYdeliveryno == "请输入ZTY交货单号" || billData.invoice[n].ZTYdeliveryno == " ")) {
                    this.WindowService.alert({ message: "请输入ZTY交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZREorderno != '' && (billData.invoice[n].ZREdeliveryno == "请输入ZRE交货单号" || billData.invoice[n].ZREdeliveryno == " ")) {
                    this.WindowService.alert({ message: "请输入ZRE交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZSDorderno != '' && (billData.invoice[n].ZSDdeliveryno == "请输入ZSD交货单号" || billData.invoice[n].ZSDdeliveryno == " ")) {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请输入ZSD交货单号", type: 'fail' });
                }
                if (billData.invoice[n].ZORorderno != '' && (billData.invoice[n].ZORdeliveryno == "请输入ZOR交货单号" || billData.invoice[n].ZORdeliveryno == " ")) {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请输入ZOR交货单号", type: 'fail' });
                }
                // if(billData.invoice[n].REorderno == ''){

                // }
            }
            //判断延期付款
            // for (let n = 0, len = billData.invoice.length; n < len; n++) {
            //     if (billData.invoice[n].receiptdate != -1 && billData.invoice[n].receiptdate != 1) {
            //         this.hasSaved = false;
            //         this.WindowService.alert({ message: "请选择付款账期", type: 'fail' });
            //     }
            // }
            if ((this.urlParamObj.nodeid == "6" || this.urlParamObj.nodeid == "9") && this.hasSaved) {
                console.log(123213);
                this.saveBill();
            }
        }
        if (this.revisetypeApprove == "typeFour" && this.urlParamObj.nodeid == "6") {
            //判断是否填写交货单号
            for (let n = 0, len = billData.invoice.length; n < len; n++) {
                if (billData.invoice[n].ZCRorderno == '' && billData.invoice[n].ZDRorderno == '' && billData.invoice[n].REorderno == '' && billData.invoice[n].ZTYorderno == '' && billData.invoice[n].ZREorderno == '' && billData.invoice[n].ZSDorderno == ''
                    && billData.invoice[n].ZORorderno == '') {
                    this.WindowService.alert({ message: "请输入单据信息", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].REorderno != '' && (billData.invoice[n].REdeliveryno == "")) {
                    this.WindowService.alert({ message: "请输入RE交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZTYorderno != '' && (billData.invoice[n].ZTYdeliveryno == "")) {
                    this.WindowService.alert({ message: "请输入ZTY交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZREorderno != '' && (billData.invoice[n].ZREdeliveryno == "")) {
                    this.WindowService.alert({ message: "请输入ZRE交货单号", type: 'fail' });
                    this.hasSaved = false;
                }
                if (billData.invoice[n].ZSDorderno != '' && (billData.invoice[n].ZSDdeliveryno == "")) {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请输入ZSD交货单号", type: 'fail' });
                }
                if (billData.invoice[n].ZORorderno != '' && (billData.invoice[n].ZORdeliveryno == "")) {
                    this.hasSaved = false;
                    this.WindowService.alert({ message: "请输入ZOR交货单号", type: 'fail' });
                }
            }
        }
    }
    //保存单据信息
    public savedeliveryno() {
        this.saveBill();
    }
    //冲退增删
    public addERP(e) {
        let currentId: any;
        currentId = +e[e.length - 1].projcode + 1000;
        let nowIdLen = (currentId + "").length;
        for (var i = 0; i < 6 - nowIdLen; i++) {
            currentId = "0" + currentId;
        }
        let data = {
            'materialId': 0,
            'invoiceId': 0,
            internalinvoiceno: e[0].internalinvoiceno,
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
    public newlistApprove = [];
    public addMeterial = [];
    public addApprove() {
        let localObj = {};
        for (let i = 0, len = this.materialList.length; i < len; i++) {
            if (this.newlistApprove.length < 2) {
                this.newlistApprove.push(
                    new materialCheck(
                        this.materialList[i].materialId,
                        this.materialList[i].invoiceId,
                        this.materialList[i].internalinvoiceno,
                        this.materialList[i].projcode,
                        this.materialList[i].originalmaterialcode,
                        this.materialList[i].materialcode,
                        this.materialList[i].originaldescription,
                        this.materialList[i].description,
                        this.materialList[i].num,
                        this.materialList[i].factory,
                        this.materialList[i].originalstoragelocation,
                        this.materialList[i].storagelocation,
                        this.materialList[i].originalbatchno,
                        this.materialList[i].batchno,
                        this.materialList[i].originalmoney,
                        this.materialList[i].money,
                        this.materialList[i].originalbackmoney,
                        this.materialList[i].backmoney,
                        this.materialList[i].returnnum,
                        this.materialList[i].returnstoragelocation,
                        this.materialList[i].specifystoragelocation,
                        this.materialList[i].deliveryno,
                        this.materialList[i].ordertype,
                        this.materialList[i].groupno,
                        this.materialList[i].ERPorderno,
                        this.materialList[i].CURRENCY,
                        this.materialList[i].invoiceremark
                    )
                );
            }
            else if (this.newlistApprove.length > 1) {
                let orgFlag = true;
                let len = this.newlistApprove.length;
                for (let n = 0; n < len; n++) {
                    if (this.newlistApprove[n].internalinvoiceno == this.materialList[i].internalinvoiceno) {
                        orgFlag = false;
                    }
                }
                if (orgFlag) {
                    for (let f = 0, len = this.materialList.length; f < len; f++) {
                        this.newlistApprove.push(
                            new materialCheck(
                                this.materialList[f].materialId,
                                this.materialList[f].invoiceId,
                                this.materialList[f].internalinvoiceno,
                                this.materialList[f].projcode,
                                this.materialList[f].originalmaterialcode,
                                this.materialList[f].materialcode,
                                this.materialList[f].originaldescription,
                                this.materialList[f].description,
                                this.materialList[f].num,
                                this.materialList[f].factory,
                                this.materialList[f].originalstoragelocation,
                                this.materialList[f].storagelocation,
                                this.materialList[f].originalbatchno,
                                this.materialList[f].batchno,
                                this.materialList[f].originalmoney,
                                this.materialList[f].money,
                                this.materialList[f].originalbackmoney,
                                this.materialList[f].backmoney,
                                this.materialList[f].returnnum,
                                this.materialList[f].returnstoragelocation,
                                this.materialList[f].specifystoragelocation,
                                this.materialList[f].deliveryno,
                                this.materialList[f].ordertype,
                                this.materialList[f].groupno,
                                this.materialList[f].ERPorderno,
                                this.materialList[f].CURRENCY,
                                this.materialList[f].invoiceremark
                            )
                        );
                    }
                }
            }
        }

        this.newTableFlag = true;
        this.addMeterial = [];
        for (let f = 0, len = this.newlistApprove.length; f < len; f++) {
            if (this.newlistApprove[f].internalinvoiceno == this.invoicenoActive) {
                this.addMeterial.push(
                    this.newlistApprove[f]
                )
            }
        }
    }
    public removeApprove() {
        this.newTableFlag = false;
        this.newlistApprove = [];
    }
    //附件添加
    public reAccessory(e) {
        if (!this.accessoryExamine.indexOf(e)) {
            this.accessoryExamine.push(e)
        }
    }

    /**附件下载*/
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
    //对象继承
    public billExtend(dest, src) {
        for (var key in src) {
            dest[key] = src[key]
        }
    }
    //基本信息

    public applyDate =
    {
        'applyId': 0,
        'proposer': '申请人',
        'uId': 0,
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
        'wfstatus': "草稿"
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
    /** approve begin */
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
        apiUrl_AR: "/InvoiceRevise/ApproveChongHong",
        apiUrl_Sign: "/InvoiceRevise/AddTask",
        apiUrl_Transfer: "/InvoiceRevise/AddTransfer",
        taskid: "",
        nodeid: "",
        navigateUrl: ""
    };
    adpAppParms = {
        apiUrl: "/InvoiceRevise/ApproveAddTask",
        taskid: ""
    };
    isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
    isADP: boolean = false;//是否加签审批页面
    isBusiness: boolean = false;//是否商务审批
    isFinance: boolean = false;//是否财务发票审批
    onGetWfHistoryData() {
        if (this.urlParamObj.applyid != undefined) {
            console.log(this.urlParamObj.applyid);
            let url = "/InvoiceRevise/GetApproveHistory/" + this.urlParamObj.applyid;
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            let nodeIDUrl = "InvoiceRevise/GetCurrentWFNode/" + this.urlParamObj.applyid;
            this.dbHttp.post(nodeIDUrl, {}, options)
                .toPromise()
                .then(res => {
                    if (res.Data) {
                        let data = JSON.parse(res.Data);
                        this.nodeDataList.taskid = data.taskid;
                        this.nodeDataList.nodeid = data.nodeid;
                    }
                })
            this.dbHttp.post(url, [], options).subscribe(
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
        this.urlParamObj.taskid = this.routerInfo.snapshot.queryParams['taskid'];
        this.urlParamObj.applyid = this.routerInfo.snapshot.queryParams['applyid'];
        this.urlParamObj.adp = this.routerInfo.snapshot.queryParams['ADP'];
        let recordid = this.routerInfo.snapshot.params['id'];
        if (recordid == undefined || recordid == "") {
            recordid = this.routerInfo.snapshot.queryParams['recordid'];
        }
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
        if (this.urlParamObj.nodeid == "6" && this.listType != undefined && !this.listType) {//商务
            this.isBusiness = true;
        }
        if (this.urlParamObj.nodeid == "8" && this.listType != undefined && this.listType) {//商务
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
        public internalinvoiceno,
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
export class materialCheck {
    constructor(
        public materialId,
        public invoiceId,
        public internalinvoiceno,
        public projcode,
        public originalmaterialcode,
        public materialcode,
        public originaldescription,
        public description,
        public num,
        public factory,
        public originalstoragelocation,
        public storagelocation,
        public originalbatchno,
        public batchno,
        public originalmoney,
        public money,
        public originalbackmoney,
        public backmoney,
        public returnnum,
        public returnstoragelocation,
        public specifystoragelocation,
        public deliveryno,
        public ordertype,
        public groupno,
        public ERPorderno,
        public CURRENCY,
        public invoiceremark
    ) { }
}
export class ordernoinvoiceno {
    constructor(
        public invoiceno,
        public orderno
    ) { }
}
export class erpFlagData {
    constructor(
        public internalinvoiceno,
        public minusERP,
        public plusERP
    ) { }
}
export class invoiceremarkData {
    constructor(
        public internalinvoiceno: '',
        public text: ''
    ) { }
}