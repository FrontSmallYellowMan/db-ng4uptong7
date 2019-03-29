import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RebateService, SaveData, new_editConfigDatas} from '../../services/facturer_rebate.service';

import { WindowService } from '../../../../core';
import { dbomsPath, environment } from "environments/environment";

declare var window;

@Component({
    selector: 'rebate-scan',
    templateUrl: 'scan.component.html',
    styleUrls: [ 'scan.component.scss' ]
})

export class RebateScan implements OnInit{
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
        SalesOrganization: null
    };
    // 返款条目ID
    public rebateID: string;
    // 是否可以编辑
    public canEdit: boolean = true;

    constructor (
        private rebateService: RebateService,
        private router: Router,
        private route: ActivatedRoute,
        private windowService: WindowService
    ){
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.rebateID = params.id;

            this.canEdit = params.canEdit === 'true';

            this.initScanData(params.id)
        })
    }
    // 初始化编辑数据
    public initScanData(ID){
        this.isLoading = true;

        this.rebateService.getEditOrScanData(ID).then(data => {
            this.isLoading = false;
            
            if(data.Result){
                let response = data.Data;

                // 赋值
                for(var key in response){
                    if(this.formDataConfig[key]){
                        this.formDataConfig[key].value = response[key];
                    }
                }
                // 销售组织
                this.formDataConfig.SalesOrganization.value = response.SalesOrganizationCode + '-' + response.SalesOrganization

                // 初始化配置数据
                // this.initConfigData();
                // 个性信息
                // this.getRoleConfigData({ id: ID });
            } else{
                this.windowService.alert({ message: "查询编辑信息失败", type: "fail" });

                // 跳转到首页
                this.router.navigate([`facturer_rebate/rebate-list`]);
            }
        })
    }
    // 初始化配置数据
    public initConfigData(){
        // 销售组织
        this.rebateService.getSalesOrganization().then(data => {
            if(data.Result){
                this.configDatas.SalesOrganization = true;

                this.formDataConfig.SalesOrganization.value = this.excuteConfigToDisplay(
                    { value: this.formDataConfig.SalesOrganization.value, options:data.Data, valueKey: 'SalesOrganizationID', textKey: 'Name'});

                this.isLoading = this.isLoadingShow();
            }
        })
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
            this.rebateService.editRoleFieldConfig({ BusinessType: 'Rebate', BusinessID: data.id }).then(data => {
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
    // 去往编辑页面
    public toEditRebate(){
        this.router.navigate([`facturer_rebate/rebate-new`, { type: 'edit', id: this.rebateID }])
    }
    public returnToList(){
        // 跳转到首页
        this.router.navigate([`facturer_rebate/rebate-list`]);
    }
    // 附件地址
    public toFileUrl(url){
        window.open(`${environment.server}${url}`, '_blank');
    }
}