import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PipelineService, SaveData, new_editConfigDatas} from '../../services/pipeline.service';

import { WindowService } from '../../../../core';
import { dbomsPath, environment } from "environments/environment";

declare var window;

@Component({
    selector: 'pipeline-scan',
    templateUrl: 'scan.component.html',
    styleUrls: [ 'scan.component.scss' ]
})

export class PipelineScan implements OnInit{
    // 数据
    public formDataConfig = new SaveData();
    // 表单配置数据
    public new_editConfigDatas = new new_editConfigDatas();
    // 遮罩
    public isLoading: boolean = false;
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
    // 一些下拉框配置的数据,接后台数据使用
    public configDatas: any = {
        currency: null,
        provinceCityInfo: null,
        payMentMode: null
    };

    constructor (
        private pipelineService: PipelineService,
        private router: Router,
        private route: ActivatedRoute,
        private windowService: WindowService
    ){
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.initScanData(params.id)
        })
    }
    // 初始化编辑数据
    public initScanData(ID){
        this.isLoading = true;

        this.pipelineService.getEditOrScanData(ID).then(data => {
            if(data.Result){
                let response = data.Data;

                // 赋值
                for(var key in response){
                    this.formDataConfig[key].value = response[key];
                }

                // 销售员
                this.formDataConfig.SellerName.value = response.SellerName;

                // 联动项目状态
                this.selectedProjectState();
                // 毛利率不填写
                this.formDataConfig.PreMarginRate.value = response.PreMarginRate === 0 && '';
                // 本地配置项
                // 项目状态
                this.formDataConfig.ProjectState.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.ProjectState.value, options: this.new_editConfigDatas.ProjectState, valueKey: 'value', textKey: 'name'});
                // 项目类型
                this.formDataConfig.ProjectType.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.ProjectType.value, options: this.new_editConfigDatas.ProjectType, valueKey: 'value', textKey: 'name'});
                // 客户资金来源
                this.formDataConfig.CustomFundSource.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.CustomFundSource.value, options: this.new_editConfigDatas.CustomFundSource, valueKey: 'value', textKey: 'name'});

                // 初始化配置数据
                this.initConfigData();
                // 个性信息
                this.getRoleConfigData({ id: ID });
            } else{
                this.windowService.alert({ message: "查询编辑信息失败", type: "fail" });

                // 跳转到首页
                this.router.navigate([`pipeline/pipeline-list`]);
            }
        })
    }
    // 初始化配置数据
    public initConfigData(){
        // 币种
        this.pipelineService.getCurrency().then(data => {
            if(data.Result){
                this.configDatas.currency = true;

                this.formDataConfig.Currency.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.Currency.value, options:JSON.parse(data.Data), valueKey: 'CurrencyName', textKey: 'CurrencyName'});

                this.isLoading = this.isLoadingShow();
            }
        });
        
        // 付款方式
        this.pipelineService.getPayMentMode().then(data => {
            if(data.Result){
                this.configDatas.payMentMode = true;

                this.formDataConfig.PaymentType.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.PaymentType.value, options: data.Data, valueKey: '_paymentcode', textKey: '_paymentname'});

                this.isLoading = this.isLoadingShow();
            }
        });
        // 省市
        this.pipelineService.getProvinceCityInfo().then(data => {
            if(data.Result){
                this.configDatas.provinceCityInfo = true;

                this.formDataConfig.FinalUserProvince.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.FinalUserProvince.value, options:JSON.parse(data.Data).province, valueKey: 'ProvinceCode', textKey: 'ProvinceName'});

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

        return false;
    }
    // 处理下拉数据在页面的展示
    public excuteConfigToDisplay(data){
        /**
         * value: 需要转换的value
         * options： 选项
         * valueKey：value在选项中对应的key
         * textKey：需要展示的文字在选项中对应的key
         */
        let { value, options, valueKey, textKey } = data;
        let result;

        if(!value){
            return '';
        }

        for(let item of options){
            if(item[valueKey] == value){
                result = item[textKey];
            }
        }

        return result;
    }
    // 初始化个性信息
    public getRoleConfigData(data = null){
        if(data){
            this.pipelineService.editRoleFieldConfig({ BusinessType: 'Pipeline', BusinessID: data.id }).then(data => {
                if(data.Result){
                    this.excuteRoleConfig({ data: JSON.parse(data.Data), isEdit: true });
                }
            })
        }
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
    // 处理项目状态联动的项目进度
    public selectedProjectState(){
        switch (this.formDataConfig.ProjectState.value.toString()){
            case '1': 
                this.formDataConfig.ProjectProgress.value = '20%';
                break;
            case '2': 
                this.formDataConfig.ProjectProgress.value = '40%';
                break;
            case '3': 
                this.formDataConfig.ProjectProgress.value = '60%';
                break;
            case '4': this.formDataConfig.ProjectProgress.value = '80%';break;
            case '5': this.formDataConfig.ProjectProgress.value = '100%';break;
            case '6': 
                this.formDataConfig.ProjectProgress.value = '0%';
                break;
            default: this.formDataConfig.ProjectProgress.value = '';
        }
    }
    public returnToList(){
        // 跳转到首页
        this.router.navigate([`pipeline/pipeline-list`]);
    }
    // 附件地址
    public toFileUrl(url){
        window.open(`${environment.server}${url}`, '_blank');
    }
}