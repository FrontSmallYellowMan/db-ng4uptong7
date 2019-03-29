import { Component, OnInit, ViewChild } from "@angular/core";
import { WindowService } from "../../../../../../app/core";
import { Observable } from "rxjs/Observable";
import {
  dbomsPath,
  environment
} from "../../../../../../environments/environment";
import { Person } from "../../../../../../app/shared/services/index";
import { ActivatedRoute } from "@angular/router";
import { NgForm, FormGroup, FormBuilder, Validators } from "@angular/forms";

import {
  HUAWEIFormData,
  HUAWEIPrommisedService,
  CommitmentApplyData,
  AttachmentList,
  CommitmentTypeDetailedList
} from "../../../services/HUAWEIPromised.service";
import { RequiredTypeComponent } from "./edit_HUAWEI-promised-requiredType.component";

import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../../shared/services/recordalloweditstate.service";


import * as moment from "moment";

declare var window;

@Component({
  selector: "edit-huawei-newcreatepromised",
  templateUrl: "edit-HUAWEI-promised-newCreatePromised.component.html",
  styleUrls: [
    "edit-HUAWEI-promised-newCreatePromised.component.scss",
    "../../../scss/promised.component.scss"
  ]
})
export class EditHUAWEINewCreatePromisedComponent implements OnInit {
  /**
   * 实力化参数
   */
  HUAWEIform: FormGroup; // 初始化formGroup
  HUAWEIData: HUAWEIFormData = new HUAWEIFormData(); // 实例化请求参数对象
  commitmentData: CommitmentApplyData = new CommitmentApplyData(); //实例化表单对象
  attachmentList: AttachmentList = new AttachmentList(); //实例化上传附件对象
  commitmentTypeDetailedList: CommitmentTypeDetailedList = new CommitmentTypeDetailedList(); //实例化承诺类型子类型对象
  requiredTypeComponent = new RequiredTypeComponent(); //实例化必填项及对应承诺类型的提示文字
  userInfo = new Person(); // 登录人头像
  recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();

  /**
   * 声明变量
   */
  pageTitle: string = "新建华为承诺"; // 页面标题
  promisedSalesPerson: any; // 绑定的承诺销售员信息
  listCommitmentType: any[] = []; //承诺类型列表
  listPlatform: any[] = []; //平台列表
  applyPersonBusiness:string;//保存申请人的事业部，用于保存时，没有选择承诺销售员时，自动赋值

  requiredTypeForm: any; //保存表单的必填类型
  isMorePromisedTypeList: boolean; //是否需要选择承诺类型下的子类型，当承诺类型的code=’0001‘||’0002‘||’0008‘时，该值为true

  upFileApiLink: string = environment.server + "CommitmentHW/UploadAccessories"; //用来保存上传附件的接口地址
  accessoryList: any; //附件对象
  alreadyfilelUpLoadList: any[] = []; // 用来保存上传过的附件列表
  filelUpLoadList: any[] = []; //用来保存新上传的附件列表

  isSubmit: boolean = false; //是否点击了提交按钮
  nowDate = new Date(); //获取当前时间

  _SYBApprove1: any[] = []; //绑定的一级审批人
  _SYBApprove2: any[] = []; //绑定的二级审批人
  _SYBApprove3: any[] = []; //绑定的三级审批人
  _SYBApprove4: any[] = []; //绑定的四级审批人
  _SYBApprove5: any[] = []; //绑定的五级审批人

  HUAWEIPlaceholder: string = "-请填写承诺类型"; //承诺类型提示文字
  wfHistory: any = []; //保存审批历史记录
  promisedType: any = null; //临时数据，选择的承诺类型


  constructor(
    private windowService: WindowService,
    private HUAWEIPrommisedService: HUAWEIPrommisedService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private recordAllowEditStateService:RecordAllowEditStateService
  ) {}

