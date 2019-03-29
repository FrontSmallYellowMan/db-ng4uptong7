import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm, FormControl, Form } from "@angular/forms";
import { Person } from "../../../../../../app/shared/services/index";
import { WindowService } from "../../../../../../app/core";
import { ActivatedRoute } from "@angular/router";

import {
  PurchaseApplicationService,
  ApprovalPersonList,
  PurchaseApplicationData,
  BaseRole,
  ProductLinesData,
  RuleDetial,
  WorkFlowNodes
} from "../../../services/purchaseApplication.service";

import { IqSelectComponent } from "../../../../../shared/components/widgets/iq-select/iq-select.component";

declare var localStorage, window;

@Component({
  selector: "purchase-application-edit",
  templateUrl: "purchase-application-edit.component.html",
  styleUrls: ["purchase-application-edit.component.scss"]
})
export class PurchaseApplicationEditComponent implements OnInit {
  purchaseApplicationData: PurchaseApplicationData = new PurchaseApplicationData(); //实例化实体参数
  productLinesData: ProductLinesData = new ProductLinesData(); //实例化事业部code实体
  baseRole: BaseRole = this.purchaseApplicationData.baseRole; //实例化规则基本信息实体
  ruleDetial: RuleDetial = this.purchaseApplicationData.ruleDetial; //实例化规则详情实体
  workFlowNodes: any = WorkFlowNodes; //实例化审批人序列

  userInfo = new Person(); // 登录人头像
  applyTime = new Date(); //申请日期

  departmentList: any; //绑定的事业部选择列表
  supplierList:any;//保存绑定的供应商列表
  allSupplierCode: string; //供应商编号和名称
  isEnter: boolean = false; //是否进入页面
  isSubmit: boolean = false; //是否保存
  approvalPersonList = ApprovalPersonList; //实例化审批人列表
  selectApprovalArray: any = {
    ApprovalArray: []
  }; //保存选中的审批人列表

  operationType:string;// 保存操作类型（edit or copy）
  isControlClick:boolean=true;//是否控制弹出组件的点击事件
  BBMC:string='';//临时参数

  @ViewChild("form") public form: NgForm;
  @ViewChild("VendorClass") public VendorClass: FormControl; //设置监听的供应商类型
  @ViewChild("AmountRelate") public AmountRelate:FormControl;//设置监听的授权额度是否有关
  @ViewChild("PurchaseType") public PurchaseType:FormControl;// 设置监听采购申请类型
  @ViewChild('IqSelect') IqSelect:IqSelectComponent;

  constructor(
    private purchaseApplicationService: PurchaseApplicationService,
    private windowService: WindowService,
    private activatedRoute:ActivatedRoute
  ) {}

  ngOnInit() {
    this.baseRole.Createtime = this.applyTime.toDateString(); //转换时间格式为字符串
    //获取登录人信息
    this.getPerson();

    //获得路由参数
    this.getRouterPromise();

    //监听授权额度的变化
    this.watchAmountRelateChange();

    //监听采购申请类型的变化
    this.watchPurchaseTypeChange();
    
  }

  //页面加载视图时，显示动画样式
  ngAfterViewInit() {
    this.isEnter = true;
  }

  //获取人员基本信息
  getPerson() {
    const user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {
      // 获取登录人头像信息
      this.userInfo["userID"] = user["ITCode"];
      this.userInfo["userEN"] = this.baseRole.CreaterItcode = user[
        "ITCode"
      ].toLocaleLowerCase();
      this.userInfo["userCN"] = this.baseRole.Creater = user["UserName"];
    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }
  }

  //获取路由参数
  getRouterPromise(){
  
    this.baseRole.RoleID=eval(this.activatedRoute.snapshot.paramMap.get('id'));//保存主键id
    this.operationType=this.activatedRoute.snapshot.queryParamMap.get('type');// 保存操作类型

    if(this.baseRole.RoleID!==0){
      this.getDetail(this.baseRole.RoleID);
    }
  }

