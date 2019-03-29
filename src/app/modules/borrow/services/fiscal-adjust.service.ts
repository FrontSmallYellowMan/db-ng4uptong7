import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import {environment_java} from 'environments/environment';
export class Query {
  public srcBusinessScope: string;//原业务范围
  public descBusinessScope: string;//现业务范围
  public pageSize: number;
  public pageNo: number;
}

//新建财年调整信息
export class FiscalInfo {

  srcBaseDeptName: string;//原本部名称
  srcSubDeptName: string;//原事业部名称
  srcBusinessScope: string;//原业务范围代码
  descBaseDeptName: string;//现本部名称
  descSubDeptName: string;//现事业部名称
  descBusinessScope: string;//现业务范围代码
  adjustmentDate: Date;//调整日期
}

@Injectable()
export class FiscalAdjustService {

  constructor(private http: Http) { }

  //获取财年调整列表
  getFiscalList(query: Query) {
    let { srcBusinessScope, descBusinessScope, pageSize, pageNo } = query;
    return this.http.get(environment_java.server+"borrow/fiscalyear-adjustment", { params: { srcBusinessScope, descBusinessScope, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json())
  }

  //新增财年调整
  addFiscal(fiscalConfig: FiscalInfo) {
    console.log(environment_java.server);
    return this.http.post(environment_java.server+'borrow/fiscalyear-adjustment', fiscalConfig)
      .toPromise()
      .then(response => response.json())
  }

  //删除财年调整
  deleteFiscal(id: string) {
    return this.http.delete(environment_java.server+'borrow/fiscalyear-adjustment/' + id)
      .toPromise()
      .then(response => response.json())
  }
  //批量导入数据
  batchImportFiscal() {
     return this.http.post(environment_java.server+'borrow/fiscalyear-adjustment/data-import',[])
      .toPromise()
      .then(response => response.json())
  }

  //根据模板分析财年调整信息
  analysisFiscal() {
    return environment_java.server+'borrow/fiscalyear-adjustment/upload-excel';
  }

  //下载财年模板
  loadFiscalTpl() {
    return '../../assets/downloadtpl/财年调整-导入模板.xlsx';
  }
}
