import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { indiaMenuConfig } from "../../service/menu-config-service";
import { dbomsPath } from "environments/environment";
declare var $: any;
declare var window: any;

@Component({
  selector: 'db-india-firstmenu',
  templateUrl: './india-firstmenu.component.html',
  styleUrls: ['./india-firstmenu.component.scss']
})
export class IndiaFirstmenuComponent implements OnInit {

  constructor() { }

  indiaMenuConfig = indiaMenuConfig;
  @Output() addCallBack: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
  }

  addApply(url) {
    this.addCallBack.emit();
    window.open(dbomsPath + url);
  }

  showIndiaList() {
    $(".newIndia").css("display", "block");
  }
}
