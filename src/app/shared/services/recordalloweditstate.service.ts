
import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { WindowService } from "app/core";
declare var window;

@Injectable()
export class RecordAllowEditStateService {
    constructor(private http: Http,private windowService: WindowService) { }

    /**
     * 获取业务记录可编辑状态（返回值 0：不可编辑、1：可编辑、2：记录不存在）
     */
    getRecordAllowEditState(recordalloweditstatequery: RecordAllowEditStateQuery,allowEditFun?) {
        let recordAllowEditStateQuery = {
            FunctionCode : recordalloweditstatequery.FunctionCode,
            RecordID : recordalloweditstatequery.RecordID
        };
        this.http.post(environment.server + "GetRecordAllowEditState", recordAllowEditStateQuery).pipe(
        map(res => res.json()))
        .subscribe(data => {
            if (data && data.Result) {
                switch (data.Data) {
                    case "0"://不可以编辑 跳转到详情页面
                        this.windowService.alert({ message: "该记录不可编辑", type: "warn" }).subscribe(() => {
                            window.location.href = recordalloweditstatequery.NotAllowEditLink;
                        });
                        break;
                    case "2"://系统里没有对应的记录前端给出提示
                        this.windowService.alert({ message: "系统里没有该记录", type: "warn" }).subscribe(() => {
                            window.location.href = recordalloweditstatequery.NotFoundRecordLink;
                        });
                        break;
                    case "1"://可以编辑
                        if (allowEditFun instanceof Function) {
                            allowEditFun();
                        }
                        break;
                }
            }
        });
    }
}
//获取业务记录可编辑状态 参数
export class RecordAllowEditStateQuery {
    FunctionCode: any = "";//功能编码
    RecordID: any = "";//业务记录ID
    NotAllowEditLink: any = "";//不可以编辑 路由地址
    NotFoundRecordLink: any = "";//没有记录 路由地址
}
//功能编码枚举值
export let RecordState = {
    indiaSaleContract : "11",//用印管理_销售合同
    indiaPurchaseContract : "12",//用印管理_采购合同
    // 采购管理_采购申请 : 21
    // 采购管理_采购订单 : 22
    // 销售订单 : 31
    // 物料管理_一般物料 : 41
    // 物料管理_返款服务物料 : 42
    // 物料管理_物料主数据修改 : 43
    // 物料管理_物料扩展 : 44
    // 物料管理_物料变更 : 45
    // 供应商管理 : 51
    reinvoiceRed : "61",// 冲红退换货_冲红
    reinvoiceReturn : "62",// 冲红退换货_退换货
    // 承诺管理_华为承诺申请 : 71
    // 承诺管理_DCG承诺申请 : 72
}