import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { dbomsPath,environment } from "environments/environment";
import { Router } from "@angular/router";

import { Query,SupplierTrackService } from "../../services/supplierTrack.service";

declare var window;

@Component({
  selector: 'supplier-track',
  templateUrl: 'supplier-supplierTrack.component.html',
  styleUrls:['supplier-supplierTrack.component.scss','../../scss/supplier.component.scss']
})

export class SupplierTrack implements OnInit {

  public pagerData = new Pager();
  public query:Query=new Query;
  public searchList:any=[];//保存返回的供应商跟踪列表
  public isHide:boolean=false;//是否隐藏缺省页
  public isUnSelectDate:boolean=false;//是否是锁定日期组件，阻止选择
  
  constructor(
    private windowService:WindowService,
    private supplierTrackService:SupplierTrackService,
    private el:ElementRef
  ) { }

  @ViewChild('checkbox') public checkbox:ElementRef

  ngOnInit() {
    this.watchLocalStrong();//监听localStrong，判断是否刷新列表
  }

  //新建供应商跟踪
  addData(){
    window.open(dbomsPath+"supplier/edit-supplier-nct/"+0);
  }

  onChangePager(e: any) {
    this.query.pageNo = e.pageNo;
    this.query.pageSize = e.pageSize;

    this.initData(this.query);
  }

  initData(query) {//向数据库发送请求

    this.supplierTrackService.getSupplierTrackList(query).then(data => {

      if (data.success) {
        //设置分页器
        this.pagerData.set(data.data.pager);
        //console.log(this.pagerData);
        //this.loading = false;      
        this.searchList = data.data.list;
        console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
          this.isHide = false;//显示缺省页面 
        } else {
          this.isHide = true;//不显示缺省页面 
        }
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }
    });
  }

  //跳转到所点击供应商的详情页
  getDetail(Id){
    window.open(dbomsPath+"supplier/edit-supplier-nct/"+Id)
  }

  //获取公司代码
  getCompany(e){
   this.query.CompanyCode=e[1];
  }

  //搜索
  search(){
    this.query.pageNo=1;
    this.initData(this.query);
  }

  //重置
  reset(){
    this.query=new Query();
    this.isUnSelectDate=false;
  }

  //锁定日期组件
  lockMydatepicker(){
    console.log(this.checkbox);
    //this.isUnSelectDate=true;

    if(!this.checkbox.nativeElement.checked){
      this.isUnSelectDate=true;
      this.query.AutoRenewal=1;
    }else{

      this.isUnSelectDate=false;
      this.query.AutoRenewal=null;
    }
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      console.log(e.newValue,e);
      if(e.key==="supplierTrack"&&e.newValue.search("save")!=-1){//如果是暂存
        that.initData(that.query);
        localStorage.removeItem('supplierTrack');
      }
  });
  }

  
}