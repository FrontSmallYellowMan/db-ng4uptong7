import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { WindowService } from 'app/core';
import { FileItem, FileLikeObject, ParsedResponseHeaders, FileUploader } from 'ng2-file-upload';
declare var $: any;

@Component({
  selector: 'iq-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @Input('text') buttonText: string;
  @Input() url: string;
  @Input() method: string = 'POST';//默认post方法
  @Input() allowedFileType: string[];//可上传文件类型
  @Input() maxFileSize: number = Infinity;//默认最大文件大小
  @Input() upType: number;//组件类型 0: 按钮上传，弹出框形式 1:附件上传，DOM节点形式
  @Input() maxFileNum: number = Infinity;//最大可上传数量
  @Input() hasUploaded: any[] = [];//已经上传过的文件数组
  @Input() withCredentials: boolean = true;//是否使用证书
  @Input() showModel: boolean = true;//是否显示上传对话框
  @Input() itemAlias: string;//标示
  @Input() upLoadBtnId: string = "uploadFiles";//文件上传按钮ID，用于处理ie重复上传问题
  @Input() upLoadData: any;//上传参数
  @Input() disabled: boolean = false;//是否禁止上传
 // @Input() ticket:string;//登陆人ticket

  @Output() onSuccess = new EventEmitter();//上传成功触发
  @Output() onDeleteItem = new EventEmitter();//删除某个文件触发
  @Output() onClickFile = new EventEmitter();//点击文件时
  @Output() onStartUpload = new EventEmitter();//开始上传时

  @ViewChild('upfiles') upfilesNode;//文件上传按钮
  clearPath: boolean = false;//是否允许清楚文件路径
  filePath;//上传文件路径
  uploader: FileUploader;
  modalShow: boolean;
  fileError: boolean[] = [false];//错误文件
  fileErrorMsg: string[] = [];//错误信息
  speed: any[] = [];//上传速度
  fileNum: number = 0;
  ticket:string;//登陆人ticket

  constructor(
    private ref: ChangeDetectorRef,
    private windowService: WindowService) { }

  ngOnInit() {

    this.ticket=localStorage.getItem('ticket')?localStorage.getItem('ticket'):"";//判断是否存在ticket，存在则赋值，不存在则将值赋为空

    this.uploader = new FileUploader({
      url: this.url,
      method: this.method,
      allowedFileType: this.allowedFileType,
      maxFileSize: this.maxFileSize,
      itemAlias: this.itemAlias,
      additionalParameter: this.upLoadData,
      headers:[{name:"ticket",value:this.ticket}]
    })

    //文件添加成功事件
    this.uploader.onAfterAddingAll = (data => {
      this.modalShow = true;
      //仅ie下，重复添加文件时才会触发
      if (this.clearPath) {
        this.clearPath = false;
        this.uploader.queue.pop();
      }else{
        this.onStartUpload.emit(data);
      }
      if (this.uploader.queue.length > this.maxFileNum - this.hasUploaded.length) {
        this.uploader.queue.length = this.fileNum;
        this.windowService.alert({ message: `最大上传文件数量为${this.maxFileNum}个`, type: 'fail' })
        return;
      }
      this.uploader.options.additionalParameter = this.upLoadData;//更新上传文件参数
      
      data.forEach(item => {
        item.withCredentials = this.withCredentials;
        this.uploadFile(item);
      });
    });

    //文件添加失败事件
    this.uploader.onWhenAddingFileFailed = (item, filter, options) => {
      if (item.size > options.maxFileSize) {
        this.windowService.alert({ message: '文件大小超出限制', type: 'fail' });
      } else {
        this.windowService.alert({ message: '文件类型错误', type: 'fail' })
      }
    }

    //触发进度条
    this.uploader.onProgressItem = (fileItem: FileItem, progress: any) => {
      this.ref.detectChanges();
    }

    this.uploader.onCompleteAll = () => {
      this.fileNum = this.uploader.queue.length;
    }

  }

  //上传指定文件
  uploadFile(item: FileItem) {
    let i = this.uploader.queue.indexOf(item),
      _progress = 0,
      _speed = 0,
      _time: any = new Date();
    const ITEM_SIZE = item.file.size / 1024;
    this.speed[i] = '0kb/s';//初始速度

    item.upload();

    item.onSuccess = (response, status, headers) => {
      this.speed[i] = 0;
      let data = response ? JSON.parse(response) : '';
      this.onSuccess.emit(data);

      if (typeof data !== 'string' && data.success === false) {
        this.fileError[i] = true;
        this.fileErrorMsg[i] = data.message;
      }
      if (this.upType == 0) {
        this.dealIEReUplodeFiles(this.upLoadBtnId);
      } else {
        this.dealIEReUplodeFiles(this.upLoadBtnId + "1")
      }
    }

    item.onProgress = progress => {
      let time: any = new Date();

      if (time - _time >= 1000) {//每秒刷新一次上传速度
        let tmpSpeed: any = (progress - _progress) / 100 * ITEM_SIZE;//这一秒内文件上传的大小
        let speed = (tmpSpeed + _speed) / 2;
        this.speed[i] = speed > 1024 ? (speed / 1024).toFixed(2) + 'MB/s' : (speed * 1).toFixed(2) + 'Kb/s';

        _progress = progress;
        _time = time;
        _speed = speed;
      }
    }
  }
  //ie重复上传兼容方法
  dealIEReUplodeFiles(id) {
    //文件上传ID
    let upLoadFilesId = "#" + id;
    //上传文件节点存在，且其files存在（ie下文件信息存在），两次相同文件ie无法上传。
    let oldPath = $(upLoadFilesId).val();
    let clearPath = false;
    if (this.upfilesNode && this.upfilesNode.nativeElement.files) {
      if (this.upfilesNode.nativeElement.files.length == 1) {
        clearPath = true;
      } else if (this.upfilesNode.nativeElement.files.length > 1 && oldPath == this.filePath) {//上传多个文件length会大于1，再次上传与上次最后一个文件相同时，执行此代码
        clearPath = true;
      }
    }
    if (clearPath) {
      this.clearPath = true;
      this.filePath = $(upLoadFilesId).val();
      $(upLoadFilesId).select();//选中文件路径部分
      document.execCommand('Delete');//HTML文档切换到设计模式(designMode)时，文档对象暴露 execCommand方法,Delete为方法固定名称。删除路径
      $(upLoadFilesId).blur();//失去焦点后，ie自动给上传队列中添加该文件，故在添加文件处将最后一个文件删掉
    }
  }
  //取消指定文件的上传
  cancelUploadFile(item: FileItem) {
    item.cancel();
  }

  //删除上传过的文件
  removeUploaded(i) {
    this.hasUploaded.splice(i, 1);
    this.onDeleteItem.emit(i);
  }

  //删除队列中的文件
  removeFile(item: FileItem, i: number) {
    item.remove();
    this.fileError.splice(i, 1);
    this.fileErrorMsg.splice(i, 1);
    this.onDeleteItem.emit(this.hasUploaded.length + i);
  }

  //点击指定文件
  clickFile(item, i) {
    this.onClickFile.emit({ item: item, index: i });
  }

  //关闭上传框
  hide() {
    this.modalShow = false;
  }

}
