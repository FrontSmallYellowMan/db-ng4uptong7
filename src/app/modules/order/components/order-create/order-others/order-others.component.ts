import { Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';

import { XcModalService, XcModalRef } from 'app/shared/index';
import { Person } from 'app/shared/services/index';
import { dbomsPath,environment } from "environments/environment";

import { AdvanceDepositsComponent } from './../select-advance-deposits/select-advance-deposits.component';
import { CashDetailComponent } from './../cashDetail/cash-detail.component';
import { SoldToInfoComponent } from './../soldToInfo/soldTo-info.component';
import { PaymentListComponent } from './../paymentList/payment-list.component';
import { SelecteIndustryComponent } from './../selectIndustry/select-industry.component';
import { InterCustomerComponent } from './../interCustomer/inter-customer.component';
import {
  MaterialInfo, SaleOrderForm, AccoriesInfo, SaleOrderInfo, CurrentUserInfo, DropInfoList,
  DeliveryType, DeliveryMaterialInfo, ProvinceCityInfo, OrderCreateService
} from './../../../services/order-create.service';
import { OrderListService } from './../../../services/order-list.service';
import { OrderViewService } from './../../../services/order-view.service';
import { CommunicateService } from "../../../services/communicate.service";

declare var window;

@Component({
  templateUrl: 'order-others.component.html',
  styleUrls: ['./../order-create.component.scss']
})
export class OrderCreateOthersComponent implements OnInit {
  userInfo = JSON.parse(localStorage.getItem("UserInfo"));//销售人员信息
  SC_Code;//合同单号
  SO_Code;//销售单号
  formData: SaleOrderForm = new SaleOrderForm();//表单数据
  materialList: MaterialInfo[] = [];//物料信息列表
  modalAdvance: XcModalRef;//预收款
  modalInterme: XcModalRef;//查询居间服务方
  modalCash: XcModalRef;//应还账款明细
  modalSold: XcModalRef;//售达方
  modalPayment: XcModalRef;//查询付款条件
  modalIndustry: XcModalRef;//查询部门行业
  loading: boolean = false;
  approverList = [];//预审人员信息
  unSelectApprover = [];//系统匹配审批人
  filesList: AccoriesInfo[] = [];//附件列表
  dropInfoList: DropInfoList = new DropInfoList();//下拉数据
  contractSubjectName;//合同主体
  //uploadFilesApi = this.orderCreateService.uploadFilesApi();//上传附件api
  uploadFilesApi= environment.server+'SaleOrder/UploadSOAccessories';

  provinceCityInfo: ProvinceCityInfo = new ProvinceCityInfo();//省市区信息
  cityList;//市
  districtList;//区县
  projectIndustryName;//部门行业名称
  invoiceCountAmount: number = 0;//支票总金额
  rebateAmountVal;//返款信息

  isSpecial: boolean = false;//合同主体为00M5和00M6,特殊合同
  isACustomer: boolean = false;//是否为一次性用户
  firstInit: boolean = true;//是否为初始化数据
  modifyTaxNumber: boolean = false;//是否维护税号
  invoiceFirstTip: boolean = true;//是否是提一次提示支票验证
  isSubmit: boolean = false;//是否提交
  isValidMaterial: boolean = false;//是否校验物料信息
  firstSave: boolean = true;//是否为第一次保存，判断取消键是否为删除功能
  isJudgeRebateRate: boolean = false;//是否判断最大返款率
  isOneCheckReMoy: boolean = false;//任意一个物料是否选择预收款
  wfData = {
    wfHistory: null,//审批历史记录
    wfProgress: null//流程全景图
  };;//审批记录信息

  isRiskStatus:string='1';//是否需要审批风险岗审批的状态码（1：true需要审批，0：false不需要审批）

  accessoryList:any[]=[];//保存每次上传成功后的返回数据
  filelUpLoadList: any[] = [];//用来保存新上传的附件列表
  alreadyfilelUpLoadList: any[] = [];//用来保存已经上传过的附件
  saleGroupList:any=[];//保存销售小组列表

  materialSum:number;//物料总数量

  @ViewChildren(NgModel) inputList;//表单控件
  @ViewChildren('forminput') inputListDom;//表单控件DOM元素
  @ViewChild(NgForm) myApplyForm;//表单
  @ViewChildren("salePerson") salePerson;//销售人员
  @ViewChildren("agentPerson") agentPerson;//销售人员
  @ViewChildren('checkPoint') checkPointList;//表单控件DOM元素
  @ViewChild('delivery') delivery;//物料信息
  @ViewChild('approver') approver;//审批信息
  @ViewChild('cheque') cheque;//支票信息
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService,
    private orderListService: OrderListService,
    private orderViewService: OrderViewService,
    private communicateService:CommunicateService
  ) { }
  /*
  *获取url参数
  */
  getUrlParams() {
    this.SC_Code = this.routerInfo.snapshot.queryParams['sc_code'];
    this.SO_Code = this.routerInfo.snapshot.queryParams['so_code'];
  }
  /*
  *获取销售订单信息
  */
  getOrderBaseData() {
    this.loading = true;
    if (this.SO_Code) {
      let params = {
        salesOrderID: this.SO_Code,
        Type: this.formData.Type
      };
      this.orderCreateService.getSOFullData(params).subscribe(
        data => {
          if (data.Result && data.Data) {
            let info = JSON.parse(data.Data);
            if (info.SalesOrderData.Status == 0 || info.SalesOrderData.Status == 3) {
              
              // info.SalesOrderData.OrderTypeId = "0002";//订单类型
              //info.SalesOrderData.PaymentTermsCode = "0001";//付款条件代码
              //info.SalesOrderData.PaymentTerms = "现款，无折扣或折扣后返";//付款条件名称
              this.getFormDataCallBack(info);
            } else {
              this.windowService.alert({ message: "该订单已进入审批流程或已完成，无法编辑！", type: "success" });
              setTimeout(() => { window.close(); }, 1500);
            }
            //初始化一进页面ListPrePayment预收款列表是否存在，存在则可以删除
            if (info.DeliveryData && info.DeliveryData.length > 0) {
              info.DeliveryData.forEach(item => {
                if (item.ListPrePayment && item.ListPrePayment.length > 0) {
                  this.isOneCheckReMoy = true;
                  item.isCheckReMoy = true;
                }
              })
              if (this.isOneCheckReMoy == true)
                this.orderTypeChange();
            }

          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        });
    } else {
      this.orderCreateService.getCreateNoCSalesOrder().subscribe(
        data => {
          if (data.Result && data.Data) {
            let info = JSON.parse(data.Data);
            // info.SalesOrderData.OrderTypeId = "0002";//订单类型
            this.getFormDataCallBack(info);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        });
    }
  }
  /*
  *获取下拉列表基本信息
  */
  getSelectedListData(info?) {
    let params = {
      OType: this.formData.Type,
      YWFWDM: info["SalesOrderData"]["YWFWDM"]
    };
    this.orderCreateService.getSOBaseData(params).subscribe(
      data => {
        if (data.Result) {
          let dropInfoList = JSON.parse(data.Data);
          //部门行业
          // if (dropInfoList["ListProIndustry"] && dropInfoList["ListProIndustry"].length > 0 && this.formData.SalesOrderData.ProjectIndustryID) {
          //   let ProjectIndustryID = this.formData.SalesOrderData.ProjectIndustryID;
          //   let selected = dropInfoList["ListProIndustry"].filter(item => item.ProjectIndustryID == ProjectIndustryID);
          //   this.projectIndustryName = selected[0]["IndustryName"];
          // }
          //物料信息传入返款
          this.rebateAmountFun();
          this.dropInfoList = dropInfoList;
          this.dropInfoList.ListCurrency = dropInfoList["ListCurrency"].filter(item => item.CurrencyID !== "0003" && item.CurrencyID !== "0004");//币种
          //新增逻辑，去掉还借用限制
          // this.dropInfoList.ListOrderType = dropInfoList["ListOrderType"].filter(item => item.OrderTypeId !== "0011");//订单类型
          
          this.dropInfoList.ListPlatform = dropInfoList["ListPlatform"].filter(item => item.platformcode !== "80" && item.platformcode !== "65");//平台,屏蔽澳门与香港
          //部门产品组为空时默认选中第一项
          // if(!this.formData.SalesOrderData.DepartmentProductGroupID){
          //   this.formData.SalesOrderData.DepartmentProductGroupID = this.dropInfoList.ListDepPro[0].DepartmentProductGroupID;
          // }

          if(!this.formData.SalesOrderData.DepartmentProductGroupID){
            this.getUserInfo();//获取申请人的基本信息，用来赋值部门产品组的默认值
          }

          //物料信息传入返款
          this.rebateAmountFun();
          console.info(dropInfoList)
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  /*
  *获取省市区信息
  */
  getProvinceCityData() {
    this.orderCreateService.getProvinceCityInfo().subscribe(
      data => {
        if (data && data.Data) {
          let info = JSON.parse(data.Data);
          this.provinceCityInfo = info;
          if (this.formData.SalesOrderData.InvoiceAreaID && info) {//省市区数据回显
            this.changeProvince();
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  /**
  *是否需要验证最大返款率
  */
  getRebateAmountInfo() {
    let params = {
      YWFWDM: this.formData.SalesOrderData["YWFWDM"]
    };
    this.orderCreateService.getRebateAmountInfo(params).subscribe(
      data => {
        if (data && data.Data) {
          this.isJudgeRebateRate = JSON.parse(data.Data);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  ngOnInit() {
    if (!this.userInfo) {
      this.windowService.confirm({ message: "当前登录信息失效，请重新登录!" }).subscribe({
        next: (v) => {
          if (v) {
            window.location.href = dbomsPath + "login";
          }
        }
      });
      return;
    };
    // this.formData.SalesOrderData.OrderTypeId = "0002";//订单类型
    //this.formData.SalesOrderData.PaymentTermsCode = "0001";//付款条件代码
    //this.formData.SalesOrderData.PaymentTerms = "现款，无折扣或折扣后返";//付款条件名称
    this.formData.Type = 2;//订单框架类型
    this.getUrlParams();//获取URL参数信息
    this.getOrderBaseData();//获取订单基础信息
    this.getSalesGroup();//获取销售小组
    this.modalAdvance = this.xcModalService.createModal(AdvanceDepositsComponent);//查询预收款
    this.modalAdvance.onHide().subscribe((data) => { })
    this.modalCash = this.xcModalService.createModal(CashDetailComponent);//查询应收款明细
    this.modalCash.onHide().subscribe((data) => { })
    this.modalInterme = this.xcModalService.createModal(InterCustomerComponent);//查询居间服务方
    this.modalInterme.onHide().subscribe((data) => {
      if (data) {
        this.formData.SalesOrderData.IntermediateCustomerName = data["NAME"];
        this.formData.SalesOrderData.IntermediateCustomerERPCode = data["KUNNR"];
      }
    })
    this.modalSold = this.xcModalService.createModal(SoldToInfoComponent);//查询售达方列表
    this.modalSold.onHide().subscribe((data) => {
      if (data) {
        this.formData.SalesOrderData.CustomerERPCode = data["KUNNR"];
        this.formData.SalesOrderData.CustomerName = data["NAME"];
        this.formData.SalesOrderData.EndUserName = data["NAME"];
        this.jugdeIsACustomer(data.KUNNR);
        let params = {
          CustomerERPCode: data["KUNNR"]
        }
        this.orderCreateService.getCustomerUnClerData(params).subscribe(//获取售达方应收账款
          res => {
            if (res && res.Data) {
              let info = JSON.parse(res.Data);
              this.formData.SalesOrderData.Receivable = info["Receivable"].toFixed(2);
              this.formData.SalesOrderData.Overdue = info["Overdue"].toFixed(2);
            }
          }
        );
      }

      //验证是否需要风险岗审批
      this.isRiskApprovalNoContract();

    })
    this.modalPayment = this.xcModalService.createModal(PaymentListComponent);//查询付款条件
    this.modalPayment.onHide().subscribe((data) => {
      if (data) {
        this.formData.SalesOrderData.PaymentTermsCode = data["PaymentCode"];
        this.formData.SalesOrderData.PaymentTerms = data["PaymentText"];
      }
    })
    this.modalIndustry = this.xcModalService.createModal(SelecteIndustryComponent);//查询部门行业
    this.modalIndustry.onHide().subscribe((data) => {
      if (data) {
        this.formData.SalesOrderData.ProjectIndustryID = data["ProjectIndustryID"];
        this.projectIndustryName = data["IndustryName"];
      }
    });


    //获取物料明细的状态，用来重新计算物料总数量
    this.communicateService.getSendMaterialAmount().subscribe(v=> {
      if(v) {
        /**
         * 说明：2019-2-25 by:weihfa
         * 采用定时器的原因：在接收到物料修改的事件时，重新计算物料的总和，
         * 但是这时发现计算的物料数量并不是修改后的，推测可能是修改物料的（ngModelChange）事件导致的，
         * 这个变更监测触发先于发送修改值的结果，造成了在值还没有修改完就发送了状态，
         * 使用定时器使函数延迟执行，再计算的值就是修改后的，
         * 为了避免修改原始逻辑造成的不可预估问题，所以暂时留作观察，后续可优化。
         */
        setTimeout(() => {
          this.restMaterialSum();//重新计算物料总和
        }, 100);
       
      }
    });

  }

    //重新计算物料总和
    restMaterialSum() {
    
      let materialAmountArray:any=[];// 声明一个空数组，用来保存取的物料数量

        this.formData.DeliveryData.forEach(element=> {//遍历送达方
          if(element.MaterialList&&element.MaterialList.length>0) {// 如果存在物料明细
            element.MaterialList.forEach(materialItem=> {// 遍历物料明细列表，将物料数量push进数组
              materialAmountArray.push(typeof(materialItem.Quantity)==='string'?parseInt(materialItem.Quantity):materialItem.Quantity);//如果输入数量为字符串则转换为数字
             });
  
          }
           
        });
  
        //声明一个函数，用来处理reduce()方法的求和函数
        let getSum = function (total,num) {
          return total+num;
        };
  
        console.log('计算物料的总和数组',materialAmountArray);
        this.materialSum=materialAmountArray.reduce(getSum,0);// 求和，保存物料总数量
      
    }

  /*
  *数据回调函数
  */
  getFormDataCallBack(data) {
    //表单数据先填充，再获取基础数据
    this.getProvinceCityData();//获取省市区信息
    this.getSelectedListData(data);//获取下拉列表基础信息
    this.filesList = data["AccessoryList"];
    this.formData.UnSalesAmount = data["UnSalesAmount"];
    if (data["ReceiptData"]) {
      this.formData.ReceiptData = data["ReceiptData"];
      this.cheque.initData(data["ReceiptData"]);
      this.chequeCallBack(data["ReceiptData"]);
    }
    this.formData.DeliveryData = data["DeliveryData"] ? data["DeliveryData"] : [];
    this.formData.AccessoryList = data["AccessoryList"] ? data["AccessoryList"] : [];

    if (this.formData.AccessoryList.length > 0) {//如果存在已上传的附件列表
      this.alreadyfilelUpLoadList = JSON.parse(JSON.stringify(this.formData.AccessoryList));//将已上传的附件列表存入新的变量中
      this.formData.AccessoryList = [];//将原来保存上传列表的字段清空，以备再次提交时保存上传附件列表
      this.alreadyfilelUpLoadList.forEach(item => {//遍历新保存的已上传附件列表字段，添加name属性，用来附件上传组件显示名称
        item['name'] = item.AccessoryName;
      });
    };

    let currentUser = new CurrentUserInfo();
    let user = this.userInfo;
    let saleOrderInfo = data["SalesOrderData"];

    if (data["CurrentUser"]) {
      currentUser = data["CurrentUser"];
      saleOrderInfo.ContractSubjectCode = currentUser.CompanyCode;
      saleOrderInfo.ContractSubject = currentUser.CompanyName;
      saleOrderInfo.YWFWDM = currentUser.YWFWDM;
      saleOrderInfo.SalesITCode = currentUser["ITCode"];
      saleOrderInfo.SalesName = currentUser["UserName"];
    }
    if (saleOrderInfo) {

      for (let key in saleOrderInfo) {
        if (saleOrderInfo[key] == null) {
          saleOrderInfo[key] = "";
        }
      }
      this.formData["SalesOrderData"] = saleOrderInfo;

      //2019-2-18 新增逻辑,如果不存在业务范围代码则从localStor中获取
     if(!this.formData.SalesOrderData.DepartmentProductGroupID) {
      this.formData.SalesOrderData.DepartmentProductGroupID=this.userInfo.YWFWDM.substring(0,2);
     }

      let saleInfo = {//销售人员
        userID: saleOrderInfo["SalesITCode"],
        userEN: (saleOrderInfo["SalesITCode"]).toLocaleLowerCase(),
        userCN: saleOrderInfo["SalesName"]
      };
      this.salePerson._results[0].Obj = saleInfo;
      if (!saleOrderInfo["AgentITCode"]) {//收款人员
        saleOrderInfo.AgentITCode = user["ITCode"];
        saleOrderInfo.AgentName = user["UserName"];
      };
      let agentPerson = {
        userID: saleOrderInfo["AgentITCode"],
        userEN: (saleOrderInfo["AgentITCode"]).toLocaleLowerCase(),
        userCN: saleOrderInfo["AgentName"]
      };
      this.agentPerson._results[0].list.push(agentPerson);
      this.jugdeIsACustomer(saleOrderInfo.CustomerERPCode);//判断是否为一次性用户
      this.formData.SalesOrderData.IsSuperDiscount = this.isSpecial && !saleOrderInfo.IsSuperDiscount ? "0" : saleOrderInfo.IsSuperDiscount;//是否为特折单
      if (saleOrderInfo.ContractSubjectCode == "00M5" || saleOrderInfo.ContractSubjectCode == "00M6") {//判断是否为特殊合同
        this.isSpecial = true;
        this.contractSubjectName = saleOrderInfo.ContractSubjectCode + "-" + saleOrderInfo.ContractSubject;
      } else if (saleOrderInfo.ContractSubjectCode) {
        this.contractSubjectName = saleOrderInfo.ContractSubjectCode + "-" + saleOrderInfo.ContractSubject;
      } else {
        this.contractSubjectName = saleOrderInfo.ContractSubjectCode
      }
      if (!saleOrderInfo.ChannelOfDistributionID) {//分销渠道。默认为11/分销
        this.formData.SalesOrderData["ChannelOfDistributionID"] = "11";
      } else if (saleOrderInfo.CustomerERPCode.slice(0, 1) == "2") {
        this.formData.SalesOrderData["ChannelOfDistributionID"] = "15";
      }
      if (!saleOrderInfo.RebatePercentageID) {//是否有无返款
        this.formData.SalesOrderData.RebatePercentageID = "0001";
        this.rebateAmountVal = "0.00";
      } else {
        this.rebateAmountFun();
      }
      this.formData.SalesOrderData.EndUserName = !saleOrderInfo.EndUserName ? saleOrderInfo.CustomerName : saleOrderInfo.EndUserName;//最终用户名称默认为客户名称
      this.formData.SalesOrderData.BusiApprovePlatform = !saleOrderInfo.BusiApprovePlatform ? this.userInfo["FlatCode"] : saleOrderInfo.BusiApprovePlatform;//商务审批平台
      this.formData.SalesOrderData.IsMailingInvoice = !saleOrderInfo.IsMailingInvoice ? "0" : saleOrderInfo.IsMailingInvoice;//是否选择发票
      this.formData.SalesOrderData.InvoiceTypeID = !saleOrderInfo.InvoiceTypeID ? "0001" : saleOrderInfo.InvoiceTypeID;//发票类型。默认为专票
      if (saleOrderInfo["WFApproveUserJSON"]) {// 审批人员
        let approverList = [];
        let approveUser = JSON.parse(saleOrderInfo["WFApproveUserJSON"]);
        let unSelectApprover = [];
        let dealUnmodifiesApprove = this.dealUnmodifiesApprove;
        approveUser.forEach(function(item, index) {
          if (parseInt(item.NodeID) < 7) {
            let list = [];
            let person = JSON.parse("{}");
            let userSeting = [];
            if (item.UserSettings) {
              userSeting = typeof item.UserSettings == "string" ? JSON.parse(item.UserSettings) : item.UserSettings;
              if (userSeting.length > 0) {
                person = {
                  id: "1",
                  nodeName: item.NodeName,
                  name: userSeting[0]["UserName"],
                  itcode: userSeting[0]["ITCode"]
                };
                list.push(new Person(person));
                approverList.push({ person: list });
              }
            }
          } else {
            let approverList = JSON.parse(item.ApproverList);
            unSelectApprover.push(dealUnmodifiesApprove(approverList, item.NodeName));
          }
        });
        this.unSelectApprover = unSelectApprover;
        this.approver.initPerson(approverList);
        if (this.formData.SalesOrderData.Status === "3") {//审批记录显示
          this.getWfData();
        }
      }
    }
    if (this.formData.SalesOrderData["YWFWDM"]) {//调取，最大返款率是否判断接口
      this.getRebateAmountInfo();
    }
    //初始新建订单，部分数据为CurrentUser获取。按订单号查询无CurrentUser字段.故先保存一下，防止用户直接关闭页面
    //再次按订单查询时，部门数据无法显示
    if (data["CurrentUser"]) {
      this.orderCreateService.saveSaleOrderData(this.formData).subscribe(
        data => {
          if (data.Result) {
            if (!this.SO_Code) {
              window.history.pushState({}, "", location.href + "?so_code=" + saleOrderInfo["SalesOrderID"]);//新建页面，再次刷新。避免一直新加订单
            }
          }
        }
      );
    }
    console.log(this.formData);

    //验证是否需要风险岗审批
    this.isRiskApprovalNoContract();
  }
  retrunCheckCallBack(data) {
    data.some(item => {
      if (item.isCheckReMoy) {
        this.isOneCheckReMoy = true;//看是否切换需要删除
        return true;
      }
    })
    this.formData.DeliveryData = data;
  }
  orderTypeChange() {
    //切换订单类型时候：如果不是预收款则把已经选中的预收款的清空，以防止这里占用别人没法使用
    if (this.formData.SalesOrderData.OrderTypeId != "0002" && this.isOneCheckReMoy) {
      this.loading = true;
      let params = {
        SCOrderID: this.formData.SalesOrderData.SalesOrderID
      }
      this.orderCreateService.deletePrepanyment(params).subscribe(
        data => {
          if (data.Result) {
            // this.isOneCheckReMoy = false;
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        }

      );
    }

  }

  /**
   * 说明：2018-11-07，新增字段销售小组（SalesGroup）
   * 获取销售小组
   */
  getSalesGroup(){
    this.orderCreateService.getSalesGroup().then(data=>{
      if(data.Result){
        this.saleGroupList=JSON.parse(data.Data);
        console.log('获取销售小组',JSON.parse(data.Data));
      }
    });
  }

  /*
   *判断售达方是否为一次性客户
   */
  jugdeIsACustomer(ERPCode) {
    if (ERPCode == "A" || ERPCode == "ALY") {//判断是否为一次性用户
      this.formData.SalesOrderData.OrderTypeId = "0002";
      // this.myApplyForm.controls["orderType"].disable({ onlySelf: false });
      this.isACustomer = true;
    } else {
      // this.myApplyForm.controls["orderType"].enable({ onlySelf: false });
      this.isACustomer = false;
    };
  }
  /*
  *选择省份
  */
  changeProvince() {
    let provinceCode = this.formData.SalesOrderData.InvoiceAreaID;
    let cityInfo = this.provinceCityInfo["city"];
    if (this.firstInit && this.formData.SalesOrderData.InvoiceCity) {
      this.changeCity();
      this.firstInit = false;
    } else {//点击修改省市区
      this.formData.SalesOrderData.InvoiceCity = "";
      this.formData.SalesOrderData.InvoiceDistrict = "";
      this.cityList = [];
      this.districtList = [];
    }
    this.cityList = cityInfo.filter(item => item.CityCode.indexOf(provinceCode) == 0);
    console.info()
  }
  /*
  *选择城市
  */
  changeCity() {
    let citycode = this.formData.SalesOrderData.InvoiceCity;
    let countyInfo = this.provinceCityInfo["district"];
    if (this.firstInit) {
      this.firstInit = false;
    } else {//点击修改清空后面数据
      this.formData.SalesOrderData.InvoiceDistrict = "";
      this.districtList = [];
    }
    this.districtList = countyInfo.filter(item => item.CityCode.indexOf(citycode) == 0);
  }
  /*
  *查询预收款弹层
  */
  selectAdvance() {
    let params = {
      SalesAmountTotal: this.formData.SalesOrderData.SalesAmountTotal,
      CustomerERPCode: this.formData.SalesOrderData.CustomerERPCode,
      CompanyCode: this.formData.SalesOrderData.ContractSubjectCode,
      SalesOrderID: this.formData.SalesOrderData.SalesOrderID
    }
    this.modalAdvance.show(params);
  }
  /*
  *返款信息修改
  */
  rebateAmountFun() {
    let id = this.formData.SalesOrderData.RebatePercentageID || "0001";
    let selected = this.dropInfoList.ListRebate.filter(item => item.RebatePercentageID == id);
    if (selected && selected.length > 0) {
      this.rebateAmountVal = selected[0]["RebatePercentageValue"];
    }
  }
  /*
  *查询居间服务方
  */
  searchInterCustomer() { this.modalInterme.show(this.formData.SalesOrderData.CustomerName); }
  /*
  *查询现金账单明细
  */
  cashDetail() { this.modalCash.show(this.formData.SalesOrderData.CustomerERPCode); }
  /*
  *查询售达方信息
  */
  saleToParty() {
    let params = { CustomerName: this.formData.SalesOrderData.CustomerName };
    this.modalSold.show(params);
  }
  /*
  *查询付款条件
  */
  searchPayment() { this.modalPayment.show(); }
  /*
  *查询部门行业
  */
  selectedIndustry() { this.modalIndustry.show(this.dropInfoList.ListIndustry); }
  /*
   *处理不可修改审批人员信息
   */
  dealUnmodifiesApprove(approverList, name) {
    let obj = {};
    let list = [];
    approverList.forEach(function(m, i) {
      let person = JSON.parse("{}");
      person = {
        id: "1",
        name: m["UserName"],
        itcode: (m["ITCode"] || "").toLocaleLowerCase()
      }
      list.push(new Person(person));
    })
    return obj = {
      nodeName: name,
      personList: list
    };
  }
  /*
   *切换商务审批平台
   */
  changeBusiapprove(item) {
    if (!item) {
      this.windowService.alert({ message: "商务审批平台为空，不会修改商务审批人信息！", type: "fail" });
      return;
    }
    this.orderCreateService.getWFApproveUserJSON(item).subscribe(
      data => {
        if (data.Result) {
          let approveUser = JSON.parse(data.Data);
          let arr = JSON.parse(this.formData.SalesOrderData["WFApproveUserJSON"]);
          arr.splice(4);//截取前四级审批。splice对原数组修改，删除元素，并向数组添加新元素。
          this.formData.SalesOrderData["WFApproveUserJSON"] = JSON.stringify(arr.concat(approveUser.slice(4)));//截取后三级审批，合并。slice不改变原来数组，4为开始索引值，从某个已有的数组返回选定的元素
          let unSelectApprover = [];
          approveUser.forEach(function(item, index) {
            if (parseInt(item.NodeID) >= 7) {
              let approverList = JSON.parse(item.ApproverList);
              unSelectApprover.push(this.dealUnmodifiesApprove(approverList, item.NodeName));
            }
          }, this);
          this.unSelectApprover = unSelectApprover;
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
          this.loading = false;
        }
      }
    );
  }
  /*
  *送达方与物料信息
  */
  deliveryCallBack(e) { }
  /*
  *发票组件，数据回调函数
  */
  chequeCallBack(e?) {
    if (e.length > 0) {
      this.formData.ReceiptData = e;
      let contAmount = 0;
      e.forEach(function(item, index) {
        contAmount += parseFloat(item.amount);
      })
      this.invoiceCountAmount = contAmount;
    } else {
      this.invoiceCountAmount = 0;
    }
  }
  /*
  *表单提交
  */
  submit(e?) {
    this.isSubmit = true;
    if (this.myApplyForm.valid) {//表单验证通过
      if (this.formData.SalesOrderData["AgentITCode"] == "") {//销售员验证
        this.windowService.alert({ message: "请选择收款人!", type: "fail" });
        return;
      }
      let checkDeliveries = this.delivery.checkDeliveries();//返回message
      if (checkDeliveries) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          this.windowService.alert({ message: checkDeliveries, type: "fail" });
          return;
        }
      }

      //是否选择送达方
      if(this.formData.DeliveryData.length ===0){
        this.windowService.alert({message:"请添加送达方与物料信息",type:"fail"});
        return;
      }

      //验证送达方信息
      if(this.submitTestShipAddress()) return;

      if (parseFloat(this.formData.SalesOrderData.SalesAmountTotal) === 0) {//销售单金额不可为零
        this.windowService.alert({ message: "销售订单金额不能为零！", type: "fail" });
        return;
      }
      if (this.isJudgeRebateRate && this.formData.SalesOrderData.RebatePercentageID === "0004") {//物料返款金额
        if (parseFloat(this.formData.SalesOrderData.RebateAmountTotal) / (parseFloat(this.formData.SalesOrderData.SalesAmountTotal) + parseFloat(this.formData.SalesOrderData.RebateAmountTotal)) > 0.3) {
          this.windowService.alert({ message: "物料返款金额不得高于最大返款率30%，请重新填写!", type: "fail" });
          return;
        }
      }
      if (this.invoiceCountAmount > parseFloat(this.formData.SalesOrderData.SalesAmountTotal)) {//支票使用金额大于销售金额
        this.windowService.alert({ message: "当前支票使用总金额大于订单销售金额！", type: "fail" });
        return;
      }
      //是否必须关联支票
      if (this.invoiceFirstTip && (this.formData.SalesOrderData.PaymentMode == "002" || this.formData.SalesOrderData.PaymentMode == "003") && this.formData.ReceiptData.length == 0) {
        this.windowService.alert({ message: "您还没有关联支票信息，是否补充支票信息？", type: "fail" });
        this.invoiceFirstTip = false;
        return;
      }
      if (this.formData.SalesOrderData["WFApproveUserJSON"]) {//审批人
        let approverList = JSON.parse(this.formData.SalesOrderData["WFApproveUserJSON"]);
        let userSeting = [];
        if (typeof approverList[0].UserSettings == "string") {
          userSeting = JSON.parse(approverList[0].UserSettings);
        } else {
          userSeting = approverList[0].UserSettings;
        }
        if (userSeting.length == 0) {
          this.windowService.alert({ message: "请选择审批人", type: "fail" });
          return;
        }
      } else {
        this.windowService.alert({ message: "请选择审批人", type: "fail" });
        return;
      }
      this.loading = true;
      
      this.checkMaterialAmount();//首先验证物料金额
    } else {//表单验证未通过
      let flag = false;
      for (let i = 0; i < this.inputList.length && !flag; i++) {//遍历表单控件
        if (this.inputList._results[i].invalid) {//验证未通过
          let ele = this.inputListDom._results[i];//存储该表单控件元素
          if (ele && ele.nativeElement) {
            ele.nativeElement.focus();//使该表单控件获取焦点
          }
          this.windowService.alert({ message: "红框内为必填项，请将订单内容填写完整！", type: "fail" });
          flag = true;
        }
      }
    }
  }
  /*
  *维护税号
  */
  modifyCustomerTaxCode() {
    //非一次性用户无税号，普通发票0002，进行维护
    if (!this.isACustomer && this.formData.SalesOrderData.InvoiceTypeID == "0002" && this.modifyTaxNumber) {
      let params = {
        CustomerERPCode: this.formData.SalesOrderData.CustomerERPCode,
        CompanyCode: this.formData.SalesOrderData.ContractSubjectCode,
        SalesOrderID: this.formData.SalesOrderData.SalesOrderID,
        ChannelOfDistrubution: this.formData.SalesOrderData.ChannelOfDistributionID,
        DepartmentProductGroup: this.formData.SalesOrderData.DepartmentProductGroupID,
        InvoiceTypeId: this.formData.SalesOrderData.InvoiceTypeID,
        TaxNumber: this.formData.SalesOrderData.CustomerTaxNumber
      }
      //写入税号
      this.windowService.alert({ message: "维护税号需要时间，请稍候！", type: "fail" });
      this.orderCreateService.modifyCustomerTaxCode(params).subscribe(
        data => {
          this.windowService.close();
          if (data.Result) {
            let info = JSON.parse(data.Data);
            this.submitApi();//提交
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
            this.loading = false;
          }
        }
      );
    } else {
      this.submitApi();
    }
  }
  /*
  *验证物料金额
  */
  checkMaterialAmount() {
    let params = {
      SalesAmountTotal: this.formData.SalesOrderData.SalesAmountTotal,
      DeliveryData: this.formData.DeliveryData
    }
    this.orderCreateService.checkMaterialAmount(params).subscribe(
      data => {
        this.windowService.close();
        if (data.Result) {
          let info = JSON.parse(data.Data);
          if (info === false) {  //false物料金额不合规定
            this.loading = false;
            this.windowService.confirm({ message: data.Message }).subscribe({
              next: (v) => {
                if (v) {
                  this.loading = true;
                  this.modifyCustomerTaxCode();//判断是否维护税号或者提交
                }
              }
            });
          } else {
            this.modifyCustomerTaxCode();
          }
        } else {
          this.loading = false;
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  /*
  *提交接口
  */
  submitApi() {

    //改变审批人字符串的状态值
    this.changeAprovalPerson();

    //合并上传过的附件和新上传的附件
    this.formData.AccessoryList=[...this.alreadyfilelUpLoadList,...this.filelUpLoadList];

    this.orderCreateService.submitSaleOrder(this.formData).subscribe(
      data => {
        if (data.Result) {
          this.windowService.alert({ message: "提交成功", type: "success" }).subscribe(()=>{
            window.close();
          });
          setTimeout(() => { window.close(); }, 1000);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
          if (data.Message == "请到支付信息中维护售达方税号") {
            this.modifyTaxNumber = true;
            this.inputListDom._results[12].nativeElement.focus();
          }
        }
        this.loading = false;
      }
    );
  }
  /*
  *暂存
  */
  save() {
    this.isValidMaterial = true;
    // if (this.invoiceCountAmount > parseFloat(this.formData.SalesOrderData.SalesAmountTotal)) {//支票使用金额大于销售金额
    //   this.windowService.alert({ message: "当前支票使用总金额大于订单销售金额！", type: "fail" });
    //   return;
    // }
    
    //验证送达方
    //if(this.testShipAddress()) return;

    //合并上传过的附件和新上传的附件
    this.formData.AccessoryList=[...this.alreadyfilelUpLoadList,...this.filelUpLoadList];

    this.orderCreateService.saveSaleOrderData(this.formData).subscribe(
      data => {
        if (data.Result) {
          this.firstSave = false;
          this.windowService.alert({ message: "保存成功", type: "success" }).subscribe(()=>{
            window.close();
          });
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  //验证送达方地址
  testShipAddress(){
    let valueInvaild:boolean=false;//是否不合法
    if (this.formData.DeliveryData.length > 0) {//送达方地址验证
      let singleSDF = this.formData.DeliveryData.length != 1 ? false : true;
      let isCheck = this.formData.DeliveryData.length != 1 ? false : true;
      let message = "";

      this.formData.DeliveryData.some((item, index) => {
        if (!item.Deliverinfo["SDFID"]) {//送达方验证
          message = singleSDF ? "请填写完整的送达方信息并保存！" : "请完善第" + (index + 1) + "个送达方信息并保存！";
          return true;
        }
        // if (this.formData.SalesOrderData.OrderTypeId == '0002') {
        //   if (!item.isCheckReMoy) {//送达方验证
        //     message = isCheck ? "预收款未选择！" : "第" + (index + 1) + "个预收款未选择！";
        //     return true;
        //   }
        // }
      });

      //物料信息必填验证
      this.formData.DeliveryData.forEach(deliverydataitem => {
        deliverydataitem.MaterialList.forEach(materialitem => {
          if (!materialitem.MaterialCode || !materialitem.MaterialName || materialitem.Price === "" ||!materialitem.Factory) {
            message = "物料信息必填项未填写！";
          }
        });
      });
      if (message) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          valueInvaild=true;
          this.windowService.alert({ message: message, type: "fail" });
        }
        return;
      }else{
        valueInvaild=true;
      }
    }
    return valueInvaild;
  }

  //提交时验证送达方的全部信息是否完整
  submitTestShipAddress(){
    let valueInvaild:boolean=false;//是否不合法
    if (this.formData.DeliveryData.length > 0) {//送达方地址验证
      let singleSDF = this.formData.DeliveryData.length != 1 ? false : true;
      let isCheck = this.formData.DeliveryData.length != 1 ? false : true;
      let message = "";

      this.formData.DeliveryData.some((item, index) => {
        if (!item.Deliverinfo["SDFID"]||!item.Deliverinfo["SDFCode"]||!item.Deliverinfo["SDFName"]||!item.Deliverinfo["AreaID"]||!item.Deliverinfo["SDFCity"]||!item.Deliverinfo["SDFDistrict"]||!item.Deliverinfo["SDFAddress"]) {//送达方验证
          message = singleSDF ? "请填写完整的送达方信息并保存！" : "请完善第" + (index + 1) + "个送达方信息并保存！";
          return true;
        }
        // if (this.formData.SalesOrderData.OrderTypeId == '0002') {
        //   if (!item.isCheckReMoy) {//送达方验证
        //     message = isCheck ? "预收款未选择！" : "第" + (index + 1) + "个预收款未选择！";
        //     return true;
        //   }
        // }
      });

      //物料信息必填验证
      this.formData.DeliveryData.forEach(deliverydataitem => {
        deliverydataitem.MaterialList.forEach(materialitem => {
          if (!materialitem.MaterialCode || !materialitem.MaterialName || materialitem.Price === "" || !materialitem.Factory) {
            message = "物料信息必填项未填写！";
          }
        });
      });
      if (message) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          valueInvaild=true;
          this.windowService.alert({ message: message, type: "fail" });
        }
        valueInvaild=true;
      }
    }
    return valueInvaild;
  }
  

  /*
  *取消
  */
  cancel() {
    if (!this.SO_Code && this.firstSave) {//新建的订单，不保存订单直接删除
      this.windowService.confirm({ message: "确认取消新建订单?" }).subscribe({
        next: (v) => {
          if (v) {
            let params = {
              SalesOrderID: this.formData.SalesOrderData.SalesOrderID,
              Type: this.formData.Type
            }
            this.orderListService.deleteOrder(params).subscribe(data => {
              if (data.Result) {
                this.windowService.alert({ message: '成功取消订单', type: "success" });
                setTimeout(() => { window.close(); }, 1000);
              } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
              }
            })
          }
        }
      });
    } else {
      window.close();
    }
  }
  /*
  *上传附件回调函数
  */
  onFileCallBack(e) { 
    if (e.Result) {
      this.accessoryList = JSON.parse(e.Data)[0];
      this.filelUpLoadList.push(this.accessoryList);
      console.log(this.filelUpLoadList);
    } else {
      this.windowService.alert({ message: e.message, type: "fail" });
    }
    
  }

  //删除上传附件的回调函数
  deleteUploadFile(e) {
    if(this.filelUpLoadList.length!=0&&this.alreadyfilelUpLoadList.length!==0){
      this.filelUpLoadList.splice(Math.abs(e-(this.alreadyfilelUpLoadList.length)),1);
    }else if(this.filelUpLoadList.length!==0&&this.alreadyfilelUpLoadList.length===0){
      this.filelUpLoadList.splice(e,1);
    }
  }

  /*
  *预审信息
  */
  getChange(personArr?) {
    let approveUserList = JSON.parse(this.formData.SalesOrderData["WFApproveUserJSON"])
    personArr.forEach(function(item, index) {
      let approver = {};
      let userSeting = [];
      if (typeof approveUserList[index]["UserSettings"] == "string") {
        userSeting = JSON.parse(approveUserList[index]["UserSettings"]);
      } else {
        userSeting = approveUserList[index]["UserSettings"];
      }
      if (item.person.length > 0) {
        let info = item.person[0];
        userSeting[0] = {
          ITCode: info["itcode"],
          UserName: info["name"]
        };
        approveUserList[index]["UserSettings"] = userSeting;
        approveUserList[index]["IsOpened"] = "1";
      } else {
        if (index != 0) {
          approveUserList[index]["IsOpened"] = "0";
        }
        approveUserList[index]["UserSettings"] = [];
      }
    });
    this.formData.SalesOrderData["WFApproveUserJSON"] = JSON.stringify(approveUserList);
  }
  /*
  *销售人员选择修改
  */
  changePerson(info?) {
    if (info.length > 0) {
      this.formData.SalesOrderData["AgentITCode"] = info[0]["userEN"];
      this.formData.SalesOrderData["AgentName"] = info[0]["userCN"];
    } else {
      this.formData.SalesOrderData["AgentITCode"] = "";
      this.formData.SalesOrderData["AgentName"] = "";
    }
  }
  //获取审批历史、流程全景数据
  getWfData() {
    let so_code = this.SO_Code;
    if (so_code) {
      this.orderViewService.contractRevoke(so_code).subscribe(data => {
        if (data.Result) {
          this.wfData = JSON.parse(data.Data);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }

  //是否需要风险岗审批
  isRiskApprovalNoContract() {
    let CustomerERPCode = this.formData.SalesOrderData.CustomerERPCode;//保存售达方代码
    let YWFWDM = this.formData.SalesOrderData.YWFWDM;// 保存业务范围代码

    this.orderCreateService.isRiskApprovalNoContract(CustomerERPCode,YWFWDM).then(data=> {
      console.log('获取到的是否验证风险岗',data)
      if(data.Result){
        this.isRiskStatus=data.Data?'1':'0';
        //console.log(this.isRiskStatus)
      }
    });
  }

  //修改审批人字符串的状态值
  changeAprovalPerson(){
    let WFApproveUserList=JSON.parse(this.formData.SalesOrderData.WFApproveUserJSON);
    WFApproveUserList.forEach(element => {
      if(element.NodeID===7){
        element.IsOpened=this.isRiskStatus;
      }

      if(element.NodeID===8){
        element.IsOpened='0';
      }
    });
    this.formData.SalesOrderData.WFApproveUserJSON=JSON.stringify(WFApproveUserList);
  }

  //获取申请人的基本信息
  getUserInfo(){
    this.orderCreateService.getPersonInformation().then(data=>{
      if(data.Result){
        let departmentProductGroupID=JSON.parse(data.Data).YWFWDM.substring(0,2);//保存部门产品组
        this.formData.SalesOrderData.DepartmentProductGroupID=departmentProductGroupID;
      }
    })
  }

  //获得我方主体
  CompanyChange(e){
    this.formData.SalesOrderData.ContractSubjectCode=e[1];
    this.formData.SalesOrderData.ContractSubject=e[0];
    this.contractSubjectName=e[1]+'-'+e[0];

    let subjectCode = e[1];// 保存我方主体code
    switch(subjectCode) {// 根据不同的值，保存销售组织代码
      case '0051'||'00XE':
         this.formData.SalesOrderData.SalesOrganizationID = subjectCode.substr(-2)+'05';
         break;
      default:
          this.formData.SalesOrderData.SalesOrganizationID = subjectCode.substr(-2)+'02';
    }

    console.log(this.formData.SalesOrderData.SalesOrganizationID);

  }

}
