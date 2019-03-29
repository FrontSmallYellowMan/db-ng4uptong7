import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';

@Component({
  templateUrl: './detail-tips.component.html',
  styleUrls: ['./detail-tips.component.scss']
})
export class DetailTipsComponent implements OnInit {
  public modal: XcModalRef;
  public errList = [];
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
  ) { }


  ngOnInit() {
    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe((data) => {
      this.errList = [];
      if (data) {
        let listString = JSON.parse(data);
        listString.forEach((item, i) => {
          this.errList.push(JSON.parse(item));
        })
      }
    })
  }
  hide() {
    this.errList = [];
    this.modal.hide();
  }

}
