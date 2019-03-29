
import {map} from 'rxjs/operators/map';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpServer, } from '../../../../../shared/services/db.http.server';
import { billBackService } from '../../../services/bill-back.service';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';

@Component({
  selector: 'iq-baseinfo',
  templateUrl: './baseinfo.component.html',
  styleUrls: ['./baseinfo.component.scss']
})

export class BaseinfoComponent implements OnInit {

  @Input() urlFlag;//判断是否编辑页
  // @Input() applyDateExamine;
  @Output() RefundTypeOut = new EventEmitter();//输出订单类型
  @Output() nameTypeOut = new EventEmitter();//
  @Output() applyDataOut = new EventEmitter();
  @Output() redTypeFlagOut = new EventEmitter();
  @Output() changeRedTypeOut = new EventEmitter();
  @Output() materialSelect = new EventEmitter();
  constructor(private router: Router, private dbhttp: HttpServer, private billBackService: billBackService, private location: Location) {
    let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });

    this.dataSource = this.dbhttp.post('InitData/BaseDataList', [], options).pipe(
      map(res => res))
  }

  public isView: boolean = true;//是否查看页面
  public isCheck: boolean = false;//冲红类型 小类是否多选
  public reviseTypeChildren: Array<any> = [];
  public platforms: Array<any> = [{ id: '001', text: '北京' }, { id: '002', text: '上海' }];

  public saveTel(e) {
    this.applyDate.phone = e;
    this.applyDataOut.emit(this.applyDate);
  }
  //输出type改动
  public nameFlag = false;//判断显示名称更改
  public priceFlag = false;
  public materielFlag = false;
  public otherTypeFlag = false;
  public trackBy(hero) {
    return hero ? hero.id : undefined;
  };
  public TypeOut;
  public selected;
  public getApplyData() {
    this.dataSource.subscribe(
      (data) => {
        let list = JSON.parse(data.Data)
        for (let key in list) {
          if (list.hasOwnProperty(key)) {
            let element = list[key];
            switch (key) {
              case 'companys':
                this.selectInfo.companys = this.onTransSelectInfos(element, 'companycode', 'company');
                break;
              case 'businesses':
                this.selectInfo.businesses = this.onTransSelectInfos(element, 'bizcode', 'biz');
                break;
              case 'invoicetypes':
                this.selectInfo.invoicetypes = this.onTransSelectInfosOther(element, 'invoicetypecode', 'invoicetype');
                break;
              case 'platforms':
                this.selectInfo.platforms = this.onTransSelectInfosOther(element, 'platformcode', 'platform');
                break;
              case 'redtypes':
                this.selectInfo.redtypes = this.onTransSelectInfosOther(element, 'revisetypecode', 'revisetype');
                //判断大类选择类型
                this.selected = function (value) {
                  if (value.text === "发票票面信息更改") {
                    this.priceFlag = false;//选择更改类型
                    this.materielFlag = true;
                    this.otherTypeFlag = false;
                    this.reviseTypeChildren = [];
                    this.reviseTypeChildren = this.selectTransSelectInfos(element[0].children, "revisetype")
                    this.isCheck = true;
                  } else if (value.text === "价格更改") {
                    this.priceFlag = true;
                    this.materielFlag = false;
                    this.otherTypeFlag = false;
                    this.reviseTypeChildren = [];
                    for (let n in element[1].children) {
                      this.reviseTypeChildren = this.selectTransSelectInfos(element[1].children, "revisetype")
                    }
                    this.isCheck = false;
                  }
                  else if (value.text === "发票类型更改") {
                    this.priceFlag = false;
                    this.materielFlag = false;
                    this.otherTypeFlag = false;
                    this.reviseTypeChildren = [];
                    for (let n in element[2].children) {
                      this.reviseTypeChildren = this.selectTransSelectInfos(element[2].children, "revisetype")
                    }
                    this.isCheck = false;
                  }
                  else if (value.text === "折让") {
                    this.priceFlag = false;
                    this.materielFlag = false;
                    this.reviseTypeChildren = [];
                    for (let n in element[3].children) {
                      this.reviseTypeChildren = this.selectTransSelectInfos(element[3].children, "revisetype")
                    }
                    // console.log(this.reviseTypeChildren);
                    this.isCheck = false;
                  }
                  else if (value.text === "系统冲红（不涉及外部发票）") {
                    this.priceFlag = false;
                    this.materielFlag = false;
                    this.otherTypeFlag = false;
                    this.reviseTypeChildren = [];
                    for (let n in element[4].children) {
                      this.reviseTypeChildren = this.selectTransSelectInfos(element[4].children, "revisetype")
                    }
                    // console.log(this.reviseTypeChildren);
                    this.isCheck = false;
                  }
                  else if (value.text === "其他情况冲红") {
                    this.priceFlag = false;
                    this.materielFlag = false;
                    this.otherTypeFlag = true;
                    this.TypeOut = "otherType";
                    this.reviseTypeChildren = [];
                    for (let n in element[5].children) {
                      this.reviseTypeChildren = this.selectTransSelectInfos(element[5].children, "revisetype")
                    }
                    this.isCheck = false;
                  }
                };
                break;
              default:
            }
          }
        }
        //登陆人信息
        let headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
        let options = new RequestOptions({ headers: headers });

        this.dbhttp.post("InvoiceRevise/GetUserInfo", [], options).pipe(
          map(res => res))
          .subscribe(
          (data) => {
            this.personData = JSON.parse(data.Data);
            this.applyDate.company = this.personData.CompanyName;
            this.applyDate.companycode = this.personData.CompanyCode;
            this.applyDate.proposer = this.personData.UserName;
            let platformId;
            for (let i = 0, len = this.selectInfo.platforms.length; i < len; i++) {
              if (this.personData.FlatName == this.selectInfo.platforms[i].text) {
                platformId = this.selectInfo.platforms[i].id;
              }
            }
            let businessesValue;
            for (let i = 0, len = this.selectInfo.businesses.length; i < len; i++) {
              if (this.personData.YWFWDM == this.selectInfo.businesses[i].id) {
                businessesValue = this.selectInfo.businesses[i].text;
              }
            }
            this.personActiveData = new defaultdata(
              [{ id: this.personData.CompanyCode, text: this.personData.CompanyCode + "--" + this.personData.CompanyName }],
              [{ id: this.personData.YWFWDM, text: businessesValue }],
              [{ id: platformId, text: this.personData.FlatName }]
            )
            this.personCompanyArr = this.personActiveData.company;
            this.personBus = this.personActiveData.businesses;
            this.personPlate = this.personActiveData.platform;
            this.selectInfo.applyItcode = this.personData.UserName;
            this.selectInfo.constCenter = this.personData.CostCenter;
            this.applyDate.proposer = this.personData.UserName;
            this.applyDate.costcenter = this.personData.CostCenter;
            this.applyDate.company = this.personData.CompanyName;
            this.applyDate.companycode = this.personData.CompanyCode;
            this.applyDate.platform = this.personData.FlatName;
            this.applyDate.platformcode = platformId;
            this.applyDate.biz = this.personData.YWFWDM + "--" + businessesValue;
            this.applyDate.bizcode = this.personData.YWFWDM;
          });
      });
  };//获取基础信息

  //基本信息
  dataSource;
  public selectInfo = {
    applyItcode: '',
    applyDate: '2017-05-20',
    tel: '',
    constCenter: '',
    companys: [],
    businesses: [],
    invoicetypes: [],
    platforms: [],
    redtypes: []
  };
  public personData;
  public personActiveData: defaultdata;
  public personCompanyActive;
  //初始选中
  public personCompanyArr;
  public personBus;
  public personPlate;
  ngOnInit() {
    this.GetCurrentUserPhone();
    this.getApplyData();//请求数据
    let urlData = this.location.path().toString().substring(6)
    this.isView = this.viewOrEdit(this.router.url);
    this.applyDataOut.emit(this.applyDate);
  }
  //获取电话
  public GetCurrentUserPhone() {
    let url = "InitData/GetCurrentUserPhone";
    let headers = new Headers({ 'Content-Type': 'application/json', 'ticket': localStorage.getItem('ticket') });
    let options = new RequestOptions({ headers: headers });
    this.dbhttp.get(url, options).pipe(
      map(res => res))
      .subscribe(
      (data) => {
        this.selectInfo.tel=data.Data;
        this.applyDate.phone = data.Data;
        this.applyDataOut.emit(this.applyDate);
      })
  }
  //转换方法
  onTransSelectInfos(arr: Array<any>, id, text) {
    // debugger;
    let newArr = [];
    arr.map(function (item) {
      let newItem = {};
      newItem['id'] = item[id];
      newItem['text'] = item[id] + "--" + item[text];
      newArr.push(newItem);
    });
    return newArr;
  }
  //转换方法2
  onTransSelectInfosOther(arr: Array<any>, id, text) {
    let newArr = [];
    arr.map(function (item) {
      let newItem = {};
      newItem['id'] = item[id];
      newItem['text'] = item[text];
      newArr.push(newItem);
    });
    return newArr;
  }
  //选择类型转换转换方法
  selectTransSelectInfos(arr: Array<any>, revisetype) {
    let newArr = [];
    arr.map(function (item) {
      let newItem = {};
      newItem['revisetypecode'] = item.revisetypecode;
      newItem['revisetype'] = item[revisetype];
      newItem['slect'] = false;
      newArr.push(newItem);
    });
    return newArr;
  }
  //保存数据
  public applyDate = {
    'applyId': 0,
    'proposer': '',
    'itcode': 0,
    'company': '',
    'companycode': '',
    'applydate': '',
    'phone': '',
    'costcenter': '',
    'biz': '',
    'bizcode': '',
    'invoicetype': '',
    'invoicetypecode': '',
    'platform': '',
    'platformcode': '',
    'revisetype': '',
    'revisetypecode': '',
    'subrevisetype': '',
    'subrevisetypecode': '',
    'reason': '',
    'checkbill': '',
    'outerpackagecheck': '',
    'appearancecheck': '',
    'electroniccheck': '',
    'attachmentcheck': '',
    'checkconlusion': '',
    'checkremark': '',
    'homepickup': 0,
    'transittype': '',
    'applystatus': 1,
    'wfId': '00000000-0000-0000-0000-000000000000',
    'wfstatus': "草稿"
  }
  //数据保存
  public selecteRedtypes(value) {
    this.nameFlag = false;
    this.TypeOut = "";
    if (value) {
      let redTypeFlag = true;
      this.redTypeFlagOut.emit(redTypeFlag);
    }
    if (this.applyDate.revisetype != value.text) {
      let changeRedType = value.text;
      this.changeRedTypeOut.emit(changeRedType);
    }
    this.applyDate.revisetype = value.text
    this.applyDate.revisetypecode = value.id
    this.applyDataOut.emit(this.applyDate);
    this.RefundTypeOut.emit(this.TypeOut);
    this.nameTypeOut.emit(this.nameFlag);
  }
  public saveReason(e) {
    this.applyDataOut.emit(this.applyDate);
  }
  public selecteInvoice(value) {
    this.applyDate.invoicetype = value.text
    this.applyDate.invoicetypecode = value.id
    this.applyDataOut.emit(this.applyDate)
  }
  public selecteCom(value) {
    this.applyDate.company = value.text
    this.applyDate.companycode = value.id
    this.applyDataOut.emit(this.applyDate)
  }
  public selectePlat(value: any): void {
    this.applyDate.platform = value.text
    this.applyDate.platformcode = value.id
    this.applyDataOut.emit(this.applyDate)
  }
  public selecteBiz(value) {
    this.applyDate.biz = value.text
    this.applyDate.bizcode = value.id
    this.applyDataOut.emit(this.applyDate)
  }

  //判断选择小类及保存
  public subrevisetypeData: subrevisetypeData;
  public subrevisetypeArray = [];

  public changeRefundTypeOut(fa, item) {
    if (this.materielFlag) {
      let materielSelect;
      if (fa[4].slect) {
        materielSelect = true;
        this.TypeOut = "materielType";
        if (fa[0].slect || fa[1].slect) {
          this.nameFlag = true;
        } else {
          this.nameFlag = false;
        }
      } else if (fa[0].slect || fa[1].slect) {
        if (fa[4].slect) {
          this.TypeOut = "materielType"
        } else {
          this.TypeOut = "";
        }
        this.nameFlag = true;
      }
      else {
        materielSelect = false;
        this.TypeOut = undefined;
        this.nameFlag = false;
      }
      this.subrevisetypeArray = [];
      for (let n in fa) {
        if (fa[n].slect == true) {
          this.subrevisetypeArray.push(new subrevisetypeData(
            fa[n].revisetypecode, fa[n].revisetype
          ));
        }
      }
      this.materialSelect.emit(materielSelect)
    }
    else if (item == "冲成本") {
      this.TypeOut = "costType";
    }
    else if (this.priceFlag) {
      this.TypeOut = "priceType";
    }
    else if (item == "提供冲红通知单原件及折扣折让证明") {
      this.TypeOut = "breakType";
    }
    if (!this.materielFlag) {
      let littleSelect;
      littleSelect = item;
      this.subrevisetypeArray = [];
      for (let i in fa) {
        if (item == fa[i].revisetype) {
          this.subrevisetypeArray.push(new subrevisetypeData(
            fa[i].revisetypecode, fa[i].revisetype
          ));
        }
      }
      this.materialSelect.emit(littleSelect)
    }
    let subrevise = JSON.stringify(this.subrevisetypeArray);
    this.applyDate.subrevisetype = subrevise;
    this.nameTypeOut.emit(this.nameFlag);
    this.RefundTypeOut.emit(this.TypeOut);
    this.applyDataOut.emit(this.applyDate)
  }

  viewOrEdit(url: string): boolean {
    return url.includes('creat');
  }
}

