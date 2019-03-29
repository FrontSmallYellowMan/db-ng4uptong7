//查看 或 审批 NA单
import { Component, OnInit, ViewChild } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
import { HttpServer } from 'app/shared/services/db.http.server';
import { WindowService } from 'app/core';
import { DbWfviewComponent } from 'app/shared/index';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { dbomsPath, environment,APIAddress } from "environments/environment";
import { ProcurementTemplateService } from './../../services/procurement-template.service';
import { ApplyListModalComponent } from '../applyListModal/applylist-modal.component';
import { ApprovalModalComponent } from '../approvalModal/approval-modal.component';
import { PurchaseOrderObj } from '../../services/NA-submit.service';
import { ApprovalMethodService } from '../../services/approval-method.service';
import { ShareDataService } from './../../services/share-data.service';

declare var window;

@Component({
    templateUrl: 'NA-deal.component.html',
    styleUrls: ['NA-deal.component.scss', 
        './../../scss/procurement.scss','./../../scss/deal-page.scss']
})
export class NADealComponent implements OnInit {
// part1-基础信息-start
// part1-基础信息-end
// part2-采购信息-start
    TemplateName;//模板名称
// part2-采购信息-end
// part3-采购清单-start
    procurementListPrice={//清单中的金额
        numAmount: 0//物料数量合计
    }
    procurementListShow=true;//采购清单是否显示标识
    applyListModal: XcModalRef;//采购清单展示模态框
    clospanNum=11;//不同情况下 列数的不同
    abroadData={//国外时 显示的字段
        conditionStr:'',//交货条件
        peopleStr:''//收货人
    }
// part3-采购清单-end
// part4-销售信息-start
// part4-销售信息-end
// part5-支持文件&用印文件-start
    AccessorySee_Support = [];//查看支持文件
// part5-支持文件&用印文件-end
// part6-采购申请信息-start
    applyListLocal;//采购申请信息
    applyListLocalShow=false;//有采购申请
// part6-采购申请信息-end
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
    NAType;//创建NA单类型 （目前三种类型：hasApply，directNA，prepareApplyNoContract）
    NAOrderData=new PurchaseOrderObj();//整体数据
    ISRMB=true;//是否 人民币 标识
    isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
    submiting=false;//审批中

    saleContractState:any=[];//保存去重后的销售合同信息

    procurementLink:any=dbomsPath+'procurement/deal-prepareapply/';//保存查看采购申请的路由地址

    purchaserequisitiontypeList=[//采购申请类型
        {'type': '合同单采购','link':'procurement/deal-contractapply/'},
        {'type': '预下单采购_有合同','link':'procurement/deal-prepareapply/'},
        {'type': '预下单采购_无合同','link':'procurement/deal-prepareapply/'},
        {'type': '备货单采购','link':'procurement/deal-stockapply/'}];

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
        private shareDataService: ShareDataService
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
                this.approvalMethodService.sign(this.urlParamObj.taskid,res.opinions,"Order",res.itcode,res.username).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
            if(res && this.approvalType=="transfer"){//转办
                this.submiting=true;
                this.approvalMethodService.turnTo(this.urlParamObj.taskid,res.opinions,"Order",res.itcode,res.username).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
        })
    }

