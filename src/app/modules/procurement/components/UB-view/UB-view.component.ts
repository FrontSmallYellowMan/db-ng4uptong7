//查看 或 审批 UB单
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any,window;
import { WindowService } from 'app/core';
import { DbWfviewComponent } from 'app/shared/index';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { dbomsPath, environment,APIAddress } from "environments/environment";
// import { ProcurementTemplateService } from './../../services/procurement-template.service';
import { UBApplyList } from './applylist-modal.component';
import { ApprovalModalComponent } from '../approvalModal/approval-modal.component';
import { ApprovalMethodService } from '../../services/approval-method.service';
import { UB_RelatedService, formData } from '../../services/UB-related.service'

@Component({
    templateUrl: 'UB-view.component.html',
    styleUrls: ['UB-view.component.scss', 
        './../../scss/procurement.scss','./../../scss/deal-page.scss']
})
export class UBViewComponent implements OnInit {
    @ViewChild('UBViewForm') form: NgForm;
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
    clospanNum=11;//采购清单列数 
// part3-采购清单-end
// part4-销售信息-start
// part4-销售信息-end
// part5-支持文件&用印文件-start
    AccessorySee_Support = [];//查看支持文件
// part5-支持文件&用印文件-end

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
    UBOrderData=new formData();//整体数据
    ISRMB=true;//是否 人民币 标识
    isView: boolean = true;//是否查看页面 查看页面(true) 审批页面(false)
    submiting=false;//审批中
    isSubmit: boolean = false; // 点击同意，加签或者转办
    isFinal: boolean = false; // 是否是物流收获岗
    extraParams: any; // 审批的额外参数
    isCompleted: boolean =false; // 是否已完成
// part8-整体-end    
    // 申请人名称
    _ApplicantName: any;
    // 区分海外或者DCG采购员展示
    _CompanyCode: any;
    // 采购清单表头配置
    public tableConfig: any = [
        { title: '物料号', field: 'MaterialNumber', value: '', width: '10%', isRequired: true },
        { title: '物料描述', field: 'MaterialDescription', value: '', width: '15%', isRequired: false },
        { title: '数量', field: 'Count', value: '', width: '5%', isRequired: true },
        { title: '内部交易价', field: 'InterTransPrice', value: '', width: '8%', isRequired: true },
        { title: '转入库存地', field: 'StorageLocation', value: '', width: '5%', isRequired: false },
        { title: '转出库存地', field: 'StorageLocationOut', value: '', width: '5%', isRequired: false },
        { title: '转入批次', field: 'Batch', value: '', width: '8%', isRequired: false },
        { title: '转出批次', field: 'BatchOut', value: '', width: '8%', isRequired: false },
        { title: '是否入库（30天内）', field: 'IsStoreFor30', value: '', width: '8%', isRequired: false },
        { title: '是否本月销售', field: 'IsCurrentMonthSale', value: '', width: '8%', isRequired: false },
        { title: '销售合同号', field: 'MainContractCode', value: '', width: '20%', isRequired: false }
    ];
    

    constructor(
        private WindowService: WindowService,
        private xcModalService: XcModalService,
        private _UBService: UB_RelatedService,
        private routerInfo: ActivatedRoute,
        // private procurementTemplateService: ProcurementTemplateService,
        private approvalMethodService: ApprovalMethodService,
        private router: Router
    ) { 
    }

