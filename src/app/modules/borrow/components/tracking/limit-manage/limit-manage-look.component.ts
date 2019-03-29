import { Component, OnInit } from '@angular/core';
import { LimitManageService } from './../../../services/limit-manage.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { WindowService } from 'app/core';
import { BorrowAmountBusinessScope, BorrowAmount, LimitUsedLog } from './../../limit';
import { Person } from 'app/shared/services/index';
declare var window;
@Component({
    templateUrl: './limit-manage-look.component.html',
    styleUrls: ['./limit-manage-look.component.scss'],
    providers: [LimitManageService]
})
export class LimitManageLookComponent implements OnInit {
    mainData: BorrowAmount = new BorrowAmount();
    subData: BorrowAmountBusinessScope[];
    applyId: string;
    logList: LimitUsedLog[] = [];
    userInfo = new Person();//申请人
    isShow: boolean = false;//默认隐藏
    constructor(private manageService: LimitManageService, private route: ActivatedRoute, private location: Location, private windowService: WindowService) { }
    ngOnInit() {
        this.route.params.subscribe(params => this.applyId = params["itemid"]);
        this.manageService.queryLimitManageInfo(this.applyId).then(data => {

            this.mainData = data.applyData.mainData;
            // this.userInfo.userEN = this.mainData.applyItCode.toLocaleLowerCase();
            // this.userInfo.userID =  this.userInfo.userEN;
            // this.userInfo.userCN = this.mainData.applyUserName;
            // this.notchange = true;
            this.mainData.usedAmount = parseFloat((this.mainData.usedAmount * 10000).toFixed(2));
            this.subData = data.applyData.subData;
            //查询额度使用记录
            this.manageService.queryDeptAmountUsedLog(this.mainData.baseDeptName, this.mainData.deptName, this.mainData.applyDimension === '0').then(data => {
                if (data.success) {
                    this.logList = data.list;
                    for (let item of this.logList) {
                        item.applyAmount = parseFloat((item.applyAmount * 10000).toFixed(2));
                    }
                }

            })
        });

    }
    goBack() {
        //this.location.back();
        window.close();
    }
    toggle() {
        this.isShow = !this.isShow;
    }
}