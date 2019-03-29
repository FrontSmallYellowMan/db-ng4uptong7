
import { Component, OnInit } from '@angular/core';
import { dbomsPath } from "../../../../../environments/environment";

import { ERPOrderChangeApiServices,MyApprovalQuery } from "../../services/erporderchange-api.services";

declare var window;

@Component({
    templateUrl:"erporderchange-apply.component.html",
    styleUrls: ['./../../scss/procuList-head.scss','erporderchange-apply.component.scss']
})
export class ErpOrderChangeApplyComponent implements OnInit{
    
    approvaTtotalNum:string;//用来显示待审批的数量
    myApprovalQuery:MyApprovalQuery=new MyApprovalQuery();//实例化查询审批列表状态

    constructor(
        private erpOrderChangeApiServices:ERPOrderChangeApiServices
    ) { }

    ngOnInit() { 
      this.initData();
      this.watchLocalStrong();//监听列表的变化
    }

    initData(){
        this.erpOrderChangeApiServices.getMyApprovalList(this.myApprovalQuery).then(data=>{
            if(data.Result){
              this.approvaTtotalNum=JSON.parse(data.Data).totalnum;
            }
        });
    }

    //新建采购订单修改
    addData(){
     window.open(dbomsPath+'procurement/erporderchange-new/'+0);
    }

    //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      console.log(e.newValue,e);
      if(e.key==="erpOrderChange"&&e.newValue.search("approval")!=-1){//如果审批成功
        that.initData();
        localStorage.removeItem('erpOrderChange');
      }
  });
  }
    
}
