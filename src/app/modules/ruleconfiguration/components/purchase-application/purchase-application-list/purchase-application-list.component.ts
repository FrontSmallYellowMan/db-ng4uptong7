import { Component, OnInit } from '@angular/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath,environment } from "environments/environment";
import { WindowService } from "../../../../../../app/core";

import { Query,PurchaseApplicationService,RuleState } from "../../../services/purchaseApplication.service";

declare var window,localStorage;

@Component({
  selector: 'purchase-application-list',
  templateUrl: 'purchase-application-list.component.html',
  styleUrls:['purchase-application-list.component.scss']
})

export class PurchaseApplicationListComponent implements OnInit {

  query:Query=new Query();//实例化查询参数
  pagerData=new Pager();//实例化分页参数
  ruleStateData:RuleState=new RuleState();//实例化规则状态请求参数
  searchList:any=[];//保存查询到的列表
  isSearched:boolean=false;//是否触发搜索
  isHide:boolean=false;//是否隐藏列表

  constructor(
    private purchaseApplicationService:PurchaseApplicationService,//注入服务
    private windowService:WindowService
  ) { }

  ngOnInit() { 
    this.watchLocalStrong();//监听localstroage的状态
  }

  //搜索
  search(){
    this.isSearched=true;
    this.initData();
  }

  //重置
  reset(){
    this.query=new Query();
  }

  //删除列表
  deteleList(ruleId){

    this.windowService.confirm({message:'是否确认删除'}).subscribe(v=>{
      if(v){
        this.purchaseApplicationService.deteleList(ruleId).then(resData=>{
          if(resData.Result){
            this.windowService.alert({message:'删除成功！',type:'success'}).subscribe(()=>{
              this.initData();
            });
          }else{
            this.windowService.alert({message:resData.Message,type:'fail'});
          }
        })
      }
    })

  }

  //请求接口查询采购身亲配置列表
  initData(){
    this.purchaseApplicationService.getRuleList(this.query).then(resData=>{
      if(resData.Result){
        this.searchList=resData.Data.List;//保存列表
        this.pagerData.set({//设置分页
          pageNo:resData.CurrentPage,
          pageSize:resData.PageSize,
          total: resData.Data.TotalCount,
          totalPages: resData.Data.PageCount,
        });
      }

      this.isHide=this.searchList.length>0?false:true;//是否隐藏列表
      
      console.log(this.searchList,this.isHide,this.isSearched);
    })
  }

  onChangePager(e){
    this.query.CurrentPage=e.pageNo;
    this.query.PageSize=e.pageSize;

    this.initData();
  }

  //新建采购规则
  addPurchaseConfig(){
    window.open(dbomsPath+'ruleconfiguration/purchase-application-edit/0');
  }

  //设置规则状态
  setRuleState(ruleId,state){
    this.ruleStateData.RoleID=ruleId;
    this.ruleStateData.RoleStatus=state;
    this.purchaseApplicationService.setRuleState(this.ruleStateData).then(resData=>{
      console.log(resData);
      if(resData.Result){
        this.windowService.alert({message:resData.Message,type:"success"}).subscribe(()=>{
          this.initData();
        })
      }else{
        this.windowService.alert({message:resData.Message,type:"fail"});
      }
    })
  }

  //查看详情
  getDetail(ruleId,I,type){
    // if(this.searchList[I].RoleStatus===1){
    //   this.windowService.alert({message:"请先停用规则，再进入编辑",type:'fail'})
    // }else{
      // window.open(dbomsPath+"ruleconfiguration/purchase-application-edit/"+ruleId);
    // }
    if(type==='edit') {
      window.open(dbomsPath+"ruleconfiguration/purchase-application-edit/"+ruleId);
    }else {
      window.open(dbomsPath+"ruleconfiguration/purchase-application-edit/"+ruleId+`?type=${type}`);
    }

  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="puerchaseApplyRule"&&e.newValue.search("save")!=-1){//如果是暂存
        that.initData();
        localStorage.removeItem('puerchaseApplyRule');
      }
  });
  }

}