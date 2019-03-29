// 备货采购申请页面-采购清单
import { Component, OnInit, Input, EventEmitter, Output, ElementRef,OnChanges,ViewChild,
     AfterViewInit, DoCheck,SimpleChanges,ChangeDetectorRef,forwardRef} from '@angular/core';
import { NgForm, NgModel,ControlValueAccessor, NG_VALUE_ACCESSOR, DefaultValueAccessor } from "@angular/forms";
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

declare var $:any;
import { HttpServer } from 'app/shared/services/db.http.server';
import { dbomsPath } from "environments/environment";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { PurchaseRequisitionDetailsList } from './../../../services/stockApply-submit.service';
import { ApplyListModalComponent } from './../../applyListModal/applylist-modal.component';
import { ShareMethodService } from './../../../services/share-method.service';

@Component({
    selector: "stockApply-submit-list",
    templateUrl: 'stockApply-submit-list.component.html',
    styleUrls: ['stockApply-submit-list.component.scss',
        './../../../scss/procurement.scss','./../../../scss/submit-list.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => StockApplySubmitListComponent),
        multi: true
    }]
})
export class StockApplySubmitListComponent implements OnInit,OnChanges,ControlValueAccessor {
    applyListModal: XcModalRef;//采购清单展示模态框
    numAmount: number = 0;//物料数量合计
    fullChecked = false;//全选状态
    fullCheckedIndeterminate = false;//半选状态
    checkedNum = 0;//已选项数
    loading:boolean=false;//是否显示loading画面
    _purchaseData = {//采购清单数据
        procurementList: [],
        untaxAmount: 0,//未税总金额
        taxAmount: 0,//含税总金额
        foreignAmount:0//外币总金额
    };
    beforePurchaseFormValid;//表单的前一步校验结果
    fileUploadApi;//批量上传路径
    factory;//工厂

    @ViewChild(NgForm)
    purchaseListForm;//表单
    @Input() rate = 1.8;//税率
    @Input() tempAmountPrice = 0;//临时存储的 总金额（会是未税总金额 或者 外币总金额）
    @Input() isSubmit=false;//是否提交
    @Input() set setFactory(value){//读入工厂
        if(value){
            this.factory=value;
            this.fileUploadApi = "api/PurchaseManage/UploadPurchaseRequisitionDetails/3?factory="+this.factory;
        }
    };
    @Input() vendor;//供应商
    @Input() IsRMB:boolean=true;//是否 人民币
    @Input() currency;//币种
    @Input() purchaseRequisitioIid:'';//采购申请id
    @Input() set listNumberAmount(value){//采购清单 总数量
        if(value!=null){
            this.numAmount=value;
        }
    };
    @Input() set purchaseData(value) {//读入采购清单数据
        this._purchaseData = value;
    }

    @Input() public orderType:string;//订单类型

