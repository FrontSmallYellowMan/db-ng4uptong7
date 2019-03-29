import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { environment } from '../../../../environments/environment';

export class formData {
    ID: any = {
        required: false,
        value: '',
        isValid: false
    };
    ERPOrderNumber: any = {
        required: false,
        value: '',
        isValid: false
    }; // 采购订单号
    AddTime: any = {
        required: false,
        value: '',
        isValid: false
    };
    CostCenter: any = {
        required: false,
        value: '',
        isValid: false
    };
    Department: any = {
        required: false,
        value: '',
        isValid: false
    };
    Platform: any = {
        required: true,
        value: '',
        isValid: false
    };         //平台
    
    FlatCode:any={
        required: true,
        value: '',
        isValid: false
    }//平台编号
    ApplicantItCode: any = {
        required: true,
        value: '',
        isValid: true
    }; //申请人ITcode
    ApplicantName: any = {
        required: true,
        value: '',
        isValid: true
    };   //申请人名称
    Telephone: any = {
        required: true,
        value: '',
        isValid: false
    };          //电话
    OrderType: any = {
        required: false,
        value: '',
        isValid: false
    };          // 采购订单类型
    CompanyCode: any = {
        required: true,
        value: '',
        isValid: true
    }; // 公司代码
    CompanyName: any = {
        required: true,
        value: '',
        isValid: true
    };         // 公司名称
    InsiderTraderITCode: any = {
        required: false,
        value: '',
        isValid: false
    }; // 内部交易人ITcode
    InsiderTraderName: any = {
        required: true,
        value: '',
        isValid: false
    };        //内部交易人名称
    FactoryCode: any = {
        required: true,
        value: '',
        isValid: false,
        invalidTip: ''
    };        //需货工厂编号
    VendorNo: any = {
        required: true,
        value: '',
        isValid: false,
        invalidTip: ''
    };        //供货工厂编号
    TrackingNumber: any = {
        required: true,
        value: '',
        isValid: false,
        invalidTip: ''
    }; // 需求跟踪号
    MBLNR: any = {
        required: true,
        value: '',
        isValid: false
    }; // 物料凭证号
    ApproveState: any = {
        required: false,
        value: '',
        isValid: false
    }; // 采购订单状态,提交还是保存草稿
    PruchaseAmount: any = {
        required: false,
        value: 0,
        isValid: false
    }; // 总金额
    PurchaseOrderDetails: any = {
        required: false,
        value: '',
        type: 'list',
        isValid: false
    }; // 采购清单列表
    PurchaseOrderAccessories: any = {
        required: false,
        value: '',
        type: 'list',
        isValid: false
    }; // 上传附件
    WFApproveUserJSON: any =[]; // 审批人信息
}

@Injectable()
export class UB_RelatedService {
    constructor( private http: Http) {}

    // 获取采购申请
    getCurrentUserInfo(){
        return this.http.get(`${environment.server}base/GetCurrentUserInfo`).toPromise().then(response => response.json());
    }
    // 获取采购申请
    getPruchaseOrder(id){
        return this.http.get(`${environment.server}PurchaseManage/GetPruchaseOrder/${id}`).toPromise().then(response => response.json());
    }
    // 获取审批历史
    getApproveHistory(purchaseorderid){
        return this.http.post(`${environment.server}PurchaseManage/PurchaseOrderApproveHistory/${purchaseorderid}`, {}).toPromise().then(response => response.json());
    }
    // 重新提交走流程
    reloadApproveOrder(postData){
        return this.http.post(`${environment.server}PurchaseManage/ApproveOrder`, postData).toPromise().then(response => response.json());
    }
    // 重新提交走流程
    getApproveOrderId(ApproveOrderID){
        return this.http.get(`${environment.server}PurchaseManage/GetCurrentTaskId/${ApproveOrderID}`).toPromise().then(response => response.json());
    }
    // 保存数据
    saveData(postData){
        return this.http.post(`${environment.server}PurchaseManage/SavePurchaseOrder`, postData).toPromise().then(response => response.json());
    }
    // 查询销售合同
    getMyApplyContracts(postData){
        return this.http.post(`${environment.server}PurchaseManage/GetContractListForUB`, postData).toPromise().then(response => response.json());
    }
    // 查询销售合同
    getUBPurchaseOrderWFConfig(postData){
        return this.http.post(`${environment.server}PurchaseManage/GetUBPurchaseOrderWFConfig`, postData).toPromise().then(response => response.json());
    }
    // 所属平台
    getPlatform(){
        return this.http.post(`${environment.server}base/basedata/GetPlatform`, null).toPromise().then(response => response.json());
    }
    // 校验需求跟踪号
    validateRequiredTracing(postData){
        return this.http.post(`${environment.server}PurchaseManage/CheckTraceNo`, postData).toPromise().then(response => response.json());
    }
    // 校验物料号号
    getMaterialInfo(num){
        return this.http.get(`${environment.server}PurchaseManage/GetMaterialInfo/${num}`).toPromise().then(response => response.json());
    }
}
export class ApproveModal{
    userCN:string;
    userEN:string;
}
export class WFApproverUser{
    UserSettings:any=[];
}
