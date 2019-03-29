import { Component, OnInit, EventEmitter, Output, Input, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath } from "environments/environment";

import { SelectChequeComponent } from './../selectCheque/select-cheque.component';
@Component({
  selector: 'oc-link-cheque',
  templateUrl: './link-cheque.component.html',
  styleUrls: ['./link-cheque.component.scss']
})

export class LinkChequeComponent implements OnInit {
  @Output() onSuccess = new EventEmitter();
  @Input() chequeList;
  @Input() contractCode;
  @Input() SalesOrderID;
  @Input() amountTotal;//总金额
  @Input() saleType;//订单类型
  public modalCheque: XcModalRef;//选择支票弹窗
  public loading: boolean = true;//加载中
  public IsRelateCheque;//支票类型 0 未关联   1  关联支票  2 关联商票

  @ViewChildren('forminput') inputDomList;
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService
  ) { }

  initData(data?) {
    if (data && data.length > 0) {
      this.IsRelateCheque = data[0]["ReceiptType"];
      data.forEach(function(item, index) {
        item.amount = parseFloat(item.amount).toFixed(2);
        item.tick_amount_used = item.ticket_amount - item.Ticket_AvailableAmount;
      });
      this.chequeList = data;
    }
  }

  ngOnInit() {
    //在初始化的时候 创建模型;;;;编辑送达方信息
    this.modalCheque = this.xcModalService.createModal(SelectChequeComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modalCheque.onHide().subscribe((data) => {
      if (data) {
        let oldchequeList = [];
        let amountTotal = parseFloat(this.amountTotal);
        this.chequeList.forEach(function(item, index) {
          oldchequeList.push(item.InvoiceID);
          amountTotal -= item.amount;
        });
        let delrepeat = data.filter(item => oldchequeList.indexOf(item.InvoiceID) == -1);
        delrepeat.forEach(function(item, index) {
          let ticket_amount = parseFloat(item.ticket_amount) - parseFloat(item.tick_amount_used);
          //支票本次使用金额，小于订单金额则为可使用金额；大于订单金额，则为订单金额。
          if (amountTotal > ticket_amount) {
            item.amount = ticket_amount;
            amountTotal = amountTotal - ticket_amount;
          } else {
            item.amount = amountTotal;
            amountTotal = 0;
          }
          item.Ticket_AvailableAmount = ticket_amount - item.amount;
          item.amount = (item.amount || 0).toFixed(2);
        });
        this.chequeList = this.chequeList.concat(delrepeat);
        this.onSuccess.emit(this.chequeList);
      }
    })

  }
  icheckFun(event) {
    let params = {
      ContractCode: this.contractCode,
      SalesOrderID: this.SalesOrderID,
      IsRelateCheque: this.IsRelateCheque,
      Type: this.saleType
    };
    if (this.chequeList && this.chequeList.length > 0 && this.chequeList[0]["ReceiptType"] != this.IsRelateCheque) {
      let message = "";
      if (this.IsRelateCheque == 1) {
        message = "选择的商务支票将会被清除，是否确定？";
      } else {
        message = "选择的支票将会被清除，是否确定？";
      }
      this.windowService.confirm({ message: message }).subscribe({
        next: (v) => {
          if (v) {
            this.chequeList = [];
            this.modalCheque.show(params);
          } else {
            this.IsRelateCheque = this.chequeList[0]["ReceiptType"];
          }
        }
      });
    } else if (this.chequeList.length === 0) {
      this.modalCheque.show(params);
    }
  }
  //获取支票列表
  getChequeList() {
    if (this.IsRelateCheque) {
      let params = {
        ContractCode: this.contractCode,
        SalesOrderID: this.SalesOrderID,
        IsRelateCheque: this.IsRelateCheque,
        Type: this.saleType
      }
      this.modalCheque.show(params);
    } else {
      this.windowService.alert({ message: "未选择关联支票类型", type: "fail" });
    }
  }
  //删除关联支票
  delcheque(list, i) {
    list.splice(i, 1);
    this.onSuccess.emit(list);
  }
  //计算使用金额
  amountCount(item) {
    let amount = parseFloat(item.amount || 0);
    if (amount > 0) {
      item.amount = amount.toFixed(2);
    } else {
      item.amount = (0).toFixed(2);
    }
    let availableAmount = (parseFloat(item.ticket_amount || 0) - parseFloat(item.tick_amount_used || 0)).toFixed(2);
    if (parseFloat(availableAmount) < parseFloat(item.amount)) {
      this.windowService.alert({ message: "请正确填写支票本次使用金额！", type: "fail" });
      let amountTotal = parseFloat(this.amountTotal);
      if (parseFloat(availableAmount) < amountTotal) {
        item.amount = availableAmount;
      } else {
        item.amount = amountTotal.toFixed(2);
      }
    }

    item.Ticket_AvailableAmount = parseFloat(item.ticket_amount || 0) - parseFloat(item.tick_amount_used || 0) - parseFloat(item.amount || 0);

    this.onSuccess.emit(this.chequeList);
  }

  // createInvoice(type?) {
  //   if (type == 1) {
  //     window.open(dbomsPath + "invoice/apply/invoice/-1");
  //   } else if (type == 2) {
  //     window.open(dbomsPath + "invoice/apply/tradeticket/-1");
  //   }
  // }
}
