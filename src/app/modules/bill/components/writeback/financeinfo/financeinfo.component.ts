
import {map} from 'rxjs/operators/map';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { billBackService } from '../../../services/bill-back.service';
import { date, tab, tabService } from '../bill-detail/service/tab.service';
import { WindowService } from 'app/core';
import { HttpServer } from 'app/shared/services/db.http.server';

declare var $: any;
import 'rxjs/Rx';
@Component({
  selector: 'iq-financeinfo',
  templateUrl: './financeinfo.component.html',
  styleUrls: ['./financeinfo.component.scss']
})

export class FinanceinfoComponent implements OnInit {
  @Input() nameType;
  @Input() billTypeId;
  @Input() returnMoney;
  @Input() examineInvoice;
  @Input() redTypeFlag;
  @Input() applybusz;
  @Input()
  set materialSelected(data) {
    if (typeof (data) == "string") {
      this.redTypeSave.push(
        new testRedType(
          data
        )
      )
      if (this.redTypeSave.length > 2) {
        if (this.redTypeSave[this.redTypeSave.length - 1] != data) {
          this.invoiceArr = [];
          this.tabDataList = [];
          this.tabListOut.emit(true)
          this.meterialData = [];
        }
      }
    } else {
      if (!data) {
        this.invoiceArr = [];
        this.tabDataList = [];
        this.tabListOut.emit(true)
        this.meterialData = [];
      }
    }
  };
  //更换类型刷新数据
  @Input()
  set changeRedType(data) {
    // this.ChangeDetectorRef.detectChanges()
    this.redTypeSave.push(
      new testRedType(
        data
      )
    )
    if (this.redTypeSave.length > 2) {
      if (this.redTypeSave[this.redTypeSave.length - 1] != data) {
        this.invoiceArr = [];
        this.tabDataList = [];
        this.tabListOut.emit(true)
        this.meterialData = [];
      }
    }
  };
  @Output() backtabDataList = new EventEmitter();
  @Output() ReBackTableData = new EventEmitter();//返回物料数据
  @Output() backInvoice = new EventEmitter();
  @Output() returnMaterialData = new EventEmitter();//返回给父组件
  @Output() RefundmoDalDate = new EventEmitter();
  @Output() tabListOut = new EventEmitter();
  public redTypeSave = [];//判断类型更新暂存
  public showMoreMessageBack(e) {
    this.moreMessageShow = e;
  }
  //多条数据判断
  public meterialBack;
  public dataSource;
  public QueryWhereType;


  public getQueryWhere(e) {
    this.QueryWhereType = $("#queryWhere option:selected")[0].innerHTML
  }
  public changModalInput(e) {
    if (!this.redTypeFlag) {
      this.WindowService.alert({ message: '请选择冲红类型', type: 'success' });
    }
    if (e.target.value == "订单号") {
      this.ordernoValue = "";
    }
    if (e.target.value == "外部发票号") {
      this.externalinvoicenoValue = '';
    }
  }
  //客户编号及姓名

  // public customNum;
  public moneyMessage = [];
  public getPostCustomName(e, item) {
    if (e == '') {
      item.customer = '';
    } else {
      let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
      let options = new RequestOptions({ headers: headers });
      let url = "InvoiceRevise/GetCustomerName/" + e;
      this.dbhttp.post(url, [], options).pipe(
        map(res => res))
        .subscribe(
        (data) => {
          item.customer = data.Data
        });
    }
  }

  public backTableDate = [];
  public backTableDateEx: materialData;
  public saveInvoice(e) {
    this.backInvoice.emit(e)
  }
  public returnMaterial(e) {
    this.returnMaterialData.emit(e);
  }

  public externalinvoicenoValue = "外部发票号";
  public ordernoValue = "订单号";
  public modalSendArray;//物料请求数据
  public tabDataList = [];

