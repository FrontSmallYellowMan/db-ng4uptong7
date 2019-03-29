import { Component, OnInit, ViewChildren, ElementRef } from "@angular/core";
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "app/shared/index";
import { WindowService } from "app/core";
import { Observable } from "rxjs/Observable";
import { dbomsPath } from "environments/environment";

import { EditHUAWEIPromisedTypeListComponent } from "../edit-HUAWEI-promised-typeList/edit-HUAWEI-promised-typeList.component";
import { NewCreateApplyRoute,HUAWEIPrommisedService,ApprovalQuery } from "../../../services/HUAWEIPromised.service";
import { element } from "protractor";

declare var $;
declare var window;

@Component({
  selector: "HUAWEI-myApproval",
  templateUrl: "HUAWEI-promised-myApproval.component.html",
  styleUrls: [
    "HUAWEI-promised-myApproval.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class HUAWEIPromisedMyApprovalComponent implements OnInit {
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute(); //引入新建申请对象
  approvalQuery:ApprovalQuery=new ApprovalQuery();//实例化查询

  modal: XcModalRef; //初始化弹窗
  pagerData = new Pager();
  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数
  highSearchShow: boolean = false; //高级搜索
  isHide: boolean = true; //是否隐藏缺省页

  listCommitmentType:any[]=[];//承诺类型列表
  listPlatform:any[]=[];//平台列表
  typeList: string; //用来显示选择的承诺类型

  searchList:any[]=[];//我的审批列表数据
  
  startDate: string; //开始时间，临时
  endDate: string; //结束时间，临时
  checked: any; //临时数据

  @ViewChildren("tab") public tab: ElementRef;

  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private HUAWEIPrommisedService:HUAWEIPrommisedService
  ) {}

  ngOnInit() {


    //监听审批列表的变化
    this.watchLocalStrong();

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(
      EditHUAWEIPromisedTypeListComponent
    );

    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
      if (data) {
        let selectTypeLlistName: any[] = []; //声明一个空数组用来保存选择的承诺类型
        let selectPromisedTypeCode: any[] = []; //用来保存筛选出的承诺类型代码

        JSON.parse(data).forEach(element => {
          //遍历数组，承诺类型的名称push进数组
          selectTypeLlistName.push(element.CommitTypeName); //获取承诺类型名称
          //selectPromisedTypeCode.push(element.CommitTypeCode); //获取承诺类型的代码
          //console.log(element);
        });

        this.typeList = selectTypeLlistName.join("，"); //将名称数组合并为字符串
        this.approvalQuery.CommitmentType = selectTypeLlistName.join(","); //将承诺类型的名称赋值进查询参数
      }
    });

    //请求(平台和承诺类型)的基础数据
    this.getBasicList();
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

  onTab(e) {
    //切换选项（全部，审批中，已完成，草稿）

    let liType = this.tab["_results"][0].nativeElement.children;
    [].forEach.call(liType,element=>element.className="");
    // for (let i = 0; i < liType.length; i++) {
    //   liType[i].className = "";
    // }
    e.target.className = "active";

    this.approvalQuery.TaskStatus = e.target.getAttribute("data-state");
    this.approvalQuery.PageIndex = 1;
    this.initData(this.approvalQuery); //请求数据库
  }

  onChangePager(e: any) {
    //分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
      this.approvalQuery.PageIndex = e.pageNo;
      this.approvalQuery.PageSize = e.pageSize;
      this.initData(this.approvalQuery);
  }

  initData(query: ApprovalQuery) {//向数据库发送请求

    this.HUAWEIPrommisedService.myApprovalQuery(this.approvalQuery).then(data => {

      if(!data.Result) return;
      let resData = JSON.parse(data.Data); //转换查询结果的JSON字符串
      //console.log(data.data.pager);
      //设置分页器
      this.pagerData.set({
        total: resData.TotalCount,
        totalPages: resData.PageCount,
        pageNo: resData.CurrentPage,
        pageSize: resData.PageSize
      });
      //this.loading = false;
      this.searchList = resData.List;
      console.log(this.searchList);
      if (this.searchList.length===0) {//判断如果查询列表为空，则显示缺省页面
        this.isHide = false;//显示缺省页面
      } else {
        this.isHide = true;
      }

    });
  }

  //点击搜索按钮的搜索
  search() {

    if(this.approvalQuery.BeginDate&&!this.approvalQuery.EndDate){
      this.approvalQuery.EndDate=this.approvalQuery.BeginDate;
    }

    if(!this.approvalQuery.BeginDate&&this.approvalQuery.EndDate){
      this.approvalQuery.BeginDate=this.approvalQuery.EndDate;      
    }

    this.approvalQuery.PageIndex=1;
    this.initData(this.approvalQuery);
  }

  //重置搜索数据
  reset() {
    let nowState = this.approvalQuery.TaskStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.approvalQuery = new ApprovalQuery;
    this.approvalQuery.TaskStatus = nowState;
    //this.query.PageSize = 10;
    this.approvalQuery.PageIndex = 1;
    this.typeList="";
  }

  //基础数据
  getBasicList() {
    this.HUAWEIPrommisedService.getBasicDate("").then(data => {
      if (data.Result) {
        let basicList = JSON.parse(data.Data);
        this.listCommitmentType = basicList.ListCommitmentType; //承诺类型列表
        this.listPlatform = basicList.ListPlatform; //平台列表
        //console.log(this.listPlatform);
      }
    });
  }

  //显示承诺类型列表
  getPromisedTypeList() {
    this.modal.show(this.listCommitmentType);
  }

  //获取详情
  getDetail(applyId,TaskTableURL) {
    let queryPromiseData:string=TaskTableURL.substring(TaskTableURL.indexOf('?'));//转换审批状态为代码
   window.open(dbomsPath+`promised/edit-huawei-approvaldetail/e${applyId}${queryPromiseData}`);
  }

  //判断是否可以新建华为承诺申请
  isNewPromised(){
    this.HUAWEIPrommisedService.isNewPromisedDCG().then(data=>{
      if(data.Result){
        if(data.Data){
          this.newCreateApplyRoute.data.list[0].unClick=true;
          this.newCreateApplyRoute.data.list[0].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data.list[0].unClick=false;
        }
      }
    });


    this.HUAWEIPrommisedService.isNewPromisedHUAWEI().then(data => {
      if(data.Result){
        if(data.Data){
          this.newCreateApplyRoute.data.list[1].unClick=true;
          this.newCreateApplyRoute.data.list[1].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data.list[1].unClick=false;
        }
      }
    });

  }


 //监听loaclstrong，用来确认是否刷新列表页
 watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    console.log(e.newValue,e);
     if(e.key==="HUAWEIPromised"&&e.newValue.search("submit")!=-1){
      that.initData(that.approvalQuery);
      localStorage.removeItem('HUAWEIPromised');
    }else if(e.key==="HUAWEIPromised"&&e.newValue.search("approval")!=-1){
      that.initData(that.approvalQuery);
      localStorage.removeItem('HUAWEIPromised');
    }
});
}

}
