import { Component,OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';

import { dbomsPath,environment } from "environments/environment";

import { 
  Query,
  PlatInfo,
  MaterielExtendPlatService
} from '../../services/materiel-extendPlat.service';

import { EditMaterielPlatComponent } from '../edit-materiel-plat/edit-materiel-plat.component';
import { Headers } from 'ng2-file-upload';

@Component({
  templateUrl: 'materiel-extendPlatform.component.html',
  styleUrls: ['materiel-extendPlatform.component.scss','../../scss/materiel.component.scss']
})
export class ExtendPlatformComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;
  pagerData = new Pager();
  modal: XcModalRef;
  searchWord: string;
  fileUploadApi: any;
  //headers:any=[];

  platList: PlatInfo[] = [];

  isSearch: boolean = false;//是否为搜索
  loading: boolean = true;//加载中效果

  constructor(
    private materielExtendPlatService: MaterielExtendPlatService,
    private xcModalService:XcModalService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    // this.headers = {"ticket":"123456789"};

    //let obj: Headers;
    //obj={name:"ticket",value:localStorage.getItem("ticket")}
    // obj.name = "ticket";
    // obj.value = localStorage.getItem("ticket");
    //this.headers.push(obj);
    
    this.query = new Query();
    this.fileUploadApi = environment.server + "material/baseinfo/import";

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(EditMaterielPlatComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?) => {
      if (data){
        this.loading = true;
        //refresh
        this.initData(this.query);
      }
    })
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.Factory = this.query.Factory || "";
    this.query.OriginaFactory = this.query.OriginaFactory || "";
    this.query.PageNo = e.pageNo;
    this.query.PageSize = e.pageSize;

    this.initData(this.query);
  }

  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.materielExtendPlatService.getPlatList(query).then(result => {
      //console.log(result);
      if(result.success){
        this.platList = result.data.list;
        //设置分页器
        this.pagerData.set(result.data.pager);
        this.loading = false;
      }else{
        this.windowService.alert({message: result.message, type: 'fail'});
      }
    })
  }

  //搜索
  search(){
    this.isSearch = !!this.query.OriginaFactory || !!this.query.Factory;
    this.searchWord = this.query.OriginaFactory + (this.query.Factory ? '、' + this.query.Factory : '');
    this.query.PageNo = '1';
    this.loading = true;

    this.initData(this.query);
  }

  //重置搜索条件
  reset(){
    this.query.OriginaFactory = '';
    this.query.Factory = '';
  }

  //新建平台
  addPlat(){
    this.modal.show();
  }

  //查看平台
  viewPlat(item: PlatInfo){
    item.View = true;
    this.modal.show(item);
  }
  
  //编辑平台
  editPlat(item: PlatInfo){
    item.View = false;
    this.modal.show(item);
  }


  //删除供应商
  deletePlat(param: PlatInfo){
    let callback = data => {
      if(data.success){
        this.query.PageNo = '1';
        this.initData(this.query);
        this.windowService.alert({message:data.message,type:"success"});
      }else{
        this.windowService.alert({message:data.message,type:"fail"})
      }
    }

    if(param instanceof Array){//删除多条数据
      this.windowService.confirm({message:`确定删除您选中的${this.checkedNum}项？`}).subscribe(v => {
        if(v){
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            ObList.push(this.materielExtendPlatService.deletePlat(item.RecordId));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
        }
      })
    }else{//删除单条数据
      this.windowService.confirm({message:"确定删除？"}).subscribe({
        next: (v) => {
          if(v){
            this.materielExtendPlatService.deletePlat(param.RecordId).then(callback);
          }
        }
      });
    }
  }

  //文件上传状态
  fileUpSuccess(data: any){
    if(data.success){
      this.loading = true;
      this.initData(this.query);
      this.windowService.alert({message:"导入成功",type:"success"})
    }else{
      this.windowService.alert({message:data.message,type:'fail'});
    }
  }

  //下载扩展平台模板
  download(){
     window.open(dbomsPath+'assets/downloadtpl/扩展平台模板.xlsx');
  }
   //下载工厂默认库存地
   downloadFac(){
    window.open(dbomsPath+'assets/downloadtpl/公司默认库存地明细.xls');
 }


}
