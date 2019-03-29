import { Injectable } from '@angular/core';
import { Http, ResponseContentType, Response } from "@angular/http";
import { environment } from "../../../../environments/environment";
import { environment_crm } from '../../../../environments/environment.prod';

//采购申请规则配置整体参数
export class PurchaseApplicationData{
  baseRole:any=new BaseRole();//基本信息
  productLines:Array<ProductLinesData>=[];//事业部列表
  ruleDetial:any=new RuleDetial();//采购规则详情内容
  workFlowNodes:any=WorkFlowNodes;//采购申请审批人序列
}

//基本信息
export class BaseRole{
  RoleID:number=0;//主键ID
  RoleName:string;//采购申请规则名称
  Creater:string;//规则创建人
  CreaterItcode:string;//规则创建人Itcode
  Createtime:string;//规则创建日期
  BusinessType:'PurchaseRequisition';//规则类型
}

//事业部列表
export class ProductLinesData{
  RoleID:number=0;//主键ID
  BusinessCode:string;//事业部代码
}

//采购规则详情内容
export class RuleDetial{
  Id:number=0;//标识Id
  CompanyCode:string;//采购主体
  VendorCode:string;//供应商代码
  Vendor:string;//供应商名称
  VendorClass:string;//供应商类型
  PurchaseType:string;//申请单类型
  AmountRelate:any=0;//授权额度限制：0-无关，1-有关
  StartAmountLimit:any=1;//起始授权金额控制：0-不包含，1-包含
  StartAmount:any;//起始授权额度
  EndAmountLimit:any=1;//终止授权金额控制：0-不包含，1-包含
  EndAmount:any;//终止授权额度
  StandardRevolveDays:any;//标准周转天数
  RevolveDaysLimit:any=99;/*周转天数限制 0-等于，1-大于，2-大于等于，-1-小于，-2小于等于，-3-无关，99请选择*/
  BaseRole_RoleID:string;//标识主键ID
  AddTime:string;//添加时间
  BBMC:string; // 保存本部
}

//采购申请审批人序列
export const WorkFlowNodes=[
  {
    "NodeID": 3,
    "NodeName": "一级预审",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 4,
    "NodeName": "二级预审",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 5,
    "NodeName": "三级预审",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0

},
{
    "NodeID": 6,
    "NodeName": "四级预审",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 7,
    "NodeName": "事业部产品",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 8,
    "NodeName": "事业部运控",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 9,
    "NodeName": "事业部总经理",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 10,
    "NodeName": "本部运控",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 11,
    "NodeName": "本部长",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 19,
    "NodeName": "一级加签",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 20,
    "NodeName": "二级加签",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 12,
    "NodeName": "DCG风险",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 21,
    "NodeName": "三级加签",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 22,
    "NodeName": "四级加签",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":true,
    "IsOpened":0
},
{
    "NodeID": 13,
    "NodeName": "DCG采购经理",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":false,
    "IsOpened":0
},
{
    "NodeID": 14,
    "NodeName": "海外采购经理",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":false,
    "IsOpened":0
},
{
    "NodeID": 18,
    "NodeName": "合同用印",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":false,
    "IsOpened":0
},
{
    "NodeID": 15,
    "NodeName": "DCG采购员",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[
        {'ITCode':'ERSS','UserName':'耳杉杉'},
        {'ITCode':'PANGJQ','UserName':'庞嘉琦'},
        {'ITCode':'TIANYINGA','UserName':'田颖'},
        {'ITCode':'WUJQ','UserName':'吴京青'},
        {'ITCode':'YEXS','UserName':'叶晓松'},
        {'ITCode':'ZHANGXYX','UserName':'张筱雲'},],
    "isShow":true,
    "IsOpened":0,
},
{
    "NodeID": 16,
    "NodeName": "海外采购员",
    "ApproverList": [],
    "RoleID": 21,
    "IfRequired": -1,
    "valueList":[],
    "isShow":false,
    "IsOpened":0
}
];

export class Query{
  PageSize:number=10;
  CurrentPage:number=1;
  BusinessType:string="PurchaseRequisition";//规则类型
  RoleName:string="";//规则名称
  BusinessCode:string="";//事业部
  BBMC:string="";// 本部
}

export class RuleState{
    RoleID:number;//主键ID
    RoleStatus:number;//1 规则状态(0停用、1启用)
}


export const ApprovalPersonList=[
  {name:'一级审批人',checked:true,valueList:['weihfa','liusta','erss']},
  {name:'二级审批人',checked:true,valueList:['lichengg']},
  {name:'三级审批人',checked:true,valueList:['erss']},
  {name:'四级审批人',checked:false,valueList:[]},
  {name:'事业部产品经理',checked:false,valueList:[]},
  {name:'事业部总经理',checked:false,valueList:[]},
  {name:'本部运控',checked:false,valueList:[]},
  {name:'本部总经理',checked:false,valueList:[]},
  {name:'一级加签',checked:false,valueList:[]},
  {name:'二级加签',checked:false,valueList:[]},
  {name:'DCG风险岗',checked:false,valueList:[]},
  {name:'三级加签',checked:false,valueList:[]},
  {name:'四级加签',checked:false,valueList:[]},
  {name:'北京采购经理',checked:false,valueList:[]},
  {name:'海外采购经理',checked:false,valueList:[]},
  {name:'北京采购员',checked:false,valueList:[]},
  {name:'海外采购员',checked:false,valueList:[]},
];

@Injectable()
export class PurchaseApplicationService {

  constructor(
    private http:Http
  ) { }

  //验证itcode是否存在
  testItcodeIsRight(itcode){
    return this.http.get(environment.server+`persons?search_LIKE_name_1=${itcode}&search_LIKE_itcode_2=${itcode}&search_LIKE_personNo_3=${itcode}&formula=1 OR 2 OR 3&pageSize=8`).toPromise().then(Response=>Response.json())
  }

  //获取并验证itcode是否存在
  getApprovalPerson(approvalArray){
    return this.http.post(environment.server+'S_Contract/GetApproverInfo',approvalArray).toPromise().then(Response=>Response.json());
  }

  //保存采购申请规则
  saveRule(PurchaseApplicationData){
    return this.http.post(environment.server+`PurchaseRequisitionRule/SaveRuleInfo`,PurchaseApplicationData).toPromise().then(Response=>Response.json());
  }

  //获取规则列表
  getRuleList(Query){
    return this.http.post(environment.server+`PurchaseRequisitionRule/GetRoleList`,Query).toPromise().then(Response=>Response.json());
  }

  //删除列表项
  deteleList(ruleId){
      return this.http.get(environment.server+`PurchaseRequisitionRule/DelRule/${ruleId}`).toPromise().then(Response=>Response.json());
  }

  //设置规则状态
  setRuleState(ruleState:RuleState){
      return this.http.post(environment.server+'PurchaseRequisitionRule/SetRoleStatus',ruleState).toPromise().then(Response=>Response.json());
  }

  //获得详情
  getDetail(RoleID){
      return this.http.get(environment.server+`PurchaseRequisitionRule/RuleInfo/${RoleID}`).toPromise().then(Response=>Response.json());
  }

  //获得标准周转天数
  getRevolveDays(ProductLine) {
    return this.http.post(environment.server + 'PurchaseRequisitionRule/GetRevolveDays',{'ProductLine':ProductLine}).toPromise().then(Response=>Response.json());
  }

}