export class defaultdata {
  constructor(
    public company: company[],
    public businesses: businesses[],
    public platform: platform[]
  ) { }
}
export class company {
  constructor(
    public id: string,
    public text: string
  ) { }
}
export class businesses {
  constructor(
    public id: string,
    public text: string
  ) { }
}
export class platform {
  constructor(
    public id: string,
    public text: string
  ) { }
}
export class subrevisetypeData {
  constructor(
    public subtypecode: any,
    public subtype: any
  ) { }
}
export class ReviseTypes {
  constructor(
    public revisetypecode: string,
    public revisetype: string,
    public children: Array<string>
  ) { }
}
export class applyDate {
  constructor(
    public applyId: "申请id",
    public proposer: "申请人",
    public uId: "申请人id",
    public company: string,
    public companycode: string,
    public applydate: "申请日期",
    public phone: "电话",
    public costcenter: string,
    public biz: "业务范围",
    public bizcode: "业务范围编码",
    public invoicetype: "发票类型",
    public invoicetypecode: "发票类型编码",
    public platform: "所属平台",
    public platformcode: "平台编码",
    public revisetype: "冲红类型",
    public revisetypecode: "冲红类型编码",
    public subrevisetype: "冲红类型小类",
    public subrevisetypecode: "冲红类型小类编码",
    public reason: "申请原因",
    public checkbill: "检查项目",
    public outerpackagecheck: "外包装检查",
    public appearancecheck: "机器外观检查",
    public electroniccheck: "电性能检查",
    public attachmentcheck: "附件检查",
    public checkconlusion: "质检结论",
    public checkremark: "质检备注",
    public homepickup: "是否上门取货",
    public transittype: "运输类型",
    public applystatus: "申请状态",
    public wfId: "流程id",
    public wfstatus: "流程状态"
  ) { }
}
