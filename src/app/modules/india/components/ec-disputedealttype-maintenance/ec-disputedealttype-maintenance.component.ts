import { Component, OnInit } from '@angular/core';
import { ScTemplateService } from "../../service/sc-template.service";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from "app/core";
import { Router } from "@angular/router";
import { SelectSearchBuyerComponent } from "../ectemplates/common/select-search-buyer/select-search-buyer.component";
declare var window: any;

@Component({
  selector: 'db-ec-disputedealttype-maintenance',
  templateUrl: './ec-disputedealttype-maintenance.component.html',
  styleUrls: ['./ec-disputedealttype-maintenance.component.scss']
})
export class EcDisputedealttypeMaintenanceComponent implements OnInit {

  constructor(
    private router: Router,
    private xcModalService: XcModalService,
    private templateService: ScTemplateService,
    private windowService: WindowService
  ) { }
  modal: XcModalRef;//模态窗
  loading: boolean = false;
  selectDataSource;//下拉框数据源
  selectedSeller = {companycode:"",company:"请选择"};//卖方选中项
  selectedCityItem = {CityCode:"",CityName:"-请选择"};//城市选中项
  selectedDistrictItem = {CityCode:"",CountyName:"-请选择"};//区县选中项
  localUserInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  formData = {
    FlatCode: "",//平台编号
    SellerCompanyCode: "",//卖方（法人体）公司代码
    BuyerName: "",//买方客户名称
    DisputeDealtType: "",//争议解决方式：01，001
    SignedCityCode: "",//合同签订城市编码
    SignedCityName: "",//城市名称
    SignedCounty: ""//合同签订区(县)
  };
  DisputeDealtTypeArr = [{ "DisputeDealtType": "001", "DisputeDealtName": "本合同签订地" }, { "DisputeDealtType": "01", "DisputeDealtName": "卖方所在地" }];

  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(SelectSearchBuyerComponent);
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onBuyerModalHide);
    this.getECPackageResult();
  }
  /**获取下拉框数据 */
  getECPackageResult(){
    this.loading = true;
    //卖方
    this.templateService.getCompanyData().subscribe(data => {
      if (data.Result) {
        this.selectDataSource = JSON.parse(data.Data);
        //省市区信息
        this.templateService.getProvinceCityInfo().subscribe(data => {
          if (data.Result) {
            //平台
            this.GetDepartmentPlatform();
            let provinceCityInfo = JSON.parse(data.Data);
            if(provinceCityInfo["province"] && provinceCityInfo["province"].length > 0){
              this.selectDataSource["city"] = provinceCityInfo["city"];//城市
              this.selectDataSource["district"] = provinceCityInfo["district"];//区县
              this.selectDataSource["searchResultByCityCodeDistrict"] = provinceCityInfo["district"];//区县
            }
          }
        });
      }
    });
  }

  //获取平台
  GetDepartmentPlatform(){
    this.templateService.GetDepartmentPlatform().subscribe(data => {
      if (data.Result) {
        this.loading = false;
        this.selectDataSource["platformData"] = JSON.parse(data.Data).PlatformList;
      }
    });
  }

  /**选择卖方事件 */
  onSelecteCompany(selectedcompany){
    this.formData.SellerCompanyCode = selectedcompany["companycode"];
  }
  /**选择城市事件 */
  onSelecteCity(selectedcity){
    if(this.formData.SignedCityCode != selectedcity["CityCode"]){
      this.selectedDistrictItem = {CityCode:"",CountyName:"-请选择"};//区县选中项
    }
    this.formData.SignedCityCode = selectedcity["CityCode"];
    this.formData.SignedCityName = selectedcity["CityName"];
    this.selectDataSource["searchResultByCityCodeDistrict"] = this.selectDataSource["district"].filter(item => {
      return item.CityCode.substring(0, 5) == selectedcity["CityCode"];
    });
  }
  /**选择区县事件 */
  onSelecteProvince(selecteddistrict){
    this.formData.SignedCounty = selecteddistrict["CountyName"];
  }
  /** 保存 */
  onSave(){
    if (!this.formData.SellerCompanyCode) {
      this.windowService.alert({ message: "请选择卖方主体", type: "fail" });
      return;
    }
    if (!this.formData.BuyerName) {
      this.windowService.alert({ message: "请选择买方", type: "fail" });
      return;
    }
    if (!this.formData.DisputeDealtType) {
      this.windowService.alert({ message: "请选择争议解决方式", type: "fail" });
      return;
    }
    if (this.formData.DisputeDealtType == "001" && !this.formData.SignedCityCode) {
      this.windowService.alert({ message: "请选择城市", type: "fail" });
      return;
    }
    if (this.formData.DisputeDealtType == "001" && !this.formData.SignedCounty) {
      this.windowService.alert({ message: "请选择区县", type: "fail" });
      return;
    }
    if (!this.formData.FlatCode) {
      this.windowService.alert({ message: "请选择平台", type: "fail" });
      return;
    }
    this.loading = true;
    this.templateService.CreateECDisputeDealt(this.formData).subscribe(data => {
      this.loading = false;
      if (data.Result && data.Data === "true") {
        this.reset();
        this.windowService.alert({ message: "保存成功", type: "success" });
        this.router.navigate(["/india/disputedealttype"]);
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  /** 取消 */
  onCancel(){
    this.router.navigate(["/india/disputedealttype"]);
  }
  /** 重置 */
  reset(){
    this.selectedSeller = {companycode:"",company:"请选择"};//卖方选中项
    this.selectedCityItem = {CityCode:"",CityName:"-请选择"};//城市选中项
    this.selectedDistrictItem = {CityCode:"",CountyName:"-请选择"};//区县选中项
    this.localUserInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
    this.formData = {
      FlatCode: "",//平台编号
      SellerCompanyCode: "",//卖方（法人体）公司代码
      BuyerName: "",//买方客户名称
      DisputeDealtType: "",//争议解决方式：01，001
      SignedCityCode: "",//合同签订城市编码
      SignedCityName: "",//城市名称
      SignedCounty: ""//合同签订区(县)
    };
  }

  /** 买方模态窗功能 */
    /** 显示买方模态窗 */
    showBuyerModal(){
      let query = this.formData.BuyerName? this.formData.BuyerName: "";
      this.modal.show({data:query});
    }
    /** 买方信息模态窗关闭时事件 */
    onBuyerModalHide = data => {
      if(data && data["DetailInfo"]){
        this.formData.BuyerName = data["DetailInfo"]["CompanyName"];
      }
    }
  /** 买方模态窗功能 */

}
