// 预下单采购申请页面-主页面
import { Component, OnInit, DoCheck } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
declare var window: any;
declare var $: any;

import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Person } from 'app/shared/services/index';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { SubmitMessageService } from '../../services/submit-message.service';
import { ShareDataService } from './../../services/share-data.service';
import { ShareMethodService } from './../../services/share-method.service';
import { ProcumentOrderNewService } from './../../services/procumentOrder-new.service';
import { PurchaseContractInfo } from '../../services/purchase-contractInfo.service';
import {
    ContractApply, ContractPersonElement
} from './../../services/contractApply-submit.service';
import { RecordAllowEditStateService, RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";

@Component({
    templateUrl: 'contractApply-submit.component.html',
    styleUrls: ['contractApply-submit.component.scss', './../../scss/procurement.scss']
})
export class ContractApplySubmitComponent implements OnInit {
    // part1-基础信息-start
    userInfo = new Person();//登录人头像
    selectInfo = {//平台下拉框数据
        plateInfo: []
    }
    avtivePlate;//平台-当前选项
    plateStr = "";//基本信息中 平台变化时 传入用印的字符串
    // part1-基础信息-end
    // part2-采购信息-start
    haveContractIsDisable = false;//是否提交合同用印按钮 选择是否禁用
    // part2-采购信息-end
    // part3-采购清单-start
    procurementListShow = true;//采购清单显示标识
    erpIsDisable = false;//写入ERP按钮是否disable
    purchaseData = {//传进采购清单信息
        procurementList: [],
        untaxAmount: 0,//未税总金额
        taxAmount: 0,//含税总金额
        foreignAmount: 0//外币总金额
    }
    tempAmountPrice = 0;//编辑时 存一份总价
    listNumberAmount = 0;//编辑时 计算总数量
    // part3-采购清单-end
    // part4-销售信息-start
    sellMessageStructureComplete = false;//编辑状态时 是否完成 已有销售信息 拼接进 localStorage(contractList)
    // part4-销售信息-end
    // part5-支持文件&用印文件-start
    supportDocumentUrl = "api/PurchaseManage/UploadAccessory/0";//支持文件 上传路径
    AccessoryList_Support = [];//支持文件
    AccessorySee_Support = [];//查看支持文件
    editPrintInitialData;//编辑时 采购合同用印文件部分 初始信息
    // part5-支持文件&用印文件-end
    // part6-修改记录-start
    getModifyUrl;//查询修改记录 接口
    modifyRecord = [];//修改记录
    modifyPagerData = new Pager();//修改记录 分页
    // part6-修改记录-end
    // part7-审批人信息-start
    /**
     * 日期：2018-10-29
     * 说明：新增获取规则配置中的审批人列表
     */
    approvalListFromRule:any=[];//保存审批人
    contractPrintApproverList:any='';//保存用印审批人
    preparePersonList = [];//预审人员
    departmentApprovalList = [];//部门审批人员(除预审外的其他审批人员)
    wholeApprovalData = [];//全部的审批人员 信息
    approvalProcessID;//审批流程id
    wfHistory;//审批记录
    approveAboutPrintDa = [];//存用印相关的审批人员数据
    // part7-审批人信息-end
    // part8-整体-start
    saveData = new ContractApply();
    isOutsourcing = false;//是否外购
    IsRMB = true;//是否 人民币 标识
    wholeValid = {//整个页面的校验数据
        "applyMessageValid": true,//采购信息
        "applyListValid": true,//采购清单
        "contractPrintValid": true//合同用印
    }
    confirmSubmit = false;//确认提交 标识
    submiting = false;//提交中
    submitType = "";//暂存一份 用户提交的方式("提交"或"暂存")
    isSubmit = false;//是否提交
    supplierType = "";//供应商类型
    orderType = null;//写入ERP时 判断订单类型
    flowType;//流程类型

    isGetApproverListFormDetail:boolean=true;//当第一次进入详情时，从详情中获取审批人信息
    getApproverListErrorMessage:string='暂无配置的审批人';//保存获取规则时的错误提示
    // part8-整体-end    

    //记录可编辑状态
    recordAllowEditStateQuery: RecordAllowEditStateQuery = new RecordAllowEditStateQuery();


    constructor(private location: Location,
        private dbHttp: HttpServer,
        private SubmitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private WindowService: WindowService,
        private route: ActivatedRoute,
        private router: Router,
        private shareMethodService: ShareMethodService,
        private procumentOrderNewService: ProcumentOrderNewService,
        private recordAllowEditStateService: RecordAllowEditStateService
    ) { }

    ngOnInit() {
        //编辑权限验证-start
        var recordId = this.route.snapshot.params['id'];
        if(recordId) {
            this.recordAllowEditStateQuery.FunctionCode = '21';//请求查询的模块代码
            this.recordAllowEditStateQuery.RecordID = recordId;//页面的主键ID
            this.recordAllowEditStateQuery.NotAllowEditLink = `/procurement/deal-contractapply/${recordId}`;
            this.recordAllowEditStateQuery.NotFoundRecordLink = `/procurement/procurement-apply/my-apply`;
            this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);            
        }
        //编辑权限验证-end

        this.saveData.PurchaseContractInfo = new PurchaseContractInfo();
        for (let i = 0; i < 4; i++) {//先默认让整体流程信息 至少长度为4
            this.wholeApprovalData.push(new ContractPersonElement());//前4个预审人员信息
        }
        let user = JSON.parse(localStorage.getItem("UserInfo"));
        if (user) {//获取登录人头像信息
            this.userInfo["userID"] = user["ITCode"];
            this.userInfo["userEN"] = user["ITCode"].toLocaleLowerCase();
            this.userInfo["userCN"] = user["UserName"];
        } else {
            // this.router.navigate(['/login']); // 未登录 跳转到登录页面
        }
        this.shareDataService.getPlatformSelectInfo().then(data => {//获取平台下拉数据
            this.selectInfo.plateInfo = data;
        });
        this.saveData.purchaserequisitionid = this.route.snapshot.params['id'];//从路由中取出变量id的值
        if (this.saveData.purchaserequisitionid) {//编辑
            this.getProcurementData(this.saveData.purchaserequisitionid);
        } else {//新建
            this.shareDataService.getCurrentUserInfo().then(loginData => {//获取登录人信息
                this.saveData.phone = loginData.Phone;
                this.saveData.itcode = loginData.ITCode;
                this.saveData.username = loginData.UserName;
                this.saveData.homeoffice = loginData.BBMC;//本部
                this.saveData.bizdivision = loginData.SYBMC;//事业部
                this.saveData.YWFWDM = loginData.YWFWDM;//业务范围代码
                this.saveData.FlatCode = loginData.FlatCode;//平台代码
                this.saveData.plateform = loginData.FlatName;//平台
                this.avtivePlate = [{//显示平台
                    id: loginData.FlatCode,
                    text: loginData.FlatName
                }];
                let body = {
                    id: loginData.FlatCode,
                    name: loginData.FlatName
                }
                this.plateStr = JSON.stringify(body);

                
            this.isGetApproverListFormDetail=false;//开放动态获取审批人
            })
        }

    }
    ngDoCheck() {
        if (this.confirmSubmit) {//校验通过提交
            this.SubmitContractApply();
        }
    }

    // part1-基础信息-start
    getPlateform(e) {//平台选择
        this.saveData.FlatCode = e.id;//平台代码
        this.saveData.plateform = e.text;//平台
        this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);
        let body = {
            id: e.id,
            name: e.text
        }
        this.plateStr = JSON.stringify(body);
    }
    // part1-基础信息-end

    // part2-采购信息-start
    onConApplyMessageChange(e) {//当 采购信息数据 变化
        $.extend(this.saveData, e);//保存到整体
    }
    onContractApplyMessageValidChange(e) {//当 采购信息表单校验 变化
        this.wholeValid.applyMessageValid = e;
    }
    onFacVendChange(e) {//当 工厂代码和供应商代码 变化
        if (e.factory && e.vendorno) {
            this.getFlow(e.factory, e.vendorno, this.saveData.istoerp, this.saveData.companycode);
        }
        this.judgeOrderType(e.vendorno);
    }
    onIsRMBChange(e) {//当 是否人民币 变化
        this.IsRMB = e;
    }
    onCompanyCodeChange(e) {//当 公司代码(我方主体) 变化
        this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, e);
    }

    /**
    *说明：新增验证，当未税金额变化的时候
    */
   onAmountMoney(){
    this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);        
}

    onSupplierTypeChange(e) {//当 供应商类型 变化
        this.supplierType = e;
        this.judgeOrderType();
        if (e == "非核心") {
            this.isOutsourcing = true;
        } else {
            this.isOutsourcing = false;
        }
        if (this.isOutsourcing && !this.saveData.istoerp) {
            this.directlyChange(true);//是外购时，必须写入ERP
        }
        this.erpIsDisable = this.isOutsourcing;
    }
    onVendorTraceChange(e) {//当 供应商是否过期变化
        this.saveData.VendorTrace = e;
        this.judgeOrderType();
    }
    onHaveContractInfoChange(e) {//当 是否提交合同用印 变化
        this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);
    }
    massageValid() {//验证采购信息
        let self = this;
        let alertFun = function (val, str) {
            if (!val && str != '税率') {
                self.WindowService.alert({ message: '采购信息中' + str + '不能为空', type: 'warn' });
                return;
            }
            if (str == '税率' && val == null) {
                self.WindowService.alert({ message: '采购信息中税率不能为空', type: 'warn' });
                return;
            }
        }
        alertFun(this.saveData.company, "我方主体");
        alertFun(this.saveData.factory, "工厂");
        alertFun(this.saveData.vendor, "供应商");
        alertFun(this.saveData.taxrate, "税率");
        alertFun(this.saveData.currency, "币种");
        alertFun(this.saveData.preselldate, "预售日期");
        // alertFun(this.saveData.Po, "厂商PO号");
        alertFun(this.saveData.SendType, "发货方式");

        if (this.saveData.VendorCountry == 1) {//国外
            alertFun(this.saveData.internationaltradelocation, "国际贸易地点");
            alertFun(this.saveData.internationaltradeterms, "国际贸易条件");
            alertFun(this.saveData.receiver, "收货人");
        }

        if (this.saveData.IsPartial==''||this.saveData.IsPartial==null) {
            this.WindowService.alert({ message: '请选择是否分批采购', type: 'warn' });
        }

        if (this.saveData.IsHaveContractInfo == null) {
            this.WindowService.alert({ message: '请选择是否提交合同用印', type: 'warn' });
        }


    }
    // part2-采购信息-end

    // part3-采购清单-start
    onPurchaseDataChange(e) {//采购清单信息变化
        this.saveData.PurchaseRequisitionDetailsList = e.procurementList;
        if (e.procurementList && e.procurementList.length) {//有清单时 改变总金额和用印金额
            this.saveData.excludetaxmoney = e.untaxAmount;
            this.saveData.taxinclusivemoney = e.taxAmount;
            this.saveData.foreigncurrencymoney = e.foreignAmount;
            this.saveData.PurchaseContractInfo.ContractMoney = Number(e.taxAmount).toFixed(2);
            this.judgeOrderType();
        }
    }
    directlyChange(e) {//是否写入ERP变化
        if (String(e) == "true") {
            this.saveData.istoerp = Boolean(1);
        } else {
            this.saveData.istoerp = Boolean(0);
        }
        this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);
        this.judgeOrderType();
    }
    onPurchaseFormValidChange(e) {//采购清单校验发生变化
        this.wholeValid.applyListValid = e;
    }
    delPurchaseFormListBlank() {//删除采购清单空白项
        let i; let item;
        let len = this.saveData.PurchaseRequisitionDetailsList.length;
        for (i = 0; i < len; i++) {
            item = this.saveData.PurchaseRequisitionDetailsList[i];
            if (!item.MaterialNumber && !item.Count && !item.Price
                && !item.StorageLocation && !item.Batch && !item.MaterialSource) {
                this.saveData.PurchaseRequisitionDetailsList.splice(i, 1);
                len--;
                i--;
            }
        }
    }
    fillPurchaseList() {//填充采购清单的 需求跟踪号
        this.saveData.PurchaseRequisitionDetailsList.forEach(item => {
            if (!item.traceno) {
                item.traceno = this.saveData.traceno;
            }
        })
    }

    //验证需求跟踪号是否相同
    testTrackingNumber() {
        let invalidStatus: boolean;//验证状态
        if (this.saveData.PurchaseRequisitionDetailsList.some(item => item.traceno !== this.saveData.traceno)) {
            invalidStatus = true;
        } else {
            invalidStatus = false;
        }
        return invalidStatus;
    }

    purchaseFormAccurateValid() {//采购清单精确进行校验 
        let self = this;
        let alertFun = function (val, str) {
            if (str == '库存地') {//库存地
                if (val && val.length != 4) {
                    self.WindowService.alert({ message: '请输入4位库存地', type: 'warn' });
                    return;
                }
            } else if (!val) {//非库存地
                self.WindowService.alert({ message: '采购清单中' + str + '不能为空', type: 'warn' });
                return;
            }
        }
        this.saveData.PurchaseRequisitionDetailsList.forEach((item, index) => {
            alertFun(item.MaterialNumber, '物料编号');
            alertFun(item.Count, '数量');
            alertFun(item.Price, '未税单价');
            alertFun(item.StorageLocation, '库存地');
            alertFun(item.MaterialSource, '销售合同号');
        })
    }
    // part3-采购清单-end

    // part4-销售信息-start
    onSellListChange(e) {//当 销售信息 变化
        this.saveData.PurchaseRequisitionSaleContractList = e;
        if (!this.saveData.PurchaseRequisitionDetailsList || !this.saveData.PurchaseRequisitionDetailsList.length) {//没有清单
            let totalExcludetaxmoney = 0;//累计未税总额
            let totalTaxinclusivemoney = 0;//累计含税总额
            let totalForeigncurrencymoney = 0;//累计外币总额
            for (let i = 0, len = e.length; i < len; i++) {
                totalExcludetaxmoney += Number(e[i].excludetaxmoney);//未税
                totalTaxinclusivemoney += Number(e[i].taxinclusivemoney);//含税
                if (!this.IsRMB) {//外币情况
                    totalForeigncurrencymoney += Number(e[i].foreigncurrencymoney);//外币
                }
            }
            this.saveData.excludetaxmoney = totalExcludetaxmoney;//未税总金额
            this.saveData.taxinclusivemoney = totalTaxinclusivemoney;//含税总金额
            this.saveData.PurchaseContractInfo.ContractMoney = totalTaxinclusivemoney.toFixed(2);//用印金额
            if (!this.IsRMB) {
                this.saveData.foreigncurrencymoney = totalForeigncurrencymoney;//外币总金额
            }
            this.judgeOrderType();
        }
        this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);
    }
    // part4-销售信息-end

    // part5-支持文件&用印文件-start
    onUploadBack(e, type) {//文件上传返回
        if (e.Result) {
            if (type == 1) {
                this.AccessoryList_Support.push(e.Data);
            }
        }
    }
    onDeleteItem(e, type) {//删除文件
        if (type == 1) {
            this.AccessoryList_Support.splice(e, 1);
        }
    }
    onPrintMessageChange(e) {//当 用印整体信息 变化
        this.saveData.PurchaseContractInfo = e;
        //当用印审批人变化时，重新获取审批人列表
        this.getContractPrintApproverList(e["UserSetting"]);
        this.approveAboutPrintDa = this.SubmitMessageService.createApprovePrintUseData(e["UserSetting"], this.departmentApprovalList);
    }
    onContractPrintFormValidChange(e) {//当 用印整体 校验变化
        this.wholeValid.contractPrintValid = e;
    }
    contractPrintFormAccurateValid() {//用印合同块 精确校验
        let self = this;
        let alertFun = function (val, str) {
            if (!val && str != '用印金额') {
                self.WindowService.alert({ message: '合同用印中' + str + '不能为空', type: 'warn' });
                return;
            }
            if (str == '用印金额' && val == null) {
                self.WindowService.alert({ message: '合同用印中用印金额不能为空', type: 'warn' });
                return;
            }
        }
        alertFun(this.saveData.PurchaseContractInfo.ContractName, "合同名称");
        alertFun(this.saveData.PurchaseContractInfo.ContractMoney, "用印金额");
        alertFun(this.saveData.PurchaseContractInfo.Platform_C_ID, "用印平台");
        alertFun(this.saveData.PurchaseContractInfo.ContractContent, "合同内容摘要");
    }
    // part5-支持文件&用印文件-end

    // part6-修改记录-start
    onChangeModifyPage = function (e) {//修改记录 分页
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        if (this.getModifyUrl) {
            this.dbHttp.get(this.getModifyUrl + "/" + e.pageNo + "/" + e.pageSize, options)
                .subscribe((data) => {
                    if (data.Result) {
                        this.modifyRecord = data.Data.List;
                        this.modifyPagerData.set({
                            total: data.Data.TotalCount,
                            totalPages: data.Data.PageCount
                        })
                    }
                });
        }
    }
    viewApplyDetail(id) {//查看修改记录中-记录
        window.open(dbomsPath + 'procurement/deal-contractapply/' + id);
    }
    // part6-修改记录-end

    // part7-审批-start
    onGetWfHistoryData(applyid) {//获取审批历史
        let url = "PurchaseManage/RequisitionApproveHistory/" + applyid;//获取流程和审批历史
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, [], options).subscribe(data => {
            if (data.Result) {
                let res = JSON.parse(data.Data);
                this.wfHistory = res.wfHistory;
                if (this.wfHistory && this.wfHistory.length) {
                    this.wfHistory.reverse();//颠倒
                }
                console.log("审批流程信息");
                console.log(this.wfHistory);
            }
        })
    }
    getFlow(factory, vendorno, istoerp, companycode) {//获得流程节点审批人信息
        if (factory && vendorno) {
            this.shareMethodService.judgeSupplierType(factory, vendorno)
                .then(data => {//判断供应商类型
                    if (data.Result) {
                        let tempType = data.Data;
            
                        if (tempType == "核心" || tempType == "新产品") {
                            this.shareMethodService.judgeSupplierOverdue(vendorno).then(data => {
                                if (data.Result) {
                                    if (data.Data == 0) {

                                        //如果供应商编号的前两位为”10“，则为核心供应商
                                        if (vendorno.substring(0, 2) === '10') {
                                            this.getFlowStepTwo(tempType, istoerp, companycode);
                                        } else {
                                            // 供应商是核心或新产品，但是供应商是无效，则按照非核心走采购申请流程
                                            this.getFlowStepTwo("非核心", true, companycode);
                                        }

                                    } else {
                                        this.getFlowStepTwo(tempType, istoerp, companycode);
                                    }
                                }
                            })
                        } else {
                            this.getFlowStepTwo(tempType, istoerp, companycode);
                        }


                        /**
                         * 日期：2018-10-29
                         * 说明：新增逻辑，获取规则配置中的审批人列表
                         */

                        this.saveData.VendorClass=data.Data;//保存供应商类型
                         
                        if(this.saveData.companycode&&this.saveData.factory&&this.saveData.purchaserequisitiontype&&this.saveData.YWFWDM&&this.saveData.VendorClass&&this.saveData.excludetaxmoney>0&&!this.isGetApproverListFormDetail){
                            this.getApproverList();
                        }

                    }
                })
        }
    }
    getFlowStepTwo(tempType, istoerp, companycode) {//获得流程节点审批人信息 第二步
        if (tempType == "非核心") {
            this.saveData.istoerp = true;//非核心流程(NK类型)：必须写入ERP
            this.erpIsDisable = true;
            this.saveData.IsHaveContractInfo = true;//非核心流程：是否提交合同用印 是 不许修改
            this.haveContractIsDisable = true;
        } else {
            this.erpIsDisable = false;
            this.haveContractIsDisable = false;
        }
        this.flowType = tempType;
        let url = "PurchaseManage/GetWorkFlowConfigInfo_Purchase";//获得流程节点审批人信息
        let body = {
            "FlatCode": this.saveData.FlatCode,/*平台代码*/
            "BizScopeCode": this.saveData.YWFWDM, /*登录人的所属业务范围代码*/
            "WorkFlowCategory": "" /*流程类型*/
        }
        if (tempType == "新产品") {
            body.WorkFlowCategory = "NEWPRODUCT_CONTRACT";
        }
        if (tempType == "核心") {
            body.WorkFlowCategory = "CORE_CONTRACT";
        }
        if (tempType == "非核心") {
            body.WorkFlowCategory = "NOCORE_CONTRACT";
        }

        /**
         * 说明：新增从采购申请规则中获取审批人，
         * 所以此处不需要获取审批流程
         */

        // let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        // let options = new RequestOptions({ headers: headers });
        // this.dbHttp.post(url, body, options).subscribe(data => {
        //     if (data.Result) {
        //         this.wholeApprovalData = JSON.parse(data.Data);//整体审批人员数据
        //         this.departmentApprovalList
        //             = this.SubmitMessageService.transformApprovePersonList(this.wholeApprovalData, this.saveData.excludetaxmoney,
        //                 companycode, istoerp, null, null, this.saveData.IsHaveContractInfo);//除预审外 需要展示的审批人信息
        //         for (let k = 0, lenk = this.departmentApprovalList.length; k < lenk; k++) {//返回的流程没有填充用印部分 需手动添加
        //             if (this.departmentApprovalList[k]["NodeID"] == 18) {
        //                 this.departmentApprovalList[k]["userData"] = this.approveAboutPrintDa;
        //             }
        //         }
        //     }
        // })
    }

     /**
     * 说明：新增方法，用于获取采购申请规则中配置好的流程审批人
     */
    //获取流程审批人列表
    getApproverList(){
        this.SubmitMessageService.getApproverList(this.saveData).then(data=>{
            if(data.Result){
                this.getApproverListErrorMessage='';//清空错误信息
                this.approvalListFromRule=JSON.parse(data.Data);
                this.saveData.WFApproveUserJSON=data.Data;//将获取到的审批人配置信息保存进入请求实体
                 console.log('已发送请求',this.approvalListFromRule);
            }else{
                this.getApproverListErrorMessage='没有对应此采购申请的审批规则，请检查申请单数据或在规则配置中设置对应规则';
                this.approvalListFromRule=[];//如果没有获取到规则，则重置审批人列表
                
                // this.WindowService.alert({message:'没有对应此采购申请的审批规则，请检查申请单数据或在规则配置中设置对应规则',type:'fail'}).subscribe(()=>{
                //     this.approvalListFromRule=[];//如果没有获取到规则，则重置审批人列表
                // });
            }
        });
      }


    //获取审批人信息
    getApprovalPerson() {
        let url = "PurchaseManage/GetWorkFlowConfigInfo_Purchase";//获得流程节点审批人信息
        let body = {
            "FlatCode": this.saveData.FlatCode,/*平台代码*/
            "BizScopeCode": this.saveData.YWFWDM, /*登录人的所属业务范围代码*/
            "WorkFlowCategory": "" /*流程类型*/
        }
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, body, options).subscribe(data => {
            if (data.Result) {
                this.wholeApprovalData = JSON.parse(data.Data);//整体审批人员数据
                this.departmentApprovalList
                    = this.SubmitMessageService.transformApprovePersonList(this.wholeApprovalData, this.saveData.excludetaxmoney,
                        this.saveData.companycode, this.saveData.istoerp, null, null, this.saveData.IsHaveContractInfo);//除预审外 需要展示的审批人信息

                for (let k = 0, lenk = this.departmentApprovalList.length; k < lenk; k++) {//返回的流程没有填充用印部分 需手动添加
                    if (this.departmentApprovalList[k]["NodeID"] == 18) {
                        this.departmentApprovalList[k]["userData"] = this.approveAboutPrintDa;
                    }
                }
            }
        })
    }

    // part7-审批-end

    // part8-整体-start
    getProcurementData(id) {//获取采购整体数据
        let url = "PurchaseManage/GetPurchaseRequisitionById/" + id;
        this.dbHttp.get(url).subscribe(data => {
            if (data.Result) {
                let localWholeData = JSON.parse(data.Data);
                this.saveData = JSON.parse(data.Data);
                console.log("编辑的整单数据");
                console.log(this.saveData);

                this.approvalListFromRule=this.saveData.WFApproveUserJSON?JSON.parse(this.saveData.WFApproveUserJSON):'';//保存详情中存入的审批人序列
                this.saveData.WFApproveUserJSON?this.getApproverListErrorMessage='':'';//如果详情中存在保存的审批人，则将获取审批人的错误提示清空                
                this.contractPrintApproverList=this.approvalListFromRule?this.approvalListFromRule.filter(item=>item.NodeID===18)[0].UserSettings:'';//保存已经详情中的用印审批人

                // #1-基础信息
                this.avtivePlate = [{//显示平台
                    id: this.saveData.FlatCode,
                    text: this.saveData.plateform
                }];
                // #2-采购信息
                // #3-采购清单
                if (this.saveData.PurchaseRequisitionDetailsList && this.saveData.PurchaseRequisitionDetailsList.length) {//有list计算 总数量
                    this.purchaseData.untaxAmount = this.saveData.excludetaxmoney;
                    this.purchaseData.taxAmount = this.saveData.taxinclusivemoney;
                    this.purchaseData.foreignAmount = this.saveData.foreigncurrencymoney;
                    if (this.saveData.currencycode == "RMB") {//是人民币
                        this.tempAmountPrice = this.saveData.excludetaxmoney;
                    } else {
                        this.tempAmountPrice = this.saveData.foreigncurrencymoney;
                    }
                    this.saveData.PurchaseRequisitionDetailsList.forEach(item => {
                        item.Price = Number(item.Price).toFixed(2);
                        item.Amount = Number(item.Amount).toFixed(2);
                        if (item.Count) {
                            this.listNumberAmount += (item.Count - 0);//物料数量合计
                        }
                    })
                }
                this.purchaseData.procurementList = this.saveData.PurchaseRequisitionDetailsList;
                // #4-销售信息
                let existContractList = [];
                this.saveData.PurchaseRequisitionSaleContractList.forEach(item => {//拼接合同列表
                    existContractList.push({
                        'SC_Code': item.salecontractcode,
                        'MainContractCode': item.MainContractCode,
                        'excludetaxmoney': item.excludetaxmoney,//保存编辑下的金额 给销售信息显示
                        'taxinclusivemoney': item.taxinclusivemoney,
                        'foreigncurrencymoney': item.foreigncurrencymoney
                    })
                })
                window.localStorage.setItem("contractList", JSON.stringify(existContractList));
                this.sellMessageStructureComplete = true;//拼接完成 标识
                // #5-支持文件&用印文件
                let i; let len = this.saveData.AccessoryList.length;
                for (i = 0; i < len; i++) {//去除附件数组中的空值
                    if (!this.saveData.AccessoryList[i]) {
                        this.saveData.AccessoryList.splice(i, 1);
                        len--;
                        i--;
                    }
                }
                this.saveData.AccessoryList.forEach(item => {//分离 支持文件和用印文件
                    if (item.AccessoryType == "20") {
                        this.AccessorySee_Support.push({
                            name: item.AccessoryName
                        })
                        this.AccessoryList_Support.push(item);
                    }
                })
                this.editPrintInitialData = this.saveData.PurchaseContractInfo;
                // #6-修改记录
                this.getModifyUrl = "PurchaseManage/GetRequisitionRecord/" + this.saveData.requisitionnum;
                this.dbHttp.get(this.getModifyUrl + "/" + 1 + "/" + 10).subscribe(data => {//获取记录
                    if (data.Result) {
                        this.modifyRecord = data.Data.List;
                        this.modifyPagerData.set({
                            total: data.Data.TotalCount,
                            totalPages: data.Data.PageCount
                        })
                    }
                })
                // #7-审批
                if (localWholeData.wfid) {//驳回时获取当前审批信息
                    let wfidUrl = "PurchaseManage/GetCurrentTaskId/" + localWholeData.wfid;
                    this.dbHttp.get(wfidUrl).subscribe(data => {
                        this.approvalProcessID = JSON.parse(data.Data)[0];
                    })
                }
                // this.wholeApprovalData = localWholeData.WFApproveUserJSON?JSON.parse(localWholeData.WFApproveUserJSON):'';
                // this.wholeApprovalData = this.SubmitMessageService.getPersonList(this.wholeApprovalData);//预审人员 数据格式转化
                console.log(this.wholeApprovalData,this.wholeApprovalData)
                this.departmentApprovalList
                    = this.SubmitMessageService.transformApprovePersonList(this.wholeApprovalData, this.saveData.excludetaxmoney,
                        this.saveData.companycode, this.saveData.istoerp, null, null, this.saveData.IsHaveContractInfo);//除预审外 需要展示的审批人信息
                this.approveAboutPrintDa = this.SubmitMessageService.separateprintDataFromWhole(this.wholeApprovalData);
                if (this.saveData.wfstatus == "驳回") {//是驳回单子 显示审批记录
                    this.onGetWfHistoryData(this.saveData.purchaserequisitionid);
                }

                /**
                 * 说明：因为子组件的监听事件会在值变化时执行，所以导致重新获取审批人，
                 * 但是当详情中存在以保存的审批人时，需要在第一次从详情中获取，不用重新从请求中获取，
                 * 因此采用setTimeout()，让子组件的变更监测时，不重新获取审批人
                 */
                setTimeout(()=>{
                    this.isGetApproverListFormDetail=false;
                },3000);

            } else {
                this.WindowService.alert({ message: '接口异常', type: 'fail' });
            }
        })
    }
    VerificateContractApply(type) {//验证采购申请
        // #0-草稿提交的处理-start
        this.confirmSubmit = false;
        this.submitType = type;
        if (this.saveData.wfstatus != "驳回") {//是驳回单子 不修改状态
            this.saveData.wfstatus = type;
        }
        this.delPurchaseFormListBlank();//删除空的采购清单
        this.saveData.AccessoryList = this.AccessoryList_Support;//附件
        if (this.preparePersonList && this.preparePersonList.length && this.wholeApprovalData.length>0) {
            for (let i = 0, len = this.preparePersonList.length; i < len; i++) {//把预审人员信息 拼接进整体存储数据
                let item = this.preparePersonList[i];
                this.wholeApprovalData[i]["UserSettings"] = [];
                if (item.person && item.person.length) {
                    this.wholeApprovalData[i]["UserSettings"].push({
                        "ITCode": item.person[0].itcode,
                        "UserName": item.person[0].name
                    })
                }
                this.wholeApprovalData[i]["UserSettings"] = JSON.stringify(this.wholeApprovalData[i]["UserSettings"]);
                this.wholeApprovalData[i]["IsOpened"] = 1;
            }
            this.SubmitMessageService.printDataContantToWhole(this.approveAboutPrintDa, this.wholeApprovalData);
            // this.saveData.WFApproveUserJSON = JSON.stringify(this.wholeApprovalData);//格式转化
        }
        if (type == "草稿") {
            this.confirmSubmit = true;//直接提交
            return;
        } else {
            this.isSubmit = true;
        }
        // #0-草稿提交的处理-end

        // #1-基础信息-start
        if (!this.saveData.phone) {
            this.WindowService.alert({ message: '联系方式不能为空', type: 'warn' });
            return;
        }
        if (!this.saveData.FlatCode || !this.saveData.plateform) {//平台验证(一般情况下都有值)
            this.WindowService.alert({ message: '平台不能为空', type: 'warn' });
            return;
        }
        // #1-基础信息-end

        // #2-采购信息-start
        if (!this.wholeValid.applyMessageValid) {//采购信息
            this.massageValid();
            return;
        }
        if (!this.saveData.currency) {
            this.WindowService.alert({ message: '采购信息中币种不能为空', type: 'warn' });
            return;
        }
        // if (!this.saveData.Po) {//厂商PO号
        //     this.WindowService.alert({ message: '采购信息中厂商PO号不能为空', type: 'warn' });
        //     return;
        // }
        if (!this.saveData.SendType) {//发货方式
            this.WindowService.alert({ message: '采购信息中发货方式不能为空', type: 'warn' });
            return;
        }
        if (this.saveData.IsPartial===''||this.saveData.IsPartial==null) {//是否分批采购
            this.WindowService.alert({ message: '请选择是否分批采购', type: 'warn' });
            return;
        }
        let localvendorno = "";
        localvendorno = JSON.stringify(Number(this.saveData.vendorno));
        if (localvendorno.substring(0, 2) == "10" && !this.saveData.vendorbizscope) {
            this.WindowService.alert({ message: '内部供应商000100开头时对方业务范围为必填', type: 'warn' });
            return;
        }
        if (!this.saveData.istoerp && !this.saveData.excludetaxmoney) {//不写入ERP时 总额必须大于0
            this.WindowService.alert({ message: '不写入ERP时,采购金额不允许为0', type: 'warn' });
            return;
        }
        if (this.saveData.istoerp && !this.saveData.traceno) {//需求跟踪号
            this.WindowService.alert({ message: '写入ERP时，需求跟踪号不能为空', type: 'warn' });
            return;
        }
        if (this.saveData.istoerp && !this.saveData.paymenttermscode) {//付款条款
            this.WindowService.alert({ message: '写入ERP时，付款条款不能为空', type: 'warn' });
            return;
        }

        if (this.saveData.traceno) {//需求跟踪号 是否存在 验证
            this.shareMethodService.checkApplyTracenoExist(this.saveData.traceno, this.saveData.purchaserequisitionid)
                .then(data => {
                    if (!data) {
                        this.WindowService.alert({ message: "采购信息中需求跟踪号已存在，请重新输入", type: 'fail' });
                        this.saveData.traceno = "";
                        return;
                    } else {
                        this.viableTracenoAfterVerificate();
                    }
                });
        } else {//不写入ERP 没填写 需求跟踪号
            this.viableTracenoAfterVerificate();
        }
        // #2-采购信息-end
    }
    viableTracenoAfterVerificate() {//需求跟踪号 可行 继续进行后面的校验
        //因为需求跟踪号检查为异步 所以在请求完后才能进行

        // #3-采购清单-start
        if ((this.isOutsourcing || this.saveData.istoerp) &&
            (!this.saveData.PurchaseRequisitionDetailsList || !this.saveData.PurchaseRequisitionDetailsList.length)) {
            //外购或写入ERP时 清单必须有一条
            if (this.saveData.istoerp) {
                this.WindowService.alert({ message: '写入ERP时,采购清单至少应填写一条', type: 'warn' });
                return;
            }
            this.WindowService.alert({ message: '外购时,采购清单至少应填写一条', type: 'warn' });
            return;
        }
        if (!this.wholeValid.applyListValid) {//采购清单校验未通过
            this.purchaseFormAccurateValid();
            return;
        }
        this.fillPurchaseList();

        //验证需求跟踪号是否与采购清单中的需求跟踪号相同
        if (this.testTrackingNumber()) {
            this.WindowService.alert({ message: "采购清单中的需求跟踪号，必须与采购信息中的需求跟踪号相同", type: "fail" }, { autoClose: true, closeTime: 8000 });
            return;
        }

        // #3-采购清单-end

        // #4-销售信息-start
        if (this.flowType == '非核心' &&
            this.saveData.PurchaseRequisitionSaleContractList && this.saveData.PurchaseRequisitionSaleContractList.length > 1) {
            this.WindowService.alert({ message: '非核心采购只允许选择一个合同', type: 'warn' });
            return;
        }
        // #4-销售信息-end

        // #5-支持文件&用印文件-start
        if (this.saveData.IsHaveContractInfo) {
            if (!this.wholeValid.contractPrintValid) {//合同用印校验未通过
                this.contractPrintFormAccurateValid();
                return;
            }
            if (!this.saveData.PurchaseContractInfo.PurchaseContractInfoAccessories
                || !this.saveData.PurchaseContractInfo.PurchaseContractInfoAccessories.length) {
                this.WindowService.alert({ message: '合同用印中附件不能为空', type: 'warn' });
                return;
            }
            if (!this.saveData.PurchaseContractInfo.SealInfoJson ||
                this.saveData.PurchaseContractInfo.SealInfoJson == '{"SealData":[],"PrintCount":"4"}') {
                this.WindowService.alert({ message: '合同用印中印章不能为空', type: 'warn' });
                return;
            }
        }
        // #5-支持文件&用印文件-end

        /**
         * 新增验证
         * 验证所有审批人是否选择
         */
        if(this.approvalListFromRule.length===0||this.approvalListFromRule.filter(item=>item.IfRequired===1&&!item.RuleExpressionJSON).some(item=>!item.UserSettings)){
            this.WindowService.alert({message:"请选择审批人",type:"fail"});
            return;
        }

        //#6-检查利润中心状态-start
        let facStr = this.saveData.companycode.substring(2, 4) + this.saveData.factory.substring(2, 4) + "01";
        this.shareMethodService.getProfitCenterState(facStr)
            .then(data => {//获取利润中心 状态
                if (data.Result) {//可提交
                    //#7-维护采购清单的处理-start
                    this.maintainProcurementListDeal();
                    //#7-维护采购清单的处理-end
                } else {
                    this.WindowService.alert({ message: data.Message, type: 'warn' });
                }
            });
        //#6-检查利润中心状态-end
    }
    SubmitContractApply() {//验证通过后 提交采购申请
        this.submiting = true;
        this.saveData.PurchaseRequisitionDetailsList.forEach(item => {
            if ('isExcel' in item) {
                delete item["isExcel"];
            }
        });
        this.saveData.VendorCountry = Number(this.saveData.VendorCountry);
        console.log("提交的整条数据");
        console.log(this.saveData);
        console.log(JSON.stringify(this.saveData));

        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post("PurchaseManage/SavePurchaseRequisition", this.saveData, options).subscribe(data => {
            this.submiting = false;
            if (data.Result) {
                if (!this.saveData.purchaserequisitionid) {//新建
                    window.localStorage.removeItem('contractList');
                }
                if (this.submitType == "提交") {//提交
                    this.WindowService.alert({ message: "提交成功", type: 'success' });
                } else {//暂存
                    this.WindowService.alert({ message: "保存成功", type: 'success' });
                }
                this.router.navigate(['procurement/procurement-apply/my-apply']);
                if (this.approvalProcessID && this.submitType == "提交") {//驳回单子 再提交时 发起流程
                    let url = "PurchaseManage/ApproveRequisition";
                    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
                    let options = new RequestOptions({ headers: headers });
                    let body = {
                        "taskid": this.approvalProcessID,//任务id
                        "opinions": "重新提交",//审批意见
                        "approveresult": "Approval"//批准：Approval，拒绝：Reject
                    }
                    this.dbHttp.post(url, body, options).subscribe(data => {
                        console.log(data.Data);
                    })
                }
            } else if (data.status == "401") {
                this.WindowService.alert({ message: "您没有提交权限", type: 'fail' });
            } else {
                this.WindowService.alert({ message: data.Message, type: 'fail' });
            }
        })
        this.confirmSubmit = false;
    }
    judgeOrderType(vendorno = this.saveData.vendorno) {//判断订单类型
        //变化触发：供应商类型，供应商代码，供应商是否过期，未税总金额，写入ERP
        //有值：供应商类型，供应商代码，有金额，写入ERP
        if (this.supplierType && vendorno
            && (this.saveData.excludetaxmoney || this.saveData.PurchaseRequisitionDetailsList.length)) {//判断 采购订单 类型
            this.procumentOrderNewService.judgeProcumentOrderType(this.supplierType,
                vendorno, this.saveData.excludetaxmoney, this.saveData.VendorTrace).then(response => {
                    if (response) {
                        if (response == "NC") {
                            this.orderType = "国内NC";
                        } else if (response == "NC_2") {
                            this.orderType = "国际NC";
                        } else {
                            this.orderType = response;
                        }
                        this.saveData.purchasetype = response;
                    }
                })
        } else {
            this.orderType = null;
            this.saveData.purchasetype = null;
        }
    }
    // part8-整体-end

    // part9-其他-start
    maintainProcurementListDeal() {//维护采购清单的处理
        if (this.saveData.PurchaseRequisitionDetailsList && this.saveData.PurchaseRequisitionDetailsList.length) {//有填写采购清单(维护了采购清单)
            let noExist = this.contExistPurchase();
            if (JSON.stringify(noExist) != "[]") {//有不存在
                this.WindowService.confirm({ message: "合同号:" + noExist.toString() + "还没有采购产品。是否继续？" }).subscribe(v => {
                    if (v) {
                        for (let j = 0; j < noExist.length; j++) {
                            let ele = noExist[j];
                            let i = this.contExistSaleIndex(ele);
                            if (i != -1) {
                                this.saveData.PurchaseRequisitionSaleContractList.splice(i, 1);
                            }
                        }
                        this.confirmSubmit = true;//提交
                    } else {
                        return;//不提交
                    }
                })
            } else {
                this.confirmSubmit = true;//提交
            }
        } else {//没有维护采购清单
            let noExistPurchase = this.saleNoExistPurchase();
            if (JSON.stringify(noExistPurchase) != "[]") {
                this.WindowService.confirm({ message: "合同号:" + noExistPurchase.toString() + "未填写采购金额。是否继续？" }).subscribe(v => {
                    if (v) {
                        for (let j = 0; j < noExistPurchase.length; j++) {
                            let ele = noExistPurchase[j];
                            let i = this.contExistSaleIndex(ele);
                            if (i != -1) {
                                this.saveData.PurchaseRequisitionSaleContractList.splice(i, 1);
                            }
                        }
                        this.confirmSubmit = true;//提交
                    } else {
                        return;//不提交
                    }
                })
            } else {
                this.confirmSubmit = true;//提交
            }
        }
    }
    contExistPurchase() {//检查合同列表是否都有分配产品,返回不存在的合同号数组
        let contractList;//合同列表
        let noExist = [];//不存在的合同号
        contractList = JSON.parse(window.localStorage.getItem("contractList"));
        let self = this;
        let forPurchase = function (sc) {
            let j; let len = self.saveData.PurchaseRequisitionDetailsList.length;
            for (j = 0; j < len; j++) {
                let ele = self.saveData.PurchaseRequisitionDetailsList[j];
                if (sc == ele.MaterialSource) {
                    return true;
                }
            }
            return false;
        }
        let j; let len = contractList.length;
        for (j = 0; j < len; j++) {
            let item = contractList[j];
            if (!forPurchase(item.SC_Code)) {//不存在
                noExist.push(item.MainContractCode);
            }
        }
        return noExist;
    }
    contExistSaleIndex(name) {//输入合同名称，返回在销售信息列表中的Index
        let j; let len = this.saveData.PurchaseRequisitionSaleContractList.length;
        for (j = 0; j < len; j++) {
            let item = this.saveData.PurchaseRequisitionSaleContractList[j];
            if (item.MainContractCode == name) {
                return j;
            }
        }
        return -1;
    }
    saleNoExistPurchase() {//返回没有未税总金额的销售信息列表的合同名称数组
        let noExistPurchase = [];
        let j; let len = this.saveData.PurchaseRequisitionSaleContractList.length;
        for (j = 0; j < len; j++) {
            let item = this.saveData.PurchaseRequisitionSaleContractList[j];
            if (!item.excludetaxmoney) {
                noExistPurchase.push(item.MainContractCode);
            }
        }
        return noExistPurchase;
    }
    closeWindow() {//关闭窗口
        window.close();
    }
    // part9-其他-end

    //当获取到用印审批人变化时，重新获取审批人列表
    getContractPrintApproverList(contractPrintUser){

        if(this.contractPrintApproverList != contractPrintUser){
            this.contractPrintApproverList=contractPrintUser;//保存用印审批人
            this.getFlow(this.saveData.factory, this.saveData.vendorno, this.saveData.istoerp, this.saveData.companycode);
        }
    }

}