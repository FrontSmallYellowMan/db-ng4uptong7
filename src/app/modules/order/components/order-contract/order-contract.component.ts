import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { NewContractComponent } from './newContract/new-contract.component';
import {
  ContractList,
  MaterialInfo,
  ContractMaterialService
} from './../../services/contract-material.service';

export class PageNo { };
@Component({
  templateUrl: 'order-contract.component.html',
  styleUrls: ['./order-contract.component.scss']
})
export class OrderContractComponent implements OnInit {
  public pagerData = new Pager();
  public reloading = false;//当是否从新加载
  public currentType = 'undone';//当前列表类型
  public currentTypeName: string;//当前页类型名称
  public default = false;//默认缺省页是否显示
  public loading = false;//默认缺省页是否显示
  public idSort: boolean = false;//排序
  public materialInfo: MaterialInfo[] = [];//物料信息列表
  public contractList = new ContractList();//查询条件
  public modalContract: XcModalRef;//模态框
  public localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private ContractMaterialService: ContractMaterialService,
  ) { }

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
    this.contractList.ItCode = this.localUserInfo.ITCode;
    this.contractList.ContractState = '2';
    //聚焦从新调用刷新数据
    let that = this;
    window.addEventListener("focus", () => {
      if (this.reloading) {
        this.getEnquiryMaterial(this.contractList);
      }
    });
  }
  //切换完成、未完成、全部按钮
  tabMenu(type) {
    switch (type) {
      case 'undone':
        this.currentType = 'undone';
        this.changeTab('2');
        this.getEnquiryMaterial(this.contractList);
        break;
      case 'completed':
        this.currentType = 'completed';
        this.changeTab('1');
        this.getEnquiryMaterial(this.contractList);
        break;
      case 'all':
        this.currentType = 'all';
        this.changeTab('0');
        this.getEnquiryMaterial(this.contractList);
        break;
      default:
        break;
    }
  }
  //完成、未完成、全部三个切换的信息重置公共提取
  changeTab(tabNum) {
    this.currentTypeName = '';
    this.contractList.ContractState = tabNum;
    this.contractList.PageIndex = 1;
    this.pagerData.set({
      pageNo: this.contractList.PageIndex
    });
    this.contractList.ContractInfo = '';
  }
  //获取列表接口
  getEnquiryMaterial(param) {
    this.loading = true;
    this.ContractMaterialService.enquiryMaterial(param).subscribe(res => {
      if (res.Result) {
        if (res.Data) {
          console.log(res.Data);
          this.materialInfo = res.Data.List;
          console.log(this.materialInfo.length);
          if (this.materialInfo.length == 0) {
            this.default = true;
          } else {
            this.default = false;
          }
          this.pagerData.set({

              total: parseInt(res.Data.TotalCount),
              totalPages: parseInt(res.Data.PageCount),
              pageNo: parseInt(res.Data.CurrentPage)
            
          });
        } else {
          this.default = true;
        }
      } else {
        this.windowService.alert({ message: res.Message, type: "fail" });
      }
      this.loading = false;
    });
  }
  //合同号排序
  contractSort() {
    this.idSort = !this.idSort;
    this.materialInfo.reverse();
  }
  //搜索
  searchItcode() {
    if (this.loading == false) {
      //重置页码
      this.contractList.PageIndex = 1;
      this.pagerData.set({
        pageNo: this.contractList.PageIndex
      });
      this.contractList.ContractInfo = this.contractList.ContractInfo.replace(/\s/g, "");
      this.getEnquiryMaterial(this.contractList);
    }
  }
  //可开物料跳转
  goLink(item, goFlag) {
    if (goFlag == 1) {
      this.reloading = true;
      window.open(dbomsPath + "order/material-detail?ContractCode=" + item.ContractCode);
    } else {
      this.windowService.alert({ message: '没有可开单的物料', type: "warn" });
    }
  }
  //新建合同物料
  addContract() {
    // //在初始化的时候 创建模型
    this.modalContract = this.xcModalService.createModal(NewContractComponent);
    // //模型关闭的时候 如果有改动，请求刷新
    this.modalContract.onHide().subscribe((data) => {
    })
    this.modalContract.show();
  }
  public currentPageSize;//当前每页显示条数
  // public initChange = true;//是否为初始化页面调取
  onChangePager(e: any) {
    //非第一页，切换条数。跳为第一页
    if (this.currentPageSize != e.pageSize) {
      this.pagerData.pageNo = 1;
    }
    this.currentPageSize = e.pageSize;
    this.contractList.PageIndex = this.pagerData.pageNo;
    this.contractList.PageSize = this.pagerData.pageSize;
    this.getEnquiryMaterial(this.contractList);
  }
}
