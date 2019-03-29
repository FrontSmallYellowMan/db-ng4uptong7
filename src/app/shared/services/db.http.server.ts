
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpServer {
    constructor(private http: Http) { }

    // get方法
    get(url: string, options?: RequestOptionsArgs) {
        return this.http.get(environment.server.concat(url), options).pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    
    // post方法
    post(url: string, body?: any, options?: RequestOptionsArgs) {
        return this.http.post(environment.server.concat(url), body, options).pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }

    // post方法
    postNoMap(url: string, body?: any, options?: RequestOptionsArgs) {
        return this.http.post(environment.server.concat(url), body, options);
    }
}