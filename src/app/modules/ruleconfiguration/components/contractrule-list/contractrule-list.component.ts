import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import { dbomsPath,environment } from "environments/environment";
import { ContractRuleConfigService ,Query,ContractRuleConfigInfo} from '../../services/contractruleconfig.service';

declare var $,window,localStorage;
@Component({
  selector: 'db-contractrule-list',
  templateUrl: './contractrule-list.component.html',
  styleUrls: ['./contractrule-list.component.scss']
})
export class ContractruleListComponent implements OnInit {
  contractConfigList:ContractRuleConfigInfo[]=[];
  query:Query=new Query();
  pagerData=new Pager();
  isSearch:boolean=false;
  loading:boolean=true;
  searchWord:string;//查询关键字
  disabled:Boolean=true;
  constructor(private contractRuleConfigService:ContractRuleConfigService,private xcModalService:XcModalService,private windowService:WindowService) { }

  ngOnInit() {
      this.watchLocalStrong();
      this.loading=false;
      this.query={BusinessCode:"",RoleName:"",BusinessType:"SalesContract",PageSize:"10",CurrentPage:"1"};
      // this.initData(this.query);
     
  }
  initData(query:Query){
    this.contractRuleConfigService.getContractRuleList(query).subscribe(data=>{
      if(data.Result){
        this.loading=false;
        let res=JSON.parse(data.Data);
        console.log(res);
        this.contractConfigList=res.List;
        this.pagerData.set({
          total:res.TotalCount,
          totalPages:res.PageCount,
          pageNo:query.CurrentPage
        })
      }else{
         this.windowService.alert({message:data.message,type:"fail"});
      }
    })
  }
  addContractConfig(){
    window.open(dbomsPath + 'ruleconfiguration/contractrule-edit?id=0');
  }
  search(){
  this.isSearch= !!this.query.BusinessCode || !!this.query.RoleName;
  this.searchWord = this.query.BusinessCode + (this.query.RoleName ? '、' + this.query.RoleName : '');
  
    this.query.CurrentPage= "1";
    this.pagerData.set({
        pageNo: this.query.CurrentPage
    })
    this.query.BusinessCode=this.query.BusinessCode.replace(/\s/g, "");
    this.query.RoleName=this.query.RoleName.replace(/\s/g, "");
    this.initData(this.query);
  }
  reset(){
   this.query.BusinessCode="";
   this.query.RoleName="";
   this.initData(this.query);
  }
  onChangePager(e){
    this.query.CurrentPage = e.pageNo;
    this.query.PageSize = e.pageSize;
    this.initData(this.query);
  }
  GoToEdit(id:number){
    window.open(dbomsPath + 'ruleconfiguration/contractrule-edit?id='+id);
  }
  updateStart(entity:ContractRuleConfigInfo){
    let par={RoleID:entity.RoleID,RoleStatus:true}
        this.contractRuleConfigService.setContractRuleStatus(par).subscribe(data=>{
          if(!data.Result){
            this.windowService.alert({message:data.Message,type:"fail"});
          }else{
            this.initData(this.query);
          }
       });
  }
  updateStop(entity:ContractRuleConfigInfo){
     this.windowService.confirm({message:"确定要停用？"}).subscribe({next:(v)=>{
       if(v){
        let par={RoleID:entity.RoleID,RoleStatus:false}
        this.contractRuleConfigService.setContractRuleStatus(par).subscribe(data=>{
          if(!data.Result){
            this.windowService.alert({message:data.Message,type:"fail"});
          }else{
            this.initData(this.query);
          }
        });
       }
     }});
   
  }
  deleteContractRule(ruleID:number){
    this.windowService.confirm({message:"确定要删除吗？"}).subscribe({
      next:(v)=>{
        if(v){
          this.contractRuleConfigService.deleteContractRule({RoleID:ruleID}).subscribe(data=>{
            if(!data.Result){
                this.windowService.alert({message:data.Message,type:"fail"});
            }else{
              this.initData(this.query);
            }
          })
        }
      }
    })
  }
     //监听loaclstrong，用来确认是否刷新列表页
     watchLocalStrong(){
      let that=this;
      window.addEventListener("storage", function (e) {//监听localstorage
        console.log(e.newValue,e);
        if(e.key==="contractRuleConfig"&&e.newValue.search("save")!=-1){
          that.initData(that.query);
          localStorage.removeItem('contractRuleConfig');
        }
    });
    }
}
