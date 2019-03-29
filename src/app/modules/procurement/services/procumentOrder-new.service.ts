import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
declare var $: any;
import { WindowService } from 'app/core';

export class Query { 
  public SortName: string;  //排序字段 默认addtime
  public SortType: string;     //升降序   默认desc （o或"desc" 降序  1或"asc" 升序）
  public TrackingNumber: string; //需求跟踪号
  public Vendor: string;         //供应商
  public ProjectName: string;    //项目名称
  public CustomerName: string;   //客户名称
  public PageIndex: string;         //默认1
  public PageSize: string;       //默认10
  public PO:string;//PO号
}
export class Rank {//可排序对象:none-表示不排序;desc-表示降序;asc-表示升序
  requisitionnum="none";  //申请单号
  ProjectName="none"; //项目名称
  vendor="none"; //供应商
  factory="none"; //工厂
  BuyerName="none"; //客户名称
  MainContractCode="none"; //合同号
  excludetaxmoney="none"; //采购申请金额
  available="none"; //可采购订单金额
}

@Injectable()
export class ProcumentOrderNewService {

  constructor(private http: Http,
    private WindowService: WindowService) { }

  //获取采购申请列表
  getApplyList(query) {
    console.log(query);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(query);
    return this.http.post("api/PurchaseManage/MyRequisitionSaleContract",body, options)
      .toPromise()
      .then(response =>response.json().Data)
  }
  //预下-无合同-提交采购订单-时获取该采购申请的信息
  getPrepareApplyNoContractMes(id) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let arr=[];
    return this.http.get("api/PurchaseManage/GetPurchaseRequisition4QuickOrder/"+id, options)
      .toPromise()
      .then(response =>{
        arr.push(response.json().Data);
        return arr;
      })
  }

  //判断 订单类型
  judgeProcumentOrderType(supplierType,VendorNo,untaxAmount,VendorTrace){
    /*
    supplierType:供应商类型
    VendorNo:供应商代码
    untaxAmount:未税总金额
    VendorTrace:供应商追踪 -1 超期 0无效 1有效
    */
    
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let vendorClass;//供应商类型 
    switch(supplierType){
      case "核心":
        vendorClass=0;
        break;
      case "非核心":
        vendorClass=1;
        break;
      case "新产品":
        vendorClass=2;
        break;
    }
    if(VendorTrace==null){
      VendorTrace=0;
    }
    let url="api/PurchaseManage/GetPruchaseOrderTypeNew/"+vendorClass+"/"+VendorNo+"/"+untaxAmount+"/"+VendorTrace;
    console.log(url)
    return this.http.get(url, options)
    .toPromise()
    .then(response =>{
      let res=response.json();
      if(res.Result){
        console.log("订单类型："+res.Data);
        return res.Data;
      }else{
        this.WindowService.alert({message:res.Data,type:"fail"});
        return false;
      }
    })
  }
}