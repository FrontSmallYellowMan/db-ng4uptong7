// 所以的 采购合同用印文件
import { Component, OnInit, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

import { PurchaseContractInfo, Seal } from '../../services/purchase-contractInfo.service';
import { ShareDataService } from './../../services/share-data.service';

@Component({
  selector: "submit-contract-print",
  templateUrl: './submit-contract-print.component.html',
  styleUrls: ['./submit-contract-print.component.scss', './../../scss/procurement.scss']
})

export class SubmitContractPrintComponent implements OnInit {

  selectInfo = {//平台下拉框数据
    plateInfo: []
  }
  avtivePlate;//平台-当前选项
  contractInfo = new PurchaseContractInfo();
  contractPrintUrl = "api/PurchaseManage/UploadAccessory/1";//采购合同用印文件 上传路径
  sealInfo: Seal = new Seal();// 用印数据
  AccessorySee_India = [];//查看采购合同用印文件
  editData=null;//编辑时的 印章信息

  @ViewChild('seals') seals;//用印组件ID注入
  @ViewChild(NgForm)
  contractPrintForm;//表单
  beforeContractPrintFormValid;//表单的前一步校验结果

  @Input() isSubmit=false;//是否提交
  @Input() set contractMoney(data){//用印金额
    this.contractInfo.ContractMoney=data;
  }
  @Input() set platformDa(data){//基本信息中 平台数据变化
    if(data){
      let body=JSON.parse(data);
      this.contractInfo.Platform_C_ID=body.id;    
      this.contractInfo.Platform_C=body.name;    
      this.avtivePlate = [{//显示平台
        id: body.id,
        text:body.name
      }];
      this.onPrintMessageChange.emit(this.contractInfo);
    }
  }
  @Input() set editPrintInitialData(data) {//编辑时 初始数据

      if(data){
          this.contractInfo=data;

          console.log(this.contractInfo);

          this.avtivePlate = [{//显示平台
            id: data.Platform_C_ID,
            text:data.Platform_C
          }];
          data.PurchaseContractInfoAccessories.forEach(item => {
            this.AccessorySee_India.push({
                name: item.AccessoryName
            })
          })
          if(data.SealInfoJson){
            let selfInfo=JSON.parse(data.SealInfoJson);
            this.editData=selfInfo.SealData;
          }
      }
  }

  @Output() onPrintMessageChange = new EventEmitter<any>();//当 用印整体信息 变化  
  @Output() onContractPrintFormValidChange = new EventEmitter<any>();//当 用印整体 校验变化 

  constructor(
    private shareDataService: ShareDataService
  ) { }

  ngDoCheck() {
      if (this.contractPrintForm.valid != this.beforeContractPrintFormValid) {//表单校验变化返回
          this.beforeContractPrintFormValid = this.contractPrintForm.valid;
          this.onContractPrintFormValidChange.emit(this.contractPrintForm.valid);
      }
  }

  ngOnInit() {
    this.shareDataService.getPlatformSelectInfo().then(data => {//获取平台下拉数据
      this.selectInfo.plateInfo = data;
    });
  }

  getPlateform(e) {//平台选择
    this.contractInfo.Platform_C_ID = e.id;//平台代码
    this.contractInfo.Platform_C = e.text;//平台
    this.onPrintMessageChange.emit(this.contractInfo);
  }

  onUploadBack(e) {//文件上传返回
    if (e.Result) {
      this.contractInfo.PurchaseContractInfoAccessories.push(e.Data);
      this.onPrintMessageChange.emit(this.contractInfo);
    }
  }

  //印章管理员数据处理
  sealChange(seals) {
    let managesArr = [];
    seals.forEach(function (item) {
      let itcodeArr = item.ManagerItcodes.split(";");
      let nameArr = item.ManagerNames.split(";");
      itcodeArr.forEach(function (id, i) {
        managesArr.push({
          "Group": item.SealCode,
          "ITCode": id,
          "UserName": nameArr[i]
        });
      })
    });
    this.contractInfo.UserSetting=JSON.stringify(managesArr);
  }

  //用印选择 确定 回调事件
  scSeals(e) {
    this.contractInfo.SealInfoJson=JSON.stringify(e);
    this.sealChange(e["SealData"]);
    this.onPrintMessageChange.emit(this.contractInfo);
  }

  onDeleteItem(e) {//删除文件
    this.contractInfo.PurchaseContractInfoAccessories.splice(e, 1);
    this.onPrintMessageChange.emit(this.contractInfo);
  }

  onChangeData(){
    this.onPrintMessageChange.emit(this.contractInfo);
  }
}