// NA单页面-采购清单
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  AfterViewInit,
  DoCheck,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/merge";

declare var $: any;
import { WindowService } from "app/core";
import { dbomsPath } from "environments/environment";
import { HttpServer } from "app/shared/services/db.http.server";
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "app/shared/index";
import { PurchaseOrderDetails } from "./../../../services/NA-submit.service";
import { ApplyListModalComponent } from "./../../applyListModal/applylist-modal.component";
import { ShareMethodService } from "./../../../services/share-method.service";

import { PrepareApplyCommunicateService } from "../../../services/communicate.service";

@Component({
  selector: "NA-submit-list",
  templateUrl: "NA-submit-list.component.html",
  styleUrls: [
    "NA-submit-list.component.scss",
    "./../../../scss/procurement.scss",
    "./../../../scss/submit-list.scss"
  ]
})
export class NASubmitListComponent implements OnInit, OnChanges {
  prepareApplyNoContract_requisitionnum; //预下无合同情况-存预下无合同申请的申请单号
  applyListModal: XcModalRef; //采购清单展示模态框
  numAmount: number = 0; //物料数量合计
  public _purchaseData = {
    procurementList: [],
    untaxAmount: 0, //未税总金额
    taxAmount: 0, //含税总金额
    foreignAmount: 0 //外币总金额
  };
  tempAmountPrice = 0; //临时存储的 总金额（会是未税总金额 或者 外币总金额）
  firstCreateContractList = true; //编辑时，首次拼接下拉列表
  beforeProcurementList; //上一个采购清单列表

  matchContractPrompt = false; //excel匹配合同的是否提示标识
  contractList = []; //合同列表
  contractListLength = 0; //合同列表的长度
  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数
  clospanNum = 13; //不同情况下 列数的不同
  tempList = []; //暂存刚开始获取的已选采购申请列表
  fileUploadApi_HasApply = "api/PurchaseManage/UploadPurchaseOrderDetails/1/2"; //有采购申请-批量上传路径
  fileUploadApi_DirectNA = "api/PurchaseManage/UploadPurchaseOrderDetails/1/3"; //直接创建NA-批量上传路径
  fileUploadApi_preNoContract =
    "api/PurchaseManage/UploadPurchaseOrderDetails/1/1"; //预下无合同-批量上传路径
  upLoadData; //上传文件接口相关参数
  _NAType; //创建NA单类型 （目前三种类型：hasApply，directNA，prepareApplyNoContract）

  isNeedCalculateStatus: boolean = true; //是否需要触发计算

  SaleContractCodeAndName:any=[];//保存物料明细列表中的销售合同号和销售合同名称
    changeSaleContractCodeAndName:any=[];//保存变更后的销售合同号和销售合同名称

  @ViewChild(NgForm) purchaseListForm; //表单
  beforePurchaseFormValid; //表单的前一步校验结果

  @Input() rate; //税率
  @Input() purchaseOrderID: ""; //采购订单id
  @Input() factory; //工厂
  @Input() vendor; //供应商
  @Input() IsRMB: boolean = true; //是否 人民币
  @Input() currency; //币种
  @Input()
  set NAType(value) {
    this._NAType = value;
    if (value == "directNA") {
      this.clospanNum = 12;
    } else {
      this.clospanNum = 13;
    }
  }
  @Input() isSubmit = false; //是否提交
  @Input()
  set purchaseData(value) {
    this._purchaseData = value;
  }
  @Output() onPurchaseDataChange = new EventEmitter<any>();
  @Output() purchaseFormValidChange = new EventEmitter<any>(); //采购清单是否校验通过
  constructor(
    private http: Http,
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private shareMethodService: ShareMethodService,
    private dbHttp: HttpServer,
    private naCommunicateService:PrepareApplyCommunicateService
  ) {}

