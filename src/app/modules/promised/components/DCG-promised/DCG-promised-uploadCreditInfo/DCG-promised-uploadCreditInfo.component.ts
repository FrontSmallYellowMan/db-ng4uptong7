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
  QueryCreditLevelData,
  SetLevelData
} from "../../../services/DCGPromised.service";
import { element } from "protractor";

declare var window;

@Component({
  selector: "DCG-uploadCreditInfo",
  templateUrl: "DCG-promised-uploadCreditInfo.component.html",
  styleUrls: [
    "DCG-promised-uploadCreditInfo.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class DCGUploadCreditInfoComponent implements OnInit {
  newCreateApplyRoute: NewCreateApplyRoute = new NewCreateApplyRoute(); //引入新建申请对象
  queryCreditLevelData: QueryCreditLevelData = new QueryCreditLevelData(); //实例化信用评级查询参数
  setLevelData:SetLevelData=new SetLevelData();//实例化修改评级的请求参数

  fileUpLoadApi:string=environment.server+`Commitment/UploadCommitLevel`;//附件上传接口
  
  pagerData = new Pager();
  isHide: boolean = false; //是否隐藏缺省页
  isEdit: boolean = false; //是否允许编辑
  searchList: any[] = []; //保存返回的列表

  constructor(private DCGPromiseService: DCGPromiseService,
  private windowService:WindowService) {}

  ngOnInit() {
    //空接口调用，用来给后端分配权限
    this.DCGPromiseService.testPower();
  }

  onChangePager(e: any) {
    //分页代码
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    if (
      !this.queryCreditLevelData.UserInfo &&
      !this.queryCreditLevelData.DeptName &&
      !this.queryCreditLevelData.FlatName
    )
      return;
    this.queryCreditLevelData.PageIndex = e.pageNo;
    this.queryCreditLevelData.PageSize = e.pageSize;

    this.initData(this.queryCreditLevelData);
  }

  initData(queryCreditLevelData: QueryCreditLevelData) {
    //向数据库发送请求

    this.DCGPromiseService.queryCreditLevel(this.queryCreditLevelData).then(
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
          if (this.searchList.length===0) {
            //判断如果查询列表为空，则显示缺省页面
            this.isHide = false; //显示缺省页面
          } else {
            this.searchList.forEach(element=>{
              if(!element.CommitLevel) element.CommitLevel='暂无评级，请点击选择';
            });
            this.isHide = true;
          }
        }
      }
    );
  }

  search() {
    //点击搜索按钮的搜索

    if (
      !this.queryCreditLevelData.UserInfo &&
      !this.queryCreditLevelData.DeptName &&
      !this.queryCreditLevelData.FlatName
    )
      return;

    this.queryCreditLevelData.PageIndex=1;  
    this.initData(this.queryCreditLevelData);
  }

  reset() {
    //重置搜索数据
    this.queryCreditLevelData = new QueryCreditLevelData();
    this.queryCreditLevelData.PageSize = 10;
    this.queryCreditLevelData.PageIndex = 1;
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

  //模板下载
  getTemplate() {
    window.open(dbomsPath + "assets/downloadtpl/销售员信用评级导入模板.xlsx");
  }

  //显示编辑框
  editLevel(i){

    this.setLevelData.CommitLevel="";//显示编辑框时，将绑定评价等级重置为"""

    this.searchList.forEach(element=>{
      element.isEdit=false;//将所有的编辑框隐藏
    });
    this.searchList[i].isEdit=true;//显示当前点击的编辑框
  }

  //修改信用评级
  setLevel(itcode,i){

    this.searchList[i].isEdit=false;//隐藏编辑框

   if(!this.setLevelData.CommitLevel) return;
 
   this.setLevelData.ITCode=itcode;
   this.DCGPromiseService.setSaleLevel(this.setLevelData).then(data=>{
     if(data.Result){
       this.windowService.alert({message:"信用评级修改成功",type:"success"});
       //this.searchList[i].isEdit=false;//隐藏编辑框
       this.initData(this.queryCreditLevelData);
     }else{
      this.windowService.alert({message:data.Message,type:"fail"});
     }
     console.log(data);
   })

  }

  //导入信用评级列表
  fileUploadSuccess(e){
    if(e.Result){
      this.windowService.alert({message:'信用评级修改成功',type:'success'});
    }else{
      this.windowService.alert({message:e.Message,type:'fail'});
    }
  }

}
