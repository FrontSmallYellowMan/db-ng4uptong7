import { Component, OnInit, ViewChild, ViewChildren, EventEmitter, Output, Input} from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { ShipToInfoComponent } from './../shipToInfo/shipTo-info.component';
import { MaterialChangeComponent } from './../materialChange/material-change.component';
import { AddMaterialComponent } from './../addMaterial/add-material.component';
import { DetailTipsComponent } from './../../material-detail/errTips/detail-tips.component';
import { MaterialInfo, OrderCreateService,DeletePrepanymentListData,ContractDownLoadFile } from './../../../services/order-create.service';
import { MaterialDetailService,QueryPrePaymentList } from './../../../services/material-detail.service';
import { AdvanceDepositsComponent } from '../select-advance-deposits/select-advance-deposits.component';
import { CommunicateService } from "../../../services/communicate.service";
import * as moment from 'moment';

declare var window,Blob,document,URL;

@Component({
  selector: 'oc-shipTo-party',
  templateUrl: 'shipTo-party.component.html',
  styleUrls: ['./shipTo-party.component.scss']
})
export class ShipToPartyComponent implements OnInit {
  @Output() shipToCallBack = new EventEmitter();
  // @Output() checkReMoyCallBack = new EventEmitter();//是否选择预收款
  @Output() selectAdvanceCallBack = new EventEmitter();//预收款弹框
  @Input() partyInfo;//表单数据
  @Input() currentIndex: number;//当前送达方排序位置
  @Input() num: number;//送达方个数
  @Input() provinceCityInfo;//省市区信息
  @Input() deliveryTypeList;//发货方式
  @Input() contractCode;//合同号
  @Input() customerName;//客户名称
  @Input() salesOrderID;//销售单号
  @Input() channel;//分销渠道
  @Input() customerERPCode;//售达方编码
  @Input() rebateAmount;//返款方式
  @Input() orderTypeId;//订单类型
  @Input() paymentTermsCode;//付款条件代码
  @Input() departmentProductGroupID;//部门产品组
  @Input() isSubmit;//是否提交订单
  @Input() allMaterialsCount;//物料数据
  @Input() rebateAmountID;//返款方式ID
  @Input() YWFWDM;//业务范围
  @Input() contractSubjectCode;//公司代码
  @Input() isDisabledButtonState:boolean;// 是否禁用添加按钮、删除按钮、切换清空物料按钮

  isModifies: boolean = false;//送达方是否修改
  modalShipTo: XcModalRef;//编辑送达方信息模态框
  modalChange: XcModalRef;//物料转移模态框
  modalTips: XcModalRef;//物料上传提示
  modalAdd: XcModalRef;//物料添加模态框
  modalAdvance: XcModalRef;//预收款
  changeIndex;//转移物料index
  fullAddress;//完整地址
  fileUploadApi;//上传文件地址
  upLoadData;//上传文件接口相关参数
  // isCheckReMoy = false;//是否选择预收款
  constRebateAmountID;

  contractDownLoadFile:ContractDownLoadFile=new ContractDownLoadFile();//下载送达方物料请求参数

  deletePrepanymentListData:DeletePrepanymentListData=new DeletePrepanymentListData();//实例化删除预收款请求对象
  queryPrePaymentList:QueryPrePaymentList=new QueryPrePaymentList();//实例化查询预收款列表

  MaterialQuantityDifference:number=0;//保存物料数量的差值

  public prePaymentList;//保存预收款列表
  public isShowAlert:boolean;// 是否显示‘提交委托发货原件给商务’

