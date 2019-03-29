import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "app/core";
import { Pager, XcModalService, XcModalRef } from "app/shared/index";
import { newApply, indiaType } from "../../animate/order-animate";
import { SelectContractComponent } from "./selectContract/select-contract.component";
import { dbomsPath } from "environments/environment";
import {
  Query,
  CurrentTableData,
  ExamineQuery,
  ApproveTableData,
  OrderListService
} from "./../../services/order-list.service";
import * as moment from "moment";

export class PageNo {}

@Component({
  templateUrl: "order-list.component.html",
  styleUrls: ["./order-list.component.scss"],
  animations: [newApply, indiaType]
})
export class OrderListComponent implements OnInit {
  public userInfo = JSON.parse(localStorage.getItem("UserInfo"));
  public unReader; //待我审批个数
  public reload = false; //从新加载
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
  public idSort: any = false; //我的审批排序
  public pagerData = new Pager();
  public default = false; //默认缺省页是否显示
  public modalContract: XcModalRef; //模态框
  public query: Query = new Query(); //我的申请需要数据
  public examineQuery: ExamineQuery = new ExamineQuery(); //我的审批需要数据
  public openList: any = []; //打开关闭数组
  // public aprOpenList: any = [];//我的审批打开关闭数组
  public isModelOpen = false; //选择合同弹窗是否打开

