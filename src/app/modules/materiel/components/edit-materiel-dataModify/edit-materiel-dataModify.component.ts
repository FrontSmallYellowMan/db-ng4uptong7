import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { WindowService } from "app/core";
import { DbWfviewComponent } from 'app/shared/index';
import { MaterielData, DetailData, SearchOriginalData, MaterielDataModifyService, ApprovalListData, ExamineState,ApprovalPersonJSON } from "../../services/materiel-dataModify.service";
import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";


declare var window,localStorage;
declare var $;
@Component({
  templateUrl: 'edit-materiel-dataModify.component.html',
  styleUrls: ['edit-materiel-dataModify.component.scss', '../../scss/materiel.component.scss']
})
export class EditMaterielDataModifyComponent implements OnInit {
  materielData: MaterielData = new MaterielData;
  detailData: DetailData = new DetailData;
  searchOriginalData: SearchOriginalData = new SearchOriginalData;
  approvalListData: ApprovalListData = new ApprovalListData;
  examineState: ExamineState = new ExamineState;
  approvalPersonJSON:ApprovalPersonJSON=new ApprovalPersonJSON();
  recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();//实例化验证是否可编辑的请求参数

  history: any=[];//用来保存审批历史记录

  isEdit: boolean = true;//物料号和工厂，申请人是否可编辑（true为可编辑，fasle为不可编辑）

  isShowBatch: boolean;//是否显示批次

  unListEdit: boolean = true;//列表是否可编辑，true为不可编辑，false为可编辑

  isSubmit: boolean = false;//是否点击提交按钮或者搜索按钮

  //isTempSave:boolean=false;//是否点击暂存活着提交

  applicantInformation: any;//用来保存选人组件的用户信息

  applyStateCode: any = 0;//用来审批状态码(0为没有提交审批，1为提交审批完成，等待采购员审批，2为采购员审批结束，审批流程结束)

  myState: string;//用来保存是从“我的申请”还是从“我的审批”跳转过来的（传递参数为“a”：是apply的意思，表示“我的申请”，“e”：是examine的意思，表示“我的审批”）

  showExamine: boolean;//是否显示审批记录

  showCloss: boolean = false;//是否显示关闭按钮（true为显示，false为不显示）

  allFactory_Old: any;//搜索工厂的id和名称

  approvalPerson:string;//保存获取到的审批人
  wfviewData:any;//保存审批流程图中的审批人信息
  firstPerson:any=[];//保存一级审批人

  oldSpecifications:string;//用来保存原始规格型号的内容，在提交用来区分是否做了修改

  //基础数据ngModel绑定数据
  allTemplate: any = ["", ""];//物料模版id+名称
  allFactory: any = ["", ""];//工厂id+名称
  allSupplierCodeSAP: any = ["", ""];//供应商物料编号id+名称
  allMaterialType: any = ["", ""];//物料类型id+名称
  allSerialNumParameter: any = ["", ""];//序列号参数id+名称
  allMaterialGroup: any = ["", ""];//物料组id+名称
  allTaxType: any = ["", ""];//税收分类id+名称
  allBrand: any = ["", ""];//品牌id+名称
  allBaseUnitOfMeasure: any = ["", ""];//基本计量单位id+名称
  allAvailabilityChecking: any = ["", ""];//可用性检查id+名称
  allSubjectSettingGroup: any = ["", ""];//科目设置组id+名称
  allTaxClassifications: any = ["", ""];//税收分类id+名称
  allProductLevel: any = ["", ""];//产品层次

  constructor(
    private router: ActivatedRoute,
    private materielDataModifyService: MaterielDataModifyService,
    private windowService: WindowService,
    private recordAllowEditStateService:RecordAllowEditStateService
  ) { }

  @ViewChild('form') public form: NgForm;
  @ViewChild('wfView') public wfView: DbWfviewComponent;

