import { Injectable } from "@angular/core";
import { Http, URLSearchParams, RequestOptions, Headers } from "@angular/http";
import "rxjs/add/operator/toPromise";
import {
    UserInfo,
    InvoiceInfo,
    RestInfo,
    Query,
    InvoiceQueryPo
} from "../../components/apply/invoice/invoice-info";
import { environment_java } from "../../../../../environments/environment";
import { isDate } from "util";
declare var window;

@Injectable()
export class InvoiceApproveService {
    private headers = new Headers({ "Content-Type": "application/json" });
    constructor(private http: Http) {}

    /**
     * 获取审批列表
     * @param query
     */
    getApproveList(query: Query) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("invoiceStatus", query.invoiceStatus);
        params.set("param", query.keyWords);
        params.set("payee", query.payee);
        params.set("businessItcode", query.businessItcode);
        params.set("startDate", query.startDate);
        params.set("endDate", query.endDate);
        params.set("pageSize", query.pageSize + "");
        params.set("pageNo", query.pageNo + "");

        return this.http
            .get(environment_java.server + "invoice/invoice-pages", {
                search: params
            })
            .toPromise()
            .then(res => res.json());
    }

    exportFinanceExcelfile(queryPo: InvoiceQueryPo) {
        this.http
            .post(
                environment_java.server + "invoice/exportFinanceExcel",
                queryPo,
                {
                    responseType: 3
                }
            )
            .map(res => res.json())
            .subscribe(data => {
                var blob = new Blob([data], {
                    type: "application/vnd.ms-excel"
                });
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    //判断是否为ie浏览器
                    window.navigator.msSaveBlob(
                        blob,
                        "invoiceapplysfinance.xls"
                    );
                } else {
                    var objectUrl = URL.createObjectURL(blob);

                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.setAttribute("style", "display:none");
                    a.setAttribute("href", objectUrl);
                    a.setAttribute("download", "我的审批-待财务接受");
                    a.setAttribute("id", "download");
                    a.click();
                    //解决ie11不能下载的问题
                    a.addEventListener("click", function() {
                        URL.revokeObjectURL(objectUrl);
                        document.getElementById("download").remove();
                    });
                }
            });
    }

    /**
     * 审批申请单
     * @param ids
     * @param invoiceStatus
     */
    approveInvoice(ids: string, invoiceStatus: string) {
        return this.http
            .put(
                environment_java.server +
                    "invoice/invoice-approve/" +
                    ids +
                    "/" +
                    invoiceStatus,
                {}
            )
            .toPromise()
            .then(response => response.json());
    }
    /**
     * 获取单个申请单信息
     * @param id 申请单id
     */
    getInvoiceById(id: string) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("id", id);
        return this.http
            .get(environment_java.server + "invoice/invoice-retrieve", {
                search: params
            })
            .toPromise()
            .then(response => response.json());
    }

    /**
     * 修改一条申请单信息
     * @param invoice
     */
    updateInvoice(invoice: InvoiceInfo) {
        return this.http
            .put(environment_java.server + "invoice/invoice-update", invoice)
            .toPromise()
            .then(response => response.json());
    }

    /**
     * 修改一条申请单信息
     * @param invoice
     */
    reapplyInvoice(invoice: InvoiceInfo) {
        return this.http
            .put(
                environment_java.server + "invoice/invoice-reapplyInvoice",
                invoice
            )
            .toPromise()
            .then(response => response.json());
    }
    /**
     * 获取收款人列表
     * @param query
     */
    getPayeeCountList(query) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("param", query.keyWords);
        params.set("invoiceStatus", query.invoiceStatus);
        params.set("businessItcode", query.businessItcode);
        params.set("payee", query.payee);
        params.set("startDate", query.startDate);
        params.set("endDate", query.endDate);
        return this.http
            .get(environment_java.server + "invoice/invoice-payeeCount", {
                search: params
            })
            .toPromise()
            .then(resp => resp.json());
    }

    /**
     * 获取商务接口人列表
     */
    getBusinessList() {
        return this.http
            .get(environment_java.server + "invoice/invoice-business")
            .toPromise()
            .then(resp => resp.json());
    }
    /**
     * 获取收款人
     */
    getPayeeList(platform) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("platform", platform);
        return this.http
            .get(environment_java.server + "invoice/invoice-payee", {
                search: params
            })
            .toPromise()
            .then(resp => resp.json());
    }
    // 删除草稿
    deleteDraft(ids) {
        return this.http.post(
            environment_java.server + "invoice/invoice-Deldraft",
            { id: ids }
        );
    }

    //删除支票延期草稿
    deleteDelayDraft(ids) {
        return this.http.post(
            environment_java.server + "invoice/invoice-delay-Deldraft",
            { id: ids }
        );
    }

    //删除支票撤票草稿
    deleteRevokeDraft(ids) {
        return this.http.post(
            environment_java.server + "revoked/invoice-revoked-Deldraft",
            { id: ids }
        );
    }

    // 删除支票换票草稿
    deleteChangeDeldraft(ids) {
        return this.http.post(
            environment_java.server + "invoice/change/invoice-change-Deldraft",
            { id: ids }
        );
    }

    // 支票取回草稿
    deleteTakebackDeldraft(ids) {
        return this.http.post(
            environment_java.server + "takeback/invoice-Takeback-Deldraft",
            { id: ids }
        );
    }
}
