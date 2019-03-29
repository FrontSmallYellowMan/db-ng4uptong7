import { Component,OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';


import { 
  Query,
  FiscalInfo,
  FiscalAdjustService
} from './../../../services/fiscal-adjust.service';


import { FiscalAddFormComponent } from './addForm/add-form.component';
import { FiscalModalDataComponent } from './modalData/modal-data.component';

@Component({
    templateUrl: './fiscal-adjust.component.html',
    styleUrls: ['../../../scss/borrow-private.component.scss']
})
export class TrackingFiscalComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  pagerData = new Pager();
  modalAddForm: XcModalRef;//新增财年模态框
  modalData: XcModalRef;//excel数据分析模态框
  searchWord: string;//搜索字符
  fileUploadApi: string;//上传文件接口

  fiscalList: FiscalInfo[] = [];//财年列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  constructor(
    private fiscalAdjustService:FiscalAdjustService,
    private xcModalService:XcModalService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    this.query = new Query();
    this.fileUploadApi = this.fiscalAdjustService.analysisFiscal();
    //在初始化的时候 创建模型
    this.modalAddForm = this.xcModalService.createModal(FiscalAddFormComponent);
    this.modalData = this.xcModalService.createModal(FiscalModalDataComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modalAddForm.onHide().subscribe((data) => {
      if (data){
        //refresh
        this.initData(this.query);
      }
    })
    this.modalData.onHide().subscribe((data) => {
      if (data){
        this.initData(this.query);
      }
    })
  }
clearSearch(){//重置搜索
  this.query.srcBusinessScope="";
  this.query.descBusinessScope="";
}
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.srcBusinessScope = this.query.srcBusinessScope || "";
    this.query.descBusinessScope = this.query.descBusinessScope || "";
    this.query.pageNo = e.pageNo;
    this.query.pageSize = e.pageSize;
    this.initData(this.query);
  }

  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.fiscalAdjustService.getFiscalList(query).then(data => {
      this.fiscalList = data.list;
      //设置分页器
      this.pagerData.set(data.pager);
      this.loading = false;
    })
  }

  //搜索
  search(){
    this.isSearch = (!!this.query.srcBusinessScope) || (!!this.query.descBusinessScope);
    this.searchWord = this.query.srcBusinessScope+' '+this.query.descBusinessScope;
    this.loading = true;
    this.query.pageNo=1;
    this.initData(this.query);
  }

  //新增财年调整
  addFiscal(){
    this.modalAddForm.show();
  }

  //删除财年调整
  deleteFiscal(param: any){
    let callback = data => {
      if(data.success){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.initData(this.query);
        this.windowService.alert({message:"操作成功",type:"success"});
      }else{
        this.windowService.alert({message:data.message,type:"fail"})
      }
    }

    if(typeof param == "string"){//删除单条数据
            this.fiscalAdjustService.deleteFiscal(param).then(callback);
    }else{//删除多条数据
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            ObList.push(this.fiscalAdjustService.deleteFiscal(item.id));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
    }
  }

  onFileCallBack(data){//文件上传回传数据
     if (data.success) {
        this.modalData.show(data.item);
      }else {            
        this.windowService.alert({message: data.message, type: 'fail'});
      }
  }
  //下载财年模板
  loadFiscal(){
        window.location.href =this.fiscalAdjustService.loadFiscalTpl();
    }
}
