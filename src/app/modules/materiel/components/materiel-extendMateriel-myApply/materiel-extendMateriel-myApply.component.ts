import { Component,OnInit } from '@angular/core';
import { Pager } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';

import { dbomsPath } from "environments/environment";

declare var window;

import { 
  Query,
  MaterielInfo,
  MaterielExtendMaterielService,ApproveData
} from '../../services/materiel-extendMateriel.service';


@Component({
  selector:'m-em-apply',
  templateUrl: 'materiel-extendMateriel-myApply.component.html',
  styleUrls: ['materiel-extendMateriel-myApply.component.scss','../../scss/materiel.component.scss']
})
export class ExtendMaterielMyApplyComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;
  pagerData = new Pager();

  approveData:ApproveData=new ApproveData();

  highSearchShow: boolean = false;//高级搜索

  materielList: MaterielInfo[] = [];

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  constructor(
    private materielExtendMaterielService: MaterielExtendMaterielService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    this.query = new Query();
    this.watchLocalStrong();//监听localStorage的变化
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.PageNo = e.pageNo;
    this.query.PageSize = e.pageSize;

    this.initData(this.query);
  }

  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.materielExtendMaterielService.getMaterielList(query).then(result => {
      this.materielList = result.data.list;
      //设置分页器
      this.pagerData.set(result.data.pager);
      this.loading = false;
    })
  }

  //搜索
  search(){
    let startDate = this.query.BeginDate,
        endDate = this.query.EndDate;

    if(!!startDate && typeof startDate != 'string'){
      this.query.BeginDate = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    }
    if(!!endDate && typeof endDate != 'string'){
      this.query.EndDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    }

    this.isSearch = !!this.query.MaterialCode || !!this.query.ExtendType || !!this.query.ApplyName || !!this.query.BeginDate || !!this.query.EndDate;
    this.loading = true;

    this.query.PageNo=1;
    this.initData(this.query);
  }

  //重置搜索条件
  reset(){
    let _Status=this.query.Status;
    this.query = new Query();
    this.query.Status=_Status;
  }

  //新建申请
  addApply(){
    window.open(dbomsPath+'mate/edit-extendmateriel/0');
  }

  //编辑扩展物料
  editMateriel(en: string,OrderType:number,status:number,InstanceId:string){//三个参数分别为扩展物料编号，订单状态，状态
    if(OrderType===2&&status!=7){
      window.open(dbomsPath+`mate/edit-em-approvaldetail/a${en}?instanceid=${InstanceId}`);
    }else{
      window.open(dbomsPath+`mate/edit-extendmateriel/${en}?instanceid=${InstanceId}&status=${status}`);
      
    }
  }

  //删除扩展物料
  deleteMateriel(param: any){
    let callback = data => {
      if(data.success){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.query.PageNo = 1;
        this.initData(this.query);
        this.windowService.alert({message:data.message,type:"success"});
      }else{
        this.windowService.alert({message:data.message,type:"fail"})
      }
    }

    if(typeof param == "string"){//删除单条数据
      this.windowService.confirm({message:"确定删除？"}).subscribe({
        next: (v) => {
          if(v){
            this.materielExtendMaterielService.deleteMateriel([param]).then(callback);
          }
        }
      });
    }else{//删除多条数据
      this.windowService.confirm({message:`确定删除您选中的${this.checkedNum}项？`}).subscribe(v => {
        if(v){
          let deleteArr = param.filter(item => item.checked === true).map(item => item.SerialNumber);
          this.materielExtendMaterielService.deleteMateriel(deleteArr).then(callback);
        }
      })
    }
  }

  onTab(e) {//切换选项（全部，审批中，已完成，驳回）
    let liType = document.querySelectorAll(".m-state li");

    for (let i = 0; i < liType.length; i++) {
      liType[i].className = "";
    }
    e.target.className = "active";

    //当切换tab标签时，重置一下搜索条件
    this.reset();

    switch (e.target.getAttribute("data-state")) {
      case "sAll":
        this.query.Status = 8;
        break;
      case "sExamine":
        this.query.Status = 6;
        break;
      case "sFinish":
        this.query.Status = 1;
        break;
      case "sReject":
        this.query.Status= 7;
        break;
      default:
        break;
    }

    //this.isHide = true;//显示搜索列表页 
    this.query.PageNo = 1;
    this.initData(this.query);//请求数据库

  }

   //打开高级搜索
   openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="extendMateriel"&&e.newValue.search("submit")!=-1){//如果有新提交的扩展物料申请
        that.initData(that.query);
        localStorage.removeItem('extendMateriel');
      }else if(e.key==="extendMateriel"&&e.newValue.search("closeWindow")!=-1){
        that.initData(that.query);
        localStorage.removeItem('extendMateriel');
      }
  });
  }

}