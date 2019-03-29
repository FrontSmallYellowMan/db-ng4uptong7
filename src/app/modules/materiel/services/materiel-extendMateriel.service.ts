import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions, Headers, Response} from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { returnNewComponent } from '../../bill';

@Injectable()

export class Query {
  ApplyName: string = "";
  BeginDate: any;
  EndDate: any;
  ExtendType: string = "";
  MaterialCode: string = "";
  Status:number=6;//状态（1:已完成，2:部分扩展完成，3:扩展失败，6:待审批，7:驳回）
  PageNo: number = 1;
  PageSize:number = 10;
}
export class MaterielInfo {
  SerialNumber: string;
  ApplyDate: string;
  ApplyName: string;
  ExtendType: string;
}

export class ExtendMaterl {
  ExtendNo:string;//扩展物料订单号
  SerialNumber: string;//序列号
  MaterialCode: string;//物料编号
  ExtendType: string;//扩展方式
  ReferFactory: string;//参考工厂
  ExtendFactory: string;//扩展工厂
  ExtendBatch: string;//扩展批次
  ExtendLocation: string;//扩展库存地
  isSucceed: boolean = false;//是否提交成功
  errorMsg: string;//失败原因
  editAble: boolean = true;//是否能修改

  constructor(data){
    this.MaterialCode = data.MaterialCode || "";
    this.SerialNumber = data.SN || "";
    this.ReferFactory = data.ReferFactory || "";
  }
}

export class ExtendMaterielDetail{
  ExtendNo:string;//扩展物料订单号
  SerialNumber: string;//序列号
  MaterialCode: string;//物料编号
  ExtendType: string;//扩展方式
  ReferFactory: string;//参考工厂
  ExtendFactory: string;//扩展工厂
  ExtendBatch: string;//扩展批次
  ExtendLocation: string;//扩展库存地
  isSucceed: boolean = false;//是否提交成功
  errorMsg: string;//失败原因
  editAble: boolean = true;//是否能修改
}

export class NewExtendMaterielData{
  OrderType:number;//分类(1无审批订单,2:有审批订单)
  ExtendNo:string;//申请单号
  WFApproveUserJSON:string;//审批节点初始化信息
  InstanceId:string;
  List:any[]=[];//列表
}

export class AddMaterileList{
  MaterialList:any[]=[];
}

//审批参数
export class ApproveData{//审批组件内部调用参数
  ID:string;//主键Id
  apiUrl_AR:string="common/approve";// "同意、驳回审批接口地址", 
  apiUrl_Sign:string="/common/addtask";// "加签审批接口地址", 
  apiUrl_Transfer:string="common/addtransfertask";// "转办审批接口地址",
  apiUrl:string="common/approveaddtask";//加签接口
  taskid:string="";// "审批任务ID", 
  nodeid:string="";// "审批节点ID"
  instanceid:string="";//实例Id
  actionType:number=3;//审批类型，表示是扩展物料的审批
}

//审批列表
export class ApprovalQuery{
  TaskStatus:string="0";//申请状态（申请状态,0-未处理,1-已处理,2-全部）
  ApplyName:string;//申请人
  BeginDate:string;//开始时间
  EndDate:string;//结束时间
  ExtendType:string="";//扩展方式
  MaterialCode:string;//物料号
  PageNo:number;//页码
  PageSize:number=10;//每页显示多少行
}

//带审批条目数
export class NotApprovalData{
  notApproval:string="0";//待审批的条目数
}

export class MaterielCodeFactory{//根据物料号获取物料名称
  MaterialERPCode:string;//物料号
  Factory:string;//工厂
}

export class DeleteExtendMaterileData{
  SerialNumber:string;//申请单号
  IsComplete:string;//申请单状态，(0:表示原状态,1:已完成[删除后，列表中已不存在错误项])
  List:any=[];//要删除的物料号数组
}

@Injectable()
export class MaterielExtendMaterielService {

  constructor(private http: Http){}

  //获取扩展物料列表
  getMaterielList(query: any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/extension/mylist", query,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //获取序列号及参考工厂
  getSerialNumber(addMaterileList: AddMaterileList){
  
    return this.http.post(environment.server + "material/extension/sn/",addMaterileList)
                    .toPromise()
                    .then(response => response.json())
  }

  //保存扩展
  saveExtend(extendList: ExtendMaterl[]){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/extension/repository", extendList,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //删除扩展物料
  deleteMateriel(snList: string[]){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/extension/del", snList,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //获取物料详情
  getMaterielDetail(sn: string){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/extension/detail", {SN: sn},options)
                    .toPromise()
                    .then(response => response.json())
  }

  //导入api
  importMaterielApi(){
    let userInfo=JSON.parse(localStorage.getItem('UserInfo'));
    
    let applyITCode = userInfo.ITCode;
    let applyName = userInfo.UserName;

    return environment.server + "material/extension/import"+`?applyITCode=${applyITCode}&&applyName=${applyName}`;

   // return environment.server + "material/extension/import";
  }

  //参考工厂和扩展工厂后两位不同时的，保存接口
  newExtendFactory(extendList:any){
    return this.http.post(environment.server + "material/extensionfactory/save",extendList)
                    .toPromise()
                    .then(response => response.json())
  }

  //我的审批列表
  approvalQueryList(query:ApprovalQuery){
    return this.http.post(environment.server + "material/extension/approvelist",query)
                    .toPromise()
                    .then(response => response.json())
  }

  //获取审批历史记录
  getApprovalHistory(approvalData:ApproveData){
    return this.http.post(environment.server + "common/history",approvalData)
    .toPromise()
    .then(response => response.json())
  }

  //获取审批全景图
  getPanoramagram(approvalData:ApproveData){
    return this.http.post(environment.server + "common/getpanoramagram",approvalData)
    .toPromise()
    .then(response => response.json())
  }

  //审批节点信息初始化
  getApprovalNodeInit(WFCategory:any){
    return this.http.post(environment.server+"common/approvenodes",WFCategory).toPromise().then(Response=>Response.json());                    
  }

  //根据参考工厂获取参考库存地
  getReferenceReferLocation(Factory:string){
    return this.http.post(environment.server+`common/getdefaultlocation/${Factory}`,Factory).toPromise().then(Response=>Response.json());                         
  }

  //根据物料号获取物料名称
  getMaterielInformation(materielCodeFactoryData:any){
    return this.http.post(environment.server+"materialchange/getmaterialinfo", materielCodeFactoryData).toPromise().then(response => response.json());
  }

  //删除物料扩展失败的列表项
  deleteExtendMaterile(deleteExtendMaterileData:any){
    return this.http.post(environment.server+"material/extendfactory/del", deleteExtendMaterileData).toPromise().then(response => response.json());    
  }

  //2019-1-15 新增接口，直接扩展工厂
  extendFactoryForDirect(extendList:any) {
    return this.http.post(environment.server+'Material/FactoryExtensions',extendList).toPromise().then(Response =>Response.json());
  }

  //2019-1-15 新增接口，用来提交审批
  haveApprovalFormExtendMaterial(extendList:any) {
    return this.http.post(environment.server+'Material/FactoryExtensionsWorkFlow',extendList).toPromise().then(Response=>Response.json());
  }

}
