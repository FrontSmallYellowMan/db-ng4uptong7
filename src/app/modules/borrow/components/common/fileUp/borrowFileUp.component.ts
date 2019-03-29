import { Component, Output, EventEmitter, OnInit, Input } from "@angular/core";
import { FileUploader, ParsedResponseHeaders, FileItem } from "ng2-file-upload";
import { Location } from "@angular/common";
import { Http } from "@angular/http";
import { WindowService } from "app/core";
import { environment } from "environments/environment";
@Component({
    selector: "borrow-file",
    templateUrl: "./borrowFileUp.component.html"
})
export class BorrowFileUpComponent implements OnInit {
    @Output() upflie = new EventEmitter();
    @Input() accessoryExamine;

    constructor(
        private location: Location,
        private WindowService: WindowService,
        private http: Http
    ) {}
    public ticket: string;
    public upLoadECFile: FileUploader;
    public checkUrlFlag; //是否查看页面
    public removeItem(e, i) {
        this.upLoadECFile.queue.splice(i, 1);
        for (let i = 0, len = this.accessoryExamine.length; i < len; i++) {
            if (e.AccessoryName == this.accessoryExamine[i].AccessoryName) {
                this.accessoryExamine.splice(i, 1);
            }
        }
        this.upflie.emit(this.accessoryExamine);
    }
    // public accessoryArray = [];//附件数据
    public accessory: accessory;

    //上传附件
    onUploadFiles(uploader: FileUploader) {
        uploader.queue.map(function(item) {
            item.withCredentials = false;
        });
        // console.log("uploader", uploader);
        uploader.uploadAll();
        uploader.onCompleteItem = (
            item: FileItem,
            response: string,
            status: number,
            headers: ParsedResponseHeaders
        ) => {
            let data = JSON.parse(response);

            if (status === 200 && data.Result) {
                // if (response.Message == "出现错误。") {

                // }
                // console.info(data.Data);
                let access = JSON.parse(data.Data);
                if (this.accessoryExamine == undefined) {
                    this.accessoryExamine = [];
                }
                this.accessoryExamine.push(
                    new accessory(
                        0,
                        access[0].AccessoryName,
                        access[0].AccessoryURL
                    )
                );
                this.upLoadECFile.queue = [];
            } else {
                // console.log("false");
                this.WindowService.alert({
                    message: "文件上传失败,请检查文件大小及格式，不可超过5M",
                    type: "success"
                });
                let idx = this.upLoadECFile.queue.indexOf(item);
                if (idx !== -1) {
                    this.upLoadECFile.queue.splice(idx, 1);
                }
            }

            this.upflie.emit(this.accessoryExamine);
        };
    }
    ngOnInit() {
        this.ticket = localStorage.getItem("ticket")
            ? localStorage.getItem("ticket")
            : ""; //判断是否存在ticket，存在则赋值，不存在则将值赋为空
        this.upLoadECFile = new FileUploader({
            url: environment.server + "InvoiceRevise/UploadIRAccessories",
            headers: [{ name: "ticket", value: this.ticket }]
        });
    }
}
export class accessory {
    constructor(
        public AccessoryID: number,
        public fileName: any,
        public filePath: any //public fileName
    ) {}
}
