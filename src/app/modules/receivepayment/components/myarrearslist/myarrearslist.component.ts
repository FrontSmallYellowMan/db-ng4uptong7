import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import * as moment from 'moment';
import { Pager } from 'app/shared/index';
import { MyarrearslistQuery, MyarrearslistService, ImportArrearslistQuery } from "../../service/rp-myarrears.service";
declare var document,Blob,URL,window;

@Component({
  selector: 'db-myarrearslist',
  templateUrl: './myarrearslist.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class MyarrearslistComponent implements OnInit {

  constructor(
    private router: Router,
    private myarrearslist: MyarrearslistService,
    private windowService: WindowService) { }

  query: MyarrearslistQuery = new MyarrearslistQuery();//查询条件
  importQuery: ImportArrearslistQuery = new ImportArrearslistQuery();
  companyData: any[] = [];//所属公司
  listData;//列表数据
  loading: boolean = false;
  pagerData = new Pager();//分页
  sortRule: string = "up";//列表排序 up-升序 down-降序
  ngOnInit() {
    this.search(this.query);
  }
  //查询
  search(query){
    this.loading = true;
    if (query.StartTime) {
      query.StartTime = moment(query.StartTime).format("YYYY-MM-DD");
    }
    if (query.EndTime) {
      query.EndTime = moment(query.EndTime).format("YYYY-MM-DD");
    }
    this.query.CurrentPage = this.pagerData.pageNo;
    this.query.PageSize = this.pagerData.pageSize;
    this.myarrearslist.GetMyArrearsList(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.listData = JSON.parse(data.Data);
        this.pagerData.set({
          total: this.listData.totalCount,
          totalPages: Math.ceil(this.listData.totalCount / this.pagerData.pageSize)
        });
      }
    });
  }
  
  //列表排序
  sortCurrentTableData(){
    if (this.sortRule == "up") {
      this.sortRule = "down";
      this.listData.arrearlist = this.listData.arrearlist.sort(function(a, b) {
        return a.CREDITDATE > b.CREDITDATE ? 1 : -1;
      });
    }else {
      this.sortRule = "up";
      this.listData.arrearlist = this.listData.arrearlist.sort(function(a, b) {
        return a.CREDITDATE < b.CREDITDATE ? 1 : -1;
      });
    }
  }
  //重置查询条件
  reset(){
    this.query = new MyarrearslistQuery();
    this.search(this.query);
  }
  //导出查询结果
  importResultData(query){
    for (let key in this.importQuery) {
      if (this.importQuery.hasOwnProperty(key)) {
        this.importQuery[key] = this.query[key];
      }
    }
    this.importQuery.ExprotType = "0";
    this.myarrearslist.GetArrearImportExcel(this.importQuery).subscribe(data => {
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `我的欠款.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl);
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
  }
  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
   aClick(link){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`我的欠款${newDate}`);
    a.click();
    document.body.removeChild(a);
  }
  //路由 跟进列表
  routerFollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }
  //路由 新建跟进
  routerNewfollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }

}