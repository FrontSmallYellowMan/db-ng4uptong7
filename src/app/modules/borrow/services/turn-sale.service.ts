import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { UnclearMaterialItem } from './../components/common/borrow-entitys';
import { BorrowTurnSalesPo, BorrowTurnSales } from './../components/turn-sale';
import { environment_java } from "./../../../../environments/environment";
@Injectable()
export class TurnSaleService {
    constructor(private http: Http) { }
    /**
     * 保存草稿
     * @param apply 借用转销售申请单
     * @param unclearMaterialItemList 未清物料列表
     */
    saveDraft(apply: BorrowTurnSales, unclearMaterialItemList: UnclearMaterialItem[]) {
        let po: BorrowTurnSalesPo = new BorrowTurnSalesPo();
        po.borrowTurnSales = apply;
        po.turnSalesMaterialItemList = unclearMaterialItemList;
        if (apply.turnSalesId) {
            return this.http.put(environment_java.server + "borrow/turn-sales/" + apply.turnSalesId, po).toPromise()
                .then(res => res.json());
        } else {
            return this.http.post(environment_java.server + "borrow/turn-sales", po).toPromise()
                .then(res => res.json());
        }
    }
    /**
     * 新建提交或者草稿提交
     * @param apply 
     * @param unclearMaterialItemList 
     */
    submitForm(apply: BorrowTurnSales, unclearMaterialItemList: UnclearMaterialItem[]) {
        let po: BorrowTurnSalesPo = new BorrowTurnSalesPo();
        po.borrowTurnSales = apply;
        po.turnSalesMaterialItemList = unclearMaterialItemList;
        if (apply.turnSalesId) {
            return this.http.put(environment_java.server + "borrow/turn-sales/submit/" + apply.turnSalesId, po).toPromise()
                .then(res => res.json());
        } else {
            return this.http.put(environment_java.server + "borrow/turn-sales/submit-unsave", po).toPromise()
                .then(res => res.json());
        }
    }
    /**
     * 查询转销售列表
     * @param params
     * @param applyFlag 1-我的申请 2-我的审批
     */
    queryTurnSaleList(params: URLSearchParams, applyFlag: string) {
        if (applyFlag === "1") {
            return this.http.get(environment_java.server + "borrow/turn-sales", { search: params }).toPromise()
                .then(res => res.json());
        } else {
            return this.http.get(environment_java.server + "borrow/turn-sales/my-approval", { search: params }).toPromise()
                .then(res => res.json());
        }

    }
    /**
     * 查询申请单详细
     * @param applyId 
     */
    queryApplyDetail(applyId: string) {
        return this.http.get(environment_java.server + "borrow/turn-sales/" + applyId).toPromise()
            .then(res => res.json());
    }
    /**
     * 提交草稿
     * @param apply 
     * @param unclearMaterialItemList 
     */
    // submitDraft(apply:BorrowTurnSales, unclearMaterialItemList: UnclearMaterialItem[]){
    //     let po:BorrowTurnSalesPo = new BorrowTurnSalesPo();
    //     po.borrowTurnSales = apply;
    //     po.turnSalesMaterialItemList = unclearMaterialItemList;
    //     console.log(environment_java.server);
    //     return this.http.put(environment_java.server + "borrow/turn-sales/submit/"+apply.turnSalesId,po).toPromise()
    //         .then(res=>res.json());
    // }
    /**
     * 查询待我审批的条数
     */
    queryWaitForApprovalNum() {
        return this.http.get(environment_java.server + "borrow/turn-sales/wait-me", null).toPromise()
            .then(res => res.json().item as number);
    }
    queryReservation(reservationNo: string) {
        let applyItCode: string = '';
        return this.http.get(environment_java.server + "borrow/unclear-material/" + reservationNo, { params: { applyItCode } }).toPromise()
            .then(res => res.json());
    }
    deleteApply(turnSalesId: string) {
        return this.http.delete(environment_java.server + "borrow/turn-sales/" + turnSalesId).toPromise().then(res => res.json());
    }
}