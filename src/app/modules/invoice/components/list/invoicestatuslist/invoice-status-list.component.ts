import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import {
  URLSearchParams,
  Headers,
  Http,
  RequestOptionsArgs,
  RequestOptions
} from "@angular/http";
import { Pager } from "app/shared/index";
import { WindowService } from "app/core";
import {
  UserInfo,
  InvoiceInfo,
  RestInfo,
  Query,
  InvoiceQueryPo
} from "../../../components/apply/invoice/invoice-info";
import {
  environment_java,
  dbomsPath
} from "../../../../../../environments/environment";

declare var window;

@Component({
  templateUrl: "./invoice-status-list.html",
  styleUrls: ["./invoice-status-list.scss"]
})
export class InvoiceStatusListComponent implements OnInit {
  ngOnInit(): void {}

  constructor(
    private windowService: WindowService,
    private router: Router,
    private http: Http
  ) {}
  javaurl: string = environment_java.server;
  public invoiceList; //列表数据
  //分页
  public pagerData = new Pager();

  public queryPo = new InvoiceQueryPo();

  public param = "";

  queryInvoiceList = function(isClick?) {
    let pagerData = this.pagerData;
    if (isClick) this.pagerData.pageNo = 1;
    let url =
      this.javaurl +
      "/invoice/queryInvoiceApplysByApplyItcodeAndTicketNumAndOtherConditionCheckoutDateDesc";
    this.queryPo.pageNo = pagerData.pageNo.toString();
    this.queryPo.pageSize = pagerData.pageSize.toString();
    this.queryPo.param = this.param;

    this.http
      .post(url, this.queryPo)
      .toPromise()
      .then(res => res.json())
      .then(res => {
        //console.log("88888888888 "+res.list.length);
        console.log("pageNo" + res.pageNo + "***" + res.currentPageSize);
        //pageNo
        if (res.list) {
          this.invoiceList = res.list;
        }
        if (res.pager && res.pager.total) {
          this.pagerData.set({
            total: res.pager.total,
            totalPages: res.pager.totalPages
          });
        }
      });
  };

  public currentPageSize;
  onChangePage = function(e) {
    if (this.currentPageSize != e.pageSize) {
      this.pagerData.pageNo = 1;
    }
    this.currentPageSize = e.pageSize;
    this.queryInvoiceList();
  };
}
