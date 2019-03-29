import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from "../../../../../../shared/index";
import { WindowService } from "../../../../../../core/index";

@Component({
  selector: 'db-my-ec-template',
  templateUrl: './my-ec-template.component.html',
  styleUrls: ['./my-ec-template.component.scss']
})
export class MyEcTemplateComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService
    ) { }

  ecTemplatemodal: XcModalRef;
  templateName = "";
  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.ecTemplatemodal = this.xcModalService.getInstance(this);
    this.ecTemplatemodal.onShow();
  }
  sure(){
    if (this.templateName) {
      this.ecTemplatemodal.hide({templateName:this.templateName.trim()});
    }else{
      this.windowService.alert({ message: "请填写模板名称", type: "fail" });
    }
  }
  cancel(){
    this.ecTemplatemodal.hide();
  }

}
