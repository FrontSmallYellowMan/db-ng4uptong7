import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { environment_java } from "environments/environment";
import { WindowService } from 'app/core';
import { UnClearItem, UnclearMaterialItem, UnClearItemEntity } from './../../../common/borrow-entitys';
declare var window;
@Component({
    templateUrl: './undeal-items.component.html',
    styleUrls: ['./undeal-items.component.scss']
})

export class TrackingUndealItemsComponent implements OnInit {
    constructor(private route: ActivatedRoute, private location: Location, private http: Http,private windowService:WindowService) { }
    name = '冻结人员未清项';
    poList: UnClearItemEntity[] = [];
    unclearItem?: UnClearItem;
    public personnel = {
        frozenItCode: '',
        frozenUserNo: '',
        frozenUserName: ''
    }
    ngOnInit() {
        this.route.params.subscribe(params => { this.personnel.frozenItCode = params['id'] });//从路由中取出变量id的值
        //console.info(this.personnel);
        this.http.get(environment_java.server + "borrow/unclear-item/" + this.personnel.frozenItCode + "/itcode").toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    this.poList = data.list;
                    if (this.poList.length > 0) {
                        this.unclearItem = this.poList[0].unClearItem;
                        for (let i = 0; i < this.poList.length; i++) {
                            let item = this.poList[i].unClearItem;
                            let temp1 = this.convertDateToStr(new Date());
                            let date1 = new Date(temp1).getTime();//当前日期
                            let temp2 = this.convertDateToStr(new Date(+item.giveBackDay));
                            let date2 = new Date(temp2).getTime();//预计归还日期
                            item.overdueDays = this.getDays(date1, +date2);
                        }
                    }
                }

            });
    }
    convertDateToStr(oldDate: Date) {
        let vyear = oldDate.getFullYear();
        let omonth = oldDate.getMonth() + 1;
        let vmonth: string;
        let vday: string;
        if (omonth <= 9) { vmonth = "0" + omonth; }
        else vmonth = "" + omonth;
        let oday = oldDate.getDate();
        if (oday <= 9) vday = "0" + oday;
        else vday = "" + oday;

        let newDate = vyear + "-" + vmonth + "-" + vday;
        return newDate;
    }
    getDays(date1: number, date2: number) {
        let dayNum = (date1 - date2) / (24 * 60 * 60 * 1000);
        return dayNum;
    }
    goBack(){
       // this.location.back();
       window.close();
    }
}
