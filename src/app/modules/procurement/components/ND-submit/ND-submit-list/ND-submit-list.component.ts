// ND单页面-采购清单
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
import { PurchaseOrderDetails } from './../../../services/ND-submit.service';
import { NDCheckResultModalComponent } from '../../NDCheckResultModal/NDCheckResult-Modal.component';
import { ShareMethodService } from './../../../services/share-method.service';
import { NDPurchaseListModalComponent } from '../../NDPurchaseListModal/NDPurchaseList-Modal.component';

import { PrepareApplyCommunicateService } from "../../../services/communicate.service";

@Component({
    selector: "ND-submit-list",
    templateUrl: 'ND-submit-list.component.html',
    styleUrls: ['ND-submit-list.component.scss',
        './../../../scss/procurement.scss', './../../../scss/submit-list.scss']
})
export class NDSubmitListComponent implements OnInit, OnChanges {
    applyListModal: XcModalRef;//采购清单展示模态框
    NDCheckResultModal: XcModalRef;//ND单行项目校验结果展示
    numAmount: number = 0;//物料数量合计
    batchParameter={//批量修改的参数
        storageLoc:null,
        discount:null
    }
    public _purchaseData = {
        procurementList: [],
        preDiscount: 0,// 折扣前合计金额（报关总价之和）
        afterDiscount: 0 // 折扣后合计金额
    };
    beforeNAList = [];//存上一个本地选择的NA列表

    fullChecked = false;//全选状态
    fullCheckedIndeterminate = false;//半选状态
    checkedNum = 0;//已选项数
    fileUploadApi = "api/PurchaseManage/UploadPurchaseOrderDetails/6";//批量上传路径
    _NDType;//创建ND单类型
    newNAShow = false;//新增NA 是否显示标识

    SaleContractCodeAndName:any=[];//保存物料明细列表中的销售合同号和销售合同名称
    changeSaleContractCodeAndName:any=[];//保存变更后的销售合同号和销售合同名称

    @ViewChild(NgForm)
    purchaseListForm;//表单
    beforePurchaseFormValid;//表单的前一步校验结果

    @Input() purchaseOrderID: '';//采购订单id
    @Input() factory;//工厂
    @Input() vendor;//供应商
    @Input() set NDType(value) {
        this._NDType = value;
    };
    @Input() isSubmit = false;//是否提交
    @Input() set purchaseData(value) {
        this._purchaseData = value;
    }
    @Input() MegDiscount = 1;//采购信息中的 折扣系数

    @Output() onPurchaseDataChange = new EventEmitter<any>();
    @Output() purchaseFormValidChange = new EventEmitter<any>();//采购清单是否校验通过    

    constructor(private http: Http,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private shareMethodService: ShareMethodService,
        private dbHttp: HttpServer,
    private ndCommunicateService:PrepareApplyCommunicateService) { }

