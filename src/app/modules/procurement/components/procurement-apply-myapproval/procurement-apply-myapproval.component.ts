import { Component, OnInit,OnDestroy } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { dbomsPath } from "environments/environment";
declare var $: any;
import {
  ProcurementListDataService
} from '../../services/procurement-listData.service';
import { SubmitMessageService, ApplyMyapplyQuery } from '../../services/submit-message.service';
import { HttpServer } from 'app/shared/services/db.http.server';

@Component({
  templateUrl: 'procurement-apply-myapproval.component.html',
  styleUrls: ['procurement-apply-myapproval.component.scss','./../../scss/procurement.scss']
})
export class ProcurementApplyMyApprovalComponent implements OnInit {
  pagerData = new Pager();
  query: ApplyMyapplyQuery = new ApplyMyapplyQuery();
  highSearchShow: boolean = false;//高级搜索
  loading: boolean = true;//加载中效果

  searchList: any;//用于存储搜索结果列表

  constructor(
    private procurementListDataService: ProcurementListDataService,
    private windowService: WindowService,
    private SubmitMessageService: SubmitMessageService,
    private dbHttp: HttpServer
  ) { }

  ngOnInit() {
    let url = "S_Contract/GetDepartmentPlatform"
    this.dbHttp.post(url, this.query).subscribe(data => {
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
    this.query.TaskStatus = "待我审批";
    this.onTab("待我审批");

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
  //高级搜索
  public selector = {//精确搜索下拉
    PlatformList: [],
    Platform: [],
    Busform: []
  }
  public getPlatform(e) {
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
  public getSYBMC(e) {
    this.query.SYBMC = e.text;
  }
  public getChange(e) {
    console.log(e)
  }
  onTab(type) {//切换选项（全部，审批中，已完成，草稿）
    this.query.TaskStatus = type;//切换申请类型
    this.query.PageSize = 10;//重置分页
    this.loading = true;
    this.initData(this.query);
  }

  search() {//点击搜索按钮的搜索
    this.searchList=[];
    this.pagerData = new Pager();
    this.loading = true;
    this.initData(this.query);
  }
  public activePlat;//默认项
  public activeBus;
  reset() {//重置搜索数据
    let state=this.query.TaskStatus;
    this.query = new ApplyMyapplyQuery();
    this.query.TaskStatus=state;
    this.activePlat = [
      {
        id:1,
        text:''
      }
    ]
    this.activeBus = [
      {
        id:1,
        text:''
      }
    ]
    $(".iradio_square-blue").removeClass('checked');
  }

  onChangePager(e: any) {//分页代码
    this.query.PageNo = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.loading = true;
    this.initData(this.query);
  }

  initData(query: ApplyMyapplyQuery) {//向数据库发送请求
    console.log(query);
    let url = "PurchaseManage/GetTaskList"
    if (query.TaskStatus == "待我审批") {
      query.TaskStatus = "0"
    }
    if (query.TaskStatus == "我已审批") {
      query.TaskStatus = "1"
    }
    if (query.TaskStatus == "全部" || query.TaskStatus == "") {
      query.TaskStatus = "2"
    }
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    this.dbHttp.post(url, query, options).subscribe(data => {
      if (data.Result) {
        let list = JSON.parse(data.Data).pagedata;
        // list.forEach(item => {
        //   item["CurrentApprovalNode"] = JSON.parse(item["CurrentApprovalNode"]);
        // });
        this.searchList = list;
        console.log(list);
        //设置分页器
        let localPager = JSON.parse(data.Data);
        this.pagerData.pageNo = localPager.currentpage;//当前页
        this.pagerData.total = localPager.totalnum;//总条数
        this.pagerData.totalPages = localPager.pagecount;//总页数
        if (this.searchList.length > 0) {
          let urlOld = [];
          for (let i = 0, len = this.searchList.length; i < len; i++) {
            urlOld.push(this.searchList[i].taskTableURL);
            let data = this.searchList[i].currentapprove.split(":")
            this.searchList[i].currentapprove = data[0];
            this.searchList[i].currentapproveId = data[1];
            if(this.searchList[i].currentapprove=="暂无信息"){
              this.searchList[i].currentapprove='结束'
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
      }
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
  deleteDraft(id) {//删除草稿
    let callback = data => {
      if (data.Result) {
        this.loading = true;
        this.initData(this.query);
        this.windowService.alert({ message: "删除成功", type: "success" });
      } else {
        this.windowService.alert({ message: "删除失败", type: "fail" })
      }
    }
    this.procurementListDataService.deleteApplyMyapplyData(id).then(callback);
  }
  routerJump(type,id,RequisitionType){//点击列表跳转的判断
    if(RequisitionType.indexOf("合同单采购")!=-1){//合同采购申请
      if(type=='0'){
        let param=id.substring(id.indexOf("?"));
        window.open(dbomsPath+'procurement/deal-contractapply'+ param);
      }else{
        window.open(dbomsPath+'procurement/deal-contractapply/'+ id);
      }
      return;
    }
    if(RequisitionType.indexOf("预下单采购")!=-1){//预下采购申请
      if(type=='0'){
        let param=id.substring(id.indexOf("?"));
        window.open(dbomsPath+'procurement/deal-prepareapply'+ param);
      }else{
        window.open(dbomsPath+'procurement/deal-prepareapply/'+ id);
      }
      return;
    }
    if(RequisitionType.indexOf("备货单采购")!=-1){//备货采购申请
      if(type=='0'){
        let param=id.substring(id.indexOf("?"));
        window.open(dbomsPath+'procurement/deal-stockapply'+ param);
      }else{
        window.open(dbomsPath+'procurement/deal-stockapply/'+ id);
      }
    }
  }
}
export class SelectData {//销售信息
  constructor(
    public id = "0",//销售合同号
    public text = ''//销售合同名称
  ) { }
}
export class sendApprove {
  constructor(
    public taskid,
    public recordid,
    public nodeid,
    public APID,
    public ADP
  ) { }
}