import { Component,OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';


import { 
  Query,
  PlatformInvInfo,
  PlatformInventoryService
} from './../../../services/platform-inventory.service';


import { PlatformEditFormComponent } from './editForm/edit-form.component';
import { PlatformModalDataComponent } from './modalData/modal-data.component';
declare var window;
@Component({
    templateUrl: './platform-inventory.component.html',
    styleUrls: ['../../../scss/borrow-private.component.scss']
})
export class TrackingPlatformComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  pagerData = new Pager();
  modalEditForm: XcModalRef;//新增平台与库存关系模态框
  modalData: XcModalRef;//excel数据分析模态框
  searchWord: string;//搜索字符
  fileUploadApi: string;//上传文件接口

  platformInvList: PlatformInvInfo[] = [];//平台与库房关系列表

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  constructor(
    private platformInventoryService:PlatformInventoryService,
    private xcModalService:XcModalService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    this.query = new Query();
    this.fileUploadApi = this.platformInventoryService.analysisPlatformInv();
    //在初始化的时候 创建模型
    this.modalEditForm = this.xcModalService.createModal(PlatformEditFormComponent );
    this.modalData = this.xcModalService.createModal(PlatformModalDataComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modalEditForm.onHide().subscribe((data) => {
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
  this.query.storeHouse="";
  this.query.platformName="";
}
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.storeHouse = this.query.storeHouse || "";
    this.query.platformName = this.query.platformName || "";
    this.query.pageNo = e.pageNo;
    this.query.pageSize = e.pageSize;
    this.initData(this.query);
  }

  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.platformInventoryService.getPlatformInvList(query).then(data => {
      this.platformInvList = data.list;
      //设置分页器
      this.pagerData.set(data.pager);
      this.loading = false;
    })
  }
  
  //设置平台与库存地
  setPlatform(id:string){
    this.modalEditForm.show(id);
  }

  //搜索
  search(){
    this.isSearch = (!!this.query.storeHouse) || (!!this.query.platformName);
    this.searchWord = this.query.storeHouse+' '+this.query.platformName;
    this.loading = true;
    this.query.pageNo=1;
    this.initData(this.query);
  }

  //新增平台与库存关系
  addPlatformInv(){
    this.modalEditForm.show(null);//
  }

  //删除平台与库存关系
  deletePlatformInv(param: any){
    let callback = data => {
      if(data.success){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.query.pageNo=1;
        this.search();
        this.windowService.alert({message: "操作成功", type: "success" });
      }else{
        this.windowService.alert({message:data.message,type:"fail"})
      }
    }

    if(typeof param == "string"){//删除单条数据
            this.platformInventoryService.deletePlatformInv(param).then(callback);
    }else{//删除多条数据
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            ObList.push(this.platformInventoryService.deletePlatformInv(item.id));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
    }
  }

  onFileCallBack(data){//文件上传回传数据
     if (data.success) {
        data.item.impType = "1";//是否可这样添加属性？
        console.log(data.item);
        this.modalData.show(data.item);
      }else {            
        this.windowService.alert({message: data.message, type: 'fail'});
      }
  }
  //下载平台与库存关系模板
  loadPlatformInvTpl(){
        window.location.href =this.platformInventoryService.loadPlatformInvTpl();
    }
}