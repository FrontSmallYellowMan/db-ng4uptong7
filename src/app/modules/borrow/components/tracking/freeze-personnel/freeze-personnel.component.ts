import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import {Http} from '@angular/http';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService} from 'app/core';
import { NgForm, NgModel } from "@angular/forms";
import { environment_java,dbomsPath } from "environments/environment";
import { TrackingUndealItemsComponent } from './undeal-items/undeal-items.component';
import { FreezeAddFormComponent } from './addForm/add-form.component';
import {
    Query,
    PersonnelInfo,
    FreezePersonnelService
} from './../../../services/freeze-personnal.service';
declare var window;
export class PageNo { }
@Component({
    templateUrl: './freeze-personnel.component.html',
    styleUrls: ['../../../scss/borrow-private.component.scss']
})


export class TrackingFrozenComponent implements OnInit {

    public freezePersonnelData: PersonnelInfo[] = [];

    public query: Query;//查询条件
    public isSearch: boolean = false;//是否为搜索
    public loading: boolean = true;//加载中效果
    public isCreate: boolean = false;//加载中效果
    public fullChecked = false;//全选状态
    public fullCheckedIndeterminate = false;//半选状态
    public checkedNum = 0;
    public pagerData = new Pager();
    public person = [];//冻结人员信息
    public modalAddForm: XcModalRef;//新增财年模态框
    public modalData: XcModalRef;//excel数据分析模态框

    @ViewChildren(NgModel)
    inputList;//表单控件
    @ViewChildren('forminput')
    inputListDom;//表单控件DOM元素
    @ViewChild("form") form;

    constructor(
        private freezePersonnelService: FreezePersonnelService,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private router: Router,
        private http: Http
    ) { }
    //获取冻结人员列表
    initData(query: Query) {
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        let pagerData = this.pagerData;
        this.freezePersonnelService.getFreezeList(query).then(res => {
            // res.list = [];
            if (res.list) {
                this.freezePersonnelData = res.list;
                for (let i = 0; i < this.freezePersonnelData.length; i++) {
                    this.freezePersonnelData[i]['num'] = (pagerData.pageNo - 1) * pagerData.pageSize + (i + 1);
                }
                //设置分页器
                if (res.pager && res.pager.total) {
                    this.pagerData.set({
                        total: res.pager.total,
                        totalPages: res.pager.totalPages
                    })
                }
            }
            this.loading = false;
        })
    }
    //搜索冻结人员
    search() {
        this.isSearch = (!!this.query.keyWord);
        this.loading = true;
        this.initData(this.query);
    }

    //新建冻结弹窗
    addFreeze() {
        this.modalAddForm.show();
    }

    //检查是否全选
    CheckIndeterminate(v) {
        this.fullCheckedIndeterminate = v;
    }

    //删除选中人员
    deleteFreeze() {
        let param = this.freezePersonnelData;
        let ObList = [];
        param.filter(item => item['checked'] === true).forEach(item => {
            ObList.push(this.freezePersonnelService.deleteFreeze(item.frozenItCode));
        });
        Observable.merge.apply(null, ObList).toPromise().then(res => {
            if (res.success) {
                this.fullCheckedIndeterminate = false;
                this.fullChecked = false;
                this.onChangePage(1);                
                this.windowService.alert({ message: "操作成功", type: "success" });
            } else {
                this.windowService.alert({ message: res.message, type: "fail" })
            }
        });
    }

    //选中查看未清项
    clickFreezePersonnel(item) {
        //console.log("frozenItCode==="+item.frozenItCode);
        this.http.get(environment_java.server + "borrow/unclear-item/" + item.frozenItCode + "/itcode").toPromise()
            .then(res => {
                let data = res.json();
                if (data.success) {
                    if (data.list.length > 0) {
                        window.open(dbomsPath+"borrow/tracking/freeze-items;id=" + item['frozenItCode']);
                       // this.router.navigate(['/borrow/tracking/freeze-items', item['frozenItCode']]);
                    } else {
                        this.windowService.alert({ message: "该冻结人员没有未清项", type: 'fail' });
                    }
                }

            })
    }
    operator(item, valid) {
        this.freezePersonnelService.getExemptOperate(item.frozenItCode, valid).then(res => {
            if (res.success) {
                item.freeResult = valid;
                this.windowService.alert({ message: "操作成功", type: "success" });
            } else {
                this.windowService.alert({ message: res.message, type: "fail" })
            }
        })
    }
    //豁免操作，豁免0，不豁免1
    exempt(item) {
        if (item.freeResult != 0) {
            this.operator(item, 0);
        }
    }
    //不豁免
    unexempt(item) {
        if (item.freeResult != 1) {
            this.operator(item, 1);
        }
    }

    ngOnInit() {
        this.query = new Query();
        //在初始化的时候 创建模型
        this.modalAddForm = this.xcModalService.createModal(FreezeAddFormComponent);
        //模型关闭的时候 如果有改动，请求刷新
        this.modalAddForm.onHide().subscribe((data) => {
            if (data) {
                //refresh
                this.initData(this.query);
            }
        })

    }

    public currentPageSize;//当前每页显示条数
    onChangePage(e: any) {
        if(e !=1){
            //非第一页，切换条数。跳为第一页
            if (this.currentPageSize != e.pageSize) {
                this.pagerData.pageNo = 1;
            }
            this.currentPageSize = e.pageSize

            this.query.keyWord = this.query.keyWord || "";
            this.query.pageNo = e.pageNo;
            this.query.pageSize = e.pageSize;
            this.initData(this.query);
        }else{
            this.pagerData.pageNo = 1;
            this.currentPageSize = 10;
            this.query.keyWord = this.query.keyWord || "";
            this.query.pageNo = 1;
            this.query.pageSize = 10;
            this.initData(this.query);
        }
    }

}
