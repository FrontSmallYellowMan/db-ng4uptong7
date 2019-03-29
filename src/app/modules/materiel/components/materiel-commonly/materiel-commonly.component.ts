import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "app/shared/index";
import { WindowService } from "app/core";
import { Observable } from "rxjs";
import { dbomsPath } from "environments/environment";

import {
  ReqData,
  ReqSearchData,
  ReqDeleteList,
  ReqEditMateriel,
  CommonlyMaterielAndReturnService,
  ExtensionListDate
} from "../../services/materiel-commonlyMateriel&return.service";

import { MaterielCommunicationService } from "../../services/materiel-communication.service";

declare var $,window,localStorage;

//export const dbomspath="/dboms/";
@Component({
  templateUrl: "materiel-commonly.component.html",
  styleUrls: [
    "materiel-commonly.component.scss",
    "../../scss/materiel.component.scss"
  ]
})
export class MaterielCommonlyComponent implements OnInit {
  reqData: ReqData = new ReqData();
  reqSearchData: ReqSearchData = new ReqSearchData();
  reqDeleteList: ReqDeleteList = new ReqDeleteList();
  reqEditMateriel: ReqEditMateriel = new ReqEditMateriel();
  extensionListDate: ExtensionListDate = new ExtensionListDate();

  searchList: any; //存储搜索到的数据

  pagerData: any = new Pager();
  editId: string;
  fullChecked = false;
  fullCheckedIndeterminate = false;
  checkedNum = 0;

  isSearchResult: boolean = false; //是否显示搜索结果，默认为不显示
  isSearch: boolean = false; //是否点击搜索按钮

  isUnExtend: boolean; //是否允许扩展

  loading: boolean = false; //加载中效果

  public titleli = "我的申请";
  public dataCreat = {
    title: "新建申请",
    list: [
      {
        label: "新建一般物料",
        url: "/mate/edit-newMateriel/" + 0
      },
      {
        label: "新建返款服务",
        url: "/mate/edit-nrs/" + 0
      },
      {
        label: "新建物料申请模版",
        url: "/mate/m-at/"
      },
      {
        label: "新建物料主数据修改",
        url: "/mate/m-dm"
      },
      {
        label: "新建扩展平台维护",
        url: "/mate/m-ep/"
      },
      {
        label: "新建扩展物料",
        url: "/mate/edit-extendmateriel/" + 0
      },
      {
        label: "新建物料变更"
      }
    ]
  };

  constructor(
    private windowService: WindowService,
    private commonlyMaterielService: CommonlyMaterielAndReturnService,
    private router: Router,
    private materielCommunicationService:MaterielCommunicationService
  ) {}

  @ViewChild("form") public form: NgForm;

  ngOnInit() {
    this.watchLocalStrong();//监听localStorage的状态
  }

  //检查是否全选
  CheckIndeterminate(e) {
    this.fullCheckedIndeterminate = e;
    console.log(1);
  }

  //按照物料ERP编号，供应商SAP编号，申请人，启止时间搜索数据
  search() {
    //this.isSearchResult = true;//显示搜索列表
    this.reqSearchData.ApplyType = 1;
    this.reqSearchData.PageNo = 1;

    this.initData(this.reqSearchData);
    //console.log(this.reqSearchData);
  }
  //重制搜索条件
  searchReset() {
    this.reqSearchData = new ReqSearchData();
    this.reqSearchData.PageSize = 10;
  }
  //点击全选按钮后table宽度不变
  changeWidth() {
    if (!this.fullChecked) {
      $(".table-list").width($(".table-list").outerWidth());
      $(".table-list tbody tr:eq(0)")
        .find("td")
        .each(function() {
          $(this).width($(this).outerWidth() - 16);
        });
    }
  }
  //删除列表数据
  deleteList(param: any) {
    // this.commonlyMaterielService.searchCommonlyMateriel(this.reqDeleteList).then(data => {
    // });
    let callback = data => {
      if (data.success) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.reqSearchData.PageNo = 1;
        this.initData(this.reqSearchData);
        this.windowService.alert({ message: data.message, type: "success" });
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }
    };

