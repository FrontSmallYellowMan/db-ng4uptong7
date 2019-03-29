import { Component, OnInit, Input } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { Inventory} from './borrow-entitys';
//import { DatePipe } from '@angular/common';
import { environment_java } from 'environments/environment';
@Component({
  templateUrl: './pop-inventory-list.component.html',
  styleUrls: ['../../scss/modal-data.component.scss', './pop-inventory-list.component.scss'],
  //providers: [DatePipe]
})


export class PopInventoryListComponent implements OnInit {

  modal1: XcModalRef;
  ifDisabled = false;
  inventoryNo: string="";//预留号，查询条件
  //列表list
  public unInventoryItemList: Inventory[] = [];
  //为1表示需要同时选中通预留号下所有的未清项
  type: string = "0";
  checkedValue:string="";
  constructor(private windowService: WindowService, private xcModalService: XcModalService, private http: Http) {

  }

  ngOnInit() {
    //获得弹出框自身1111
    this.modal1 = this.xcModalService.getInstance(this);
    this.modal1.onShow().subscribe((data?) => { 
    })
   
  }
  search(e:any) {
    if (this.inventoryNo.trim() === "") {
      this.windowService.alert({ message: "预留号不能为空", type: "fail" });
      return;
    }
    this.http.get(environment_java.server + "borrow/platforminv/all/" + this.inventoryNo, null).toPromise()
      .then(res => {
        let data = res.json();
        if (data.success) {
          this.unInventoryItemList = data.list;
        }
      })
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal1.hide(data);
  }

  //保存数据
  save(param: any) {

    let ObList = [];
    param.filter(item => item.checked === true).forEach(item => {
      ObList.push(item);
    });
    let returnData={"inventoryNo":this.checkedValue,"type":"save"};
    this.hide(returnData);


  }

  loadApply() {
    this.unInventoryItemList=[];
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
  checkStoreHouseCode(e: any, item) {
      this.checkedValue=item.storeHouseCode;
       for (let clearItem of this.unInventoryItemList) {

          clearItem["checked"]=false;

          if (clearItem.storeHouseCode == item.storeHouseCode ) {
              clearItem["checked"] = e;
          }
    }
     
  }
}