  ngOnInit() {

    this.examineState.ApproveITCode = JSON.parse(localStorage.getItem("UserInfo")).ITCode;//获取登录人的Itcode
    //console.log(this.examineState.ApproveITCode);

    this.router.params.subscribe(params => {//获取路由传过来的值

      this.materielData.ID = params.id.substring(1);//保存主键ID
      this.myState = params.id.substring(0, 1);//获取状态标识，a为我的申请，b为我的审批

      this.router.queryParamMap.subscribe(data=>{
        if(data.has('taskid')){
          this.examineState.TaskId=data.get('taskid');
        }
      });
      //let url = window.location.search;//获取地址栏的链接
      //this.examineState.TaskId = url.substring(url.indexOf("?") + 1, url.length - 1);//保存链接中的TaskId
      //console.log(this.examineState.TaskId);

      if (params.id != 0) {

        this.recordAllowEditStateQuery.FunctionCode='43';//请求查询的模块代码
        this.recordAllowEditStateQuery.RecordID=params.id;//页面的主键ID
        this.recordAllowEditStateQuery.NotAllowEditLink=`mate/edit-data/a${params.id}#top`;
        this.recordAllowEditStateQuery.NotFoundRecordLink=`mate/m-dm/my-apply/a`;
        this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

        this.isEdit = false;//申请人，物料ERP编号和工厂为不可编辑状态
        this.detailData.ID = params.id.substring(1);
        this.materielDataModifyService.detailData({ "ID": params.id.substring(1) }).then(data => {
        this.materielData = data.data.list[0];

        this.oldSpecifications=this.materielData.Specifications_Old;
      
        this.getDetailApprovalPerson();//获取保存的审批人

        //console.log(data.data);
          this.allSerialNumParameter = this.materielData.SerialNumParameter ? [this.materielData.SerialNumParameter, this.materielData.SerialNumParameterName] : ["", ""];
          this.allBrand = this.materielData.MaterBrand ? [this.materielData.MaterBrand, this.materielData.MaterBrandName] : ["", ""];
          this.allBaseUnitOfMeasure = this.materielData.SalesUnit ? [this.materielData.SalesUnit, this.materielData.SalesUnitName] : ["", ""];
          this.allAvailabilityChecking = this.materielData.AvailabilityChecking ? [this.materielData.AvailabilityChecking, this.materielData.AvailabilityCheckingName] : ["", ""];
          this.allTaxType = this.materielData.TaxTypeId ? {id:this.materielData.TaxTypeId, title:this.materielData.TaxTypeName} : ["", ""];

          this.allProductLevel = this.materielData.ProductLevel ? [this.materielData.ProductLevel, this.materielData.ProductLevelName] : ["", ""];
          
          //如果审批历史记录存在，则将历史记录显示出来
          if (data.data.history) {

            this.history = JSON.parse(data.data.history).reverse();//存储返回的审批历史记录
           console.log(this.history);
            if (this.history.length == 0) {//判断是否显示审批记录
              this.showExamine = false;
            } else {
              this.showExamine = true;
            }

          }

          //如果审核状态是“1”（已提交）“2”（已完成），那么就不可以编辑   
          if (this.materielData.ApplicationState == "1" || this.materielData.ApplicationState == "2" || (this.examineState.TaskId != undefined && this.materielData.ApplicationState == "3")||((this.examineState.ApproveITCode!=this.materielData.ApplyITcode)&&this.materielData.ApplicationState=='0')) {
            //console.log(this.examineState.TaskId,this.materielData.ApplicationState); 
            this.unListEdit = true;

          } else {
            this.unListEdit = false;
          }

          if (this.materielData.BatchManagement == 0) {
            this.materielData.BatchManagement = false;
          } else {
            this.materielData.BatchManagement = true;
          }
          //根据申请状态判断右侧审批流程的按钮显示效果
          switch (this.materielData.ApplicationState) {
            case "0":
              this.applyStateCode = 0;
              break;
            case "1":
              this.applyStateCode = 1;
              break;
            case "2":
              this.applyStateCode = 2;
              break;
            case "3":
              this.applyStateCode = 0;
              break;
            default:
              this.applyStateCode = 0;
              break;
          }
         // console.log(this.materielData);
        });
      } else {
        this.unListEdit = false;
      }

      if(this.materielData.ID&&this.materielData.ApplicationState!='0'){
        //获取审批人信息
        this.getApprovalPerson();
      }
      

    });


  }