  public moreMessageShow = false;
  public meterialData = [];
  public modalDataChild;
  //财务信息删除
  public removeItems(tabledata, item) {
    this.tabService.removeItems(tabledata, item);

    for (let i = 0, len = this.tabDataList.length; i < len; i++) {
      if (this.tabDataList[i].value == item.internalinvoiceno) {
        this.tabDataList.splice(i, 1);
      }
    }
  }
  //获取财务信息
  public getInvoice(e) {
    let url;
    let regNunmber = /^[0-9]*$/;
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    if (e.id == "queryExternalinvoiceno") {
      url = "InvoiceRevise/GetInvoiceByExternalNo/";
      url = url + this.externalinvoicenoValue;
    }
    else if (e.id == "queryOrderno") {
      url = "InvoiceRevise/GetInvoiceByOrderNo/";
      url = url + this.ordernoValue
      //  if(!regNunmber.test(this.ordernoValue)){
      //      this.WindowService.alert({ message: "请输入正确的发票号或订单号", type: 'success' });
      // }
    }
    this.dbhttp.post(url, [], options)
      .toPromise()
      .then(res => {
        let modalDate = JSON.parse(res.Data);
        let backMessage = res.Message
        if (backMessage == null) {
          if (modalDate.length == 1) {
            let el = modalDate[0];
            if (this.applybusz.company != modalDate[0].company || this.applybusz.busi != modalDate[0].busi) {
              this.WindowService.alert({ message: '同一客户，同一公司，同业务范围方可添加', type: 'success' });
              return;
            }
            this.changeEventObject(el, this.invoice)
            this.material.internalinvoiceno = el.internalinvoiceno;
            this.moneyMessage = [];
            for (let key in el) {
              if (el[key] != "deliveryno") {
                this.moneyMessage.push(el[key])
              }
              this.modalSendArray = [
                new modalSendObj(modalDate[0].internalinvoiceno, modalDate[0].orderno)
              ]
            }
            this.dbhttp.post("InvoiceRevise/GetMaterial", this.modalSendArray, options
            )
              .toPromise()
              .then(res => {
                let localData = JSON.parse(res.Data);
                let materialLocal = localData[0].material;
                for(let i=0,len=materialLocal.length;i<len;i++){
                  this.backTableDate.push(materialLocal[i]);
                }
                // this.backTableDate.push(localData[0].material[0]);
                //保存数据
                this.invoice.originalmoney = Number(this.invoice.originalmoney)//originalmoney转化
                
                this.changeEventObject(localData[0], this.invoice)
                //财务信息
                let materialFlag = true;
                if (!this.invoiceArr.length) {
                  this.invoiceArr.push(
                    new invoiceData(
                      this.invoice.invoiceId,
                      this.invoice.applyId,
                      this.invoice.originalcustomercode,
                      this.invoice.originalcustomer,
                      this.invoice.orderno,
                      this.invoice.internalinvoiceno,
                      this.invoice.externalinvoiceno,
                      this.invoice.invoicedate,
                      this.invoice.originalmoney,
                      this.invoice.originalreceiptdate,
                      this.invoice.originalcomplexaccount,
                      this.invoice.money,
                      this.invoice.customercode,
                      this.invoice.customer,
                      this.invoice.receiptdate,
                      this.invoice.complexaccout,
                      this.invoice.rednoticeno,
                      this.invoice.ZCRorderno,
                      this.invoice.ZDRorderno,
                      this.invoice.REorderno,
                      this.invoice.REdeliveryno,
                      this.invoice.ZTYorderno,
                      this.invoice.ZTYdeliveryno,
                      this.invoice.ZREorderno,
                      this.invoice.ZREdeliveryno,
                      this.invoice.ZSDorderno,
                      this.invoice.ZSDdeliveryno,
                      this.invoice.ZORorderno,
                      this.invoice.ZORdeliveryno,
                      this.invoice.PURCH_NO_C,
                      this.invoice.seller,
                      this.invoice.sellercode,
                      this.invoice.SALES_ORG,
                      this.invoice.DISTR_CHAN,
                      this.invoice.DIVISION,
                      this.invoice.PRICE_DATE,
                      this.invoice.PMNTTRMS,
                      this.invoice.SALES_OFF,
                      this.invoice.SALES_GRP,
                      this.invoice.SHIP_TYPE,
                      this.invoice.TransitMode,
                      this.invoice.TransitModeCode,
                      this.invoice.SDF_KUNNR,
                      this.invoice.SDF_NAME,
                      this.invoice.detailaddress,
                      this.invoice.province,
                      this.invoice.city,
                      this.invoice.citycode,
                      this.invoice.district,
                      this.invoice.zipcode,
                      this.invoice.connecter,
                      this.invoice.phone,
                      this.invoice.signstandard,
                      this.invoice.AUART,
                      this.invoice.ZTERM
                    )
                  )
                }
                else {
                  let flag = true;
                  for (let i = 0, len = this.invoiceArr.length; i < len; i++) {
                    //判断是否是新的发票号 
                    if (this.invoiceArr[i].internalinvoiceno == this.invoice.internalinvoiceno) {
                      flag = false;
                      this.WindowService.alert({ message: '系统发票号相同', type: 'success' });
                    }
                    if (this.invoiceArr[i].originalcustomer != this.invoice.originalcustomer) {
                      flag = false;
                      materialFlag = false;
                      this.WindowService.alert({ message: '同一客户，同一公司，同业务范围方可添加', type: 'success' });
                    }
                  }

                  if (flag) {
                    this.invoiceArr.push(
                      new invoiceData(
                        this.invoice.invoiceId,
                        this.invoice.applyId,
                        this.invoice.originalcustomercode,
                        this.invoice.originalcustomer,
                        this.invoice.orderno,
                        this.invoice.internalinvoiceno,
                        this.invoice.externalinvoiceno,
                        this.invoice.invoicedate,
                        this.invoice.originalmoney,
                        this.invoice.originalreceiptdate,
                        this.invoice.originalcomplexaccount,
                        this.invoice.money,
                        this.invoice.customercode,
                        this.invoice.customer,
                        this.invoice.receiptdate,
                        this.invoice.complexaccout,
                        this.invoice.rednoticeno,
                        this.invoice.ZCRorderno,
                        this.invoice.ZDRorderno,
                        this.invoice.REorderno,
                        this.invoice.REdeliveryno,
                        this.invoice.ZTYorderno,
                        this.invoice.ZTYdeliveryno,
                        this.invoice.ZREorderno,
                        this.invoice.ZREdeliveryno,
                        this.invoice.ZSDorderno,
                        this.invoice.ZSDdeliveryno,
                        this.invoice.ZORorderno,
                        this.invoice.ZORdeliveryno,
                        this.invoice.PURCH_NO_C,
                        this.invoice.seller,
                        this.invoice.sellercode,
                        this.invoice.SALES_ORG,
                        this.invoice.DISTR_CHAN,
                        this.invoice.DIVISION,
                        this.invoice.PRICE_DATE,
                        this.invoice.PMNTTRMS,
                        this.invoice.SALES_OFF,
                        this.invoice.SALES_GRP,
                        this.invoice.SHIP_TYPE,
                        this.invoice.TransitMode,
                        this.invoice.TransitModeCode,
                        this.invoice.SDF_KUNNR,
                        this.invoice.SDF_NAME,
                        this.invoice.detailaddress,
                        this.invoice.province,
                        this.invoice.city,
                        this.invoice.citycode,
                        this.invoice.district,
                        this.invoice.zipcode,
                        this.invoice.connecter,
                        this.invoice.phone,
                        this.invoice.signstandard,
                        this.invoice.AUART,
                        this.invoice.ZTERM
                      )
                    )
                  }
                }
                //tab栏切换
                this.tabDataList = [];
                for (let i = 0, len = this.invoiceArr.length; i < len; i++) {
                  this.tabDataList.push(new tabListData(
                    this.invoiceArr[i].internalinvoiceno,
                    false
                  ))
                }
                this.tabDataList[0].active = true;
                this.backtabDataList.emit(this.tabDataList);
                this.ReBackTableData.emit(this.backTableDate);
                //保存表单数据
                let materialArrLocal=[];
                for (let i = 0, len = materialLocal.length; i < len; i++) {
                  this.changeEventObject(materialLocal[i], this.material);
                  this.material.num = Number(this.material.num);
                  this.material.originalbackmoney = Number(this.material.originalbackmoney);
                  this.material.originalmoney = Number(this.material.originalmoney);
                  materialArrLocal.push(JSON.parse(JSON.stringify(this.material)));
                }
               
                //物料信息
                if (materialFlag)
                  if (!this.meterialData.length) {
                    for (let i = 0, len = materialArrLocal.length; i < len; i++) {
                      this.meterialData.push(
                        new materialData(
                          materialArrLocal[i].materialId,
                          materialArrLocal[i].invoiceId,
                          materialArrLocal[i].internalinvoiceno,
                          materialArrLocal[i].projcode,
                          materialArrLocal[i].originalmaterialcode,
                          materialArrLocal[i].materialcode,
                          materialArrLocal[i].originaldescription,
                          materialArrLocal[i].description,
                          materialArrLocal[i].num,
                          materialArrLocal[i].factory,
                          materialArrLocal[i].originalstoragelocation,
                          materialArrLocal[i].storagelocation,
                          materialArrLocal[i].originalbatchno,
                          materialArrLocal[i].batchno,
                          materialArrLocal[i].originalmoney,
                          materialArrLocal[i].money,
                          materialArrLocal[i].originalbackmoney,
                          materialArrLocal[i].backmoney,
                          materialArrLocal[i].returnnum,
                          materialArrLocal[i].returnstoragelocation,
                          materialArrLocal[i].specifystoragelocation,
                          materialArrLocal[i].deliveryno,
                          materialArrLocal[i].ordertype,
                          materialArrLocal[i].groupno,
                          materialArrLocal[i].ERPorderno,
                          materialArrLocal[i].CURRENCY,
                          materialArrLocal[i].invoiceremark
                        )
                      )
                    }
                  }
                  else {
                    let flag = true;
                    for (let i = 0, len = this.meterialData.length; i < len; i++) {
                      if (this.meterialData[i].internalinvoiceno == this.material.internalinvoiceno) {
                        flag = false;
                      }
                    }
                    if (flag) {
                      for (let i = 0, len = materialArrLocal.length; i < len; i++) {
                        this.meterialData.push(
                          new materialData(
                            materialArrLocal[i].materialId,
                            materialArrLocal[i].invoiceId,
                            materialArrLocal[i].internalinvoiceno,
                            materialArrLocal[i].projcode,
                            materialArrLocal[i].originalmaterialcode,
                            materialArrLocal[i].materialcode,
                            materialArrLocal[i].originaldescription,
                            materialArrLocal[i].description,
                            materialArrLocal[i].num,
                            materialArrLocal[i].factory,
                            materialArrLocal[i].originalstoragelocation,
                            materialArrLocal[i].storagelocation,
                            materialArrLocal[i].originalbatchno,
                            materialArrLocal[i].batchno,
                            materialArrLocal[i].originalmoney,
                            materialArrLocal[i].money,
                            materialArrLocal[i].originalbackmoney,
                            materialArrLocal[i].backmoney,
                            materialArrLocal[i].returnnum,
                            materialArrLocal[i].returnstoragelocation,
                            materialArrLocal[i].specifystoragelocation,
                            materialArrLocal[i].deliveryno,
                            materialArrLocal[i].ordertype,
                            materialArrLocal[i].groupno,
                            materialArrLocal[i].ERPorderno,
                            materialArrLocal[i].CURRENCY,
                            materialArrLocal[i].invoiceremark
                          )
                        )
                      }
                    }
                  }
                this.returnMaterialData.emit(this.meterialData);//物料号
              })
          }
          else if (modalDate.length > 1) {
            this.moreMessageShow = true;
            this.meterialBack = function (e) {
              for (let i = 0; i < modalDate.length; i++) {
                for (let n = 0; n < e.length; n++) {
                  if (e[n].invoiceno == modalDate[i].internalinvoiceno) {
                    if (this.applybusz.company != modalDate[i].company || this.applybusz.busi != modalDate[i].busi) {
                      this.WindowService.alert({ message: '同一客户，同一公司，同业务范围方可添加', type: 'success' });
                      return;
                    }
                  }
                }
              }
              this.moreMessageShow = false;
              let url = "InvoiceRevise/GetMaterial";
              this.dbhttp.post(url, e, options)
                .toPromise()
                .then(res => {
                  let localData = JSON.parse(res.Data);

                  let materialFlag = true;
                  // this.meterialData = [];
                  if (!this.invoiceArr.length) {
                    for (let i = 0; i < localData.length; i++) {
                      this.invoiceArr.push(
                        new invoiceData(
                          modalDate[i].invoiceId,
                          modalDate[i].applyId,
                          modalDate[i].originalcustomercode,
                          modalDate[i].originalcustomer,
                          modalDate[i].orderno,
                          modalDate[i].internalinvoiceno,
                          modalDate[i].externalinvoiceno,
                          modalDate[i].invoicedate,
                          modalDate[i].originalmoney,
                          modalDate[i].originalreceiptdate,
                          modalDate[i].originalcomplexaccount,
                          modalDate[i].money,
                          modalDate[i].customercode,
                          modalDate[i].customer,
                          modalDate[i].receiptdate,
                          modalDate[i].complexaccout,
                          modalDate[i].rednoticeno,
                          modalDate[i].ZCRorderno,
                          modalDate[i].ZDRorderno,
                          modalDate[i].REorderno,
                          modalDate[i].REdeliveryno,
                          modalDate[i].ZTYorderno,
                          modalDate[i].ZTYdeliveryno,
                          modalDate[i].ZREorderno,
                          modalDate[i].ZREdeliveryno,
                          modalDate[i].ZSDorderno,
                          modalDate[i].ZSDdeliveryno,
                          modalDate[i].ZORorderno,
                          modalDate[i].ZORdeliveryno,
                          modalDate[i].PURCH_NO_C,
                          modalDate[i].seller,
                          modalDate[i].sellercode,
                          modalDate[i].SALES_ORG,
                          modalDate[i].DISTR_CHAN,
                          modalDate[i].DIVISION,
                          modalDate[i].PRICE_DATE,
                          modalDate[i].PMNTTRMS,
                          modalDate[i].SALES_OFF,
                          modalDate[i].SALES_GRP,
                          modalDate[i].SHIP_TYPE,
                          modalDate[i].TransitMode,
                          modalDate[i].TransitModeCode,
                          modalDate[i].SDF_KUNNR,
                          modalDate[i].SDF_NAME,
                          modalDate[i].detailaddress,
                          modalDate[i].province,
                          modalDate[i].city,
                          modalDate[i].citycode,
                          modalDate[i].district,
                          modalDate[i].zipcode,
                          modalDate[i].connecter,
                          modalDate[i].phone,
                          modalDate[i].signstandard,
                          modalDate[i].AUART,
                          modalDate[i].ZTERM
                        )
                      )
                    }
                    for (let i = 0; i < localData.length; i++) {
                      this.invoiceArr[i].internalinvoiceno = localData[i].internalinvoiceno,
                        this.invoiceArr[i].originalcomplexaccount = localData[i].originalcomplexaccount
                    }
                  }
                  else {
                    let flag = true;
                    for (let i = 0, len = this.invoiceArr.length; i < len; i++) {
                      //判断是否是新的发票号 
                      for (let n = 0, len = localData.length; n < len; n++) {
                        if (this.invoiceArr[i].internalinvoiceno == localData[n].internalinvoiceno) {
                          flag = false;
                          materialFlag = false;
                          this.WindowService.alert({ message: '系统发票号相同', type: 'success' });
                        };
                        if (this.invoiceArr[i].originalcustomer != modalDate[i + 1].originalcustomer) {
                          flag = false;
                          materialFlag = false;
                          this.WindowService.alert({ message: '同一客户，同一公司，同业务范围方可添加', type: 'success' });
                        }
                      }
                    };
                    if (flag) {
                      for (let i = 0; i < modalDate.length; i++) {
                        for (let n = 0; n < localData.length; n++) {
                          if (modalDate[i].internalinvoiceno == localData[n].internalinvoiceno) {
                            this.invoiceArr.push(
                              new invoiceData(
                                modalDate[i].invoiceId,
                                modalDate[i].applyId,
                                modalDate[i].originalcustomercode,
                                modalDate[i].originalcustomer,
                                modalDate[i].orderno,
                                modalDate[i].internalinvoiceno,
                                modalDate[i].externalinvoiceno,
                                modalDate[i].invoicedate,
                                modalDate[i].originalmoney,
                                modalDate[i].originalreceiptdate,
                                modalDate[i].originalcomplexaccount,
                                modalDate[i].money,
                                modalDate[i].customercode,
                                modalDate[i].customer,
                                modalDate[i].receiptdate,
                                modalDate[i].complexaccout,
                                modalDate[i].rednoticeno,
                                modalDate[i].ZCRorderno,
                                modalDate[i].ZDRorderno,
                                modalDate[i].REorderno,
                                modalDate[i].REdeliveryno,
                                modalDate[i].ZTYorderno,
                                modalDate[i].ZTYdeliveryno,
                                modalDate[i].ZREorderno,
                                modalDate[i].ZREdeliveryno,
                                modalDate[i].ZSDorderno,
                                modalDate[i].ZSDdeliveryno,
                                modalDate[i].ZORorderno,
                                modalDate[i].ZORdeliveryno,
                                modalDate[i].PURCH_NO_C,
                                modalDate[i].seller,
                                modalDate[i].sellercode,
                                modalDate[i].SALES_ORG,
                                modalDate[i].DISTR_CHAN,
                                modalDate[i].DIVISION,
                                modalDate[i].PRICE_DATE,
                                modalDate[i].PMNTTRMS,
                                modalDate[i].SALES_OFF,
                                modalDate[i].SALES_GRP,
                                modalDate[i].SHIP_TYPE,
                                modalDate[i].TransitMode,
                                modalDate[i].TransitModeCode,
                                modalDate[i].SDF_KUNNR,
                                modalDate[i].SDF_NAME,
                                modalDate[i].detailaddress,
                                modalDate[i].province,
                                modalDate[i].city,
                                modalDate[i].citycode,
                                modalDate[i].district,
                                modalDate[i].zipcode,
                                modalDate[i].connecter,
                                modalDate[i].phone,
                                modalDate[i].signstandard,
                                modalDate[i].AUART,
                                modalDate[i].ZTERM
                              )
                            )
                          }
                        }
                      }

                      for (let i = 0; i < localData.length; i++) {
                        this.invoiceArr[i].originalcomplexaccount = localData[i].originalcomplexaccount
                      }
                    };
                  }
                  this.tabDataList = [];
                  for (let i = 0, len = this.invoiceArr.length; i < len; i++) {
                    this.tabDataList.push(new tabListData(
                      this.invoiceArr[i].internalinvoiceno,
                      false
                    ));
                    for (let n = 0, len = localData.length; n < len; n++) {
                      if (this.invoiceArr[i].internalinvoiceno == localData[n].internalinvoiceno) {
                        this.changeEventObject(localData[n], this.invoiceArr[i]);
                      }
                    }
                  }
                  this.tabDataList[0].active = true;
                  this.backtabDataList.emit(this.tabDataList);
                  let data = [];
                  for (let i = 0; i < localData.length; i++) {
                    //物料添加发票号
                    for (let n = 0; n < localData[i].material.length; n++) {
                      localData[i].material[n].internalinvoiceno = localData[i].internalinvoiceno;
                      data.push(localData[i].material[n]);
                    }
                  }
                  if (materialFlag) {
                    let getFlag = true;
                    if (this.meterialData.length < 2) {
                      for (let n = 0; n < data.length; n++) {
                        data[n].num = Number(data[n].num);
                        data[n].originalbackmoney = Number(data[n].originalbackmoney);
                        data[n].originalmoney = Number(data[n].originalmoney);
                        data[n].money = data[n].originalmoney;
                        this.meterialData.push(
                          new materialData(
                            data[n].materialId,
                            data[n].invoiceId,
                            data[n].internalinvoiceno,
                            data[n].projcode,
                            data[n].originalmaterialcode,
                            data[n].materialcode,
                            data[n].originaldescription,
                            data[n].description,
                            data[n].num,
                            data[n].factory,
                            data[n].originalstoragelocation,
                            data[n].storagelocation,
                            data[n].originalbatchno,
                            data[n].batchno,
                            data[n].originalmoney,
                            data[n].money,
                            data[n].originalbackmoney,
                            data[n].backmoney,
                            data[n].returnnum,
                            data[n].returnstoragelocation,
                            data[n].specifystoragelocation,
                            data[n].deliveryno,
                            data[n].ordertype,
                            data[n].groupno,
                            data[n].ERPorderno,
                            data[n].CURRENCY,
                            data[n].invoiceremark
                          )
                        )
                        getFlag = false;
                      }
                    }
                    if (getFlag) {
                      let pushFlag = true;
                      let meterialLength = this.meterialData.length;
                      for (let n = 0; n < data.length; n++) {
                        data[n].num = Number(data[n].num);
                        data[n].originalbackmoney = Number(data[n].originalbackmoney);
                        data[n].originalmoney = Number(data[n].originalmoney);
                        data[n].money = data[n].originalmoney;
                        if (this.meterialData[n].internalinvoiceno != data[n].internalinvoiceno) {
                          this.meterialData.push(
                            new materialData(
                              data[n].materialId,
                              data[n].invoiceId,
                              data[n].internalinvoiceno,
                              data[n].projcode,
                              data[n].originalmaterialcode,
                              data[n].materialcode,
                              data[n].originaldescription,
                              data[n].description,
                              data[n].num,
                              data[n].factory,
                              data[n].originalstoragelocation,
                              data[n].storagelocation,
                              data[n].originalbatchno,
                              data[n].batchno,
                              data[n].originalmoney,
                              data[n].money,
                              data[n].originalbackmoney,
                              data[n].backmoney,
                              data[n].returnnum,
                              data[n].returnstoragelocation,
                              data[n].specifystoragelocation,
                              data[n].deliveryno,
                              data[n].ordertype,
                              data[n].groupno,
                              data[n].ERPorderno,
                              data[n].CURRENCY,
                              data[n].invoiceremark
                            )
                          )
                        }
                      }
                    }
                  }
                  this.returnMaterialData.emit(this.meterialData);
                });
            }
            this.modalDataChild = modalDate;
            for (let i = 0, len = this.modalDataChild.length; i < len; i++) {
              this.modalDataChild[i].select = false;
            }
            this.returnMaterialData.emit(this.meterialData);//物料号
          }
        }
        else {
          alert(backMessage);
        }
      }
      );

    this.backInvoice.emit(this.invoiceArr);//财务
    this.returnMaterialData.emit(this.meterialData);//物料号
  }

