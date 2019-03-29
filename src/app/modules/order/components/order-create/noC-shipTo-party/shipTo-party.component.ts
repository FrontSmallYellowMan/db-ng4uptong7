import { Component, OnInit, ViewChild, ViewChildren, EventEmitter, Output, Input } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { Person } from 'app/shared/services/index';
import { ShipToInfoComponent } from './../shipToInfo/shipTo-info.component';
import { MaterialChangeComponent } from './../materialChange/material-change.component';
import { DetailTipsComponent } from './../../material-detail/errTips/detail-tips.component';
import { MaterialInfo, OrderCreateService,DeletePrepanymentListData,NoContractDownLoadFile } from './../../../services/order-create.service';
import { MaterialDetailService,QueryPrePaymentList } from './../../../services/material-detail.service';

import { CommunicateService } from "../../../services/communicate.service";

import * as moment from "moment";

declare var Blob,document,URL,window;

@Component({
  selector: 'noC-shipTo-party',
  templateUrl: 'shipTo-party.component.html',
  styleUrls: ['./shipTo-party.component.scss']
})
export class NoCShipToPartyComponent implements OnInit {
  @Output() shipToCallBack = new EventEmitter();
  @Output() selectAdvanceCallBack = new EventEmitter();//预收款弹框
  @Input() partyInfo;//送达方与物料数据
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
  @Input() departmentProductGroupID;//部门产品组
  @Input() isSubmit;//是否提交订单
  @Input() isValidMaterial;//是否校验物料信息
  @Input() contractSubjectCode;//公司代码
  @Input() paymentTermsCode;//付款条件代码
  @Input() YWFWDM;//业务范围
  @Input() rebateAmountID;//返款方式ID
  
  public isModifies: boolean = false;//送达方是否修改
  public modalShipTo: XcModalRef;//编辑送达方信息模态框
  public modalChange: XcModalRef;//物料转移模态框
  public modalTips: XcModalRef;//物料上传提示
  public queryPrePaymentList:QueryPrePaymentList=new QueryPrePaymentList();//实例化查询预收款列表
  public deletePrepanymentListData:DeletePrepanymentListData=new DeletePrepanymentListData();//实例化删除预收款列表接口对象
  public changeIndex;//转移物料index
  public fullAddress;//完整地址
  public fileUploadApi;//上传文件地址
  public prePaymentList;//保存预收款列表

  upLoadData;//上传文件接口相关参数
  noContractDownLoadFile:NoContractDownLoadFile=new NoContractDownLoadFile();

