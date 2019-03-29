import { Component, OnInit } from '@angular/core';
import {Pager,XcModalService,XcBaseModal,XcModalRef} from "app/shared/index";

import { GetApproverQueryData, RuleConfigurationSelectPopModelService, ShowModelData } from "../../../services/rule-configuration-select-pop-model.service";

@Component({
  selector: 'rule-configuration-select-person-pop-model',
  templateUrl: 'rule-configuration-select-person-pop-model.component.html',
  styleUrls: ['rule-configuration-select-person-pop-model.component.scss']
})

export class RuleConfigurationSelectPersonPopModelComponent implements OnInit {
  
  public modal: XcModalRef;//声明弹窗
  public pagerData = new Pager(); //分页对象
  public approverQueryData:GetApproverQueryData=new GetApproverQueryData();//实例化获取审批人请求参数
  
  public showModelData: ShowModelData = new ShowModelData();// 保存传递到模态窗的数据
  public approverList: any=[];// 保存审批人列表
  public selectPersonList:any = [];// 已选择的审批人列表

  public fullChecked = false; //全选状态
  public fullCheckedIndeterminate = false; //半选状态
  public checkedNum = 0; //已选项数

  constructor(
    private xcModalService:XcModalService,
    private ruleConfigurationSelectPopModelService:RuleConfigurationSelectPopModelService
  ) { }

  ngOnInit() {

    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.showModal();//显示弹出窗

   }

   //在显示选人弹窗时，获取组件传来的参数
  showModal() {
    this.modal.onShow().subscribe(data => {//显示弹窗
      if(data) {
        console.log(data);
        this.showModelData=data;// 保存传递来的数据
        this.selectPersonList=typeof(this.showModelData.valueList)==='string'?[]:this.showModelData.valueList;// 保存已选审批人列表

        this.selectPersonList.forEach(element => {
          element['checked']=true;// 将传递到弹窗的已选审批人列表的checked字段值设置为true
        });
        if(this.showModelData.APIAddress) this.initData();// 请求接口获取审批人列表
      }
    });
  }
 
  //请求接口，获取审批人列表
  initData() {
    if(this.showModelData.APIAddress) {
      this.ruleConfigurationSelectPopModelService.getApproverList(this.showModelData.APIAddress,this.approverQueryData).then(data => {
        // console.log(data);
       
        if(data.Result) {
          this.approverList=data.Data.listUser;// 保存审批人列表
          this.approverList.forEach(element => {// 将ITCode转换为小写
            element.ITCode = element.ITCode.toLowerCase();
          });
          // console.log(this.approverList);
          //设置分页
          this.pagerData.set({'pageNo':data.Data.CurrentPage,'totalPages':data.Data.PageCount,'total':data.Data.TotalCount});
        }

        this.fullChecked=false;// 重置全选状态
        this.fullCheckedIndeterminate=false;// 重置半选选按钮状态

        if(this.approverList.length>0&&this.selectPersonList.length>0) {// 遍历审批人列表和已选择的列表
          this.approverList.forEach(approverListItem => {
            this.selectPersonList.forEach(selectPersonListItem => {
              //当已选列表中存在于审批人列表相同的审批人，则将审批人列表对应的审批人设置为勾选转态
              if(approverListItem.ITCode.toLowerCase()===selectPersonListItem.ITCode.toLowerCase()) approverListItem.checked=true;
            });
          });
        }
        
      });
    }
   }

  //搜索审批人
  search() {
     this.approverQueryData.pageNo=1;
     this.initData();
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  //切换分页
  onChangePager(e: any) {
    this.approverQueryData.pageNo = e.pageNo;
    this.approverQueryData.pageSize = e.pageSize;
    if(this.showModelData.APIAddress) this.initData();
  }


  //取消，关闭窗口
  cancle() {

    if(this.selectPersonList.length === 0) {
      this.modal.hide(this.selectPersonList);
    }else {
      this.modal.hide();
    }
    
    // this.selectPersonList=[];// 清空已选择的列表
    this.approverQueryData.queryStr='';// 重置搜索项
    this.pagerData=new Pager();
    this.fullChecked=false;// 重置全选状态
    this.fullCheckedIndeterminate=false;// 重置半选选按钮状态
  }

  //获取选择的审批人列表
  getSelectPerson(I) {

    if(this.approverList[I].checked && this.selectPersonList.every(item=>item.ITCode !== this.approverList[I].ITCode)) {
      this.selectPersonList.push(this.approverList[I]);// 将checked状态为true，并且在已选列表中不存在的审批人push进入已选列表
    }else if(!this.approverList[I].checked && this.selectPersonList.some(item=>item.ITCode === this.approverList[I].ITCode)) {
      this.selectPersonList.forEach(element => {// 将checked状态为false，并且在已选列表中存在的审批人列表的checked状态设置为false
        if(element.ITCode === this.approverList[I].ITCode) {
          element.checked = false;
        }
      });

      //过滤出checked为true的已选审批人列表，将其重新保存
      this.selectPersonList=this.selectPersonList.filter(item=> item.checked);

      //判断是否全选
      if(this.approverList.every(item=>item.checked)) this.fullChecked=true;
   
    }
  }

  //删除已选择的审批人
  removeRerson(I) {
    this.approverList.forEach(element => {// 遍历审批人列表，找到删除的审批人，将其checked置为false
      if(element.ITCode.toLowerCase()===this.selectPersonList[I].ITCode.toLowerCase()){
        element.checked=false;
      }
    });
    this.selectPersonList.splice(I,1);
  }

  // 确定
  confirm() {
    if(this.selectPersonList.length === 0) return;
    this.modal.hide(JSON.parse(JSON.stringify(this.selectPersonList)));// 关闭窗口发送数据 
    this.approverQueryData.queryStr='';// 重置搜索项
    this.pagerData=new Pager();// 重置分页
    this.fullChecked=false;// 重置全选状态
    this.fullCheckedIndeterminate=false;// 重置半选选按钮状态
  }


}