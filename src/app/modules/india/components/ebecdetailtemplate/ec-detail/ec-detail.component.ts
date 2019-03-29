import { Component, OnInit, Input } from '@angular/core';
import { XcModalService, XcModalRef } from "../../../../../shared/index";
import { EcHardwareComponent } from "../ec-hardware/ec-hardware.component";

@Component({
  selector: 'db-ec-detail',
  templateUrl: './ec-detail.component.html',
  styleUrls: ['./ec-detail.component.scss']
})
export class EcDetailComponent implements OnInit {

  constructor(private xcModalService: XcModalService) { }

  @Input() templateID = null;//模板类型
  @Input() ID = null;//获取数据条件
  modal: XcModalRef;//模态窗

  ngOnInit() {
    this.createModal();
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onModalHide);
  }

  //在初始化的时候 创建模型
  createModal(){
    switch (this.templateID) {
      case "6"://通用硬件
      case "8"://通用硬件
        this.modal = this.xcModalService.createModal(EcHardwareComponent);
        break;
      default:
        this.modal = this.xcModalService.createModal(EcHardwareComponent);
        break;
    }
    
  }
  
  //模态窗关闭时事件
  onModalHide = data => {
    //
  }

}
