import { Component, OnInit,ViewChild } from '@angular/core';
import { ContractRuleConfigService, BusinessUnitInfo, CompanyInfo,QuerySYBMCData, WFConfigInfo, BaseRoleInfo, SC_FieldData, FieldMsgInfo, ApproverInfo, ContractRuleConfigForm, SC_FieldDataInput,ApproverList, ApproverStr,ApproverOut, DataInfo,ContractApproveNodes } from '../../services/contractruleconfig.service';
import { WindowService } from "../../../../../app/core";
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { SearchCompanyComponent} from '../select-value/searchcompany.component';
import {SearchBusinessUnitComponent} from '../select-value/searchbusinessunit.component';
import { Person } from '../../../../shared';
import { ActivatedRoute, Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { userInfo } from 'os';
import {PurchaseApplicationService} from "../../services/purchaseApplication.service";
import { element } from 'protractor';

declare var window,localStorage;

@Component({
  selector: 'db-contractrule-edit',
  templateUrl: './contractrule-edit.component.html',
  styleUrls: ['./contractrule-edit.component.scss']
})
export class ContractruleEditComponent implements OnInit {

  querySYBMCData:QuerySYBMCData=new QuerySYBMCData();

  ID:any;
  loading:boolean=false;
  ischoose:any=0;
  IsEdit:boolean=false;
  isSubmit:boolean=false;
  modalcompany:XcModalRef;
  modalbu:XcModalRef;
  // selectBuList:BusinessUnitInfo[]=[];
  // selectCompanyList:CompanyInfo[]=[];
  departmentList:any;
  companyList:any;
  wfConfigInfoList:any = ContractApproveNodes;
  fieldConfigList:FieldMsgInfo[]=[];
  fieldMsgArray:FieldMsgInfo[]=[];
  DataList:DataInfo[]=[];
  fieldConfigShow:FieldMsgInfo[]=[];
  contractRuleConfigForm:ContractRuleConfigForm=new ContractRuleConfigForm();

  @ViewChild('form') public form: NgForm;
  constructor(
    private contractRuleConfigServices:ContractRuleConfigService,private purchaseApplicationService:PurchaseApplicationService, private xcModalService: XcModalService,private windowService:WindowService,private routerInfo: ActivatedRoute) { }

  ngOnInit() {
  //   this.ischoose=0;
  //   this.modalcompany=this.xcModalService.createModal(SearchCompanyComponent);
  //   this.modalcompany.onHide().subscribe((data) => {
  //     if(data){
  //       data.forEach(item => {
  //         if(this.selectCompanyList.length>0){
  //          let i= this.selectCompanyList.indexOf(item)
  //          if(i<0){
  //            this.selectCompanyList.push(item);
  //          }
  //        }else{
  //             this.selectCompanyList=data;
  //           }
  //         });
  //   }
  // })
  // this.modalbu=this.xcModalService.createModal(SearchBusinessUnitComponent);
  // this.modalbu.onHide().subscribe((data)=>{
  //    if(data){
  //      data.forEach(item => {
  //      if(this.selectBuList.length>0){
  //       let i= this.selectBuList.indexOf(item)
  //       if(i<0){
  //         this.selectBuList.push(item);
  //       }
  //     }else{
  //          this.selectBuList=data;
  //        }
  //      });
  //    }
  // });
  this.getUrlParm();
  this.contractRuleConfigServices.getFieldConfigList("SalesContract").subscribe(data=>{
    if(data.Result){
      this.fieldConfigList=JSON.parse(data.Data);
      this.fieldConfigList.forEach(element=>{
       let dataInfo:DataInfo;
       dataInfo=JSON.parse(element.Data);
       element.Data=dataInfo;
       element.IfRequired=null;
     })
    }
  });
  if(this.ID!=="0"){
  this.IsEdit=true;
  this.getContractRuleInfo(this.ID);
 }
}
 getContractRuleInfo(ID:string){
  this.contractRuleConfigServices.getContractRuleInfo({RoleID:ID}).subscribe(data=>{
    if(data.Result){
     let res=JSON.parse(data.Data);
     this.contractRuleConfigForm.CompanyCodeList=res.CompanyCodeList
     this.contractRuleConfigForm.YWFWDMList=res.YWFWDMList;
     this.contractRuleConfigForm.WFConfigList=res.WFConfigList;

     this.contractRuleConfigForm.WFConfigList.forEach(item=>{
       this.wfConfigInfoList.forEach(element => {
         if(element.NodeID===item.NodeID){
           element.ApproverShow=JSON.parse(item.ApproverList);
           element.ApproverList=JSON.parse(item.ApproverList);
           element.IsOpened=item.IsOpened;
           element.IfRequired=item.IfRequired;
         }
       });
     })


  
     this.contractRuleConfigForm.BaseRole=res.BaseRole;
     this.contractRuleConfigForm.SC_FieldData.FieldMsg=res.SC_FieldData;
     let fieldMsgArrayInput:SC_FieldDataInput=JSON.parse(res.SC_FieldData);
     this.fieldMsgArray=fieldMsgArrayInput.FieldMsg;
     console.log(this.fieldMsgArray);
   
    if(this.fieldMsgArray.length>0){
    this.fieldMsgArray.forEach(e=>{
     
        this.fieldConfigList.forEach(function(model,index){
          if(model.FieldName===e.FieldName){
            model.IsShowField=e.IsShowField;
            model.IfRequired=e.IfRequired;
          }
        })
       
    })
    let fieldNameArray1:string[]=[]
    this.fieldConfigList.forEach(function(model,index){
      fieldNameArray1.push(model.FieldName);
     
    });
    let fieldNameArray2:string[]=[];
    this.fieldMsgArray.forEach(e=>{
      fieldNameArray2.push(e.FieldName);
    })
    fieldNameArray1.forEach(e=>{
       if(fieldNameArray2.indexOf(e)===-1){
          let fieldConfig=this.fieldConfigList.find(a=>a.FieldName===e)
          fieldConfig.IfRequired=null;
       }
      }
    )}
   }
  });

 }
 getApproverList(strApproverList:any){
  if(strApproverList){
  var approverItcodeList:string="";
  let approverList=JSON.parse(strApproverList);
  approverList.forEach(item=>{
    approverItcodeList += item.ITCode+",";
  });
  if(approverItcodeList.length>0){
     approverItcodeList=approverItcodeList.substring(0,approverItcodeList.length-1);
  }
  return approverItcodeList;
 }
}
//   getPerson(){
//   let user = JSON.parse(localStorage.getItem("UserInfo"));
//   if (user) {//获取登录人头像信息
//     this.userInfo["userID"] = user["ITCode"];
//     this.userInfo["userEN"] = user["ITCode"].toLocaleLowerCase();
//     this.userInfo["userCN"] = user["UserName"];
//   }
//  }
  getUrlParm(){
    this.ID = this.routerInfo.snapshot.queryParams['id'];
  }
  
  save(){
    this.isSubmit=true;
    if(this.contractRuleConfigForm.BaseRole.RoleName===undefined||this.contractRuleConfigForm.BaseRole.RoleName===""){
      this.windowService.alert({message:"规则名称不能为空",type:'warn'});
      return;
    }
    if(this.contractRuleConfigForm.YWFWDMList===undefined||this.contractRuleConfigForm.YWFWDMList.length===0){
      this.windowService.alert({message:"事业部编码不能为空",type:'warn'});
      return;
    }
    if(this.contractRuleConfigForm.CompanyCodeList===undefined||this.contractRuleConfigForm.CompanyCodeList.length===0){
      this.windowService.alert({message:"我方法人体不能为空",type:'warn'});
      return;
    }
    let arraryApprover:ApproverStr[]=[];
    let wfConfigInfoListNew:WFConfigInfo[]=[];
    // this.wfConfigInfoList.forEach(element => {
    //   if(element.ApproverShow!==undefined&&element.ApproverShow.length>0){
    //     let approver:ApproverStr=new ApproverStr();
    //     approver.ApprovalName=element.NodeName;
    //     approver.ApproverITCodes=element.ApproverShow===undefined?"":element.ApproverShow;
    //     arraryApprover.push(approver);
    //   }else{
    //     let wfConfigInfo:WFConfigInfo=new WFConfigInfo();
    //     wfConfigInfo.NodeID=element.NodeID;
    //     wfConfigInfo.NodeName=element.NodeName;
    //     wfConfigInfo.NodeAttribute=element.NodeAttribute;
    //     wfConfigInfo.Sort=element.Sort;
    //     wfConfigInfo.RuleExpressionJSON=element.RuleExpressionJSON;
    //     wfConfigInfo.IfRequired=element.IfRequired;
    //     wfConfigInfo.IsOpened=element.IsOpened;
    //     wfConfigInfo.ApproverList="[]";
    //     wfConfigInfoListNew.push(wfConfigInfo);
    //   }
    // });


   
    let fieldMsgNew:FieldMsgInfo[]=[];
    this.fieldConfigList.forEach(r=>{
      if(r.IsShowField){
        fieldMsgNew.push(r);
      }
    })
    let i:number=0;
    fieldMsgNew.forEach(element=>{
      if(element.IfRequired===undefined){
       this.windowService.alert({message:element.FieldShowName+"未选择是否必选!",type:"warn"});
        i++;
      }
    });
    if(i>0){
      return;
    }

    //查询审批人信息
    let approverOut:ApproverOut=new ApproverOut();
    approverOut.ApprovalArray=arraryApprover;
    // this.contractRuleConfigServices.getApproverInfo(approverOut).subscribe(data=>{
      //  if(data.Result){
        // console.log(data.Data);
        // let res=JSON.parse(data.Data);
        // let approverIn=res.ApprovalArrayOut.forEach(element => {
        //   console.log(element);
        //   this.wfConfigInfoList.forEach(model => {
        //     if(element.ApprovalName===model.NodeName){
        //       let wfConfigInfoIn:WFConfigInfo=new WFConfigInfo();
        //       wfConfigInfoIn.NodeID=model.NodeID;
        //       wfConfigInfoIn.NodeName=model.NodeName;
        //       wfConfigInfoIn.IfRequired=model.IfRequired;
        //       wfConfigInfoIn.IsOpened=model.IsOpened;
        //       wfConfigInfoIn.RuleExpressionJSON=model.RuleExpressionJSON;
        //       wfConfigInfoIn.Sort=model.Sort;
        //       wfConfigInfoIn.NodeAttribute=model.NodeAttribute;
        //       wfConfigInfoIn.ApproverList=JSON.stringify(element.ListApprover)
        //       wfConfigInfoListNew.push(wfConfigInfoIn);
        //     }
        //   });
        // });
      
        
        if(fieldMsgNew){
       
          let sc_data:SC_FieldDataInput=new SC_FieldDataInput();
          sc_data.RoleID=this.ID;
          sc_data.BusinessID="";
          sc_data.BusinessType="SalesContract";
          sc_data.FieldMsg=fieldMsgNew;
          this.contractRuleConfigForm.SC_FieldData.FieldMsg=JSON.stringify(sc_data);
        }
          
        console.log(this.contractRuleConfigForm);
        if(!this.IsEdit){
          
          let user = JSON.parse(localStorage.getItem("UserInfo"));
          if (user) {
            this.contractRuleConfigForm.BaseRole.Creater=user["UserName"];
            this.contractRuleConfigForm.BaseRole.CreaterItcode=user["ITCode"];
          }
         this.contractRuleConfigForm.SC_FieldData.RoleID=this.ID;
        }
        
        //保存审批人信息
        this.writeApprovalPerson();

         //验证审批人列表是否填写
         if(this.isWriteApprovalList(this.wfConfigInfoList)) return;


        this.contractRuleConfigServices.saveContractRuleConfig(this.contractRuleConfigForm).subscribe(data=>{
        if(data.Result){
         
          this.windowService.alert({ message: "保存成功", type: "success" }).subscribe(()=>{
            localStorage.setItem("contractRuleConfig", "save"); //写入localstorage，用来确认是否触发列表的刷新    
            window.close();
          });
          
        }else{
          this.windowService.alert({message:data.Message,type:"fail"});
          return;
        }
        });
      // }else{
      //   this.windowService.alert({message:data.Message,type:"fail"});
      //   return;
      // }
    // });
  
  
  }
  // getApproverArray(approverList:any):ApproverInfo[]{
  //     if(!approverList)
  //      return;
  //     let approverArray:ApproverInfo[]=[];
      // let strApproverArray:string[]=approverList.split(',');
      // strApproverArray.forEach((element,index) => {

      // this.purchaseApplicationService.testItcodeIsRight(element).then(data=>{
      //     if(data.success){
      //       let personData=data.data;
      //       let approvalPerson:ApprovalPerson=personData.content[0];
      //       let approver:ApproverInfo=new ApproverInfo();
      //       approver.ITCode=element;
      //       approver.UserName=approvalPerson.name;
      //       approverArray.push(approver);
      //     }
      //   });
      // });

    // return approverArray;
  // }
  changeValue(ifRequired:boolean):number{
    if(ifRequired)
    return 1;
    else
    return 0;
  }
  cancel(){
    this.windowService.confirm({message:"确定取消保存？"}).subscribe({
      next:(v)=>{
        if(v){
          window.close();
        }
      }
    })
    
    
  }
  // searchBU(){
  //   this.modalbu.show();
  //  }
  //  searchCompany(){
  //    this.modalcompany.show();
  //  }
  //  deleteSYB(index:any){
  //    this.selectBuList.splice(index,1);
  //    console.log(this.selectBuList);
  //  }
     //获取业务范围
     getDepartmentList(e){
      this.contractRuleConfigForm.YWFWDMList=JSON.parse(e);
   }

   //获取我方主体
   getCompanyListList(e){

      this.contractRuleConfigForm.CompanyCodeList=JSON.parse(e);
      // console.log(this.companyList,"我方主体");   

    
   }
      //验证Itcode是否正确
  //  checkApproverItCode(approvalList,approvalName){
  //     if(approvalList){
  //          //判断类型，如果为字符串则将其转换为数组，否则返回原数据
  //          if(typeof approvalList==='string') approvalList=approvalList.split(',');
  //          //请求接口验证itcode是否存在
  //          this.testITCode(approvalList,approvalName);
  //         }
  //     }
  //  testITCode(approverList,name){
  //   let errorData:any=[];//保存错误itcode的列表
  //   //遍历审批人列表，验证审批人的itcode
  //   approverList.forEach((element,index) => {

  //     this.purchaseApplicationService.testItcodeIsRight(element).then(data=>{
  //       if(data.success){
  //         let approvalPerson=data.data;
  //         if(approvalPerson.totalElements>1||approvalPerson.content.length===0){
  //           //如果验证不合法，将错误的‘itcode’push进入数组
  //           errorData.every(item=>item!=element) ? errorData.push(element):'';
  //           console.log(errorData);
  //         }
  //         //如果遍历到数组的最后一个，弹出错误提示
  //         (index+1)===approverList.length&&errorData.length>0?this.windowService.alert({message:`${name}：${errorData} 不存在`,type:'fail'}):'';
  //       }
  //     });
  //   });
  //  }
    //设置审批人列表是否勾选
    getChecked(wfConfigInfo:any) {
      if(wfConfigInfo.NodeID===3||wfConfigInfo.NodeID===9){
        wfConfigInfo.IsOpened===1;
      }else {
      if (wfConfigInfo.ApproverShow.length>0) {
        wfConfigInfo.IsOpened = 1;
        
      } else {
        wfConfigInfo.IsOpened = 0;
        wfConfigInfo.IfRequired=-1;
      }
     }
    }
    //当勾选或者不勾选环节审批人时，设置IsOpened的值
  changeIsOpened(wfConfigInfo:WFConfigInfo){
  
    if(wfConfigInfo.IsOpened){//转换IsOpened的值，转换为（true：1，false：0）
      wfConfigInfo.IsOpened=1;
    }else{
      wfConfigInfo.IsOpened=0;
    }
   
 }
  //验证是否填写了审批人
  isWriteApprovalList(wfConfigInfoList):boolean{
    let invalid:boolean=false;//是否不合法
  if(wfConfigInfoList.some(item=>item.IsOpened===1&&(item.IfRequired===-1||item.IfRequired===undefined))){
    this.windowService.alert({message:"配置了审批人，必须选择是否必选",type:'fail'});
    invalid=true;
  }else if(wfConfigInfoList.some(item=>(item.NodeID===3 || item.NodeID === 9) && item.IsOpened===1&&item.IfRequired===1&&(!item.ApproverShow||item.ApproverShow.length===0))){
    this.windowService.alert({message:"一级预审和事业部终审是必审环节必须配置审批人信息",type:'fail'});
    invalid=true;
  }
  return invalid;
 }

 //保存审批人itcode和姓名
 writeApprovalPerson() {

  //遍历流程审批人信息列表
  this.wfConfigInfoList.forEach(element=> {

    let approerListItem= {// 申明一个变量，用来存储审批人列表中的itcode和username
      'ITCode':'',
      'UserName':''
    }

    if(element.ApproverShow.length>0&&element.IsOpened) {
      element.ApproverList=[];//清空流程配置信息中的审批人列表
      element.ApproverShow.forEach(item => {//遍历选择的审批人列表

        approerListItem.ITCode=item.ITCode;// 保存ITCode
        approerListItem.UserName=item.UserName;// 保存userName
        element.ApproverList.push(JSON.parse(JSON.stringify(approerListItem)));//将审批人push进入审批人流程配置信息
      });
    }else if(element.ApproverShow.length===0&&element.ApproverList.length>0) {// 之前选过审批人，后来又清空的情况，将之前保存的审批人清空
      element.ApproverList=[];//清空流程配置信息中的审批人列表
    }
  });

  //格式化审批人序列为字符串
  this.formaApprovalListToString();
  
  //保存审批人列表到请求字段
  this.contractRuleConfigForm.WFConfigList=this.wfConfigInfoList;


}

//格式化审批人序列为字符串
formaApprovalListToString(){
  this.wfConfigInfoList.forEach(element => {
    element.ApproverList=JSON.stringify(element.ApproverList);
  });
}

}
