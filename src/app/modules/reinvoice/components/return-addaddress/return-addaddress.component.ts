import { Component, OnInit, ViewChild } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { TemporaryAddress } from "../../datamodel/redapply";
import { NgForm } from "@angular/forms";
import { RedApplyService } from "../../service/ri-red.service";
import { WindowService } from "app/core";

@Component({
  selector: 'db-return-addaddress',
  templateUrl: './return-addaddress.component.html',
  styleUrls: ['./return-addaddress.component.scss']
})
export class ReturnAddaddressComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService,
    private retutnService: RedApplyService,
    private windowService: WindowService) { }  
  
  @ViewChild(NgForm) addAddress;//表单
  modal: XcModalRef;
  provincecityinfo:any = {};
  temporaryaddress: TemporaryAddress = new TemporaryAddress();
  provinceArray: any[] = [];//省份
  cityArray: any[] = [];//城市
  districtArray: any[] = [];//区县
  cityCopy: any[] = [];//城市
  districtCopy: any[] = [];//区县
  loadingMsg:any = "loading";
  provinceName: any = "";
  isEdit: boolean = false;
  
  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      if (data.data){
        this.temporaryaddress = data.data;
        let provinceItem = this.provinceArray.filter(item => { return item["ProvinceName"] == this.temporaryaddress.province });
        if(provinceItem.length > 0){
          this.temporaryaddress.provincecode = provinceItem[0]["ProvinceCode"];
        }
        this.isEdit = true;

        this.cityArray = [{CityCode:this.temporaryaddress.citycode,CityName:this.temporaryaddress.city}];
        this.districtArray = [{CountyName:this.temporaryaddress.district}];
      }
      else this.temporaryaddress = new TemporaryAddress();
      // //省 市 县 下拉框数据处理
      // this.provincecityinfo = data.provincecityinfo;
      // this.provinceArray = this.provincecityinfo.province;
      // this.cityArray = this.cityCopy = this.provincecityinfo.city;
      // this.districtArray = this.districtCopy = this.provincecityinfo.district;
      // let provinceItem = this.provinceArray.filter(item => { return item["ProvinceName"] == this.temporaryaddress.province });
      // if(provinceItem.length > 0){
      //   this.temporaryaddress.provincecode = provinceItem[0]["ProvinceCode"];
      // }
      if (this.provinceArray.length == 0) {
        this.retutnService.getProvinceCityInfo().subscribe(data => {
          this.loadingMsg = "-请选择";
          let tempData = JSON.parse(data.Data);
          this.provinceArray = tempData.province;
          this.cityCopy = tempData.city;
          this.districtCopy = tempData.district;
          let provinceItem = this.provinceArray.filter(item => { return item["ProvinceName"] == this.temporaryaddress.province });
          if(provinceItem.length > 0){
            this.temporaryaddress.provincecode = provinceItem[0]["ProvinceCode"];
          }
        });
      }
    });
  }

  //省份change事件
  provinceModeChange(provincecode){
    this.provinceName = this.provinceArray.filter(item => { return item.ProvinceCode == provincecode;})[0]["ProvinceName"];
    this.cityArray = this.cityCopy.filter(item => {
      return item.CityCode.substring(0, 3) == provincecode;
    });
  }

  //城市change事件
  cityModeChange(citycode){
    this.temporaryaddress.city = this.cityCopy.filter(item => { return item.CityCode == citycode;})[0]["CityName"];
    this.districtArray = this.districtCopy.filter(item => {
      return item.CityCode.substring(0, 5) == citycode;
    });
  }

  //确定
  sure(){
    if (this.addAddress.valid){
      if(!this.isEdit)this.temporaryaddress.detailaddress = "A-" + this.temporaryaddress.detailaddress;
      this.temporaryaddress.active = true;
      this.temporaryaddress.province = this.provinceName;
      this.modal.hide(this.temporaryaddress);
    }
  }
  //取消
  cancel(){
    this.temporaryaddress.active = true;
    this.modal.hide();
  }

}
