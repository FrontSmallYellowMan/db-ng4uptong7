import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs } from '@angular/http';
import { HttpServer } from '../../../../../../shared/services/db.http.server';

@Component({
    selector: 'show-location',
    templateUrl: 'showTimeMap.component.html'
})
export class showTimeMapComponent implements OnInit {

    constructor(private http: HttpServer) {

    }
    @Input() tabledata;
    @Input() examineMoney;
    @Output() missData = new EventEmitter;
    @Output() addressData = new EventEmitter;
    public hideList() {
        this.missData.emit(false);
    }
    public saveBill() {
        this.address.province = this.selected.ReceivingProvince[0].text;
        this.address.city = this.selected.ReceivingCity[0].text;
        this.address.citycode = this.selected.ReceivingCity[0].id;
        this.address.district = this.selected.ReceivingCounty[0].text;
        // this.address.internalinvoiceno = this.tabledata[0].internalinvoiceno;
        this.addressData.emit(this.address);
        this.missData.emit(false);
    }
    public address = {
        "SDF_NAME": "",
        "detailaddress": "",
        "province": "",
        "city": "",
        "citycode": "",
        "district": "",
        "zipcode": "",
        "connecter": "",
        "phone": "",
        "signstandard": "",
        // internalinvoiceno:''
    }
    public selectInfo: SelectInfo;//下拉框数据
    public selected = {
        City: [],//城市
        County: [],//市区
        ReceivingProvince: [],//收货人省份
        ReceivingCity: [],//收货人市
        ReceivingCounty: []//收货人区/县
    };//下拉选中项数据
    //获取收货人地址下拉框数据
    public copyReceivingCityList = null;
    public copyReceivingDistrictList = null;
    public copyCountyList = [];
    //收货人地址
    public ReceivingProvinceList: Array<any> = [{ ProvinceCode: 1, ProvinceName: '北京' }, { ProvinceCode: 2, ProvinceName: '河北' }];
    public ReceivingCityList: Array<any> = [{ CityCode: 1, CityName: '北京' }, { CityCode: 2, CityName: '石家庄' }, { CityCode: 2, CityName: '邯郸' }];
    public ReceivingDistrictList: Array<any> = [{ CityCode: 1, CountyName: '昌平' }, { CityCode: 2, CountyName: '海淀' }, { CityCode: 2, CountyName: '涉县' }];


    public onSelectCity(value) {
        let newArray = [];
        this.copyCountyList.forEach(function (element, index, array) {
            if (element.id.substring(0, 5) === value.id) {
                element.id = String(index);
                newArray.push(element);
            }
        });
        this.selectInfo['CountyList'] = newArray;
        this.selected.County = [];
    }

    //省份下拉框操作
    public onSelectReceivingProvince(value) {
        let newArray = [];
        this.copyReceivingCityList.forEach(function (element, index, array) {
            if (element.id.length > 3) {
                if (element.id.substring(0, 3) === value.id) {
                    newArray.push(element);
                }
            }
        });
        this.selectInfo['ReceivingCityList'] = newArray;
        this.selected.ReceivingCity = [];
        this.selected.ReceivingCounty = [];
    }


    //市区下拉框
    public onSelectReceivingCity(value) {
        let newArray = [];
        this.copyReceivingDistrictList.forEach(function (element, index, array) {
            if (element.id.substring(0, 5) === value.id) {
                element.id = String(index);
                newArray.push(element);
            }
        });
        this.selectInfo['ReceivingDistrictList'] = newArray;
        this.selected.ReceivingCounty = [];
    }
    public onGetReceivingSelectInfo() {
        let url = "/InitData/GetProvinceCityInfo";
        this.http.post(url)
            .subscribe(
            data => {
                data = JSON.parse(data.Data);
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        let element = data[key];
                        switch (key) {
                            case 'province':
                                this.selectInfo.ReceivingProvinceList = this.onTransSelectInfos(element, 'ProvinceCode', 'ProvinceName');
                                break;
                            case 'city':
                                this.copyReceivingCityList = this.onTransSelectInfos(element, 'CityCode', 'CityName');
                                this.selectInfo["ReceivingCityList"] = [];

                                this.selectInfo["CityList"] = this.onTransSelectInfos(element, 'CityCode', 'CityName');
                                break;
                            case 'district':
                                this.copyReceivingDistrictList = this.onTransSelectInfosForIdChange(element, 'CityCode', 'CountyName');
                                this.selectInfo["ReceivingDistrictList"] = [];

                                this.copyCountyList = this.onTransSelectInfosForIdChange(element, 'CityCode', 'CountyName');
                                this.selectInfo["CountyList"] = [];
                                break;

                            default:
                        }
                    }
                }
            }, null, null);
    }
    public provinceActive = [];
    public cityActive = [];
    public districtActive = [];
    ngOnInit() {
        this.onGetReceivingSelectInfo();
        this.selectInfo = new SelectInfo(
            [], [], [], [], [], [], [], []
        );
        this.tabledata = [];
        if (this.examineMoney) {
            this.changeEventObject(this.examineMoney[0], this.address);
            this.provinceActive.push(
                {
                    id: '1',
                    text: this.examineMoney[0].province
                }
            )
            this.cityActive.push(
                {
                    id: this.examineMoney[0].citycode,
                    text: this.examineMoney[0].city
                }
            )
            this.districtActive.push(
                {
                    id: '1',
                    text: this.examineMoney[0].district
                }
            )
            this.selected.ReceivingProvince = this.provinceActive;
            this.selected.ReceivingCity = this.cityActive;
            this.selected.ReceivingCounty = this.districtActive;
        }
    }
    //转换方法
    onTransSelectInfos(arr: Array<any>, id, text, extendAttr?) {
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['id'] = item[id];
            newItem['text'] = item[text];
            if (extendAttr) {
                newItem['companycode'] = item[extendAttr];
            }
            newArr.push(newItem);
        });
        return newArr;
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
    //下拉框数据格式修改 -- 自定义id
    onTransSelectInfosForIdChange(arr: Array<any>, id, text, extendAttr?) {
        let newArr = [];
        let i: number = 0;
        arr.map(function (item) {
            let newItem = {};
            i++;
            newItem['id'] = item[id] + String(i);
            newItem['text'] = item[text];
            if (extendAttr) {
                newItem['companycode'] = item[extendAttr];
            }
            newArr.push(newItem);
        });
        return newArr;
    }
}
export class SelectInfo {
    constructor(
        public CompanyList: Array<any>,
        public TicketTypeList: Array<any>,
        public CityList: Array<any>,
        public CountyList: Array<any>,
        public Payment: Array<any>,
        public ReceivingProvinceList: Array<any>,
        public ReceivingCityList: Array<any>,
        public ReceivingDistrictList: Array<any>
    ) { }
}
export class Selected {
    constructor(
        public Seller: SelectItem[],//卖方
        public PaymentType: SelectItem[],//付款方式
        public PayType_Ticket_Type: SelectItem[],//买方交付的票据类型
        public PayType_OP_Ticket: SelectItem[],//OP票据类型
        public PayType_PP_Ticket: SelectItem[],//PP票据类型
        public City: SelectItem[],//城市
        public County: SelectItem[],//市区
        public ReceivingProvince: SelectItem[],//收货人省份
        public ReceivingCity: SelectItem[],//收货人市
        public ReceivingCounty: SelectItem[]//收货人区/县
    ) { }
}
export class SelectItem {
    constructor(
        public id: string,
        public text: string,
        public other?: string
    ) { }
}
