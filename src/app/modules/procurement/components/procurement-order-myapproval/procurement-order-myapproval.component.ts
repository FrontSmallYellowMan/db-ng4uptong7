import { Component, OnInit,OnDestroy } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs/Observable';
import { dbomsPath } from "environments/environment";
declare var $: any, window;

import {
  OrderMyapprovalQuery, SelectData,
  ProcurementListDataService
} from '../../services/procurement-listData.service';
import { SubmitMessageService } from '../../services/submit-message.service';

@Component({
  templateUrl: 'procurement-order-myapproval.component.html',
  styleUrls: ['procurement-order-myapproval.component.scss', './../../scss/procurement.scss']
})
export class ProcurementOrderMyApprovalComponent implements OnInit {
  pagerData = new Pager();
  query: OrderMyapprovalQuery = new OrderMyapprovalQuery();
  highSearchShow: boolean = false;//高级搜索
  loading: boolean = true;//加载中效果
  searchList: any;//用于存储搜索结果列表
  myApply = {//申请人
    person: ''
  }
  activeBB;//选中-本部
  activeSYB;//选中-事业部
  public selector = {//高级搜索-精确搜索下拉
    PlatformList: [],
    Platform: [],
    Busform: []
  }
  constructor(
    private procurementListDataService: ProcurementListDataService,
    private windowService: WindowService,
    private SubmitMessageService: SubmitMessageService) { }

  ngOnInit() {
    this.procurementListDataService.getDepartmentPlatform().then(data => {//获取本部事业部
      let localData = JSON.parse(data.Data);
      this.selector.PlatformList = localData.DepartmentList;
      let arrBlank = [];
      for (let i = 0, len = this.selector.PlatformList.length; i < len; i++) {
        arrBlank.push(
          new SelectData(
            JSON.stringify(i),
            this.selector.PlatformList[i].BBMC
          )
        );
      }
      this.selector.Platform = this.SubmitMessageService.onTransSelectInfosOther(arrBlank, "id", "text")
    })

    let self = this;
    window.addEventListener('focus',function(){
        self.initData(self.query);
    });
  }
  ngOnDestroy(){
    let self =this;
    window.removeEventListener('focus',function(){
        self.initData(self.query);
    });
  }
  onTab(type) {//切换选项
    this.query.TaskStatus = type;//切换类型
    this.query.PageNo = 1;//重置分页
    this.loading = true;
    this.initData(this.query);
  }

  search() {//点击搜索按钮的搜索
    this.searchList = [];
    this.pagerData = new Pager();
    this.loading = true;
    this.initData(this.query);
  }

  reset() {//重置搜索数据
    let state=this.query.TaskStatus;
    this.query = new OrderMyapprovalQuery();
    this.query.TaskStatus=state;
    this.myApply.person = "";
    this.activeBB = [{
        id: "",text: ""
    }];
    this.activeSYB = [{
        id: "",text: ""
    }];
  }
  selectedPerson(e) {//选择人员后
    if (JSON.stringify(e) == "[]") {
      this.query.User = null;
    } else {
      this.query.User = e[0]["userEN"];
    }
  }

  onChangePager(e: any) {//分页代码
    this.query.PageNo = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.loading = true;
    this.initData(this.query);
  }

  initData(query: OrderMyapprovalQuery) {//向数据库发送请求
    this.procurementListDataService.searchOrderMyapprovalData(this.query).then(data => {
      let orderData = JSON.parse(data.Data);
      let list = orderData.pagedata;
      console.log("列表数据");
      console.log(orderData);

      this.searchList = list;
      //设置分页器
      this.pagerData.pageNo = orderData.currentpage;//当前页
      this.pagerData.total = orderData.totalnum;//总条数
      this.pagerData.totalPages = orderData.pagecount;//总页数
      if (this.searchList.length > 0) {
        let urlOld = [];
        for (let i = 0, len = this.searchList.length; i < len; i++) {
          urlOld.push(this.searchList[i].taskTableURL);
          let data = this.searchList[i].currentapprove.split(":")
          this.searchList[i].currentapprove = data[0];
          this.searchList[i].currentapproveId = data[1];
          if (this.searchList[i].currentapprove == "暂无信息") {
            this.searchList[i].currentapprove = '结束'
          }
        }
        let urlArr = [];
        let urlArrNew = [];
        let urlParamsArr = [];
        for (let i = 0, len = urlOld.length; i < len; i++) {
          let urlParam = urlOld[i].split("?")[1];
          let urlParams = urlParam.split("&");
          urlParamsArr.push(urlParams);
        }
        for (let n = 0, len = urlParamsArr.length; n < len; n++) {
          for (let i = 0, len = urlParamsArr[n].length; i < len; i++) {
            let temp = urlParamsArr[n][i].split("=");
            let key = temp[0];
            let value = temp[1];
            this.sendApproveData[key] = value;
          }
          let obj = JSON.parse(JSON.stringify(this.sendApproveData));
          this.sendApproveList.push(obj);
        }
      }
      this.loading = false;
    });
  }
  public sendApproveList = [];
  public sendApproveData = {
    taskid: '',
    recordid: '',
    nodeid: '',
    APID: '',
    ADP: ''
  };
  getSYBMC(e) {
    this.query.SYBMC = e.text;
  }
  getPlatform(e) {
    for (let i = 0, len = this.selector.PlatformList.length; i < len; i++) {
      if (this.selector.PlatformList[i].BBMC == e.text) {
        let formArr = this.selector.PlatformList[i].SYBMC;
        let arrBlank = [];
        for (let i = 0, len = formArr.length; i < len; i++) {
          arrBlank.push(
            new SelectData(
              JSON.stringify(i),
              formArr[i]
            )
          )
        }
        this.query.BBMC = e.text;
        this.selector.Busform = this.SubmitMessageService.onTransSelectInfosOther(arrBlank, "id", "text");
      }
    }
  }
  routerJump(type,id,OrderType){//点击列表跳转的判断
    switch(OrderType){
      case "NA":
        {
          if(type=='0'){
            let param=id.substring(id.indexOf("?"));
            window.open(dbomsPath+'procurement/deal-NA'+ param);
          }else{
            window.open(dbomsPath+'procurement/deal-NA/'+ id);
          }
          break;
        }
      case "NB":
        {
          if(type=='0'){
            let param=id.substring(id.indexOf("?"));
            window.open(dbomsPath+'procurement/deal-NB'+ param);
          }else{
            window.open(dbomsPath+'procurement/deal-NB/'+ id);
          }
          break;
        }
        case "ND":
        {
          if(type=='0'){
            let param=id.substring(id.indexOf("?"));
            window.open(dbomsPath+'procurement/deal-ND'+ param);
          }else{
            window.open(dbomsPath+'procurement/deal-ND/'+ id);
          }
          break;
        }
        case "NK":
        {
          if(type=='0'){
            let param=id.substring(id.indexOf("?"));
            window.open(dbomsPath+'procurement/deal-NK'+ param);
          }else{
            window.open(dbomsPath+'procurement/deal-NK/'+ id);
          }
          break;
        }
        case "UB":
        {
          if(type=='0'){
            let param=id.substring(id.indexOf("?"));
            window.open(dbomsPath+'procurement/deal-UB'+ param);
          }else{
            window.open(dbomsPath+'procurement/deal-UB/'+ id);
          }
          break;
        }
      default:
        this.windowService.alert({message:OrderType+"类型采购订单正在建设中",type:"warn"});
    }
  }
}