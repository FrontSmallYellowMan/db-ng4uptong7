import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  Http,
  URLSearchParams,
  RequestOptions,
  Headers,
  Response
} from "@angular/http";
import "rxjs/add/operator/toPromise";
import { Observable } from "rxjs";
import { Subject } from "rxjs";

// export class Query {
//   pageNo: string;
//   pageSize: string;
// }

@Injectable()
export class Query {
  Platform: string; //平台
  ApplyName: string; //申请人姓名
  Factory: string; //工厂
  BeginDate: string = ""; //开始时间
  EndDate: string = ""; //结束时间织
  ApproveSection: string = "2"; //审核环节
  PageSize: number = 10;
  PageNo: number = 1;
  ApplicationState: string = ""; //申请状态
}

export class DetailExport {
  //转出物料数据对象
  Id: string; //导出行ID,
  ChangeId: string = ""; //变更ID,
  ExportMaterialNo: string = ""; // "转出物料号"
  ExportMaterial: string = ""; // "转出物料名称"
  ExportSC_Code: string = ""; // 转出物料销售合同号
  ExportSalesUnit: string = ""; //转出物料销售单位
  ExportCount: string = ""; //转出物料数量
  ExportStorageLocation: string = ""; //转出物料库存地
  ExportFactory: string = ""; //转出物料工厂
  ExportBatch: string = ""; //批次
  InStorageThirtyDays: boolean; //是否入库30天内,0:否,1:是
  ApplicationState: string = ""; //申请状态
  ExportUnitPrice: string = ""; //转出物料单价
  ExportAmount: string = ""; //导出合计
  ApplyTime: string; //申请时间
  ApplyName: string; // "冯可洋",
  ApplyItCode: string; // "FENGKY"
  valid: boolean = false; //合法性
  isTouched: boolean = false; //是否点击
  From: any; //标记物料来源 1为新建，2为从销售订单获取的
  isNoEdit: boolean; //是否可编辑
  ExportCountSource: string; //保存从销售订单传来的转出物料数量
}

export class DetailImport {
  //转入物料数据对象
  Id: string; // 36,
  ChangeId: string; // 28,
  ImportMaterialNo: string = ""; //转入物料号
  ImportMaterial: string = ""; //转入物料名称
  ImportSalesUnit: string = ""; //转入物料销售单位
  ImportStorageLocation: string = ""; //转入物料库存地
  ImportFactory: string = ""; //转入物料工厂
  ImportCount: string = ""; //转入物料数量
  ImportBatch: string = ""; //转入物料批次
  SaleInCurrentMonth: string; //是否本月销售,0:否,1:是
  ImportSC_Code: string = ""; //转入物料销售合同号
  ImportSaleOrderId: string = ""; //转入物料销售单号
  QuantityInStock: string; //转入物料库存数量
  ApplicationState: string = ""; //申请状态
  ImportUnitPrice: string = ""; //转入物料单价
  ImportAmount: string = ""; //转入物料合计
  ApplyTime: string; // 申请时间
  ApplyName: string; //申请人
  ApplyItCode: string; //申请人ItCode
  valid: boolean = false; //合法性
  isRemoveLine: boolean = true; //是否允许删除行
  SalesCount: string; //销售数量
  isImportSaleOrder: boolean = false; //是否存在销售订单号
  isNoEdit: boolean; //是否可编辑
}

export class MaterielChangeData {
  //物料变更基础数据
  Id: string; //主键ID
  ChangeNo: string; //变更编号
  Contact: string; //联系方式
  Factory: string; //工厂
  MaterialVoucher: string; //物料凭证
  Reason: string; //调整物料原因
  Remark: string; //备注
  ApplyName: string; //冯可洋
  ApplyTime: string; //申请时间
  UpdateTime: string; //上传时间,
  ApplyItCode: string; //ItCodte "FENGKY",
  ApplicationState: string; //申请状态 0,
  BBMC: string; //本部
  SYBMC: string; //事业部
  WFApproveUserJSON: string; //审批流程字符串
  DetailExport: DetailExport[] = [new DetailExport()]; //转出物料数据
  DetailImport: DetailImport[] = [new DetailImport()]; //转入物料数据
  From: string = "1"; //(1.新建，2.销售合同发起)
  InstanceId: string; //实例ID
  IsVaryCost: string; //是否存在变更成本差异，false否，true是
  SaleStatus: any; //销售情况：1:全部销售，2:未销售，3:部分销售
  BBApprover: string; //本部审批人
  AccessoryList: AccessoryList[] = []; //附件上传数组
}

//附件上传数组
export class AccessoryList {
  id: string; //附件ID
  AccName: string; //附件名称
  AccURL: string; //附件地址
  AccType: string; //附件类型
  //name:string;//用于显示已上传的的附件名称
}

export class DelDataMaterielChange {
  //删除
  ID: string; //主键ID
}

export class DetailData {
  //详情
  ID: string; //主键ID
}

export class SearchOriginalData {
  MaterialERPCode: string;
  //Factory:string;
  Factory_Old: string;
}

