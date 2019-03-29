import { Component, OnInit,OnDestroy } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { dbomsPath } from "environments/environment";
declare var $: any;

import { ApplyMyapplyQuery,ApplyMyapplyRank,
  ProcurementListDataService } from '../../services/procurement-listData.service';
import { ProcumentOrderNewService } from './../../services/procumentOrder-new.service';
import { ShareMethodService } from './../../services/share-method.service';
import { SupplyConNumModalComponent } from '../supplyConNumModal/supplyConNumModal.component';


@Component({
  templateUrl: 'procurement-apply-myapply.component.html',
  styleUrls:['procurement-apply-myapply.component.scss','./../../scss/procurement.scss']
})
export class ProcurementApplyMyApplyComponent implements OnInit {
  pagerData = new Pager();
  query: ApplyMyapplyQuery = new ApplyMyapplyQuery();
  rank: ApplyMyapplyRank=new ApplyMyapplyRank();//排序条件
  highSearchShow: boolean = false;//高级搜索
  loading: boolean = true;//加载中效果

  searchList:any;//用于存储搜索结果列表
  selectedList;//提交采购订单时 获取的该采购申请的 数据
  applyType;//提交采购订单时 记录此时要 提交的采购申请 类型

  supplyContractModal: XcModalRef;//添加合同号输入模态框
  
  fullChecked_appr = false;//全选状态_审批列表
  fullCheckedIndeterminate_appr = false;//半选状态_审批列表
  checkedNum_appr = 0;//已选项数_审批列表

  fullChecked_comp = false;//全选状态_已完成列表
  fullCheckedIndeterminate_comp = false;//半选状态_已完成列表
  checkedNum_comp = 0;//已选项数_已完成列表

  fullChecked_whol = false;//全选状态_全部列表
  fullCheckedIndeterminate_whol = false;//半选状态_全部列表
  checkedNum_whol = 0;//已选项数_全部列表

  constructor(
    private procumentOrderNewService:ProcumentOrderNewService,
    private procurementListDataService: ProcurementListDataService,
    private windowService:WindowService,
    private router: Router,
    private shareMethodService: ShareMethodService,
    private xcModalService: XcModalService
  ) { }

  ngOnInit() {
    let self = this;
    window.addEventListener('focus',function(){
        self.initData(self.query,true);
    });
    this.supplyContractModal = this.xcModalService.createModal(SupplyConNumModalComponent);
    this.supplyContractModal.onHide().subscribe((res?) => {
        if(res){
            if(res.Result){
                this.initData(this.query,false);//刷新
            }else{
              this.windowService.alert({ message:res.Message, type: 'fail' });    
            }
        }
    })
  }

  ngOnDestroy(){
    let self =this;
    window.removeEventListener('focus',function(){
        self.initData(self.query,true);
    });
  }

  CheckIndeterminate_appr(v) {//检查是否全选
    this.fullCheckedIndeterminate_appr = v;
  }
  CheckIndeterminate_comp(v) {//检查是否全选
    this.fullCheckedIndeterminate_comp = v;
  }
  CheckIndeterminate_whol(v) {//检查是否全选
    this.fullCheckedIndeterminate_whol = v;
  }
  supplyContractNum(sel){//添加销售合同号
    switch(this.query.WfStatus){
      case '审批':
            if(!this.checkedNum_appr){
              this.windowService.alert({ message: "还未选择项", type: "warn" });
              return;
            }
            break;
      case '完成':
            if(!this.checkedNum_comp){
              this.windowService.alert({ message: "还未选择项", type: "warn" });
              return;
            }
            break;
      case '':
            if(!this.checkedNum_whol){
              this.windowService.alert({ message: "还未选择项", type: "warn" });
              return;
            }
            break;
    }
    let arr=[];
    for(let i=0,len=this.searchList.length;i<len;i++){
      if(this.searchList[i]["checked"]){
        arr.push(this.searchList[i]["ID"]);
      }
    }
    this.supplyContractModal.show(arr);
  }

  onTab(type){//切换选项（全部，审批中，已完成，草稿
    this.query.WfStatus = type;//切换申请类型
    this.query.PageIndex=1;//重置分页
    this.rank['addtime'] = "desc";//重置排序
    for(let key in this.rank){
        if(key=='addtime'){
          continue;
        } 
        this.rank[key]="none";
    }
    this.query.SortName='addtime';
    this.query.SortType='desc';
    this.loading = true;
    this.initData(this.query,false);
  }

  search(){//点击搜索按钮的搜索
    this.searchList=[];
    this.pagerData = new Pager();
     this.loading = true;
     this.initData(this.query,false);
  } 

