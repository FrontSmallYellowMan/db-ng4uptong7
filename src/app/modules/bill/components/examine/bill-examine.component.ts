
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { billBackService } from '../../services/bill-back.service'
import { WindowService } from 'app/core';
import { date, tab, tabService } from '../writeback/bill-detail/service/tab.service';
import { HttpServer } from 'app/shared/services/db.http.server';

export class PageNo { }
@Component({
    templateUrl: 'bill-examine.component.html',
    styleUrls: ['bill-examine.component.scss']
})
export class BillExamineComponent implements OnInit {

    constructor(private routerInfo: ActivatedRoute, private router: Router, private http: HttpServer, private tabService: tabService, private WindowService: WindowService, private billBackService: billBackService, private location: Location) {
        //基本信息请求
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dataSource = this.http.post('InitData/BaseDataList', [], options).pipe(
            map(res => res))
    }
    //各种验证
    public BillmoneyWarn = false;
    public NumFloatAlert(table, item) {
        // this.tabService.checkFloat(item);
        let rex = 0;
        let lex = 0;
        if (table) {
            for (let i = 0, len = table.length; i < len; i++) {
                rex += table[i].originalmoney
                lex += +table[i].money
            }
        }

        if (rex != lex) {
            this.BillmoneyWarn = true;
        }
        else if (rex = lex) {
            this.BillmoneyWarn = false;
        }
    }
    //验证两位小数
    public NumFloatAlertCur(item) {
        this.tabService.checkFloat(item);
    }
    public removeItems(tab, e) {
        this.tabService.removeItems(tab, e);
        for (let i = 0, len = this.backtabData.length; i < len; i++) {
            if (this.backtabData[i].value == e.internalinvoiceno) {
                this.backtabData.splice(i, 1);
            }
        }
    }
    public addItems(e) {
        this.tabService.addItems(e)
    }
    //验证四位字符
    public checkFour(e) {
        this.tabService.checkFour(e.target.value)
    }
    //验证整数
    public checkInteger(e) {
        this.tabService.checkInteger(e.target.value)
    }
    //基本信息
    dataSource;
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
    public reviseTypeChildren: Array<any> = [];

    public defaultList: defaultdata;//下拉框默认显示
    public defaultCompany;
    public defaultBuse;
    public defaultinvoicetypes;
    public defaultplatforms;
    public defaultredtypes

    public accessoryExamine;//附件信息
    public materialExamine;//物料表单信息
    public billTypeId;//选中小类
    public examineApply;//
    public momentData;//临时类型集合
    public redReviseSubType;//小类box
    public backtabData = []//tab头
    public materialList;

    public getPostMaterial(e, item) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;

