import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import {
  PostContractData,
  OrderListService
} from './../../../services/order-list.service';
export class PageNo { }

@Component({
  templateUrl: './new-contract.component.html',
  styleUrls: ['./new-contract.component.scss']
})
export class NewContractComponent implements OnInit {
  public modal: XcModalRef;
  public loadings: boolean = false;//加载中
  public defauls: boolean = false;
  public pagerData = new Pager();
  public postContractData: PostContractData = new PostContractData();//获取列表传送数据
  public contractList: any[] = [];//合同列表数据
  public localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  public initChanges = true;
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderListService: OrderListService
  ) { }
  //初始化下拉框数据
  initData() {
    this.loadings = true;
    this.orderListService.getContractList(this.postContractData).subscribe(
      data => {
        if (data.Result) {
          let res = JSON.parse(data.Data);
          console.log(res)
          this.contractList = res.ContractList;
          if (this.contractList.length < 1) {
            this.defauls = true;
          } else {
            this.pagerData.set({
              total: res.TotalCount,
              totalPages: res.PageCount,
            });
            this.defauls = false;
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
          this.defauls = true;
        }
        this.loadings = false;
      }
    );
  }


  ngOnInit() {
    if (!this.localUserInfo) {
      this.windowService.confirm({ message: "当前登录信息失效，请重新登录!" }).subscribe({
        next: (v) => {
          if (v) {
            window.location.href = dbomsPath + "login";
          }
        }
      })
      return;
    }
    this.postContractData = {
      Flag: 1,
      InputCondition: "",//合同单号,客户名称
      //   CurrentITCode: this.localUserInfo["ITCode"],//用户itcode
      OType: 0,
      CurrentPage: 1,//当前页
      PageSize: 8  //每页数据条数
    }
    this.initData();
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {

    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }
  //搜索
  search() {
    if (this.loadings == false) {
      this.postContractData.InputCondition = this.postContractData.InputCondition.trim();
      this.postContractData.CurrentPage = 1;
      this.pagerData.set({
        pageNo: this.postContractData.CurrentPage
      })
      this.postContractData.InputCondition = this.postContractData.InputCondition.replace(/\s/g, "");
      this.initData();
    }
  }
  // 选中进行跳转
  selected(Code) {
    window.open(dbomsPath + 'order/material-detail?ContractCode=' + Code);
    this.hide();
  }

  public currentPageSize;//当前每页显示条数
  onChangePage(e: any) {
    if (this.initChanges) {
      this.initChanges = false;
      return;
    }
    //   //非第一页，切换条数。跳为第一页
    //   if(this.currentPageSize != e.pageSize){
    //       this.pagerData.pageNo = 1;
    //   }
    this.currentPageSize = e.pageSize

    this.postContractData.InputCondition = this.postContractData.InputCondition || "";
    this.postContractData.CurrentPage = e.pageNo;
    //   this.postContractData.PageSize = e.pageSize;
    this.initData();
  }

}