export class ApprovalListData {
  //审批流程数据列表
  PageSize: number;
  PageNo: number = 1;
  TaskStatus: string = "0"; //查询筛选（0:待我审批,1:我已审批,2:全部）
  Factory: string; //工厂
  Platform: string; //平台
  ApproveSection: string = ""; //审核环节
  BeginDate: string; //开始时间
  EndDate: string; //结束时间
  ApplicationState: string;
  ApplyName: string; //
}

export class SalseList {
  //通过物料号查询销售合同列表
  SC_Code: string; //销售合同主键
  MainContractCode: string; //销售合同号
  BuyerName: string; //客户名称
}
export class ApproveData {
  //审批组件内部调用参数
  apiUrl_AR: string = ""; // "同意、驳回审批接口地址",
  apiUrl_Sign: string = ""; // "加签审批接口地址",
  apiUrl_Transfer: string = ""; // "转办审批接口地址",
  apiUrl: string = ""; //加签接口
  taskid: string = ""; // "审批任务ID",
  nodeid: string = ""; // "审批节点ID"
  instanceid: string; //实力Id
  vouncher: string = ""; //物料凭证号
  ID: string; //物料变更ID
}
export class BackSaleApproval {
  //审批组件内部调用参数
  taskid: string = ""; // "审批任务ID",
  nodeid: string = ""; // "审批节点ID"
  instanceid: string; //实力Id
  vouncher: string = ""; //物料凭证号
  opinions: string = "同意"; //审批意见
  approveresult: string = "Approval"; //审批结果
  ID:string;//物料变更ID
}

export class MaterielCodeFactory {
  //根据物料号获取物料名称
  MaterialERPCode: string; //物料号
  Factory: string; //工厂
}

export class GetSaleMaterielData {
  Flag: string = "2"; //请求类别,1:存值 2:取值
  Data: string; //接收到的凭证号
}

export class GetBasedata {
  //获取审批数据字符串
  BizScopeCode: string = ""; //业务范围
  WFCategory: string = "物料变更v2"; //审批流程分类
}

@Injectable()
export class MaterielChangeService {
  constructor(private http: Http) {}

  //搜索
  searchMaterielChange(searchData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "materialchange/list", searchData, options)
      .toPromise()
      .then(response => response.json());
  }

  //删除
  deleteDataMaterielChange(delData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "/materialchange/del", delData, options)
      .toPromise()
      .then(response => response.json());
  }

  //详情
  detailData(detailData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "/materialchange/detail", detailData, options)
      .toPromise()
      .then(response => response.json());
  }
  //提交和暂存
  saveData(saveData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "materialchange/add", saveData, options)
      .toPromise()
      .then(response => response.json());
  }
  //根据物料编号，查询相关的销售合同列表
  editSalesList(saleslist: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "/materialchange/getsalecontractno",
        saleslist,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //查询审批列表
  approvalList(approvalist: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "/materialchange/approvelist",
        approvalist,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //根据物料号获取物料名称
  getMaterielInformation(materielCodeFactoryData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "materialchange/getmaterialinfo",
        materielCodeFactoryData,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //销售订单反填环节的审批
  backSaleApprove(approveData: BackSaleApproval) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "/materialchange/approve",
        approveData,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //根据ID获取全景图
  getPanoramagram(ID: string) {
    //根据ID获取全景图
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(
        environment.server + "materialchange/GetPanoramagram/" + `${ID}`,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //获取销售订单过来的物料信息
  getSaleMateriel(selaData: any) {
    //获取销售订单过来的物料信息
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "materialchange/sponsor/", selaData, options)
      .toPromise()
      .then(response => response.json());
  }
  //获取审批基础数据
  getBasedata(basedata: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(environment.server + "common/approvenodes/", basedata, options)
      .toPromise()
      .then(response => response.json());
  }
  //获取销售订单反填环节的转入物料数据
  getSaleImportMaterial(ChangeId: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(
        environment.server + "materialchange/getsalesorders/" + `${ChangeId}`,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //将销售订单反填的数据传给后台
  writeImportMaterial(importMaterial: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "materialchange/writeimport",
        importMaterial,
        options
      )
      .toPromise()
      .then(response => response.json());
  }
  //调用接口，判断是否提示变更成本差异
  isDeviate(materielData: any) {
    let headers = new Headers({ ticket: localStorage.getItem("ticket") });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        environment.server + "materialchange/isdeviate",
        materielData,
        options
      )
      .toPromise()
      .then(response => response.json());
  }

  //获取一级预审环节审批人
  getFirstApprovalPerson(approvalPerson: any) {
    return this.http
      .post(
        environment.server + "materialchange/getapproveusers",
        approvalPerson
      )
      .toPromise()
      .then(response => response.json());
  }

  //导出变更成本差异明细和导出物料明细表
  getMaterielChangeCostDifferenceList(materielChangeDataId) {
    return this.http
      .get(
        environment.server + "materialchange/exportdeviate/"+materielChangeDataId,{responseType:3}
      ).map(res=>res.blob());
  }

  //在物流器材会计岗需要，导出物料明细
  getMaterialList(ID){
    return this.http.post(environment.server+'materialchange/GetMaterialChangeExcel',{'id':ID},{responseType:3}).map(res=>res.blob());
  }


}
