// NK-采购清单
import {
    Component, OnInit, Input, EventEmitter, Output, ElementRef,
    ViewChild, AfterViewInit, DoCheck, OnChanges, SimpleChanges
} from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

declare var $: any;
import { WindowService } from 'app/core';
import { dbomsPath } from "environments/environment";
import { HttpServer } from 'app/shared/services/db.http.server';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { PurchaseOrderDetails } from './../../../services/NK-new.service';
import { ApplyListModalComponent } from './../../applyListModal/applylist-modal.component';
import { ShareMethodService } from './../../../services/share-method.service';

@Component({
    selector: "NK-new-list",
    templateUrl: 'NK-new-list.component.html',
    styleUrls: ['NK-new-list.component.scss',
        './../../../scss/procurement.scss', './../../../scss/submit-list.scss']
})
export class NKNewListComponent implements OnInit, OnChanges {
    prepareApplyNoContract_requisitionnum;//预下无合同情况-存预下无合同申请的申请单号
    applyListModal: XcModalRef;//采购清单展示模态框
    @Input() numAmount: number = 0;//物料数量合计
    public _purchaseData = {
        procurementList: [],
        untaxAmount: 0,//未税总金额
        taxAmount: 0,//含税总金额
        foreignAmount: 0 //外币总金额
    };
    tempAmountPrice = 0;//临时存储的 总金额（会是未税总金额 或者 外币总金额）

    fullChecked = false;//全选状态
    fullCheckedIndeterminate = false;//半选状态
    checkedNum = 0;//已选项数
    clospanNum = 10;//不同情况下 列数的不同
    fileUploadApi = "api/PurchaseManage/UploadPurchaseOrderDetails/2";//直接创建NK-批量上传处理接口
    upLoadData;//上传文件接口相关参数

    @ViewChild(NgForm)
    purchaseListForm;//表单
    beforePurchaseFormValid;//表单的前一步校验结果

    @Input() rate;//税率
    @Input() purchaseOrderID: '';//采购订单id
    @Input() factory;//工厂
    @Input() vendor;//供应商
    @Input() IsRMB: boolean = true;//是否 人民币
    @Input() currency;//币种
    @Input() isSubmit = false;//是否提交
    @Input() set purchaseData(value) {
        this._purchaseData = value;
    }
    @Output() onPurchaseDataChange = new EventEmitter<any>();
    @Output() purchaseFormValidChange = new EventEmitter<any>();//采购清单是否校验通过    
    constructor(private http: Http,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private shareMethodService: ShareMethodService,
        private dbHttp: HttpServer) { }

