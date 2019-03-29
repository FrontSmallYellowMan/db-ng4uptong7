import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import { dbomsPath,environment } from "environments/environment";
import { ContractRuleConfigService, CompanyInfo, CompanyQuery} from '../../services/contractruleconfig.service';

@Component({
  selector: 'db-searchcompany',
  templateUrl: './searchcompany.component.html',
  styleUrls: ['./searchcompany.component.scss']
})
export class SearchCompanyComponent implements OnInit {
  companyList:CompanyInfo[]=[{CompanyCode:"0021",CompanyName:"北京神州数码",checked:false}];
  query:CompanyQuery=new CompanyQuery();
  pagerData=new Pager();
  loading:boolean=true;
  companysearch:string;
  modal:XcModalRef;
  selectCompany:any=[];
  constructor(private contractRuleConfigService:ContractRuleConfigService,private xcModalService:XcModalService,private windowService:WindowService) { }

  ngOnInit() {
    this.loading=false;

      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);

      this.modal.onShow().subscribe((data) => {
          if(data){
            
          }
      });
  }
  addContractConfig(){

  }
  search(){

  }
  reset(){

  }
  onChangePager(e){

  }
  selected(isChecked,i){
    let companyCode:string=this.companyList[i].CompanyCode;
    let companyName:string=this.companyList[i].CompanyName;
    let companyInfo:any=JSON.stringify({CompanyCode:companyCode,CompanyName:companyName});
    if(isChecked&&this.selectCompany.indexOf(companyInfo)===-1){
      this.selectCompany.push(companyInfo);
    }
    if(!isChecked&&this.selectCompany.indexOf(this.selectCompany)>-1){
      this.selectCompany.splice(this.selectCompany.indexOf(companyInfo),1);

    }
    console.log(this.selectCompany);
  }
  save(){
    let selectCompanyList=this.companyList.filter(item=>item.checked===true);
    if(selectCompanyList.length===0){
      if(this.companyList.length>0){
        this.windowService.alert({message:"请选择我方法人体",type:"fail"});

      }
    }else{
      this.hide(selectCompanyList);
    }
  }
  hide(item?:any){
    this.selectCompany=[];
    this.modal.hide(item);
  }
}