    ngOnInit() {
        // 获取id
        this.routerInfo.paramMap.subscribe(params => {
            if(params.get('id')){ // 编辑
                this.urlParamObj.applyid = params.get('id');
            } else{
                this.urlParamObj.applyid = this.routerInfo.snapshot.queryParams['recordid'];
            }
        })

        //初始 获取参数
        this.urlParamObj.nodeid = this.routerInfo.snapshot.queryParams['nodeid'];
        this.urlParamObj.taskid = this.routerInfo.snapshot.queryParams['taskid'];
        this.urlParamObj.adp = this.routerInfo.snapshot.queryParams['ADP'];
        this.urlParamObj.TS = this.routerInfo.snapshot.queryParams['TS'];
        
        if (this.urlParamObj.taskid) {//判断 是否审批页面
            this.isView = false;
        }
        if(this.urlParamObj.TS=='0'){//判断 是否审批页面 多一层
            this.isView = true;
        }
        if (this.urlParamObj.adp) {//判断 是否加签审批页面
            this.isSignApprovalPage = true;
        }
        
        this.getProcurementData(this.urlParamObj.applyid);//获取 整单数据
        this.applyListModal = this.xcModalService.createModal(UBApplyList);//预览采购清单
        this.approvalModal = this.xcModalService.createModal(ApprovalModalComponent);//加签转办审批窗口
        this.approvalModal.onHide().subscribe((res?) => {
            // 物流收货岗
            if(this.isFinal){
                this.extraParams = { MBLNR: this.UBOrderData.MBLNR.value }
            }

            if(res && this.approvalType=="sign"){//加签
                this.submiting=true;
                this.approvalMethodService.sign(this.urlParamObj.taskid,res.opinions,"Order",res.itcode,res.username, this.extraParams).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
            if(res && this.approvalType=="transfer"){//转办
                this.submiting=true;
                this.approvalMethodService.turnTo(this.urlParamObj.taskid,res.opinions,"Order",res.itcode,res.username, this.extraParams).then(data => {
                    this.approvalCompleteDel(data);
                })
            }
        })
    }
    // part3-采购清单-start
    showOrder() {//预览采购清单
        let modalData = {
            procurementList:this.UBOrderData.PurchaseOrderDetails.value,
            untaxAmount: this.UBOrderData.PruchaseAmount.value,
            factory: this.UBOrderData.FactoryCode.value
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


// part7-审批-start
    onGetWfHistoryData() {//获取流程和审批历史
        if (this.urlParamObj.applyid) {
            this._UBService.getApproveHistory(this.urlParamObj.applyid).then(data => {
                if (data.Result) {
                    this.wfData = JSON.parse(data.Data);
                    let progressOne = {
                        "NodeID": "1",
                        "NodeName": "申请人",
                        "IsShow": true,
                        "IsAlready": true,
                        "AuditDate": "",
                        'NodeApprovers': this._ApplicantName,
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

                    this.wfView.onInitData(this.wfData.wfProgress);
                }
            });
        }
    }
    doApproval(approvalType){//各审批
        this.isSubmit = true;

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
        // 物流收获岗，需要填写物流凭证号
        if(this.isFinal && this.form.invalid){
            this.WindowService.alert({ message: '请填写物流收货岗 ', type: "fail" });
            return;
        }
        this.approvalType=approvalType;

        // 物流收货岗
        if(this.isFinal){
            this.extraParams = { MBLNR: this.UBOrderData.MBLNR.value }
        }

        switch (approvalType) {
            case 'agree'://非-加签审批类-同意
                this.submiting=true;
                this.approvalMethodService.agree(this.urlParamObj.taskid,this.opinion,"Order", this.extraParams).then(data => {
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
                // 物流收货岗需要填写物料凭证号
                if(this.isFinal && this.form.invalid){
                    this.WindowService.alert({ message: '请填写物流收货岗 ', type: "fail" });
                    break;
                }

                this.approvalModal.show(this.approvalType);
                break;
            case 'agree+': //加签审批类-同意
                this.submiting=true;
                this.approvalMethodService.signApprovalAgree(this.urlParamObj.taskid,this.opinion,"Order", this.extraParams).then(data => {
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
                this.router.navigate(['procurement/deal-UB/'+ this.urlParamObj.applyid]);
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
        this._UBService.getPruchaseOrder(id).then(data => {
            if (data.Result) {
                // 赋值
                for(var key in this.UBOrderData){
                    this.UBOrderData[key].value = data.Data[key];
                }
                // #1-基础信息
                // #2-采购信息
                // if (this.UBOrderData.TemplateID) {//获取模板名称
                //     this.procurementTemplateService.getProcurementTplOne(this.UBOrderData.TemplateID).then(data => {
                //         if (data.Result) {
                //             this.TemplateName = data.Data.Name;
                //         }
                //     })
                // }
                // #3-采购清单
                this.UBOrderData.PurchaseOrderDetails.value.forEach(item => {//采购清单的物料来源显示 进行拼接
                    this.procurementListPrice.numAmount += item.Count; //数量总计
                    item["InterTransPrice"]=Number(item["InterTransPrice"]).toFixed(2);
                    item['IsStoreFor30'] = item['IsStoreFor30'] ? '是' : '否';
                    item['IsCurrentMonthSale'] = item['IsCurrentMonthSale'] ? '是' : '否';
                });
                // #4-销售信息
                // #5-支持文件&用印文件
                let i; let len = this.UBOrderData.PurchaseOrderAccessories.value.length;
                for (i = 0; i < len; i++) {//去除附件数组中的空值
                    if (!this.UBOrderData.PurchaseOrderAccessories.value[i]) {
                        this.UBOrderData.PurchaseOrderAccessories.value.splice(i, 1);
                        len--;
                        i--;
                    }
                }
                this.UBOrderData.PurchaseOrderAccessories.value.forEach(item => {
                    this.AccessorySee_Support.push({
                        AccessoryURL: item.AccessoryURL,
                        AccessoryName: item.AccessoryName
                    })
                })
                // #7-审批
                this._ApplicantName = data.Data['ApplicantName'];
                this._CompanyCode = data.Data['CompanyCode'];
            
                this.onGetWfHistoryData();//获取流程和审批历史
                // 判断是否是物流收获岗
                if(data.Data['CurrentApprovalNode']){
                    this.isFinal = data.Data['CurrentApprovalNode'].indexOf('物流收货岗') > -1 || (this.UBOrderData.MBLNR.value && this.UBOrderData.MBLNR.value !== '');
                }

                this.extraParams = null;
                // #8-整体
                // 判断是否完成
                this.isCompleted = data.Data['ApproveState'] === '完成';
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