    @Output() onPurchaseDataChange = new EventEmitter<any>();//当 采购清单信息 变化
    @Output() onPurchaseFormValidChange = new EventEmitter<any>();//当 采购清单校验 变化
    @Output() onAmountMoney = new EventEmitter();//当 未税金额变化时
    onChangeCallback: any = {};
    onTouchedCallback: any = {};
    constructor(private http: Http,
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private shareMethodService: ShareMethodService,
        private dbHttp: HttpServer,
        private changeDetectorRef:ChangeDetectorRef) { }
    ngOnInit() {
        this.applyListModal = this.xcModalService.createModal(ApplyListModalComponent);//预览采购清单
    }
    ngOnChanges(changes: SimpleChanges){  
        if(changes["rate"]){
            if(changes["rate"].currentValue!=changes["rate"].previousValue){//税率变化
                if (typeof(changes["rate"].currentValue) == "undefined" || changes["rate"].currentValue == null) {//变化为无值
                    this._purchaseData.taxAmount=0;
                    this.onPurchaseDataChange.emit(this._purchaseData);
                } else {
                    this.calculateTotalTax("rateChange");//重新计算
                }
            }
        }
        if(changes["currency"]){
            if(changes["currency"].currentValue!=changes["currency"].previousValue){//币种 变化
                this.calculateTotalTax("currencyChange");//重新计算
            }
        }
    }
    ngDoCheck() {
        if (this.purchaseListForm.valid != this.beforePurchaseFormValid) {//表单校验变化返回
            this.beforePurchaseFormValid = this.purchaseListForm.valid;
            this.onPurchaseFormValidChange.emit(this.purchaseListForm.valid);
        }
        if(this._purchaseData.procurementList && this._purchaseData.procurementList.length>=10){//出现滚动条的宽度调整
            $(".w40").addClass("w46");
            $(".addApp-ch-before tbody").addClass("auto");
        }else{
            $(".w40").removeClass("w46");
            $(".addApp-ch-before tbody").removeClass("auto");
        }
    }
    CheckIndeterminate(v) {//检查是否全选
        this.fullCheckedIndeterminate = v;
    }
    calculateTotal(index) {//改变数量和单价时
        let item = this._purchaseData.procurementList[index];
        if (item.Count && item.Price) {
            let num = item.Count * item.Price;
            item.Amount = Number(num.toFixed(2));//未税总价
        }else{
            item.Amount = 0;
        }
        this.calculateTotalTax("numberChange");
    }
    taxrateTotalFun=function(){//税率相关值 计算
        if (typeof(this.rate) == "undefined" || this.rate == null) {
            this.windowService.alert({ message: "税率未选择", type: "warn" });
        } else {
            this._purchaseData.taxAmount = Number((this._purchaseData.untaxAmount * (1 + Number(this.rate))).toFixed(2));//含税总金额
        }
    }
    currencyDiffeFun=function(){//币种变化时 重新辨别计算总额
        if(!this.tempAmountPrice){//无总额 不计算
            this.onPurchaseDataChange.emit(this._purchaseData);
            return;
        }
        if(this.IsRMB){//人民币 情况
            this._purchaseData.untaxAmount=this.tempAmountPrice;//未税总金额
            this.taxrateTotalFun();
            this.onPurchaseDataChange.emit(this._purchaseData);
        }else{//外币 情况
            this._purchaseData.foreignAmount=this.tempAmountPrice;//外币总金额
            this.shareMethodService.getRateConvertPrice(this._purchaseData.foreignAmount,this.currency)
            .then(data => {//根据最新汇率 计算总额
                this._purchaseData.untaxAmount = data;
                this._purchaseData.taxAmount = data;
                this.onPurchaseDataChange.emit(this._purchaseData);
            });
        }
    }
    calculateTotalTax(changeType) {//计算总价
        // 因为此方法中包括异步请求(getRateConvertPrice),所以把返回数据(emit)写在此方法的所有情况中,调用此方法后可省略emit返回
        switch(changeType){//不同变化情况下 计算
            case "rateChange":
                if(this.IsRMB){
                    this.taxrateTotalFun();
                }
                this.onPurchaseDataChange.emit(this._purchaseData);
                break;
            case "currencyChange":    
                this.currencyDiffeFun();
                break;
            case "numberChange": 
                this.numAmount = 0;
                this._purchaseData.untaxAmount = 0;
                this._purchaseData.taxAmount = 0;
                this._purchaseData.foreignAmount = 0;
                this.tempAmountPrice=0;
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
        let reCount=true;
        if(!this._purchaseData.procurementList[index]["Count"] 
            && !this._purchaseData.procurementList[index]["Price"]){//如果删除的行没有数量和单价 不需要重新计算
                reCount=false;
        }
        if(this._purchaseData.procurementList[index].checked){
            this.checkedNum--;//选项减一
            if(!this.checkedNum){//减最后一项
                this.fullChecked = false;
                this.fullCheckedIndeterminate = false;
            }
        }
        this._purchaseData.procurementList.splice(index, 1);
        if(reCount){
            this.calculateTotalTax("numberChange");
        }else{
            this.onPurchaseDataChange.emit(this._purchaseData);
        }

        this._purchaseData.procurementList=JSON.parse(JSON.stringify(this._purchaseData.procurementList));
    }
    addProcurementItem() {//增加一项采购清单
        if(!this.factory){
            this.windowService.alert({ message: "工厂未填写", type: "warn" });
            return;
        }
        this._purchaseData.procurementList.push(new PurchaseRequisitionDetailsList());
        if(this.fullChecked){//如果全选，变成半选
            this.fullChecked=false;
            this.fullCheckedIndeterminate = true;
        }
        this.onPurchaseDataChange.emit(this._purchaseData);
    }
    downloadTpl(){//下载采购清单模板
        window.open(dbomsPath+'assets/downloadtpl/备货采购申请-采购清单.xlsx' );
    }
    doRemind(){//工厂没填写时，批量上传进行时进行提醒
        this.windowService.alert({ message: "工厂未填写", type: "warn" });
    }
    materialTraceno(index,no){//需求跟踪号的校验
        if(!no){//为空不校验
            return;
        }
        let validName="traceno"+index;
        if(this.purchaseListForm.controls[validName].invalid){//格式校验未通过
            this.windowService.alert({ message: '只允许输入数字和26位英文字符', type: 'success' });
            return;
        }
        this._purchaseData.procurementList[index]["traceno"] = this._purchaseData.procurementList[index]["traceno"].toUpperCase();//转大写
        this.shareMethodService.checkApplyTracenoExist(this._purchaseData.procurementList[index]["traceno"],this.purchaseRequisitioIid)
        .then(data => {
            if (!data) {
                this.windowService.alert({ message:"该需求跟踪号已经存在，请重新输入", type: 'fail' });
                this._purchaseData.procurementList[index]["traceno"]="";
            }else{
                this.onPurchaseDataChange.emit(this._purchaseData);
            }
        });
    }
    getMaterialData(index, MaterialNumber) {//根据物料号读取 物料描述
        if (MaterialNumber) {
            this._purchaseData.procurementList[index].MaterialNumber=MaterialNumber.trim();//首尾去空格
            this.getMaterial(this._purchaseData.procurementList[index].MaterialNumber).then(response => {
                if (response.Data["MAKTX_ZH"]) {//获取描述
                    this._purchaseData.procurementList[index].MaterialDescription = response.Data["MAKTX_ZH"];
                    this.getMaterialStockInfo(this._purchaseData.procurementList[index].MaterialNumber,
                        this._purchaseData.procurementList[index].StorageLocation,this._purchaseData.procurementList[index].Batch,index);
                } else {
                    this._purchaseData.procurementList[index].MaterialDescription = "";
                    this.windowService.alert({ message: "该物料不存在", type: "warn" });
                }     
            })
        }else{//清空物料 也需返回
            this._purchaseData.procurementList[index].MaterialDescription = "";
            this.onPurchaseDataChange.emit(this._purchaseData);
        }
    }
    getMaterialStockInfo(MaterialNumber,StorageLocation,batch,index){//根据物料号读取 在途在库 数据 
        if(MaterialNumber){
            let repeat=this.judgeRepeatMaterial(MaterialNumber,StorageLocation,batch,index);
            if(!repeat){//没有重复        
                let headers = new Headers({ 'Content-Type': 'application/json' });
                let options = new RequestOptions({ headers: headers });
                let url;
                let body = new Object();
                if(StorageLocation){
                    body["LGORT"]=StorageLocation;//库存地代码
                }
                if(batch){
                    body["CHARG"]=batch;//批次
                }
                if(JSON.stringify(body)=="{}"){//空对象
                    url="api/PurchaseManage/GetMaterialStockInfo/"+MaterialNumber+"/"+this.factory;
                }else{
                    url="api/PurchaseManage/GetMaterialStockInfo/"+MaterialNumber+"/"+this.factory+"?"+$.param(body);
                }
                this.http.get(url, options).toPromise()
                .then(response =>{
                    let res=response.json();
                    if(res.Result){
                        this._purchaseData.procurementList[index]["InTransit"]=res.Data.MAIN_STOCK;
                        this._purchaseData.procurementList[index]["InStock"]=res.Data.UMLME_STOCK;
                    }else{
                        this._purchaseData.procurementList[index]["InTransit"]=null;
                        this._purchaseData.procurementList[index]["InStock"]=null;
                    }
                    this.onPurchaseDataChange.emit(this._purchaseData);
                })
            }
        }else{
            this.onPurchaseDataChange.emit(this._purchaseData);
        }
    }
    isLoading(e){//批量上传时loadiung现象
        if(e){
          this.loading=true;
        }
    }
    uploadPurchase(e) {//批量上传返回
        console.log(e);
        if (e.Result) {
            let result = e.Data;
            if(result && result.length && this.fullChecked){//如果全选，变成半选
                this.fullChecked=false;
                this.fullCheckedIndeterminate = true;
            }
            result.forEach(item => {
                item.Price=Number(item.Price).toFixed(2);
                item.Amount=Number(item.Amount).toFixed(2);
                delete item.AddTime;delete item.ID;
                delete item.purchaserequisitionid;delete item.traceno;
                item.Batch=item.Batch.toUpperCase();
            });
            let newArr=this._purchaseData.procurementList.concat(result);
            this._purchaseData.procurementList=newArr;//把excel中列表显示页面
            this.calculateTotalTax("numberChange");
            this.onAmountMoney.emit();//发送事件获取新的审批人序列
        } else {
            this.windowService.alert({ message: e.Message, type: "warn" });
        }
        this.loading=false;
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
    
    deleteList(){//批量删除采购清单列表
        if(!this.checkedNum){
            this.windowService.alert({ message: "还未选择项", type: "warn" });
            return;
        }
        if(this.fullChecked){//全选删除
            this._purchaseData.procurementList=[];
            this.tempAmountPrice=0;
            this.numAmount = 0;
            this._purchaseData.untaxAmount = 0;
            this._purchaseData.taxAmount = 0;
            this._purchaseData.foreignAmount = 0;
            this.fullChecked=false;
            this.fullCheckedIndeterminate = false;
            this.onPurchaseDataChange.emit(this._purchaseData);
            return;
        }
        this.fullCheckedIndeterminate = false;
        let i; let item;
        let len = this._purchaseData.procurementList.length;
        for (i = 0; i < len; i++) {
            item=this._purchaseData.procurementList[i];
            if (item.checked === true) {
                    this._purchaseData.procurementList.splice(i, 1);
                    this._purchaseData.procurementList = JSON.parse(JSON.stringify(this._purchaseData.procurementList));
                    len--;
                    i--;
            }   
        }
        this.calculateTotalTax("numberChange");
        this.onAmountMoney.emit();//发送事件获取新的审批人序列
        
    }
    judgeRepeatMaterial(MaterialNumber,StorageLocation,Batch,index){
        //当存在 物料号，库存地，批次 相同的清单时。进行提示 并删除 刚操作的一条相同数据
        if(MaterialNumber && StorageLocation && Batch){//完成输入
            let i; let item;
            let len = this._purchaseData.procurementList.length;
            for (i = 0; i < len; i++) {
                item=this._purchaseData.procurementList[i];
                if(i==index){
                    continue;
                }
                if(item.MaterialNumber==MaterialNumber && item.StorageLocation==StorageLocation 
                    && item.Batch==Batch){
                        this.windowService.alert({ message: "清单中已存在相同物料", type: "warn" });
                        this._purchaseData.procurementList.splice(index, 1);
                        this.onPurchaseDataChange.emit(this._purchaseData);
                        return true;//有相同 删除了
                }   
            }
            return false;
        }else{
            return false;
        }
    }
    getMaterial(id) {//获取物料信息
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("api/PurchaseManage/GetMaterialInfo/"+id, options)
            .toPromise()
            .then(response => response.json())
    }
    writeValue(value: boolean) {
        if(value){//确认清空数据
          this._purchaseData.procurementList=[];
          this._purchaseData.untaxAmount=0;
          this._purchaseData.taxAmount=0;
          this._purchaseData.foreignAmount=0;
          this.numAmount=0;
          this.onChangeCallback(false);
          this.onPurchaseDataChange.emit(this._purchaseData);
        }
      }
      registerOnChange(fn) {
        this.onChangeCallback = fn;
      }
      registerOnTouched(fn) {
        this.onTouchedCallback = fn;
      }

      //根据循环列表的MaterialNumber，判断是否要刷新dom，
      trackBystockApply(index: number, item) { return item.MaterialNumber; }

      //当数量或金额发生变化时，发送事件，获取审批流程
    onPriceOrCountChange(){
        this.onAmountMoney.emit();//发送事件
    }
}