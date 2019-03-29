import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

import {
  sealsQuery,
  ScService
} from './../../../service/sc-service';

export class PageNo { }

@Component({
  templateUrl: './add-seals.component.html',
  styleUrls: ['./sc-seals.component.scss']
})
export class scSealsAddComponent implements OnInit{
  public modal:XcModalRef;
  public loading: boolean = true;//加载中
  public submitOnce: boolean;
  public fullChecked = false;//全选状态
  public fullCheckedIndeterminate = false;//半选状态
  public checkedNum = 0;//已选项数
  public query: sealsQuery;//查询条件
  public pagerData = new Pager();


  public sealsList = [{},{}];
    constructor(
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private scService: ScService
    ){}
    //初始化下拉框数据
    initData(query: sealsQuery){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.scService.getSealsData(query).subscribe(
            data => {
              if(data.Result){
                  let res = JSON.parse(data.Data)
                  this.sealsList = res["OASeallist"];
                  this.loading = false;
                  //设置分页器
                  this.pagerData.set({
                      total: res.PageSize,
                      totalPages: Math.ceil(res.TotalCount/res.PageSize)
                  })
              }
            }
        );
    }


  ngOnInit(){
    this.query = new sealsQuery();
    this.query.name = this.query.name || "";
    this.query.currage = this.pagerData.pageNo;
    this.query.pagesize = this.pagerData.pageSize;

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
        this.query.name = "";
        this.query.platfromid = data;
        this.initData(this.query);
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.modal.hide(data);
    this.submitOnce = false;
  }


  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  search(){
      this.loading = true;
      this.query.name = this.query.name.trim();
      this.query.currage = 1;
      this.initData(this.query);
  }

  public currentPageSize;//当前每页显示条数
  public initChange = true;
  onChangePage(e: any) {
      if(this.initChange){
          this.initChange = false;
          return ;
      }
      //非第一页，切换条数。跳为第一页
      if(this.currentPageSize != e.pageSize){
          this.pagerData.pageNo = 1;
      }
      this.currentPageSize = e.pageSize

      this.query.name = this.query.name || "";
      this.query.currage = e.pageNo;
      this.query.pagesize = e.pageSize;
      this.initData(this.query);
  }

  //保存数据
  save(){
    let param = this.sealsList;
    let ObList = [];
    param.filter(item => item['checked'] === true).forEach(item => {
        ObList.push(item);
    });
    this.hide(ObList);
  }
}
