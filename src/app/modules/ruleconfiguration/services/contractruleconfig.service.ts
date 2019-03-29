import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from "../../../shared/services/db.http.server";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";

const contractRuleListUrl="S_Contract/GetRoleConfigList";
const setContractRuleStatusUrl="S_Contract/SetSaleContractRoleStatus";
const deleteContractRuleUrl="S_Contract/DeleteSaleContractRoleConfig";
const getContractRuleConfigUrl="S_Contract/GetSaleContractRoleConfig";
const saveSaleContractRoleConfigUrl="S_Contract/SaveSaleContractRoleConfig";
const getCurrentUserInfoUrl="base/GetCurrentUserInfo";
const getApproverInfoUrl="S_Contract/GetApproverInfo";
const getFieldConfigListUrl="AuthorityManagement/GetFieldConfigList/";
// export const ProductTypeData=[{text:"数通",value:"01",ischecked:false},{text:"安全",value:"02",ischecked:false},{text:"传输",value:"03",ischecked:false},{text:"接入",value:"04",ischecked:false},{text:"存储",value:"05",ischecked:false},{text:"智真",value:"06",ischecked:false},{text:"视频监控",value:"07",ischecked:false},{text:"elte",value:"08",ischecked:false},{text:"服务器",value:"09",ischecked:false},{text:"云计算",value:"10",ischecked:false},{text:"UPS",value:"11",ischecked:false},{text:"esigh",value:"12",ischecked:false},{text:"服务",value:"13",ischecked:false},{text:"其他",value:"14",ischecked:false}];
// export const ChooseYOrN=[{text:"是",value:"1"},{text:"否",value:"0"}];

export class QuerySYBMCData{
  pageSize:number=10;
  pageNo:number=1;
  querycontent:string='';
  BBMC: string = '';//本部
  SYBMC: string = '';// 事业部
  
}



@Injectable()
export class ContractRuleConfigService {
  constructor(private http: HttpServer,
  private https:Http) { }

  //获取事业部接口
getSYBMCDataAPI(API,querySYBMCData){
 return this.https.post(environment.server+API,querySYBMCData).toPromise().then(Response=>Response.json())
 }
headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
options = new RequestOptions({ headers: this.headers });
getContractRuleList(params: any):Observable<any> {
   return this.http.post(contractRuleListUrl, params, this.options);     
 }
setContractRuleStatus(params:any):Observable<any>{
  return this.http.post(setContractRuleStatusUrl,params,this.options); 
 }
deleteContractRule(parmas:any):Observable<any>{
  return this.http.post(deleteContractRuleUrl,parmas,this.options);
 }
 getContractRuleInfo(parmas:any):Observable<any>{
  return this.http.post(getContractRuleConfigUrl,parmas,this.options);
 }
 saveContractRuleConfig(params:any):Observable<any>{
   return this.http.post(saveSaleContractRoleConfigUrl,params,this.options);
 }
 getCurrentUserInfo():Observable<any>{
   return this.http.get(getCurrentUserInfoUrl,this.options);
 }
 getApproverInfo(parmas:any):Observable<any>{
   return this.http.post(getApproverInfoUrl,parmas,this.options);
 }
 getFieldConfigList(parmas:any):Observable<any>{
   return this.http.post(getFieldConfigListUrl+parmas,{},this.options)
 }
}
export class Query{
  BusinessCode:string="";
  RoleName:string="";
  BusinessType:string=""
  CurrentPage:string="";
  PageSize:string="";
}
export class ContractRuleConfigInfo{
  RoleName:string="";
  CreateTime:any;
  RoleID:number;
  GZMC:string;
  RoleStatus:boolean;
}
export class CompanyInfo{
  CompanyCode:string="";
  CompanyName:string="";
  checked:any;
}
export class CompanyQuery{
  CompanySearch:string="";
  CurrentPage:string;
  PageSize:string;
}
export class BusinessUnitInfo{
  BBMC:string="";
  SYBMC:string="";
  checked:boolean;
}
export class ContractRuleConfigForm{
  WFConfigList:WFConfigInfo[]=[];
  SC_FieldData:SC_FieldData=new SC_FieldData();
  CompanyCodeList:string[]=[];
  YWFWDMList:string[]=[];
  BaseRole:BaseRoleInfo=new BaseRoleInfo();
  FieldMsgInfo:FieldMsgInfo[]=[]
}
export class WFConfigInfo{
   ID:string;
   WFCategory:string;
   TemplateID:string;
   NodeID:number;
   NodeName:string;
   IsOpened:number=0;
   UserSettings:any;
   ApproverList:any;
   NodeAttribute:string;
   Sort:string;
   RuleExpressionJSON:any;
   IfRequired:number=-1;
}
export class ApproverInfo{
  ITCode:string;
  UserName:string;
}
export class SC_FieldData{
  RoleID:string;
  BusinessID:string;
  BusinessType:string;
  FieldMsg:string;
}
export class SC_FieldDataInput{
  RoleID:string;
  BusinessID:string;
  BusinessType:string;
  FieldMsg:FieldMsgInfo[]=[];
}
export class FieldMsgInfo{
  FieldName:string;
  FieldShowName:string;
  FieldValue:any;
  FieldShowType:string;
  Data:any;
  IfRequired:any;
  MaxLength:string;
  Rex:string;
  ErrorMsg:string;
  FillingShow:string;
  IsShowField:boolean;
}
export class DataInfo{
  text:string;
  value:string;
  ischecked:boolean;
}
export class BaseRoleInfo{
  RoleID:string;
  RoleName:string;
  BusinessType:string;
  Creater:string;
  CreaterItcode:string;
  Createtime:any;
  UpdatePerson:string;
  UpdateItcode:string;
  UpdateTime:any;
  RoleStatus:boolean;
}
export class ApproverList{
  ApprovalName:string;
  ListApprover:ApproverInfo[]=[];
}
export class ApproverStr{
  ApprovalName:string;
  ApproverITCodes:string;
}
export class ApproverOut{
  ApprovalArray:ApproverStr[]=[];
}

