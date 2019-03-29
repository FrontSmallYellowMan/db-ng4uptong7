import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { environment } from '../../../../environments/environment';

//基础参数，新建供应商所含字段
export class SupplierData{
  vendorid:string;//主键自增(0为新增,>0为编辑)
  modifyid:string;//修改供应商ID
  wfstatus:string;//0-草稿,1-主数据岗,2-已完成,7-已驳回
  username:string;//申请人姓名
  itcode:string;//申请人ItCode
  vendor:string;//供应商名称
  vendorno:string;//供应商编号
  phone:string;//电话
  BBMC:string;//本部
  SYBMC:string;//事业部
  costcenter:string;//成本中心
  vendorcountry:number=null;//供应商类别(0-国内,1-国外)
  registeredaddress:string;//注册地址
  company:string;//公司名称
  companycode:string;//公司代码
  valueaddedtaxno:string;//增值税号或统一社会信用代码
  classnamecode:string;//供应商分类(0-核心,1-非核心,2-新产品)
  bankcountry:string;//银行国别
  bankcountrycode:string;//银行国别代码
  bankname:string;//银行名
  bankaccount:string;//银行账户
  accountgroup:string;//账户组
  paymentterms:string="";//付款条款名称
  paymenttermscode:string;//付款条款代码
  reconciliationaccount:string;//统驭科目
  internationaltradeterms:string="";//国际贸易条件
  internationaltradelocation:string="";//国际贸易地点
  currency:string="";//币种名称
  currencycode:string;//币种代码
  addtime:string;//申请时间
  AccessoryList:AccessoryList[]=[];//附件上传数组
  SearchWord:string="";//ERP检索词
  InstanceId:string="";//实例ID  
  WFApproveUserJSON:string;//用来保存审批初始化信息，在提交审批时传给后端
}
//附件上传数组
export class AccessoryList{
  id:string;//附件ID
  AccName:string;//附件名称
  AccURL:string;//附件地址
  AccType:string;//附件类型
  //name:string;//用于显示已上传的的附件名称
}

//查询我的申请接口参数
export class QueryMyApply{
  SearchTxt:string;//查询关键词
  ApproveSection:string="1";//申请状态 0-草稿, 1-申请中,2-已完成,3-全部
  pageNo: number;//页码
  pageSize: number=10;//每页显示多少
}

//查询我的审批接口参数
export class QueryMyApproval{
  SearchTxt:string;//查询关键词
  BBMC:string;//本部
  SYBMC:string;//事业部
  ApplyName:string;//申请人姓名
  PageNo: number;//页码
  PageSize: number;//每页显示多少
  TaskStatus:string="0";//审批状态
}

//获取公司代码列表
export class Company {
  querycontent: string;//查询参数
  PageNo: number;//页码
  PageSize: number = 10;//每页显示多少
}

//获取事业部
export class BusinessUnit{
  SearchTxt:string;//查询字符串
  pageNo: number=1;//页码
  pageSize: number=6;//每页显示多少 
}

//查询供应商列表
export class SupplierList{
  SearchTxt:string;//供应商名称
  ApproveSection:string="2";//审批状态 0-草稿, 1-申请中,2-已完成,3-全部
  PageNo:string;//当前页码
  PageSize:string;//页大小
  BBMC:string;//本部
  SYBMC:string;//事业部
  ClassNameCode:string="";//分类

}

//扩展供应商请求参数
export class ExtendSupplierData{
  Vendors:any=[];
  CompanyCodeNew:string;
  CompanyNameNew:string;
}

//查看供应商详情页时，公司代码可以选择，以获得对应的付款条款
export class GetCompanyAndPay{
  VendorNo:string;//供应商编号
}

//保存我的关注
export class SaveMyRemarksData{
  Id:number=0;//Id为0,表示新增,否则为编辑
  VendorId:string;//供应商ID
  Content:string;//内容
  VendorNo:string;//供应商编号
}