  //获取详情
  getDetail(RoleID){
    this.purchaseApplicationService.getDetail(RoleID).then(resData=>{
      if(resData.Result){
        console.log(JSON.parse(JSON.stringify(resData.Data)));

        this.baseRole=resData.Data.baseRole;//保存基础信息数据
        this.ruleDetial=resData.Data.ruleDetial;//保存实体详情

        if(this.operationType==='copy') this.baseRole.RoleID=0;//如果操作类型时复制，则将主键ID至为0

        //如果存在供应商，则保存绑定值
        this.ruleDetial.VendorCode?this.allSupplierCode=this.ruleDetial.VendorCode+" "+this.ruleDetial.Vendor:'';

        //保存事业部
        this.getDepartmentListFromDetail(resData.Data.productLines);

        //保存审批人序列
        this.getApprovalListFromDetail(resData.Data.workFlowNodes);
      }
    });
  }

  //保存从详情中获取事业部
  getDepartmentListFromDetail(productLines){
    this.departmentList=[];
    productLines.forEach(element => {
      this.departmentList.push(element.BusinessCode);
    });
    this.departmentList=JSON.parse(JSON.stringify(this.departmentList));
  }

  //保存从详情中获取的审批人序列
  getApprovalListFromDetail(detailApprovalList){

    //遍历审批人列表
    this.workFlowNodes.forEach((element,index) => {
      element.RoleID=detailApprovalList[index].RoleID;//保存主键id
      element.ApproverList=JSON.parse(detailApprovalList[index].ApproverList);//保存审批人列表
      element.IfRequired=detailApprovalList[index].IfRequired;//保存此审批环节是否必选
      element.IsOpened=detailApprovalList[index].IsOpened;//保存是否需要显示此审批环节
      
      if(element.ApproverList.length>0&&element.NodeID!==15) {//如果返回的审批人列表存在数据
        element.ApproverList.forEach(item => {//遍历审批人列表，ApproverList,保存进入双向绑定字段valueList
          element.valueList=JSON.parse(JSON.stringify(element.ApproverList));
        });
      }
      // element.valueList=element.valueList.join(",");//将绑定值转换为字符串
    });
  }

  //获取事业部
  getDepartmentList(e) {
    this.departmentList = JSON.parse(e);
    this.getStandardRevolveDays(this.departmentList); // 获取标准周转天数
  }

  //获取供应商列表
  getSupplierList(e){
    console.log('供应商列表',e);
  }

  //获取供应商
  getSupplier(e) {
    this.ruleDetial.Vendor = e[0]; //保存供应商名称
    this.ruleDetial.VendorCode = e[1]; //保存供应商code
    this.allSupplierCode = e[1] + " " + e[0]; //合并为供应商绑定数据
  }

  //监听form表单变化
  watchVendorClassChange() {
    //当时供应商类型发生变化时，根据供应商类型判断哪些申请类型可以选择
    this.VendorClass.valueChanges.subscribe(data => {
      if(data==="非核心"&&this.ruleDetial.PurchaseType!="合同单采购"){
        this.ruleDetial.PurchaseType = ""; //当供应商类型发生变化时，重置选择的采购申请单类型
      }else if(data==="新产品"&&this.ruleDetial.PurchaseType==="备货单采购"){
        this.ruleDetial.PurchaseType = ""; //当供应商类型发生变化时，重置选择的采购申请单类型        
      }
      // if (data) this.ruleDetial.PurchaseType = ""; //当供应商类型发生变化时，重置选择的采购申请单类型
    });
  }

  //监听授权额度是否有关的单选按钮
  watchAmountRelateChange(){
    this.AmountRelate.valueChanges.subscribe((data)=>{
      if(data==0){//如果选择无关
        this.ruleDetial.StartAmount=this.ruleDetial.EndAmount=0;//则将起始额度和结束额度都置为0；
      }
    })
  }

  //监听采购申请类型的变化，用来在选择“备货采购申请”时，显示DCG采购员
  watchPurchaseTypeChange() {
    this.PurchaseType.valueChanges.subscribe(()=> {
      this.showDCGApprover(this.ruleDetial.PurchaseType);//判断是否显示DCG采购员审批人
    });
  }

