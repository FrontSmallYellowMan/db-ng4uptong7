
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from '@angular/core';
import { XcBaseModal, XcModalService, XcModalRef } from 'app/shared/modules/xc-modal-module/index';
import { Http, Response } from '@angular/http';
import { environment } from "../../../../../../environments/environment";
import { Observable } from 'rxjs';
import { WindowService } from 'app/core';

declare var document;

@Component({
  selector: 'db-wfview-approverLinks',
  templateUrl: 'db-wfview-approverLinks.component.html',
  styleUrls:['db-wfview-approverLinks.component.scss']
})

export class DbWfviewApproverLinksComponent implements OnInit {

  modal: XcModalRef;//声明弹出窗
  reqData={//请求参数，获取审批人审批链接列表
    'InstanceID':'',
    'IsSimple':1
  }

  loading:boolean=false;//是否显示遮罩层
  approverLinksList:any=[];//保存审批人列表

  constructor(
    private xcModalService:XcModalService,
    private http:Http,
    private windowService:WindowService
  ) { }

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      if(data) {
        this.reqData.InstanceID=data;//保存InstanceID
        this.getApproverLinksAPI(this.reqData);//请求接口，获取审批人列表
      }
      
    });
   }

   //请求接口，获取审批人列表
   getApproverLinksAPI(reqData) {
     this.http.post(environment.server+'common/GetCurrentTaskInfo',reqData).pipe(map(Response=>Response.json())).subscribe(data=> {
       if(data.Result) {
         console.log(JSON.parse(data.Data));
         this.approverLinksList=JSON.parse(data.Data);//保存列表
       }
     });
   }

   //拷贝链接
   copyLink(taskTableURL) {
     if(taskTableURL) {
      const input = document.createElement('input');//创建input元素
      document.body.appendChild(input);//将input元素添加到dom树
      input.setAttribute('value', `${taskTableURL}`);//设置input元素的value属性和值
      input.select();//选择input的内容
      if (document.execCommand('copy')) {
          document.execCommand('copy');//拷贝input中的内容
          this.modal.hide();
          this.windowService.alert({message:"复制成功",type:"success"});
      }
      document.body.removeChild(input);//删除input元素
     }
   }

   //关闭弹窗
   close() {
     this.modal.hide();
   }
}