import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgForm } from '@angular/forms';

import { RebateService, SaveData, new_editConfigDatas } from '../../services/facturer_rebate.service';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { WindowService } from '../../../../core';

declare var window;
@Component({
    selector: 'rebate-new_edit',
    templateUrl: 'new_edit.component.html',
    styleUrls: ['new_edit.component.scss']
})

export class RebateNew_Edit implements OnInit, OnDestroy {
    @ViewChild('modal') modal: ModalComponent;
    @ViewChild('form') form: NgForm;
    // 保存数据的字段
    public formDataConfig = new SaveData();
    // 表单配置数据
    public new_editConfigDatas = new new_editConfigDatas();
    // 一些下拉框配置的数据,接后台数据使用
    public configDatas: any = {
        SalesOrganization: null
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
        onSelected: (item) => { },
        onChangePage: (item) => { },
        onSearch: (item) => { },
        onRowSelected: (item) => { }
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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private rebateService: RebateService,
        private windowService: WindowService
    ) {
        this.uploadUrl = rebateService.uploadUrl;

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
            if (params.type === 'new') { // 新增
                // 初始化新增数据
                this.initNewData();
                // 是否展示项目编号
                this.showProjectNo = false;
                // 是否展示创建时间
                this.showCreateTime = false;
                // 新增默认完成请求编辑的数据
                this.isGetEditData = true;
                // 个性信息
                // this.getRoleConfigData();
            } else {
                this.initEditData(params.id);

                // this.getRoleConfigData({ id: params.id });
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
    ngOnDestroy() {

    }
    // 初始化新增数据
    public initNewData() {
        delete this.formDataConfig.ID;
        delete this.formDataConfig.UpdateTime;
        // 新增
        this.isEdit = false;

        // 销售员
        this.formDataConfig.CreateName.value = [{
            userID: this.roleInfo.ITCode,
            userEN: this.roleInfo.ITCode.toLocaleUpperCase(),
            userCN: this.roleInfo.UserName
        }];
    }
    // 初始化编辑数据
    public initEditData(ID) {
        this.rebateService.getEditOrScanData(ID).then(data => {
            if (data.Result) {
                let response = data.Data;

                this.isGetEditData = true;
                // 赋值
                for (var key in response) {
                    this.formDataConfig[key].value = response[key];
                }

                // 销售员
                this.formDataConfig.CreateName.value = [{
                    userID: response.CreateItCode,
                    userEN: response.CreateItCode.toLocaleUpperCase(),
                    userCN: response.CreateName
                }];

                this.isLoading = this.isLoadingShow();
            } else {
                this.windowService.alert({ message: "查询编辑信息失败", type: "fail" });

                // 跳转到首页
                this.router.navigate([`facturer_rebate/rebate-list`]);
            }
        })
    }

    // 初始化个性信息
    public getRoleConfigData(data = null) {
        if (data) {
            this.rebateService.editRoleFieldConfig({ BusinessType: 'Pipeline', BusinessID: data.id }).then(data => {
                if (data.Result) {
                    this.ISGetRoleConfig = true;

                    this.excuteRoleConfig({ data: JSON.parse(data.Data), isEdit: true });

                    // 保存信息赋值
                    this.roleConfigSubmit = JSON.parse(data.Data);

                    this.isLoading = this.isLoadingShow();
                }
            })
        } else {
            // 个性信息
            this.rebateService.getRoleFieldConfig({ BusinessCode: this.roleInfo.YWFWDM, BusinessType: 'Pipeline' }).then(data => {
                if (data.Result) {
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
    public initConfigData() {
        // 销售组织
        this.rebateService.getSalesOrganization().then(data => {
            if (data.Result) {
                this.configDatas.SalesOrganization = data.Data;

                this.isLoading = this.isLoadingShow();
            }
        })

    }
    // 打开客户名称的弹窗
    public openAgentName() {
        this.modalConfig.title = '代理商名称';
        this.modalConfig.placeholder = '请输入搜索条件';
        this.modalConfig.tableTitle = [
            {
                name: '代理商名称',
                field: 'NAME'
            },
            {
                name: '代理商编号',
                field: 'KUNNR'
            }
        ];
        this.modalConfig.onSearch = (name) => this.getAgentName(name);
        this.modalConfig.onChangePage = (event) => {
            this.modalConfig.currentPageItems = this.pagination({ pageNo: event.pageNo, pageSize: event.pageSize, array: this.modalConfig.allItems });
        }
        this.modalConfig.onRowSelected = (rowData) => {
            this.formDataConfig.AgentName.value =`${rowData.KUNNR}-${rowData.NAME}`;
            // 带出客户编号
            this.formDataConfig.AgentNameNumber.value = rowData.KUNNR;
            this.closeModal();
        }
        this.modal.open();
    }
    // 获取代理商名称
    public getAgentName(postData){
        this.isLoading = true;
        // 客户名称
        this.rebateService.getAgentName(postData).then(data => {
            if(data.Result){
                // 暂存所有数据
                let itemsCount;
                this.modalConfig.allItems = JSON.parse(data.Data);
                itemsCount = this.modalConfig.allItems.length;

                // 过滤客户类型为10的数据
                for(let i = itemsCount - 1;i >= 0;i--){
                    if(this.modalConfig.allItems[i].KTOKD !== '10'){
                        this.modalConfig.allItems.splice(i, 1);
                    }
                }
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
    //分页逻辑
    public pagination(pageData) {
        var offset = (pageData.pageNo - 1) * pageData.pageSize;
        return (offset + pageData.pageSize >= pageData.array.length) ? pageData.array.slice(offset, pageData.array.length) : pageData.array.slice(offset, offset + pageData.pageSize);
    }
    
    // 关闭弹窗
    public closeModal() {
        this.modalConfig.tableTitle = [];
        this.modalConfig.searchText = '';
        this.modalConfig.allItems = [];
        this.modalConfig.currentPageItems = [];
        this.modal.close();
    }

    // 处理loading是否显示
    public isLoadingShow() {
        let result: boolean = false;

        for (var key in this.configDatas) {
            if (!this.configDatas[key]) {
                result = true;
                break;
            }
        }

        // return result && this.isGetEditData && this.ISGetRoleConfig;
        return false;
    }
    // 处理个性化信息
    public excuteRoleConfig(data) {
        const datas = data.data.FieldMsg;
        for (let item of datas) {
            for (var key in this.roleFieldConfig) {
                if (key === item.FieldName) {
                    this.roleFieldConfig[key] = item;
                }
            }
        }
    }
    // 处理日期
    public excuteDate(date) {
        if(!date){
            return '';
        }
        
        let year = new Date(date).getFullYear();
        let month: any = new Date(date).getMonth() + 1;
        month = month > 9 ? month : `0${month}`;
        let day: any = new Date(date).getDate();
        day = day > 9 ? day : `0${day}`;

        return `${year}-${month}-${day}`;
    }
    // 选择销售组织
    public selectSalesOrganization(e) {
        const valueList = e.target.value.split('-');
        this.formDataConfig.SalesOrganization.isValid = false;
        this.formDataConfig.SalesOrganization.value = valueList[1];
        this.formDataConfig.SalesOrganizationCode.value = valueList[0];
    }
    /**
     * 更改必填项
     * @param requiredList 必填项列表
     */
    public changeRequiredWithState(requiredList) {
        for (var key in this.formDataConfig) {
            this.formDataConfig[key].required = false;
        }
        for (let value of requiredList) {
            this.formDataConfig[value].required = true;
        }
    }

    // 切换不在表单内的日期控件
    public changeSpecialDate(key) {
        this.formDataConfig[key].isValid = false;
    }
    // 校验主题表单
    public validateForm() {
        let result: boolean = true;

        for (let key in this.formDataConfig) {
            if (this.formDataConfig[key].required && !this.formDataConfig[key].value) {
                this.formDataConfig[key].isValid = true;

                result = false;
            } else {
                this.formDataConfig[key].isValid = false;
            }
        }

        return result;
    }
    // 校验个性信息
    public validateRoleInfo() {
        // 产品类型的校验
        let result: boolean = false;

        for (let item of this.roleFieldConfig.ProductType.Data) {
            if (item.ischecked) {
                result = true;
                // 产品类型提示
                this.isProductTypeChecked = false;

                break;
            }
        }

        if (!result) {
            this.isProductTypeChecked = true;
        }

        return result;
    }
    // 保存个性信息
    public saveRoleConfig(id) {
        let result = {};

        for (let key in this.roleFieldConfig) {
            for (let i = 0; i < this.roleConfigSubmit.FieldMsg.length; i++) {
                if (this.roleConfigSubmit.FieldMsg[i].FieldName === key) {
                    this.roleConfigSubmit.FieldMsg.splice(i, 1, this.roleFieldConfig[key]);
                }
            }
        }
        // 赋值id
        this.roleConfigSubmit['BusinessID'] = id;

        result = {
            'SCBaseData': this.roleConfigSubmit
        };

        this.rebateService.updateRoleFieldConfig(result).then(data => {
            this.isLoading = false;

            if (!data.Result) {
                this.windowService.alert({ message: "个性信息保存失败，请编辑当前表单修改", type: "fail" });
            }
            // 跳转到首页
            this.router.navigate([`facturer_rebate/rebate-list`]);
        });
    }
    // 保存数据
    public saveRebate() {
        let result = {};
        this.isSubmit = true;

        // if (!this.validateForm() || !this.validateRoleInfo() || this.form.invalid) {
        if (!this.validateForm() || this.form.invalid) {
            this.windowService.alert({ message: "表单填写有误，请检查后重新提交", type: "fail" });
            return;
        }
        // 遮罩
        this.isLoading = true;

        // 赋值保存时间
        if (this.isEdit) {
            this.formDataConfig.UpdateTime.value = new Date();
        } else {
            this.formDataConfig.CreateTime.value = new Date();
        }

        for (let key in this.formDataConfig) {
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
        result['CreateItCode'] = result['CreateName'][0].userID;
        result['CreateName'] = result['CreateName'][0].userCN;
        // 业务范围
        result['YWFWDM'] = this.roleInfo.YWFWDM;

        this.rebateService.saveRebate(result).then((data) => {
            this.isLoading = false;
            
            if (data.Result) {
                this.router.navigate([`facturer_rebate/rebate-list`]);
            } else {
                this.windowService.alert({ message: "表单保存失败，请重试或检查网络连接", type: "fail" });
            }
        });
    }
    // 取消
    public cancelRebate() {
        // 跳转到首页
        this.router.navigate([`facturer_rebate/rebate-list`]);
    }

}