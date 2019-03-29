import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplyData, BaseDataSource, Invoice, Material, MaterialList, AccessItem, SaveToERPData, Group, TemporaryAddress } from "../../datamodel/redapply";
import { RedApplyService } from "../../service/ri-red.service";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { InvoiceQueryResultComponent } from "../invoice-query-result/invoice-query-result.component";
import { DbWfviewComponent } from "../../../../shared/index";
import { ReturnAddaddressComponent } from "../return-addaddress/return-addaddress.component";
import { dbomsPath } from "../../../../../environments/environment";
declare var window: any;
declare var $: any;

@Component({
  selector: 'db-return-approve',
  templateUrl: './return-approve.component.html',
  styleUrls: ['./return-approve.component.scss']
})
export class ReturnApproveComponent implements OnInit {

  constructor(
    private redApplyService: RedApplyService,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService
    ) { }

  @ViewChild('redApplyForm') redApplyForm;//表单
  @ViewChild('wfview') wfView: DbWfviewComponent;
  addressModal: XcModalRef;//模态窗 添加临时地址
  applyData: ApplyData = new ApplyData();//表单数据模型
  baseDataSource: BaseDataSource = new BaseDataSource();//下拉框数据源
  wfHistory: any = null;//审批历史数据
  applyID: any = "";//申请id
  recordID: any = "";//申请id
  taskID: any = "";//审批任务id
  nodeID: any = "";//审批节点id
  isADP: boolean = false;//是否加签审批
  appParms: any = {};//审批组件参数
  isAllowEdit: boolean = true;//用来区分查看跟审批页面 true 审批页面 false 查看页面
  isRed: boolean = false;//是否显示红字审批按钮
  hasSaved: boolean = false;//是否验证或保存成功
  subrevisetype: any[] = [];
  materialType: number = 3;//冲退明细类型 1-退货 2-换货 3-其他
  materialList: MaterialList[] = [];//冲退明细组件数据源
  saveToERPDataList: SaveToERPData[] = [];//冲退明细组件数据源
  uploadAccesslUrl:any = this.redApplyService.uploadAccesslUrl//附件上传地址
  hasUploadedFiles: any[] = [];//附件信息数据源 组件：{name: "a.txt", size: 52428800}
  isApplyItcode: boolean = false;//当前登陆人是否此数据申请人
  invoiceHasApprove: boolean = false;//财务经理是否已审批
  addressIndex = -1;//记录临时地址选中项在数据源中的下标
  temporaryAddressDataSource: TemporaryAddress[] = [];//临时地址
  loading: any = false;
  ngOnInit() {
    this.applyID = this.routerInfo.snapshot.queryParams['applyid'];
    this.recordID = this.routerInfo.snapshot.queryParams['recordid'];
    this.taskID = this.routerInfo.snapshot.queryParams['taskid'];
    this.nodeID = this.routerInfo.snapshot.queryParams['nodeid'];
    this.isADP = this.routerInfo.snapshot.queryParams['ADP'];
    this.addressModal = this.xcModalService.createModal(ReturnAddaddressComponent);
    this.addressModal.onHide().subscribe(this.onReturnAddaddressModalHide);
    if (!this.applyID) {//审批页面
      this.appParms = {
        apiUrl_AR: this.redApplyService.approveProductReturnUrl,
        apiUrl_Sign: this.redApplyService.addTaskUrl,
        apiUrl_Transfer: this.redApplyService.approveAddTransferUrl,
        taskid: this.taskID,
        nodeid: this.nodeID,
        apiUrl: this.redApplyService.approveAddTaskUrl
      }
      this.getTaskStatus(this.taskID);
    }else{
      this.isAllowEdit = false;
      this.invoiceOverMonth(this.applyID || this.recordID);
    }
    this.getBaseDataSource();
    this.getApproveHistory(this.applyID || this.recordID);
  }
  
/**接口请求 begin */
  //获取下拉框数据源
  getBaseDataSource(){
    this.redApplyService.getBaseDataList().subscribe(
      data => {
        if (data.Result) {
          this.baseDataSource = JSON.parse(data.Data);
          this.getApplyDataByApplyId(this.applyID || this.recordID);
        }
      }
    );
  }
  //根据ApplyId获取页面申请数据
  getApplyDataByApplyId(applyid) {
    this.redApplyService.getApplyDataById(applyid).subscribe(
      data => {
        if (data.Result) {
          this.applyData = JSON.parse(data.Data);
          this.isApplyItcode = this.applyData.apply.ITCode == JSON.parse(window.localStorage.getItem("UserInfo"))["ITCode"];
          //冲红小类处理
          this.subrevisetype = JSON.parse(this.applyData.apply.subrevisetype);
          //确定冲退明细类型
          this.confirmMaterialType();
          //初始化冲退明细组件数据
          let materialData = this.applyData.material;
          let invoiceData = this.applyData.invoice;
          if (invoiceData && invoiceData.length > 0) {
            invoiceData.forEach(invoiceItem => {
              //商务岗 付款账期初始化特殊处理
              invoiceItem.receiptdate === -1? invoiceItem.receiptdate = "": null;
              //初始化materialList
              let internalinvoiceno = invoiceItem.internalinvoiceno;
              let tempArray = [];
              if (materialData && materialData.length > 0) {
                tempArray = [].concat(materialData.filter((materialItem) => {
                  return materialItem.internalinvoiceno == internalinvoiceno && materialItem.groupno == 0;
                }));
              }
              if (tempArray.length > 0) {
                let materialList = new MaterialList();
                materialList.active = false;
                materialList.internalinvoiceno = invoiceItem["externalinvoiceno"] || internalinvoiceno;
                materialList.tableList = JSON.parse(JSON.stringify(tempArray));
                this.materialList.push(materialList);
              }
              let temporaryAddress = new TemporaryAddress();//临时地址信息
              temporaryAddress.active = true;
              temporaryAddress["SDF_NAME"] = invoiceData[0]["SDF_NAME"];
              temporaryAddress["detailaddress"] = invoiceData[0]["detailaddress"];
              temporaryAddress["province"] = invoiceData[0]["province"];
              temporaryAddress["city"] = invoiceData[0]["city"];
              temporaryAddress["citycode"] = invoiceData[0]["citycode"];
              temporaryAddress["district"] = invoiceData[0]["district"];
              temporaryAddress["zipcode"] = invoiceData[0]["zipcode"];
              temporaryAddress["connecter"] = invoiceData[0]["connecter"];
              temporaryAddress["phone"] = invoiceData[0]["phone"];
              temporaryAddress["signstandard"] = invoiceData[0]["signstandard"];
              this.temporaryAddressDataSource.push(temporaryAddress);
              //初始化saveToERPDateList
              let saveToERPDate = new SaveToERPData();
              saveToERPDate.invoice = JSON.parse(JSON.stringify(invoiceItem));
              saveToERPDate.returnsellfactory = invoiceItem.ReturnSellFactory;
              // [{groupno:"-1", isERP: 0}]
              let isERPArray = JSON.parse(invoiceItem.Is2ERP) || [];
              if (materialData && materialData.length > 0) {
                let groupnoArray = [];
                materialData.forEach(item => {
                  if(item.groupno !="0" && groupnoArray.indexOf(item.groupno) == -1) groupnoArray.push(item.groupno);
                });
                groupnoArray.sort();
                groupnoArray.forEach(groupno => {
                  let group = new Group();
                  group.groupno = groupno;
                  group.rednoticeno = invoiceItem.rednoticeno;
                  isERPArray.forEach(isERPArrayitem => {
                    if(isERPArrayitem["groupno"] == groupno) group.isERP = isERPArrayitem.isERP;
                  });
                  group.material = [].concat(materialData.filter((materialItem) => {
                    return materialItem.internalinvoiceno == internalinvoiceno && materialItem.groupno == groupno;
                  }));
                  if (group.material.length > 0) {
                    group.invoiceremark = group.material[0].invoiceremark;
                    group.ordertype = group.material[0].ordertype;
                    if (groupno == "-1") {
                      saveToERPDate.hasSaveToERPXuchu = true;
                    }else{
                      saveToERPDate.hasSaveToERPXutui = true;
                    }
                  }
                  if (group.material.length > 0) saveToERPDate.group.push(group);
                });
              }
              this.saveToERPDataList.push(saveToERPDate);
            });
            //从erp获取冲退明细数据源
            let getMaterialQuery = [];
            this.saveToERPDataList.forEach(saveToERPDateItem => {
              getMaterialQuery.push({ invoiceno: saveToERPDateItem.invoice.internalinvoiceno, orderno: saveToERPDateItem.invoice.orderno });
            });
            if (getMaterialQuery.length > 0) {
              this.getMaterial(getMaterialQuery);
            }
            //重置冲退明细当前项 排他
            if (this.materialList.length > 0) {
              this.materialList.forEach(element => {
                element["active"] = false;
              });
              this.materialList[0].active = true;
            }
            if (this.saveToERPDataList.length > 0) {
              this.saveToERPDataList.forEach(element => {
                element["active"] = false;
              });
              this.saveToERPDataList[0].active = true;
            }
          }
          //初始化附件上传组件数据源
          this.applyData.accessory.forEach(item => {
            let hasUploadedFileItem = {name: "", size: 0};
            hasUploadedFileItem.name = item.AccessoryName;
            this.hasUploadedFiles.push(hasUploadedFileItem);
          });
        }
      });
  }
  //提交申请信息（保存、提交）
  saveApply(applydata, optype?) {
    //商务岗 付款账期初始化特殊处理
    this.applyData.invoice.forEach((invoiceItem,invoiceIndex) => {
      invoiceItem.receiptdate === ""? this.applyData.invoice[invoiceIndex].receiptdate = -1: null;
    });
    this.redApplyService.saveApply(applydata).subscribe(
      data => {
        if (data.Result) {
          if (optype == "cancle") window.close();
          if(optype === true) this.hasSaved = true;
          //商务岗 付款账期初始化特殊处理
          if (this.nodeID == 8 && this.isAllowEdit) {
            this.applyData.invoice.forEach((invoiceItem,invoiceIndex) => {
              invoiceItem.receiptdate === -1 ? this.applyData.invoice[invoiceIndex].receiptdate = "" : null;
            });
          }
        }else{
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  //获取审批历史数据
  getApproveHistory(applyid){
    if (applyid) {
      this.redApplyService.getApproveHistory(applyid).subscribe(data => {
        if (data.Result) {
          let temp = JSON.parse(data.Data);
          if (temp["wfhistory"] && temp["wfhistory"].length > 0) this.wfHistory = temp["wfhistory"].reverse();
          this.wfView.onInitData(temp["wfprogress"]);
          temp["wfhistory"].forEach(item => {
            item.nodename == "财务经理"? this.invoiceHasApprove = true: null;
          })
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
    }
  }
  //是否办理红字
  invoiceOverMonth(applyid){
    this.redApplyService.invoiceOverMonth(applyid).subscribe(
      data => {
        if (data.Result && data.Data == "true") this.isRed = true;
      });
  }
  //查询冲退物料明细信息
  getMaterial(params = []) {
    if (params.length>0) {
      this.redApplyService.getMaterial(params).subscribe(
        data => {
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
    //构建冲退明细组件需要的数据
    if(erpmaterialdata && erpmaterialdata.length > 0){
      this.saveToERPDataList.forEach((saveToERPDateEle, index) => {
        //确定退货具体类型（服务、实物、部分实物）
        if(this.materialType == 1) saveToERPDateEle.materialSubType = this.confirmMaterialSubType(saveToERPDateEle.invoice.internalinvoiceno, erpmaterialdata);
        let eleGroupNoArray = [];
        if (saveToERPDateEle.materialSubType == 3 || this.materialType == 2) {
          if (saveToERPDateEle.group.length == 0) {
            eleGroupNoArray = [-1, 1];
          } else if(saveToERPDateEle.group.length == 1) {
            if (saveToERPDateEle.group[0].groupno == -1) eleGroupNoArray = [1];
            else eleGroupNoArray = [-1];
          }
        }else {
          if (saveToERPDateEle.group.length == 0) eleGroupNoArray = [-1];
        }
        eleGroupNoArray.forEach(groupno => {
          let group = new Group();
          group.groupno = groupno;
          group.isERP = "";
          if (groupno == -1) {
            group.ordertype = this.applyData.defaultordertype["xutui"];
          } else {
            group.ordertype = this.applyData.defaultordertype["xuchu"];
          }
          group.rednoticeno = saveToERPDateEle.invoice.AccountantRedNoticeNo;
          //group 物料数据
          if ((saveToERPDateEle.materialSubType == 3 && groupno == 1) || this.materialType == 2) {//取原单数据
            group.material = [].concat(this.applyData.material.filter((materialItem) => {
              return materialItem.internalinvoiceno == saveToERPDateEle.invoice.internalinvoiceno && materialItem.groupno == 0;
            }));
          }
          else {
            let tempArray = [].concat(erpmaterialdata.filter((erpmaterialdataItem) => {
              return erpmaterialdataItem.internalinvoiceno == saveToERPDateEle.invoice.internalinvoiceno;
            }));
            tempArray[0].material.forEach((item, index) => {
              let material = new Material();
              material.projcode = (index + 1) * 10;
              material.materialcode = item["originalmaterialcode"];
              material.description = item["originaldescription"];
              material.originalnum = material.num = item["num"];
              material.factory = item["factory"];
              material.storagelocation = item["originalstoragelocation"];
              material.batchno = item["originalbatchno"];
              material.money = Number(item["originalmoney"]);
              material.backmoney = Number(item["originalbackmoney"]);
              material.originalmoney = Number(item["originalmoney"]);
              material.originalbackmoney = Number(item["originalbackmoney"]);
              material.CURRENCY = item["CURRENCY"];
              group.material.push(material);
            });
          }
          saveToERPDateEle.group.push(group);
        });
        let compare = function (property) {
          return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
          }
        }
        saveToERPDateEle.group.sort(compare("groupno"));
      });
    }
    this.initIsERP();
    this.materialProcess();
  }
  //将申请人填写的物料库存地及退货数量覆盖原单数据
  materialProcess(){
    let applyMaterialArray = this.applyData.material.filter(item => { return item.groupno == 0 });
    this.saveToERPDataList.forEach((item,index) => {
      let internalinvoiceno = item.invoice.internalinvoiceno;
      item.group.forEach((groupItem, groupIndex) => {
        groupItem.material.forEach((materialItem, materialIndex) => {
          let applyMaterialItem = applyMaterialArray.filter(item => {
            return item.internalinvoiceno == internalinvoiceno &&  materialItem.materialcode == item.materialcode;
          });
          if (applyMaterialItem.length > 0 && !groupItem.hasERP) {
            this.saveToERPDataList[index].group[groupIndex].material[materialIndex].returnnum = applyMaterialItem[0].returnnum;
            this.saveToERPDataList[index].group[groupIndex].material[materialIndex].storagelocation = applyMaterialItem[0].returnstoragelocation;
          }
        })
      });
    });
  }
  //写入erp
  saveToERP(savetoerpdata,saveToERPDatei, groupno){
    let savetoERPData = new SaveToERPData();
    savetoERPData.invoice = savetoerpdata["invoice"];
    savetoERPData.invoice.receiptdate === ""? savetoERPData.invoice.receiptdate = -1: null;
    savetoERPData.group = [].concat(savetoerpdata["group"].filter((groupItem) => {
      if(groupno == "-1") return groupItem.groupno == groupno;
      if(groupno == "1") return groupItem.groupno >= "1";
    }));
    //验证是否选择了退入工厂
    if (groupno == "-1" && this.materialType == 1) {
      if (savetoerpdata.returnsellfactory === "") {
        this.windowService.alert({ message: "请选择退入销售平台工厂", type: "fail" });
        return;
      }
    }
    //物料必填项验证
    let isValid = true;
    savetoERPData.group.forEach(groupitem => {
      groupitem.material.forEach(materialitem => {
        if (!materialitem.materialcode && !materialitem.num && !materialitem.factory && !materialitem.money && !materialitem.backmoney) {
          isValid = false;
        }
      })
    });
    if(!isValid) {
      this.windowService.alert({ message: "请维护物料必填项后再写入", type: "fail" });
      return;
    }

    if(groupno == "-1") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
    if(groupno == "1") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
    let invoicenoIndex;
    let internalinvoiceno = savetoERPData.invoice.internalinvoiceno;
    this.applyData.invoice.forEach((item, index) => {
      if (item.internalinvoiceno == internalinvoiceno) invoicenoIndex = index;
    });
    if(groupno == "-1") {
      savetoERPData.invoice.rednoticeno = this.applyData.invoice[invoicenoIndex].rednoticeno = savetoERPData.group[0].rednoticeno;
    }
    savetoerpdata["group"].forEach((groupItem, groupi) => {
      savetoERPData.group.forEach(item => {
        if (item.groupno == groupItem.groupno) {
          this.saveToERPDataList[saveToERPDatei].group[groupi].hasERP = true;
        }
      });
    });
    this.loading = true;
    this.redApplyService.saveToERP(savetoERPData).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        let resultData = JSON.parse(data.Data);
        let copyResultData = [];
        if (resultData.length > 0) {
          resultData.forEach(resultDataItem => {
            let index = -1;
            copyResultData.forEach((item, i) => {
              if(resultDataItem["ordertype"] == item["ordertype"]) index = i;
            });
            if(index > 0) copyResultData[index]["orderno"] += (";" +resultDataItem["orderno"]);
            else copyResultData.push(resultDataItem);
          });
        }
        if (copyResultData.length > 0) {
          copyResultData.forEach(item => {
            switch (item.ordertype) {
              case "ZCR":
                if (this.applyData.invoice[invoicenoIndex].ZCRorderno) {
                  this.applyData.invoice[invoicenoIndex].ZCRorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZCRorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZCRorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZCRorderno = item["orderno"];
                }
                break;
              case "RE":
                if (this.applyData.invoice[invoicenoIndex].REorderno) {
                  this.applyData.invoice[invoicenoIndex].REorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.REorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].REorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.REorderno = item["orderno"];
                }
                break;
              case "ZDR":
                if (this.applyData.invoice[invoicenoIndex].ZDRorderno) {
                  this.applyData.invoice[invoicenoIndex].ZDRorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZDRorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZDRorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZDRorderno = item["orderno"];
                }
                break;
              case "ZTY":
                if (this.applyData.invoice[invoicenoIndex].ZTYorderno) {
                  this.applyData.invoice[invoicenoIndex].ZTYorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZTYorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZTYorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZTYorderno = item["orderno"];
                }
                break;
              case "ZOR":
                if (this.applyData.invoice[invoicenoIndex].ZORorderno) {
                  this.applyData.invoice[invoicenoIndex].ZORorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZORorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZORorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZORorderno = item["orderno"];
                }
                break;
              case "ZRE":
                if (this.applyData.invoice[invoicenoIndex].ZREorderno) {
                  this.applyData.invoice[invoicenoIndex].ZREorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZREorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZREorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZREorderno = item["orderno"];
                }
                break;
              case "ZSD":
                if (this.applyData.invoice[invoicenoIndex].ZSDorderno) {
                  this.applyData.invoice[invoicenoIndex].ZSDorderno += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZSDorderno += "," + item["orderno"];
                }
                else {
                  this.applyData.invoice[invoicenoIndex].ZSDorderno = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.ZSDorderno = item["orderno"];
                }
                break;
              default:
                if (this.applyData.invoice[invoicenoIndex].OrtherOrder) {
                  this.applyData.invoice[invoicenoIndex].OrtherOrder += "," + item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.OrtherOrder += "," + item["orderno"];
                }else{
                  this.applyData.invoice[invoicenoIndex].OrtherOrder = item["orderno"];
                  this.saveToERPDataList[saveToERPDatei].invoice.OrtherOrder = item["orderno"];
                }
                
                break;
            }
          });
          let erpno = "";
          resultData.forEach(item => {
            erpno += item["orderno"] + ",";
          });
          erpno = erpno.substring(0,erpno.lastIndexOf(","));
          this.windowService.alert({ message: "写入成功，订单号："+erpno, type: "success" });
          this.saveApply(this.applyData, false);
        }
      }else{
        if(groupno == "-1")this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = false;
        if(groupno == "1")this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = false;
        savetoerpdata["group"].forEach((groupItem, groupi) => {
          savetoERPData.group.forEach(item => {
            if (item.groupno == groupItem.groupno) {
              this.saveToERPDataList[saveToERPDatei].group[groupi].hasERP = false;
            }
          });
        });
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
  //获取当前任务审批状态
  getTaskStatus(taskid){
    this.redApplyService.getTaskStatus(taskid).subscribe(data => {
      if (data.Result) {
        if (data.Data == "已处理") {
          this.isAllowEdit = false;
        } else {
          // 财务经理岗 需要确定发票日期是否过月确定是否显示批准并办理红字
          this.invoiceOverMonth(this.applyID || this.recordID);
        }
      }else{
        this.windowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }
/**接口请求 end */

/**页面功能 begin */
  //是否写入erp change事件
  onIsERPChange(event, saveToERPDatei, groupi){
    // if (event == "0") {
    //   if (groupi == 0) this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = false;
    //   if (groupi == 1) this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = false;
    // }else{
    //   if (groupi == 0) this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
    //   if (groupi == 1) this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
    // }

    let invoicenoIndex = -1;
    this.applyData.invoice.forEach((invoiceItem, invoiceIndex) => {
      if(this.saveToERPDataList[saveToERPDatei].invoice.internalinvoiceno == invoiceItem.internalinvoiceno) invoicenoIndex = invoiceIndex;
    });
    // [{groupno:"-1", isERP: 0}]
    let index = -1;
    let isERPArray = JSON.parse(this.applyData.invoice[invoicenoIndex].Is2ERP) || [];
    this.saveToERPDataList.forEach((saveToERPData, saveToERPDatei) => {
      saveToERPData.group.forEach((groupItem, groupi) => {
        isERPArray.forEach((isERPArrayItem, i) => {
          if (isERPArrayItem["groupno"] == groupItem.groupno) index = i;
        });
        if (index > -1) {
          isERPArray[index] = { groupno: groupItem.groupno, isERP: groupItem.isERP };
        } else {
          isERPArray.push({ groupno: groupItem.groupno, isERP: groupItem.isERP });
        }
        if (groupItem.groupno == -1) {
          if (saveToERPData.invoice.REorderno || saveToERPData.invoice.ZCRorderno) {
            this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
            groupItem.hasERP = true;
          } else {
            if (groupItem.isERP == "0" || groupItem.isERP === "") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = false;
            else this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
          }
        } else {
          if (saveToERPData.invoice.ZTYorderno || saveToERPData.invoice.ZORorderno || saveToERPData.invoice.ZSDorderno) {
            this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
            groupItem.hasERP = true;
          } else {
            if (groupItem.isERP == "0" || groupItem.isERP === "") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = false;
            else this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
          }
        }
      });
    });
    this.applyData.invoice[invoicenoIndex].Is2ERP = JSON.stringify(isERPArray);
  }
  //初始化是否写入erp选中状态
  initIsERP() {
    this.saveToERPDataList.forEach((saveToERPData, saveToERPDatei) => {
      // [{groupno:"-1", isERP: 0}]
      let isERPArray = JSON.parse(saveToERPData.invoice.Is2ERP) || [];
      saveToERPData.group.forEach((groupItem, groupi) => {
        isERPArray.forEach(item => {
          if (groupItem.groupno == item.groupno) groupItem.isERP = item.isERP;
        });
        if (groupItem.groupno == -1) {
          if (saveToERPData.invoice.REorderno || saveToERPData.invoice.ZCRorderno) {
            this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
            groupItem.hasERP = true;
          } else {
            if (groupItem.isERP === "0" || groupItem.isERP === "") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = false;
            else this.saveToERPDataList[saveToERPDatei].hasSaveToERPXuchu = true;
          }
        } else {
          if (saveToERPData.invoice.ZTYorderno || saveToERPData.invoice.ZORorderno || saveToERPData.invoice.ZSDorderno) {
            this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
            groupItem.hasERP = true;
          } else {
            if (groupItem.isERP === "0" || groupItem.isERP === "") this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = false;
            else this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
          }
        }
      });
    });
  }
  //确定冲退明细类型
  confirmMaterialType(){
    //1、确定冲退明细类型
    let revisetypecode = this.applyData.apply.revisetypecode;
    let subrevisetype = JSON.parse(this.applyData.apply.subrevisetype);
    if (revisetypecode == "700") this.materialType = 1;
    if (revisetypecode == "800") this.materialType = 2;
    // if (subrevisetype[0]["subtypecode"] == "801") this.materialType = 4;//换货 doa类
  }
  //确定冲退明细类型 具体退货类型
  confirmMaterialSubType(internalinvoiceno, erpmaterialdata: any[]){
    let materialSubType = 4;
    let applyMaterialData = [];//申请人维护物料数据
    let originalMaterialData = [];//原单物料数据
    applyMaterialData = this.materialList.filter(item => { return item.internalinvoiceno == internalinvoiceno })[0]["tableList"];
    originalMaterialData = erpmaterialdata.filter(item => { return item.internalinvoiceno == internalinvoiceno })[0]["material"];
    let _flag = true;//是否服务类型
    originalMaterialData.forEach(item => { if(item["originalstoragelocation"]) _flag=false; });
    if (_flag) { return materialSubType = 1; }
    let applyCount = 0;//申请人维护物料数据 物料总数量
    let originalCount = 0;//原单物料数据 物料总数量
    applyMaterialData.forEach(item => { applyCount += item.returnnum });
    originalMaterialData.forEach(item => { originalCount += item.num });
    if (applyCount == originalCount) { return materialSubType = 2; }
    else return materialSubType = 3;
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
  //表单验证
  applyDataValid(): boolean{
    //财务发票(红字) 红字通知单号必填
    //财务发票(清帐号) 清账号必填
    //商务经理 付款账期必填
    if (this.nodeID == "12" || this.nodeID == "10" || this.nodeID == "8") {
      let rednoticenoValid = true;
      let complexaccoutValid = true;
      let receiptdateValid = true;
      let ordernoValid = true;
      let ordernoValidMsg = [];
      for (var index = 0; index < this.applyData.invoice.length; index++) {
        var element = this.applyData.invoice[index];
        if (this.nodeID == "12" && !element.AccountantRedNoticeNo) {
          rednoticenoValid = false;
          break;
        }
        if (this.nodeID == "10" && !element.complexaccout) {
          complexaccoutValid = false;
          break;
        }
        // if (this.nodeID == "8" && !element.receiptdate) {
        //   receiptdateValid = false;
        //   break;
        // }
      }
      if (!rednoticenoValid) {
        this.windowService.alert({ message: "请填写红字通知单号", type: "fail" });
        return rednoticenoValid;
      }
      if (!complexaccoutValid) {
        this.windowService.alert({ message: "请填写清账号", type: "fail" });
        return complexaccoutValid;
      }
      // if (!receiptdateValid) {
      //   this.windowService.alert({ message: "请选择付款账期", type: "fail" });
      //   return receiptdateValid;
      // }
    }
    if (this.nodeID && this.nodeID== "8") {
      let validMessage = [];
      this.saveToERPDataList.forEach((SaveToERPData, index) => {
        SaveToERPData.group.forEach(groupItem => {
          if (groupItem.isERP === "" && (this.materialType == 2 || SaveToERPData.materialSubType == 3)) {
            validMessage.push("请选择是否写入erp(" + SaveToERPData.invoice["internalinvoiceno"] + ")");
          } else {
            if (SaveToERPData.materialSubType == 2 || SaveToERPData.materialSubType == 3) {
              switch (groupItem.ordertype) {
                case "RE":
                  if (!this.applyData.invoice[index].REorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
                case "ZCR":
                  if (!this.applyData.invoice[index].ZCRorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
                case "ZTY":
                  if (!this.applyData.invoice[index].ZTYorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
                case "ZOR":
                  if (!this.applyData.invoice[index].ZORorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
                case "ZSD":
                  if (!this.applyData.invoice[index].ZSDorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
              }
            }else{
              switch (groupItem.ordertype) {
                case "RE":
                  if (!this.applyData.invoice[index].REorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
                case "ZCR":
                  if (!this.applyData.invoice[index].ZCRorderno)
                    validMessage.push(SaveToERPData.invoice["internalinvoiceno"] + "类型" + groupItem.ordertype + "未写入erp!");
                  break;
              }
            }
          }
        });
      });
      if(validMessage.length > 0){
        this.windowService.alert({ message: validMessage[0], type: "fail" });
        return false;
      }
    }
    return true;
  }
  //审批
  onApprove(event){
    if (event["approvertype"] != "Reject") {
      if (this.applyDataValid() && this.redApplyForm.valid) {
        this.applyData.apply.wfstatus = "审批";
        this.saveApply(this.applyData, true);
      }
    }else{
      this.applyData.apply.wfstatus = "审批";
      this.saveApply(this.applyData, true);
      this.hasSaved = true;
    }
  }
  //取消按钮事件
  cancle(){
    this.applyData.apply.wfstatus = "审批";
    if(this.isApplyItcode && this.invoiceHasApprove) this.saveApply(this.applyData, "cancle");
    else window.close();
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
  downLoadFile(url){
    window.open(dbomsPath + url);
  }
  //根据id获取item [{id:"001", value:"公司"}]
  getNameById(arr: Array<any> = [], id, selectid){
    let name = null;
    if (selectid) {
      arr.forEach(item => {
        selectid == item[id] ? name = item : null;
      });
    }
    return name;
  }
  returnFactoryChange(value,saveToERPDatei){
    this.applyData.invoice[saveToERPDatei].ReturnSellFactory = value;
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
    // 排他
    this.saveToERPDataList.forEach(element => {
      element["active"] = false;
    });
    this.saveToERPDataList[i]["active"] = true;
    this.initIsERP();
  }
  //获取物料描述 冲成本
  getMaterialDesc(i, groupi, saveToERPDatei, item){
    let materialcode = String(item["materialcode"]).trim();
    this.saveToERPDataList[saveToERPDatei].group[groupi].material[i].description = "";
    if (materialcode && materialcode.length > 8) {
      this.redApplyService.getMaterialDesc(materialcode).subscribe(data => {
        if (data.Result) {
          this.saveToERPDataList[saveToERPDatei].group[groupi].material[i].description = data.Data;
        }
      });
    }
  }
  //表格添加一行
  addLineForMaterialCodeType(groupi, saveToERPDatei){
    let material = new Material();
    let length = this.saveToERPDataList[saveToERPDatei].group[groupi].material.length;
    material.projcode = (length+1)*10;
    this.saveToERPDataList[saveToERPDatei].group[groupi].material.push(material);
  }
  //表格删除一行
  delLineForMaterialCodeType(saveToERPDatei, groupi, i){
    this.saveToERPDataList[saveToERPDatei].group[groupi].material.splice(i, 1);
    this.saveToERPDataList[saveToERPDatei].group[groupi].material.forEach((item, index) => {
      item.projcode = (index+1) * 10;
    });
  }
  //价格更改类型 计算财务信息金额
  caleInvoiceMoney(groupi,material = [],internalinvoiceno){
    if (this.materialType === 0 && groupi > 0) {
      this.applyData.invoice.forEach((invoiceItem, invoiceIndex) => {
        if (invoiceItem.internalinvoiceno == internalinvoiceno) {
          let money = 0;
          material.forEach(materialitem => {
            money += (materialitem.money - materialitem.backmoney);
          });
          this.applyData.invoice[invoiceIndex].money = money;
        }
      });
    }
  }

  //编辑临时地址
  editTemporaryAddress(){
    // this.temporaryAddressModalType = true;
    let temporaryaddress = this.temporaryAddressDataSource.filter(item => { return item.active == true; });
    if(temporaryaddress.length == 0) temporaryaddress.push(new TemporaryAddress());
    else this.addressIndex = this.temporaryAddressDataSource.indexOf(temporaryaddress[0]);
    this.temporaryAddressDataSource.forEach(item => { item.active = false; });
    this.addressModal.show({data:temporaryaddress[0]});//显示弹出框
  }

  //临时地址模态窗关闭时事件
  onReturnAddaddressModalHide = temporaryaddress => {
    //
  }
  checkReturnNum(saveToERPDatei, groupi, i){
    let orginNum = this.saveToERPDataList[saveToERPDatei].group[groupi].material[i].originalnum;
    let num = this.saveToERPDataList[saveToERPDatei].group[groupi].material[i].returnnum;
    if(Number(num) > Number(orginNum)){
      this.windowService.alert({ message: "数量不能大于原单销售数量!", type: "fail" });
      this.saveToERPDataList[saveToERPDatei].group[groupi].material[i].returnnum = 0;
    }
  }

  delPositiveDoc(saveToERPDatei){
    this.saveToERPDataList[saveToERPDatei].group.splice(1,1);
    this.saveToERPDataList[saveToERPDatei].hasSaveToERPXutui = true;
  }
/** 冲退明细 end */
}