  constRebateAmount;//记录上一次返款方式
  @ViewChildren('forminput') inputList;//表单控件DOM元素
  @ViewChild(NgForm) myApplyForm;//表单
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
        //必填项有未填全的，默认为编辑状态
        if (!item.MaterialCode || !item.MaterialName || !item.Factory || !item.Batch) {
          item.isEdit = true;
        }
        item.Price = parseFloat(item.Price || 0).toFixed(2);//数据初始化时，金额取两位
        if (!item.ConsignmentModeID) {
          item.ConsignmentModeID = "01";
        }
      });
    } else {
      this.partyInfo.MaterialList = [];
    }
    this.fileUploadApi = this.materialDetailService.uploadFilesApi();

    this.refreshUploadData();

    this.modalShipTo = this.xcModalService.createModal(ShipToInfoComponent);//编辑送达方信息
    this.modalShipTo.onHide().subscribe((data) => {
      if (data) {
        this.partyInfo.Deliverinfo = data["DeliveryInfo"];
        this.concatAddress(data["DeliveryInfo"]);
        //根据送达方的信息，获取发货方式
        this.getConsignment(data["DeliveryInfo"]);
      }
    });
    this.modalChange = this.xcModalService.createModal(MaterialChangeComponent);//物料转移
    this.modalChange.onHide().subscribe((data) => {
      if (data) {
        let info = new MaterialInfo();
        let material = this.partyInfo.MaterialList[this.changeIndex];
        //深拷贝，防止修改params["count"]影响this.materialList数据
        for (let key in material) {
          info[key] = material[key];
        }
        let params = {
          type: "change",
          currentIndex: data.shipToParty,
          list: info
        };
        //当前送达方，物料变化
        if (data.surplusCount == 0) {
          this.partyInfo.MaterialList.splice(this.changeIndex, 1);
        } else {
          this.partyInfo.MaterialList[this.changeIndex]["Quantity"] = data.surplusCount;
        }
        params["info"]["Quantity"] = data["changeCount"];
        this.refreshUploadData();
        this.shipToCallBack.emit(params);
      }
    });
    //物料上传提示
    this.modalTips = this.xcModalService.createModal(DetailTipsComponent);
    this.modalTips.onHide().subscribe((data) => { })
    this.constRebateAmount = this.rebateAmount;

    //获取预收款列表
      this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);

      //监听是否选择了预收款，如果选择了则重新获取预收款列表
      this.communicateService.getMsg().subscribe(data=>{
        if(data==='1') this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);
      });


      this.shipToCallBack.emit();
  }
  //文件上传回调函数
  onFileCallBack(e?) {
    if (e.Result&&e.Data) {
      // let pushData = e.Data;
      // let uploadMaterialList = [];
      // //上传物料接口为物料明细处接口。字段不尽相同
      // pushData.forEach((item, index) => {
      //   let newMaterial = new MaterialInfo();
      //   newMaterial["MaterialCode"] = item["MaterialNumber"];
      //   newMaterial["MaterialName"] = item["MaterialDescription"];
      //   newMaterial["Quantity"] = item["AvailableCount"];
      //   newMaterial["Batch"] = item["Batch"];
      //   newMaterial["Factory"] = item["FactoryCode"];
      //   newMaterial["SalesUnit"] = item["SalesUnit"];
      //   newMaterial["Remark"] = item["Remark"];
      //   newMaterial["StorageLocation"] = item["StorageLocation"];
      //   // newMaterial["TotalPrice"] = item["SalesAmount"];
      //   newMaterial["Price"] = item["SalesAmount"];
      //   newMaterial["ConsignmentModeID"] = "01";
      //   uploadMaterialList.push(newMaterial);
      // });
      // uploadMaterialList.reverse();
      // this.partyInfo.MaterialList = uploadMaterialList.concat(this.partyInfo.MaterialList);

      this.partyInfo.MaterialList=JSON.parse(e.Data).NewMaterial;
      this.materialBatchToUpperCase(this.partyInfo.MaterialList);
      this.shipToCallBack.emit();
      this.windowService.alert({ message: '上传物料信息成功', type: "success" });
    } else if(e.Data&&JSON.parse(e.Data).errorList.length>0){

      let errorList=JSON.stringify(JSON.parse(e.Data).errorList);
      this.modalTips.show(errorList);
      
    }else if(!e.Result&&e.Data&&JSON.parse(e.Data).errorList.length===0){
      this.windowService.alert({message:e.Message,type:"fail"});
    }

    this.communicateService.sendMaterialAmount(true);// 发送状态，用来重新计算物料

  }
  //下载合同物料文档
  loadFile() {

    if(this.partyInfo.MaterialList&&this.partyInfo.MaterialList.length>0){

      this.noContractDownLoadFile.MaterialList=this.partyInfo.MaterialList;//将物料信息存入请求参数

      this.getMaterialListApi();

      // this.orderCreateService.getMaterialList(this.noContractDownLoadFile).subscribe(data=>{
      //   if(data){
      //     let blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      
      //   if('msSaveOrOpenBlob' in window.navigator){
      //     window.navigator.msSaveBlob(blob, `物料信息导入模板-系统解决方案.xlsx`);
      //   }else{
      //     let objectUrl = URL.createObjectURL(blob);//创建链接
      //     this.aClick(objectUrl);
      //     URL.revokeObjectURL(objectUrl);//释放链接
      //     this.noContractDownLoadFile=new NoContractDownLoadFile();//重置请求接口所传的物料列表
      //   }
      //   }
      // });

    }else{
      this.noContractDownLoadFile=new NoContractDownLoadFile();
      //直接请求接口
      this.getMaterialListApi();
    }   

    //window.location.href = this.materialDetailService.filesDownload();
  }

  //请求下载物料模板的接口
  getMaterialListApi(){
    this.orderCreateService.getMaterialList(this.noContractDownLoadFile).subscribe(data=>{
      if(data){
        let blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `物料信息导入模板-系统解决方案.xlsx`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl);
        URL.revokeObjectURL(objectUrl);//释放链接
        this.noContractDownLoadFile=new NoContractDownLoadFile();//重置请求接口所传的物料列表
      }
      }
    });
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
aClick(link){
  let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
  let a=document.createElement("a");
  document.body.appendChild(a);
  a.setAttribute("style","display:none");
  a.setAttribute("href",link)
  a.setAttribute("download",`物料信息导入模板-系统解决方案`);
  a.click();
  document.body.removeChild(a);
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
      saleType: 2
    }
    this.modalShipTo.show(params);//编辑送达方
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
      fullAddress = province + province == city ? "市" : "省" + city + "市";
    }
    //区县行政不确定
    fullAddress += data["SDFDistrict"] ? data["SDFDistrict"] + "(区/县)" : "";
    fullAddress += data["SDFAddress"] ? data["SDFAddress"] : "";
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
                  //     that.delPrepanyment();
                  //   }, 3000)
                  // }
                  //this.refreshUploadData();
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
  //删除预收款
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
  //   );
  // }
  //添加物料信息
  addMaterial() {
    let material = new MaterialInfo();
    material.Quantity = 0;
    material.Price = "0.00";
    material.ConsignmentModeID = "01";
    material.isEdit = true;
    this.partyInfo.MaterialList.push(material);
  }
  //添加物料信息
  editMaterial(item?) {
    item.isEdit = true;
  }
  //删除物料信息
  delMaterial(list, i) {
    list.splice(i, 1);
    this.refreshUploadData();
    this.shipToCallBack.emit();
  }
  //清空列表
  empty() {
    this.partyInfo.MaterialList = [];
    this.shipToCallBack.emit();
  }
  //选择预收
  selectAdvance() {
    //计算选择的物料总金额
    let count = 0;
    this.partyInfo.MaterialList.forEach((items, i) => {
      count += items.TotalPrice;
    })
    this.partyInfo.Deliverinfo.MaterialAmountMoney = count;//计算选择的物料总金额
    if (this.partyInfo.Deliverinfo['SDFID']) {
      if (this.customerERPCode) {
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
        this.windowService.alert({ message: "请先选择售达方编码", type: "fail" });
      }
    } else {
      this.windowService.alert({ message: "请先编辑地址再选择预收款", type: "fail" });
    }

  }
  /*
   *ERP商品编码格式为数字加-
   */
  erpCodePattern(item,I) {
    item["MaterialCode"] = item["MaterialCode"].replace(/[^\d\-]/g, '');
    this.getMaterialContent(I);//根据物料号获取物料名称
  }

  //根据物料号获取物料内容
  getMaterialContent(I){
    if(this.partyInfo.MaterialList[I].MaterialCode){
      this.materialDetailService.getMaterialContent(this.partyInfo.MaterialList[I].MaterialCode).then(data=>{
        if(data.Result) {//保存物料名称
          this.partyInfo.MaterialList[I].MaterialName=data.Data.MAKTX_ZH;
       }else{
         this.windowService.alert({message:'物料号不存在',type:"fail"});
         this.partyInfo.MaterialList[I].MaterialCode="";
       }
      });
    }
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
      if (this.rebateAmount != "1.00") {
        item.RebateAmount = (parseFloat(item.Price || 0) * parseFloat(this.rebateAmount || 0)).toFixed(2);
      }
      //总额计算
      item.TotalPrice = parseFloat(item.Price || 0) - parseFloat(item.RebateAmount || 0);
      this.shipToCallBack.emit();
    })
    if (this.constRebateAmount != this.rebateAmount) {
      this.constRebateAmount = this.rebateAmount;
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
      if (parseInt(str) > 99999) {
        item["Quantity"] = 99999;
      }
    } else {
      item["Quantity"] = 0;
    };

    let params = {
      type: "add",
      currentIndex: this.currentIndex,
      list: [item]
    };

    // if(item.Quantity>item.AvailableQuantity) this.windowService.alert({message:'输入数量超出可用数量，请重新输入',type:"fail"});

    this.refreshUploadData();
    this.shipToCallBack.emit(params);

  }
  //检查输入库存地
  checkStorage(material){

    if(!material.StorageLocation){return}

    if (material.StorageLocation.length > 0) {
      if(material.StorageLocation.length != 4) {
        material.StorageLocation = "";
        this.windowService.alert({ message: "请输入4位字符！", type: "fail" });
      }
      if(material.StorageLocation.length === 4){
        material.StorageLocation = String(material.StorageLocation).toUpperCase();
      }
    }
  }
  //检查输入工厂
  checkFactory(material){
    if (material.Factory.length > 0) {
      if(material.Factory.length != 4) {
        material.Factory = "";
        this.windowService.alert({ message: "请输入4位字符！", type: "fail" });
      }
      if(material.Factory.length === 4){
        material.Factory = String(material.Factory).toUpperCase();
      }
    }
  }
  //检查输入批次
  checkBatch(material,Batch?){
    if (material.Batch.length > 0 && material.Batch.length > 10) {
      material.Batch = "";
      this.windowService.alert({ message: "最多10位字符！", type: "fail" });
    }
    material.Batch=material.Batch.toUpperCase();
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
    console.log(this.prePaymentList);
    this.deletePrepanymentListData.AMOUNT=this.prePaymentList[I].AMOUNT;
    this.deletePrepanymentListData.BUZEI=this.prePaymentList[I].BUZEI;
    this.deletePrepanymentListData.SalesOrderID=this.salesOrderID;
    this.deletePrepanymentListData.SDFID=this.prePaymentList[I].SDFID;
    this.deletePrepanymentListData.SHEET_NO=this.prePaymentList[I].SHEET_NO;

    this.orderCreateService.delAdvancesData(this.deletePrepanymentListData).subscribe(data=>{
      if(data.Result){
        this.windowService.alert({message:"删除预收款成功",type:"success"}).subscribe(()=>{
          this.getPrePaymentList(this.partyInfo.Deliverinfo["SDFID"],this.salesOrderID);
        });
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    });
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
    console.log(item);
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

  //根据选择的送达方信息，获取发货方式
  getConsignment(DeliveryInfo){
    if(DeliveryInfo&&this.partyInfo.MaterialList.length>0){
      this.partyInfo.MaterialList.forEach(element => {
        element.ConsignmentModeID=DeliveryInfo.ConsignmentModeID;
      });
    }
  }

}
