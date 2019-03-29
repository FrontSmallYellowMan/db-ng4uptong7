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
import { Router } from "@angular/router";
import { WindowService } from "app/core";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { ScService } from "../../service/sc-service";
import { PageRefresh } from "../../service/pagerefresh.service";
declare var window: any;

@Component({
    selector: "db-sc-wf-approval",
    templateUrl: "./sc-wf-approval.component.html",
    styleUrls: ["./sc-wf-approval.component.scss"]
})
export class ScWfApprovalComponent implements OnInit {
    constructor(
        private WindowService: WindowService,
        private scService: ScService,
        private http: Http,
        private pageRef: PageRefresh,
        private windowService: WindowService
    ) {}

    @Input() appParms = null;
    @Input() viewInitParms = new ViewInitParm();
    @Output() onSave: EventEmitter<any> = new EventEmitter();
    @ViewChild("approvalModal") appModal: ModalComponent;
    @ViewChild("person") person;
    appTypeName: string = "加签";
    selectUsers: Array<any> = [];
    isClick: boolean = false; //防止重复点击
    approverType: string = ""; //审批操作类型 默认值加签
    opinions: string = ""; //审批意见
    BizConcernInfo: string = ""; //商务关注信息
    approveBeforeValid = false;
    @Input() set valid(v: boolean) {
        if (v === true) {
            this.approveBeforeValid = true;
            this.onApproval(this.approverType);
        }
    }

    ngOnInit() {}

    //审批之前
    onApprovalBefore(approverType) {
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
            this.WindowService.alert({ message: "未选择审批人", type: "fail" });
            return;
        }
        //驳回 审批意见必填
        if (!this.opinions && approverType == "Reject") {
            this.WindowService.alert({
                message: "请填写审批意见 ",
                type: "fail"
            });
            return;
        }
        if (!this.opinions) {
            this.opinions = "同意";
        }
        this.approverType = approverType;
        this.onSave.emit({
            opType: approverType,
            BizConcernInfo: this.BizConcernInfo
        });
    }

    //审批
    onApproval(approverType) {
        this.onApprovalBefore(approverType);
        if (this.approveBeforeValid !== true) {
            return;
        }
        switch (approverType) {
            case "Reject":
            case "Agree":
            case "Agree+":
                let appParam = {
                    TaskID: this.appParms.taskid,
                    Opinions: this.opinions,
                    ApproveResult: approverType
                };
                this.http
                    .post(this.appParms.apiUrl_AR, appParam)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.Result) {
                            this.appConfirm();
                        } else {
                            this.WindowService.alert({
                                message: data.Message,
                                type: "fail"
                            });
                        }
                    });
                break;
            case "Sign":
                let signParam = {
                    TaskID: this.appParms.taskid,
                    Opinions: this.opinions,
                    ItCode: this.selectUsers[this.selectUsers.length - 1][
                        "itcode"
                    ],
                    UserName: this.selectUsers[this.selectUsers.length - 1][
                        "name"
                    ]
                };
                this.http
                    .post(this.appParms.apiUrl_Sign, signParam)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.Result) {
                            this.appModal.close();
                            this.appConfirm();
                        } else {
                            this.WindowService.alert({
                                message: data.Message,
                                type: "fail"
                            });
                        }
                    });
                break;
            case "Transfer":
                let transferParam = {
                    TaskID: this.appParms.taskid,
                    Opinions: this.opinions,
                    ItCode: this.selectUsers[this.selectUsers.length - 1][
                        "itcode"
                    ],
                    UserName: this.selectUsers[this.selectUsers.length - 1][
                        "name"
                    ]
                };
                this.http
                    .post(this.appParms.apiUrl_Transfer, transferParam)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.Result) {
                            this.appModal.close();
                            this.appConfirm();
                        } else {
                            this.WindowService.alert({
                                message: data.Message,
                                type: "fail"
                            });
                        }
                    });
                break;
            default:
                break;
        }
        this.isClick = true;
        this.approveBeforeValid = false;
    }

    appConfirm() {
        // this.windowService.confirm({ message: "审批成功,是否关闭页面？" }).subscribe({
        //   next: (v) => {
        //     if (v) {
        //       this.pageRef.setPageNeedRef();//设置列表页面刷新
        //       window.close();
        //     }
        //   }
        // });
        this.windowService.alert({ message: "审批成功", type: "success" });
        this.pageRef.setPageNeedRef(); //设置列表页面刷新
        setTimeout(function() {
            window.close();
        }, 3000);
    }

    //取消
    goBack() {
        window.close();
    }

    //加签 转办 弹出层
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
    //暂存
    save() {
        this.onSave.emit({
            opType: "save",
            BizConcernInfo: this.BizConcernInfo
        });
    }

    onCancel() {
        this.selectUsers.length = 0;
        this.appModal.close();
    }

    //选人组件change事件
    changePerson(userInfo) {
        if (userInfo) {
            this.selectUsers.push(userInfo[0]);
        }
    }

    selected(item) {
        let index = this.selectUsers.indexOf(item);
        if (index == -1) {
            this.selectUsers.push(item);
        }
    }

    ondelSeletUser(item) {
        let index = this.selectUsers.indexOf(item);
        if (index > -1) {
            this.selectUsers.splice(index, 1);
        }
    }
}

export class ViewInitParm {
    isRiskApp: boolean = false;
    isEdit: boolean = false;
}
