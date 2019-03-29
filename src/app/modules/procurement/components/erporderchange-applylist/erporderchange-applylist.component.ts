import { Component, OnInit ,ViewChildren,ViewChild,ElementRef} from "@angular/core";
import { NgForm } from "@angular/forms";

import { Pager } from "app/shared/index";

import { WindowService } from "app/core";
import { Observable } from "rxjs/Observable";
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

import { ERPOrderChangeApiServices,MyApplyQuery } from "../../services/erporderchange-api.services";

declare var window;

@Component({
  templateUrl: "erporderchange-applylist.component.html",
  styleUrls: [
    "erporderchange-applylist.component.scss",
    './../../scss/procurement.scss'
  ]
})
export class ERPOrderChangeApplyListComponent implements OnInit {
  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数
  pagerData = new Pager();

  highSearchShow: boolean = false; //高级搜索
  isHide: boolean = true; //显示或者隐藏缺省页面或者搜索列表页面
  searchList: any[]=[]; //用于存储搜索结果列表

  myApplyQuery:MyApplyQuery=new MyApplyQuery();//查询参数

  approvalStaus: boolean = true; //根据查询条件判断，如果是“已完成”和“草稿”则不显示“审批环节”和“审批人”
  checked;//临时数据
  BeginDate;//临时变量
  EndDate;//临时变量

  @ViewChildren('tab') public tab:ElementRef;
  @ViewChild('form') public form:NgForm;

  constructor(
    private windowService:WindowService,
    private activatedRoute:ActivatedRoute,
    private erpOrderChangeApiServices:ERPOrderChangeApiServices
  ) {}

  ngOnInit() {
    this.watchLocalStrong();//监听localstrong的变化，用来判断是否刷新列表
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
    //console.log(e.target);

    this.myApplyQuery.ApproveState=e.target.getAttribute("data-state");

    //this.isHide = true;//显示搜索列表页 
    this.myApplyQuery.PageIndex = 1;
    this.initData();//请求数据库


  }

  search() {//点击搜索按钮的搜索
    this.initData();
  }

  reset() {//重置搜索数据
    let nowState = this.myApplyQuery.ApproveState;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.myApplyQuery = new MyApplyQuery();
    //this.isChangeColor = false;//重置审批环节下拉选框的字体颜色
    this.myApplyQuery.ApproveState = nowState;
    this.myApplyQuery.PageSize = 10;
    this.myApplyQuery.PageIndex = 1;
  }


  deleteList(param: any) {//删除列表数据

    let callback = data => {

      if (data.Result) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.myApplyQuery.PageIndex=1;
        this.initData();
        this.windowService.alert({ message: data.Message, type: "success" });
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" })
      }
    }

    if (typeof param == "string") {//删除单条数据
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: (v) => {
          if (v) {
           this.erpOrderChangeApiServices.deleteMyApplyList([param]).then(callback);
            console.log(param);
          }

        }
      });
    } else {//删除多条数据
      this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
        if (v) {
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
              ObList.push(this.erpOrderChangeApiServices.deleteMyApplyList([item.Id]));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
        }
      });
    }

  }

  onChangePager(e: any) {//分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.myApplyQuery.PageIndex = e.pageNo;
    this.myApplyQuery.PageSize = e.pageSize;

    this.initData();
  }

  initData() {//向数据库发送请求
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;
    
    this.erpOrderChangeApiServices.getMyApplylist(this.myApplyQuery).then(data => {
      console.log(data);
      if(data.Result){
        //设置分页器
        this.pagerData.set({
          total: data.Data.TotalCount,
          totalPages: data.Data.PageCount,
          pageNo: data.Data.CurrentPage,
          pageSize: data.Data.PageSize
        });

        this.searchList = data.Data.List;
       console.log(this.searchList);
      if (this.searchList.length===0) {//判断如果查询列表为空，则显示缺省页面
        this.isHide = false;//显示缺省页面 
      } else {
        this.isHide = true;
      }
      }

    });
  }

  getDetail(I) {//查看详情

    let id=this.searchList[I].Id;//保存Id
    if(this.searchList[I].ApproveState===0||this.searchList[I].ApproveState===2){
      window.open(dbomsPath+`procurement/erporderchange-new/${id}`);
    }else{
      window.open(dbomsPath+`procurement/erporderchange-view/a${id}`);
    }
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="erpOrderChange"&&e.newValue.search("save")!=-1){//如果是暂存
        that.initData();
        localStorage.removeItem('erpOrderChange');
      }else if(e.key==="erpOrderChange"&&e.newValue.search("submit")!=-1){//如果是提交
        that.initData();
        //console.log(e.newValue,e);
        localStorage.removeItem('erpOrderChange');
      }
  });
  }


}
