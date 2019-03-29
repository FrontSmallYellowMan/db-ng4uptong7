import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PipelineService, QueryData } from '../../services/pipeline.service';
import { Subscription } from 'rxjs'; 

import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";

declare var window;

@Component({
    selector: 'pipeline-list',
    templateUrl: 'list.component.html',
    styleUrls: [ 'list.component.scss' ]
})

export class PipelineList implements OnInit, OnDestroy{
    // 初始化分页
    public PageData = new Pager();
    // 查询数据
    public searchData = new QueryData();
    // 表头配置
    public tableConfig : any = [ 
        { title: '项目编号', field: 'ProjectNo', value: '' }, 
        { title: '项目名称', field: 'ProjectName', value: '' }, 
        { title: '客户名称', field: 'CustomName', value: '' }, 
        { title: '项目金额', field: 'ProjectAmount', value: '' }, 
        { title: '销售员', field: 'SellerName', value: '' },
        { title: '预计签约时间', field: 'PreSignDate', value: '' },
        { title: '更新时间', field: 'UpdateTime', value: '' },
        { title: '项目进度', field: 'ProjectProgress', value: '' }
    ];

    // 表格数据
    public listData : any = [];
    // 是否显示表格
    public isDisplay: boolean;
    // 是否正在加载
    public isLoading: boolean;
    // 是否展示搜索
    public highSearchShow: boolean = false;

    constructor (
        private router: Router,
        private pipelineService: PipelineService
    ){    }

    ngOnInit() {
        this.isLoading =true;
        // 初始化
        this.PageData.set({ pageNo: 1, pageSize: 20 });
    }

    ngOnDestroy(){
    }

    // 查询数据
    public searchPipeline(postData){
        this.pipelineService.getPipelineList(postData).then(data => {
            if(data.Result){
                // 遮罩消失
                this.isLoading = false;

                const result = data.Data;

                // 更改分页
                this.PageData.set({ pageNo: result.CurrentPage, pageSize: result.PageSize, totalPages: Math.ceil(result.TotalCount/result.PageSize) });
                // 是否显示表格
                this.isDisplay = result.List.length > 0;

                // 更改列表数据
                this.listData = result.List;
            }
        })
    }

    // 跳转到新增页面
    public toNewPipeline(){
        // window.open(dbomsPath + 'pipeline/pipeline-new/new', '_self');
        this.router.navigate([`pipeline/pipeline-new`, { type: 'new', id: '' }])
    }
    // 查询
    public searchNewList(){
        // 更改分页
        this.searchData.PageIndex = 1;
        // 搜索
        this.searchPipeline(this.searchData);
    }
    // 查询条件重置
    public resetSearch(){
        for(let key in this.searchData){
            this.searchData[key] = '';
        }
    }
    // 跳转到查看或者编辑页面
    public editOrScan(ProjectState = 5, ID = ''){
        let state: any = Number(ProjectState);

        if(state !== 4 || state !== 5){
            // window.open(dbomsPath + 'pipeline/pipeline-new/edit', '_self');
            this.router.navigate([`pipeline/pipeline-new`, { type: 'edit', id: ID }])
        } else{
            // window.open(dbomsPath + 'pipeline/pipeline-scan', '_self');
            this.router.navigate([`pipeline/pipeline-scan`, { id: ID }])
        }
    }

    public pagerChange(e){
        // 更改分页
        this.searchData.PageIndex = e._pageNo;
        this.searchData.PageSize = e._pageSize;
        // 搜索
        this.searchPipeline(this.searchData);
    }
}