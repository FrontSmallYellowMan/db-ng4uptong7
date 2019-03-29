import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplyData, BaseDataSource, Invoice, Material, MaterialList, AccessItem,ApproveUsers } from "../../datamodel/redapply";
import { RedApplyService } from "../../service/ri-red.service";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { InvoiceQueryResultComponent } from "../invoice-query-result/invoice-query-result.component";
import { PageRefresh } from "../../../india/service/pagerefresh.service";
import { RecordAllowEditStateService, RecordAllowEditStateQuery, RecordState } from "../../../../shared/services/recordalloweditstate.service";
import { dbomsPath } from "../../../../../environments/environment";
import { MultiApproverSelectComponent } from '../multi-approver-select/multi-approver-select.component';
declare var window: any;
declare var $: any;

@Component({
  selector: 'db-red-apply',
  templateUrl: './red-apply.component.html',
  styleUrls: ['./red-apply.component.scss']
})
export class RedApplyComponent implements OnInit {

  constructor(
    private pageRef: PageRefresh,
    private recordAllowEditStateService: RecordAllowEditStateService,
    private redApplyService: RedApplyService,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService
    ) { }

  @ViewChild('redApplyForm') applyForm: NgForm;
  @ViewChild(NgForm) redApplyForm;//表单
  modal: XcModalRef;//模态窗
  appmodal: XcModalRef;//模态窗
  applyData: ApplyData = new ApplyData();//表单数据模型
  baseDataSource: BaseDataSource = new BaseDataSource();//下拉框数据源
  childrenRedtypes: Array<any> = [];//冲红小类数据源
  selectedChildrenRevisetype: Array<any> = [];//页面选中冲红小类
  wfHistory: any = null;//审批历史数据
  applyId: any = "";//申请id
  taskID: any = "";//审批任务id
  nodeID: any = "";//审批节点id
  selectedBiz: any = {};//业务范围选中项
  selectedCompany: any = {};//公司选中项
  isAllowEditCustomerCode: boolean = false;//冲红后 客户编号是否可编辑
  materialType: number = 3;//冲退明细类型 0-价格更改 1-物料号 2-冲成本 3-其他
  materialList: MaterialList[] = [];//冲退明细组件数据源
  uploadAccesslUrl:any = this.redApplyService.uploadAccesslUrl//附件上传地址
  hasUploadedFiles: any[] = [];//附件信息数据源 组件：{name: "a.txt", size: 52428800}
  isSaving: boolean = false;//页面数据是否保存中 防止按钮重复点击
  isSubmited: boolean = false;//流程提交按钮
  loading: any = false;
  isrezty: boolean = false;//是否rezty 默认 不是rezty
  isreztychange = 1;//变化次数
  approverUsersInfo = [];//审批人信息
  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(InvoiceQueryResultComponent);
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onInvoiceResultModalHide);
    
    //在初始化的时候 创建模型
    this.appmodal = this.xcModalService.createModal(MultiApproverSelectComponent);
    //模态窗口关闭时
    this.appmodal.onHide().subscribe(this.onApproverSelectModalHide);
    this.applyId = this.routerInfo.snapshot.queryParams['recordid'] || this.routerInfo.snapshot.queryParams['applyid'];
    this.taskID = this.routerInfo.snapshot.queryParams['taskid'];
    this.nodeID = this.routerInfo.snapshot.queryParams['nodeid'];
    //1、根据申请id 区分新建和编辑 接口请求是否发送
    if (!this.applyId) {//新建
      this.getUserInfo();
    }
    if (this.applyId) {
      let recordAllowEditStateQuery = new RecordAllowEditStateQuery();
      recordAllowEditStateQuery.FunctionCode = RecordState.reinvoiceRed;
      recordAllowEditStateQuery.RecordID = this.applyId;
      recordAllowEditStateQuery.NotAllowEditLink = "/reinvoice/red-approve?applyid=" + this.applyId;
      recordAllowEditStateQuery.NotFoundRecordLink = "reinvoice/ri-list";
      this.recordAllowEditStateService.getRecordAllowEditState(recordAllowEditStateQuery,()=>{
        this.getBaseDataSource();
      });
    }else{
      this.getBaseDataSource();
    }
  }
  
