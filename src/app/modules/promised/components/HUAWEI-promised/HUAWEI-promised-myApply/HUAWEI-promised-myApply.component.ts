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
import {
  NewCreateApplyRoute,
  HUAWEIPrommisedService,
  ApplyQuery
} from "../../../services/HUAWEIPromised.service";


declare var $,window;

@Component({
  selector: "HUAWEI-myApply",
  templateUrl: "HUAWEI-promised-myApply.component.html",
  styleUrls: [
    "HUAWEI-promised-myApply.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class HUAWEIPromisedMyApplyComponent implements OnInit {
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute(); //引入新建申请对象

  modal: XcModalRef; //初始化弹窗
  pagerData = new Pager(); //分页对象
  applyQuery: ApplyQuery = new ApplyQuery(); //实例化我的申请列表查询参数

  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数

  highSearchShow: boolean = false; //高级搜索
  isHide: boolean = true; //是否隐藏缺省页
  listPlatform: any; //平台列表
  listCommitmentType: any; //承诺类型列表
  
  searchList: any[] = []; //用来保存返回的列表数据
  promisedTypeList:any=[];//保存返回的承诺类型名称列表
  typeList: string; //用来显示选择的承诺类型


  @ViewChildren("tab") public tab: ElementRef;

  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private HUAWEIPrommisedService: HUAWEIPrommisedService
  ) {}

  ngOnInit() {

    //监听表单状态，刷新列表
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
          selectPromisedTypeCode.push(element.CommitTypeCode); //获取承诺类型的代码
          //console.log(element);
        });

        this.typeList = selectTypeLlistName.join("，"); //将名称数组合并为字符串
        this.applyQuery.CommitTypeCode = selectPromisedTypeCode.join(","); //将承诺类型的代码赋值进查询参数
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

    [].forEach.call(liType, element => (element.className = ""));
    e.target.className = "active";
    this.applyQuery.WFStatus = e.target.getAttribute("data-state");
    this.applyQuery.PageIndex = 1;
    this.initData(this.applyQuery); //请求数据库

    // this.query.ApplicationState="";
    // this.approvalStaus=this.query.ApproveSection==="3"?false:true;
  }

  //删除列表数据
  deleteList(param: any) {
    let callback = data => {
      if (data.Result) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.applyQuery.PageIndex = 1;
        this.initData(this.applyQuery);
        this.windowService.alert({ message: "删除成功", type: "success" });
      } else {
        this.windowService.alert({ message: "删除失败", type: "fail" });
      }
    };
    if (typeof param == "string") {
      //删除单条数据
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: v => {
          if (v) {
            this.HUAWEIPrommisedService.deleteMyApplyList({
              ApplyIDList: param
            }).then(callback);
          }
        }
      });
    } else {
      //删除多条数据
      this.windowService
        .confirm({ message: `确定删除您选中的${this.checkedNum}项？` })
        .subscribe(v => {
          if (v) {
            let ObList = [];
            param.filter(item => item.checked === true).forEach(item => {
              ObList.push(
                this.HUAWEIPrommisedService.deleteMyApplyList({
                  ApplyIDList: item.ApplyID
                })
              );
            });
            Observable.merge
              .apply(null, ObList)
              .toPromise()
              .then(callback);
          }
        });
    }
  }

  //分页代码
  onChangePager(e: any) {
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.applyQuery.PageIndex = e.pageNo;
    this.applyQuery.PageSize = e.pageSize;

    this.initData(this.applyQuery);
  }

  initData(applyQuery) {
    //向数据库发送请求
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.HUAWEIPrommisedService.MyApplyQuery(this.applyQuery).then(data => {
      if (data.Result) {
        let resData = JSON.parse(data.Data); //转换查询结果的JSON字符串
        console.log(resData);
        //设置分页器
        this.pagerData.set({
          total: resData.TotalCount,
          totalPages: resData.PageCount,
          pageNo: resData.CurrentPage,
          pageSize: resData.PageSize
        });
        //this.loading = false;
        this.searchList = resData.List;
        this.promisedTypeList=resData.TypeList;
       console.log(this.searchList);
        if (this.searchList.length === 0) {
          //判断如果查询列表为空，则显示缺省页面
          this.isHide = false; //显示缺省页面
        } else {
          this.isHide = true;
        }
      }
    });
  }

  //点击搜索按钮的搜索
  search() {

    if(this.applyQuery.BeginDate&&!this.applyQuery.EndDate){
      this.applyQuery.EndDate=this.applyQuery.BeginDate;
    }

    if(!this.applyQuery.BeginDate&&this.applyQuery.EndDate){
      this.applyQuery.BeginDate=this.applyQuery.EndDate;
    }

    this.applyQuery.PageIndex=1;
    this.initData(this.applyQuery);
  }

  //重置搜索数据
  reset() {
    let nowState = this.applyQuery.WFStatus; //保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.applyQuery = new ApplyQuery();
    this.applyQuery.WFStatus = nowState;
    this.typeList = "";
    //this.query.PageSize = 10;
    this.applyQuery.PageIndex = 1;
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

  //判断是否可以新建承诺申请
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
      if (data.Result) {
        if(data.Data){
          this.newCreateApplyRoute.data.list[1].unClick=true;
          this.newCreateApplyRoute.data.list[1].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data.list[1].unClick=false;
        }
      }
    });

  }

  //获得详情
  getDetail(WFStatus,ApplyID){
    if(WFStatus==='草稿'){
      window.open(dbomsPath+`promised/edit-huawei-newcreatepromised/${ApplyID}`);
    }else{
      window.open(dbomsPath+`promised/edit-huawei-approvaldetail/a${ApplyID}`);
      
    }
  }

  //监听loaclstrong，用来确认是否刷新列表页
 watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    console.log(e.newValue,e);
     if(e.key==="HUAWEIPromised"&&e.newValue.search("submit")!=-1){
      that.initData(that.applyQuery);
      localStorage.removeItem('HUAWEIPromised');
    }else if(e.key==="HUAWEIPromised"&&e.newValue.search("save")!=-1){
      that.initData(that.applyQuery);
      localStorage.removeItem('HUAWEIPromised');
    }else if(e.key==="HUAWEIPromised"&&e.newValue.search("revoke")!=-1){
      that.initData(that.applyQuery);
      localStorage.removeItem('HUAWEIPromised');
    }
});
}

}