  //符合条件则显示DCG采购审批人
  showDCGApprover(purchaseTypeValue) {

    if(purchaseTypeValue==='备货单采购'&&this.ruleDetial.RevolveDaysLimit==1) {//如果为备货采购申请，并且实际周转天数大于标准周转天数
      this.workFlowNodes.forEach(element => {//遍历流程审批配置信息，找到”DCG采购员“这个环节
        if(element.NodeID===15) {
           element.isShow=true;
        }
      });
    }else {
      this.workFlowNodes.forEach(element => {
        if(element.NodeID===15) {
           element.isShow=false;
        }
      });
    }
  }

  //设置审批人列表是否勾选
  getChecked(I, valueList) {

    if (valueList.length>0) {
      this.workFlowNodes[I].IsOpened = 1;
    } else {
      
      this.workFlowNodes[I].IsOpened = 0;
      this.workFlowNodes[I].IfRequired=-1;//如果没有审批人信息，那么需要将是否必选清空
    }
  }

  //当勾选或者不勾选环节审批人时，设置IsOpened的值
  changeIsOpened(I,IsOpened){
    if(IsOpened){//转换IsOpened的值，转换为（true：1，false：0）
      this.workFlowNodes[I].IsOpened=1;
    }else{
      this.workFlowNodes[I].IsOpened=0;
    }
    
  }

  //验证授权额度，结束需大于开始
  testAmountLimit(type){
    if(this.ruleDetial.StartAmount&&eval(this.ruleDetial.EndAmount)>0) {

      if(this.ruleDetial.EndAmount-this.ruleDetial.StartAmount<0){
        this.windowService.alert({message:"请填写正确的授权额度，后者需大于前者",type:'fail'}).subscribe(()=>{
          //将触发判断事件的文本框置为空
        type==='start'?this.ruleDetial.StartAmount=null:this.ruleDetial.EndAmount=null;
        });
      }
      
    }
    
  }

  //验证是否填写了审批人
   isWriteApprovalList():boolean{
      let invalid:boolean=false;//是否不合法
    if(this.workFlowNodes.every(item=>item.valueList.length===0 || !item.IsOpened)||
  this.workFlowNodes.some(item=>item.IsOpened==1&&item.valueList.length===0)){
      this.windowService.alert({message:'请选择审批人',type:'fail'});
      invalid=true;
    }else if(this.workFlowNodes.some(item=>item.IsOpened&&item.IfRequired==-1)){
      this.windowService.alert({message:"填写了审批人的环节，必须选择是否必选",type:'fail'});
      invalid=true;
    }
    return invalid;
  }

  //保存
  save() {
    this.isSubmit = true;

    //验证审批人列表是否填写
    if(this.isWriteApprovalList()) return;

    //验证表单项是否填写完整
    if(this.form.invalid){
      this.windowService.alert({message:'表单填写有误，请检查后重新提交',type:"fail"});
      return;
    }

    //保存审批人
    this.writeApprovalPerson();
    
  }

  //格式化表单数据为请求参数格式
  formatData() {
    //格式化选择的事业部列表，存储为请求格式
    this.formatDepartmentList();
    //格式化审批人序列为字符串
    this.formaApprovalListToString();
    //格式化所有数字内容为number类型
    this.formatStringToNumber();
    //将表单详情存入请求字段
    this.purchaseApplicationData.ruleDetial=this.ruleDetial;
    //保存基础数据
    this.purchaseApplicationData.baseRole=this.baseRole;
  }

  //格式化所有数字内容为number类型
  formatStringToNumber(){
    this.ruleDetial.AmountRelate=this.ruleDetial.AmountRelate?eval(this.ruleDetial.AmountRelate):0;//授权额度限制
    this.ruleDetial.StartAmountLimit=this.ruleDetial.StartAmountLimit?eval(this.ruleDetial.StartAmountLimit):0;//起始授权金额控制
    this.ruleDetial.StartAmount=this.ruleDetial.StartAmount?parseFloat(this.ruleDetial.StartAmount):0;//起始授权额度
    this.ruleDetial.EndAmountLimit=this.ruleDetial.EndAmountLimit?eval(this.ruleDetial.EndAmountLimit):0;//终止授权金额控制
    this.ruleDetial.EndAmount=this.ruleDetial.EndAmount?parseFloat(this.ruleDetial.EndAmount):0;//终止授权额度
    this.ruleDetial.StandardRevolveDays=this.ruleDetial.StandardRevolveDays?eval(this.ruleDetial.StandardRevolveDays):0;//标准周转天数
    this.ruleDetial.RevolveDaysLimit=this.ruleDetial.RevolveDaysLimit?eval(this.ruleDetial.RevolveDaysLimit):-3;//周转天数限制
  }

