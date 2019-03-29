
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import { environment_java } from "environments/environment";
import { 
  Query
} from './rtn-list.service';
declare var window,Blob,document,URL;


export class BorrowTransferQueryPo {
  public userId: string;//当前登陆人Id
  public flowStatus: string;//审核状态   1：待审核  3：已完成   其他数字标识为草稿
  public staDate:	string;//起始时间
  public endDate:	string;//终止时间
  public newYLH:	string;//新预留号
  public oldYLH:	string;//旧预留号
  public applyPersonItcode:	string;//原申请人itcode
  public trsfPersonItcode:	string;//转移人itcode
  public needFilter:	boolean=true;//是否需要执行筛选查询，默认不需要【查询全部】
  public needCreaterFilter:	boolean;//是否需要过滤当前登录人为创建者
  public mycheckFilte:	string="0";//我的审核状态：  1.待我审核  2.我已审核  3或者其他数字.全部   0.不开通
  public needQueryFilte: boolean=false;//是否借用管理综合查询
}

export class BorrowTransferApply {
  public brwTransId: string;//借用转移申请单Id
  public brwSubTransId: string;//借用转移申请子申请单Id
  public oPersonName:	string;//原借用申请人姓名
  public oPersonItCode:	string;//原借用申请人ItCode
  public nPersonName:	string;//转移后借用申请人姓名
  public nPersonItCode:	string;//现借用申请人ItCode
  public contactPhone:	string;//联系方式
  public baseDeptName:	string;//本部
  public subDeptName:	string;//事业部
  public platformCode:	string;//平台编码
  public platformName:	string;//平台名称
  public applyDate:	string;//申请日期
  public flowStatus:	number;//流程状态
  public instId:	string;
  public org:	string;
  public currApprAuthors:	string;
  public apprReadors:	string;
  
  public currApprUserIds:	string;
  public createDate:	string;
  
  public flowCurrNodeName:	string;//当前流程节点名称
  
  public lastModifiedDate:	string; //最后修改时间
  
  
  
  public createBy:	string;//创建人
  
  public approvalIds:	string;//审批id 
  public lastModifiedBy:	string;// 最后修改人
  
  public version:	string;//流程版本
  
  public id:	string;
  
  public currApprAuthorsItcode:	string;//审批人itcode
  public flowCurrNodeId:	string;//当前流程节点Id

  public formId:	string;//自定义表单ID
}


@Injectable()
export class TranSferService{
    constructor(private http: Http) { }
   
    findTransApplys(pageNo1:string,pageSize1:string,query:BorrowTransferQueryPo) {
   //console.log("query=wwww=="+query);
    
 return this.http.post(environment_java.server+"borrow/borrow-transfers?pageNo="+pageNo1+"&pageSize="+pageSize1,query).toPromise()
            .then(res=>res.json());

  
  }

 isIE(){
      let  uA = window.navigator.userAgent;
      let isIE = /msie\s|trident\/|edge\//i.test(uA) && !!("uniqueID" in document || "documentMode" in document || ("ActiveXObject" in window) || "MSInputMethodContext" in window);
      return isIE;
  }
    //导出excel
    tranSferExcelfile(query:BorrowTransferQueryPo) { 
        this.http.post(environment_java.server + "borrow/borrow-transfer/export", 
           query,{
            responseType: 3
        }).pipe(
            map(res => res.json()))
            .subscribe(data => {
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                 if(this.isIE()){
                window.navigator.msSaveBlob(blob, "transfer.xls");
                 }else{
                var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用转移列表');
                    a.setAttribute('id','download');
                    a.click();
                    //解决ie11不能下载的问题
                    a.addEventListener('click', function() {
                      URL.revokeObjectURL(objectUrl);
                      document.getElementById('download').remove();
                    });
                 }
              
            });
  

//  return this.http.post(environment_java.server+"borrow/rpt-apply/export",{queryPo:query}).toPromise()
//             .then(res=>res.json());
    }


         /**
     * 查询待我审批的条数
     */
    queryWaitForApprovalNum(){
        return this.http.get(environment_java.server + "/borrow/borrow-transfer/wait-me",null).toPromise()
            .then(res=>res.json().item as number);
    }

      /**
     * 删除单个申请单
     * @param applyId 
     */
    deleteTranSfer(applyId: string) {
        //console.log("delete");
        return this.http.delete(environment_java.server + "/borrow/borrow-transfer/" + applyId).toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }
        private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}