import { Component, OnInit, ViewChildren, ElementRef } from "@angular/core";
import {
  Pager,
  XcModalService,
  XcBaseModal,
  XcModalRef
} from "app/shared/index";
import { WindowService } from "app/core";
import { Observable } from "rxjs/Observable";
import { dbomsPath,environment } from "environments/environment";

import { NewCreateApplyRoute } from "../../../services/HUAWEIPromised.service";
import {
  DCGPromiseService,
  QueryPromisedTrack
} from "../../../services/DCGPromised.service";
import { element } from "protractor";
import * as moment from 'moment';
declare var document,Blob,URL,window;

@Component({
  selector: "DCG-promisedTrack",
  templateUrl: "DCG-promised-track.component.html",
  styleUrls: [
    "DCG-promised-track.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class DCGPromisedTrackComponent implements OnInit {
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute(); //引入新建申请对象
  pagerData = new Pager();
  queryPromisedTrack: QueryPromisedTrack = new QueryPromisedTrack(); //实力化查询参数

  isHide: boolean = true; //是否隐藏缺省页
  platFormList: any[] = []; //平台列表
  promisedList: any[] = []; //承诺类型列表

  searchList: any = []; //搜索结果列表

  reachStatus = {
    reachStatusNo:{state: "",value:"'未达成'"}, //未达成
    reachStatusPart: {state: "",value:"'部分达成'"}, //部分达成
    reachStatusComplete: {state: "",value:"'已达成'"}, //已达成
    reachStatusFreeze: {state: "",value:"'冻结'"}, //冻结
  };

  constructor(
    private DCGPromiseService: DCGPromiseService,
    private windowService: WindowService
  ) {}

  ngOnInit() {
    //获取承诺类型和平台列表
    this.getPlatPromAndPromisedType();

    //监听localstroage
    this.watchLocalStrong();

  }

  onChangePager(e: any) {
    //分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.queryPromisedTrack.PageIndex = e.pageNo;
    this.queryPromisedTrack.PageSize = e.pageSize;

    this.initData(this.queryPromisedTrack);
  }

  initData(queryPromisedTrack: QueryPromisedTrack) {
    //向数据库发送请求

    this.DCGPromiseService.getPromisedTrackList(this.queryPromisedTrack).then(
      data => {
        if (data.Result) {
          let resData = JSON.parse(data.Data); //转换查询结果的JSON字符串

          //设置分页器
          this.pagerData.set({
            total: resData.TotalCount,
            totalPages: resData.PageCount,
            pageNo: resData.CurrentPage,
            pageSize: resData.PageSize
          });
          //设置分页器
          //this.loading = false;
          this.searchList = resData.List;
          console.log(this.searchList);
          if (this.searchList == "") {
            //判断如果查询列表为空，则显示缺省页面
            this.isHide = false; //显示缺省页面
          } else {
            this.isHide = true;
          }
        }
      }
    );
  }

  //获取达成状态
  getReachStatus(){

    let reachStatusArr:any=[];//创建一个空数组用来保存选择的达成状态

    for(let k in this.reachStatus){//遍历承诺类型状态对象
      if(this.reachStatus[k].state){//如果为已选择的状态
        reachStatusArr.push(this.reachStatus[k].value);//将对应的值push进数组
      }
    }
    this.queryPromisedTrack.ReachStatus=reachStatusArr.join(',');//转换数组为字符串
    
  }

  //搜索
  search() {
    //处理承诺状态
    this.getReachStatus();
    //请求接口
    if(this.queryPromisedTrack.BeginDate&&!this.queryPromisedTrack.EndDate){
      this.queryPromisedTrack.EndDate=this.queryPromisedTrack.BeginDate;
    }
    
    if(!this.queryPromisedTrack.BeginDate&&this.queryPromisedTrack.EndDate){
      this.queryPromisedTrack.BeginDate=this.queryPromisedTrack.EndDate;
    }

    this.queryPromisedTrack.PageIndex=1;
      this.initData(this.queryPromisedTrack);
    
  }

  //重置搜索数据
  reset() {
    this.queryPromisedTrack = new QueryPromisedTrack();
    for(let k in this.reachStatus){
      this.reachStatus[k].state=false;
    }
    this.queryPromisedTrack.PageIndex = 1;
  }

  //获取详情
  getDetail(Id) {
    window.open(dbomsPath + "promised/edit-DCG-trackDetail/t" + Id);
  }

  //获取平台及承诺类型列表
  getPlatPromAndPromisedType() {
    this.DCGPromiseService.getPlatformAndCommitmentTypeList().then(data => {
      if (data.Result) {
        this.promisedList = JSON.parse(data.Data).ListCommitmentType; //获取承诺类型列表
        this.platFormList = JSON.parse(data.Data).ListPlatform; //获取平台列表
      }
      console.log(JSON.parse(data.Data));
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

  //导出跟进列表
  exportTrackList(){

  this.DCGPromiseService.exportTrackList(this.queryPromisedTrack).subscribe(data=>{
    //this.aClick(data);
    console.log(data);
    let blob = new Blob([data], {type: "application/vnd.ms-excel"});
    
    if('msSaveOrOpenBlob' in window.navigator){
      window.navigator.msSaveBlob(blob, `承诺跟进.xls`);
    }else{
      let objectUrl = URL.createObjectURL(blob);//创建链接
      this.aClick(objectUrl);
      URL.revokeObjectURL(objectUrl);//释放链接
    }
  })
  }

  //验证是否可以新建申请
  isNewPromised(){
    this.DCGPromiseService.isNewPromised().then(data=>{
      if(data.Result){
        //console.log(data);
        if(data.Data) {
          this.newCreateApplyRoute.data.list[0].unClick=true;
          this.newCreateApplyRoute.data.list[0].alert=data.Data;
        }else{
          this.newCreateApplyRoute.data[0].unClick=false;
        }
      }
    });
  
    this.DCGPromiseService.isNewPromisedHUAWEI().then(data=>{
      if(data.Result){
        //console.log(data);
        if(data.Data) {
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
     if(e.key==="DCGPromised"&&e.newValue.search("reach")!=-1){
      that.initData(that.queryPromisedTrack);
      localStorage.removeItem('DCGPromised');
    }
});
}


}
