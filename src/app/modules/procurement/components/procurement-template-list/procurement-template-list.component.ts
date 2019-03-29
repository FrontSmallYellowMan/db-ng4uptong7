import { Component,OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import { dbomsPath } from "environments/environment";

import { 
  Query,
  ProcurementTplObj,
  ProcurementTemplateService
} from './../../services/procurement-template.service';


@Component({
  templateUrl: 'procurement-template-list.component.html',
  styleUrls: ['procurement-template-list.component.scss','./../../scss/procurement.scss']
})
export class ProcurementTemplateList implements OnInit { 
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;
  pagerData = new Pager();

  procurementTplList: ProcurementTplObj[] = [];

  loading: boolean = true;//加载中效果

  constructor(
    private procurementTemplateService: ProcurementTemplateService,
    private windowService:WindowService,
    private dbHttp: HttpServer) {
  }

  ngOnInit(){
    this.query = new Query();
    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers:headers });
    this.dbHttp.get("base/GetCurrentUserInfo",options).subscribe(data => {//获取登录人信息
      if (data.Result) {
          let loginData = JSON.parse(data.Data);
          this.query.SYB = loginData.SYBMC;//事业部名称
          this.initData(this.query);
      }
  })

  this.watchLocalStrong();//监听storage的值，判断是否刷新列表
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.PageIndex = e.pageNo;
    this.query.PageSize = e.pageSize;
    if(this.query.SYB){
      this.initData(this.query);
    }
  }

  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;
    this.procurementTemplateService.getProcurementTplList(query).then(data => {
      this.procurementTplList = JSON.parse(data.Data.pagedata);
      console.log(this.procurementTplList);
      //设置分页器
      this.pagerData.pageNo=data.Data.pager.pageNo;//当前页
      this.pagerData.total=data.Data.pager.total;//总条数
      this.pagerData.totalPages=data.Data.pager.totalPages;//总页数
      this.loading = false;
    })
  }
  //新建
  addProcurementTpl(){
    window.open(dbomsPath+'procurement/procurementTpl-edit');
  }

  //编辑
  editProcurementTpl(sn: string){
    window.open(dbomsPath+'procurement/procurementTpl-edit/' + sn);
  }

  //删除
  deleteTpl(param: any){
    let listLength=this.procurementTplList.length;//记录当前页的条数
    let callback = data => {
      if(data.Result){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        if(!(listLength-this.checkedNum)){//如果删除后 当前页没有内容 则跳转到第一页
          this.query.PageIndex=1;
        }
        this.initData(this.query);
        this.windowService.alert({message:"删除成功",type:"success"});
      }else{
        this.windowService.alert({message:"删除失败",type:"fail"})
      }
    }

    if(typeof param == "string"){//删除单条数据
      this.checkedNum=1;
      this.windowService.confirm({message:"确定删除？"}).subscribe({
        next: (v) => {
          if(v){
            this.procurementTemplateService.delProcurementTplList([param]).then(callback);
          }
        }
      });
    }else{//删除多条数据
      this.windowService.confirm({message:`确定删除您选中的${this.checkedNum}项？`}).subscribe(v => {
        if(v){
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            ObList.push(this.procurementTemplateService.delProcurementTplList(item.ID));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
        }
      })
    }
  }

   //监听loaclstrong，用来确认是否刷新列表页
 watchLocalStrong(){
  let that=this;
  window.addEventListener("storage", function (e) {//监听localstorage
    console.log(e.newValue,e);
     if(e.key==="procurement-template"&&e.newValue.search("save")!=-1){
      that.initData(that.query);
      localStorage.removeItem('procurement-template');
    }
});
}

}