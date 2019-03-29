import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment_java, environment} from '../../../../../../environments/environment';

export class Query {
  queryStr: string = '';
  pageSize: number = 10;
  pageNo: number = 1;
}


@Injectable()
export class JIqSelectService {

  constructor(private http: Http){}

 /**
   *获取下拉框列表，.net后台
   */
  getOptionList(api: string, query: any,java:boolean){
    if(java){
       return this.http.post(environment_java.server + api, query)
                    .toPromise()
                    .then(response => response.json())
    }else{
       return this.http.post(environment.server + api, query)
                    .toPromise()
                    .then(response => response.json())
    }
   
  }
}