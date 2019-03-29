import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Http } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { BorrowAmountBusinessScope, BorrowAmount } from './../../limit';
import { LimitManageService } from './../../../services/limit-manage.service';
import { PlatformModalDataComponent } from './../platform-inventory/modalData/modal-data.component';
import { dbomsPath} from "environments/environment";
declare var window;
declare var location;
@Component({
    templateUrl: './limit-manage.component.html',
    styleUrls: ['./limit-manage.component.scss', '../../../scss/borrow-private.component.scss'],
    providers: [LimitManageService]
})
export class TrackingLimitComponent implements OnInit {
    currentPageSize: string;
    bbmc: string;
    sybmc: string;
    public pagerData = new Pager();
    limitData: BorrowAmount[];
    loading: boolean = true;//加载中效果
    modalData: XcModalRef;//excel数据分析模态框
    fileUploadApi: string;//上传文件接口
    constructor(private manageService: LimitManageService, private windowService: WindowService, private xcModalService: XcModalService, private http: Http) { }
    ngOnInit() {

        this.fileUploadApi = this.manageService.analysisLimitData();
        this.modalData = this.xcModalService.createModal(PlatformModalDataComponent);
        this.modalData.onHide().subscribe((data) => {
            if (data) {
                this.search();
            }
        })


    }
    search() {
        let params = new URLSearchParams();
        params.set("pageNo", "" + 1);
        params.set("pageSize", "" + this.pagerData.pageSize);
        params.set("subdeptName", this.sybmc);
        params.set("basedeptName", this.bbmc);
        this.loading = true;
        this.manageService.getLimitmanageList(params).then(res => {
            if (res.list) {
                this.limitData = res.list;
                for (let i = 0; i < this.limitData.length; i++) {
                    this.limitData[i].num = (this.pagerData.pageNo - 1) * this.pagerData.pageSize + (i + 1);
                    this.limitData[i].usedAmount=parseFloat((this.limitData[i].usedAmount*10000).toFixed(2));
                }
            }
            if (res.pager && res.pager.total) {
                this.pagerData.set({
                    total: res.pager.total,
                    totalPages: res.pager.totalPages
                })
            }
        }
        );
        this.loading = false;
    }
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search();
    }
    //重置
    clearSearch() {
        this.bbmc = "";
        this.sybmc = "";
    }
    /**
     * 数据回传显示
     * @param data 
     */
    onFileCallBack(data) {
        if (data.success) {
            data.item.impType = "2";//是否可这样添加属性？
            console.log(data.item);//dataList
            this.modalData.show(data.item);
        } else {
            this.windowService.alert({ message: data.message, type: 'fail' });
        }
    }
    /**
     * 下载导入数据的模板
     */
    loadLimitDataTpl() {
        window.location.href = this.manageService.loadLimitDataTpl();
    }
    deleteApply(batId){
        //判断该申请单下是否发起过借用的流程
        this.manageService.isBorrowAmountUsed(batId).then(data=>{
            if(data.success){
                //删除申请单
                this.manageService.deleteBorrowAmountApply(batId).then(data=>{
                    if(data.success){
                        this.search();
                        this.windowService.alert({ message: "操作成功", type: "success" });
                    }else{
                        this.windowService.alert({message:data.message,type:'fail'});
                    }
                })
            }else{
                this.windowService.alert({message:data.message,type:'fail'});
            }
        })
    }
    goDetail(itemId){
        window.open(dbomsPath+"borrow/tracking/tracking-look;itemid="+itemId);
    }
    editForm(itemId){
        window.open(dbomsPath+"borrow/tracking/tracking-new;flag=e;itemid="+itemId);
    }
     newApply() {
        window.open(dbomsPath + "borrow/tracking/tracking-new;flag=n");
    }
}