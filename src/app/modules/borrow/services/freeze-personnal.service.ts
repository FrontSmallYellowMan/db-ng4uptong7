import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions} from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import { environment_java } from "environments/environment";
export class Query {
    public keyWord: string;
    public pageSize: number;
    public pageNo: number;
}
export class PersonnelInfo {
    public frozenItCode: string;
    public frozenUserName: string;
    public frozenUserNo: string;
    public freeResult: number;
    public createBy: string;
    public createDate: string;
    public id: string;
    public lastModifiedBy: string;
    public lastModifiedName: string;
    public lastModifiedItcode: string;
    public lastModifiedDate: string;
    public org: string;
}

@Injectable()
export class FreezePersonnelService {

    constructor(private http: Http){}

    //获取冻结人员信息列表
    getFreezeList(query: Query) {
        let { keyWord, pageSize, pageNo } = query;
        return this.http.get(environment_java.server+"borrow/frozen-people", { params: { keyWord, pageSize, pageNo } })
                        .toPromise()
                        .then(response => response.json())
    }
    //创建冻结人员
    createFreezeList(personnel: PersonnelInfo) {
      return this.http.post(environment_java.server+"borrow/frozen-people", personnel)
        .toPromise()
        .then(response => response.json())
    }
    //豁免操作
    getExemptOperate(frozenItCode: string, valid: string) {
        let url=environment_java.server+'borrow/frozen-people/' + frozenItCode + '/status/' + valid;
        return this.http.put(url,{})
                        .toPromise()
                        .then(response => response.json())
    }
    //删除财年调整
    deleteFreeze(frozenItCode: string) {
        return this.http.delete(environment_java.server+'borrow/frozen-people/' + frozenItCode)
                        .toPromise()
                        .then(response => response.json())
    }
}
