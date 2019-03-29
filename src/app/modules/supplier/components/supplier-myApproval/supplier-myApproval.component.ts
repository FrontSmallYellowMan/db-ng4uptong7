import { Component, OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from "app/core";
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

import { SupplierService, QueryMyApproval } from "../../services/supplier.service";

declare var window;

@Component({
  selector: 'supplier-mApproval',
  templateUrl: 'supplier-myApproval.component.html',
  styleUrls: ['supplier-myApproval.component.scss', '../../scss/supplier.component.scss']
})

export class SupplierMyApprovalComponent implements OnInit {

  pagerData = new Pager();
  queryMyApproval: QueryMyApproval = new QueryMyApproval();

  highSearchShow: boolean = false;//高级搜索
  searchList: any;//用来保存查询返回的结果列表 
  isHide: boolean = true;//是否显示缺省也

  constructor(
    private windowService: WindowService,
    private supplierService: SupplierService
  ) { }

  ngOnInit() { 
    this.watchLocalStrong();//监听localstrong的变化，用来判断是否刷新列表
  }


  //打开高级搜索
  openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  //新建物料数据修改
  addData() {
    window.open(dbomsPath + 'supplier/edit-supplier-ncs/' + 0);
  }
  //搜索
  search() {
    this.queryMyApproval.PageNo=1;
    this.initData( this.queryMyApproval);

  }
  //重置
  reset() {
    let nowState = this.queryMyApproval.TaskStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.queryMyApproval=new QueryMyApproval();
    this.queryMyApproval.TaskStatus = nowState;
    this.queryMyApproval.PageSize = 10;
  }

  onChangePager(e: any) {
    this.queryMyApproval.PageNo = e.pageNo;
    this.queryMyApproval.PageSize = e.pageSize;

    this.initData(this.queryMyApproval);
  }

  initData(queryMyApproval) {//向数据库发送请求
    
        this.supplierService.searchMyApproval(this.queryMyApproval).then(data => {
    
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
          }else{
            this.windowService.alert({message:data.message,type:"fail"});
          }  
        });
      }


  onTab(e) {//切换选项（全部，审批中，已完成，草稿）
    let liType = document.querySelectorAll(".m-state li");

    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";

    switch (e.target.getAttribute("data-state")) {
      case "myExamine":
        this.queryMyApproval.TaskStatus = "0";
        break;
      case "endExamine":
        this.queryMyApproval.TaskStatus = "1";
        break;
      case "sFinish":
        this.queryMyApproval.TaskStatus = "2";
        break;
      default:
        break;
    }

    //this.isHide = true;//显示搜索列表页 
    this.queryMyApproval.PageNo = 1;
    this.initData(this.queryMyApproval);
  }

  //获取审批页详情
  getDetail(i,CopyLink){
    //list.VendorId,list.TempNodeId,list.TaskId,
    let vendorId=this.searchList[i].VendorId;//保存供应商Id
    let modifyId=this.searchList[i].ModifyId;//保存修改供应商Id
    let actionType=this.searchList[i].ApplicationType;//保存申请单类型（1：新建供应商，2:修改供应商）
    //let tempNodeId=this.searchList[i].TempNodeId;//保存nodeid
    //let taskId=this.searchList[i].TaskId;//保存taskId
    //let instanceid=this.searchList[i].InstItemId;//保存instanceid
   // let taskState;this.searchList[i].TaskState==="未处理"?taskState="0":taskState="1";//保存审批状态，0:未处理，1:已处理
   // let ADP;//判断是否是加签审批
    //this.searchList[i].CopyLink.search("ADP")!=-1?ADP="1":ADP="0";//如果存在“ADP”则为加签审批

    let queryPromiseData:string=CopyLink.substring(CopyLink.indexOf('?'));//获取查询查询参数

    if(actionType==='1'){
      window.open(dbomsPath+`supplier/edit-supplier-as/e${vendorId}*${actionType}${queryPromiseData}`);
    }else{
      window.open(dbomsPath+`supplier/edit-supplier-asc/e${modifyId}*${vendorId}*${actionType}${queryPromiseData}`);      
    }
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {
      if(e.key==="editFinsh"&&e.newValue.search("approval")!=-1){
        console.log(e.newValue,e);
        that.initData(that.queryMyApproval);
        localStorage.removeItem('editFinsh');
      }
  });
  }


}