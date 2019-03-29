import { Component, OnInit, ViewChildren, ElementRef, OnDestroy, OnChanges, DoCheck, AfterContentChecked, AfterContentInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from '../../../../../shared';
import { WindowService } from '../../../../../core';
import { debug } from 'util';
import { dbomsPath } from "environments/environment";

import { DCGPromiseService, CommitMyApply } from '../../../services/DCGPromised.service';
import { NewCreateApplyRoute } from "../../../services/HUAWEIPromised.service";

declare var $;
declare var window;
/**
 * 承诺集团组件
 */
@Component({
  selector: 'DCG-myApply',
  templateUrl: 'DCG-promised-myApply.component.html',
  styleUrls: ['DCG-promised-myApply.component.scss', '../../../scss/promised.component.scss']
})
export class DCGPromistedMyApplyComponent implements OnInit{
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute();//初始化新建申请的参数
  dataCreat = this.newCreateApplyRoute.data;//赋值给组件


  //#region变量
  searchList: any;//列表
  query: CommitMyApply = new CommitMyApply();
  noCounter: number;//序号计数器
  pageNo: number;
  pageSize: number;
  isShowICheck: boolean = false;
  approveState: string;

  platForms: any;//平台列表
  currentDate: Date//当前时间
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  pagerData = new Pager();
  highSearchShow: boolean = false;//高级搜索
  isHide: boolean = true;//是否隐藏缺省页

  startDate: string;//开始时间，临时
  endDate: string;//结束时间，临时
  checked: any;//临时数据
  //#endregion

  @ViewChildren('tab')
  public tab: ElementRef;
  @ViewChildren("greet")
public greet:ElementRef;

  constructor(
    private windowService: WindowService,
    private dcgPromiseService: DCGPromiseService
  ) {
    let dt = new Date();
    this.currentDate = new Date(`${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`);
  }

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
  /**
   *检查是否全选 
   * @param v 
   */
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  /**
   *打开高级搜索 
   */
  openSearch() {
    this.highSearchShow = true;
  }

  /**
   * 收起高级搜索
   */
  closeSearch() {
    this.highSearchShow = false;
  }

  /**
   * //切换选项（全部，审批中，已完成，草稿）
   * @param e 
   */
  onTab(e) {
    //清理样式
    $(".m-state").children().each((i, ele) => { ele.className = ""; });
    //选中tab样式
    e.target.className = "active";
    //debugger;
    this.approveState = $(e.target).data("state");
    this.query.WFStatus = this.approveState;
    this.query.PageIndex = 1;
    this.initData(this.query);
    //this.greet.nativeElement.style.backgroundColor="green";
  }

  /**
   * 删除列表数据
   * @param list  
   */
  deleteList(list: any) {
    this.windowService.confirm({ "message": `确定删除您选中的${this.checkedNum}项?` }).subscribe(p => {
      if (p) {
        let arr: string[] = [];
        list.filter(p => p.chked == true && p.WFStatus == "草稿")
          .forEach(el => arr.push(el.ApplyID));
        if (arr && arr.length > 0) {
          this.dcgPromiseService.deleteCommitList({ "ApplyIDList": arr.join(',') })
            .then(data => {
              if (data && data.Result) {
                this.windowService.alert({ message: "删除成功", type: "success" });
                //刷新列表
                this.refresh();
              }
            });
        }
        else {
          this.windowService.alert({ message: "不满足删除条件", type: "fail" });
        }
      }
    });
  }

  /**
   * 分页代码
   * @param e 
   */
  onChangePager(e: any) {
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.initData(this.query);
  }
  /**
   * 点击搜索按钮的搜索
   */
  search() {
    this.query.SalesITCode = this.query.SalesITCode.trim();

    if(this.query.BeginDate&&!this.query.EndDate){
      this.query.EndDate=this.query.BeginDate;
    }

    if(!this.query.BeginDate&&this.query.EndDate){
      this.query.BeginDate=this.query.EndDate;
    }

    this.query.PageIndex=1;
    this.initData(this.query);
  }

  /**
   * 重置搜索数据
   */
  reset() {
     let nowState = this.query.WFStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
     this.query = new CommitMyApply();
     this.query.WFStatus = nowState;
    // //this.query.PageSize = 10;
    // this.query.PageNo = 1;
  }

  /**
   * 向数据库发送请求
   * @param search 
   */
  initData(search: CommitMyApply) {
    this.dcgPromiseService.getCommitList(search).then(data => {
      this.fullChecked = false;
      this.fullCheckedIndeterminate = false;
      this.checkedNum = 0;

      if (data.Result) {
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

        this.searchList = res.List;
        console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
          this.isHide = false;//显示缺省页面 
        } else {
          this.isHide = true;//显示列表页面
        }
        this.isShowICheck = this.approveState == "草稿";
      }
      else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }
    });
  }

  refresh() {
    this.fullChecked = this.fullCheckedIndeterminate = false;
    this.query.PageIndex = 1;
    this.initData(this.query);
  }


  //获取详情
  getDetail(ApplyID,WFStatus){
    if(WFStatus==='草稿'){
      window.open(dbomsPath+`promised/edit-dcg-newcreatepromised/${ApplyID}`);
    }else{
      window.open(dbomsPath+`promised/edit-dcg-aprovaldetail/a${ApplyID}`);
    }
    
  }

  //验证是否可以新建申请
  isNewPromised(){
    this.dcgPromiseService.isNewPromised().then(data=>{
      if(data.Result){
        //console.log(data);
        if(data.Data) {
          this.dataCreat.list[0].unClick=true;
          this.dataCreat.list[0].alert=data.Data;
        }else{
          this.dataCreat.list[0].unClick=false;
        }
      }
    });

    this.dcgPromiseService.isNewPromisedHUAWEI().then(data=>{
      if(data.Result){
        //console.log(data);
        if(data.Data) {
          this.dataCreat.list[1].unClick=true;
          this.dataCreat.list[1].alert=data.Data;
        }else{
          this.dataCreat.list[1].unClick=false;
        }
      }
    });
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="DCGPromised"&&e.newValue.search("tempSave")!=-1){//如果是暂存
        that.initData(that.query);
        localStorage.removeItem('DCGPromised');
      }else if(e.key==="DCGPromised"&&e.newValue.search("submit")!=-1){
        that.initData(that.query);
        localStorage.removeItem('DCGPromised');
      }else if(e.key==="DCGPromised"&&e.newValue.search("revoke")!=-1){
        that.initData(that.query);
        localStorage.removeItem('DCGPromised');
      }
  });
  }



}