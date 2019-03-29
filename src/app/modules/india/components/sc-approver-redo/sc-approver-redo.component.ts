import { Component, OnInit, Input } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { MultiApproverSelectComponent } from "../multi-approver-select/multi-approver-select.component";

@Component({
  selector: 'db-sc-approver-redo',
  templateUrl: './sc-approver-redo.component.html',
  styleUrls: ['./sc-approver-redo.component.scss']
})
export class ScApproverRedoComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService
  ) { }
  @Input() WFApproverData;//审批数据
  modal: XcModalRef;//模态窗
  nodeItemIndex;
  maxApproverNum = 99;//最多可选人数

  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(MultiApproverSelectComponent);
    //模态窗口关闭时
    this.modal.onHide().subscribe(this.onApproverSelectModalHide);
  }
  //多选  选人 关闭
  onApproverSelectModalHide = selectedapprover => {
    this.WFApproverData[this.nodeItemIndex]["UserSettings"] = this.WFApproverData[this.nodeItemIndex]["UserSettings"] || [];
    if (selectedapprover && selectedapprover.length > 0) {
      selectedapprover.forEach(selectuser => {
        delete selectuser.checked;
        if (this.WFApproverData[this.nodeItemIndex]["UserSettings"].indexOf(selectuser) == -1 && 
        this.WFApproverData[this.nodeItemIndex]["UserSettings"].length < this.maxApproverNum) {
          this.WFApproverData[this.nodeItemIndex]["UserSettings"].push(selectuser);
        }
      });
    }
  }
  //多选  选人  打开
  onApproverSelectModalShow(approverlist,nodeitemindex){
    this.nodeItemIndex = nodeitemindex;
    this.modal.show({data:approverlist});//显示弹出框
  }
  //删除选中的审批人
  removeOne(item,i) {
    let index = this.WFApproverData[i]["UserSettings"].indexOf(item);
    this.WFApproverData[i]["UserSettings"].splice(index, 1);
  }

}
