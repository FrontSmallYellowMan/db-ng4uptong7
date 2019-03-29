import { Component, ChangeDetectionStrategy, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { date, tab, tabService } from '../../writeback/bill-detail/service/tab.service';
import { billBackService } from '../../../services/bill-back.service';
import { WindowService } from 'app/core';
import { testTable } from '../financeinfo/financeinfo.component';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
@Component({
    selector: "return-detail",
    templateUrl: "./bill-detail.component.html",
    styleUrls: ['bill-detail.component.scss']
})
export class returnBillDetailComponent implements OnInit {
    //接受总金额
    public billMoney;
    public listdata;
    @Input() urlFlag;
    @Input() billTypeId;
    @Input() tabledata;
    @Input() invoicenoActive;
    @Input() returnApply;
    @Input() materialMoney;
    @Input() transitmodesList;
    @Input() detailaddressData;
    @Output() returnBillMoney = new EventEmitter();
    @Output() returnAddress = new EventEmitter();
    @Output() transitmodesBack = new EventEmitter();
    constructor(
        private tabService: tabService,//表格各种服务
        private WindowService: WindowService,//弹出
        private http: HttpServer,
        private billBackService: billBackService//暂时没用
    ) { }//注入服务
    ngOnInit() {
        this.tabledata = []
    }
    //判断运输类型
    public selecteTransitmodes(e){
        this.transitmodesBack.emit(e);
    }
    //弹出层
    public showLocation = false;
    public showTimeMap() {
        this.showLocation = true;
    }
    public missData(e){
        this.showLocation=e;
    }
    public addressData(e){
        this.returnAddress.emit(e);
    }
    //获取判断物料信息
    public originaldescriptWarn;
    public getDescription(e, item) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = " InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;
        this.http.post(url, [], options)
            .toPromise()
            .then(res => {
                let localData = res.Data;
                item.description = localData;
                if (item.description != item.originaldescription) {
                    this.originaldescriptWarn = true;
                } else if (item.description == item.originaldescription) {
                    this.originaldescriptWarn = false;
                }
            })
    }
    public returnBillMoneyData(e) {
        this.returnBillMoney.emit(e);
    }
    //价格表格验证
    public BillbackMoneyWarn;
    public BillbackMoneyBlur(e) {
        if (e.backmoney > (e.money / 10 * 3)) {
            this.BillbackMoneyWarn = true;
        }
        if (e.backmoney < (e.money / 10 * 3)) {
            this.BillbackMoneyWarn = false;
        }
        if (e.backmoney == (e.money / 10 * 3)) {
            this.BillbackMoneyWarn = true;
        }
    }
    public getKeys(items) { return Object.keys(items); }
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

    public testdata = this.billBackService.backdta;
    public newSell = 0;
    public newBack = 0;
    public newBackMoney = this.newSell - this.newBack;
    //验证退货数量
    public checkreturnnum(a,b){
        if(b>a){
            this.WindowService.alert({ message: '0<退货数量≤原单数量', type: 'fail' });
        }
    }
    //验证两位小数
    public NumFloatAlertCur(item) {
        this.tabService.checkFloat(item);
    }
    public removeItems(tab, e) {
        this.tabService.removeItems(tab, e);
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
    public originaldescript;
    public getPostMaterial(e) {
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;
        this.http.post(url, [])
            .toPromise()
            .then(res => {
                let localData = res.Data;
                this.originaldescript = localData;
            })

    }

    // 表格头判断（代谢）
}
