import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { Http } from "@angular/http";
import { environment } from "../../../../../environments/environment";

import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { RuleApproverListSelectUserComponent } from "./rule-approverList-selectUsr/rule-approverList-selectUser.component";
import { Person } from '../../../services/person.service';

@Component({
  selector: 'rule-approverList',
  templateUrl: 'rule-approverList.component.html',
  styleUrls:['rule-approverList.component.scss']
})

export class RuleApproverListComponent implements OnInit {

  @Input() public isSelect:boolean=false;//是否允许选择审批人，用来区分是编辑页面还是查看页面
  @Input() public detailData:any;//表单实体
  @Input() public contractPrintApproverData:any;//用印审批人
  @Input() public StandardRevolveDays:any;//在备货采购申请是需要获取标准周转天数
  @Input() public set promiseData(data){
    if(data){
      this.structureApproverList(data);//构建用于显示的审批人列表
    }
  };//保存获取审批人的请求参数
  @Input() public errorMessage:string;//保存错误信息
  @Output() public promiseDataChange=new EventEmitter();//用于双向绑定数据

  modal: XcModalRef;//声明弹出模块

  AmountMoney:any;//保存未税金额
  CompanyCode:any;//保存公司代码
  IsHaveContractInfo:any;//保存是否合同用印
  Is2ERP:any;//保存是否写入ERP
  RevolveDays:any;//实际周转天数

  approverData:any;//保存流程审批序列

  constructor(
    private http:Http,
    private xcModalService: XcModalService,
  ) { }

  ngOnInit() { 

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(RuleApproverListSelectUserComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
        if (data) {
          console.log('窗口关闭时回传的数据',data.selectApprovalList);
          //保存选择审批人列表
          this.getApprover(data.selectApprovalList,data.index)
          //this.approverData[data.index]['selectApprover']=data.selectApprovalList;
          //console.log(this.approverData);
        }
    })

  }

  //将获取审批人字符串解析，重构用于显示
  structureApproverList(data){
    this.approverData=data;
    console.log('详情传入的审批人列表',this.approverData);
    this.approverData.forEach((element,index) => {
      
      element['approverListData']=JSON.parse(element.ApproverList);//保存审批人列表
      
      if(this.contractPrintApproverData&&element.NodeID===18){//如果存在用印审批人，则将用印审批人存入字段，用于显示
        element['approverListData']=JSON.parse(this.contractPrintApproverData);
        element.UserSettings=element.ApproverList=this.contractPrintApproverData;//将保存的用印审批人存储进UserSettings字段
      }
      element['selectApprover']?element['selectApprover']:element['selectApprover']='';//定义保存选择的itcode字段
      
      element.approverListData.forEach(item => {//遍历审批人列表，存入用于显示的审批人的数据
        item['userID']=item['userEN']=item.ITCode;item['userCN']=item.UserName;
      });

      

      //如果存在验证字符串，则进行解析验证
      if(element.RuleExpressionJSON){
        this.testRuleExpression(element.RuleExpressionJSON,element.NodeID,index)
      }

    });

  }

  //如果存在验证字符串则进行解析验证，判断是否显示该环节审批人
  testRuleExpression(RuleExpressionJSON,NodeID,I){
    let testString=RuleExpressionJSON.substring(RuleExpressionJSON.indexOf("'")+1,RuleExpressionJSON.indexOf(",")-1);
    let valueState:boolean;//用来保存字符串的验证状态
        
        this.AmountMoney=this.detailData.excludetaxmoney;//保存未税金额
        this.CompanyCode=this.detailData.companycode;//保存公司代码
        this.IsHaveContractInfo=this.detailData.IsHaveContractInfo;//保存是否需要合同用印
        this.Is2ERP=this.detailData.istoerp;//保存是否写入ERP
        this.RevolveDays=this.detailData.RevolveDays;//保存标注周转天数
        //替换字符串，用来验证表达式
        // [RevolveDays]>[StandardRevolveDays]
        valueState=eval(testString.replace(/\[CompanyCode\]/g,`"${this.CompanyCode}"`).replace(/\[Is2ERP\]/g,`${this.Is2ERP}`).replace(/\[AmountMoney\]/g,`${this.AmountMoney}`).replace(/\[IsHaveContractInfo\]/g,`${this.IsHaveContractInfo}`).replace(/\[RevolveDays\]/g,`${this.RevolveDays}`).replace(/\[StandardRevolveDays\]/g,`${this.StandardRevolveDays}`));

        this.approverData[I].IsOpened=valueState?1:0;//表达式结果为true。则显示对应环节审批人

       console.log("我是表单实体",this.detailData);
  }


  //获取审批人
  getApprover(selectApprover,I){
    console.log(selectApprover);
    // this.approverListData[I].approverList.forEach(element=>{
    //   this.approverListData[I].UserSettings=element.ITCode===itcode?JSON.stringify([{'ITCode':itcode,'UserName':element.UserName}]):'';
    // });
    this.approverData[I].selectApprover=selectApprover;//保存选择的审批人
    this.approverData[I].UserSettings=JSON.stringify(selectApprover);
    this.detailData.WFApproveUserJSON=JSON.stringify(this.approverData);
  }

  //当使用ngValue绑定对象时，如果数据时从服务器端获取，有可能出现对象值相同但标识不同，因此会导致无法显示绑定的数据，使用angular select上的此方法，可以避免此情况
  compareFn(c1,c2):boolean{
    return c1 && c2 ? c1.ITCode === c2.ITCode : c1 === c2;
  }

  //删除选择的审批人
  deleteApprover(selectApprover,I,selectApproverIndex){
    //删除指定的审批人
    this.approverData[I].selectApprover.splice(selectApproverIndex,1);
    this.getApprover(selectApprover,I);//写入变化的审批人

  }

  //删除非必审环节
  deleteApprovalList(I){
    this.approverData[I]['isDelete']=true;//标识此可选审批环节已删除
    setTimeout(()=>{//采用定时器来配合删除动画
      this.approverData[I].IsOpened=0;//不显示此环节
      this.approverData[I].selectApprover=this.approverData[I].UserSettings="";//清空选择的审批人
      this.detailData.WFApproveUserJSON=JSON.stringify(this.approverData);//保存进入实体字段
    },400);
    

  }

  //弹出审批人列表
  getApprovalUser(I){
    if(this.approverData[I].selectApprover){//如果存在已选择的审批人
      this.approverData[I].approverListData.forEach(element => {//弹出审批人列表前，先清空选择项
        element.checked=false;
      });

      this.approverData[I].selectApprover.forEach(element => {//遍历已选择审批人列表
        
        this.approverData[I].approverListData.forEach(item => {//遍历审批人列表
          if(element.ITCode===item.ITCode){//找到相同的itcode，如果为已选择，则将审批人列表里的
            item['checked']=true;
          }
        });

      });
    }
    this.modal.show({'popApprovalList':this.approverData[I].approverListData,'index':I});
  }

}