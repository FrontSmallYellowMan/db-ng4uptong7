import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { Pipe, PipeTransform } from '@angular/core';

@Injectable()
export class IndexContractService {

  constructor(private http: Http) {}

  /**获取销售合同列表*/
  getContractList(query: ContractQuery) {
    return this.http.post(environment.server + 'SalesmanHomePage/GetContractList', query)
      .toPromise()
      .then(response => response.json());
  }
}

@Pipe({
  name: 'contractInfoTransform'
})
export class ContractInfoPipe implements PipeTransform {
  transform(value: any, exponent: any): any {
        let name: any;
        if (exponent === "PurchaseNotified") {//采购通知

            switch (value) {
                case "0":
                    name = "未发送";
                    break;
                case "1":
                    name = "已发送";
                    break;
                default:
                    name = "未发送";
                    break;
            }
            return name;

        } else if (exponent === "SC_Status") {
            switch (value) {
                case 0:
                    name = "草稿";
                    break;
                case 1:
                    name = "申请中";
                    break;
                case 2:
                    name = "已完成";
                    break;
                case 3:
                    name = "驳回";
                    break;
                default:
                    break;
            }
            return name;
        }

    }
}

export class ContractQuery {
  Type: string  = "Stock";//Stock-待备货 Print-待用印 UnSales-待开销售
  PageSize: number;
  CurrentPage: number;
}
export class Contract {
    SC_Code:any; //销售合同编号
    TemplateID:any; //模板ID
    MainContractCode:any; //合同号
    ContractType:any; //合同类型(硬件，软件，服务)
    ContractSource:any; //合同创建（自定义，模板）
    SellerCompany:any; //我方主体
    BuyerName:any; //客户名称
    ContractMoney:any; //合同金额
    SealApprovalTime:any; //印章岗审批完成时间
    PurchaseNotified:any; //采购通知
    SubmitTime:any; //提交审批时间
    CreateTime:any; //创建时间
    SC_Status:any; //合同状态
    CurrentLink:any; //当前审批环节
    CurrentTreatment:any; //当前处理人
    CurrentPage:any; //当前页码
    PageSize:any; //每页数据条数
    TotalCount:any; //总共数据条数
}