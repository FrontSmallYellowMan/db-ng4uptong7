// 所以预览的采购清单
import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { Location } from '@angular/common';
import { WindowService } from 'app/core';
declare var $ :any;

@Component({
  templateUrl: './NDPurchaseList-Modal.component.html',
  styleUrls:['./NDPurchaseList-Modal.component.scss']
})
export class NDPurchaseListModalComponent implements OnInit {
  modal: XcModalRef;
  procurementList=[];//过滤后的采购清单
  modalData={
     procurementList:[],
     preDiscount:0,
    factory:'',
    vendor:''
  };

  constructor(
    private xcModalService: XcModalService
  ) { }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
       this.modalData=data;
       let list=JSON.parse(JSON.stringify(data.procurementList));
       let i;
       let len=list.length;
       for(i=0;i<len;i++){
        let index=this.isSimilarity(list[i]);
         if(index==-1){
           this.procurementList.push(list[i]);
         }else{
           this.procurementList[index].Count=Number(this.procurementList[index].Count)+Number(list[i].Count);
           this.procurementList[index].CustomsSumPriceAfterDiscount
              =Number(this.procurementList[index].CustomsSumPriceAfterDiscount)+Number(list[i].CustomsSumPriceAfterDiscount);
           if(!list[i]["isExcel"]){//取ERP中的物料描述
              this.procurementList[index].MaterialDescription=list[i].MaterialDescription;
           }
         }
       }
       
    })
  }
  isSimilarity(listItem){//在this.procurementList中寻找（物料号、折扣后报关单价、库存地、批次）相同的下标
    let j;
    let len=this.procurementList.length;
    for(j=0;j<len;j++){
      let item=this.procurementList[j];
       if(listItem.MaterialNumber==item.MaterialNumber
              && listItem.CustomsPriceAfterDiscount==item.CustomsPriceAfterDiscount
              && listItem.StorageLocation==item.StorageLocation
              && listItem.Batch==item.Batch){
                return j;
    }
    }
    return -1;
  }
  hide() {
    this.modal.hide();
    this.procurementList=[];
    this.modalData.procurementList=[];
    this.modalData.preDiscount=0;
    this.modalData.factory="";
    this.modalData.vendor="";
  }
  ngDoCheck() {
    if(this.procurementList && this.procurementList.length>=10){//出现滚动条的宽度调整
        $(".w100").addClass("w93");
    }else{
        $(".w100").removeClass("w93");
    }
  }

}