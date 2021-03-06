//查看 或 审批 备货采购申请
import { Component, OnInit, ViewChild } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any,window;
import { HttpServer } from 'app/shared/services/db.http.server';
import { WindowService } from 'app/core';
import { DbWfviewComponent } from 'app/shared/index';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { dbomsPath, environment,APIAddress } from "environments/environment";
import { ProcurementTemplateService } from './../../services/procurement-template.service';
import { ApplyListModalComponent } from '../applyListModal/applylist-modal.component';
import { ApprovalModalComponent } from '../approvalModal/approval-modal.component';
import { StockApply } from '../../services/stockApply-submit.service';
import { ApprovalMethodService } from '../../services/approval-method.service';
import { ShareDataService } from './../../services/share-data.service';
import { Seal, PurchaseContractInfo } from '../../services/purchase-contractInfo.service';
import { SubmitMessageService } from '../../services/submit-message.service';

@Component({
    templateUrl: 'stockApply-deal.component.html',
    styleUrls: ['stockApply-deal.component.scss',
        './../../scss/procurement.scss','./../../scss/deal-page.scss']
})
export class StockApplyDealComponent implements OnInit {
// part1-基础信息-start
// part1-基础信息-end
// part2-采购信息-start
    TemplateName;//模板名称
    isTenStart = false;//供应商代码 是否10开头 “对方业务范围”是否显示标识
    standardTime;//标准周转天数
    abroadData={//国外时 显示的字段
        conditionStr:'',//交货条件
        peopleStr:''//收货人
    }
    SendType:any=[{id:'',text:''}];//发货方式
// part2-采购信息-end
// part3-采购清单-start
    procurementListPrice={//清单中
        numAmount: 0,//物料数量合计
    }
    procurementListShow=true;//采购清单是否显示标识
    applyListModal: XcModalRef;//采购清单展示模态框
// part3-采购清单-end
// part4-销售信息-start
// part4-销售信息-end
// part5-支持文件&用印文件-start
    //AccessorySee_Support = [];//查看支持文件
    //AccessorySee_India = [];//查看采购合同用印文件
    AccessorySee_Support = [];//查看支持文件
    AccessorySee_India = [];//查看采购合同用印文件
    sealInfo:Seal=new Seal();//印章信息
    printUseData=[];//印章审批人数据
    contractInfoAccessories=[];//用印部分文件
// part5-支持文件&用印文件-end
// part6-修改记录-start
    getModifyUrl;//查询修改记录 接口
    modifyRecord = [];//修改记录
    modifyPagerData = new Pager();//修改记录 分页
    isModifyOwn:boolean=false;//是否修改了我方主体
    isModifyVendor:boolean=false;//是否修改了供应商
    isModifyTaxinclusivemoney:boolean=false;//是否修改了含税金额
// part6-修改记录-end
// part7-审批人-start
    approvalModal: XcModalRef;//加签转办模态框
    isSignApprovalPage: boolean = false;//是否加签审批页面
    urlParamObj = {//URL中获取的参数信息
        applyid: "",//采购申请主键ID
        nodeid: "",
        taskid: "",
        adp: "",
        TS:null
    };
    isClick: boolean = false;//是否 点击过
    wfData = {//审批相关数据
        wfHistory: null,//审批记录
        wfProgress: null//审批流程
    };
    activeNode;//当前审批节点
    opinion;//审批意见
    approvalType;//审批类型

    @ViewChild('wfview')
    wfView: DbWfviewComponent;//审批过程 流程图显示
// part7-审批人-end
// part8-整体-start
    stockApplyData=new StockApply();//整体数据
    ISRMB=true;//是否 人民币 标识
    isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
    submiting=false;//审批中
// part8-整体-end    
    constructor(
        private dbHttp: HttpServer,
        private WindowService: WindowService,
        private ActivatedRoute: ActivatedRoute,
        private xcModalService: XcModalService,
        private routerInfo: ActivatedRoute,
        private procurementTemplateService: ProcurementTemplateService,
        private approvalMethodService: ApprovalMethodService,
        private location: Location,
        private router: Router,
        private shareDataService: ShareDataService,
        private SubmitMessageService:SubmitMessageService
    ) { 
    }

