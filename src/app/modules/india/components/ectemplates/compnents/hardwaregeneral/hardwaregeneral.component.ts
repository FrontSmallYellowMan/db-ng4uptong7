import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { EcContractCommonClass, producttpladdress, multipleAddress } from "../../common/utilityclass/eccontractcommon";
import { ElectronicContract, BaseData, Access, SelectInfo, Selected, ProductRelated, SelectItem, BuyerInfo } from '../../common/entitytype/electroniccontract';
import { ScTemplateService } from "../../../../service/sc-template.service";
import { IndiaTools } from "../../../../common/indiatools";
import { RegisterBarCode } from "../../../../common/barcode";
import { ScService } from "../../../../service/sc-service";
import { ProductdetailComponent } from "../../common/productdetail/productdetail.component";
import { WindowService } from "app/core";
import { Pager } from 'app/shared/index';
import { environment, APIAddress } from "environments/environment";
import { PageRefresh } from "../../../../service/pagerefresh.service";
declare var $: any;
declare var window: any;
@Component({
  selector: 'iq-contpl-creat',
  templateUrl: './hardwaregeneral.component.html',
  styleUrls: ['./hardwaregeneral.component.scss'],
  providers: [ ScTemplateService ],
  encapsulation: ViewEncapsulation.None
})
export class HardwareGeneralComponent implements OnInit {
  constructor(
    private routerInfo: ActivatedRoute, 
    private router: Router, 
    private scService: ScService, 
    private scTplService:ScTemplateService,
    private pageRef: PageRefresh,
    private windowService: WindowService) {
    //注册条形码插件
    new RegisterBarCode().extendBarCodeTools();
  }

  @ViewChild('modal') public modal: ModalComponent;
  @ViewChild('productList') public productDetail: ProductdetailComponent;
  @ViewChild('saveTemplate') public saveTemplate: ModalDirective;
  public formData: ElectronicContract;//前端表单数据实体
  public ProductRelated: ProductRelated;//产品相关
  public selectInfo: SelectInfo;//下拉框数据
  public selected: Selected;//下拉选中项数据
  public copyCountyList = [];
  public Payment: Array<any> = new EcContractCommonClass().Payment;
  public Old_SellerCompanyCode: string;//编辑之前的卖方  
  public producttpladdress = producttpladdress;//产品明细模板下载地址
  public multipleAddress = multipleAddress;//多送货地址模板下载地址
  public Barcode: string = "";//二维码
  public isCheck: boolean = false;//是否验证通过
  public isView: boolean = false;//是否查看页面
  public isRiskView: boolean = false;//是否信控角色
  //收货人地址
  public ReceivingProvinceList: Array<any> = [];
  public ReceivingCityList: Array<any> = [];
  public ReceivingDistrictList: Array<any> = [];
  public copyReceivingCityList = null;
  public copyReceivingDistrictList = null;
  //附件上传
  public uploaderProduct: FileUploader;
  public uploaderAddress: FileUploader;
  public upLoadECFile: FileUploader;

  public SC_Code: string;//合同评审编号
  public ItCode: string;//
  public UserName: string;//
  public BizScopeCode: string = "GQ01";//业务范围代码
  public IsRiskPost: string;//是否信控岗
  public TemplateID: string;//
  public ApplyTo: string;//
  public Id: string;//
  public Domain:string;
  public payTypeText: string;
  //付款条款金额
  public TicketTotalMoney: string;
  public PayType_OP_SurplusMoney: string;
  public PayType_OP_MoneyCopy: string;
  public PayType_OP2_MoneyCopy: string;
  public userInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  public currentPayType:any = "";
  public companyDateSource:any  = [];
  contractTime;//合同日期
  ticket;
  isHuaWei: boolean = true;

  ngOnInit() {
    this.ticket=localStorage.getItem('ticket')?localStorage.getItem('ticket'):"";
    this.uploaderProduct = new FileUploader({ url: environment.server+"E_Contract/UploadProductDetails",headers:[{name:"ticket",value:this.ticket}] });
    this.uploaderAddress = new FileUploader({ url: environment.server+"E_Contract/UploadDeliveryAddress",headers:[{name:"ticket",value:this.ticket}] });
    this.upLoadECFile = new FileUploader({ url: environment.server+"E_Contract/UploadECAccessories",headers:[{name:"ticket",value:this.ticket}] });
    this.inItParams();
    this.onInitData();
    this.scTplService.CheckBU(this.userInfo["YWFWDM"]).subscribe(data => {
      if (data.Result) {
        this.isHuaWei = data.Data;
      }
    });
  }

