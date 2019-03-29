import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
  MaterialInfo, SaleOrderForm, AccoriesInfo, DropInfoList, ProvinceCityInfo, DeliveryMaterialInfo, OrderCreateService,CustomConfigReq
} from './../../../services/order-create.service';
import { OrderListService } from './../../../services/order-list.service';
import { OrderViewService } from './../../../services/order-view.service';
import { CommunicateService } from "../../../services/communicate.service";

declare var window;

@Component({
  templateUrl: 'order-macao.component.html',
  styleUrls: ['./../order-create.component.scss']
})
export class OrderCreateMacaoComponent implements OnInit {
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
  firstNodeName;//第一个审批人节点名称

  dropInfoList: DropInfoList = new DropInfoList();//下拉数据
  provinceCityInfo: ProvinceCityInfo = new ProvinceCityInfo();//省市区信息
  cityList;//市
  districtList;//区县
  contractSubjectName;//合同主体
  uploadFilesApi=environment.server+"SaleOrder/UploadSOAccessories";//上传附件api
  projectIndustryName;//部门行业名称
  invoiceCountAmount: number = 0;//支票总金额
  rebateAmountVal;//返款信息
  wfData = {
    wfHistory: null,//审批历史记录
    wfProgress: null//流程全景图
  };//审批记录信息

  isACustomer: boolean = false;//是否为一次性用户
  firstInit: boolean = true;//是否为初始化数据
  modifyTaxNumber: boolean = false;//是否维护税号
  paymentSearch: boolean = false;//是否显示付款条件查询
  invoiceFirstTip: boolean = true;//是否是提一次提示支票验证
  isSubmit: boolean = false;//是否提交
  isOverAmount: boolean = false;//是否超额超期
  firstSave: boolean = true;//是否为第一次保存，判断取消键是否为删除功能
  isOneCheckReMoy: boolean = false;//任意一个物料是否选择预收款

  accessoryList:any[]=[];//保存每次上传成功后的返回数据
  filelUpLoadList: any[] = [];//用来保存新上传的附件列表
  alreadyfilelUpLoadList: any[] = [];//用来保存已经上传过的附件
  saleGroupList:any=[];//保存销售小组列表

  customConfigReq:CustomConfigReq=new CustomConfigReq();//实例化获取项目信息的请求参数
  customerFormData:any;//保存项目信息

  materialSum:number;//物料总数量

  @ViewChildren(NgModel) inputList;//表单控件
  @ViewChildren('forminput') inputListDom;//表单控件DOM元素
  @ViewChild(NgForm) myApplyForm;//表单
  @ViewChildren("salePerson") salePerson;//销售人员
  @ViewChildren("agentPerson") agentPerson;//收款人员
  @ViewChildren("busPerson") busPerson;//事业部审批人员
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