    ngOnInit() {
        //初始 获取参数
        this.urlParamObj.nodeid = this.routerInfo.snapshot.queryParams['nodeid'];
        this.urlParamObj.taskid = this.routerInfo.snapshot.queryParams['taskid'];
        this.urlParamObj.adp = this.routerInfo.snapshot.queryParams['ADP'];
        this.urlParamObj.TS = this.routerInfo.snapshot.queryParams['TS'];
        if (this.ActivatedRoute.snapshot.params['id']) {//URL中有id参数
            this.urlParamObj.applyid = this.ActivatedRoute.snapshot.params['id'];
        }else{//URL中没有id参数,则取recordid参数
            this.urlParamObj.applyid = this.routerInfo.snapshot.queryParams['recordid'];
        }
        if (this.urlParamObj.taskid) {//判断 是否审批页面
            this.isView = false;
        }
        if(this.urlParamObj.TS=='0'){//判断 是否审批页面 多一层
            this.isView = true;
        }
        if (this.urlParamObj.adp) {//判断 是否加签审批页面
            this.isSignApprovalPage = true;
        }
        this.onGetWfHistoryData();//获取流程和审批历史
        this.getProcurementData(this.urlParamObj.applyid);//获取 整单数据
        this.applyListModal = this.xcModalService.createModal(ApplyListModalComponent);//预览采购清单
        this.approvalModal = this.xcModalService.createModal(ApprovalModalComponent);//加签转办审批窗口
        this.approvalModal.onHide().subscribe((res?) => {
            if(res && this.approvalType=="sign"){//加签
                this.submiting=true;
                this.approvalMethodService.sign(this.urlParamObj.taskid,res.opinions,"Apply",res.itcode,res.username).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
            if(res && this.approvalType=="transfer"){//转办
                this.submiting=true;
                this.approvalMethodService.turnTo(this.urlParamObj.taskid,res.opinions,"Apply",res.itcode,res.username).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
        })
    }

// part3-采购清单-start
    showOrder() {//预览采购清单
        let modalData = {
            procurementList:this.stockApplyData.PurchaseRequisitionDetailsList,
            untaxAmount: this.stockApplyData.excludetaxmoney,
            factory: this.stockApplyData.factory,
            vendor: this.stockApplyData.vendor
        }
        this.applyListModal.show(modalData);
    }
// part3-采购清单-end

// part4-销售信息-start
// part4-销售信息-end

// part5-支持文件&用印文件-start
    checkSeal(url) {//查看附件/用印文件/合同附件
        window.open(APIAddress+url);
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

                        //验证是否修改了我方主体，用以显示视图中的样式
                        if(this.modifyRecord.some(item=>item.Own.substring(item.Own.indexOf('-')!=-1?item.Own.indexOf('-')+1:0)!=this.stockApplyData.company)){
                            this.isModifyOwn=true;
                        }else{
                            this.isModifyOwn=false;
                        }

                        //验证是否修改了供应商，用以显示视图中的样式                     
                        if(this.modifyRecord.some(item=>item.Vendor!=this.stockApplyData.vendor)){
                            this.isModifyVendor=true;
                        }else{
                            this.isModifyVendor=false;
                        }

                        //验证是否修改了含税金额，用以显示视图中的样式                     
                        if(this.modifyRecord.some(item=>item.taxinclusivemoney!=this.stockApplyData.taxinclusivemoney)){
                            this.isModifyTaxinclusivemoney=true;
                        }else{
                            this.isModifyTaxinclusivemoney=false;
                        }

                        this.modifyPagerData.set({
                            total: data.Data.TotalCount,
                            totalPages: data.Data.PageCount
                        })
                    }
                });
        }
    }
    viewApplyDetail(id){//查看修改记录中-记录
        window.open(dbomsPath+'procurement/deal-stockapply/'+id);
    }
// part6-修改记录-end

