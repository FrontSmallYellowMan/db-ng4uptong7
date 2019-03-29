import { Component, OnInit, ViewChildren, ElementRef } from "@angular/core";
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "app/shared/index";
import { WindowService } from "app/core";
import { Observable } from "rxjs/Observable";
import { dbomsPath } from "environments/environment";

import { EditHUAWEIPromisedTypeListComponent } from "../edit-HUAWEI-promised-typeList/edit-HUAWEI-promised-typeList.component";
import {
  NewCreateApplyRoute,
  HUAWEIPrommisedService,
  TrackQueryData,
  TrackQueryDataExport
} from "../../../services/HUAWEIPromised.service";
import { element } from "protractor";

import * as moment from 'moment';

declare var $;
declare var window,document,Blob,URL;

@Component({
  selector: "HUAWEI-promisedTrack",
  templateUrl: "HUAWEI-promised-track.component.html",
  styleUrls: [
    "HUAWEI-promised-track.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class HUAWEIPromisedTrackComponent implements OnInit {
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute(); //引入新建申请对象
  trackQueryData: TrackQueryData = new TrackQueryData(); //实例化查询参数
  trackQueryDataExport:TrackQueryDataExport=new TrackQueryDataExport();
  modal: XcModalRef; //初始化弹窗
  pagerData = new Pager();
  highSearchShow: boolean = false; //高级搜索
  isHide: boolean = true; //是否隐藏缺省页

  listCommitmentType: any[] = []; //承诺类型列表
  listPlatform: any[] = []; //平台列表
  typeList: string; //用来显示选择的承诺类型

  reachStatus: any = [
    { isChecked: false, value: "未达成" },
    { isChecked: false, value: "部分达成" },
    { isChecked: false, value: "已达成,特批达成" },
    { isChecked: false, value: "冻结" }
  ];

  searchList: any[] = []; //搜索列表
  promisedTypeList:any[]=[];//承诺类型列表

  startDate: string; //开始时间，临时
  endDate: string; //结束时间，临时
  checked: any; //临时数据

  @ViewChildren("tab") public tab: ElementRef;

  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private HUAWEIPrommisedService: HUAWEIPrommisedService
  ) {}

  ngOnInit() {

    //监听承诺列表项的状态
    this.watchLocalStrong();

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(
      EditHUAWEIPromisedTypeListComponent
    );

    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
      if (data) {
        let selectTypeLlistName: any[] = []; //声明一个空数组用来保存选择的承诺类型
        let selectPromisedTypeCode: any[] = []; //用来保存筛选出的承诺类型代码

        JSON.parse(data).forEach(element => {
          //遍历数组，承诺类型的名称push进数组
          selectTypeLlistName.push(element.CommitTypeName); //获取承诺类型名称
          selectPromisedTypeCode.push(element.CommitTypeCode); //获取承诺类型的代码
          //console.log(element);
        });

        this.typeList = selectTypeLlistName.join("，"); //将名称数组合并为字符串
        this.trackQueryData.CommitmentType = selectPromisedTypeCode.join(","); //将承诺类型的代码赋值进查询参数
      }
    });

    //请求(平台和承诺类型)的基础数据
    this.getBasicList();
  }

  //打开高级搜索
  openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  onChangePager(e: any) {
    //分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.trackQueryData.PageIndex = e.pageNo;
    this.trackQueryData.PageSize = e.pageSize;

    this.initData(this.trackQueryData);
  }

  initData(trackQueryData: TrackQueryData) {
    
    //向数据库发送请求
    this.HUAWEIPrommisedService.getTrackList(trackQueryData).then(data => {
      if (data.Result) {
        let resData = JSON.parse(data.Data);

        // //设置分页器
        this.pagerData.set({
          total: resData.TotalCount,
          totalPages: resData.PageCount,
          pageNo: resData.CurrentPage,
          pageSize: resData.PageSize
        });
        // //this.loading = false;
        this.searchList = resData.List;
        this.promisedTypeList=resData.TypeList;
        console.log(this.searchList);
        if (this.searchList.length === 0) {
          //判断如果查询列表为空，则显示缺省页面
          this.isHide = false; //显示缺省页面
        } else {
          this.isHide = true;
        }
      }
    });
  }

  search() {
    //点击搜索按钮的搜索

    if (this.reachStatus.some(item => item.isChecked)) {
      let reachStatusList = [];
      let selectList = this.reachStatus
        .filter(item => item.isChecked)
        .forEach(element => reachStatusList.push(element.value));
      this.trackQueryData.ReachStatus = reachStatusList.join(",");
    }



    if(this.trackQueryData.BeginDate&&!this.trackQueryData.EndDate){
      this.trackQueryData.EndDate=this.trackQueryData.BeginDate;
    }
  
    if(!this.trackQueryData.BeginDate&&this.trackQueryData.EndDate){
      this.trackQueryData.BeginDate=this.trackQueryData.EndDate;
    } 

    this.trackQueryData.PageIndex=1;
    this.initData(this.trackQueryData);
  }

  reset() {
    //重置搜索数据

    this.trackQueryData = new TrackQueryData();
    this.typeList="";
    this.reachStatus.forEach(element=>element.isChecked=false);
    this.trackQueryData.PageSize = 10;
    this.trackQueryData.PageIndex = 1;
  }

  //基础数据
  getBasicList() {
    this.HUAWEIPrommisedService.getBasicDate("").then(data => {
      if (data.Result) {
        let basicList = JSON.parse(data.Data);
        this.listCommitmentType = basicList.ListCommitmentType; //承诺类型列表
        this.listPlatform = basicList.ListPlatform; //平台列表
        //console.log(this.listPlatform);
      }
    });
  }

  //显示承诺类型列表
  getPromisedTypeList() {
    this.modal.show(this.listCommitmentType);
  }

  //获取详情
  getDetail(ApplyID) {
    window.open(dbomsPath + "promised/edit-HUAWEI-trackDetail/t" + ApplyID);
  }

  //导出承诺跟进列表
  exportTrackList(){
    this.HUAWEIPrommisedService.exportTrackList(this.trackQueryData).subscribe(data=>{
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
    
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `承诺跟进.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl);
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`承诺跟进列表${newDate}`);
    a.click();
    document.body.removeChild(a);
  }

  //判断是否可以新建华为承诺申请
  isNewPromised() {
    this.HUAWEIPrommisedService.isNewPromisedDCG().then(data => {
      if(data.Result){
        if(data.Data){
          this.newCreateApplyRoute.data.list[0].unClick=true;
          this.newCreateApplyRoute.data.list[0].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data.list[0].unClick=false;
        }
      }
    });

    this.HUAWEIPrommisedService.isNewPromisedHUAWEI().then(data => {
      if(data.Result){
        if(data.Data){
          this.newCreateApplyRoute.data.list[1].unClick=true;
          this.newCreateApplyRoute.data.list[1].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data.list[1].unClick=false;
        }
      }
    });
  }

  //监听loaclstrong，用来确认是否刷新列表页
 watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    console.log(e.newValue,e);
     if(e.key==="HUAWEIPromised"&&e.newValue.search("reach")!=-1){
      that.initData(that.trackQueryData);
      localStorage.removeItem('HUAWEIPromised');
    }
});
}

}
