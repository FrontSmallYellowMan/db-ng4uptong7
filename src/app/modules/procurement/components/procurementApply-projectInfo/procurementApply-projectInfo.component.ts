import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';

import { PurchaseProjectInfoContent,PrepareApply } from "../../services/prepareApply-submit.service";
import { ShareDataService,GetRoleFieldConfigQueryData } from "../../services/share-data.service";
import { CustomInforModalComponent } from "./customInforModal/customInforModal.component";

@Component({
  selector: 'procurementApply-projectInfo',
  templateUrl: 'procurementApply-projectInfo.component.html',
  styleUrls:['procurementApply-projectInfo.component.scss','../../scss/procurement.scss']
})

export class ProcurementApplyProjectInfoComponent implements OnInit {

  public queryRuleData:GetRoleFieldConfigQueryData=new GetRoleFieldConfigQueryData();//实例化查询自定义表单项的查询条件

  public prepareApply:PrepareApply=new PrepareApply();//实例化整体参数
  public ERPNumberAndCustomName:string;//erp号和客户名称
  public ERPNumberAndCustomName_old:string;//erp号和客户名称在获取详情时保存，用以区分两次的输入是否相同
  public currencyList:any=[];
  public purchaseProjectInfoCustomNameModal: XcModalRef;//模态窗
  public customFormData:any;//保存自定义表单
  //public purchaseProjectInfoContent:PurchaseProjectInfoContent=new PurchaseProjectInfoContent();//实例化项目信息参数

  //构建产品类型的数据结构
  public productTypeList = [
    {'name':'UC','value':'01','checked':false},
    {'name':'数通','value':'02','checked':false},
    {'name':'安全','value':'03','checked':false},
    {'name':'传输','value':'04','checked':false},
    {'name':'接入','value':'05','checked':false},
    {'name':'存储','value':'06','checked':false},
    {'name':'智真','value':'07','checked':false},
    {'name':'视频监控','value':'08','checked':false},
    {'name':'elte','value':'09','checked':false},
    {'name':'服务器','value':'10','checked':false},
    {'name':'云计算','value':'11','checked':false},
    {'name':'UPS','value':'12','checked':false},
    {'name':'esight','value':'13','checked':false},
    {'name':'其他','value':'14','checked':false},
    {'name':'安天','value':'15','checked':false},
    {'name':'鹏云','value':'16','checked':false}
  ];
        

  @Input() purchaseProjectInfoContent:PurchaseProjectInfoContent=new PurchaseProjectInfoContent();//实例化项目信息参数
  @Output() purchaseProjectInfoContentChange=new EventEmitter();

  @Input() public isEdit:boolean;//是否可编辑
  @Input() public detailData:any;//2018-11-20新增逻辑，需要表单实体数据

  constructor(
    private shareDataService:ShareDataService,
    private xcModalService:XcModalService,
  ) { }

  ngOnInit() { 

    //在初始化的时候 创建模型
    this.purchaseProjectInfoCustomNameModal = this.xcModalService.createModal(CustomInforModalComponent);
    this.purchaseProjectInfoCustomNameModal.onHide().subscribe(data=>{
      if(data){
        //获取客户名称与erp号
        this.getCustomNameAndERPNumber(data);
      }
    });

    //获取币种列表
    // this.getCurrencySelectInfo();

   //获取从详情中获取的客户名称和产品类型，自定义表单项
   setTimeout(()=>{
    this.getDetailERPNumberAndCustomName();//获取从详情中获取的客户名称
    this.getDetailproductType();//从详情中获取产品类型
    //如果详情中不存在自定义表单项，则调用接口获取获取自定义表单
    if(!this.purchaseProjectInfoContent.ProjectInfo){
      this.getCustomForm();//获取自定义表单
    }else if(this.isEdit){
      //从详情中获取自定义表单项
      this.purchaseProjectInfoContent.ProjectInfo=JSON.parse(this.purchaseProjectInfoContent.ProjectInfo);
    }
   },3000);
   


  }

  // ngDoCheck(){//采用ngDocheck监听自定义表单项的变化，将其转化为JSON对象
  //   if(this.purchaseProjectInfoContent&&(typeof this.purchaseProjectInfoContent.ProjectInfo==="string")){
  //     this.purchaseProjectInfoContent.ProjectInfo=JSON.parse(this.purchaseProjectInfoContent.ProjectInfo);
  //   }
  // }


  //获取币种列表
  getCurrencySelectInfo(){

    this.shareDataService.getCurrencySelectInfo().then(data=>{
     this.currencyList=data;
    });
  }