// part7-审批-start
    onGetWfHistoryData() {//获取流程和审批历史
        if (this.urlParamObj.applyid) {
            let url = "PurchaseManage/RequisitionApproveHistory/" + this.urlParamObj.applyid;//获取流程和审批历史
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            let nodeIDUrl = "PurchaseManage/GetCurrentWFNode_PurchaseRequisition/" + this.urlParamObj.applyid;//获取当前审批环节
            console.log(nodeIDUrl);
            this.dbHttp.post(nodeIDUrl, {}, options)
                .toPromise().then(res => {
                    if (res.Data) {
                        let data = JSON.parse(res.Data);
                        this.activeNode = data.nodeid;//当前审批环节
                    }
                    this.dbHttp.post(url, [], options).subscribe(data => {
                            if (data.Result) {
                                this.wfData = JSON.parse(data.Data);
                                let progressOne = {
                                    "NodeID": "1",
                                    "NodeName": "申请人",
                                    "IsShow": true,
                                    "IsAlready": true,
                                    "AuditDate": "",
                                    "TaskOpinions": "同意",
                                    "ApproveUsers": {
                                    }
                                }
                                if (this.activeNode == "2") {//如果当前节点是2
                                    progressOne.IsAlready=false;
                                    progressOne.TaskOpinions="拒绝";
                                }
                                this.wfData.wfProgress.splice(0, 0, progressOne);//拼接上第一个 "申请人"节点
                                if (this.wfData.wfHistory && this.wfData.wfHistory.length){
                                    this.wfData.wfHistory.reverse();//颠倒
                                }
                                console.log("流程");
                                console.log(this.wfData);
                                this.wfView.onInitData(this.wfData.wfProgress);
                            }
                        }
                    );
                })
        }
    }
    doApproval(approvalType){//各审批
        if(this.isClick){//已点击
            this.WindowService.alert({ message: '任务处理中或已处理,请勿多次点击 ', type: "fail" });
            return;
        }
        if (!this.opinion && approvalType == "reject") {//驳回 审批意见必填
            this.WindowService.alert({ message: '请填写审批意见 ', type: "fail" });
            return;
        }
        if (!this.opinion) {
            this.opinion = "同意";
        }
        this.approvalType=approvalType;
        switch (approvalType) {
            case 'agree'://非-加签审批类-同意
                this.submiting=true;
                this.approvalMethodService.agree(this.urlParamObj.taskid,this.opinion,"Apply").then(data => {
                    this.approvalCompleteDel(data);
                })
                break;
            case 'reject': //非-加签审批类-驳回
                this.submiting=true;
                this.approvalMethodService.reject(this.urlParamObj.taskid,this.opinion,"Apply").then(data => {
                    this.approvalCompleteDel(data);
                })
                break;
            case 'sign': //非-加签审批类-加签
            case 'transfer': //非-加签审批类-转办
                this.approvalModal.show(this.approvalType);
                break;
            case 'agree+': //加签审批类-同意
                this.submiting=true;
                this.approvalMethodService.signApprovalAgree(this.urlParamObj.taskid,this.opinion,"Apply").then(data => {
                    this.approvalCompleteDel(data);
                })
                break;
        }
    }
    approvalCompleteDel(data){//审批后的处理
        if (data.Result) {
            this.isClick=true;
            this.submiting=false;
            this.WindowService.alert({ message:"审批成功", type: "success" });
            if(this.approvalType=="agree" && 
                this.getFinalNodeId()==this.activeNode){//最后节点的同意 直接跳转
                this.router.navigate(['procurement/deal-stockapply/'+ this.urlParamObj.applyid]);
            }else{
                setTimeout(()=>{
                    window.close();
                },3000);
            }
        }else {
            this.submiting=false;
            this.WindowService.alert({ message: "审批出错:" + data.Message, type: "fail" });
        }
    }
    getFinalNodeId(){//返回流程中最后节点的ID
        for(let len=this.wfData.wfProgress.length-1;len>=0;len--){
            if(this.wfData.wfProgress[len]["IsShow"]){
                return this.wfData.wfProgress[len]["NodeID"];
            }
        }
    }
    goback() {
        // this.location.back();
        window.close();
    }
// part7-审批-end

