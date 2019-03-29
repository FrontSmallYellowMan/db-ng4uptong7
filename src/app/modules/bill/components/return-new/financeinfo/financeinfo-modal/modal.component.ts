/*import { Component, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/modal';
import { date, tab, modalService } from './modal.service';
import { Http } from '@angular/http';
import 'rxjs/Rx';

@Component({
  selector: 'demo-modal-auto-shown',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.scss']
})

export class DBAutoShownModalComponent implements OnInit {
  @Input() 
  set moreMessageShow(data){
      this.isModalShown = data;
      console.log(this.isModalShown)
  }
  constructor(private modalService: modalService, private http: Http) { }
  @ViewChild('autoShownModal') public autoShownModal: ModalDirective;
  public isModalShown: boolean = false;
  public DBFlag = false;
  public modalurl;
  public modalDate;
  public showModal(): void {
    this.isModalShown = true;
  }
  public modalSendArray;
 
  //数据转换方法
  public changeEventObject(a, b) {
    for (let i in a) {
      for (let n in b) {
        if (i == n) {
          b[n] = a[i]
        }
      }
    }
  }
  //顶部check
  public DBSelect(e) {
    if (this.DBFlag) {
      for (let i = 0; i < e.length; i++) {
        e[i].select = false;
      }
      this.DBFlag = false;
    } else {
      for (let i = 0; i < e.length; i++) {
        e[i].select = true;
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
  public hideModal(): void {
    this.autoShownModal.hide();
  }
  public onHidden(): void {
    this.isModalShown = false;
  }
  public table = [];
  public head = [];
  public getKeys(items) { return Object.keys(items); }
  ngOnInit() {
    this.table = this.modalService.getTable()
    this.head = this.modalService.getHead()
  }
}
export class modalSendObj {
  constructor(
    public invoiceno,
    public orderno
  ) { }
}
*/