import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { Observable } from 'rxjs';
import { EditMaterielApplyTemplateComponent } from "../edit-materiel-applyTemplate/edit-materiel-applyTemplate.component";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { ReqSearchData,ReqSeeTemplate,ReqData,ReqDelTemplate,MaterielTemplateService } from "../../services/materiel-template.service";



declare var $;

@Component({
    templateUrl: 'materiel-applyTemplate.component.html',
    styleUrls:['materiel-applyTemplate.scss','../../scss/materiel.component.scss']
})

export class MaterielApplyTemplateComponent implements OnInit {
    
    reqData: ReqData = new ReqData();
    reqSearchData: ReqSearchData = new ReqSearchData();//声明ReqSearchData类型数据，用来发送搜索请求数据
    reqSeeTemplate:ReqSeeTemplate = new ReqSeeTemplate();//查看模版请求数据
    reqDelTemplate:ReqDelTemplate = new ReqDelTemplate();//删除模板请求数据
    

    //id: string;
    pagerData: any = new Pager();
    editId: string;
    listShow: any;
    modal: XcModalRef;
    fullChecked = false;
    fullCheckedIndeterminate = false;
    checkedNum = 0;

    searchList:any;//保存搜索数据
    //seeTemplate:any;//保存返回的查看物料申请模版详情数据

    isShowMaterielTemplate: boolean = true;

    isSearch: boolean = false;//是否点击搜索按钮
    isHide: boolean = true;//是否隐藏默认缺省页面或者搜索结果页

    constructor(        
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private materielTemplateService:MaterielTemplateService) { }
        
     

@ViewChild('form') public form: NgForm;


ngOnInit() {

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(EditMaterielApplyTemplateComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
        if (data) {
            this.initData(this.reqSearchData);
        }
    })


}

    CheckIndeterminate(e){//检查是否全选

         this.fullCheckedIndeterminate=e;

    }

    search() {//按条件搜索内容

         //this.isSearch=true;
         //this.isHide=true;
        this.reqSearchData.PageNo="1";
             //this.pagerData.pageNo="1";//每次搜索重置页码为“1”
             this.initData(this.reqSearchData);
                       
     }
    changeWidth(){    //点击全选按钮后table宽度不变
       if(!this.fullChecked){
            $('.table-list').width($('.table-list').outerWidth());
            $('.table-list tbody tr:eq(0)').find('td').each(function(){
                $(this).width($(this).outerWidth()-16);
            }); 
       }
    }
    onChangePage(e: any) {
        this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
        this.reqSearchData.PageNo = e.pageNo;
        this.reqSearchData.PageSize = e.pageSize;

        this.initData(this.reqSearchData);
    }

  initData(reqSearchData: ReqSearchData){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.materielTemplateService.searchTemplate(this.reqSearchData).then(data => {
    //设置分页器
      this.pagerData.set(data.data.pager);
      //this.loading = false;      
        //console.log(data.data.list); 
        if(data.data.list.length!=0){
          this.searchList=data.data.list;
          console.log(this.searchList);
          this.isHide=true;
        }else{
          this.isHide=false;
        }
        
            });
  }

    editClick(TemplateID) {//编辑物料申请模板
         this.reqSeeTemplate.TemplateID = TemplateID;//获取模板ID
            //请求数据库
            this.materielTemplateService.seeTemplate(this.reqSeeTemplate).then(result => {
                // console.log(result.data.list[0]);
                this.modal.show({data:result.data.list[0],state:true});//显示弹出框

            });
    }

    showMaterielTemplate(TemplateID,e){//查看物料模板

            this.reqSeeTemplate.TemplateID = TemplateID;//获取模板ID
            //请求数据库
            this.materielTemplateService.seeTemplate(this.reqSeeTemplate).then(result => {
                //console.log(result.data.list[0]);
                this.modal.show({data:result.data.list[0],state:false});//显示弹出框

            });  

    }

    addClick() {//新建物料申请模板
        this.editId = "";
        this.modal.show();
    }


    deleteTemplate(param: any) {//删除物料模板
        
        let callback = data => {
            if (data.success) {
                this.fullChecked = false;
                this.fullCheckedIndeterminate = false;
                this.reqSearchData.PageNo="1";
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
                        this.materielTemplateService.deleteTemplate({"TemplateID":param}).then(callback);
                    }
                }
            });
        } else {//删除多条数据
            this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
                if (v) {
                    let ObList = [];
                    param.filter(item => item.checked === true).forEach(item => {
                        ObList.push(this.materielTemplateService.deleteTemplate({"TemplateID":item.TemplateID}));
                    });
                    Observable.merge.apply(null, ObList).toPromise().then(callback);
                }
            })
        }
    }

    
    

}