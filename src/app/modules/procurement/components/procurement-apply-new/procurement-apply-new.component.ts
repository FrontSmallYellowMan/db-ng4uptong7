import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import {
  Query, Rank,
  ContractListService
} from './../../services/contract-list.service';

declare var window;

@Component({
  templateUrl: 'procurement-apply-new.component.html',
  styleUrls: ['procurement-apply-new.component.scss', './../../scss/procurement.scss']
})
export class ProcurementApplyNewComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  rank: Rank;//排序条件
  pagerData = new Pager();
  searchBoxShow = false;//搜索框显示标识

  contractList = [];//合同列表
  selectedList = [];//已选列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果
  sale = {//销售员
    person: ''
  }

  constructor(private contractListService: ContractListService,
    private windowService: WindowService,
    private router: Router, ) {
  }

  ngOnInit() {
    this.query = new Query();
    this.rank = new Rank();
  }
  clearSearch() {//重置搜索
    this.query = new Query();
    this.sale.person = "";
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any) {
    this.query.currentpage = e.pageNo;
    this.query.pagesize = e.pageSize;
    this.initData(this.query);
  }
  selectedPerson(e) {//选择人员后
    if (JSON.stringify(e) == "[]") {
      this.query.SalesITCode = null;
    } else {
      this.query.SalesITCode = e[0]["userEN"];
    }
  }
  addStockApply() {//新建备货
    //this.router.navigate(['/procurement/submit-stockapply']);
    window.open(dbomsPath+'procurement/submit-stockapply');
  }
  initData(query: Query) {
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.query.PurchaseType="";//合同类型
    this.contractListService.getContractList(query).then(data => {
      this.contractList = data.pagedata;
      console.log("列表");
      console.log(this.contractList);
      if (this.contractList && this.contractList.length) {
        let len = this.contractList.length;
        let index; let item;
        let hasSelec = Boolean(this.selectedList && this.selectedList.length);//是否已有选择列表
        for (let i = 0; i < len; i++) {
          item = this.contractList[i];
          item["ApplyType"]=-1;//获取列表后 先对可创建的申请进行归类
          if(item["RecoveryTime"] || item["ApproveFinishTime"]){//合同申请
            item["ApplyType"]=1;
          }
          if(!item["RecoveryTime"] && !item["ApproveFinishTime"]){//预下申请
            item["ApplyType"]=0;
          }
          if(hasSelec){
            index = this.selectedIndexOf(this.contractList[i]["SC_Code"]);
            if (index != -1) {//检查每个的checked
              item["checked"] = true;
            }
            if (item["ApplyType"] != this.selectedList[0]["ApplyType"]) {//重置disabled
                // 只能选择同一类型的合同 创建采购申请
                item.disabled = true;//不可选择
            }
          }
        }
        //设置分页器
        this.pagerData.pageNo = data.currentpage;
        this.pagerData.total = data.totalnum;
        this.pagerData.totalPages = data.pagecount;
        this.loading = false;
      } else {
        this.loading = false;
      }
    })
  }
  rankSet(col) {//排序
    switch (this.rank[col]) {
      case "none":
        this.rank[col] = "asc";
        break;
      case "asc":
        this.rank[col] = "desc";
        break;
      case "desc":
        this.rank[col] = "asc";
        break;
    }
    for (let key in this.rank) {
      if (key == col) {
        continue;
      }
      this.rank[key] = "none";
    }
    this.query.SortField = col;
    this.query.SortRule = this.rank[col];
    this.initData(this.query);
  }

  //搜索
  search() {
    this.contractList = [];
    this.pagerData = new Pager();
    this.isSearch = true;
    this.loading = true;
    this.initData(this.query);
  }
  selectedIndexOf(SC_Code) {//根据SC_Code寻找在已选列表里的index
    let len = this.selectedList.length;
    for (let i = 0; i < len; i++) {
      if (this.selectedList[i].SC_Code == SC_Code) {
        return i;
      }
    }
    return -1;
  }
  childClick(e, index) {//每行click时
    if (e) {
      this.selectedList.push(this.contractList[index]);
    } else {
      this.selectedList.splice(this.selectedIndexOf(this.contractList[index]["SC_Code"]), 1);
    }
    if (e && this.selectedList && this.selectedList.length == 1) {//选中第一个时，重置disabled
      let len = this.contractList.length;
      let item;
      for (let i = 0; i < len; i++) {

        if(i==index){continue;}
        item = this.contractList[i];
        /**
         * 这里的判断是用来区分采购申请的类型，只有同类型才能选择
         * 第一：通过审批中和已完成两个大条件来区分
         * 第二：当销售合同处于审批中，那么需要判断是否处于“印章管理员-返原”，如果处于返原
         */
        // if ((this.selectedList[0]["ApplyType"]==0&&this.selectedList[0]["CurrentNode"]==='印章管理员-返原'&&this.selectedList[0]["HasAccessory"])&&(item["HasAccessory"]!=this.selectedList[0]["HasAccessory"]||item["CurrentNode"] != this.selectedList[0]["CurrentNode"])|
        // if((this.selectedList[0]["ApplyType"]===0&&item["ApplyType"] === this.selectedList[0]["ApplyType"]&&item["HasAccessory"]!=this.selectedList[0]["HasAccessory"])||item["CurrentNode"] != this.selectedList[0]["CurrentNode"]||
        // item["ApplyType"] != this.selectedList[0]["ApplyType"]) {//不可选择
        //   item.disabled = true;
        // }

        if(item["ApplyType"] != this.selectedList[0]["ApplyType"]){
          if(this.selectedList[0]["ApplyType"]===1&&(this.selectedList[0]["HasAccessory"]!=this.selectedList[0]["IsRecovery"]||this.selectedList[0]["HasAccessory"]==this.selectedList[0]["IsRecovery"]&&this.selectedList[0]["HasAccessory"])){
            item.disabled = true;
          }
        }

        if(this.selectedList[0]["ApplyType"]===1){
          if(!this.selectedList[0]["HasAccessory"]&&!this.selectedList[0]["IsRecovery"]&&(item.HasAccessory!=item.IsRecovery||item.HasAccessory==item.IsRecovery==true)){
            item.disabled = true;
          }
        }


      }
    }
    if (!e && this.selectedList && this.selectedList.length == 0) {//取消最后一个选择时，重置disabled
      let len = this.contractList.length;
      for (let i = 0; i < len; i++) {
        this.contractList[i].disabled = false;
      }
    }
  }
  parentClick(e) {//全选按钮点击
    let len = this.contractList.length;
    if (e) {
      for (let i = 0; i < len; i++) {
        if (!this.contractList[i]["disabled"] && this.selectedIndexOf(this.contractList[i]["SC_Code"]) == -1) {
          this.selectedList.push(this.contractList[i]);
        }
      }
    } else {
      let index;
      for (let i = 0; i < len; i++) {
        index = this.selectedIndexOf(this.contractList[i]["SC_Code"]);
        if (index != -1) {
          this.selectedList.splice(index, 1);
        }
        this.contractList[i].disabled=false;//取消选择时，重置disabled
      }
    }
  }
  newApply() {//下一步点击

    // if(this.selectedList.some(item=>item.ApplyType===1)&&this.selectedList.some(item=>item.ApplyType===0)||
    // this.selectedList.every(item=>item.ApplyType===0)&&this.selectedList.some(item=>item.CurrentNode!=='印章管理员-返原')&&this.selectedList.some(item=>item.CurrentNode==='印章管理员-返原')||
    // this.selectedList.every(item=>item.CurrentNode==='印章管理员-返原')&&this.selectedList.some(item=>item.HasAccessory)&&this.selectedList.some(item=>!item.HasAccessory)) {
    //   this.windowService.alert({message:"您选择的销售合同发起的采购申请类型不同，请重新选择销售合同",type:"fail"},{autoClose: true,closeTime:5000});
    //   return;
    // }

    if(this.selectedList.some(item=>item.ApplyType===1)&&this.selectedList.some(item=>item.ApplyType===0)||
    this.selectedList.every(item=>item.ApplyType===1)&&this.selectedList.some(item=>!item.HasAccessory&&!item.IsRecovery)&&(this.selectedList.some(item=>!item.HasAccessory&&item.IsRecovery)||
    this.selectedList.some(item=>item.HasAccessory&&!item.IsRecovery)||this.selectedList.some(item=>item.HasAccessory&&item.IsRecovery))
    ) {
      this.windowService.alert({message:"您选择的销售合同发起的采购申请类型不同，请重新选择销售合同",type:"fail"},{autoClose: true,closeTime:5000});
      return;
    }
    
    console.log(this.selectedList);

    if (this.selectedList.length == 0) {
      window.localStorage.setItem("createPreApplyType", "noContract");
      this.windowService.alert({ message: "你将直接创建预下单采购申请", type: "warn" }).subscribe(()=>{
        window.open(dbomsPath+'procurement/submit-prepareapply');
      });
      //this.router.navigate(['/procurement/submit-prepareapply']);
    } else if(this.selectedList[0]["ApplyType"]==1){//合同（看是否上传了双章扫描件和返回，如果都没则为预下单）
      // let list=this.checkAccessory();
      // if(list && list.length){
      //   this.windowService.alert({ message: list.toString()+"合同未上传双章扫描件,请上传后再提交", type: "warn" });
      // }else{
      //   window.localStorage.setItem("contractList", JSON.stringify(this.selectedList));
      //   setTimeout(() => {
      //   window.open(dbomsPath+'procurement/submit-contractapply');          
      //     //this.router.navigate(['/procurement/submit-contractapply']);
      //   }, 0);
      // }
      let list=this.checkAccessory();
      
      //合同未返还并且未上传双章扫描件，将创建预下单采购
      if(!this.selectedList[0]['HasAccessory']&&!this.selectedList[0]['IsRecovery']){
        window.localStorage.setItem("createPreApplyType","hasContract");
        window.localStorage.setItem("prepareContractList",JSON.stringify(this.selectedList));
        setTimeout(() => {
          window.open(dbomsPath+'procurement/submit-prepareapply');        
          //this.router.navigate(['/procurement/submit-prepareapply']);
        }, 0);
      }else{
        //创建合同采购申请
        window.localStorage.setItem("contractList", JSON.stringify(this.selectedList));
        setTimeout(() => {
        window.open(dbomsPath+'procurement/submit-contractapply');          
        }, 0);
      }
        
    }else{//预下
      window.localStorage.setItem("createPreApplyType","hasContract");
      window.localStorage.setItem("prepareContractList",JSON.stringify(this.selectedList));
      setTimeout(() => {
        window.open(dbomsPath+'procurement/submit-prepareapply');        
        //this.router.navigate(['/procurement/submit-prepareapply']);
      }, 0);
    }
  }
  checkAccessory(){//要创建合同申请 未上传附件的进行提示
    let arr=[];
    for(let i,len=this.selectedList.length;i<len;i++){
      if(!this.selectedList[i]["RecoveryTime"]){//没有附件
        arr.push(this.selectedList[i]["MainContractCode"]);
      }
    }
    return arr;
  }

  //验证合同金额是否符合后者大于前者
  testMoney(type){
  
    if(this.query.StartContractMoney&&this.query.EndContractMoney){
      if(type==='start'&&parseFloat(this.query.StartContractMoney)>parseFloat(this.query.EndContractMoney)){
        this.windowService.alert({message:`输入金额应小于${this.query.EndContractMoney}`,type:"fail"}).subscribe(()=>{
          this.query.StartContractMoney="";
        });
      }else if(type==='end'&&parseFloat(this.query.StartContractMoney)>parseFloat(this.query.EndContractMoney)){
        console.log("进入分支");
        this.windowService.alert({message:`输入金额应大于${this.query.StartContractMoney}`,type:"fail"}).subscribe(()=>{
          this.query.EndContractMoney="";
        });
      }
    }
  }

}

// 合同采购申请：["RecoveryTime"] || ["ApproveFinishTime"]
// 预下采购申请：!["RecoveryTime"] && !["ApproveFinishTime"]