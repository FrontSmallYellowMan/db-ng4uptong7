import { Component, OnInit, Output } from '@angular/core';
import { FileItem, FileUploader } from 'ng2-file-upload';

const URL = "/api/upload";
export class IqFileData {
    fileName="";
    filePath="";
    fileSize=0;
}

@Component({
  selector: 'iq-image-upload',
  templateUrl: 'image-upload.component.html'
})
export class ImageUploadComponent implements OnInit {
  constructor() {  }

  public uploader:FileUploader = new FileUploader({url: URL});

  file:IqFileData = new IqFileData();

  clearImage = () => {
    this.file = new IqFileData();
  }
  ngOnInit() {
    this.uploader.onAfterAddingFile = ((item)=>{
      item.upload();
      return { fileItem: item };
    });
    this.uploader.onSuccessItem = ((item,response)=>{
      this.file = JSON.parse(response);

      return { fileItem: item };
    });
  }
}
