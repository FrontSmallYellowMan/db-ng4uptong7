import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
declare var $: any;

export class Query { 
  public SalesITCode: string;//销售员ITCode
  public BuyerName: string;//客户名称
  public StartContractMoney: string;//合同金额
  public EndContractMoney: string;//合同金额2
  public ProjectName: string;//项目名称
  public PO:string;//厂商PO号
  public StartAddTime: string;//开始时间
  public EndAddTime: string;//结束时间
  public PurchaseType: string="HT";//合同类型：HT 合同采购；YX 预下采购；"" 全部
  public pagesize: number=10;
  public currentpage: number=1;//当前页
  public SortField: string;//排序字段
  public SortRule: string;//排序规则
}
export class Rank {//可排序对象:none-表示不排序;desc-表示降序;asc-表示升序
  MainContractCode="none";//合同编号
  ProjectName="none";//项目名称
  BuyerName="none";//客户名称
  SalesName="none";//销售员
  ContractMoney="none";//合同金额
  PurchaseTaxMoney="none";//合同累计采购含税金额
  SC_Status="none";//状态
  remnantmoney="none"//剩余金额
  SubmitTime= "desc";//申请日期
}

@Injectable()
export class ContractListService {

  constructor(private http: Http) { }

  //获取合同列表
  getContractList(query: Query) {
    console.log(query);
    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers:headers });
    let body = JSON.stringify(query);
    return this.http.post("api/PurchaseManage/SaleContractPageData",body,options)
      .toPromise()
      .then(response => JSON.parse(response.json().Data))
  }
}