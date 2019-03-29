import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgForm } from '@angular/forms';

import { PipelineService, SaveData, new_editConfigDatas } from '../../services/pipeline.service';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { WindowService } from '../../../../core';

declare var window;
@Component({
    selector: 'pipeline-new_edit',
    templateUrl: 'new_edit.component.html',
    styleUrls: [ 'new_edit.component.scss' ]
})

export class PipelineNew_Edit implements OnInit, OnDestroy{
    @ViewChild('modal') modal: ModalComponent;
    @ViewChild('form') form: NgForm;
    // 保存数据的字段
    public formDataConfig = new SaveData();
    // 表单配置数据
    public new_editConfigDatas = new new_editConfigDatas();
    // 一些下拉框配置的数据,接后台数据使用
    public configDatas: any = {
        currency: null,
        provinceCityInfo: null,
        currentUser: null,
        payMentMode: null
    };
    // 个性信息
    public roleFieldConfig: any = {
        AgencyType: {
            FieldValue: ''
        },
        ChannelType: {
            FieldValue: ''
        },
        Po: '',
        ProjectTrade: {
            FieldValue: ''
        },
        OrderType: {
            FieldValue: ''
        },
        ProductType: []
    }
    // 产品类型是否选中
    public isProductTypeChecked: boolean = false;
    // 个性信息用于提交
    public roleConfigSubmit: any;
    // 个人信息
    public roleInfo: any;
    // 弹窗配置信息
    public modalConfig: any = {
        title: '',
        validMessage: '',
        placeholder: '',
        searchText: '',
        tableTitle: [],
        pagerData: new Pager(),
        currentPageItems: [],
        allItems: [], // 不支持分页的数据暂存所有数据
        onSelected: (item) => {},
        onChangePage: (item) => {},
        onSearch: (item) => {},
        onRowSelected: (item) => {}
    };
    // 用于检测是否获得编辑、个性信息的数据
    public isGetEditData: boolean = false;
    public ISGetRoleConfig: boolean = false;
    // 是否展示项目编号
    public showProjectNo: boolean;
    // 是否显示创建日期
    public showCreateTime: boolean;
    // 上传文件的列表
    public uploadItems: any = [];
    // 上传文件的列表
    public editEploadItems: any = [];
    // 上传文件地址
    public uploadUrl: any;
    // 加载遮罩
    public isLoading: boolean;
    // 是否可以提交
    public isSubmit: boolean = false;
    // 是否是编辑数据
    public isEdit: boolean = false;

    constructor (
        private route: ActivatedRoute,
        private router: Router,
        private pipelineService: PipelineService,
        private windowService: WindowService
    ){
        this.uploadUrl = pipelineService.uploadUrl;

        this.uploadItems = [];
        this.editEploadItems = [];
    }

