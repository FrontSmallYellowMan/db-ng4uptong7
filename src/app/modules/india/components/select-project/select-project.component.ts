import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from "ng2-bs3-modal";
import { Pager, XcModalService, XcModalRef } from "app/shared/index";
import { ScService, RequisitionListQuery } from "../../service/sc-service";
import { WindowService } from "app/core";

@Component({
  selector: 'db-select-project',
  templateUrl: './select-project.component.html',
  styleUrls: ['./select-project.component.scss']
})
export class SelectProjectComponent implements OnInit {

  constructor(private xcModalService: XcModalService,private scService: ScService, private windowService: WindowService) { }

  modal: XcModalRef;
  loading: boolean = false;
  query:RequisitionListQuery = new RequisitionListQuery();//查询条件
  outInputData = {};//输出数据
  pagerData = new Pager();
  currentPageItems = [];//查询结果
  MainContractCode = "";

  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      if (data.data) {
        this.MainContractCode = data.data;
      }
      this.getList(this.query);
      this.outInputData = "";
    });
  }

  close() {
    this.currentPageItems = [];
    this.modal.hide();
  }
  //获取列表
  getList(query,type?) {
    this.loading = true;
    if (type == "clickSearchBtn") {
      this.query.PageIndex = 1;
    }else{
      this.query.PageIndex = this.pagerData.pageNo;
    }
    this.query.PageSize = this.pagerData.pageSize;
    this.scService.MyRequisitionList(query).subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          let resultData = data.Data;
          this.currentPageItems = resultData["List"];
          if (type == "clickSearchBtn"){
            this.pagerData.set({
              pageNo: 1
            });
          }
          this.pagerData.set({
            total: resultData.TotalCount,
            totalPages: Math.ceil(resultData.TotalCount / this.pagerData.pageSize)
          });
        }
      }
    );
  }
  //列表选择
  onSelected(item) {
    this.loading = true;
    this.scService.AddSC_Code(item.ID,this.MainContractCode).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        item["isFillContract"] = 1;
        this.modal.hide(item);
      }else{
        this.modal.hide();
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }

  reset(){
    this.pagerData = new Pager();
    this.query = new RequisitionListQuery();
    this.getList(this.query);
  }

}
