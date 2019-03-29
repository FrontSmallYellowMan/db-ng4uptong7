import { Component, OnInit,ElementRef,Renderer2,ViewChildren,ViewChild } from '@angular/core';
import { Pager } from 'app/shared/index';

import { WindowService } from "app/core";
import { Observable } from 'rxjs';
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

import { MaterielChangeService, Query, MaterielChangeData } from '../../services/materiel-materielChange.service';
declare var $,window,localStorage;
@Component({
  templateUrl: 'materiel-materielChange-myapply.component.html',
  styleUrls: ['materiel-materielChange-myapply.component.scss', '../../scss/materiel.component.scss']
})

export class MaterielChangeMyApplyComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  pagerData = new Pager();
  query: Query = new Query();
  options;
  highSearchShow: boolean = false;//高级搜索

  isHide: boolean = true;//显示或者隐藏缺省页面或者搜索列表页面

  searchList: any;//用于存储搜索结果列表

  isChangeColor: boolean = false;//是否改变字体颜色

  approvalStaus: boolean = true;//根据查询条件判断，如果是“已完成”和“草稿”则不显示“审批环节”和“审批人”


  constructor(
    private materielChangeService: MaterielChangeService,
    private windowService: WindowService,
    private router: ActivatedRoute,
    private renderer:Renderer2) { }


  // ngOnInit() {

  //   let that = this;
  //   window.addEventListener("focus", () => {
  //     that.initData(that.query);
  //     console.log(1);
  //   });
  //   //this.initData(this.approvalListData);
  //   // window.removeEventListener("focus", () => {
  //   //   that.initData(that.query);
  //   // });

  // }

@ViewChildren('tab') public tab:ElementRef;

  ngOnInit() {
    this.watchLocalStrong();//监听localStorage的状态
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  changeWidth() {    //点击全选按钮后table宽度不变
    if (!this.fullChecked) {
      $('.table-list').width($('.table-list').outerWidth());
      $('.table-list tbody tr:eq(0)').find('td').each(function () {
        $(this).width($(this).outerWidth() - 16);
        // console.log($(this).width())
      });
    }
  }
  //打开高级搜索
  openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  getOptionList() {
    this.options = [1, 2, 3, 4];
  }

  onTab(e) {//切换选项（全部，审批中，已完成，草稿）

    let liType = this.tab["_results"][0].nativeElement.children;
    
    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";
    //console.log(e.target);

    this.query.ApproveSection=e.target.getAttribute("data-state");
    this.query.ApplicationState="";
    this.approvalStaus=this.query.ApproveSection==="3"?false:true;

    //this.isHide = true;//显示搜索列表页 
    this.query.PageNo = 1;
    this.initData(this.query);//请求数据库


  }

  search() {//点击搜索按钮的搜索
    //this.isHide = true;//显示搜索列表页    
    // console.log(this.query);
    // if (this.query.BeginDate != "") {
    //   this.query.BeginDate = new Date(this.query.BeginDate).toLocaleDateString();
    // }
    // if (this.query.EndDate != "") {
    //   this.query.EndDate = new Date(this.query.EndDate).toLocaleDateString();
    // }
    this.initData(this.query);
  }

  reset() {//重置搜索数据
    let nowState = this.query.ApproveSection;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.query = new Query;
    this.isChangeColor = false;//重置审批环节下拉选框的字体颜色
    this.query.ApproveSection = nowState;
    //this.query.PageSize = 10;
    this.query.PageNo = 1;
  }


  deleteList(param: any) {//删除列表数据

    let callback = data => {

      if (data.success) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.query.PageNo=1;
        this.initData(this.query);
        this.windowService.alert({ message: data.message, type: "success" });
      } else {
        this.windowService.alert({ message: data.message, type: "fail" })
      }
    }

    if (typeof param == "string") {//删除单条数据
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: (v) => {
          if (v) {
            console.log(1);
            this.materielChangeService.deleteDataMaterielChange([param]).then(callback);
            console.log(param);
          }

        }
      });
    } else {//删除多条数据
      this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
        if (v) {
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            if (item.ApproveSection != 2) {
              ObList.push(this.materielChangeService.deleteDataMaterielChange([item.ID]));
            } else {
              this.windowService.alert({ message: "审批中，不能删除", type: "fail" });
            }

          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
        }
      });
    }

  }

  onChangePager(e: any) {//分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.query.PageNo = e.pageNo;
    this.query.PageSize = e.pageSize;

    this.initData(this.query);
  }

  initData(query: Query) {//向数据库发送请求
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.materielChangeService.searchMaterielChange(this.query).then(data => {

      //console.log(data.data.pager);
      //设置分页器
      this.pagerData.set(data.data.pager);
      //this.loading = false;      
      this.searchList = data.data.list;
      console.log(this.searchList);
      if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
        this.isHide = false;//显示缺省页面 
      } else {
        this.isHide = true;
      }

    });
  }

  getDetail(ID, ApproveSection) {//查看详情

    if (ApproveSection != "草稿") {
      this.router.params.subscribe(params => {//获取路由传过来的值
        window.open(dbomsPath + "mate/edit-amc/" + params.id + ID);
      });
    } else {
      this.router.params.subscribe(params => {//获取路由传过来的值
        window.open(dbomsPath + "mate/edit-nmc/" + params.id + ID);
      });
    }


  }

  changeFontColor() {//改变select选择后字体的颜色
    this.isChangeColor = true;
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="changeMaterial"&&e.newValue.search("save")!=-1){
        that.initData(that.query);
        localStorage.removeItem('changeMaterial');
      }else if(e.key==="changeMaterial"&&e.newValue.search("submit")!=-1){
        that.initData(that.query);
        localStorage.removeItem('changeMaterial');
      }
  });
  }

}