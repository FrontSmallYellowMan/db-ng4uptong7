import { Component, OnInit,Input } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { Observable } from 'rxjs';
import { environment_java } from '../../../../../environments/environment';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'db-invoice-common-list',
  templateUrl: './invoice-common-list.component.html',
  styleUrls: ['../../scss/modal-data.component.scss'],
  providers: [DatePipe]
})
export class InvoiceCommonListComponent implements OnInit {

  modal:XcModalRef;
  ifDisabled=false;
  ifIndeterminate=false;
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  itemid=1;
  //列表list
  public invoiceApplyList;
  //状态
  public invoiceStatus;
   //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  sqruserItcode:string="";
  typeval:string="";
  //not in ids
  applyids:string = "-1";
  status:string ="3";
  constructor( private windowService: WindowService, private datePipe: DatePipe,private xcModalService: XcModalService ,private http: Http) { 
    
  }

   ngOnInit(){
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
       this.tickNum="";
      this.CreatedTimeEnd="";
      this.CreatedTimeStart=""; 
      this.fullChecked = false;//全选状态
      this.fullCheckedIndeterminate = false;//半选状态
      this.invoiceApplyList=new Array();
      this.invoiceStatus=new Array();
      this.applyids=data.applyids;
      this.typeval=data.typeval;
      this.status=data.status;
      this.sqruserItcode=data.sqruserItcode;
      this.loadApply();
    })
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    
  }

  //保存数据
  save(param: any){
    let ObList = [];
    param.filter(item => item.checked === true).forEach(item => {
            ObList.push(item);
    });
    this.hide(ObList);
  }
  mykeydown(){
     this.loadApply();
  }
  tickNum="";
  CreatedTimeEnd="";
  CreatedTimeStart="";
getDate(date,flag){
  if(flag=="end"){
    this.CreatedTimeEnd=date;
  }else{
    this.CreatedTimeStart=date;
  }
   this.loadApply();
}
getFormatDate(dataObj):string{
    if(!dataObj){
        return "";
    }
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

  loadApply(){

    let pagerData = this.pagerData;
    let params:URLSearchParams = new URLSearchParams();
    params.set('pageNo', pagerData.pageNo.toString());
    params.set('pageSize', pagerData.pageSize.toString());
    params.set("createdTimeStart",this.getFormatDate(this.CreatedTimeStart));//开始时间
    params.set("createdTimeEnd",this.getFormatDate(this.CreatedTimeEnd));//结束时间
    params.set("search",this.tickNum);
    params.set("userItcode",this.sqruserItcode);//申请人id
    params.set("applyids",this.applyids);//not in 支票id
    params.set("status",this.status);//过滤支票状态 in
    params.set("type",this.typeval);//申请单类型：CP撤票
    if(this.typeval.length<=0){
      return false;
    }
    this.http.get(environment_java.server+'/revoked/invoice-applys',{search:params})
          .map(res => res.json())
          .subscribe(res => {
              if(res.item){
                  this.invoiceApplyList = res.item.list.list;
                 if (res.item.list.pager && res.item.list.pager.total) {
                    this.pagerData.set({
                        total: res.item.list.pager.total,
                        totalPages: res.item.list.pager.totalPages
                    })
                 }
                  this.invoiceStatus=JSON.parse(res.item.invoiceStatus);
              }
          });
  }

  //分页
    public pagerData = new Pager();

    public currentPageSize;
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.loadApply();
    }

}
