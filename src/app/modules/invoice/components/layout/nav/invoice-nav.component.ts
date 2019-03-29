import { Component, OnInit } from '@angular/core';
import { NavigationEnd, ActivatedRoute } from '@angular/router';
import { Http } from "@angular/http";
import { environment_java } from 'environments/environment';
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";

@Component({
  selector: 'invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent implements OnInit {
    constructor(
      private http: Http,
      private invoiceApplyService: InvoiceApplyService
    ) { }
    public open;
    public open2;
    public flag = '0';
    public plantformCode ='';
    public salesman:boolean =  true;//现改为销售员都可见
    public business:boolean =  false;
    public financial:boolean =  false;
    public admin:boolean =  false;
    public routerLinkStr ="";
    ngOnInit() {
      this.open = true;
      this.open2=true;
      this.invoiceApplyService.getLoginUser()
            .then(user => {
                this.plantformCode = user.sysUsers.flatCode.length === 1 ? "0" + user.sysUsers.flatCode : user.sysUsers.flatCode;
      });

      this.http.get(environment_java.server+"common/getUserRoles",null).toPromise()
         .then(res=>{
            let data = res.json();
            if(data.success){
                let roleCodes = data.item;
                //财务人员可见   
                if(roleCodes.indexOf("0000000009")>= 0){
                    this.financial = true;
                }  
                 //商务人员可见   
                if(roleCodes.indexOf("0000000008")>= 0){
                    this.business = true;
                }  
                 //销售员/销售助理可见   
                if(roleCodes.indexOf("0000000001")>= 0 || roleCodes.indexOf("0000000002")>= 0){
                    this.salesman = true;
                }
                 //管理员   
                if(roleCodes.indexOf("0000000010")>= 0){
                    this.admin = true;
                }   
            }
            if(this.financial){
              this.routerLinkStr = "/invoice/tradeticket/approveList/2";
            }  
            if(this.business){
              this.routerLinkStr = "/invoice/tradeticket/approveList/0";
            }
            if(this.salesman || this.admin){
              this.routerLinkStr = "/invoice/tradeticket/list";
            }
        }
        ); 
    }
    changeFlag(flag){
      this.flag = flag;
    }
}
