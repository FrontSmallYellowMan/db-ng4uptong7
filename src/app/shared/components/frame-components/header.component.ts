import { Component, OnInit } from '@angular/core';
import { HeaderBadgeService } from 'app/core/services/header.service';
import { AuthenticationService } from 'app/shared/services/authentication.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { HeaderService } from "../../services/db.header.service";

@Component({
  selector: 'iq-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    private headerService: HeaderService,
    private headerBadgeService: HeaderBadgeService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
  }

  html = `<ul>
    <li>个人中心</li>
    <li>设&emsp;&emsp;置</li>
    <li>注&emsp;&emsp;销</li>
  </ul>`;
  title = "标题";

  badge = {};
  nbadge = {};
  toDoTaskCount = 0;
  unReaderCount = 0;
  localUserInfo = null;//本地localstorage 用户信息

  changeBadge(_badge) {
    this.badge["bell"] = _badge.bell;
    this.badge["star"] = _badge.star;
  }
  ngOnInit() {
    this.headerService.getToDoTaskCount().subscribe(data => {
      this.localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));
      this.toDoTaskCount = data.Data;
      this.headerService.unReaderCount(this.localUserInfo["ITCode"]).subscribe(data => {
        this.unReaderCount = data.Data;
      });
    });
    //订阅导航标题服务
    this.headerBadgeService.observeBadge()
      .subscribe(x => {
        this.changeBadge(x)
      })
  }

  //登出
  logout(){
    localStorage.removeItem('ticket');
    this.router.navigate(['/login']);
    // this.authenticationService.logoutjava()
    //   .subscribe(
    //   data => {
    //     localStorage.removeItem('ticket');
    //     this.router.navigate(['/login']);
    //   },
    //   error => {
    //     console.log(error);
    //   });
  }

}