  //数据转换方法
  public changeEventObject(a, b) {
    for (let i in a) {
      for (let n in b) {
        if (i == n) {
          b[n] = a[i]
        }
      }
    }
  }

  //返回数据
  public invoiceArr = [];
  public invoice = {
    'invoiceId': 0,
    'applyId': 0,
    'originalcustomercode': '',
    'originalcustomer': '',
    'orderno': '',
    'internalinvoiceno': '',
    'externalinvoiceno': '',
    'invoicedate': '',
    'originalmoney': 0,
    'originalreceiptdate': '',
    'originalcomplexaccount': '',
    'money': '',
    'customercode': '',
    'customer': '',
    'receiptdate': 0,
    'complexaccout': '',
    'rednoticeno': '',
    'ZCRorderno': '',
    'ZDRorderno': '',
    'REorderno': '',
    'REdeliveryno': '',
    'ZTYorderno': '',
    'ZTYdeliveryno': '',
    'ZREorderno': '',
    'ZREdeliveryno': '',
    'ZSDorderno': '',
    'ZSDdeliveryno': '',
    'ZORorderno': '',
    'ZORdeliveryno': '',
    'PURCH_NO_C': '',
    'seller': '',
    'sellercode': '',
    'SALES_ORG': '',
    'DISTR_CHAN': '',
    'DIVISION': '',
    'PRICE_DATE': '',
    'PMNTTRMS': '',
    'SALES_OFF': '',
    'SALES_GRP': '',
    'SHIP_TYPE': '',
    'TransitMode': '',
    'TransitModeCode': '',
    'SDF_KUNNR': '',
    'SDF_NAME': '',
    'detailaddress': '',
    'province': '',
    'city': '',
    'citycode': '',
    'district': '',
    'zipcode': '',
    'connecter': '',
    'phone': '',
    'signstandard': '',
    "AUART":"",
    "ZTERM":""
  }

