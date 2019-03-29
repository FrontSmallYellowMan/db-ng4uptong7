import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Response } from "@angular/http";
import { environment } from "../../../../environments/environment";

//获取审批人请求参数
export class GetApproverQueryData{
  queryStr: string='';// 查询参数
  pageSize: any = 10;// 每页几条数据
  pageNo: any = 1; // 页码
}

//选人模态窗传递的参数
export class ShowModelData {
  APIAddress:string='';// 接口地址
  compontentTitle: string = ''; // 要显示的组件名
  valueList:any= [];// 组件上绑定的值
}

@Injectable()
export class RuleConfigurationSelectPopModelService {

  constructor(
    private http:Http
  ) { }

  //查询人员接口
  getApproverList(api,queryData) {
    return this.http.post(environment.server+api, queryData).toPromise().then(Response => Response.json());
  }

}