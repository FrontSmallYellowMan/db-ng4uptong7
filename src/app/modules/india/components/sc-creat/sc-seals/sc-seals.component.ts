import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { scSealsAddComponent } from './add-seals.component';

@Component({
  selector: 'db-sc-seals',
  templateUrl: './sc-seals.component.html',
  styleUrls: ['./sc-seals.component.scss','./../sc-creat.component.scss']
})
export class ScSealsComponent implements OnInit {
  @Output() scSeals = new EventEmitter();
  @Input() sealsInfo;
  @Input() platfromid;
  @Input() isEdit:boolean;
  public modalAddForm: XcModalRef;//添加印章
  public sealCodes = [];// 添加去重使用


  // 传入数据及获取数据方法。父组件内容
  // public SealInfoJson = {
  //     "SealData":[{}],
  //     "PrintCount":"4"
  // }
  //   this.approvers.sealChange(e['SealData']);//调用审核组件内部函数，修改用印管理人员数据
  // scSeals(e){
  //   console.info(e)
  // }
  constructor( private xcModalService:XcModalService, private windowService:WindowService) { }

  ngOnInit() {
      //在初始化的时候 创建模型
      this.modalAddForm = this.xcModalService.createModal(scSealsAddComponent);
      //模型关闭的时候 如果有改动，请求刷新
      this.modalAddForm.onHide().subscribe((data) => {

        if (data&&data.length>0){
            let seals = this.sealsInfo["SealData"];
            let sealCodes = this.sealCodes;
            //已存在印章数据编码
            this.sealsInfo["SealData"].forEach(function(item,index){
              if(sealCodes.indexOf(item.SealCode) == -1){
                  sealCodes.push(item.SealCode);
              }
            });
            //新添加印章数据编码，根据编码去重
            data.forEach(function(item,index){
                if(sealCodes.indexOf(item.SealCode) == -1){
                    sealCodes.push(item.SealCode);
                    seals.push(item);
                }
            });
            this.sealCodes = sealCodes;
            this.sealsInfo["SealData"] = seals;
            this.emitData();
        }
      })
  }
  addSeals(){
      if (!this.platfromid) {
          this.windowService.alert({ message: "请选择用印平台", type: "fail" });
          return;
      }
      this.modalAddForm.show(this.platfromid);
  }
  delseals(seal){
      let sealCodes = this.sealCodes;
      let seals = this.sealsInfo["SealData"];
      this.sealsInfo["SealData"] = seals.filter(item => item.SealCode != seal.SealCode);
      this.sealCodes = seals.filter(item => item != seal.SealCode);
      this.emitData();
  }

  emitData(){
      this.scSeals.emit(this.sealsInfo);
  }

}
