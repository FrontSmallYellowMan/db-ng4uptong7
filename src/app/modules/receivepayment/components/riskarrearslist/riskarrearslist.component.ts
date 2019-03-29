import { Component, OnInit } from '@angular/core';
import { WindowService } from "app/core";
import * as moment from 'moment';
import { Pager } from 'app/shared/index';
import { MyarrearslistQuery, MyarrearslistService, ImportArrearslistQuery } from "../../service/rp-myarrears.service";
import { Router } from "@angular/router";
declare var document,Blob,URL,window,$;

@Component({
  selector: 'db-riskarrearslist',
  templateUrl: './riskarrearslist.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class RiskarrearslistComponent implements OnInit {

  constructor(
    private router: Router,
    private myarrearslist: MyarrearslistService,
    private windowService: WindowService) { }

  query: MyarrearslistQuery = new MyarrearslistQuery();//查询条件
  importQuery: ImportArrearslistQuery = new ImportArrearslistQuery();
  companyData: any[] = [];//所属公司
  platformData: any[] = [];//所属公司
  listData;//列表数据
  loading: boolean = false;
  selectedBankSubject = {BANKACCOUNT:"",BANKNAME:"请选择",SUBJECT_NO:""};//科目选中项
  pagerData = new Pager();//分页
  sortRule: string = "up";//列表排序 up-升序 down-降序
  selectData: any[] = [];//输出数据
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  ngOnInit() {
    this.getCompanyData();
    this.GetDepartmentPlatform();
    this.search(this.query);
  }

  //获取公司列表
  getCompanyData(){
    this.myarrearslist.getCompanyData().subscribe(data => {
      if (data.Result) {
        this.companyData = JSON.parse(data.Data).CompanyList;
      }
    });
  }
  //获取平台
  GetDepartmentPlatform(){
    this.myarrearslist.GetDepartmentPlatform().subscribe(data => {
      if (data.Result) {
        this.platformData = JSON.parse(data.Data).PlatformList;
      }
    });
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
    this.myarrearslist.GetALLArrearsList(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.listData = JSON.parse(data.Data);
        if(this.listData.arrearlist && this.listData.arrearlist.length > 0){
          this.listData.arrearlist.forEach(item => {
            item["checked"] = false;
          });
        }
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
    this.importQuery.ExprotType = "1";//导出事业部、风险岗
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
  //催办选中的欠款
  pressDebt(){
    if (this.selectData.length > 0) {
      let hasPressDevt = this.selectData.filter(item => { return !item.CBBS || item.CBBS== null || item.CBBS== "0" });
      if(hasPressDevt.length < this.selectData.length){
        this.windowService.alert({ message: "选中的欠款已催办", type: "warn" });
      }else{
        let query = {CBList: this.selectData};
        this.myarrearslist.SendMailCB(query).subscribe(data => {
          if (data.Result) {
            this.search(this.query);
            this.selectData = [];
            //取消半选状态样式
            $(".icheckbox_square-blue").removeClass("indeterminate_square-blue");
            this.windowService.alert({ message: "催办成功", type: "warn" });
          }
        });
      }
    }else{
      this.windowService.alert({ message: "请选择欠款", type: "warn" });
    }
  }
  //路由 跟进列表
  routerFollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }
  //路由 新建跟进
  routerNewfollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }
  
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  //
  onCheckedChange(item){
    let index = this.selectData.indexOf(item);
    if (item.checked && index == -1) {
      this.selectData.push(item);
    }
    if (!item.checked && index > -1) {
      this.selectData.splice(index, 1);
    }
  }

}