    if (typeof param == "string") {
      //删除单条数据
      this.windowService.confirm({ message: "确定删除？" }).subscribe({
        next: v => {
          if (v) {
            if (this.reqData.InfoStatus != 1) {
              //已生成物料编号的，将不可删除
              this.commonlyMaterielService
                .deleteListElement({ MaterialRecordID: param, ApplyType: 1 })
                .then(callback);
            }
          }
        }
      });
    } else {
      //删除多条数据
      this.windowService
        .confirm({ message: `确定删除您选中的${this.checkedNum}项？` })
        .subscribe(v => {
          if (v) {
            let ObList = [];
            param.filter(item => item.checked === true).forEach(item => {
              ObList.push(
                this.commonlyMaterielService.deleteListElement({
                  MaterialRecordID: item.MaterialRecordID,
                  ApplyType: 1
                })
              );
            });
            Observable.merge
              .apply(null, ObList)
              .toPromise()
              .then(callback);
          }
        });
    }
  }
  //编辑一般物料
  editMateriel(MaterialRecordID, InfoStatus) {
    if (InfoStatus != 1) {
      window.open(dbomsPath + "mate/edit-newMateriel/" + MaterialRecordID);
    } else {
      window.open(dbomsPath + "mate/edit-scm/" + MaterialRecordID);
    }
    //this.router.navigate(['/mate/edit-newMateriel',MaterialRecordID]);
  }

  //分页代码
  onChangePage(e: any) {
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.reqSearchData.PageNo = e.pageNo;
    this.reqSearchData.PageSize = e.pageSize;

    this.initData(this.reqSearchData);
  }

  //向数据库发送请求
  initData(reqSearchData: ReqSearchData) {
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.reqSearchData.ApplyType = 1;

    this.commonlyMaterielService
      .searchCommonlyMateriel(this.reqSearchData)
      .then(data => {
        if (data.success) {
          //设置分页器
          this.pagerData.set(data.data.pager);
          //this.loading = false;
          this.searchList = data.data.list;
          console.log(this.searchList);
          if (this.searchList == "") {
            //判断如果查询列表为空，则显示缺省页面
            this.isSearchResult = false; //显示缺省页面
          } else {
            this.isSearchResult = true; //隐藏缺省页
          }
        }else{
            this.windowService.alert({message:data.message,type:"fail"});
        }
      });
  }

  //新建物料数据修改
  addData() {
    window.open(dbomsPath + "mate/edit-newMateriel/" + 0);
  }

  //扩展物料
  extendMateriel(mID, mERP) {
    if (!!mID && !!mERP) {
      //如果传入的物料编号和主键ID都不为空
      this.extensionListDate.MaterialRecordId = mID;
      this.extensionListDate.MaterialERPCode = mERP;
      this.loading = true; //显示loading等待画面
      this.commonlyMaterielService
        .extension(this.extensionListDate)
        .then(data => {
          if (data.success) {
            this.loading = false; //隐藏等待画面
            this.windowService
              .alert({ message: "扩展物料成功", type: "success" })
              .subscribe(() => {
                //如果扩展成功，请求一次接口，刷新列表页面
                this.isUnExtend = true;
                this.initData(this.reqSearchData);
              });
          } else {
            this.windowService.alert({ message: data.message, type: "fail" });
            this.loading = false; //隐藏等待画面
          }
        });
    } else {
      this.windowService.alert({
        message: "只能扩展已生成物料ERP编号的物料",
        type: "fail"
      });
    }
  }

   //监听loaclstrong，用来确认是否刷新列表页
   watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="commonlyMaterial"&&e.newValue.search("save")!=-1){//如果有新提交的扩展物料申请
        that.initData(that.reqSearchData);
        localStorage.removeItem('commonlyMaterial');
      }
  });
  }

}