  //取消
  cancel() {
    window.close();
  }
  //点击查询按钮，查询原始物料信息
  searchData() {

    if (this.searchOriginalData.MaterialERPCode == undefined || this.searchOriginalData.Factory_Old == undefined) {
      this.isSubmit = true;
      this.windowService.alert({ message: "请填写物料ERP编号和工厂", type: "fail" });
      //console.log(this.materielData.MaterialERPCode);
      return;
    }
    //this.searchOriginalData.Factory_Old=this.allFactory_Old[0];
    this.materielDataModifyService.searchOriginalData(this.searchOriginalData).then(data => {

      //this.applicantInformation=this.materielData.applicantInformation[0];//保存申请人，避免搜索后被重置

      if (data.success) {

        //console.log(applicantInformation);
        this.materielData = data.data.list[0];

        this.materielData.Factory_Old = this.searchOriginalData.Factory_Old;//将搜索数据存入主数据
        this.materielData.MaterialERPCode = this.searchOriginalData.MaterialERPCode;//将搜索数据存入主数据
        this.materielData.ApplicationState = "0";
        this.materielData.IsSpecifications = "0";

        sessionStorage.setItem("Factory", this.searchOriginalData.Factory_Old);
        sessionStorage.setItem("MaterialERPCode", this.searchOriginalData.MaterialERPCode);

      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }


    });
  }

  //暂存 
  tempSave(state) {

    this.isSubmit = state===1?true:false;
    console.log(this.isSubmit);

    let factory = sessionStorage.getItem("Factory");//读取保存在sessionStorage中的工厂的值，用来比对最后保存时，是否和搜索的值一致
    let materialERPCode = sessionStorage.getItem("MaterialERPCode");//读取保存在sessionStorage中的ERP物料号的值，用来比对最后保存时，是否和搜索的值一致

    if (this.materielData.ApplyITcode == undefined) {//从localStorage中存储申请人和Itcode

      this.materielData.ApplyName = JSON.parse(localStorage.getItem("UserInfo")).UserName;//获取登录人的姓名
      this.materielData.ApplyITcode = JSON.parse(localStorage.getItem("UserInfo")).ITCode;//获取登录人的Itcode
      //console.log(this.materielData.ApplyName,this.materielData.ApplyITCode);
    }

    if (factory != this.searchOriginalData.Factory_Old || materialERPCode != this.searchOriginalData.MaterialERPCode||!this.materielData.MaterialDescriptionCN_Old) {
      this.windowService.alert({ message: "请点击查询后，再保存", type: "fail" });
      return;
    }
   

    this.materielData.SerialNumParameter = this.allSerialNumParameter[0] ? this.allSerialNumParameter[0] : "";
    this.materielData.SerialNumParameterName = this.allSerialNumParameter[1] ? this.allSerialNumParameter[1] : "";
    this.materielData.MaterBrand = this.allBrand[0] ? this.allBrand[0] : "";
    this.materielData.MaterBrandName = this.allBrand[1] ? this.allBrand[1] : "";
    this.materielData.SalesUnit = this.allBaseUnitOfMeasure[0] ? this.allBaseUnitOfMeasure[0] : "";
    this.materielData.SalesUnitName = this.allBaseUnitOfMeasure[1] ? this.allBaseUnitOfMeasure[1] : "";
    this.materielData.AvailabilityChecking = this.allAvailabilityChecking[0] ? this.allAvailabilityChecking[0] : "";
    this.materielData.AvailabilityCheckingName = this.allAvailabilityChecking[1] ? this.allAvailabilityChecking[1] : "";
    this.materielData.TaxTypeId = this.allTaxType.id ? this.allTaxType.id : "";
    this.materielData.TaxTypeName = this.allTaxType.title ? this.allTaxType.title : "";
    this.materielData.ProductLevel = this.allProductLevel[0] ? this.allProductLevel[0] : "";
    this.materielData.ProductLevelName = this.allProductLevel[1] ? this.allProductLevel[1] : "";
    
    //console.log(this.materielData.TaxTypeId,this.materielData.TaxTypeName,this.allTaxType)


    if (!this.materielData.BatchManagement) {//判断在勾选批次时，批次号和移动平均价是否填写
      this.materielData.MovingAveragePrice = "";
      this.materielData.BatchCode = "";
    } else {
      if (this.isSubmit&&(this.materielData.MovingAveragePrice == undefined || this.materielData.BatchCode == undefined)) {
        this.windowService.alert({ message: "批次或移动平均价不能为空", type: "fail" });

        //console.log(this.materielData.MovingAveragePrice,this.materielData.BatchCode);
        return;
      }
    }

    if(this.isSubmit&&!this.materielData.Specifications&&this.materielData.IsSpecifications=='1'){
      this.windowService.alert({message:"请填写规则型号",type:"fail"});
      return;
    }

    if(this.firstPerson.length===0){
      this.windowService.alert({message:'请选择一级审批人',type:'fail'});
      return;
    }

    //判断表单是否合法
    if (this.form.invalid) {
      this.windowService.alert({ message: "表单填写有误，请检查后再次提交", type: "fail" });
      return;
    } else {
      //转换IsBatchManage的值
      if (this.materielData.BatchManagement != 0&&this.materielData.BatchManagement!=undefined) {
        this.materielData.BatchManagement = 1;
      } else {
        this.materielData.BatchManagement = 0;
      }

      if (this.materielData.IsSpecifications == null || this.materielData.IsSpecifications == 0) {//转换IsSpecifications(规格型号标识)的值
        this.materielData.IsSpecifications = 0;
      } else {
        this.materielData.IsSpecifications = 1;
      }

      //this.materielData.Factory_Old=this.materielData.Factory;//Factory_Old为请求必填字段，将页面搜索框的Factory字段赋给Factory_Old字段

      this.materielData.ApplicationState = state;//判断传入的状态，0为暂存，1为提交

      //console.log(!this.materielData.MaterialDescriptionCN,!this.materielData.MaterialDescriptionEN,!this.materielData.Brand,!this.materielData.ProductLevel,!this.materielData.TaxTypeId,!this.materielData.SupplyMaterialNumber,!this.allSerialNumParameter,!this.allAvailabilityChecking,!this.allBaseUnitOfMeasure);

      //如果提交时，修改后的字段都为空，则弹出提示
        
    if(this.isSubmit&&!this.materielData.MaterialDescriptionCN&&!this.materielData.MaterialDescriptionEN&&!this.materielData.MaterBrand&&!this.materielData.ProductLevel&&
      !this.materielData.TaxTypeId&&!this.materielData.SupplyMaterialNumber&&!this.materielData.SerialNumParameter&&!this.materielData.AvailabilityChecking&&!this.materielData.SalesUnit&&(this.oldSpecifications==this.materielData.Specifications)&&!this.materielData.BatchManagement){
         this.windowService.alert({message:"没有任何修改，请修改后提交",type:"fail"}).subscribe(()=>{
          this.materielData.ApplicationState='0';
         });
         return;
      }

      //调用接口保存
      this.materielDataModifyService.tempSaveData(this.materielData).then(data => {

        if (data.success) {//判断保存成功或者失败，给予提示
          if (this.materielData.ApplicationState == "0") {
            this.windowService.alert({ message: "保存成功", type: "success" }).subscribe(()=>{

              this.applyStateCode = state;//根据传入的值判断右侧审批流程按钮的显示效果
              localStorage.setItem('dataMaterial','save');//写入localStorage
              window.close();//关闭窗口
              
            });
          } else {
            this.showCloss = true;//显示关闭按钮
            this.isEdit = false;//将页面上部的查询隐藏
            this.windowService.alert({ message: "提交成功", type: "success" }).subscribe(()=>{

              this.unListEdit = true;
              this.applyStateCode = state;//根据传入的值判断右侧审批流程按钮的显示效果
              localStorage.setItem('dataMaterial','submit');//写入localStorage
             // window.close();//关闭窗口

            });
          }

          this.materielData.ID = data.data.data.ID;//将会传的ID保存在主数据中
         
        } else {
          this.windowService.alert({ message: data.message, type: "fail" });
          this.materielData.ApplicationState = "0";//判断传入的状态，0为暂存，1为提交

        }

        //console.log(this.materielData);
      });
    }

  }

