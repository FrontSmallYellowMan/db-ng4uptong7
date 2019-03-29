/*import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs } from '@angular/http';

@Component({
    selector: 'more-message-show',
    templateUrl: 'moreMessage.component.html'
})
export class moreMessageComponent implements OnInit {
    constructor(private http: Http) {

    }
    @Input() modalDataChild;
    // @Output() invoiceBack = new EventEmitter;
    @Output() showMoreMessageBack = new EventEmitter;
    @Output() meterialBack = new EventEmitter;
    public showMoreMessage;
    public DBFlag = false;
    public modalSendArray = [];
    public messageShow() {
        this.showMoreMessage = false;
        this.showMoreMessageBack.emit(this.showMoreMessage);
    }
    public backMaterData;
    public messageSend(modalDataChild) {
        this.showMoreMessage = false;
        this.modalSendArray = [];
        for (let i = 0; i < modalDataChild.length; i++) {
            if (modalDataChild[i].select != false) {
                this.modalSendArray.push(new modalSendObj(modalDataChild[i].internalinvoiceno, modalDataChild[i].orderno))
            };
        }   
        console.log(this.modalSendArray);
        this.meterialBack.emit(this.modalSendArray);
    }
    //顶部check
    public DBSelect(e) {
        // console.log(e,this.DBFlag)
        if (this.DBFlag) {
            for (let i = 0; i < e.length; i++) {

                e[i].select = false;
                console.log(e[i].select)
            }
            this.DBFlag = false;
        } else {
            for (let i = 0; i < e.length; i++) {
                e[i].select = true;
                console.log(e[i].select)
            }
            this.DBFlag = true;
        }

    }
    //分check
    public DBItemSelect(a, b) {
        if (!b.select) {
            this.DBFlag = false;
        } else if (b.select) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].select) {
                    this.DBFlag = true;
                } else {
                    this.DBFlag = false;
                }
            }
        }
    }
    ngOnInit() {

    }

}
export class modalSendObj {
    constructor(
        public invoiceno,
        public orderno
    ) { }
}*/