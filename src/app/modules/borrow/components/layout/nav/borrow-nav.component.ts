import { Component, OnInit } from '@angular/core';
import { NavigationEnd, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { environment_java } from "./../../../../../../environments/environment";
@Component({
  selector: 'borrow-nav',
  templateUrl: './borrow-nav.component.html',
  styleUrls: ['./borrow-nav.component.scss']
})
export class BorrowNavComponent implements OnInit {
  public userRoles: UserRoles = new UserRoles();
  public open;
  constructor(private http: Http) {
  }
  ngOnInit() {
    this.open = true;
    this.http.get(environment_java.server + "common/getUserRoles", null).toPromise()
      .then(res => {
        let roleCodes = res.json().item;
        if(roleCodes.indexOf("0000000010")>=0){
          this.userRoles.admin = true;
        }
        if(roleCodes.indexOf("0000000011")>=0){
          this.userRoles.riskMgr = true;
        }
      });

  }
}
export class UserRoles {
  riskMgr:boolean = false;
  admin:boolean = false;
}