// part3-采购清单-start
    showOrder() {//预览采购清单
        let modalData = {
            procurementList:this.NAOrderData.PurchaseOrderDetails,
            untaxAmount: this.NAOrderData.PruchaseAmount,
            factory: this.NAOrderData.FactoryCode,
            vendor: this.NAOrderData.Vendor
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

// part6-采购申请信息-start
    getApplyListLocal() {//获取 采购申请信息
        let SelectedData = {
            "PageIndex": 1,
            "PageSize":999,
            "RrequisitionNumList": []
        }
        let localArr = [];
        if (this.NAOrderData.PurchaseOrderDetails && this.NAOrderData.PurchaseOrderDetails.length) {//编辑
            for (let n = 0, lens = this.NAOrderData.PurchaseOrderDetails.length; n < lens; n++) {
                localArr.push(this.NAOrderData.PurchaseOrderDetails[n].PurchaseRequisitionNum);
            }
            SelectedData.RrequisitionNumList = localArr;
        }
        let url = "PurchaseManage/SelectedRequisitionInfo";
        this.dbHttp.post(url,SelectedData).subscribe(data => {
            this.applyListLocal = data.Data.List;
            if(this.applyListLocal && this.applyListLocal.length>=10){//出现滚动条的宽度调整
                $(".w170").addClass("w176");
            }
            this.countContractTotal();
        })
    }
    countContractTotal(){//计算采购申请信息里的localMoney(合同在清单中的未税总价 总计)
        if(this.NAType == "hasApply" && this.applyListLocal && this.applyListLocal.length){//有合同
            for (let i = 0, len = this.applyListLocal.length; i < len; i++) {
                this.applyListLocal[i].localMoney = 0;
                if(this.NAOrderData.PurchaseOrderDetails && this.NAOrderData.PurchaseOrderDetails.length){
                    for (let n = 0, lens = this.NAOrderData.PurchaseOrderDetails.length; n < lens; n++) {
                        if (this.applyListLocal[i].requisitionnum == this.NAOrderData.PurchaseOrderDetails[n].PurchaseRequisitionNum) {
                            let data = this.NAOrderData.PurchaseOrderDetails[n];
                            this.applyListLocal[i].localMoney += Number(data.Amount);
                        }
                    }
                }
            }
        }
        if(this.NAType == "prepareApplyNoContract" && this.applyListLocal && this.applyListLocal.length){//预下无合同
            this.applyListLocal[0].localMoney=this.NAOrderData.PruchaseAmount;
        }
    }
// part6-采购申请信息-end

// part7-审批-start
    onGetWfHistoryData() {//获取流程和审批历史
        if (this.urlParamObj.applyid) {
            let url = "PurchaseManage/PurchaseOrderApproveHistory/" + this.urlParamObj.applyid;//获取流程和审批历史
            let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
            let options = new RequestOptions({ headers: headers });
            let nodeIDUrl = "PurchaseManage/GetCurrentWFNode_PurchaseOrder/" + this.urlParamObj.applyid;//获取当前审批环节
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
                this.approvalMethodService.agree(this.urlParamObj.taskid,this.opinion,"Order").then(data => {
                    this.approvalCompleteDel(data);
                })
                break;
            case 'reject': //非-加签审批类-驳回
                this.submiting=true;
                this.approvalMethodService.reject(this.urlParamObj.taskid,this.opinion,"Order").then(data => {
                    this.approvalCompleteDel(data);
                })
                break;
            case 'sign': //非-加签审批类-加签
            case 'transfer': //非-加签审批类-转办
                this.approvalModal.show(this.approvalType);
                break;
            case 'agree+': //加签审批类-同意
                this.submiting=true;
                this.approvalMethodService.signApprovalAgree(this.urlParamObj.taskid,this.opinion,"Order").then(data => {
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
                this.router.navigate(['procurement/deal-NA/'+ this.urlParamObj.applyid]);
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
        window.close();
    }
// part7-审批-end

// part8-整体-start
    getProcurementData(id) {//获取整单数据
        let url = "PurchaseManage/GetPruchaseOrder/" + id;
        this.dbHttp.get(url).subscribe(data => {
            if (data.Result) {
                this.NAOrderData = data.Data;
                console.log("整单数据");
                console.log(this.NAOrderData);
                // #0-整体
                switch(this.NAOrderData.PurchaseRequisitionType){//判断NAType
                    case -1:
                        this.NAType="directNA";
                        this.clospanNum=10;
                        break;
                    case 0:
                    case 1:
                        this.NAType="hasApply";
                        break;
                    case 2:
                        this.NAType="prepareApplyNoContract";
                        break;
                }
                // #1-基础信息
                // #2-采购信息
                if (this.NAOrderData.TemplateID) {//获取模板名称
                    this.procurementTemplateService.getProcurementTplOne(this.NAOrderData.TemplateID).then(data => {
                        if (data.Result) {
                            this.TemplateName = data.Data.Name;
                        }
                    })
                }
                if (this.NAOrderData.CurrencyCode == "RMB") {//判断是否人民币
                    this.ISRMB = true;
                }else{
                    this.ISRMB = false;
                }
                let deliveryAllInfo = {
                    condition:[],//交货条件
                    people:[]//收货人
                }
                this.shareDataService.getDeliverySelectInfo().then(data => {//交货条件和收货人 数据
                    deliveryAllInfo.condition=data.condition;
                    deliveryAllInfo.people=data.people;
                    for(let i=0,len=deliveryAllInfo.condition.length;i<len;i++){//国际贸易条件
                        if(deliveryAllInfo.condition[i]["id"]==this.NAOrderData.DeliveryCondition){
                            this.abroadData.conditionStr=deliveryAllInfo.condition[i]["text"];
                        }
                    }
                    for(let i=0,len=deliveryAllInfo.people.length;i<len;i++){//收货人
                        if(deliveryAllInfo.people[i]["id"]==this.NAOrderData.DeliveryPeople){
                            this.abroadData.peopleStr=deliveryAllInfo.people[i]["text"];
                        }
                    }
                })
                // #3-采购清单
                this.NAOrderData.PurchaseOrderDetails.forEach(item => {//采购清单的物料来源显示 进行拼接
                    this.procurementListPrice.numAmount += item.Count;//数量总计
                    if(this.NAType=="hasApply"){
                        item["text"]=item["PurchaseRequisitionNum"] + "-" + item["MainContractCode"];
                    }else{
                        item["text"]=item["MaterialSource"];
                    }
                    //将合同变更状态，合同解除状态，新合同代码和合同号，push进入新数组
                    this.saleContractState.push(JSON.stringify({SCType:item.SCType,New_Sc_Code:item.New_Sc_Code,MainContractCode:item.MainContractCode}));
                });

                this.getChangeSaleConteractState();//获取变更的销售合同列表

                // if(this.NAOrderData.PurchaseOrderDetails.length >= 10){//出现滚动条的宽度调整
                //     $(".w140").addClass("w146");
                // }
                // #4-销售信息
                // #5-支持文件&用印文件
                let i; let len = this.NAOrderData.PurchaseOrderAccessories.length;
                for (i = 0; i < len; i++) {//去除附件数组中的空值
                    if (!this.NAOrderData.PurchaseOrderAccessories[i]) {
                        this.NAOrderData.PurchaseOrderAccessories.splice(i, 1);
                        len--;
                        i--;
                    }
                }
                this.NAOrderData.PurchaseOrderAccessories.forEach(item => {
                    this.AccessorySee_Support.push({
                        AccessoryURL: item.AccessoryURL,
                        AccessoryName: item.AccessoryName
                    })
                })
                // #6-采购申请信息
                if(this.NAType == "hasApply" || this.NAType == "prepareApplyNoContract"){//非BH情况
                    //获取采购申请信息
                    this.getApplyListLocal();
                    this.applyListLocalShow=true;
                }
                // #7-审批
                // #8-整体
                // #9-其他
            }else {
                this.WindowService.alert({ message: '接口异常', type: 'fail' });
            }
        })
    }
// part8-整体-end

// part9-其他-start
getChangeSaleConteractState(){
    //去除重复项
    this.saleContractState=Array.from(new Set(this.saleContractState));
    this.saleContractState.forEach((element,index) => {//将数组元素转换为JSON对象
        this.saleContractState[index]=JSON.parse(element);
    });

    //过滤出变更或解除的合同列表
    this.saleContractState=this.saleContractState.filter(item=>item.SCType!==null);
}
// part9-其他-end

//跳转到采购申请的查看页面
getProcurementApply(purchaserequisitiontype,purchaserequisitionid) {
    this.purchaserequisitiontypeList.forEach(element=> {
        if(element.type===purchaserequisitiontype) {
             window.open(dbomsPath+element.link+purchaserequisitionid);
        }
    });
  }

}