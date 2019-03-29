import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Router } from "@angular/router";
import { WindowService } from 'app/core';
import { SubmitMessageService } from './submit-message.service';
import { Observable } from "rxjs";

export const getBuyerInfoUrl = "E_Contract/GetBuyerInfo/";//获取买方列表
export const getERPCompanyInfoUrl = "E_Contract/GetERPCompanyInfo/";//获取买方信息

//获取销售合同中规则配置的自定义表单项
export class GetRoleFieldConfigQueryData{
    BusinessCode:string;//业务范围代码
    BusinessType:string = "SalesContract";//类型，销售合同
  }

@Injectable()
export class ShareDataService {

    constructor(private dbHttp: HttpServer,
         private router: Router,
         private WindowService: WindowService,
         private submitMessageService: SubmitMessageService,
         private https:Http) { }

   repJson(observable: Observable<Response>):Observable<any> {
            return observable.filter(res => res["_body"].length > 0).map(res => res.json());
        }

    getPlatformSelectInfo() {//获取ngSelect格式的 平台列表数据
        return this.dbHttp.post("base/basedata/GetPlatform")
        .toPromise()
        .then(response => 
            this.submitMessageService.onTransSelectInfosOther(JSON.parse(response.Data), "platformcode", "platform")
        )
    }
    getCurrencySelectInfo() {//获取ngSelect格式的 币种列表数据
        return this.dbHttp.post("InitData/GetCurrencyInfo")
        .toPromise()
        .then(response => 
            this.submitMessageService.onTransSelectInfosOther(JSON.parse(response.Data),"currencycode", "currencyname")
        )
    }
    getTaxrateSelectInfo() {//获取ngSelect格式的 税率列表数据
        return this.dbHttp.post("InitData/GetTaxrateInfo")
        .toPromise()
        .then(response => {
                let body={
                    "all":[],
                    "domestic":[], //国内税率
                    "abroad":[] //国外税率
                } 
                body.all=this.submitMessageService.onTransSelectInfos(JSON.parse(response.Data), "taxcode", "taxratename", "taxrate");
                for(let i=0,len=body.all.length;i<len;i++){
                    if(body.all[i]["id"]=="J0"){
                        body.abroad.push(body.all[i]);
                    }else{//去除J0 剩余的都是国内的税率选项
                        body.domestic.push(body.all[i]);
                    }
                }
                return body;
            }
        )
    }
    getDeliverySelectInfo() {//获取ngSelect格式的 交货条件和收货人 
        return this.dbHttp.get("InitData/GetDeliveryInfo")
        .toPromise()
        .then(response => {
            let body={
                "condition":
                this.selectInfoTextTransF(this.submitMessageService.onTransSelectInfosOther(response.Data.DeliveryCondition,"DeliveryConditionNo", "DeliveryConditionName")),
                "location":
                this.submitMessageService.onTransSelectInfosOther(response.Data.DeliveryLocation,"ID", "Location"),
                "people":
                this.selectInfoTextTransF(this.submitMessageService.onTransSelectInfosOther(response.Data.DeliveryPeople,"DeliveryPeopleNo", "DeliveryPeopleName"))
            };
            return body;
        })
    }
    getCurrentUserInfo() {//获取登录人信息
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        return this.dbHttp.get("base/GetCurrentUserInfo", options)
        .toPromise()
        .then(response => 
            JSON.parse(response.Data)
        )
    }
    selectInfoTextTransF(list){//获取ngSelect格式数据 text拼接为 id+text
        for(let i=0,len=list.length;i<len;i++){
            list[i]["text"]=list[i]["id"]+" "+list[i]["text"];
        }
        return list;
    }

    //获取客户超期欠款和应收账款
    getCustomAmountAndCustomAmountOver(CustomerERPCode){
      return this.https.post(environment.server+'SaleOrder/GetCustomerUnClerTotalInfo',{'CustomerERPCode':CustomerERPCode}).toPromise().then(Response=>Response.json())
    }

    /**
     * 获取买方信息
     */
    getBuyerInfoByName(buyerName): Observable<any> {
        return this.repJson(this.https.post(environment.server + getBuyerInfoUrl + buyerName, null));
    }

    /**
     * 获取买方信息
     */
    getBuyerInfoByErpCode(erpCode): Observable<any> {
        return this.repJson(this.https.post(environment.server + getERPCompanyInfoUrl + erpCode, null));
    }

     //获取销售合同规则中配置的自定义表单项
     getRoleFieldConfig(queryData){
        return this.https.post(environment.server+'BaseData/GetRoleFieldConfig',queryData).toPromise().then(Response=>Response.json());
    }

    getApproverSelectInfo(approverList:any,id,text){
       return this.submitMessageService.onTransSelectInfosOther(approverList,id,text );
    }

}