  //同意或者驳回
  examine(approveResult) {
    this.examineState.ID = this.materielData.ID;
    this.examineState.ApproveResult = approveResult;
    this.examineState.MaterialERPCode=this.materielData.MaterialERPCode;
    //this.examineState.TaskId=localStorage.getItem("TaskId");
    this.isSubmit = true;

    if (this.examineState.ApproveResult == "0") {

      this.materielDataModifyService.examineFlow(this.examineState).then(data => {

        if (data.success) {//判断保存成功或者失败，给予提示

          this.windowService.alert({ message: "审批完成", type: "success" }).subscribe(() => {
            this.applyStateCode = 2;//根据传入的值判断右侧审批流程按钮的显示效果
            this.showCloss = true;//显示关闭按钮
            this.unListEdit = true;
            this.materielData.ApplicationState = "2";//设置状态为“已完成”
            localStorage.setItem('dataMaterial','approval');
            window.close();
          });
        } else {
          this.windowService.alert({ message: data.message, type: "fail" });
          return;
          //this.materielData.ApplicationState = "0";//判断传入的状态，0为暂存，1为提交   
        }
        //console.log(JSON.stringify(this.materielData));
      });
      return;
    }

    //提交审批
    if (this.examineState.ApproveResult == "1" && this.form.valid) {

      this.materielDataModifyService.examineFlow(this.examineState).then(data => {

        if (data.success) {//判断保存成功或者失败，给予提示

          this.windowService.alert({ message: "已驳回", type: "success" }).subscribe(() => {
            this.applyStateCode = 2;//根据传入的值判断右侧审批流程按钮的显示效果
            this.showCloss = true;//显示关闭按钮
            //console.log(data);
            this.unListEdit = true;
            this.materielData.ApplicationState = "3";//设置状态为“驳回”
            localStorage.setItem('dataMaterial','approval');
            window.close();
          });
        } else {
          this.windowService.alert({ message: data.message, type: "fail" });
          return;
          //this.materielData.ApplicationState = "0";//判断传入的状态，0为暂存，1为提交
        }
        //console.log(JSON.stringify(this.materielData));
      });

    } else {
      this.windowService.alert({ message: "请输入审批意见", type: "fail" });
    }

  }
  //列表中的清空按钮，清空选择的内容
  clearContent(e) {
    switch (e) {
      case "allBrand":
        this.allBrand = ["", ""];
        break;
      case "allProductLevel":
        this.allProductLevel = ["", ""];
        break;
      case "allTaxType":
        this.allTaxType = ["", ""];
        break;
      case "allSerialNumParameter":
        this.allSerialNumParameter = ["", ""];
        break;
      case "allAvailabilityChecking":
        this.allAvailabilityChecking = ["", ""];
        break;
      case "allBaseUnitOfMeasure":
        this.allBaseUnitOfMeasure = ["", ""];
        break;

      default:
        break;
    }
  }
  //如果输入的为整数，则移动平均价自动补足
  addZero(){
    let reg=/^[1-9]\d*$/;
    let MovingAveragePrice=this.materielData.MovingAveragePrice;
    if(MovingAveragePrice.search(reg)!=-1){
      this.materielData.MovingAveragePrice=MovingAveragePrice+".00";
    }
    
  }

