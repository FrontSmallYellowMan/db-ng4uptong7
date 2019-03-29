// 所以预览的采购清单
import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';

declare var $ :any;
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { HttpServer } from 'app/shared/services/db.http.server';

@Component({
  templateUrl: './NDCheckResult-Modal.component.html',
  styleUrls:['./NDCheckResult-Modal.component.scss']
})
export class NDCheckResultModalComponent implements OnInit {
  modal: XcModalRef;
  procurementList=[];
  onlyCheckNAOrder;//是否 是只验证NA单号

  constructor(
    private dbHttp: HttpServer,
    private xcModalService: XcModalService
  ) { }

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
       this.onlyCheckNAOrder=data.onlyCheckNAOrder;
       let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
       let options = new RequestOptions({ headers: headers });
       this.dbHttp.post("PurchaseManage/CheckNAOrderDetails",data.list, options).subscribe(response => {
          if(response.Result){
            this.procurementList=response.Data;
          }
       })
    })
  }
  ngDoCheck() {
    if(this.procurementList && this.procurementList.length>=10){//出现滚动条的宽度调整
        $(".w100").addClass("w93");
    }else{
        $(".w100").removeClass("w93");
    }
  }

  hide() {
    this.modal.hide();
    this.procurementList=[];
  }
  

}