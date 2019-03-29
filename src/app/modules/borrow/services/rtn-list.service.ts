import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable ,  Subject } from 'rxjs';
import { environment_java } from "./../../../../environments/environment";

export class Query {
  public flowStatus: string;//原业务范围
  public pageSize: number;
  public pageNo: number;
}

export class BorrowReturnApply{//借用实物归还申请单
  public reservationNo:string;//预留号
  public applyId:	string;//申请单实体ID
  public applyNo:	string; //申请单号
  public applyItCode:	string; //申请人ItCode
  public applyUserName:	string; //申请人姓名
  public applyUserTel:	string; //申请人电话
  public applyUserNo:	string; //申请人编号
  public businessScopeCode: string;//业务范围代码
  public baseDeptName:	string;//本部
  public subDeptName:	string; //事业部
  public platformCode:string;//平台编码
  public platformName:	string; //平台名称
  public factory:	string;//工厂
  public oldVoucherNo1:	string;//原凭证号1
  public oldVoucherNo2:	string;//原凭证号2
  public voucherNo1:	string;//凭证号1
  public voucherNo2:	string;//凭证号2
  public voucherNo3:	string;//凭证号3
  public allopatryReturn:number=0;;//是否异地归还  0：否；1：是
  public pickupType: number=0;//取货方式  0：销售员自送；1：物流取货
  public returnTotalAmount: number;//归还总金额
  public returnMemo: string;//归还说明
  
  public flowStatus:	number;//流程状态
  public instId:	string;
  public org:	string;
  public currApprAuthors:	string;
  public apprReadors:	string;
  
  public currApprUserIds:	string;
  public createDate:	string;
  
  public flowCurrNodeName:	string;//当前流程节点名称
  
  public lastModifiedDate:	string; //最后修改时间
  
  
  
  public createBy:	string;//创建人
  
  public approvalIds:	string;//审批id 
  public lastModifiedBy:	string;// 最后修改人
  
  public version:	string;//流程版本
  
  public id:	string;
  
  public currApprAuthorsItcode:	string;//审批人itcode
  public flowCurrNodeId:	string;//当前流程节点Id

  public formId:	string;//自定义表单ID
  
    public operatingBorrow:number;
    public applyDate:string;
}

export class RtnTransport{//运输实体类
  public applyId:	string; //申请单实体ID
  public rtnTransportId:	string; //运输实体ID
  public rtnAddress:	string; //取货地址
  public rtnAddressId:	string; //取货地址Id
  public transportCode:	string; //运输方式编码
  public transportName:	string; //运输方式
  public transportNo:	string; //运输单号
  public transportUrl:	string; //运输URL
  public reservationNo:	string; //预留号
  public createBy:	string;
  public createDate:	string;
  public id:	string;
  public lastModifiedBy:	string;
  public lastModifiedDate:	string;
  public org:	string;
  public noApplySubmit:number;//无单调用标识0标识未调用，1调用成功，2调用失败
   public submitResult:string;//调用无单错误信息
}

export class RtnMaterielApp{//归还物料申请类
  public materielId:string; //物料实体ID
  public rtnTransportId:	string; //运输实体ID
  public applyId:	string; //申请单实体ID
  public meterialNo:	string; //物料编号
  public meterialMemo:	string;//物料描述
  public batch:	string; //批次
  public unit:	string; //单位
  public count:number;//数量
  public price:	number=0;//移动平均价
  public totalAmount:	number;//总价
  public onwayStore:	string; //借用在途库
  public createBy:	string;
  public createDate:	string;
  public id:	string;
  public lastModifiedBy:	string;
  public lastModifiedDate:	string;
  public org:	string;
  public unclearMaterialId:string;//未清项物料实体ID
  public unRtnCount:number;//未归还数量
}

//借用归还逻辑类
export class BorrowReturnApplyPo{
   public borrowReturnApply:BorrowReturnApply=new BorrowReturnApply();
   public rtnTransportPoList:RtnTransportPo[]=[];
}

//归还物料与运输信息逻辑类
export class RtnTransportPo{
   public rtnTransport:RtnTransport=new RtnTransport();
   public rtnMaterielAppList:RtnMaterielApp[]=[];
}



export class QualityTestReport{//产品质量检验报告单实体类
  public rptId:string; //报告单实体ID
  public applyId:	string; //申请单实体ID

  public loanStoreHouse:number=0;//借出库房  0：样品库；1：商品库；2：待修库；3：其它
  public giveReason:	number=0;//送检原因  0：退货；1：还租赁；2：批次到货质检；3：其它
  public testProject:	string; //检验项目
  public outerPackTest:	string; //外包装检查
  public machineAppearanceTest: string; //机器外观检查
  public electricalPerformanceTest:	string; //电性能检查
  public fileTest:	string;//附件检查
  public testResult:	string;//质检结论
  public remarks:	string;//备注
  public createBy:	string;
  public createDate:	string;
  public id:	string;
  public lastModifiedBy:	string;
  public lastModifiedDate:	string;
  public org:	string;
}


