
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { environment } from "../../../environments/environment";

/** 接口地址 */
const getToDoTaskCount = "SalesmanHomePage/GetToDoTaskCount";//我的待审批任务总数
const unReaderCount = "Services/MessageService/UnReaderCount?itcode=";//获取指定ITCODE人员未读取的消息总数
@Injectable()
export class HeaderService {
    constructor(private http: Http) { }

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(map(res => res.json()));
    }

    /**
     * 我的待审批任务总数
     */
    getToDoTaskCount(): Observable<any> {
        return this.repJson(this.http.get(environment.server + getToDoTaskCount));
    }

    /**
     * 我的消息总数
     */
    unReaderCount(itcode): Observable<any> {
        return this.repJson(this.http.post(environment.server + unReaderCount + itcode, null));
    }
}
