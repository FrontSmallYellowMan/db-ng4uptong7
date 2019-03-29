import { Component, OnInit } from '@angular/core';
import { MaterielDataModifyService,ApprovalListData,MaterielData } from '../../services/materiel-dataModify.service';
import { dbomsPath } from "environments/environment";

import { MaterielCommunicationService } from "../../services/materiel-communication.service";

declare var localStorage,window;

@Component({
    templateUrl: 'materiel-DataModify.component.html',
    styleUrls:['materiel-DataModify.component.scss']
})
export class MaterielDataModifyComponent implements OnInit {

    approvalListData:ApprovalListData=new ApprovalListData(); 
    markingNO:number=0;//标示数字

    constructor(
        private materielDataModifyService: MaterielDataModifyService,
        private materielCommunicationService:MaterielCommunicationService
    ) { }

     ngOnInit() { 
			 this.initData(this.approvalListData);
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
        //this.approvalListData.ApplyITCode="ERSS";
        this.approvalListData.TaskStatus = "0";
        this.materielDataModifyService.searchAppListData(this.approvalListData).then(data => {
            if(data.success){
								this.markingNO=data.data.pager.total;
            }
        });
    }

    //新建物料数据修改
    addData(){
      window.open(dbomsPath+'mate/edit-data/'+0);
		}
		
		//监听loaclstrong，用来确认是否刷新列表页
watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    //console.log(e.newValue,e);
    if(e.key==="dataMaterial"&&e.newValue.search("approval")!=-1){
      that.initData(that.approvalListData);
      localStorage.removeItem('dataMaterial');
    }
});
}

}