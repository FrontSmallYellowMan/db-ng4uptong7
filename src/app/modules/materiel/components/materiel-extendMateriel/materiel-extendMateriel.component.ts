import { Component, OnInit } from '@angular/core';
import { dbomsPath } from "environments/environment";

import { ApprovalQuery,MaterielExtendMaterielService} from "../../services/materiel-extendMateriel.service";
import { ExtendMaterielMyApprovalComponent } from "../materiel-extendMateriel-myApproval/materiel-extendMateriel-myApproval.component";


@Component({
  templateUrl: 'materiel-extendMateriel.component.html',
  styleUrls: ['materiel-extendMateriel.component.scss']
})

export class ExtendMaterielComponent implements OnInit {

  approvalQuery:ApprovalQuery=new ApprovalQuery();
  notApproval:string="0";//用来保存未审批的列表条目

  constructor(
    private materielExtendMaterielService:MaterielExtendMaterielService
  ) { }

  ngOnInit() { 
    this.initData(this.approvalQuery);
    this.watchLocalStrong();//监听localStorage的状态
  }

  //请求审批列表
  initData(approvalQuery: ApprovalQuery){
    this.materielExtendMaterielService.approvalQueryList(approvalQuery).then(result => {
      if(result.success){
        console.log(result)
        this.notApproval=result.data.pager.total;
      }
    })
  }

  //添加扩展物料
  addData(){
    window.open(dbomsPath+'mate/edit-extendmateriel/0');
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