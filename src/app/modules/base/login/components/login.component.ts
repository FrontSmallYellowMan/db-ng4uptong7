import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  userInfo: any = {
    username: "",
    password: ""
  };
  loading = false;
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    // 清空本地用户信息
    this.authenticationService.logout();
    this.authenticationService.removeUserinfo();

    // 登录后，跳转URL
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }

  login() {
    if (this.userInfo.password === "") {
      return;
    }
    this.loading = true;
    //login
    this.authenticationService
      .login(this.userInfo.username, this.userInfo.password)
      .subscribe(
        data => {
          if (data.Result) {
            //1保存ticket
            localStorage.setItem("ticket", data.Data);
            //跳转到
            let url = window.localStorage.getItem("url");
            if (url) {
              window.localStorage.removeItem("url");
              window.location.href = url;
            }
            //2跳转
            if (this.returnUrl.indexOf("?") == -1) {
              //无参数 url
              this.router.navigate([this.returnUrl]);
            } else {
              //有参数
              let routerUrl = this.returnUrl.split("?")[0];
              let paramStr = this.returnUrl.split("?")[1];
              let queryParams = {};
              paramStr.split("&").map(function(item) {
                let key = item.split("=")[0];
                let value = item.split("=")[1];
                queryParams[key] = value;
              });
              this.router.navigate([routerUrl], { queryParams: queryParams });
            }
          } else {
            alert(data.Message);
          }
        },
        error => {
          console.log(error);
          this.loading = false;
        }
      );

    //loginjava 没发现有什么用处，注释掉
    this.authenticationService.loginjava(this.userInfo.username).subscribe(
      data => {},
      error => {
        console.log(error);
        this.loading = false;
      }
    );
    //保存用户信息
    this.authenticationService
      .getUserInfoByItCode(this.userInfo.username)
      .subscribe(
        data => {
          if (data.Result) {
            let userInfo = JSON.parse(data.Data);
            console.log(userInfo);

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
            };
            localStorage.setItem("UserInfo", JSON.stringify(localUserInfo));
          }
        },
        error => {}
      );
  }
}