  //数据保存
  public material = {
    'materialId': 0,
    'invoiceId': 0,
    internalinvoiceno: "",
    'projcode': '',
    'originalmaterialcode': '',
    'materialcode': '',
    'originaldescription': '',
    'description': '',
    'num': 0,
    'factory': '',
    'originalstoragelocation': '',
    'storagelocation': '',
    'originalbatchno': '',
    'batchno': '',
    'originalmoney': 0,
    'money': 0,
    'originalbackmoney': 0,
    'backmoney': 0,
    'returnnum': 0,
    'returnstoragelocation': '',
    'specifystoragelocation': '',
    'deliveryno': '',
    'ordertype': '',
    'groupno': 0,
    'ERPorderno': '',
    'CURRENCY': '',
    'invoiceremark': ''
  }

  constructor(private dbhttp: HttpServer, private tabService: tabService, private billBackService: billBackService, private WindowService: WindowService, private ChangeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit() {

  }
}
export class tabListData {
  constructor(
    public value,
    public active
  ) { }
}
export class invoiceData {
  constructor(
    public invoiceId,
    public applyId,
    public originalcustomercode,
    public originalcustomer,
    public orderno,
    public internalinvoiceno,
    public externalinvoiceno,
    public invoicedate,
    public originalmoney,
    public originalreceiptdate,
    public originalcomplexaccount,
    public money,
    public customercode,
    public customer,
    public receiptdate,
    public complexaccout,
    public rednoticeno,
    public ZCRorderno,
    public ZDRorderno,
    public REorderno,
    public REdeliveryno,
    public ZTYorderno,
    public ZTYdeliveryno,
    public ZREorderno,
    public ZREdeliveryno,
    public ZSDorderno,
    public ZSDdeliveryno,
    public ZORorderno,
    public ZORdeliveryno,
    public PURCH_NO_C,
    public seller,
    public sellercode,
    public SALES_ORG,
    public DISTR_CHAN,
    public DIVISION,
    public PRICE_DATE,
    public PMNTTRMS,
    public SALES_OFF,
    public SALES_GRP,
    public SHIP_TYPE,
    public TransitMode,
    public TransitModeCode,
    public SDF_KUNNR,
    public SDF_NAME,
    public detailaddress,
    public province,
    public city,
    public citycode,
    public district,
    public zipcode,
    public connecter,
    public phone,
    public signstandard,
    public AUART,
    public ZTERM
  ) { }
}
export class modalSendObj {
  constructor(
    public invoiceno,
    public orderno
  ) { }
}
export class materialData {
  constructor(
    public materialId,
    public invoiceId,
    public internalinvoiceno,
    public projcode,
    public originalmaterialcode,
    public materialcode,
    public originaldescription,
    public description,
    public num,
    public factory,
    public originalstoragelocation,
    public storagelocation,
    public originalbatchno,
    public batchno,
    public originalmoney,
    public money,
    public originalbackmoney,
    public backmoney,
    public returnnum,
    public returnstoragelocation,
    public specifystoragelocation,
    public deliveryno,
    public ordertype,
    public groupno,
    public ERPorderno,
    public CURRENCY,
    public invoiceremark
  ) { }
}

export class testRedType {
  constructor(
    public text: any
  ) { }
}