/**接口请求 begin */
  //根据ItCode获取人员相关信息 初始化基本信息
  getUserInfo() {
    this.redApplyService.getUserInfo().subscribe(
      data => {
        if (data.Result) {
          let userInfo = JSON.parse(data.Data);
          if (userInfo["ITCode"]) {
            this.applyData.apply.costcenter = userInfo["CostCenter"];
            this.applyData.apply.platformcode = userInfo["FlatCode"];
            this.applyData.apply.platform = userInfo["FlatName"];
            this.applyData.apply.companycode = userInfo["CompanyCode"];
            this.applyData.apply.company = userInfo["CompanyName"];
            this.applyData.apply.bizcode = userInfo["YWFWDM"];
            this.applyData.apply.proposer = userInfo["UserName"];
            this.applyData.apply.ITCode = userInfo["ITCode"];
            this.selectedBiz["bizcode"] = userInfo["YWFWDM"];
            this.selectedCompany["companycode"] = userInfo["CompanyCode"];
          }
        }else{
          this.windowService.alert({ message: data.Message, type: "warn" });
        }
      });
    this.redApplyService.getUserPhone().subscribe(
      data => {
        if (data.Result) {
          this.applyData.apply.phone = JSON.parse(data.Data);
        }
      });
  }
  //获取下拉框数据源
  getBaseDataSource(){
    this.redApplyService.getBaseDataList().subscribe(
      data => {
        if (data.Result) {
          this.baseDataSource = JSON.parse(data.Data);
          if (!this.applyId) {//新建
            //公司特殊处理
            let companyList = this.baseDataSource.companys;
            let companycode = this.selectedCompany["companycode"];
            this.selectedCompany = companyList.filter(item => {
              return item["companycode"] === companycode;
            })[0];
            this.applyData.apply.company = this.selectedCompany["company"];
            //业务范围特殊处理
            let bizList = this.baseDataSource.businesses;
            let bizcode = this.selectedBiz["bizcode"] || JSON.parse(window.localStorage.getItem("UserInfo"))["YWFWDM"];
            this.selectedBiz = bizList.filter(item => {
              return item["bizcode"] === bizcode;
            })[0];
            this.applyData.apply.biz = this.selectedBiz["biz"];
          } else {//编辑
            this.getApplyDataByApplyId(this.applyId);
          }
        }
      }
    );
  }
  //根据ApplyId获取页面申请数据
  getApplyDataByApplyId(applyid) {
    this.loading = true;
    this.redApplyService.getApplyDataById(applyid).subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          this.applyData = JSON.parse(data.Data);
          //初始化公司
          this.selectedCompany = {
            companycode: this.applyData.apply.companycode,
            company: this.applyData.apply.company
          };
          //初始化业务范围
          this.selectedBiz = {
            bizcode: this.applyData.apply.bizcode,
            biz: this.applyData.apply.biz
          };
          //初始化冲红小类
          //  小类数据源
          this.getChildrenRedtypes(this.applyData.apply.revisetypecode);
          //  已选择小类
          let tempArray = JSON.parse(this.applyData.apply.subrevisetype);
          if (tempArray.length > 0) {
            tempArray.forEach(ele => {
              this.selectedChildrenRevisetype.push({ revisetypecode: ele["subtypecode"], revisetype: ele["subtype"] });
            });
          }
          //  初始化选中状态
          let isCheckBox = this.applyData.apply.revisetypecode == 100;
          this.childrenRedtypes.forEach(datasourceitem => {
            for (var i = 0; i < this.selectedChildrenRevisetype.length; i++) {
              let item = this.selectedChildrenRevisetype[i];
              // 选中状态
              if (datasourceitem["revisetypecode"] == item["revisetypecode"]) {
                isCheckBox ? datasourceitem["checked"] = true : datasourceitem["checked"] = "on";
                break;
              } else {
                isCheckBox ? datasourceitem["checked"] = false : datasourceitem["checked"] = "off";
              }
            }
          });
          //问题： 如果小类单选情况，如果之前选择的第一个radio，通过on/off初始化选中状态时失败
          //解决方案： 通过jQuery手动添加选中样式
          setTimeout(() => {
            if (!isCheckBox) {
              let radioId = "radio" + this.selectedChildrenRevisetype[0]["revisetypecode"];
              $("#" + radioId).parent().addClass("checked");
            }
          }, 100);
          //确定冲退明细类型
          this.confirmMaterialType();
          //初始化冲退明细组件数据
          let materialData = this.applyData.material;
          let invoiceData = this.applyData.invoice;
          if (invoiceData && invoiceData.length > 0) {
            invoiceData.forEach(invoiceItem => {
              let internalinvoiceno = invoiceItem.internalinvoiceno;
              let materialList = new MaterialList();
              materialList.active = false;
              materialList.internalinvoiceno = internalinvoiceno;
              if (materialData && materialData.length > 0) {
                materialList.tableList = [].concat(materialData.filter((materialItem) => {
                  return materialItem.internalinvoiceno == internalinvoiceno && materialItem.groupno == 0;
                }));
                if (materialList.tableList.length > 0) {
                  materialList.tableList.forEach(item => {
                    //初始化总计金额
                    materialList.originalMoneyTotalAmount += item.originalmoney;
                    materialList.moneyTotalAmount += item.money;
                    materialList.originalBackMoneyTotalAmount += item.originalbackmoney;
                    materialList.backMoneyTotalAmount += item.backmoney;
                    let reg = /^[0-9]\d*$/;
                    let money = item.money;
                    let backmoney = item.backmoney;
                    let originalmoney = item.originalmoney;
                    let originalbackmoney = item.originalbackmoney;
                    if (String(money).search(reg) != -1) {
                      item.money = money + ".00";
                    }
                    if (String(backmoney).search(reg) != -1) {
                      item.backmoney = backmoney + ".00";
                    }
                    if (String(originalmoney).search(reg) != -1) {
                      item.originalmoney = originalmoney + ".00";
                    }
                    if (String(originalbackmoney).search(reg) != -1) {
                      item.originalbackmoney = originalbackmoney + ".00";
                    }
                  });
                }
              }
              //初始化是否超过30%
              if (this.materialType == 0 || this.materialType == 1) {
                if (materialList.moneyTotalAmount != 0) {
                  if (materialList.backMoneyTotalAmount > Number(materialList.moneyTotalAmount) * 0.3) materialList.isBeyond = true;
                }
              }
              this.materialList.push(materialList);
            });
            //重置冲退明细当前项 排他
            if (this.materialList.length > 0) {
              this.materialList.forEach(element => {
                element["active"] = false;
              });
              this.materialList[0].active = true;
            }
          }
          //初始化附件上传组件数据源
          this.applyData.accessory.forEach(item => {
            let hasUploadedFileItem = {name: "", size: 0};
            hasUploadedFileItem.name = item.AccessoryName;
            this.hasUploadedFiles.push(hasUploadedFileItem);
          });
          //当前数据是被驳回的数据 获取流程审批历史
          if(this.applyData.apply.wfstatus == "驳回"){
            this.getApproveHistory(this.applyId);
            this.getCurrentWFNode(this.applyId);
          }
          //初始化当前提交按钮是否可点击
          if(this.applyData.apply.wfstatus == "提交" || this.applyData.apply.wfstatus == "审批") {
            this.isSubmited = true;
            this.isSaving = true;
          }
          //审批人信息
          if (typeof this.applyData.apply.ApproveUsers == "string"){
            this.applyData.apply.ApproveUsers = JSON.parse(this.applyData.apply.ApproveUsers);
          }
          if (this.applyData.apply.ApproveUsers === null){
            this.applyData.apply.ApproveUsers = new ApproveUsers();
          }
          this.getApproverUsersInfo();
        }
      });
  }
  //提交申请信息（保存、提交）
  saveApply(applydata) {
    this.loading = true;
    this.redApplyService.saveApply(applydata).subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          this.isSaving = false;
          this.pageRef.setPageNeedRef();//设置列表页面刷新
          if (this.isSubmited) {
            if (this.applyData.apply.wfstatus == "驳回") {
              let body = {
                "taskid": this.taskID,
                "approveresult": "Approval",
                "nodeid": this.nodeID,
                "opinions": "重新提交"
              };
              this.approveChongHong(body);
            }else{
              this.windowService.alert({ message: "提交成功", type: "success" });
              setTimeout(() => {window.close();}, 1000);
            }
          } else {
            //针对IE浏览器 
            window.opener = null;   
            window.open('','_self');    //弹出新页面 window.open('about:Tabs','_self'); 
            window.close();
          }
        }else{
          this.isSubmited = false;
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
        //审批人信息
        if (typeof this.applyData.apply.ApproveUsers == "string"){
          this.applyData.apply.ApproveUsers = JSON.parse(this.applyData.apply.ApproveUsers);
        }
      });
  }
  //流程审批 同意
  approveChongHong(body) {
    this.loading = true;
    this.redApplyService.approveChongHong(body).subscribe(
      data => {
        this.loading = false;
        if (data.Result) {
          this.windowService.alert({ message: "提交成功", type: "success" });
          setTimeout(() => {window.close();}, 1000);
        }
        else this.windowService.alert({ message: data.Message, type: "fail" });
      });
  }
  //删除财务及冲退明细信息 所有
  delDescendantInfo() {
    if (this.applyId) {
      this.redApplyService.delDescendantInfo(this.applyId).subscribe(
        data => {
          if (data.Result) {
            this.applyData.invoice.length = 0;
            this.applyData.material.length = 0;
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }
  }
  //查询财务系统发票号票面信息  根据外部发票号
  getInvoiceByExternalNo(externalno) {
    let nomber = String(externalno).trim();
    if (nomber) {
      this.loading = true;
      this.redApplyService.getInvoiceByExternalNo(nomber).subscribe(
        data => {
          this.loading = false;
          if (data.Result) {
            this.getInvoiceCallBack(JSON.parse(data.Data));
          }else{
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }
  }
  //查询财务系统发票号票面信息  根据订单号
  getInvoiceByOrderNo(orderno) {
    let nomber = String(orderno).trim();
    if(this.applyData.apply.revisetypecode != 600 && this.selectedChildrenRevisetype.length == 0) {
      this.windowService.alert({ message: "请选择冲红类型", type: "warn" });
      return;
    }
    if (nomber) {
      this.loading = true;
      this.redApplyService.getInvoiceByOrderNo(nomber).subscribe(
        data => {
          this.loading = false;
          if (data.Result) {
            this.getInvoiceCallBack(JSON.parse(data.Data));
          }else{
            this.windowService.alert({ message: data.Message, type: "warn" });
          }
        });
    }
  }
  //查询财务信息回调函数
  getInvoiceCallBack(invoicedata){
    if(invoicedata && invoicedata.length <= 0) {
      this.windowService.alert({ message: "无查询结果，换条件试试吧！", type: "warn" });
      return;
    }
    if (invoicedata.length > 1) {//查询结果多条
      this.modal.show({data:invoicedata});//显示弹出框
    }else{//查询结果单条
      this.pushInvoice(invoicedata);
    }
  }
  //根据系统发票号查询首付基准日和清账号
  getAccountAndPayDate(params = []) {
    if (params.length>0) {
      this.redApplyService.getAccountAndPayDate(params).subscribe(
        data => {
          if (data.Result) {
            this.getAccountAndPayDateCallBack(data.Data);
          }else{
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }
  }
  //查询首付基准日和清账号回调函数
  getAccountAndPayDateCallBack(accountandpayDate){
    //将查询结果基准日和清帐号赋值给页面上的财务信息
    if (accountandpayDate && accountandpayDate.length > 0) {
      accountandpayDate.forEach(item => {
        let invoiceId = item["InternalInvoiceCode"];
        for (let index = 0; index < this.applyData.invoice.length; index++) {
          let invoiceitem = this.applyData.invoice[index];
          if (invoiceitem["internalinvoiceno"] == invoiceId) {
            invoiceitem["originalreceiptdate"] = item["ZFBDT"];//收付基准日
            invoiceitem["originalcomplexaccount"] = item["AUGBL"];//清账号
            if (item["ZFBDT"] === "00000000") {
              invoiceitem["originalreceiptdate"] = null;
            }else{
              let year = String(item["ZFBDT"]).substr(0, 4);
              let month = String(item["ZFBDT"]).substr(4, 2);
              let day = String(item["ZFBDT"]).substr(6, 2);
              invoiceitem["originalreceiptdate"] = year + "-" + month + "-" + day;
            }
            break;//跳出本次循环
          }
        }
      });
    }
  }
  //查询冲退物料明细信息
  getMaterial(params = []) {
    if (params.length>0) {
      this.loading = true;
      this.redApplyService.getMaterial(params).subscribe(
        data => {
          this.loading = false;
          if (data.Result) {
            this.getMaterialCallBack(JSON.parse(data.Data));
          }else{
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }
  }
  //查询冲退物料明细信息回调函数
  getMaterialCallBack(erpmaterialdata: any[]){
    //1构建冲退明细组件需要的数据 2将冲退明细信息保存到表单数据中
    if(erpmaterialdata && erpmaterialdata.length > 0){
      erpmaterialdata.forEach((internalInvoicenoEle, index) => {
        let materialInfo =  new MaterialList();
        materialInfo.active = false;
        materialInfo.internalinvoiceno = internalInvoicenoEle["internalinvoiceno"];
        if (this.materialType == 1) {//物料号类型  不需要接口返回物料数据
          if (materialInfo.tableList.length == 0) {
            let material = new Material();
            material["projcode"] = 10;
            material["internalinvoiceno"] = internalInvoicenoEle["internalinvoiceno"];
            materialInfo.tableList.push(material);
            // this.applyData.material.push(material);
          }
        } else {
          if (internalInvoicenoEle.material && internalInvoicenoEle.material.length > 0) {
            internalInvoicenoEle.material.forEach((element, index) => {
              let material = new Material();
              material["internalinvoiceno"] = internalInvoicenoEle["internalinvoiceno"];
              material["projcode"] = (index + 1) * 10;
              material["originalmaterialcode"] = material["materialcode"] = element["originalmaterialcode"];
              material["originaldescription"] = material["description"] = element["originaldescription"];
              material["num"] = element["num"];
              material["factory"] = element["factory"];
              material["originalstoragelocation"] = material["storagelocation"] = element["originalstoragelocation"];
              material["originalbatchno"] = material["batchno"] = element["originalbatchno"];
              material["originalmoney"] = material["money"] = Number(element["originalmoney"]).toFixed(2);
              material["originalbackmoney"] = material["backmoney"] = Number(element["originalbackmoney"]).toFixed(2);
              materialInfo.originalMoneyTotalAmount += Number(element["originalmoney"]);
              materialInfo.moneyTotalAmount += Number(element["originalmoney"]);
              materialInfo.originalBackMoneyTotalAmount += Number(element["originalbackmoney"]);
              materialInfo.backMoneyTotalAmount += Number(element["originalbackmoney"]);
              materialInfo.tableList.push(material);
              this.applyData.material.push(material);
            });
          }
        }
        this.materialList.push(materialInfo);
        this.applyData.invoice.forEach((invoiceObj, index) => {
          if (invoiceObj.internalinvoiceno == internalInvoicenoEle["internalinvoiceno"]) {
            let str = internalInvoicenoEle["PRICE_DATE"];
            let newPRICE_DATE = "";
            if (str) { 
                for(let i=0;i<str.length;i++){
                    newPRICE_DATE += str.charAt(i);
                    if(i == 3 || i == 5){
                        newPRICE_DATE += "-";
                    }
                }
            }
            this.applyData.invoice[index]["seller"] = internalInvoicenoEle["seller"];
            this.applyData.invoice[index]["sellercode"] = internalInvoicenoEle["sellercode"];
            this.applyData.invoice[index]["SALES_ORG"] = internalInvoicenoEle["SALES_ORG"];
            this.applyData.invoice[index]["DISTR_CHAN"] = internalInvoicenoEle["DISTR_CHAN"];
            this.applyData.invoice[index]["PRICE_DATE"] = newPRICE_DATE?new Date(newPRICE_DATE):null;
            this.applyData.invoice[index]["PMNTTRMS"] = internalInvoicenoEle["PMNTTRMS"];
            this.applyData.invoice[index]["SALES_OFF"] = internalInvoicenoEle["SALES_OFF"];
            this.applyData.invoice[index]["SALES_GRP"] = internalInvoicenoEle["SALES_GRP"];
            this.applyData.invoice[index]["SHIP_TYPE"] = internalInvoicenoEle["SHIP_TYPE"];
            this.applyData.invoice[index]["SDF_KUNNR"] = internalInvoicenoEle["SDF_KUNNR"];
            this.applyData.invoice[index]["SDF_NAME"] = internalInvoicenoEle["SDF_NAME"];
            this.applyData.invoice[index]["detailaddress"] = internalInvoicenoEle["detailaddress"];
            this.applyData.invoice[index]["city"] = internalInvoicenoEle["city"];
            this.applyData.invoice[index]["zipcode"] = internalInvoicenoEle["zipcode"];
            this.applyData.invoice[index]["connecter"] = internalInvoicenoEle["connecter"];
            this.applyData.invoice[index]["phone"] = internalInvoicenoEle["phone"];
            this.applyData.invoice[index]["DIVISION"] = internalInvoicenoEle["DIVISION"];
            this.applyData.invoice[index]["AUART"] = internalInvoicenoEle["AUART"];
            this.applyData.invoice[index]["ZTERM"] = internalInvoicenoEle["ZTERM"];
          }
        })
      });
    }
    //重置冲退明细当前项 排他
    if (this.materialList.length > 0) {
      this.materialList.forEach(element => {
        element["active"] = false;
      });
      this.materialList[0].active = true;
    }
  }
  //根据客户编号查询客户名称
  getCustomerName(item, i){
    let customercode = String(item['customercode']).trim();
    this.applyData.invoice[i]["customercode"] = this.applyData.invoice[i]["customercode"].trim();
    this.applyData.invoice[i]["customer"] = "";
    if (customercode && customercode.length > 5) {
      this.redApplyService.getCustomerName(customercode).subscribe(data => {
        if (data.Result && data.Data) {
          this.applyData.invoice[i]["customer"] = data.Data;
        }
      });
    }
    this.isREZTY();
  }
  //获取审批历史数据
  getApproveHistory(applyid){
    if (applyid) {
      this.redApplyService.getApproveHistory(applyid).subscribe(data => {
        if (data.Result) {
          let temp = JSON.parse(data.Data);
          if (temp["wfhistory"] && temp["wfhistory"].length > 0)
            this.wfHistory = temp["wfhistory"].reverse();
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  //驳回时，获取流程taskid和nodeid
  getCurrentWFNode(applyid){
    if (applyid) {
      this.redApplyService.getCurrentWFNode(applyid).subscribe(data => {
        if (data.Result) {
          this.taskID = JSON.parse(data.Data)["taskid"];
          this.nodeID = JSON.parse(data.Data)["nodeid"];
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
/**接口请求 end */

/**页面功能 begin */
  //财务信息模态窗关闭时事件
  onInvoiceResultModalHide = invoicedata => {
    if (invoicedata && invoicedata.length > 0) {
      this.pushInvoice(invoicedata);
    }
  }
  //将财务信息查询结果添加到表单数据中财务信息
  pushInvoice(invoicedata) {
    let getMaterialQuery = [];
    let getAccountAndPayDateQuery = [];
    let applyInvoice = this.applyData.invoice;
    invoicedata.forEach((invoiceitem, index) => {
      //1、查询结果与已有数据
      // ①不可重复 依据系统发票号
      let hasInvoiceno = false;//查询结果是否已存在财务信息
      let resultInvoiceno = invoiceitem["internalinvoiceno"];//查询结果的系统发票号
      applyInvoice.forEach(item => {
        if (item["internalinvoiceno"] == resultInvoiceno) {
          hasInvoiceno = true;
        }
      });
      if (!hasInvoiceno) {
        let tempValid = true;
        let sameCustomer = false;
        let sameCompany = invoiceitem["company"] == this.applyData.apply.companycode;
        let sameBiz = invoiceitem["busi"] == this.applyData.apply.bizcode;
        if (applyInvoice.length > 0) sameCustomer = invoiceitem["originalcustomer"].trim() == applyInvoice[0]["originalcustomer"].trim();
        if (!sameCompany) {
          tempValid = false;
          this.windowService.alert({ message: "只可提交公司" + this.applyData.apply.company + "下的发票", type: "warn" });
        }
        if (!sameBiz) {
          tempValid = false;
          this.windowService.alert({ message: "只可提交业务范围" + this.applyData.apply.biz + "下的发票", type: "warn" });
        }
        //②必须同一客户 依据客户名称
        if (tempValid && (applyInvoice.length == 0 || sameCustomer)) {
          //2、将查询结果添加到财务信息
          let invoiceObj = new Invoice();
          //原发票日期 日期格式处理
          invoiceObj["invoicedate"] = invoiceitem["invoicedate"];
          invoiceObj["originalcustomercode"] = invoiceitem["originalcustomercode"];
          invoiceObj["originalcustomer"] = invoiceitem["originalcustomer"];
          invoiceObj["orderno"] = invoiceitem["orderno"];
          invoiceObj["internalinvoiceno"] = invoiceitem["internalinvoiceno"];
          invoiceObj["externalinvoiceno"] = invoiceitem["externalinvoiceno"];
          invoiceObj["originalmoney"] = invoiceitem["originalmoney"];
          invoiceObj["deliveryno"] = invoiceitem["deliveryno"];
          invoiceObj["company"] = invoiceitem["company"];
          invoiceObj["busi"] = invoiceitem["busi"];
          invoiceObj["money"] = invoiceitem["originalmoney"];
          if (this.applyId) {
            invoiceObj["applyId"] = this.applyId;
          }
          this.applyData.invoice.push(invoiceObj);
          //3、初始化查询首付基准日、清帐号及物料明细条件
          getMaterialQuery.push({ invoiceno: resultInvoiceno, orderno: invoiceitem["orderno"] });
          getAccountAndPayDateQuery.push(resultInvoiceno);
        }else{
          if(!sameCustomer) this.windowService.alert({ message: "只可提交同一个客户下的发票", type: "warn" });
        }
      }
    });
    //4查询首付基准日、清帐号及冲退明细物料
    // 首付基准日、清帐号
    if (getAccountAndPayDateQuery.length > 0) {
      this.getAccountAndPayDate(getAccountAndPayDateQuery);
    }
    // 冲退明细物料  只有特定三种类型才有物料明细  其他情况申请信息中不需要物料信息
    this.getMaterial(getMaterialQuery);
  }
  //删除发票信息 一行
  deleteInvoiceItem(item, index){
    let invoiceid = item["invoiceId"];
    let internalinvoiceno = item["internalinvoiceno"];
    //编辑页面 调用后台删除接口
    if (invoiceid) {
      this.redApplyService.delInvoiceInfoByInvoiceId(invoiceid).subscribe(
        data => {
          if (data.Result) {
            // 后台删除成功后 前端删除
            this.applyData.invoice.splice(index, 1);
            this.delMaterialInfo(internalinvoiceno);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }else{//新建类型财务信息 仅前端删除
      this.applyData.invoice.splice(index, 1);
      this.delMaterialInfo(internalinvoiceno);
    }
  }
  //删除冲退明细信息 删财务信息时
  delMaterialInfo(internalinvoiceno) {
    //根据系统发票号对应删除冲退明细
    // 表单数据中
    this.applyData.material.forEach((item, index) => {
      if (item.internalinvoiceno == internalinvoiceno) {
        this.applyData.material.splice(index, 1);
      }
    });
    // 冲退明细组件中
    for (let index = 0; index < this.materialList.length; index++) {
      let item = this.materialList[index];
      if (item.internalinvoiceno == internalinvoiceno) {
        this.materialList.splice(index, 1);
        break;
      }
    }
    // 删除后重置冲退明细当前项 排他
    if (this.materialList.length > 0) {
      this.materialList.forEach(element => {
        element["active"] = false;
      });
      this.materialList[0].active = true;
    }
  }
  //根据冲红大类ID获取小类数据源
  getChildrenRedtypes(revisetypecode){
    let newArray = [];
    newArray = this.baseDataSource.redtypes.filter(redtype => {
      if (redtype["revisetypecode"] == revisetypecode && redtype["revisetypecode"] != 600) {
        return redtype;
      }
    });
    if (newArray.length > 0) this.childrenRedtypes = newArray[0]["children"];
    return newArray;
  }
  //根据id获取item [{id:"001", value:"公司"}]
  getNameById(arr: Array<any> = [], id, selectid){
    let name = null;
    arr.forEach(item => {
      selectid == item[id]? name = item: null;
    });
    return name;
  }
  //选择发票类型事件
  onInvoiceTypeChange(event){
    let invoicetype = this.getNameById(this.baseDataSource.invoicetypes, "invoicetypecode", event);
    if (invoicetype) {
      this.applyData.apply.invoicetype = invoicetype["invoicetype"];
    }
  }
  //选择平台事件
  onPlatFormChange(event){
    let platform = this.getNameById(this.baseDataSource.platforms, "platformcode", event);
    if (platform) {
      this.applyData.apply.platform = platform["platform"];
      this.isREZTY();
    }
  }
  //选择公司事件
  onSelecteCompany(selectedcompany){
    //冲退明细数据处理 
    if (this.applyData.invoice.length > 0 && this.applyData.apply.companycode != selectedcompany["companycode"]) {
      //  后台删除
      this.delDescendantInfo();
      //  前端删除
      this.applyData.invoice.length = this.applyData.material.length = this.materialList.length = 0;
    }
    this.applyData.apply.companycode = selectedcompany["companycode"];
    this.applyData.apply.company = selectedcompany["company"];
  }
  //选择业务范围事件
  onSelecteBiz(selectedbiz){
    //冲退明细数据处理 
    if (this.applyData.invoice.length > 0 && this.applyData.apply.bizcode != selectedbiz["bizcode"]) {
      //  后台删除
      this.delDescendantInfo();
      //  前端删除
      this.applyData.invoice.length = this.applyData.material.length = this.materialList.length = 0;
    }
    this.applyData.apply.bizcode = selectedbiz["bizcode"];
    this.applyData.apply.biz = selectedbiz["biz"];
    this.isREZTY();
  }
  //切换冲红大类
  onRevisetypeChange(revisetypecode){
    //0、根据id获取发票大类名称
    let revisetype = this.getNameById(this.baseDataSource.redtypes, "revisetypecode", revisetypecode);
    if (revisetype) {
      this.applyData.apply.revisetype = revisetype["revisetype"];
    }
    //1、根据选中的大类 查找小类数据源
    this.getChildrenRedtypes(revisetypecode);
    //为小类数据源添加是否选中标记
    //多选 checked = true/false
    //单选 checked = on/off
    this.childrenRedtypes.forEach((ele) => {
      if (revisetypecode == 100) {
        ele["checked"] = false;
      } else {
        ele["checked"] = "off";
      }
    });
    //2、清空小类已选项
    this.selectedChildrenRevisetype.length = 0;
    //3、删除财务及冲退明细信息
    if (this.applyData.invoice.length > 0) {
      //  后台删除
      this.delDescendantInfo();
      //  前端删除
      this.applyData.invoice.length = this.applyData.material.length = this.materialList.length = 0;
    }
    //4、确定冲退明细类型
    this.confirmMaterialType();
  }

  //冲红小类的change事件
  onChildrenRevisetypeChange(event, childrenredtype){
    let oldMaterialType = this.materialType;
    //1、记录需要保存的冲红小类
    //多选情况
    let index = this.selectedChildrenRevisetype.indexOf(childrenredtype);
    if (event === true) {// 选中
      childrenredtype["checked"] = true;
      if(index == -1) this.selectedChildrenRevisetype.push(childrenredtype);
    }else if(event === false) {// 取消选中
      childrenredtype["checked"] = false;
      this.selectedChildrenRevisetype.splice(index, 1);
    }
    //单选情况
    if (event === "on") {
      this.selectedChildrenRevisetype = [childrenredtype];
    }
    //2、将已记录的冲红小类转换为后台保存需要的数据
    let tempArr = [];
    this.selectedChildrenRevisetype.forEach(ele => {
      tempArr.push({subtypecode: ele["revisetypecode"], subtype: ele["revisetype"]});
    });
    this.applyData.apply.subrevisetype = JSON.stringify(tempArr);
    //3、确定冲退明细类型
    this.confirmMaterialType();
    //4、冲退明细数据处理 
    if (this.applyData.invoice.length > 0 && 
    ( (this.materialType == 3 && (oldMaterialType == 0 || oldMaterialType == 1 || oldMaterialType == 2)) || 
      (oldMaterialType == 3 && (this.materialType == 0 || this.materialType == 1 || this.materialType == 2)))) {
      //  后台删除
      this.delDescendantInfo();
      //  前端删除
      this.applyData.invoice.length = this.applyData.material.length = this.materialList.length = 0;
    }
  }
  //确定冲退明细类型
  confirmMaterialType(){
    //1、确定冲退明细类型
    let revisetypecode = this.applyData.apply.revisetypecode;
    if (revisetypecode == "100" || revisetypecode == "200" || revisetypecode == "500") {
      if (revisetypecode == "200") this.materialType = 0;
      if(this.selectedChildrenRevisetype.length == 0) this.materialType = 3;
      for (var index = 0; index < this.selectedChildrenRevisetype.length; index++) {
        let _flag = false;
        var item = this.selectedChildrenRevisetype[index];
        switch (item["revisetypecode"]) {
          case "201"://价格更改
          case "202"://价格更改
            this.materialType = 0;
            _flag = true;
            break;
          case "105"://物料号
            this.materialType = 1;
            _flag = true;
            break;
          case "501"://冲成本
            this.materialType = 2;
            _flag = true;
            break;
          default://其他
            this.materialType = 3;
            break;
        }
        if(_flag) break;
      }
    } else {
      this.materialType = 3;//其他
    }
    //2、初始化 冲红后 客户编号列是否可编辑
    // 说明 当冲红小类包涵：经工商局认定的客户名称变更或税号时，客户编号可编辑
    let isHas101Or102:boolean = false;
    this.selectedChildrenRevisetype.forEach(ele => {
      if (ele["revisetypecode"] == "101" || ele["revisetypecode"] == "102") isHas101Or102 = true;
    });
    isHas101Or102? this.isAllowEditCustomerCode = true: this.isAllowEditCustomerCode = false;
    //3、确定是否rezty
    this.isREZTY();
  }
  //切换冲红类型时 清空财务及物料信息 ????????
  deleteMaterialInfo(){
    this.windowService.confirm({ message: "切换冲红类型,财务及冲退信息将清空？" }).subscribe({
      next: (v) => {
        if (v) {
          //  后台删除
          this.delDescendantInfo();
          //  前端删除
          this.applyData.invoice.length = this.applyData.material.length = this.materialList.length = 0;
        }
      }
    });
  }

  //附件上传 成功
  fileUploadSuccess(event){
    //event = data
    if (event.Result) {
      let data = JSON.parse(event.Data);
      if (data.length > 0) {
        data.forEach(item => {
          let accessItem = new AccessItem();
          accessItem.AccessoryID = item["AccessoryID"];
          accessItem.AccessoryName = item["AccessoryName"];
          accessItem.AccessoryURL = item["AccessoryURL"];
          this.applyData.accessory.push(accessItem);
        });
      }
    }else{
      this.windowService.alert({ message: event.Message, type: "fail" });
    }
    
  }
  //删除附件
  onDeleteFileItem(event) {
    //event = 删除文件的下标
    let item = this.applyData.accessory[event];
    if (!item.AccessoryID) {
      this.applyData.accessory.splice(event, 1);
    } else {
      this.redApplyService.deleAccessory(item.AccessoryID).subscribe(data => {
        if (data.Result) {
          this.applyData.accessory.splice(event, 1);
        } else {
          this.windowService.alert({ message: event.Message, type: "fail" });
        }
      });
    }
  }
  //点击单个已经上传的附件
  onClickFile(event){
    // event = {item: item, index: i}
    window.open(dbomsPath + this.applyData.accessory[event.index].AccessoryURL);
  }
  //保存数据时  业务数据处理
  applyDataHandle() {
    this.applyData.apply.ApproveUsers = JSON.stringify(this.applyData.apply.ApproveUsers);
    if (this.materialType == 1) {//物料号类型 特殊处理
      this.applyData.material.length = 0;
      this.materialList.forEach(item => {
        this.applyData.material = this.applyData.material.concat(item["tableList"]);
      });
    }
  }
  //存为草稿
  onSaveApplyData(){
    if (this.isSaving && this.isSubmited) {
      this.windowService.alert({ message: "流程已提交不可保存", type: "warn" });
      return;
    }
    this.isSaving = true;
    this.applyDataHandle();
    this.saveApply(this.applyData);
  }
  //表单验证
  applyDataValid(): boolean{
    let apply =  this.applyData;
    //流程是否提交
    if (this.isSubmited) {
      this.windowService.alert({ message: "流程已提交", type: "warn" });
      return false;
    }
    //冲红小类是否选择
    if (this.applyData.apply.revisetypecode != 600 && this.selectedChildrenRevisetype.length <= 0) {
      this.windowService.alert({ message: "请选择冲红类型", type: "warn" });
      return false;
    }
    //财务信息是否选择
    if(apply.invoice.length <= 0){
      this.windowService.alert({ message: "请维护财务信息", type: "warn" });
      return false;
    }
    //小类包含客户名称、税号时 客户编号必填
    if (this.isAllowEditCustomerCode) {
      let isValid = true;
      for (let index = 0; index < apply.invoice.length; index++) {
        let element = apply.invoice[index];
        if (!element.customercode) {
          isValid = false;
        }
      }
      if (!isValid) {
        this.windowService.alert({ message: "冲红后客户编号必填", type: "warn" });
        return false;
      }
    }
    //物料明细必填项
    let tempArr =[];
    this.materialList.forEach(item => {
      let isValid = item.tableList.forEach((item: Material) => {
        if (this.materialType == 0) {
          item.money && item.backmoney? null: tempArr.push("冲退明细" + item.internalinvoiceno + "有必填项未填写");
        } else if (this.materialType == 2) {
          item.materialcode? null: tempArr.push("冲退明细" + item.internalinvoiceno + "有必填项未填写");
        }
        //物料号类型 冲退明细物料必填项验证取消
        // else if (this.materialType == 1) {
        //   item.materialcode && item.num && item.factory && (item.money || item.money == 0) && (item.backmoney || item.backmoney == 0)
        //     ? null: tempArr.push("冲退明细" + item.internalinvoiceno + "有必填项未填写");
        // }
      });
    });
    if (tempArr.length > 0) {
      this.windowService.alert({ message: tempArr[0], type: "fail" });
      return false;
    }
    if (apply.accessory.length <= 0) {
      this.windowService.alert({ message: "请上传附件", type: "warn" });
      return false;
    }
    //审批人信息验证
    if (this.applyData.apply.ApproveUsers["bizDivisionFirst"].length == 0 && this.applyData.apply.ApproveUsers["bizDivision"].length == 0){
      this.windowService.alert({ message: "请选择一级审批人", type: "warn" });
      return false;
    }
    if (this.isrezty && this.applyData.apply.ApproveUsers["bizDivisionSecond"].length == 0){
      this.windowService.alert({ message: "请选择二级审批人", type: "warn" });
      return false;
    }
    this.isSubmited = true;
    return true;
  }
  // 表单提交
  onSubmit(event){
    if (this.redApplyForm.valid && this.applyDataValid()) {//表单验证通过
      this.applyDataHandle();
      if (this.applyData.apply.wfstatus != "驳回") this.applyData.apply.wfstatus = "提交";
      this.saveApply(this.applyData);
    }
  }
  //取消按钮事件
  cancle(){
    window.close();
  }
  //获取年月日 格式：YYYY-MM-DD
  getDataYYYYMMDD(datatime){
    let dataStr = datatime;
    if (datatime && datatime.indexOf('Date') > -1) {
      let dt = new Date(Number(datatime.match(/\d+/g)[0]));
      dataStr = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate();
    }
    return dataStr;
  }
  myToFixed(money){
    return Number(money).toFixed(2);
  }
/**页面功能 end */

/** 冲退明细 begin */
  //tab切换效果
  clickTab(i){
    // 排他
    this.materialList.forEach(element => {
      element["active"] = false;
    });
    this.materialList[i]["active"] = true;
  }
  //获取物料描述 冲成本
  getMaterialDesc(item, tabitemi, i){
    let materialcode = String(item["materialcode"]).trim();
    this.materialList[tabitemi].tableList[i].description = "";
    if (materialcode && String(materialcode).length > 8) {
      this.redApplyService.getMaterialDesc(materialcode).subscribe(data => {
        if (data.Result) {
          this.materialList[tabitemi].tableList[i].description = data.Data;
          if(data.Data != item["originaldescription"]) item["isDiffMaterialDescription"] = true;
        }
      });
    }
  }
  //表格添加一行
  addLineForMaterialCodeType(tabitem, tabitemi){
    let material = new Material();
    material["projcode"] = (this.materialList[tabitemi].tableList.length+1)*10;
    material["internalinvoiceno"] = tabitem["internalinvoiceno"];
    this.materialList[tabitemi].tableList.unshift(material);
  }
  //删除物料明细 一行
  deleteMaterial(tabitemi, item, i){
    let materialid = item["materialId"];
    if(this.materialList[tabitemi].tableList.length == 1 && this.materialType !== 1) {this.windowService.alert({ message: "至少保留一行", type: "warn" }); return;}
    //调用后台删除接口
    if (materialid) {
      this.redApplyService.deleteMaterial(materialid).subscribe(
        data => {
          if (data.Result) {
            // 后台删除成功后 前端删除
            this.delLineForMaterialCodeType(tabitemi, i);
          } else {
            this.windowService.alert({ message: data.Message, type: "fail" });
          }
        });
    }else{//新建类型物料信息 仅前端删除
      this.delLineForMaterialCodeType(tabitemi, i);
    }
  }
  //删除一行物料明细（前端数据）
  delLineForMaterialCodeType(tabitemi, i){
    let tempArray = this.materialList[tabitemi].tableList;
    //删除
    tempArray.splice(i, 1);
    //重置行项目编号
    tempArray.forEach((item, index) => {
      item.projcode = (tempArray.length - index) * 10;
    });
  }
  //计算总计 30%验证
  calculationTotal(tabitemi, item, i){
    let reg=/^[0-9]\d*$/;
    let money=this.materialList[tabitemi].tableList[i].money;
    let backmoney=this.materialList[tabitemi].tableList[i].backmoney;
    if(String(money).search(reg)!=-1){
      this.materialList[tabitemi].tableList[i].money=money+".00";
    }
    if(String(backmoney).search(reg)!=-1){
      this.materialList[tabitemi].tableList[i].backmoney=backmoney+".00";
    }
    //总计计算
    this.materialList[tabitemi].moneyTotalAmount = null;
    this.materialList[tabitemi].backMoneyTotalAmount = null;
    this.materialList[tabitemi].originalMoneyTotalAmount = null;
    this.materialList[tabitemi].originalBackMoneyTotalAmount = null;
    this.materialList[tabitemi].tableList.forEach(item => {
      this.materialList[tabitemi].moneyTotalAmount += Number(item.money);
      this.materialList[tabitemi].backMoneyTotalAmount += Number(item.backmoney);
      this.materialList[tabitemi].originalMoneyTotalAmount += Number(item.originalmoney);
      this.materialList[tabitemi].originalBackMoneyTotalAmount += Number(item.originalbackmoney);
    });
    this.applyData.invoice[tabitemi].money = this.myToFixed(this.materialList[tabitemi].moneyTotalAmount - this.materialList[tabitemi].backMoneyTotalAmount);
    //30%验证
    if(this.materialList[tabitemi].moneyTotalAmount == 0) return;
    if(this.materialList[tabitemi].backMoneyTotalAmount > (this.materialList[tabitemi].moneyTotalAmount*0.3).toFixed(2)) {
      this.materialList[tabitemi].isBeyond = true;
      this.windowService.alert({ message: "返款金额已超出销售额的30%!", type: "warn" });
    }else{
      this.materialList[tabitemi].isBeyond = false;
    }
    
  }
  myToUpCase(tabitemi, i){
    this.materialList[tabitemi].tableList[i].factory = String(this.materialList[tabitemi].tableList[i].factory).toUpperCase();
    this.materialList[tabitemi].tableList[i].storagelocation = String(this.materialList[tabitemi].tableList[i].storagelocation).toUpperCase();
    this.materialList[tabitemi].tableList[i].batchno = String(this.materialList[tabitemi].tableList[i].batchno).toUpperCase();
    this.materialList[tabitemi].tableList[i].originalbatchno = String(this.materialList[tabitemi].tableList[i].originalbatchno).toUpperCase();
    this.materialList[tabitemi].tableList[i].originalstoragelocation = String(this.materialList[tabitemi].tableList[i].originalstoragelocation).toUpperCase();
  }
/** 冲退明细 end */

/**审批人信息 begin */
  
  //多选  选人 关闭
  onApproverSelectModalHide = (hidedata) => {
    if (hidedata && hidedata.selectData && hidedata.selectData.length > 0) {
      hidedata.selectData.forEach(selectuser => {
        delete selectuser.checked;
        selectuser["userCN"] = selectuser.UserName;
        selectuser["userEN"] = selectuser.ITCode;
        selectuser["userID"] = selectuser.ITCode;
        if (hidedata.nodeflag == "first") {//事业部一级审批人 需要根据是否rezty来筛选对应审批人
          if (this.isrezty) {//是rezty
            if (this.applyData.apply.ApproveUsers["bizDivisionFirst"].indexOf(selectuser) == -1)
              this.applyData.apply.ApproveUsers["bizDivisionFirst"].push(selectuser);
          }else{
            if (this.applyData.apply.ApproveUsers["bizDivision"].indexOf(selectuser) == -1)
              this.applyData.apply.ApproveUsers["bizDivision"].push(selectuser);
          }
        }
        if (hidedata.nodeflag == "second"){
          if (this.applyData.apply.ApproveUsers["bizDivisionSecond"].indexOf(selectuser) == -1)          
            this.applyData.apply.ApproveUsers["bizDivisionSecond"].push(selectuser);
        }
      });
    }
  }
  //多选  选人  打开
  onApproverSelectModalShow(nodeflag){
    let approverlist = [];
    if (nodeflag == "first") {//事业部一级审批人 需要根据是否rezty来筛选对应审批人
      if (this.isrezty) {//是rezty
        approverlist = this.approverUsersInfo["bizDivisionFirst"];
      }else{
        approverlist = this.approverUsersInfo["bizDivision"];
      }
    }
    if (nodeflag == "second"){
      approverlist = this.approverUsersInfo["bizDivisionSecond"];
    }
    this.appmodal.show({data:approverlist, nodeflag: nodeflag});//显示弹出框
  }
  //确定是否REZTY
  isREZTY(){
    let oldIsREZTY = this.isrezty;
    if(this.applyData.apply.platformcode && this.applyData.apply.bizcode){
      //判断客户编号是否变更
      let IsChanged = false;
      for (let index = 0; index < this.applyData.invoice.length; index++) {
        let item = this.applyData.invoice[index];
        if (item.customercode != item.originalcustomercode)
        {
            IsChanged = true;
            break;
        }
      }
      // 是否REZTY判断逻辑
      switch (this.applyData.apply.revisetypecode)
      {
        case "100"://票面信息更改
            if (this.applyData.apply.subrevisetype.indexOf("105") >= 0)//票面-物料号更改
            {
              this.isrezty = true;
            }else if ((this.applyData.apply.subrevisetype.indexOf("101") >= 0 || this.applyData.apply.subrevisetype.indexOf("102") >= 0 )&& IsChanged)
            {
              this.isrezty = true;
            }else{
              this.isrezty = false;
            }
            break;
        case "300"://发票类型更改
            this.isrezty = true;
            break;
        case "500"://系统冲红
            if (this.applyData.apply.subrevisetype.indexOf("501") >= 0)//冲成本
            {
              this.isrezty = true;
            }else{
              this.isrezty = false;
            }
            break;
        default:
          this.isrezty = false;
          break;
      }
      //确定是否rezty后 获取审批人信息
      this.getApproverUsersInfo();
      //每次确定是否rezty后清空已选择审批人信息
      if (oldIsREZTY != this.isrezty && this.isreztychange != 1) {
        this.applyData.apply.ApproveUsers = new ApproveUsers();
        this.isreztychange++;
      }
    }
  }
  //获取审批人信息
  getApproverUsersInfo(){
    if(this.applyData.apply.platformcode && this.applyData.apply.bizcode){
      this.loading = true;
      this.redApplyService.WorkflowNodeUserSet(this.applyData.apply.bizcode,this.applyData.apply.platformcode).subscribe(data => {
        this.loading = false;
        if (data.Result) {
          this.approverUsersInfo = data.Data;
        }
      });
    }
  }
  //删除选中的审批人
  removeOne(nodeflag,item,i) {
    if (nodeflag == "first") {
      if (this.isrezty) {//是rezty
        this.applyData.apply.ApproveUsers["bizDivisionFirst"].splice(this.applyData.apply.ApproveUsers["bizDivisionFirst"].indexOf(item), 1);
      }else{
        this.applyData.apply.ApproveUsers["bizDivision"].splice(this.applyData.apply.ApproveUsers["bizDivision"].indexOf(item), 1);
      }
    }
    if (nodeflag == "second") {
      this.applyData.apply.ApproveUsers["bizDivisionSecond"].splice(this.applyData.apply.ApproveUsers["bizDivisionSecond"].indexOf(item), 1);      
    }
    
  }
/**审批人信息 end */
}