  //显示搜索客户名称弹出窗
  showCustomModal(){
    
    this.purchaseProjectInfoCustomNameModal.show({data:this.ERPNumberAndCustomName,modalTitle:"客户名称"});
  }

  //获取客户名称和erp号
  getCustomNameAndERPNumber(data){
    console.log(data);
    this.purchaseProjectInfoContent.ERPNumber=data.BuyerERPCode;
    this.purchaseProjectInfoContent.CustomName=data.BuyerName;
    this.ERPNumberAndCustomName=this.ERPNumberAndCustomName_old=data.BuyerERPCode+' '+data.BuyerName;

    if(data.BuyerERPCode){
      //获取客户应收款和超期欠款
      this.getCustomAmountAndCustomAmountOver(data.BuyerERPCode);
    }
  }

  //当手动填写客户名称时，直接存入客户名称和ERP编号
  getCustomName(){
    if(this.ERPNumberAndCustomName&&(this.ERPNumberAndCustomName==this.ERPNumberAndCustomName_old)) return;

    let ERPNumberAndCustomNameArrayOld=[];
    // let ERPNumberAndCustomNameArray=[];
    ERPNumberAndCustomNameArrayOld=this.ERPNumberAndCustomName_old?this.ERPNumberAndCustomName_old.split(' '):['',''];

    if((this.purchaseProjectInfoContent.ERPNumber!='A'&&ERPNumberAndCustomNameArrayOld[0].length!=this.purchaseProjectInfoContent.ERPNumber.length)||
    (this.purchaseProjectInfoContent.ERPNumber=='A'&&(this.ERPNumberAndCustomName!=ERPNumberAndCustomNameArrayOld[1]))||
    this.purchaseProjectInfoContent.ERPNumber!='A'&&this.ERPNumberAndCustomName!=this.purchaseProjectInfoContent.CustomName){
      this.purchaseProjectInfoContent.ERPNumber='A';
      this.purchaseProjectInfoContent.CustomName=this.ERPNumberAndCustomName;
      this.ERPNumberAndCustomName_old=this.purchaseProjectInfoContent.ERPNumber+" "+this.purchaseProjectInfoContent.CustomName;
    }
    // if(this.ERPNumberAndCustomName!=this.purchaseProjectInfoContent.CustomName){
    //   this.purchaseProjectInfoContent.ERPNumber="A-";
    //   this.purchaseProjectInfoContent.CustomName=this.ERPNumberAndCustomName;
    // }
  }

  //获取超期欠款和应收账款
  getCustomAmountAndCustomAmountOver(BuyerERPCode){
    this.shareDataService.getCustomAmountAndCustomAmountOver(BuyerERPCode).then(data=>{
       if(data.Result){
          this.purchaseProjectInfoContent.CustomAmount=JSON.parse(data.Data).Receivable;//获得应收账款
          this.purchaseProjectInfoContent.CustomAmountOver=JSON.parse(data.Data).Overdue;//获得客户超期欠款
       }
    })
  }

  //获取选择的产品类型
  getProductType(){
    let selectProductTypeList=[];
    this.productTypeList.filter(item=>item.checked).forEach(element => {
      selectProductTypeList.push(element.value);
    });

    this.purchaseProjectInfoContent.ProductType=JSON.stringify(selectProductTypeList);
  }

  //获取从详情中获取的客户名称
  getDetailERPNumberAndCustomName(){
   if(this.purchaseProjectInfoContent.ERPNumber){
     this.ERPNumberAndCustomName=this.ERPNumberAndCustomName_old=this.purchaseProjectInfoContent.ERPNumber+' '+this.purchaseProjectInfoContent.CustomName;
   }
  }

  //从详情中获取产品类型
  getDetailproductType(){
    if(this.purchaseProjectInfoContent.ProductType){
      let selectProductTypeList=[];
      selectProductTypeList=JSON.parse(this.purchaseProjectInfoContent.ProductType);
      this.productTypeList.forEach(element=>{
        selectProductTypeList.forEach(item=>{
          if(element.value===item){
             element.checked=true;
          }
        })
      });

    }
  }

  //获取销售合同自定表单项
  getCustomForm(){
    this.queryRuleData.BusinessCode=this.detailData.YWFWDM;//保存业务范围代码
    this.shareDataService.getRoleFieldConfig(this.queryRuleData).then(data=>{
      if(data.Result&&data.Data){
         this.purchaseProjectInfoContent.ProjectInfo=JSON.parse(data.Data);
         console.log("自定义表单项",this.purchaseProjectInfoContent.ProjectInfo);
      }
    });
  }


}