import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'db-receivepayment',
  templateUrl: './receivepayment.component.html',
  styleUrls: ['./receivepayment.component.scss']
})
export class ReceivepaymentComponent implements OnInit {

  constructor(private router: Router) { }
  leftNavName = "我的欠款";//导航名称
  ngOnInit() {
    switch (this.router.url) {
      case "/receivepayment/rp-riskarrears":
        this.leftNavName = "欠款查询";
        break;
      case "/receivepayment/rp-myreceivepayment":
        this.leftNavName = "我的回款";
        break;
    }
  }
  search(navname, url){
    this.leftNavName = navname;
    this.router.navigate([url]);
  }
}
