import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';

import {
    OrderCreateService
} from './../../../services/order-create.service';

@Component({
  templateUrl: './add-TaxCode.component.html',
  styleUrls: ['./add-TaxCode.component.scss']
})
export class AddTaxCodeComponent implements OnInit{
    public modal:XcModalRef;
    public params = {
        TaxNumber: ""
    };//接口参数

    @ViewChildren(NgModel) inputList;//表单控件
    @ViewChildren('forminput') inputListDom;//表单控件DOM元素
    @ViewChild(NgForm) form ;//表单

    constructor(
        private xcModalService: XcModalService,
        private windowService: WindowService,
        private orderCreateService: OrderCreateService
    ){}

    ngOnInit(){

        //获得弹出框自身
        this.modal = this.xcModalService.getInstance(this);

        this.modal.onShow().subscribe((data) => {
            if(data){
                this.params = data;
            }
        })
    }

    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }

    //保存数据
    submit(e?){
        console.info(this.params)
        if (this.form.valid) {//表单验证通过
            if(!this.params["ChannelOfDistrubution"]){
                this.windowService.alert({ message: "请先选择分销渠道", type: "fail" });
            }
            if(!this.params["DepartmentProductGroup"]){
                this.windowService.alert({ message: "请先选择部门产品组", type: "fail" });
            }
            if(!this.params["InvoiceTypeId"]){
                this.windowService.alert({ message: "请先选择发票类型", type: "fail" });
            }
            this.orderCreateService.modifyCustomerTaxCode(this.params).subscribe(
                data => {
                    if(data.Result){
                        let info = JSON.parse(data.Data);
                        this.hide(this.params.TaxNumber);
                    }
                }
            );
        }
    }
}
