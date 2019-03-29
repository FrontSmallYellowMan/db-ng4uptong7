import { Component, OnInit, Input,Output,EventEmitter } from "@angular/core";

import { CommitmentApplyData,HUAWEIFormData } from "../../../services/HUAWEIPromised.service";

@Component({
  selector: "edit-HUAWEI-basicDetail",
  templateUrl: "edit-HUAWEI-promised-detail-basicDetail.component.html",
  styleUrls: [
    "edit-HUAWEI-promised-detail-basicDetail.component.scss",
    "../edit-HUAWEI-promised-approvalDetail/edit-HUAWEI-promised-approvalDetail.component.scss"
  ]
})
export class EditHUAWEIBasicDetailComponent implements OnInit {
  commitmentData:CommitmentApplyData=new CommitmentApplyData();

  @Input() set HUAWEIFormData(v){
    if(v.CommitmentApply){
      this.commitmentData=v.CommitmentApply;
    }
  };
  @Output() HUAWEIFormDatachange=new EventEmitter();

  @Input() public status:string;//保存详情的查看状态（a:我的申请，e：我的审批，t：承诺跟踪）
  @Input() public approvalStatus:string;//保存审批状态，是否已经审批

  constructor() {}

  ngOnInit() {}
}
