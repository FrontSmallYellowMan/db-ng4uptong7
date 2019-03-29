import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }
import {
  InvoiceInfo,
  OrderCreateService
} from './../../../services/order-create.service';


@Component({
  templateUrl: './select-cheque.component.html',
  styleUrls: ['./select-cheque.component.scss']
})
export class SelectChequeComponent implements OnInit {
  public modal: XcModalRef;
  public loading: boolean = true;//加载中
  public submitOnce: boolean;
  public pagerData = new Pager();
  public invoiceList: InvoiceInfo[] = [];//合同列表数据
  public defauls: boolean = false;//暂无相关数据
  public SalesOrderID;
  public IsRelateCheque;//支票类型 0 未关联   1  关联支票  2 关联商票
  public saleType;//订单类型
  public fullChecked = false;//全选状态
  public fullCheckedIndeterminate = false;//半选状态
  public checkedNum = 0;//已选项数
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }
  //初始化数据
  initData(params?) {
    this.fullChecked = false;//全选状态
    this.fullCheckedIndeterminate = false;//半选状态
    this.loading = true;
    this.orderCreateService.getGetInvoiceData(params).subscribe(
      data => {
        this.defauls = false;
        if (data.Result && data.Data) {
          let info = JSON.parse(data.Data);
          let invoiceList = [];
          if (info["list"] && info["list"].length > 0) {
            info.list.forEach(function(item, index) {
              item["ReceiptType"] = params["IsRelateCheque"];
              invoiceList.push(item);
            })
          } else {
            this.defauls = true;
            // this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.invoiceList = invoiceList;
        } else {
          this.defauls = true;
          // this.windowService.alert({ message: data.Message, type: "fail" });
        }
        this.loading = false;
      }
    );
  }


  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
      if (data) {
        this.initData(data);
        this.IsRelateCheque = data["IsRelateCheque"];
        this.saleType = data["Type"];
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }

  //保存数据
  save() {
    let selectedList = this.invoiceList.filter(item => item.checked == true);
    if (selectedList.length == 0) {
      if (this.invoiceList.length > 0) {
        this.windowService.alert({ message: "请选择相关票据！", type: "fail" });
      } else {
        this.hide();
      }
      return;
    }
    this.hide(selectedList);
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

}
