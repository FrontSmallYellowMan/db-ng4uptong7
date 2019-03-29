import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Http, Response } from '@angular/http';
import { environment } from "../../../../environments/environment";

const api_getSealsUrl = "S_Contract/GetOASealList";//获取用印数据

@Injectable()
export class SelectSealsService {

    constructor(private http: Http) { }

    repJson(observable: Observable<Response>):Observable<any> {
        return observable.map(res => res.json());
    }
    /**
     * 获取印章信息数据
     */
    getSealsData(body: any): Observable<any> {
        return this.repJson(this.http.post(environment.server + api_getSealsUrl, body));
    }
}

export class PurchaseContractInfo {// 采购合同用印文件部分--数据结构
  public ContractName = '';//合同名称
  public UserSetting = '';//用印审批节点-审批人信息
  public Platform_C_ID = '';//用印平台ID
  public Platform_C = '';//用印平台
  public ContractMoney : any = null;//用印金额
  public ContractContent = '';//合同内容摘要
  public SealInfoJson = '';//印章信息
  public AddTime = new Date;//add
  public MainCode = null;//采购合同用印编码
  public Pu_Code = null;//点击查看采购用印情况链接的参数
  public PurchaseContractInfoAccessories : Array<AccessoryList> = [];;//合同用印附件
}
export class AccessoryList {//附件列表
  public AccessoryID;
  public AccessoryName;
  public AccessoryURL;
  public AccessoryType;
  public CreatedTime;
  public CreatedByITcode;
  public CreatedByName;
  public InfoStatus
}
export class Seal {//用印信息
  SealData: any = [];
  PrintCount: any = "4";
}

export class sealsQuery{// 印章列表中印章信息
  public platfromid: string;  //平台id  (必传)
  public pagesize: number ; //每页记录数
  public currage: number ;  //当前页
  public name: string ;// 搜索关键字
}