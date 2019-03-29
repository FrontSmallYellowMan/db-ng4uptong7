import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';

import { ERPOrderChangeApiServices,ERPOrderChangeApprover } from "../../../services/erporderchange-api.services";
import { PrepareApplyCommunicateService } from "../../../services/communicate.service";
import { ErporderchangePopStorageRCWAppprovers } from "../../erporderchange-new/erporderchange-pop-storageRCWAppprovers/erporderchange-pop-storageRCWAppprovers.component";
import { Person } from '../../../../../shared';

declare var window,localStorage;

@Component({
  selector: 'erporderchange-approver',
  templateUrl: 'erporderchange-approver.component.html',
  styleUrls:['erporderchange-approver.component.scss','../../../scss/erp-order-change.scss']
})

export class ERPorderchangeApproverComponent implements OnInit {

  @Input() public formDetail:any;//表单实体
  @Output() public formDetailChange=new EventEmitter();//表单实体的双向绑定
  @Input() public aproverList:any;//审批人列表
  // @Input() public approverValid:any;//审批人是否通过验证
  @Output() public approverValid=new EventEmitter();//审批人是否通过验证

  public storageRCWApproversModal:XcModalRef;//弹出层，库房冲红审批人
  public approvalDataConfigure:any;//保存审批人配置信息
  public erpOrderChangeApprover:ERPOrderChangeApprover=new ERPOrderChangeApprover();//实例化获取审批人配置信息的请求参数
  public storageRCWPersonList:any;//保存库房冲红审批人
  public purchaserList:any;//保存采购员审批人
  
  constructor(
    private erporderChangeApiServices:ERPOrderChangeApiServices,
    private prepareApplyCommunicateService:PrepareApplyCommunicateService,
    private xcModalService:XcModalService
  ) { }

  ngOnInit() {
    
    this.storageRCWApproversModal=this.xcModalService.createModal(ErporderchangePopStorageRCWAppprovers); 
    
    //模型关闭的时候
    this.storageRCWApproversModal.onHide().subscribe((data?: any) => {
      if (data) {
        this.getSelectApprover(data);//获取选择的库房冲红审批人
      }
  });

    setTimeout(()=>{
      if(this.formDetail.WFApproveUserJSON){//如果详情中存在审批人列表则解析详情中的审批人列表
        this.getDetailApproverList();//获取详情中的审批人列表
      }else{//否则重新获取审批人列表
        this.getApprover();//获取审批人配置
      }

    },2000);

    
    //当涉及审批环节变换的参数变化时，重新验证审批字符串
    this.getApprovalState();

   }

   //获取涉及审批换件变化的参数（1、用以判断是否显示或隐藏审批人环节，2、判断是否从详情中获取审批人参数）
   getApprovalState(){
     this.prepareApplyCommunicateService.erporderChangeGetState().subscribe(v=>{
       if(v==='onChange'&&this.approvalDataConfigure){
         this.approvalDataConfigure.forEach((element,index)=>{
           if(element.RuleExpressionJSON){
            this.testRuleExpressionJSON(element.RuleExpressionJSON,index);//验证审批字符串
           }        
         });

         this.testApproverValid();//验证审批人
       }
     })
   }

   //解析从详情中获取的审批人
   getDetailApproverList(){
    console.log('从详情中的审批人',JSON.parse(this.formDetail.WFApproveUserJSON));
    this.setupApproverList(JSON.parse(this.formDetail.WFApproveUserJSON));
    this.testApproverValid();//验证审批人
   }

  //获得流程审批人
  getApprover(){
    let User = JSON.parse(localStorage.getItem("UserInfo"));
    if(User){
      this.erpOrderChangeApprover.BizScopeCode=User.YWFWDM;//保存申请人所属业务范围代码
      this.erporderChangeApiServices.getFlowConfigInfo(this.erpOrderChangeApprover).then(data=>{
        if(data.Result){
           //保存配置审批人信息
           this.setupApproverList(data.Data);
           this.testApproverValid();//验证审批人     
        }
      });
    }
  }

