import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { RebateService, QueryData } from '../../services/facturer_rebate.service';

import { RebateInfo } from '../facturer_rebate-info/info.component';

import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { WindowService } from '../../../../core';

declare var $, window, URL, document, Blob;

@Component({
    selector: 'rebate-list',
    templateUrl: 'list.component.html',
    styleUrls: ['list.component.scss']
})

export class RebateList implements OnInit, OnDestroy {
    @ViewChild('form') form: NgForm;

    // 初始化分页
    public PageData = new Pager();
    // 初始化弹窗
    public infoModal: XcModalRef;
    // 查询数据
    public searchData = new QueryData();
    // 查询选择
    public checkboxes: any = [
        {
            text: '未占用',
            field: 'No',
            isChecked: false
        },
        {
            text: '部分占用',
            field: 'Part',
            isChecked: false
        },
        {
            text: '全部占用',
            field: 'All',
            isChecked: false
        }
    ]; // 多选框
    // 表头配置
    public tableConfig: any = [
        { title: '序号', field: 'ProjectNo', value: '', width: '5%' },
        { title: '销售组织', field: 'SalesOrganization', value: '', width: '12%' },
        { title: '厂商名称', field: 'FactoryName', value: '', width: '12%' },
        { title: '代理商名称', field: 'AgentName', value: '', width: '13%' },
        { title: '激励编号', field: 'IncentiveNumber', value: '', width: '10%' },
        { title: '返款金额', field: 'RefundAmount', value: '', width: '9%' },
        { title: '已占用金额', field: 'PreAmount', value: '', width: '9%' },
        { title: '剩余金额', field: 'AvailableAmount', value: '', width: '9%' },
        { title: '创建日期', field: 'CreateTime', value: '', width: '8%' },
        { title: '创建人', field: 'CreateName', value: '', width: '8%' }
    ];

    // 表格数据
    public listData: any = [];
    // 是否显示表格
    public isDisplay: boolean;
    // 是否正在加载
    public isLoading: boolean;
    // 是否展示搜索
    public highSearchShow: boolean = false;
    // 是否全选
    public fullChecked: boolean = false;
    // 是否部分选择
    public fullCheckedIndeterminate: boolean = false;
    // 选择个数
    public checkedNum: any;
    // 上传文件的地址
    public uploadUrl = 'api/RefundManage/UploadRefundRequisition';
    // 个人信息
    public roleInfo: any;
    // 权限
    public authority: any;
    // 是否第一次加载
    public isInit: boolean = true;
    // 触发搜索条件校验
    public isSearch: boolean = false;


    constructor(
        private router: Router,
        private rebateService: RebateService,
        private xcModalService: XcModalService,
        private windowService: WindowService
    ) { }

    ngOnInit() {
        this.isLoading = true;

        // 获取个人信息
        this.roleInfo = JSON.parse(window.localStorage.UserInfo);

        // 初始化
        this.rebateService.getAuthority().then(data => {
            if (data.Result) {
                // 赋值权限
                this.authority = data.Data;
                // 加入数据
                this.searchNewList(false);
            } else {
                this.windowService.alert({ message: "请检查网络连接", type: "fail" });
            }
        });

        // 初始化弹窗
        this.infoModal = this.xcModalService.createModal(
            RebateInfo
        );
    }

    ngOnDestroy() {
    }

    /**
     * 查询数据
     * @param postData 查询条件
     * @param needValidate 是否需要校验查询条件
     */
    public searchRebate(postData, needValidate) {
        // 未获取到权限
        if (this.authority === undefined) {
            return;
        }
        // 触发校验条件
        this.isSearch = needValidate;

        // 查询条件的校验及权限的校验
        if ((needValidate && this.excuteSearchWithPower())) {
            // 遮罩消失
            this.isLoading = false;

            return;
        }
        // 无权限第一次加载，不显示
        if (!this.authority && this.isInit) {
            // 遮罩消失
            this.isLoading = false;

            this.isInit = false;

            return;
        }

        // 处理多选框传值
        let _postData = this.excuteSearchCheckBox(postData);

        this.rebateService.getRebateList(_postData).then(data => {
            if (data.Result) {
                // 遮罩消失
                this.isLoading = false;

                const result = data.Data;

                // 更改分页
                this.PageData.set({
                    pageNo: result.CurrentPage,
                    pageSize: result.PageSize,
                    totalPages: Math.ceil(result.TotalCount / result.PageSize),
                    total: result.TotalCount
                });
                // 是否显示表格
                this.isDisplay = result.List.length > 0;

                // 更改列表数据
                this.listData = this.excuteListNo(result, 'ProjectNo');
            }
        })
    }
    // 处理权限和查询条件的关系
    public excuteSearchWithPower() {
        // 查询条件不能为空
        if (!this.form.invalid) {
            return false;
        } else {
            this.windowService.alert({ message: "请填写客户名称/销售组织", type: "fail" });

            return true;
        }
    }
    /**
     * 处理列表的序号（顺便处理列表中销售组织展示）
     * @param data 数据包含分页
     * @param NoField 序号对应的字段 
     */
    public excuteListNo(data, NoField) {
        let result = data;
        // 列表存在
        if (result.List.length) {
            for (let i = 0; i < result.List.length; i++) {
                result.List[i][NoField] = i + 1 + result.PageSize * (result.CurrentPage - 1);
                // 处理销售组织的展示
                result.List[i]['SalesOrganization'] =  result.List[i]['SalesOrganizationCode'] + '-' + result.List[i]['SalesOrganization'];
            }
        }

        return result.List;
    }
    /**
     * 处理多选框传值
     * @param postData 发送数据
     */
    public excuteSearchCheckBox(postData) {
        let result = postData.Search;

        for (let i = 0; i < this.checkboxes.length; i++) {
            result[this.checkboxes[i].field] = this.checkboxes[i].isChecked;
        }

        postData.Search = result;

        return postData;
    }