  reset() {//重置搜索数据
    let state=this.query.WfStatus;
    this.query = new ApplyMyapplyQuery();
    this.query.WfStatus=state;
    $(".iradio_square-blue").removeClass('checked');
  }
  addClass(){//radio bug-手动添加class
    if(this.query.IsModify){
      $(".iradio_square-blue:first").addClass("checked");
    }
  }

  onChangePager(e: any) {//分页代码
        this.query.PageIndex = e.pageNo;
        this.query.PageSize = e.pageSize;
        this.loading = true;
        this.initData(this.query,false);
    }

    initData(query: ApplyMyapplyQuery,naturalTrigger) {//向数据库发送请求
      // naturalTrigger-页面监听focus触发的刷新
      switch(this.query.WfStatus){
        case '审批':
              if(naturalTrigger &&
                (this.fullChecked_appr || this.fullCheckedIndeterminate_appr || this.checkedNum_appr)){
                return;
              }else{
                this.fullChecked_appr = false;
                this.fullCheckedIndeterminate_appr = false;
                this.checkedNum_appr = 0;
                this.searchList=[];//需要先置空！！不然会保存上一个列表选择的数量
              }
              break;
        case '完成':
              if(naturalTrigger &&
                (this.fullChecked_comp || this.fullCheckedIndeterminate_comp || this.checkedNum_comp)){
                return;
              }else{
                this.fullChecked_comp = false;
                this.fullCheckedIndeterminate_comp = false;
                this.checkedNum_comp = 0;
                this.searchList=[];
              }
              break;
        case '': 
              if(naturalTrigger &&
                (this.fullChecked_whol || this.fullCheckedIndeterminate_whol || this.checkedNum_whol)){
                return;
              }else{
                this.fullChecked_whol = false;
                this.fullCheckedIndeterminate_whol = false;
                this.checkedNum_whol = 0;
                this.searchList=[];
              }
              break;
      }
        this.procurementListDataService.searchApplyMyapplyData(this.query).then(data => {
            console.log(data);
            let list = data.Data.List;
            for(let i=0,len=list.length;i<len;i++){//处理CurrentApprovalNode
              let item=list[i];
              if(item["CurrentApprovalNode"]=="[]" || !item["CurrentApprovalNode"]){//无值
                item["CurrentApprovalNode"]=[{
                  approver:"",
                  nodename:""
                }];
              }else{
                item["CurrentApprovalNode"]=JSON.parse(item["CurrentApprovalNode"]);
              }
              if(this.query.WfStatus!="草稿" && 
                (item["PurchaseType"].indexOf("预下单采购_无合同")==-1 || item["MainContractCode"])){//设置disabled
                item["disabled"]= true;
              }
            }
            this.searchList=list;
            //设置分页器
            this.pagerData.pageNo=data.Data.CurrentPage;//当前页
            this.pagerData.total=data.Data.TotalCount;//总条数
            this.pagerData.totalPages=data.Data.PageCount;//总页数
            this.loading = false;
        });
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
      this.loading = true;
      this.initData(this.query,false);
  }
  deleteDraft(id){//删除草稿
    let listLength=this.searchList.length;//记录当前页的条数
    let callback = data => {
      if(data.Result){
        this.windowService.alert({message:"删除成功",type:"success"});
        this.loading = true;
        if(listLength==1){//如果删除的是 当前页的最后一项 则跳转到第一页
          this.query.PageIndex=1;
        }
        this.initData(this.query,false);
      }else{
        this.windowService.alert({message:"删除失败",type:"fail"})
      }
    }
    this.procurementListDataService.deleteApplyMyapplyData(id).then(callback);
  } 
  routerJump(type,id,PurchaseType){//点击列表跳转的判断
    if(PurchaseType.indexOf("合同单采购")!=-1){//合同采购申请
      if(type=='驳回'||type=='草稿'){
        window.open(dbomsPath+'procurement/submit-contractapply/' + id);
      }else{
        window.open(dbomsPath+'procurement/deal-contractapply/'+ id);
      }
      return;
    }
    if(PurchaseType.indexOf("预下单采购")!=-1){//预下采购申请
      if(type=='驳回'||type=='草稿'){
        window.open(dbomsPath+'procurement/submit-prepareapply/' + id);
      }else{
        window.open(dbomsPath+'procurement/deal-prepareapply/'+ id);
      }
      return;
    }
    if(PurchaseType.indexOf("备货单采购")!=-1){//备货采购申请
      if(type=='驳回'||type=='草稿'){
        window.open(dbomsPath+'procurement/submit-stockapply/' + id);
      }else{
        window.open(dbomsPath+'procurement/deal-stockapply/'+ id);
      }
    }
  }
  toUpdateApply(id,PurchaseType,IsRelieve?){//已完成列表-修改

    if(IsRelieve){
      this.windowService.alert({message:"该采购申请对应的销售合同已解除，不允许修改",type:"fail"});
      return;
    }

    if(PurchaseType.indexOf("合同单采购")!=-1){//合同采购申请
      window.open(dbomsPath+'procurement/submit-contractapply/'+id);
      return;
    }
    if(PurchaseType.indexOf("预下单采购")!=-1){//预下采购申请
      window.open(dbomsPath+'procurement/submit-prepareapply/'+id);
      return;
    }
    if(PurchaseType.indexOf("备货单采购")!=-1){//备货采购申请
      window.open(dbomsPath+'procurement/submit-stockapply/'+id);
    }
  }
  toPurchaseOrder(id,PurchaseType,IsRelieve?,MainContractCode?,RequisitionNum?){//提交采购订单 第一步 获取采购申请数据

    if(IsRelieve){
      this.windowService.alert({message:"该采购申请对应的销售合同已解除，不允许修改",type:"fail"});
      return;
    }

    if(PurchaseType.indexOf("合同单采购")!=-1){//合同采购申请
      this.applyType="合同单采购";
      this.getApplyFun(id);
      return;
    }
    if(PurchaseType.indexOf("预下单采购")!=-1){//预下采购申请
      if(PurchaseType.indexOf("有合同")!=-1){//预下-有合同
        this.applyType="预下单有合同";
        this.getApplyFun(id);
        return;
       }
       if(PurchaseType.indexOf("无合同")!=-1){//预下-无合同
        if(MainContractCode){//如果存在合同号，则为预下有合同
          this.applyType="预下单有合同";
          this.procumentOrderNewService.getPrepareApplyNoContractMes(id).then(data => {
          this.selectedList= data;
          this.toPurchaseOrderStepTwo();
         })
        }else{
          this.applyType="预下单无合同";
          this.procumentOrderNewService.getPrepareApplyNoContractMes(id).then(data => {
           this.selectedList= data;
           this.toPurchaseOrderStepTwo();
          })
        }
       
       }
    }
  }
  getApplyFun(id){//合同单采购 预下单采购 共用一个 获取申请接口
    let query={
      "PageIndex": 1,
      "PageSize": 1000,   
      "purchaserequisitionid":id
    }
    this.procumentOrderNewService.getApplyList(query).then(data => {//获取采购申请 单条信息
      this.selectedList= data.List;
      this.toPurchaseOrderStepTwo();
    })  
  }
  toPurchaseOrderStepTwo(){//提交采购订单 第二步 判断采购订单类型跳转
    this.shareMethodService.judgeSupplierType(this.selectedList[0]["factory"],this.selectedList[0]["vendorno"])
    .then(data => {//判断供应商类型
        if (data.Result) { 
            //判断 采购订单 类型
            this.procumentOrderNewService.judgeProcumentOrderType(data.Data,
              this.selectedList[0]["vendorno"],this.selectedList[0]["excludetaxmoney"],this.selectedList[0]["VendorTrace"]).then(response => {
                if(response){
                  switch(response){
                    case "NA":
                      {
                        if(this.applyType=="合同单采购" || this.applyType=="预下单有合同"){
                          for(let i=0,len=this.selectedList.length;i<len;i++){
                            this.selectedList[i]["text"] = this.selectedList[i]["requisitionnum"] + "-" + this.selectedList[i]["MainContractCode"];//拼接选项
                          }
                        }
                        window.localStorage.setItem("NAApplyList",JSON.stringify(this.selectedList));
                        switch(this.applyType){
                          case "合同单采购":
                            window.localStorage.setItem("createNAType","hasApply");
                            break;
                          case "预下单有合同":
                            window.localStorage.setItem("createNAType","prepareApplyHasContract");
                            break;
                          case "预下单无合同":
                            window.localStorage.setItem("createNAType","prepareApplyNoContract");
                            break;
                        }
                        window.open(dbomsPath+'procurement/submit-NA');
                        break;
                      }
                    case "NB":
                      {
                        if(this.applyType=="合同单采购" || this.applyType=="预下单有合同"){
                          for(let i=0,len=this.selectedList.length;i<len;i++){
                            this.selectedList[i]["text"] = this.selectedList[i]["requisitionnum"] + "-" + this.selectedList[i]["MainContractCode"];//拼接选项
                          }
                        }
                        window.localStorage.setItem("applyList",JSON.stringify(this.selectedList));
                        switch(this.applyType){
                          case "合同单采购":
                            window.localStorage.setItem("createNBType","hasApply");
                            break;
                          case "预下单有合同":
                            window.localStorage.setItem("createNBType","prepareApplyHasContract");
                            break;
                          case "预下单无合同":
                            window.localStorage.setItem("createNBType","prepareApplyNoContract");
                            break;
                        }
                        window.open(dbomsPath+'procurement/submit-NB');
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