  ngOnInit() {
    this.getPromisedTypeAndPlayForm(); //获取平台列表和承诺类型列表
    this.getPerson(); // 获取登录人的信息
    this.getRouterPromise(); //获取路由参数
    this.creatForm(); // 创建新表单表单
    this.watchFormValueChange();
  }

  //获取路由参数
  getRouterPromise() {
    this.activatedRoute.paramMap.subscribe(data => {
      if (data.get("id") !== "0") {
        this.commitmentData.ApplyID = data.get("id");

        this.recordAllowEditStateQuery.FunctionCode='71';//请求查询的模块代码
      this.recordAllowEditStateQuery.RecordID=this.commitmentData.ApplyID;//页面的主键ID
      this.recordAllowEditStateQuery.NotAllowEditLink=`promised/edit-huawei-newcreatepromised/a${this.commitmentData.ApplyID}`;
      this.recordAllowEditStateQuery.NotFoundRecordLink=`promised/HUAWEI-myApply/a`;
      this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

        this.getDetail(this.commitmentData.ApplyID); //获取详情
        this.getApprHistoryAndProgress(this.commitmentData.ApplyID);//获取审批历史记录
      }
    });
  }

  //获得详情
  getDetail(ApplyID) {
    this.HUAWEIPrommisedService.getDetail({ ApplyID: ApplyID }).then(data => {
      console.log(JSON.parse(data.Data));

      //保存详情数据
      this.HUAWEIData = JSON.parse(data.Data);

      //保存详情里的表单字段
      this.commitmentData = this.HUAWEIData.CommitmentApply;

      //将关联销售员存入绑定字段，将申请人存入对应字段
      this.getRelevancePerson();

      //保存详情里的附件列表
      this.getDetailFileUpload();

      //保存详情里审批人
      this._SYBApprove1 = this.commitmentData.SYBApprove1
        ? JSON.parse(this.commitmentData.SYBApprove1)
        : [];
      this._SYBApprove2 = this.commitmentData.SYBApprove2
        ? JSON.parse(this.commitmentData.SYBApprove2)
        : [];
      this._SYBApprove3 = this.commitmentData.SYBApprove3
        ? JSON.parse(this.commitmentData.SYBApprove3)
        : [];
      this._SYBApprove4 = this.commitmentData.SYBApprove4
        ? JSON.parse(this.commitmentData.SYBApprove4)
        : [];
      this._SYBApprove5 = this.commitmentData.SYBApprove5
        ? JSON.parse(this.commitmentData.SYBApprove5)
        : [];

      this.promisedTypeChange(this.commitmentData.CommitTypeCode); //根据承诺类型，获取表单验证规则

      this.creatForm(); //创建表单
      this.watchFormValueChange(); //监听表单值得变化
    });
  }

  //获得详情页的附件列表
  getDetailFileUpload() {
    //console.log(this.currencyAndCode);
    //如果存在已上传的附件列表
    if (this.HUAWEIData.AttachmentList.length > 0) {
      this.alreadyfilelUpLoadList = JSON.parse(
        JSON.stringify(this.HUAWEIData.AttachmentList)
      ); //将已上传的附件列表存入新的变量中
      this.HUAWEIData.AttachmentList = []; //将原来保存上传列表的字段清空，以备再次提交时保存上传附件列表
      this.alreadyfilelUpLoadList.forEach(item => {
        //遍历新保存的已上传附件列表字段，添加name属性，用来附件上传组件显示名称
        item["name"] = item.AccessoryName;
      });
      //console.log(this.materielChangeData.AccessoryList);
    }
  }

//如果详情里存在承诺子类型列表，则将列表中的数据赋值到对应的绑定数据
getDetailPromisedTypeList(){
  if(this.HUAWEIData.CommitmentTypeDetailedList.length>0&&this.commitmentData.CommitTypeCode){

    //将列表中状态为“是”的isChecked字段，修改为true，表示被勾选
    this.HUAWEIData.CommitmentTypeDetailedList.forEach(el=>el.isChecked=el.IsCommit==='是'?true:false);

    //过滤出对应的承诺子类型，将详情里的自承诺列表赋值到对应字段
    this.requiredTypeComponent.morePromisedTypeList.
    filter(item=>item.code===this.commitmentData.CommitTypeCode)[0].list
    =this.HUAWEIData.CommitmentTypeDetailedList;


    // switch(this.commitmentData.CommitTypeCode){
    //   case '0001':
    //     this.requiredTypeComponent.morePromisedTypeList[0].list=this.HUAWEIData.CommitmentTypeDetailedList;     
    //     break;
    //   case '0002':
    //     this.requiredTypeComponent.morePromisedTypeList[1].list=this.HUAWEIData.CommitmentTypeDetailedList;
    //     break;
    //   case '0008':
    //     this.requiredTypeComponent.morePromisedTypeList[2].list=this.HUAWEIData.CommitmentTypeDetailedList;
    //     break;
    //   default:
    //     break;
    // }
  }
}

