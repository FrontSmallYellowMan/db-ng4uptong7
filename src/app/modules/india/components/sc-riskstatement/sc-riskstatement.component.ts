import { Component, OnInit, Input } from '@angular/core';
import { environment, APIAddress } from '../../../../../environments/environment';
import { WindowService } from "app/core";
import { ScService } from '../../service/sc-service';
declare var window: any;

@Component({
  selector: 'sc-riskstatement',
  templateUrl: './sc-riskstatement.component.html',
  styleUrls: ['./sc-riskstatement.component.scss']
})
export class ScriskstatementComponent implements OnInit {

  constructor(
    private scService: ScService,private windowService: WindowService) { }

  @Input() riskstatementdata;//父组件传入数据
  @Input() selectdata = [];//下拉框数据源
  @Input() hasUploadedFilesRisk: any[] = [];//附件信息数据源 组件：{name: "a.txt", size: 52428800}
  uploadAccesslUrl = this.scService.uploadSCAccessories("32");
  ngOnInit() {
  }
  //附件上传 成功
  fileUploadSuccess(event){
    //event = data
    if (event.Result) {
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          this.riskstatementdata.AccessoryRisk.push(item);
        });
      }
    }else{
      this.windowService.alert({ message: event.Message, type: "fail" });
    }
  }
  //删除附件
  onDeleteFileItem(event) {
    //event = 删除文件的下标
    let item = this.riskstatementdata.AccessoryRisk[event];
    if (item.AccessoryID) {
      this.riskstatementdata.AccessoryRisk.splice(event, 1);
    }
  }
  //点击单个已经上传的附件
  onClickFile(event){
    if (typeof event === "string") {
      window.open(APIAddress + event);
    }else{
      window.open(APIAddress + event["item"]["AccessoryURL"]);
    }
  }
  //担保
  onClickGuarantee(){
    this.windowService.alert({ message: "暂无担保", type: "fail" });
  }
  //评级
  onClickGrade(){
    this.windowService.alert({ message: "暂无评级", type: "fail" });
  }

}
