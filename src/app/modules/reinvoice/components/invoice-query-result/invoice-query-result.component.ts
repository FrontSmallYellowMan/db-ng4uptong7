import { Component, OnInit } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';

@Component({
  selector: 'db-invoice-query-result',
  templateUrl: './invoice-query-result.component.html',
  styleUrls: ['./invoice-query-result.component.scss']
})
export class InvoiceQueryResultComponent implements OnInit {

  constructor(
    private xcModalService: XcModalService
    ) { }

  modal: XcModalRef;
  resultData: any[] = [];//传入数据
  selectData: any[] = [];//输出数据
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe(data => {//显示弹窗
      if (data.data && data.data.length > 0) {
        this.resultData = data.data;
      }
      this.selectData = [];
      this.fullChecked = false;
      this.fullCheckedIndeterminate = false;
      if(this.resultData.length > 0){
        this.resultData.forEach(item => {
          item["checked"] = false;
        });
      }
      
    });
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onClickTd(item, i){
    let index = this.selectData.indexOf(item);
    index == -1? this.selectData.push(item): this.selectData.splice(index, 1);
    this.resultData[i]["checked"]? this.resultData[i]["checked"]=false: this.resultData[i]["checked"]=true;
  }

  //
  onCheckedChange(item){
    let index = this.selectData.indexOf(item);
    if (item.checked && index == -1) {
      this.selectData.push(item);
    }
    if (!item.checked && index > -1) {
      this.selectData.splice(index, 1);
    }
    
  }

  //确定
  sure(){
    this.modal.hide(this.selectData);
  }
  //取消
  cancel(){
    this.modal.hide();
  }

}