  //将详情里的关联销售员itcode和name合并为视图绑定字段
  getRelevancePerson() {
    if (!this.commitmentData.SalesITCode) return;
    this.promisedSalesPerson = [
      {
        userEN: this.commitmentData.SalesITCode,
        userCN: this.commitmentData.SalesName,
        userID: this.commitmentData.SalesITCode
      }
    ];

    this.userInfo["userID"] = this.commitmentData.DaiITCODE;
    this.userInfo["userEN"] = this.commitmentData.DaiITCODE.toLocaleLowerCase();
    this.userInfo["userCN"] = this.commitmentData.DaiName;

  }



  //创建表单
  creatForm() {
    this.HUAWEIform = this.fb.group({
      PlatformID: [this.commitmentData.PlatformID || "", Validators.required], //平台ID
      AgentName: [this.commitmentData.AgentName || ""], //代理商名称
      ContractID: [this.commitmentData.ContractID || ""], //合同编号
      ContractMoney: [this.commitmentData.ContractMoney || ""], //合同金额
      ContractName: [this.commitmentData.ContractName || ""], //项目名称
      Ycode: [this.commitmentData.Ycode || ""], //10Y号
      ProductLline: [this.commitmentData.ProductLline || ""], //产品线
      Accountterm: [this.commitmentData.Accountterm || ""], //账期条件
      Fksfqrdd: [this.commitmentData.Fksfqrdd || ""], //付款是否确认
      CommitTypeCode: [
        this.commitmentData.CommitTypeCode || "",
        Validators.required
      ], //承诺类型代码
      CommitDate: [this.commitmentData.CommitDate || "", Validators.required], //承诺日期
      ReachDate: [this.commitmentData.ReachDate || ""], //销售员承诺达成时间
      CommitMatters: [
        this.commitmentData.CommitMatters || "",
        Validators.required
      ] //承诺内容
    });
  }

  //监听表单值的变化
  watchFormValueChange() {
    //监听承诺类型的变化
    this.HUAWEIform.get("CommitTypeCode").valueChanges.subscribe(data => {
      //根据承诺类型值得变化，所需进行的操作
      this.promisedTypeChange(data); 
      
    });

    //根据平台的变化，保存平台名称
    this.HUAWEIform.get('PlatformID').valueChanges.subscribe(data=>{
      this.listPlatform.forEach(el=>{
        if(el.platformcode===data) this.commitmentData.PlatformName=el.platform;
      });
    });
  }

