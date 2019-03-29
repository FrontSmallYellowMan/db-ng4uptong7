import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import * as moment from 'moment';

export class PageNo { }

import {
  AdvancesInfo, QueryAdvances,
  OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './select-advance-deposits.component.html',
  styleUrls: ['./select-advance-deposits.component.scss']
})
export class AdvanceDepositsComponent implements OnInit {
  modal: XcModalRef;
  loading: boolean = true;//加载中
  submitOnce: boolean;
  pagerData = new Pager();
  advancesList: AdvancesInfo[] = [];//合同列表数据
  query: QueryAdvances = new QueryAdvances();//搜索条件
  SalesAmountTotal;//销售单总金额
  SDFID;//送达方编号
  currentIndex;
  advancelength;
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  advanceAmount: number = 0;//预收款总金额
  defauls: boolean = false;//暂无相关数据
  constAdvanceAmount;
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }
  //初始化数据
  initData() {
    this.loading = true;
    this.query.StartDate = moment(this.query.StartDate).format("YYYY-MM-DD");
    this.query.EndDate = moment(this.query.EndDate).format("YYYY-MM-DD");
    this.fullChecked = false;//全选状态
    this.fullCheckedIndeterminate = false;//半选状态
    this.orderCreateService.getAdvancesData(this.query).subscribe(
      data => {
        if (data.Result) {
          if (data.Data) {
            this.loading=false;
            let info = JSON.parse(data.Data);
            this.advancesList = info["ListPrepayment"];
            this.advancelength = 0;
            this.advanceAmount = 0;
            for (let i = 0; i < this.advancesList.length; i++) {
              if (this.advancesList[i].IsShowDelete) {
                this.advancelength++;
                this.advanceAmount += this.advancesList[i].AMOUNT;
              }
            }
            this.constAdvanceAmount = JSON.stringify(this.advanceAmount);
            if (!info["ListPrepayment"] || info["ListPrepayment"].length == 0) {
              this.defauls = true;
            } else {
              this.defauls = false;
            }
          } else {
            this.defauls = true;
            this.advancesList = [];
            this.loading=false;
            // this.windowService.alert({ message: data.Message, type: "fail" });
          }
        } else {
          this.defauls = true;
          this.windowService.alert({ message: data.Message, type: "fail" });
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
        this.query.StartDate = moment().subtract(30, 'days').calendar();
        this.query.EndDate = new Date();
        this.SalesAmountTotal = typeof data["SalesAmountTotal"] === 'string'?data["SalesAmountTotal"]:data["SalesAmountTotal"].toFixed(2);
        this.SDFID = data["SDFID"];
        this.currentIndex = data["currentIndex"];
        this.query = {
          StartDate: this.query.StartDate,
          EndDate: this.query.EndDate,
          isACustomer: this.query.isACustomer || false,
          SalesOrderID: data["SalesOrderID"],
          CustomerERPCode: data["CustomerERPCode"],
          CompanyCode: data["CompanyCode"],
          SDFID: this.SDFID,
          CurrentPage: "1",
          PageSize: "10"
        };
        if (data["CustomerERPCode"] == "A" || data["CustomerERPCode"] == "ALY") {
          this.query.isACustomer = true;
        }
        this.initData();
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    let obj = {
      advancelength: this.advancelength,
      currentIndex: this.currentIndex
    }
    this.modal.hide(obj);
  }


  search() {
    this.initData();
  }

  currentPageSize;//当前每页显示条数
  initChange = true;
  onChangePage(e: any) {
    //   if(this.initChange){
    //       this.initChange = false;
    //       return ;
    //   }
    //   //非第一页，切换条数。跳为第一页
    //   if(this.currentPageSize != e.pageSize){
    //       this.pagerData.pageNo = 1;
    //   }
    //   this.currentPageSize = e.pageSize
    //
    //   this.query.name = this.query.name || "";
    //   this.query.currage = e.pageNo;
    //   this.query.pagesize = e.pageSize;
    //   this.initData(this.query);
  }
  //预收款总金额计算
  advanceSelected() {
    let selectedList = this.advancesList.filter(item => item.checked == true);
    this.advanceAmount = JSON.parse(this.constAdvanceAmount);
    let amount = 0;
    selectedList.forEach(function(item, i) {
      amount += item.AMOUNT;
    })
    this.advanceAmount += amount;
  }
  //保存数据
  save() {
    let selectedList = this.advancesList.filter(item => item.checked == true);
    //选择预收款为0，点击确定
    if (selectedList.length == 0) {
      if (this.advancesList.length > 0) {
        this.windowService.alert({ message: "请选择预收款", type: "fail" });
      } else {
        let obj = {
          advancelength: this.advancelength,
          currentIndex: this.currentIndex
        }
        this.hide(obj);
      }
      return;
    }
    //预收款金额必须大于物料金额

    if ((this.advanceAmount - this.SalesAmountTotal) < 0) {
      this.windowService.alert({ message: "预收款总和不能小于物料金额", type: "fail" });
      return;
    }
    if(this.calTotalPaymoney()){
      this.windowService.alert({ message: "选择了多余的预收款,请重新选择", type: "fail" });
      return;
    }
    let params = {
      ListPrepayment: selectedList,
      SalesOrderID: this.query.SalesOrderID,
      SDFID: this.SDFID,
      SalesAmountTotal: this.SalesAmountTotal
    }
    this.orderCreateService.saveAdvancesData(params).subscribe(
      data => {
        if (data.Result) {
          let obj = {
            advancelength: selectedList.length + this.advancelength,
            currentIndex: this.currentIndex
          }
          this.modal.hide(obj);
          this.windowService.alert({ message: "预收款选择成功！", type: "success" });

        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //校验已选择预收款金额与销售总金额
  calTotalPaymoney(){
    let isvalid = false;//是否选择了多余的预收款
    let selectedList = this.advancesList.filter(item => item.checked == true);
    if (selectedList.length > 1) {
      this.advanceAmount = JSON.parse(this.constAdvanceAmount);
      let amount = 0;
      selectedList.forEach(function (item, i) {
        amount += item.AMOUNT;
      });
      this.advanceAmount += amount;
      if (this.advanceAmount - selectedList[selectedList.length-1]["AMOUNT"] >= this.SalesAmountTotal) {
        isvalid = true;
        this.windowService.alert({ message: "选择了多余的预收款,请重新选择", type: "fail" });
      }
      return isvalid;
    }else if(selectedList.length =1){
      this.advanceSelected();//计算选择的预收款总额
    }
    
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  getDate(e?) {
    // console.info(e)
  }
  //删除预收款
  delPrepanyment(item?, i?) {
    let params = {
      "AMOUNT": item.AMOUNT,
      "SHEET_NO": item.SHEET_NO,
      "BUZEI": item.BUZEI,
      "SalesOrderID": this.query.SalesOrderID,
      "SDFID": this.SDFID
    };
    let advancesList = this.advancesList;
    this.orderCreateService.delAdvancesData(params).subscribe(
      data => {
        if (data.Result) {
          advancesList.slice(i, 1);
          this.advancesList = advancesList;
          this.initData();
          this.windowService.alert({ message: "删除成功", type: "success" });
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  toNewPage() {
    window.open("http://10.1.128.136/")
  }
}