    ngOnInit() {
        this.applyListModal = this.xcModalService.createModal(NDPurchaseListModalComponent);//预览采购清单
        this.NDCheckResultModal = this.xcModalService.createModal(NDCheckResultModalComponent);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["MegDiscount"]) {
            if (changes["MegDiscount"].currentValue && this._NDType=='hasNA') {
                if(this._purchaseData.preDiscount){//有总价
                    this._purchaseData.preDiscount = 0; this._purchaseData.afterDiscount = 0;
                    for (let i = 0, len = this._purchaseData.procurementList.length; i < len; i++) {
                        let item = this._purchaseData.procurementList[i];
                        if (item.CustomsPrice) {
                            item.CustomsPriceAfterDiscount = (item.CustomsPrice * this.MegDiscount).toFixed(2);// 6.折扣后报关单价=报关单价*折扣系数（采购信息中）
                            if (item.CustomsSumPrice) {
                                item.CustomsSumPriceAfterDiscount = (item.CustomsSumPrice * this.MegDiscount).toFixed(2);// 8.折扣后报关总价=报关总价*折扣系数（采购信息）
                            }
                        }
                        this._purchaseData.preDiscount += parseFloat(item.CustomsSumPrice);//报关总价 之和
                    }
                    this._purchaseData.afterDiscount = parseFloat((this._purchaseData.preDiscount * this.MegDiscount).toFixed(2));// 8.折扣后报关总价=报关总价*折扣系数（采购信息）
                    this.onPurchaseDataChange.emit(this._purchaseData);
                }
            }
        }
        if (changes["NDType"] && changes["NDType"].currentValue) {//新建 NDType传入值
            if (!this.purchaseOrderID && changes["NDType"].currentValue == "hasNA") {
                this.getNAAlreadyExistList();
            }
        }
    }
    ngDoCheck() {
        if (this.purchaseListForm.valid != this.beforePurchaseFormValid) {//表单校验变化返回
           
            this.beforePurchaseFormValid = this.purchaseListForm.valid;
            this.purchaseFormValidChange.emit(this.purchaseListForm.valid);
            console.log(this.purchaseListForm.valid);
        }
        if (this._purchaseData.procurementList && this._purchaseData.procurementList.length >= 10) {//出现滚动条的宽度调整
            $(".w40").addClass("w46");
            $(".addApp-ch-before tbody").addClass("auto");
        } else {
            $(".w40").removeClass("w46");
            $(".addApp-ch-before tbody").removeClass("auto");
        }
    }
    getNAAlreadyExistList() {//新建时请求已有NA的清单
        let list = JSON.parse(window.localStorage.getItem("NAList"));
        if (list && list.length) {
            for (let i = 0, len = list.length; i < len; i++) {
                this.addItemNAMateriel(list[i]["ID"], list[i]["ERPOrderNumber"],Boolean(i==(len-1)),"firstAdd",list[i]['TableName']);
            }
        }
    }
    inspectReduceNA(arr1, arr2) { //减少的NA
        //arr1:前NA列表
        //arr2:后NA列表
        let reduce = [];
        for (let i = 0, leni = arr1.length; i < leni; i++) {
            let j; let lenj = arr2.length;
            for (j = 0; j < lenj; j++) {
                if (arr1[i]["ID"] == arr2[j]["ID"]) {
                    break;
                }
            }
            if (j == lenj) { reduce.push(arr1[i]); }
        }
        return reduce;
    }
    inspectAddNA(arr1, arr2) { //增加的NA
        //arr1:前NA列表
        //arr2:后NA列表
        let add = [];
        for (let i = 0, leni = arr2.length; i < leni; i++) {
            let j; let lenj = arr1.length;
            for (j = 0; j < lenj; j++) {
                if (arr1[j]["ID"] == arr2[i]["ID"]) {
                    break;
                }
            }
            if (j == lenj) { add.push(arr2[i]); }
        }
        return add;
    }
    onCompleteAddNA(e) {//添加合同窗口 关闭后
        this.newNAShow = e.newNAShow;
        let list = JSON.parse(window.localStorage.getItem("NAList"));
        let reduce = this.inspectReduceNA(this.beforeNAList, list);
        //let add = this.inspectAddNA(this.beforeNAList, list);
        if (reduce.length) {//减少的NA 将已导入的物料删除
            for (let i = 0, len = reduce.length; i < len; i++) {
                let indexArr = this.NAIndexOfProcurementList(reduce[i]["ID"]);
                if (indexArr.length) {//存在
                    let j = 0;//index变化
                    for (let k = 0, lenk = indexArr.length; k < lenk; k++ , j++) {
                        this._purchaseData.procurementList.splice(indexArr[k] - j, 1);
                    }
                }
            }
        }
        if(e.isRestList){
            this.fullChecked = false;//全选状态
            this.fullCheckedIndeterminate = false;//半选状态
            this.checkedNum = 0;//已选项数
            list.forEach((element,index) => {
                this.addItemNAMateriel(element.ID,element.ERPOrderNumber,Boolean(index==(list.length-1)),"addAgain",element.TableName);
            });
        }
    
        //if(add.length){//增加的NA 导入该NA的物料
            // for (let i = 0, len = add.length; i < len; i++) {
            //     this.addItemNAMateriel(add[i]["ID"], add[i]["ERPOrderNumber"],Boolean(i==(len-1)),"addAgain",add[i]['TableName']);
            // }
        //}
    }
    NAIndexOfProcurementList(id) {//NA单在已有清单中的index
        let indexArr = [];
        for (let i = 0, len = this._purchaseData.procurementList.length; i < len; i++) {
            if (this._purchaseData.procurementList[i]["NAOrderId"] == id) {
                indexArr.push(i);
            }
            if (this._purchaseData.procurementList[i]["NARequisitionOrderId"] == id) {
                indexArr.push(i);
            }
        }
        return indexArr;
    }
    addItemNAMateriel(id, orderNum,isLast,addType,TableName) {//提供NA id号 把该NA单下的清单添加进页面清单
        console.log(id, orderNum,isLast,addType,TableName);
        this._purchaseData.procurementList=[];//重置视图中绑定的物料明细列表
        
        //orderNum：该ID单NA的NA单号
        //isLast：循环中的最后一个NA单
        //addType：以NA添加物料的方式
        //TableName:判断是NA单还是采购申请，用以判断请求不同的接口获取物料明细
        
        if(TableName==='0'){//获取NA单的物料
            this.dbHttp.get("PurchaseManage/GetPruchaseOrder/" + id).subscribe(data => {//获取已选采购申请的采购清单
                if (data.Result) {
                    let detailsArr = data.Data.PurchaseOrderDetails;
                    console.log("原物料:" + id +"---"+ orderNum);
                    console.log(detailsArr);
                    for (let j = 0, lens = detailsArr.length; j < lens; j++) {
                        let surplus = detailsArr[j]["Count"] - detailsArr[j]["NDOrderStatistics"];//剩余数量
                        if (surplus) {//剩余大于0
                            let newItem = new PurchaseOrderDetails();
                            newItem["NA_ERPOrderNumber"] = orderNum;
                            newItem["NAOrderId"] = id;
                            newItem["MaterialNumber"] = detailsArr[j]["MaterialNumber"];
                            newItem["MaterialDescription"] = detailsArr[j]["MaterialDescription"];
                            newItem["Count"] = surplus;
                            newItem["ResidualQuantity"] = surplus;
                            newItem["CostPrice"] = detailsArr[j]["Price"];
                            newItem["Batch"] = detailsArr[j]["Batch"];
                            newItem["DeliveryStoreLocation"] = detailsArr[j]["StorageLocation"];
                            if(addType=="firstAdd"){
                                this.numAmount += newItem["Count"];
                            }
                                this._purchaseData.procurementList.push(newItem);

                            // if(addType=="firstAdd" && isLast){
                            //     this.onPurchaseDataChange.emit(this._purchaseData);
                            // }
                            // if(addType=="addAgain" && isLast){
                            //     this.calculateTotalDiscountAmount();
                            // }
                        }
                    }
                }
            })
        }else{
           //获取采购申请的物料
           this.getPurchaseManage(id,orderNum,addType);
        }

        if(addType=="firstAdd" && isLast){
            this.onPurchaseDataChange.emit(this._purchaseData);
        }
        if(addType=="addAgain" && isLast){
            this.calculateTotalDiscountAmount();
        }
        
    }

    //获取采购申请中的物料明细
    getPurchaseManage(ID,orderNum,addType){
        this.shareMethodService.getPurchaseManageApi(ID).then(data=>{
           if(data.Result){
             
            let prepareApplyData=JSON.parse(data.Data);
             let prepareApplyMaterialList=prepareApplyData.PurchaseRequisitionDetailsList;//保存物料明细
            
             if(prepareApplyMaterialList&&prepareApplyMaterialList.length>0){//如果存在物料明细
                prepareApplyMaterialList.forEach((element,index) => {//遍历物料明细数组，修改对应字段
                    if(element.ResidualQuantity>0){//如果可用物料数量大于0
                        let newItem = new PurchaseOrderDetails();
                        newItem["NA_ERPOrderNumber"] = orderNum;
                        newItem["NARequisitionOrderId"] = ID;
                        newItem["MaterialNumber"] = prepareApplyMaterialList[index]["MaterialNumber"];
                        newItem["MaterialDescription"] = prepareApplyMaterialList[index]["MaterialDescription"];
                        newItem["Count"] = element.ResidualQuantity;
                        newItem["ResidualQuantity"] = element.ResidualQuantity;
                        newItem["CostPrice"] = prepareApplyMaterialList[index]["Price"];
                        newItem["Batch"] = prepareApplyMaterialList[index]["Batch"];
                        newItem["DeliveryStoreLocation"] = prepareApplyMaterialList[index]["StorageLocation"];

                        if(addType=="firstAdd"){
                            this.numAmount += newItem["Count"];
                        }
                        
                            this._purchaseData.procurementList.push(newItem);
                        
                       
                    }
                });
             }

             //console.log(this._purchaseData.procurementList);
           }
        })
    }

    batchModify(){//批量修改清单
        if(this.batchParameter.storageLoc && this.batchParameter.storageLoc.length!=4){
            this.windowService.alert({ message: "库存地必须是4位", type: "warn" });
            this.batchParameter.storageLoc='';
        }
        for (let i = 0, len = this._purchaseData.procurementList.length; i < len; i++) {
            let item=this._purchaseData.procurementList[i];
            if(this.batchParameter.storageLoc){
                item["StorageLocation"]=this.batchParameter.storageLoc;
            }
            if(this.batchParameter.discount){
                item["Discount"]=this.batchParameter.discount;
            }
            this.discountChange(i,true);
        }
        this.calculateTotalDiscountAmount();
    }
    numChange(index) {//清单中数量变化后
        let item = this._purchaseData.procurementList[index];
        if (item.Count && item.CustomsPrice) {
            item.CustomsSumPrice = (item.Count * item.CustomsPrice).toFixed(2);// 7.报关总价=数量*报关单价
            item.CustomsSumPriceAfterDiscount = (item.CustomsSumPrice * this.MegDiscount).toFixed(2);// 8.折扣后报关总价=报关总价*折扣系数（采购信息）
        } else {
            item.CustomsSumPrice = 0;
            item.CustomsSumPriceAfterDiscount = 0;
        }
        this.calculateTotalDiscountAmount();
    }
    discountChange(index,all) {//清单中系数变化后 计算之后的 各种总价
        //all: 表示清单是否是全部变化
        let item = this._purchaseData.procurementList[index];
        if (item.Discount) {
            item.CustomsPrice = (item.CostPrice * item.Discount).toFixed(2);//5.报关单价=成本价*系数（采购清单中）
            item.CustomsPriceAfterDiscount = (item.CustomsPrice * this.MegDiscount).toFixed(2);// 6.折扣后报关单价=报关单价*折扣系数（采购信息中）
            if (item.Count) {
                item.CustomsSumPrice = (item.Count * item.CustomsPrice).toFixed(2);// 7.报关总价=数量*报关单价
                item.CustomsSumPriceAfterDiscount = (item.CustomsSumPrice * this.MegDiscount).toFixed(2);// 8.折扣后报关总价=报关总价*折扣系数（采购信息）
            }
        }
        if(!all){//不是全部变化时 需要重新计算
            this.calculateTotalDiscountAmount();
        }
    }
    calculateTotalDiscountAmount() {//计算 折扣 前后 合计金额
        this.numAmount=0;
        this._purchaseData.preDiscount = 0;
        this._purchaseData.afterDiscount = 0;
        console.log(this._purchaseData.procurementList);
        for (let i = 0, len = this._purchaseData.procurementList.length; i < len; i++) {
            if (this._purchaseData.procurementList[i].CustomsSumPrice) {
                this._purchaseData.preDiscount += parseFloat(this._purchaseData.procurementList[i].CustomsSumPrice);//报关总价 之和
            }

            console.log(this._NDType);

            if(this._NDType==='directND'&&this._purchaseData.procurementList[i].CustomsSumPriceAfterDiscount){  
                    this._purchaseData.afterDiscount += parseFloat(this._purchaseData.procurementList[i].CustomsSumPriceAfterDiscount);//报关总价 之和
                    console.log(this._purchaseData.afterDiscount);
            }

            if(this._purchaseData.procurementList[i].Count){
                this.numAmount+=this._purchaseData.procurementList[i].Count;
            }
        }
        if(this._NDType==='directND'){//如果是直接创建ND单，则不计算系数
            this._purchaseData.afterDiscount = parseFloat((this._purchaseData.afterDiscount).toFixed(2));// 8.折扣后报关总价=报关总价（采购信息）
        }else{
            this._purchaseData.afterDiscount = parseFloat((this._purchaseData.preDiscount * this.MegDiscount).toFixed(2));// 8.折扣后报关总价=报关总价*折扣系数（采购信息）
        }
        this.onPurchaseDataChange.emit(this._purchaseData);
    }
    delProcurementItem(index) {//删除一项采购清单
        let reCount = true;
        if (!this._purchaseData.procurementList[index]["Count"]
            && !this._purchaseData.procurementList[index]["Discount"]) {//如果删除的行没有数量和系数 不需要重新计算
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
            this.calculateTotalDiscountAmount();
        } else {
            this.onPurchaseDataChange.emit(this._purchaseData);
        }

        this._purchaseData.procurementList=JSON.parse(JSON.stringify(this._purchaseData.procurementList));
    }
    deleteList() {//批量删除采购清单列表
        if (!this.checkedNum) {
            this.windowService.alert({ message: "还未选择项", type: "warn" });
            return;
        }
        if (this.fullChecked) {//全选删除
            this._purchaseData.procurementList = [];
            this.numAmount = 0;
            this._purchaseData.preDiscount = 0;
            this._purchaseData.afterDiscount = 0;
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
        this.calculateTotalDiscountAmount();
    }
    showOrder() {//预览采购清单
        console.log(this._purchaseData);
        let modalData = {
            procurementList: this._purchaseData.procurementList,
            preDiscount: this._purchaseData.preDiscount,
            factory: this.factory,
            vendor: this.vendor
        }
        this.applyListModal.show(modalData);
    }
    checkNDList(onlyCheckNAOrder) {//检查ND的清单
        let modalData={
            list:this._purchaseData.procurementList,
            onlyCheckNAOrder:onlyCheckNAOrder
        }
        this.NDCheckResultModal.show(modalData);
    }
    materialTraceno(index, no) {//需求跟踪号的校验
        if(!no){//为空不校验
            return;
        }
        let validName="traceno"+index;
        if(this.purchaseListForm.controls[validName].invalid){//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            return;
        }
        this._purchaseData.procurementList[index]["TrackingNumber"] = this._purchaseData.procurementList[index]["TrackingNumber"].toUpperCase();//转大写
        this.shareMethodService.checkOrderTracenoExist(this._purchaseData.procurementList[index]["TrackingNumber"],this.purchaseOrderID)
        .then(data => {
            if (!data) {
                this.windowService.alert({ message:"该需求跟踪号已经存在，请重新输入", type: 'fail' });
                this._purchaseData.procurementList[index]["TrackingNumber"] = "";
            }else{
                this.onPurchaseDataChange.emit(this._purchaseData);
            }
        })
    }
    downloadTpl() {//下载采购清单模板
        window.open(dbomsPath + 'assets/downloadtpl/ND新建-采购清单.xlsx');
    }
    uploadPurchase(e) {//批量上传
        if (e.Result) {
            let result = e.Data;
            if (result && result.length && this.fullChecked) {//如果全选，变成半选
                this.fullChecked = false;
                this.fullCheckedIndeterminate = true;
            }

            result.forEach(item => {
                item.Batch=item.Batch.toUpperCase();//将批次转换为大写
            });

            let newArr = this._purchaseData.procurementList.concat(result);
            this._purchaseData.procurementList = newArr;//把excel中列表显示页面
            this.calculateTotalDiscountAmount();
        } else {
            this.windowService.alert({ message: e.Message, type: "warn" });
        }
    }
    addNA() {//添加NA
        this.beforeNAList = JSON.parse(window.localStorage.getItem("NAList"));
        this.newNAShow = true;//模态框显示
    }
    CheckIndeterminate(v) {//检查是否全选
        this.fullCheckedIndeterminate = v;
        console.log(v)
    }

    getNum(e){
        console.log(e);
        this.checkedNum = e
    }
   
}