import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

import { WindowService } from 'app/core';
import { Pager} from 'app/shared/index';
import { 
    Query,Rank,
    ProcumentOrderNewService
 } from './../../services/procumentOrder-new.service';
 import { ShareMethodService } from './../../services/share-method.service';
import { dbomsPath } from '../../../../../environments/environment';

declare var localStorage,window;
@Component({
    templateUrl: 'procurement-order-new.component.html',
    styleUrls:['procurement-order-new.component.scss','./../../scss/procurement.scss']
})
export class ProcurementOrderNewComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  rank: Rank;//排序条件
  pagerData = new Pager();
  searchBoxShow = false;//搜索框显示标识

  applyList = [];//采购申请列表
  selectedList=[];//已选列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  DeptName:string;//保存部门名称
  testDepartment:any=[//需要验证的部门，用来区分是直接提交ND单，还是选择NA单
    {'name':'网络应用本部.通讯事业部'},
    {'name':'IBM本部'},
    {'name':'第一安全本部.系统网络'},
    {'name':'第二安全本部.新产品业务部'}
  ]

  constructor(private procumentOrderNewService:ProcumentOrderNewService,
    private windowService:WindowService,
    private router: Router,
    private shareMethodService: ShareMethodService
    ) {
  }

  ngOnInit(){
    this.query = new Query();
    this.rank = new Rank();
    this.DeptName=JSON.parse(localStorage.getItem('UserInfo')).DeptName;
    console.log(this.DeptName);
  }
