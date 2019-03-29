
import {map} from 'rxjs/operators/map';
import { Component, OnInit } from "@angular/core";
import { XcModalService, XcModalRef } from "app/shared/index";
import {
    URLSearchParams,
    Headers,
    Http,
    RequestOptionsArgs,
    RequestOptions
} from "@angular/http";
import { WindowService } from "app/core";
import { Observable } from "rxjs";
import {
    UnClearItem,
    UnclearMaterialItem,
    UnClearItemEntity
} from "./borrow-entitys";
import { environment_java } from "environments/environment";
@Component({
    selector: "db-borrow-common-list",
    templateUrl: "./borrow-unclear-list.component.html",
    styleUrls: ["../../scss/modal-data.component.scss"]
})
export class BorrowUnclearListComponent implements OnInit {
    modal: XcModalRef;
    ifDisabled = false;
    ifIndeterminate = false;
    fullChecked = false; //全选状态
    fullCheckedIndeterminate = false; //半选状态
    checkedNum = 0; //已选项数
    itemid = 1;
    //列表list
    public unClearItemList: UnClearItemEntity[] = [];
    //检查是否全选
    CheckIndeterminate(v) {
        this.fullCheckedIndeterminate = v;
    }

    //not in ids
    userItCode: string = "";
    constructor(
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private http: Http
    ) {}

    ngOnInit() {
        //获得弹出框自身
        this.modal = this.xcModalService.getInstance(this);

        this.modal.onShow().subscribe((data?) => {
            this.userItCode = data.userItCode;
            this.loadApply(this.userItCode);
        });
    }
    //关闭弹出框
    hide(data?: any) {
        this.modal.hide(data);
    }

    //保存数据
    save(param: any) {
        console.log(param);
        let ObList = [];
        param
            .filter(item => item.checked === true)
            .forEach(item => {
                ObList.push(item);
            });
        this.hide(ObList);
    }

    loadApply(userItCode: string) {
        this.http
            .get(
                environment_java.server +
                    "borrow/unclear-item/" +
                    userItCode +
                    "/itcode"
            ).pipe(
            map(res => res.json()))
            .subscribe(res => {
                if (res.list) {
                    this.unClearItemList = res.list;
                }
            });
    }
}
