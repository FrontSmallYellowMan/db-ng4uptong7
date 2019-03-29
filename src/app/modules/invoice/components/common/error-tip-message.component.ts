import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { MessageBean } from './error-message'

@Component({
    templateUrl: './error-tip-message.component.html',
    styleUrls: ['../../scss/modal-data.component.scss']
})


export class ErrorTipMessageComponent implements OnInit {

    modal: XcModalRef;
    messageList: any
    constructor(private xcModalService: XcModalService) { }

    ngOnInit() {
        //获得弹出框自身
        this.modal = this.xcModalService.getInstance(this);
        this.modal.onShow().subscribe((messageList) => {
            this.messageList = messageList;
        })
    }

    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }
}