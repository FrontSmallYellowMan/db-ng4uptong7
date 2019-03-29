import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { OrderExemptionService, CustomerExemptionCondition } from '../../../services/order-exemption.service';
import { ExemptioncustomerlistComponent } from '../exemptioncustomerlist/exemptioncustomerlist.component';


@Component({
  templateUrl: './order-exemptioncreate.component.html',
  styleUrls: ['./order-exemptioncreate.component.scss']
})
export class OrderExemptioncreateComponent implements OnInit {
  public modal: XcModalRef;
  public modalCus:XcModalRef;
  public customerExemptionCondition:CustomerExemptionCondition = new CustomerExemptionCondition();
  public customerExemptionConditions=new Array<CustomerExemptionCondition>();
  public isEdit=false;
  public id:any;
  public isSubmit:boolean=false;

  constructor(private router: Router,private routerInfo: ActivatedRoute,private xcModalService: XcModalService,private windowService: WindowService,private orderExemptionService:OrderExemptionService) { }

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      if(data){
      this.isEdit=true;
      this.id=data;
      this.orderExemptionService.getExemptionCondition(data).subscribe(res=>{
        if(res.Result){
          if(res.Data){
            let cusec=JSON.parse(res.Data);
            this.customerExemptionCondition.CustomerCode=cusec.CustomerCode;
            this.customerExemptionCondition.CustomerName=cusec.CustomerName;
            this.customerExemptionCondition.StartTime=cusec.StartTime;
            this.customerExemptionCondition.EndTime=cusec.EndTime;
            this.customerExemptionCondition.Remark=cusec.Remark;
            let entity=new CustomerExemptionCondition();
            entity.YWFWDM=cusec.YWFWDM;
            entity.ArrearsAmount=cusec.ArrearsAmount===0?"":cusec.ArrearsAmount;
            this.customerExemptionConditions.push(entity);
          }
        }
      })
    }else{
      this.isEdit=false;
    }
    });
    this.modalCus=this.xcModalService.createModal(ExemptioncustomerlistComponent);
    this.modalCus.onHide().subscribe((data) => {
      if(data){
        this.customerExemptionCondition.CustomerCode=data["KUNNR"];
        this.customerExemptionCondition.CustomerName=data["NAME"];
        this.customerExemptionConditions=data["ExemptionConditions"];
      }
     
    });
  
  }
  getExemptionModel(){
  
  }
  searchCus(){
    let params = {
      CustomerCode:this.customerExemptionCondition.CustomerCode,
      CustomerName:this.customerExemptionCondition.CustomerName
    }
    this.modalCus.show(params);
  }
  save(){
    this.isSubmit=true;
    if(this.customerExemptionCondition.CustomerCode===undefined||this.customerExemptionCondition.CustomerCode===""){
      this.windowService.alert({message:"客户编号为必填",type:'warn'});
      return;
    }
    if(this.customerExemptionCondition.CustomerName===undefined||this.customerExemptionCondition.CustomerName===""){
      this.windowService.alert({message:"客户名称为必填",type:'warn'});
      return;
    }
    if(this.customerExemptionCondition.StartTime===undefined||this.customerExemptionCondition.StartTime===""){
      this.windowService.alert({message:"豁免开始时间不能为空",type:'warn'});
      return;
    }
    if(this.customerExemptionCondition.EndTime===undefined||this.customerExemptionCondition.EndTime===""){
      this.windowService.alert({message:"豁免结束时间不能为空",type:'warn'});
      return;
    }
    let i=0;
    this.customerExemptionConditions.forEach((cus)=>{
      if((cus.ArrearsAmount!==undefined&&cus.ArrearsAmount!=="")&&(cus.YWFWDM===undefined||cus.YWFWDM==="")){
        i++
      }
      
    });
    if(i>0){
      this.windowService.alert({message:"豁免金额不为空时，业务范围不能为空",type:'warn'});
      return;
    }
    if(!this.isEdit){
    let params={
      CustomerCode:this.customerExemptionCondition.CustomerCode,
      CustomerName:this.customerExemptionCondition.CustomerName,
      StartTime:this.customerExemptionCondition.StartTime,
      EndTime:this.customerExemptionCondition.EndTime,
      Remark:this.customerExemptionCondition.Remark,
      ListCondition:this.customerExemptionConditions
    }
    this.orderExemptionService.saveAdd(params).subscribe(data=>{
      if(data.Result){
        this.windowService.alert({message:"添加豁免条件成功！",type:"success"});
        this.hide(data);
      }else{
        this.windowService.alert({message:data.Message,type:"fail"})
      }
    })
  }else{
    if(this.id){
      let params={
        ID:this.id,
        CustomerCode:this.customerExemptionCondition.CustomerCode,
        CustomerName:this.customerExemptionCondition.CustomerName,
        StartTime:this.getDate(this.customerExemptionCondition.StartTime),
        EndTime:this.getDate(this.customerExemptionCondition.EndTime),
        Remark:this.customerExemptionCondition.Remark,
        YWFWDM:(this.customerExemptionConditions!==undefined||this.customerExemptionConditions==null)?this.customerExemptionConditions[0].YWFWDM:"",
        ArrearsAmount:(this.customerExemptionConditions!==undefined||this.customerExemptionConditions!==null)?this.customerExemptionConditions[0].ArrearsAmount:""

      }
      this.orderExemptionService.saveEdit(params).subscribe(data=>{
        if(data.Result){
          this.windowService.alert({message:"保存成功！",type:"success"});
          this.hide(data);
        }else{
          this.windowService.alert({message:data.Message,type:"fail"});
        }
      })
    }
  }
  }
  hide(data?:any){
    this.customerExemptionCondition.CustomerCode="";
    this.customerExemptionCondition.CustomerName="";
    this.customerExemptionCondition.StartTime="";
    this.customerExemptionCondition.EndTime="";
    this.customerExemptionCondition.Remark="";

    this.customerExemptionConditions=[];
    // this.customerExemptionConditions.forEach((cus,n)=>{
    //   this.customerExemptionConditions.splice(n,this.customerExemptionConditions.length)
    // })
    this.modal.hide(data);
  }
  addRow(){
    let cus:CustomerExemptionCondition =new CustomerExemptionCondition();
    this.customerExemptionConditions.push(cus);
  }
  deleteRow(index): void{
    this.customerExemptionConditions.splice(index,1);
 }
 getDate(date){
  let dataObj = new Date(date);
  let year = dataObj.getFullYear();
  let month = (dataObj.getMonth()+1).toString();
  let day = dataObj.getDate().toString();
  let temp = year + "-" + month + "-" + day;
    return temp;
}
// isLeapYear(currentYear:any){
//    if ((currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0)
//    {
//      return true;
//    }
//  }
// compareDate(date,flag){

//   let curYear=date.getFullYear();
//   let curMonth=date.getMonth()+1;
//   let curDate=date.getDate();
//   let dataObj = new Date(curYear+"-"+curMonth+"-"+curDate);
//   if(flag=="start"){
//     let endTimeObj=new Date(this.customerExemptionCondition.EndTime);
//     let endYear=endTimeObj.getFullYear();
//     let endMonth=endTimeObj.getMonth()+1;
//     let endDate=endTimeObj.getDate();
//     let endObj=new Date(endYear+"-"+endMonth+"-"+endDate);
//     if(dataObj>endObj){
//       this.windowService.alert({message:"开始时间不能晚于结束时间",type:"fail"});
//     }
//   }
//   if(flag==="end"){
//     let startTimeObj=new Date(this.customerExemptionCondition.StartTime);
//     let startYear=startTimeObj.getFullYear();
//     let startMonth=startTimeObj.getMonth()+1;
//     let startDate=startTimeObj.getDate();
//     let startObj=new Date(startYear+"-"+startMonth+"-"+startDate);
//     if(startObj>dataObj){
//       this.windowService.alert({message:"结束时间不能早于开始时间",type:"fail"});
//     }
//   }
//  }
}
