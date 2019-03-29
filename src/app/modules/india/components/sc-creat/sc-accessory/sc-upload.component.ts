import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { WindowService } from 'app/core';
import { FileItem, FileLikeObject, ParsedResponseHeaders, FileUploader } from 'ng2-file-upload';
import { ScService } from './../../../service/sc-service';
declare var $: any;

@Component({
    selector: 'db-sc-upload',
    templateUrl: './sc-upload.component.html',
    styleUrls: ['./sc-accessory.component.scss']
})
export class ScUploadComponent implements OnInit {
  @Input('text') buttonText: string;
  @Input() url: string;
  @Input() method: string = 'POST';//默认post方法
  @Input() allowedFileType: string[];//可上传文件类型
  @Input() maxFileSize: number = Infinity;//默认最大文件大小
  @Input() upType: number;//组件类型 0: 按钮上传，弹出框形式 1:附件上传，DOM节点形式
  @Input() maxFileNum: number = Infinity;//最大可上传数量
  @Input() isEdit: boolean ;//是否为编辑状态
  @Input() isCreate: boolean ;//是否为新建状态
  @Input() accessoriesInfo;
  @Input() allowDel: boolean = true;//是否允许删除
  @Output() onSuccess = new EventEmitter();//上传成功触发
  @ViewChild('upfiles') upfilesNode;//支票信息

