import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from '../../../../core/services';
import { environment, dbomsPath } from '../../../../../environments/environment';
import * as moment from 'moment';
declare var document,Blob,URL,window;
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs";

@Component({
  templateUrl: './batch-material-creat.component.html',
  styleUrls: ['./batch-material-creat.component.scss']
})

export class BatchMaterialCreatComponent implements OnInit {

  constructor(private windowService: WindowService,private http: Http) { }

  materialType = "0001";//物料类型
  uploadFileParam = {MaterialType: "0001"};
  batchmaterialuploadapi = environment.server + "MaterialCreation/CreateMaterial";//上传附件
  downloadErrorExcelapi = environment.server + "MaterialCreation/DownloadErrorExcel";//下载信息
  hasUploadedFiles = [];
  batchmaterialuploadWarn = [];//批量上传错误提示
  batchmaterialuploadSuccess = [];//批量上传成功提示
  materialtype0001 = dbomsPath + "assets/downloadtpl/物料批量创建模板（一般物料）.xlsx";
  materialtype0002 = dbomsPath + "assets/downloadtpl/物料批量创建模板（返款服务物料）.xlsx";
  materialrelation = dbomsPath + "assets/downloadtpl/物料关系表.xlsx";
  startUpload = false;
  startUploadTip = "友情提示：excel文件校验中，请稍等……";
  ngOnInit() {}

  //附件开始上传前 事件
  onStartUpload(){
    this.startUpload = true;
  }
  //附件上传 成功
  fileUploadSuccess(event) {
    this.startUpload = false;
    //event = data
    if (event.Result) {
      this.batchmaterialuploadSuccess = JSON.parse(event.Data)["successMsg"];
      this.batchmaterialuploadWarn = JSON.parse(event.Data)["errorMsg"];
      if (event.Message == "成功") {
        this.windowService.alert({ message: "上传成功", type: "success" });
      }
    } else {
      this.hasUploadedFiles = [];
      this.windowService.alert({ message: event.Message, type: "fail" });
    }

  }
  //删除附件
  onDeleteFileItem(event, ) {
    //event = 删除文件的下标
    this.hasUploadedFiles.splice(event, 1);
  }

  materialTypeChange(event){
    this.materialType = event;
    this.uploadFileParam.MaterialType = event;
  }

  //下载错误信息
  downloadErrorExcelbtn(){
    let body = {Data:this.batchmaterialuploadWarn};
    this.downloadErrorExcel(body).subscribe(data => {
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `异常说明.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl,"异常说明");
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
  }
  //下载成功信息
  downloadSuccessExcelbtn(){
    let body = {Data:this.batchmaterialuploadSuccess};
    this.downloadErrorExcel(body).subscribe(data => {
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `物料说明.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl,"物料说明");
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
  }
  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link,title){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`${title}${newDate}`);
    a.click();
    document.body.removeChild(a);
  }
  /**
   * 下载信息
   */
  downloadErrorExcel(body):Observable<any> {
    return this.http.post(this.downloadErrorExcelapi , body, {responseType: 3}).map(res=>res.blob());
  }

}