  //根据承诺类型值得变化，所需进行的操作
  promisedTypeChange(data) {

    if(!data) return;

    //将对应承诺类型的表单必填项验证，承诺原因提示文字存入此参数，用于后续的验证
    this.requiredTypeForm = this.requiredTypeComponent.requiredTypeList.filter(
      item => item.Code === data)[0];
      
      /**
       * 因为根据必填项的不同，会动态的删除视图上的“付款是否确认”表单项，此时需要触发angluar的表单更新
       */
      this.HUAWEIform.get('Fksfqrdd').setValidators(this.requiredTypeForm.isFksfqrdd?Validators.required:null);
      this.HUAWEIform.get('Fksfqrdd').updateValueAndValidity();
      //this.HUAWEIform.updateValueAndValidity();
      
    //将对应承诺类型的最长承诺天数存入
    this.listCommitmentType.forEach(element => {
      if (element.CommitTypeCode === data)
        this.requiredTypeForm.LongestCommitTime = element.LongestCommitTime;
    });

    //当承诺类型发生变化时，验证是否需要选择子类型
    if (data === "0001" || data === "0002" || data === "0008") {
      this.isMorePromisedTypeList = true;
    } else {
      this.isMorePromisedTypeList = false;
    }

    //如果详情里存在承诺子类型列表，则将列表中的数据赋值到对应的绑定数据
    this.getDetailPromisedTypeList();

    //如果承诺日期存在
    if (this.commitmentData.CommitDate) {
      //判断承诺日期是否符合承诺类型的的最大承诺天数
      this.alertPromisedDate(this.commitmentData.CommitDate);
    }
  }

  //获取人员基本信息
  getPerson() {
    const user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {
      // 获取登录人头像信息
      this.userInfo["userID"] = user["ITCode"];
      this.userInfo["userEN"] = this.commitmentData.DaiITCODE = user[
        "ITCode"
      ].toLocaleLowerCase();
      this.userInfo["userCN"] = this.commitmentData.DaiName =
        user["UserName"];
    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }

    this.HUAWEIPrommisedService.getPersonInformation().then(data=>{
      if(data.Result){
        this.applyPersonBusiness=JSON.parse(data.Data).YWFWMC;
      }
    });

  }

  //获取平台和承诺类型列表
  getPromisedTypeAndPlayForm() {
    this.HUAWEIPrommisedService.getBasicDate("").then(data => {
      if (data.Result) {
        let basicData = JSON.parse(data.Data); //平台和承诺类型列表
        const insertLine = [
          {
            CommitTypeCode: "",
            CommitTypeName: "------------------",
            GroupName: ""
          }
        ]; //要插入的参数

        this.listPlatform = basicData.ListPlatform; //平台列表
        this.listCommitmentType = basicData.ListCommitmentType; //承诺类型列表

        //在列表中不同的分类中间，加入分割线，并合并到原数组
        this.listCommitmentType = [
          ...this.listCommitmentType.filter(item => item.GroupName === "A"),
          ...insertLine,
          ...this.listCommitmentType.filter(item => item.GroupName === "B"),
          ...insertLine,
          ...this.listCommitmentType.filter(item => item.GroupName === "C")
        ];
        console.log(this.listCommitmentType);
      }
    });
  }

  //获取申请ID
  getApplyId() {
    this.HUAWEIPrommisedService.getNewApplyId("").then(data => {
      if (data.Result) {
        this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //保存申请ID
      }
    });
  }

  //获取承诺销售员
  getSelePerson(e) {
    if(e.length===0) {
      this.commitmentData.SalesDeparment="";//清空事业部
      this.commitmentData.SalesName="";//清空销售名称
      this.commitmentData.SalesITCode="";//清空销售员itcode
      return;
    };
    console.log(e);
    this.commitmentData.SalesName = e[0].name; //获取销售员姓名
    this.commitmentData.SalesITCode = e[0].itcode; //获取销售员ItCode
    this.commitmentData.SalesDeparment = e[0].exf9; //获取事业部
  }

