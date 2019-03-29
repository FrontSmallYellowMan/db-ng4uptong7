import { Component, OnInit ,ViewChildren,ViewChild,ElementRef} from "@angular/core";
import { NgForm } from "@angular/forms";

import { Pager } from "app/shared/index";

import { WindowService } from "app/core";
import { Observable } from "rxjs/Observable";
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

import { ERPOrderChangeApiServices,MyApprovalQuery } from "../../services/erporderchange-api.services";

declare var window;

@Component({
    templateUrl:'erporderchange-approvallist.component.html',
    styleUrls:['erporderchange-approvallist.component.scss','./../../scss/procurement.scss']
})
export class  ERPOrderChangeApprovalListComponent implements OnInit{

  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数
  pagerData = new Pager();

  highSearchShow: boolean = false; //高级搜索
  isHide: boolean = true; //显示或者隐藏缺省页面或者搜索列表页面
  searchList: any[]=[]; //用于存储搜索结果列表

  myApprovalQuery:MyApprovalQuery=new MyApprovalQuery();//查询参数

  approvalStaus: boolean = true; //根据查询条件判断，如果是“已完成”和“草稿”则不显示“审批环节”和“审批人”
  checked;//临时数据
  BeginDate;//临时变量
  EndDate;//临时变量

  @ViewChildren('tab') public tab:ElementRef;
  @ViewChild('form') public form:NgForm

  constructor(
    private windowService:WindowService,
    private activatedRoute:ActivatedRoute,
    private erpOrderChangeApiServices:ERPOrderChangeApiServices
  ) {}

  ngOnInit() {
    this.watchLocalStrong();//监听列表的变化
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  //打开高级搜索
  openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  onTab(e) {//切换选项（全部，审批中，已完成，草稿）
    console.log(this.tab);
    let liType = this.tab["_results"][0].nativeElement.children;
    
    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";

    this.myApprovalQuery.TaskStatus=e.target.getAttribute("data-state");
    //this.query.ApplicationState="";
    //this.approvalStaus=this.query.ApproveSection==="3"?false:true;

    //this.isHide = true;//显示搜索列表页 
    this.myApprovalQuery.PageIndex = '1';
    this.initData();//请求数据库


  }

  search() {//点击搜索按钮的搜索
    this.initData();
  }

  reset() {//重置搜索数据
    let nowState = this.myApprovalQuery.TaskStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.myApprovalQuery = new MyApprovalQuery();
    this.myApprovalQuery.TaskStatus = nowState;
    this.myApprovalQuery.PageSize = "10";
    this.myApprovalQuery.PageIndex = "1";
  }

  onChangePager(e: any) {//分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.myApprovalQuery.PageIndex = e.pageNo;
    this.myApprovalQuery.PageSize = e.pageSize;

    this.initData();
  }

  initData() {//向数据库发送请求
    // this.fullChecked = false;
    // this.fullCheckedIndeterminate = false;
    // this.checkedNum = 0;

    this.erpOrderChangeApiServices.getMyApprovalList(this.myApprovalQuery).then(data => {
      let dataList=JSON.parse(data.Data);
      //设置分页器
      this.pagerData.set({
        total: dataList.TotalCount,
        totalPages: dataList.PageCount,
        pageNo: dataList.CurrentPage,
        pageSize: dataList.PageSize
      });
      //this.loading = false;      
      this.searchList = dataList.pagedata;
      console.log(this.searchList);
      if (this.searchList.length===0) {//判断如果查询列表为空，则显示缺省页面
        this.isHide = false;//显示缺省页面 
      } else {
        this.isHide = true;
      }

    });
  }

  getDetail(I) {//查看详情

    let approvalList=this.searchList[I].TaskTableURL;//保存审批链接
    let queryPromise=approvalList.substring(approvalList.indexOf('?'));
    console.log(queryPromise);
    window.open(dbomsPath+`procurement/erporderchange-view/e${this.searchList[I].Id}${queryPromise}`);
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="erpOrderChange"&&e.newValue.search("approval")!=-1){//如果审批成功
        that.initData();
        localStorage.removeItem('erpOrderChange');
      }
  });
  }



} 