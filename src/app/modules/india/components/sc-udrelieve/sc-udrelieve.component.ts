import { Component, OnInit, ViewChild } from '@angular/core';
import { RegisterBarCode } from "../../common/barcode";
import { RelieveContract, ScRelieveService } from "../../service/sc-relieve.service";
import { WindowService } from "../../../../core/index";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import * as moment from 'moment';
import { ScService } from '../../service/sc-service';
declare var $: any;
declare var window: any;

@Component({
  selector: 'db-sc-udrelieve',
  templateUrl: './sc-udrelieve.component.html',
  styleUrls: ['./sc-udrelieve.component.scss']
})
export class ScUDRelieveComponent implements OnInit {

  constructor(
    private relieveservice: ScRelieveService,
    private routerInfo: ActivatedRoute,
    private scService: ScService,
    private windowService: WindowService) { }
  relieveContractData: RelieveContract = new RelieveContract();
  reAccessoryapi = "";
  hasUploadedFiles = [];
  sc_Code;
  @ViewChild('form') form: NgForm;

  ngOnInit() {
    this.reAccessoryapi = this.scService.uploadSCAccessories(30);
    this.sc_Code = this.routerInfo.snapshot.queryParams['SC_Code'] || this.routerInfo.snapshot.queryParams['sc_code'];
    this.initRelieveContractData(this.sc_Code);
  }

  //初始化解除协议
  initRelieveContractData(sc_code) {
    this.relieveservice.getBaseBySc_code(sc_code).subscribe(data => {
      if (data.Result) {
        this.relieveContractData = JSON.parse(data.Data)["ReModel"];
        if (this.relieveContractData.REAccessoryJson) {
          this.hasUploadedFiles = JSON.parse(this.relieveContractData.REAccessoryJson);
          this.hasUploadedFiles.forEach(item => {
            item["name"] = item["AccessoryName"];
          });
          this.relieveContractData.REAccessoryJson = JSON.parse(this.relieveContractData.REAccessoryJson);
        }else{
          this.relieveContractData.REAccessoryJson = [];
        }
      }
    });
  }
  //保存
  saveRelieveContract() {
    if (this.relieveContractData.REAccessoryJson && this.relieveContractData.REAccessoryJson.length > 0) {
      this.relieveContractData.REAccessoryJson = JSON.stringify(this.relieveContractData.REAccessoryJson);
    }
    this.relieveservice.saveRelieveContract(this.relieveContractData).subscribe(data => {
      if (data.Result) {
        this.windowService.alert({ message: "保存成功", type: "success" });
        setTimeout(function () { window.close(); }, 1000);
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //提交
  sumitRelieveContract() {
    if (this.form.valid) {
      if (!this.relieveContractData.REAccessoryJson) {
        this.windowService.alert({ message: "请上传附件", type: "warn" });
      } else {
        if (typeof this.relieveContractData.REAccessoryJson !== "string") {
          this.relieveContractData.REAccessoryJson = JSON.stringify(this.relieveContractData.REAccessoryJson);
        }
        this.relieveservice.sumitRelieveContract(this.relieveContractData).subscribe(data => {
          if (data.Result) {
            this.windowService.alert({ message: "提交成功", type: "success" });
            setTimeout(function () { window.close(); }, 1000);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
      }
    }
  }
  //附件上传 成功
  fileUploadSuccess(event) {
    //event = data
    if (event.Result) {
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          this.relieveContractData.REAccessoryJson.push(item);
        });
      }
    } else {
      this.windowService.alert({ message: event.Message, type: "fail" });
    }

  }
  //删除附件
  onDeleteFileItem(event) {
    //event = 删除文件的下标
    this.relieveContractData.REAccessoryJson.splice(event, 1);
  }
  
  //附件下载
  onClickFile(ev){
    if (ev["item"]) {
      window.open(this.scService.upFilesDownload(ev["item"]["AccessoryURL"]));
    }else{
      window.open(this.scService.upFilesDownload(ev));
    }
  }
}
