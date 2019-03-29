import { Component, OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';

import { WindowService } from "app/core";
import { Observable } from 'rxjs';
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";


import { Query, MaterielDataModifyService,DelDataModify } from '../../services/materiel-dataModify.service';
declare var $,window,localStorage;
@Component({
  templateUrl: './materiel-DataModify-myapply.component.html',
  styleUrls:['materiel-DataModify-myapply.component.scss','../../scss/materiel.component.scss']
})
export class MaterielDataModifyMyApplyComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  pagerData = new Pager();
  query: Query = new Query();
  delDataModify: DelDataModify = new DelDataModify();
  options;
  highSearchShow: boolean = false;//高级搜索

  isHide:boolean=true;//显示或者隐藏缺省页面或者搜索列表页面

  searchList:any;//用于存储搜索结果列表

  constructor(
    private materielDataModifyService: MaterielDataModifyService,
    private windowService:WindowService,
    private router:ActivatedRoute) { }

  // ngOnInit() { 
  //   let that=this;
  //   window.addEventListener("focus",()=>{
  //     that.initData(that.query);
  //   });

  // }

  ngOnInit() { 
    this.watchLocalStrong();//监听localStorage的状态
    }
  

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  changeWidth(){    //点击全选按钮后table宽度不变
       if(!this.fullChecked){
            $('.table-list').width($('.table-list').outerWidth());
            $('.table-list tbody tr:eq(0)').find('td').each(function(){
                $(this).width($(this).outerWidth()-16);
                console.log($(this).width())
            }); 
       }
  }
  //打开高级搜索
  openSearch(){
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch(){
    this.highSearchShow = false;
    this.reset();//但收起搜索时，清空搜索条件
  }

  getOptionList(){
    this.options = [1,2,3,4];
  }

  onTab(e){//切换选项（全部，审批中，已完成，草稿）
   let liType=document.querySelectorAll(".m-state li");

   for(let i=0;i<liType.length;i++){
     liType[i].className="";
   }
    e.target.className="active";

    switch (e.target.getAttribute("data-state")) {
      case "sAll":
        this.query.ApplicationState = "";
        break;
      case "sExamine":
        this.query.ApplicationState = "1";
        break;
      case "sFinish":
        this.query.ApplicationState = "2";
        break;
      case "sTemp":
        this.query.ApplicationState = "0"
        break;
      default:
        break;
    }

    //this.isHide = true;//显示搜索列表页 
    this.query.PageNo=1;
    this.initData(this.query);//请求数据库
  
   
  }

  search() {//点击搜索按钮的搜索
    this.query.PageNo=1;
    this.initData(this.query);
  }

  reset() {//重置搜索数据
    let nowState = this.query.ApplicationState;//保存当前处的tab状态（全部，审核中，已完成，草稿）
    this.query = new Query;
    this.query.ApplicationState = nowState;
    this.query.PageSize = 10;
  }


  deleteList(param: any) {//删除列表数据
    //console.log(param);

        // this.commonlyMaterielService.searchCommonlyMateriel(this.reqDeleteList).then(data => {        
        // });
        let callback = data => {
            if (data.success) {
                this.fullChecked = false;
                this.fullCheckedIndeterminate = false;
                this.initData(this.query);
                this.windowService.alert({ message: data.message, type: "success" });
            } else {
                this.windowService.alert({ message: data.message, type: "fail" })
            }
        }

        if (typeof param == "string") {//删除单条数据
            this.windowService.confirm({ message: "确定删除？" }).subscribe({
                next: (v) => {
                    if (v) {                    
                            this.materielDataModifyService.deleteDataModify({ "ID": param}).then(callback);
                        }
                        
                }
            });
        } else {//删除多条数据
            this.windowService.confirm({ message: `确定删除您选中的${this.checkedNum}项？` }).subscribe(v => {
                if (v) {
                  
                    let ObList = [];
                    param.filter(item => item.checked === true ).forEach(item => {
                      if(item.ApplicationState!=1){
                         ObList.push(this.materielDataModifyService.deleteDataModify({ "ID": item.ID}));
                      }else{
                        this.windowService.alert({message:"BUXUSHAN",type:"fail"});
                      }
                        
                    });
                    Observable.merge.apply(null, ObList).toPromise().then(callback);
                }
            });
        }

    }

  onChangePage(e: any) {//分页代码
        //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
        this.query.PageNo = e.pageNo;
        this.query.PageSize = e.pageSize;

        this.initData(this.query);
    }

    initData(query: Query) {//向数据库发送请求
        

        this.materielDataModifyService.searchDataModify(this.query).then(data => {
          this.fullChecked = false;
          this.fullCheckedIndeterminate = false;
          this.checkedNum = 0;
          
            //设置分页器
            this.pagerData.set(data.data.pager);
            
            //this.loading = false;      
            this.searchList = data.data.list;
            //console.log(this.searchList);
            if(this.searchList==""){//判断如果查询列表为空，则显示缺省页面
               this.isHide = false;//显示缺省页面 
            }else{
              this.isHide = true;//显示列表页面
            }
            
        });
    }

    getDetail(ID){//查看详情
      this.router.params.subscribe(params=>{//获取路由传过来的值
        window.open(dbomsPath+"mate/edit-data/"+params.id+ID);
      });
        
    }

    //监听loaclstrong，用来确认是否刷新列表页
   watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="dataMaterial"&&e.newValue.search("save")!=-1){
        that.initData(that.query);
        localStorage.removeItem('dataMaterial');
      }else if(e.key==="dataMaterial"&&e.newValue.search("submit")!=-1){
        that.initData(that.query);
        localStorage.removeItem('dataMaterial');
      }
  });
  }


}