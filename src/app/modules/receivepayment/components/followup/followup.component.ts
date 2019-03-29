import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from "@angular/router";
import { FollowuplistService, ArrearsInfo, ArrearsInfoQuery } from "../../service/rp-followup.service";
import { XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { ViewpayitemComponent } from "../viewpayitem/viewpayitem.component";

@Component({
  selector: 'db-followup',
  templateUrl: './followup.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class FollowupComponent implements OnInit {

  constructor(
    public router: Router,
    private activerouter:ActivatedRoute,
    private followupservice: FollowuplistService,
    private xcModalService: XcModalService) { }

  query: ArrearsInfoQuery = new ArrearsInfoQuery();//查询条件 获取欠款明细
  arrearsInfo : ArrearsInfo = new ArrearsInfo();//欠款信息
  followupList = null;//跟进列表数据
  modal: XcModalRef;//模态窗
  loading: boolean = false;
  ngOnInit() {
    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(ViewpayitemComponent);
    this.activerouter.queryParams.subscribe(params => {
      if (params) {
        this.query.GSDM = params.GSDM;
        this.query.HXMDM = params.HXMDM;
        this.query.KJND = params.KJND;
        this.query.PZDM = params.PZDM;
      }
    });
    this.GetArrearsInfo(this.query);
  }
  GetArrearsInfo(query: ArrearsInfoQuery){
    this.loading = true;
    this.followupservice.GetArrearsInfo(query).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.arrearsInfo = JSON.parse(data.Data);
      }
    });
  }
  showPayItem(payitem){
    this.modal.show({data:payitem});
  }
  //路由 跟进列表
  routerFollowup(url, params){
    this.router.navigate([url], { queryParams: params });
  }
}