  //保存配置审批人信息
  setupApproverList(data){
    this.approvalDataConfigure=data;//保存审批人配置信息
    console.log(this.approvalDataConfigure);
    
    this.approvalDataConfigure.forEach((element,index) => {
     typeof element.ApproverList==='string'?element.ApproverList=JSON.parse(element.ApproverList):'';//将审批人配置信息中的审批人信息转换为对象
      element.selectApprover?'':element['selectApprover']=[];//添加已选审批人列表
      if(element.RuleExpressionJSON){//如果存在验证字符串
         this.testRuleExpressionJSON(element.RuleExpressionJSON,index);//解析字符串
      }
      if(element.NodeName==='采购经理审批'){
        // element.selectApprover=JSON.parse(JSON.stringify(element.ApproverList));//将审批环节“采购经理审批”的数据存入对应字段
        // console.log('采购经理审批人',element.selectApprover);
        element.ApproverList.forEach(item => {
          item['userEN']=item['userID']=item.ITCode.toLowerCase();//存入userEN，userEN，userCN三个字段，用来显示审批人
          item['userCN']=item.UserName;
        });
        element.UserSettings=JSON.stringify(element.ApproverList);
      }
    });

    this.erporderChangeApiServices.getStorageRCW().then(data=>{//获取库房冲红审批人
      if(data.Result) this.storageRCWPersonList=data.Data;
      this.resetApproverList();//将获取到的审批人保存进审批人配置信息
    });

    this.erporderChangeApiServices.getPurchaser().then(data=>{//获取采购员审批人
      if(data.Result) this.purchaserList=data.Data;
      this.resetApproverList();//将获取到的审批人保存进审批人配置信息            
    });

    
  }

  //将获取到的库房冲红审批人和采购员存入审批人配置信息
  resetApproverList(){
    this.approvalDataConfigure.forEach(element => {
      if(element.NodeName.indexOf('采购员')!==-1){
        element.ApproverList=this.purchaserList;//保存采购员
      }
      if(element.NodeName.indexOf('库房冲红')!==-1){
        element.ApproverList=this.storageRCWPersonList;//保存库房冲红审批人
      }
      
    });
  }

