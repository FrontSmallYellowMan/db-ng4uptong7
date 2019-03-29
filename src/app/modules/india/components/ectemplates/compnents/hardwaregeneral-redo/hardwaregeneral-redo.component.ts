import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { RegisterBarCode } from "../../../../common/barcode";
import { ElectronicContract, AccessItem } from "../../common/entitytype/formdata";
import { ScTemplateService, uploadECAccessories } from "../../../../service/sc-template.service";
import { APIAddress } from "../../../../../../../environments/environment";
import { WindowService } from "../../../../../../core/index";
import { EcContractCommonClass } from "../../common/utilityclass/eccontractcommon";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { SelectSearchBuyerComponent } from "../../common/select-search-buyer/select-search-buyer.component";
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import * as moment from 'moment';
import { ScService } from "../../../../service/sc-service";
import { MyEcTemplateComponent } from "../../common/my-ec-template/my-ec-template.component";
declare var $: any;
declare var window: any;
@Component({
  selector: 'db-hardwaregeneral-redo',
  templateUrl: './hardwaregeneral-redo.component.html',
  styleUrls: ['./hardwaregeneral-redo.component.scss','../../scss/ec-template.component.scss']
})
export class HardwaregeneralRedoComponent implements OnInit {

  constructor(
    private router: Router, 
    private xcModalService: XcModalService,
    private routerInfo: ActivatedRoute, 
    private templateService: ScTemplateService,
    private scService: ScService, 
    private windowService: WindowService) {
    //注册条形码插件
    new RegisterBarCode().extendBarCodeTools();
  }

  loading: boolean = false;
  formData: ElectronicContract = new ElectronicContract();//表单数据
  uploadAccesslUrl = uploadECAccessories;//附件上传地址
  selectDataSource;//下拉框数据源
  localUserInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  ecComTools = new EcContractCommonClass();
  modal: XcModalRef;//模态窗
  saveEcTemplateModal: XcModalRef;//模态窗
  buyerNameInputEnabled = false;//买方名称 文本框是否可编辑
  allSupplierCodeSAP = "";//供应商编号+名称
  selectedSeller = {companycode:"",company:"请选择"};//卖方选中项
  selectedCityItem = {CityCode:"",CityName:"-请选择"};//城市选中项
  selectedDistrictItem = {CityCode:"",CountyName:"-请选择"};//区县选中项
  hasUploadedFiles = [];//已经上传的附件数组
  isSubmit = false;
  payTypePPTotalMoney;//付款条款（4） 合同金额（总价减去预付款）
  payTypePPTotalMoneyUppercase = "";//付款条款（4） 合同金额（总价减去预付款） 大写

  templateID = "";//url参数
  SC_Code = "";//url参数
  isRiskRole = "false";//url参数
  applyTo = "";//url参数
  domain = "";//url参数
  id = "";//url参数
  isView = false;//是否查看页面
  isRisk = false;//是否风险岗

