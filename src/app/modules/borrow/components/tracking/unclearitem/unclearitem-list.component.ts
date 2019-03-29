import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {Http} from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { environment_java } from "./../../../../../../environments/environment";
import { UnClearItem, UnclearMaterialItem,UnClearItemEntity,ApplyUser } from './../../common/borrow-entitys';
import { DatePipe } from '@angular/common';
@Component({
    styleUrls:['./unclearitem-list.component.scss','../../../scss/borrow-private.component.scss'],
    templateUrl:'./unclearitem-list.component.html',
    providers:[DatePipe],
})
export class UnclearItemListComponent{
    applyItCode:string;//查询条件
    poList:UnClearItemEntity[]=[];
    unclearItem?:UnClearItem;
    constructor(private http: Http, private route: ActivatedRoute, private windowService: WindowService,private datePipe:DatePipe){}
    search(){
        this.http.get(environment_java.server+"borrow/unclear-item/all/"+this.applyItCode+"/itcode",null).toPromise()
            .then(res=>{
                let data = res.json();
                if(data.success){
                    this.poList = data.list;
                    if(this.poList.length > 0){
                        this.unclearItem = this.poList[0].unClearItem;
                        for(let i = 0; i < this.poList.length; i ++){
                            let item = this.poList[i].unClearItem;
                            let temp1 = this.convertDateToStr(new Date());
                            let date1 = new Date(temp1).getTime();//当前日期
                            let temp2 = this.convertDateToStr(new Date(+item.giveBackDay));
                            console.log(temp2);
                            let date2 = new Date(temp2).getTime();//预计归还日期
                            item.overdueDays = this.getDays(date1,+date2);
                        }
                    }
                }
            })
    }
    convertDateToStr(oldDate: Date) {
    let vyear = oldDate.getFullYear();
    let omonth = oldDate.getMonth()+1;
    let vmonth:string;
    let vday:string;
    if (omonth <= 9) {vmonth = "0" + omonth;}
    else vmonth = "" + omonth;
    let oday = oldDate.getDate();
    if (oday <= 9) vday = "0" + oday;
    else vday = "" + oday;
  
    let newDate = vyear + "-" + vmonth + "-" + vday;
    return newDate;
  }
    getDays(date1:number,date2:number){
        let dayNum = (date1-date2)/(24*60*60*1000);
        return dayNum;
    }
}