  ngOnInit() {
    this.applyListModal = this.xcModalService.createModal(
      ApplyListModalComponent
    ); //预览采购清单
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["rate"]) {
      if (changes["rate"].currentValue != changes["rate"].previousValue) {
        //税率变化
        if (
          typeof changes["rate"].currentValue == "undefined" ||
          changes["rate"].currentValue == null
        ) {
          //变化为无值
          this._purchaseData.taxAmount = 0;
          this.onPurchaseDataChange.emit(this._purchaseData);
        } else {
          this.calculateTotalTax("rateChange"); //重新计算
        }
      }
    }
    if (changes["NAType"] && changes["NAType"].currentValue) {
      //新建 NAType传入值
      if (
        !this.purchaseOrderID &&
        (changes["NAType"].currentValue == "hasApply" ||
          changes["NAType"].currentValue == "prepareApplyNoContract")
      ) {
        this.getApplyAlreadyExistList();
      }
    }
    if (changes["currency"]) {
      if (
        changes["currency"].currentValue != changes["currency"].previousValue
      ) {
        //币种 变化
        this.calculateTotalTax("currencyChange"); //重新计算
      }
    }
  }
  ngDoCheck() {
    if (this.purchaseListForm.valid != this.beforePurchaseFormValid) {
      //表单校验变化返回
      this.beforePurchaseFormValid = this.purchaseListForm.valid;
      this.purchaseFormValidChange.emit(this.purchaseListForm.valid);
    }
    if (
      this._purchaseData.procurementList &&
      this._purchaseData.procurementList.length >= 10
    ) {
      //出现滚动条的宽度调整
      $(".w40").addClass("w46");
      $(".addApp-ch-before tbody").addClass("auto");
    } else {
      $(".w40").removeClass("w46");
      $(".addApp-ch-before tbody").removeClass("auto");
    }
    if (
      JSON.stringify(this._purchaseData.procurementList) !=
        JSON.stringify(this.beforeProcurementList) &&
      this._purchaseData.procurementList &&
      this._purchaseData.procurementList.length
    ) {
      //编辑状态下，当传入采购清单变化
      this.beforeProcurementList = JSON.parse(
        JSON.stringify(this._purchaseData.procurementList)
      );
      if (
        this._NAType == "hasApply" &&
        this.purchaseOrderID &&
        this.firstCreateContractList
      ) {
        let list = this._purchaseData.procurementList;
        for (let i = 0, len = list.length; i < len; i++) {
          //从已有清单中 拼接选项
          this._purchaseData.procurementList[i]["isImport"] = false; //编辑时已有的清单可修改
          if (
            !this.alreadyPushContract(
              list[i]["DBOMS_PurchaseRequisitionSaleContract_ID"]
            )
          ) {
            //没有push过
            this.contractList.push({
              salecontractcode: list[i]["MaterialSource"],
              requisitionnum: list[i]["PurchaseRequisitionNum"],
              MainContractCode: list[i]["MainContractCode"],
              id: list[i]["DBOMS_PurchaseRequisitionSaleContract_ID"],
              text:
                list[i]["PurchaseRequisitionNum"] +
                "-" +
                list[i]["MainContractCode"]
            });
          }
        }
        if (this.contractList && this.contractList.length) {
          this.contractListLength = this.contractList.length;
          this.upLoadData = {
            ContractCount: this.contractList.length
          };
        }
        this.firstCreateContractList = false;
      }
      if (
        this._NAType == "prepareApplyNoContract" &&
        this.purchaseOrderID &&
        !this.prepareApplyNoContract_requisitionnum
      ) {
        //存 预下无合同 采购申请单号
        this.prepareApplyNoContract_requisitionnum = this._purchaseData.procurementList[0][
          "PurchaseRequisitionNum"
        ];
      }
      /**
       * 因为原程序采用了ngDoCheck监听物料清单的状态，所以导致只要在表单的输入值发生变化，
       * 就会重新计算金额，这样会导致不必要的计算，因此多加入一个状态值，通过条件来判断，
       * 哪些表单的变化需要触发计算，哪些不需要计算
       */
      if (this.isNeedCalculateStatus) {
        this.calculateTotalTax("numberChange");
      }
    }
  }
  getApplyAlreadyExistList() {
    //新建时请求已有采购申请的清单
    let list = JSON.parse(window.localStorage.getItem("NAApplyList"));
    this.tempList = list;
    if (list && list.length) {
      if (this._NAType == "prepareApplyNoContract") {
        //存 预下无合同 采购申请单号
        this.prepareApplyNoContract_requisitionnum = list[0]["requisitionnum"];
      }
      let requestArr = []; //已经请求过的采购申请
      for (let i = 0, len = list.length; i < len; i++) {
        let id = list[i]["purchaserequisitionid"];
        if (requestArr.indexOf(id) == -1) {
          //未请求过
          requestArr.push(id);
          this.dbHttp
            .get("PurchaseManage/GetPurchaseRequisitionById/" + id)
            .subscribe(data => {
              //获取已选采购申请的采购清单
              if (data.Result) {
                let da = JSON.parse(data.Data);
                let details = da["PurchaseRequisitionDetailsList"];
                console.log("----采购申请原有清单");
                console.log(details);
                for (let j = 0, lens = details.length; j < lens; j++) {
                  if (this._NAType == "hasApply") {
                    let ele = this.matchSelectId(
                      details[j]["purchaserequisitionid"],
                      details[j]["MaterialSource"]
                    );
                    if (ele) {
                      /*
                                            直接创建采购订单，选择合同过来的，并不是该采购申请单号下的清单都带过来，
                                            物料来源是NAApplyList中勾选的合同，才会显示
                                            */
                      let newItem = new PurchaseOrderDetails();
                      this.getApplyAlreadyExistItem(newItem, details[j]);

                      newItem["DBOMS_PurchaseRequisitionSaleContract_ID"] =
                        ele["id"];
                      newItem["MaterialSource"] = ele["salecontractcode"];
                      newItem["PurchaseRequisitionNum"] = ele["requisitionnum"];
                      newItem["MainContractCode"] = ele["MainContractCode"];

                      newItem["isImport"] = true; //导入的清单不让修改
                      this._purchaseData.procurementList.push(newItem);
                      this.calculateTotalTax("numberChange"); //可优化
                      this.onPurchaseDataChange.emit(this._purchaseData);
                    }
                  }
                  if (this._NAType == "prepareApplyNoContract") {
                    let newItem = new PurchaseOrderDetails();
                    this.getApplyAlreadyExistItem(newItem, details[j]);

                    newItem["MaterialSource"] = details[j]["MaterialSource"];
                    newItem[
                      "PurchaseRequisitionNum"
                    ] = this.prepareApplyNoContract_requisitionnum;

                    newItem["isImport"] = true; //导入的清单不让修改
                    this._purchaseData.procurementList.push(newItem);
                    this.calculateTotalTax("numberChange"); //可优化
                    this.onPurchaseDataChange.emit(this._purchaseData);
                  }
                }
              }
            });
        }
      }
    }
    this.contractList = list;
    if (this.contractList && this.contractList.length) {
      this.contractListLength = this.contractList.length;
      this.upLoadData = {
        ContractCount: this.contractList.length
      };
    }

    //因为方法所需数据需异步获取，所以采用定时器，在获取到全部数据时，调用该方法
    setTimeout(()=>{
      this.getSaleContractState(this._purchaseData.procurementList);
  },500);

  }
  calculateTotal(index) {
    //改变数量和单价时
    let item = this._purchaseData.procurementList[index];
    if (item.Count && item.Price) {
      let num = item.Count * item.Price;
      item.Amount = Number(num.toFixed(2)); //未税总价
    } else {
      item.Amount = 0;
    }
    this.calculateTotalTax("numberChange");
  }
  taxrateTotalFun = function() {
    //税率相关值 计算
    if (typeof this.rate == "undefined" || this.rate == null) {
      this.windowService.alert({ message: "税率未选择", type: "warn" });
    } else {
      this._purchaseData.taxAmount = Number(
        (this._purchaseData.untaxAmount * (1 + Number(this.rate))).toFixed(2)
      ); //含税总金额
    }
  };
  currencyDiffeFun = function() {
    //币种变化时 重新辨别计算总额
    if (!this.tempAmountPrice) {
      //无总额 不计算
      this.onPurchaseDataChange.emit(this._purchaseData);
      return;
    }
    if (this.IsRMB) {
      //人民币 情况
      this._purchaseData.untaxAmount = this.tempAmountPrice; //未税总金额
      this.taxrateTotalFun();
      this.onPurchaseDataChange.emit(this._purchaseData);
    } else {
      //外币 情况
      this._purchaseData.foreignAmount = this.tempAmountPrice; //外币总金额
      this.shareMethodService
        .getRateConvertPrice(this._purchaseData.foreignAmount, this.currency)
        .then(data => {
          //根据最新汇率 计算总额
          this._purchaseData.untaxAmount = data;
          this._purchaseData.taxAmount = data;
          this.onPurchaseDataChange.emit(this._purchaseData);
        });
    }
  };
  calculateTotalTax(changeType) {
    //计算总价
    // 因为此方法中包括异步请求(getRateConvertPrice),所以把返回数据(emit)写在此方法的所有情况中,调用此方法后可省略emit返回
    switch (
      changeType //不同变化情况下 计算
    ) {
      case "rateChange":
        if (this.IsRMB) {
          this.taxrateTotalFun();
        }
        this.onPurchaseDataChange.emit(this._purchaseData);
        break;
      case "currencyChange":
        this.currencyDiffeFun();
        break;
      case "numberChange":
        this.numAmount = 0;
        this._purchaseData.untaxAmount = 0;
        this._purchaseData.taxAmount = 0;
        this._purchaseData.foreignAmount = 0;
        this.tempAmountPrice = 0;
        this._purchaseData.procurementList.forEach(item => {
          if (item.Count) {
            this.numAmount = Number(this.numAmount + Number(item.Count)); //物料数量合计
          }
          if (item.Count && item.Price) {
            this.tempAmountPrice = Number(
              (this.tempAmountPrice + item.Count * item.Price).toFixed(2)
            );
          }
        });
        this.currencyDiffeFun();
        break;
    }
  }
  delProcurementItem(index) {
    //删除一项采购清单
    let reCount = true;
    if (
      !this._purchaseData.procurementList[index]["Count"] &&
      !this._purchaseData.procurementList[index]["Price"]
    ) {
      //如果删除的行没有数量和单价 不需要重新计算
      reCount = false;
    }
    if (this._purchaseData.procurementList[index].checked) {
      this.checkedNum--; //选项减一
      if (!this.checkedNum) {
        //减最后一项
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
      }
    }
    this._purchaseData.procurementList.splice(index, 1);
    if (reCount) {
      this.calculateTotalTax("numberChange");
    } else {
      this.onPurchaseDataChange.emit(this._purchaseData);
    }

    /**
     * 重新保存一遍列表，用来刷新物料明细的formContrals列表项
     */
    this._purchaseData.procurementList=JSON.parse(JSON.stringify(this._purchaseData.procurementList));
        
  }
  addProcurementItem() {
    //增加一项采购清单
    this._purchaseData.procurementList.push(new PurchaseOrderDetails());
    let len = this._purchaseData.procurementList.length;
    if (this.contractListLength == 1 && this._NAType == "hasApply") {
      //若合同列表只有一项,直接选入
      this._purchaseData.procurementList[len - 1][
        "DBOMS_PurchaseRequisitionSaleContract_ID"
      ] = this.contractList[0]["id"];
      this._purchaseData.procurementList[len - 1][
        "MaterialSource"
      ] = this.contractList[0]["salecontractcode"];
      this._purchaseData.procurementList[len - 1][
        "PurchaseRequisitionNum"
      ] = this.contractList[0]["requisitionnum"];
      this._purchaseData.procurementList[len - 1][
        "MainContractCode"
      ] = this.contractList[0]["MainContractCode"];
    }
    if (this._NAType == "prepareApplyNoContract") {
      //预下单采购_无合同
      this._purchaseData.procurementList[len - 1]["MaterialSource"] = "PL";
      this._purchaseData.procurementList[len - 1][
        "PurchaseRequisitionNum"
      ] = this.prepareApplyNoContract_requisitionnum;
    }
    if (this.fullChecked) {
      //如果全选，变成半选
      this.fullChecked = false;
      this.fullCheckedIndeterminate = true;
    }
    this.onPurchaseDataChange.emit(this._purchaseData);
  }
  deleteList() {
    //批量删除采购清单列表
    if (!this.checkedNum) {
      this.windowService.alert({ message: "还未选择项", type: "warn" });
      return;
    }
    if (this.fullChecked) {
      //全选删除
      this._purchaseData.procurementList = [];
      this.tempAmountPrice = 0;
      this.numAmount = 0;
      this._purchaseData.untaxAmount = 0;
      this._purchaseData.taxAmount = 0;
      this._purchaseData.foreignAmount = 0;
      this.fullChecked = false;
      this.fullCheckedIndeterminate = false;
      this.onPurchaseDataChange.emit(this._purchaseData);
      return;
    }
    this.fullCheckedIndeterminate = false;
    let i;
    let item;
    let len = this._purchaseData.procurementList.length;
    for (i = 0; i < len; i++) {
      item = this._purchaseData.procurementList[i];
      if (item.checked === true) {
        this._purchaseData.procurementList.splice(i, 1);
        this._purchaseData.procurementList=JSON.parse(JSON.stringify( this._purchaseData.procurementList));// 重新物料列表，用来重置form表单的绑定项

        len--;
        i--;
      }
    }
    this.calculateTotalTax("numberChange");
  }
  showOrder() {
    //预览采购清单
    console.log(this._purchaseData);
    let modalData = {
      procurementList: this._purchaseData.procurementList,
      untaxAmount: this._purchaseData.untaxAmount,
      factory: this.factory,
      vendor: this.vendor
    };
    this.applyListModal.show(modalData);
  }
  downloadTpl() {
    //下载采购清单模板
    switch (this._NAType) {
      case "hasApply":
        window.open(
          dbomsPath + "assets/downloadtpl/NA新建-采购清单-有合同.xlsx"
        );
        break;
      case "directNA":
        window.open(
          dbomsPath + "assets/downloadtpl/NA新建-采购清单-直接创建.xlsx"
        );
        break;
      case "prepareApplyNoContract":
        window.open(
          dbomsPath + "assets/downloadtpl/NA新建-采购清单-预下无合同.xlsx"
        );
        break;
    }
  }
  materialTraceno(index, no) {
    //需求跟踪号的校验
    if (!no) {
      //为空不校验
      return;
    }
    let validName = "traceno" + index;
    if (this.purchaseListForm.controls[validName].invalid) {
      //格式校验未通过
      this.windowService.alert({
        message: "只允许输入数字和26位英文字符",
        type: "success"
      });
      return;
    }
    this._purchaseData.procurementList[index][
      "TrackingNumber"
    ] = this._purchaseData.procurementList[index][
      "TrackingNumber"
    ].toUpperCase(); //转大写
    this.shareMethodService
      .checkOrderTracenoExist(
        this._purchaseData.procurementList[index]["TrackingNumber"],
        this.purchaseOrderID
      )
      .then(data => {
        if (!data) {
          this.windowService.alert({
            message: "该需求跟踪号已经存在，请重新输入",
            type: "fail"
          });
          this._purchaseData.procurementList[index]["TrackingNumber"] = "";
        } else {
          this.onPurchaseDataChange.emit(this._purchaseData);
        }
      });
  }
  uploadPurchase(e) {
    //批量上传
    if (e.Result) {
      this.matchContractPrompt = false;
      let result = e.Data;
      debugger;
      console.log(result);
      if (result && result.length && this.fullChecked) {
        //如果全选，变成半选
        this.fullChecked = false;
        this.fullCheckedIndeterminate = true;
      }
      result.forEach(item => {

        item.Batch=item.Batch.toUpperCase();//将批次转换为大写

        //分别匹配
        item["isImport"] = false;
        // if(this._NAType=="directNA"){
        //     item["MaterialSource"]=this.directNAMatchContract(item["MaterialSource"]);
        // }
        if (this._NAType == "hasApply") {
          let con = this.matchContract(item); //匹配
          if (con) {
            item["DBOMS_PurchaseRequisitionSaleContract_ID"] = con["id"];
            item["MaterialSource"] = con["salecontractcode"];
            item["PurchaseRequisitionNum"] = con["requisitionnum"];
            item["MainContractCode"] = con["MainContractCode"];
          } else {
            item["DBOMS_PurchaseRequisitionSaleContract_ID"] = "";
          }
        }
        if (this._NAType == "prepareApplyNoContract") {
          item[
            "PurchaseRequisitionNum"
          ] = this.prepareApplyNoContract_requisitionnum;
        }
        item.Price = Number(item.Price).toFixed(2);
        item.Amount = Number(item.Amount).toFixed(2);
        delete item.AddTime;
        delete item.ID;
        delete item.PurchaseOrder_ID;
        delete item.SortNum;
        item.Batch=item.Batch.toUpperCase();
      });
      let newArr = this._purchaseData.procurementList.concat(result);
      this._purchaseData.procurementList = newArr; //把excel中列表显示页面
      this.calculateTotalTax("numberChange");
    } else {
      this.windowService.alert({ message: e.Message, type: "warn" });
    }
  }
  materialSourceChange(i) {
    if (
      this._NAType == "hasApply" &&
      this._purchaseData.procurementList[i]
        .DBOMS_PurchaseRequisitionSaleContract_ID
    ) {
      //已选择
      for (let k = 0, len = this.contractList.length; k < len; k++) {
        let selItm = this.contractList[k];
        if (
          this._purchaseData.procurementList[i]
            .DBOMS_PurchaseRequisitionSaleContract_ID == selItm["id"]
        ) {
          this._purchaseData.procurementList[i].MaterialSource =
            selItm["salecontractcode"];
          this._purchaseData.procurementList[i].PurchaseRequisitionNum =
            selItm["requisitionnum"];
          this._purchaseData.procurementList[i].MainContractCode =
            selItm["MainContractCode"];
        }
      }
    }
    if (
      this._NAType == "prepareApplyNoContract" &&
      this._purchaseData.procurementList[i].MaterialSource
    ) {
      //已选择
      this._purchaseData.procurementList[
        i
      ].PurchaseRequisitionNum = this.prepareApplyNoContract_requisitionnum;
    }
    this.onPurchaseDataChange.emit(this._purchaseData);
  }
  hoverText(i) {
    //select hover显示字段
    return $("#materialSource" + i + " option:selected").text();
  }
  getMaterialData(index, id) {
    //根据物料号读取信息
    if (id) {
      this._purchaseData.procurementList[index].MaterialNumber = id.trim(); //首尾去空格
      this.matchMaterial(
        this._purchaseData.procurementList[index].MaterialNumber
      ).then(response => {
        if (response.Data["MAKTX_ZH"]) {
          //获取描述
          this._purchaseData.procurementList[index].MaterialDescription =
            response.Data["MAKTX_ZH"];
        } else {
          this._purchaseData.procurementList[index].MaterialDescription = "";
          this.windowService.alert({ message: "该物料不存在", type: "warn" });
        }
        this.onPurchaseDataChange.emit(this._purchaseData);
      });
    } else {
      //清空物料 也需返回
      this._purchaseData.procurementList[index].MaterialDescription = "";
      this.onPurchaseDataChange.emit(this._purchaseData);
    }
  }
  alreadyPushContract(id) {
    //编辑时，拼接contractList，检查是否push过
    if (!id) {
      return true; //空值不push
    }
    if (this.contractList && this.contractList.length) {
      for (let i = 0, len = this.contractList.length; i < len; i++) {
        if (this.contractList[i]["id"] == id) {
          return true;
        }
      }
    }
    return false;
  }
  matchSelectId(id, source) {
    //匹配导入清单中-物料来源的选择
    for (let k = 0, len = this.tempList.length; k < len; k++) {
      let ele = this.tempList[k];
      if (
        id == ele["purchaserequisitionid"] &&
        source == ele["salecontractcode"]
      ) {
        return ele;
      }
    }
  }
  getApplyAlreadyExistItem(newItem, detailItem) {
    //复制采购申请中 已有清单数据 到显示页面 操作Item
    newItem["MaterialNumber"] = detailItem["MaterialNumber"];
    newItem["MaterialDescription"] = detailItem["MaterialDescription"];
    newItem["Count"] = detailItem["Count"];
    newItem["Price"] = Number(detailItem["Price"]).toFixed(2);
    newItem["Amount"] = Number(detailItem["Amount"]).toFixed(2);
    newItem["StorageLocation"] = detailItem["StorageLocation"];
    newItem["Batch"] = detailItem["Batch"];
    newItem["TrackingNumber"] = detailItem["traceno"];
  }
  matchContract(ele) {
    //申请单号和合同号，返回item
    let len = this.contractList.length;
    let i;
    let item;
    for (i = 0; i < len; i++) {
      item = this.contractList[i];
      if (
        ele["PurchaseRequisitionNum"] == item.requisitionnum &&
        ele["MainContractCode"] == item.MainContractCode
      ) {
        return item;
      }
    }
    if (!this.matchContractPrompt && this.contractListLength != 1) {
      this.windowService.alert({
        message: "导入列表中销售合同有未在所选合同中",
        type: "warn"
      });
      this.matchContractPrompt = true;
    }
    if (this.contractListLength == 1) {
      //若合同列表只有一项,直接选入
      return this.contractList[0];
    } else {
      return "";
    }
  }
  directNAMatchContract(sou) {
    //当直接创建NA时，根据物料来源匹配
    if (sou != "BH" && sou != "PL") {
      this.windowService.alert({
        message: "导入列表物料来源不是BH或PL",
        type: "warn"
      });
      this.matchContractPrompt = true;
      return "";
    }
    return sou;
  }
  CheckIndeterminate(v) {
    //检查是否全选
    this.fullCheckedIndeterminate = v;
  }
  matchMaterial(id) {
    //匹配物料
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get("api/PurchaseManage/GetMaterialInfo/" + id, options)
      .toPromise()
      .then(response => response.json());
  }

  //过滤出销售合同号，获取销售合同的变更或者解除状态
  getSaleContractState(procurementList){
    if(procurementList){
        procurementList.forEach((element,index) => {//遍历物料明细列表
          //保存销售合同code和name
          this.SaleContractCodeAndName.push(JSON.stringify({name:element.MainContractCode,code:element.MaterialSource}));
        });
        this.SaleContractCodeAndName=Array.from(new Set(this.SaleContractCodeAndName));//去掉重复项
        this.SaleContractCodeAndName.forEach((element,index) => {//遍历去重后的销售合同号数组，将数组项，转为对象
          this.SaleContractCodeAndName[index]=JSON.parse(element);
        });

        //如果存在销售合同
        if(this.SaleContractCodeAndName.length>0){
            this.getSaleContractStateApi();
        }
    }
  }

  //请求接口，获取销售合同的状态（解除或者变更）
  getSaleContractStateApi(){
      let saleContractCode=[];
      this.SaleContractCodeAndName.forEach(element => {
          saleContractCode.push(element.code);//将销售合同code
      });

    this.shareMethodService.getSaleContractStateApi(saleContractCode).then(data=>{
        if(data.Result){
            if(data.Data.length>0){

                this.changeSaleContractCodeAndName=data.Data;//保存请求返回的数组
                this.changeSaleContractCodeAndName=this.changeSaleContractCodeAndName.filter(item=>item.SCType!==null);

                this.SaleContractCodeAndName.forEach(element => {
                  this.changeSaleContractCodeAndName.forEach((content,index) => {
                      //将销售合同号相同的销售合同名称存入返回的数据
                     if(element.code===content.SC_CODE) this.changeSaleContractCodeAndName[index]['MainContractCode']=element.name;
                  });
                });
                
                this.naCommunicateService.nbChangeSaleContractSend(this.changeSaleContractCodeAndName);
            }
        }
    })
  }


}
