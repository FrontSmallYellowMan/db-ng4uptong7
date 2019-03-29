import { Component, OnInit, ViewChild } from '@angular/core';
import { RegisterBarCode } from "../../common/barcode";
import { RelieveContract, ScRelieveService } from "../../service/sc-relieve.service";
import { WindowService } from "../../../../core/index";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import * as moment from 'moment';
declare var $: any;
declare var window: any;

@Component({
  selector: 'db-sc-relieve',
  templateUrl: './sc-relieve.component.html',
  styleUrls: ['./sc-relieve.component.scss']
})
export class ScRelieveComponent implements OnInit {

  constructor(
    private relieveservice:ScRelieveService,
    private routerInfo: ActivatedRoute,
    private windowService: WindowService) { 
    //注册条形码插件
    new RegisterBarCode().extendBarCodeTools();
  }
  relieveContractData: RelieveContract = new RelieveContract();
  sc_Code;
  Barcode;
  @ViewChild('form') form: NgForm;

  ngOnInit() {
    this.sc_Code = this.routerInfo.snapshot.queryParams['SC_Code'] || this.routerInfo.snapshot.queryParams['sc_code'];
    this.initRelieveContractData(this.sc_Code);
  }

  //初始化解除协议
  initRelieveContractData(sc_code){
    this.relieveservice.getBaseBySc_code(sc_code).subscribe(data => {
      if (data.Result) {
        this.relieveContractData = JSON.parse(data.Data)["ReModel"];
        if (this.relieveContractData.ContractTime) {
          this.relieveContractData.ContractTime = moment(this.relieveContractData.ContractTime).format("YYYY-MM-DD");
        }
        if (this.relieveContractData.BuyTime) {
          this.relieveContractData.BuyTime = moment(this.relieveContractData.BuyTime).format("YYYY-MM-DD");
        }
        if (this.relieveContractData.RE_Code) {
          let barcode = this.onGenerateBarCode();
          this.relieveContractData.Barcode = barcode.slice(barcode.indexOf(',') + 1);
        }
      }
    });
  }
  //保存
  saveRelieveContract(){
    this.relieveservice.saveRelieveContract(this.relieveContractData).subscribe(data =>{
      if (data.Result) {
        this.windowService.alert({ message: "保存成功", type: "success" });
        setTimeout(function() { window.close(); }, 1000);
      }else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //提交
  sumitRelieveContract() {
    if (this.form.valid) {
      this.relieveservice.sumitRelieveContract(this.relieveContractData).subscribe(data => {
        if (data.Result) {
          this.windowService.alert({ message: "提交成功", type: "success" });
          setTimeout(function() { window.close(); }, 1000);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  //预览
  getRelieveContractWithPDF(){
    this.relieveservice.saveRelieveContract(this.relieveContractData).subscribe(data =>{
      if (data.Result) {
        this.relieveContractData.SC_Code = this.sc_Code = JSON.parse(data.Data)["SC_Code"];
        this.relieveservice.getRelieveContractWithPDF(this.sc_Code);
      }else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //生成条形码
  onGenerateBarCode() {
    let newBarCode = '';
    $('.code39').html(this.relieveContractData.RE_Code);
    $('.code39').barcode({code:'code39'});
    newBarCode = $('.code39 img').attr("src");
    return newBarCode;
  }
  contractTimeChange(event){
    this.relieveContractData.ContractTime = this.relieveContractData.BuyTime = moment(event).format("YYYY-MM-DD");
  }

}