  public typeParam: number; //标准订单
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderListService: OrderListService
  ) {}

  public validList: any = []; //保存存在销售合同的列表

  public highSearchShow: boolean = false; //高级搜索

  initData() {
    this.loading = true;
    if (this.currentMenuType == "apply") {
      // apply/我的申请
      if (this.query.CreatedTimeStart) {
        this.query.CreatedTimeStart = moment(
          this.query.CreatedTimeStart
        ).format("YYYY-MM-DD");
      }
      if (this.query.CreatedTimeEnd) {
        this.query.CreatedTimeEnd = moment(this.query.CreatedTimeEnd).format(
          "YYYY-MM-DD"
        );
      }

      // 过滤输入参数的空格
      this.formatQueryPromise();

      this.orderListService.getOrderListData(this.query).subscribe(data => {
        if (data.Result) {
          let resData = JSON.parse(data.Data);
          this.currentTableData = resData.ContractList;

          console.log(this.currentTableData);

          if (
            this.currentTableData.length == 0 ||
            this.currentTableData.every(item => item.SalesOrderList.length == 0)
          ) {
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

          //过滤出存在合同列表的数据
          this.validList = this.currentTableData.filter(
            item => item.SalesOrderList.length > 0
          );

          //遍历列表，将所有合同列表项关闭
          this.validList.forEach(element => {
            element.isOpen = false;
          });

          //第一条数据打开列表
          // this.validList.length>0?this.validList[0]['isOpen']=true:this.validList=[];

          console.log(this.validList);

          this.pagerData.set({
            total: parseInt(resData.TotalCount),
            totalPages: parseInt(resData.PageCount),
            pageNo: parseInt(resData.CurrentPage)
          });
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
          this.default = true;
        }
        this.loading = false;
      });
    } else {
      //approval/我的审批
      if (this.examineQuery.applydateEnd) {
        this.examineQuery.applydateEnd = moment(
          this.examineQuery.applydateEnd
        ).format("YYYY-MM-DD");
      }
      if (this.examineQuery.applydateStart) {
        this.examineQuery.applydateStart = moment(
          this.examineQuery.applydateStart
        ).format("YYYY-MM-DD");
      }

      //过滤输入参数的空格
      this.formatQueryPromise();

      this.orderListService
        .getApproveListData(this.examineQuery)
        .subscribe(data => {
          if (data.Result) {
            let resData = JSON.parse(data.Data);
            console.log(resData);
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
            resData.PageCount = Math.ceil(
              resData.TotalCount / resData.pagesize
            );
            this.pagerData.set({
              total: parseInt(resData.TotalCount),
              totalPages: parseInt(resData.PageCount),
              pageNo: parseInt(resData.currentpage)
            });
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
    this.watchLocalStrong(); //监听列表的变化，刷新列表

    if (!this.userInfo) {
      this.windowService
        .confirm({ message: "当前登录信息失效，请重新登录!" })
        .subscribe({
          next: v => {
            if (v) {
              window.location.href = dbomsPath + "login";
            }
          }
        });
      // this.windowService.alert({ message: "当前登录信息失效，请重新登录!", type: "fail" });
      return;
    }
    if (this.router.url == "/order/order-macao") {
      this.typeParam = this.query.OType = 1;
    } else if (this.router.url == "/order/order-normal") {
      this.typeParam = this.query.OType = 0;
    }
    if (this.router.url == "/order/order-normal?isModelOpen=true") {
      this.typeParam = this.query.OType = 0;
      this.isModelOpen = true;
    }

    console.log(this.typeParam);

    //我的申请数据初始化
    this.query.Status = "1"; //订单合同状态
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
    this.examineQuery.taskstatus = "0";
    this.examineQuery.OType = this.typeParam;
    // this.examineQuery = {
    //   // itcode:this.userInfo["ITCode"],//当前登录人ITCODE
    //   taskstatus: '0',//查询状态（0待我审批列表1.我己审批列表 2全部）
    //   OType: this.typeParam,//订单类型标准单 OType值是0，澳门是1
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
    // //在初始化的时候 创建模型
    this.modalContract = this.xcModalService.createModal(
      SelectContractComponent
    );
    if (this.isModelOpen) {
      this.selectContract();
    }
  }
  //待我审批个数
  getUnApprove(type) {
    let params = {
      OType: type
    };
    this.orderListService.getApproveCount(params).subscribe(data => {
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
  //合同号跳转
  getContractNub(SC_Code) {
    window.open(dbomsPath + "india/contractview?SC_Code=" + SC_Code);
  }
  //编辑跳转
  goToNewPage(SC_Code, salesOrderID, status) {
    let type;
    if (this.typeParam === 1) {
      type = "macao";
    } else if (this.typeParam === 0) {
      type = "normal";
    }
    this.reload = true;
    if (status === "0" || status === "3") {
      window.open(
        dbomsPath +
          "order/order-create/" +
          type +
          "?so_code=" +
          salesOrderID +
          "&sc_code=" +
          SC_Code
      );
    } else {
      //跳转查看页
      window.open(
        dbomsPath + "order/order-view?so_code=" + salesOrderID + "&type=" + type
      );
    }
  }
  //跳转审批页
  goToView(statUrl, taskState, salesOrderID) {
    let type;
    if (this.typeParam == 1) {
      type = "macao";
    } else if (this.typeParam == 0) {
      type = "normal";
    }
    this.reload = true;
    // if (taskState == '未处理') {//跳转审批页
    //   let url = dbomsPath + 'order/order-view?' + statUrl.split('?')[1];
    //   window.open(url);
    // } else if (taskState == '已处理') {//跳转查看页
    //   window.open(dbomsPath + 'order/order-view?SO_Code=' + salesOrderID + '&type=' + type);
    // }
    let url = dbomsPath + "order/order-view?" + statUrl.split("?")[1];
    window.open(url);
  }
  // 删除销售单记录
  deleteSaleOrder(parentIndex, sonIndex, id) {
    this.windowService.confirm({ message: "确认删除此订单?" }).subscribe({
      next: v => {
        if (v) {
          let params = {
            SalesOrderID: id,
            Type: this.typeParam
          };
          this.orderListService.deleteOrder(params).subscribe(data => {
            if (data.Result) {
              this.windowService.alert({
                message: "删除成功",
                type: "success"
              });
              this.currentTableData[parentIndex].SalesOrderList.splice(
                sonIndex,
                1
              );
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          });
        }
      }
    });
  }
  //点击打开关闭
  openClick(index) {
    // this.openList[index] = !this.openList[index];
    this.validList[index].isOpen = !this.validList[index].isOpen;
  }
  tabMenu(type) {
    //我的审批与我的申请切换
    switch (type) {
      case "apply":
        this.currentMenuType = "apply";
        this.currentDataState = "approval";
        this.examineQuery.taskstatus = "0";
        this.inteDataSearch();
        break;
      case "approval":
        this.currentMenuType = "approval";
        this.currentDataState = "waitapproval";
        this.query.Status = "1";
        this.inteDataSearch();
        break;
      default:
        break;
    }
  }
  tabData(type) {
    switch (type) {
      case "approval":
        this.currentDataState = "approval";
        this.currentDataTypeName = "审批中";
        this.query.Status = "1";
        this.inteDataSearch();
        break;
      case "completed":
        this.currentDataState = "completed";
        this.currentDataTypeName = "已完成";
        this.query.Status = "2";
        this.inteDataSearch();
        break;
      case "all":
        this.currentDataState = "all";
        this.currentDataTypeName = "全部";
        this.query.Status = "";
        this.inteDataSearch();
        break;
      case "draft":
        this.currentDataState = "draft";
        this.currentDataTypeName = "草稿";
        this.query.Status = "0";
        this.inteDataSearch();
        break;
      case "waitapproval":
        this.currentDataState = "waitapproval";
        this.currentDataTypeName = "待我审批";
        this.examineQuery.taskstatus = "0";
        this.inteDataSearch();
        break;
      case "examinedapproved":
        this.currentDataState = "examinedapproved";
        this.currentDataTypeName = "我已审批";
        this.examineQuery.taskstatus = "1";
        this.inteDataSearch();
        break;
      case "allapproval":
        this.currentDataState = "allapproval";
        this.currentDataTypeName = "全部";
        this.examineQuery.taskstatus = "2";
        this.inteDataSearch();
        break;
      default:
        break;
    }
  }
  //切换tab时候调用接口
  inteDataSearch() {
    if (this.currentMenuType == "apply") {
      //我的申请
      this.query.CreatedTimeStart = "";
      this.query.CreatedTimeEnd = "";
      this.query.CurrentPage = 1;
    } else {
      //我是审批
      this.examineQuery.applydateStart = "";
      this.examineQuery.applydateEnd = "";
      this.examineQuery.currentpage = 1;
    }
    this.initData();
  }
  //选择合同弹层
  selectContract() {
    // //模型关闭的时候 如果有改动，请求刷新
    this.modalContract.onHide().subscribe(data => {
      this.reload = data;
    });
    let data = {
      typeParam: this.typeParam,
      reload: this.reload
    };
    this.modalContract.show(data);
  }
  //搜索
  search() {
    if (this.loading == false) {
      if (this.currentMenuType == "apply") {
        this.query.CurrentPage = 1;
        this.query.InputCondition = this.query.InputCondition.replace(
          /\s/g,
          ""
        );
      } else {
        this.examineQuery.currentpage = 1;
        // this.examineQuery.query = this.examineQuery.query.replace(/\s/g, "");
      }
      this.pagerData.set({
        pageNo: 1
      });
      this.initData();
    }
  }
  //重置按钮
  reset() {
    if (this.currentMenuType == "apply") {
      let status = this.query.Status; //保存当前的状态
      let OType = this.query.OType; //保存当前类型
      this.query = new Query(); //重置
      this.query.Status = status;
      this.query.OType = OType;
    } else {
      let status = this.examineQuery.taskstatus; //保存当前的状态
      let OType = this.query.OType; //保存当前类型
      this.examineQuery = new ExamineQuery(); //重置
      this.examineQuery.taskstatus = status;
      this.examineQuery.OType = OType;
    }
    this.initData();
  }
  public currentPageSize; //当前每页显示条数
  public currentPageSizes; //当前每页显示条数
  onChangePager(e: any) {
    if (this.currentMenuType == "apply") {
      // //非第一页，切换条数。跳为第一页
      if (this.currentPageSize != e.pageSize) {
        this.pagerData.pageNo = 1;
      }
      this.currentPageSize = e.pageSize;
      this.query.CurrentPage = e.pageNo;
      this.query.PageSize = e.pageSize;
    } else {
      // //非第一页，切换条数。跳为第一页
      if (this.currentPageSizes != e.pageSize) {
        this.pagerData.pageNo = 1;
      }
      this.currentPageSizes = e.pageSize;
      this.examineQuery.currentpage = e.pageNo;
      this.examineQuery.pagesize = e.pageSize;
    }
    this.initData();
  }
  /**
   * 动画部分
   */
  currentState: string = "out";
  toggleState(e?) {
    this.currentState === "out"
      ? (this.currentState = "in")
      : (this.currentState = "out");
    if (e) {
      this.currentState = "out";
    }
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong() {
    let that = this;
    window.addEventListener("storage", function(e) {
      //监听localstorage
      console.log(e.newValue, e);
      if (e.key === "normalOrder" && e.newValue.search("save") != -1) {
        that.initData();
        localStorage.removeItem("normalOrder");
      } else if (e.key === "normalOrder" && e.newValue.search("submit") != -1) {
        that.initData();
        localStorage.removeItem("normalOrder");
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

  //格式化查询参数
  formatQueryPromise() {
    this.query.BuyerName = this.query.BuyerName.trim();
    this.query.DeliveryOrderCode = this.query.DeliveryOrderCode.trim();
    this.query.ERPOrderCode = this.query.ERPOrderCode.trim();
    this.query.InputCondition = this.query.InputCondition.trim();
    this.query.MainContractCode = this.query.MainContractCode.trim();
    this.query.POCode = this.query.POCode.trim();
    this.examineQuery.POCode = this.examineQuery.POCode.trim();
    this.examineQuery.ApplyName = this.examineQuery.ApplyName.trim();
    this.examineQuery.BuyerName = this.examineQuery.BuyerName.trim();
    this.examineQuery.ERPOrderCode = this.examineQuery.ERPOrderCode.trim();
    this.examineQuery.POCode = this.examineQuery.POCode.trim();
  }
}
