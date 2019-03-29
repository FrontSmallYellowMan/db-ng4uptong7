import { Component, OnInit } from '@angular/core';
import { XcModalRef, XcModalService } from "../../../../../shared/index";
import { ScTemplateService } from "../../../service/sc-template.service";

@Component({
  selector: 'db-ec-hardware',
  templateUrl: './ec-hardware.component.html',
  styleUrls: ['./ec-hardware.component.scss']
})
export class EcHardwareComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService,
    private scTplService:ScTemplateService
    ) { }
  modal:XcModalRef;
  loading: any = false;
  data: any = {ContractAbstract: null, ProductList: [], ProductInfo: []};
  message: any = "";

  ngOnInit() {
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      //data["ID"]
      if (data["ID"]) {
        this.loading = true;
        this.scTplService.getAbstract(data["ID"]).subscribe(data => {
          this.loading = false;
          if (data.Result) {
            this.data = JSON.parse(data.Data);
            console.log(this.data);
            
          }else{
            this.message = "信息获取失败……";
          }
        });
      }
    });
  }
  //关闭弹出框
  hide(data?:any) {
    this.modal.hide();
  }

}
