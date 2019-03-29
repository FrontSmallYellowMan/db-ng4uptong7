/**
 *李晨 - 2017-11-20
 *销售员首页
 */
import { Component, OnInit, ViewChild } from '@angular/core';
// 引入 echarts 主模块。
import * as echarts from 'echarts/lib/echarts';
// 引入折线图。
import 'echarts/lib/chart/line';
// 引入提示框组件
import 'echarts/lib/component/tooltip';

import { WindowService } from 'app/core';
import { dbomsPath } from 'environments/environment';
import { shrinkOut, shrinkOutC } from "../../animate/animate";
import { NAV_CONFIG } from '../../nav-config';

import { IndexSalesService } from '../../services/index-sales.service';

declare var window;

@Component({
  templateUrl: './index-sales.component.html',
  styleUrls: ['./index-sales.component.scss'],
  animations: [ shrinkOut, shrinkOutC ]
})

export class IndexSalesComponent implements OnInit{
  navConfig = NAV_CONFIG;
  flag: boolean = false;//是否为本季度前十个工作日
  overDueList: any[] = [];//超期欠款列表
  mySalesAmount: any = {};//各种金额
  cusPayList: any[] = [];//客户到款列表

  @ViewChild('echarts') charts;
  
  constructor(private windowService: WindowService,private indexSalesService: IndexSalesService){}

  ngOnInit(){
    this.indexSalesService.getDateInTenth().then(data => {
      this.flag = JSON.parse(data.Data)['Flag'];
    })

    this.indexSalesService.getOverdueAndPaymentList().then(data => {
      if(!data.Result){
        this.windowService.alert({message: data.Message, type: 'fail'});
        return;
      }
      this.overDueList = JSON.parse(data.Data)['ListOverdueArrears'];
      this.cusPayList = JSON.parse(data.Data)['ListPayment'];
    })

    let chart = echarts.init(this.charts.nativeElement);
    chart.showLoading('default')
    this.indexSalesService.getMySalesAmount().then(data => {
      if(!data.Result){
        this.windowService.alert({message: data.Message, type: 'fail'});
        return;
      }
      this.mySalesAmount = JSON.parse(data.Data);
      let chartData = JSON.parse(data.Data).ListMonthAmount;
      let xList = Object.keys(chartData).sort((a,b) => Number(a) - Number(b));
      chart.hideLoading();
      chart.setOption({
        tooltip: {
          formatter: '{b}月：{c}元'
        },
        grid: {
          left: '80px',
          top: '30px',
          right: '40px',
          bottom: '30px'
        },
        xAxis: {
          name: '月份',
          nameGap: 5,
          data: xList
        },
        yAxis: {
          name: '金额',
          nameGap: 7,
          splitNumber: 3,
          scale: true,
          axisLine: {
            onZero: false
          }
        },
        series: [{
            type: 'line',
            itemStyle: {
              normal: {borderColor: '#57b9f8'}
            },
            lineStyle: {
              normal: {color: '#57b9f8'}
            },
            data: xList.map(item => chartData[item])
        }]
      });
    })

  }

  //打开链接
  openUrl(item) {
    if(item.notComplete){return}

    if(/http/.test(item.url)){
      window.open(item.url);
    }else{
      window.open(dbomsPath + item.url);
    }
  }

  //打开链接
  openMySales(type) {
    let serverUrl:string = "http://" + window.location.host + "/dboms";
    let targetUrl:string = "/index/index-contract";
    window.open(serverUrl + targetUrl + "?type=" + type);
  }
}