    ngOnInit() {
        // 遮罩
        this.isLoading = true;

        // 获取个人信息
        this.roleInfo = JSON.parse(window.localStorage.UserInfo);
        // 路由判断是新增还是编辑
        this.route.params.subscribe(params => {
            if(params.type === 'new'){ // 新增
                // 初始化新增数据
                this.initNewData();
                // 是否展示项目编号
                this.showProjectNo = false;
                // 是否展示创建时间
                this.showCreateTime = false;
                // 新增默认完成请求编辑的数据
                this.isGetEditData = true;
                // 个性信息
                this.getRoleConfigData();
            } else {
                this.initEditData(params.id);

                this.getRoleConfigData({ id: params.id });
                // 编辑
                this.isEdit = true;
                
                // 是否展示项目编号
                this.showProjectNo = true;
                // 是否展示创建时间
                this.showCreateTime = true;
            }
        })
        // 初始化配置数据
        this.initConfigData();
    }
    ngOnDestroy(){
        
    }
    public selectedCurrency(e){
        const valueList = e.target.value.split('-');
        this.formDataConfig.Currency.value = valueList[1];
        this.formDataConfig.CurrencyCode.value = valueList[0];
    }
    // 初始化新增数据
    public initNewData(){
        delete this.formDataConfig.ID;
        delete this.formDataConfig.IsBusiness;
        delete this.formDataConfig.Remark;
        delete this.formDataConfig.UpdateTime;
        // 新增
        this.isEdit = false;
        // 所属平台
        this.formDataConfig.Platform.value = this.roleInfo.FlatName;
        // 销售员
        this.formDataConfig.SellerName.value = [{
            userID : this.roleInfo.ITCode,
            userEN : this.roleInfo.ITCode.toLocaleUpperCase(),
            userCN : this.roleInfo.UserName
        }];
        // 币种
        this.formDataConfig.Currency.value = '人民币';
        this.formDataConfig.CurrencyCode.value = 'RMB';
        // 销售员itCode
        this.formDataConfig.SellerItCode.value = this.roleInfo.ITCode;
        // 创建人名称
        this.formDataConfig.CreateName.value = this.roleInfo.UserName;
        // 创建人itCode
        this.formDataConfig.CreateItCode.value = this.roleInfo.ITCode;
    }
    // 初始化编辑数据
    public initEditData(ID){
        this.pipelineService.getEditOrScanData(ID).then(data => {
            if(data.Result){
                let response = data.Data;

                this.isGetEditData = true;
                // 赋值
                for(var key in response){
                    this.formDataConfig[key].value = response[key];
                }

                // 销售员
                this.formDataConfig.SellerName.value = [{
                    userID : response.SellerItCode,
                    userEN : response.SellerItCode.toLocaleUpperCase(),
                    userCN : response.SellerName
                }];

                // 联动项目状态
                this.selectedProjectState();
                // 上传列表
                this.excuteEditUpload({ uploadList: response.PipelineAccessories });
                // 毛利率不填写
                this.formDataConfig.PreMarginRate.value = response.PreMarginRate === 0 && '';

                this.isLoading = this.isLoadingShow();
            } else{
                this.windowService.alert({ message: "查询编辑信息失败", type: "fail" });

                // 跳转到首页
                this.router.navigate([`${dbomsPath}pipeline/pipeline-list`]);
            }
        })
    }
    // 处理编辑的
    public excuteEditUpload(data){
        let { uploadList } = data;

        for(let i = 0;i < uploadList.length;i++){
            uploadList[i]['name'] = uploadList[i]['AccessoryName'];
        }

        this.editEploadItems = uploadList;
    }
    // 初始化个性信息
    public getRoleConfigData(data = null){
        if(data){
            this.pipelineService.editRoleFieldConfig({ BusinessType: 'Pipeline', BusinessID: data.id }).then(data => {
                if(data.Result){
                    this.ISGetRoleConfig = true;

                    this.excuteRoleConfig({ data: JSON.parse(data.Data), isEdit: true });

                    // 保存信息赋值
                    this.roleConfigSubmit = JSON.parse(data.Data);

                    this.isLoading = this.isLoadingShow();
                }
            })
        } else {
            // 个性信息
            this.pipelineService.getRoleFieldConfig({ BusinessCode: this.roleInfo.YWFWDM, BusinessType: 'Pipeline' }).then(data => {
                if(data.Result){
                    this.ISGetRoleConfig = true;

                    this.excuteRoleConfig({ data: JSON.parse(data.Data), isEdit: false });

                    // 保存信息赋值
                    this.roleConfigSubmit = JSON.parse(data.Data);

                    this.isLoading = this.isLoadingShow();
                }
            })
        }
    }
    // 初始化配置数据
    public initConfigData(){
        // 币种
        this.pipelineService.getCurrency().then(data => {
            if(data.Result){
                this.configDatas.currency = JSON.parse(data.Data);

                this.isLoading = this.isLoadingShow();
            }
        });
        // 所属平台
        this.pipelineService.getCurrentUser().then(data => {
            if(data.Result){
                this.configDatas.currentUser = JSON.parse(data.Data);

                this.isLoading = this.isLoadingShow();
            }
        });
        
        // 付款方式
        this.pipelineService.getPayMentMode().then(data => {
            if(data.Result){
                this.configDatas.payMentMode = data.Data;

                this.isLoading = this.isLoadingShow();
            }
        });
        // 省市
        this.pipelineService.getProvinceCityInfo().then(data => {
            if(data.Result){
                this.configDatas.provinceCityInfo = JSON.parse(data.Data).province;

                this.isLoading = this.isLoadingShow();
            }
        });
        
    }
    // 处理loading是否显示
    public isLoadingShow(){
        let result: boolean = false;

        for(var key in this.configDatas){
            if(!this.configDatas[key]){
                result = true;
                break;
            }
        }

        // return result && this.isGetEditData && this.ISGetRoleConfig;
        return false;
    }
    // 打开客户名称的弹窗
    public openCustomName(){
        this.modalConfig.title = '客户名称';
        this.modalConfig.placeholder = '请输入搜索条件';
        this.modalConfig.tableTitle = [
            {
                name: '客户名称',
                field: 'NAME'
            },
            {
                name: '客户编号',
                field: 'KUNNR'
            },
            {
                name: '客户类型',
                field: 'KTOKD'
            }
        ];
        this.modalConfig.onSearch = (name) =>  this.getBuyerInfo(name);
        this.modalConfig.onChangePage = (event) => {
            this.modalConfig.currentPageItems = this.pagination({ pageNo: event.pageNo, pageSize: event.pageSize, array: this.modalConfig.allItems });
        }
        this.modalConfig.onRowSelected = (rowData) => {
            this.formDataConfig.CustomName.value = rowData.NAME;
            // 带出客户编号
            this.formDataConfig.CustomNo.value = rowData.KUNNR;
            this.closeModal();
        }
        this.modal.open();
    }
      //分页逻辑
    public pagination(pageData) {
        var offset = (pageData.pageNo - 1) * pageData.pageSize;
        return (offset + pageData.pageSize >= pageData.array.length) ? pageData.array.slice(offset, pageData.array.length) : pageData.array.slice(offset, offset + pageData.pageSize);
    }
    // 打开预约法人体的弹窗
    public openPreSignBody(){
        this.modalConfig.title = '预计签约法人体';
        this.modalConfig.placeholder = '请输入搜索条件';
        this.modalConfig.tableTitle = [
            {
                name: '公司',
                field: 'company'
            },
            {
                name: '公司代码',
                field: 'companycode'
            }
        ];
        this.modalConfig.onSearch = (name) =>  this.getPageDataCompany({ pageNo: 1, pageSize: 20, querycontent: name});
        this.modalConfig.onChangePage = (event) => this.getPageDataCompany({ pageNo: event.pageNo, pageSize: 20, querycontent: this.modalConfig.searchText});
        this.modalConfig.onRowSelected = (rowData) => {
            this.formDataConfig.PreSignBody.value = rowData.company;
            this.closeModal();
        }
        this.modal.open();
    }
    // 关闭弹窗
    public closeModal(){
        this.modalConfig.tableTitle = []; 
        this.modalConfig.searchText = '';
        this.modalConfig.allItems = [];
        this.modalConfig.currentPageItems = [];
        this.modal.close();
    }
    
