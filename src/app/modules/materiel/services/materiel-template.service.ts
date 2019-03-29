import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions,Headers} from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()

export class ReqData {
  "MaterialRecordID":string//主键，有值为编辑状态，没值为查看状态
  "ApplyType":number;//判断保存类型，是一般物料还是返款服务
  "checked":boolean;//是否点击
  "ApplyName":string;//申请人
  "ApplyItCode":string;//ItCode
  "ApplyTime":string;//申请时间
  "TemplateID":string="";//模版id
  "TemplateName": string;//模版名称
 "CurrentUser":string="a11";//当前登陆人
  "Factory": string;//工厂
  "FactoryName":string;//工厂名称  
  "SupplierCodeSAP": string;//供应商sap编号
  "SupplierName": string;//供应商sap编号名称
  "MaterialType": string;//物料类型
  "SerialNumParameter": string;//序列号参数
  "SerialNumParameterName":string;//序列号参数名称
  "MaterialGroup": string;//物料组
  "MaterialGroupName":string;//物料组名称
  "TaxTypeID": string;//税收分类
  "Brand": string;//品牌
  "BrandName ":string;//品牌名称
  "BaseUnitOfMeasure": string;//基本计量单位
  "ProductLevel": string//产品层次
  "MaterialTypeName":string;//物料类型名称
  "AvailabilityChecking":string;//可用性检查
  "AvailabilityCheckingName":string;//可用性名称
  "MaterialDescription":string;//物料描述（中文）
  "MaterialDescriptionEN":string;//物料描述（英文）
  "MovingAveragePrice":any;//移动平均价
  "StandardCostMC":any;//标准成本价澳元
  "StandardCostHK":any;//标准成本价港币
  "TaxClassifications":string;//税分类
  "TaxClassificationsName":string;//税分类名称
  "SubjectSettingGroup":string;//科目设置组
  "ContractCode":string;//合同编号
  "IsBatchManage":any;//批量管理(0:取消 1:选中)
  "BISMT":any;//旧物料号
  "PO":string;//PO号
  "Specifications":string;//规格型号
  "InfoStatus":number;//区分是否生成物料编号（0：不生成，1：生成）
  "SupplyMaterialNumber":string;//
  "MaterialERPCode":string;//物料ERP编号
  "TaxTypeName":string;//税收类型名称
  "BaseUnitOfMeasureName":string;//基本计量单位名称
  "BrandName":string;
  "SubjectSettingGroupName":string;//科目设置组名称
  "ProductLevelName":string;//产品层次名称
}

export class ReqSearchData{
  Keyword: string;
  CurrentUser: string = "";
  PageNo: string;
  PageSize: string;
}

export class ReqSeeTemplate{
TemplateID:string;
}

export class ReqDelTemplate{
  TemplateID:string
}

@Injectable()
export class MaterielTemplateService {

  constructor(private http: Http){}

//保存物料申请模版
  saveTemplate(applyTemplate: any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "/material/template/repository", applyTemplate,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //查询物料申请模板
  searchTemplate(searchTemplateList:any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
     return this.http.post(environment.server+"/material/template/list",searchTemplateList,options)
       .toPromise()
       .then(response => response.json());

  }

  //查看模版
  seeTemplate(templateId:any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server+"/material/template/detail",templateId,options)
       .toPromise()
       .then(response => response.json());

  }

  //删除模板
  deleteTemplate(templateId:any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server+"/material/template/del",templateId,options)
       .toPromise()
       .then(response => response.json());

  }


}
