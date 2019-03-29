import { Component, OnInit } from '@angular/core';
import { Query,MaterielDataModifyService,ApprovalListData,MaterielData } from '../../services/materiel-dataModify.service';
import { Pager } from 'app/shared/index';
import { ActivatedRoute } from "@angular/router";
import { WindowService } from "app/core";
import { dbomsPath } from "environments/environment";

import { MaterielCommunicationService } from "../../services/materiel-communication.service";

declare var $,localStorage,window;

@Component({
    templateUrl: 'materiel-DataModify-myapproval.component.html',
    styleUrls:['materiel-DataModify-myapproval.component.scss','../../scss/materiel.component.scss']
})

export class MaterielDataModifyMyApprovalComponent implements OnInit {

    fullChecked = false;//全选状态
    fullCheckedIndeterminate = false;//半选状态
    checkedNum = 0;//已选项数
    pagerData = new Pager();
    query:Query=new Query();
     highSearchShow: boolean = false;//高级搜索

    approvalListData:ApprovalListData=new ApprovalListData();   
    materielData:MaterielData=new MaterielData();

    searchList:any;//用来保存查询返回的结果列表 
    isHide:boolean=false;//是否显示缺省也

    constructor(
      private materielDataModifyService: MaterielDataModifyService,
      private router: ActivatedRoute,
      private windowService: WindowService,
      private materielCommunicationService:MaterielCommunicationService
    ) { }

     ngOnInit() { 
      this.watchLocalStrong();//监听localStorage的状态
      }

  onChangePager(e: any){
    this.approvalListData.PageNo = e.pageNo;
    this.approvalListData.PageSize = e.pageSize;

    this.initData(this.approvalListData);
  }

  initData(approvalListData: ApprovalListData) {//向数据库发送请求
    // this.fullChecked = false;
    // this.fullCheckedIndeterminate = false;
    // this.checkedNum = 0;

    //this.approvalListData.ApplyITCode=this.materielData.ApplyITCode;//将Itcode赋值为到查询参数
    this.materielDataModifyService.searchAppListData(this.approvalListData).then(data => {

      if (data.success) {
        //设置分页器
        this.pagerData.set(data.data.pager);
        //this.loading = false;      
        this.searchList = data.data.list;
        //console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
          this.isHide = false;//显示缺省页面 
        } else {
          this.isHide = true;//不显示缺省页面 
        }
      }  
    });
}

  onTab(e){//切换选项（待我审批，我已审批，全部）
    let liType=document.querySelectorAll(".m-state li");
 
    for(let i=0;i<liType.length;i++){
      liType[i].className="";
    }
     e.target.className="active";
 
     switch (e.target.getAttribute("data-state")) {
       case "myExamine":
         this.approvalListData.TaskStatus = "0";
         break;
       case "endExamine":
         this.approvalListData.TaskStatus = "1";
         break;
       case "sFinish":
         this.approvalListData.TaskStatus = "2";
         break;
       default:
         break;
     }
 
     //this.isHide = true;//显示搜索列表页 
     this.approvalListData.PageNo=1;
     this.initData(this.approvalListData);//请求数据库  
    
   }

   getDetail(ID,TaskId,e){//查看详情
    this.router.params.subscribe(params=>{//获取路由传过来的值
      window.open(dbomsPath+"mate/edit-data/"+params.id+ID+"?"+`taskid=${TaskId}`);
    });
    //console.log(TaskId);
    //localStorage.setItem("TaskId",TaskId);
  }
      

//打开高级搜索
openSearch(){
  this.highSearchShow = true;
}

//收起高级搜索
closeSearch(){
  this.highSearchShow = false;
  this.reset();//当高级搜索收起时，清空搜索条件
}
  
search(){
  this.approvalListData.PageNo=1;
  this.initData( this.approvalListData);
  
}

reset(){
  
  let nowState = this.approvalListData.TaskStatus;//保存当前处的tab状态（全部，审核中，已完成，草稿）
  this.approvalListData=new ApprovalListData();
  this.approvalListData.TaskStatus = nowState;
  this.approvalListData.PageSize = 10;
}

//监听loaclstrong，用来确认是否刷新列表页
watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    //console.log(e.newValue,e);
    if(e.key==="dataMaterial"&&e.newValue.search("save")!=-1){
      that.initData(that.approvalListData);
      localStorage.removeItem('dataMaterial');
    }else if(e.key==="dataMaterial"&&e.newValue.search("submit")!=-1){
      that.initData(that.approvalListData);
      localStorage.removeItem('dataMaterial');
    }else if(e.key==="dataMaterial"&&e.newValue.search("approval")!=-1){
      that.initData(that.approvalListData);
      localStorage.removeItem('dataMaterial');
    }
});
}

}