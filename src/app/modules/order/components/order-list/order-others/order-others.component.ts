import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
// import { newApply, indiaType } from "../../animate/order-animate";
import { SelectContractComponent } from './../selectContract/select-contract.component';
import { dbomsPath } from "environments/environment";
import {
  Query,
  CurrentTableData,
  ExamineQuery,
  ApproveTableData,
  OrderListService
} from './../../../services/order-list.service';
import * as moment from 'moment';

export class PageNo { };

@Component({
  templateUrl: 'order-others.component.html',
  styleUrls: ['./../order-list.component.scss'],
})
export class OrderOthersComponent implements OnInit {
  public userInfo = JSON.parse(localStorage.getItem("UserInfo"));
  public unReader;//待我审批个数
  public reload = false;//从新加载
  //缺省时模板中绑定使用
  public currentDataTypeName: string = "审批中";
  // apply/我的申请 approval/我的审批
  public currentMenuType: string = "apply";
  // 我的申请 approval/审批中 completed/已完成 all/全部 draft/草稿
  // 我的审批 waitapproval/待我审批 examinedapproved/我已审批 allapproval/全部
  public currentDataState: string = "approval";
  //当前列表数据
  public currentTableData: CurrentTableData[] = [];
  //申请列表数据
  public approveTableData: ApproveTableData[] = [];
  public loading: any = false;
  public idSort: any = false;//我的审批排序
  public pagerData = new Pager();
  public default = false;//默认缺省页是否显示
  public query: Query = new Query();//我的申请需要数据
  public examineQuery: ExamineQuery = new ExamineQuery();//我的审批需要数据
  // public openList: any = [];//打开关闭数组
  // public aprOpenList: any = [];//我的审批打开关闭数组