  //验证审批人配置信息中的验证字符串，用以确定是否需要显示和审批此环节
  testRuleExpressionJSON(RuleExpressionJSON,I){
    let testString=RuleExpressionJSON.substring(RuleExpressionJSON.indexOf("'")+1,RuleExpressionJSON.indexOf(",")-1);
    let valueState:boolean;//用来保存字符串的验证状态

        //替换字符串，用来验证表达式
        // [RevolveDays]>[StandardRevolveDays]
        valueState=eval(testString.replace(/\[IsRedInvoice\]/g,`"${this.formDetail.IsRedInvoice}"`).replace(/\[OriginalCurrencyCode\]/g,`"${this.formDetail.OriginalCurrencyCode}"`).replace(/\[CurrencyCode\]/g,`"${this.formDetail.CurrencyCode}"`).replace(/\[OriginalTaxFileNumber\]/g,`"${this.formDetail.OriginalTaxFileNumber}"`).replace(/\[TaxFileNumber\]/g,`"${this.formDetail.TaxFileNumber}"`).replace(/\[OriginalVendorNo\]/g,`"${this.formDetail.OriginalVendorNo}"`).replace(/\[VendorNo\]/g,`"${this.formDetail.VendorNo}"`).replace(/\[OriginalOrderAmount\]/g,`"${this.formDetail.OriginalOrderAmount}"`).replace(/\[OrderAmount\]/g,`"${this.formDetail.OrderAmount}"`).replace(/\[OriginalFactoryCode\]/g,`"${this.formDetail.OriginalFactoryCode}"`).replace(/\[FactoryCode\]/g,`"${this.formDetail.FactoryCode}"`).replace(/\[OriginalSumNo\]/g,`"${this.formDetail.OriginalSumNo}"`).replace(/\[SumNo\]/g,`"${this.formDetail.SumNo}"`).replace(/\[IsChangeMaterial\]/g,`"${this.formDetail.IsChangeMaterial}"`).replace(/\[Is2ERP\]/g,`"${this.formDetail.Is2ERP}"`).replace(1,'1').replace(0,'0'));
        let valueStateData=testString.replace(/\[IsRedInvoice\]/g,`"${this.formDetail.IsRedInvoice}"`).replace(/\[OriginalCurrencyCode\]/g,`"${this.formDetail.OriginalCurrencyCode}"`).replace(/\[CurrencyCode\]/g,`"${this.formDetail.CurrencyCode}"`).replace(/\[OriginalTaxFileNumber\]/g,`"${this.formDetail.OriginalTaxFileNumber}"`).replace(/\[TaxFileNumber\]/g,`"${this.formDetail.TaxFileNumber}"`).replace(/\[OriginalVendorNo\]/g,`"${this.formDetail.OriginalVendorNo}"`).replace(/\[VendorNo\]/g,`"${this.formDetail.VendorNo}"`).replace(/\[OriginalOrderAmount\]/g,`"${this.formDetail.OriginalOrderAmount}"`).replace(/\[OrderAmount\]/g,`"${this.formDetail.OrderAmount}"`).replace(/\[OriginalFactoryCode\]/g,`"${this.formDetail.OriginalFactoryCode}"`).replace(/\[FactoryCode\]/g,`"${this.formDetail.FactoryCode}"`).replace(/\[OriginalSumNo\]/g,`"${this.formDetail.OriginalSumNo}"`).replace(/\[SumNo\]/g,`"${this.formDetail.SumNo}"`).replace(/\[IsChangeMaterial\]/g,`"${this.formDetail.IsChangeMaterial}"`).replace(/\[Is2ERP\]/g,`"${this.formDetail.Is2ERP}"`).replace(1,'1').replace(0,'0');

        /**
         * 在验证采购经理审批环节的字符串式，存在一个字符串数字比较的问题，所以需要在单独验证一下
         */
        if(this.approvalDataConfigure[I].NodeName==="采购经理审批"){
          valueState=this.testPurchasingManagerApprover();
        }
        
        this.approvalDataConfigure[I].IsOpened=this.approvalDataConfigure[I].IfRequired=valueState?1:0;//表达式结果为true。则显示对应环节审批人
        if(valueState){//如果验证结果为真，则显示对应环节
          this.approvalDataConfigure[I].IsOpened=this.approvalDataConfigure[I].IfRequired=1;
        }else{
          this.approvalDataConfigure[I].IsOpened=this.approvalDataConfigure[I].IfRequired=0;          
          //否则，清空对应环节的审批人列表
          this.approvalDataConfigure[I].selectApprover=[]
          this.approvalDataConfigure[I].UserSettings='[]';
        }
  }

  //获取事业部审批人
  getApprovalPerson(e,I){
    if(e.length===0){//如果没有选择审批人
      this.approvalDataConfigure[I].selectApprover=[];
      this.approvalDataConfigure[I].UserSettings='[]';
      this.testApproverValid();//验证审批人 
    }else{//将选择的审批人保存进入审批人配置信息
      this.approvalDataConfigure[I].selectApprover=[{'ITCode':e[0].itcode,'UserName':e[0].userCN,'userCN':e[0].userCN,'userEN':e[0].itcode,'userID':e[0].itcode}];
      this.approvalDataConfigure[I].UserSettings=JSON.stringify(this.approvalDataConfigure[I].selectApprover);
      this.testApproverValid();//验证审批人 
    } 

  }