    ngOnInit() {
        this.applyListModal = this.xcModalService.createModal(ApplyListModalComponent);//预览采购清单
        this.tempAmountPrice = this._purchaseData.untaxAmount;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["rate"]) {
            if (changes["rate"].currentValue != changes["rate"].previousValue) {//税率变化
                if (typeof (changes["rate"].currentValue) == "undefined" || changes["rate"].currentValue == null) {//变化为无值
                    this._purchaseData.taxAmount = 0;
                    this.onPurchaseDataChange.emit(this._purchaseData);
                } else {
                    this.calculateTotalTax("rateChange");//重新计算
                }
            }
        }
        if (changes["currency"]) {
            if (changes["currency"].currentValue != changes["currency"].previousValue) {//币种 变化
                this.calculateTotalTax("currencyChange");//重新计算
            }
        }
    }
    ngDoCheck() {
        if (this.purchaseListForm.valid != this.beforePurchaseFormValid) {//表单校验变化返回
            this.beforePurchaseFormValid = this.purchaseListForm.valid;
            this.purchaseFormValidChange.emit(this.purchaseListForm.valid);
        }
        if (this._purchaseData.procurementList && this._purchaseData.procurementList.length >= 10) {//出现滚动条的宽度调整
            $(".w40").addClass("w46");
            $(".addApp-ch-before tbody").addClass("auto");
        } else {
            $(".w40").removeClass("w46");
            $(".addApp-ch-before tbody").removeClass("auto");
        }
    }

    calculateTotal(index) {//改变数量和单价时
        let item = this._purchaseData.procurementList[index];
        if (item.Count && item.Price) {
            let num = item.Count * item.Price;
            item.Amount = Number(num.toFixed(2));//未税总价
        } else {
            item.Amount = 0;
        }
        this.calculateTotalTax("numberChange");
    }
    taxrateTotalFun = function () {//税率相关值 计算
        if (typeof (this.rate) == "undefined" || this.rate == null) {
            this.windowService.alert({ message: "税率未选择", type: "warn" });
        } else {
            this._purchaseData.taxAmount = Number((this._purchaseData.untaxAmount * (1 + Number(this.rate))).toFixed(2));//含税总金额
        }
    }
    currencyDiffeFun = function () {//币种变化时 重新辨别计算总额
        if (!this.tempAmountPrice) {//无总额 不计算
            this.onPurchaseDataChange.emit(this._purchaseData);
            return;
        }
        if (this.IsRMB) {//人民币 情况
            this._purchaseData.untaxAmount = this.tempAmountPrice;//未税总金额
            this.taxrateTotalFun();
            this.onPurchaseDataChange.emit(this._purchaseData);
        } else {//外币 情况
            console.log(this._purchaseData.foreignAmount);
            this._purchaseData.foreignAmount = this.tempAmountPrice;//外币总金额
            this.shareMethodService.getRateConvertPrice(this._purchaseData.foreignAmount, this.currency)
                .then(data => {//根据最新汇率 计算总额
                    this._purchaseData.untaxAmount = data;
                    this._purchaseData.taxAmount = data;
                    this.onPurchaseDataChange.emit(this._purchaseData);
                });
        }
    }
    calculateTotalTax(changeType) {//计算总价
        // 因为此方法中包括异步请求(getRateConvertPrice),所以把返回数据(emit)写在此方法的所有情况中,调用此方法后可省略emit返回
        switch (changeType) {//不同变化情况下 计算
            case "rateChange"://税率变更
                if (this.IsRMB) {
                    this.taxrateTotalFun();
                }
                this.onPurchaseDataChange.emit(this._purchaseData);
                break;
            case "currencyChange"://币种变更
                this.tempAmountPrice = 0;
                this._purchaseData.procurementList.forEach(item => {
                    if (item.Count && item.Price) {
                        this.tempAmountPrice = Number((this.tempAmountPrice + item.Count * item.Price).toFixed(2));
                    }
                })
                this.currencyDiffeFun();
                break;
            case "numberChange"://数量变更
                this.numAmount = 0;
                this._purchaseData.untaxAmount = 0;
                this._purchaseData.taxAmount = 0;
                this._purchaseData.foreignAmount = 0;
                this.tempAmountPrice = 0;
                this._purchaseData.procurementList.forEach(item => {
                    if (item.Count) {
                        this.numAmount = Number(this.numAmount + Number(item.Count));//物料数量合计
                    }
                    if (item.Count && item.Price) {
                        this.tempAmountPrice = Number((this.tempAmountPrice + item.Count * item.Price).toFixed(2));
                    }
                })
                this.currencyDiffeFun();
                break;
        }
    }
    delProcurementItem(index) {//删除一项采购清单
        let reCount = true;
        if (!this._purchaseData.procurementList[index]["Count"]
            && !this._purchaseData.procurementList[index]["Price"]) {//如果删除的行没有数量和单价 不需要重新计算
            reCount = false;
        }
        if (this._purchaseData.procurementList[index].checked) {
            this.checkedNum--;//选项减一
            if (!this.checkedNum) {//减最后一项
                this.fullChecked = false;
                this.fullCheckedIndeterminate = false;
            }
        }
        this._purchaseData.procurementList.splice(index, 1);
        if (reCount) {
            this.calculateTotalTax("numberChange");
        } else {
            this.onPurchaseDataChange.emit(this._purchaseData);
        }

        this._purchaseData.procurementList=JSON.parse(JSON.stringify(this._purchaseData.procurementList));
    }
    addProcurementItem() {//增加一项采购清单
        this._purchaseData.procurementList.push(new PurchaseOrderDetails());
        let len = this._purchaseData.procurementList.length;
        if (this.fullChecked) {//如果全选，变成半选
            this.fullChecked = false;
            this.fullCheckedIndeterminate = true;
        }
        this.onPurchaseDataChange.emit(this._purchaseData);
    }
    deleteList() {//批量删除采购清单列表
        if (!this.checkedNum) {
            this.windowService.alert({ message: "还未选择项", type: "warn" });
            return;
        }
        if (this.fullChecked) {//全选删除
            this._purchaseData.procurementList = [];
            this.tempAmountPrice = 0;
            this.numAmount = 0;
            this._purchaseData.untaxAmount = 0;
            this._purchaseData.taxAmount = 0;
            this._purchaseData.foreignAmount = 0;
            this.fullChecked = false;
            this.fullCheckedIndeterminate = false;
            this.onPurchaseDataChange.emit(this._purchaseData);
            return;
        }
        this.fullCheckedIndeterminate = false;
        let i; let item;
        let len = this._purchaseData.procurementList.length;
        for (i = 0; i < len; i++) {
            item = this._purchaseData.procurementList[i];
            if (item.checked === true) {
                this._purchaseData.procurementList.splice(i, 1);
                this._purchaseData.procurementList=JSON.parse(JSON.stringify( this._purchaseData.procurementList));// 重新物料列表，用来重置form表单的绑定项

                len--;
                i--;
            }
        }
        this.calculateTotalTax("numberChange");
    }
    showOrder() {//预览采购清单
        console.log(this._purchaseData);
        let modalData = {
            procurementList: this._purchaseData.procurementList,
            untaxAmount: this._purchaseData.untaxAmount,
            factory: this.factory,
            vendor: this.vendor
        }
        this.applyListModal.show(modalData);
    }
    downloadTpl() {//下载采购清单模板
        window.open(dbomsPath + 'assets/downloadtpl/NK新建-采购清单-直接创建.xlsx');
    }
    materialTraceno(index, no) {//需求跟踪号的校验
        if (!no) {//为空不校验
            return;
        }
        let validName = "traceno" + index;
        if (this.purchaseListForm.controls[validName].invalid) {//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            return;
        }
        this._purchaseData.procurementList[index]["TrackingNumber"] = this._purchaseData.procurementList[index]["TrackingNumber"].toUpperCase();//转大写
        this.shareMethodService.checkOrderTracenoExist(this._purchaseData.procurementList[index]["TrackingNumber"], this.purchaseOrderID)
            .then(data => {
                if (!data) {
                    this.windowService.alert({ message: "该需求跟踪号已经存在，请重新输入", type: 'fail' });
                    this._purchaseData.procurementList[index]["TrackingNumber"] = "";
                } else {
                    this.onPurchaseDataChange.emit(this._purchaseData);
                }
            })
    }
    uploadPurchase(e) {//批量上传
        if (e.Result) {
            let result = e.Data;
            if (result && result.length && this.fullChecked) {//如果全选，变成半选
                this.fullChecked = false;
                this.fullCheckedIndeterminate = true;
            }
            result.forEach(item => {//分别匹配

                item.Batch=item.Batch.toUpperCase();//将批次转换为大写

                item["isImport"] = false;
                item.Price = Number(item.Price).toFixed(2);
                item.Amount = Number(item.Amount).toFixed(2);
                delete item.AddTime; delete item.ID; delete item.materialSource
                delete item.PurchaseOrder_ID; delete item.SortNum;
                item.Batch=item.Batch.toUpperCase();
            });
            let newArr = this._purchaseData.procurementList.concat(result);
            this._purchaseData.procurementList = newArr;//把excel中列表显示页面
            this.calculateTotalTax("numberChange");
        } else {
            this.windowService.alert({ message: e.Message, type: "warn" });
        }
    }

    hoverText(i) {//select hover显示字段
        return $("#materialSource" + i + " option:selected").text();
    }
    getMaterialData(index, id) {//根据物料号读取信息
        if (id) {
            this._purchaseData.procurementList[index].MaterialNumber = id.trim();//首尾去空格
            this.matchMaterial(this._purchaseData.procurementList[index].MaterialNumber).then(response => {
                if (response.Data["MAKTX_ZH"]) {//获取描述
                    this._purchaseData.procurementList[index].MaterialDescription = response.Data["MAKTX_ZH"];
                } else {
                    this._purchaseData.procurementList[index].MaterialDescription = "";
                    this.windowService.alert({ message: "该物料不存在", type: "warn" });
                }
                this.onPurchaseDataChange.emit(this._purchaseData);
            })
        } else {//清空物料 也需返回
            this._purchaseData.procurementList[index].MaterialDescription = "";
            this.onPurchaseDataChange.emit(this._purchaseData);
        }
    }
    getApplyAlreadyExistItem(newItem, detailItem) {//复制采购申请中 已有清单数据 到显示页面 操作Item
        newItem["MaterialNumber"] = detailItem["MaterialNumber"];
        newItem["MaterialDescription"] = detailItem["MaterialDescription"];
        newItem["Count"] = detailItem["Count"];
        newItem["Price"] = Number(detailItem["Price"]).toFixed(2);
        newItem["Amount"] = Number(detailItem["Amount"]).toFixed(2);
        newItem["StorageLocation"] = detailItem["StorageLocation"];
        newItem["Batch"] = detailItem["Batch"];
        newItem["TrackingNumber"] = detailItem["traceno"];
    }
    CheckIndeterminate(v) {//检查是否全选
        this.fullCheckedIndeterminate = v;
    }
    matchMaterial(id) {//匹配物料
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("api/PurchaseManage/GetMaterialInfo/" + id, options)
            .toPromise()
            .then(response => response.json())
    }
}