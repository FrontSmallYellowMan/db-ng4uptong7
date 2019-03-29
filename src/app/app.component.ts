import { Component,OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from 'app/shared/services/authentication.service';

@Component({
  selector: 'iq-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private titleService: Title,
    router: Router,
    route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ){}

  public setTitle(newTitle: string) {
      this.titleService.setTitle(newTitle);
  }


  ngOnInit() {
    //保存用户信息
    this.authenticationService.getUserInfo().subscribe(
      data => {
        if (data.Result) {
          let userInfo = JSON.parse(data.Data);
          let localUserInfo = {
            ITCode: userInfo.ITCode,
            UserName: userInfo.UserName,
            YWFWDM: userInfo.YWFWDM,
            FlatCode: userInfo.FlatCode,
            FlatName: userInfo.FlatName,
            DeptNO: userInfo.DeptNO,
            DeptName: userInfo.DeptName,
            CostCenter: userInfo.CostCenter,
            CostCenterName: userInfo.CostCenterName
          }

          localStorage.setItem('UserInfo', JSON.stringify(localUserInfo));
        }
      },
      error => { }
    );
  }

  removeUserinfo(){
    localStorage.removeItem('UserInfo');
  }

}
