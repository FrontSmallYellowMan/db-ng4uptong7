import { Injectable } from '@angular/core';
import { Http,URLSearchParams,
  RequestOptionsArgs,
  ConnectionBackend, RequestOptions, XHRBackend, Headers,Response } from '@angular/http';

import 'rxjs/Rx';
import { Observable } from 'rxjs';
import { WindowService } from './window.service'

export { URLSearchParams ,RequestOptions};

declare var window;

@Injectable()
export class iqHttpService extends Http {

  status = {
     "status.400": "错误的请求。由于语法错误，该请求无法完成。",
     "status.401": "无权限访问",
     "status.402": "当前链接不是您的审批任务，无法审批！",
     "status.403": "无权限访问",//未经过授权访问等
     "status.404": "未找到。无法找到请求的位置。",
     "status.405": "方法不被允许。使用该位置不支持的请求方法进行了请求。",
     "status.406": "不可接受。服务器只生成客户端不接受的响应。",
     "status.407": "需要代理身份验证。客户端必须先使用代理对自身进行身份验证。",
     "status.408": "请求超时。等待请求的服务器超时。",
     "status.409": "冲突。由于请求中的冲突，无法完成该请求。",
     "status.410": "过期。请求页不再可用。",
     "status.411": "长度必需。未定义“内容长度”。",
     "status.412": "前提条件不满足。请求中给定的前提条件由服务器评估为 false。",
     "status.413": "请求实体太大。服务器不会接受请求，因为请求实体太大。",
     "status.414": "请求 URI 太长。服务器不会接受该请求，因为 URL 太长。",
     "status.415": "不支持的媒体类型。服务器不会接受该请求，因为媒体类型不受支持。",
     "status.416": "HTTP 状态代码 {0}",
     "status.500": "内部服务器错误。",
     "status.501": "未实现。服务器不识别该请求方法，或者服务器没有能力完成请求。",
     "status.503": "服务不可用。服务器当前不可用(过载或故障)。"
   };

  constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions, private windowservice: WindowService){
    super(_backend,_defaultOptions);
  }

  intercept(observable) {
      return Observable.create((observer) => {
        observable.subscribe(res => {
          observer.next(res);
          if(res.headers.get("pmcode") == 401){
            this.windowservice.alert({message:this.status['status.401'],type:"fail"}).subscribe(()=>{
              window.location.href = '/';
            });
          }

          if(res.headers.get("pmcode") == 402) {
            this.windowservice.alert({message:this.status['status.402'],type:"fail"}).subscribe(()=> {
              window.location.href = '/';
            });
          }
        },
         (err) => {
          //未登录时访问系统链接 记录当前链接 登陆后跳转
          if(window.localStorage.getItem('ticket')==null && window.location.href.indexOf('login') == -1){
            window.localStorage.setItem('url', window.location.href);
          }
          if(err.status == '401'){
            this.windowservice.alert({message:this.status['status.401'],type:"fail"}).subscribe(()=>{
              window.location.href = '/login';
            });
          }
          if (err.status == '403') {
            if (window.location.href.indexOf('login') == -1) {
              window.location.href = '/login';
            }
          }
          console.log('网络错误:'+err.status+' - '+this.status['status.'+err.status]);
          // this.windowservice.alert({message:this.status['status.'+err.status],type:"fail"});
          observer.error(err);
        }, () => {
          observer.complete();//注意添加这句，否则有可能一些第三方的包不能正常使用，如ng2-translate
        });
      })
  }

  //.filter(this.responseFilter)
  responseFilter(x){
    let flag = true;
    // console.log("-----");
    // console.log(x);
    // console.log("-----");
    this.windowservice.alert({message:"ddd",type:"fail"});
    if(x.status == 200){
       
      let resbody = x.json();
      if(resbody.status === undefined){
        return true;
      }
      if(resbody.status == 200){
        flag = true;
      }
      else if(resbody.status == 4041){
        console.log("-----");
        console.log(resbody);
        console.log("-----");
      }else{
        flag = true;
      }
    }
    return flag;
  }

  getRequestOptionArgs(options ? : RequestOptionsArgs): RequestOptionsArgs {

        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        // options.headers.append('Content-Type', 'application/json');

        if(window.localStorage.getItem('ticket')!=null){

          if(options.headers.get("ticket")==null || options.headers.get("ticket")!=window.localStorage.getItem('ticket') ){

            options.headers.get("ticket")==null ? options.headers.append("ticket", window.localStorage.getItem('ticket')) : options.headers.set("ticket",window.localStorage.getItem('ticket'));
            
            
          }
          
        }

        return options;
    }

  get(url: string, options?: RequestOptionsArgs){
    let _options:RequestOptionsArgs;

    if(options){
      //复制出新对象进行修改参数值,添加请求时间戳
      _options = options;
      if(_options["search"]){
        let searchParam = _options["search"];
        if(typeof searchParam === 'string'){
          _options["search"] = new URLSearchParams(searchParam);
        }else if(searchParam instanceof URLSearchParams){
          let t = new Date().getTime();
          if(searchParam.has("m")){
            searchParam.set("m"+t,""+t);
          }else{
            searchParam.set("m",""+t);
          }
        }
      }else{
        _options["search"] = new URLSearchParams("m="+new Date().getTime());
      }
    }else{
      _options = new RequestOptions({
        search: new URLSearchParams("m="+new Date().getTime())
      });
    }
    return this.intercept(super.get(url , this.getRequestOptionArgs(_options)));
  }

  post(url: string, body: any, options ? : RequestOptionsArgs){
    return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: any, options?: RequestOptionsArgs) {
    return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string, options?: RequestOptionsArgs) {
    return this.intercept(super.delete(url, this.getRequestOptionArgs(options)));
  }

}