clearSearch(){//重置搜索
  this.query = new Query();
}
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.initData(this.query);
  }
  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.procumentOrderNewService.getApplyList(query).then(data => {
      console.log(data);
      this.applyList = data.List;
      if(this.applyList && this.applyList.length){
        // console.log(this.applyList);
        let len=this.applyList.length;
        let index;let item;let selOne;
        let hasSelec=Boolean(this.selectedList && this.selectedList.length);//是否已有选择列表
        for(let i=0;i<len;i++){
          item=this.applyList[i];
          index=this.selectedIndexOf(item["id"]);
          if(index!=-1){//检查每个的checked
            item["checked"]=true;
          }
          if(hasSelec){//重置disabled
            selOne=this.selectedList[0];
            if(item.purchasetype!=selOne.purchasetype || item.vendor!=selOne.vendor || item.own!=selOne.own
              || item.factory!=selOne.factory || item.taxrate!=selOne.taxrate || item.currency!=selOne.currency
              || item.delivery!=selOne.delivery || item.receiver!=selOne.receiver || item.vendorbizscope!=selOne.vendorbizscope
              || item.available<=0){//不可选择
              // 相同的采购申请类型、供应商、我方主体、工厂、税率、币种、交货条件、收货人、对方业务范围且可采购金额大于0
              item.disabled=true;
            }
          }
        }
        // 设置分页器
        this.pagerData.pageNo=data.CurrentPage;
        this.pagerData.total=data.TotalCount;
        this.pagerData.totalPages=data.PageCount;
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
    this.query.SortName=col;
    this.query.SortType=this.rank[col];
    this.initData(this.query);
  }

  //搜索
  search(){
      this.applyList=[];
      this.pagerData = new Pager();
      this.isSearch = true;
      this.loading = true;
      this.initData(this.query);
  }
  selectedIndexOf(id){//根据id寻找在已选列表里的index
    let len=this.selectedList.length;
    for(let i=0;i<len;i++){
      if(this.selectedList[i].id==id){
        return i;
      }
    }
    return -1;
  }
  childClick(e,index){//每行click时
    if(e){
        this.selectedList.push(this.applyList[index]);
    }else{
        this.selectedList.splice(this.selectedIndexOf(this.applyList[index]["id"]),1);
    }
    if(e && this.selectedList && this.selectedList.length==1){//选中第一个时，重置disabled
      let len=this.applyList.length;
      let item;
      let selOne=this.selectedList[0];
      for(let i=0;i<len;i++){
        if(i==index){continue;}
        item=this.applyList[i];
        if(item.purchasetype!=selOne.purchasetype || item.vendor!=selOne.vendor || item.own!=selOne.own
          || item.factory!=selOne.factory || item.taxrate!=selOne.taxrate || item.currency!=selOne.currency
          || item.delivery!=selOne.delivery || item.receiver!=selOne.receiver || item.vendorbizscope!=selOne.vendorbizscope
          || item.available<=0){//不可选择
            item.disabled=true;
        }
      }
    }
    if(!e && this.selectedList && this.selectedList.length==0){//取消最后一个选择时，重置disabled
      let len=this.applyList.length;
      for(let i=0;i<len;i++){
        this.applyList[i].disabled=false;
      }
    }
  } 
  parentClick(e){//全选按钮点击
    let len=this.applyList.length;
    if(e){
      for(let i=0;i<len;i++){
        if(!this.applyList[i]["disabled"] && this.selectedIndexOf(this.applyList[i]["id"])==-1){
          this.selectedList.push(this.applyList[i]);
        }
      }
    }else{
       let index;
       for(let i=0;i<len;i++){
        index=this.selectedIndexOf(this.applyList[i]["id"]);
        if(index!=-1){
          this.selectedList.splice(index,1);
        }
        this.applyList[i].disabled=false;//取消选择时，重置disabled
      }
    }
  }
  nextStep(){//下一步点击
    if(this.selectedList.length==0){
      this.windowService.alert({message:"未选择采购申请",type:"warn"});
    }else{

      let totalUnTaxAmount=0;//选择合同列表的 未税总额      
      for(let i=0,len=this.selectedList.length;i<len;i++){
        totalUnTaxAmount+=this.selectedList[i]["excludetaxmoney"];
      }
      this.shareMethodService.judgeSupplierType(this.selectedList[0]["factory"],this.selectedList[0]["vendorno"])
      .then(data => {//判断供应商类型
          if (data.Result) { 
              //判断 采购订单 类型
              this.procumentOrderNewService.judgeProcumentOrderType(data.Data,
                  this.selectedList[0]["vendorno"],totalUnTaxAmount,this.selectedList[0]["VendorTrace"]).then(response => {
                    if(response){
                      switch(response){
                        case "NA":
                          {
                            for(let i=0,len=this.selectedList.length;i<len;i++){
                              this.selectedList[i]["text"] = this.selectedList[i]["requisitionnum"] + "-" + this.selectedList[i]["MainContractCode"];//拼接选项
                            }
                            window.localStorage.setItem("NAApplyList",JSON.stringify(this.selectedList));
                            window.localStorage.setItem("createNAType","hasApply");
                            //this.router.navigate(['/procurement/submit-NA']);
                            window.open(dbomsPath+"procurement/submit-NA");
                            break;
                          }
                        case "NB":
                          {
                            for(let i=0,len=this.selectedList.length;i<len;i++){
                              this.selectedList[i]["text"] = this.selectedList[i]["requisitionnum"] + "-" + this.selectedList[i]["MainContractCode"];//拼接选项
                            }
                            window.localStorage.setItem("applyList",JSON.stringify(this.selectedList));
                            window.localStorage.setItem("createNBType","hasApply");
                            //this.router.navigate(['/procurement/submit-NB']);
                            window.open(dbomsPath+"procurement/submit-NB");
                            break;
                          }
                        case "UB":
                          {
                            for(let i=0,len=this.selectedList.length;i<len;i++){
                              this.selectedList[i]["text"] = this.selectedList[i]["requisitionnum"] + "-" + this.selectedList[i]["MainContractCode"];//拼接选项
                            }
                            window.localStorage.setItem("applyList",JSON.stringify(this.selectedList));
                            window.localStorage.setItem("createUBType","hasApply");
                            //this.router.navigate(['/procurement/submit-NB']);
                            window.open(dbomsPath+"procurement/submit-UB");
                            break;
                          }
                        default:
                          this.windowService.alert({message:response+"类型采购订单正在建设中",type:"warn"});
                      }
                    }
              })
          }
      })

    }
  }
  directCreatOrder(type){//直接创建订单
    switch(type){
      case "NA":
        {
          window.localStorage.setItem("createNAType","directNA");
          //this.router.navigate(['/procurement/submit-NA']);
          window.open(dbomsPath+"procurement/submit-NA");
          break;
        }
      case "NB":
        {
          window.localStorage.setItem("createNBType","directNB");
          //this.router.navigate(['/procurement/submit-NB']);
          window.open(dbomsPath+"procurement/submit-NB");
          break;
        }
      case "ND":
        {
          //this.router.navigate(['/procurement/select-NA']);
          console.log(this.DeptName);
          if(this.testDepartment.some(item=>this.DeptName.search(item.name)!=-1)){
            window.open(dbomsPath+'procurement/submit-ND');
          }else{
            window.open(dbomsPath+"procurement/select-NA");
          }         
          break;
        }
        case "NK":
        {
          //this.router.navigate(['/procurement/submit-NK']);
          window.open(dbomsPath+"procurement/submit-NK");          
          break;
        }
        case "UB":
        {
          //this.router.navigate(['/procurement/submit-NK']);
          window.open(dbomsPath+"procurement/submit-UB");          
          break;
        }
      default:
        this.windowService.alert({message:type+"类型采购订单正在建设中",type:"warn"});
    }
  }
}