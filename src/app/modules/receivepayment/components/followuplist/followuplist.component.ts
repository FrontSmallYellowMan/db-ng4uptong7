import { Component, OnInit } from '@angular/core';
import { FollowuplistService, ArrearsListQuery, ArrearsInfo, ArrearsInfoQuery } from "../../service/rp-followup.service";
import { Pager } from 'app/shared/index';
import { ActivatedRoute, Router } from "@angular/router";
declare var document,Blob,URL,window;
import * as moment from 'moment';

@Component({
  selector: 'db-followuplist',
  templateUrl: './followuplist.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class FollowuplistComponent implements OnInit {

  constructor(
    private router: Router,
    private followupservice: FollowuplistService,
    private activerouter:ActivatedRoute) { }

  query: ArrearsListQuery = new ArrearsListQuery();//查询条件
  importQuery: ArrearsInfoQuery = new ArrearsInfoQuery();
  followupList;//跟进列表数据
  pagerData = new Pager();//分页
  loading: boolean = false;
  ngOnInit() {
    this.activerouter.queryParams.subscribe(params => {
      if (params) {
        this.importQuery.GSDM = this.query.GSDM = params.GSDM;
        this.importQuery.HXMDM = this.query.HXMDM = params.HXMDM;
        this.importQuery.KJND = this.query.KJND = params.KJND;
        this.importQuery.PZDM = this.query.PZDM = params.PZDM;
      }
    });
    this.GetFollowUpList(this.query);
  }
  //获取跟进列表数据
  GetFollowUpList(query: ArrearsListQuery){
    this.loading = true;
    this.followupservice.GetFollowUpList(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.followupList = JSON.parse(data.Data);
        this.pagerData.set({
          total: this.followupList.totalCount,
          totalPages: Math.ceil(this.followupList.totalCount / this.pagerData.pageSize)
        });
      }
    });
  }
  search(){
    this.query.CurrentPage = this.pagerData.pageNo;
    this.query.PageSize = this.pagerData.pageSize;
    this.GetFollowUpList(this.query);
  }
  //路由 新建跟进
  routerNewfollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }
  //导出跟进记录
  importFollowup(query){
    this.followupservice.GetFollowUpImportExcel(query).subscribe(data => {
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `跟进信息.xls`);
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
    a.setAttribute("download",`跟进信息${newDate}`);
    a.click();
    document.body.removeChild(a);
  }
  //路由 评论
  routerComment(url, params, code){
    let queryParams = params;
    params["AFU_Code"] = code;
    this.router.navigate([url], { queryParams: queryParams });
  }
}