        this.http.post(url, [], options)
            .toPromise()
            .then(res => {
                let localData = res .Data;
                item.description = localData;
            })

    }
    public tabActive = function (e) {
        //初始化
        this.materialList = [];
        for (let i = 0, len = this.materialExamine.length; i < len; i++) {
            if (this.materialExamine.internalinvoiceno == this.backtabData[0].value) {
                this.materialList.push(this.billBack.material[i]);
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
        // console.log(this.materialExamine)
    };
    public nodeIdFlag = false;//nodeID是否存在
    // public PersonFlag=true;//是否登陆人
    public nodeDataList = {
        "taskid": "",
        "approveresult": "Approval",
        "nodeid": "",//流程节点Id
        "opinions": "同意",
    };
    public 
    public urlFlag;
    ngOnInit() {
        this.examineMoney = [];
        let data = this.routerInfo.snapshot.queryParams['applyid'];;
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let nodeIDUrl = "InvoiceRevise/GetCurrentWFNode/" + data;//判断是否驳回
        let options = new RequestOptions({ headers: headers });
        this.http.post(nodeIDUrl, {}, options)
            .toPromise()
            .then(res => {
                if (res .Data) {
                    let data = JSON.parse(res .Data);
                    this.nodeDataList.taskid = data.taskid;
                    this.nodeDataList.nodeid = data.nodeid;
                    if (data.nodeid) {
                        this.nodeIdFlag = true;
                    }
                }
            })
        let url = "InvoiceRevise/GetApplyById/" + data//获取所有数据
        this.http.post(url, {}, options)
            .toPromise()
            .then(res => {
                let data = JSON.parse(res .Data);
                let listTypeDate = Number(data.apply.revisetypecode);
                if (listTypeDate > 700 || listTypeDate == 700) {
                    this.urlFlag = this.location.path().toString();
                    if (this.urlFlag.length < 30) {
                        let locaUrl = this.urlFlag.split("?")[1].split("=")[1];
                        let routerUrl = "bill/return-examine";
                        let queryParams = {
                            applyid: locaUrl
                        }
                        this.router.navigate([routerUrl], { queryParams: queryParams });
                    }
                }
                //基础信息
                this.changeEventObject(data.apply, this.applyDate);
                this.applyDate.applydate = this.ChangeDateFormat(this.applyDate.applydate);
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
                for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                    this.examineMoney[i].invoicedate = this.ChangeDateFormat(this.examineMoney[i].invoicedate)
                }

                //tab头
                for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                    this.backtabData.push(new tabListData(
                        this.examineMoney[i].internalinvoiceno,
                        false
                    ))
                }

                //附件信息
                this.accessoryExamine = data.accessory;
                //物料信息
                this.materialExamine = data.material;
                //初始化
                this.backtabData[0].active = true;
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
                this.examineApply = data.apply;
                if (this.examineApply.revisetype == "价格更改") {
                    this.billTypeId = "priceType";
                }
                if (this.examineApply.revisetype == "发票票面信息更改") {
                    let data = JSON.parse(this.examineApply.subrevisetype)
                    for (let i = 0, len = data.length; i < len; i++) {
                        if (data[i].subtype == "物料号") {
                            this.billTypeId = "materielType";
                            break;
                        }
                        if (data[i].subtype == "经工商局认定的客户名称变更" || data[i].subtype == "税号") {
                            this.nameFlag = true;
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

                //第二次请求
                this.dataSource.subscribe(
                    (data) => {
                        let list = JSON.parse(data.Data)

                        for (let key in list) {
                            if (list.hasOwnProperty(key)) {
                                let element = list[key];

                                switch (key) {
                                    case 'companys':
                                        this.selectInfo.companys = this.onTransSelectInfos(element, 'companycode', 'company');
                                        break;
                                    case 'businesses':
                                        this.selectInfo.businesses = this.onTransSelectInfos(element, 'bizcode', 'biz');
                                        break;
                                    case 'invoicetypes':
                                        this.selectInfo.invoicetypes = this.onTransSelectInfos(element, 'invoicetypecode', 'invoicetype');
                                        break;
                                    case 'platforms':
                                        this.selectInfo.platforms = this.onTransSelectInfos(element, 'platformcode', 'platform');
                                        break;
                                    case 'redtypes':
                                        this.selectInfo.redtypes = this.onTransSelectInfos(element, 'revisetypecode', 'revisetype');
                                        //判断大类选择类型
                                        this.momentData = element;
                                        this.selected = function (value) {
                                            if (value.text === "发票票面信息更改") {
                                                this.priceFlag = false;//选择更改类型
                                                this.materielFlag = true;
                                                this.otherTypeFlag = false;
                                                this.reviseTypeChildren = [];
                                                this.reviseTypeChildren = this.selectTransSelectInfos(element[0].children, "revisetype")
                                                this.isCheck = true;
                                            } else if (value.text === "价格更改") {
                                                this.priceFlag = true;
                                                this.materielFlag = false;
                                                this.otherTypeFlag = false;
                                                this.reviseTypeChildren = [];
                                                for (let n in element[1].children) {
                                                    this.reviseTypeChildren = this.selectTransSelectInfos(element[1].children, "revisetype")
                                                }
                                                this.isCheck = false;
                                            }
                                            else if (value.text === "发票类型更改") {
                                                this.priceFlag = false;
                                                this.materielFlag = false;
                                                this.otherTypeFlag = false;
                                                this.reviseTypeChildren = [];
                                                for (let n in element[2].children) {
                                                    this.reviseTypeChildren = this.selectTransSelectInfos(element[2].children, "revisetype")
                                                }
                                                this.isCheck = false;
                                            }
                                            else if (value.text === "折让") {
                                                this.priceFlag = false;
                                                this.materielFlag = false;
                                                this.reviseTypeChildren = [];
                                                for (let n in element[3].children) {
                                                    this.reviseTypeChildren = this.selectTransSelectInfos(element[3].children, "revisetype")
                                                }
                                                this.isCheck = false;
                                            }
                                            else if (value.text === "系统冲红（不涉及外部发票）") {
                                                this.priceFlag = false;
                                                this.materielFlag = false;
                                                this.otherTypeFlag = false;
                                                this.reviseTypeChildren = [];
                                                for (let n in element[4].children) {
                                                    this.reviseTypeChildren = this.selectTransSelectInfos(element[4].children, "revisetype")
                                                }

                                                this.isCheck = false;
                                            }
                                            else if (value.text === "其他情况冲红") {
                                                this.priceFlag = false;
                                                this.materielFlag = false;
                                                this.otherTypeFlag = true;
                                                this.TypeOut = "otherType";
                                                this.reviseTypeChildren = [];
                                                for (let n in element[5].children) {
                                                    this.reviseTypeChildren = this.selectTransSelectInfos(element[5].children, "revisetype")
                                                }
                                                this.isCheck = false;
                                            }
                                        };
                                        break;
                                    default:
                                }
                            }
                        }


                        let dataFlag = this.examineApply.revisetype
                        // console.log(this.examineApply,dataFlag)
                        if (dataFlag === "发票票面信息更改") {
                            this.isCheck = true;
                            this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[0].children, "revisetype")
                            for (let i = 0, len = this.reviseTypeChildren.length; i < len; i++) {
                                let data = JSON.parse(this.examineApply.subrevisetype);

                                for (let n = 0, len = data.length; n < len; n++) {
                                    if (data[n].subtype == this.reviseTypeChildren[i].revisetype) {
                                        this.reviseTypeChildren[i].slect = true;
                                        console.log(this.reviseTypeChildren[i])
                                    }
                                }
                            }
                        } else if (dataFlag === "价格更改") {
                            this.reviseTypeChildren = [];
                            this.isCheck = false;
                            for (let n in this.momentData[1].children) {
                                this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[1].children, "revisetype")
                            }
                        }
                        else if (dataFlag === "发票类型更改") {
                            this.reviseTypeChildren = [];
                            for (let n in this.momentData[2].children) {
                                this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[2].children, "revisetype")
                            }
                            this.isCheck = false;
                        }
                        else if (dataFlag === "折让") {
                            this.reviseTypeChildren = [];
                            for (let n in this.momentData[3].children) {
                                this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[3].children, "revisetype")
                            }
                            this.isCheck = false;
                        }
                        else if (dataFlag === "系统冲红（不涉及外部发票）") {
                            this.reviseTypeChildren = [];
                            for (let n in this.momentData[4].children) {
                                this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[4].children, "revisetype")
                            }
                            this.isCheck = false;
                        }
                        else if (dataFlag === "其他情况冲红") {
                            this.reviseTypeChildren = [];
                            for (let n in this.momentData[5].children) {
                                this.reviseTypeChildren = this.selectTransSelectInfos(this.momentData[5].children, "revisetype")
                            }
                            this.isCheck = false;
                        }
                        if (dataFlag != "发票票面信息更改") {
                            for (let i = 0, len = this.reviseTypeChildren.length; i < len; i++) {
                                let data = JSON.parse(this.examineApply.subrevisetype);

                                for (let n = 0, len = data.length; n < len; n++) {
                                    if (data[n].subtype == this.reviseTypeChildren[i].revisetype) {
                                        this.redReviseSubType = data[n].subtype;
                                        // console.log(this.redReviseSubType)
                                    }
                                }
                            }
                            this.isCheck = false;
                        }//编辑进入时获取自选项

                        // console.log(this.reviseTypeChildren, this.examineApply);
                    });
            })
    }
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
                //清空数据
                this.examineMoney = [];
                this.backtabData = [];
                this.materialList = [];

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
        else if (this.priceFlag || item == "合同约定" || item == "商务手误") {
            this.TypeOut = "priceType";
        }
        else if (item == "提供冲红通知单原件及折扣折让证明") {
            this.TypeOut = "breakType";
        }
        if (!this.materielFlag) {
            this.subrevisetypeArray = [];
            //清空数据
            this.examineMoney = [];
            this.backtabData = [];
            this.materialList = [];
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
        this.billTypeId = this.TypeOut;
    }
    //获取物料
    public getPostCustomName(e, item) {
        if (e == '') {
            item.customer = '';
        } else {
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            let url = "InvoiceRevise/GetCustomerName/" + e;
            this.http.post(url, [], options).pipe(
                map(res => res ))
                .subscribe(
                (data) => {
                    item.customer = data.Data
                });
        }
    }
    //数据提交
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
            'wfId': 'aca1151e-3fa2-4511-8cdb-8e5c9337c32f',
            'wfstatus': "草稿"
        },
        accessory: [],
        invoice: [],
        material: [{
            'materialId': 0,
            'invoiceId': 0,
            internalinvoiceno: "",
            'projcode': '',
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
            'ERPorderno': '写入EPR后返回的单据号',
            'CURRENCY': '币种编号',
            'invoiceremark': '发票备注'
        }]
    };
    public saveBillDraft() {
        let sendFlag = true;
        let billData = this.billBack;
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        if (sendFlag) {

            this.http.post("InvoiceRevise/SaveApply", body, options).pipe(
                map(res => res ))
                .subscribe(res => {
                    console.log(res)
                })
            this.router.navigate(['/bill/list']);
        }
        sendFlag = true;
    }
    public saveBill() {
        let sendFlag = true;
        this.billBack.apply.wfstatus = "提交";
        let billData = this.billBack;
        //判断基本信息选择
        let billBackApply = this.billBack.apply;
        if (!billBackApply.company) {
            alert('请选择公司');
            sendFlag = false;
        }
        if (!billBackApply.platform) {
            alert('请选择平台');
            sendFlag = false;
        }
        if (!billBackApply.biz) {
            alert('请选择业务范围');
            sendFlag = false;
        }
        if (!billBackApply.revisetype) {
            alert('请选择冲红类型');
            sendFlag = false;
        }
        if (!billBackApply.revisetypecode) {
            alert('请选择冲红小类');
            sendFlag = false;
        }
        if (!billBackApply.invoicetype) {
            alert('请选择冲红发票类型');
            sendFlag = false;
        }
        //判断小类
        if (billBackApply.revisetype != "其他情况冲红") {
            if (billBackApply.subrevisetype == '') {
                this.WindowService.alert({ message: '请选择冲红小类', type: 'fail' });
                sendFlag = false;
            }
        }
        //判断物料信息
        let billBackMaterial = this.billBack.material;
        if (this.billTypeId == "priceType") {
            // let rex = 0;
            // let lex = 0;
            // for (let i = 0, len = billBackMaterial.length; i < len; i++) {
            //     rex = rex + +billBackMaterial[i].money;
            //     lex = lex + billBackMaterial[i].originalmoney;
            // };
            // console.log(rex,lex)
            // if (rex != lex) {
            //     sendFlag = false;
            //     this.WindowService.alert({ message: '新销售总计应与原单的销售总计相等', type: 'success' });
            // }
            // else if (rex == lex && rex != 0) {
            //     sendFlag = true;
            // }
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].backmoney == 0) {
                    sendFlag = false;
                    alert('新返款金额，不可以为空');
                }
            };
        }
        if (this.billTypeId == "costType") {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                if (billBackMaterial[i].materialcode == '') {
                    sendFlag = false;
                    alert('新出发票的物料号，不可以为空');
                }
                if (billBackMaterial[i].storagelocation == '') {
                    sendFlag = false;
                    alert('新库存地，不可以为空');
                }
                if (billBackMaterial[i].batchno == '') {
                    sendFlag = false;
                    alert('新批次，不可以为空');
                }
            };
        }
        if (this.billTypeId == "materielType") {
            for (let i = 0, len = billBackMaterial.length; i < len; i++) {
                // if (billBackMaterial[i].materialcode == '') {
                //     sendFlag = false;
                //     this.WindowService.alert({ message: '请检查物料号，不可以为空', type: 'success' });
                // }
                if (billBackMaterial[i].num == 0) {
                    sendFlag = false;
                    alert('请检查数量，不可以为空');
                }
                if (billBackMaterial[i].factory == '') {
                    sendFlag = false;
                    alert('请检查工厂，不可以为空');
                }
                if (billBackMaterial[i].storagelocation == '') {
                    sendFlag = false;
                    alert('请检查库存地，不可以为空');
                }
                if (billBackMaterial[i].batchno == '') {
                    sendFlag = false;
                    alert('请检查批次，不可以为空');
                }
                if (billBackMaterial[i].money == 0) {
                    sendFlag = false;
                    alert('请检查销售总额，不可以为空');
                }
                if (billBackMaterial[i].backmoney == 0) {
                    sendFlag = false;
                    alert('请检查返款金额，不可以为空');
                }

            };
        }
        if (this.billBack.invoice.length == 0) {
            sendFlag = false;
            alert('请添加订单');
        }
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(billData);
        if (sendFlag) {
            this.http.post("InvoiceRevise/SaveApply", body, options).pipe(
                map(res => res ))
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
    }
    //重新提交
    public reSaveBill() {
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        // this.billBack.apply.wfstatus = "提交";
        let billData = this.billBack;
        let body = JSON.stringify(billData);
        this.http.post("InvoiceRevise/SaveApply", body, options).pipe(
            map(res => res ))
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
                    if (this.nodeDataList.nodeid != '') {
                        this.http.post("InvoiceRevise/ApproveChongHong", this.nodeDataList, options).pipe(
                            map(res => res ))
                            .subscribe(res => {
                                console.log(res);
                            })
                        this.router.navigate(['/bill/list']);
                    }
                }
            })
    }
    //附件添加
    public reAccessory(e) {
        if (!this.accessoryExamine.indexOf(e)) {
            this.accessoryExamine.push(e)
        }
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
    //获取财务信息
    // public invoiceArr = [];
    public invoice = {
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
        'receiptdate': 0,
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
        'ZORorderno': '',
        'ZORdeliveryno': '',
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
        'signstandard': ''
    }

    //物料信息
    public material = {
        'materialId': 0,
        'invoiceId': 0,
        internalinvoiceno: "系统发票号",
        'projcode': '行项目号',
        'originalmaterialcode': '原物料号',
        'materialcode': '新物料号',
        'originaldescription': '原物料描述',
        'description': '新物料描述',
        'num': 9099,
        'factory': '工厂',
        'originalstoragelocation': '原库存地',
        'storagelocation': '新库存地',
        'originalbatchno': '原批次',
        'batchno': '新批次\\要求发货批次',
        'originalmoney': 9999,
        'money': 8888,
        'originalbackmoney': 7777,
        'backmoney': 66666,
        'returnnum': 5656,
        'returnstoragelocation': '退入库存地',
        'specifystoragelocation': '要求发货库存地',
        'deliveryno': '交货单号',
        'ordertype': '订单类型',
        'groupno': 0,
        'ERPorderno': '写入EPR后返回的单据号',
        'CURRENCY': '币种编号',
        'invoiceremark': '发票备注'
    }
    public externalinvoicenoValue = "外部发票号";
    public ordernoValue = "订单号";
    public changModalInput(e) {
        // if (!this.redTypeFlag) {
        //     this.WindowService.alert({ message: '请选择冲红类型', type: 'success' });
        // }
        if (e.target.value == "订单号") {
            this.ordernoValue = "";
        }
        if (e.target.value == "外部发票号") {
            this.externalinvoicenoValue = '';
        }
    }
    public customName//客户名称
    public moreMessageShow = false;//隐藏
    public modalDataChild;//多条数据
    public meterialBack;
    public moneyMessage = [];
    public modalSendArray;//物料请求数据
    public backTableDate = [];
    //获取财务信息
    public getInvoice(e) {
        let url;
        let regNunmber = /^[0-9]*$/;
        if (e.id == "queryExternalinvoiceno") {
            url = "InvoiceRevise/GetInvoiceByExternalNo/";
            url = url + this.externalinvoicenoValue;
        }
        else if (e.id == "queryOrderno") {
            url = "InvoiceRevise/GetInvoiceByOrderNo/";
            url = url + this.ordernoValue
            //  if(!regNunmber.test(this.ordernoValue)){
            //      this.WindowService.alert({ message: "请输入正确的发票号或订单号", type: 'success' });
            // }
        }
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.http.post(url, [], options)
            .toPromise()
            .then(res => {
                let modalDate = JSON.parse(res .Data);

                let messageData = res .Message;

                if (messageData != null) {
                    this.WindowService.alert({ message: messageData, type: 'success' });
                }
                if (!modalDate.length) {

                }
                if (modalDate.length == 1) {
                    let el = modalDate[0];
                    this.changeEventObject(el, this.invoice)
                    this.material.internalinvoiceno = el.internalinvoiceno;
                    this.moneyMessage = [];
                    for (let key in el) {
                        if (el[key] != "deliveryno") {
                            this.moneyMessage.push(el[key])
                        }
                        this.modalSendArray = [
                            new modalSendObj(modalDate[0].internalinvoiceno, modalDate[0].orderno)
                        ]
                    }
                    let customNum = el.originalcustomercode;
                    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
                    let options = new RequestOptions({ headers: headers });
                    let url = "InvoiceRevise/GetCustomerName/" + customNum;
                    this.http.post(url, [], options).pipe(
                        map(res => res ))
                        .subscribe(
                        (data) => {
                            this.customName = data.Data
                        });

                    this.http.post("InvoiceRevise/GetMaterial", this.modalSendArray, options
                    )
                        .toPromise()
                        .then(res => {
                            let localData = JSON.parse(res .Data);

                            let materialLocal = localData[0].material[0];
                            this.backTableDate.push(localData[0].material[0]);

                            //保存数据
                            this.invoice.originalmoney = Number(this.invoice.originalmoney)//originalmoney转化
                            if (localData[0].internalinvoiceno) {

                            }
                            this.changeEventObject(localData[0], this.invoice)
                            //财务信息

                            if (!this.examineMoney.length) {
                                this.examineMoney.push(
                                    new invoiceData(
                                        this.invoice.invoiceId,
                                        this.invoice.applyId,
                                        this.invoice.originalcustomercode,
                                        this.invoice.originalcustomer,
                                        this.invoice.orderno,
                                        this.invoice.internalinvoiceno,
                                        this.invoice.externalinvoiceno,
                                        this.invoice.invoicedate,
                                        this.invoice.originalmoney,
                                        this.invoice.originalreceiptdate,
                                        this.invoice.originalcomplexaccount,
                                        this.invoice.money,
                                        this.invoice.customercode,
                                        this.invoice.customer,
                                        this.invoice.receiptdate,
                                        this.invoice.complexaccout,
                                        this.invoice.rednoticeno,
                                        this.invoice.ZCRorderno,
                                        this.invoice.ZDRorderno,
                                        this.invoice.REorderno,
                                        this.invoice.REdeliveryno,
                                        this.invoice.ZTYorderno,
                                        this.invoice.ZTYdeliveryno,
                                        this.invoice.ZREorderno,
                                        this.invoice.ZREdeliveryno,
                                        this.invoice.ZSDorderno,
                                        this.invoice.ZSDdeliveryno,
                                        this.invoice.ZORorderno,
                                        this.invoice.ZORdeliveryno,
                                        this.invoice.PURCH_NO_C,
                                        this.invoice.seller,
                                        this.invoice.sellercode,
                                        this.invoice.SALES_ORG,
                                        this.invoice.DISTR_CHAN,
                                        this.invoice.DIVISION,
                                        this.invoice.PRICE_DATE,
                                        this.invoice.PMNTTRMS,
                                        this.invoice.SALES_OFF,
                                        this.invoice.SALES_GRP,
                                        this.invoice.SHIP_TYPE,
                                        this.invoice.TransitMode,
                                        this.invoice.TransitModeCode,
                                        this.invoice.SDF_KUNNR,
                                        this.invoice.SDF_NAME,
                                        this.invoice.detailaddress,
                                        this.invoice.province,
                                        this.invoice.city,
                                        this.invoice.citycode,
                                        this.invoice.district,
                                        this.invoice.zipcode,
                                        this.invoice.connecter,
                                        this.invoice.phone,
                                        this.invoice.signstandard
                                    )
                                )
                            }
                            else {
                                let flag = true;
                                for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                                    //判断是否是新的发票号 
                                    if (this.examineMoney[i].internalinvoiceno == this.invoice.internalinvoiceno) {
                                        flag = false;
                                        this.WindowService.alert({ message: '系统发票号相同', type: 'success' });
                                    }
                                    if (this.examineMoney[i].originalcustomer != this.invoice.originalcustomer) {
                                        flag = false;
                                        this.WindowService.alert({ message: '同一客户，同一公司，同业务范围方可添加', type: 'success' });
                                    }
                                }
                                console.log(flag)
                                if (flag) {
                                    this.examineMoney.push(
                                        new invoiceData(
                                            this.invoice.invoiceId,
                                            this.invoice.applyId,
                                            this.invoice.originalcustomercode,
                                            this.invoice.originalcustomer,
                                            this.invoice.orderno,
                                            this.invoice.internalinvoiceno,
                                            this.invoice.externalinvoiceno,
                                            this.invoice.invoicedate,
                                            this.invoice.originalmoney,
                                            this.invoice.originalreceiptdate,
                                            this.invoice.originalcomplexaccount,
                                            this.invoice.money,
                                            this.invoice.customercode,
                                            this.invoice.customer,
                                            this.invoice.receiptdate,
                                            this.invoice.complexaccout,
                                            this.invoice.rednoticeno,
                                            this.invoice.ZCRorderno,
                                            this.invoice.ZDRorderno,
                                            this.invoice.REorderno,
                                            this.invoice.REdeliveryno,
                                            this.invoice.ZTYorderno,
                                            this.invoice.ZTYdeliveryno,
                                            this.invoice.ZREorderno,
                                            this.invoice.ZREdeliveryno,
                                            this.invoice.ZSDorderno,
                                            this.invoice.ZSDdeliveryno,
                                            this.invoice.ZORorderno,
                                            this.invoice.ZORdeliveryno,
                                            this.invoice.PURCH_NO_C,
                                            this.invoice.seller,
                                            this.invoice.sellercode,
                                            this.invoice.SALES_ORG,
                                            this.invoice.DISTR_CHAN,
                                            this.invoice.DIVISION,
                                            this.invoice.PRICE_DATE,
                                            this.invoice.PMNTTRMS,
                                            this.invoice.SALES_OFF,
                                            this.invoice.SALES_GRP,
                                            this.invoice.SHIP_TYPE,
                                            this.invoice.TransitMode,
                                            this.invoice.TransitModeCode,
                                            this.invoice.SDF_KUNNR,
                                            this.invoice.SDF_NAME,
                                            this.invoice.detailaddress,
                                            this.invoice.province,
                                            this.invoice.city,
                                            this.invoice.citycode,
                                            this.invoice.district,
                                            this.invoice.zipcode,
                                            this.invoice.connecter,
                                            this.invoice.phone,
                                            this.invoice.signstandard
                                        )
                                    )
                                }
                            }
                            //tab栏切换
                            this.backtabData = [];
                            for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                                this.backtabData.push(new tabListData(
                                    this.examineMoney[i].internalinvoiceno,
                                    false
                                ))
                            }
                            this.backtabData[0].active = true;

                            //保存表单数据
                            this.changeEventObject(materialLocal, this.material);
                            this.material.num = Number(this.material.num);
                            this.material.originalbackmoney = Number(this.material.originalbackmoney);
                            this.material.originalmoney = Number(this.material.originalmoney);
                            this.material.money = this.material.originalmoney
                            //物料信息
                            if (!this.backtabData.length) {
                                this.backtabData.push(
                                    new materialData(
                                        this.material.materialId,
                                        this.material.invoiceId,
                                        this.material.internalinvoiceno,
                                        this.material.projcode,
                                        this.material.originalmaterialcode,
                                        this.material.materialcode,
                                        this.material.originaldescription,
                                        this.material.description,
                                        this.material.num,
                                        this.material.factory,
                                        this.material.originalstoragelocation,
                                        this.material.storagelocation,
                                        this.material.originalbatchno,
                                        this.material.batchno,
                                        this.material.originalmoney,
                                        this.material.money,
                                        this.material.originalbackmoney,
                                        this.material.backmoney,
                                        this.material.returnnum,
                                        this.material.returnstoragelocation,
                                        this.material.specifystoragelocation,
                                        this.material.deliveryno,
                                        this.material.ordertype,
                                        this.material.groupno,
                                        this.material.ERPorderno,
                                        this.material.CURRENCY,
                                        this.material.invoiceremark
                                    )
                                )
                            }
                            else {
                                let flag = true;
                                for (let i = 0, len = this.materialExamine.length; i < len; i++) {
                                    if (this.materialExamine[i].internalinvoiceno == this.material.internalinvoiceno) {
                                        flag = false;
                                    }
                                }
                                if (flag) {
                                    this.materialExamine.push(
                                        new materialData(
                                            this.material.materialId,
                                            this.material.invoiceId,
                                            this.material.internalinvoiceno,
                                            this.material.projcode,
                                            this.material.originalmaterialcode,
                                            this.material.materialcode,
                                            this.material.originaldescription,
                                            this.material.description,
                                            this.material.num,
                                            this.material.factory,
                                            this.material.originalstoragelocation,
                                            this.material.storagelocation,
                                            this.material.originalbatchno,
                                            this.material.batchno,
                                            this.material.originalmoney,
                                            this.material.money,
                                            this.material.originalbackmoney,
                                            this.material.backmoney,
                                            this.material.returnnum,
                                            this.material.returnstoragelocation,
                                            this.material.specifystoragelocation,
                                            this.material.deliveryno,
                                            this.material.ordertype,
                                            this.material.groupno,
                                            this.material.ERPorderno,
                                            this.material.CURRENCY,
                                            this.material.invoiceremark
                                        )
                                    )
                                }
                            }
                        })
                }
                else if (modalDate.length > 1) {
                    this.moreMessageShow = true;
                    this.meterialBack = function (e) {
                        this.moreMessageShow = false;
                        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
                        let options = new RequestOptions({ headers: headers });
                        let url = "InvoiceRevise/GetMaterial";
                        this.http.post(url, e, options)
                            .toPromise()
                            .then(res => {
                                let localData = JSON.parse(res .Data);
                                console.log(localData)
                                this.meterialData = this.materialExamine;
                                if (!this.examineMoney.length) {
                                    for (let i = 0; i < localData.length; i++) {
                                        this.examineMoney.push(
                                            new invoiceData(
                                                modalDate[i].invoiceId,
                                                modalDate[i].applyId,
                                                modalDate[i].originalcustomercode,
                                                modalDate[i].originalcustomer,
                                                modalDate[i].orderno,
                                                modalDate[i].internalinvoiceno,
                                                modalDate[i].externalinvoiceno,
                                                modalDate[i].invoicedate,
                                                modalDate[i].originalmoney,
                                                modalDate[i].originalreceiptdate,
                                                modalDate[i].originalcomplexaccount,
                                                modalDate[i].money,
                                                modalDate[i].customercode,
                                                modalDate[i].customer,
                                                modalDate[i].receiptdate,
                                                modalDate[i].complexaccout,
                                                modalDate[i].rednoticeno,
                                                modalDate[i].ZCRorderno,
                                                modalDate[i].ZDRorderno,
                                                modalDate[i].REorderno,
                                                modalDate[i].REdeliveryno,
                                                modalDate[i].ZTYorderno,
                                                modalDate[i].ZTYdeliveryno,
                                                modalDate[i].ZREorderno,
                                                modalDate[i].ZREdeliveryno,
                                                modalDate[i].ZSDorderno,
                                                modalDate[i].ZSDdeliveryno,
                                                modalDate[i].ZORorderno,
                                                modalDate[i].ZORdeliveryno,
                                                modalDate[i].PURCH_NO_C,
                                                modalDate[i].seller,
                                                modalDate[i].sellercode,
                                                modalDate[i].SALES_ORG,
                                                modalDate[i].DISTR_CHAN,
                                                modalDate[i].DIVISION,
                                                modalDate[i].PRICE_DATE,
                                                modalDate[i].PMNTTRMS,
                                                modalDate[i].SALES_OFF,
                                                modalDate[i].SALES_GRP,
                                                modalDate[i].SHIP_TYPE,
                                                modalDate[i].TransitMode,
                                                modalDate[i].TransitModeCode,
                                                modalDate[i].SDF_KUNNR,
                                                modalDate[i].SDF_NAME,
                                                modalDate[i].detailaddress,
                                                modalDate[i].province,
                                                modalDate[i].city,
                                                modalDate[i].citycode,
                                                modalDate[i].district,
                                                modalDate[i].zipcode,
                                                modalDate[i].connecter,
                                                modalDate[i].phone,
                                                modalDate[i].signstandard
                                            )
                                        )
                                    }

                                    for (let i = 0; i < localData.length; i++) {
                                        this.examineMoney[i].internalinvoiceno = localData[i].internalinvoiceno,
                                            this.examineMoney[i].originalcomplexaccount = localData[i].originalcomplexaccount
                                    }

                                }
                                else {
                                    let flag = true;
                                    console.log(this.examineMoney, localData)
                                    for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                                        //判断是否是新的发票号 
                                        if (this.examineMoney[i].internalinvoiceno == localData[0].internalinvoiceno) {
                                            flag = false;
                                            this.WindowService.alert({ message: '系统发票号相同', type: 'success' });
                                        };
                                    };
                                    console.log(localData, this.examineMoney, flag);
                                    if (flag) {
                                        for (let i = 0; i < modalDate.length; i++) {
                                            for (let n = 0; n < localData.length; n++) {
                                                if (modalDate[i].internalinvoiceno == localData[n].internalinvoiceno) {
                                                    this.examineMoney.push(
                                                        new invoiceData(
                                                            modalDate[i].invoiceId,
                                                            modalDate[i].applyId,
                                                            modalDate[i].originalcustomercode,
                                                            modalDate[i].originalcustomer,
                                                            modalDate[i].orderno,
                                                            modalDate[i].internalinvoiceno,
                                                            modalDate[i].externalinvoiceno,
                                                            modalDate[i].invoicedate,
                                                            modalDate[i].originalmoney,
                                                            modalDate[i].originalreceiptdate,
                                                            modalDate[i].originalcomplexaccount,
                                                            modalDate[i].money,
                                                            modalDate[i].customercode,
                                                            modalDate[i].customer,
                                                            modalDate[i].receiptdate,
                                                            modalDate[i].complexaccout,
                                                            modalDate[i].rednoticeno,
                                                            modalDate[i].ZCRorderno,
                                                            modalDate[i].ZDRorderno,
                                                            modalDate[i].REorderno,
                                                            modalDate[i].REdeliveryno,
                                                            modalDate[i].ZTYorderno,
                                                            modalDate[i].ZTYdeliveryno,
                                                            modalDate[i].ZREorderno,
                                                            modalDate[i].ZREdeliveryno,
                                                            modalDate[i].ZSDorderno,
                                                            modalDate[i].ZSDdeliveryno,
                                                            modalDate[i].ZORorderno,
                                                            modalDate[i].ZORdeliveryno,
                                                            modalDate[i].PURCH_NO_C,
                                                            modalDate[i].seller,
                                                            modalDate[i].sellercode,
                                                            modalDate[i].SALES_ORG,
                                                            modalDate[i].DISTR_CHAN,
                                                            modalDate[i].DIVISION,
                                                            modalDate[i].PRICE_DATE,
                                                            modalDate[i].PMNTTRMS,
                                                            modalDate[i].SALES_OFF,
                                                            modalDate[i].SALES_GRP,
                                                            modalDate[i].SHIP_TYPE,
                                                            modalDate[i].TransitMode,
                                                            modalDate[i].TransitModeCode,
                                                            modalDate[i].SDF_KUNNR,
                                                            modalDate[i].SDF_NAME,
                                                            modalDate[i].detailaddress,
                                                            modalDate[i].province,
                                                            modalDate[i].city,
                                                            modalDate[i].citycode,
                                                            modalDate[i].district,
                                                            modalDate[i].zipcode,
                                                            modalDate[i].connecter,
                                                            modalDate[i].phone,
                                                            modalDate[i].signstandard
                                                        )
                                                    )
                                                }
                                            }
                                        }

                                        for (let i = 0; i < localData.length; i++) {
                                            // this.invoiceArr[i].internalinvoiceno = localData[i].internalinvoiceno,
                                            this.examineMoney[i].originalcomplexaccount = localData[i].originalcomplexaccount
                                        }
                                    };
                                }
                                this.backtabData = [];
                                for (let i = 0, len = this.examineMoney.length; i < len; i++) {
                                    this.backtabData.push(new tabListData(
                                        this.examineMoney[i].internalinvoiceno,
                                        false
                                    ))
                                }
                                this.backtabData[0].active = true;
                                // this.backtabDataList.emit(this.tabDataList);
                                console.log(this.meterialData);
                                let data = [];
                                for (let i = 0; i < localData.length; i++) {
                                    //物料添加发票号
                                    for (let n = 0; n < localData[i].material.length; n++) {
                                        localData[i].material[n].internalinvoiceno = localData[i].internalinvoiceno;
                                        data.push(localData[i].material[n]);
                                    }
                                }

                                for (let n = 0; n < data.length; n++) {
                                    if (this.meterialData[n].internalinvoiceno != data[n].internalinvoiceno) {
                                        this.meterialData.push(
                                            new materialData(
                                                data[n].materialId,
                                                data[n].invoiceId,
                                                data[n].internalinvoiceno,
                                                data[n].projcode,
                                                data[n].originalmaterialcode,
                                                data[n].materialcode,
                                                data[n].originaldescription,
                                                data[n].description,
                                                data[n].num,
                                                data[n].factory,
                                                data[n].originalstoragelocation,
                                                data[n].storagelocation,
                                                data[n].originalbatchno,
                                                data[n].batchno,
                                                data[n].originalmoney,
                                                data[n].money,
                                                data[n].originalbackmoney,
                                                data[n].backmoney,
                                                data[n].returnnum,
                                                data[n].returnstoragelocation,
                                                data[n].specifystoragelocation,
                                                data[n].deliveryno,
                                                data[n].ordertype,
                                                data[n].groupno,
                                                data[n].ERPorderno,
                                                data[n].CURRENCY,
                                                data[n].invoiceremark
                                            )
                                        )
                                    }
                                }
                                //初始化
                                this.materialList = [];

                                for (let i = 0, len = this.meterialData.length; i < len; i++) {
                                    this.meterialData[i].originalmaterialcode = +this.meterialData[i].originalmaterialcode + 0;
                                    if (this.meterialData[i].internalinvoiceno == this.backtabData[0].value) {
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
                                    for (let i = 0, len = this.meterialData.length; i < len; i++) {
                                        this.meterialData[i].originalmaterialcode = +this.meterialData[i].originalmaterialcode + 0;
                                        if (this.billBack.material[i].internalinvoiceno == this.invoicenoActive) {
                                            this.materialList.push(this.billBack.material[i]);
                                        }
                                    }
                                }
                            });
                    }
                    this.modalDataChild = modalDate;
                    for (let i = 0, len = this.modalDataChild.length; i < len; i++) {
                        this.modalDataChild[i].select = false;
                    }
                    // this.returnMaterialData.emit(this.meterialData);//物料号
                }
            }
            );
        // this.backInvoice.emit(this.invoiceArr);//财务
        // this.returnMaterialData.emit(this.meterialData);//物料号
    }
    //数据保存
    public selecteRedtypes(value) {

        if (value) {
            let redTypeFlag = true;
            // this.redTypeFlagOut.emit(redTypeFlag);
        }
        if (this.applyDate.revisetype != value.text) {
            this.examineMoney = [];
            this.backtabData = [];
            this.materialList = [];
        }
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
}

