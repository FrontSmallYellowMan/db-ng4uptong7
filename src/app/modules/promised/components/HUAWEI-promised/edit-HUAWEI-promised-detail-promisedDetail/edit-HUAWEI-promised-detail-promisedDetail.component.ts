import { Component, OnInit ,Input,Output,EventEmitter} from "@angular/core";

import { HUAWEIFormData,CommitmentApplyData } from "../../../services/HUAWEIPromised.service";
import { element } from "protractor";

@Component({
  selector: "edit-HUAWEI-promisedDetail",
  templateUrl: "edit-HUAWEI-promised-detail-promisedDetail.component.html",
  styleUrls: [
    "edit-HUAWEI-promised-detail-promisedDetail.component.scss",
    "../edit-HUAWEI-promised-approvalDetail/edit-HUAWEI-promised-approvalDetail.component.scss"
  ]
})
export class EditHUAWEIPromisedDetailComponent implements OnInit {

  commitmentData:CommitmentApplyData=new CommitmentApplyData();//保存表单数据
  promisedTypeList:any[]=[];//保存子承诺类型列表
  keyPromised:string;//保存父承诺类型


  @Input() set HUAWEIFormData(v){
    if(v.CommitmentApply){
      this.commitmentData=v.CommitmentApply;
      this.promisedTypeList=v.CommitmentTypeDetailedList.filter(item=>item.IsCommit==='是');
      if(this.promisedTypeList.length>0){
        this.promisedTypeList.forEach(element=>{
          element['isChecked']=element.IsDacheng==='是'?true:false;
        });
      }
      this.keyPromised=v.CommitmentApplyTypeName;

    }
  };
  @Input() public status:string;//保存详情的查看状态（a:我的申请，e：我的审批，t：承诺跟踪）
  @Input() public approvalStatus:string;//保存审批状态，是否已经审批

  @Output() HUAWEIFormDatachange=new EventEmitter();



  constructor() {}

  ngOnInit() {
    
  }
  
}