  //获取各节点审批人
  getApprovalPerson(e, type) {
    switch (type) {
      case 1:
        if (e.length !== 0) {
          this.commitmentData.SYBApprove1 = JSON.stringify([
            { userEN: e[0].userEN, userCN: e[0].userCN, userID: e[0].userEN }
          ]);
        } else {
          this.commitmentData.SYBApprove1 = "";
        }
        break;
      case 2:
        if (e.length !== 0) {
          this.commitmentData.SYBApprove2 = JSON.stringify([
            { userEN: e[0].userEN, userCN: e[0].userCN, userID: e[0].userEN }
          ]);
        } else {
          this.commitmentData.SYBApprove2 = "";
        }
        break;
      case 3:
        if (e.length !== 0) {
          this.commitmentData.SYBApprove3 = JSON.stringify([
            { userEN: e[0].userEN, userCN: e[0].userCN, userID: e[0].userEN }
          ]);
        } else {
          this.commitmentData.SYBApprove3 = "";
        }
        break;
      case 4:
        if (e.length !== 0) {
          this.commitmentData.SYBApprove4 = JSON.stringify([
            { userEN: e[0].userEN, userCN: e[0].userCN, userID: e[0].userEN }
          ]);
        } else {
          this.commitmentData.SYBApprove4 = "";
        }
        break;
      case 5:
        if (e.length !== 0) {
          this.commitmentData.SYBApprove5 = JSON.stringify([
            { userEN: e[0].userEN, userCN: e[0].userCN, userID: e[0].userEN }
          ]);
        } else {
          this.commitmentData.SYBApprove5 = "";
        }
        break;
      default:
        break;
    }
    console.log(this.commitmentData);
  }

  //选择日期后监测承诺类型，看是否超期
  alertPromisedDate(date) {
    //console.log(this.listCommitmentType);
    if (!this.HUAWEIform.get("CommitTypeCode").value) return;
    let nowDate = moment(moment().format("YYYY-MM-DD")); //获取当前时间的毫秒数
    let selectCommitDate = moment(date); //获取承诺日期的毫秒数
    let timeDifference = selectCommitDate.diff(nowDate, "days"); //毫秒差转换为天数

    if (
      this.requiredTypeForm.LongestCommitTime > 0 &&
      timeDifference > this.requiredTypeForm.LongestCommitTime
    ) {
      //如果选择日期与当前日期之差的天数大于最大承诺日期
      this.windowService
        .alert({
          message: `所选承诺日期大于最长承诺日期，最长承诺日期为${
            this.requiredTypeForm.LongestCommitTime
          }天`,
          type: "fail"
        })
        .subscribe(() => {
          this.HUAWEIform.get("CommitDate").patchValue("");
        });
    }
  }

  //获取子承诺类型列表
  getPromisedTypeList() {
    if (this.isMorePromisedTypeList) {
      //过滤出所选承诺类型的子类型
      this.HUAWEIData.CommitmentTypeDetailedList = this.requiredTypeComponent.morePromisedTypeList.filter(
        item => item.code === this.HUAWEIform.get("CommitTypeCode").value
      )[0].list;

      //改变已勾选的子承诺类型的状态
      this.HUAWEIData.CommitmentTypeDetailedList.forEach(element => {
        element.IsCommit = element.isChecked ? "是" : "否";
        element.ApplyID=this.commitmentData.ApplyID;
      });

      console.log(this.HUAWEIData.CommitmentTypeDetailedList);
    }else{
      this.HUAWEIData.CommitmentTypeDetailedList=[];
    }
  }

  //暂存时，如果没有选择承诺销售员，则将申请人赋值到承诺销售员字段
  noSelectSalePerson() {
    if (!this.commitmentData.SalesITCode) {
      this.commitmentData.SalesITCode = this.commitmentData.DaiITCODE;
      this.commitmentData.SalesName = this.commitmentData.DaiName;
      this.commitmentData.SalesDeparment=this.applyPersonBusiness;
    }
  }

