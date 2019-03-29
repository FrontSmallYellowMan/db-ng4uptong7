import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions} from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

//@Injectable()

export class Query {
  queryStr: string = '';
  tabName: number;
  applyType:number;
  pageSize: number = 10;
  pageNo: number = 1;
  enterShowData:boolean=true;//是否默认显示数据
  filterPromis:string;//保存需要过滤的查询列表的条件

  constructor(
    private tab:number, 
    private apply:number)
    {
    this.tabName =  tab;
    this.applyType = apply;
  }
}

@Injectable()
export class SelectSearchService {

  constructor(private http: Http){}

  //获取下拉框列表
  getOptionList(query: Query){
    //console.log(query);
    return this.http.post(environment.server+ 'material/basedata/get', query)
                    .toPromise()
                    .then(response => response.json())
  }

  searchTax(query:Query){
    return this.http.post(environment.server+ 'material/basedata/Tax', query)
    .toPromise()
    .then(response => response.json())
  }

}
