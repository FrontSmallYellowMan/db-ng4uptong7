import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import {environment_java} from 'environments/environment';
export class Query {
  public storeHouse: string;//库房
  public platformName: string;//平台
  public pageSize: number;
  public pageNo: number;
}

//新建平台和库房的关联关系
export class PlatformInvInfo {
  id: string;
  platformCode: string;//平台编码 
  platformName: string;//平台名称
  storeHouse: string;//库房
  storeHouseCode: string;//库房编码前两位
  acceptItCode: string;//收货人ITCode
  acceptUserName: string;//收货人姓名
  materieItCode: string;//器材人员ITCODe
  meterieUserName: string;//器材人员姓名 
}

@Injectable()
export class PlatformInventoryService {

  constructor(private http: Http) { }

  //获取平台关联库房信息列表
  getPlatformInvList(query: Query) {
    let { storeHouse, platformName, pageSize, pageNo } = query;
    return this.http.get(environment_java.server+"borrow/platforminvs", { params: { storeHouse, platformName, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json())
  }

  //新建平台和库房的关联关系
  addPlatformInv(config: PlatformInvInfo) {
    return this.http.post(environment_java.server+'borrow/platforminv', config)
      .toPromise()
      .then(response => response.json())
  }
  //获取可用的平台列表
  getPlatforms() {
    return this.http.get(environment_java.server+'borrow/platforminv/platforms')
      .toPromise()
      .then(response => response.json())
  }
  //获取平台关联的库房名称列表
  getStorages(id: string) {
    return this.http.get(environment_java.server+'borrow/platforminv/storages?platformCode=' + id)
      .toPromise()
      .then(response => response.json())
  }
  //获取一条平台和库房的关联关系信息
  getPlatformInvConfig(id: string) {
    return this.http.get(environment_java.server+'borrow/platforminv/' + id)
      .toPromise()
      .then(response => response.json())
  }
  //修改平台和库房的关联关系           
  updatePlatformInv(config: PlatformInvInfo) {
    return this.http.put(environment_java.server+'borrow/platforminv/', config)
      .toPromise()
      .then(response => response.json())
  }
  //删除平台和库房的关联关系
  deletePlatformInv(id: string) {
    return this.http.delete(environment_java.server+'borrow/platforminv/' + id)
      .toPromise()
      .then(response => response.json())
  }
  //批量导入数据
  batchImportPlatformInv() {
    return this.http.post(environment_java.server+'borrow/platforminv/data-import', [])
      .toPromise()
      .then(response => response.json())
  }

  //根据模板分析平台和库房的关联关系
  analysisPlatformInv() {
    return environment_java.server+'borrow/platforminv/upload-excel';
  }

  //下载平台和库房的关联关系模板
  loadPlatformInvTpl() {
    return '../../assets/downloadtpl/平台与库存地关系导入模板.xlsx';
  }
}