  //获取url参数
  getUrlParams() {
    this.SC_Code = this.routerInfo.snapshot.queryParams['sc_code'];
    this.SO_Code = this.routerInfo.snapshot.queryParams['so_code'];
  }
  //获取销售订单信息
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
              this.getFormDataCallBack(info);
            } else {
              this.windowService.alert({ message: "该订单已进入审批流程或已完成，无法编辑！", type: "success" });
              setTimeout(() => { window.close(); }, 1500);
            }
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        });
    } else {
      let params = {
        SC_Code: this.SC_Code,
        Type: this.formData.Type
      };
      this.orderCreateService.getCreateSalesOrder(params).subscribe(
        data => {
          if (data.Result && data.Data) {
            let info = JSON.parse(data.Data);
            if (info["SalesOrderData"]) {
              window.history.pushState({}, "", location.href + "&so_code=" + info["SalesOrderData"]["SalesOrderID"]);//新建页面，再次刷新。避免一直新加订单
            }
            this.getFormDataCallBack(info);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        });
    }

  }

  /**
    * 说明：2018-11-15，新增逻辑，获取项目信息
    */
   getProjectInfo(SC_Code){
    this.customConfigReq.BusinessID=SC_Code;//保存销售合同号
    this.orderCreateService.getGetBussinessFieldConfig(this.customConfigReq).then(data=>{
     if(data.Result&&data.Data){
       this.customerFormData=JSON.parse(data.Data);
       this.getBussinessFieldConfigCallBack(this.customerFormData);//重构自定义表单项的内容
     } 
    });
  }

   //如果包含checkbox，则重构返回数据，增加显示项
   getBussinessFieldConfigCallBack(customerformdata){
    let data = customerformdata["FieldMsg"];
    if(data.length > 0){
      data.forEach((item, i) => {
        if (item.FieldShowType == "checkbox") {
          let str = "";
          let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.ischecked === true });
          tempArray.forEach(dataSourceItem => { str += dataSourceItem.text + "," });
          if (str.indexOf(",") != -1)
           data[i].FieldValue = str.substring(0,str.length-1);
        }
        if (item.FieldShowType == "select" || item.FieldShowType == "radio") {
          let tempArray = item.Data.filter(dataSourceItem => { return dataSourceItem.value === item.FieldValue });
           data[i].FieldValue = tempArray[0].text;
        }
      });
     }
  }

  //获取下拉列表基本信息
  getSelectedListData(info?) {
    let params = {
      OType: this.formData.Type,
      YWFWDM: info["SalesOrderData"]["YWFWDM"]
    };
    this.orderCreateService.getSOBaseData(params).subscribe(
      data => {
        if (data.Result) {
          let dropInfoList = JSON.parse(data.Data);
          this.dropInfoList.ListOrderType = dropInfoList["ListOrderType"].filter(item => item.OrderTypeId !== "0011");//订单类型
          this.dropInfoList = dropInfoList;
          //部门产品组为空时默认选中第一项
          if(!this.formData.SalesOrderData.DepartmentProductGroupID){
            this.formData.SalesOrderData.DepartmentProductGroupID = this.dropInfoList.ListDepPro[0].DepartmentProductGroupID;
          }
          this.rebateAmountFun();//物料信息传入返款

          if(!this.formData.SalesOrderData.DepartmentProductGroupID){
            this.getUserInfo();//获取申请人的基本信息，用来赋值部门产品组的默认值
          }

          console.info(dropInfoList)
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  getProvinceCityData() {
    //获取省市区信息
    this.orderCreateService.getProvinceCityInfo().subscribe(
      data => {
        if (data && data.Data) {
          let info = JSON.parse(data.Data);
          this.provinceCityInfo = info;
          if (this.formData.SalesOrderData.InvoiceAreaID && info) {//省市区数据回显
            this.changeProvince();
          }
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
      })
      return;
    };
    this.formData.Type = 1;//订单框架类型
    this.getUrlParams();//获取URL参数信息
    this.getOrderBaseData();//获取订单基础信息
    this.getSalesGroup();//获取销售小组

    this.modalAdvance = this.xcModalService.createModal(AdvanceDepositsComponent);
    this.modalAdvance.onHide().subscribe((data) => { })//查询预收款
    this.modalCash = this.xcModalService.createModal(CashDetailComponent);//查询应收款明细
    this.modalCash.onHide().subscribe((data) => { })
    this.modalSold = this.xcModalService.createModal(SoldToInfoComponent);//查询售达方列表
    this.modalInterme = this.xcModalService.createModal(InterCustomerComponent);//查询居间服务方
    this.modalInterme.onHide().subscribe((data) => {
      if (data) {
        this.formData.SalesOrderData.IntermediateCustomerName = data["NAME"];
        this.formData.SalesOrderData.IntermediateCustomerERPCode = data["KUNNR"];
      }
    })
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
              if (parseFloat(info["Overdue"]) > 0) {
                this.isOverAmount = true;
              } else {
                this.isOverAmount = false;
              }
            }
          }
        );
      }
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
    })
    // this.uploadFilesApi = this.orderCreateService.uploadFilesApi();

    //获取物料明细的状态，用来重新计算物料总数量
    this.communicateService.getSendMaterialAmount().subscribe(v=> {
      if(v) {
        this.restMaterialSum();//重新计算物料总和
      }
    });

  }

  //重新计算物料总和
  restMaterialSum() {
    
    let materialAmountArray:any=[];// 声明一个空数组，用来保存取的物料数量
   
      this.formData.DeliveryData.forEach(element=> {//遍历送达方
        if(element.MaterialList&&element.MaterialList.length>0) {// 如果存在物料明细

          element.MaterialList.forEach(materialItem=> {// 遍历物料明细列表，将物料数量push进数组
            materialAmountArray.push(materialItem.Quantity);
           });

        }
         
      });

      //声明一个函数，用来处理reduce()方法的求和函数
      let getSum = function (total,num) {
        return total+num;
      };

      this.materialSum=materialAmountArray.reduce(getSum,0);// 求和，保存物料总数量
    
  }

  //数据回调函数
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

    let user = this.userInfo;
    let saleOrderInfo = data["SalesOrderData"];
    if (saleOrderInfo) {
      for (let key in saleOrderInfo) {
        if (saleOrderInfo[key] == null) {
          saleOrderInfo[key] = "";
        }
      }
      this.formData["SalesOrderData"] = saleOrderInfo;
      //销售人员
      let saleInfo = {
        userID: saleOrderInfo["SalesITCode"],
        userEN: (saleOrderInfo["SalesITCode"] || "").toLocaleLowerCase(),
        userCN: saleOrderInfo["SalesName"]
      };
      this.salePerson._results[0].Obj = saleInfo;
      //收款人员
      if (!saleOrderInfo["AgentITCode"]) {
        saleOrderInfo.AgentITCode = user["ITCode"];
        saleOrderInfo.AgentName = user["UserName"];
      };
      let agentPerson = {
        userID: saleOrderInfo["AgentITCode"],
        userEN: (saleOrderInfo["AgentITCode"]).toLocaleLowerCase(),
        userCN: saleOrderInfo["AgentName"]
      };
      this.agentPerson._results[0].list.push(agentPerson);
      this.isOverAmount = parseFloat(saleOrderInfo.Overdue) > 0 ? true : false;//超期超额欠款
      this.jugdeIsACustomer(saleOrderInfo.CustomerERPCode);//判断是否为一次性用户
      this.paymentSearch = !saleOrderInfo.PaymentTermsCode || saleOrderInfo.IsContractPayment === 0 ? true : false;//是否显示付款条件查询
      this.formData.SalesOrderData.EndUserName = !saleOrderInfo.EndUserName ? saleOrderInfo.CustomerName : saleOrderInfo.EndUserName;//最终用户名称默认为客户名称
      this.formData.SalesOrderData.BusiApprovePlatform = !saleOrderInfo.BusiApprovePlatform ? "80" : saleOrderInfo.BusiApprovePlatform;//商务审批平台
      this.formData.SalesOrderData.IsMailingInvoice = !saleOrderInfo.IsMailingInvoice ? "0" : saleOrderInfo.IsMailingInvoice;//是否选择发票
      this.formData.SalesOrderData.InvoiceTypeID = !saleOrderInfo.InvoiceTypeID ? "0005" : saleOrderInfo.InvoiceTypeID;//发票类型。默认为海外商业发票
      this.formData.SalesOrderData.TermsofShipment = !saleOrderInfo.TermsofShipment ? "80" : saleOrderInfo.TermsofShipment;//装运条件
      if (saleOrderInfo.ContractSubjectCode) {//判断是否为特殊合同
        this.contractSubjectName = saleOrderInfo.ContractSubjectCode + "-" + saleOrderInfo.ContractSubject;
      } else {
        this.contractSubjectName = saleOrderInfo.ContractSubjectCode
      }
      if (!saleOrderInfo.ChannelOfDistributionID) {//分销渠道。默认为11/分销
        this.formData.SalesOrderData["ChannelOfDistributionID"] = "11";
      } else if (saleOrderInfo.CustomerERPCode.slice(0, 1) == "2") {
        this.formData.SalesOrderData["ChannelOfDistributionID"] = "15";
      }
      //是否有无返款
      if (!saleOrderInfo.RebatePercentageID) {
        this.formData.SalesOrderData.RebatePercentageID = "0001";
        this.rebateAmountVal = "0.00";
      } else {
        this.rebateAmountFun();
      }
      // 审批人员
      if (saleOrderInfo["WFApproveUserJSON"]) {
        let busInfo = {};
        let approveUser = JSON.parse(saleOrderInfo["WFApproveUserJSON"]);
        let unSelectApprover = [];
        let firstNodeName = "";
        approveUser.forEach(function(item, index) {
          if (parseInt(item.NodeID) < 3) {
            let userSeting = [];
            if (item.UserSettings) {
              userSeting = typeof item.UserSettings == "string" ? JSON.parse(item.UserSettings) : item.UserSettings;
              firstNodeName = item.NodeName;
              if (userSeting.length > 0) {
                busInfo = {
                  userID: item.ID,
                  userEN: (userSeting[0]["ITCode"] || "").toLocaleLowerCase(),
                  userCN: userSeting[0]["UserName"]
                }
              }
            }
          } else {
            let obj = {};
            let list = [];
            let approverList = JSON.parse(item.ApproverList);
            approverList.forEach(function(m, i) {
              let person = JSON.parse("{}");
              person = {
                id: "1",
                name: m["UserName"],
                itcode: (m["ITCode"] || "").toLocaleLowerCase()
              }
              list.push(new Person(person));
            })
            obj = {
              nodeName: item.NodeName,
              nodeID: item.NodeID,
              personList: list
            }
            unSelectApprover.push(obj)
          }
        })
        this.unSelectApprover = unSelectApprover;
        this.firstNodeName = firstNodeName;
        if (JSON.stringify(busInfo) != "{}") {
          this.busPerson._results[0].list.push(busInfo);
        }
      }
      //审批记录显示
      if (this.formData.SalesOrderData.Status === "3") {
        this.getWfData();
      }
    }

    //获取项目信息
    this.getProjectInfo(this.formData.SalesOrderData.SC_Code);
    console.log(this.formData);
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
      this.myApplyForm.controls["orderType"].disable({ onlySelf: false });
      this.isACustomer = true;
    } else {
      this.myApplyForm.controls["orderType"].enable({ onlySelf: false });
      this.isACustomer = false;
    };
  }
  //查看合同
  contractView() {
    window.open(dbomsPath + "india/contractview?sc_code=" + this.formData.SalesOrderData["SC_Code"] || this.SC_Code);
  }
  //选择省份
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
  }
  //选择城市
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
  //查询预收款弹层
  selectAdvance() {
    let params = {
      SalesAmountTotal: this.formData.SalesOrderData.SalesAmountTotal,
      CustomerERPCode: this.formData.SalesOrderData.CustomerERPCode,
      CompanyCode: this.formData.SalesOrderData.ContractSubjectCode,
      SalesOrderID: this.formData.SalesOrderData.SalesOrderID
    }
    this.modalAdvance.show(params);
  }
  //返款信息修改
  rebateAmountFun() {
    let id = this.formData.SalesOrderData.RebatePercentageID ? this.formData.SalesOrderData.RebatePercentageID : "0001";
    let selected = this.dropInfoList.ListRebate.filter(item => item.RebatePercentageID == id);
    if (selected && selected.length > 0) {
      this.rebateAmountVal = selected[0]["RebatePercentageValue"];
    }
  }
  //查询居间服务方
  searchInterCustomer() {
    this.modalInterme.show(this.formData.SalesOrderData.CustomerName);
  }
  //查询现金账单明细
  cashDetail() {
    this.modalCash.show(this.formData.SalesOrderData.CustomerERPCode);
  }
  //查询售达方信息
  saleToParty() {
    let params = { CustomerName: this.formData.SalesOrderData.CustomerName }
    this.modalSold.show(params);
  }
  //查询付款条件
  searchPayment() {
    this.modalPayment.show();
  }
  //查询部门行业
  selectedIndustry() {
    this.modalIndustry.show(this.dropInfoList.ListIndustry);
  }
  /*
  *送达方与物料信息
  */
  deliveryCallBack(e) { }
  //发票组件，数据回调函数
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
  //提交
  submit(e?) {
    this.isSubmit = true;
    if (this.myApplyForm.valid) {//表单验证通过
      //销售员验证
      if (this.formData.SalesOrderData["AgentITCode"] == "") {
        this.windowService.alert({ message: "请选择收款人!", type: "fail" });
        return;
      }
      let checkDeliveries = this.delivery.checkDeliveries();//返回message
      if (checkDeliveries) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          this.windowService.alert({ message: checkDeliveries, type: "fail" });
        }
        return;
      }

      //验证是否增加了送达方
      if(this.formData.DeliveryData.length==0){
        this.windowService.alert({message:"请添加送达方与物料信息",type:"fail"});
        return;
      }

      //验证送达方
      if(this.submitTestShipAddress()) return;

      //销售单金额不可为零
      if (parseFloat(this.formData.SalesOrderData.SalesAmountTotal) === 0) {
        this.windowService.alert({ message: "销售订单金额不能为零！", type: "fail" });
        return;
      }
      //未开销售单金额
      if (this.formData.UnSalesAmount < this.formData.SalesOrderData.SalesAmountTotal) {
        this.windowService.alert({ message: "当前订单销售金额已经大于未开销售单金额！", type: "fail" });
        return;
      }
      
      //物料返款金额
      if (this.formData.SalesOrderData.RebatePercentageID === "0004") {
        if (parseFloat(this.formData.SalesOrderData.RebateAmountTotal) / (parseFloat(this.formData.SalesOrderData.SalesAmountTotal) + parseFloat(this.formData.SalesOrderData.RebateAmountTotal)) > 0.3) {
          this.windowService.alert({ message: "物料返款金额不得高于最大返款率30%，请重新填写!", type: "fail" });
          return;
        }
      }
      //支票使用金额大于销售金额
      if (this.invoiceCountAmount > parseFloat(this.formData.SalesOrderData.SalesAmountTotal)) {
        this.windowService.alert({ message: "当前支票使用总金额大于订单销售金额！", type: "fail" });
        return;
      }
      //审批人
      if (this.formData.SalesOrderData["WFApproveUserJSON"]) {
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
        approverList.forEach(function(item, index) {
          if (item.NodeID == '3') {
            if (this.isOverAmount) {
              item["IsOpened"] = 1;
            } else {
              item["IsOpened"] = 0;
            }
          }
        }, this)
        this.formData.SalesOrderData["WFApproveUserJSON"] = JSON.stringify(approverList)
      } else {
        this.windowService.alert({ message: "请选择审批人", type: "fail" });
        return;
      }
      //是否必须关联支票
      if (this.invoiceFirstTip && (this.formData.SalesOrderData.PaymentMode == "002" || this.formData.SalesOrderData.PaymentMode == "003") && this.formData.ReceiptData.length == 0) {
        // this.windowService.alert({ message: "您还没有关联支票信息，是否补充支票信息？", type: "fail" });
        // this.invoiceFirstTip = false;
        // return;
        this.windowService.confirm({ message: "您还没有关联票据，是否补充票据信息?" }).subscribe({
          next: (v) => {
            if (!v) {//首先验证物料金额
              this.loading = true;
              this.checkMaterialAmount();//首先验证物料金额
            } else {
              return;
            }
          }
        });
      } else {
        this.loading = true;
        this.checkMaterialAmount();//首先验证物料金额
      }

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
      this.windowService.alert({ message: "维护税号需要时间，请稍候！", type: "fail" });
      this.orderCreateService.modifyCustomerTaxCode(params).subscribe(//写入税号
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
          if (info === false) {//false物料金额不合规定
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
          this.windowService.alert({ message: data.Message, type: "fail" });
          this.loading = false;
        }
      }
    );
  }
  //提交接口
  submitApi() {

    //判断是否整单发货
    if(parseFloat(this.formData.SalesOrderData.SalesAmountTotal).toFixed(2)===parseFloat(this.formData.UnSalesAmount).toFixed(2)){
      this.formData.SalesOrderData.isCompleteOrder=1;
    }else{
      this.formData.SalesOrderData.isCompleteOrder=0;
    }

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
  //暂存
  save() {
    if (this.formData.UnSalesAmount < this.formData.SalesOrderData.SalesAmountTotal) {//未开销售单金额
      this.windowService.alert({ message: "该订单金额大于未开销售单金额！", type: "fail" });
      return;
    }
    // if (this.invoiceCountAmount > parseFloat(this.formData.SalesOrderData.SalesAmountTotal)) {//支票使用金额大于销售金额
    //   this.windowService.alert({ message: "当前支票使用总金额大于订单销售金额！", type: "fail" });
    //   return;
    // }
    
    //验证送达方地址是否填写
    // if(this.testShipAddress()) return;
    
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
    let valueinValid:boolean=false;//是否不合法
    if (this.formData.DeliveryData.length > 0) {//送达方地址验证
      let singleSDF = this.formData.DeliveryData.length != 1 ? false : true;
      let isCheck = this.formData.DeliveryData.length != 1 ? false : true;
      let message = "";
      let OrderTypeId = this.formData.SalesOrderData.OrderTypeId;

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

      // this.formData.DeliveryData.some(function(item, index) {
      //   if (!item.Deliverinfo["SDFID"]) {//送达方验证
      //     message = singleSDF ? "送达方地址未编辑！" : "第" + (index + 1) + "个送达方地址未编辑！";
      //     return true;
      //   }
      //   if (OrderTypeId == '0002') {
      //     if (!item.isCheckReMoy) {//送达方验证
      //       message = isCheck ? "预收款未选择！" : "第" + (index + 1) + "个预收款未选择！";
      //       return true;
      //     }
      //   }
      // });
      if (message) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          valueinValid=true;
          this.windowService.alert({ message: message, type: "fail" });
        }
        return;
      } else{
        valueinValid=false;
      }
    }
    return valueinValid;
  }

  //在提交时验证送达方全部信息是否填写
  submitTestShipAddress(){
    let valueinValid:boolean=false;//是否不合法
    if (this.formData.DeliveryData.length > 0) {//送达方地址验证
      let singleSDF = this.formData.DeliveryData.length != 1 ? false : true;
      let isCheck = this.formData.DeliveryData.length != 1 ? false : true;
      let message = "";
      let OrderTypeId = this.formData.SalesOrderData.OrderTypeId;

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

      if (message) {
        let ele = this.checkPointList._results[0];//存储该表单控件元素
        if (ele && ele.nativeElement) {
          ele.nativeElement.focus();//使该表单控件获取焦点
          valueinValid=true;
          this.windowService.alert({ message: message, type: "fail" });
        }
        return;
      } else{
        valueinValid=false;
      }
    }
    return valueinValid;
  }

  //取消
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
  //上传附件回调函数
  onFileCallBack(e?) { 

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

  //预审信息
  getChange(info?) {
    let approveUserList = JSON.parse(this.formData.SalesOrderData["WFApproveUserJSON"]);
    let itcode = "";
    let name = "";
    let id = "";
    if (info.length > 0) {
      id = info[0]["userID"];
      itcode = info[0]["userEN"];
      name = info[0]["userCN"];
    }
    approveUserList.forEach(function(item, index) {
      if (parseInt(item.NodeID) == 2) {
        let userSeting = [];
        if (typeof approveUserList[index]["UserSettings"] == "string") {
          userSeting = JSON.parse(approveUserList[index]["UserSettings"]);
        } else {
          userSeting = approveUserList[index]["UserSettings"];
        }
        userSeting[0] = {
          UserID: id,
          ITCode: itcode,
          UserName: name
        };
        item["UserSettings"] = userSeting;
        item["IsOpened"] = id ? 1 : 0;
      }
    });
    this.formData.SalesOrderData["WFApproveUserJSON"] = JSON.stringify(approveUserList);
  }
  //销售人员选择修改
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

  //获取申请人的基本信息
  getUserInfo(){
    this.orderCreateService.getPersonInformation().then(data=>{
      if(data.Result){
        let departmentProductGroupID=JSON.parse(data.Data).YWFWDM.substring(0,2);//保存部门产品组
        this.formData.SalesOrderData.DepartmentProductGroupID=departmentProductGroupID;
      }
    })
  }

}
