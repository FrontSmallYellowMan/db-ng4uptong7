import { Component, OnInit, Input } from '@angular/core';
import { PaymentItem } from "../entitytype/formdata";
import { WindowService } from "../../../../../../core/index";

@Component({
  selector: 'db-paymentdetail',
  templateUrl: './paymentdetail.component.html',
  styleUrls: ['./paymentdetail.component.scss']
})
export class PaymentdetailComponent implements OnInit {

  constructor(private windowService: WindowService) { }
  @Input() validRequired: boolean = false;//是否必填
  @Input() isEdit: boolean = true;//是否可编辑
  @Input() paymentDetails: PaymentItem[] = [];//表格数据
  newItem = new PaymentItem();//添加新行
  isAdd = false;//是否添加新行

  ngOnInit() {
  }

  addItem(){
    this.isAdd = true;
  }
  saveItem(item){
    this.paymentDetails.push(this.newItem);
    this.isAdd = false;
    this.newItem = new PaymentItem();
  }
  delItem(index){
    if (this.paymentDetails.length == 1 && this.validRequired) {
      this.windowService.alert({ message: "付款信息至少保留一行", type: "fail" });
    }else{
      this.paymentDetails.splice(index, 1);
    }
  }

}
