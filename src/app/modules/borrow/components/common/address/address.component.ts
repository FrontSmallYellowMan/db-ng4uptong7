
import {map} from 'rxjs/operators/map';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs
} from "@angular/http";
import { environment_java } from "environments/environment";
import { HttpServer } from "app/shared/services/db.http.server";
import { WindowService } from "app/core";
import {
    SelectOption,
    DeliveryAddress,
    BaseCityCounty
} from "../../common/borrow-entitys";
@Component({
    selector: "show-location",
    templateUrl: "address.component.html"
})
export class AddressComponent implements OnInit {
    address: DeliveryAddress = new DeliveryAddress();
    constructor(
        private http: Http,
        private httpServer: HttpServer,
        private windowService: WindowService
    ) {}
    @Input() tabledata;
    @Input() customerName;
    @Input() addressId;
    @Output() missData = new EventEmitter();
    @Output() addressData = new EventEmitter();
    public hideList() {
        this.missData.emit(false);
    }
    public saveBill() {
        //  提交前要验证
        if (this.validation()) {
            this.address.province = this.selected.ReceivingProvince[0].text;
            this.address.city = this.selected.ReceivingCity[0].text;
            //this.addressPo.citycode = this.selected.ReceivingCity[0].id;
            this.address.area = this.selected.ReceivingCounty[0].text;

            // this.address.internalinvoiceno = this.tabledata[0].internalinvoiceno;

            console.log("this.address==" + JSON.stringify(this.address));

            if (this.address.id) {
                this.http
                    .put(
                        environment_java.server +
                            "borrow/customer-address/" +
                            this.addressId,
                        this.address
                    ).pipe(
                    map(res => res.json()))
                    .subscribe(res => {
                        if (res.success) {
                            this.windowService.alert({
                                message: "操作成功",
                                type: "success"
                            });
                            this.address = res.item;
                            this.addressData.emit(this.address);
                            this.missData.emit(false);
                        } else {
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            } else {
                this.http
                    .post(
                        environment_java.server + "borrow/customer-address",
                        this.address
                    ).pipe(
                    map(res => res.json()))
                    .subscribe(res => {
                        if (res.success) {
                            this.windowService.alert({
                                message: "操作成功",
                                type: "success"
                            });
                            this.address = res.item;
                            this.addressData.emit(this.address);
                            this.missData.emit(false);
                        } else {
                            this.windowService.alert({
                                message: res.message,
                                type: "fail"
                            });
                        }
                    });
            }
        }
    }
    validation() {
        if (!this.address.customerName) {
            this.windowService.alert({
                message: "请填写客户名称",
                type: "fail"
            });
            return false;
        }
        if (!this.address.deliveryName) {
            this.windowService.alert({
                message: "请填写收货单位",
                type: "fail"
            });
            return false;
        }
        if (!this.address.deliveryAddress) {
            this.windowService.alert({
                message: "请填写收货地址",
                type: "fail"
            });
            return false;
        }
        if (!this.selected.ReceivingProvince[0]) {
            this.windowService.alert({ message: "请填写省份", type: "fail" });
            return false;
        }
        if (!this.selected.ReceivingCity[0]) {
            this.windowService.alert({ message: "请填写城市", type: "fail" });
            return false;
        }
        if (!this.selected.ReceivingCounty[0]) {
            this.windowService.alert({ message: "请填写区(县)", type: "fail" });
            return false;
        }
        if (!this.address.zipCode) {
            this.windowService.alert({
                message: "请填写邮政编码",
                type: "fail"
            });
            return false;
        }
        if (!this.address.contactName) {
            this.windowService.alert({ message: "请填写联系人", type: "fail" });
            return false;
        }
        if (!this.address.contactTel) {
            this.windowService.alert({
                message: "请填写联系电话",
                type: "fail"
            });
            return false;
        }
        if (!this.address.standarSign) {
            this.windowService.alert({
                message: "请填写签收标准",
                type: "fail"
            });
            return false;
        }
        return true;
    }
    // public address = {
    //     "SDF_NAME": "",
    //     "detailaddress": "",
    //     "province": "",
    //     "city": "",
    //     "citycode": "",
    //     "district": "",
    //     "zipcode": "",
    //     "connecter": "",
    //     "phone": "",
    //     "signstandard": "",
    //     // internalinvoiceno:''
    // }
    public selectInfo: SelectInfo; //下拉框数据
    public selected = {
        City: [], //城市
        County: [], //市区
        ReceivingProvince: [], //收货人省份
        ReceivingCity: [], //收货人市
        ReceivingCounty: [] //收货人区/县
    }; //下拉选中项数据
    //获取收货人地址下拉框数据
    public copyReceivingProvinceList = null;
    public copyReceivingCityList = null;
    public copyReceivingDistrictList = null;
    public copyCountyList = [];
    //收货人地址
    public ReceivingProvinceList: Array<any> = [];
    public ReceivingCityList: Array<any> = [];
    public ReceivingDistrictList: Array<BaseCityCounty> = [];

    public onSelectCity(value) {
        let newArray = [];
        //console.log(JSON.stringify(value));
        this.ReceivingDistrictList.forEach(function(element, index, array) {
            if (element.id.substring(0, 5) === value.id) {
                //element.id = String(index);
                newArray.push(element);
            }
        });
        this.selectInfo["CountyList"] = newArray;
        this.selected.County = [];
    }
    public onSelectReceivingCounty(value) {}
    //省份下拉框操作
    public onSelectReceivingProvince(value) {
        let newArray = [];
        this.copyReceivingCityList.forEach(function(element, index, array) {
            if (element.id.length > 3) {
                if (element.id.substring(0, 3) === value.id) {
                    newArray.push(element);
                }
            }
        });
        this.selectInfo["ReceivingCityList"] = newArray;
        this.selected.ReceivingCity = [];
        this.selected.ReceivingCounty = [];
    }

    //市区下拉框
    public onSelectReceivingCity(value) {
        let newArray = [];
        this.copyReceivingDistrictList.forEach(function(element, index, array) {
            if (element.id.substring(0, 5) === value.id) {
                newArray.push(element);
            }
        });
        this.selectInfo["ReceivingDistrictList"] = newArray;
        //console.log("citylist="+JSON.stringify(this.selectInfo['ReceivingDistrictList']));
        this.selected.ReceivingCounty = [];
    }
    public onGetReceivingSelectInfo() {
        let url = "/InitData/GetProvinceCityInfo";
        this.httpServer.post(url).subscribe(
            data => {
                data = JSON.parse(data.Data);
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        let element = data[key];
                        switch (key) {
                            case "province":
                                this.copyReceivingProvinceList = this.onTransSelectInfos(
                                    element,
                                    "ProvinceCode",
                                    "ProvinceName"
                                );
                                this.selectInfo.ReceivingProvinceList = this.onTransSelectInfos(
                                    element,
                                    "ProvinceCode",
                                    "ProvinceName"
                                );
                                break;
                            case "city":
                                this.copyReceivingCityList = this.onTransSelectInfos(
                                    element,
                                    "CityCode",
                                    "CityName"
                                );
                                this.selectInfo["ReceivingCityList"] = [];

                                this.selectInfo[
                                    "CityList"
                                ] = this.onTransSelectInfos(
                                    element,
                                    "CityCode",
                                    "CityName"
                                );
                                break;
                            case "district":
                                this.copyReceivingDistrictList = this.onTransSelectInfosForIdChange(
                                    element,
                                    "CityCode",
                                    "CountyName"
                                );
                                this.selectInfo["ReceivingDistrictList"] = [];
                                //console.log(JSON.stringify(this.selectInfo.ReceivingDistrictList));
                                //this.copyCountyList = this.onTransSelectInfosForIdChange(element, 'CityCode', 'CountyName');
                                //this.selectInfo["CountyList"] = [];
                                break;

                            default:
                        }
                    }
                }

                if (this.addressId) {
                    this.http
                        .get(
                            environment_java.server +
                                "borrow/customer-address/" +
                                this.addressId
                        )
                        .toPromise()
                        .then(res => {
                            this.address = res.json().item;
                            let flag: boolean = true;
                            console.log("data", this.copyReceivingProvinceList);
                            if (this.copyReceivingProvinceList) {
                                for (
                                    let i = 0;
                                    i < this.copyReceivingProvinceList.length &&
                                    flag;
                                    i++
                                ) {
                                    if (
                                        this.copyReceivingProvinceList[i]
                                            .text === this.address.province
                                    ) {
                                        flag = false;
                                        this.provinceActive.push(
                                            this.copyReceivingProvinceList[i]
                                        );
                                    }
                                }
                            }
                            this.selected.ReceivingProvince = this.provinceActive;
                            this.onSelectReceivingProvince(
                                this.provinceActive[0]
                            );
                            flag = true;
                            for (
                                let i = 0;
                                i < this.copyReceivingCityList.length && flag;
                                i++
                            ) {
                                if (
                                    this.copyReceivingCityList[i].text ===
                                    this.address.city
                                ) {
                                    flag = false;
                                    this.cityActive.push(
                                        this.copyReceivingCityList[i]
                                    );
                                }
                            }
                            this.selected.ReceivingCity = this.cityActive;
                            this.onSelectReceivingCity(this.cityActive[0]);
                            flag = true;
                            for (
                                let i = 0;
                                i < this.copyReceivingDistrictList.length &&
                                flag;
                                i++
                            ) {
                                if (
                                    this.copyReceivingDistrictList[i].text ===
                                    this.address.area
                                ) {
                                    flag = false;
                                    this.districtActive.push(
                                        this.copyReceivingDistrictList[i]
                                    );
                                }
                            }
                            this.selected.ReceivingCounty = this.districtActive;
                            // console.log("list=="+ JSON.stringify(this.address));
                        });
                }
            },
            null,
            null
        );
    }
    public provinceActive = [];
    public cityActive = [];
    public districtActive = [];
    ngOnInit() {
        this.address.customerName = this.customerName;
        this.selectInfo = new SelectInfo([], [], [], [], [], [], [], []);
        this.onGetReceivingSelectInfo();
        this.tabledata = [];
    }
    //转换方法
    onTransSelectInfos(arr: Array<any>, id, text, extendAttr?) {
        let newArr = [];
        arr.map(function(item) {
            let newItem = {};
            newItem["id"] = item[id];
            newItem["text"] = item[text];
            if (extendAttr) {
                newItem["companycode"] = item[extendAttr];
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
                    b[n] = a[i];
                }
            }
        }
    }
    //下拉框数据格式修改 -- 自定义id
    onTransSelectInfosForIdChange(arr: Array<any>, id, text, extendAttr?) {
        let newArr = [];
        let i: number = 0;
        arr.map(function(item) {
            let newItem = {};
            i++;
            newItem["id"] = item[id] + String(i);
            newItem["text"] = item[text];
            if (extendAttr) {
                newItem["companycode"] = item[extendAttr];
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
    ) {}
}
export class Selected {
    constructor(
        public Seller: SelectItem[], //卖方
        public PaymentType: SelectItem[], //付款方式
        public PayType_Ticket_Type: SelectItem[], //买方交付的票据类型
        public PayType_OP_Ticket: SelectItem[], //OP票据类型
        public PayType_PP_Ticket: SelectItem[], //PP票据类型
        public City: SelectItem[], //城市
        public County: SelectItem[], //市区
        public ReceivingProvince: SelectItem[], //收货人省份
        public ReceivingCity: SelectItem[], //收货人市
        public ReceivingCounty: SelectItem[] //收货人区/县
    ) {}
}
export class SelectItem {
    constructor(
        public id: string,
        public text: string,
        public other?: string
    ) {}
}