  //获取url参数
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
    let userInfo = this.userInfo;
    this.SC_Code = this.routerInfo.snapshot.queryParams['SC_Code'];
    if (userInfo) {
      this.ItCode = userInfo.ITCode;
      this.UserName = userInfo.UserName;
      if(userInfo.YWFWDM){
        this.BizScopeCode = userInfo.YWFWDM;
      }else{
        this.BizScopeCode = "GQ01";
      }
    } else {
      // 未登录 跳转到登录页面
      this.router.navigate(['/login']);
      // this.router.navigate(['/login'], { queryParams: { returnUrl: this.state.url }});
    }
    this.IsRiskPost = this.routerInfo.snapshot.queryParams['isRiskRole'];
    this.TemplateID = this.routerInfo.snapshot.queryParams['TemplateID'];
    if(!this.TemplateID){
      this.TemplateID = null;
    }
    this.ApplyTo = this.routerInfo.snapshot.queryParams['ApplyTo'];
    if(!this.ApplyTo){
      this.ApplyTo = null;
    }
    this.Domain = this.routerInfo.snapshot.queryParams['Domain'];
    this.Id = this.routerInfo.snapshot.queryParams['ID'];
    if (this.IsRiskPost) {
      this.isView = true;
      this.IsRiskPost == 'true'? this.isRiskView = true : this.isRiskView = false;
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
        null, null, null, null, null, null, null, null, null,
        this.TemplateID, this.ApplyTo, null, null, this.Domain,null
      ),
      [], null, []
    );

    this.ProductRelated = new ProductRelated(null, null, null, null, 0, null);
    this.selectInfo = new SelectInfo(
      [], [], [], [], this.Payment, [], [], []
    );

    this.selected = new Selected(
      [], [{ id: 'Ticket', text: '(1)票据方式一次性付清' }], [], [], [], [], [], [], [], []
    );

    this.onGetSelectinfo();
    this.initPage();
  }
  
  //不同页面入口 处理
  initPage() {
    if (this.Id) {//私藏模板
      this.initTemplateData();
    } else {
      if (this.SC_Code) {//列表编辑  销售合同新建上一步
        this.getEContractInfo();
      } else {//新建
        $('.code39').html("条形码区域");
        this.formData.BaseData.PaymentType = 'Ticket';
      }
    }
  }

  //获取下拉框数据
  onGetSelectinfo() {
    //卖方和票据信息
    this.scTplService.getECPackageResult(this.BizScopeCode).subscribe(data => {
      if (data.Result) {
        let dt = JSON.parse(data.Data);
        this.getECPackageResultCallBack(dt);
      } else {
        this.windowService.alert({ message: "获取下拉框数据失败！", type: "fail" });
      }
    });
    //省市区信息
    this.scTplService.getProvinceCityInfo().subscribe(data => {
      if (data.Result || !data.Message) {
        let dt = JSON.parse(data.Data);
        this.getProvinceCityInfoCallBack(dt);
      } else {
        this.windowService.alert({ message: "获取下拉框数据失败！", type: "fail" });
      }
    });
  }

  getECPackageResultCallBack(dt){
    let data = dt;
    //处理下拉框数据 [{id:"", text:""}]
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let element = data[key];
        switch (key) {
          case 'CompanyList':
            this.companyDateSource = element;
            this.selectInfo[key] = this.onTransSelectInfos(element, 'companycode', 'company');
            break;
          case 'TicketTypeList':
            this.selectInfo[key] = this.onTransSelectInfos(element, 'TT_ID', 'TT_Name');
            break;
        }
      }
    }
  }
  getProvinceCityInfoCallBack(dt){
    let data = dt;
    //处理下拉框数据 [{id:"", text:""}]
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
            this.copyReceivingDistrictList = this.onTransSelectInfos(element, 'CityCode', 'CountyName');
            this.selectInfo["ReceivingDistrictList"] = [];

            this.copyCountyList = this.onTransSelectInfos(element, 'CityCode', 'CountyName');
            this.selectInfo["CountyList"] = [];
            break;
        }
      }
    }
  }

  //获取电子合同信息 SC_Code
  getEContractInfo() {
    this.scTplService.getEContractInfo(this.SC_Code).subscribe(data => {
      if (data.Result) {
        this.initFormHandle(data);
      } else {
        this.windowService.alert({ message: "获取电子合同信息失败！", type: "fail" });
      }
    });
  }
  //获取电子合同信息 私藏模板ID
  initTemplateData(){
    //调用我的私藏模板数据  参数： id
    this.scTplService.getMyPrivateTemplate(this.Id).subscribe(
      data => {
        if(data.Result){
          this.initFormHandle(data);
        }else{
          this.windowService.alert({ message: "获取电子合同信息失败！", type: "fail" });
        }
      }
    );
  }

  //页面初始化  业务处理
  initFormHandle(data) {
    let formData = JSON.parse(data.Data) as ElectronicContract;
    this.formData = formData;
    if (formData.BaseData.EC_Code) {
      $('.code39').html(formData.BaseData.EC_Code);
      this.onGenerateBarCode();
    }else{
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
    if (!this.formData.BaseData.SellerCompanyCode) {
      this.selected.Seller = item;
    } else {
      this.selected.Seller = [{ id: this.formData.BaseData.SellerCompanyCode, text: this.formData.BaseData.SellerName }];
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
    }
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
        item["AccessoryURL"] = APIAddress.concat(item["AccessoryURL"]);
      });
    }

    //收获信息 多送货地址
    if (this.formData.BaseData.DeliveryAddressType == 2) {
      if (this.formData.MultiDeliveryAddress) {
        this.formData.MultiDeliveryAddress["AccessoryURL"] =
          APIAddress.concat(this.formData.MultiDeliveryAddress["AccessoryURL"]);
      }
    }

    this.payTypeShowMoney(this.formData.BaseData.PaymentType);

    //相关服务
    if (!this.isView && this.formData.BaseData.RelatedService) {
      this.onTextareaInput(this.formData.BaseData.RelatedService);
    }
    //合同日期处理
    if (this.formData.BaseData.ContractTime) {
      this.onGetDate(this.formData.BaseData.ContractTime);
    }else{
      let date = new Date();
      this.formData.BaseData.ContractTime = date.toString();
    }

    this.currentPayType = this.formData.BaseData.PaymentType;

    this.initDisputeDealtType();
  }

  /** 买方功能 begin */
  public pagerData = new Pager();//
  public BuyerInfo: BuyerInfo[];//买方信息 totalItems
  public currentPageItems: BuyerInfo[];//当前页需要显示的数据
  public totalItems: number = 0;//总共多少项数据
  public currentPage: number = 1;//当前页
  public pagesize: number = 10;//每页显示多少行
  open() {
    if (this.formData.BaseData.BuyerName) {
      this.getBuyerList();
    }
    this.modal.open();
  }
  close() {
    this.currentPageItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.modal.close();
  }
  //获取买方列表
  getBuyerList() {
    let buyerName = this.formData.BaseData.BuyerName;
    if (buyerName) {
      this.scTplService.getBuyerInfoByName(buyerName).subscribe(
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
        });
    }
  }
  //分页
  onChangePage(event) {
    this.pagesize = event.pageSize;
    this.currentPage = event.pageNo;
    if (this.BuyerInfo && this.BuyerInfo.length > 0) {
      this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
    }
  }
  //分页逻辑
  pagination(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
  }
  //列表选择买方
  onSelectedBuyer(item: BuyerInfo) {
    this.formData.BaseData.BuyerName = item.NAME;
    this.formData.BaseData.BuyerERPCode = item.KUNNR;
    this.modal.close();
    //设置买方名称 不可编辑
    $('#buyerName')[0].setAttribute('disabled', 'disabled');
    //检查争议解决方式
    this.initDisputeDealtType();
    //获取买方信息
    this.getBuyerInfoByerpCode(item.KUNNR);
  }
  //获取买方详情信息
  getBuyerInfoByerpCode(erpCode){
    if (erpCode && erpCode != "A") {
      this.scTplService.getBuyerInfoByErpCode(erpCode).subscribe(
        data => {
          if (data.Result) {
            let buyerInfo = JSON.parse(data.Data);
            this.formData.BaseData.BuyerAddress = buyerInfo["CompanyAddress"];
            this.formData.BaseData.BuyerTelephone = buyerInfo["Tel"];
            this.formData.BaseData.BuyerBankName = buyerInfo["Bank"];
            this.formData.BaseData.BuyerBankNo = buyerInfo["BankAccount"];
          }
        });
    }
  }
  //买方名称 input事件
  onInputBuyerName(){
    this.formData.BaseData.BuyerERPCode = "A";
    this.initDisputeDealtType();
  }

  /** 买方功能 end */

  /** 模板保存功能 begin */
  //模板名称
  public templateName: string = "";
  public templateNameIsVali: boolean = false;
  //模板保存
  onClickShowTpl() {
    //保存模板弹出框，输入模板名称，必填，确定后保存
    this.saveTemplate.show();
  }
  //保存模板  确定
  onClickSaveBtn() {
    if (!this.templateName) {
      this.templateNameIsVali = true;
    } else {
      this.onSaveHandle();
      let temp = this.formData.BaseData.SC_Code;
      this.formData.BaseData.SC_Code = null;
      let body = {
        "Name": this.templateName,
        "Owner": !this.ItCode ? null : this.ItCode,
        "Contents": JSON.stringify(this.formData),
        "TemplateID": !this.formData.BaseData.TemplateID ? null : this.formData.BaseData.TemplateID,
        "ContractType": !this.formData.BaseData.ContractType ? null : this.formData.BaseData.ContractType,
        "ContractDomain": this.formData.BaseData.ContractDomain
      };
      this.scTplService.saveTemplate(body).subscribe(
        data => {
          if (data.Result) {
            this.formData.BaseData.SC_Code = temp;
            this.saveTemplate.hide();
            this.windowService.alert({ message: "模板保存成功", type: "success" });
          } else {
            this.saveTemplate.hide();
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }, error => {
          console.log(error);
        }
      );
    }
  }
  inputTemplateName() {
    if (this.templateName) {
      this.templateNameIsVali = false;
    }
  }
  /** 模板保存功能 end */

  /** 按钮操作事件 start */

  //上一步
  onClickPrev(){
    this.windowService.confirm({ message: "将要返回模板选择，当前数据会被删除" }).subscribe({
      next: (v) => {
        if (v) {
          this.onClickConfirm();
        }
      }
    });
  }
  // 上一步 确认事件
  onClickConfirm(){
    //sc_code是否有值  有值调用删除接口  没值 路由至模板选择
    if (this.SC_Code) {
      this.scTplService.DeleteEContract(this.SC_Code).subscribe(
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
  //下一步
  onClickNext(){
    this.onSaveHandle();
    this.oncheckInfo();
    if (this.isCheck) {
      if (this.isHuaWei) {//PU HI HT 三条产品线需要调用后台接口验证产品明细中 单价与备注是否匹配
        this.scTplService.CheckTheNotice(this.formData.ProductDetails).subscribe(data => {
          if (data.Result) {
            let CheckTheNoticeValidMessage = "相同备注应对应相同单价：备注";
            let resultData = JSON.parse(data.Data);
            if(resultData && resultData.length > 0){
              resultData.forEach((item,index,arr)=>{
                CheckTheNoticeValidMessage += item["Remark"];
                if (index != (resultData.length -1)) {
                  CheckTheNoticeValidMessage += "、";
                }
              });
              CheckTheNoticeValidMessage += "对应了不同的单价,请修改";
              this.windowService.alert({ message: CheckTheNoticeValidMessage, type: "fail" }, {autoClose: false, closeTime: null});
            }else{
              this.saveScTemplateDataBefore();
            }
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
      }else{
        this.saveScTemplateDataBefore();
      }
    }
  }
  saveScTemplateDataBefore(){
      if (this.formData.BaseData.SellerCompanyCode) {
        let sellerCompanyCode = this.formData.BaseData.SellerCompanyCode;
        if (this.Old_SellerCompanyCode == this.formData.BaseData.SellerCompanyCode && this.formData.BaseData.Barcode) {
          this.saveScTemplateData();
        }else{
          this.scTplService.getContractCode(sellerCompanyCode).subscribe(
          data => {
            if (data.Result) {
              this.formData.BaseData.EC_Code = data.Data.replace(/\"/g, "");
              $('.code39').html(this.formData.BaseData.EC_Code);
              this.Barcode = this.onGenerateBarCode();
              this.formData.BaseData.Barcode = this.Barcode.slice(this.Barcode.indexOf(',') + 1);
            }
          }
          , error => { console.log(error);}, () => { 
            this.saveScTemplateData();
          });
        }
      }
  }
  saveScTemplateData(){
    this.scTplService.convertEContract(this.formData).subscribe(
      data => {
        if (data.Result) {
          let code;
          let tempData = JSON.parse(data.Data);
          if(tempData){
            code = tempData["SC_Code"];
          }
          if (code) {
            this.router.navigate(['/india/contract'], { queryParams: { SC_Code: code } });
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
      , error => { console.log(error); }
    );
  }
  //暂存 预览
  onClickSaveTemp(type){
    this.onSaveHandle();
    if (type == "risksave") {
      this.oncheckInfo()
      if (!this.isCheck) {
        return;
      }
    }
    this.scTplService.saveEContract(this.formData).subscribe(
      data => {
        let isShowMsg = true;
        if (data.Result) {
          if(data.Data != null){
            let temp = JSON.parse(data.Data);
            switch (type) {
              case "save"://保存
                if (temp["SC_Code"]) {
                  this.formData.BaseData.SC_Code = temp["SC_Code"];
                }
                this.windowService.confirm({ message: "保存成功,是否返回列表" }).subscribe({
                  next: (v) => {
                    this.pageRef.setPageNeedRef();//设置列表页面刷新
                    if (v) {
                      this.router.navigate(['/india']);
                    }
                  }
                });
                // this.windowService.alert({ message: "保存成功", type: "success" });
                break;
              case "risksave"://风险岗保存
                if (this.scService["returnUrl"]) {
                  window.location.href = this.scService["returnUrl"];
                } else {
                  this.windowService.alert({ message: "页面跳转失败", type: "fail" });
                }
                break;
              case "view"://预览
                if (temp["SC_Code"]) {
                  this.formData.BaseData.SC_Code = temp["SC_Code"];
                }
                if (temp.PDFAccessoryUrl) {
                  isShowMsg = false;
                  window.open(temp.PDFAccessoryUrl.toString());
                } else {
                  this.windowService.alert({ message: "PDF未生成,不可预览!", type: "warn" });
                }
                break;
            }
          }
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  //返回
  back(){
    if (this.scService["returnUrl"]) {
      window.location.href = this.scService["returnUrl"];
    } else {
      this.router.navigate(['/india/contractview'], { queryParams: { SC_Code: this.SC_Code } });
    }
  }

  /** 按钮操作事件 end */

  //争议解决方式
  onToggleDispute(value) {
    this.formData.BaseData.DisputeDealtType = String(value);
  }
  //输入付款方式 比例
  onInputProportion(event, attr, val: string) {
    if (event.target.value > 100) {
      event.target.value = '';
      this.windowService.alert({ message: "预付款百分比不能大于100%", type: "warn" });
    }

    if (event.target.value != '' && !this.onCheckByPattern_FloatNew(event.target.value)) {
      event.target.value = '';
      this.windowService.alert({ message: "输入非法", type: "warn" });
    }

    let temp = this.ProductRelated.TotalMoney * (Number(event.target.value) / 100);
    this.formData.BaseData[attr] = this.deleteFloatNumberLatZero(String(temp.toFixed(2)));

    this.payTypeShowMoney(val);
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

  //付款方式 金额是否可编辑
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
      event.target.value = '';
      moneyInputFlag = false;
      this.windowService.alert({ message: "输入非法,只能为数字且小数点后最多两位", type: "warn" });
    }

    if (val > this.ProductRelated.TotalMoney) {
      moneyInputFlag = false;
      event.target.value = '';
      this.windowService.alert({ message: "预付金额大于总计金额", type: "warn" });
    } else {
      this.formData.BaseData.PayType_OP_Ratio = null;
      this.formData.BaseData.PayType_PP_Ratio = null;
      this.formData.BaseData.PayType_OP2_Ratio = null;
    }
    if (this.onCheckByPattern_NumberNoZeroStart(val)) {
      moneyInputFlag = false;
      event.target.value = '';
      this.windowService.alert({ message: "正整数开头不可以为0", type: "warn" });
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

  //输入值 长度验证
  onSelectMaxLen(event, maxLen: number) {
    let val = event.target.value.toString();
    if (val.length > maxLen) {
      event.target.value = "";
      this.windowService.alert({ message: "输入字数不得大于" + maxLen, type: "warn" });
    }
  }

  //处理下拉框数据
  onTransSelectInfos(arr: Array<any>, id, text) {
    let newArr = [];
    arr.map(function (item) {
      let newItem = {};
      newItem['id'] = item[id];
      newItem['text'] = item[text];
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

  //争议解决方式  城市 区县联动
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

  //收货地址 省份 城市联动
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

  //收货地址 城市 市区联动
  onSelectReceivingCity(value) {
    let newArray = [];
    this.copyReceivingDistrictList.forEach(function (element, index, array) {
      if (element.id.substring(0, 5) === value.id) {
        let item = JSON.parse(JSON.stringify(element));
        item.id = String(index);
        newArray.push(item);
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
    if (value) {
      this.currentPayType = value;
    }
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

  //选择卖方信息 业务处理
  onSelectSeller(value) {
    if (value) {
      let sellerInfo = null;
      this.companyDateSource.map((item) => {
        if (item['companycode'] == value['id']) {
          sellerInfo = item;
        }
      });
      if (sellerInfo) {
        this.formData.BaseData.SellerCompanyCode = sellerInfo["companycode"];
        this.formData.BaseData.SellerERPCode = sellerInfo["erpcode"];
        this.formData.BaseData.SellerName = sellerInfo["company"];
        this.formData.BaseData.SellerAddress = sellerInfo["address"];
        this.formData.BaseData.SellerTelephone = sellerInfo["tel"];
        this.formData.BaseData.SellerBankName = sellerInfo["bankname"];
        this.formData.BaseData.SellerBankNo = sellerInfo["bankaccount"];
      }
      if (this.formData.BaseData.SellerCompanyCode) {
        this.initDisputeDealtType();
      }
    }
  }

  //生成条形码
  onGenerateBarCode() {
    let newBarCode = '';
    $('.code39').barcode({code:'code39'});
    newBarCode = $('.code39 img').attr("src");
    return newBarCode;
  }

  //必填项验证
  oncheckInfo() {
    //风险岗 争议解决方式必填验证
    if (this.isRiskView) {
      if (!this.formData.BaseData.DisputeDealtType) {
        this.windowService.alert({ message: "请选择争议解决方式！", type: "warn" });
        this.isCheck = false;
        return;
      } else if (this.formData.BaseData.DisputeDealtType == "001" &&
        (!this.formData.BaseData.SignedCityName || !this.formData.BaseData.SignedCounty)) {
        this.windowService.alert({ message: "请选择市区信息！", type: "warn" });
        this.isCheck = false;
        return;
      }
    }
    if (!this.formData.BaseData.SellerName) {
      this.windowService.alert({ message: "请选择卖方信息！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.BuyerName) {
      this.windowService.alert({ message: "请输入买方名称！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.Brand) {
      this.windowService.alert({ message: "请输入品牌信息！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.Product) {
      this.windowService.alert({ message: "请输入产品信息！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.ProductDetails.length) {
      this.windowService.alert({ message: "请维护产品明细！", type: "warn" });
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
        this.windowService.alert({ message: "请填写收货信息！", type: "warn" });
        this.isCheck = false;
        return;
      }
    } else if(this.formData.BaseData.DeliveryAddressType == 2) {
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
        this.windowService.alert({ message: "请上传多送货地址附件！", type: "warn" });
        this.isCheck = false;
        return;
      }
    }
    if (!this.formData.BaseData.DeliveryTime) {
      this.windowService.alert({ message: "请填写发交货时间！", type: "warn" });
      this.isCheck = false;
      return;
    }

    switch (this.formData.BaseData.PaymentType) {
      case 'Ticket':
        let temp1 = this.formData.BaseData.PayType_Ticket_Day;
        let temp2 = this.formData.BaseData.PayType_Ticket_TypeID;
        if (!temp1 || !temp2 || !temp1.toString() || !temp2.toString()) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      case 'Transfer':
        let temp = this.formData.BaseData.PayType_Transfer_Day;
        if (!temp || !String(temp)) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      case 'Once-Period':
        if (!this.formData.BaseData.PayType_OP_Money ||
          !this.formData.BaseData.PayType_OP_Day || !this.formData.BaseData.PayType_OP_TicketID ||
          !(this.formData.BaseData.PayType_OP_Money)
          || !this.formData.BaseData.PayType_OP_Day || !this.formData.BaseData.PayType_OP_TicketID) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      case 'Period-Period':
        if (!this.formData.BaseData.PayType_PP_Money ||
          !this.formData.BaseData.PayType_PP_Day || !this.formData.BaseData.PayType_PP_TicketID ||
          !(this.formData.BaseData.PayType_PP_Money)
          || !this.formData.BaseData.PayType_PP_Day || !this.formData.BaseData.PayType_PP_TicketID) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      case 'Full':
        if (!this.formData.BaseData.PayType_Full_Day || !this.formData.BaseData.PayType_Full_Day) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      case 'Once-Period2':
        if (!this.formData.BaseData.PayType_OP2_SendDay || !this.formData.BaseData.PayType_OP2_Money
          || !this.formData.BaseData.PayType_OP2_SignDay) {
          this.windowService.alert({ message: "请维护付款信息！", type: "warn" });
          this.isCheck = false;
          return;
        }
        break;
      default:
        if (!this.formData.BaseData.PayType_Customize || !this.formData.BaseData.PayType_Customize) {
          this.windowService.alert({ message: "请填写自定义条款！", type: "warn" });
          this.isCheck = false;
          return;
        }
    }
    if (!this.formData.BaseData.BuyerAddress || !this.formData.BaseData.BuyerTelephone
      || !this.formData.BaseData.BuyerBankName || !this.formData.BaseData.BuyerBankNo) {
      this.windowService.alert({ message: "请填写买方相关信息！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.SellerTelephone) {
      this.windowService.alert({ message: "请填写卖方电话！", type: "warn" });
      this.isCheck = false;
      return;
    }
    if (!this.formData.BaseData.ContractTime) {
      this.windowService.alert({ message: "请选择合同日期！", type: "warn" });
      this.isCheck = false;
      return;
    } else {
      this.isCheck = true;
    }
  }

  //保存时处理
  onSaveHandle() {
    let baseData = this.formData.BaseData;
    let selected = this.selected;
    this.onHandleSelect(selected);
    //买方erp编号处理
    if (!baseData.BuyerERPCode) {
      baseData.BuyerERPCode = "A";
    }
    //下拉框
    if (selected.PaymentType.length == 0) {
      selected.PaymentType.push({ id: 'Ticket', text: '(1)票据方式一次性付清' });
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
      this.formData.MultiDeliveryAddress.AccessoryURL = mulAddressUrl.replace(APIAddress, '');
    }

    //申请人 修改人信息
    if (!this.formData.BaseData.EC_Code) {
      this.formData.BaseData.CreateITCode = this.ItCode;
      this.formData.BaseData.CreateName = this.UserName;
    } else {
      this.formData.BaseData.EditITCode = this.ItCode;
      this.formData.BaseData.EditName = this.UserName;
    }
    this.paymentType(this.formData.BaseData.PaymentType);
    
    let date = new Date();
    if (this.formData.BaseData.ContractTime) {
      date = new Date(this.formData.BaseData.ContractTime);
    }
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    if(month.length == 1) month = "0" + month;
    let day = (date.getDate()).toString();
    if(day.length == 1) day = "0" + day;
    this.formData.BaseData.ContractTime = year + "-" + month + "-" + day;
  }

  //付款条款 保存处理
  paymentType(key) {
    let utilityclass = new EcContractCommonClass();
    let data = this.formData.BaseData;
    this.formData.BaseData.PaymentTypeDesc = utilityclass.returnTitleByPayType(data.TemplateID,data.PaymentType);
    switch (key) {
      case 'Ticket':
        this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data,this.TicketTotalMoney);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data,this.PayType_OP_SurplusMoney);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PaymentTerms = utilityclass.returnPayItemByPayType(data, this.PayType_OP2_MoneyCopy);
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
        this.formData.BaseData.PaymentTerms = this.formData.BaseData.PayType_Customize;
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

  //保存时 下拉框数据处理
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

  //业务方法 争议解决方式初始化
  initDisputeDealtType(){
    let indiaTools = new IndiaTools();
    let platCode = indiaTools.plateNameTransCode(this.userInfo.FlatName);
    let sellerCompanyCode = this.formData.BaseData.SellerCompanyCode;
    let buyerName = this.formData.BaseData.BuyerName;
    if (platCode && sellerCompanyCode && buyerName) {
      this.getDisputeDealtInfo(platCode, sellerCompanyCode, buyerName, this.disputeDealtCallBack);
    }
  }

  //获取争议解决方式信息
  getDisputeDealtInfo(FlatCode, SellerCompanyCode, BuyerName, disputeDealtCallBack) {
    let disputeDealtType = "";
    if (FlatCode && SellerCompanyCode && BuyerName) {
      this.scTplService.getDisputeDealtInfo({ FlatCode: FlatCode, SellerCompanyCode: SellerCompanyCode, BuyerName: BuyerName }).subscribe(
        data => {
          if (data.Result && data.Data) {
            if (typeof disputeDealtCallBack === 'function') {
              disputeDealtCallBack(this, data.Data);
            }
          } else if(!data.Result) {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        }
      );
    }
    return disputeDealtType;
  }
  //争议解决方式业务处理
  disputeDealtCallBack(context, disputeDealtType){
    let _that = context || this;
    if (!disputeDealtType || disputeDealtType == "null") {
      return;
    }
    let disputeDealtInfo = JSON.parse(disputeDealtType);
    let item: SelectItem[] = [new SelectItem('0', '请选择')];
    if (!disputeDealtInfo.SignedCityName) {
      _that.selected.City = item;
    } else {
      _that.selected.City = [{ id: disputeDealtInfo.SignedCityCode, text: disputeDealtInfo.SignedCityName }];
    }
    if (!disputeDealtInfo.SignedCounty) {
      _that.selected.County = item;
    } else {
      _that.selected.County =
        [{ id: disputeDealtInfo.SignedCityCode, text: disputeDealtInfo.SignedCounty }];
    }
    _that.formData.BaseData.DisputeDealtType = disputeDealtInfo['DisputeDealtType'];
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
                this.formData.MultiDeliveryAddress = new Access(this.formData.MultiDeliveryAddress.AccessoryID, this.formData.MultiDeliveryAddress.AccessoryName, APIAddress + this.formData.MultiDeliveryAddress.AccessoryURL);
                // this.windowService.alert({ message: "多送货地址上传成功", type: "success" });
              } else {
                this.formData.MultiDeliveryAddress = null;
                this.windowService.alert({ message: "多送货地址上传失败", type: "fail" });
              }
              uploader.queue[uploader.queue.length - 1].isUploaded = false;
            }
          });
        } else {
          this.windowService.alert({ message: "文件上传不能大于50M", type: "fail" });
        }
      } else {
        this.windowService.alert({ message: "文件不能为模板外的其他格式", type: "fail" });
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
        this.windowService.alert({ message: "文件上传不能大于50M", type: "fail" });
      }
    }
    uploader.onCompleteItem = ((item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      if (status === 200 && data.Result) {
        let access = JSON.parse(data.Data);
        this.formData.Accessories.push(new Access(access[0].AccessoryID, access[0].AccessoryName, APIAddress + access[0].AccessoryURL))
        // this.windowService.alert({ message: "上传成功", type: "success" });
      } else {
        this.windowService.alert({ message: "上传失败", type: "fail" });
      }
    });
  }
  //产品明细 批量上传
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
                  // this.windowService.alert({ message: "产品明细上传成功", type: "success" });
                } else {
                  let message = "上传成功，第" + errorByProDetailFileIndex.substring(0, errorByProDetailFileIndex.length - 1) + '行的数据单价*数量不等于总价';
                  this.windowService.alert({ message: message, type: "success" });
                }
                //选中默认的付款方式
                this.payTypeShowMoney(!this.formData.BaseData.PaymentType ? this.Payment.find(a => a.text == '1').id : this.formData.BaseData.PaymentType);
              } else {
                this.windowService.alert({ message: "产品明细上传失败", type: "fail" });
              }
            }
          });
          if (this.uploaderProduct.queue.length) {
            this.uploaderProduct.queue[this.uploaderProduct.queue.length - 1].withCredentials = false;
            this.uploaderProduct.queue[this.uploaderProduct.queue.length - 1].upload();
          }
        } else {
          this.windowService.alert({ message: "文件上传不能大于50M", type: "fail" });
        }
      } else {
        this.windowService.alert({ message: "文件不能为模板外的其他格式", type: "fail" });
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
  onGetDate(dt) {
    this.contractTime = this.formatDate(dt);
  }
  formatDate(dt) {
    if (!dt) {
      return "";
    }
    let tempdt = new Date(dt);
    let contractDay: string = "";
    let year = tempdt.getFullYear();
    let month = tempdt.getMonth() + 1;
    let day = tempdt.getDate();
    return contractDay = year + "年" + month + "月" + day + "日";
  }

  //相关服务  换行处理
  onTextareaInput(str){
    let autowrap = $("#relatedservicetxt");
    let relatedservicediv = $("#relatedservicediv");
    if (str) {
      autowrap.height(relatedservicediv.html(str).height());
    }else{
      autowrap.height(18);
    }
  }

  //删除多送货地址附件
  onRemoveMultiAddressFile(){
    this.formData.MultiDeliveryAddress = null;
  }

  onCheckTickedDay() {
    if (this.formData.BaseData.PayType_Ticket_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Ticket_Day)) {
      this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
      this.formData.BaseData.PayType_Ticket_Day = "";
    }
  }
  onCheckOpDay() {
    if (this.formData.BaseData.PayType_OP_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP_Day)) {
      this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
      this.formData.BaseData.PayType_OP_Day = "";
    }
  }
  onCheckPpDay() {
    if (this.formData.BaseData.PayType_PP_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_PP_Day)) {
      this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
      this.formData.BaseData.PayType_PP_Day = "";
    }
  }
  onCheckTransferDay() {
    if (this.formData.BaseData.PayType_Transfer_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Transfer_Day)) {
      this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
      this.formData.BaseData.PayType_Transfer_Day = "";
    }
  }
  onCheckFullDay() {
    if (this.formData.BaseData.PayType_Full_Day && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_Full_Day)) {
      this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
      this.formData.BaseData.PayType_Full_Day = "";
    }
  }

  onCheckPayTypeOp2Date(inputDataType: string) {
    let strCheckPayTypeOp2 = inputDataType;
    switch (strCheckPayTypeOp2) {
      case 'PayType_OP2_SignDay':
        if (this.formData.BaseData.PayType_OP2_SignDay && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP2_SignDay)) {
          this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
          this.formData.BaseData.PayType_OP2_SignDay = "";
        }
        break;
      case 'PayType_OP2_Ratio':
        if (this.formData.BaseData.PayType_OP2_Ratio && this.onCheckByPattern_NumberNoZeroStart(this.formData.BaseData.PayType_OP2_Ratio)) {
          this.windowService.alert({ message: "请输入数字！", type: "warn" });
          this.formData.BaseData.PayType_OP2_Ratio = "";
        }
        break;
      case 'PayType_OP2_SendDay':
        if (this.formData.BaseData.PayType_OP2_SendDay && !this.onCheckByPattern_Number3(this.formData.BaseData.PayType_OP2_SendDay)) {
          this.windowService.alert({ message: "请输入合法数字，位数不能超过3位", type: "warn" });
          this.formData.BaseData.PayType_OP2_SendDay = "";
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

  onCheckByPattern_Float(value) {
    return /\d|\d\.\d{0,2}$/.test(value);
  }

  //最大三位正整数验证
  onCheckByPattern_Number3(value) {
    return /^[1-9][0-9]{0,2}$/.test(value);
  }

  onCheckByPattern_FloatNew(value) {
    return /^^[0-9]+(\.[0-9]{0,2})?$$/.test(value);
  }
  
  //付款方式下拉框数据过滤
  onInitPaymentText(value) {
    let text = '';
    switch (value) {
      case 'Ticket':
        text = '(1)票据方式一次性付清';
        break;
      case 'Transfer':
        text = '(2)转账/电汇方式一次性付清';
        break;
      case 'Once-Period':
        text = '(3)一次性交货,分批付款';
        break;
      case 'Period-Period':
        text = '(4)分期交货,分期付款';
        break;
      case 'Full':
        text = '(5)全款到账发货';
        break;
      case 'Once-Period2':
        text = '(6)一次性交货,分批付款';
        break;
      default:
        text = '(7)其他';
    }
    return text;
  }
  
}



