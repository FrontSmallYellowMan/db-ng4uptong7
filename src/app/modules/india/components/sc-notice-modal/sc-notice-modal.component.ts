import { Component, OnInit } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { ScService } from "../../service/sc-service";
import { WindowService } from "app/core";

@Component({
  selector: 'db-sc-notice-modal',
  templateUrl: './sc-notice-modal.component.html',
  styleUrls: ['./sc-notice-modal.component.scss']
})
export class ScNoticeModalComponent implements OnInit {
  constructor(
    private scService: ScService,
    private windowService: WindowService,
    private xcModalService: XcModalService) { }

  modal: XcModalRef;
  data:any = {SC_Code:"",Msg:""};
  isNotice = false;

  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      this.data.SC_Code = data.data;
    });
  }

  //发送消息
  onNotice(){
    this.isNotice = true;
    if(this.data.Msg){
      //请求接口发消息
      this.scService.sendMsgForSales(this.data).subscribe(data => {
        if (data.Result) {
          this.windowService.alert({ message: "通知成功!", type: "success" });
          this.modal.hide();
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }

  //取消
  cancel(){
    this.modal.hide();
  }

}
