import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Pager} from 'app/shared/index';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { WindowService } from 'app/core';
import 'rxjs/add/observable/merge';

import { 
  Query,Rank,
  ContractListService
} from './../../../../services/contract-list.service';

@Component({
    selector: "new-contractApply",
    templateUrl: 'new-contractApply.html',
    styleUrls:['new-contractApply.scss',
      './../../../../scss/procurement.scss','./../../../../scss/add-contract.scss']
})
export class NewContractApplyComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  rank: Rank;//排序条件
  pagerData = new Pager();
  searchBoxShow = false;//搜索框显示标识

  contractList = [];//合同列表
  selectedList=[];//已选列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果
  sale={//销售员
    person:''
  }
  @Output() onCompleteAddContract = new EventEmitter;

  constructor(private contractListService:ContractListService,
    private windowService:WindowService,
    private router: Router) {
  }

  ngOnInit(){
    this.query = new Query();
    this.rank = new Rank();
    this.selectedList = JSON.parse(window.localStorage.getItem("contractList"));//获取已选列表
  }
  clearSearch(){//重置搜索
    this.query = new Query();
    this.sale.person="";
  }
  CheckIndeterminate(v) {//检查是否全选
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.currentpage = e.pageNo;
    this.query.pagesize = e.pageSize;
    this.initData(this.query);
  }
  selectedPerson(e){//选择人员后
    if(JSON.stringify(e)=="[]"){
      this.query.SalesITCode=null;
    }else{
      this.query.SalesITCode=e[0]["userEN"];
    }
  }
  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.contractListService.getContractList(query).then(data => {
      this.contractList = data.pagedata;
      if(this.contractList && this.contractList.length){
        let len=this.contractList.length;
        let index;
        for(let i=0;i<len;i++){//检查每个的checked
          index=this.selectedIndexOf(this.contractList[i]["SC_Code"]);
          if(index!=-1){
            this.contractList[i]["checked"]=true;
          }
        }
        //设置分页器
        this.pagerData.pageNo=data.currentpage;
        this.pagerData.total=data.totalnum;
        this.pagerData.totalPages=data.pagecount;
        this.loading = false;
    }else{
      this.loading=false;
    }
    })
  }
   rankSet(col){//排序
    switch(this.rank[col]){
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
    for(let key in this.rank){
      if(key==col){
        continue;
      } 
      this.rank[key]="none";
    }
    this.query.SortField=col;
    this.query.SortRule=this.rank[col];
    this.initData(this.query);
  }

  //搜索
  search(){
    this.contractList=[];
    this.pagerData = new Pager();
      this.isSearch = true;
      this.loading = true;
      this.initData(this.query);
  }
  selectedIndexOf(SC_Code){//根据SC_Code寻找在已选列表里的index
    let len=this.selectedList.length;
    for(let i=0;i<len;i++){
      if(this.selectedList[i].SC_Code==SC_Code){
        return i;
      }
    }
    return -1;
  }
  childClick(e,index){//每行click时
    if(e){
        this.selectedList.push(this.contractList[index]);
    }else{
        this.selectedList.splice(this.selectedIndexOf(this.contractList[index]["SC_Code"]),1);
    }
  } 
  parentClick(e){//全选按钮点击
    let len=this.contractList.length;
    if(e){
      for(let i=0;i<len;i++){
        if(this.selectedIndexOf(this.contractList[i]["SC_Code"])==-1){
          this.selectedList.push(this.contractList[i]);
        }
      }
    }else{
       let index;
       for(let i=0;i<len;i++){
        index=this.selectedIndexOf(this.contractList[i]["SC_Code"]);
        if(index!=-1){
          this.selectedList.splice(index,1);
        }
      }
    }
  }
  nextStep(){//下一步点击
      if(this.selectedList.length==0){
        this.windowService.alert({message:"未选择合同",type:"warn"});
      }else{
        let list=this.checkAccessory();
        if(list && list.length){
          this.windowService.alert({ message: list.toString()+"合同未上传双章扫描件,请上传后再提交", type: "warn" });
        }else{
          window.localStorage.setItem("contractList",JSON.stringify(this.selectedList));
          this.onCompleteAddContract.emit(false);
        }
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
  closeConpoment(){//关闭 模态框
    this.onCompleteAddContract.emit(false);
  }
}