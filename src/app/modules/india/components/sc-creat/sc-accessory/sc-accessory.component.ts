import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
declare var window: any;

import { ScService } from './../../../service/sc-service';
import { APIAddress } from "../../../../../../environments/environment";
@Component({
  selector: 'db-sc-accessory',
  templateUrl: './sc-accessory.component.html',
  styleUrls: ['./sc-accessory.component.scss']
})
export class ScAccessoryComponent implements OnInit {
  @Output() scAccessory = new EventEmitter();
  @Output() needSave = new EventEmitter();
  @Input() isEdit: boolean;
  @Input() isCustome: boolean;
  hasUploadedCustome: any[] = [];
  @Input() isCreate: boolean = false;//是否为审批状态
  public sc_Code;//合同单号
  public uploadCustomeAccesslUrl; //自定义模板类型-用印文件上传地址
  oldCustomeFileName = "";//记录删除前文件名称  自定义模板类型用印文件
  public riskFileApi; //风险附件上传地址
  public careerFileApi;//事业部附件上传地址
  public approveFileApi;//事业部附件上传地址

  public accessoryBus;//已存在事业部附件
  public accessorySub;//已存在风险附件
  public accessoryS;//已存在审核上传附件
  public customFile = [];//相关文件ID

  public localUser = JSON.parse(localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  // 传入数据及获取数据方法。父组件内容
  public accessoryInfo = {
    "AccessorySeal": [],  //用印文件
    "AccessoryBus": [],   //事业部可见类型
    "AccessorySub": [],   //风险可见类型
    "AccessoryS": [],     //审批上传类型
    "AccessoryD": []      //其他文件
  }
  constructor(
      private router: Router,
      private routerInfo: ActivatedRoute,
      private scService: ScService
      ) { }
  //用新信息，各个数据赋值
  accessoriesChange(data){
      this.accessoryInfo = data;
      this.accessoryBus = data["AccessoryBus"];//事业
      this.accessorySub  = data["AccessorySub"];//风险
      this.accessoryS  = data["AccessoryS"];//审核
      if(!this.isCreate){
          this.getAllFiles(data["AccessoryBus"]);
          this.getAllFiles(data["AccessorySub"]);
          this.getAllFiles(data["AccessoryS"]);
      }
  }
  //审批相关文件整合
  getAllFiles(files){
    let allFiles = this.customFile;
    if(files.length>0){
      files.forEach(function(item){
        allFiles.push(item);
      })
    }
    this.customFile = allFiles;
  }
  ngOnInit() {
      this.riskFileApi = this.scService.uploadSCAccessories(1);
      this.careerFileApi = this.scService.uploadSCAccessories(3);
      this.approveFileApi = this.scService.uploadSCAccessories(11);
      this.uploadCustomeAccesslUrl = this.scService.uploadSCAccessories(18);
      this.sc_Code = this.routerInfo.snapshot.queryParams['SC_Code'];
      if(!this.sc_Code){
          this.sc_Code = this.routerInfo.snapshot.queryParams['recordid'];
      }
  }
  //审批相关文件分类
  dealCustomFiles(files){
    let allFiles = files;
    let accessoriesInfo = {
      "AccessoryBus":[],  //事业部可见类型
      "AccessorySub": [], //风险可见类型
      "AccessoryS": []    //审批上传类型
    }
    let userItcode = this.localUser['ITCode'];
    allFiles.forEach(function(item,i){
        let type = item["AccessoryType"];
        // if(type == "1"){
        //     accessoriesInfo["AccessorySub"].push(item);
        // }else if(type == "3"){
        //     accessoriesInfo["AccessoryBus"].push(item);
        // }else
        if(type == "11" && item['CreatedByITcode'] == userItcode){
            accessoriesInfo["AccessoryS"].push(item);
        }
    })
    return accessoriesInfo["AccessoryS"];
  }
  // //附件信息
  onFileCallBack(e,type) {
      switch(type){
          case 1:
                this.accessoryInfo["AccessoryBus"] = e;
                break;
          case 3:
                this.accessoryInfo["AccessorySub"] = e;
                break;
          case 11:
                this.accessoryInfo["AccessoryS"] = this.dealCustomFiles(e);
                break;
          case 18:
                if (e.Result) {
                    let data = JSON.parse(e.Data);
                    if (data.length > 0) {
                        data.forEach(item => {
                            item["AccessoryName"] = this.oldCustomeFileName;
                            this.accessoryInfo.AccessorySeal.push(item);
                        });
                    }
                }
                break;
      }
      this.scAccessory.emit(this.accessoryInfo);
  }
  //查看用印制作合同
  checkSeal(url){
      window.open(url);
  }
  //查看普通文件
  commonFiles(url){
      window.open(this.scService.upFilesDownload(url));
  }
  //查看合同制作内容
  openPage(){
      this.needSave.emit();
  }

  //删除附件
  onDeleteFileItem(event) {
    //event = 删除文件的下标
    if (this.accessoryInfo.AccessorySeal[0]) {
        this.oldCustomeFileName = this.accessoryInfo.AccessorySeal[0]["AccessoryName"];
    }
    let item = this.accessoryInfo.AccessorySeal[event];
    if (item.AccessoryID) {
      this.accessoryInfo.AccessorySeal.splice(event, 1);
    }
    this.scAccessory.emit(this.accessoryInfo);
  }
  //点击单个已经上传的附件
  onClickFile(event){
    // event = {item: item, index: i}
    window.open(APIAddress + this.accessoryInfo.AccessorySeal[event.index].AccessoryURL);
  }
}