//销售合同审批人序列
export const ContractApproveNodes=[
  {
    "NodeID": 3,
    "NodeName": "一级预审",
    "NodeAttribute":"Editable",
    "Sort":"25",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([一级预审])',TrueValue:'需要一级预审',FalseValue:'不需要一级预审'}",
    "ApproverList": [],
    "IfRequired": 1,
    "IsOpened":1,
    "ApproverShow":[]
},
{
    "NodeID": 4,
    "NodeName": "二级预审",
    "NodeAttribute":"Editable",
    "Sort":"50",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([二级预审])',TrueValue:'需要二级预审',FalseValue:'不需要二级预审'}",
    "ApproverList": [],
    "IfRequired": -1,
    "IsOpened":0,
    "ApproverShow":[]
    
},
{
    "NodeID": 5,
    "NodeName": "三级预审",
    "NodeAttribute":"Editable",
    "Sort":"75",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([三级预审])',TrueValue:'需要三级预审',FalseValue:'不需要三级预审'}",
    "ApproverList": [],
    "IfRequired": -1,
    "IsOpened":0,
    "ApproverShow":[]

},
{
    "NodeID": 6,
    "NodeName": "四级预审",
    "NodeAttribute":"Editable",
    "Sort":"100",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([四级预审])',TrueValue:'需要四级预审',FalseValue:'不需要四级预审'}",
    "ApproverList": [],
    "IfRequired": -1,
    "IsOpened":0,
    "ApproverShow":[]
},
{
    "NodeID": 9,
    "NodeName": "事业部终审",
    "NodeAttribute":"Editable",
    "Sort":"175",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([事业部终审])',TrueValue:'需要事业部终审',FalseValue:'不需要事业部终审'}",
    "ApproverList": [],
    "IfRequired": 1,
    "IsOpened":1,
    "ApproverShow":[]
},
{
    "NodeID": 10,
    "NodeName": "一级加签",
    "NodeAttribute":"Editable",
    "Sort":"200",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([一级加签])',TrueValue:'需要一级加签',FalseValue:'不需要一级加签'}",
    "ApproverList": [],
    "IfRequired": -1,
    "IsOpened":0,
    "ApproverShow":[]
},
{
    "NodeID": 11,
    "NodeName": "二级加签",
    "NodeAttribute":"Editable",
    "Sort":"225",
    "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([二级加签])',TrueValue:'需要二级加签',FalseValue:'不需要二级加签'}",
    "ApproverList": [],
    "IfRequired": -1,
    "IsOpened":0,
    "ApproverShow":[]
},
{
  "NodeID": 12,
  "NodeName": "三级加签",
  "NodeAttribute":"Editable",
  "Sort":"250",
  "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([三级加签])',TrueValue:'需要三级加签',FalseValue:'不需要三级加签'}",
  "ApproverList": [],
  "IfRequired": -1,
  "IsOpened":0,
  "ApproverShow":[]
},
{
  "NodeID": 17,
  "NodeName": "四级加签",
  "NodeAttribute":"Editable",
  "Sort":"265",
  "RuleExpressionJSON":"{Expression:'!string.IsNullOrEmpty([四级加签])',TrueValue:'需要四级加签',FalseValue:'不需要四级加签'}",
  "ApproverList": [],
  "IfRequired": -1,
  "IsOpened":0,
  "ApproverShow":[]
}
]