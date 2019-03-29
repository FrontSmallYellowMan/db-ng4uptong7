import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ElectronicContract, BaseData, Access, SelectInfo, Selected, ProductRelated, SelectItem, BuyerInfo } from '../entitytype/electroniccontract';
import { ProductDetail } from '../entitytype/producdetail';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { HttpServer } from '../../../../../shared/services/db.http.server';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ProductdetailComponent } from '../productdetail/productdetail.component';
declare var $: any;
declare var window: any;
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { Pager } from 'app/shared/index';
import { environment } from "environments/environment";
import { RegisterBarCode } from "../../../common/barcode";


const serverAddress: string = "http://10.0.1.26:88";
const producttpladdress = "http://10.0.1.26:666/assets/downloadtpl/产品明细模板.xlsx";
const multipleAddress = "http://10.0.1.26:666/assets/downloadtpl/多送货地址模板.xlsx";
@Component({
  selector: 'iq-contpl-creat',
  templateUrl: './contpl-creat.component.html',
  styleUrls: ['./contpl-creat.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContplCreatComponent implements OnInit, AfterViewChecked {
  @ViewChild('modal')
  modal: ModalComponent;
  @ViewChild('productList')
  productDetail: ProductdetailComponent;
  @ViewChild('smModal') public smModal: ModalDirective;
  constructor(private http: HttpServer, private routerInfo: ActivatedRoute, private location: Location) {
    moment.locale('zh-cn');
    //注册条形码插件
    new RegisterBarCode().extendBarCodeTools();
  }

  public formData: ElectronicContract;//前端表单数据实体
  public ProductRelated: ProductRelated;//产品相关
  public selectInfo: SelectInfo;//下拉框数据
  public selected: Selected;//下拉选中项数据
  public isMultipleAddress: boolean = false;//是否多送货地址
  public copyCountyList = [];
  public Payment: Array<any> = [{ id: 'Ticket', text: '1' }, { id: 'Transfer', text: '2' }, { id: 'Once-Period', text: '3' }, { id: 'Period-Period', text: '4' }, { id: 'Full', text: '5' }, { id: 'Once-Period2', text: '6' }, { id: 'Customize', text: '7' }];
  // public sellerInfo: SellerInfo;//卖方信息
  public selectedBuyer: BuyerInfo;
  public Old_SellerCompanyCode: string;//编辑之前的卖方  
  public message: string;//提示信息
  public producttpladdress = producttpladdress;//产品明细模板下载地址
  public multipleAddress = multipleAddress;//多送货地址模板下载地址
  public Barcode: string = "";//二维码
  public isCheck: boolean = false;//是否验证通过
  public isView: boolean = false;//是否查看页面
  public isRiskView: boolean = false;//是否信控角色
  public isSingleAddress = true;
  //收货人地址
  public ReceivingProvinceList: Array<any> = [{ ProvinceCode: 1, ProvinceName: '北京' }, { ProvinceCode: 2, ProvinceName: '河北' }];
  public ReceivingCityList: Array<any> = [{ CityCode: 1, CityName: '北京' }, { CityCode: 2, CityName: '石家庄' }, { CityCode: 2, CityName: '邯郸' }];
  public ReceivingDistrictList: Array<any> = [{ CityCode: 1, CountyName: '昌平' }, { CityCode: 2, CountyName: '海淀' }, { CityCode: 2, CountyName: '涉县' }];
  public copyReceivingCityList = null;
  public copyReceivingDistrictList = null;


  //附件上传
  public uploaderProduct: FileUploader = new FileUploader({ url: environment.server + "E_Contract/UploadProductDetails" });
  public uploaderAddress: FileUploader = new FileUploader({ url: environment.server + "E_Contract/UploadDeliveryAddress" });
  public upLoadECFile: FileUploader = new FileUploader({ url: environment.server + "E_Contract/UploadECAccessories" });

  public SC_Code: string;//合同评审编号
  public ItCode: string;//
  public UserName: string;//
  public BizScopeCode: string = "GQ01";//业务范围代码
  public IsRiskPost: string;//是否信控岗
  public payTypeText: string;
  //付款条款金额
  public TicketTotalMoney: string;
  public PayType_OP_SurplusMoney: string;
  public PayType_OP_MoneyCopy: string;
  public PayType_OP2_MoneyCopy: string;



  ngOnInit() {
    this.getQueryParams();
    this.onInitData();
  }

  //获取url参数
  getQueryParams() {
    // this.EC_Code = this.routerInfo.snapshot.queryParams['EC_Code'];
    this.SC_Code = this.routerInfo.snapshot.queryParams['SC_Code'];
    this.ItCode = this.routerInfo.snapshot.queryParams['ItCode'];
    this.UserName = this.routerInfo.snapshot.queryParams['UserName'];
    this.BizScopeCode = this.routerInfo.snapshot.queryParams['BizScopeCode'];
    // if (this.EC_Code == undefined) {
    //   this.EC_Code = "系统自动生成";
    // }
    if (this.BizScopeCode == undefined) {
      this.BizScopeCode = "GQ01";
    }
    this.IsRiskPost = this.routerInfo.snapshot.queryParams['IsRiskPost'];
    if (this.IsRiskPost == 'true') {
      this.isRiskView = true;
      this.isView = true;
    }
    if (this.IsRiskPost == 'false') {
      this.isRiskView = false;
      this.isView = true;
    }
    if (this.IsRiskPost == undefined) {
      this.isView = false;
    }

  }

  onInitData() {
    this.formData = new ElectronicContract(
      new BaseData(
        null, this.SC_Code, 1, null, null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null
      ),
      [], null, []
    );

    this.ProductRelated = new ProductRelated(null, null, null, null, 0, null);
    this.selectInfo = new SelectInfo(
      [], [], [], [], this.Payment, [], [], []
    );

    this.selected = new Selected(
      [], [{ id: 'Ticket', text: '1' }], [], [], [], [], [], [], [], []
    );

    this.onGetSelectinfo();
  }

  //是否多送货地址
  onToggleAddress(isMultipleAddress, value) {
    this.isMultipleAddress = isMultipleAddress;
    if (isMultipleAddress) {
      this.formData.BaseData.DeliveryAddressType = 2;     
    } else {
      this.formData.BaseData.DeliveryAddressType = 1;
    }
  }
  //争议解决方式
  onToggleDispute(value) {
    this.formData.BaseData.DisputeDealtType = String(value);
  }
  //输入付款方式 比例
  onInputProportion(event, attr, val: string) {
    if (event.target.value > 100) {
      this.message = "预付款百分比不能大于100%";
      event.target.value = '';
      this.smModal.show();
    }

    if (event.target.value != '' && !this.onCheckByPattern_FloatNew(event.target.value)) {
      this.message = "输入非法";
      event.target.value = '';
      this.smModal.show();
    }

    let temp = this.ProductRelated.TotalMoney * (Number(event.target.value) / 100);
    this.formData.BaseData[attr] = this.deleteFloatNumberLatZero(String(temp.toFixed(2)));

    this.payTypeShowMoney(val);
  }


  onCheckByPattern_FloatNew(value) {
    // return /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/.test(value);
    return /^^[0-9]+(\.[0-9]{0,2})?$$/.test(value);
  }


  //付款方式 金额是否可编辑sole
  onClickMoney(event, attr) {
    if (this.formData.BaseData[attr]) {
      event.target.setAttribute("readOnly", "true");
    } else {
      event.target.removeAttribute('readonly');
    }
  }
  //付款方式 金额四舍五入
  onInputMoney(event, value: string) {
    let moneyInputFlag: boolean = true;
    let val = event.target.value.toString();

    if (event.target.value != '' && !this.onCheckByPattern_FloatNew(event.target.value)) {
      this.message = "输入非法,只能为数字且小数点后最多两位";
      event.target.value = '';
      moneyInputFlag = false;
      this.smModal.show();
    }

    if (val > this.ProductRelated.TotalMoney) {
      this.message = "预付金额大于总计金额";
      moneyInputFlag = false;
      event.target.value = '';
      this.smModal.show();
    } else {
      this.formData.BaseData.PayType_OP_Ratio = null;
      this.formData.BaseData.PayType_PP_Ratio = null;
      this.formData.BaseData.PayType_OP2_Ratio = null;
    }
    if (this.onCheckByPattern_NumberNoZeroStart(val)) {
      this.message = "正整数开头不可以为0";
      moneyInputFlag = false;
      event.target.value = '';
      this.smModal.show();
    }
    if (moneyInputFlag) {
      switch (value) {
        case 'Once-Period':
          this.PayType_OP_SurplusMoney = String((this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP_Money)).toFixed(2));//3
          this.PayType_OP_MoneyCopy = String((this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP_Money)).toFixed(2));
          this.PayType_OP_SurplusMoney = Number(this.PayType_OP_SurplusMoney) < 0 ? '0' : this.PayType_OP_SurplusMoney;
          this.PayType_OP_MoneyCopy = Number(this.PayType_OP_MoneyCopy) < 0 ? '0' : this.PayType_OP_MoneyCopy;
          break;
        case 'Once-Period2':
          let PayType_OP2_MoneyCopy1 = this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP2_Money);
          this.PayType_OP2_MoneyCopy = String(PayType_OP2_MoneyCopy1 < 0 ? '0' : PayType_OP2_MoneyCopy1.toFixed(2));
          break;
      }
    }

  }

  onSelectMaxLen(event, maxLen: number) {
    let val = event.target.value.toString();
    if (val.length > maxLen) {
      this.message = "输入字数不得大于" + maxLen;
      event.target.value = "";
      this.smModal.show();
    }
  }

  onCheckByPattern_Float(value) {
    return /\d|\d\.\d{0,2}$/.test(value);
  }

  onTransSelectInfos(arr: Array<any>, id, text, extendAttr?) {
    let newArr = [];
    arr.map(function (item) {
      let newItem = {};
      newItem['id'] = item[id];
      newItem['text'] = item[text];
      if (extendAttr) {
        newItem['companycode'] = item[extendAttr];
      }
      newArr.push(newItem);
    });
    return newArr;
  }


  //下拉框数据格式修改 -- 自定义id
  onTransSelectInfosForIdChange(arr: Array<any>, id, text, extendAttr?) {
    let newArr = [];
    let i: number = 0;
    arr.map(function (item) {
      let newItem = {};
      i++;
      newItem['id'] = item[id] + String(i);
      newItem['text'] = item[text];
      if (extendAttr) {
        newItem['companycode'] = item[extendAttr];
      }
      newArr.push(newItem);
    });
    return newArr;
  }

  onTotalMoneyChange() {
    let temp: any;
    let payType = this.formData.BaseData.PaymentType;
    if (payType) {
      switch (payType) {
        case 'Once-Period':
          this.onTotalMoneyChangePayType(this.formData.BaseData.PayType_OP_Ratio, 'PayType_OP_Money');
          break;
        case 'Once-Period2':
          this.onTotalMoneyChangePayType(this.formData.BaseData.PayType_OP2_Ratio, 'PayType_OP2_Money');
          break;
      }
      this.payTypeShowMoney(payType);
    }
  }

  onTotalMoneyChangePayType(Ration: string, payMoney: string) {
    let temp = this.ProductRelated.TotalMoney * (Number(Ration) / 100);
    this.formData.BaseData[payMoney] = this.deleteFloatNumberLatZero(String(temp.toFixed(2)));
  }

  //bug? 未调整
  onSelectTicket(value, attr) {
    // let newSelectedItem = new SelectItem(value.id, value.text);
    // this.selected[attr] = [newSelectedItem];
    // console.log(this.selected[attr]);
  }

  onSelectCity(value) {
    let newArray = [];
    this.copyCountyList.forEach(function (element, index, array) {
      if (element.id.substring(0, 5) === value.id) {
        element.id = String(index);
        newArray.push(element);
      }
    });
    this.selectInfo['CountyList'] = newArray;
    this.selected.County = [];
  }

  //省份下拉框操作
  onSelectReceivingProvince(value) {
    let newArray = [];
    this.copyReceivingCityList.forEach(function (element, index, array) {
      if (element.id.length > 3) {
        if (element.id.substring(0, 3) === value.id) {
          newArray.push(element);
        }
      }
    });
    this.selectInfo['ReceivingCityList'] = newArray;
    this.selected.ReceivingCity = [];
    this.selected.ReceivingCounty = [];
  }


  //市区下拉框
  onSelectReceivingCity(value) {
    let newArray = [];
    this.copyReceivingDistrictList.forEach(function (element, index, array) {
      if (element.id.substring(0, 5) === value.id) {
        element.id = String(index);
        newArray.push(element);
      }
    });
    this.selectInfo['ReceivingDistrictList'] = newArray;
    this.selected.ReceivingCounty = [];

  }


  //付款条款选择下拉框
  onSelectPaymentType(value) {
    this.formData.BaseData.PayType_Ticket_Day = "";
    this.formData.BaseData.PayType_Transfer_Day = "";
    this.formData.BaseData.PayType_OP_Ratio = "";
    this.formData.BaseData.PayType_OP_Money = "";
    this.formData.BaseData.PayType_OP_Day = "";
    this.formData.BaseData.PayType_PP_Ratio = "";
    this.formData.BaseData.PayType_PP_Money = "";
    this.formData.BaseData.PayType_PP_Day = "";
    this.formData.BaseData.PayType_Full_Day = "";
    this.formData.BaseData.PayType_OP2_SignDay = "";
    this.formData.BaseData.PayType_OP2_Ratio = "";
    this.formData.BaseData.PayType_OP2_Money = "";
    this.formData.BaseData.PayType_OP2_SendDay = "";
    this.formData.BaseData.PayType_Customize = "";
    this.formData.BaseData.PaymentType = value.id;
    this.payTypeShowMoney(value.id);
  }


  //付款条款内容显示处理
  payTypeShowMoney(value: string) {
    switch (value) {
      case 'Ticket':
        this.TicketTotalMoney = this.deleteFloatNumberLatZero(this.ProductRelated.TotalMoney.toFixed(2));
        this.PayType_OP_SurplusMoney = ""; //3
        this.PayType_OP_MoneyCopy = "";
        this.PayType_OP2_MoneyCopy = "" //6        
        break;
      case 'Once-Period':
        this.TicketTotalMoney = "";    //1
        this.formData.BaseData.PayType_OP_Money =
          this.deleteFloatNumberLatZero(Number(this.formData.BaseData.PayType_OP_Money).toFixed(2));
        this.PayType_OP_SurplusMoney =
          this.deleteFloatNumberLatZero((this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP_Money)).toFixed(2));//3
        this.PayType_OP_MoneyCopy =
          this.deleteFloatNumberLatZero((this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP_Money)).toFixed(2));
        this.PayType_OP2_MoneyCopy = "" //6
        break;
      case 'Once-Period2':
        this.TicketTotalMoney = "";    //1
        this.PayType_OP_SurplusMoney = "";//3
        this.PayType_OP_MoneyCopy = "";
        this.PayType_OP2_MoneyCopy =
          this.deleteFloatNumberLatZero((this.ProductRelated.TotalMoney - Number(this.formData.BaseData.PayType_OP2_Money)).toFixed(2));//6
        break;
      default:
        this.TicketTotalMoney = "";    //1
        this.PayType_OP_SurplusMoney = "";//3
        this.PayType_OP_MoneyCopy = "";
        this.PayType_OP2_MoneyCopy = "" //6
        break;
    }


  }

  deleteFloatNumberLatZero(value): string {
    let returnVal = value;
    if (/^[0-9]+\.[0]{2}$/.test(value)) {
      returnVal = value.substring(0, value.length - 3);
    }
    if (/^[0-9]+\.[1-9][0]$/.test(value)) {
      returnVal = value.substring(0, value.length - 1);
    }
    return returnVal;
  }

  onSelectSeller(value) {
    if (value) {
      let SellerCompanyCode: string = "";
      let SellerCompanyName: string = "";
      this.selectInfo.CompanyList.map(function (item) {
        if (item['id'] == value['id'] && item['text'] == value['text']) {
          SellerCompanyCode = item['companycode'];
          SellerCompanyName = item['text'];
          return;
        }
      });
      if (SellerCompanyCode) {
        this.formData.BaseData.SellerCompanyCode = SellerCompanyCode;
        this.formData.BaseData.SellerName = SellerCompanyName;
      }
      this.getSellerByErpCode(value.id);
    }
  }

  getSellerByErpCode(erpCode: string) {
    let requestData: any;
    let url = "E_Contract/GetSellerInfo/" + erpCode;
    this.http.post(url).subscribe(
      data => {
        requestData = JSON.parse(data.Data);
        if (requestData) {
          this.setSellerInfo(requestData);
        }
      }, error => {
        console.log(error);
      }, null);
  }
  setSellerInfo(seller) {
    this.formData.BaseData.SellerAddress = seller.CompanyAddress;
    this.formData.BaseData.SellerTelephone = seller.Tel;
    this.formData.BaseData.SellerBankName = seller.Bank;
    this.formData.BaseData.SellerBankNo = seller.BankAccount;
  }

  //生成条形码
  onGenerateBarCode() {
    let newBarCode = '';
    $('.code39').barcode({code:'code39'});
    newBarCode = $('.code39 img').attr("src");
    return newBarCode;
  }

  //保存
  onSave(event) {
    this.onSaveHandle();
    this.oncheckInfo();
    if (this.isCheck) {
      if (this.formData.BaseData.SellerCompanyCode) {
        let url = "E_Contract/CreateECCode/" + this.formData.BaseData.SellerCompanyCode;
        this.http.post(url).subscribe(
          data => {
            if (data.Result) {
              if (this.Old_SellerCompanyCode != this.formData.BaseData.SellerCompanyCode) {
                this.formData.BaseData.EC_Code = data.Data.replace(/\"/g, "");
                $('.code39').html(this.formData.BaseData.EC_Code);
                this.Barcode = this.onGenerateBarCode();
                this.formData.BaseData.Barcode = this.Barcode.slice(this.Barcode.indexOf(',') + 1);
              }
            }
          }, error => {
            console.log(error);
          }, () => {
            let url = "E_Contract/SaveEContract";
            let body = this.formData;
            this.http.post(url, body).subscribe(
              data => {
                if (data.Result) {
                  this.Old_SellerCompanyCode = this.formData.BaseData.SellerCompanyCode;
                  if (data.Data != null) {
                    this.message = "保存成功,跳转PDF页面";
                    window.open(data.Data.toString().toString().trim());
                  } else {
                    this.message = "数据保存成功，未生成PDF";
                  }
                  this.smModal.show();
                } else {
                  this.message = "保存失败,错误信息：" + data.Message;
                  this.smModal.show();
                }
              }, error => {
                console.log(error);
              }, () => {
                if (this.isArray(this.formData.Accessories)) {
                  this.formData.Accessories.map(function (item) {
                    item["AccessoryURL"] = serverAddress.concat(item["AccessoryURL"]);
                  });
                }

                if (this.formData.MultiDeliveryAddress) {
                  this.formData.MultiDeliveryAddress["AccessoryURL"] =
                    serverAddress.concat(this.formData.MultiDeliveryAddress["AccessoryURL"]);
                }
              });
          });
      }
    }
  }
  //保存时处理
  onSaveHandle() {
    let baseData = this.formData.BaseData;
    let selected = this.selected;
    this.onHandleSelect(selected);
    //下拉框
    selected.Seller.length ? baseData.SellerERPCode = selected.Seller[0].id : null;
    selected.Seller.length ? baseData.SellerName = selected.Seller[0].text : null;
    if (selected.PaymentType.length == 0) {
      selected.PaymentType.push({ id: 'Ticket', text: '1' });
    }

    !!selected.PaymentType.length ? baseData.PaymentType = selected.PaymentType[0].id : null;
    !!selected.PayType_Ticket_Type.length ? baseData.PayType_Ticket_TypeID = selected.PayType_Ticket_Type[0].id : null;
    !!selected.PayType_Ticket_Type.length ? baseData.PayType_Ticket_TypeName = selected.PayType_Ticket_Type[0].text : null;
    !!selected.PayType_OP_Ticket.length ? baseData.PayType_OP_TicketID = selected.PayType_OP_Ticket[0].id : null;
    !!selected.PayType_OP_Ticket.length ? baseData.PayType_OP_TicketName = selected.PayType_OP_Ticket[0].text : null;
    !!selected.PayType_PP_Ticket.length ? baseData.PayType_PP_TicketID = selected.PayType_PP_Ticket[0].id : null;
    !!selected.PayType_PP_Ticket.length ? baseData.PayType_PP_TicketName = selected.PayType_PP_Ticket[0].text : null;
    !!selected.City.length ? baseData.SignedCityCode = selected.City[0].id : null;
    !!selected.City.length ? baseData.SignedCityName = selected.City[0].text : null;
    !!selected.County.length ? baseData.SignedCounty = selected.County[0].text : null;
    !!selected.ReceivingProvince.length ? baseData.RecipientProvinceCode = selected.ReceivingProvince[0].id : null;
    !!selected.ReceivingProvince.length ? baseData.RecipientProvinceName = selected.ReceivingProvince[0].text : null;
    !!selected.ReceivingCity.length ? baseData.RecipientCityCode = selected.ReceivingCity[0].id : baseData.RecipientCityCode = null;
    !!selected.ReceivingCity.length ? baseData.RecipientCityName = selected.ReceivingCity[0].text : baseData.RecipientCityName = null;
    !!selected.ReceivingCounty.length ? baseData.RecipientCountyName = selected.ReceivingCounty[0].text : baseData.RecipientCountyName = null;


    //产品相关
    baseData.Brand = this.ProductRelated.Brand;
    baseData.Product = this.ProductRelated.Product;
    baseData.DiscountRatio = this.ProductRelated.DiscountRatio;
    baseData.DiscountMoney = this.ProductRelated.DiscountMoney;
    baseData.TotalMoney = this.ProductRelated.TotalMoney;
    baseData.TotalMoneyUpper = this.ProductRelated.TotalMoneyUpper;
    //附件地址处理
    this.formData.Accessories.map(function (item) {
      item.AccessoryURL = item.AccessoryURL.slice(Number(item.AccessoryURL.lastIndexOf('88')) + 2);
    });

    if (this.formData.MultiDeliveryAddress != null && this.formData.MultiDeliveryAddress.AccessoryURL != "") {
      let mulAddressUrl = this.formData.MultiDeliveryAddress.AccessoryURL;
      this.formData.MultiDeliveryAddress.AccessoryURL = mulAddressUrl.replace(serverAddress, '');
    }

    //申请人 修改人信息
    if (!baseData.EC_Code) {
      this.formData.BaseData.CreateITCode = this.ItCode;
      this.formData.BaseData.CreateName = this.UserName;

    } else {
      this.formData.BaseData.EditITCode = this.ItCode;
      this.formData.BaseData.EditName = this.UserName;
    }
    this.paymentType(this.formData.BaseData.PaymentType);

  }


  onHandleSelect(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        var element = obj[key];
        if (element) {
          if (element.length > 0 && element[0]["id"] == "0" && element[0]["text"] == "请选择") {
            element.length = 0;
          }
        }

      }
    }
  }
  //表单验证
  oncheckInfo() {
    //风险岗 争议解决方式必填验证
    if (this.isRiskView) {
      if (!this.formData.BaseData.DisputeDealtType) {
        this.message = "请选择争议解决方式！";
        this.smModal.show();
        this.isCheck = false;
        return;
      } else if (this.formData.BaseData.DisputeDealtType == "001" &&
        (!this.formData.BaseData.SignedCityName || !this.formData.BaseData.SignedCounty)) {
        this.message = "请选择市区信息！";
        this.smModal.show();
        this.isCheck = false;
        return;
      }
    }
    if (!this.formData.BaseData.SellerName) {
      this.message = "请选择卖方信息！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.BuyerName) {
      this.message = "请输入买方名称！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.Brand) {
      this.message = "请输入品牌信息！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.Product) {
      this.message = "请输入产品信息！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (!this.formData.ProductDetails.length) {
      this.message = "请维护产品明细！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (this.formData.BaseData.DeliveryAddressType == 1) {
      //清除多送货地址
      this.formData.MultiDeliveryAddress = new Access("", "", "");
      if (!this.formData.BaseData.RecipientName
        || !this.formData.BaseData.RecipientProvinceCode
        || !this.formData.BaseData.RecipientCityCode
        || !this.formData.BaseData.RecipientCountyName
        || !this.formData.BaseData.RecipientTheStreet
        || !this.formData.BaseData.TheContactName
        || !this.formData.BaseData.TheContactPhone
        || !this.formData.BaseData.TheReceivedType) {
        this.message = "请填写收货信息！";
        this.smModal.show();
        this.isCheck = false;
        return;
      }
    } else {
      //单送货地址清除
      this.formData.BaseData.RecipientName = "";
      this.formData.BaseData.RecipientProvinceCode = "";
      this.formData.BaseData.RecipientProvinceName = "";
      this.formData.BaseData.RecipientCityCode = "";
      this.formData.BaseData.RecipientCityName = "";
      this.formData.BaseData.RecipientCountyName = "";
      this.formData.BaseData.RecipientTheStreet = "";
      this.formData.BaseData.TheContactName = "";
      this.formData.BaseData.TheContactPhone = "";
      this.formData.BaseData.TheReceivedType = "";
      this.selected.ReceivingProvince = [];
      this.selected.ReceivingCity = [];
      this.selected.ReceivingCounty = [];
      if (!this.formData.MultiDeliveryAddress || this.formData.MultiDeliveryAddress.AccessoryURL == "") {
        this.message = "请上传多送货地址附件！";
        this.smModal.show();
        this.isCheck = false;
        return;
      }
    }
    if (!this.formData.BaseData.DeliveryTime) {
      this.message = "请填写发交货时间！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }

    switch (this.formData.BaseData.PaymentType) {
      case 'Ticket':
        let temp1 = this.formData.BaseData.PayType_Ticket_Day;
        let temp2 = this.formData.BaseData.PayType_Ticket_TypeID;
        if (!temp1 || !temp2 || !temp1.toString() || !temp2.toString()) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      case 'Transfer':
        let temp = this.formData.BaseData.PayType_Transfer_Day;
        if (!temp || !String(temp)) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      case 'Once-Period':
        if (!this.formData.BaseData.PayType_OP_Money ||
          !this.formData.BaseData.PayType_OP_Day || !this.formData.BaseData.PayType_OP_TicketID ||
          !(this.formData.BaseData.PayType_OP_Money)
          || !this.formData.BaseData.PayType_OP_Day || !this.formData.BaseData.PayType_OP_TicketID) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      case 'Period-Period':
        if (!this.formData.BaseData.PayType_PP_Money ||
          !this.formData.BaseData.PayType_PP_Day || !this.formData.BaseData.PayType_PP_TicketID ||
          !(this.formData.BaseData.PayType_PP_Money)
          || !this.formData.BaseData.PayType_PP_Day || !this.formData.BaseData.PayType_PP_TicketID) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      case 'Full':
        if (!this.formData.BaseData.PayType_Full_Day || !this.formData.BaseData.PayType_Full_Day) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      case 'Once-Period2':
        if (!this.formData.BaseData.PayType_OP2_SendDay || !this.formData.BaseData.PayType_OP2_Money
          || !this.formData.BaseData.PayType_OP2_SignDay) {
          this.message = "请维护付款信息！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
        break;
      default:
        if (!this.formData.BaseData.PayType_Customize || !this.formData.BaseData.PayType_Customize) {
          this.message = "请填写自定义条款！";
          this.smModal.show();
          this.isCheck = false;
          return;
        }
    }
    if (!this.formData.BaseData.BuyerAddress || !this.formData.BaseData.BuyerTelephone
      || !this.formData.BaseData.BuyerBankName || !this.formData.BaseData.BuyerBankNo) {
      this.message = "请填写买方相关信息！";
      this.smModal.show();
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.ContractTime) {
      this.message = "请选择合同日期！";
      this.smModal.show();
      this.isCheck = false;
      return;
    } else {
      this.isCheck = true;
    }
  }
  //付款条款 保存处理
  paymentType(key) {
    switch (key) {
      case 'Ticket':
        this.formData.BaseData.PayType_Transfer_Day = null;
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        this.formData.BaseData.PayType_Full_Day = null;
        this.formData.BaseData.PayType_Customize = null;
        break;
      case 'Transfer':
        // 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 3
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        // 4
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        // 5
        this.formData.BaseData.PayType_Full_Day = null;
        // 6
        this.formData.BaseData.PayType_Customize = null;
        break;
      case 'Once-Period':
        // 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 2
        this.formData.BaseData.PayType_Transfer_Day = null;
        // 4
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        // 5
        this.formData.BaseData.PayType_Full_Day = null;
        // 6
        this.formData.BaseData.PayType_Customize = null;
        break;
      case 'Period-Period':
        // 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 2
        this.formData.BaseData.PayType_Transfer_Day = null;
        // 3
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        // 5
        this.formData.BaseData.PayType_Full_Day = null;
        // 6
        this.formData.BaseData.PayType_Customize = null;
        break;
      case 'Full':
        // 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 2
        this.formData.BaseData.PayType_Transfer_Day = null;
        // 3
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        // 4
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        // 6
        this.formData.BaseData.PayType_Customize = null;
        break;
      case "Once-Period2":
        // 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 2
        this.formData.BaseData.PayType_Transfer_Day = null;
        // 3
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        // 4
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        // 6
        this.formData.BaseData.PayType_Customize = null;
        break;
      default:
        /// 1
        this.formData.BaseData.PayType_Ticket_Day = null;
        this.formData.BaseData.PayType_Ticket_TypeID = null;
        this.formData.BaseData.PayType_Ticket_TypeName = null;
        // 2
        this.formData.BaseData.PayType_Transfer_Day = null;
        // 3
        this.formData.BaseData.PayType_OP_Ratio = null;
        this.formData.BaseData.PayType_OP_Money = null;
        this.formData.BaseData.PayType_OP_Day = null;
        this.formData.BaseData.PayType_OP_TicketID = null;
        this.formData.BaseData.PayType_OP_TicketName = null;
        // 4
        this.formData.BaseData.PayType_PP_Ratio = null;
        this.formData.BaseData.PayType_PP_Money = null;
        this.formData.BaseData.PayType_PP_Day = null;
        this.formData.BaseData.PayType_PP_TicketID = null;
        this.formData.BaseData.PayType_PP_TicketName = null;
        // 5
        this.formData.BaseData.PayType_Full_Day = null;
    }
  }

  //获取下拉框数据
  onGetSelectinfo() {
    let url = "E_Contract/ECPackageResult";
    let data: any;
    let params = new URLSearchParams();
    params.set('bizScopeCode', this.BizScopeCode);
    let options = new RequestOptions({ search: params });
    this.http.get(url, options)
      .subscribe(
      data => {
        data = JSON.parse(data.Data);
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            let element = data[key];
            switch (key) {
              case 'CompanyList':
                this.selectInfo[key] = this.onTransSelectInfos(element, 'erpcode', 'company', 'companycode');
                break;
              case 'TicketTypeList':
                this.selectInfo[key] = this.onTransSelectInfos(element, 'TT_ID', 'TT_Name');
                break;
              default:
              //
            }
          }
        }
      }, null, () => {
        this.onGetReceivingSelectInfo();
        if (this.SC_Code) {
          this.onGetEContract();
        } else {
          $('.code39').html("条形码区域");
          this.formData.BaseData.PaymentType = 'Ticket';
        }

      });
  }

  //获取收货人地址下拉框数据
  onGetReceivingSelectInfo() {
    let url = "InitData/GetProvinceCityInfo";
    this.http.post(url)
      .subscribe(
      data => {
        data = JSON.parse(data.Data);
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            let element = data[key];
            switch (key) {
              case 'province':
                this.selectInfo["ReceivingProvinceList"] = this.onTransSelectInfos(element, 'ProvinceCode', 'ProvinceName');
                break;
              case 'city':
                this.copyReceivingCityList = this.onTransSelectInfos(element, 'CityCode', 'CityName');
                this.selectInfo["ReceivingCityList"] = [];

                this.selectInfo["CityList"] = this.onTransSelectInfos(element, 'CityCode', 'CityName');
                break;
              case 'district':
                this.copyReceivingDistrictList = this.onTransSelectInfosForIdChange(element, 'CityCode', 'CountyName');
                this.selectInfo["ReceivingDistrictList"] = [];

                this.copyCountyList = this.onTransSelectInfosForIdChange(element, 'CityCode', 'CountyName');
                this.selectInfo["CountyList"] = [];
                break;

              default:
            }
          }
        }
      }, null, null);
  }

  //获取电子合同信息
  onGetEContract() {
    let url = "E_Contract/GetEContract/" + this.SC_Code;
    this.http.get(url)
      .subscribe(
      data => {
        if (data.Result) {
          data = JSON.parse(data.Data) as ElectronicContract;
          this.formData = data;
          if (this.formData.BaseData.EC_Code) {
            $('.code39').html(this.formData.BaseData.EC_Code);
            this.onGenerateBarCode();
          } else {
            $('.code39').html("条形码区域");
          }
          this.Old_SellerCompanyCode = this.formData.BaseData.SellerCompanyCode;
          this.ProductRelated.Brand = this.formData.BaseData.Brand;
          this.ProductRelated.Product = this.formData.BaseData.Product;
          this.ProductRelated.DiscountRatio = this.formData.BaseData.DiscountRatio;
          this.ProductRelated.DiscountMoney = this.formData.BaseData.DiscountMoney;
          this.ProductRelated.TotalMoney = Number(this.formData.BaseData.TotalMoney.toFixed(2));
          this.ProductRelated.TotalMoneyUpper = this.formData.BaseData.TotalMoneyUpper;
          //下拉框
          let item: SelectItem[] = [new SelectItem('0', '请选择')];
          if (!this.formData.BaseData.SellerERPCode) {
            this.selected.Seller = item;
          } else {
            this.selected.Seller = [{ id: this.formData.BaseData.SellerERPCode, text: this.formData.BaseData.SellerName, other: this.formData.BaseData.SellerCompanyCode }];
          }



          if (!this.formData.BaseData.PaymentType) {
            this.selected.PaymentType = item;
          } else {
            this.selected.PaymentType = [{ id: this.formData.BaseData.PaymentType, text: this.onInitPaymentText(this.formData.BaseData.PaymentType) }];
          }

          if (!this.formData.BaseData.RecipientProvinceCode) {
            this.selected.ReceivingProvince = item;
          } else {
            this.selected.ReceivingProvince = [{ id: this.formData.BaseData.RecipientProvinceCode, text: this.formData.BaseData.RecipientProvinceName }];
          }

          //收货地址
          if (!this.formData.BaseData.RecipientCityCode) {
            this.selected.ReceivingCity = item;
          } else {
            this.selected.ReceivingCity = [{ id: this.formData.BaseData.RecipientCityCode, text: this.formData.BaseData.RecipientCityName }];
          }

          if (!this.formData.BaseData.RecipientCountyName) {
            this.selected.ReceivingCounty = item;
          } else {
            this.selected.ReceivingCounty = [{ id: this.formData.BaseData.RecipientCityCode, text: this.formData.BaseData.RecipientCountyName }];
          }


          if (!this.formData.BaseData.PayType_Ticket_TypeID) {
            this.selected.PayType_Ticket_Type = item;
          } else {
            this.selected.PayType_Ticket_Type = [{ id: this.formData.BaseData.PayType_Ticket_TypeID, text: this.formData.BaseData.PayType_Ticket_TypeName }];
          }
          if (!this.formData.BaseData.PayType_OP_TicketID) {
            this.selected.PayType_OP_Ticket = item;
          } else {
            this.selected.PayType_OP_Ticket = [{ id: this.formData.BaseData.PayType_OP_TicketID, text: this.formData.BaseData.PayType_OP_TicketName }];
          }
          if (!this.formData.BaseData.PayType_PP_TicketID) {
            this.selected.PayType_PP_Ticket = item;
          } else {
            this.selected.PayType_PP_Ticket = [{ id: this.formData.BaseData.PayType_PP_TicketID, text: this.formData.BaseData.PayType_PP_TicketName }];
          }
          if (!this.formData.BaseData.SignedCityName) {
            this.selected.City = item;
          } else {
            this.selected.City = [{ id: this.formData.BaseData.SignedCityCode, text: this.formData.BaseData.SignedCityName }];
          }
          if (!this.formData.BaseData.SignedCounty) {
            this.selected.County = item;
          } else {
            this.selected.County =
              [{
                id: this.formData.BaseData.SignedCityCode,
                text: this.formData.BaseData.SignedCounty
              }];
            // this.onSelectCity({ id: this.formData.BaseData.SignedCityCode });
          }

          // this.selected = new Selected(
          //   [{ id: this.formData.BaseData.SellerERPCode, text: this.formData.BaseData.SellerName, other: this.formData.BaseData.SellerCompanyCode }],
          //   [{ id: this.formData.BaseData.PaymentType, text: this.onInitPaymentText(this.formData.BaseData.PaymentType) }],
          //   [{ id: this.formData.BaseData.PayType_Ticket_TypeID, text: this.formData.BaseData.PayType_Ticket_TypeName }],
          //   [{ id: this.formData.BaseData.PayType_OP_TicketID, text: this.formData.BaseData.PayType_OP_TicketName }],
          //   [{ id: this.formData.BaseData.PayType_PP_TicketID, text: this.formData.BaseData.PayType_PP_TicketName }],
          //   [{ id: this.formData.BaseData.SignedCityCode, text: this.formData.BaseData.SignedCityName }],
          //   [{ id: this.formData.BaseData.SignedCityCode, text: this.formData.BaseData.SignedCounty }]
          // );
          // this.onSelectCity({ id: this.formData.BaseData.SignedCityCode });
          //处理产品列表序号 ？
          for (let i = 1; i <= this.formData.ProductDetails.length; i++) {
            this.formData.ProductDetails[i - 1]["index"] = i;
          }
          //处理条形码
          if (this.formData.BaseData.Barcode) {
            this.Barcode = "data:image/bmp;base64,".concat(this.formData.BaseData.Barcode);
          }
          //附件地址处理
          if (this.isArray(this.formData.Accessories)) {
            this.formData.Accessories.map(function (item) {
              item["AccessoryURL"] = serverAddress.concat(item["AccessoryURL"]);
            });
          }

          if (this.formData.BaseData.DeliveryAddressType == 2) {
            this.isSingleAddress = false;
          }
          if (this.formData.MultiDeliveryAddress) {
            this.formData.MultiDeliveryAddress["AccessoryURL"] =
              serverAddress.concat(this.formData.MultiDeliveryAddress["AccessoryURL"]);
          }

          //卖方信息初始化：
          // this.getSellerByErpCode(this.formData.BaseData.SellerERPCode);
          this.payTypeShowMoney(this.formData.BaseData.PaymentType);
        } else {
          this.message = "获取电子合同信息失败！";
          this.smModal.show();
        }
      }, null, () => {

        let _that = this;
        $(function () {
          //收货地址
          if (_that.formData.BaseData.DeliveryAddressType === 2) {
            $('#multipleAddress').attr('checked', 'checked');
            _that.isMultipleAddress = true;
          } else {
            $('#singleAddress').attr('checked', 'checked');
            _that.formData.BaseData.DeliveryAddressType = 1;
          }
          //争议解决方式
          if (_that.formData.BaseData.DisputeDealtType === "0001") {
            $('#dispute0001').attr('checked', 'checked');
          } else if (_that.formData.BaseData.DisputeDealtType === "001") {
            $('#dispute001').attr('checked', 'checked');
          } else if (_that.formData.BaseData.DisputeDealtType === "01") {
            $('#dispute01').attr('checked', 'checked');
            // _that.formData.BaseData.DisputeDealtType = '01';
          }
        });
      });
  }

  //付款方式下拉框数据过滤
  onInitPaymentText(value) {
    let text = '';
    switch (value) {
      case 'Ticket':
        text = '1';
        break;
      case 'Transfer':
        text = '2';
        break;
      case 'Once-Period':
        text = '3';
        break;
      case 'Period-Period':
        text = '4';
        break;
      case 'Full':
        text = '5';
        break;
      case 'Once-Period2':
        text = '6';
        break;
      // case 'Customize':
      //   text = '6';
      //   break;
      default:
        text = '7';
    }
    return text;
  }
  //多送货地址上传
  onUploaderAddress(uploader: FileUploader, event) {
    if (uploader.queue.length) {
      if (uploader.queue[uploader.queue.length - 1].file.name.split('.')[1] == 'xlsx') {
        if (uploader.queue[uploader.queue.length - 1]._file["size"] < 52428800) {
          uploader.queue[uploader.queue.length - 1].withCredentials = false;
          uploader.queue[uploader.queue.length - 1].upload();
          uploader.onCompleteItem = ((item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
            let data = JSON.parse(response);
            if (status === 200) {
              if (data.Result) {
                this.formData.MultiDeliveryAddress = JSON.parse(data.Data);
                this.formData.MultiDeliveryAddress = new Access(this.formData.MultiDeliveryAddress.AccessoryID, this.formData.MultiDeliveryAddress.AccessoryName, serverAddress + this.formData.MultiDeliveryAddress.AccessoryURL);
                this.message = "多送货地址上传成功";
                this.smModal.show();
              } else {
                this.formData.MultiDeliveryAddress = null;
                this.message = "多送货地址上传失败";
                this.smModal.show();
              }
              uploader.queue[uploader.queue.length - 1].isUploaded = false;
            }
          });
        } else {
          this.smModal.show();
          this.message = "文件上传不能大于50M";
        }
      } else {
        this.smModal.show();
        this.message = "文件不能为模板外的其他格式";
      }
    }
  }
  //上传附件
  onUploadFiles(uploader: FileUploader) {
    if (uploader.queue.length) {
      if (uploader.queue[uploader.queue.length - 1]._file["size"] < 52428800) {
        uploader.queue.map(function (item) {
          item.withCredentials = false;
        });
        uploader.uploadAll();
      } else {
        this.smModal.show();
        this.message = "文件上传不能大于50M";
      }
    }
    uploader.onCompleteItem = ((item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      if (status === 200 && data.Result) {
        let access = JSON.parse(data.Data);
        this.formData.Accessories.push(new Access(access[0].AccessoryID, access[0].AccessoryName, serverAddress + access[0].AccessoryURL))
        this.smModal.show();
        this.message = "上传成功";
      } else {
        console.log('附件上传失败');
      }
    });
  }
  //批量上传
  onBatchUploadProduct(uploader) {
    if (uploader.queue.length) {
      if (uploader.queue[uploader.queue.length - 1].file.name.split('.')[1] == 'xlsx') {
        if (uploader.queue[uploader.queue.length - 1]._file["size"] < 52428800) {
          let _that = this;
          this.uploaderProduct.onCompleteItem = ((item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
            let data = JSON.parse(response);
            if (status === 200) {
              let productDetails = JSON.parse(data.Data);
              if (data.Result && this.isArray(productDetails)) {
                let errorByProDetailFileIndex = '';
                for (let i = 1; i <= productDetails.length; i++) {
                  productDetails[i - 1]["index"] = i;
                  if (Number(productDetails[i - 1]["Price"]) * Number(productDetails[i - 1]["Qty"]) != Number(productDetails[i - 1]["TotalPrice"])) {
                    errorByProDetailFileIndex = errorByProDetailFileIndex + String(i) + ',';
                  }
                }
                this.formData.ProductDetails = productDetails;
                //处理产品列表相关信息
                this.onCalculateTotalAmount();
                if (errorByProDetailFileIndex == '') {
                  this.message = "产品明细上传成功";
                } else {
                  this.message = "产品明细上传成功，第" + errorByProDetailFileIndex.substring(0, errorByProDetailFileIndex.length - 1) + '行的数据单价*数量不等于总价';
                }

                this.smModal.show();
                //选中默认的付款方式
                this.payTypeShowMoney(!this.formData.BaseData.PaymentType ? this.Payment.find(a => a.text == '1').id : this.formData.BaseData.PaymentType);
              } else {
                this.message = "产品明细上传失败";
                this.smModal.show();
              }
            }
          });
          if (this.uploaderProduct.queue.length) {
            this.uploaderProduct.queue[this.uploaderProduct.queue.length - 1].withCredentials = false;
            this.uploaderProduct.queue[this.uploaderProduct.queue.length - 1].upload();
          }
        } else {
          this.smModal.show();
          this.message = "文件上传不能大于50M";
        }
      } else {
        this.smModal.show();
        this.message = "文件不能为模板外的其他格式";
      }
    }

  }
  //删除附件
  onRemoveFile(item) {
    this.removeByValue(this.formData.Accessories, item);
  }
  //删除数组元素
  removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  }

  //是否数组
  isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  onSelectedBuyer(item: BuyerInfo) {
    this.selectedBuyer = item;
    this.formData.BaseData.BuyerName = item.NAME;
    $('#buyerName')[0].setAttribute('disabled', 'disabled');
  }

  dismiss() {
    this.modal.dismiss();
  }


  //计算总价
  onCalculateTotalAmount() {
    let totalMoney = 0;
    this.formData.ProductDetails.map(function (item) {
      totalMoney += Number(item["TotalPrice"]);
    });
    if (this.ProductRelated.DiscountRatio) {
      this.ProductRelated.TotalMoney =
        Number((totalMoney * (1 - Number(this.ProductRelated.DiscountRatio) / 100)).toFixed(2));
    } else if (this.ProductRelated.DiscountMoney) {
      this.ProductRelated.TotalMoney = Number((totalMoney - Number(this.ProductRelated.DiscountMoney)).toFixed(2));
    } else {
      this.ProductRelated.TotalMoney = Number(totalMoney.toFixed(2));
    }
    this.ProductRelated.TotalMoney = Number(Number(this.ProductRelated.TotalMoney).toFixed(2));

    this.ProductRelated.TotalMoneyUpper = this.productDetail.DX(this.ProductRelated.TotalMoney);
  }

  //日期选择
  public dt: Date = new Date();
  public showDatepicker: boolean = false;
  onShowDatepicker(event) {
    this.showDatepicker = true;
    event.stopPropagation();
  }
  onGetDate(event, dt) {
    this.formData.BaseData.ContractTime = this.formatDate(dt);
    event.stopPropagation();
  }
  formatDate(dt) {
    let contractDay: string = "";
    let year = dt.getFullYear();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    return contractDay = year + "年" + month + "月" + day + "日";
  }

  onInputTel(event) {
    if (this.formData.BaseData.BuyerTelephone && !this.onCheckByPattern_Number(this.formData.BaseData.BuyerTelephone)) {
      this.message = "请输入数字！";
      this.smModal.show();
    }
    this.onSelectMaxLen(event, 30);
  }
  onInputBankNo(event) {
    if (this.formData.BaseData.BuyerBankNo && !this.onCheckByPattern_Number(this.formData.BaseData.BuyerBankNo)) {
      this.message = "请输入数字！";
      this.smModal.show();
    }
    this.onSelectMaxLen(event, 50);
  }
  onCheckTickedDay() {
    if (this.formData.BaseData.PayType_Ticket_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Ticket_Day)) {
      this.message = "请输入最大三位数字 \n 不能以0开头！";
      this.formData.BaseData.PayType_Ticket_Day = "";
      this.smModal.show();
    }
  }
  onCheckOpDay() {
    if (this.formData.BaseData.PayType_OP_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP_Day)) {
      this.message = "请输入最大三位数字 \n 不能以0开头！";
      this.formData.BaseData.PayType_OP_Day = "";
      this.smModal.show();
    }
  }
  onCheckPpDay() {
    if (this.formData.BaseData.PayType_PP_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_PP_Day)) {
      this.message = "请输入最大三位数字 \n 不能以0开头！";
      this.formData.BaseData.PayType_PP_Day = "";
      this.smModal.show();
    }
  }
  onCheckTransferDay() {
    if (this.formData.BaseData.PayType_Transfer_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Transfer_Day)) {
      this.message = "请输入最大三位数字 \n 不能以0开头！";
      this.formData.BaseData.PayType_Transfer_Day = "";
      this.smModal.show();
    }
  }
  onCheckFullDay() {
    if (this.formData.BaseData.PayType_Full_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Full_Day)) {
      this.message = "请输入最大三位数字 \n 不能以0开头！";
      this.formData.BaseData.PayType_Full_Day = "";
      this.smModal.show();
    }
  }

  onCheckPayTypeOp2Date(inputDataType: string) {
    let strCheckPayTypeOp2 = inputDataType;
    switch (strCheckPayTypeOp2) {
      case 'PayType_OP2_SignDay':
        if (this.formData.BaseData.PayType_OP2_SignDay && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP2_SignDay)) {
          this.message = "请输入最大三位数字 \n 不能以0开头！";
          this.formData.BaseData.PayType_OP2_SignDay = "";
          this.smModal.show();
        }
        break;
      case 'PayType_OP2_Ratio':
        if (this.formData.BaseData.PayType_OP2_Ratio && this.onCheckByPattern_NumberNoZeroStart(this.formData.BaseData.PayType_OP2_Ratio)) {
          this.message = "请输入数字！";
          this.formData.BaseData.PayType_OP2_Ratio = "";
          this.smModal.show();
        }
        break;
      case 'PayType_OP2_SendDay':
        if (this.formData.BaseData.PayType_OP2_SendDay && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP2_SendDay)) {
          this.message = "请输入最大三位数字 \n 不能以0开头！";
          this.formData.BaseData.PayType_OP2_SendDay = "";
          this.smModal.show();
        }
        break;

    }
  }

  //纯数字验证
  onCheckByPattern_NumberNoZeroStart(value) {
    return /^0[0-9]+$/.test(value);
  }

  onCheckByPattern_Number(value) {
    return /^[0-9]+$/.test(value);
  }

  //最大三位正整数验证
  onCheckByPattern_Number3(value) {
    return /^[1-9][0-9]{0,2}$/.test(value);
  }

  myform: NgForm;
  @ViewChild('myform') currentForm: NgForm;

  ngAfterViewChecked() {
    // this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.myform) { return; }
    this.myform = this.currentForm;
    if (this.myform) {
      this.myform.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }

  onValueChanged(data?: any) {
    if (!this.myform) { return; }
    const form = this.myform.form;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'BuyerName': '',
    'RecipientName': '',
    'ContactNameAndTel': '',
    'TheReceivedType': '',
    'PayType_Full_Day': ''
  };

  validationMessages = {
    'BuyerName': {
      'required': '请输入买方客户名称'
    },
    'RecipientName': {
      'required': '请输入收货单位'
    },
    'ContactNameAndTel': {
      'required': '请输入联系人信息'
    },
    'TheReceivedType': {
      'required': '请输入签收方式'
    },
    'PayType_Full_Day': {
      'pattern': '正整数三位'
    }
  };

  public pagerData = new Pager();
  //买方信息处理
  public BuyerInfo: BuyerInfo[];//买方信息 totalItems
  public currentPageItems: BuyerInfo[];//当前页需要显示的数据
  public totalItems: number = 0;//总共多少项数据
  public currentPage: number = 1;//当前页
  public pagesize: number = 10;//每页显示多少行
  //初始化买方信息模态框数据
  open() {
    if (this.formData.BaseData.BuyerName) {
      this.onGetBuyerInfo();
    }
    this.modal.open();
  }
  close() {
    this.currentPageItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.modal.close();
  }
  //获取买方信息
  onGetBuyerInfo() {
    if (this.formData.BaseData.BuyerName) {
      let url = "E_Contract/GetBuyerInfo/" + this.formData.BaseData.BuyerName;
      this.http.post(url).subscribe(
        data => {
          let buyerArray = JSON.parse(data.Data);
          if (data.Result && this.isArray(buyerArray)) {
            this.BuyerInfo = buyerArray;
            this.totalItems = buyerArray.length;
            this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
            this.pagerData.set({
              total: this.totalItems,
              totalPages: Math.ceil(this.totalItems / this.pagesize)
            });
          }
        }, error => {
          console.log(error);
        }, null);
    }
  }
  //
  onChangePage(event) {
    this.pagesize = event.pageSize;
    this.currentPage = event.pageNo;
    if (this.BuyerInfo && this.BuyerInfo.length > 0) {
      this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
    }
  }
  //分页
  pagination(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
  }
}



