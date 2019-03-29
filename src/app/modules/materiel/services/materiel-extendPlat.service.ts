import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions,Headers} from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()

export class Query {
  OriginaFactory: string;
  Factory: string;
  PageNo: string;
  PageSize: string;
}
export class PlatInfo {
  checked: boolean;
  View: boolean;
  RecordId: string;
  OriginaFactory: string="";//原始工厂
  Factory: string;//目标工厂
  Location: string;//库存地
  ApplyName: string;//创建人
  ApplyTime: string;//创建时间
}


@Injectable()
export class MaterielExtendPlatService {

  constructor(private http: Http){}

  //添加扩展平台
  addPlat(plat: PlatInfo){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/baseinfo/repository", plat,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //获取扩展平台列表
  getPlatList(query: Query){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/baseinfo/list", query,options)
                    .toPromise()
                    .then(response => response.json())
  }

  //删除扩展平台
  deletePlat(id: string){
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.server + "material/baseinfo/del", {RecordId:id},options)
                    .toPromise()
                    .then(response => response.json())
  }

  //获取扩展平台导入接口
  getImportApi(){
    let userInfo=JSON.parse(localStorage.getItem('UserInfo'));
    
    let applyITCode = userInfo.ITCode;
    let applyName = userInfo.UserName;

    // return this.http.post(environment.server + "material/baseinfo/import", {},options)
    // .toPromise()
    // .then(response => response.json())

    return environment.server + "material/baseinfo/import"+`?applyITCode=${applyITCode}&&applyName=${applyName}`;
  }
}