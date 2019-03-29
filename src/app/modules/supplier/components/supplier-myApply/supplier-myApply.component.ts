import { Component, OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from "app/core";
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

import { SupplierService, QueryMyApply,DeleteSupplierTemp } from "../../services/supplier.service";

declare var $;
declare var window;

@Component({
  selector: 'supplier-mApply',
  templateUrl: 'supplier-myApply.component.html',
  styleUrls: ['supplier-myApply.component.scss', '../../scss/supplier.component.scss']
})

export class SupplierMyApplyComponent implements OnInit {

  pagerData = new Pager();
  queryMyApply: QueryMyApply = new QueryMyApply();
  deleteSupplierTemp:DeleteSupplierTemp=new DeleteSupplierTemp();

  //复选框所需参数
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  actionType:number;//删除时草稿时供应商的类型（1:新建，2:修改）

  isHide:boolean=true;//是否隐藏搜索结果页面

  searchList:any;//用来保存从数据库返回的列表

  constructor(
    private supplierService: SupplierService,
    private windowService: WindowService
  ) { }

  ngOnInit() { 
    this.watchLocalStrong();//监听localstrong的变化，用来判断是否刷新列表
  }

  //新建物料数据修改
  addData() {
    window.open(dbomsPath + 'supplier/edit-supplier-ncs/' + 0);
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  deleteList(param: any) {//删除列表数据
    //console.log(param);

    // this.commonlyMaterielService.searchCommonlyMateriel(this.reqDeleteList).then(data => {        
    // });
    let callback = data => {
      if (data.success) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.queryMyApply.pageNo=1;
        this.initData(this.queryMyApply);
        this.windowService.alert({ message: "删除成功", type: "success" });
      } else {
        this.windowService.alert({ message: data.message, type: "fail" })
      }
    }

    if (typeof param == "string") {//删除单条数据
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: (v) => {
          if (v) {
            this.supplierService.deleteSuppliertemp({param}).then(callback);
          }

        }
      });
    } else {//删除多条数据
      this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
        if (v) {

          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            if (item.ApplicationState != 1) {
              ObList.push(this.supplierService.deleteSuppliertemp({"VendorId":item.vendorid,"ModifyId":item.modifyid,"ActionType":this.actionType=item.cateType==="新建供应商"?1:2}));
            } else {
              this.windowService.alert({ message: "BUXUSHAN", type: "fail" });
            }

          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
        }
      });
    }

  }

  onChangePage(e: any) {//分页代码
    this.queryMyApply.pageNo = e.pageNo;
    this.queryMyApply.pageSize = e.pageSize;

    this.initData(this.queryMyApply);
  }

  initData(query: QueryMyApply) {//向数据库发送请求
    this.supplierService.searchMyApplyList(query).then(data => {
      this.fullChecked = false;
      this.fullCheckedIndeterminate = false;
      this.checkedNum = 0;

      if (data.success) {
        //设置分页器
        this.pagerData.set(data.data.pager);

        //this.loading = false;      
        this.searchList = data.data.list;
        console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
          this.isHide = false;//显示缺省页面 
        } else {
          this.isHide = true;//显示列表页面
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
      case "sAll":
        this.queryMyApply.ApproveSection = "3";
        break;
      case "sExamine":
        this.queryMyApply.ApproveSection = "1";
        break;
      case "sFinish":
        this.queryMyApply.ApproveSection = "2";
        break;
      case "sTemp":
        this.queryMyApply.ApproveSection = "0"
        break;
      default:
        break;
    }

    //this.isHide = true;//显示搜索列表页 
    this.queryMyApply.pageNo = 1;
    this.initData(this.queryMyApply);//请求数据库
  }

  //点击全选按钮后table宽度不变
  changeWidth(){
    if(!this.fullChecked){
         $('.table-list').width($('.table-list').outerWidth());
         $('.table-list tbody tr:eq(0)').find('td').each(function(){
             $(this).width($(this).outerWidth()-16);
             console.log($(this).width())
         }); 
    }
}

  //搜索数据
  searchData(){
    this.queryMyApply.pageNo=1;
    this.initData(this.queryMyApply);
  }

  //获取详情页的数据
  getDetail(Id,modifyid,ActionType,wfstatus) {
    let actionType;//是新建供应商（1）还是修改供应商（2）
    ActionType == "新建供应商"?actionType=1:actionType = 2;

    if ((wfstatus === '0'||wfstatus === '7')&&actionType===1) {//如果为草稿，类型为新建供应商
      window.open(dbomsPath + "supplier/edit-supplier-ncs/" + Id);
    }else if((wfstatus === '0'||wfstatus === '7')&&actionType===2){//如果为草稿，类型为修改供应商
      window.open(dbomsPath + `supplier/edit-supplier-ncs/${modifyid}?supplierchange=true`);
    } else if((wfstatus != '0'&&wfstatus != '7')&&actionType===1){
      //window.open(dbomsPath + `supplier/edit-supplier-as/a${Id}?actionType=${actionType}`);
      window.open(dbomsPath + `supplier/edit-supplier-as/a${Id}*${actionType}`);    
    }else if((wfstatus != '0'&&wfstatus != '7')&&actionType===2){
      window.open(dbomsPath + `supplier/edit-supplier-asc/a${modifyid}*${Id}*${actionType}`);
    }

  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="editFinsh"&&e.newValue.search("tempSave")!=-1){//如果是暂存
        that.initData(that.queryMyApply);
        localStorage.removeItem('editFinsh');
      }else if(e.key==="editFinsh"&&e.newValue.search("tempSave0")!=-1){//如果是暂存
        that.initData(that.queryMyApply);
        localStorage.removeItem('editFinsh');
      }else if(e.key==="editFinsh"&&e.newValue.search("submit")!=-1){//如果是提交
        that.initData(that.queryMyApply);
        console.log(e.newValue,e);
        localStorage.removeItem('editFinsh');
      }
  });
  }

}