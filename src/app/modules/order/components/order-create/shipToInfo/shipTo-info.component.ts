import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import {
  DeliveryInfo, DeliveryType, PartyInfo, ProvinceCityInfo, OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './shipTo-info.component.html',
  styleUrls: ['./shipTo-info.component.scss']
})
export class ShipToInfoComponent implements OnInit {
  modal: XcModalRef;
  pagerData = new Pager();
  deliveryList: PartyInfo[] = [];//送达方列表数据
  deliveryTypeList: DeliveryType[] = [];//发货方式
  isModifies = [];//是否修改
  formData: PartyInfo = new PartyInfo();//送达方数据
  SDFCondition;//客户名称,客户编码
  deliverinfo;//初始送达方数据
  provinceCityInfo: ProvinceCityInfo = new ProvinceCityInfo();//省市区信息
  cityList;//市
  districtList;//区县
  deliveryType;//发货方式
  salesOrderID;//销售订单ＩＤ
  departmentProductGroupID;//部门产品组
  channel;//分销渠道
  customerERPCode;//客户ERP
  orderTypeId;//销售订单
  saleType;//订单模板类型

  allowReset: boolean = false;//是否可以点击重置
  loading: boolean = false;//加载中
  isACustomer: boolean = false;
  isSubmit: boolean = false;
  defauls: boolean = false;//无数据默认显示
  firstInit: boolean = true;

  contractCode:string;//保存销售合同号
  isShowAlert:boolean=true;//是否显示‘委托发货原件为商务’