  clearPath: boolean = false;//是否允许清楚文件路径
  filePath;//上传文件路径
  uploader: FileUploader;
  modalShow: boolean;
  fileError: boolean[] = [false];//错误文件
  fileErrorMsg: string[] = [];//错误信息
  speed: any[] = [];//上传速度
  successFiles: any[] = [];
  noUpload = false;//最大可上传数量后，上传按钮不显示
  localUser = JSON.parse(localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  ticket:string;//登陆人ticket
  constructor(
    private ref: ChangeDetectorRef,
    private windowService: WindowService,
    private scService: ScService) {}

  ngOnInit(){
    this.ticket=localStorage.getItem('ticket')?localStorage.getItem('ticket'):"";//判断是否存在ticket，存在则赋值，不存在则将值赋为空

    this.uploader = new FileUploader({
      url: this.url,
      method: this.method,
      allowedFileType: this.allowedFileType,
      maxFileSize: this.maxFileSize,
      headers:[{name:"ticket",value:this.ticket}]
    })

    //文件添加成功事件
    this.uploader.onAfterAddingAll = (data => {
      this.modalShow = true;
      //仅ie下，重复添加文件时才会触发
      if(this.clearPath){
          this.clearPath = false;
          this.uploader.queue.pop();
      }
      if(this.uploader.queue.length > this.maxFileNum){
        this.uploader.queue.length = this.maxFileNum;
        this.windowService.alert({message: `最大上传文件数量为${this.maxFileNum}个`, type: 'fail'})
        return;
      }
      data.forEach(item => this.uploadFile(item));
    });

    //文件添加失败事件
    this.uploader.onWhenAddingFileFailed = (item, filter, options) => {
      if(item.size > options.maxFileSize){
        this.windowService.alert({message: '文件大小超出限制', type: 'fail'});
      }else{
        this.windowService.alert({message: '文件类型错误', type: 'fail'});
      }
    }

    //触发进度条
    this.uploader.onProgressItem = (fileItem: FileItem, progress: any) => {
      this.ref.detectChanges();
    }

  }

  //上传指定文件
  uploadFile(item: FileItem){
    let i = this.uploader.queue.indexOf(item),
        _progress = 0,
        _speed = 0,
        _time:any = new Date();
    const ITEM_SIZE = item.file.size/1024;
    this.speed[i] = '0kb/s';//初始速度
    //文件上传，跨域问题解决
    item.withCredentials = false;

    item.upload();

    item.onSuccess = (response, status, headers) => {
      this.speed[i] = 0;
      let currentTime = new Date();
      let data = response ? JSON.parse(response) : '';
      let file = JSON.parse(data.Data);
      let newFile = {
        "AccessoryID":file[0]["AccessoryID"],
        "AccessoryName":file[0]["AccessoryName"],
        "AccessoryURL":file[0]["AccessoryURL"],
        "AccessoryType":file[0]["AccessoryType"],
        "CreatedByName": this.localUser["UserName"],
        "CreatedByITcode": this.localUser["ITCode"]
      };

      this.uploader.queue[i]["AccessoryID"] = newFile["AccessoryID"];//用于删除指定的附件
      this.uploader.queue[i]["AccessoryURL"] = newFile["AccessoryURL"];//用于页面跳转
      this.uploader.queue[i]["AccessoryName"] = newFile["AccessoryName"];//用于页面显示
      this.successFiles.push(newFile);
      this.emitData();

      // this.onSuccess.emit(data);
      if(this.uploader.queue.length == this.maxFileNum){
          this.noUpload = true;
      }
      if(typeof data !== 'string' && data.success === false){
        this.fileError[i] = true;
        this.fileErrorMsg[i] = data.message;
      }
      //上传文件节点存在，且其files存在（ie下文件信息存在），两次相同ie无法上传。
      let oldPath = $("#uploadFiles").val();
      let clearPath = false;
      if(this.upfilesNode && this.upfilesNode.nativeElement.files){
          if(this.upfilesNode.nativeElement.files.length == 1){
              clearPath = true;
          }else if(this.upfilesNode.nativeElement.files.length > 1 && oldPath == this.filePath){
              clearPath = true;
          }
      }
      if(clearPath){
          this.clearPath = true;
          this.filePath = $("#uploadFiles").val();
          $("#uploadFiles").select();//选中文件路径部分
          document.execCommand('Delete');//HTML文档切换到设计模式(designMode)时，文档对象暴露 execCommand方法,Delete为方法固定名称。删除路径
          $("#uploadFiles").blur();//失去焦点后，ie自动给上传队列中添加该文件，故在添加文件处将最后一个文件删掉
      }

    }

    item.onProgress = progress => {
      let time:any = new Date();

      if(time - _time >= 1000){//每秒刷新一次上传速度
        let tmpSpeed:any = (progress - _progress)/100*ITEM_SIZE;//这一秒内文件上传的大小
        let speed = (tmpSpeed + _speed)/2;
        this.speed[i] = speed > 1024 ? (speed/1024).toFixed(2) + 'MB/s' : (speed*1).toFixed(2) + 'Kb/s';

        _progress = progress;
        _time = time;
        _speed = speed;
      }
    }
  }
  //下载已上传文件
  loadAccessory(url){
      window.open(this.scService.upFilesDownload(url));
  }

  //取消指定文件的上传
  cancelUploadFile(item: FileItem){
    item.cancel();
  }

  //删除队列中的文件
  removeFile(item: FileItem,i: number){
    item.remove();
    this.fileError.splice(i, 1);
    this.fileErrorMsg.splice(i, 1);

    if(this.uploader.queue.length < this.maxFileNum){
        this.noUpload = false;
    }

    let files = this.successFiles;
    let file = item;
    this.successFiles = files.filter(data => data["AccessoryID"] != file["AccessoryID"]);
    this.emitData();
  }

  //关闭上传框
  hide(){
    this.modalShow = false;
  }
  //父组件传过来已上传的附件
  removeFiles(item){
      let files = this.accessoriesInfo;
      let file = item;
      this.accessoriesInfo = files.filter(data => data["AccessoryID"] != file["AccessoryID"]);
      this.emitData();
  }
  emitData(){
      let lastFiles = [];
      let existFiles = this.accessoriesInfo;
      let upFiles =  this.successFiles;
      if(existFiles&&existFiles.length>0){
          existFiles.forEach(function(item){
              lastFiles.push(item);
          })
      }
      if(upFiles&&upFiles.length>0){
          upFiles.forEach(function(item){
              lastFiles.push(item);
          })
      }
      this.onSuccess.emit(lastFiles);
  }
}