  //显示库房冲红审批人
  showStorangeRCWApproverList(){
    //弹出冲红审批人列表
    this.storageRCWApproversModal.show(this.storageRCWPersonList);   
  }

  //获得选择的库存冲红审批人
  getSelectApprover(flatName){
   
    let selectApprover=[];//新建一个数组，用来存储每次选择的冲红审批人

    this.storageRCWPersonList.forEach((element,index)=>{//遍历冲红审批人列表
      if(element.FlatName===flatName){//如果平台名称相同，将对应的审批人push进数组
        selectApprover.push({ userID: element.ITCode,ITCode: element.ITCode, userEN: element.ITCode, userCN: element.UserName,UserName: element.UserName});
      }
    });

    this.approvalDataConfigure.forEach(element => {//遍历审批人配置信息，将选择的冲红审批人存入对应字段
       if(element.NodeName==='库房冲红') {
          element.selectApprover=selectApprover;
          element.UserSettings=JSON.stringify(selectApprover);//保存UserSettings字段
          this.testApproverValid();//验证审批人 
       }
    });
    
  }

  //获得选择的审批人列表
  getApprovalPersonSelect(selectApprover,I){
     this.approvalDataConfigure[I].UserSettings=JSON.stringify([selectApprover]); 
     console.log(selectApprover);
     this.testApproverValid();//验证审批人 
  }

  //验证审批人是否合法，以及保存审批人配置信息到表单实体参数
  testApproverValid(){
    let approvalDataConfigureObject=JSON.parse(JSON.stringify(this.approvalDataConfigure));
    approvalDataConfigureObject.forEach(element=>element.ApproverList=JSON.stringify(element.ApproverList));//将审批人列表转为字符串
    this.formDetail.WFApproveUserJSON=JSON.stringify(approvalDataConfigureObject);//将审批人转换为字符串存入表单实体参数    

    let testApproverList=this.approvalDataConfigure.filter(item=>item.IfRequired===1&&item.NodeName!=='采购经理审批');//过滤出必审的审批环节

    if(testApproverList.every(item=>item.selectApprover.length>0||item.selectApprover.ITCode)) {//如果所有必审环节都存在审批人，表示通过验证
      this.approverValid.emit({valid:true,errApprover:''});//保存验证信息
    }else{//否则遍历列表，返回错误信息

    testApproverList.forEach(element => {
        if(element.selectApprover.length===0){
          this.approverValid.emit({valid:false,errApprover:'请选择'+`“${element.NodeName}”`+'环节审批人'});
          return;
        }
      });
    }
    
  }

  
//当使用ngValue绑定对象时，如果数据时从服务器端获取，有可能出现对象值相同但标识不同，因此会导致无法显示绑定的数据，使用angular select上的此方法，可以避免此情况
compareFn(c1,c2):boolean{
  return c1 && c2 ? c1.ITCode === c2.ITCode : c1 === c2;
}

  //验证采购经理审批环节
  testPurchasingManagerApprover(){
    return this.formDetail.OriginalCurrencyCode != this.formDetail.CurrencyCode || this.formDetail.OriginalTaxFileNumber != this.formDetail.TaxFileNumber || this.formDetail.OriginalVendorNo != this.formDetail.VendorNo || this.formDetail.OriginalOrderAmount < this.formDetail.OrderAmount || (this.formDetail.OriginalCurrencyCode == this.formDetail.CurrencyCode && this.formDetail.OriginalTaxFileNumber == this.formDetail.TaxFileNumber && this.formDetail.OriginalVendorNo == this.formDetail.VendorNo && this.formDetail.OriginalOrderAmount >= this.formDetail.OrderAmount && this.formDetail.IsRedInvoice == 1 && (this.formDetail.OriginalFactoryCode != this.formDetail.FactoryCode || this.formDetail.OriginalSumNo != this.formDetail.SumNo || this.formDetail.IsChangeMaterial == 1))     
  }

  

}