// part8-整体-start
    getProcurementData(id) {//获取整单数据
        let url = "PurchaseManage/GetPurchaseRequisitionById/" + id;
        this.dbHttp.get(url).subscribe(data => {
            if (data.Result) {
                this.stockApplyData = JSON.parse(data.Data);
                console.log("整单数据");
                console.log(this.stockApplyData);
                // #1-基础信息
                // #2-采购信息

                //保存发货方式
                if(this.stockApplyData.SendType){
                    this.SendType=JSON.parse(this.stockApplyData.SendType);
                }

                if (this.stockApplyData.TemplateID) {//获取模板名称
                    this.procurementTemplateService.getProcurementTplOne(this.stockApplyData.TemplateID).then(data => {
                        if (data.Result) {
                            this.TemplateName = data.Data.Name;
                        }
                    })
                }
                let localvendorno = "";
                localvendorno = JSON.stringify(Number(this.stockApplyData.vendorno));
                if (localvendorno.substring(0, 2) == "10") {//判断是否10开头
                    this.isTenStart = true;
                } else {
                    this.isTenStart = false;
                }
                if (this.stockApplyData.currencycode == "RMB") {//判断是否人民币
                    this.ISRMB = true;
                }else{
                    this.ISRMB = false;
                }
                if(this.stockApplyData.VendorCountry==1){//国外
                    let deliveryAllInfo = {
                        condition:[],//交货条件
                        people:[]//收货人
                    }
                    this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
                        deliveryAllInfo.condition=data.condition;
                        deliveryAllInfo.people=data.people;
                        for(let i=0,len=deliveryAllInfo.condition.length;i<len;i++){//国际贸易条件
                            if(deliveryAllInfo.condition[i]["id"]==this.stockApplyData.internationaltradeterms){
                                this.abroadData.conditionStr=deliveryAllInfo.condition[i]["text"];
                            }
                        }
                        for(let i=0,len=deliveryAllInfo.people.length;i<len;i++){//收货人
                            if(deliveryAllInfo.people[i]["id"]==this.stockApplyData.receiver){
                                this.abroadData.peopleStr=deliveryAllInfo.people[i]["text"];
                            }
                        }
                    })
                }
                // #3-采购清单
                this.stockApplyData.PurchaseRequisitionDetailsList.forEach(item => {
                    this.procurementListPrice.numAmount += item.Count;//数量总计
                });
                if (this.stockApplyData.PurchaseRequisitionDetailsList && this.stockApplyData.PurchaseRequisitionDetailsList.length >= 10) {//出现滚动条的宽度调整
                    $(".w50").addClass("w56");
                }
                // #4-销售信息
                // #5-支持文件&用印文件
                let i; let len = this.stockApplyData.AccessoryList.length;
                for (i = 0; i < len; i++) {//去除附件数组中的空值
                    if (!this.stockApplyData.AccessoryList[i]) {
                        this.stockApplyData.AccessoryList.splice(i, 1);
                        len--;
                        i--;
                    }
                }
                this.stockApplyData.AccessoryList.forEach(item => {//分离 支持文件和用印文件
                    if (item.AccessoryType == "20") {
                        this.AccessorySee_Support.push({
                            AccessoryURL: item.AccessoryURL,
                            AccessoryName: item.AccessoryName
                        })
                    }
                    if (item.AccessoryType == "21") {
                        this.AccessorySee_India.push({
                            AccessoryURL: item.AccessoryURL,
                            AccessoryName: item.AccessoryName
                        })
                    }
                })

                this.contractInfoAccessories=this.stockApplyData.PurchaseContractInfo["PurchaseContractInfoAccessories"];
                if(this.stockApplyData.PurchaseContractInfo["SealInfoJson"]){
                    this.sealInfo=JSON.parse(this.stockApplyData.PurchaseContractInfo["SealInfoJson"]);
                }
                this.printUseData=this.SubmitMessageService.removeRepeatApprovePrintData(this.stockApplyData.PurchaseContractInfo.UserSetting);

                // #6-修改记录
                this.getModifyUrl = "PurchaseManage/GetRequisitionRecord/"+this.stockApplyData.requisitionnum;
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
                this.dbHttp.get("PurchaseManage/GetStandardRevolveDays/"+
                    this.stockApplyData.homeoffice+"/"+this.stockApplyData.bizdivision).subscribe(data => {
                    if (data.Result) {
                        this.standardTime=data.Data;//获取标准周转天数
                    }
                })
                // #8-整体
                // #9-其他
            }else {
                this.WindowService.alert({ message: '接口异常', type: 'fail' });
            }
        })
    }
// part8-整体-end

// part9-其他-start
// part9-其他-end
}