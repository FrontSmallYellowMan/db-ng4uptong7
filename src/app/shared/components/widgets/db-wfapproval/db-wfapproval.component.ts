import { Component, OnInit, Input, ViewChild, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { HttpServer } from 'app/shared/services/db.http.server';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SelectModule } from 'ng2-select';
import { Router } from "@angular/router";
import { WindowService } from 'app/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
declare var window: any;

@Component({
  selector: 'db-wfapproval',
  templateUrl: './db-wfapproval.component.html',
  styleUrls: ['./db-wfapproval.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DbWfapprovalComponent implements OnInit {

  constructor(private dbHttp: HttpServer, private router: Router, private WindowService: WindowService) { }
  /**
   * 组件参数
   * apiUrl_AR: 通过驳回接口地址
   * apiUrl_Sign：加签接口地址
   * apiUrl_Transfer：转办接口地址
   * taskid: 任务ID
   * nodeid: 节点ID
   * 以下属于扩展参数
   * instanceid: 物料变更相关 实例ID
   * vouncher: 物料变更相关 物流器材凭证号
   * isRed: 冲红审批相关 是否红字
   */
  @Input() appParms = {
    apiUrl_AR: "",
    apiUrl_Sign: "",
    apiUrl_Transfer: "",
    taskid: "",
    nodeid: "",
    instanceid: "",
    vouncher: "",
    isRed: false
  }
  @Input() set hasSaved(v:boolean) {
    if (v === true) {
      this.isCheckOrSave = true;
      this.onApprovalCallBack(this.approverType);
    }
  };
  @Input() isRed: boolean = false;//是否显示红字按钮
  @Input() isShowAgreetbutton:boolean=false;//是否显示同意并加签风险总监
  @Output() onSave = new EventEmitter<any>();
  @Output() onApprovalComplateCallBack = new EventEmitter<any>();//审批完成后的回调函数
  @Output() onApprovalfailCallBack = new EventEmitter<any>();//审批失败后的回调函数
  @Output() onAlertSuccessCallBack=new EventEmitter<any>();//审批成功的提示框弹出后的处理函数
  
  @ViewChild('approvalModal') appModal: ModalComponent;
  @ViewChild('person') person;
  opinions: string = "";//审批意见
  isClick: boolean = false;
  appTypeName: string = "加签";
  selectUsers: Array<any> = [];
  approverType: string = "";
  _approverType:string;//保存第一次点击的按钮名称
  isCheckOrSave: boolean = false;//父组件数据 是否验证或保存成功
  

  ngOnInit() { }
  appConfirm(approverType){
    if (approverType == "Sign" || approverType == "Transfer") {
      this.appModal.close();
    }
    this.WindowService.alert({ message: "审批成功",type:"success" }).subscribe(()=>{
      window.close();
      this.onAlertSuccessCallBack.emit(approverType);//弹出“审批成功”提示框后的回调函数      
    });
    
  }
  
  onApproval(approverType) {
    this.approverType = approverType;

    if ((approverType == "Sign" || approverType == "Transfer") && this.selectUsers.length == 0) {
      this.WindowService.alert({ message: '未选择审批人', type: "fail" });
      return;
    }
    //驳回 审批意见必填
    if (!this.opinions && approverType == "Reject") {
      //this.opinions="";//将审批意见重置为空
      this.WindowService.alert({ message: '请填写审批意见 ', type: "fail" });
      return;
    }
    if (this.isClick && this.approverType === this._approverType) {
      this.WindowService.alert({ message: '任务处理中或已处理,请勿多次点击 ', type: "fail" });
      return;
    }

    if (this.isClick && this.approverType != this._approverType) {//如果isClick为true，表示提交过审批，approverType不相等表示两次点击是不同的按钮，那么就继续激活审批流程
      this.onApprovalCallBack(approverType);
    }

    this.onSave.emit({ operationtype: "approval", approvertype: approverType });
    this._approverType = this.approverType;//将变量保存
    console.log(this.isCheckOrSave);
  }

  onApprovalCallBack(approverType){
    if (this.isCheckOrSave !== true) {
      return;
    }
    if (!this.opinions) {
      this.opinions = "同意";
    }
    let tempObj = this._initApiappParms(approverType);
    if (tempObj instanceof Object && !!tempObj.url) {
      let headers = new Headers({ 'ticket': window.localStorage.getItem('ticket') });
      let options = new RequestOptions({ headers: headers });
      this.dbHttp.post(tempObj.url, tempObj.params, options).subscribe(data => {
        if (data.Result||data.success) {
          this.onApprovalComplateCallBack.emit();//审批成功的回调函数
          this.appConfirm(approverType);
        } else if(!data.Result&&data.Result!=undefined){
          this.WindowService.alert({ message: "审批出错:" + data.Message, type: "fail" }).subscribe(()=>{
            this.onApprovalfailCallBack.emit();//审批出错之后的回调函数
          });
        } else if(!data.success&&data.success!=undefined){
          this.WindowService.alert({ message: "审批出错:" + data.message, type: "fail" }).subscribe(()=>{
            this.onApprovalfailCallBack.emit();//审批出错之后的回调函数
          });            
        }         
      });
    } else {
      console.log("接口地址不能为空！");
      return;
    }
    this.opinions = "";
    this.isClick = true;
    this.hasSaved = false;
  }

  _initApiappParms(approverType) {
    let tempObj;
    switch (approverType) {
      case 'Approval':
      case 'Agree+':
      case 'Reject':
        tempObj = {
          url: this.appParms.apiUrl_AR,
          params: Object.assign({}, this.appParms,{
            taskid: this.appParms.taskid,
            approveresult: approverType,
            nodeid: this.appParms.nodeid,
            opinions: this.opinions,
            instanceid: this.appParms.instanceid,
            vouncher: this.appParms.vouncher
          })
        }
        break;
      case 'Sign':
        tempObj = {
          url: this.appParms.apiUrl_Sign,
          params: Object.assign({}, this.appParms,{
            taskid: this.appParms.taskid,
            opinions: this.opinions,
            itcode: this.selectUsers[this.selectUsers.length - 1]["itcode"],
            username: this.selectUsers[this.selectUsers.length - 1]["name"]
          })
        }
        break;
      case 'Transfer':
        tempObj = {
          url: this.appParms.apiUrl_Transfer,
          params: Object.assign({}, this.appParms,{
            taskid: this.appParms.taskid,
            opinions: this.opinions,
            itcode: this.selectUsers[this.selectUsers.length - 1]["itcode"],
            username: this.selectUsers[this.selectUsers.length - 1]["name"]
          })
        }
        break;
      case 'RedApproval':
        tempObj = {
          url: this.appParms.apiUrl_AR,
          params: Object.assign({}, this.appParms,{
            taskid: this.appParms.taskid,
            approveresult: approverType,
            nodeid: this.appParms.nodeid,
            opinions: this.opinions
          })
        }
        break;
    }
    return tempObj;
  }

  //返回
  goBack() {
    window.close();
  }

  onOpenModal(approverType) {
    if (this.isClick) {
      this.WindowService.alert({ message: '任务处理中或已处理,请勿多次点击', type: "fail" });
      return;
    }
    this.approverType = approverType;
    approverType == "Sign" ? this.appTypeName = "加签" : this.appTypeName = "转办";
    this.appModal.open();
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