    // 获取预约法人体数据
    public getPageDataCompany(postData){
        // 预计签约法人体
        this.pipelineService.getPageDataCompany(postData).then(data => {
            if(data.Result){
                this.modalConfig.currentPageItems = JSON.parse(data.Data.pagedata);
                this.modalConfig.pagerData.set(data.Data.pager);
            } else{
                this.isLoading = false;

                this.windowService.alert({ message: data.Message, type: "fail" });
            }
        });
    }
    
    // 获取客户名称数据
    public getBuyerInfo(postData){
        this.isLoading = true;
        // 客户名称
        this.pipelineService.getBuyerInfo(postData).then(data => {
            if(data.Result){
                // 暂存所有数据
                let itemsCount;
                this.modalConfig.allItems = JSON.parse(data.Data);
                itemsCount = this.modalConfig.allItems.length;
                // 前端手动分页
                this.modalConfig.currentPageItems = this.pagination({ pageNo: 1, pageSize: 20, array: this.modalConfig.allItems });
                this.modalConfig.pagerData.set({ pageNo: 1, pageSize: 20, total: itemsCount, totalPages: Math.ceil(itemsCount / 20)});

                this.isLoading = false;
            } else{
                this.isLoading = false;

                this.windowService.alert({ message: data.Message, type: "fail" });
            }
        });
    }
    // 处理个性化信息
    public excuteRoleConfig(data){
        const datas = data.data.FieldMsg;
        for(let item of datas){
            for(var key in this.roleFieldConfig){
                if(key === item.FieldName){
                    this.roleFieldConfig[key] = item;
                }
            }
        }
    }
    // 处理日期
    public excuteDate(date){
        if(!date){
            return '';
        }
        
        let year = new Date(date).getFullYear();
        let month: any = new Date(date).getMonth();
        month  = month > 9 ? month : `0${month}`;
        let day: any = new Date(date).getDate();
        day  = day > 9 ? day : `0${day}`;

        return `${year}-${month}-${day}`;
    }

