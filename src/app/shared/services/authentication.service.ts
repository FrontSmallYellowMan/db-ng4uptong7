
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { environment, environment_java } from "environments/environment";

@Injectable()
export class AuthenticationService {

  constructor( private http: Http ) { }

  getUserInfo() {
    let url = environment.server+'BaseData/GetCurrentUser';
    return this.http.post(url,null).pipe(map(res => res.json()));
  }

  logoutjava() {
    let url = environment_java.server+'/logout';
    return this.http.post(url,null).pipe(map(res => res.json()));
  }

}