//审批参数
export class ApproveData{//审批组件内部调用参数
  ID:string;//主键Id
  apiUrl_AR:string="";// "同意、驳回审批接口地址", 
  apiUrl_Sign:string="";// "加签审批接口地址", 
  apiUrl_Transfer:string="";// "转办审批接口地址",
  apiUrl:string="";//加签接口
  taskid:string="";// "审批任务ID", 
  nodeid:string="";// "审批节点ID"
  instanceid:string="";//实例Id
  actionType:string="";//操作分类，1:供应商新建审批  2:供应商修改审批
  classnamecode:string;//供应商分类，在审批岗审批时，作为必填项
}

//同步接口参数
export class Syncro{
  VendorId:string;//供应商ID
  VendorNo:string;//供应商编号
  CompanyCode:string;//公司代码
  PurchaseOrganization:string;//采购组织
}

//供应商分类接口参数
export class SupplierClass{
  syb:any=[];
  classname:string="";//供应商分类名称
  classnamecode:string="";//供应商分类代码
  vendor:string;//供应商名称
  vendorid:string;//供应商ID
  vendorno:string;//供应商编号
}

//删除供应商草稿
export class DeleteSupplierTemp{
  VendorId:string;//供应商ID
  ModifyId:string;//修改供应商ID
  ActionType:string;//供应商类型（1.新建，2.修改）
}

//是否允许编辑页面的请求参数
export class IsEditResData{
  FunctionCode:number=51;//请求的验证的模块代码
  RecordID:string;//主键Id
}

//删除供应商时，判断是否为核心供应商
export class DelectSupplierIsShowTipsData {
  VendorBizdivisionClassID: string = '';// 供应商关系ID
  VendorID: string = ''; // 供应商ID
  VendorNo: string = ''; // 供应商NO
}


@Injectable()
export class SupplierService {

  constructor(private http: Http) { }

  //在页面加载时，判断是角色（1:采购岗，2:产品岗）
  getUser(itcode:any){
    return this.http.get(environment.server+`vendor/ispurchase/`+itcode).toPromise().then(response => response.json());         
  }

  //获取公司代码列表
  getCompany(company:any){
    return this.http.post(environment.server+"InitData/GetPageDataCompany", company).toPromise().then(response => response.json());   
  }

  //获取申请人的基本信息
  getPersonInformation(){
    return this.http.get(environment.server + "base/GetCurrentUserInfo").toPromise().then(response=>response.json());
  }

  //获取申请人的联系方式
  getPersonPhone(){
    return this.http.get(environment.server+"InitData/GetCurrentUserPhone").toPromise().then(response => response.json());     
  }

  //提交和暂存
  supplierSave(supplierData:any){
   return this.http.post(environment.server+"vendor/add",supplierData).toPromise().then(response=>response.json());
  }

  //获取币种接口
  getCurrency(){
    return this.http.post(environment.server+"base/basedata/GetCurrency","").toPromise().then(Response=>Response.json());
  }

  //查询供应商列表
  searchSupplierLIst(searchData:any){
    return this.http.post(environment.server+"vendor/list",searchData).toPromise().then(Response=>Response.json());
  }

  //查询事业部列表
  searchBusinessUnit(searchData:any){
    return this.http.post(environment.server+"vendor/getbbandsyb",searchData).toPromise().then(Response=>Response.json()); 
  }

  //我的申请列表页
  searchMyApplyList(searchData:any){
    return this.http.post(environment.server+"vendor/getmylists",searchData).toPromise().then(Response=>Response.json());     
  }

  //我的审批列表
  searchMyApproval(searchData:any){
    return this.http.post(environment.server+"vendor/approvelist",searchData).toPromise().then(Response=>Response.json());         
  }

  //获取供应商的详情页面
  getSupplierDetail(Id:any){
    return this.http.post(environment.server+"vendor/getdetail",Id).toPromise().then(Response=>Response.json());     
  }

