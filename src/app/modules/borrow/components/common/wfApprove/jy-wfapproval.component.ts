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
import { FlowInfoParam } from "./../../common-entity";
declare var window;
@Component({
    selector: "jy-wfapproval",
    templateUrl: "./jy-wfapproval.component.html",
    styleUrls: ["./jy-wfapproval.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class JyWfapprovalComponent implements OnInit {
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
     * taskid: 任务ID
     * nodeid: 节点ID
     * navigateUrl: 跳转页面URL
     *
     */
    public isGetData;
    @Input()
    public appParms = {
        apiUrl_AR: "",
        apiUrl_Sign: "",
        apiUrl_Transfer: "",
        //taskid: "",
        nodeId: "",
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
    @Input()
    isRed: boolean = false; //是否显示红字按钮
    @Output() onSave = new EventEmitter<string>();
    @ViewChild("approvalModal") appModal: ModalComponent;
    @ViewChild("smModal") smModal: ModalDirective;
    @ViewChild("ngSelect") ngSelect: SelectModule;
    opinions: string = ""; //审批意见
    message: string; //提示信息
    isClick: boolean = false;
    appTypeName: string = "加签";
    userArr: Array<any> = [
        { id: "8a81e6c45cd4f5fe015cd4f7f3c91ecd", text: "lichengg/李程" },
        { id: "8a81e6c45cd4f5fe015cd4f7f3c91ecd", text: "liusta/刘松涛" }
    ];
    selectUsers: Array<any> = [];
    errorMsg: string = "";
    approverType: string = "";
    appUrl_red = "/InvoiceRevise/ApproveChongHong";
    isNav: boolean = false; //是否需要跳转页面

    ngOnInit() {}
    //保存事件
    public saveBill() {
        this.onSave.emit(this.opinions);
    }

    onApproval(approverType) {
        if (this.isGetData) {
            let headers = new Headers({
                ticket: localStorage.getItem("ticket")
            });
            let options = new RequestOptions({ headers: headers });
            //审批意见必填(同意、驳回)
            if (!this.opinions) {
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
                this.http
                    .post(tempObj.url, tempObj.params, options)
                    .subscribe(res => {
                        let data = res.json();
                        if (data.success) {
                            this.WindowService.alert({
                                message: "审批成功",
                                type: "success"
                            });
                            window.history.back();
                        } else {
                            this.WindowService.alert({
                                message: "审批出错:" + data.message,
                                type: "fail"
                            });
                        }
                    });
            } else {
                this.WindowService.alert({
                    message: "接口地址不能为空！",
                    type: "fail"
                });
                return;
            }
            this.isClick = true;
        }
    }

    _initApiappParms(approverType) {
        let tempObj;
        let appUserInfo;
        let flowParam: FlowInfoParam = new FlowInfoParam(); //存放流程相关的参数 by weiyg
        if (this.selectUsers.length != 0) appUserInfo = this.selectUsers[0].id;

        switch (approverType) {
            case "Approval":
            case "Reject": {
                flowParam.nodeId = this.appParms.nodeId;
                flowParam.remark = this.opinions;
                tempObj = {
                    url: this.appParms.apiUrl_AR,
                    params: flowParam
                };
                break;
            }

            case "Sign": {
                flowParam.remark = this.opinions;
                flowParam.persons = appUserInfo; //userid
                tempObj = {
                    url: this.appParms.apiUrl_Sign,
                    params: flowParam
                };
                break;
            }
            case "Transfer": {
                flowParam.remark = this.opinions;
                flowParam.persons = appUserInfo;
                console.log(appUserInfo);
                tempObj = {
                    url: this.appParms.apiUrl_Transfer,
                    params: flowParam
                    //   params: {
                    //     taskid: this.appParms.taskid,
                    //     opinions: this.opinions,
                    //     itcode: appUserInfo[0],
                    //     username: appUserInfo[1]
                    //   }
                };
                break;
            }
        }

        return tempObj;
    }

    //返回
    goBack() {
        window.history.back();
    }

    onOpenModal(approverType) {
        if (this.isClick) {
            this.WindowService.alert({
                message: "任务处理中或已处理,请勿多次点击",
                type: "fail"
            });
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
        console.log(item);
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
