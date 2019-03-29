import { Component, OnInit, Input, Output, forwardRef, ViewChild, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Pager } from 'app/shared/components/widgets/pager/iq-pager.component';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';

import { Query, JIqSelectService } from './j-iq-select.service';

@Component({
  templateUrl: 'j-iq-select-dialog.component.html',
  styleUrls: ['./j-iq-select-dialog.component.scss'],
  providers: [JIqSelectService]
})
export class JIqSelectDialogComponent implements XcBaseModal, OnInit {
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
  java: boolean;//是否java调用
  constructor(
    private xcModalService: XcModalService,
    private iqSelectService: JIqSelectService) { }

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      this.api = data.api;
      this.queryParams = data.queryParams;
      this.dataModal = data.dataModal;
      this.showIndex = data.showIndex;
      this.noSearch = data.noSearch;
      this.java = data.java;
      this.loading = true;
      this.initData();
    });
  }

  initData() {
    if (!this.api) { return };
    this.query.queryStr = this.query.queryStr || "";

    let tmpObj = {};
    if (!!this.queryParams.queryStr) {
      tmpObj[this.queryParams.queryStr] = this.query.queryStr;
    }
   
      this.iqSelectService.getOptionList(this.api, Object.assign(JSON.parse(JSON.stringify(this.query)), this.queryParams, tmpObj),this.java).then(result => {

        let pager = JSON.parse(JSON.stringify(result)),
          columns = JSON.parse(JSON.stringify(result)),
          rows = JSON.parse(JSON.stringify(result));

        this.loading = false;

        if (this.dataModal.pager) {
          this.dataModal.pager.forEach(item => {

            pager = pager[item];
            if (typeof pager == 'string') {
              pager = JSON.parse(pager);
            }
          });
          this.pagerData.set(pager);
        }

        this.dataModal.item.forEach(item => {
          rows = rows[item];
          if (typeof rows == 'string') {
            rows = JSON.parse(rows);
          }
        });

        this.rows = rows.map(item => typeof (item) == 'string' ? item : Object.keys(item).map(i => item[i]));

        this._rows = JSON.parse(JSON.stringify(this.rows)).map(item => {
          let tmpItem = [];
          this.showIndex.split('').forEach(v => {
            tmpItem.push(item[v]);
          });
          return tmpItem;
        });

        this.itemString = typeof this.rows[0] == 'string';

        if (!this.dataModal.title) {
          this.columns = Object.keys(rows[0]);
        } else {
          this.dataModal.title.forEach(item => { columns = columns[item] });
          this.columns = columns;
        }
        this._columns = [];
        this.showIndex.split('').forEach(v => {
          this._columns.push(this.columns[v]);
        });
      })
  }

  onChangePager(e: any) {
    this.query.pageNo = e.pageNo;

    this.initData();
  }

  hide(data?: any) {
    this.modal.hide(data);
     
    //重置搜索条件
    this.query = new Query();
  }

  search() {
    this.query.pageNo = 1;
    this.initData();
  }

  choose(i) {
    this.hide(i);
  }

}
