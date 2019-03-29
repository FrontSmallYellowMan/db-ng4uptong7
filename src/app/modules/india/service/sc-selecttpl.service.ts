
import {map} from 'rxjs/operators/map';

import {filter} from 'rxjs/operators/filter';
import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';
declare var window: any;

/**
 * 接口地址
 */
const api_ectemplate = "E_Contract/GetECTemplate";
const api_getecf = "E_Contract/GetECFavorites";
const api_delecf = "E_Contract/DeleteECFavorite";
const api_getecfid = "E_Contract/GetFavoriteContents";
const api_customerUploadFilesUrl ="E_Contract/CreateAccessCCSCBase";//自定义模板 上传附件
// const downloadIp = "http://10.0.1.26:88/";


export class EctplParams {
  public BizScope:	string = ""; //登录人业务范围
  public Domain:	string = "国内销售合同"; //领域
  public Category:	string = "硬件合同"; //合同类型
}
export class Ectpl{
  public TemplateID:	string; //—模板ID *
  public TemplateName:	string; //--模板名称
  public Category:	string ; //--类型
  public ApplyTo:	string; //—应用于 *
  public Domain:	string ; // --领域
}

export class OwntplParams {
  public Name:	string; //--我的私藏名称，若查询全部：Name = null
  public Owner:	string; //--私藏所有者ItCode
}
export class Owntpl {
  public Name:	string ; //--我的私藏名称
  public Owner:	string ; //--私藏所有者ItCode
  public Contents:	string ; //--我的私藏内容（JSON格式）
  public TemplateID:	string ; //--模板ID
  public ContractType:	string ; //--合同类型（硬件? 软件? 服务?）
}

@Injectable()
export class ScSelectService {
    constructor(private http: Http) { }
    repJson(observable: Observable<Response>):Observable<any> {
        return observable.pipe(filter(res => res["_body"].length > 0),map(res => res.json()),);
    }
    /**
     * 获取合同模板选择
     */
    get_ectemplate(params: any):Observable<any> {
        return this.repJson(this.http.post(environment.server + api_ectemplate, params));
    }

    /**
    * 获取我的私藏
    */
    get_getEcfavorites(params: any):Observable<any> {
        return this.repJson(this.http.post(environment.server + api_getecf, params));
    }

    /**
    * 删除我的私藏
    */
    del_delEcfavorites(params: any):Observable<any> {
        return this.repJson(this.http.post(environment.server + api_delecf, params));
    }

    /**
    * 根据id查询我的私藏模板
    */
    get_getEcfavoritesId(params: any):Observable<any> {
        return this.repJson(this.http.post(environment.server + api_getecfid+"/"+params, null));
    }

    /**
     * 自定义模板上传附件
     */
     uploadCustomerFile() {
       return environment.server + api_customerUploadFilesUrl;
     }

}
