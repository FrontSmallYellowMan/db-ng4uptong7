import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from "../../../../../../app/core";
import { Pager, XcModalService, XcModalRef } from '../../../../../../app/shared/index';
import { dbomsPath } from "environments/environment";
import { OrderExemptionService } from '../../../services/order-exemption.service';
import { Query } from '../../../services/order-exemption.service';
import {OrderExemptioncreateComponent} from '../../order-exemption/order-exemptioncreate/order-exemptioncreate.component';
@Component({
  selector: 'db-order-exemptionlist',
  templateUrl: './order-exemptionlist.component.html',
  styleUrls: ['./order-exemptionlist.component.scss']
})
export class OrderExemptionlistComponent implements OnInit {

  constructor(private activateRoute:ActivatedRoute, private router:Router,private xcModalService: XcModalService,private windowService:WindowService,private orderExemptionService:OrderExemptionService) { }
  query: Query = new Query();//查询条件数组
  default:boolean=false;
  currentTableData:any=[];
  userInfo=JSON.parse(window.localStorage.getItem('UserInfo'))
  //是否首次加载
  isInitLoad: boolean = true;
  //分页
  pagerData = new Pager();
  loading:boolean=false;//加载中
  initChanges=true;
  modalNew:XcModalRef;//新建模态框
  reload:boolean=false;//从新加载
  ngOnInit() {
    if(!this.userInfo){
    this.windowService.confirm({message:"当前登录信息失效，请重新登录！"}).subscribe({next:(v)=>{
      if(v){
        window.location.href="/login";
      }
    }})
    return;
    }  
    this.query={
      InputCondition:"",
      CurrentPage:1,
      PageSize:10
    }
    this.initData();
    this.modalNew=this.xcModalService.createModal(OrderExemptioncreateComponent);
    this.modalNew.onHide().subscribe((data) => {
      if(data){
       this.initData();
      }
    })
  }
  initData(){
    this.loading=true;
    this.orderExemptionService.getExemptionList(this.query).subscribe(data=>{
      if(data.Result){
        let res=JSON.parse(data.Data);
       
        console.log(res);
        this.currentTableData=res.ListCusExe;
       
        if(this.currentTableData.length<1){
          this.default=true;
        }else{
          this.pagerData.set({
            total:res.TotalCount,
            totalPages:Math.ceil(res.TotalCount / res.PageSize)
          });
          this.default=false;
        }
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
        this.default=true;
      }
      this.loading=false;
    })
  }

  onChangePage(e: any) {
    if(this.initChanges){
        this.initChanges = false;
        return ;
    }
  //   //非第一页，切换条数。跳为第一页
  //   if(this.currentPageSize != e.pageSize){
  //       this.pagerData.pageNo = 1;
  //   }

    this.query.InputCondition = this.query.InputCondition || "";
    this.query.CurrentPage = e.pageNo;
    this.query.PageSize=e.pageSize;
  //   this.postContractData.PageSize = e.pageSize;
    this.initData();
}
search(){
  if(this.loading==false){
    this.query.InputCondition =this.query.InputCondition.trim();
    this.query.CurrentPage= 1;
    this.pagerData.set({
        pageNo: this.query.CurrentPage
    })
    this.query.InputCondition=this.query.InputCondition.replace(/\s/g, "");
    this.initData();
   }
  }
  reset(){
    this.query.InputCondition='';
    this.initData();
  }
  createExemption(){
  
   this.modalNew.show();
  }
  deleteCondition(id:any):void{
    this.windowService.confirm({ message: "确认删除此订单?" }).subscribe({
      next: (v) => {
      if (v) {
            this.orderExemptionService.deleteCondition(id).subscribe(data=>{
            if(data.Result){
            this.windowService.alert({message:"删除成功！",type:"success"});
            this.initData();
       }else{
       this.windowService.alert({message:data.Message,type:"fail"});
     }
   });
  }
}
});
}
  viewCondition(id:any){
   if(id!==undefined&&id!==""){
    this.modalNew.show(id);
   }
  }
}