  public typeParam: number = 2;//无合同订单
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderListService: OrderListService,
  ) { }

  initData() {
    this.loading = true;
    if (this.currentMenuType == 'apply') {// apply/我的申请
      if (this.query.CreatedTimeStart) {
        this.query.CreatedTimeStart = moment(this.query.CreatedTimeStart).format("YYYY-MM-DD");
      }
      if (this.query.CreatedTimeEnd) {
        this.query.CreatedTimeEnd = moment(this.query.CreatedTimeEnd).format("YYYY-MM-DD");
      }
      this.orderListService.getOrderListDataOther(this.query).subscribe(
        data => {
          if (data.Result) {
            let resData = JSON.parse(data.Data);
            console.log(resData);
            this.currentTableData = resData.SalesOrderList;
            if (this.currentTableData.length == 0) {
              this.default = true;
            } else {
              this.default = false;
            }
            // for (let i = 0; i < this.currentTableData.length; i++) {//第一个合同列表打开剩余关闭
            //   if (i == 0) {
            //     this.openList[0] = true;
            //   } else {
            //     this.openList[i] = false;
            //   }
            // }
            this.pagerData.set({
              total: parseInt(resData.TotalCount),
              totalPages: parseInt(resData.PageCount),
              pageNo: parseInt(resData.CurrentPage)
            })
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
            this.default = true;
          }
          this.loading = false;
        });
    } else { //approval/我的审批
      if (this.examineQuery.applydateEnd) {
        this.examineQuery.applydateEnd = moment(this.examineQuery.applydateEnd).format("YYYY-MM-DD");
      }
      if (this.examineQuery.applydateStart) {
        this.examineQuery.applydateStart = moment(this.examineQuery.applydateStart).format("YYYY-MM-DD");
      }
      this.orderListService.getApproveListData(this.examineQuery).subscribe(
        data => {
          if (data.Result) {
            let resData = JSON.parse(data.Data);
            this.approveTableData = resData.listtask;
            if (this.approveTableData.length == 0) {
              this.default = true;
            } else {
              this.default = false;
            }
            // for (let i = 0; i < this.approveTableData.length; i++) {
            //   if (i == 0) {
            //     this.aprOpenList[0] = true;
            //   } else {
            //     this.aprOpenList[i] = false;
            //   }
            // }
            resData.PageCount = Math.ceil(resData.TotalCount / resData.pagesize);
            this.pagerData.set({
              total: parseInt(resData.TotalCount),
              totalPages: parseInt(resData.PageCount),
              pageNo: parseInt(resData.currentpage)
            })
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
            this.default = true;
          }
          this.loading = false;
        });
    }
    this.reload = false;
  }
  ngOnInit() {
    if (!this.userInfo) {
      this.windowService.confirm({ message: "当前登录信息失效，请重新登录!" }).subscribe({
        next: (v) => {
          if (v) {
            window.location.href = dbomsPath + "login";
          }
        }
      })
      // this.windowService.alert({ message: "当前登录信息失效，请重新登录!", type: "fail" });
      return;
    }
    // if (this.router.url == '/order/order-macao') {
    //   this.typeParam = 1;
    // } else if (this.router.url == '/order/order-normal') {
    //   this.typeParam = 0;
    // } else if (this.router.url == '/order/order-others') {
    //   this.typeParam = 2;
    // }
    //我的申请数据初始化
    this.query.Status = '1';
    this.query.OType = this.typeParam;
    // this.query = {
    //   InputCondition: "",//合同单号,客户名称
    //   Status: "1",//订单合同状态
    //   // CurrentITCode: this.userInfo["ITCode"],//用户itcode
    //   OType: this.typeParam,//订单类型标准单 OType值是0，澳门是1
    //   CreatedTimeStart: "",//申请开始时间
    //   CreatedTimeEnd: "",//申请结束时间
    //   CurrentPage: 1,//当前页
    //   PageSize: 10  //每页数据条数
    // }
    //我的申请初始化
    this.examineQuery.taskstatus = '0';
    this.examineQuery.OType = this.typeParam;
    // this.examineQuery = {
    //   // itcode:this.userInfo["ITCode"],//当前登录人ITCODE
    //   taskstatus: '0',//查询状态（0待我审批列表1.我己审批列表 2全部）
    //   OType: this.typeParam,//订单类型标准单 OType值是0，澳门是1，无合同2
    //   applydateStart: '',//申请开始时间
    //   applydateEnd: '',//申请结束时间
    //   query: '',
    //   currentpage: 1,
    //   pagesize: 10
    // }
    this.getUnApprove(this.typeParam);
    window.addEventListener("focus", () => {
      if (this.reload == true) {
        this.getUnApprove(this.typeParam);
        this.initData();
      }

    });
  }
  //待我审批个数
  getUnApprove(type) {
    let params = {
      OType: type
    }
    this.orderListService.getApproveCount(params).subscribe(
      data => {
        if (data.Result) {
          this.unReader = JSON.parse(data.Data).TotalCount;
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  //排序功能
  approvalSort() {
    this.idSort = !this.idSort;
    this.approveTableData.reverse();
  }
  //编辑跳转
  goToNewPage(salesOrderID, status) {
    this.reload = true;
    if ((status === "0") || (status === "3")) {
      window.open(dbomsPath + 'order/order-create/others?so_code=' + salesOrderID);
    } else {
      //跳转查看页
      window.open(dbomsPath + 'order/order-view?so_code=' + salesOrderID + '&type=others');
    }
  }
  //跳转审批页
  goToView(statUrl, taskState, salesOrderID) {
    this.reload = true;
    if (taskState == '未处理') {//跳转审批页
      let url = dbomsPath + 'order/order-view?' + statUrl.split('?')[1];
      window.open(url);
    } else if (taskState == '已处理') {//跳转查看页
      window.open(dbomsPath + 'order/order-view?so_code=' + salesOrderID);
    }
  }
  // 删除销售单记录
  deleteSaleOrder(sonIndex, id) {
    this.windowService.confirm({ message: "确认删除此订单?" }).subscribe({
      next: (v) => {
        if (v) {
          let params = {
            SalesOrderID: id,
            Type: this.typeParam
          }
          this.orderListService.deleteOrder(params).subscribe(data => {
            if (data.Result) {
              this.windowService.alert({ message: '删除成功', type: "success" });
              this.currentTableData.splice(sonIndex, 1);
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          })
        }
      }
    });
  }
  tabMenu(type) { //我的审批与我的申请切换
    switch (type) {
      case 'apply':
        this.currentMenuType = 'apply';
        this.currentDataState = 'approval';
        this.examineQuery.taskstatus = "0";
        this.inteDataSearch();
        break;
      case 'approval':
        this.currentMenuType = 'approval';
        this.currentDataState = 'waitapproval';
        this.query.Status = "1";
        this.inteDataSearch();
        break;
      default:
        break;
    }
  }
  tabData(type) {
    switch (type) {
      case 'approval':
        this.currentDataState = 'approval';
        this.currentDataTypeName = '审批中';
        this.query.Status = "1";
        this.inteDataSearch();
        break;
      case 'completed':
        this.currentDataState = 'completed';
        this.currentDataTypeName = '已完成';
        this.query.Status = "2";
        this.inteDataSearch();
        break;
      case 'all':
        this.currentDataState = 'all';
        this.currentDataTypeName = '全部';
        this.query.Status = "";
        this.inteDataSearch();
        break;
      case 'draft':
        this.currentDataState = 'draft';
        this.currentDataTypeName = '草稿';
        this.query.Status = "0";
        this.inteDataSearch();
        break;
      case 'waitapproval':
        this.currentDataState = 'waitapproval';
        this.currentDataTypeName = '待我审批';
        this.examineQuery.taskstatus = "0";
        this.inteDataSearch();
        break;
      case 'examinedapproved':
        this.currentDataState = 'examinedapproved';
        this.currentDataTypeName = '我已审批';
        this.examineQuery.taskstatus = "1";
        this.inteDataSearch();
        break;
      case 'allapproval':
        this.currentDataState = 'allapproval';
        this.currentDataTypeName = '全部';
        this.examineQuery.taskstatus = "2";
        this.inteDataSearch();
        break;
      default:
        break;
    }
  }
  //切换tab时候调用接口
  inteDataSearch() {
    if (this.currentMenuType == 'apply') {//我的申请
      this.query.InputCondition = '';
      this.query.CreatedTimeStart = '';
      this.query.CreatedTimeEnd = '';
      this.query.CurrentPage = 1;
    } else {//我是审批
      this.examineQuery.query = '';
      this.examineQuery.applydateStart = '';
      this.examineQuery.applydateEnd = '';
      this.examineQuery.currentpage = 1;
    }
    this.initData();
  }
  //选择合同弹层
  selectContract() {
    this.reload = true;
    window.open(dbomsPath + 'order/order-create/others');
  }
  //搜索
  search() {
    if (this.loading == false) {
      if (this.currentMenuType == 'apply') {
        this.query.CurrentPage = 1;
        this.query.InputCondition = this.query.InputCondition.replace(/\s/g, "");
      } else {
        this.examineQuery.currentpage = 1;
        this.examineQuery.query = this.examineQuery.query.replace(/\s/g, "");
      }
      this.pagerData.set({
        pageNo: 1
      })
      this.initData();
    }
  }
  //重置按钮
  reset() {
    if (this.currentMenuType == 'apply') {
      this.query.InputCondition = '';
      this.query.CreatedTimeStart = '';
      this.query.CreatedTimeEnd = '';
    } else {
      this.examineQuery.query = '';
      this.examineQuery.applydateEnd = '';
      this.examineQuery.applydateStart = '';
    }
    this.initData();
  }
  public currentPageSize;//当前每页显示条数
  public currentPageSizes;//当前每页显示条数
  onChangePager(e: any) {
    if (this.currentMenuType == 'apply') {
      // //非第一页，切换条数。跳为第一页
      if (this.currentPageSize != e.pageSize) {
        this.pagerData.pageNo = 1;
      }
      this.currentPageSize = e.pageSize
      this.query.CurrentPage = e.pageNo;
      this.query.PageSize = e.pageSize;
    } else {
      // //非第一页，切换条数。跳为第一页
      if (this.currentPageSizes != e.pageSize) {
        this.pagerData.pageNo = 1;
      }
      this.currentPageSizes = e.pageSize
      this.examineQuery.currentpage = e.pageNo;
      this.examineQuery.pagesize = e.pageSize;
    }
    this.initData();
  }
  //时间修改调取函数
  // getDate(date, flag) {
  // }

  /**
   * 动画部分
   */
  currentState: string = "out";
  toggleState(e?) {
    this.currentState === "out" ? this.currentState = "in" : this.currentState = "out";
    if (e) {
      this.currentState = "out"
    }
  }

}
