// 所以预览的采购清单
import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
declare var $: any;

@Component({
  templateUrl: './applylist-modal.component.html',
  styleUrls: ['./applylist-modal.component.scss']
})
export class UBApplyList implements OnInit {
  modal: XcModalRef;
  procurementList = [];//过滤后的采购清单
  numAmount: any; // 数量
  modalData = {
    procurementList: [],
    untaxAmount: 0,
    factory: ''
  };
  // 采购清单表头配置
  public tableConfig: any = [
    { title: '物料号', field: 'MaterialNumber', value: '', width: '8%', isRequired: true },
    { title: '物料描述', field: 'MaterialDescription', value: '', width: '10%', isRequired: false },
    { title: '数量', field: 'Count', value: '', width: '3%', isRequired: true },
    { title: '内部交易价', field: 'InterTransPrice', value: '', width: '6%', isRequired: true },
    { title: '转入库存地', field: 'StorageLocation', value: '', width: '4%', isRequired: false },
    { title: '转出库存地', field: 'StorageLocationOut', value: '', width: '4%', isRequired: false },
    { title: '转入批次', field: 'Batch', value: '', width: '6%', isRequired: false },
    { title: '转出批次', field: 'BatchOut', value: '', width: '6%', isRequired: false },
    { title: '是否入库（30天内）', field: 'IsStoreFor30', value: '', width: '6%', isRequired: false },
    { title: '是否本月销售', field: 'IsCurrentMonthSale', value: '', width: '5%', isRequired: false },
    { title: '销售合同号', field: 'MainContractCode', value: '', width: '10%', isRequired: false }
];
  constructor(
    private xcModalService: XcModalService
  ) { }
  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data?) => {
      this.modalData = data;
      let list = JSON.parse(JSON.stringify(data.procurementList));

      this.numAmount = 0;
      
      list.forEach(item => {//采购清单的物料来源显示 进行拼接
        this.numAmount += item.Count; //数量总计
        item.InterTransPrice=Number(item.InterTransPrice).toFixed(2);
    });

    })
  }
  hide() {
    this.modal.hide();
    this.procurementList = [];
    this.modalData.procurementList = [];
    this.modalData.untaxAmount = 0;
    this.modalData.factory = "";
  }
  ngDoCheck() {
    if (this.procurementList && this.procurementList.length >= 10) {//出现滚动条的宽度调整
      $(".w100").addClass("w93");
    } else {
      $(".w100").removeClass("w93");
    }
  }
  changeClass(value){
    return value;
  }
}