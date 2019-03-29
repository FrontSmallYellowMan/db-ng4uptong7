import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import { dbomsPath,environment } from "environments/environment";
import { ContractRuleConfigService,BusinessUnitInfo } from '../../services/contractruleconfig.service';

@Component({
  selector: 'db-searchbusinessunit',
  templateUrl: './searchbusinessunit.component.html',
  styleUrls: ['./searchbusinessunit.component.scss']
})
export class SearchBusinessUnitComponent implements OnInit {
  buList:BusinessUnitInfo[]=[{BBMC:"IBM本部",SYBMC:"IBM事业部",checked:true},{BBMC:"电力BU",SYBMC:"电力北区事业二部",checked:false}];
  pagerData=new Pager();
  loading:boolean=true;
  searchBU:string;
  modal:XcModalRef;
  selectSYB:any=[];
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
  selected(isChecked,i){
  
    let BBMC:string=this.buList[i].BBMC;
    let SYBMC:string=this.buList[i].SYBMC;
    let SYB:any=JSON.stringify({BBMC:BBMC,SYBMC:SYBMC});

    if (isChecked && this.selectSYB.indexOf(SYB)===-1) {
      this.selectSYB.push(SYB);
    }
    //如果没有选中并且数组中存在所选项的ID，将ID从数组中删除
    if (!isChecked && this.selectSYB.indexOf(SYB)>-1) {
      this.selectSYB.splice(this.selectSYB.indexOf(SYB),1);
    }
    console.log(this.selectSYB);
  }
  save(){
   let selectedList=this.buList.filter(item=>item.checked===true);
   if(selectedList.length===0){
     if(this.buList.length>0){
       this.windowService.alert({message:"请选择事业部",type:"fail"});
     }
   }else{
    this.hide(selectedList);
   }
  }
  hide(item?:any){
    this.selectSYB=[];
    this.modal.hide(item);
  }
  onChangePage(e){

  }
}
