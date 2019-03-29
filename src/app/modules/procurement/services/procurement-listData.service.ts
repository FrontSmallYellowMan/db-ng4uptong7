import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http,Headers,URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export class ApplyMyapplyQuery {//采购申请-我的申请-搜索
    TrackingNumber: string;  //需求跟踪号-精确
    ApplicantOrderNumber: string; // 申请单号-精确
    IsModify=null; //申请是否修改，null 全部，true 修改过，false 没有修改
    PurchaseRequisitionType: string;//采购申请类型（比如：合同单采购、预下单采购、备货单采购）
    Vendor: string; //供应商名称-模糊
    PO:string;//厂商PO号
    ProjectName:string;//项目名称
    MainContractCode: string; //销售合同号
    BeginTime: string;   //申请日期start
    EndTime: string;  //申请日期end
    WfStatus:string="审批";//申请类型
    SortName:string; //排序字段
    SortType:string; //desc降序  asc升序
    PageIndex: number;
    PageSize: number;

}
export class ApplyMyapplyRank {//采购申请-我的申请-排序
    //可排序对象:none-表示不排序;desc-表示降序;asc-表示升序
  requisitionnum="none";//申请单号
  addtime="desc";//申请日期
}
export class OrderMyapplyQuery {//采购订单-我的申请-搜索
    TrackingNumber: string;  //需求跟踪号-精确
    ApplicantOrderNumber: string; // 申请单号-精确
    OrderNumber: string; //采购订单号-精确
    OrderType: string;//采购申请类型（比如：合同单采购、预下单采购、备货单采购）
    Vendor: string; //供应商名称-模糊
    MainContractCode: string; //销售合同号
    BeginTime: string;   //申请日期start
    EndTime: string;  //申请日期end
    PageIndex: number;
    PageSize: number
    WfStatus:string="审批";//申请类型
    PO:string;//厂商PO号
}
export class OrderMyapprovalQuery {//采购订单-我的审批-搜索
    PageNo: number; //*页码*/
    PageSize: number; //*页大小*/
    BBMC: string;//*本部名称*/
    SYBMC: string;//*事业部名称*/
    User: string;//*ITocde或者用户名称*/
    OrderType: string;//*NB*/
    Vendor: string;//*供应商*/
    TraceNo: string;//*需求跟踪号*/
    OrderNum: string;//*申请单号*/
    ERPOrderNumber: string;//*采购订单号*/
    StartAddTime: string;//*申请开始时间*/
    EndAddTime: string;//*申请结束时间*/
    TaskStatus: number=0;//*0：待我审批，1：我已审批，2：全部*/
    PO:string;//厂商PO号
}
export class SelectData {//Select下拉框结构
      constructor(
        public id = "0",
        public text = ''
      ) { }
}
@Injectable()
export class ProcurementListDataService {

    constructor(private http: Http) { }
    searchApplyMyapplyData(searchData: any) {//采购申请-我的申请列表-搜索
        console.log(searchData);
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(environment.server + "PurchaseManage/MyRequisitionList", searchData,options)
            .toPromise()
            .then(response => response.json())
    }
    deleteApplyMyapplyData(id: any) {//采购申请-我的申请列表-草稿和驳回列表-删除
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(environment.server + "PurchaseManage/DeletePurchaseRequisition/"+id,options)
            .toPromise()
            .then(response => {
                return response.json();
            })
    }
    searchOrderMyapplyData(searchData: any) {//采购订单-我的申请列表-搜索
        console.log(searchData);
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(environment.server + "PurchaseManage/MyOrderList", searchData,options)
            .toPromise()
            .then(response => response.json())
    }
    deleteOrderMyapplyData(id: any) {//采购订单-我的申请列表-草稿和驳回列表-删除
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(environment.server + "PurchaseManage/DeletePruchaseOrder/"+id,options)
            .toPromise()
            .then(response => {
                return response.json();
            })
    }
    searchOrderMyapprovalData(searchData: any) {//采购订单-我的审批列表-搜索
        console.log(searchData);
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(environment.server + "PurchaseManage/GetPurchaseOrderTaskList", searchData,options)
            .toPromise()
            .then(response => response.json())
    }
    getDepartmentPlatform() {//采购订单-我的审批列表-搜索-获取本部事业部
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(environment.server + "S_Contract/GetDepartmentPlatform",options)
            .toPromise()
            .then(response => response.json())
    }
}