    // 跳转到新增页面
    public toNewRebate() {
        // window.open(dbomsPath + 'rebate/rebate-new/new', '_self');
        this.router.navigate([`facturer_rebate/rebate-new`, { type: 'new', id: '' }])
    }
    // 下载模板
    public downloadTemplate() {
        window.open(`${dbomsPath}assets/downloadtpl/返款模板.xlsx`);
    }
    // 导入返款 回调
    public fileUploadSuccess(e) {

        if (e.Result) { // 导入成功
            this.windowService.alert({ message: "导入成功", type: "success" });

            this.searchNewList(false);
        } else {
            if (Object.prototype.toString.call(e.Data).slice(8, -1) === 'Array' && e.Data.length) {
                this.infoModal.show(e.Data);
            } else {
                this.windowService.alert({ message: "导入失败，请重试或检查模板是否正确", type: "fail" });
            }
        }
    }
    // 查询
    /**
     * 
     * @param needValidate 是否需要校验
     */
    public searchNewList(needValidate) {
        // 更改分页
        this.searchData.PageIndex = 1;
        // 返款范围必须正确输入
        if (this.searchData.AmountBegin > this.searchData.AmountEnd && this.searchData.AmountEnd !== '' && this.searchData.AmountBegin !== '') {
            this.windowService.alert({ message: "返款范围后者必须大于等于前者", type: "fail" })

            return;
        }

        // 搜索
        this.searchRebate(this.searchData, needValidate);
    }

    /**
     * 删除
     * @param list 删除的列表
     */
    public deleteList(list) {
        let result = [];

        if (list && list.length) {
            list.filter(item => item.checked === true).forEach(item => {
                result.push(item.ID);
            });
        }

        this.rebateService.deleteRebate(result).then(data => {
            if (data.Result) {
                this.searchNewList(false);
            } else {
                this.windowService.alert({ message: "删除失败，请重试或检查网络连接", type: "fail" });
            }
        })
    }
    // 导出当前列表
    public exportList() {
        this.isLoading = true;

        this.rebateService.exportRebateList(this.searchData).then(data => {
            this.isLoading = false;

            let blob = new Blob([data], { type: "application/vnd.ms-excel" });
            
            if (this.rebateService.isIE()) {
                window.navigator.msSaveBlob(blob, "rebateList.xls");
            } else {
                let objectUrl = URL.createObjectURL(blob);

                let a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display:none');
                a.setAttribute('href', objectUrl);
                a.setAttribute('download', '返款列表');
                a.click();
                URL.revokeObjectURL(objectUrl);
            }
        });
    }
    //检查是否全选
    public checkIndeterminate(e) {
        this.fullCheckedIndeterminate = e;
    }
    //点击全选按钮后table宽度不变
    public changeWidth() {
        $(".table-list").width($(".table-list").outerWidth());

        $(".table-list tbody tr:eq(0)")
            .find("td")
            .each(function () {
                $(this).width($(this).outerWidth() - 16);
            });
    }
    // 查询条件重置
    public resetSearch() {
        for (let key in this.searchData) {
            if (key === 'Search') { // 多选重置
                this.checkboxes.forEach(item => {
                    item.isChecked = false;
                });
            } else {
                this.searchData[key] = '';
            }
        }

        this.searchData.PageIndex = 1;
        this.searchData.PageSize = 10;
    }
    // 跳转到查看或者编辑页面
    public editOrScan(ID = '') {
        // 先跳转到查看界面，然后由查看决定是否需要跳转到编辑        
        this.router.navigate([`facturer_rebate/rebate-scan`, { id: ID, canEdit: this.authority }])
    }

    public pagerChange(e) {
        // 更改分页
        this.searchData.PageIndex = e._pageNo;
        this.searchData.PageSize = e._pageSize;
        // 搜索
        this.searchRebate(this.searchData, false);
    }
}