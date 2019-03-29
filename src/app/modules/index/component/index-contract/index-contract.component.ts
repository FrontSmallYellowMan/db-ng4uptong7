import { Component, OnInit } from '@angular/core';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared';
import { ContractQuery, IndexContractService, Contract } from '../../services/index-contract.service';
import { Router, ActivatedRoute } from "@angular/router";
declare var window;

@Component({
  selector: 'db-index-contract',
  templateUrl: './index-contract.component.html',
  styleUrls: ['./index-contract.component.scss']
})
export class IndexContractComponent implements OnInit {
  
  loading: boolean;
  pagerData: Pager = new Pager();
  query: ContractQuery = new ContractQuery();
  contractList: Contract[] = [];//审批列表

  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private windowService: WindowService,
    private indexContractService: IndexContractService) {}

  ngOnInit() {
    this.query.Type = this.routerInfo.snapshot.queryParams['type'];
  }

  //初始化数据
  initData(query: ContractQuery) {
    this.loading = true;
    this.indexContractService.getContractList(query).then(data => {
      this.loading = false;
      if(data.Result){
        let res = JSON.parse(data.Data);
        this.contractList = res.ListContract;
        this.pagerData.set({
          pageNo: res.CurrentPage, 
          pageSize: res.PageSize, 
          total: res.TotalCount, 
          totalPages: Math.ceil(res.TotalCount/res.PageSize)
        });
      }else{
        this.windowService.alert({message: data.Message, type: 'fail'});
      }

    })
  }

  onChangePager(e) {
    this.query.PageSize = e.pageSize;
    this.query.CurrentPage = e.pageNo;

    this.initData(this.query);
  }

  //切换标签
  toggle(type) {
    this.query.Type = type;
    this.query.CurrentPage = 1;
    this.initData(this.query);
  }

  //搜索
  search() {
    this.query.CurrentPage = 1;
    this.initData(this.query);
  }

  //打开页面
  openContractPage(item: string) {
    let serverUrl:string = "http://" + window.location.host + "/dboms";
    let targetUrl:string = "/india/contractview";
    let id = item["SC_Code"];
    window.open(serverUrl + targetUrl + "?SC_Code=" + id);
  }
}
