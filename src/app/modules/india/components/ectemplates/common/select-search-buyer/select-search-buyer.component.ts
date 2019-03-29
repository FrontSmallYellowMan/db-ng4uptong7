import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from "ng2-bs3-modal";
import { Pager, XcModalService, XcModalRef } from "../../../../../../shared/index";
import { BuyerInfo } from "../entitytype/formdata";
import { ScTemplateService } from "../../../../service/sc-template.service";

@Component({
  selector: 'db-select-search-buyer',
  templateUrl: './select-search-buyer.component.html',
  styleUrls: ['./select-search-buyer.component.scss']
})
export class SelectSearchBuyerComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService,
    private templateService: ScTemplateService,) { }

  modal: XcModalRef;
  loading: boolean = false;
  query: any[] = [];//传入数据
  outInputData: any = {BuyerName:"",BuyerERPCode:"",DetailInfo:null};//输出数据
  pagerData = new Pager();//
  BuyerInfo: BuyerInfo[];//买方信息 totalItems
  currentPageItems: BuyerInfo[];//当前页需要显示的数据
  totalItems: number = 0;//总共多少项数据
  currentPage: number = 1;//当前页
  pagesize: number = 10;//每页显示多少行
  modalTitle: string = "请选择";//模态窗头部标题

  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      if (data.data) {
        this.query = data.data;
        this.modalTitle = data.modalTitle || this.modalTitle;
        this.getBuyerList(this.query);
      }
      this.outInputData = {BuyerName:"",BuyerERPCode:"",DetailInfo:null};
    });
  }

  close() {
    this.currentPageItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.modal.hide();
  }
  //获取买方列表
  getBuyerList(query) {
    if (!query) return;
    this.loading = true;
    this.templateService.getBuyerInfoByName(query).subscribe(
      data => {
        this.loading = false;
        let buyerArray = JSON.parse(data.Data);
        if (data.Result && Array.isArray(buyerArray)) {
          this.BuyerInfo = buyerArray;
          this.totalItems = buyerArray.length;
          this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
          this.pagerData.set({
            total: this.totalItems,
            totalPages: Math.ceil(this.totalItems / this.pagesize)
          });
        }
    });
  }
  //分页
  onChangePage(event) {
    this.pagesize = event.pageSize;
    this.currentPage = event.pageNo;
    if (this.BuyerInfo && this.BuyerInfo.length > 0) {
      this.currentPageItems = this.pagination(this.currentPage, this.pagesize, this.BuyerInfo);
    }
  }
  //分页逻辑
  pagination(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
  }
  //列表选择买方
  onSelectedBuyer(item: BuyerInfo) {
    this.outInputData.BuyerName = item.NAME;
    this.outInputData.BuyerERPCode = item.KUNNR;
    this.getBuyerInfoByerpCode(item.KUNNR);
  }
  //获取买方详情信息
  getBuyerInfoByerpCode(erpCode){
    if (erpCode && erpCode != "A") {
      this.loading = true;
      this.templateService.getBuyerInfoByErpCode(erpCode).subscribe(
        data => {
          this.loading = false;
          if (data.Result) {
            this.outInputData.DetailInfo = JSON.parse(data.Data);
            this.modal.hide(this.outInputData);
          }
        });
    }
  }

}
