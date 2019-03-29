import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from "../../../../environments/environment";

//查询列表
export class Query{
  PageIndex:string='1';
  PageSize:string='10';
}

//提交物料列表
export class SubmitData{
  PriceChangeList:any=[new MaterialListData()];
}

let summation:number=0;

//物料列表项
export class MaterialListData{
  ID:number;//主键Id
  RecordID:string;//申请编号
  MaterialCode:string;//物料代码
  Factory:string;//工厂
  Batch:string;//批次
  MovingAveragePrice:string;//移动平均价
  ErrorMessage:string;//失败原因
  ERPMessageL:string;//ERP信息
  Status:number;//修改状态（0：成功；1：失败）
  signId:number=0;//id标识
  constructor(){
  this.signId=summation++;
  }
}

@Injectable()
export class BatchMaterialPriceListService {

  constructor(
    private http:Http
  ) { }

  //提交修改物料移动平均价API
  submitData(materialList){
    return this.http.post(environment.server+'MaterialModify/SubmitMovingAveragePriceChange',materialList).toPromise().then(Response=>Response.json());
  }

  //获取详情API
  getDetailAPI(ID){
    return this.http.post(environment.server+'MaterialModify/GetMovingAveragePriceChangeDetails',{'RecordID':ID}).toPromise().then(Response=>Response.json());
  }

  //获得物料列表
  getMaterialList(Query){
    return this.http.post(environment.server+'MaterialModify/GetMovingAveragePriceChangeList',Query).toPromise().then(Response=>Response.json());
  }

  
}