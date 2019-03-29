import {
    Component,
    OnInit,
    Input,
    ViewChild,
    EventEmitter,
    Output,
    ViewEncapsulation
} from "@angular/core";
import { ModalDirective } from "ngx-bootstrap";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SelectModule } from "ng2-select";
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
declare var window;

@Component({
    selector: "wfapproval",
    templateUrl: "./wfapproval.component.html",
    styleUrls: ["./wfapproval.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class WfapprovalComponent implements OnInit {
    constructor(
        private http: Http,
        private router: Router,
        private WindowService: WindowService
    ) {}
    /**
     * 组件参数
     * apiUrl_AR: 通过驳回接口地址
     * apiUrl_Sign：加签接口地址
     * apiUrl_Transfer：转办接口地址
     * parmsMap: map参数
     * navigateUrl: 跳转页面URL
     *
     */
    public isGetData;
    @Input()
    public appParms = {
        apiUrl_AR: "",
        apiUrl_Sign: "",
        apiUrl_Transfer: "",
        parmsMap: "",
        navigateUrl: ""
    };
    @Input() //添加页面填写验证
    set saveId6Flag(data) {
        console.log(data);
        if (data == false) {
            this.isGetData = false;
        } else if (data) {
            this.isGetData = true;
        }
    }
    @Output() onSave = new EventEmitter<String>();
    @ViewChild("approvalModal") appModal: ModalComponent;
    @ViewChild("smModal") smModal: ModalDirective;
    @ViewChild("ngSelect") ngSelect: SelectModule;
    opinions: string = ""; //审批意见
    message: string; //提示信息
    isClick: boolean = false;
    appTypeName: string = "加签";
    userArr: Array<any> = [
        { id: "8a81e6c45cd4f5fe015cd4f7f6072737", text: "wuzk/邬正凯" },
        { id: "8a81e6c45cd4f5fe015cd4f7f48121d7", text: "liyuank/李媛" }
    ];
    selectUsers: Array<any> = [];
    errorMsg: string = "";
    approverType: string = "";
    isNav: boolean = false; //是否需要跳转页面
    isSubmit: boolean = false; // 默认不是提交

    ngOnInit() {
        // this.saveId6Flag = 1;
        // this.onSave.emit();
    }
    //保存事件
    public saveBill() {
        if (this.isClick) {
            this.WindowService.alert({
                message: "任务处理中或已处理,请勿多次点击 ",
                type: "fail"
            });
            return;
        }
        this.isSubmit = true;
        this.onSave.emit(this.opinions);
        this.isClick = true;
    }

    onApproval(approverType) {
        if (this.isGetData) {
            let headers = new Headers({
                ticket: localStorage.getItem("ticket")
            });
            let options = new RequestOptions({ headers: headers });
            //审批意见必填(同意、驳回)
            if (!this.opinions) {
                // this.message = "请填写审批意见";
                // this.smModal.show();
                this.WindowService.alert({
                    message: "请填写审批意见 ",
                    type: "fail"
                });
                return;
            }
            if (this.isClick) {
                this.WindowService.alert({
                    message: "任务处理中或已处理,请勿多次点击 ",
                    type: "fail"
                });
                // this.message = "任务处理中或已处理,请勿多次点击";
                // this.smModal.show();
                return;
            }
            if (
                (approverType == "Sign" || approverType == "Transfer") &&
                this.selectUsers.length == 0
            ) {
                // this.errorMsg = "未选择审批人";
                this.WindowService.alert({
                    message: "未选择审批人",
                    type: "fail"
                });
                return;
            }
            let tempObj = this._initApiappParms(approverType);
            if (tempObj instanceof Object && !!tempObj.url) {
                this.isSubmit = true;
                this.http
                    .post(tempObj.url, tempObj.params, options)
                    .subscribe(data => {
                        if (data.json().success) {
                            //window.history.back();

                            this.WindowService.alert({
                                message: "审批成功",
                                type: "success"
                            });
                            try {
                                window.opener.document
                                    .getElementById("searchChange")
                                    .click();
                            } catch (error) {}
                            setTimeout(function() {
                                window.close();
                            }, 1000);

                            // this.WindowService.confirm({
                            //     message: "审批成功,是否关闭页面？"
                            // }).subscribe({
                            //     next: v => {
                            //         if (v) {
                            //             window.close();
                            //         }
                            //     }
                            // });
                        } else {
                            this.isSubmit = false;
                            this.WindowService.alert({
                                message: "审批出错:" + data.json().message,
                                type: "fail"
                            });
                        }
                        // this.smModal.show();
                    });
            } else {
                this.WindowService.alert({
                    message: "接口地址不能为空！",
                    type: "fail"
                });
                // this.message = "接口地址不能为空！";
                // this.smModal.show();
                return;
            }
            this.isClick = true;
        }
    }

    _initApiappParms(approverType) {
        let tempObj;
        let appUserInfo = new Array();
        if (this.selectUsers.length != 0) {
            var element = "";
            for (var index = 0; index < this.selectUsers.length; index++) {
                element += this.selectUsers[index].id + ",";
            }
            if (element.length > 0) {
                element = element.substring(0, element.length - 1);
                appUserInfo[0] = element;
            }
        }
        // appUserInfo = this.selectUsers[0].text.split('/');
        // appUserInfo[1]=this.selectUsers[0].text;
        switch (approverType) {
            // case 'Approval':
            case "Reject":
                tempObj = {
                    url: this.appParms.apiUrl_AR,
                    params: {
                        parmsMap: this.appParms.parmsMap,
                        approveresult: approverType,
                        opinions: this.opinions
                    }
                };
                break;
            case "Sign":
                tempObj = {
                    url: this.appParms.apiUrl_Sign,
                    params: {
                        parmsMap: this.appParms.parmsMap,
                        opinions: this.opinions,
                        itcode: appUserInfo[0],
                        username: appUserInfo[1]
                    }
                };
                break;
            case "Transfer":
                tempObj = {
                    url: this.appParms.apiUrl_Transfer,
                    params: {
                        parmsMap: this.appParms.parmsMap,
                        opinions: this.opinions,
                        itcode: appUserInfo[0],
                        username: appUserInfo[1]
                    }
                };
                break;
        }
        return tempObj;
    }

    //返回
    goBack() {
        // this.router.navigate([this.appParms.navigateUrl]);
        //window.history.back();
        window.close();
    }

    onOpenModal(approverType) {
        if (this.isClick) {
            this.WindowService.alert({
                message: "任务处理中或已处理,请勿多次点击",
                type: "fail"
            });
            // this.message = "任务处理中或已处理,请勿多次点击";
            // this.smModal.show();
            return;
        }
        this.approverType = approverType;
        approverType == "Sign"
            ? (this.appTypeName = "加签")
            : (this.appTypeName = "转办");
        this.appModal.open();
    }

    onCancel() {
        this.selectUsers.length = 0;
        this.ngSelect["active"].length = 0;
        this.appModal.close();
    }

    selected(item) {
        let index = this.selectUsers.indexOf(item);
        if (index == -1) {
            this.selectUsers.push(item);
        }
        this.ngSelect["active"].length = 0;
    }

    ondelSeletUser(item) {
        let index = this.selectUsers.indexOf(item);
        if (index > -1) {
            this.selectUsers.splice(index, 1);
        }
    }

    dismiss() {
        this.smModal.hide();
    }
    close() {
        this.smModal.hide();
        setTimeout(() => {
            this.router.navigate([this.appParms.navigateUrl]);
        }, 300);
    }
}
