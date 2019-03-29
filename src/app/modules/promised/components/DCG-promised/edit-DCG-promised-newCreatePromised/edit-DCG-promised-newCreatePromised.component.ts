import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { WindowService } from "../../../../../../app/core";
import { Observable } from "rxjs/Observable";
import {
  dbomsPath,
  environment
} from "../../../../../../environments/environment";
import { Person } from "../../../../../../app/shared/services/index";
import { ActivatedRoute } from "@angular/router";
import { NgForm, FormGroup, FormBuilder } from "@angular/forms";

import * as moment from "moment";

import {
  DCGPromiseService,
  CommitmentData,
  AttachmentList,
  DCGIData,
  CommitTypesListData,
  ApprovalPersonJSON
} from "../../../services/DCGPromised.service";

import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../../shared/services/recordalloweditstate.service";

import { element } from "protractor";

declare var window;

@Component({
  selector: "edit-dcg-newcreatepromised",
  templateUrl: "edit-DCG-promised-newCreatePromised.component.html",
  styleUrls: [
    "edit-DCG-promised-newCreatePromised.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class EditDCGNewCreatePromisedComponent implements OnInit {
  userInfo = new Person(); // 登录人头像

  DCGIData: DCGIData = new DCGIData(); //请求参数
  commitmentData: CommitmentData = new CommitmentData(); //实例化表单主体字段
  attachmentList: AttachmentList = new AttachmentList(); //实例化附件列表字段
  approvalPersonJSON:ApprovalPersonJSON=new ApprovalPersonJSON();//实例化审批字符串

  commitTypesListData: CommitTypesListData = new CommitTypesListData(); //实例化多条承诺类型的存储字段
  commitTypesList: any[] = []; //多条承诺类型存储列表
  commitTypeClassAndDay: any={ Class: '',Code: '',Name: '',LongDay: ''}; //承诺分类及最长承诺的天数,数据格式为,例{class:'单据类',longDay:7}

  listCommitmentType: any[] = []; //承诺类型列表
  listPlatform: any[] = []; //平台列表

  isSubmit: boolean = false; //是否点击提交按钮

  upFileApiLink: string = environment.server + "Commitment/UploadAccessories"; //用来保存上传附件的接口地址
  accessoryList: any; //附件对象
  alreadyfilelUpLoadList: any[] = []; // 用来保存上传过的附件列表
  filelUpLoadList: any[] = []; //用来保存新上传的附件列表

  pageTitle: string = "新建DCG通用承诺"; // 页面标题
  nowDate = new Date(); //获取当前时间
  recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();
  
  wfHistory: any = []; //保存审批历史记录

  requiredItems = [
    //根据主承诺类型的不同，切换对应的必填项状态
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    },
    {
      PlatformID: true,
      ContractID: true,
      ContractMoney: true,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: false
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: false
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: true,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: false
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: false,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    },
    {
      PlatformID: true,
      ContractID: false,
      ContractMoney: false,
      AgentName: false,
      SYBApprove1: true,
      SYBApprove2: false,
      DCGRiskApprove: false,
      DCGBusiApprove: true
    }
  ];

  //将对应的必填项状态存入此字段
  requiredItemStatus: any = {
    PlatformID: true,
    ContractID: true,
    ContractMoney: true,
    AgentName: true,
    SYBApprove1: true,
    SYBApprove2: false,
    DCGRiskApprove: false,
    DCGBusiApprove: false
  };

  _SYBApprove1:any[]=[]; //事业部一级审批人
  _SYBApprove2:any[]=[]; //事业部二级审批人
  _DCGRiskApprove: any[]=[]; //风险岗审批人
  _DCGBusiApprove: any[]=[]; //销售商务岗审批人

  formatApprovalPerson:any;

  constructor(
    private DCGPromiseService: DCGPromiseService,
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private recordAllowEditStateService:RecordAllowEditStateService
  ) {}

  @ViewChild("form") public form: NgForm;
  @ViewChild('person1') public person1:ElementRef;

  ngOnInit() {
    this.getPerson(); //获取人员基本信息
    this.getPlatformAndTypeList(); //获取平台列表和承诺类型列表
    this.getRouterParameter(); //获取路由参数  
    this.getApprovalHistroyAndView();//获取审批历史记录
  }

  //获取人员基本信息
  getPerson() {
    const user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {
      // 获取登录人头像信息
      this.userInfo["userID"] =user["ITCode"];
      this.userInfo["userEN"] = this.commitmentData.SalesITCode = user["ITCode"].toLocaleLowerCase();
      this.userInfo["userCN"] = this.commitmentData.SalesName =user["UserName"];
    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }

    //请求数据接口，查询登录人的相关信息
    this.DCGPromiseService.getPersonInformation().then(data => {
      if (data.Result) {
        //如果存在基本信息，则将信息存入
        console.log(data);
        this.commitmentData.SalesDeparment = JSON.parse(data.Data).YWFWMC; //获取事业部
        this.commitmentData.SalesLevel = JSON.parse(data.Data).CommitLevel; //获取销售员等级
      }
    });
  }

  //获取新申请ID
  // getApplyId() {
  //   this.DCGPromiseService.getNewApplyId().then(data => {
  //     if (data.Result) {
  //       this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //获取申请ID
  //     }
  //   });
  //   //this.commitmentData.ApplyID='20180300122';
  // }

  //获取路由参数
  getRouterParameter() {
    this.activatedRoute.paramMap.subscribe(data => {
      //获取路由的参数

      if (data.get("id") !== "0") {
        this.commitmentData.ApplyID=data.get("id");

      this.recordAllowEditStateQuery.FunctionCode='72';//请求查询的模块代码
      this.recordAllowEditStateQuery.RecordID=this.commitmentData.ApplyID;//页面的主键ID
      this.recordAllowEditStateQuery.NotAllowEditLink=`promised/edit-dcg-aprovaldetail/a${this.commitmentData.ApplyID}`;
      this.recordAllowEditStateQuery.NotFoundRecordLink=`promised/DCG-myApply/a`;
      this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

        this.getDetail(this.commitmentData.ApplyID);//获得详情
      } else {
        //如果id为“0”，则代表为新申请
       // this.getApplyId();
      }
    });
  }

  //获取平台列表及承诺类型列表
  getPlatformAndTypeList() {
    this.DCGPromiseService.getPlatformAndCommitmentTypeList().then(data => {
      this.listPlatform = JSON.parse(data.Data).ListPlatform; //平台列表
      this.listCommitmentType = JSON.parse(data.Data).ListCommitmentType; //承诺类型
      this.addListCommitmentTypeName();//在承诺类型中增加分割线
    });
  }

  //在承诺类型列表中增加分割线
  addListCommitmentTypeName() {

    let insertLineClass=[{CommitTypeName: "--------------------",CommitTypeCode: ""}]

    let billClass=this.listCommitmentType.filter(item=>item.GroupName==='单据类');
    let PaymentClass=this.listCommitmentType.filter(item=>item.GroupName==='回款类');
    let borrowClass=this.listCommitmentType.filter(item=>item.GroupName==='借用清理类');
    let otherClass=this.listCommitmentType.filter(item=>item.GroupName==='其他类');

    //合并数组到承诺类型列表
    this.listCommitmentType=[...billClass,...insertLineClass,...PaymentClass,...insertLineClass,...borrowClass,...insertLineClass,...otherClass];
  }

  //获取平台名称和Id
  getPlatForm(id) {
    this.listPlatform.forEach(element => {
      if (element.platformcode === id)
        this.commitmentData.PlatformName = element.platform; //将平台名称存入请求对象
    });
  }


  /**
   * 获取详情 *START*
   */

   getDetail(ApplyID){
     this.DCGPromiseService.getDetail({'ApplyID':ApplyID}).then(data=>{
       if(data.Result){
         this.commitmentData=JSON.parse(data.Data).CommitmentApply;//赋值主字段
         this.DCGIData.AttachmentList=JSON.parse(data.Data).AttachmentList;//保存附件list
         
         if(this.commitmentData.CommitTypesJSON){//如果存在多条承诺类型 
           this.commitTypesList=JSON.parse(this.commitmentData.CommitTypesJSON).slice(1);//截取数组，去掉主承诺类型
          this.commitTypeClassAndDay=JSON.parse(this.commitmentData.CommitTypesJSON)[0];//将主承诺存入对象
         }

         //将附件list赋值到绑定字段
         this.getDetailFileUpload();
         ///将详情里的审批人转为JSON对象
         this.getApprovalPersonDetail();
         //根据主承诺类型确认必填项
         this.selectRequiredRule(this.commitmentData.CommitTypeCode); //获取必填项

         console.log(JSON.parse(data.Data))
       }
     });
   }


  //获得详情页的附件列表
  getDetailFileUpload() {
    //console.log(this.currencyAndCode);
    if (this.DCGIData.AttachmentList.length > 0) {//如果存在已上传的附件列表
      this.alreadyfilelUpLoadList = JSON.parse(JSON.stringify(this.DCGIData.AttachmentList));//将已上传的附件列表存入新的变量中
      this.DCGIData.AttachmentList = [];//将原来保存上传列表的字段清空，以备再次提交时保存上传附件列表
      this.alreadyfilelUpLoadList.forEach(item => {//遍历新保存的已上传附件列表字段，添加name属性，用来附件上传组件显示名称
        item['name'] = item.AccessoryName;
      });
      //console.log(this.materielChangeData.AccessoryList);
    };
  }

   //将详情里的审批人转为JSON对象
   getApprovalPersonDetail(){
     
     this._SYBApprove1=this.commitmentData.SYBApprove1?JSON.parse(this.commitmentData.SYBApprove1):[];
     this._SYBApprove2=this.commitmentData.SYBApprove2?JSON.parse(this.commitmentData.SYBApprove2):[];
     this._DCGRiskApprove=this.commitmentData.DCGRiskApprove?JSON.parse(this.commitmentData.DCGRiskApprove):[];
     this._DCGBusiApprove=this.commitmentData.DCGBusiApprove?JSON.parse(this.commitmentData.DCGBusiApprove):[];
    // console.log(this.commitmentData.SYBApprove1,this._SYBApprove2,this._DCGRiskApprove,this._DCGBusiApprove);
    }

  /**
   * 获取详情 *END*
   */

  /**
   * 选择主承诺类型时的相关操作 *START*
   */

  //获取主承诺类型的编号以及最长的承诺天数
  getPromisedClass(PromisedTypeCode) {
    this.listCommitmentType.forEach(element => {
      
      //已经选择的列表项，将不允许再选择
      if(this.commitTypesList.length>0){
        element.unSelect = this.commitTypesList.some(item => item.Code === element.CommitTypeCode||element.CommitTypeCode===this.commitmentData.CommitTypeCode);
      }else{
        element.unSelect = (element.CommitTypeCode===this.commitmentData.CommitTypeCode);        
      }
     
      if (element.CommitTypeCode === PromisedTypeCode) {
        //如果编号相等
        this.commitTypeClassAndDay = {
          Class: element.GroupName,
          Code: element.CommitTypeCode,
          Name: element.CommitTypeName,
          LongDay: element.LongestCommitTime
        }; //将对应的分类名称和最长承诺时间存入参数
      }
    });

    //如果日期存在，则执行日期检查方法，判断是否符合承诺日期
    if (this.commitmentData.CommitDate) {
      this.alertPromisedDate(this.commitmentData.CommitDate); 
    }

    //获取必填项
    this.selectRequiredRule(PromisedTypeCode); 
  }

  //获取有哪些必填项
  selectRequiredRule(code) {
    if(!code) return;
    let requiredItemsIndex: number; //用来转换承诺类型编号为下标
    requiredItemsIndex = code.replace(/[0]/g, "") - 1; //生成下标
    this.requiredItemStatus = this.requiredItems[requiredItemsIndex];
    console.log(this.requiredItemStatus);
  }

  //选择日期后监测承诺类型，看是否超期
  alertPromisedDate(date) {
    console.log(this.listCommitmentType);
    if (!this.commitmentData.CommitTypeCode) return;
    let nowDate = moment(moment().format("YYYY-MM-DD")); //获取当前时间的毫秒数
    let selectCommitDate = moment(date); //获取承诺日期的毫秒数
    let timeDifference = selectCommitDate.diff(nowDate, "days"); //毫秒差转换为天数

    if (
      this.commitTypeClassAndDay.LongDay &&
      timeDifference > this.commitTypeClassAndDay.LongDay
    ) {
      //如果选择日期与当前日期之差的天数大于最大承诺日期
      this.windowService
        .alert({
          message: `所选承诺日期大于最长承诺日期，最长承诺日期为${
            this.commitTypeClassAndDay.LongDay
          }天`,
          type: "fail"
        })
        .subscribe(() => {
          this.commitmentData.CommitDate = "";
        });
    }
  }
  /**
   * END
   */
  

  /**
   * 增加承诺类型和删除承诺类型的方法 *START*
   */

  //增加承诺类型
  addPromised() {
    if(this.commitTypesList.length>2) return;
    this.commitTypesList.push(new CommitTypesListData());
    console.log(this.listCommitmentType);
  }

  //将多条承诺类型的选择值，存入变量
  addPromisedTypeInList(promisedType, I) {

    this.commitTypesList[I] = promisedType;//将新选择的承诺类型赋值到指定的数组位置

    this.listCommitmentType.forEach(element => {
      element.unSelect = this.commitTypesList.some(item => item.Code === element.CommitTypeCode||element.CommitTypeCode===this.commitmentData.CommitTypeCode);
      if (element.CommitTypeCode === promisedType.Code) {//找到构建的数组对象中与承诺类型列表中code相同的项
        this.commitTypesList[I].Name = element.CommitTypeName; //将相同项的名称存入构建的数组对应项
      }
    });
    //console.log(this.commitTypesList);
  }

  //删除指定位置的承诺类型
  removePromisedType(I) {
    this.listCommitmentType.forEach(element=>{
      if(this.commitTypesList[I].Code=element.CommitTypeCode) element.unSelect=false;
    });
    this.commitTypesList.splice(I, 1);
  }

  /**
   * END
   */

  /**
   * 获取审批人信息 *START*
   */

  //获取各节点审批人
  getApprovalPerson(e, type) {
    switch (type) {
      case 1:
      if(e.length!==0){
        this.commitmentData.SYBApprove1 = JSON.stringify([{userEN: e[0].userEN,userCN: e[0].userCN,userID: e[0].userEN}]);
      }else{this.commitmentData.SYBApprove1="";}    
        break;
      case 2:
       if(e.length!==0){
        this.commitmentData.SYBApprove2 = JSON.stringify([{userEN: e[0].userEN,userCN: e[0].userCN,userID: e[0].userEN}]);
       }else{this.commitmentData.SYBApprove2="";}
        break;
      case 3:
      if(e.length!==0){
        this.commitmentData.DCGRiskApprove = JSON.stringify([{userEN: e[0].userEN,userCN: e[0].userCN,userID: e[0].userEN}]);
      }else{this.commitmentData.DCGRiskApprove='';}
        break;
      case 4:
      if(e.length!==0){
        this.commitmentData.DCGBusiApprove = JSON.stringify([{userEN: e[0].userEN,userCN: e[0].userCN,userID: e[0].userEN}])
      }else{this.commitmentData.DCGBusiApprove="";} 
        break;
      default:
        break;
    }
  }

  /**
   * END
   */

  /**
   * 暂存和提交所需的处理函数 *START*
   *
   */

  // 暂存
  tempSave() {
    this.saveFormatRes(); //请求参数格式化
    if(!this.commitmentData.ApplyID){
      this.DCGPromiseService.getNewApplyId().then(data => {
        if (data.Result) {
          this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //获取申请ID
          this.tempSaveInterface(); //保存
        }
      });
    }else{
      this.tempSaveInterface(); //保存      
    } 
  }

  //提交
  onSubmit() {
    this.isSubmit = true;

    if(this.form.invalid){
      this.windowService.alert({message:"表单填写有误，请检查后重新提交",type:"fail"});
      return;
    }else{

      this.saveFormatRes(); //请求参数格式化
      this.getApprovalPersonJSON();//审批流程字符串
      if(!this.commitmentData.ApplyID){//如果ID不存在，则请求获取新ID
        
        this.DCGPromiseService.getNewApplyId().then(data => {
          if (data.Result) {
            this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //获取申请ID
            this.submitSaveInterface(); //保存
          }
        });
      }else{
      this.submitSaveInterface();//提交
      }
    }

    

  }

  //如果选择了多个承诺类型，则将多类型的存入主体参数
  saveFormatCommitTypesJSON() {
    //if (this.commitTypesList.length === 0) return;
    let mainCommitType = {
      Code: this.commitTypeClassAndDay.Code,
      Name: this.commitTypeClassAndDay.Name,
      IsReach: "否"
    };
    console.log(this.commitTypeClassAndDay);
    let allCommitTypesList = [mainCommitType, ...this.commitTypesList.filter(item=>item.Code)]; //合并主承诺类型和多选的承诺类型

    this.commitmentData.CommitTypesJSON = JSON.stringify(allCommitTypesList);
  }

  //将附件列表存入请求参数
  saveFormatFileUpload() {
      this.DCGIData.AttachmentList = [...this.alreadyfilelUpLoadList, ...this.filelUpLoadList];//合并上传附件数组
  }

  //生成审批信息字符串
  getApprovalPersonJSON(){
    //审批人
    this.approvalPersonJSON.data[0].UserSettings=this._SYBApprove1.length>0?`[{'ITCode':'${this._SYBApprove1[0].userEN}','UserName':'${this._SYBApprove1[0].userCN}'}]`:[];
    this.approvalPersonJSON.data[1].UserSettings=this._SYBApprove2.length>0?`[{'ITCode':'${this._SYBApprove2[0].userEN}','UserName':'${this._SYBApprove2[0].userCN}'}]`:[];
    this.approvalPersonJSON.data[2].UserSettings=this._DCGRiskApprove.length>0?`[{'ITCode':'${this._DCGRiskApprove[0].userEN}','UserName':'${this._DCGRiskApprove[0].userCN}'}]`:[];
    this.approvalPersonJSON.data[3].UserSettings=this._DCGBusiApprove.length>0?`[{'ITCode':'${this._DCGBusiApprove[0].userEN}','UserName':'${this._DCGBusiApprove[0].userCN}'}]`:[];

    //审批节点是否打开
    this.approvalPersonJSON.data[0].IsOpened=this._SYBApprove1.length>0?'1':'0';
    this.approvalPersonJSON.data[1].IsOpened=this._SYBApprove2.length>0?'1':'0';
    this.approvalPersonJSON.data[2].IsOpened=this._DCGRiskApprove.length>0?'1':'0';
    this.approvalPersonJSON.data[3].IsOpened=this._DCGBusiApprove.length>0?'1':'0';
    
    this.DCGIData.WFUserJson=JSON.stringify(this.approvalPersonJSON.data);
    //console.log(JSON.stringify(this.approvalPersonJSON));
  }

  //将表单字段赋值到请求字段
  saveFormatRes() {
    this.saveFormatCommitTypesJSON(); //如果存在多个审批类型，则将数据转为JSON格式，存入请求参数
    this.saveFormatFileUpload(); //将附件列表存入请求参数
    this.commitmentData.WFStatus = "草稿";
    this.DCGIData.CommitmentApply = this.commitmentData; //将表单字段存入请求参数
  }

  //暂存接口调用
  tempSaveInterface() {
    this.DCGPromiseService.tempSave(this.DCGIData).then(data => {
      if (data.Result) {
        this.windowService
          .alert({ message: "保存成功", type: "success" })
          .subscribe(() => {
            localStorage.setItem("DCGPromised", "tempSave"); //写入localstorage，用来确认是否触发列表的刷新
            //window.close();
            this.cancle();
          });
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
      //console.log(data);
    });
  }

  //提交
  submitSaveInterface(){
    this.DCGPromiseService.onSubmit(this.DCGIData).then(data=>{
       if(data.Result){
         this.windowService.alert({message:"提交成功",type:"success"}).subscribe(data=>{
           //window.close();
           this.cancle();
           localStorage.setItem("DCGPromised", "submit"); //写入localstorage，用来确认是否触发列表的刷新
         });
       }else{
         this.windowService.alert({message:data.Message,type:"fail"});
         return;
       }
    });
  }

  /**
   * END
   */

  //取消
  cancle() {
    window.opener=null;
    window.open('','_self');
    window.close();
  }

  /**
   * 附件上传 *START*
   */

  //上传附件成功的回调函数
  fileUploadSuccess(e) {
    if (e.Result) {
      this.accessoryList = JSON.parse(e.Data)[0];
      this.filelUpLoadList.push(this.accessoryList);
      console.log(this.filelUpLoadList);
    } else {
      this.windowService.alert({ message: e.Message, type: "fail" });
    }
  }

  //删除上传附件的回调函数
  deleteUploadFile(e) {
    console.log(this.filelUpLoadList.length);
    if (
      this.filelUpLoadList.length !== 0 &&
      this.alreadyfilelUpLoadList.length !== 0
    ) {
      this.filelUpLoadList.splice(
        Math.abs(e - this.alreadyfilelUpLoadList.length),
        1
      );
    } else if (
      this.filelUpLoadList.length !== 0 &&
      this.alreadyfilelUpLoadList.length === 0
    ) {
      this.filelUpLoadList.splice(e, 1);
    }
  }
  /**
   * END
   */

   //获取审批历史记录
  getApprovalHistroyAndView(){

    this.DCGPromiseService.getApprovalHistroyAndView({ApplyID:this.commitmentData.ApplyID}).then(data=>{
      
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory;//保存审批历史记录
        //this.wfviewData=[{IsAlready:true,IsShow:true,NodeName:"申请人"},...JSON.parse(data.Data).wfProgress];
      }

    });
  }

}
