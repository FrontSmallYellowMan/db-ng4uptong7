
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Http, Response } from "@angular/http";
import { environment } from "../../../environments/environment";
import { WindowService } from 'app/core';
@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor( 
    private router: Router,
    private windowService:WindowService,
    private http:Http ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):boolean {
    // 已登录返回 true
    // if (localStorage.getItem('ticket')) {
    //   return true;
    // }else{
    // // 未登录 跳转到登录页面 返回false
    // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    // return false;
    // }
    let url: string = state.url;
    let queryParamMap=route.queryParamMap;//保存查询参数
    return this.isTestApprovalRight(queryParamMap);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  //验证链接是否包含APID，用来判断用户是否具备审批权限
  isTestApprovalRight(queryParamMap):boolean {
    if(queryParamMap&&queryParamMap.has('APID')) {//如果存在APID则需要验证审批权限
       this.http.post(environment.server+'common/CheckApproveUser',{'APID':queryParamMap.get('APID')}).pipe(map(Response=>Response.json())).subscribe(data=> {
        
        if(!data.Result) {
           this.windowService.alert({message:data.Message,type:'fail'}).subscribe(()=> {
              this.router.navigate(['/']);     
           }); 
         }

       });

    }
    return true;
  }

}
