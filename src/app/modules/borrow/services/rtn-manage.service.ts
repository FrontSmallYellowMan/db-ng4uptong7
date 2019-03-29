
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import { BorrowAmountBusinessScope, BorrowAmount, BorrowAmountPo } from './../components/limit';
import { environment_java } from "./../../../../environments/environment";
import {
    Query,
    BorrowReturnApply
} from './rtn-list.service';

declare var window, Blob, document, URL;




export class BorrowReturnQueryPo {//归还物料明细表
    public userId: string; //当前登陆人Id
    public flowStatus: number; //审核状态
    public applyNo: string; //申请单号
    public transportNo: string; //运输单号
    public reservationNo: string;//预留号
    public pickupType: string; //取货方式
    public businessScopeCode: string; //业务范围

    public applyUser: string; //申请人ItCode/申请人姓名
    public baseDeptName: string;//本部
    public subDeptName: string;//事业部筛选
    public staDate: string;//起始时间
    public endDate: string;//终止时间

}
@Injectable()
export class RtnManageService {
    constructor(private http: Http) {

    }


    getRtnmanageList(pageNo1: string, pageSize1: string, query: BorrowReturnQueryPo) {
        // console.log("query=wwww=="+query);
        return this.http.post(environment_java.server + "borrow/rtn-applylist", { pageNo: pageNo1, pageSize: pageSize1, queryPo: query }).toPromise()
            .then(res => res.json());


    }
    getDate1(date) {
        let dataObj = new Date(date);
        let year = dataObj.getFullYear();
        let month = (dataObj.getMonth() + 1).toString();
        let day = dataObj.getDate().toString();
        if (month.length == 1) {
            month = "0" + month
        }
        if (Number(day) < 10) {
            day = "0" + day;
        }
        let temp = year + "-" + month + "-" + day;
        return temp;
    }

     isIE(){
      let  uA = window.navigator.userAgent;
      let isIE = /msie\s|trident\/|edge\//i.test(uA) && !!("uniqueID" in document || "documentMode" in document || ("ActiveXObject" in window) || "MSInputMethodContext" in window);
      return isIE;
  }
    //导出excel
    rtnExcelfile(query: BorrowReturnQueryPo) {
        this.http.post(environment_java.server + "borrow/rtn-apply/export",
            query, {
                responseType: 3
            }).pipe(
            map(res => res.json()))
            .subscribe(data => {
                //console.log("data==" + JSON.stringify(data));
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });

                if (this.isIE()) {
                    window.navigator.msSaveBlob(blob, "borrowReturn.xls");
                } else {
                    var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用实物归还列表');
                    a.setAttribute('id','download');
                    a.click();
                    //解决ie11不能下载的问题
                    a.addEventListener('click', function() {
                      URL.revokeObjectURL(objectUrl);
                      document.getElementById('download').remove();
                    });
                }

            });

    }

}