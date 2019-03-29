import { Component, OnInit } from '@angular/core';
import { WindowService } from 'app/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
declare var window: any;

import {
  Ectpl,
  EctplParams,
  Owntpl,
  OwntplParams,
  ScSelectService
} from '../../service/sc-selecttpl.service';
import { EcContractCommonClass } from "../ectemplates/common/utilityclass/eccontractcommon";

@Component({
  templateUrl: './sc-selecttpl.component.html',
  styleUrls: ['./sc-selecttpl.component.scss']
})
export class ScSelecttplComponent implements OnInit {

  ectplParams: EctplParams;//tpl
  ectplList: Ectpl[] = [];
  owntplParams: OwntplParams;//owner
  ownList: Owntpl[] = [];
  searchWord: string;
  isSearch: boolean = false;
  userInfo = JSON.parse(window.localStorage.getItem('UserInfo'));
  domain: string = "inland";
  category: string = "hard";
  ecContractCommonClass = new EcContractCommonClass();
  headers = { name: "ticket", value: window.localStorage.getItem('ticket') }
  upLoadECFile: FileUploader = new FileUploader({ url: this.scSelectService.uploadCustomerFile() });
  constructor(
    private scSelectService:ScSelectService,
    private windowService:WindowService,
    private route: ActivatedRoute,
    private router: Router ) {
  }

  name = '请选择您将使用的模板'
  ngOnInit() {
    this.ectplParams=new EctplParams();
    this.ectplParams.BizScope=this.userInfo['YWFWDM'];
    this.ectplParams.Domain="国内销售合同";
    this.ectplParams.Category="硬件合同";

    this.owntplParams=new OwntplParams();
    this.owntplParams.Owner=this.userInfo['ITCode'];


    this.initDataGetTpl();
    this.initDataGetEcf();
  }

  initDataGetTpl(){
    this.scSelectService.get_ectemplate(this.ectplParams).subscribe(
      data => {
        this.ectplList = JSON.parse(data.Data);
      }
    );
  }

  initDataGetEcf(){
    this.scSelectService.get_getEcfavorites(this.owntplParams).subscribe(
      data => {
        this.ownList = JSON.parse(data.Data);
      }
    );
  }

  //查询信息
  selectTpl(){
    this.isSearch = !!this.owntplParams.Name;
    this.searchWord = this.owntplParams.Name;
    this.initDataGetEcf();
  }

  //删除信息
  delTpl(param: any){
    let callback = data => {
      if(data.Result){
        this.windowService.alert({message:"删除成功",type:"success"});
        this.owntplParams.Name=null;
        this.initDataGetEcf();
      }else{
        this.windowService.alert({message:"删除失败",type:"fail"})
      }
    }

    if(typeof param == "string"){
      this.windowService.confirm({message:"确定删除？"}).subscribe({
        next: (v) => {
          if(v){
            this.owntplParams.Name=param;
            this.scSelectService.del_delEcfavorites(this.owntplParams).subscribe(callback)
          }
        }
      });
    }
  }

  //跳转电子合同页面
  onClickRouter(item){
    let templateId = item["TemplateID"];
    if (templateId && templateId.indexOf('_Customized') < 0) {
      let queryParams = { queryParams: { TemplateID:item.TemplateID,ApplyTo:item.ApplyTo,Domain:item.Domain } };
      let ecPageRouteUrl = this.ecContractCommonClass.returnECRouterUrlByTemplateID(templateId);
      this.router.navigate([ecPageRouteUrl], queryParams);
    }
  }
  //点击我的私藏跳转电子合同
  onClickPrivateRouter(item){
    let templateId = item["TemplateID"];
    if (templateId) {
      let queryParams = { queryParams: {'ID':item.ID,'TemplateID':item.TemplateID,'ApplyTo':item.ContractType,'Domain':item.ContractDomain} };
      let ecPageRouteUrl = this.ecContractCommonClass.returnECRouterUrlByTemplateID(templateId);
      this.router.navigate([ecPageRouteUrl], queryParams);
    }
  }

  //国内海外tab切换
  isInlandTab(domain){
    if (this.domain == domain) {
      return;
    }
    this.domain = domain;
    switch (domain) {
      case 'inland':
        this.ectplParams.Domain = "国内销售合同";
        break;
      case 'outsea':
        this.ectplParams.Domain = "海外销售合同";
        break;
    }
    this.initDataGetTpl();
  }

  //硬件软件服务tab切换
  onTab(category){
    if (this.category == category) {
      return;
    }
    this.category = category;
    switch (category) {
      case 'hard':
        this.ectplParams.Category = "硬件合同";
        break;
      case 'soft':
        this.ectplParams.Category = "软件合同";
        break;
      case 'server':
        this.ectplParams.Category = "服务合同";
        break;
    }
    this.initDataGetTpl();
  }

  //上传附件
  onUploadFiles(uploader: FileUploader, templateitem) {
    this.upLoadECFile.options.headers = [this.headers];
    this.upLoadECFile.options.additionalParameter = {
      "TemplateID":templateitem["TemplateID"],"ContractType":templateitem["ApplyTo"],"ContractDomain":templateitem["Domain"]
    };
    if (uploader.queue.length) {
      if (uploader.queue[uploader.queue.length - 1]._file["size"] < 52428800) {
        uploader.queue.map(function (item) {
          item.withCredentials = false;
        });
        uploader.uploadAll();
      } else {
        this.windowService.alert({ message: "文件上传不能大于50M", type: "fail" });
      }
    }
    uploader.onCompleteItem = ((item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      if (status === 200 && data.Result) {
        //上传成功接口返回SC_Code并跳转页面
        let queryParams = { queryParams: {'SC_Code':data.Data} };
        let ecPageRouteUrl = "/india/contract";
        this.router.navigate([ecPageRouteUrl], queryParams);
      } else {
        this.windowService.alert({ message: "上传失败", type: "fail" });
      }
    });
    // let queryParams = { queryParams: {'SC_Code':"e1d0acb70ead4fb08db6ff22c349f5f2"} };
    // let ecPageRouteUrl = "/india/contract";
    // this.router.navigate([ecPageRouteUrl], queryParams);
  }

}
