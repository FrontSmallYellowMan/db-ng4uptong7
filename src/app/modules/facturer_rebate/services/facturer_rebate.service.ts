import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers, Response } from '@angular/http';
import { Subject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

declare var window;

// 用于列表查询的参数
export class QueryData {
    ItCode: string = '';   // itCode
    FactoryName: string = '';    // 厂商名称
    AgentName: string = '';     // 代理商名称
    SalesOrganization: string = ''; // 销售组织
    IncentiveNumber: string = ''; // 激励编号
    AmountBegin: string = ''; // 返款范围-begin
    AmountEnd: string = ''; // 返款范围-end
    Search: any = {
        "No": false,   //未占用
        "Part": false, /// 部分占用
        "All": false  /// 全部占用
    };
    PageIndex = 1;
    PageSize = 10;
}
// 新增或者编辑的配置信息
export class new_editConfigDatas {

}

// 用于新增或者编辑
export class SaveData {
    ID: any = {
        required: false,
        value: '',
        isValid: false
    };
    CreateItCode: any = {
        required: false,
        value: '',
        isValid: false
    };  //创建人Itcode  
    CreateName: any = {
        required: false,
        value: '',
        type: 'list',
        isValid: false
    };         //创建人名称
    CreateTime: any = {
        required: false,
        value: '',
        type: 'date',
        isValid: false
    }; //创建日期
    FactoryName: any = {
        required: true,
        value: '',
        isValid: false
    };   //厂商名称
    AgentName: any = {
        required: true,
        value: '',
        isValid: false
    };          //代理商名称
    AgentNameNumber: any = {
        required: false,
        value: '',
        isValid: false
    };          //代理商代码
    SalesOrganization: any = {
        required: true,
        value: '',
        isValid: false
    }; // 销售组织名称
    SalesOrganizationCode: any = {
        required: false,
        value: '',
        isValid: false
    };         // 销售组织代码
    IncentiveNumber: any = {
        required: false,
        value: '',
        isValid: false
    }; // 激励编号
    RefundAmount: any = {
        required: true,
        value: '',
        isValid: false
    };        //返款金额
    PreAmount: any = {
        required: false,
        value: '',
        isValid: false
    };        //预占金额
    AvailableAmount: any = {
        required: false,
        value: '',
        isValid: false
    };        //剩余金额
    InvalidTime: any = {
        required: false,
        value: '',
        type: 'date',
        isValid: false
    }; // 返款失效日期
    AfterAmount: any = {
        required: false,
        value: '',
        isValid: false
    }; // 已占用金额
    UpdateTime: any = {
        required: false,
        value: '',
        type: 'date',
        isValid: false
    };
    IsDelete: any = {
        required: false,
        value: '',
        isValid: false
    };
}
// 添加服务
@Injectable()
export class RebateService {
    constructor(private http: Http) { }
    uploadUrl: any = `${environment.server}PipelineManage/UploadAccessory`;
    // 查询权限
    getAuthority() {
        return this.http.get(`${environment.server}RefundManage/GetPermission`).toPromise().then(response => response.json());
    }
    // 判断是否是ie
    isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window || window.navigator.userAgent.indexOf('Edge') > -1) {
            return true;
        } else {
            return false;
        }
    }
    // 导出当前列表
    exportRebateList(postData) {
        return this.http.post(`${environment.server}RefundManage/ExportExcel`, postData, { responseType: 3 }).toPromise().then(response => response.json());
    }
    // 列表查询
    getRebateList(postData) {
        return this.http.post(`${environment.server}RefundManage/GetPageList`, postData).toPromise().then(response => response.json());
    }
    // 新增或者编辑保存数据
    saveRebate(postData) {
        return this.http.post(`${environment.server}RefundManage/Save`, postData).toPromise().then(response => response.json());
    }
    // 删除数据
    deleteRebate(postData) {
        return this.http.post(`${environment.server}RefundManage/Delete`, postData).toPromise().then(response => response.json());
    }
    // 编辑或查看数据
    getEditOrScanData(id) {
        return this.http.get(`${environment.server}RefundManage/Get/${id}`).toPromise().then(response => response.json());
    }
    // 获取个性信息
    getRoleFieldConfig(postData) {
        return this.http.post(`${environment.server}BaseData/GetRoleFieldConfig`, postData).toPromise().then(response => response.json());
    }
    // 编辑个性信息
    editRoleFieldConfig(postData) {
        return this.http.post(`${environment.server}BaseData/GetBussinessFieldConfig`, postData).toPromise().then(response => response.json());
    }
    /**
     * 更新个性化字段信息
     */
    updateRoleFieldConfig(postData) {
        return this.http.post(`${environment.server}BaseData/UpdateBaseFieldMsg`, postData).toPromise().then(response => response.json());
    }
    // 获取销售组织
    getSalesOrganization() {
        return this.http.get(`${environment.server}RefundManage/GetSalesOrganization`, null).toPromise().then(response => response.json());
    }
    // 获取代理商
    getAgentName(buyName) {
        return this.http.post(`${environment.server}E_Contract/GetBuyerInfo/${buyName}`, null).toPromise().then(response => response.json());
    }
    // 获取币种
    getCurrency() {
        return this.http.post(`${environment.server}base/basedata/GetCurrency`, null).toPromise().then(response => response.json());
    }
    // 获取省份
    getProvinceCityInfo() {
        return this.http.post(`${environment.server}initdata/GetProvinceCityInfo`, {}).toPromise().then(response => response.json());
    }
    // 所属平台
    getCurrentUser() {
        return this.http.post(`${environment.server}base/basedata/GetPlatform`, null).toPromise().then(response => response.json());
    }
    // 预计签约法人体
    getPageDataCompany(postData) {
        return this.http.post(`${environment.server}InitData/GetPageDataCompany`, postData).toPromise().then(response => response.json());
    }
    // 付款方式
    getPayMentMode() {
        return this.http.post(`${environment.server}PipelineManage/GetPayMentMode`, null).toPromise().then(response => response.json());
    }
    // 客户名称
    getBuyerInfo(buyerName) {
        return this.http.get(`${environment.server}PipelineManage/GetBuyerInfo/${buyerName}`).toPromise().then(response => response.json());
    }
}
