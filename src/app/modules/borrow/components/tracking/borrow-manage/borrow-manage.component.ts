import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Http } from '@angular/http';
import { WindowService } from 'app/core';
import { Pager } from 'app/shared/index';
import { dbomsPath } from "environments/environment";
import { 
  Query,
  BorrowReturnApply
} from './../../../services/rtn-list.service';
import { UserInfo } from '../../common/borrow-entitys';
import {
  SelectOption,
  DeliveryAddress} from '../../common/borrow-entitys';

import { BorrowManageService,BorrowApplyQueryPo } from './../../../services/borrow-manage.service';
import { BorrowApply,BorrowApplyPageParam } from './../../../services/borrow-list.service';
declare var window;

@Component({
    templateUrl: './borrow-manage.component.html',
    styleUrls: ['./borrow-manage.component.scss','../../../scss/borrow-private.component.scss'],
    providers: [BorrowManageService]
})


export class TrackingBorrowComponent implements OnInit {
 
    //平台下拉框
    platforms = new Array();

    query: BorrowApplyQueryPo;//查询条件
    borrowApplyList:BorrowApplyPageParam[]=[];//借用申请列表
    loading: boolean = true;//加载中效果
    public isCreate: boolean = false;//加载中效果
    public fullChecked = false;//全选状态
    public fullCheckedIndeterminate = false;//半选状态
    pagerData = new Pager();
    borrowAttrOpts:SelectOption[]=[];//借用属性选项   
    public checkedNum = 0;
 public applyUserList: UserInfo[] = [];//展示人员信息浮动窗
     //流程状态
     public flowStatuslist: Array<any> = [{ code: 0, name: '草稿' }, { code: 1, name: '审批中' }, { code: 3, name: '已完成' }];
   constructor(http: Http, private borrowManageService: BorrowManageService, private windowService: WindowService) {

   }

    ngOnInit() {
        this.query = new BorrowApplyQueryPo();
        this.queryBorrowAttrOption();
        this.search(0);


        
    }
    
    queryBorrowAttrOption(){
            this.borrowManageService.getBorrowPageAttrOption(1).then(data=>{
                this.borrowAttrOpts=data.list;
        });
    }
    search(obj){
    if(obj==0){
    this.pagerData.pageNo=1;
    }
        // let params = new URLSearchParams();
        // params.set("pageNo", ""+this.pagerData.pageNo);
         //params.set("pageSize", ""+this.pagerData.pageSize);
       // this.query.pageNo=this.pagerData.pageNo;
        //this.query.pageSize=this.pagerData.pageSize;
         this.query.pageNo=this.pagerData.pageNo+"";
        this.query.pageSize=this.pagerData.pageSize+"";
          this.loading = true;
        //console.info("this.query=="+JSON.stringify(this.query));
        this.borrowManageService.getBorrowmanageList(this.query).then(res => {
            //console.info("ppppppppppppppppppppppppppppppp");
            //console.info("res.list==="+JSON.stringify(res.list));
            this.borrowApplyList = res.list;
              for (let item of this.borrowApplyList) {
                let user = new UserInfo();
                user.userCN = item.applyUserName;
                user.userEN = item.applyItCode.toLocaleLowerCase();
                user.userID = user.userEN;
                user.headName = item.baseDeptName;
                user.departName = item.subDeptName;
                user.platName = item.platformName;
                this.applyUserList.push(user);
              }
             //设置分页器
            this.pagerData.set(res.pager);
            //this.loading = false;
        }
        );
        this.loading = false;

         this.getStorageList();
    }
    borrowApplyExcel(){
       this.borrowManageService.borrowExcelfile(this.query);
    }

      //重置
    clearSearch(){
        this.query= new BorrowApplyQueryPo();
    }
    //每页显示条数发生变化时
    onChangePage = function (e) {
        if (this.currentPageSize != e.pageSize) {
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.search(1);
    }
   
    onFileCallBack(e){

    }
    //检查是否全选
    CheckIndeterminate(v) {
        this.fullCheckedIndeterminate = v;
    }

      //获取可用平台列表
    getStorageList(){
        this.borrowManageService.getPlatforms().then(data => {
            this.platforms = data.list;
        })
    }
    toExportCkeckedApply(){
        let ids=new Array();
       // debugger;
        for(let borrowApplyPageParam of this.borrowApplyList){
            if(borrowApplyPageParam.checked){
                ids.push(borrowApplyPageParam.applyId);
            }
        }
        if(ids.length>0){
            this.query.ids=ids.join(",");
        }
        if(this.query.ids==null){
             this.windowService.alert({ message: "请先选择需要导出的数据", type: "fail" });
        }
        this.borrowManageService.borrowExcelfile(this.query);
        this.query.ids="";
    }
    goDetail(itemId){
        window.open(dbomsPath+"borrow/approve/borrow-rc;applyId="+itemId+";applypage=-1");
    }
}