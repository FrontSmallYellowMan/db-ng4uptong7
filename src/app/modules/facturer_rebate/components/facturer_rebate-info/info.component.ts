import { Component, OnInit } from '@angular/core';

import { XcModalService, XcModalRef } from 'app/shared/index';

@Component({
    selector: 'modal-info',
    templateUrl: 'info.component.html',
    styleUrls: ['info.component.scss']
})

export class RebateInfo implements OnInit{
    public modal: XcModalRef;
    public info: string;
    // 错误消息列表
    public infoList: any;
    constructor(
        private xcModalService: XcModalService
    ){}

    ngOnInit(){
        this.modal = this.xcModalService.getInstance(this);

        this.modal.onShow().subscribe(data => {
            if(data.length){
                this.infoList = data;
            }
        })
    }

    public closeInfo(){
        this.modal.hide();
    }
}

