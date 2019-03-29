import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { Headers,RequestOptions } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Router,ActivatedRoute } from '@angular/router';
import { WindowService } from 'app/core';
import { SubmitMessageService } from '../../services/submit-message.service';

import { ProcurementTplObj,ProcurementTemplateService } from './../../services/procurement-template.service';

declare var window;

@Component({
  templateUrl: 'procurement-template-edit.component.html',
  styleUrls: ['procurement-template-edit.component.scss', './../../scss/procurement.scss']
})
export class ProcurementTemplateEdit implements OnInit {
  applyTplObj = new ProcurementTplObj();
  @ViewChild(NgForm)
  applyTplForm;//表单
  public selectInfo = { //下拉框数据
    taxrate: [],
    currency: []
}
public avtiveCur;
public activeTax;
public TaxrateFlag = false;//税率是否可用标识
public oldTempLateName:string="";//如果是编辑页面，那么只有当填写的模板名称和之前的名称不相同时才会触发验证 

  constructor(private dbHttp: HttpServer,
    private windowService: WindowService,
    private routerInfo: ActivatedRoute,
    private router: Router,
    private submitMessageService: SubmitMessageService,
    private procurementTemplateService: ProcurementTemplateService,) {
  }
  ngOnInit() {
    this.applyTplObj.ID = this.routerInfo.snapshot.params['id'] || null;//从路由中取出变量id的值
    if (this.applyTplObj.ID) {//编辑
        this.procurementTemplateService.getProcurementTplOne(this.applyTplObj.ID).then(data=>{
            console.log(data);
            if(data.Result){
                this.applyTplObj=data.Data;
                this.oldTempLateName=this.applyTplObj.Name;//保存原始的模板名称
                this.avtiveCur = [{
                    id: this.applyTplObj.CurrencyCode,
                    text: this.applyTplObj.Currency
                }];
                this.activeTax = [{
                    id: this.applyTplObj.RateCode,
                    text: this.applyTplObj.RateName
                }];
            }else{
                this.windowService.alert({ message:"接口异常", type: 'fail' });
            }
        });
    } else {//新建
        let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });
        this.dbHttp.get("base/GetCurrentUserInfo", options).subscribe(data => {//获取登录人信息
            if (data.Result) {
                let loginData = JSON.parse(data.Data);
                this.applyTplObj.SYB = loginData.SYBMC;//事业部名称
            }
        })
    }
    

    let Currencyurl = "InitData/GetCurrencyInfo";
    let Taxrateurl = "InitData/GetTaxrateInfo";
    this.dbHttp.post(Currencyurl).subscribe(data => {
        if (data.Result) {
            let locaData = JSON.parse(data.Data);
            this.selectInfo.currency = this.submitMessageService.onTransSelectInfosOther(locaData, "currencycode", "currencyname");
        }else {
            this.windowService.alert({ message: '接口异常', type: 'fail' });
        }
    })
    this.dbHttp.post(Taxrateurl).subscribe(data => {
        if (data.Result) {
            let locaData = JSON.parse(data.Data);
            this.selectInfo.taxrate = this.submitMessageService.onTransSelectInfos(locaData, "taxcode", "taxratename", "taxrate");
        }else {
            this.windowService.alert({ message: '接口异常', type: 'fail' });
        }
    })
  }
  CompanyChange(e) {//我方主体变化
    this.applyTplObj.CompanyCode = e[1];
  }
  sendDataFour(e) {//填写工厂后
    this.submitMessageService.checkFour(e);
    let endOne = e.substring(0, 2);
    let endTwo = this.applyTplObj.CompanyCode.substring(2, 4);
    if (endOne != endTwo) {
        this.windowService.alert({ message: '工厂代码前两位不等于我方主体的后两位，请检查', type: 'fail' });
    }
  }
  VendorChange(e) {//供应商选中
    console.log(e);
 
    //this.avtiveCur = data;
    this.applyTplObj.VendorNo = e[1];
    //this.applyTplObj.Currency = "美元";
    //this.applyTplObj.CurrencyCode = "";
    //this.applyTplObj.PaymentTermscode = e[5];
    //this.applyTplObj.VendorCountry = e[6];
    if(e[1].substring(0,2)==="40"){
        this.activeTax = [{
            id:"J0",
            text:"J0--0% 进项税，中国 "
        }];
        this.applyTplObj.RateValue=0;
        this.applyTplObj.RateCode= "J0";
        this.applyTplObj.RateName= "J0--0% 进项税，中国 ";
        this.applyTplObj.VendorCountry = '1';
        this.TaxrateFlag = true;
        this.avtiveCur=[{id:'USD',text:"美元"}]
    }else{
        this.TaxrateFlag = false;
        this.applyTplObj.VendorCountry = '0';
    }

    // if(this.applyTplObj.VendorNo.substring(0,2)=="10"){
    //     this.IsMid=true;
    // }else{
    //     this.IsMid=false;
    // }
}
 getTaxrate(e) {// 税率选中
  for (let i = 0, len = this.selectInfo.taxrate.length; i < len; i++) {
      if (e.id == this.selectInfo.taxrate[i].id) {
          this.applyTplObj.RateValue = this.selectInfo.taxrate[i].other;
      }
  }
  this.applyTplObj.RateName = e.text;
  this.applyTplObj.RateCode = e.id;
}

getCurrency(e) {//币种选择
    this.applyTplObj.Currency = e.text;
    this.applyTplObj.CurrencyCode = e.id;
}
  addTplObj() {//保存
    if(this.applyTplForm.valid){//验证通过
      this.procurementTemplateService.editProcurementTpl(this.applyTplObj).then(data => {//新增
        if (data.Result) {
            this.windowService.alert({ message:"保存成功", type: 'success' }).subscribe(()=>{
                localStorage.setItem('procurement-template','save');
                window.close();
            });
            //this.router.navigate(['procurement/procurementTpl-list']);
        }else {
            this.windowService.alert({ message: data.Message, type: 'fail' });
        }
      })
    }else{
      let self = this;
      let alertFun = function (val, str) {
          if (!val) {
              self.windowService.alert({ message: str + '不能为空', type: 'warn' });
              return;
          }
      }
      alertFun(this.applyTplObj.Name, "模板名称");
    //   alertFun(this.applyTplObj.CompanyName, "我方主体");
    //   alertFun(this.applyTplObj.FactoryCode, "工厂");
    //   alertFun(this.applyTplObj.Vendor, "供应商");
    //   alertFun(this.applyTplObj.RateName, "税率");
    //   alertFun(this.applyTplObj.CurrencyCode, "币种");
    }
  }
  cancel() {//取消
    window.close();
  }

  //验证模板名称是否存在
  testTemplateName(){

      if(this.oldTempLateName&&this.oldTempLateName===this.applyTplObj.Name) return;

      this.procurementTemplateService.testTemplateName(this.applyTplObj.Name).then(data=>{
        if(!data.Result){
            this.windowService.alert({message:data.Message,type:"fail"}).subscribe(()=>{
                this.applyTplObj.Name="";
            });
        }      
    })
  }

}