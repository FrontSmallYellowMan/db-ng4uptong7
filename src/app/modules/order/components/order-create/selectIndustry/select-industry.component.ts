import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

export class PageNo { }
import {
    IndustryInfo,
    OrderCreateService
} from './../../../services/order-create.service';

@Component({
    templateUrl: './select-industry.component.html',
    styleUrls: ['./select-industry.component.scss']
})
export class SelecteIndustryComponent implements OnInit{
    public modal:XcModalRef;
    public loading: boolean = true;//加载中
    public submitOnce: boolean;
    public pagerData = new Pager();
    public industryAllList: IndustryInfo[] = [];//部门行业列表数据
    public industryList: IndustryInfo[] = [];//部门行业筛选列表数据
    public keyWord;//

    constructor(
        private router: Router,
        private routerInfo: ActivatedRoute,
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderCreateService: OrderCreateService
    ){}

    ngOnInit(){

        //获得弹出框自身
        this.modal = this.xcModalService.getInstance(this);

        this.modal.onShow().subscribe((data) => {
            if(data){
                this.industryAllList = data;
                this.industryList = data;
            }
        })
    }

    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }

    search(){
        let keyword = this.keyWord;
        let searchList = this.industryAllList.filter(function(item){
            if(item.IndustryName.indexOf(keyword) != -1 ){
                return true;
            }
            if(item.ProjectIndustryID.indexOf(keyword) != -1){
                return true;
            }
        });
        console.info(searchList);
        this.industryList = searchList;
    }

    selected(sel){
        if(sel.checked){
            this.industryList.forEach(function(item,i){
                item.checked = false;
            })
            sel.checked = true;
        }
    }

    //保存数据
    save(e?){
        let selectedList = this.industryList.filter(item => item.checked == true);
        if(selectedList.length>0){
            this.hide(selectedList[0]);
        }
    }

}
