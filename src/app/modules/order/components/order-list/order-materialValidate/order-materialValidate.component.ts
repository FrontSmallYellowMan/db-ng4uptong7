import { Component, OnInit } from '@angular/core';
import { WindowService } from '../../../../../../app/core';
import { Pager, XcModalService, XcModalRef } from '../../../../../../app/shared/index';

import { dbomsPath } from "../../../../../../environments/environment";
import { ReqGetOrderListData, ReqMaterialValidate, OrderListService } from "../../../services/order-list.service";

@Component({
  selector: 'order-materialValidate',
  templateUrl: 'order-materialValidate.component.html',
  styleUrls:['order-materialValidate.component.scss']
})

export class OrderMaterialValidateComponent implements OnInit {

  public pagerData=new Pager();//实例化分页参数对象
  public reqGetOrderListData:ReqGetOrderListData=new ReqGetOrderListData();//实例化请求参数
  public reqMaterialValidate:ReqMaterialValidate=new ReqMaterialValidate();//实例化设置物料是否验证bug
  public viewList:any=[];//保存搜索到的数据列表

  constructor(
    private windowService:WindowService,
    private orderListService:OrderListService
  ) { }

  ngOnInit() { }


  //分页页码变化
  onChangePager(e) {
    this.reqGetOrderListData.PageIndex=e.pageNo;//保存页码
    this.reqGetOrderListData.PageSize=e.pageSize;//保存页面显示的数据条数

    this.initData();
  }

  //请求接口获取列表数据
  initData() {
    this.orderListService.getSaleOrderMaterialList(this.reqGetOrderListData).then(data=> {

      let resData=JSON.parse(data.Data);
      if(data.Result) {
        this.viewList=resData.List;//保存搜索的列表数据
        console.log(this.viewList);
        this.pagerData.set({//保存分页信息
          pageNo: resData.CurrentPage,
          total: resData.TotalCount,
          totalPages: resData.PageCount
        });
      }
    });
  }

  //搜索
  search() {
    this.initData();
  }

  //设置是否需要验证物料
  configIsMaterialValidate(I,state) {

    if(this.viewList[I].IsVerifyMaterial===state) return; // 如果点击按钮的状态与当前列表的状态相同，则返回

    this.reqMaterialValidate.IsVerifyMaterial=state;//保存是否需要验证物料的状态
    this.reqMaterialValidate.SaleOrderID=this.viewList[I].SalesOrderID;//保存要改变验证的销售订单号
    //请求接口
    this.orderListService.isMaterialValidate(this.reqMaterialValidate).then(data=> {
      if(data.Result) {
        this.windowService.alert({message:'修改成功！',type:'success'}).subscribe(()=>{
          this.initData();
        });
      }else {
        this.windowService.alert({message:'修改失败',type:'fail'});
      }
    });
  }

  //重置
  reset() {
    this.reqGetOrderListData=new ReqGetOrderListData();
  }


}