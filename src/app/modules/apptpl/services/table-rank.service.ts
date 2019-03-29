import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';

export class Query {
  public srcBusinessScope: string;//原业务范围
  public descBusinessScope: string;//现业务范围
  public pageSize: number;
  public pageNo: number;
}
export class Rank{//排序对象
     a = "none";//none-表示不排序;down-表示降序;up-表示升序
     b = "none";
     c = "none";
}

//新建财年调整信息
export class FiscalInfo {

  srcBaseDeptName: string;//原本部名称
  srcSubDeptName: string;//原事业部名称
  srcBusinessScope: string;//原业务范围代码
  descBaseDeptName: string;//现本部名称
  descSubDeptName: string;//现事业部名称
  descBusinessScope: string;//现业务范围代码
  adjustmentDate: Date//调整日期
}

@Injectable()
export class FiscalAdjustService {

  constructor(private http: Http) { }

  //获取财年调整列表
  getFiscalList(query: Query,rank:Rank) {
    console.log(rank);
    let { srcBusinessScope, descBusinessScope, pageSize, pageNo } = query;
    return this.http.get("dbomsapi/borrow/fiscalyear-adjustment", { params: { srcBusinessScope, descBusinessScope, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json())
  }

  //删除财年调整
  deleteFiscal(id: string) {
    return this.http.delete('dbomsapi/borrow/fiscalyear-adjustment/' + id)
      .toPromise()
      .then(response => response.json())
  }
}