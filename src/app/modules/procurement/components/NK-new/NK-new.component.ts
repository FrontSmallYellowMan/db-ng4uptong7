// NB单采购订单页面-主页面
import { Component, OnInit, DoCheck } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any, window;

import { Person } from 'app/shared/services/index';
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';
import { SubmitMessageService } from '../../services/submit-message.service'
import { PurchaseOrderObj, NKNewPersonElement } from './../../services/NK-new.service';
import { ShareDataService } from './../../services/share-data.service';
import { ShareMethodService } from './../../services/share-method.service';
import { ProcumentOrderNewService } from './../../services/procumentOrder-new.service';
import { RecordAllowEditStateService, RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";


@Component({
    templateUrl: 'NK-new.component.html',
    styleUrls: ['NK-new.component.scss', './../../scss/procurement.scss']
})
export class NKNewComponent implements OnInit {
    // part1-基础信息-start
    userInfo = new Person();//登录人头像
    selectInfo = {//下拉框数据
        plateInfo: [] //平台
    }
    avtivePlate;//平台-当前选项
    // part1-基础信息-end
    // part2-采购信息-start
    NKOrderMessageValid;//采购信息表单 校验结果
    // part2-采购信息-end
    // part3-采购清单-start
    procurementListShow = true;//采购清单显示标识
    purchaseFormValid = true;//采购清单校验结果
    purchaseData = {//传进采购清单信息
        procurementList: [],
        untaxAmount: 0,
        taxAmount: 0,
        foreignAmount: 0
    }
    sumTotal = 0;
    // part3-采购清单-end
    // part4-销售信息-start
    // part4-销售信息-end
    // part5-支持文件&用印文件-start
    AccessorySee = [];//查看附件文件
    accessoryUrl = "api/PurchaseManage/UploadAccessory/2";//附件上传路径
    // part5-支持文件&用印文件-end
    // part6-采购申请信息-start
    applyListLocal;//采购申请信息
    applyListLocalShow = false;//有采购申请
    // part6-采购申请信息-end
    // part7-审批人信息-start
    preparePersonList = [];//预审人员
    departmentApprovalList = [];//部门审批人员(除预审外的其他审批人员)
    wholeApprovalData = [];//全部的审批人员 信息
    approvalProcessID;//审批流程id
    wfHistory;//审批记录
    // part7-审批人信息-end
    // part8-整体-start
    saveData = new PurchaseOrderObj();//整体数据
    submitType = "";//暂存一份 用户提交的方式("提交"或"暂存")
    IsRMB = true;//是否 人民币 标识
    submiting = false;//提交中
    confirmSubmit = false;//确认提交 标识
    localApplyList = [];//新建，本地已选采购申请
    availableAmountIdent;//编辑时，存合同的可采购金额
    isSubmit = false;//是否提交
    // part8-整体-end    

    //记录可编辑状态
    recordAllowEditStateQuery: RecordAllowEditStateQuery = new RecordAllowEditStateQuery();

    constructor(
        private dbHttp: HttpServer,
        private WindowService: WindowService,
        private routerInfo: ActivatedRoute,
        private router: Router,
        private SubmitMessageService: SubmitMessageService,
        private shareDataService: ShareDataService,
        private shareMethodService: ShareMethodService,
        private procumentOrderNewService: ProcumentOrderNewService,
        private recordAllowEditStateService: RecordAllowEditStateService
    ) { }

    ngOnInit() {

        //编辑权限验证-start
        var recordId = this.routerInfo.snapshot.params['id'];
        if(recordId) {
            this.recordAllowEditStateQuery.FunctionCode = '22';//请求查询的模块代码
            this.recordAllowEditStateQuery.RecordID = recordId;//页面的主键ID
            this.recordAllowEditStateQuery.NotAllowEditLink = `/procurement/deal-NK/${recordId}`;
            this.recordAllowEditStateQuery.NotFoundRecordLink = `/procurement/procurement-order/my-apply`;
            this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);           
        }
        //编辑权限验证-end

        //直接创建NK订单，无采购申请
        this.saveData.PurchaseRequisitionType = -1

        for (let i = 0; i < 4; i++) {//先默认让整体流程信息 至少长度为4
            this.wholeApprovalData.push(new NKNewPersonElement());//前4个预审人员信息
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
        this.saveData.ID = this.routerInfo.snapshot.params['id'];//从路由中取出变量id的值
        if (this.saveData.ID) {
            this.getPurchaseOrder(this.saveData.ID);//根据id获取整单数据
        } else {
            let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            this.dbHttp.get("base/GetCurrentUserInfo", options).subscribe(data => {//获取登录人信息
                if (data.Result) {
                    let loginData = JSON.parse(data.Data);
                    this.saveData.Telephone = loginData.Phone;
                    this.saveData.ApplicantItCode = loginData.ITCode;
                    this.saveData.ApplicantName = loginData.UserName;
                    this.saveData.Department = loginData.DeptName;//部门
                    this.saveData.CostCenter = loginData.CostCenterName;//成本中心
                    this.saveData.BBMC = loginData.BBMC;//本部名称
                    this.saveData.SYBMC = loginData.SYBMC;//事业部名称
                    this.saveData.YWFWDM = loginData.YWFWDM;//业务范围代码
                    this.saveData.FlatCode = loginData.FlatCode;//平台代码
                    this.saveData.Platform = loginData.FlatName;//平台
                    this.avtivePlate = [{//显示平台
                        id: loginData.FlatCode,
                        text: loginData.FlatName
                    }];
                    this.getFlow(this.saveData.CompanyCode);
                }
            })
        }
    }


    // ngDoCheck() {
    //     if (this.confirmSubmit) {//校验通过提交
    //         this.submitNKNew();
    //     }
    // }

    // part1-基础信息-start
    getPlateform(e) {//平台选择
        this.saveData.FlatCode = e.id;//平台代码
        this.saveData.Platform = e.text;//平台
        this.getFlow(this.saveData.CompanyCode);
    }
    // part1-基础信息-end

    // part2-采购信息-start
    onNKOrderFormValidChange(e) {//当 采购信息表单校验 变化
        this.NKOrderMessageValid = e;
    }
    onCompanyCodeChange(e) {//当 公司代码(我方主体) 变化
        this.getFlow(this.saveData.CompanyCode);
    }
    onNKOrderMessageChange(e) {//当 采购信息数据 变化
        console.log(e);
        $.extend(this.saveData, e);//保存到整体
    }
    onIsRMBChange(e) {//当 是否人民币 变化
        this.IsRMB = e;
    }
    onVendorTraceChange(e) {//当 供应商是否过期变化
        this.saveData.VendorTrace = e;
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
        alertFun(this.saveData.CompanyName, "我方主体");
        alertFun(this.saveData.FactoryCode, "工厂");
        alertFun(this.saveData.Vendor, "供应商");
        alertFun(this.saveData.RateValue, "税率");
        alertFun(this.saveData.Currency, "币种");
        alertFun(this.saveData.TrackingNumber, "需求跟踪号");
        alertFun(this.saveData.paymenttermscode, "付款条款");
        alertFun(this.saveData.preselldatetime, "预计销售时间");
    }
    // part2-采购信息-end

    // part3-采购清单-start
    onPurchaseDataChange(e) {//采购清单信息变化
        console.log(e);
        this.saveData.PurchaseOrderDetails = e.procurementList;
        this.saveData.PruchaseAmount = e.untaxAmount;
        this.saveData.PruchaseAmountTax = e.taxAmount;
        this.saveData.PurchaseForeignAmount = e.foreignAmount;
    }
    purchaseFormValidChange(e) {//采购清单校验发生变化
        this.purchaseFormValid = e;
    }
    delPurchaseFormListBlank() {//删除采购清单空白项
        let i; let item;
        let len = this.saveData.PurchaseOrderDetails.length;
        for (i = 0; i < len; i++) {
            item = this.saveData.PurchaseOrderDetails[i];
            if (!item.MaterialNumber && !item.Count && !item.Price
                && (!item.MaterialSource || !item.DBOMS_PurchaseRequisitionSaleContract_ID)) {
                this.saveData.PurchaseOrderDetails.splice(i, 1);
                len--;
                i--;
            }
        }
    }
    fillPurchaseList() {//填充需求跟踪号
        this.saveData.PurchaseOrderDetails.forEach(item => {
            item.TrackingNumber = this.saveData.TrackingNumber;
        })
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
        this.saveData.PurchaseOrderDetails.forEach((item, index) => {
            alertFun(item.MaterialNumber, '物料编号');
            alertFun(item.Count, '数量');
            alertFun(item.Price, '未税单价');
            alertFun(item.StorageLocation, '库存地');
            alertFun(item.MaterialSource, '物料来源');
        })
    }
    checkAllMaterialSource() {//暂存时 hasApply情况下 必须至少有一项物料来源不为空
        for (let i = 0, len = this.saveData.PurchaseOrderDetails.length; i < len; i++) {
            if (!this.saveData.PurchaseOrderDetails[i].MaterialSource) {
                return false;
            }
        }
        return true;
    }
    // part3-采购清单-end

    // part4-销售信息-start
    // part4-销售信息-end

    // part5-支持文件&用印文件-start
    onUploadBack(e) {//文件上传返回
        if (e.Result) {
            this.saveData.PurchaseOrderAccessories.push(e.Data);
        }
    }
    onDeleteItem(e) {//删除文件
        this.saveData.PurchaseOrderAccessories.splice(e, 1);
    }
    // part5-支持文件&用印文件-end

    // part7-审批-start
    onGetWfHistoryData(applyid) {//获取审批历史
        let url = "PurchaseManage/PurchaseOrderApproveHistory/" + applyid;//获取流程和审批历史
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
    getFlow(companycode) {//流程启动
        let url = "PurchaseManage/GetWorkFlowConfigInfo_Purchase";//获得流程节点审批人信息
        let body = {
            "FlatCode": this.saveData.FlatCode,/*平台代码*/
            "BizScopeCode": this.saveData.YWFWDM, /*登录人的所属业务范围代码*/
            "WorkFlowCategory": "NBORDER" /*流程类型*/
        }
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post(url, body, options).subscribe(data => {
            if (data.Result) {
                this.wholeApprovalData = JSON.parse(data.Data);//整体审批人员数据
                this.departmentApprovalList
                    = this.SubmitMessageService.transformApprovePersonList(this.wholeApprovalData, this.saveData.PruchaseAmount, companycode, '');//除预审外 需要展示的审批人信息
            }
        })
    }
    // part7-审批-end

    // part8-整体-start
    getPurchaseOrder(id) {//获取采购订单数据
        let url = "PurchaseManage/GetPruchaseOrder/" + id;
        this.dbHttp.get(url).subscribe(data => {
            if (data.Result) {
                // #0-整体
                let localWholeData = data.Data;
                this.saveData = data.Data;
                console.log("整单数据");
                console.log(this.saveData);

                // #1-基础信息
                this.avtivePlate = [{//显示平台
                    id: this.saveData.FlatCode,
                    text: this.saveData.Platform
                }];
                // #2-采购信息
                // #3-采购清单
                this.saveData.PurchaseOrderDetails.forEach(item => {
                    item.Price = Number(item.Price).toFixed(2);
                    item.Amount = Number(item.Amount).toFixed(2);
                    if (item.Count) {
                        this.sumTotal = this.sumTotal + item.Count;
                    }
                })
                this.purchaseData.procurementList = this.saveData.PurchaseOrderDetails;//采购清单信息
                this.purchaseData.untaxAmount = this.saveData.PruchaseAmount;//未税总金额
                this.purchaseData.taxAmount = this.saveData.PruchaseAmountTax;//含税总金额
                this.purchaseData.foreignAmount = this.saveData.PurchaseForeignAmount;//外币总金额
                // #4-销售信息
                // #5-支持文件&用印文件
                let i; let len = this.saveData.PurchaseOrderAccessories.length;
                for (i = 0; i < len; i++) {
                    if (!this.saveData.PurchaseOrderAccessories[i]) {//去除附件数组中的空值
                        this.saveData.PurchaseOrderAccessories.splice(i, 1);
                        len--;
                        i--;
                    } else {//组织显示附件数组
                        this.AccessorySee.push({
                            name: this.saveData.PurchaseOrderAccessories[i].AccessoryName
                        })
                    }
                }
                // #7-审批
                if (localWholeData.ApproveID) {//驳回时获取当前审批信息
                    let wfidUrl = "PurchaseManage/GetCurrentTaskId/" + localWholeData.ApproveID;
                    this.dbHttp.get(wfidUrl).subscribe(data => {
                        this.approvalProcessID = JSON.parse(data.Data)[0];
                    })
                }
                this.wholeApprovalData = JSON.parse(localWholeData.WFApproveUserJSON);
                this.preparePersonList = this.SubmitMessageService.getPersonList(this.wholeApprovalData);//预审人员 数据格式转化
                this.departmentApprovalList
                    = this.SubmitMessageService.transformApprovePersonList(this.wholeApprovalData, this.saveData.PruchaseAmount, this.saveData.CompanyCode, '');//除预审外 需要展示的审批人信息
                if (this.saveData.ApproveState == "驳回") {//是驳回单子 显示审批记录
                    this.onGetWfHistoryData(this.saveData.ID);
                }
            } else {
                this.WindowService.alert({ message: '接口异常', type: 'fail' });
            }
        })
    }

    //保存NK订单数据
    saveNKOrder(type) {
        // #-草稿提交的处理-start
        this.confirmSubmit = false;
        this.submitType = type;
        console.log(JSON.stringify(this.saveData));

        if (this.saveData.ApproveState != "驳回") {//是驳回单子 不修改状态
            this.saveData.ApproveState = type;
        }
        this.delPurchaseFormListBlank();//删除空的采购清单
        if (this.preparePersonList && this.preparePersonList.length) {
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
            this.saveData.WFApproveUserJSON = JSON.stringify(this.wholeApprovalData);//格式转化
        }
        if (type == "草稿") {
            this.confirmSubmit = true;//直接提交
            this.submitNKNew();//保存数据 
            return;
        } else {//提交时订单金额>0校验
            if (this.saveData.PruchaseAmount == 0) {
                this.WindowService.alert({ message: 'NK订单采购金额必须大于0！', type: 'warn' });
                return;
            }
            this.isSubmit = true;
            this.confirmSubmit = true;
        }
        // #-草稿提交的处理-end


        // #1-基础信息
        if (!this.saveData.Telephone) {
            this.WindowService.alert({ message: '联系方式不能为空', type: 'warn' });
            return;
        }
        if (!this.saveData.FlatCode || !this.saveData.Platform) {//平台验证(一般情况下都有值)
            this.WindowService.alert({ message: '平台不能为空', type: 'warn' });
            return;
        }
        // #2-采购信息
        if (!this.NKOrderMessageValid) {//采购信息
            this.massageValid();
            return;
        }
        // #3-一级预审必填控制-2018.6.20，刘博新增需求
        if (!this.preparePersonList || this.preparePersonList[0].person.length === 0) {
            this.WindowService.alert({ message: "请选择一级预审人", type: "fail" });
            return;
        }
        this.shareMethodService.checkOrderTracenoExist(this.saveData.TrackingNumber, this.saveData.ID)
            .then(data => {//需求跟踪号 是否存在 验证
                if (!data) {
                    this.WindowService.alert({ message: "采购信息中需求跟踪号已存在，请重新输入", type: 'fail' });
                    this.saveData.TrackingNumber = "";
                    return;
                } else {
                    this.viableTracenoAfterVerificate();
                    this.submitNKNew();//保存数据
                }
            });
    }
    viableTracenoAfterVerificate() {//需求跟踪号 可行 继续进行后面的校验
        //因为需求跟踪号检查为异步 所以在请求完后才能进行

        // #3-采购清单
        if (!this.saveData.PurchaseOrderDetails || !this.saveData.PurchaseOrderDetails.length) {//清单必须有一条
            this.WindowService.alert({ message: '采购清单至少应填写一条', type: 'warn' });
            return;
        }
        if (!this.purchaseFormValid) {//采购清单校验未通过
            this.purchaseFormAccurateValid();
            return;
        }
        this.fillPurchaseList();
    }
    //验证通过后 提交NK单
    submitNKNew() {
        this.submiting = true;
        this.saveData.PurchaseOrderDetails.forEach(item => {
            if ('isExcel' in item) {
                delete item["isExcel"];
            }
            if ('isImport' in item) {
                delete item["isImport"];
            }
        });
        console.log("提交的整条数据");
        console.log(this.saveData);
        console.log(JSON.stringify(this.saveData));

        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.post("PurchaseManage/SavePurchaseOrder", this.saveData, options).subscribe(data => {
            this.submiting = false;
            if (data.Result) {
                if (!this.saveData.ID) {//新建
                    window.localStorage.removeItem('applyList');
                    window.localStorage.removeItem('createNBType');
                }

                if (this.approvalProcessID && this.submitType == "提交") {//驳回单子 再提交时 发起流程
                    let url = "PurchaseManage/ApproveOrder";
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
                //this.router.navigate(['procurement/procurement-order/my-apply']);

                if (this.submitType == "提交") {//提交
                    this.WindowService.alert({ message: "提交成功", type: 'success' }).subscribe(() => {
                        window.colse();
                    });
                } else {//暂存
                    this.WindowService.alert({ message: "保存成功", type: 'success' }).subscribe(() => {
                        window.close();
                    });
                }

            } else if (data.status == "401") {
                this.WindowService.alert({ message: "您没有提交权限", type: 'fail' });
            } else {
                this.WindowService.alert({ message: data.Message, type: 'fail' });
            }
        })
        this.confirmSubmit = false;
    }
    checkAvailableAmount() {//校验合同可采购金额
        if (this.saveData.ID) {//编辑
            for (let key in this.availableAmountIdent) {
                let total = 0;
                for (let k = 0, lens = this.saveData.PurchaseOrderDetails.length; k < lens; k++) {
                    let detaiItem = this.saveData.PurchaseOrderDetails[k];
                    if (detaiItem["DBOMS_PurchaseRequisitionSaleContract_ID"] == key) {//选中
                        total += detaiItem["Amount"];
                    }
                }
                if (this.availableAmountIdent[key] * 0.05 < 500) {//上下5%
                    if (total < this.availableAmountIdent[key]
                        || (total > this.availableAmountIdent[key] * 0.95 && total < this.availableAmountIdent[key] * 1.05)) {
                        continue;
                    }
                } else {//上下500
                    if (total < this.availableAmountIdent[key]
                        || Math.abs(total - this.availableAmountIdent[key]) < 500) {
                        continue;
                    }
                }
                return false;
            }
        } else {//新建
            for (let i = 0, len = this.localApplyList.length; i < len; i++) {
                let total = 0;
                for (let k = 0, lens = this.saveData.PurchaseOrderDetails.length; k < lens; k++) {
                    let detaiItem = this.saveData.PurchaseOrderDetails[k];
                    if (detaiItem["DBOMS_PurchaseRequisitionSaleContract_ID"] == this.localApplyList[i]["id"]) {//选中
                        total += detaiItem["Amount"];
                    }
                }
                if (this.localApplyList[i]["available"] * 0.05 < 500) {//上下5%
                    if (total < this.localApplyList[i]["available"]
                        || (total > this.localApplyList[i]["available"] * 0.95 && total < this.localApplyList[i]["available"] * 1.05)) {
                        continue;
                    }
                } else {//上下500
                    if (total < this.localApplyList[i]["available"]
                        || Math.abs(total - this.localApplyList[i]["available"]) < 500) {
                        continue;
                    }
                }
                return false;
            }
        }
        return true;
    }
    // part8-整体-end

    // part9-其他-start
    closeWindow() {
        window.close();
    }
    // part9-其他-end
}