  //在提交时，验证必选审批人是否选择
  isSelectApprovalPerson(): boolean {
    if (!this.requiredTypeForm) return true;
    let isApprovalPersonVaild: boolean; //审批人是否符合要求
    if (
      (this.requiredTypeForm.isSYBApprove1 &&
        !this.commitmentData.SYBApprove1) ||
      (this.requiredTypeForm.isSYBApprove2 &&
        !this.commitmentData.SYBApprove2) ||
      (this.requiredTypeForm.isSYBApprove3 &&
        !this.commitmentData.SYBApprove3) ||
      (this.requiredTypeForm.isSYBApprove4 &&
        !this.commitmentData.SYBApprove4) ||
      (this.requiredTypeForm.isSYBApprove5 && !this.commitmentData.SYBApprove5)
    ) {
      isApprovalPersonVaild = false;
      this.windowService.alert({ message: "请选择对应审批人", type: "fail" });
    } else {
      isApprovalPersonVaild = true;
    }
    return isApprovalPersonVaild;
  }

  //生成审批信息字符串
  getApprovalPersonJSON() {
    //审批人
    this.requiredTypeComponent.approvalPersonJSON[0].UserSettings =
      this._SYBApprove1.length > 0
        ? `[{'ITCode':'${this._SYBApprove1[0].userEN}','UserName':'${
            this._SYBApprove1[0].userCN
          }'}]`
        : [];
    this.requiredTypeComponent.approvalPersonJSON[1].UserSettings =
      this._SYBApprove2.length > 0
        ? `[{'ITCode':'${this._SYBApprove2[0].userEN}','UserName':'${
            this._SYBApprove2[0].userCN
          }'}]`
        : [];
    this.requiredTypeComponent.approvalPersonJSON[2].UserSettings =
      this._SYBApprove3.length > 0
        ? `[{'ITCode':'${this._SYBApprove3[0].userEN}','UserName':'${
            this._SYBApprove3[0].userCN
          }'}]`
        : [];
    this.requiredTypeComponent.approvalPersonJSON[3].UserSettings =
      this._SYBApprove4.length > 0
        ? `[{'ITCode':'${this._SYBApprove4[0].userEN}','UserName':'${
            this._SYBApprove4[0].userCN
          }'}]`
        : [];
    this.requiredTypeComponent.approvalPersonJSON[4].UserSettings =
      this._SYBApprove5.length > 0
        ? `[{'ITCode':'${this._SYBApprove5[0].userEN}','UserName':'${
            this._SYBApprove5[0].userCN
          }'}]`
        : [];

    //审批节点是否打开
    this.requiredTypeComponent.approvalPersonJSON[0].IsOpened =
      this._SYBApprove1.length > 0 ? "1" : "0";
    this.requiredTypeComponent.approvalPersonJSON[1].IsOpened =
      this._SYBApprove2.length > 0 ? "1" : "0";
    this.requiredTypeComponent.approvalPersonJSON[2].IsOpened =
      this._SYBApprove3.length > 0 ? "1" : "0";
    this.requiredTypeComponent.approvalPersonJSON[3].IsOpened =
      this._SYBApprove4.length > 0 ? "1" : "0";
    this.requiredTypeComponent.approvalPersonJSON[4].IsOpened =
      this._SYBApprove5.length > 0 ? "1" : "0";

    this.HUAWEIData.WFUserJson = JSON.stringify(
      this.requiredTypeComponent.approvalPersonJSON
    );
    console.log(JSON.stringify(this.HUAWEIData));
  }

  //格式化请求字段
  formatReqData() {
    this.getPromisedTypeList(); //获取子承诺类型列表
    this.saveFormatFileUpload(); //将附件存入请求字段
  }

  // 暂存
  save() {
    //格式化请求字段
    this.formatReqData();

    //如果没有选择承诺销售员，则获取申请人的信息到承诺销售员字段，以便在搜索列表查找
    this.noSelectSalePerson();

    //如果申请编号不存在
    if (!this.commitmentData.ApplyID) {
      //获取申请编号
      this.HUAWEIPrommisedService.getNewApplyId("").then(data => {
        if (data.Result) {
          this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //保存申请ID
          this.getPromisedTypeList();//将applyId存入
          //暂存接口调用
          this.saveInterface();
        }
      });
    } else {
      //暂存接口调用
      this.saveInterface();
    }

    console.log(this.HUAWEIData);
  }