  //查询供应商的名称是否存在重复
  searchSupplierData(vendor:any){
    //因为使用get请求，而且请求参数存在中文，所以使用encodeURI()函数转获取的参数，tips：encodeURI和decodeURI是成对来使用的，因为浏览器的地址栏有中文字符的话，可以会出现不可预期的错误，所以可以encodeURI把非英文字符转化为英文编码，decodeURI可以用来把字符还原回来。
    return this.http.post(environment.server+"Vendor/IsExist/",{'VendorName':vendor}).toPromise().then(Response=>Response.json());     
  }

  //扩展供应商
  extendSupplier(vendorIds:ExtendSupplierData){
    return this.http.post(environment.server+"vendor/expand",vendorIds).toPromise().then(Response=>Response.json());         
  }

  //供应商详情页，查询已扩展的公司代码
  getCompanyAndPay(vendorNo:any){
    return this.http.post(environment.server+"vendor/getcompanycodeandpaytype",vendorNo).toPromise().then(Response=>Response.json());             
  }

  //保存我的关注
  saveMyRemarks(saveData:SaveMyRemarksData){
    return this.http.post(environment.server+"vendor/writemynote",saveData).toPromise().then(Response=>Response.json());                 
  }

  //审批节点信息初始化
  getApprovalNodeInit(WFCategory:any){
    return this.http.post(environment.server+"common/approvenodes",WFCategory).toPromise().then(Response=>Response.json());                    
  }

  //获取审批历史记录
  getHistory(responseData:any){ 
    return this.http.post(environment.server+"common/history",responseData).toPromise().then(Response=>Response.json());                      
  }

  //获取流程全景图
  getPanorama(responseData:any){
    return this.http.post(environment.server+"common/getpanoramagram",responseData).toPromise().then(Response=>Response.json());                          
  }

  //修改供应商暂存和提交
  changeSupplierTempSave(supplierData:any){
    return this.http.post(environment.server+"vendor/modify/save",supplierData).toPromise().then(Response=>Response.json());                              
  }

  //修改供应商详情
  changeSuppliergetDetail(Id:string){
    return this.http.post(environment.server+`vendor/modify/detail/${Id}`,Id).toPromise().then(Response=>Response.json());                              
  }

  //同步供应商
  syncroSupplier(syncroData:any){
    return this.http.post(environment.server+"vendor/syncro",syncroData).toPromise().then(Response=>Response.json());                                  
  }

  //分类供应商
  classSupplier(classSupplier:any){
    return this.http.post(environment.server+"vendor/specifyclass",classSupplier).toPromise().then(Response=>Response.json());                                     
  }

  //下载供应商列表
  getSupplierExtendList(searchData:any){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers,responseType: 3 });
    return this.http.get(environment.server+`vendor/download/?SearchTxt=${searchData}`,options).map(data => data.json());                                     
  }

  //删除草稿供应商
  deleteSuppliertemp(deleteData:any){
    return this.http.post(environment.server+"vendor/delete",deleteData).toPromise().then(Response=>Response.json());                                        
  }

  //获取供应商主数据审批岗审批人
  getSupplierApprovalPerson(){
    return this.http.post(environment.server+"vendor/WFUser",{}).toPromise().then(Response=>Response.json());                                         
  }

  //获取供应商详情（new）（原详情接口在供应商列表返回的附件数据存在重复问题，故在供应商列表详情和修改供应商比对原始供应商时，需调用此接口）
  getOriginalDetail(vendorId){
    return this.http.post(environment.server+"vendor/GetOriginalDetail",vendorId).toPromise().then(Response=>Response.json());                                             
  }

  //是否允许编辑
  isEdit(responseData:IsEditResData){
    return this.http.post(environment.server+"GetRecordAllowEditState",responseData).toPromise().then(Response=>Response.json());                                             
  }

  //删除供应商，根据供应商类型判断是否需要给出提示
  deleteSupplierIsShowTips(reqData) {
    return this.http.post(environment.server+'VendorManage/CheckDelete', reqData).toPromise().then(Response=> Response.json());
  }

  //删除供应商接口
  deleteSupplier(reqData) {
    return this.http.post(environment.server+'VendorManage/Delete',reqData).toPromise().then(Response=>Response.json());
  }

}