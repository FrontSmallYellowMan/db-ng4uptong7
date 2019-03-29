// 合同单采购申请页面-销售信息
import { Component, OnInit, Input, Output, ElementRef, ViewChild, AfterViewInit,
     EventEmitter,DoCheck,OnChanges,SimpleChanges } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

declare var $: any;
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';
import { dbomsPath, environment,APIAddress } from "environments/environment";
import { SubmitMessageService } from '../../../services/submit-message.service';
import { ShareMethodService } from './../../../services/share-method.service';
import { SaleTabElement,PurchaseRequisitionSaleContractList,
    SellShowElement } from './../../../services/contractApply-submit.service';
import { PrepareApplyCommunicateService } from "../../../services/communicate.service";

@Component({
    selector: "contractApply-submit-sell",
    templateUrl: 'contractApply-submit-sell.component.html',
    styleUrls: ['contractApply-submit-sell.component.scss',
        './../../../scss/procurement.scss','./../../../scss/submit-sell.scss']
})
export class ContractApplySubmitSellComponent implements OnInit,OnChanges {
    tabList :Array<SaleTabElement>= [];//上方tab的list数据
    activeTabId;//当前显示Tab的id号
    saleListSave :Array<PurchaseRequisitionSaleContractList>= [];//供存储的 销售信息数组
    showList :Array<SellShowElement> = [];//供页面展示的 销售信息数组
    newContractApplyShow = false;//新增合同窗口 是否显示标识
    contractList=[];//存放localStorage 的合同列表
    beforeProcurementDetailsStr;//上一步的 采购清单数据
    hideDisdata = false;//显示/隐藏产品明细标识
    @ViewChild('hideDisi')
    hideDisiDiv: ElementRef;//产品明细展开收缩按钮
    @Input() purchaseRequisitioIid=null;//编辑状态下的 采购申请ID
    @Input() sellMessageStructureComplete;//编辑状态下的 销售信息 是否拼接完成 标识
    @Input() onlyView=false;//是否 只是显示 标识
    @Input() currency;//币种
    @Input() rate;//税率
    @Input() IsRMB:boolean=true;//是否 人民币
    @Input() procurementDetailsList=[];//采购清单 数据
    @Input() lookAtSaleContractList=[];//查看状态下 的销售信息数据
    @Output() onSellListChange = new EventEmitter();//当 销售信息 变化
    constructor(
        private dbHttp: HttpServer,
        private windowService: WindowService,
        private ActivatedRoute: ActivatedRoute,
        private shareMethodService: ShareMethodService,
        private prepareApplyCommunicateService:PrepareApplyCommunicateService
    ) { }

