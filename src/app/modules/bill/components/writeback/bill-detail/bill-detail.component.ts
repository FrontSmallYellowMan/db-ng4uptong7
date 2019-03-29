import { Component, ChangeDetectionStrategy, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { date, tab, tabService } from './service/tab.service';
import { billBackService } from '../../../services/bill-back.service';
import { WindowService } from 'app/core';
// import { testTable } from '../financeinfo/financeinfo.component';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';

@Component({
    selector: "bill-detail",
    templateUrl: "./bill-detail.component.html",
    styleUrls: ['bill-detail.component.scss']
})
export class BillDetailComponent implements OnInit {
    //接受总金额
    public billMoney;
    public listdata;
    @Input() urlFlag;
    @Input() billTypeId;
    @Input() tabledata;
    @Input() invoicenoActive;
    @Input() materialMoney;
    @Output() returnBillMoney = new EventEmitter();
    public getDescription(e, item) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;

        this.dbhttp.post(url, [], options)
            .toPromise()
            .then(res => {
                let localData = res.Data;
                item.description = localData;
                if (!localData) {
                    this.WindowService.alert({ message: '输入物料号有误', type: 'success' });
                }
            })
    }
    public returnBillMoneyData(e) {
        let data1 = 0;
        let data2 = 0;
        for(let i=0,len=e.length;i<len;i++){
            data1 = data1+e[i].money;
            data2 = data2+e[i].backmoney;
        }
        console.log(data1-data2);
        this.returnBillMoney.emit(data1-data2);
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
        //
        this.NumFloatAlertCur(e.backmoney);
    }
    public getKeys(items) { return Object.keys(items); }
    public BillmoneyWarn = false;
    public NumFloatAlert(table, item) {
        // this.tabService.checkFloat(item);
        // let rex = 0;
        // let lex = 0;
        // if (table) {
        //     for (let i = 0, len = table.length; i < len; i++) {
        //         rex += table[i].originalmoney
        //         lex += +table[i].money
        //     }
        // }

        // if (rex != lex) {
        //     this.BillmoneyWarn = true;
        // }
        // else if (rex = lex) {
        //     this.BillmoneyWarn = false;
        // }
        // console.log(item);
         this.NumFloatAlertCur(item);
    }

    public testdata = this.billBackService.backdta;
    public newSell = 0;
    public newBack = 0;
    public newBackMoney = this.newSell - this.newBack;
    //物料更改验证

    //验证两位小数
    public NumFloatAlertCur(item) {
        this.tabService.checkFloat(item);
    }
    //校验money和backmoney
    // public Maxin(money, backmoney) {
    //     if (backmoney > money) {
    //         this.WindowService.alert({ message: '返款总额不能大于销售金额', type: 'success' });
    //     }
    // }
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
    public getPostMaterial(e, item) {
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        let url = "InvoiceRevise/GetMaterialDesc/";
        url = url + e.target.value;

        this.dbhttp.post(url, [], options)
            .toPromise()
            .then(res => {
                let localData = res.Data;
                item.description = localData;
            })

    }

    // 表格头判断（代谢）

    constructor(
        private tabService: tabService,//表格各种服务
        private WindowService: WindowService,//弹出
        private dbhttp: HttpServer,
        private billBackService: billBackService//暂时没用
    ) {

    }//注入服务
    ngOnInit() {
        // this.tabledata = []
    }
}