export class RtnMateriel{//归还物料明细表
  public materielId:string; //物料实体ID
  public applyId:	string; //申请单实体ID
  public rptId:string; //报告单实体ID
  public meterialNo:	string; //物料编号
  public meterialMemo:	string;//物料描述
  public batch:	string; //批次
  public unit:	string; //单位
  public count:number;//数量
  public price:	number=0;//移动平均价
  public totalAmount:	number;//总价
  public rtnInStore:	string; //建议还入库
  public createBy:	string;
  public createDate:	string;
  public id:	string;
  public lastModifiedBy:	string;
  public lastModifiedDate:	string;
  public org:	string;
  public unclearMaterialId:string;//未清项物料实体ID
  public unRtnCount:number;//未归还数量
}


//归还物料与运输信息逻辑类
export class QualityTestReportPo{
   public qualityTestReport:QualityTestReport=new QualityTestReport();
   public rtnMaterielList:RtnMateriel[]=[];
}

@Injectable()
export class BorrowReturnListService {

   constructor(private http: Http){};

    //获取借用实物归还申请单列表
    getBorrowReturnList(query: Query,applyFlag: string) {
    //console.error(query);
    let { flowStatus, pageSize, pageNo } = query;
   
    if(applyFlag==="1"){
        //我的申请
      return this.http.get(environment_java.server +"borrow/rtn-applys", { params: {flowStatus, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json());
    }else{
    //我的审批
    return this.http.get(environment_java.server +"borrow/rtn-applys/my-approval", { params: {flowStatus, pageSize, pageNo } })
      .toPromise()
      .then(response => response.json());
    }

     
   
  }
   getUnClearItemByReservationNo(reservationNo:string){
     let applyItCode="";
    return this.http.get(environment_java.server +"borrow/unclear-material/"+reservationNo,{ params: { applyItCode } })
      .toPromise()
      .then(res =>
                res.json()
            );
   }

    getBorrowRtnCustomer(customerName:string){
     return this.http.get(environment_java.server +"borrow/customer-address/delivery-address/"+customerName)
      .toPromise()
      .then(response => response.json())
   }

     //获取页面option选项值
   getBorrowPageAttrOption(type:number){
     return this.http.get(environment_java.server +"borrow/borrow-applys/"+type+"/base-code")
      .toPromise()
      .then(response => response.json())
   }
 
   postBorrowRtnApply(rtnAppPo:BorrowReturnApplyPo){
      return  this.http.post(environment_java.server + "borrow/rtn-apply", rtnAppPo).toPromise()
            .then(response => response.json());
                
   }
    putBorrowRtnApply(rtnAppPo:BorrowReturnApplyPo){
    
    return this.http.put(environment_java.server + "borrow/rtn-apply/" + rtnAppPo.borrowReturnApply.applyId, rtnAppPo).toPromise()
            .then(response => response.json());
   }
//根据申请单Id获取申请单详情
    queryApplyDetail(applyId: string) {
        return this.http.get(environment_java.server +"borrow/rtn-apply/" + applyId).toPromise()
            .then(res => res.json());
    }

   /**
     * 删除单个申请单
     * @param applyId 
     */
    deleteRtnApply(applyId: string) {
       // console.log("delete");
        return this.http.delete(environment_java.server +"borrow/rtn-apply/apply/" + applyId).toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }

      private handleError(error: any): Promise<any> {
        //console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

       /**
     * 新建直接提交
     * @param borrowAmount 
     * @param deptRelations 
     */
    submitApply(rtnAppPo:BorrowReturnApplyPo) {

      if(rtnAppPo.borrowReturnApply.id){
         return this.http.put(environment_java.server +"borrow/rtn-apply/submit/" + rtnAppPo.borrowReturnApply.applyId, rtnAppPo).toPromise()
            .then(res => res.json()); 
      }else{
        return this.http.put(environment_java.server +"borrow/rtn-apply/submit-unsave", rtnAppPo).toPromise()
            .then(res => res.json());
      }
        
    }

       /**
     * 查询待我审批的条数
     */
    queryWaitForApprovalNum(){
        return this.http.get(environment_java.server + "borrow/rtn-apply/wait-me",null).toPromise()
            .then(res=>res.json().item as number);
    }

    /**
     * 获取用户角色
     */

    getUserRole(){
        return   this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
         .then(res => res.json());
    }
}