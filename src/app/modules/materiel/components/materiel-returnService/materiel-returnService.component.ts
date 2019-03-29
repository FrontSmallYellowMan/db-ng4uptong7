import { Component, OnInit, OnDestroy,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ReqData,ReqSearchData,ReqDeleteList,ReqEditMateriel,CommonlyMaterielAndReturnService } from "../../services/materiel-commonlyMateriel&return.service";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from "app/core";
import { Observable } from 'rxjs';
import { dbomsPath } from "environments/environment";
declare var $,window,localStorage;
@Component({
    selector: 'm-rs',
    templateUrl: 'materiel-returnService.component.html',
    styleUrls:['materiel-returnService.component.scss','../../scss/materiel.component.scss']
})

export class ReturnServiceComponent implements OnInit {


    reqData: ReqData = new ReqData();
    reqSearchData: ReqSearchData = new ReqSearchData();
    reqDeleteList: ReqDeleteList = new ReqDeleteList();
    reqEditMateriel: ReqEditMateriel = new ReqEditMateriel();

    searchList:any;//存储搜索到的数据
    
    pagerData: any = new Pager();
    editId: string;
    fullChecked = false;
    fullCheckedIndeterminate = false;
    checkedNum = 0;

    isHide=true;//是否显示搜索结果，默认不显示
    isOnSearch:boolean=false;//是否点击“搜索”按钮

    constructor(
        private windowService: WindowService,
        private returnService:CommonlyMaterielAndReturnService,
        private router:Router) { }


    //监听loaclstrong，用来确认是否刷新列表页
   watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="returnMaterial"&&e.newValue.search("save")!=-1){//如果有新提交的扩展物料申请
        that.initData(that.reqSearchData);
        localStorage.removeItem('returnMaterial');
      }
  });
  }

    CheckIndeterminate(e) {//检查是否全选
        this.fullCheckedIndeterminate = e;
    }
    
    search() {//搜索
        
        //this.isHide = true;//隐藏缺省页面 
        this.reqSearchData.ApplyType = 2;
        this.reqSearchData.PageNo = 1;

        // if(this.reqSearchData.BeginDate!=""){
        //     this.reqSearchData.BeginDate= new Date(this.reqSearchData.BeginDate).toLocaleDateString();           
        // }

        // if(this.reqSearchData.EndDate!=""){
        // this.reqSearchData.EndDate=new Date(this.reqSearchData.EndDate).toLocaleDateString();       
        // }

        this.initData(this.reqSearchData);
        //console.log(this.reqSearchData);

    }

    reset(){//重置
      this.reqSearchData=new ReqSearchData;
      this.reqSearchData.PageSize=10;
    }

    changeWidth(){    //点击全选按钮后table宽度不变
       if(!this.fullChecked){
            $('.table-list').width($('.table-list').outerWidth());
            $('.table-list tbody tr:eq(0)').find('td').each(function(){
                $(this).width($(this).outerWidth()-16);
            }); 
       }
    }
    deleteList(param: any) {//删除列表数据

        // this.commonlyMaterielService.searchCommonlyMateriel(this.reqDeleteList).then(data => {        
        // });
        let callback = data => {
            if (data.success) {
                this.fullChecked = false;
                this.fullCheckedIndeterminate = false;
                this.initData(this.reqSearchData);
                this.windowService.alert({ message: data.message, type: "success" });
            } else {
                this.windowService.alert({ message: data.message, type: "fail" })
            }
        }

        if (typeof param == "string") {//删除单条数据
            this.windowService.confirm({ message: "确定删除？" }).subscribe({
                next: (v) => {
                    if (v) {
                        this.returnService.deleteListElement({ "MaterialRecordID": param, "ApplyType": 2 }).then(callback);
                    }
                }
            });
        } else {//删除多条数据
            this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
                if (v) {
                    let ObList = [];
                    param.filter(item => item.checked === true).forEach(item => {
                        ObList.push(this.returnService.deleteListElement({ "MaterialRecordID": item.MaterialRecordID, "ApplyType": 2 }));
                    });
                    Observable.merge.apply(null, ObList).toPromise().then(callback);
                }
            });
        }

    }

    goToNewReturnService(){
     window.open(dbomsPath+"mate/edit-nrs/"+0);
    }

    editMateriel(MaterialRecordID,InfoStatus){//编辑返款服务              
      if(InfoStatus!=1){
        window.open(dbomsPath+"mate/edit-nrs/"+MaterialRecordID);
        }else{
          window.open(dbomsPath+"mate/edit-srs/"+MaterialRecordID);
        }   
    }

    onChangePage(e: any) {//分页代码
        //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
        this.reqSearchData.PageNo = e.pageNo;
        this.reqSearchData.PageSize = e.pageSize;

        this.initData(this.reqSearchData);
    }

    initData(reqSearchData: ReqSearchData) {//向数据库发送请求
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.checkedNum = 0;

        this.reqSearchData.ApplyType=2;
        this.returnService.searchCommonlyMateriel(this.reqSearchData).then(data => {

            //设置分页器
            this.pagerData.set(data.data.pager);
            //this.loading = false;      
            this.searchList = data.data.list;
            console.log(this.searchList);
            if(this.searchList==""){//判断如果查询列表为空，则显示缺省页面
               this.isHide = false;//显示缺省页面 
            }else{
                this.isHide = true;
            }
            
        });
    }

    @ViewChild('form') public form: NgForm;

    // ngOnInit() { 
    //       let that=this;
    //       window.addEventListener('focus',function(){//当页面获得焦点是刷新数据
    //            that.initData(that.reqSearchData);
    //       });

    // }

    ngOnInit() { 
      this.watchLocalStrong();//监听localstorage的状态          
    }
}