import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions, Headers, Response } from '@angular/http';
import { Subject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

// 用于列表查询的参数
export  class QueryData{
    ProjectName: string = '';   //项目名称
    CustomName: string = '';    //客户名称
    ProjectNo: string = '';     //项目编号
    SellerItCode: string = ''; //销售员itcode
    ProjectAmount: string = ''; //项目金额
    PageIndex= 1;
    PageSize= 10;
}
// 新增或者编辑的配置信息
export class new_editConfigDatas{
    // 客户资金来源
    CustomFundSource: any = [
        {
            name: '自有资金',
            value: 1
        },
        {
            name: '政府资金',
            value: 2
        },
        {
            name: '下家回款',
            value: 3
        },
        {
            name: '不详',
            value: '4'
        }
    ]
    // 项目类型
    ProjectType: any =[
        {
            name: '系统集成',
            value: 1
        },
        {
            name: '软件供货',
            value: 2
        },
        {
            name: '硬件供货',
            value: 3
        },
        {
            name: '服务项目',
            value: 4
        },
        {
            name: '其他',
            value: 5
        }
    ]
    // 项目状态
    ProjectState: any = [
        {
            name: 'Pipeline',
            value: 1
        },
        {
            name: 'UpSide',
            value: 2
        },
        {
            name: 'Commit',
            value: 3
        },
        {
            name: '已签未销',
            value: 4,
            disabled: true
        },
        {
            name: '已签已销(QTD)',
            value: 5,
            disabled: true
        },
        {
            name: 'Lost',
            value: 6
        }
    ]
}

// 用于新增或者编辑
export class SaveData{
        ID:any = {
            required: false,
            value:'',
            isValid: false
        };
        SellerItCode:any = {
            required: false,
            value:'',
            isValid: false
        };  //销售员Itcode  
        SellerName:any = {
            required: false,
            value:'',
            type: 'list',
            isValid: false
        };         //销售员Name
        CreateTime:any = {
            required: false,
            value:'',
            type: 'date',
            isValid: false
        }; //创建日期
        CustomName:any = {
            required: true,
            value:'',
            isValid: false
        };   //客户名称
        CustomNo:any = {
            required: false,
            value:''
        };          //客户编号
        ProjectState:any = {
            required: false,
            value:''
        };
        ProjectProgress:any = {
            required: false,
            value:''
        };         //项目进度
        ProjectName:any = {
            required: true,
            value:'',
            isValid: false
        };
        ProjectNo:any = {
            required: false,
            value:''
        };        //项目编号
        Currency:any = {
            required: false,
            value:''
        };
        CurrencyCode:any = {
            required: false,
            value:''
        };
        ProjectAmount:any = {
            required: true,
            value:'',
            type: 'int',
            isValid: false
        };       //项目金额
        ProjectType:any = {
            required: false,
            value:''
        };
        Platform:any = {
            required: false,
            value:''
        };
        PlatformCode:any = {
            required: false,
            value:''
        };
        PreSignBody:any = {
            required: false,
            value:''
        };
        PreSignDate:any = {
            required: true,
            value:'',
            type: 'date',
            isValid: false
        };      //预计签约日期
        PreDeliveryDate:any = {
            required: true,
            value:'',
            type: 'date',
            isValid: false
        };   //预计交货日期
        PreOrderDate:any = {
            required: false,
            value:'',
            type: 'date',
            isValid: false
        };     //预计下单日期
        PreMarginRate:any = {
            required: true,
            value:'',
            type: 'int',
            isValid: false,
            tip: '请填写预计毛利率,填写范围：0~999，保留两位小数'
        };              //预计毛利率
        CustomFundSource:any = {
            required: false,
            value:'',
            type: 'int'
        };             //客户资金来源-1自有资金2政府资金3下家回款4不详
        PaymentType:any = {
            required: false,
            value:''
        };
        PaymentTerms:any = {
            required: false,
            value:''
        };
        FinalUserName:any = {
            required: true,
            value:'',
            isValid: false
        };
        FinalUserProvince:any = {
            required: true,
            value:'',
            isValid: false
        };
        LostReason:any = {
            required: false,
            value:'',
            isValid: false
        };
        CreateItCode:any = {
            required: false,
            value:''
        };        //创建者ITCOde
        CreateName:any = {
            required: false,
            value:''
        };            //创建者Name
        IsBusiness:any = {
            required: false,
            value:''
        };        
        Remark:any = {
            required: false,
            value:''
        };
        AddTime:any = {
            required: false,
            value:'',
            type: 'date'
        };        
        UpdateTime:any = {
            required: false,
            value:'',
            type: 'date'
        };
        
        PipelineAccessories:any = [
        ]
}
// 添加服务
@Injectable()
export class PipelineService{
    constructor(private http: Http){}
    uploadUrl: any = `${environment.server}PipelineManage/UploadAccessory`;
    // 列表查询
    getPipelineList(postData){
        return this.http.post(`${environment.server}PipelineManage/GetPageList`, postData).toPromise().then(response => response.json());
    }
    // 新增或者编辑保存数据
    savePipeline(postData){
        return this.http.post(`${environment.server}PipelineManage/Save`, postData).toPromise().then(response => response.json());
    }
    // 编辑或查看数据
    getEditOrScanData(id){
        return this.http.get(`${environment.server}PipelineManage/Get/${id}`).toPromise().then(response => response.json());
    }
    // 获取个性信息
    getRoleFieldConfig(postData){
        return this.http.post(`${environment.server}BaseData/GetRoleFieldConfig`, postData).toPromise().then(response => response.json());
    }
    // 获取个性信息
    editRoleFieldConfig(postData){
        return this.http.post(`${environment.server}BaseData/GetBussinessFieldConfig`, postData).toPromise().then(response => response.json());
    }
    /**
     * 更新个性化字段信息
     */
    updateRoleFieldConfig(postData){
        return this.http.post(`${environment.server}BaseData/UpdateBaseFieldMsg`, postData).toPromise().then(response => response.json());
    }
    // 获取币种
    getCurrency(){
        return this.http.post(`${environment.server}base/basedata/GetCurrency`, null).toPromise().then(response => response.json());
    }
    // 获取省份
    getProvinceCityInfo(){
        return this.http.post(`${environment.server}initdata/GetProvinceCityInfo`, {}).toPromise().then(response => response.json());
    }
    // 所属平台
    getCurrentUser(){
        return this.http.post(`${environment.server}base/basedata/GetPlatform`, null).toPromise().then(response => response.json());
    }
    // 预计签约法人体
    getPageDataCompany(postData){
        return this.http.post(`${environment.server}InitData/GetPageDataCompany`, postData).toPromise().then(response => response.json());
    }
    // 付款方式
    getPayMentMode(){
        return this.http.post(`${environment.server}PipelineManage/GetPayMentMode`, null).toPromise().then(response => response.json());
    }
    // 客户名称
    getBuyerInfo(buyerName){
        return this.http.get(`${environment.server}PipelineManage/GetBuyerInfo/${buyerName}`).toPromise().then(response => response.json());
    }
}