  //格式化选择的事业部列表，存储为请求格式
  formatDepartmentList() {
    if(!this.departmentList) return;
    this.purchaseApplicationData.productLines=[];//将请求参数的事业部列表清空
    this.departmentList.forEach(element => {
      this.productLinesData=new ProductLinesData();
      this.productLinesData.BusinessCode=element;//取出选择数组中的itcode，存入请求字段
      this.purchaseApplicationData.productLines.push(this.productLinesData);
    });
  }

  //格式化审批人序列为字符串
  formaApprovalListToString(){
    this.workFlowNodes.forEach(element => {
      element.ApproverList=JSON.stringify(element.ApproverList);
    });
  }

  //保存审批人itcode和姓名
  writeApprovalPerson() {

    //遍历流程审批人信息列表
    this.workFlowNodes.forEach(element=> {

      let approerListItem= {// 申明一个变量，用来存储审批人列表中的itcode和username
        'ITCode':'',
        'UserName':''
      }

      if(element.valueList.length>0&&element.IsOpened) {
        element.ApproverList=[];//清空流程配置信息中的审批人列表
        element.valueList.forEach(item => {//遍历选择的审批人列表

          approerListItem.ITCode=item.ITCode;// 保存ITCode
          approerListItem.UserName=item.UserName;// 保存userName
          element.ApproverList.push(JSON.parse(JSON.stringify(approerListItem)));//将审批人push进入审批人流程配置信息
        });
      }else if(element.valueList.length===0&&element.ApproverList.length>0) {// 之前选过审批人，后来又清空的情况，将之前保存的审批人清空
        element.ApproverList=[];//清空流程配置信息中的审批人列表
      }
    });

    this.formatData();//格式化表单数据为请求参数格式
    this.saveRuleAPI();//保存规则

  }

  //保存规则
  saveRuleAPI(){
    
    this.purchaseApplicationService.saveRule(this.purchaseApplicationData).then(resData=>{
      if(resData.Result){
        this.windowService.alert({message:"保存成功！",type:'success'}).subscribe(()=>{
          localStorage.setItem('puerchaseApplyRule','save');//将保存标识写入loca
          window.close();
        })
      }else{
        this.windowService.alert({message:resData.Message,type:"fail"});
      }
    })
  }

  //取消
  cancle() {
    window.close();
  }


  //是否允许选择本部
  isSelectDepartment() {
    if(this.ruleDetial.BBMC) {// 如果存在本部
      this.windowService.confirm({ message: "重新选择本部，将会重置已选择的事业部，是否继续？" }).subscribe({
        next: (v) => {
            if (v) {
               this.IqSelect.toggle();//显示本部搜索列表
            }
        }
    });
    }else {
      this.IqSelect.toggle();//显示本部搜索列表
    }
  }

  //获取本部
  getBBMC(e){
    this.departmentList=[];
  }

  //获取备货周转天数
  getStandardRevolveDays (departmentList):void {

    if(this.ruleDetial.PurchaseType !== '备货单采购'|| !departmentList || departmentList.length === 0) return; // 只有在做备货采购申请时，才会请求接口查询标准周转天数

    this.purchaseApplicationService.getRevolveDays(departmentList).then(data => {
      if(data.Result) {
        console.log('获取标准周转天数',data.Data);
           this.ruleDetial.StandardRevolveDays = data.Data;  
      } else {
        this.windowService.alert({message:data.Message, type: 'fail'}).subscribe(()=>{
          this.ruleDetial.StandardRevolveDays = null;
        });
      }
    });
  }


}
