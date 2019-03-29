import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { NgForm, NgModel } from "@angular/forms";

import { FiscalInfo, FiscalAdjustService } from './../../../../services/fiscal-adjust.service';

@Component({
  templateUrl: './add-form.component.html',
  styleUrls: ['./../../../../scss/borrow-private.component.scss']
})
export class FiscalAddFormComponent implements OnInit {
  modal: XcModalRef;
  loading: boolean = true;//加载中
  submitOnce: boolean;
  fiscalObj: FiscalInfo;

  @ViewChildren(NgModel)
  inputList;//表单控件
  @ViewChildren('forminput')
  inputListDom;//表单控件DOM元素
  @ViewChild("form") form;

  constructor(
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private fiscalAdjustService: FiscalAdjustService) { }

  ngOnInit() {

    this.fiscalObj = new FiscalInfo();

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(() => {
      this.loading = false;
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    //清空数据
    this.form.resetForm();
    this.submitOnce = false;
  }

  //保存数据
  save() {
    this.submitOnce = true;
   if (!this.fiscalObj.adjustmentDate) {
      this.windowService.alert({ message: "请选择调整日期", type: 'fail' });
      return;
    }
    if (!this.form.valid) {//表单未验证通过
      let flag = false;
      let k = 0;
      for (let i = 1; i < this.inputList.length && !flag; i++) {//遍历表单控件
       
       
      
        if (this.inputList._results[i].invalid) {//验证未通过
          k=i-1;
          let ele = this.inputListDom._results[k];//存储该表单控件元素
          if (ele && ele.nativeElement) {
           
            ele.nativeElement.focus();//使该表单控件获取焦点
            return;
          }
          flag = true;
        }
      }
    }
  
   
    let callback = (data) => {//回调函数
      if (data.success) {
        this.windowService.alert({ message: "操作成功", type: 'success' });
        this.hide(true);//关闭弹出框并刷新
      } else if (data.status === 2001) {
        //验证失败
        let errorMessage = "";
        data.list.forEach(item => {
          errorMessage += item.message + ";";
        });
        errorMessage = errorMessage.substring(0, errorMessage.length - 1);
        this.windowService.alert({ message: errorMessage, type: "fail" });
        this.hide(true);
      } else if (data.status === 500) {
        this.windowService.alert({ message: data.message, type: "fail" });
        this.hide(true);
      }
    };
    this.fiscalAdjustService.addFiscal(this.fiscalObj).then(callback);//添加
  }
}