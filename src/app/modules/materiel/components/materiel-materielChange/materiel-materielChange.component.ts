import { Component, OnInit } from '@angular/core';
import { MaterielChangeService,ApprovalListData} from '../../services/materiel-materielChange.service';
import { dbomsPath } from "environments/environment";

import { Observable } from 'rxjs';

declare var document,localStorage,window;

@Component({
    templateUrl: 'materiel-materielChange.component.html',
    styleUrls:['materiel-materielChange.component.scss']
})
export class MaterielChangeComponent implements OnInit {

    markingNO:number=0;//标示数字
    approvalListData:ApprovalListData=new ApprovalListData()

    constructor(
        private materielChangeService:MaterielChangeService
    ) { }

    //  ngOnInit() {

    //      let that=this;
    //      window.addEventListener("focus",()=>{
    //          that.initData(that.approvalListData);
    //        });
    //     //this.initData(this.approvalListData);
       
    //   }

    ngOnInit() {
       this.initData(this.approvalListData);
       this.watchLocalStrong();//监听localstorage的状态
    }

    //  onChangePager(e: any){
    //     // this.approvalListData.PageNo = e.pageNo;
    //     // this.approvalListData.PageSize = e.pageSize;
    
    //     this.initData(this.approvalListData);
    //   }
    
      initData(approvalListData: ApprovalListData) {//向数据库发送请求
        
        this.materielChangeService.approvalList(this.approvalListData).then(data => {

         if(data.success){
                this.markingNO=data.data.pager.total;
            }
        });
     }



    //新建物料数据修改
    addData(){
       window.open(dbomsPath+'mate/edit-nmc/'+0);
    }

      //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="changeMaterial"&&e.newValue.search("submit")!=-1){
        that.initData(that.approvalListData);
        localStorage.removeItem('changeMaterial');
      }else if(e.key==="changeMaterial"&&e.newValue.search("approval")!=-1){
        that.initData(that.approvalListData);
        localStorage.removeItem('changeMaterial');
      }
  });
  }
    
}