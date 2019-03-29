import { Component, OnInit } from '@angular/core';
import { WindowService } from "app/core";
import { MyreceivepaymentlistService, MyreceivepaymentlistQuery } from "../../service/rp-myreceivepaymentlist.service";
import * as moment from 'moment';
import { Pager } from 'app/shared/index';

@Component({
  selector: 'db-myreceivepaymentlist',
  templateUrl: './myreceivepaymentlist.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class MyreceivepaymentlistComponent implements OnInit {

  constructor(
    private myreceivepaymentlist: MyreceivepaymentlistService,
    private windowService: WindowService) { }

  query: MyreceivepaymentlistQuery = new MyreceivepaymentlistQuery();//查询条件
  companyData: any[] = [];//所属公司
  banksubjectData: any[] = [];//核销系统科目列表
  listData;//列表数据
  loading: boolean = false;
  selectedBankSubject = {BANKACCOUNT:"",BANKNAME:"请选择",SUBJECT_NO:""};//科目选中项
  pagerData = new Pager();//分页
  sortRule: string = "up";//列表排序 up-升序 down-降序
  ngOnInit() {
    this.getCompanyData();
    this.getBankSubject();
    this.search(this.query);
  }

  //获取公司列表
  getCompanyData(){
    this.myreceivepaymentlist.getCompanyData().subscribe(data => {
      if (data.Result) {
        this.companyData = JSON.parse(data.Data).CompanyList;
      }
    });
  }
  //获取核销系统科目列表
  getBankSubject(){
    this.myreceivepaymentlist.getBankSubject().subscribe(data => {
      if (data.Result) {
        this.banksubjectData = JSON.parse(data.Data);
      }
    });
  }
  //选择科目
  onSelecteBankSubject(selecteddata){
    if(selecteddata["SUBJECT_NO"]){
      this.query.bankAcc = selecteddata.SUBJECT_NO;
    }
  }
  //查询
  search(query){
    this.loading = true;
    if (query.startDate) {
      query.startDate = moment(query.startDate).format("YYYY-MM-DD");
    }
    if (query.EndDate) {
      query.EndDate = moment(query.EndDate).format("YYYY-MM-DD");
    }
    this.query.currage = this.pagerData.pageNo;
    this.query.pagesize = this.pagerData.pageSize;
    this.myreceivepaymentlist.getBankBills(query).subscribe(data => {
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
  //tab切换
  tabSearch(claimstate){
    if (this.query.ClaimState != claimstate) {
      this.query.ClaimState = claimstate;
      this.query.currage = 1;
      this.search(this.query);
    }
  }
  
  //列表排序
  sortCurrentTableData(){
    if (this.sortRule == "up") {
      this.sortRule = "down";
      this.listData.Bills = this.listData.Bills.sort(function(a, b) {
        return a.ArriveDate > b.ArriveDate ? 1 : -1;
      });
    }else {
      this.sortRule = "up";
      this.listData.Bills = this.listData.Bills.sort(function(a, b) {
        return a.ArriveDate < b.ArriveDate ? 1 : -1;
      });
    }
  }
  //重置查询条件
  reset(){
    this.query = new MyreceivepaymentlistQuery();
    this.selectedBankSubject = {BANKACCOUNT:"",BANKNAME:"请选择",SUBJECT_NO:""}
    this.search(this.query);
  }

}