    ngOnInit() {
        if(!this.purchaseRequisitioIid && !this.onlyView){//新建时 加载本地选择的合同列表
            this.createInitialListData("other");
            this.onSellListChange.emit(this.saleListSave);
            console.log("新建-销售信息");
            console.log(this.tabList);
            console.log(this.saleListSave);
            console.log(this.showList);
        }
    }
    ngOnChanges(changes: SimpleChanges){  
        if(changes["rate"] && changes["rate"].currentValue!=changes["rate"].previousValue && this.IsRMB){//税率变化
            if (typeof(changes["rate"].currentValue) == "undefined" || changes["rate"].currentValue == null) {//变化为无值
                for(let i=0,len=this.saleListSave.length;i<len;i++){
                    this.saleListSave[i].taxinclusivemoney= 0.00;
                }
            } else {
                for(let i=0,len=this.saleListSave.length;i<len;i++){
                    this.getTaxIncluSiveMoney(this.saleListSave[i].excludetaxmoney,i,false);
                }
            }
            this.onSellListChange.emit(this.saleListSave);
        }
        if(changes["currency"] && changes["currency"].currentValue!=changes["currency"].previousValue){//币种变化
            if (!changes["currency"].currentValue) {//变化为无值
                for(let i=0,len=this.saleListSave.length;i<len;i++){
                    this.saleListSave[i].taxinclusivemoney= 0.00;
                }
            } else if(this.procurementDetailsList && this.procurementDetailsList.length){//有清单
                this.countTotalFromProcurementList();//重新计算各合同的总额显示
            }else{//无清单
                if(changes["currency"].currentValue=="人民币"){//人民币 情况
                    this.resetPriceToZero();
                }else if(changes["currency"].previousValue=="人民币"){//外币 情况，上一步是人民币
                    this.resetPriceToZero();
                }else{//外币 情况，上一步也是外币
                    for(let i=0,len=this.saleListSave.length;i<len;i++){
                        this.getOtherMoney(this.saleListSave[i]["foreigncurrencymoney"],i,false);
                    }
                }
            }
            this.onSellListChange.emit(this.saleListSave);
        }
        if(changes["sellMessageStructureComplete"] && changes["sellMessageStructureComplete"].currentValue){//编辑下 销售信息 拼接完成
            console.log("编辑-销售信息");
            this.createInitialListData("edit");
            this.onSellListChange.emit(this.saleListSave);
        }
        if(changes["lookAtSaleContractList"] && changes["lookAtSaleContractList"].currentValue
             && changes["lookAtSaleContractList"].currentValue.length){//查看时 销售信息
            console.log("查看或审批-销售信息");
            this.createInitialListData("look");
            this.judgeExcessAll();
        }
    }
    ngDoCheck() {
        if (JSON.stringify(this.procurementDetailsList) != this.beforeProcurementDetailsStr) {//采购清单 变化
            console.log("采购清单变化");
            console.log(this.procurementDetailsList);
            if(this.procurementDetailsList && this.procurementDetailsList.length){//有清单
                this.countTotalFromProcurementList();
                this.onSellListChange.emit(this.saleListSave);
            }else{//无清单
                for(let i=0,len=this.showList.length;i<len;i++){//全部 置为输入框
                    this.showList[i]["foreignIsFillin"]=true;
                    this.showList[i]["excludetaxIsFillin"]=true;
                }
                if(this.beforeProcurementDetailsStr){//是可转化的
                    let beforeArr=JSON.parse(this.beforeProcurementDetailsStr);
                    if(beforeArr && beforeArr.length){//上一步有清单
                        for(let i=0,len=beforeArr.length;i<len;i++){
                            if(beforeArr[i].MaterialSource){//有选择 查询已选项在 销售信息中的index 并置值为0
                                let index=this.indexOfSaleListSave(beforeArr[i].MaterialSource);
                                this.saleListSave[index]["foreigncurrencymoney"]=0;
                                this.saleListSave[index]["excludetaxmoney"]=0;
                                this.saleListSave[index]["taxinclusivemoney"]=0;
                            }
                        }
                        this.onSellListChange.emit(this.saleListSave);
                    }
                }
            }
            this.beforeProcurementDetailsStr = JSON.stringify(this.procurementDetailsList);
        }
    }
    createInitialListData(state){//创建 tablist 展示列表 存储列表 的初始数据
        this.contractList=[];this.tabList=[];this.saleListSave=[];this.showList=[];
        let uniqueIdentifierStr="";//唯一标识合同 的key名称
        if(state=="look"){//查看下 取已有数据
            this.contractList = this.lookAtSaleContractList;//获取销售信息
            uniqueIdentifierStr="salecontractcode";
        }else{
            this.contractList = JSON.parse(window.localStorage.getItem("contractList"));//获取合同
            uniqueIdentifierStr="SC_Code";
        }
        let url;
        if(this.contractList && this.contractList.length){
            for(let i=0,len=this.contractList.length;i<len;i++){
                //tablist
                this.tabList[i]=new SaleTabElement();
                this.tabList[i]["id"]=this.contractList[i][uniqueIdentifierStr];
                this.tabList[i]["text"]=this.contractList[i]["MainContractCode"];
                //存储列表
                this.saleListSave[i]=new PurchaseRequisitionSaleContractList();
                this.saleListSave[i]["salecontractcode"]=this.contractList[i][uniqueIdentifierStr];
                this.saleListSave[i]["MainContractCode"]=this.contractList[i]["MainContractCode"];
                if(state=="edit" || state=="look"){//编辑或查看下
                    this.saleListSave[i]["excludetaxmoney"]=this.contractList[i]["excludetaxmoney"];//未税总金额
                    this.saleListSave[i]["taxinclusivemoney"]=this.contractList[i]["taxinclusivemoney"];//含税总金额
                    this.saleListSave[i]["foreigncurrencymoney"]=this.contractList[i]["foreigncurrencymoney"];//外币总金额
                }else{
                    this.saleListSave[i]["excludetaxmoney"]=0;//未税总金额
                    this.saleListSave[i]["taxinclusivemoney"]=0;//含税总金额
                    this.saleListSave[i]["foreigncurrencymoney"]=0;//外币总金额
                }
                //展示列表
                this.showList[i]=new SellShowElement();
                this.showList[i]["salecontractcode"]=this.contractList[i][uniqueIdentifierStr];
                url = "PurchaseManage/GetContractDetail/" + this.contractList[i][uniqueIdentifierStr];
                this.dbHttp.get(url).subscribe(data => {//获取合同详细信息
                    if (data.Result) {
                        $.extend(this.showList[i],JSON.parse(data.Data));
                        console.log(this.showList);
                        this.tabList[i]['Change_Status']=JSON.parse(data.Data).Change_Status;//保存是否变更
                        this.tabList[i]['Relieve_Status']=JSON.parse(data.Data).Relieve_Status;//保存是否解除
                        
                        //如果erpcode存在，则请求获取应收账款、客户超期欠款
                        if(this.showList[i].BuyerERPCode){
                            let resAPI="SaleOrder/GetCustomerUnClerTotalInfo";
                            this.dbHttp.post(resAPI,{'CustomerERPCode':this.showList[i].BuyerERPCode}).subscribe(data => {//获取应收账款、客户超期欠款
                                if(data.Result){
                                    this.showList[i].Receivable = JSON.parse(data.Data).Receivable;//获得应收账款
                                    this.showList[i].Overdue = JSON.parse(data.Data).Overdue;//获得客户超期欠款
                                }       
                            });
                        }
                    }
                })
            }
            this.activeTabId=this.tabList[0]["id"];//默认切换显示第一个

            setTimeout(()=>{//列表信息为异步获取，所以使用定时器延迟执行
                this.prepareApplyCommunicateService.prepareApplySendMsg(JSON.stringify(this.tabList));
            },300);
            console.log(this.tabList);

        }
    }
    countTotalFromProcurementList(){//遍历采购清单 计算已选合同的总额在销售信息中显示
        let eleTotalPrice;//每个合同的 总额
        let selected;//每个合同的 在清单中 是否有选择 标识
        for(let m=0,lenm=this.saleListSave.length;m<lenm;m++){
            eleTotalPrice=0;selected=false;
            for(let k=0,lenk=this.procurementDetailsList.length;k<lenk;k++){
                if (this.procurementDetailsList[k].MaterialSource == this.saleListSave[m].salecontractcode) {//已选
                    if(!selected){selected=true;}
                    eleTotalPrice+=Number(this.procurementDetailsList[k].Amount);//累加总额
                }
            }
            this.changeSaleListAccordingToProcurementList(selected,eleTotalPrice,m);
        }
    }
    changeSaleListAccordingToProcurementList(selected,totalPrice,index){//根据采购清单 改变 销售信息的 数据和状态
        if(!selected){
            if(this.IsRMB && !this.showList[index]["excludetaxIsFillin"]){//上一步是选中
                this.showList[index]["excludetaxIsFillin"]=true;
                this.saleListSave[index].foreigncurrencymoney=0;
                this.saleListSave[index].excludetaxmoney=0;
                this.saleListSave[index].taxinclusivemoney=0;
            }else{
                if(!this.showList[index]["foreignIsFillin"]){//上一步是选中
                    this.showList[index]["foreignIsFillin"]=true;
                    this.saleListSave[index].foreigncurrencymoney=0;
                    this.saleListSave[index].excludetaxmoney=0;
                    this.saleListSave[index].taxinclusivemoney=0;
                }
            }
            return;//在清单中 未选择 不操作
        }
        if(this.IsRMB){//人民币情况
            this.showList[index]["excludetaxIsFillin"]=false;
            this.saleListSave[index].excludetaxmoney=totalPrice;
            if(this.rate!=null){//且有税率
                this.saleListSave[index].taxinclusivemoney = totalPrice * (1 + this.rate);//计算含税
                this.judgeExcessEle(this.saleListSave[index],index);
            }else{
                this.saleListSave[index].taxinclusivemoney=0;
            }
        }else{//外币情况
            this.showList[index]["foreignIsFillin"]=false;
            this.saleListSave[index].foreigncurrencymoney=totalPrice;
            if(this.currency){ //且有币种选择
                this.shareMethodService.getRateConvertPrice(totalPrice,this.currency)
                .then(data => {//根据最新汇率 计算总额
                    this.saleListSave[index].excludetaxmoney=data;
                    this.saleListSave[index].taxinclusivemoney=data;
                    this.judgeExcessEle(this.saleListSave[index],index);
                })
            }
        }
    }
    onClickTab(e){//点击切换 Tab
        this.activeTabId=e["id"];        
    }
    deleteTab(e) {//删除一个 tab(合同)
        this.saleListSave.splice(e, 1);//存储删除
        this.onSellListChange.emit(this.saleListSave);
        this.showList.splice(e, 1);//展示删除
        this.contractList.splice(e, 1);//本地存储删除
        window.localStorage.setItem("contractList", JSON.stringify(this.contractList));//重新存放
        setTimeout(()=>{//需要延迟
            this.activeTabId=this.tabList[0]["id"];//删除后 默认切换显示第一个
        })
    }
    addTab(e) {//添加一个合同
        this.newContractApplyShow = true;//模态框显示
    }
    onCompleteAddContract(e) {//添加合同窗口 关闭后
        this.newContractApplyShow = e;
        this.createInitialListData("other");
        if(this.procurementDetailsList && this.procurementDetailsList.length){//有清单
            this.countTotalFromProcurementList();
        }
        this.onSellListChange.emit(this.saleListSave);
    }
    getOtherMoney(e,index,isInput) {//外币输入后 计算其他金额
        if (!this.currency) {
            this.windowService.alert({ message: '请选择币种', type: 'warn' });
        } else {
            this.shareMethodService.getRateConvertPrice(e,this.currency)
            .then(data => {//根据最新汇率 计算总额
                this.saleListSave[index].excludetaxmoney=data;
                this.saleListSave[index].taxinclusivemoney=data;
                this.judgeExcessEle(this.saleListSave[index],index);
                if(isInput){//如果是页面的输入 则需返回变化
                    this.onSellListChange.emit(this.saleListSave);
                }
            })
        }
    }
    getTaxIncluSiveMoney(e,index,isInput) {//计算 含税总金额
        if (typeof(this.rate) == "undefined" || this.rate == null) {
            this.windowService.alert({ message: '请选择税率', type: 'fail' });
        } else {
            this.saleListSave[index].taxinclusivemoney = (e * (1 + this.rate)).toFixed(2);//计算含税
            this.judgeExcessEle(this.saleListSave[index],index);
            if(isInput){//如果是页面的输入 则需返回变化
                this.onSellListChange.emit(this.saleListSave);
            }
        }
    }
    judgeExcessEle(saveEle,index){//判断单个合同 额度是否超出(invalid)
        let url = "PurchaseManage/GetContractDetail/" + saveEle["salecontractcode"];
        this.dbHttp.get(url).subscribe(data => {
            if (data.Result) {
                let localdata = JSON.parse(data.Data);
                if(saveEle["taxinclusivemoney"]>localdata.ContractMoney){//含税
                    this.tabList[index].invalid = true;
                    this.showList[index].invalid = true;
                }else{
                    this.tabList[index].invalid = false;
                    this.showList[index].invalid = false;
                }
            }
        })
    }
    judgeExcessAll(){//判断所有合同 额度是否超出(invalid)
        for(let i=0,len=this.saleListSave.length;i<len;i++){
            this.judgeExcessEle(this.saleListSave[i],i);
        }
    }
    resetPriceToZero(){//重置全部 外币、未税、含税金额 为零
        for(let i=0,len=this.saleListSave.length;i<len;i++){
            this.saleListSave[i].foreigncurrencymoney=0;
            this.saleListSave[i].excludetaxmoney=0;
            this.saleListSave[i].taxinclusivemoney=0;
        }
    }
    openContractPdf(url) {//查看用印制作合同
        if (url.indexOf("UploadFiles") == -1) {
            window.open(url);
        }else {
            window.open(APIAddress+url);
        }
    }
    hideDis(e) {//产品明细-显示/隐藏
        this.hideDisdata = !this.hideDisdata;
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h") {
            this.hideDisiDiv.nativeElement.className = this.hideDisiDiv.nativeElement.className + " " + "trans180";
            return;
        }
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h trans360") {
            this.hideDisiDiv.nativeElement.className = "iqon-fold mid-h trans180";
            return;
        }
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h trans180") {
            this.hideDisiDiv.nativeElement.className = "iqon-fold mid-h trans360";
            return;
        }
    }
    indexOfSaleListSave(id){//根据id 返回在存储列表(saleListSave) 中的index
        for(let i=0,len=this.saleListSave.length;i<len;i++){
            if(id==this.saleListSave[i]["salecontractcode"]){
                return i;
            }
        }
        return -1;
    }
}