  //暂存接口调用
  saveInterface() {

    console.log(this.commitmentData);

    //合并表单数据和请求字段
    this.HUAWEIData.CommitmentApply = Object.assign(
      {},
      this.commitmentData,
      this.HUAWEIform.value
    );

    this.HUAWEIPrommisedService.tempSave(this.HUAWEIData).then(data => {
      if (data.Result) {
        this.windowService
          .alert({ message: "保存成功", type: "success" })
          .subscribe(() => {
            localStorage.setItem("HUAWEIPromised", "save"); //写入localstorage，用来确认是否触发列表的刷新
            //window.close();
            this.cancle();
          });
      } else {
        this.windowService.alert({ message: data.Message, type: "fail" });
        return;
      }
    });
  }

  // 提交
  onSubmit() {
    this.isSubmit = true;

    //格式化请求字段
    this.formatReqData();

    //在提交时验证存在子承诺类型的，是否已勾选至少一条
    if (
      this.isMorePromisedTypeList &&
      !this.HUAWEIData.CommitmentTypeDetailedList.some(item => item.isChecked)
    ) {
      this.windowService.alert({ message: "请勾选承诺类型", type: "fail" });
      return;
    }

    //在提交时，验证必选审批人是否选择
    if (!this.isSelectApprovalPerson()) return;

    //在提交时，验证是否上传附件
    if (
      (this.requiredTypeForm ? this.requiredTypeForm.isfileUpLoad : false) &&
      this.HUAWEIData.AttachmentList.length === 0
    ) {
      this.windowService.alert({ message: "请上传附件", type: "fail" });
      return;
    }

    if (this.HUAWEIform.invalid) {
      this.windowService.alert({
        message: "表单填写有误，请检查后重新提交",
        type: "fail"
      });
      return;
    } else {
      //获取审批字符串
      this.getApprovalPersonJSON();

      //如果没有选择承诺销售员，则获取申请人的信息到承诺销售员字段，以便在搜索列表查找
      this.noSelectSalePerson();
     
      if (!this.commitmentData.ApplyID) {//如果不存在ApplyID，则请求接口获取ApplyID
        //获取申请编号
        this.HUAWEIPrommisedService.getNewApplyId("").then(data => {
          if (data.Result) {
            this.commitmentData.ApplyID = JSON.parse(data.Data).ApplyID; //保存申请ID
            this.getPromisedTypeList();//将applyId存入承诺子类型列表
            //提交接口调用
            this.submitInterface();
          }
        });
      }else{
        //提交接口调用
        this.submitInterface();
      }
    
    }
  }

  //提交接口调用
  submitInterface(){
    //合并表单数据和请求字段
    this.HUAWEIData.CommitmentApply = Object.assign({},this.commitmentData,this.HUAWEIform.value);
    this.HUAWEIPrommisedService.onSubmit(this.HUAWEIData).then(data=>{
      if(data.Result){
         this.windowService.alert({message:"提交成功",type:"success"}).subscribe(()=>{
           //window.close();
           this.cancle();
           localStorage.setItem("HUAWEIPromised", "submit"); //写入localstorage，用来确认是否触发列表的刷新           
         });
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    });
    

  }


  //取消
  cancle() {
    window.opener=null;
    window.open('','_self');
    window.close();
  }

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
    //console.log(this.filelUpLoadList.length);
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
    // console.log(e);
    // console.log(this.filelUpLoadList);
  }

  //将附件列表存入请求参数
  saveFormatFileUpload() {
    this.HUAWEIData.AttachmentList = [
      ...this.alreadyfilelUpLoadList,
      ...this.filelUpLoadList
    ]; //合并上传附件数组
  }

   //获取审批历史记录
  getApprHistoryAndProgress(ApplyID){
    this.HUAWEIPrommisedService.getApprHistoryAndProgress({'ApplyID':ApplyID}).then(data=>{
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory;
      }
    });
  }

}
