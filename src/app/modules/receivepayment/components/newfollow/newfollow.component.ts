import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from "@angular/router";
import { ArrearsModel, AccessoryItem, FollowuplistService } from "../../service/rp-followup.service";
import { WindowService } from "app/core";
import { APIAddress, environment } from "../../../../../environments/environment";
declare var window: any;

@Component({
  selector: 'db-newfollow',
  templateUrl: './newfollow.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class NewfollowComponent implements OnInit {

  constructor(
    private router: Router,
    private activerouter:ActivatedRoute,
    private fpnew: FollowuplistService,
    private windowService: WindowService) { }

  afData = new ArrearsModel();//表单信息
  hasUploadedFiles: any[] = [];//附件信息数据源 组件：{name: "a.txt", size: 52428800}
  params;
  loading: boolean = false;
  uploadAccesslUrl = environment.server + "ReceivedPayments/UploadFollowUpAccessory";

  ngOnInit() {
    this.activerouter.queryParams.subscribe(params => {
      if (params) {
        this.params = params;
        this.afData.AFModel.GSDM = params.GSDM;
        this.afData.AFModel.HXMDM = params.HXMDM;
        this.afData.AFModel.KJND = params.KJND;
        this.afData.AFModel.PZDM = params.PZDM;
      }
    });
  }

  
  //附件上传 成功
  fileUploadSuccess(event){
    //event = data
    if (event.Result) {
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          let accessItem = new AccessoryItem();
          accessItem.AccessoryID = item["AccessoryID"];
          accessItem.AccessoryName = item["AccessoryName"];
          accessItem.AccessoryURL = item["AccessoryURL"];
          this.afData.Accessory.push(accessItem);
        });
      }
    }else{
      this.windowService.alert({ message: event.Message, type: "fail" });
    }
  }
  //删除附件
  onDeleteFileItem(event) {
    //event = 删除文件的下标
    let item = this.afData.Accessory[event];
    if (!item.AccessoryID) {
      this.afData.Accessory.splice(event, 1);
    }
  }
  //点击单个已经上传的附件
  onClickFile(event){
    // event = {item: item, index: i}
    window.open(APIAddress + this.afData.Accessory[event.index].AccessoryURL);
  }
  //保存
  save(){
    if (!this.afData.AFModel.Title.trim()) {
      this.windowService.alert({ message: "请维护标题", type: "warn" });
      return false;
    }
    if (!this.afData.AFModel.ArrearsContent.trim()) {
      this.windowService.alert({ message: "请维护跟进信息", type: "warn" });
      return false;
    }
    this.loading = true;
    this.fpnew.SaveArrears(this.afData).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.windowService.alert({ message: "保存成功", type: "success" });
        setTimeout(() => { this.router.navigate(["/receivepayment/rp-myarrears"]); }, 1000);
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //路由 跟进列表
  routerFollowup(){
    this.router.navigate(["/receivepayment/followup"], { queryParams: this.params });
  }

}