export class tabListData {
    constructor(
        public value,
        public active
    ) { }
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
export class modalSendObj {
    constructor(
        public invoiceno,
        public orderno
    ) { }
}
export class invoiceData {
    constructor(
        public invoiceId,
        public applyId,
        public originalcustomercode,
        public originalcustomer,
        public orderno,
        public internalinvoiceno,
        public externalinvoiceno,
        public invoicedate,
        public originalmoney,
        public originalreceiptdate,
        public originalcomplexaccount,
        public money,
        public customercode,
        public customer,
        public receiptdate,
        public complexaccout,
        public rednoticeno,
        public ZCRorderno,
        public ZDRorderno,
        public REorderno,
        public REdeliveryno,
        public ZTYorderno,
        public ZTYdeliveryno,
        public ZREorderno,
        public ZREdeliveryno,
        public ZSDorderno,
        public ZSDdeliveryno,
        public ZORorderno,
        public ZORdeliveryno,
        public PURCH_NO_C,
        public seller,
        public sellercode,
        public SALES_ORG,
        public DISTR_CHAN,
        public DIVISION,
        public PRICE_DATE,
        public PMNTTRMS,
        public SALES_OFF,
        public SALES_GRP,
        public SHIP_TYPE,
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
        public signstandard
    ) { }
}
export class materialData {
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