  @ViewChildren('forminput') inputList;//表单控件DOM元素
  @ViewChild(NgForm) myApplyForm;//表单
  @ViewChild('uploadDom') uploadDom;//上传文件


  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService,
    private materialDetailService: MaterialDetailService,
    private communicateService:CommunicateService
  ) { }
  /*
  *   省市信息传入函数
  */
  toProvinceCityInfo(data?) {
    if (this.partyInfo.Deliverinfo && data) {
      this.provinceCityInfo = data;
      this.concatAddress(this.partyInfo.Deliverinfo);
    }
  }
  /*
  *   返款信息传入函数
  */
  toRebateAmount(data?) {
    //计算物料返款
    this.rebateAmount = parseFloat(data);
    let rebateAmount = this.rebateAmount;
    if (this.partyInfo.MaterialList && this.partyInfo.MaterialList.length > 0) {
      this.partyInfo.MaterialList.forEach(function(item, index) {
        if (rebateAmount != 1.00) {
          item.RebateAmount = (item.Price * rebateAmount).toFixed(2);
        } else {
          item.RebateAmount = (item.RebateAmount || 0).toFixed(2);
        }
        item.TotalPrice = parseFloat(item.Price || 0) - parseFloat(item.RebateAmount || 0);
      })
    }
  }

  ngOnInit() {

    if (this.partyInfo.MaterialList && this.partyInfo.MaterialList.length > 0) {
      this.partyInfo.MaterialList.forEach(function(item, index) {
        if(item.UnitPrice&&item.Price==0){ 
          //item.Price=parseFloat(item.UnitPrice).toFixed(2);
          item.Price=parseFloat(eval(`${item.UnitPrice}*${item.Quantity}`)).toFixed(2);
        }else if(item.UnitPrice&&parseFloat(item.Price)>0){
          item.Price= parseFloat(item.Price).toFixed(2);//数据初始化时，金额取两位
        }else{
          item.Price= parseFloat(item.Price).toFixed(2);//数据初始化时，金额取两位          
        }

        if (!item.ConsignmentModeID) {
          item.ConsignmentModeID = "01";
        }
      });
    } else {
      this.partyInfo.MaterialList = [];
    }
    this.refreshUploadData();
    //在初始化的时候 创建模型;;;;编辑送达方信息
    this.modalShipTo = this.xcModalService.createModal(ShipToInfoComponent);
    this.modalShipTo.onHide().subscribe((data) => {
      if (data) {
        console.log(data);
        this.partyInfo.Deliverinfo = data["DeliveryInfo"];
        this.isShowAlert=data.isShowAlert;//保存是否显示‘委托发货原件给商务’，用来区别显示提示语
        this.concatAddress(data["DeliveryInfo"]);

        //根据送达方的信息，获取修改的发货方式
        this.getConsignment(data["DeliveryInfo"]);

        /**
         * 为了解决重置送达方后，再选择送达方金额为0的问题，需要在弹窗关闭后，重新计算金额
         */
        this.partyInfo.MaterialList.forEach(element => {
          this.amountFormatP(element);
        });
        
      }
    })
    // //在初始化的时候 创建模型;;;;查询预收款
    // this.modalAdvance = this.xcModalService.createModal(AdvanceDepositsComponent);//查询预收款
    // this.modalAdvance.onHide().subscribe((data) => {
    //   //预收款点击取消和关闭直接hide没有data数据则不能删除，有数据代表选择了确定后可以删除
    //   if (data) {
    //     this.checkReMoyCallBack.emit(data);
    //   }
    // })

    //在初始化的时候 创建模型;;;;物料添加
    this.modalAdd = this.xcModalService.createModal(AddMaterialComponent);
    this.modalAdd.onHide().subscribe((data) => {
      if (data) {
        //已存在物料的合同物料ID
        let oldMaterialIdList = [];
        this.partyInfo.MaterialList.forEach(function(item, index) {
          oldMaterialIdList.push(item.ContractMaterialID);
        });
        //新添加的物料去重
        let delrepeat = data.filter(item => oldMaterialIdList.indexOf(item.ContractMaterialID) == -1);
        let rebateAmount = this.rebateAmount;
        //新添加的物料数据处理
        if (delrepeat && delrepeat.length > 0) {
          delrepeat.forEach(function(item, index) {
            if(item.UnitPrice&&item.Price==0){ 
              //item.Price=parseFloat(item.UnitPrice).toFixed(2);
              item.Price=parseFloat(eval(`${item.UnitPrice}*${item.Quantity}`)).toFixed(2);
            }else if(item.UnitPrice&&item.Price){
              item.Price=parseFloat(eval(`${item.UnitPrice}*${item.Quantity}`)).toFixed(2);       
            }else{
              item.Price="0.00";
            }
            item.RebateAmount = "0.00";
            if (!item.ConsignmentModeID) {
              item.ConsignmentModeID = "01";
            }
          });
          // delrepeat.reverse();
          this.addNewMaterialWrite(delrepeat);
          this.partyInfo.MaterialList = delrepeat.concat(this.partyInfo.MaterialList);
          this.materialBatchToUpperCase(this.partyInfo.MaterialList);
          console.log(this.partyInfo.MaterialList);
        };
        let params = {
          type: "add",
          currentIndex: this.currentIndex,
          list: delrepeat
        };
        this.refreshUploadData();
        this.shipToCallBack.emit(params);

        //当添加完物料时，需要传递参数，用以禁用批量删除送达方及物料按钮
        this.communicateService.sendIsClickBatchButton('添加');
      }
    })

    //在初始化的时候 创建模型;;;;物料转移
    this.modalChange = this.xcModalService.createModal(MaterialChangeComponent);
    this.modalChange.onHide().subscribe((data) => {
      if (data) {
        let info = new MaterialInfo();
        let material = this.partyInfo.MaterialList[this.changeIndex];
        //深拷贝，防止修改params["count"]影响this.materialList数据
        for (let key in material) {
          if (key == "Quantity") {
            info[key] = data["changeCount"];
          } else {
            info[key] = material[key];
          }
        }
        let params = {
          type: "change",
          list: [info],
          changeIndex: data.shipToParty,
          currentIndex: this.currentIndex
        };
        if (data.surplusCount == 0) {//当前送达方，物料变化
          this.partyInfo.MaterialList.splice(this.changeIndex, 1);
        } else {
          this.partyInfo.MaterialList[this.changeIndex]["Quantity"] = data.surplusCount;
        };
        let ContractMaterialID = info["ContractMaterialID"];
        this.allMaterialsCount[ContractMaterialID]["quantities"][this.currentIndex] = data.surplusCount;//转移前剩余物料数量计算
        this.refreshUploadData();
        this.shipToCallBack.emit(params);
      }
    })
    //物料上传提示
    this.modalTips = this.xcModalService.createModal(DetailTipsComponent);
    this.modalTips.onHide().subscribe((data) => { })
    this.fileUploadApi = this.orderCreateService.uploadAmountFilesApi();

    //获取预收款列表
    this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);

    //监听是否选择了预收款，如果选择了则重新获取预收款列表
    this.communicateService.getMsg().subscribe(data=>{
      if(data==='1') this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);
    });

  }


  /**
   *更新上传文件数据
   */
  refreshUploadData() {
    this.upLoadData = {
      MaterialList: JSON.stringify(this.partyInfo.MaterialList),
      YWFWDM: this.YWFWDM,
      RebatePercentageID: this.rebateAmountID
    }
  }
  /*
   *新添加物料，allMaterialsCount数量写入
   */
  addNewMaterialWrite(materialList) {
    materialList.forEach(function(item, index) {
      this.allMaterialsCount[item.ContractMaterialID]["quantities"][this.currentIndex] = item.Quantity;
      // this.allMaterialsCount[item.ContractMaterialID]["count"] = item.AvailableQuantity;
    }, this)
  }
  /*
   *获取合同全部物料可用数量
   */
  getMaterialsCount(material) {
    let params = {
      "ContractCode": this.contractCode,
      "SalesOrderID": this.salesOrderID,
      "MaterialInfo": material.ContractMaterialID
    };
    this.orderCreateService.getMaterialData(params).subscribe(
      data => {
        if (data.Result) {
          let info = JSON.parse(data.Data);
          if (info["list"] && info.list.length > 0) {
            let length = this.num;
            info.list.forEach(function(item, index) {
              //this.windowService.alert({message:'输入数量超出可用数量，请重新输入',type:"fail"});
              this.allMaterialsCount[material.ContractMaterialID]["quantities"][this.currentIndex] = material.Quantity;
              //this.allMaterialsCount[material.ContractMaterialID]["count"] = item.AvailableQuantity;
            }, this);
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //物料转移
  materialChange(item, i) {
    this.changeIndex = i;//转移物料所在位置
    this.modalChange.show({ num: this.num, index: this.currentIndex, count: item.Quantity });
  }
  //修改送达方信息
  changeInfo() {
    let params = {
      provinceCityInfo: this.provinceCityInfo,
      deliveryTypeList: this.deliveryTypeList,
      customerName: this.customerName,
      deliverinfo: this.partyInfo.Deliverinfo,
      SalesOrderID: this.salesOrderID,
      DepartmentProductGroupID: this.departmentProductGroupID,
      Channel: this.channel,
      CustomerERPCode: this.customerERPCode,
      OrderTypeId: this.orderTypeId,
      ContractCode:this.contractCode
    }
    this.modalShipTo.show(params);//编辑送达方
  }
  //清空列表
  empty() {
    this.partyInfo.MaterialList.forEach((items, i) => {
      this.allMaterialsCount[items.ContractMaterialID]["quantities"][this.currentIndex] = 0;
    })
    this.partyInfo.MaterialList = [];
    this.shipToCallBack.emit();

    //传递参数，用来显示或隐藏批量上传送达方按钮
    this.communicateService.sendIsClickBatchButton('清空');
  }

  //清空批量上传的送达方下物料
  emptyBatchUpload() {

    if(!this.partyInfo.Deliverinfo["SDFID"]) return;
    
    this.orderCreateService.clearBatchUploadMaterialInfo(this.salesOrderID,this.partyInfo.Deliverinfo["SDFID"]).then(data=> {
      if(data.Result) {//如果为真则清空此送达方下物料

        this.partyInfo.MaterialList = [];
        this.shipToCallBack.emit();

        //传递参数，用来判断是否禁用添加按钮、删除按钮以及切换清空物料按钮
        this.communicateService.sendIsClickBatchButton('清空批量');
      }
    });

    
  }

  //选择预收
  selectAdvance() {
    //计算选择的物料总金额
    let count = 0;
    this.partyInfo.MaterialList.forEach((items, i) => {
      count += items.TotalPrice;
    })
    this.partyInfo.Deliverinfo.MaterialAmountMoney = count.toFixed(2);//计算选择的物料总金额
    if (this.partyInfo.Deliverinfo['SDFID']) {
      let params = {
        SalesAmountTotal: this.partyInfo.Deliverinfo.MaterialAmountMoney,
        CustomerERPCode: this.customerERPCode,
        CompanyCode: this.contractSubjectCode,
        SalesOrderID: this.salesOrderID,
        SDFID: this.partyInfo.Deliverinfo["SDFID"],
        currentIndex: this.currentIndex
      };
      // this.modalAdvance.show(params);
      //防止创建多个弹框实例，往上一级传
      this.selectAdvanceCallBack.emit(params);
    } else {
      this.windowService.alert({ message: "请先编辑地址再选择预收款", type: "fail" });
    }

  }
  //送达方地址拼接
  concatAddress(data?) {
    let fullAddress = "";
    let provinceCityInfo = this.provinceCityInfo;
    let provinceCode = data["AreaID"];
    //特殊地区拼写
    if (provinceCode === "330") {
      this.fullAddress = "香港特别行政区" + data["SDFAddress"];
      return;
    } else if (provinceCode === "340") {
      this.fullAddress = "澳门特别行政区" + data["SDFAddress"];
      return;
    } else if (provinceCode === "310") {
      this.fullAddress = "台湾" + data["SDFAddress"];
      return;
    };
    let provinceList = provinceCityInfo["province"].filter(item => item.ProvinceCode.indexOf(provinceCode) == 0);
    let province = "";
    if (provinceCode && provinceList.length > 0) {
      province = provinceList[0]["ProvinceName"];
    }
    let cityCode = data["SDFCity"]
    let cityList = provinceCityInfo["city"].filter(item => item.CityCode.indexOf(cityCode) == 0);
    let city = "";
    if (cityCode && cityList.length > 0) {
      city = cityList[0]["CityName"];
      //直辖市拼写
      if (province == city) {
        fullAddress = province + "市";
      } else {
        fullAddress = province + "省" + city + "市";
      }
    }
    //区县行政不确定
    if (data["SDFDistrict"]) {
      fullAddress = fullAddress + data["SDFDistrict"] + "(区/县)";
    }
    if (data["SDFAddress"]) {
      fullAddress = fullAddress + data["SDFAddress"];
    }
    this.fullAddress = fullAddress;
  }
  //删除送达方及物料信息
  delSelf() {
    let params = {
      type: "del",
      currentIndex: this.currentIndex,
      list: this.partyInfo.MaterialList
    };
    //有SDFID时，需要删除数据库内相关信息
    if (this.partyInfo.Deliverinfo["SDFID"]) {
      this.windowService.confirm({ message: "是否要删除送达方及物料信息!" }).subscribe({
        next: (v) => {
          if (v) {
            let paramsInfo = {
              SaleOrderID: this.salesOrderID,
              SDFID: this.partyInfo.Deliverinfo["SDFID"]
            };
            this.orderCreateService.delDeliveryInfo(paramsInfo).subscribe(
              data => {
                if (data.Result) {
                  let info = JSON.parse(data.Data);
                  this.windowService.alert({ message: "送达方及物料信息删除成功！", type: "success" });
                  // if (this.partyInfo.isCheckReMoy) {//如果已经选择预收款也要删除预收款
                  //   const that = this;
                  //   setTimeout(function() {
                  //     // that.delPrepanyment();
                  //   }, 3000)
                  // }
                  this.shipToCallBack.emit(params);
                } else {
                  this.windowService.alert({ message: data.Message, type: "fail" });
                }
              }
            );
          }
        }
      })
    } else {
      this.shipToCallBack.emit(params);
    }
  }

  //2019-2-21 新增逻辑 删除批量上传的送达方及物料
  deleteBatchUploadSDF() {
   
    let params = {
      type: "del",
      currentIndex: this.currentIndex,
      list: this.partyInfo.MaterialList
    };

    //有SDFID时，需要删除数据库内相关信息
    if (this.partyInfo.Deliverinfo["SDFID"]) {
      this.windowService.confirm({ message: "是否要删除送达方及物料信息!" }).subscribe({
        next: (v) => {
          if (v) {

            this.orderCreateService.deleteBatchUploadSDF(this.salesOrderID,this.partyInfo.Deliverinfo["SDFID"]).then(
              data => {
                if (data.Result) {
                  this.windowService.alert({ message: "送达方及物料信息删除成功！", type: "success" });
                  this.shipToCallBack.emit(params);
                } else {
                  this.windowService.alert({ message: data.Message, type: "fail" });
                }
              }
            );
          }
        }
      })
    } else {
      this.shipToCallBack.emit(params);
    }

    
  }


  //

  // //删除预收款
  // delPrepanyment() {
  //   let params = {
  //     SCOrderID: this.salesOrderID,
  //     SDFID: this.partyInfo.Deliverinfo["SDFID"]
  //   }
  //   this.orderCreateService.deletePrepanyment(params).subscribe(
  //     data => {
  //       if (data.Result) {
  //         this.windowService.alert({ message: "预收款删除成功！", type: "success" });
  //       } else {
  //         this.windowService.alert({ message: data.Message, type: "fail" });
  //       }
  //     }
  //
  //   );
  // }
  //添加物料信息
  addMaterial() {
    let params = {
      allMaterialsCount: this.allMaterialsCount,
      contractCode: this.contractCode,
      salesOrderID: this.salesOrderID
    }
    //物料添加，工厂必须相同。因此传入工厂值
    if (this.partyInfo.MaterialList.length > 0) {
      params["Factory"] = this.partyInfo.MaterialList[0]["Factory"];
    } else {
      params["Factory"] = "";
    }
    this.modalAdd.show(params);
  }
  //删除物料信息
  delMaterial(list, i) {
    let id = list[i].ContractMaterialID;
    // this.allMaterialsCount[id]["quantities"][this.currentIndex] -= list[i].Quantity;
    console.log(this.allMaterialsCount[id]["quantities"]);
    this.allMaterialsCount[id]["quantities"][this.currentIndex] = 0;
    // this.allMaterialsCount[id]["count"] = list[i].AvailableQuantity;

    list.splice(i, 1);
    this.refreshUploadData();
    this.shipToCallBack.emit();

    this.communicateService.sendIsClickBatchButton('删除');
    
  }

  //删除批量上传送达方的物料信息
  delMaterialBatch(list, i) {

    list.splice(i, 1);
    this.refreshUploadData();
    this.shipToCallBack.emit();

    this.communicateService.sendIsClickBatchButton('删除');
    
  }


  //物料部分编辑
  clickEdit(item) {
    item.partEdit = true;
  }
  //金额格式化,单价金额变化
  amountFormatP(item) {
    let price = parseFloat(item.Price || 0);
    if (price > 0) {
      item.Price = price.toFixed(2);
    } else {
      item.Price = (0).toFixed(2);
    }
    //返款计算
    if (this.rebateAmount != "1.00") {
      item.RebateAmount = (parseFloat(item.Price || 0) * parseFloat(this.rebateAmount || 0)).toFixed(2);
    }
    //总额计算
    item.TotalPrice = parseFloat(item.Price || 0) - parseFloat(item.RebateAmount || 0);
    this.shipToCallBack.emit();
  }
  amountFormatAll() {
    this.partyInfo.MaterialList.forEach((item) => {
      let price = parseFloat(item.Price || 0);
      if (price > 0) {
        item.Price = price.toFixed(2);
      } else {
        item.Price = (0).toFixed(2);
      }
      //返款计算
      if (this.rebateAmount&&this.rebateAmount != "1.00") {
        item.RebateAmount = (parseFloat(item.Price || 0) * parseFloat(this.rebateAmount || 0)).toFixed(2);
      }
      //总额计算
      item.TotalPrice = parseFloat(item.Price || 0) - parseFloat(item.RebateAmount || 0);

      this.shipToCallBack.emit();
    })
    if (this.constRebateAmountID != this.rebateAmountID) {
      this.constRebateAmountID = this.rebateAmountID;
    }
  }
  //自定义返款
  amountFormatR(item) {
    let amount = parseFloat(item.RebateAmount || 0);
    if (amount > 0) {
      item.RebateAmount = amount.toFixed(2);
    } else {
      item.RebateAmount = (0).toFixed(2);
    }
    //总额计算
    item.TotalPrice = parseFloat(item.Price || 0) - parseFloat(item.RebateAmount || 0);
    //物料总金额，在返款自定义时，可能会出现负数。自动置零
    if (item.TotalPrice < 0) {
      this.windowService.alert({ message: "请正确填写返款金额！", type: "fail" });
      item.TotalPrice = 0;
      item.RebateAmount = "0.00";
    }
    this.refreshUploadData();
    this.shipToCallBack.emit();
  }
  //数量修改
  changeQuantity(item) {
    let str = (item["Quantity"] || 0).toString();
    if (str.length > 0) {
      item["Quantity"] = Math.abs(parseInt(str.replace(/^0*/g, ""))) || 0;
      console.log(item["Quantity"]);
    } else {
      item["Quantity"] = 0;
    };
    let params = {
      type: "add",
      currentIndex: this.currentIndex,
      list: [item]
    };
    //if(item.Quantity>item.AvailableQuantity) this.windowService.alert({message:'输入数量超出可用数量，请重新输入',type:"fail"});

    console.log(item);
    this.getMaterialsCount(item);
    this.refreshUploadData();
   this.shipToCallBack.emit(params);
  }
  //文件上传回调函数
  onFileCallBack(e?) {
    if (e.Result) {
      this.windowService.alert({ message: '上传物料信息成功', type: "success" });
    } else if(JSON.parse(e.Data)&&JSON.parse(e.Data).errorList&&JSON.parse(e.Data).errorList.length>0){

      let list = JSON.parse(e.Data).errorList;
      this.modalTips.show(JSON.stringify(list));
    }else{
      this.windowService.alert({message:e.Message,type:"fail"});
    }
    let uploadMaterialList = JSON.parse(e.Data).NewMaterial;
    if (uploadMaterialList && uploadMaterialList.length > 0) {
      var flag = false;//有没有相同的标识，有相同物料则覆盖没有则添加（检查erp与批次）
      for (let key in uploadMaterialList) {
        // for (let one in this.partyInfo.MaterialList) {
        //   if (uploadMaterialList[key].MaterialCode == this.partyInfo.MaterialList[one].MaterialCode && uploadMaterialList[key].Batch == this.partyInfo.MaterialList[one].Batch) {
        //     this.partyInfo.MaterialList[one] = uploadMaterialList[key];
        //     flag = false;
        //     break;
        //   } else {
        //     flag = true;
        //   }
        //   flag = true;
        // }
        // if (flag == true) {
          // this.partyInfo.MaterialList.push(uploadMaterialList[key]);
          // this.materialBatchToUpperCase( this.partyInfo.MaterialList);
        // }
      }

      this.partyInfo.MaterialList=uploadMaterialList;
      this.materialBatchToUpperCase( this.partyInfo.MaterialList);

      this.shipToCallBack.emit();
      this.communicateService.sendMaterialAmount(true);// 发送状态，用来重新计算物料
    }
  }
  //下载合同物料文档
  loadFile() {
   
    if(this.partyInfo.MaterialList&&this.partyInfo.MaterialList.length>0){

      this.contractDownLoadFile.MaterialList=this.partyInfo.MaterialList;//将物料信息存入请求参数

      this.orderCreateService.getMaterialList(this.contractDownLoadFile).subscribe(data=>{
        if(data){
          let blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      
        if('msSaveOrOpenBlob' in window.navigator){
          window.navigator.msSaveBlob(blob, `物料信息导入模板.xlsx`);
        }else{
          let objectUrl = URL.createObjectURL(blob);//创建链接
          this.aClick(objectUrl);
          URL.revokeObjectURL(objectUrl);//释放链接
          this.contractDownLoadFile=new ContractDownLoadFile();//清空请求的物料列表参数
        }
        }
      });
    }
    console.log(this.partyInfo.MaterialList);

    //window.location.href = this.orderCreateService.downloadAmountFilesApi();
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`物料信息导入模板`);
    a.click();
    document.body.removeChild(a);
  }

  //当选择完预收款信息的时候，请求接口显示预收款列表
  getPrePaymentList(SDFID?,salesOrderID?){
    if(SDFID&&salesOrderID){
       this.queryPrePaymentList.SalesOrderID=salesOrderID;
       this.queryPrePaymentList.SDFID=SDFID;
       this.materialDetailService.getPrePaymentList(this.queryPrePaymentList).then(data=>{
        
        if(data.Result){
          this.prePaymentList=JSON.parse(data.Data);
          this.communicateService.sendSDFAdvance({'type':'add','SDFID':SDFID,'prePaymentList':data.Data});//向组件外发送参数，用来写入选择的预收款,传递参数为(type：类型，SDFID：送达方ID，prePaymentList：添加的预收款列表)
          console.log(this.prePaymentList);
        }

       });
    }
  }

  //删除预收款列表
  deleatePrePaymentList(I){
    console.log(this.prePaymentList,I);
    this.deletePrepanymentListData.AMOUNT=this.prePaymentList[I].AMOUNT;
    this.deletePrepanymentListData.BUZEI=this.prePaymentList[I].BUZEI;
    this.deletePrepanymentListData.SalesOrderID=this.salesOrderID;
    this.deletePrepanymentListData.SDFID=this.prePaymentList[I].SDFID;
    this.deletePrepanymentListData.SHEET_NO=this.prePaymentList[I].SHEET_NO;

    this.orderCreateService.delAdvancesData(this.deletePrepanymentListData).subscribe(data=>{
      if(data.Result){
        this.windowService.alert({message:"删除预收款成功",type:"success"}).subscribe(()=>{
          this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);
          this.communicateService.sendSDFAdvance({'type':'del','SDFID':this.prePaymentList[I].SDFID,'index':I});// 发送参数执行删除实体表单上的预售款,传递参数（type：操作类型，SDFID：送达方ID，index：送达方下所删除的预售款列表的下标）
        });
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    });
  }

  //显示上传物料时的错误提示
  showAlert(){
    //console.log("222");
    //console.log(this.partyInfo.MaterialList);
    if(this.partyInfo.MaterialList&&this.partyInfo.MaterialList.length===0){
      //console.log("111");
      this.windowService.alert({message:"请先选择物料，上传的物料必须和已选择的物料一致",type:"fail"});
    }
  }

  //转换物料列表中的批次字段为大写
  materialBatchToUpperCase(materialList){
    if(materialList&&materialList.length>0){
      materialList.forEach(element => {
        element.Batch=element.Batch.toUpperCase();
      });
    }
  }

  //失去焦点时，批次字段转换为大写
  writeMaterialBatchToUpperCase(item){
    item=item.toUpperCase();
  }

  //监听物料明细中的数量，如果修改就改变相应的金额
  chengPrice(I){
    if(this.partyInfo.MaterialList[I].UnitPrice&&(this.partyInfo.MaterialList[I].Price==0||this.partyInfo.MaterialList[I].Price==0.00)){
      this.partyInfo.MaterialList[I].Price=parseFloat(eval(`${this.partyInfo.MaterialList[I].Quantity}*${this.partyInfo.MaterialList[I].UnitPrice}`)).toFixed(2);
    }

    // this.communicateService.sendMaterialAmount(true);// 传递状态，重新计算物料总数
  }

  //根据选择的送达方信息，获取发货方式
  getConsignment(DeliveryInfo){
    if(DeliveryInfo&&this.partyInfo.MaterialList.length>0){
      this.partyInfo.MaterialList.forEach(element => {
        element.ConsignmentModeID=DeliveryInfo.ConsignmentModeID;
      });
    }
  }

}
