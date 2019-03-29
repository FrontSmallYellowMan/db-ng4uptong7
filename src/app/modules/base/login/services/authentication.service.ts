
import {map} from 'rxjs/operators/map';
import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { environment, environment_java } from "environments/environment";

@Injectable()
export class AuthenticationService {
  constructor(private http: Http) {}

  login(username: string, password: string) {
    let url = environment.server + "/Account/Login";
    return this.http
      .post(url, { ITCode: username, PassWord: password }).pipe(
      map(res => res.json()));
  }

  loginjava(username: string) {
    let urljava = environment_java.server + "login/test?itcode=" + username;
    // 不用json返回，因为已经是object，再转成json会报错，出现登陆无权限bug
    return this.http.get(urljava, null);
  }

  getUserInfoByItCode(itcode: string) {
    let url = environment.server + "/base/GetUserByITCode/" + itcode;
    return this.http.post(url, null).pipe(map(res => res.json()));
  }

  removeUserinfo() {
    localStorage.removeItem("UserInfo");
  }

  logout() {
    localStorage.removeItem("ticket");
  }
}
