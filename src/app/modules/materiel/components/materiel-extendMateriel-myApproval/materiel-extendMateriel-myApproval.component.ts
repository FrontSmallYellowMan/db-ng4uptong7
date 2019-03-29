import { Component,OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';

import { dbomsPath } from "environments/environment";

import {ApprovalQuery,
  MaterielExtendMaterielService
} from '../../services/materiel-extendMateriel.service';

declare var window;

@Component({
  selector: 'm-em-approval',
  templateUrl: 'materiel-extendMateriel-myApproval.component.html',
  styleUrls:['materiel-extendMateriel-myApproval.component.scss','../../scss/materiel.component.scss']
})

export class ExtendMaterielMyApprovalComponent implements OnInit {

  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  approvalQuery: ApprovalQuery;
  pagerData = new Pager();

  highSearchShow: boolean = false;//高级搜索

  materielList:any = [];

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  constructor(
    private materielExtendMaterielService: MaterielExtendMaterielService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    this.approvalQuery = new ApprovalQuery();
    this.watchLocalStrong();//监听localStorage的变化
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.approvalQuery.PageNo = e.pageNo;
    this.approvalQuery.PageSize = e.pageSize;

    this.initData(this.approvalQuery);
  }

  initData(approvalQuery: ApprovalQuery){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.materielExtendMaterielService.approvalQueryList(approvalQuery).then(result => {
      this.materielList = result.data.list;
      console.log(this.materielList);
      //设置分页器
      this.pagerData.set(result.data.pager);
      this.loading = false;
    })
  }

  //搜索
  search(){
    this.initData(this.approvalQuery);
  }

  //重置搜索条件
  reset(){
    let _status=this.approvalQuery.TaskStatus;
    this.approvalQuery=new ApprovalQuery();
    //this.approvalQuery.ExtendType="0";
    this.approvalQuery.PageNo=1;
    this.approvalQuery.TaskStatus=_status;
  }

  //新建申请
  addApply(){
    window.open(dbomsPath+'mate/edit-extendmateriel/0');
  }

  //编辑扩展物料
  editMateriel(sn: string,CopyLink){

    // let tempNodeId=this.materielList[I].TempNodeId;//保存修改的供应商ID
    // let taskId=this.materielList[I].TaskId;//保存taskId
    // let instanceid=this.materielList[I].InstItemId;//保存instanceid
    // let taskState;this.materielList[I].TaskState==="未处理"?taskState="0":taskState="1";//保存审批状态，0:未处理，1:已处理
    // let ADP;//判断是否是加签审批
    // this.materielList[I].CopyLink.search("ADP")!=-1?ADP="1":ADP="0";//如果存在“ADP”则为加签审批
  
    let queryPromiseData=CopyLink.substring(CopyLink.indexOf('?'));

    window.open(dbomsPath+`mate/edit-em-approvaldetail/e${sn}${queryPromiseData}`);
  }

  onTab(e) {//切换选项（全部，审批中，已完成，驳回）
    let liType = document.querySelectorAll(".m-state li");

    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";

    switch (e.target.getAttribute("data-state")) {
      case "sAll":
        this.approvalQuery.TaskStatus = "2";
        break;
      case "sExamine":
        this.approvalQuery.TaskStatus = "0";
        break;
      case "sFinish":
        this.approvalQuery.TaskStatus = "1";
        break;
      default:
        break;
    }

    //this.isHide = true;//显示搜索列表页 
    this.approvalQuery.PageNo = 1;
    this.initData(this.approvalQuery);//请求数据库

  }

   //打开高级搜索
   openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="extendMateriel"&&e.newValue.search("approval")!=-1){//如果有新提交的扩展物料申请
        that.initData(that.approvalQuery);
        localStorage.removeItem('extendMateriel');
      }else if(e.key==="extendMateriel"&&e.newValue.search("addApproval")!=-1){
        that.initData(that.approvalQuery);
        localStorage.removeItem('extendMateriel');
      }
  });
  }

}