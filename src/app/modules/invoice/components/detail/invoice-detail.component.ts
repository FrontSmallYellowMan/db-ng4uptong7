import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DbWfviewComponent} from 'app/shared/index';
import { InvoiceInfo } from "../apply/invoice/invoice-info";
import { InvoiceApproveService } from "../../services/invoice/invoice-approve.service";
import { Location } from "@angular/common";
declare var window;

@Component({
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceInfo: InvoiceInfo;
  public approveList: any[] = new Array();
  public invoiceId: string = "";
  @ViewChild('wfview')
  wfView: DbWfviewComponent; 
  dataPerson : any;
  constructor(
    private invoiceApproveService: InvoiceApproveService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router) { }

  ngOnInit() {
     this.getUserData();
  } 
  
  getUserData  () :void{
      this.invoiceInfo = new InvoiceInfo();
      this.route.params.subscribe((params) => {
          this.invoiceId = params['id'];
          this.invoiceApproveService.getInvoiceById(this.invoiceId).then(data => {
            this.invoiceInfo = data.item[0];
            this.invoiceInfo.statusName = this.getStatusName(this.invoiceInfo.invoiceStatus);
            this.approveList = data.item[1];
            this.wfView.onInitData(data.item[2]);
            this.dataPerson = {
                userID: data.item[0].applyItcode,
                userEN: data.item[0].applyItcode.toLocaleLowerCase(),
                userCN: data.item[0].applyUserName
            };
            this.approveList.forEach(approveItem => {
                let dataperson = {
                  userID: approveItem.operateItCode,
                  userEN: approveItem.operateItCode.toLocaleLowerCase(),
                  userCN: approveItem.operateUserName
                }
                approveItem.user = dataperson;
            });
          }) 
      });
  }

  getStatusName(invoiceStatus: number): string {
        let statusName = "";
        switch (invoiceStatus) {
            case 0:
                statusName = "开始";
                break;
            case 1:
                statusName = "商务已接收";
                break;
            case 2:
                statusName = "已上传财务";
                break;
            case 3:
                statusName = "财务已接收";
                break;
            case 4:
                statusName = "银行已取走";
                break;
            case 5:
                statusName = "银行拒收";
                break;
            case 6:
                statusName = "拒收后商务取走";
                break;
            case 7:
                statusName = "拒收后申请人取走";
                break;
            case 8:
                statusName = "银行退票";
                break;
            case 9:
                statusName = "退票后商务取走";
                break;
            case 10:
                statusName = "退票后申请人取走";
                break;
            case 11:
                statusName = "完成";
                break;
            case 12:
                statusName = "失败";
                break;
            case 13:
                statusName = "草稿";
                break;
            case 14:
                statusName = "已取回";
                break;
            case 15:
                statusName = "已换票";
                break;
            default:
                statusName = "其他";
        }
        return statusName;
    }

  goback() {
        //this.location.back();
        window.close();
    }
}  