    // 选中项目状态联动项目进度
    public selectedProjectState(){
        switch (this.formDataConfig.ProjectState.value.toString()){
            case '1': 
                this.formDataConfig.ProjectProgress.value = '20%';
                this.changeRequiredWithState(['CustomName', 'ProjectName', 'ProjectAmount']);
                break;
            case '2': 
                this.formDataConfig.ProjectProgress.value = '40%';
                this.changeRequiredWithState(['CustomName', 'ProjectName', 'ProjectAmount', 'PreSignDate', 'PreDeliveryDate', 'PreMarginRate']);
                break;
            case '3': 
                this.formDataConfig.ProjectProgress.value = '60%';
                this.changeRequiredWithState(['CustomName', 'ProjectName', 'ProjectAmount', 'PreSignDate', 'PreDeliveryDate', 'PreMarginRate', 'PaymentType', 'PaymentTerms', 'FinalUserName', 'FinalUserProvince']);
                break;
            case '4': this.formDataConfig.ProjectProgress.value = '80%';break;
            case '5': this.formDataConfig.ProjectProgress.value = '100%';break;
            case '6': 
                this.formDataConfig.ProjectProgress.value = '0%';
                this.changeRequiredWithState(['LostReason']);
                break;
            default: this.formDataConfig.ProjectProgress.value = '';
        }
    }
    /**
     * 更改必填项
     * @param requiredList 必填项列表
     */
    public changeRequiredWithState(requiredList){
        for(var key in this.formDataConfig){
            this.formDataConfig[key].required = false;
        }
        for(let value of requiredList){
            this.formDataConfig[value].required = true;
        }
    }
    // 上传文件
    public fileUploadSuccess(event){
        if (event.Result) {
            let data = event.Data;

            this.uploadItems.push(data);
          }else{
            this.windowService.alert({ message: event.Message, type: "fail" });
          }
          
    }
    //删除附件
    public onDeleteFileItem(event) {
        //event = 删除文件的下标
        this.uploadItems.splice(event, 1);
    }
    //点击单个已经上传的附件
    public onClickFile(event){
        // event = {item: item, index: i}
        let url = "";
        
        url = this.uploadItems[event.index].AccessoryURL;
    
        window.open(dbomsPath + url);
    }
    // 切换不在表单内的日期控件
    public changeSpecialDate(key){
        this.formDataConfig[key].isValid = false;
    }
    // 校验主题表单
    public validateForm(){
        let result : boolean = true;

        for( let key in this.formDataConfig){
            if(this.formDataConfig[key].required && !this.formDataConfig[key].value){
                this.formDataConfig[key].isValid = true;

                result = false;
            } else{
                this.formDataConfig[key].isValid = false;
            }
        }

        return result;
    }
    // 校验个性信息
    public validateRoleInfo(){
        // 产品类型的校验
        let result: boolean = false;

        for(let item of this.roleFieldConfig.ProductType.Data){
            if(item.ischecked){
                result = true;
                // 产品类型提示
                this.isProductTypeChecked = false;

                break;
            }
        }

        if(!result){
            this.isProductTypeChecked = true;
        }

        return result;
    }
    // 保存个性信息
    public saveRoleConfig(id){
        let result = {};

        for(let key in this.roleFieldConfig){
            for(let i = 0;i < this.roleConfigSubmit.FieldMsg.length;i++){
                if(this.roleConfigSubmit.FieldMsg[i].FieldName === key){
                    this.roleConfigSubmit.FieldMsg.splice(i, 1, this.roleFieldConfig[key]);
                }
            }
        }
        // 赋值id
        this.roleConfigSubmit['BusinessID'] =  id;

        result = {
            'SCBaseData': this.roleConfigSubmit
        };

        this.pipelineService.updateRoleFieldConfig(result).then(data => {
            this.isLoading = false;

            if(!data.Result){
                this.windowService.alert({ message: "个性信息保存失败，请编辑当前表单修改", type: "fail" });
            }
            // 跳转到首页
            this.router.navigate([`pipeline/pipeline-list`]);
        });
    }
    // 保存数据
    public savePipeline(){
        let result = {};
        this.isSubmit = true;

        if (!this.validateForm() || !this.validateRoleInfo() || this.form.invalid) {
            this.windowService.alert({ message: "表单填写有误，请检查后重新提交", type: "fail" });
            return;
        }
        // 遮罩
        this.isLoading = true;

        // 赋值保存时间
        if(this.isEdit){
            this.formDataConfig.UpdateTime.value = new Date();
        } else{
            this.formDataConfig.CreateTime.value = new Date();
            this.formDataConfig.AddTime.value = new Date();
        }

        for(let key in this.formDataConfig){
            // number类型
            if (this.formDataConfig[key].type === 'int') {
                result[key] = Number(this.formDataConfig[key].value);
            } else if (this.formDataConfig[key].type === 'date') { // date 类型
                result[key] = this.excuteDate(this.formDataConfig[key].value);
            } else {
                result[key] = this.formDataConfig[key].value;
            }
        }
        // 处理销售员
        result['SellerItCode'] = result['SellerName'][0].userID;
        result['SellerName'] = result['SellerName'][0].userCN;
        // 上传附件
        result['PipelineAccessories'] = this.editEploadItems.concat(this.uploadItems);

        this.pipelineService.savePipeline(result).then((data) => {
            if(data.Result){
                this.saveRoleConfig(data.Data);
            } else{
                this.isLoading = false;

                this.windowService.alert({ message: "表单保存失败，请重试或检查网络连接", type: "fail" });
            }
        });
    }
    // 取消
    public cancelPipeline(){
        // 跳转到首页
        this.router.navigate([`pipeline/pipeline-list`]);
    }

}