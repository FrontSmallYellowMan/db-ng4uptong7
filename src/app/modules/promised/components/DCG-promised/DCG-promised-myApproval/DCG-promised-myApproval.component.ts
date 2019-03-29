import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { dbomsPath } from "environments/environment";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from '../../../../../shared';
import { WindowService } from '../../../../../core';

import { DCGPromiseService, QueryMyApproval } from '../../../services/DCGPromised.service';
import { NewCreateApplyRoute } from "../../../services/HUAWEIPromised.service";

declare var window;

@Component({
  selector: 'DCG-myApproval',
  templateUrl: 'DCG-promised-myApproval.component.html',
  styleUrls:['DCG-promised-myApproval.component.scss','../../../scss/promised.component.scss']
})

export class DCGMyAoorovalComponent implements OnInit {

  newCreateApplyRoute:NewCreateApplyRoute=new NewCreateApplyRoute();//初始化新建申请的参数

  //#region变量
  searchList: any;//列表
  query: QueryMyApproval = new QueryMyApproval();
  noCounter: number;//序号计数器
  pageNo: number;
  pageSize: number;
  platForms: any;//平台列表
  currentDate:Date//当前时间
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  pagerData = new Pager();
  highSearchShow: boolean = false;//高级搜索
  isHide: boolean = true;//是否隐藏缺省页

  //#endregion

  @ViewChildren('tab') public tab: ElementRef;

  constructor(
    private windowService: WindowService,
    private dcgPromiseService: DCGPromiseService
  ) {}

  ngOnInit() {

    //监听localstroage
    this.watchLocalStrong();

    this.dcgPromiseService.getPlatformAndCommitmentTypeList().then(data => {
      try {
        if (data) {
          
          let re = JSON.parse(data.Data);
          this.platForms = re.ListPlatform;
          let commitmentType = re.ListCommitmentType;
        }
      } catch (error) {
        console.log(`getPlatformAndCommitmentTypeList():异常,stackTrace:${error.stack}`);
      }
    });

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

    let liType = this.tab["_results"][0].nativeElement.children;

    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";
    this.query.TaskStatus=e.target.getAttribute("data-state");
    this.initData(this.query);//请求数据库
  }

  onChangePager(e: any) {//分页代码
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.initData(this.query);
  }
  /**
   * 点击搜索按钮的搜索
   */
  search() {
    if(!this.query.BeginDate&&this.query.EndDate){
      this.query.BeginDate=this.query.EndDate;
    }
    
    if(this.query.BeginDate&&!this.query.EndDate){
      this.query.EndDate=this.query.BeginDate;
    }
    
    this.query.PageIndex=1;
    this.initData(this.query);
    
  }

  reset() {//重置搜索数据
    let nowState = this.query.TaskStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
     this.query = new QueryMyApproval();
     this.query.TaskStatus = nowState;

  }

  initData(search: QueryMyApproval) {//向数据库发送请求
    this.dcgPromiseService.getMyApprovalList(search).then(data => {

      if (data.Result) {
        if(!data.Data){
          this.isHide = false;//显示缺省页面 
          return;
        }
        let res = JSON.parse(data.Data);
        //设置分页器
        let totalCnt = parseInt(res.TotalCount);
        this.pageNo = parseInt(res.CurrentPage);
        this.pageSize = parseInt(res.PageSize);
        this.noCounter = (this.pageNo - 1) * this.pageSize;
        this.pagerData.set({
          total: totalCnt,
          totalPages: parseInt(res.PageCount),
          pageNo: this.pageNo
        });

        //   //this.loading = false; 
    //let t1: Date = new Date(time1.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+/mg, '$1-$2-$3'));
           
        this.searchList = res.List;
        console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
          this.isHide = false;//显示缺省页面 
        } else {
          this.isHide = true;//显示列表页面
        }
      }
      else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }

  //获取详情
  getDetail(applyId,TaskTableURL){
    let queryPromisedData:string=TaskTableURL.substring(TaskTableURL.indexOf('?'));//转换审批状态为代码
   window.open(dbomsPath+`promised/edit-dcg-aprovaldetail/e${applyId}${queryPromisedData}`);
  }

  //验证是否可以新建申请
isNewPromised(){
  this.dcgPromiseService.isNewPromised().then(data=>{
    if(data.Result){
      //console.log(data);
      if(data.Data) {
        this.newCreateApplyRoute.data.list[0].unClick=true;
        this.newCreateApplyRoute.data.list[0].alert=data.Data;
      }else{
        this.newCreateApplyRoute.data[0].unClick=false;
      }
    }
  });

  this.dcgPromiseService.isNewPromisedHUAWEI().then(data=>{
    if(data.Result){
      //console.log(data);
      if(data.Data) {
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
    //console.log(e.newValue,e);
     if(e.key==="DCGPromised"&&e.newValue.search("submit")!=-1){
      that.initData(that.query);
      localStorage.removeItem('DCGPromised');
    }else if(e.key==="DCGPromised"&&e.newValue.search("approval")!=-1){
      that.initData(that.query);
      localStorage.removeItem('DCGPromised');
    }
});
}


  

}