  @ViewChildren(NgModel) inputList;//表单控件
  @ViewChildren("domElement") domElementList;//表单控件
  @ViewChild('form') form: NgForm;
  
  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(SelectSearchBuyerComponent);
    this.saveEcTemplateModal = this.xcModalService.createModal(MyEcTemplateComponent);
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onBuyerModalHide);
    this.saveEcTemplateModal.onHide().subscribe(this.onSaveEcTemplateModalHide);
    this.inItParams();
    this.getECPackageResult();
  }
  
  /** 不同页面入口处理 */
  initPage() {
    if (this.id) {//私藏模板
      this.getTemplateData(this.id);
    } else {
      if (this.SC_Code) {//列表编辑  销售合同新建上一步
        this.getEContract(this.SC_Code);
      }else{
        this.loading = false;
      }
    }
  }
  /**获取url参数 */
  inItParams() {
    /**
     * 页面是否可编辑
     * 新建：模板选择 TemplateID 模板ID ApplyTo 合同类型
     * 新建：我的私藏 TemplateID 模板ID ApplyTo 合同类型 Id 流水号
     * 编辑：附件链接 SC_Code 编号
     * 编辑：上一步   SC_Code 编号
     * 编辑：合同列表 SC_Code 编号
     * 查看：附件链接 IsRiskPost
     */
    this.SC_Code = this.routerInfo.snapshot.queryParams['SC_Code'];
    this.isRiskRole = this.routerInfo.snapshot.queryParams['isRiskRole'];
    this.templateID = this.routerInfo.snapshot.queryParams['TemplateID'];
    this.applyTo = this.routerInfo.snapshot.queryParams['ApplyTo'];
    this.domain = this.routerInfo.snapshot.queryParams['Domain'];
    this.id = this.routerInfo.snapshot.queryParams['ID'];
    if (this.isRiskRole) {
      this.isView = true;
      this.isRiskRole == 'true'? this.isRisk = true : this.isRisk = false;
    }
  }
  /**获取下拉框数据 */
  getECPackageResult(){
    this.loading = true;
    //卖方 票据
    this.templateService.getECPackageResult(this.localUserInfo["YWFWDM"]).subscribe(data => {
      if (data.Result) {
        this.selectDataSource = JSON.parse(data.Data);
        this.selectDataSource["PaymentType"] = this.ecComTools.PaymentService;
        this.selectDataSource["TicketTypeList"].forEach((item,index,arrr) => {
          this.selectDataSource["TicketTypeList"][index]["TT_ID"] = Number(item["TT_ID"]);
        });
        //省市区信息
        this.templateService.getProvinceCityInfo().subscribe(data => {
          if (data.Result) {
            let provinceCityInfo = JSON.parse(data.Data);
            if(provinceCityInfo["province"] && provinceCityInfo["province"].length > 0){
              this.selectDataSource["province"] = provinceCityInfo["province"];//省份
              this.selectDataSource["city"] = provinceCityInfo["city"];//城市
              this.selectDataSource["district"] = provinceCityInfo["district"];//区县
              this.selectDataSource["searchResultByCityCodeDistrict"] = provinceCityInfo["district"];//区县
            }
            this.initPage();
          }
        });
      }
    });
  }
  /**根据sccode获取电子合同信息 */
  getEContract(sccode) {
    this.templateService.getEContractInfo(sccode).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        let resultData = JSON.parse(data.Data);
        this.formData = resultData;
        this.getFormDataCallBack();
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  /** 获取我的私藏模板数据 */
  getTemplateData(id){
    this.templateService.getMyPrivateTemplate(id).subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          let resultData = JSON.parse(data.Data);
          this.formData = resultData;
          this.getFormDataCallBack();
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  /** 根据sccode获取数据或者根据我的私藏模板获取数据后，表单数据处理 */
  getFormDataCallBack(){
    //买方是否可编辑
    if (this.formData.BaseData.BuyerERPCode && this.formData.BaseData.BuyerERPCode != "A") {
      this.buyerNameInputEnabled = true;
    }
    //条形码处理
    if (this.formData.BaseData.EC_Code) {
      $('.ec-template-header-code39').html(this.formData.BaseData.EC_Code);
      this.onGenerateBarCode();
    }else{
      if (this.formData.BaseData.SellerCompanyCode) {
        this.getContractCodeBySellerCode(this.formData.BaseData.SellerCompanyCode);
      }
    }
    //卖方选中项
    if (this.formData.BaseData.SellerCompanyCode) {
      this.selectedSeller.companycode = this.formData.BaseData.SellerCompanyCode;
      this.selectedSeller.company = this.formData.BaseData.SellerName;
    }
    //供应商选中项
    if (this.formData.BaseData.SupplierCodeSAP) {
      this.allSupplierCodeSAP = this.formData.BaseData.SupplierCodeSAP + "-" + this.formData.BaseData.SupplierName;
    }
    //城市 区县选中项
    this.formData.BaseData.SignedCityCode = this.formData.BaseData.SignedCityCode.trim();
    if (this.formData.BaseData.SignedCityCode) {
      this.selectedCityItem.CityCode = this.formData.BaseData.SignedCityCode;
      this.selectedCityItem.CityName = this.formData.BaseData.SignedCityName;
      this.selectDataSource["searchResultByCityCodeDistrict"] = this.selectDataSource["district"].filter(item => {
        return item.CityCode.substring(0, 5) == this.selectedCityItem["CityCode"];
      });
      if (this.formData.BaseData.SignedCounty) {
        this.selectedDistrictItem.CityCode = this.formData.BaseData.SignedCityCode;
        this.selectedDistrictItem.CountyName = this.formData.BaseData.SignedCounty;
      }
    }
    //附件数据处理
    if (this.formData.Accessories && this.formData.Accessories.length > 0) {
      this.formData.Accessories.forEach(item => {
        let hasUploadedFileItem = {name: "", size: 0};
        hasUploadedFileItem.name = item.AccessoryName;
        this.hasUploadedFiles.push(hasUploadedFileItem);
      });
    }
    //付款条款（4）合同金额处理
    if (this.formData.BaseData.TotalMoney) {
      this.payTypePPTotalMoney = this.formData.BaseData.TotalMoney - Number(this.formData.BaseData.PayType_PP_Money);
      this.payTypePPTotalMoneyUppercase = this.ecComTools.DX(this.payTypePPTotalMoney);
    }
  }
  /**选择卖方事件 */
  onSelecteCompany(selectedcompany){
    if (selectedcompany["companycode"]) {
      this.formData.BaseData.SellerName = selectedcompany["company"];
      this.formData.BaseData.SellerCompanyCode = selectedcompany["companycode"];
      this.formData.BaseData.SellerERPCode = selectedcompany["erpcode"];
      this.formData.BaseData.SellerAddress = selectedcompany["address"];
      this.formData.BaseData.SellerTelephone = selectedcompany["tel"];
      this.formData.BaseData.SellerBankName = selectedcompany["bankname"];
      this.formData.BaseData.SellerBankNo = selectedcompany["bankaccount"];
      this.getContractCodeBySellerCode(selectedcompany["companycode"]);
      if (this.formData.BaseData.BuyerName && this.formData.BaseData.SellerCompanyCode) {
        this.getDisputeDealtInfo(this.localUserInfo["FlatCode"], this.formData.BaseData.SellerCompanyCode, this.formData.BaseData.BuyerName);
      }
    }
  }
  /**选择城市事件 */
  onSelecteCity(selectedcity){
    this.formData.BaseData.SignedCityCode = selectedcity["CityCode"];
    this.formData.BaseData.SignedCityName = selectedcity["CityName"];
    this.selectDataSource["searchResultByCityCodeDistrict"] = this.selectDataSource["district"].filter(item => {
      return item.CityCode.substring(0, 5) == selectedcity["CityCode"];
    });
  }
  /**选择区县事件 */
  onSelecteProvince(selecteddistrict){
    this.formData.BaseData.SignedCounty = selecteddistrict["CountyName"];
  }
  /** 选择供应商信息 */
  SupplierCodeSAPVerify(e){
    this.allSupplierCodeSAP = e[1] + "-" + e[0];
    this.formData.BaseData.SupplierCodeSAP = e[1];
    this.formData.BaseData.SupplierName = e[0];
  }
  /** 付款条款 （1）（4）（6） 票据选择 */
  onPayType(event){
    let item = this.selectDataSource["TicketTypeList"].filter(item => {
      return item["TT_ID"] == event;
    });
    if (item && item.length > 0) {
      switch (this.formData.BaseData.PaymentType) {
        case this.selectDataSource.PaymentType[0]['id']:
          this.formData.BaseData.PayType_Ticket_TypeName = item[0]["TT_Name"];
          break;
        case this.selectDataSource.PaymentType[3]['id']:
          this.formData.BaseData.PayType_PP_TicketName = item[0]["TT_Name"];
          break;
        case this.selectDataSource.PaymentType[5]['id']:
          this.formData.BaseData.PayType_OP2_TicketName = item[0]["TT_Name"];
          break;
      
        default:
          break;
      }
    }
  }
  /** 合同金额blur事件 */
  onBlurTotalMoney(){
    if (this.formData.BaseData.TotalMoney) {
      this.formData.BaseData.TotalMoneyUpper = this.ecComTools.DX(this.formData.BaseData.TotalMoney);
    }
  }
  /** 服务期限开始日期选择事件 */
  onServiceStartTimeChange(){
    this.formData.BaseData.ServiceStartTime = moment(this.formData.BaseData.ServiceStartTime).format("YYYY-MM-DD");
  }
  /** 服务期限结束日期选择事件 */
  onServiceEndTimeChange(){
    this.formData.BaseData.ServiceEndTime = moment(this.formData.BaseData.ServiceEndTime).format("YYYY-MM-DD");
  }
  /** 付款条款 （3） 百分比 blur事件*/
  onBlurOPRatio(){
    if (this.formData.BaseData.PayType_OP_Ratio) {
      if(this.formData.BaseData.TotalMoney != undefined && this.formData.BaseData.TotalMoney.toString() != ""){
        //计算金额 TotalMoney * PayType_OP_Ratio  保留两位小数 四舍五入
        let caleResult = this.formData.BaseData.TotalMoney * (parseFloat(this.formData.BaseData.PayType_OP_Ratio) / 100);
        this.formData.BaseData.PayType_OP_Money = caleResult.toFixed(2);
      }else{
        this.formData.BaseData.PayType_OP_Ratio = "";
        this.windowService.alert({ message: "请先填写合同金额", type: "fail" });
      }
    }else{
      this.formData.BaseData.PayType_OP_Money = "";
    }
  }
  /** 付款条款 （4） 百分比 blur事件*/
  onBlurPPRatio(){
    if (this.formData.BaseData.PayType_PP_Ratio) {
      if(this.formData.BaseData.TotalMoney != undefined && this.formData.BaseData.TotalMoney.toString() != ""){
        //计算金额 TotalMoney * PayType_PP_Ratio  保留两位小数 四舍五入
        let caleResult = this.formData.BaseData.TotalMoney * (parseFloat(this.formData.BaseData.PayType_PP_Ratio) / 100);
        this.formData.BaseData.PayType_PP_Money = caleResult.toFixed(2);
      }else{
        this.formData.BaseData.PayType_PP_Ratio = "";
        this.windowService.alert({ message: "请先填写合同金额", type: "fail" });
      }
      //总价减去预付款
      if (this.formData.BaseData.TotalMoney) {
        this.payTypePPTotalMoney = this.formData.BaseData.TotalMoney - Number(this.formData.BaseData.PayType_PP_Money);
        this.payTypePPTotalMoneyUppercase = this.ecComTools.DX(this.payTypePPTotalMoney);;
      }
    }else{
      this.formData.BaseData.PayType_PP_Money = "";
    }
  }
  /** 获取争议解决方式历史信息 */
  getDisputeDealtInfo(flatcode,sellercompanycode,buyername){
    this.templateService.getDisputeDealtInfo({ FlatCode: flatcode, SellerCompanyCode: sellercompanycode, BuyerName: buyername }).subscribe(
        data => {
          if (data.Result && data.Data) {
            let disputeDealtInfo = JSON.parse(data.Data);
            if (disputeDealtInfo) {
              //将结果赋值给表单
              this.formData.BaseData.DisputeDealtType = disputeDealtInfo['DisputeDealtType'];
              this.formData.BaseData.SignedCityCode = disputeDealtInfo['SignedCityCode'];
              this.formData.BaseData.SignedCityName = disputeDealtInfo['SignedCityName'];
              this.formData.BaseData.SignedCounty = disputeDealtInfo['SignedCounty'];
              //初始化城市 区县选中项
              if (disputeDealtInfo['SignedCityCode']) {
                this.selectedCityItem.CityCode = disputeDealtInfo['SignedCityCode'];
                this.selectedCityItem.CityName = disputeDealtInfo['SignedCityName'];
                this.selectedDistrictItem.CityCode = disputeDealtInfo['SignedCityCode'];
                this.selectedDistrictItem.CountyName = disputeDealtInfo['SignedCounty'];
              }
            }else{
              this.formData.BaseData.DisputeDealtType = "";
              this.formData.BaseData.SignedCityCode = "";
              this.formData.BaseData.SignedCityName = "";
              this.formData.BaseData.SignedCounty = "";
            }
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
  }
  /** 合同日期选择事件 */
  onContractTimeChange(){
    this.formData.BaseData.ContractTime = moment(this.formData.BaseData.ContractTime).format("YYYY-MM-DD");
  }

  /** 附件功能 */
    /**附件上传 成功 */
    fileUploadSuccess(event){
      //event = data
      if (event.Result) {
        let data = JSON.parse(event.Data);
        if (data.length > 0) {
          data.forEach(item => {
            let accessItem = new AccessItem();
            accessItem.AccessoryID = item["AccessoryID"];
            accessItem.AccessoryName = item["AccessoryName"];
            accessItem.AccessoryURL = item["AccessoryURL"];
            this.formData.Accessories.push(accessItem);
          });
        }
      }else{
        this.windowService.alert({ message: event.Message, type: "fail" });
      }
    }
    /**删除附件 */
    onDeleteFileItem(event) {
      //event = 删除文件的下标
      this.formData.Accessories.splice(event, 1);
    }
    /**点击单个已经上传的附件 */
    onClickFile(event){
      // event = {item: item, index: i}
      window.open(APIAddress + this.formData.Accessories[event.index].AccessoryURL);
    }
    /**附件下载 */
    downLoadFile(url){
      window.open(APIAddress + url);
    }
  /** 附件功能 */

  /** 按钮组功能 */
    /** 表单验证 */
    formValid(){
      //卖方
      if (!this.formData.BaseData.SellerERPCode) {
        this.windowService.alert({ message: "请选择卖方", type: "fail" });
        return false;
      }
      //供应商
      if (!this.formData.BaseData.SupplierCodeSAP) {
        this.windowService.alert({ message: "请选择厂商", type: "fail" });
        return false;
      }
      //服务起止日期
      if (!this.formData.BaseData.ServiceStartTime || !this.formData.BaseData.ServiceEndTime) {
        this.windowService.alert({ message: "请维护服务起始截止期限", type: "fail" });
        return false;
      }
      //税率
      if (!this.formData.BaseData.Payment_InvoiceTaxRate) {
        this.windowService.alert({ message: "请选择发票税率", type: "fail" });
        return false;
      }
      //付款方式
      if (!this.formData.BaseData.PaymentType) {
        this.windowService.alert({ message: "请选择付款方式", type: "fail" });
        return false;
      }
      //付款条款选择（1）必填项
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[0]['id']) {
        if (!this.formData.BaseData.PayType_Ticket_EffectiveDay || !this.formData.BaseData.PayType_Ticket_Day || !this.formData.BaseData.PayType_Ticket_TypeID) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
      }
      //付款条款选择（2）必填项
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[1]['id']) {
        if (!this.formData.BaseData.PayType_Transfer_Day) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
      }
      //付款条款选择（3）必填项
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[2]['id']) {
        if (!this.formData.BaseData.PayType_OP_SigDay || !this.formData.BaseData.PayType_OP_Day) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
      }
      //付款条款选择（4）必填项
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[3]['id']) {
        if (!this.formData.BaseData.PayType_PP_EffectiveDay || !this.formData.BaseData.PayType_PP_Day || !this.formData.BaseData.PayType_PP_TicketID) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
      }
      //付款条款选择（5）必填项
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[4]['id']) {
        if (!this.formData.BaseData.PayType_Full_Day) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
      }
      //付款条款选择（6）表格数据至少保留一行
      if (this.formData.BaseData.PaymentType == this.selectDataSource.PaymentType[5]['id']) {
        if (!this.formData.BaseData.PayType_OP2_TicketID) {
          this.windowService.alert({ message: "请维护付款条款信息", type: "fail" });
          return false;
        }
        if (this.formData.PaymentDetails && this.formData.PaymentDetails.length == 0) {
          this.windowService.alert({ message: "请维护分期付款信息", type: "fail" });
          return false;
        }
      }
      //合同日期
      if (!this.formData.BaseData.ContractTime) {
        this.windowService.alert({ message: "请维护合同日期", type: "fail" });
        return false;
      }
      return true;
    }
    /** 请求后端保存接口之前 表单数据处理 */
    onSaveBefore(){
      //表单的数据处理
      if (this.SC_Code) {//编辑页面
        this.formData.BaseData.EditITCode = this.localUserInfo["ITCode"];
        this.formData.BaseData.EditName = this.localUserInfo["UserName"];
      }else{//新建页面
        this.formData.BaseData.TemplateID = this.templateID;
        this.formData.BaseData.ContractType = this.applyTo;
        this.formData.BaseData.ContractDomain = this.domain;
        this.formData.BaseData.CreateITCode = this.localUserInfo["ITCode"];
        this.formData.BaseData.CreateName = this.localUserInfo["UserName"];
      }
      //买方erp编号处理
      if (!this.formData.BaseData.BuyerERPCode) {
        this.formData.BaseData.BuyerERPCode = "A";
      }
      //付款条款 第几种
      this.formData.BaseData.PaymentTypeDesc = this.ecComTools.returnTitleByPayType(this.formData.BaseData.TemplateID,this.formData.BaseData.PaymentType);
      //带入销售合同 付款条款描述
      this.formData.BaseData.PaymentTerms = this.ecComTools.returnPayItemByPayType(this.formData.BaseData);
    }
    /**保存 */
    onSave(type){
      this.loading = true;
      this.onSaveBefore();
      //暂存 风险岗暂存 预览
      if (type == "save" || type == "risksave" || type == "preview") {
        this.templateService.saveEContract(this.formData).subscribe(
          data => {
            this.loading = false;
            if (data.Result) {
              let resultData = JSON.parse(data.Data);
              this.onSaveCallBack(type,resultData);
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }else{//下一步
        this.templateService.convertEContract(this.formData).subscribe(
          data => {
            this.loading = false;
            if (data.Result) {
              let resultData = JSON.parse(data.Data);
              this.onSaveCallBack(type,resultData);
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }
    }
    /** 保存后业务处理 */
    onSaveCallBack(type,data){
      switch (type) {
        case "save"://保存
          this.windowService.alert({message:"保存成功",type:"success"}).subscribe(()=>{
              window.close();
          });
          break;
        case "risksave"://风险岗保存
          if (this.scService["returnUrl"]) {
            window.location.href = this.scService["returnUrl"];
          } else {
            this.windowService.alert({ message: "页面跳转失败", type: "fail" });
          }
          break;
        case "next"://下一步
          this.router.navigate(['/india/contract'], { queryParams: { SC_Code: data["SC_Code"] } });
          break;
        case "preview"://预览
          if (data["SC_Code"]) {
            this.formData.BaseData.SC_Code = data["SC_Code"];
          }
          if (data.PDFAccessoryUrl) {
            window.open(data.PDFAccessoryUrl.toString());
          } else {
            this.windowService.alert({ message: "PDF未生成,不可预览!", type: "warn" });
          }
          break;
      }
    }
    /**验证 保存 */
    onSubmit(type) {
      this.isSubmit = true;
      if (this.formValid() && this.form.valid) {//验证通过
        this.onSave(type);
      }else{
        this.windowService.alert({ message: "请将标红必填项填写完整", type: "fail" });
        // for (let i = 0; i < this.inputList.length; i++) {//遍历表单控件
        //   if (this.inputList._results[i].invalid) {//验证未通过
        //     let ele = this.domElementList._results[i];//存储该表单控件元素
        //     if (ele && ele.nativeElement) {
        //       ele.nativeElement.focus();//使该表单控件获取焦点
        //     }
        //     break;
        //   }
        // }
      }
    }
    /**下一步 */
    onNext(){
      this.onSubmit("next");
    }
    /**预览 */
    onPreview(){
      this.onSubmit("preview");
    }
    /** 保存模板 */
    onSaveTemplate(){
      this.showEcTemplateModal();
    }
    /** 查看页面返回按钮 */
    onBack(){
      if (this.scService["returnUrl"]) {
        window.location.href = this.scService["returnUrl"];
      } else {
        this.router.navigate(['/india/contractview'], { queryParams: { SC_Code: this.SC_Code } });
      }
    }
    /**上一步 */
    onPrev(){
      this.windowService.confirm({ message: "将要返回模板选择，当前数据会被删除" }).subscribe({
        next: (v) => {
          if (v) {
            //sc_code是否有值  有值调用删除接口  没值 路由至模板选择
            if (this.SC_Code) {
              this.templateService.DeleteEContract(this.SC_Code).subscribe(
                data => {
                  if (data.Result) {
                    this.router.navigate(['/india/selecttpl']);
                  }else{
                    this.windowService.alert({ message: data.Message, type: "fail" });
                  }
                });
            }else{
              this.router.navigate(['/india/selecttpl']);
            }
          }
        }
      });
    }
  /** 按钮组功能 */

  /** 买方模态窗功能 */
    /** 显示买方模态窗 */
    showBuyerModal(){
      let query = this.formData.BaseData.BuyerName? this.formData.BaseData.BuyerName: "";
      this.modal.show({data:query});
    }
    /** 买方信息模态窗关闭时事件 */
    onBuyerModalHide = data => {
      if(data && data["DetailInfo"]){
        this.formData.BaseData.BuyerERPCode = data["BuyerERPCode"];
        this.formData.BaseData.BuyerName = data["BuyerName"];
        this.formData.BaseData.BuyerBankName = data["DetailInfo"]["Bank"];
        this.formData.BaseData.BuyerBankNo = data["DetailInfo"]["BankAccount"];
        this.formData.BaseData.BuyerTelephone = data["DetailInfo"]["Tel"];
        this.formData.BaseData.BuyerAddress = data["DetailInfo"]["CompanyAddress"];
        this.buyerNameInputEnabled = true;
        if (this.formData.BaseData.BuyerName && this.formData.BaseData.SellerCompanyCode) {
          this.getDisputeDealtInfo(this.localUserInfo["FlatCode"], this.formData.BaseData.SellerCompanyCode, this.formData.BaseData.BuyerName);
        }
      }else{
        if (!this.formData.BaseData.BuyerERPCode) {
          this.formData.BaseData.BuyerERPCode = "A";
          this.buyerNameInputEnabled = false;
        }
      }
    }
  /** 买方模态窗功能 */

  /** 模板保存模态窗功能 */
    /** 显示保存模板模态窗 */
    showEcTemplateModal(){
      this.saveEcTemplateModal.show();
    }
    /** 保存模板模态窗关闭时事件 */
    onSaveEcTemplateModalHide = data => {
      if (data && data.templateName) {
        this.loading = true;
        this.onSaveBefore();
        let newFormData = JSON.parse(JSON.stringify(this.formData));
        newFormData.BaseData.SC_Code = "";
        let body = {
          "Name": data.templateName,
          "Owner": this.localUserInfo["ITCode"],
          "Contents": JSON.stringify(newFormData),
          "TemplateID": newFormData.BaseData.TemplateID,
          "ContractType": newFormData.BaseData.ContractType,
          "ContractDomain": newFormData.BaseData.ContractDomain
        };
        this.templateService.saveTemplate(body).subscribe(
          data => {
            this.loading = false;
            if (data.Result) {
              this.windowService.alert({ message: "模板保存成功", type: "success" });
            } else {
              this.windowService.alert({ message: data.Message, type: "fail" });
            }
          }
        );
      }
    }
  /** 模板保存模态窗功能 */

  /** 条形码功能 */
    /** 获取新的EC_Code 重新生成条形码 */
    getContractCodeBySellerCode(sellerCompanyCode){
      this.loading = true;
      this.templateService.getContractCode(sellerCompanyCode).subscribe(
        data => {
          this.loading = false;
          if (data.Result) {
            this.formData.BaseData.EC_Code = data.Data.replace(/\"/g, "");
            $('.ec-template-header-code39').html(this.formData.BaseData.EC_Code);
            let newBarCode = this.onGenerateBarCode();
            this.formData.BaseData.Barcode = newBarCode.slice(newBarCode.indexOf(',') + 1);
          }
        }
      );
    }
    /** 生成条形码 */
    onGenerateBarCode() {
      let newBarCode = '';
      $('.ec-template-header-code39').barcode({code:'code39'});
      newBarCode = $('.ec-template-header-code39 img').attr("src");
      return newBarCode;
    }
  /** 条形码功能 */
}