  //获取审批人信息
  getApprovalPerson(){
    this.materielDataModifyService.getApprovalPerson({'ID':this.materielData.ID}).then(data=>{
      if(data.Result&&data.Data){
        // let approvalPersonObject=JSON.parse(data.Data);//保存获取审批人对象
        // let approvalPersonArray=[];//保存审批人姓名的数组
        // for(let key in approvalPersonObject){
        //   approvalPersonArray.push(approvalPersonObject[key]);//将审批人姓名push进数组
        // }
        // this.approvalPerson=approvalPersonArray.join(',');
        if (this.history.length > 0 && this.history[0].approveresult === '驳回') {//增加申请人的审批节点
          this.wfviewData = [{ IsAlready: false, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//如果审批历史记录里的第一条数据为“驳回”，表示最后一次操作为“驳回”操作，那么全景区的申请人状态为“未提交”
        } else {
          this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//否则，全景图申请人状态为“已完成”
        }
        
        if(this.materielData.ApplicationState!='3'&&this.materielData.ApplicationState!='0'&&this.materielData.ApplicationState!=undefined){

          this.wfView.onInitData(this.wfviewData);
        }

      }
    })
  }

  //获取一级预审人
  getPersonInfor(firstPerson){
    if(firstPerson){
      this.approvalPersonJSON.data[0].UserSettings=JSON.stringify([{'ITCode':firstPerson[0].userEN,'UserName':firstPerson[0].userCN}]);
      this.materielData.WFApproveUserJSON=JSON.stringify(this.approvalPersonJSON.data);
    }else{
      this.approvalPersonJSON.data[0].UserSettings=[];
      this.materielData.WFApproveUserJSON='';     
    }

  }

  //获取详情中的审批人
  getDetailApprovalPerson(){
  if(this.materielData.WFApproveUserJSON){
    let approvalPerson=JSON.parse(this.materielData.WFApproveUserJSON)[0].UserSettings;

    console.log(approvalPerson);
    this.firstPerson=[{userCN:JSON.parse(approvalPerson)[0].UserName,userEN:JSON.parse(approvalPerson)[0].ITCode,userID:JSON.parse(approvalPerson)[0].ITCode}];
    
  }
  }
  
}