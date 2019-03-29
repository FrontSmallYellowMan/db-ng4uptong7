import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { URLSearchParams, Headers, Http, RequestOptionsArgs } from '@angular/http';
import { environment_java } from "environments/environment";
import {
    DeliveryAddress
} from '../../common/borrow-entitys';
@Component({
    selector: 'show-location-view',
    templateUrl: 'addressdetail.component.html'
})
export class AddressDetailComponent implements OnInit {
    address: DeliveryAddress = new DeliveryAddress();
    constructor(private http: Http) {

    }
   // @Input() tabledata;
    //@Input() customerName;
    @Input() addressId;
    @Output() missData = new EventEmitter;
   // @Output() addressData = new EventEmitter;
    public hideList() {
        this.missData.emit(false);
    }
   
    ngOnInit() {

        //this.address.customerName = this.customerName;
        //this.tabledata = [];
      
        if (this.addressId) {

            this.http.get(environment_java.server + "borrow/customer-address/" + this.addressId).toPromise()
                .then(res => {
                    this.address = res.json().item; 
                }
                );


        }
    }
}

