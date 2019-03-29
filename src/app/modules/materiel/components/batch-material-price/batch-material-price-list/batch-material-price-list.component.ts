import { Component, OnInit } from '@angular/core';
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "../../../../../../app/shared/index";
import { WindowService } from "../../../../../../app/core";
import { dbomsPath } from "../../../../../../environments/environment";

import { BatchMaterialPriceListService,Query } from "../../../services/material-batch-material-price.service";

declare let window,localStorage;

@Component({
  templateUrl: 'batch-material-price-list.component.html',
  styleUrls: ['batch-material-price-list.component.scss','../../../scss/materiel.component.scss']
})

export class BatchMaterialPriceListComponent implements OnInit {

  pagerData:any=new Pager();
  query:Query=new Query();//实例化查询参数
  isSearchResult:boolean=true;//是否存在查询结果
  materialList:any=[];//物料列表

  constructor(
    private batchMaterialPriceListService:BatchMaterialPriceListService
  ) { }

  ngOnInit() {
    this.watchLocalStrong();//监听localStorage值的变化，用以刷新列表
   }

  //新建物料批次维护
  newMaterialBatchPrice(){
    window.open(dbomsPath+'mate/m-batch-material-price-edit/0');
  }

  //跳转至详情页
  getDetail(I){
    window.open(dbomsPath+'mate/m-batch-material-price-edit/'+this.materialList[I].RecordID);
  }

  //请求参数获取列表
  initData(){
    this.batchMaterialPriceListService.getMaterialList(this.query).then(data=>{
      if(data.Result){
        let reqData=JSON.parse(data.Data);
        this.materialList=reqData.List;//保存返回的列表
        this.pagerData.set({
          total:reqData.TotalCount,
          pageNo:reqData.CurrentPage,
          totalPages:reqData.PageCount,
          pageSize:reqData.PageSize
        });

        //是否显示缺省页面
        this.isSearchResult = this.materialList.length>0?true:false;
        console.log(this.materialList,reqData);
      }
    })
  }

  //分页
  onChangePage(e){
    this.query.PageIndex=e.pageNo;
    this.query.PageSize=e.pageSize;
    this.initData();
  }

      //监听loaclstrong，用来确认是否刷新列表页
      watchLocalStrong(){
        let that=this;
        window.addEventListener("storage", function (e) {//监听localstorage
          //console.log(e.newValue,e);
          if(e.key==="batchMaterialPrice"&&e.newValue.search("save")!=-1){
            that.initData();
            localStorage.removeItem('changeMaterial');
          }
      });
      }

}