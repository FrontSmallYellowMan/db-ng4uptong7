import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';



import { Subject } from 'rxjs';
import { Pager, XcBaseModal, XcModalService, XcModalRef } from 'app/shared/index';

import { Query, SelectSearchService } from '../../services/select-search.service';

@Component({
  templateUrl: 'select-search-dialog.component.html',
  styleUrls: ['./select-search-dialog.component.scss']
})
export class SelectSearchDialogComponent implements XcBaseModal, OnInit {
  query: Query = new Query(1,1);
  modal: XcModalRef;
  pagerData = new Pager();
  loading: boolean = false;
  optionList: any[] = [];
  columns: string[] = [];
  rows: any[] = [];

  constructor(
    private xcModalService: XcModalService,
    private selectSearchService: SelectSearchService) {}

  searchStream = new Subject<string>();

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((query) => {
      this.query = query;

      //如果查询类型为供应商，则不默认查询列表
      //if(this.query.tabName==6) this.query.enterShowData=false;

      if(this.query.enterShowData){
        this.loading = true;
        this.initData();
      }
    });
  }

  initData(){
    this.selectSearchService.getOptionList(this.query).then(result => {
      if(result.success){
        this.loading = false;
        this.pagerData.set(result.data.pager);
        this.columns = result.data.columns;

        //如果传入的过滤条件为“B”，则将科目设置组列表过滤
        if(this.query.filterPromis==='B'){
        this.rows=result.data.rows.filter(item=>item[0]!=='04');
        }else{
          this.rows = result.data.rows;
          //console.log(this.rows);
        }

      }
    })
  }

  onChangePager(e: any){
    this.query.queryStr = this.query.queryStr || "";
    this.query.pageNo = e.pageNo;
    this.query.pageSize = e.pageSize;
   // console.log(this.query);
    this.initData();
  }

  hide(data?:any){
    this.modal.hide(data);

    //重置搜索条件
    this.query.queryStr="";
    console.log(this.query);
    
  }

  search(){
    this.query.pageNo=1;
    this.initData();
  }

  choose(item){
    this.hide(item);
  }

}
