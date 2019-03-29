import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import { Pager } from 'app/shared/index';
import { ScTemplateService, MydisputedealtlistQuery } from "../../service/sc-template.service";
declare var document,Blob,URL,window;

@Component({
  selector: 'db-ec-disputedealt-list',
  templateUrl: './ec-disputedealt-list.component.html',
  styleUrls: ['./ec-disputedealt-list.component.scss']
})
export class EcDisputedealtListComponent implements OnInit {

  constructor(
    private router: Router,
    private mydisputedealtlist: ScTemplateService,
    private windowService: WindowService) { }

  query: MydisputedealtlistQuery = new MydisputedealtlistQuery();//查询条件
  listData;//列表数据
  loading: boolean = false;
  pagerData = new Pager();//分页
  companyData: any[] = [];//所属公司
  platformData: any[] = [];//所属公司
  selectedSeller = {companycode:"",company:"请选择"};//卖方选中项
  ngOnInit() {
    this.getCompanyData();
    this.GetDepartmentPlatform();
    this.search(this.query);
  }

  //获取公司列表
  getCompanyData(){
    this.mydisputedealtlist.getCompanyData().subscribe(data => {
      if (data.Result) {
        this.companyData = JSON.parse(data.Data).CompanyList;
      }
    });
  }
  //获取平台
  GetDepartmentPlatform(){
    this.mydisputedealtlist.GetDepartmentPlatform().subscribe(data => {
      if (data.Result) {
        this.platformData = JSON.parse(data.Data).PlatformList;
      }
    });
  }

  /**选择卖方事件 */
  onSelecteCompany(selectedcompany){
    this.query.SellerCompanyCode = selectedcompany["companycode"];
  }
  //查询
  search(query,type?){
    this.loading = true;
    if (type == "clickSearchBtn") {
      this.query.CurrentPage = 1;
    }else{
      this.query.CurrentPage = this.pagerData.pageNo;
    }
    this.query.PageSize = this.pagerData.pageSize;
    this.mydisputedealtlist.GetDisputedealtList(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.listData = JSON.parse(data.Data);
        if (type == "clickSearchBtn"){
          this.pagerData.set({
            pageNo: 1
          });
        }
        this.pagerData.set({
          total: this.listData.totalcount,
          totalPages: Math.ceil(this.listData.totalcount / this.pagerData.pageSize)
        });
        
      }
    });
  }
  
  //重置查询条件
  reset(){
    this.pagerData = new Pager();
    this.query = new MydisputedealtlistQuery();
    this.selectedSeller = {companycode:"",company:"请选择"};//卖方选中项
    this.search(this.query);
  }
  //路由 新建跟进
  routerNewdis(url){
    this.router.navigate([url]);
  }

}
