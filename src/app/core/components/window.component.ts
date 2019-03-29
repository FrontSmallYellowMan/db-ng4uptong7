import { Component, OnInit, ViewChild } from '@angular/core';
import { WindowService } from '../services/index';
import { ModalDirective } from 'ngx-bootstrap/modal';

export class Option {
  type: string;
  title: string;
  message: string;
}
@Component({
  selector: 'alert-confirm',
  templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit {
  @ViewChild('confirmModal') public confirmModal: ModalDirective
  @ViewChild('alertModal') public alertModal: ModalDirective
  @ViewChild('promptModal') public promptModal: ModalDirective
  constructor(private windowService: WindowService) { };
  options = new Option();
  promptvalue: string = "";

  hideDialog(v?) {
    this.windowService.close(v);
    this.promptvalue = "";
  }
  stopClick(e) {
    e.stopPropagation();
  }
  ngOnInit() {
    let timer = setInterval(() => {
      this.options;//为了保证视图更新正常，每隔一秒获取一次options。不知道为什么这样就能生效。
    }, 1000);
    
    this.windowService.windowSubject
      .subscribe(({"type": type, "option": p}) => {
        this.options = p;
       // console.log();
        if (type === "alert") {
          this.alertModal.show();
        } else if (type === "confirm") {
          this.confirmModal.show();
        }else{
          this.promptModal.show();
        }
        this.windowService.closeSubject.subscribe(()=>{
          clearInterval(timer);
          this.alertModal.hide();
          this.confirmModal.hide();
          this.promptModal.hide();
        })
      })
  }
}
