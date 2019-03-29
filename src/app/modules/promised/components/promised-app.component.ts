import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { Router } from "@angular/router";

import { DCGPromiseService,QueryMyApproval } from "../../promised/services/DCGPromised.service";
import { HUAWEIPrommisedService,ApprovalQuery } from "../../promised/services/HUAWEIPromised.service";

declare var window;

@Component({
  templateUrl: 'promised-app.component.html',
  styleUrls:['../scss/promised.component.scss']
})

export class PromisedAppComponent implements OnInit {

  DCGapprovalNumber:number=0;
  HUAWEIapprovalNumber:number=0;
  isClickName:string="DCG";//是否点击了tab标签

  queryMyApproval:QueryMyApproval=new QueryMyApproval();
  approvalQuery:ApprovalQuery=new ApprovalQuery();
  
  constructor(
    private router:Router,
    private DCGPromiseService:DCGPromiseService,
    private HUAWEIPrommisedService:HUAWEIPrommisedService
  ) { }

  ngOnInit() {

    //监听localstroage
    this.watchLocalStrong();

    if(this.router.url.search("HUAWEI")!=-1){
      this.isClickName="HUAWEI";
    }else{
      //获取DCG我的审批列表
      this.getDCGMyApprovalList(this.queryMyApproval);
      //获取华为我的审批列表
      this.getHUAWEIMyApprovalList(this.approvalQuery);
    }
      
  }

  //切换tab标签
  getTabTitle(e){
    if(e.target.getAttribute('data-tab')){
      this.isClickName=e.target.getAttribute('data-tab');
    } 
  }

  //获取DCG我的审批列表
  getDCGMyApprovalList(queryMyApproval:QueryMyApproval){
    this.DCGPromiseService.getMyApprovalList(this.queryMyApproval).then(data=>{
      if(data.Result){
        this.DCGapprovalNumber=JSON.parse(data.Data).TotalCount;
      }
    });
  }

  //获取HUAWEI我的审批列表
  getHUAWEIMyApprovalList(approvalQuery:ApprovalQuery){
    this.HUAWEIPrommisedService.myApprovalQuery(this.approvalQuery).then(data=>{
      if(data.Result){
        this.HUAWEIapprovalNumber=JSON.parse(data.Data).TotalCount;
      }
    });
  }

   //监听loaclstrong，用来确认是否刷新列表页
 watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    //console.log(e.newValue.search("submit"));
     if(e.key==="DCGPromised"&&e.newValue.search("submit")!=-1){
      that.getDCGMyApprovalList(that.queryMyApproval);
      localStorage.removeItem('DCGPromised');
      //console.log("haha1");
    }else if(e.key==="DCGPromised"&&e.newValue.search("approval")!=-1){
      that.getDCGMyApprovalList(that.queryMyApproval);
      //console.log("haha2");
      localStorage.removeItem('DCGPromised');
    }

    if(e.key==="HUAWEIPromised"&&e.newValue.search("submit")!=-1){
      that.getHUAWEIMyApprovalList(that.approvalQuery);
      localStorage.removeItem('HUAWEIPromised');
      //console.log("haha1");
    }else if(e.key==="HUAWEIPromised"&&e.newValue.search("approval")!=-1){
      that.getHUAWEIMyApprovalList(that.approvalQuery);
      //console.log("haha2");
      localStorage.removeItem('HUAWEIPromised');
    }

});
}
  


}