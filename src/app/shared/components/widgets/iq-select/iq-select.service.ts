import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment, environment_java } from '../../../../../environments/environment';

export class Query {
  queryStr: string = '';
  pageSize: number = 10;
  pageNo: number = 1;
}


@Injectable()
export class IqSelectService {

  constructor(private http: Http){}

  /**
   *获取下拉框列表，.net后台
   */
  getOptionList(api: string, query: any){
    return this.http.post(environment.server + api, query)
                    .toPromise()
                    .then(response => response.json())
  }

  /**
   *获取下拉框列表，java后台
   */
  getOptionList_java(api: string, query: any){
    return this.http.post(environment_java.server + api, query)
                    .toPromise()
                    .then(response => response.json())
  }
}