
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { environment } from "../../../../environments/environment";

/** 接口地址 */
const getMyApprovalList = "SalesmanHomePage/GetMyApprovalList";//我的所有待办流程任务
@Injectable()
export class TaskService {
    constructor(private http: Http) { }

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(map(res => res.json()));
    }

    /**
     * 我的所有待办流程任务
     */
    savePurchaseContract(body: Query): Observable<any> {
        return this.repJson(this.http.post(environment.server + getMyApprovalList, body));
    }
}

/** 获取我的代办流程任务 查询条件 */
export class Query {
    TaskType:any  = "1"; //1待办任务；2已审批任务
    SearchKey:string  = "";
    CurrentPage:any  = "1";
    PageSize:any  = "10";
}