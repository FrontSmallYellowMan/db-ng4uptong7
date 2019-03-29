import { Component,OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';

import { dbomsPath,environment } from "environments/environment";

import {Query,MaterialInfoHW,MaterialMaintenanceHuaweiService} from '../../services/material-maintenanceHuawei.service'
import { Headers } from 'ng2-file-upload';
import { EditMaterialMaintenancehwComponent } from '../edit-material-maintenancehw/edit-material-maintenancehw.component';
// import { isNgTemplate } from '@angular/compiler';


@Component({
  selector: 'db-material-maintenance-huawei',
  templateUrl: './material-maintenance-huawei.component.html',
  styleUrls: ['./material-maintenance-huawei.component.scss','../../scss/materiel.component.scss']
})
export class MaterialMaintenanceHuaweiComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query:Query=new Query();//查询条件
  pagerData=new Pager();
  modal:XcModalRef;
  materialList:MaterialInfoHW[]=[];//列表集合
  searchWord:string;//查询关键字
  isSearch:boolean=false;//是否是查询状态
  loading:boolean=true;//是否显示加载图标
  fileUploadApi: any;//文件上传路径
  constructor(private materialMaintenanceHwService:MaterialMaintenanceHuaweiService,private xcModalService:XcModalService,private windowService:WindowService) { }

  ngOnInit() {
    this.query=new Query();
    this.initData(this.query);
    this.fileUploadApi=environment.server+"MaterialManage/UploadMaterialHW";
       //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(EditMaterialMaintenancehwComponent);
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
  initData(query: Query){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;
    // this.materialList[""].checked = true;
    this.materialMaintenanceHwService.getMaterialHWList(query).subscribe(data=>{
      if(data.Result){
        this.loading=false;
        let res=JSON.parse(data.Data);
        this.materialList=res.List;
        this.pagerData.set({
          total:res.TotalCount,
          totalPages:res.PageCount,
          pageNo:query.CurrentPage
        })
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    })
  }
  search(){
    this.isSearch = !!this.query.MaterialCode || !!this.query.MaterialCodeHW;
    this.searchWord = this.query.MaterialCodeHW + (this.query.MaterialCode ? '、' + this.query.MaterialCode : '');
    this.query.CurrentPage='1';
    this.loading=true;
    this.initData(this.query);

  }
  reset(){
    this.query.MaterialCode="";
    this.query.MaterialCodeHW="";
    this.query.CurrentPage="1";
    this.initData(this.query);
  }
  viewMaterMaint(item:MaterialInfoHW){
    item.View=true;
    this.modal.show(item);
  }
  onChangePager(e:any){
    this.query.MaterialCode=this.query.MaterialCode || "";
    this.query.MaterialCodeHW=this.query.MaterialCodeHW || "";
    this.query.CurrentPage=e.pageNo;
    this.query.PageSize=e.pageSize;
    this.initData(this.query);
  }
  //文件上传状态
  fileUpSuccess(data: any){
    if(data.Result){
      this.loading = true;
      this.windowService.alert({message:data.Message,type:"success"});
      this.initData(this.query);
    }else{
      this.windowService.alert({message:data.Message,type:"fail"});
    }
  }
  addMaterMaint(){
    this.modal.show();
  }
  deleteMaterialHW(param:MaterialInfoHW){
    let callback=data=>{
      if(data.Result){
        this.query.CurrentPage="1";
        this.initData(this.query);
        this.windowService.alert({message:data.Message,type:"success"});
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
      }
    }
    if(param instanceof Array){//删除多条数据
       this.windowService.confirm({message:`确定删除您选中的${this.checkedNum}项？`}).subscribe(v=>{
         if(v){
           let matList=[];
           param.filter(item => item.checked === true).forEach(item => {
            matList.push(this.materialMaintenanceHwService.deleteMaterialHW(item.ID));
          });
          Observable.merge.apply(null, matList).toPromise().then(callback);

         }
       })
    }else{
      this.windowService.confirm({message:"确定删除？"}).subscribe({next:(v)=>{
        if(v){
          this.materialMaintenanceHwService.deleteMaterialHW(param.ID).subscribe(callback);
        }
      }})
    }
  }
  download(){
    window.open(dbomsPath+"assets/downloadtpl/华为物料导入模板.xlsx")
  }
}
