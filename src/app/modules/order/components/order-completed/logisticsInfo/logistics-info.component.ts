import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }
import {
  LogisticsInfo, LogisticParams, OrderStatus,
  OrderCompletedService
} from './../../../services/order-completed.service';

@Component({
  templateUrl: './logistics-info.component.html',
  styleUrls: ['./logistics-info.component.scss']
})
export class LogisticsInfoComponent implements OnInit {
  public modal: XcModalRef;
  public loading: boolean = false;//加载中
  public submitOnce: boolean;
  public pagerData = new Pager();
  public logisticsInfo: LogisticsInfo = new LogisticsInfo();//物流数据
  public customerName;//公司名称
  public orderStatus = OrderStatus;//包裹状态
  public mailNoList: any = [];//快递单号列表
  public LogisticsInfo:any;//物流信息

  public queryLogisticsInfo={
    'SaleOrderID':'',
    'ERPOrderCode':''
  }
  // 读取物流信息
  public SaleOrderID: string;
  // 显示的标签
  public activeTabId: any;

  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCompletedService: OrderCompletedService
  ) { }

  initData(data) {
    let params = new LogisticParams();
    params = {
      providerID: "" || "",// 承运商简称logisticProviderID
      orderNo: "" || "",//"订单号"
      doNo: "" || "",//"科捷单号"
      mailNo: "" || "",//"快递单号"
      tradeNo: "" || "",//"交易单号"
      erpNo: data || ""//"科捷erp单号"
    }
    //this.loading = true;

    /**
     * 暂时不调用物流接口
     */
    // this.orderCompletedService.getLogisticsInfo(params).subscribe(
    //   data => {
    //     if (data.Result) {
    //       let info = JSON.parse(data.Data);
    //       let response = info.logisticsQueryResponse.orders.order;
    //       if (response.success === "true") {
    //         this.logisticsInfo = response;
    //       } else {
    //         this.windowService.alert({ message: response.reason, type: "fail" });
    //       }
    //     } else {
    //       this.windowService.alert({ message: data.Message, type: "fail" });
    //     }
    //     this.loading = false;
    //   }
    // );

    this.orderCompletedService.getSalesOrderVoucher(this.queryLogisticsInfo).then(data=>{
      if(data.Result){
        this.LogisticsInfo=JSON.parse(data.Data);
      }
    });
    

  }

  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {

      this.routerInfo.queryParamMap.subscribe(queryData=>{//获取路由中的查询参数
        if(queryData.has('so_code')){
          this.queryLogisticsInfo.SaleOrderID=queryData.get('so_code');//保存主键Id
        }
      })

      if (data) {
        let ERPCodeArr = data.ERPOrderCode.split(",");
        let params = new LogisticParams();

        this.queryLogisticsInfo.ERPOrderCode=ERPCodeArr[0];//保存物流号
        this.SaleOrderID = data.SalesOrderID; // 保存读取物流信息的参数

        this.initData(this.queryLogisticsInfo);

        let list = [{ "id": ERPCodeArr[0], "active": true, 'text': ERPCodeArr[0] }];
        ERPCodeArr.forEach(function(item, index) {
          if (item.length > 0 && index !== 0) {
            list.push({
              'id': item,
              'text': item, 
              "active": false
            });
          }
        });
        this.mailNoList = list;

        this.activeTabId = this.mailNoList[0].id; // 默认赋值第一个
      }

    })
  }
  /**
   * 读取所有单号
   */
  getDeliveryInfo(){
    this.orderCompletedService.getDeliveryOrder({ SaleOrderID: this.SaleOrderID, ERPOrderCode: this.queryLogisticsInfo.ERPOrderCode }).then(data => {
      if(data.Result){
        if(data.Data !== 'null' && data.Data){
          for(var key in this.logisticsInfo){
            JSON.parse(data.Data)[key] && (this.logisticsInfo[key] = JSON.parse(data.Data)[key]);
          }
        }
        
      } else{
        this.windowService.alert({ message: '未读取到对应的物流信息', type: 'fail' });
      }
    });
  }
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }
  //切换tab
  tabChange(tab) {
    let initInfo = false;
    this.mailNoList.forEach(function(item, index) {
      if (tab.id === item.id && tab.active === false) {
        item.active = true;
        initInfo = true;
      } else if (tab.id !== item.id) {
        item.active = false;
      }
    });
    if (initInfo) {
      this.queryLogisticsInfo.ERPOrderCode=tab.id;
      this.initData(this.queryLogisticsInfo);
      // this.initData(tab.id)
    }
  }
  onChange(tab?) {

  }
}
