
import {map} from 'rxjs/operators/map';
import { Component, OnInit, Input } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { UnClearItem, UnclearMaterialItem, UnClearItemEntity } from './borrow-entitys';
//import { DatePipe } from '@angular/common';
import { environment_java } from 'environments/environment';
@Component({
  templateUrl: './pop-unclear-list.component.html',
  styleUrls: ['../../scss/modal-data.component.scss', './pop-unclear-list.component.scss'],
  //providers: [DatePipe]
})


export class PopUnclearListComponent implements OnInit {

  modal: XcModalRef;
  ifDisabled = false;
  reservationNo: string;//预留号，查询条件
  userItCode:string;
  //列表list
  public unClearItemList: UnClearItemEntity[] = [];
  //为1表示需要同时选中通预留号下所有的未清项
  type: string = "0";
  constructor(private windowService: WindowService, private xcModalService: XcModalService, private http: Http) {

  }

  ngOnInit() {
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);


    this.modal.onShow().subscribe((data?) => {
      this.reservationNo = "";
      this.userItCode="";
       //console.info("==============erwrewerwer==============");
       // console.info(data);
      if(data){
        if(typeof(data.reservationNos)!='undefined'&&data.reservationNos!=""){
          this.reservationNo=data.reservationNos;
         // console.info("==============search==============");
          this.search();
        }else{
          // console.info("==============search22222222==============");
          this.userItCode=data.userItCode;
          this.loadApply(data.userItCode);
        }
       
      }else{
        this.loadApply(null);
      }
     

    })
  }
  search() {
    if (this.reservationNo.trim() === "") {
      this.windowService.alert({ message: "预留号不能为空", type: "fail" });
      return;
    }
    let applyItCode=this.userItCode;
    this.http.get(environment_java.server + "borrow/unclear-item/" + this.reservationNo, { params: { applyItCode } }).toPromise()
      .then(res => {
        let data = res.json();
        if (data.success) {
          this.unClearItemList = data.list;
        }
      })
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  //保存数据
  save(param: any) {

    let ObList = [];
    param.filter(item => item.checked === true).forEach(item => {
      ObList.push(item);
    });

    this.hide(ObList);


  }

  loadApply(userItCode:string) {
    let urls=environment_java.server+'borrow/unclear-item/currentUser';
    if(userItCode){
    urls=environment_java.server+'borrow/unclear-item/'+userItCode+'/itcode';
  }
  console.log(urls);
    this.http.get(urls).pipe(
      map(res => res.json()))
      .subscribe(res => {
        if (res.list) {
          this.unClearItemList = res.list;
           console.log(this.unClearItemList);
          //IE10 不支持DatePipe
          for (let i = 0; i < this.unClearItemList.length; i++) {
            let item = this.unClearItemList[i].unClearItem;
            let temp1 = this.convertDateToStr(new Date());
            let currDate = new Date(temp1).getTime();
            let giveBackStr = this.convertDateToStr(new Date(+item.giveBackDay));
            //console.log(currDate);
            let giveBackDate = new Date(giveBackStr).getTime();
            item.overdueDays = this.getDays(currDate, +giveBackDate);
            //console.log(this.getDays(currDate, +giveBackDate));
          }
        }
      });
  }
  getDays(date1: number, date2: number) {
    let dayNum = (date1 - date2) / (24 * 60 * 60 * 1000);
    return dayNum;
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
  checkUnClear(e: any, item) {

    for (let clearItem of this.unClearItemList) {
      if (clearItem.unClearItem.unClearId != item.unClearItem.unClearId && clearItem.unClearItem.reservationNo == item.unClearItem.reservationNo) {
        clearItem["checked"] = e;
      }
    }
  }
}