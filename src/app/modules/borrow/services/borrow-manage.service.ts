
import {map} from 'rxjs/operators/map';
import {Injectable} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import { environment_java } from "./../../../../environments/environment";
import { Query,BorrowApply,BorrowListService,Materiel,Transport, BorrowApplytransportPoL,BorrowApplyFormData,BorrowAttachment} from './borrow-list.service';

declare var window,Blob,document,URL;




export class BorrowApplyQueryPo{//归还物料明细表
  public applyItCode:	string; //申请人ItCode
  public baseDeptName:	string; //本部名称
  public borrowAttributeCode:	string; //借用属性
  public borrowCustomerName:	string ; //客户名称
  public businessScope:	string ; //业务范围
  public endDate:	string ; //申请日期:结束时间
  public flowStatus:	string ; //流程状态 0:草稿 ;3:已完成; 1:审批中; 空:全部
  public pageNo:	string ; //当前页码
  public pageSize:	string ; //每页显示条数
  public platformCode:	string ; //归属平台
  public projectName:	string ; //项目名称
  public startDate:	string ; //申请日期:开始时间
  public subDeptName:	string ; //事业部名称
  public transportNo:	string ; //运输单号
  public ids:string;//可导出的Ids
}

@Injectable()
export class BorrowManageService{
  constructor(private http:Http){

  }
  isIE(){
        /**if (window.navigator.userAgent.indexOf("MSIE")>=1){
        return true; 
        }else{
        return false;
      } **/
      let  uA = window.navigator.userAgent;
      let isIE = /msie\s|trident\/|edge\//i.test(uA) && !!("uniqueID" in document || "documentMode" in document || ("ActiveXObject" in window) || "MSInputMethodContext" in window);
      return isIE;
  }


  getBorrowmanageList(query:BorrowApplyQueryPo) {
      return this.http.post(environment_java.server + "borrow/borrow-applys/all",query).toPromise()
            .then(res=>res.json());

  
  }
  
    //导出excel
    borrowExcelfile(query:BorrowApplyQueryPo) {
        this.http.post(environment_java.server + "borrow/borrow-applys/export", 
           query,{
            responseType: 3
        }).pipe(
            map(res => res.json()))
            .subscribe(data => {
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                 if(this.isIE()){
                   window.navigator.msSaveBlob(blob, "borrowApply.xls");
                 }else{
                      var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用列表');
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
    //获取页面option选项值
   getBorrowPageAttrOption(type:number){
     return this.http.get(environment_java.server+"borrow/borrow-applys/"+type+"/base-code")
      .toPromise()
      .then(response => response.json())
   }


  //获取可用的平台列表
  getPlatforms(){
    return this.http.get(environment_java.server+'borrow/platforminv/platforms')
                    .toPromise()
                    .then(response => response.json())
  } 
  
    //导出excel
    borrowExcelfileByIds(ids:string) {
        this.http.post(environment_java.server + "borrow/borrow-applys/export", ids).pipe(
            map(res => res.json()))
            .subscribe(data => {
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                 if(this.isIE()){
                   window.navigator.msSaveBlob(blob, "borrowApply.xls");
                 }else{
                      var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用列表');
                    a.click();
                    URL.revokeObjectURL(objectUrl);
                 }
            });

    }
}