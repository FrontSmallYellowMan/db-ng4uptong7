// NB单采购订单页面-主页面
import { Component, OnInit, ViewChild ,Input} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

declare var $: any, window;
import { dbomsPath } from "environments/environment";
import { Pager,XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { Person } from 'app/shared/services/index';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { WindowService } from 'app/core';
import { UB_RelatedService, formData,ApproveModal, WFApproverUser } from '../../services/UB-related.service'
import { ShareDataService } from '../../services/share-data.service';

// import { MultiApproverSelectComponent } from '../../../india/components/multi-approver-select/multi-approver-select.component';
@Component({
    templateUrl: 'UB-commit.component.html',
    styleUrls: ['./../../scss/procurement.scss', 'UB-commit.component.scss']
})
export class UBComponent implements OnInit {
    @ViewChild('modal') modal: ModalComponent;
    @ViewChild('UBCommit') UBCommit: NgForm;
   
    // 采购清单表头配置
    public tableConfig: any = [
        { title: '物料号', field: 'MaterialNumber', value: '', width: '104px', isRequired: true },
        { title: '物料描述', field: 'MaterialDescription', value: '', width: '', isRequired: false },
        { title: '数量', field: 'Count', value: '', width: '100px', isRequired: true },
        { title: '内部交易价', field: 'InterTransPrice', value: '', width: '100px', isRequired: true },
        { title: '转入库存地', field: 'StorageLocation', value: '', width: '80px', isRequired: false },
        { title: '转出库存地', field: 'StorageLocationOut', value: '', width: '80px', isRequired: false },
        { title: '转入批次', field: 'Batch', value: '', width: '104px', isRequired: false },
        { title: '转出批次', field: 'BatchOut', value: '', width: '104px', isRequired: false },
        { title: '是否入库（30天内）', field: 'IsStoreFor30', value: '', width: '120px', isRequired: false },
        { title: '是否本月销售', field: 'IsCurrentMonthSale', value: '', width: '100px', isRequired: false },
        { title: '销售合同号', field: 'MainContractCode', value: '', width: '160px', isRequired: false }
    ];
    // 销售合同列表配置
    public salingTable: any = [
        { title: '项目名称', field: 'ProjectName ', value: '', width: '8%', isRequired: true },
        { title: '合同号', field: 'MainContractCode', value: '', width: '10%', isRequired: false },
        { title: '客户名称', field: 'BuyerName', value: '', width: '8%', isRequired: true },
        { title: '销售员', field: 'SalesName', value: '', width: '8%', isRequired: true },
        { title: '销售合同金额', field: 'ContractMoney', value: '', width: '8%', isRequired: false },
        { title: '销售合同状态', field: 'SC_Status', value: '', width: '8%', isRequired: false },
        { title: '申请日期', field: 'CreateTime', value: '', width: '8%', isRequired: false }
    ];
    // 表格数据
    public listData: any = [
    ];
    // 空行数据
    public emptyListData: any = {
        checked: false,
        MaterialNumber: '',
        MaterialDescription: '',
        Count: 0,
        InterTransPrice: 0,
        StorageLocation: '',
        StorageLocationOut: '',
        Batch: '',
        BatchOut: '',
        IsStoreFor30: '',
        IsCurrentMonthSale: '',
        MainContractCode: ''
    };
    // 销售合同数据
    public salesDatas: any = [];
    // 销售合同的分页
    public pagerData = new Pager();
    // 销售合同无数据
    public isDisplay: any = false;
    // 点击出现销售合同的行标
    public indexWithSales: any = 0;

    fullChecked = false; // 是否全选
    isLoading = false;//提交中
    // 保存数据的字段集合
    public formData: any = new formData();
    // 审批人信息
    public WFApproveUserJSON: any = [{}, {}, {}, {}, {}, {}, {}];
    // 流程id
    public _ApproveID: any;
    // 审批任务id
    public _taskID: any;
    // 采购员展示数组
    public buyers: any = [];
    // 登录人信息
    public roleInfo: any;
    // 配置信息
    public configDatas: any = {
        platform: []
    };
    // 弹窗查询数据
    public searchData: any = {
        SalesPerson: '',
        ProjectName: '',
        BuyerName: '',
        PO: '',
        CurrentPage: 1,
        PageSize: 10
    }
    // 保存过的附件列表
    public oldFileList: any = [];
    // 上传的附件列表
    public accessoryList: any = [];

    public editID: any; // 编辑的id 

    procurementListShow = true; // 采购清单是否显示
    isUpdate = false; // 是否是编辑
    isSubmit = false;//是否提交
    canSubmit = true; // 表单验证之外的标识

    // 总数量
    summaryNum: any = '';

    fileUploadApi = `${dbomsPath}api/PurchaseManage/UploadPurchaseOrderDetails/8`; // 采购订单中清单的上传
    accessoryUrl = `${dbomsPath}api/PurchaseManage/UploadAccessory/2`; // 创建采购订单附件
    showPlateform:any;
    // ShowApproverList:any=[];
    // ShowUserSetting:any=[];
    

    //记录可编辑状态

    constructor(
        private windowService: WindowService,
        private routerInfo: ActivatedRoute,
        private router: Router,
        private _UBService: UB_RelatedService,
        private xcModalService:XcModalService,
        private shareDataService: ShareDataService,
    ) { }
    // @Input() WFApproverData;//审批数据
    // modalApprover: XcModalRef;//模态窗
    // nodeItemIndex;
    // maxApproverNum = 99;//最多可选人数
    ngOnInit() {
        this.isLoading = false;

        // 只在审批、查看出现的属性
        delete this.formData.AddTime;
        delete this.formData.ERPOrderNumber;
        // 获取个人信息
        this._UBService.getCurrentUserInfo().then(data => {
            if(data.Result){
                this.roleInfo = JSON.parse(data.Data);

                this.routerInfo.paramMap.subscribe(params => {
                    if(params.get('id')){ // 编辑
                        this.isUpdate = true;
        
                        this.editID = params.get('id');
        
                        // 获取配置信息
                        this.initConfigData(false, true);
        
                        this.initEditData(params.get('id'));
                    } else{
                        this.isUpdate = false;
        
                        // 获取配置信息
                        this.initConfigData(false, false);
                    }
                })
                // 初始化新增数据
                this.initNewData();
            } else{
                this.windowService.alert({ message: '获取申请人信息失败', type: 'fail' });

                setTimeout(()=>{
                    window.close();
                }, 3000);
            }
        })
           //在初始化的时候 创建模型
    // this.modalApprover = this.xcModalService.createModal(MultiApproverSelectComponent);
    // //模态窗口关闭时
    // this.modalApprover.onHide().subscribe(this.onApproverSelectModalHide);
    }
      //多选  选人 关闭
//    wfApproveUserArray:WFApproverUser[]=[];
   
//    onApproverSelectModalHide = selectedapprover => {
//    let arrayUser=this.WFApproveUserJSON[this.nodeItemIndex].UserSettings.split("-");
//    let user:ApproveModal=new ApproveModal();
//    user.userEN=arrayUser[0];
//    user.userCN=arrayUser[1];
   
//    this.WFApproveUserJSON[this.nodeItemIndex].UserSettings=user;

//     console.log(user);
//     if (selectedapprover && selectedapprover.length > 0) {
//       selectedapprover.forEach(selectuser => {
//         delete selectuser.checked;
//         console.log(selectedapprover);
//         if (arrayUser.indexOf(selectuser) == -1 && 
//         this.WFApproveUserJSON[this.nodeItemIndex].UserSettings.length < this.maxApproverNum) {
//           this.WFApproveUserJSON[this.nodeItemIndex].UserSettings.push(selectuser);
//         }
//       });
//     }
//   }
    // 初始化新增数据
    public initNewData() {
        // 所属平台
        this.showPlateform=[{id:this.roleInfo.FlatCode,text:this.roleInfo.FlatName}];
        this.formData.Platform.value = this.roleInfo.FlatName;
        this.formData.FlatCode.value=this.roleInfo.FlatCode;
        // 销售员
        this.formData.ApplicantName.value = new Person();
        this.formData.ApplicantName.value.userID = this.roleInfo.ITCode.toLocaleLowerCase();
        this.formData.ApplicantName.value.userEN = this.roleInfo.ITCode.toLocaleLowerCase();
        this.formData.ApplicantName.value.userCN = this.roleInfo.UserName;

        // 申请人itCode
        this.formData.ApplicantItCode.value = this.roleInfo.ITCode;

        // 申请人电话
        this.formData.Telephone.value = this.roleInfo.Phone;
     
    }
    // 初始化编辑数据
    public initEditData(ID) {
        this._UBService.getPruchaseOrder(ID).then(data => {
            if(data.Result){
                let response = data.Data;

                // 赋值
                for(var key in this.formData){
                    this.formData[key].value = response[key];
                }
                // 个人信息
                this.roleInfo.FlatName = response['Platform'];
                this.roleInfo.PlatCode=response["FlatCode"];
                this.roleInfo.ITCode = response['ApplicantItCode'];
                this.roleInfo.UserName = response['ApplicantName'];
                this.roleInfo.DeptName = response['Department'];
                this.roleInfo.CostCenterName = response['CostCenter'];
                // 我方主体
                this.formData.CompanyName.value = response['CompanyCode'] + '-' + response['CompanyName'];
                // 内部交易维护人
                // 保存的草稿，可能没有填写维护人
                if(!response['InsiderTraderName'] || !response['InsiderTraderName']){
                    
                }else {
                    this.formData.InsiderTraderName.value = [{
                        userID: response['InsiderTraderITCode'].toLocaleLowerCase(),
                        userEN: response['InsiderTraderITCode'].toLocaleLowerCase(),
                        userCN: response['InsiderTraderName']
                    }];
                }             
                // 采购清单
                this.listData = response['PurchaseOrderDetails'];
                let countA:any=0;
                this.listData.forEach(element => {
                    countA +=element.Count;
                    element["InterTransPrice"]=Number(element["InterTransPrice"]).toFixed(2);
                });
                this.summaryNum=countA;
                // 驳回后的审批流程id
                if(response['ApproveID']){
                    this. _ApproveID = response['ApproveID'];

                    this._UBService.getApproveOrderId(response['ApproveID']).then(data => {
                        this._taskID = JSON.parse(data.Data)[0];
                    })
                }
                // 附件列表
                this.oldFileList = response['PurchaseOrderAccessories'];
                this.excuteOldFileList();
                // 审批人
                this.WFApproveUserJSON = JSON.parse(response['WFApproveUserJSON']);
                this.excunteEditWFApproverUser();
                // 处理采购员排列
                this.excuteBuyers();
                this.showPlateform=[{id:response["FlatCode"],text:response["Platform"]}];
                
            } else{
                this.windowService.alert({ message: "查询编辑信息失败", type: "fail" });

                // 跳转到首页
                this.backToMyApply();
            }
        })
    }
    /**
     * 初始化配置数据
     * @param reload 是否从新加载配置数据
     * @param isEdit 是否是编辑数据
     */
    public initConfigData(reload, isEdit) {
        // 只在初始化加载的数据
        if (!reload) {
            // 所属平台
            this.shareDataService.getPlatformSelectInfo().then(data => {
               
                this.configDatas.platform = data;
                
            });
        }
        // 其他变化还会加载
        // 审批人
        if(!isEdit){
            this._UBService.getUBPurchaseOrderWFConfig({ YWFWDM: this.roleInfo.YWFWDM }).then(data => {
                if (data.Result) {
                    this.WFApproveUserJSON = JSON.parse(data.Data).WFApproveUserJSON;
    
                    for (let i = 0; i < this.WFApproveUserJSON.length; i++) {
                        this.WFApproveUserJSON[i].ApproverList = JSON.parse(this.WFApproveUserJSON[i].ApproverList);
                    }
    
                    // 处理采购员排列
                    this.excuteBuyers();
                } else {
                    this.windowService.alert({ message: '获取审批人信息失败，请重试', type: 'fail' });
    
                    this.WFApproveUserJSON = [{}, {}, {}, {}, {}, {}, {}];
                }
            });
        }

    }
    /**
     * 保存数据
     * @param type 提交还是保存草稿
     */
    public saveDatas(type) {
        let result = {};
        // 提交时校验，保存草稿时不校验
        if(type === '提交'){
            this.isSubmit = true;
            if (!this.validateListData() || !this.canSubmit || this.UBCommit.invalid) {
                this.windowService.alert({ message: "表单填写有误，请检查后重新提交", type: "fail" });
                return;
            }
        }
        // 遮罩
        this.isLoading = true;

        for (let key in this.formData) {
            // number类型
            if (this.formData[key].type === 'int') {
                result[key] = Number(this.formData[key].value);
            } else {
                result[key] = this.formData[key].value;
            }
        }

        // 新增保存无ID
        if(!this.isUpdate){
            delete result['ID'];
        }
        // 订单类型
        result['OrderType'] = 'UB';
        // 部门
        result['Department'] = this.roleInfo.DeptName;
        // 成本中心
        result['CostCenter'] = this.roleInfo.CostCenterName;
        // 处理申请人
        result['ApplicantItCode'] = result['ApplicantName'].userID;
        result['ApplicantName'] = result['ApplicantName'].userCN;
        // 处理内部交易人
        // 保存草稿可能不填值
        if(result['InsiderTraderName'] !== ''){
            result['InsiderTraderITCode'] = result['InsiderTraderName'][0].itcode || result['InsiderTraderITCode']; // 新增和编辑不一样
            result['InsiderTraderName'] = result['InsiderTraderName'][0].userCN;
        }
        // 处理主体
        // 保存草稿不填值
        if(result['CompanyName'] !== ''){
            result['CompanyCode'] = result['CompanyName'].split('-')[0];
            result['CompanyName'] = result['CompanyName'].split('-')[1];
        }
        // 处理采购清单列表
        for (let i = 0; i < this.listData.length; i++) {
            this.listData[i].Count = parseInt(this.listData[i].Count);
            this.listData[i].InterTransPrice = Number(this.listData[i].InterTransPrice).toFixed(2);
            this.listData[i].IsStoreFor30 = this.listData[i].IsStoreFor30 === true||this.listData[i].IsStoreFor30==="true";
            this.listData[i].IsCurrentMonthSale = this.listData[i].IsCurrentMonthSale === true||this.listData[i].IsCurrentMonthSale==="true";
            this.listData[i].TrackingNumber = result['TrackingNumber'];
        }
        result['PurchaseOrderDetails'] = this.listData;
        // 处理审批人
        result['WFApproveUserJSON'] = this.excuteWFApproverUser();
        // 上传附件
        result['PurchaseOrderAccessories'] = this.accessoryList;
        // 提交还是保存草稿
        if(result['ApproveState']!=="驳回"){
           result['ApproveState'] = type;
        }
        if(this._ApproveID && type === '提交'){
            result['ApproveID'] = this._ApproveID;
        }
        
        // 保存
        this._UBService.saveData(result).then(data => {
            if(data.Result){
                // 从新提交流程
                if(this._taskID && type === '提交'){
                    this._UBService.reloadApproveOrder(
                        {
                            "taskid": this._taskID,//任务id
                            "opinions": "重新提交",//审批意见
                            "approveresult": "Approval"//批准：Approval，拒绝：Reject
                        }
                    ).then( data => {});
                }

                this.isLoading = false;
                
                if(type === '草稿') {
                    this.windowService.alert({message:'保存成功',type:'success'}).subscribe(()=>{
                        this.backToMyApply();
                    });
                }else {
                    this.windowService.alert({message:'提交成功',type:'success'}).subscribe(()=>{
                        this.backToMyApply();
                    });
                }
                
            } else{
                this.windowService.alert({ message: data.Message, type: 'fail' });
            }
        });
    }
    backToMyApply(){
        this.router.navigate([`procurement/procurement-order/my-apply`]);
    }
    
    // 更改申请人
    changeApplicantName(obj) {
        console.log(obj)
    }
    /**
     * 更改内部交易维护人
     * @param obj 更改的值对象
     */
    changeInsiderTraderName(obj) {
        console.log(obj);
    }
    /**
     * 选择主体后的返回值
     * @param obj 值对象
     */
    CompanyChange(obj) {
        if (obj && obj.length) {
            this.formData.CompanyName.value = `${obj[1]}-${obj[0]}`
            // 根据主体更新采购员展示
            this.excuteBuyers();
        } else {
            this.formData.CompanyName.value = '';
        }
    }
    // 搜索销售合同
    searchApplyContracts() {
        this._UBService.getMyApplyContracts(this.searchData).then(data => {
            if(data.Result){
                let result = JSON.parse(data.Data);
                
                this.salesDatas = result.ContractList;
                // 无数据
                if(!this.salesDatas.length){
                    this.isDisplay = false;
                } else{
                    this.isDisplay = true;
                }
                this.salesDatas.forEach(element => {
                 element.SC_Status=this.getContractStatus(element.SC_Status);
                });
                // 初始化页码
                this.pagerData.set({ pageNo: result.CurrentPage, pageSize: result.PageSize, totalPages: Math.ceil(result.TotalCount / result.PageSize) });
            } else {
                this.isDisplay = false;

                this.windowService.alert({ message: '网络错误', type: 'fail'});
            }
            
        });
    }
    // 销售合同分页change事件
    onChangePage(pageObj) {
        this.searchData.CurrentPage = pageObj.pageNo;
        
        this.searchApplyContracts()
    }
    /**
     * 选择销售合同
     * @param code 选中的销售合同编号
     */
    chooseSales(code) {
        // 赋值
        if(this.listData[this.indexWithSales]){
            this.listData[this.indexWithSales].MainContractCode = code;
        }
        // 关闭弹窗
        this.closeModal();
    }
    // 重置销售合同搜索条件
    resetSearch() {
        this.searchData.SalesPerson = '';
        this.searchData.ProjectName = '';
        this.searchData.BuyerName = '';
        this.searchData.PO = '';
        this.searchData.CurrentPage = 1;
    }
    //新增行
    addRow() {
        this.listData.push(JSON.parse(JSON.stringify(this.emptyListData)));

        this.changeScroll();
    }
    /**
     * 删除行
     * @param index 当前行
     */
    deleteRow(index) {
        this.listData.splice(index, 1);
        this.listData=JSON.parse(JSON.stringify(this.listData));
        this.countAmountSummary();
        this.changeScroll();
    }
    // 滚动条变化改变宽度
    changeScroll(){
        if (this.listData && this.listData.length >= 8) {//出现滚动条的宽度调整
            if(!$(".no-scroll").hasClass('has-scroll')){
                $(".no-scroll").addClass("has-scroll");
            }
        } else {
            $(".no-scroll").removeClass("has-scroll");
        }
    }
    // 批量删除
    batchRemoveRows() {
        for(let i = this.listData.length - 1;i >= 0;i--){
            if(this.listData[i].checked){
                this.listData.splice(i, 1);
                this.countAmountSummary();
            }
        }
        
        if(this.fullChecked){
            this.fullChecked = false;
        }
        this.listData=JSON.parse(JSON.stringify(this.listData));
    }
    downLoadFile() {
        window.open(`${dbomsPath}assets/downloadtpl/UB新建-采购清单.xlsx`);
    }
    /**
     * 批量上传采购清单列表
     * @param data 上传清单返回数据
     */
    uploadPurchase(data) {
        if(data.Result){
            let result=data.Data;
            result.forEach(item => {
                item.InterTransPrice=Number(item.InterTransPrice).toFixed(2);
                
            });
            this.listData = result.concat(JSON.parse(JSON.stringify(this.listData)));
              
            // 计算总量
            this.countAmountSummary();
        }
    }
    /**
     * 验证物料号并带回信息
     * @param index 当前行
     * @param materielNum 物料号
     */
    getMateriel(index, materielNum) {
        this._UBService.getMaterialInfo(materielNum).then(data => {
            if (data.Result) {
                if (data.Data.MAKTX_ZH === '') { // 物料号不存在
                    this.canSubmit = false;

                    this.windowService.alert({ message: '该物料号不存在', type: 'fail' });
                } else {
                    this.canSubmit = true;

                    this.listData[index].MaterialDescription = data.Data.MAKTX_ZH;
                }
            } else {
                this.canSubmit = false;

                this.windowService.alert({ message: '获取物料号失败，请检查网络', type: 'fail' });
            }
        });
    }
    /**
     * 用于计算数量总额
     */
    countAmountSummary() {
        let num = 0;
        let amount = 0;

        for (let i = 0; i < this.listData.length; i++) {
            let price = this.listData[i].InterTransPrice;
            // 小数限制三位，但是在限制前已经读入
            if(price && price !== 0){
                price = String(price).match(/\d+.\d{0,2}/g) ? String(price).match(/\d+.\d{0,2}/g)[0] : price;
            }

            num += Number(this.listData[i].Count);
            amount += (this.listData[i].Count * Number(price));
        }

        this.summaryNum = num;
        this.formData.PruchaseAmount.value = amount;
    }
    /**
     * 处理审批人传值
     */
    excuteWFApproverUser() {
        let temp = JSON.parse(JSON.stringify(this.WFApproveUserJSON));

        for(let i = 0;i < temp.length;i++){
            // 不存在审批人的情况,基本针对于保存草稿
            if(!temp[i].UserSettings&&(new RegExp('[0|1|5|6]', 'g').test(`${i}`))){
                continue;
            }

            if(temp[i].ApproverList){
                if(new RegExp('[0|1|5|6]', 'g').test(`${i}`)){
                    let ITCode = temp[i].UserSettings.split('-')[0];
                    let UserName = temp[i].UserSettings.split('-')[1];
                    temp[i].UserSettings = JSON.stringify([{ ITCode, UserName }]);
                } else if(i === 4){
                    if(this.formData.InsiderTraderName.value[0]||this.formData.InsiderTraderITCode.value){
                    let ITCode =  this.formData.InsiderTraderName.value[0].itcode || this.formData.InsiderTraderITCode.value; // 编辑和新增不一样
                    let UserName = this.formData.InsiderTraderName.value[0].userCN;
                    temp[i].UserSettings = JSON.stringify([{ ITCode, UserName }]);
                  }
                }

                temp[i].ApproverList = JSON.stringify(temp[i].ApproverList);
            }
        }

        return JSON.stringify(temp);
    }
    // 处理编辑中审批人的值
    excunteEditWFApproverUser(){
        for(let i = 0;i < this.WFApproveUserJSON.length;i++){
            if(this.WFApproveUserJSON[i].ApproverList){

                // 不存在审批人的情况,基本针对于保存草稿
                if(!this.WFApproveUserJSON[i].UserSettings&&(new RegExp('[0|1|5|6]', 'g').test(`${i}`))){
                    continue;
                }

                if(new RegExp('[0|1|5|6]', 'g').test(`${i}`)){
                    let array = JSON.parse(this.WFApproveUserJSON[i].UserSettings);
                    let ITCode = array[0].ITCode;
                    let UserName = array[0].UserName;
                    this.WFApproveUserJSON[i].UserSettings = ITCode + '-' + UserName;
                }

                this.WFApproveUserJSON[i].ApproverList = JSON.parse(this.WFApproveUserJSON[i].ApproverList);
            }
        }
    }
    // 处理采购员排列
    excuteBuyers(){
        this.buyers = []; // 清空

        let temp = [];
        let companyCode = this.formData.CompanyName.value.split('-')[0];
        // 根据主体判断
        if( companyCode === '0080' || companyCode === '0065'){ // 海外
            temp = temp.concat(this.WFApproveUserJSON[3].ApproverList);
        } else{
            temp = temp.concat(this.WFApproveUserJSON[2].ApproverList);
        }

        for(let i = 0;i < temp.length;i++){
            let obj = new Person();
            obj.userID = temp[i].ITCode.toLocaleLowerCase();
            obj.userEN = temp[i].ITCode.toLocaleLowerCase();
            obj.userCN = temp[i].UserName;

            this.buyers.push(obj);
        }
    }
    /**
     * 需求跟踪号验证，重复，是否是纯数字或者字母
     * 新的需求是，不区分纯数字或者纯字母
     */
    validateRequireTracing() {
        
        let value = this.formData.TrackingNumber.value;
        if(value){
            this.formData.TrackingNumber.value=value.trim().toLocaleUpperCase();
        }
        

        // let reg_word = new RegExp('[A-Z]', 'g');
        // let reg_num = new RegExp('[0-9]', 'g');
       
        if (value === '') {
            this.formData.TrackingNumber.invalidTip = '请填写需求跟踪号';
            this.canSubmit = false;
            return false;
        } else {
            this.formData.TrackingNumber.invalidTip = '';
        }

        // if (reg_word.test(value) && reg_num.test(value)) {
        //     this.formData.TrackingNumber.invalidTip = '';
        // } else if (value === '') {
        //     this.formData.TrackingNumber.invalidTip = '请填写需求跟踪号';

        //     return false;
        // } else {
        //     this.formData.TrackingNumber.invalidTip = '需求跟踪号必须由数字和字母组合';

        //     return false;
        // }

        let postData = {
            TraceNo: value,
            isUpdate: this.isUpdate,
            PurchaseRequisitionId: null,
            PurchaseOrder_ID: null
        };
        // 如果是编辑
        if(this.isUpdate){
            postData.isUpdate = true;
            postData.PurchaseRequisitionId = null;
            postData.PurchaseOrder_ID = this.editID;
        }

        this._UBService.validateRequiredTracing(postData).then(data => {
            if(data.Result){
                this.canSubmit = true;  
            } else {
                this.canSubmit = false;

                this.formData.TrackingNumber.invalidTip = '需求跟踪号重复';
            }
        })
    }
    /**
     * 供货工厂和需货工厂的验证
     * @param value 值
     * @param type 供货工厂和需货工厂中后两位与主体是否一致,1为供货工厂，2位需求工厂
     */
    validateMainBody(value, type) {
        if(type==="VendorNo"){
          this.formData.VendorNo.value=value.toLocaleUpperCase();
        }
        else if(type==="FactoryCode"){
          this.formData.FactoryCode.value=value.toLocaleUpperCase();
        }
        
        
        let companyCode = this.formData.CompanyName.value.split('-')[0];
        companyCode = companyCode.slice(2, 4); // 取主体后两位
        
        this.canSubmit = false;

        if (value === '') {
            this.formData[type].invalidTip = `请填写${type === 'VendorNo' ? '供货工厂' : '需货工厂'}`;
        } else {
            if (value.slice(0, 2) !== companyCode) {
                this.formData[type].invalidTip = '前两位与主体后两位需要保持一致';
            } else{
                this.formData[type].invalidTip = '';

                this.canSubmit = true;
            }
        }
       
    }
    // 验证采购清单
    validateListData(){
        // 无清单项目
        if(!this.listData.length){
            this.windowService.alert({ message: "采购清单未填写", type: "fail" });

            return false;
        }
        // 必填清单项
        let required = [];
        this.tableConfig.forEach(element => {
            if(element.isRequired){
                required.push(element.field);
            }
        });
        // 清单项目必填项没有填写
        for(let i = 0;i < this.listData.length;i++){
            for(let j = 0;j < required.length;j++){
                if(!this.listData[i][required[j]]){
                    return false;
                }
            }

            // 选项必须填写
            if(this.listData[i].IsStoreFor30 === '' || this.listData[i].IsCurrentMonthSale === ''){
                this.windowService.alert({ message: "采购清单中是否入库或是否本月销售未选择", type: "fail" });

                return false;
            }
        }

        // 验证成功
        return true;
    }
    /**
     * 打开弹窗
     * @param index 行标
     */
    public openSalesAgreement(index) {
        this.modal.open();

        this.indexWithSales = index;

        this.searchApplyContracts();
    }
    //分页逻辑
    public pagination(pageData) {
        var offset = (pageData.pageNo - 1) * pageData.pageSize;
        return (offset + pageData.pageSize >= pageData.array.length) ? pageData.array.slice(offset, pageData.array.length) : pageData.array.slice(offset, offset + pageData.pageSize);
    }
    // 关闭弹窗
    public closeModal() {
        this.modal.close();
    }
    /**
     * 上传附件
     * @param obj 上传文件成功后的返回值
     */
    onUploadBack(obj) {
        if(obj.Result){
            this.accessoryList.push(obj.Data);
        }
    }
    /**
     * 删除一个附件
     * @param index 删除附件后的返回值-行标
     */
    onDeleteItem(index) {
        this.accessoryList.splice(index, 1);
    }
    /**
   * 缺少附件名称
   */
    excuteOldFileList(){
        for(var i = 0;i < this.oldFileList.length;i++){
        this.oldFileList[i]['name'] = this.oldFileList[i]['AccessoryName'];
        }

        this.accessoryList = JSON.parse(JSON.stringify(this.accessoryList.concat(this.oldFileList)));
    }
    getPlatform(e){
        this.formData.Platform.value=e.text;
        this.formData.FlatCode.value=e.id;
    }
    getCurrentApprover(e,i){
        this.WFApproveUserJSON[i].UserSettings=e.id+"-"+e.text;
        
    }
    getContractStatus(SC_Status:any):string{
      let strStatus:string;
      switch(SC_Status){
          case 0:
          strStatus="草稿";
          break;
          case 1:
          strStatus="申请中";
          break;
          case 2:
          strStatus="已完成";
          break;
          case 3:
          strStatus="驳回";
          break;
          case 4:
          strStatus="已签定";
          break;
          case 5:
          strStatus="作废";
          break;
      }
      return strStatus;
    }
    // onApproverSelectModalShow(approverlist,wfNodeindex){
    //     this.nodeItemIndex=wfNodeindex;
    //     let approverModalList:ApproveModal[]=[];
    //     approverlist.forEach(element => {
    //         let approver=new ApproveModal()
    //         approver.userEN=element.ITCode;
    //         approver.userCN=element.UserName;
    //         approverModalList.push(approver);
    //     });
    //     this.modalApprover.show({data:approverModalList});//显示弹出框
    //   }

}