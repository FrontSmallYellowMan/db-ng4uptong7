
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { BorrowAmount, BorrowAmountBusinessScope, BorrowAmountPo } from './../components/limit';
import { environment_java } from "./../../../../environments/environment";
declare var Blob, window, URL, document;
export class QueryParams {
    applyUserNo?: string;
    staDate: string;
    endDate: string;
    isBaseStr: string="";
    deptName: string;
    flowState: string;
    pageNo: number;
    pageSize: number;
}
//导出的查询条件类
export class QueryPo {
    applyUser: string;
    deptName: string;
    isDept: string;//"1" 事业部 "0"-本部
    staDate: string;
    endDate: string;
    flowState:string;
    applyFlag:string;
}
@Injectable()
export class LimitListService {
    constructor(private http: Http) { };
    /**
     * 获取登录人信息
     */
    getApplyUserInfo() {
        return this.http.get(environment_java.server + "common/getCurrentLoginUser").toPromise()
            .then(res =>
                res.json().item
            );
    }
    /**
     * 获取事业部/本部所有的业务范围
     * @param businessScope 
     * @param isBase 
     */
    getOrgBusiScope(businessScope: string, isBase: boolean) {
        return this.http.get(environment_java.server + "borrow/borrow-amount/biscopes/" + businessScope, { params: { isBase } }).toPromise()
            .then(res => res.json());
    }
    getBusinessScopeByDeptName(bbmc:string,sybmc:string,isBase:boolean){

        return this.http.get(environment_java.server + "borrow/borrow-amount/businessScopes",{params:{isBase,bbmc,sybmc}}).toPromise()
            .then(res=>res.json());
    }
    /**
     * 新建暂存
     * @param borrowAmount 
     * @param deptRelations 
     */
    saveDraft(borrowAmount: BorrowAmount, deptRelations: BorrowAmountBusinessScope[]) {

        let po = new BorrowAmountPo();
        po.mainData = borrowAmount;
        po.subData = deptRelations;
        //console.log(po);
        return this.http.post(environment_java.server + "borrow/borrow-amount", po).toPromise()
            .then(response => response.json());
    }
    /**
     * 风控编辑额度
     * @param id - 主键
     * @param po - 额度实体对象
     */
    submitEditForm(id: string, mainData: BorrowAmount,subData:BorrowAmountBusinessScope[]) {
        //后台未提供方法
        let po = new BorrowAmountPo();
        po.mainData = mainData;
        po.subData = subData;
        return this.http.put(environment_java.server + "borrow/borrow-amount/" + id, po).toPromise()
            .then(res => res.json());
    }
    /**
     * 查询列表
     * @param params 
     */
    searchList(queryParams: QueryParams, applyFlag: string) {
        // console.log(applyFlag);
        if (applyFlag === "1") {
            //我的申请
            return this.http.get(environment_java.server + "borrow/borrow-amount/myapply", { params: queryParams }).pipe(
                map(response => response.json()));
        } else if (applyFlag === "2") {
            //我的审批
            return this.http.get(environment_java.server + "borrow/borrow-amount/mycheck", { params: queryParams }).pipe(
                map(response => response.json()));
        }
    }
    /**
     * 判断该部门是否已经有额度申请
     * @param deptName 
     */
    checkHaveDeptAmount(bbmc:string,sybmc: string) {
        return this.http.get(environment_java.server + "borrow/borrow-amount/isChecked",{params:{bbmc,sybmc}}).toPromise()
            .then(res => res.json());
    }
    /**
     * 删除额度申请单
     * @param applyId 
     */
    deleteLimitApply(applyId: string) {
        return this.http.delete(environment_java.server + "borrow/borrow-amount/" + applyId).toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
    //查询某个额度申请单
    queryApplyDetail(applyId: string) {
        return this.http.get(environment_java.server + "borrow/borrow-amount/" + applyId).toPromise()
            .then(res => res.json().item);
    }
    /**
     * 草稿提交申请单
     * @param applyId 
     * @param borrowAmount 
     * @param deptRelations 
     */
    submitDraft(applyId: string, borrowAmount: BorrowAmount, deptRelations: BorrowAmountBusinessScope[]) {
        let po = new BorrowAmountPo();
        po.mainData = borrowAmount;
        po.subData = deptRelations;
        return this.http.put(environment_java.server + "borrow/borrow-amount/submit/" + applyId, po).toPromise()
            .then(res => res.json());
    }
    /**
     * 新建直接提交
     * @param borrowAmount 
     * @param deptRelations 
     */
    submitApply(borrowAmount: BorrowAmount, deptRelations: BorrowAmountBusinessScope[]) {

        let po = new BorrowAmountPo();
        po.mainData = borrowAmount;
        po.subData = deptRelations;
        return this.http.put(environment_java.server + "borrow/borrow-amount/submit-unsave", po).toPromise()
            .then(res => res.json());
    }
    /**
     * 查询待我审批的条数
     */
    // queryWaitForApprovalNum() {
    //     return this.http.get(environment_java.server + "borrow/borrow-amount/wait-me", null).toPromise()
    //         .then(res => res.json().item as number);
    // }
    /**
     * 导出
     */

     isIE(){
      let  uA = window.navigator.userAgent;
      let isIE = /msie\s|trident\/|edge\//i.test(uA) && !!("uniqueID" in document || "documentMode" in document || ("ActiveXObject" in window) || "MSInputMethodContext" in window);
      return isIE;
  }
    export(expParam: QueryPo) {
        this.http.post(environment_java.server + "borrow/borrow-amount/export", expParam, {
            responseType: 3
        }).pipe(
            map(res => res.json()))
            .subscribe(data => {
                var blob = new Blob([data], { type: "application/vnd.ms-excel" });
                if(this.isIE()){
                    window.navigator.msSaveBlob(blob, "borrowAmount.xls");
                }else{
               var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.setAttribute('style', 'display:none');
                    a.setAttribute('href', objectUrl);
                    a.setAttribute('download', '借用转销售列表');
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
    /**
     * 获取本部下面的事业部列表
     * @param bbmc 本部名称
     */
    getSybList(bbmc:string){
        return this.http.get(environment_java.server + "borrow/dept-relation/"+bbmc+"/dept-names",null).toPromise().then(res=>res.json());
    }
}