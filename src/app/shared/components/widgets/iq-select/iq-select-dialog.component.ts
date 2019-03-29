import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Pager } from '../pager/iq-pager.component';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';

import { Query, IqSelectService } from './iq-select.service';

@Component({
  templateUrl: 'iq-select-dialog.component.html',
  styleUrls: ['./iq-select-dialog.component.scss'],
  providers: [IqSelectService]
})
export class IqSelectDialogComponent implements XcBaseModal, OnInit {
  query: Query = new Query();
  modal: XcModalRef;
  pagerData = new Pager();
  loading: boolean = false;
  optionList: any[] = [];
  columns: string[] = [];
  _columns: string[] = [];
  rows: any[] = [];
  _rows: any[] = [];
  queryParams: any = {};
  api: string = '';
  dataModal: any;
  showIndex: string;
  noSearch: boolean;
  itemString: boolean = false;
  enterShowList:boolean;//弹出组件后，是否默认显示数据，false表示默认不请求，点击搜索时请求数据

  total:any;//保存返回的列表条数，用来切换显示提示消息

  constructor(
    private xcModalService: XcModalService,
    private iqSelectService: IqSelectService) {}

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      this.api = data.api;
      this.queryParams = data.queryParams;
      this.dataModal = data.dataModal;
      this.showIndex = data.showIndex;
      this.noSearch = data.noSearch;
      this.enterShowList=data.enterShowList;
      this.loading = true;

      if(this.enterShowList){//如果为true，则默认显示数据
        this.initData();
      }else{
        this.loading=false;
      }
      
    });
  }

  initData(){
    if(!this.api){return};
    this.query.queryStr = this.query.queryStr || "";

    let tmpObj = {};
    if(!!this.queryParams.queryStr){
      tmpObj[this.queryParams.queryStr] = this.query.queryStr;
    }

    this.iqSelectService.getOptionList(this.api, Object.assign(JSON.parse(JSON.stringify(this.query)), this.queryParams, tmpObj)).then(result => {

      let pager = JSON.parse(JSON.stringify(result)),
          columns = JSON.parse(JSON.stringify(result)),
          rows = JSON.parse(JSON.stringify(result));
          if(rows.Data){
            this.total=rows.Data.pager.totalPages;//保存返回的列表条数
          }else{
            this.total=rows.data.pager.totalPages;//保存返回的列表条数            
          }

      this.loading = false;

      if(this.dataModal.pager){
        this.dataModal.pager.forEach(item => {
          pager = pager[item];
          if(typeof pager == 'string'){
            pager = JSON.parse(pager);
          }
        });
        this.pagerData.set(pager);
      }
      
      this.dataModal.item.forEach(item => {
        rows = rows[item];
        if(typeof rows == 'string'){
          rows = JSON.parse(rows);
        }
      });

      this.rows = rows.map(item => typeof(item) == 'string' ? item : Object.keys(item).map(i => item[i]));
      

      this._rows = JSON.parse(JSON.stringify(this.rows)).map(item => {
        let tmpItem = [];
        this.showIndex.split('').forEach(v => {
          tmpItem.push(item[v]);
        });
        return tmpItem;
      });

      this.itemString = typeof this.rows[0] == 'string';
    

      if(!this.dataModal.title){
        this.columns = Object.keys(rows[0]);
      }else{
        this.dataModal.title.forEach(item => {columns = columns[item]});
        this.columns = columns;
      }
      this._columns = [];
      this.showIndex.split('').forEach(v => {
        this._columns.push(this.columns[v]);
      });
    })
  }

  onChangePager(e: any){
    this.query.pageNo = e.pageNo;

    this.initData();
  }

  hide(data?:any){
    this.modal.hide(data);

    //重置搜索条件
    this.query = new Query();

    //重置搜索结果
    this._rows=[];
    this._columns=[];
  }

  search(){
    this.query.pageNo = 1;
    this.initData();
  }

  choose(i) {
    
    this.hide(this.rows[i]);
  }

}