  @ViewChildren(NgModel) inputList;//表单控件
  @ViewChildren('forminput') inputListDom;//表单控件DOM元素
  @ViewChild(NgForm) myApplyForm;//表单

  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }
  changeProvince() {
    let provinceCode = this.formData.AreaID;
    let cityInfo = this.provinceCityInfo["city"];
    if (this.firstInit && this.formData.SDFCity) {
      this.changeCity();
    } else {
      this.firstInit = false;
      this.isModifies[4] = true;
      this.allowReset = true;
      //点击修改清空后面数据
      this.formData.SDFCity = "";
      this.formData.SDFDistrict = "";
      this.cityList = [];
      this.districtList = [];
    }
    this.cityList = cityInfo.filter(item => item.CityCode.indexOf(provinceCode) == 0);
  }
  changeCity() {
    let citycode = this.formData.SDFCity;
    let countyInfo = this.provinceCityInfo["district"];
    if (this.firstInit) {
      this.firstInit = false;
    } else {
      this.isModifies[5] = true;
      this.allowReset = true;
      //点击修改清空后面数据
      this.formData.SDFDistrict = "";
      this.districtList = [];
    }
    this.districtList = countyInfo.filter(item => item.CityCode.indexOf(citycode) == 0);
  }
  changeCounty() {
    this.isModifies[6] = true;
    this.allowReset = true;
  }
  initData(data?) {
    let SDFC = "";
    if (this.SDFCondition) {
      SDFC = this.SDFCondition.trim();
    }
    let params = {
      SalesOrderID: this.salesOrderID,
      DepartmentProductGroupID: this.departmentProductGroupID,
      CustomerERPCode: this.customerERPCode,
      Channel: this.channel,
      SDFCondition: SDFC
    }
    this.loading = true;
    this.orderCreateService.getDeliveryList(params).subscribe(
      data => {
        if (data.Result) {
          let info = JSON.parse(data.Data);
          this.customerERPCode='';
          console.log(info);
          if (info.length == 0) {
            this.defauls = true;
          } else {
            this.defauls = false;
          }
          this.deliveryList = info;
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
        this.loading = false;
      }
    );
  }
  ngOnInit() {
    //数据初始化，未修改
    for (let i = 0; i < 10; i++) {
      this.isModifies.push(false);
    }
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      this.isACustomer = false;
      this.isSubmit = false;
      if (data) {
        console.log('弹出窗数据',data);
        this.formData.ConsignmentModeID = "01";
        this.provinceCityInfo = data["provinceCityInfo"];
        this.deliveryTypeList = data["deliveryTypeList"];
        this.deliverinfo = data["deliverinfo"];
        this.salesOrderID = data["SalesOrderID"];
        this.orderTypeId = data["OrderTypeId"];
        this.saleType = data["saleType"] || 0;
        this.contractCode=data['ContractCode'];//获取销售合同号

        this.getIsShowAlert(this.contractCode);//是否显示‘委托发货原件给商务’弹窗

        //从ERP获取数据，无法编辑
        if (data["deliverinfo"]["SDFCode"] != "A" && data["deliverinfo"]["SDFCode"] != "ALY") {
          this.isACustomer = false;
          for (let key in this.myApplyForm.controls) {
            if (key != "name" && key != "deliveryType") {
              this.myApplyForm.controls[key].disable({ onlySelf: true })
            }
          }
        } else {
          this.isACustomer = true;
        }
        //判断是否有SDFID，调取送达方详细信息
        this.getInitSDF(data["deliverinfo"]["SDFID"]);
        //送达方列表数据需要字段
        if (data["Channel"]) {
          this.channel = data["Channel"];
        } else {
          this.windowService.alert({ message: "查询送达方列表信息，请先选择分销渠道", type: "fail" });
        }
        this.customerERPCode = data["CustomerERPCode"];
        if (data["DepartmentProductGroupID"]) {
          this.departmentProductGroupID = data["DepartmentProductGroupID"];
        } else {
          this.windowService.alert({ message: "查询送达方列表信息，请先选择部门产品组！", type: "fail" });
          return;
        }
        this.initData(data);
      }
    });

  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }
  search() {

    if(!this.customerERPCode){
      this.windowService.alert({message:"请填写客户编号",type:'fail'});
      return;
    }

    if (this.departmentProductGroupID) {
      this.initData();
    } else {
      this.windowService.alert({ message: "查询送达方列表信息，请先添加物料", type: "fail" });
    }
  }
  SDFModify(index) {
    this.isModifies[index] = true;
    console.log(this.isModifies);
    this.allowReset = true;
  }
  selected(item) {
    if (this.formData["SDFCode"] !== item["SDFCode"]) {
      for (let key in item) {
        this.allowReset = true;
        if (key == "MaterialAmountMoney") {
          this.formData[key] = item[key] || 0;
        } else {
          this.formData[key] = item[key] || "";
        }


      };
    } else {
      return;
    }
    if (this.formData["SDFCode"] != "A" && this.formData["SDFCode"] != "ALY") {
      this.isACustomer = false;
      for (let key in this.myApplyForm.controls) {
        if (key != "name" && key != "deliveryType"&& key!='SDFDistrict'&&key!='SDåFCity') {
          this.myApplyForm.controls[key].disable({ onlySelf: true })
        }
      };
    } else {
      this.isACustomer = true;
    }

    //获取城市列表
    this.changeProvince();

  }
  //重置
  reSet() {
    if (this.allowReset) {
      this.restFormData();
      //this.getInitSDF(this.deliverinfo["SDFID"]);
    }
  }

  //重置表单项
  restFormData(){
    this.formData.SDFCode="A";//送达方编码
    this.formData.SDFName="";//送达方名称
    this.formData.ConsignmentModeID="";//发货方式
    this.formData.SignatureMethod="";//签收方式
    this.formData.PhoneNumber="";//联系人手机
    this.formData.TelNumber="";//固定电话
    this.formData.SDFLinkMan="";//联系人
    this.formData.AreaID="";//省（市）
    this.formData.SDFCity="";//城市
    this.formData.SDFDistrict="";//地区
    this.formData.SDFAddress="";//送货地址
    this.formData.SDFPostCode="";//邮政编码
    this.resetForm();
  }

  //判断是否是一次性客户重置
  resetForm() {
    if (this.formData.SDFCode == "A" || this.formData.SDFCode == "ALY") {
      this.isACustomer = true;
      for (let key in this.myApplyForm.controls) {
        if (key != "name") {
          this.myApplyForm.controls[key].enable({ onlySelf: false });
        }
      }
    }
  }
  /**
  *获取送达方ID
  */
  getInitSDF(SDFID) {
    //判断是否有SDFID，调取送达方详细信息
    if (SDFID) {
      this.loading = true;
      this.orderCreateService.getDeliveryInfo(SDFID).subscribe(
        data => {
          if (data.Result) {
            let info = JSON.parse(data.Data);
            console.log(info);
            this.formData = info;
            if (info["AreaID"] && this.firstInit) {
              this.changeProvince();
            }
            this.isModifies = [];
            for (let i = 0; i < 8; i++) {
              this.isModifies.push(false);
            }
            this.allowReset = true;
            this.resetForm();
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.loading = false;
        }
      );
    } else {
      let formData = this.formData;
      for (let key in formData) {
        if (key != "SDFCode" && key != "SDFName" && key != "ConsignmentModeID" && key != "SDFAddress") {
          formData[key] = "";
        }
      }
      this.formData.SDFCode = this.deliverinfo["SDFCode"];
      this.formData.SDFName = this.deliverinfo["SDFName"];
      this.formData.SDFAddress = this.deliverinfo["SDFAddress"];
      this.resetForm();
    }
  }
  //保存数据
  submit(e?) {
    this.isSubmit = true;
    if (this.myApplyForm.valid) {//表单验证通过
      let message = "确定保存？";
      let isModifies = false;
      this.isModifies.forEach(function(item, index) {
        if (item) {
          isModifies = true;
        }
      });
      if (this.saleType !== 2 && isModifies && this.orderTypeId != '0005'&&this.isShowAlert) {
        message = "请同时提交委托发货原件给商务";
        this.formData.IsDelegate = 1;
      } else {
        this.formData.IsDelegate = 0;
      };
      let user = JSON.parse(localStorage.getItem("UserInfo"));
      this.formData.EditorName = user["UserName"];
      this.formData.EditorITCode = user["ITCode"];
      this.formData.SalesOrderId = this.salesOrderID;
      this.windowService.confirm({ message: message }).subscribe({
        next: (v) => {
          if (v) {
            this.loading = true;
            if (this.formData.SDFCode !== this.deliverinfo["SDFCode"]) {
              this.formData.IsDelegate = 1;
            };
            if (this.deliverinfo["SDFID"]) {
              //送达方有SDFID更新送达方数据
              this.formData["SDFID"] = this.deliverinfo["SDFID"];
              this.formData["ID"] = this.deliverinfo["SDFID"];
              this.orderCreateService.updateDeliveryInfo({ DeliveryModel: this.formData }).subscribe(
                data => {
                  if (data.Result) {
                    let info = JSON.parse(data.Data);
                    let emitData = {
                      DeliveryInfo: this.formData,
                      isShowAlert: this.isShowAlert
                    }
                    this.hide(emitData);
                  } else {
                    this.windowService.alert({ message: data.Message, type: "fail" });
                  }
                  this.loading = false;
                }
              );
            } else {
              //没有SDFID，保存送达方
              this.formData["ID"] = "0";
              this.orderCreateService.addDeliveryInfo({ DeliveryModel: this.formData }).subscribe(
                data => {
                  if (data.Result) {
                    let info = JSON.parse(data.Data);
                    this.formData["ID"] = info["SDFID"];
                    this.formData["SDFID"] = info["SDFID"];
                    let emitData = {
                      DeliveryInfo: this.formData,
                      isShowAlert: this.isShowAlert
                    }
                    this.hide(emitData);
                  } else {
                    this.windowService.alert({ message: data.Message, type: "fail" });
                  }
                  this.loading = false;
                }
              );
            }
          }
        }
      });
    } else {//表单验证未通过
      let flag = false;
      for (let i = 0; i < this.inputList.length && !flag; i++) {//遍历表单控件
        if (this.inputList._results[i].invalid) {//验证未通过
          let ele = this.inputListDom._results[i];//存储该表单控件元素
          if (ele && ele.nativeElement) {
            ele.nativeElement.focus();//使该表单控件获取焦点
          }
          flag = true;
        }
      }
    }
  }

  //获取是否显示”委托发货原件为商务“
  getIsShowAlert(contractCode) {
    this.orderCreateService.getIsShowAlert(contractCode).then(data=> {
      if(data.Result) {
         this.isShowAlert=JSON.parse(data.Data);
      }
    });
  }


}
