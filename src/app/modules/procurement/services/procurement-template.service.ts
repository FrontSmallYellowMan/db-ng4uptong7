import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http,Headers,URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export class ProcurementTplObj {//新建模板主体
    public ID=null;        //主键
    public SYB: string=""; //事业部
    public Name: string="";   // 模板名称
    public CompanyCode: string="";     // 公司代码
    public CompanyName: string="";      // 公司名称
    public Vendor: string="";         // 供应商名称
    public VendorNo: string="";     // 供应商代码
    public RateCode: string="";     // 税率在ERP中的标识
    public RateName: string="";     // 税率显示名称
    public RateValue: number=0;        // 税率值
    public Currency: string="";          // 币种名称
    public CurrencyCode: string="";          // 币种代码    
    public VendorCountry: string="0";          // 供应商类别（0:国内、1:国外）  
    public FactoryCode: string="";      // 工厂编号
    public PaymentTermscode: string="";      // 付款条件 长度4
}
export class Query {//搜索列表条件
    public SYB: string;  // 我是事业部名称
    public PageIndex: number;    
    public PageSize: number;
}
@Injectable()
export class ProcurementTemplateService {

    constructor(private http: Http) { }
    headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    options = new RequestOptions({ headers: this.headers });
    editProcurementTpl(obj: any) {//新增、编辑采购模板
        console.log(obj);
        console.log(JSON.stringify(obj));
        return this.http.post(environment.server + "PurchaseManage/SaveTemplate",obj,this.options)
            .toPromise()
            .then(response => response.json())
    }
    getProcurementTplOne(id:any) {//获取一个采购模板
        return this.http.get(environment.server + "PurchaseManage/GetTemplate/"+id,this.options)
            .toPromise()
            .then(response => response.json())
    }
    getProcurementTplList(query: Query) {//获取采购模板列表
        console.log(query);
        return this.http.post(environment.server + "PurchaseManage/GetMyTemplate",query,this.options)
            .toPromise()
            .then(response => response.json())
    }
    delProcurementTplList(id: any) {//删除采购模板
        return this.http.get(environment.server + "PurchaseManage/DeleteTemplate/"+id,this.options)
            .toPromise()
            .then(response => response.json())
    }

    //验证模板名称
    testTemplateName(templateName){
      return this.http.get(environment.server + "PurchaseManage/CheckTemplate/"+templateName)
      .toPromise()
      .then(response => response.json())
    }

}
