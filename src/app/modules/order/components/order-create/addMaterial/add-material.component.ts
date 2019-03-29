import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { WindowService } from 'app/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { MaterialInfo, OrderCreateService } from './../../../services/order-create.service';
@Component({
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.scss']
})
export class AddMaterialComponent implements OnInit {
  modal: XcModalRef;
  loading: boolean = true;//加载中
  defauls: boolean = false;//暂无相关数据
  materialList: MaterialInfo[] = [];//合同列表数据
  keyWord;//搜索条件
  factory;//工厂编号
  OtherFactory;//工厂编号
  allMaterialsCount;//物料数量集合
  contractCode;
  salesOrderID;
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  disAll: boolean = false;//是否可以全选
  selectFirst: boolean = false;
  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private orderCreateService: OrderCreateService
  ) { }

  //初始化数据
  initData() {
    let key = "";
    if (this.keyWord) {
      key = this.keyWord.trim();
    }
    let params = {
      "ContractCode": this.contractCode,
      "SalesOrderID": this.salesOrderID,
      "MaterialInfo": key
    }
    this.fullChecked = false;//全选状态
    this.fullCheckedIndeterminate = false;//半选状态
    //模态框初始化后，再次弹出时。可能记录上次选择物料个数，影响后面逻辑
    this.checkedNum = 0;
    this.orderCreateService.getMaterialData(params).subscribe(
      data => {
        if (data.Result) {
          this.defauls = false;
          let info = JSON.parse(data.Data);
          let factory = this.factory;
          let otherFactory = this.OtherFactory;
          if (info["list"] && info.list.length > 0) {
            let disAll = this.disAll;
            info.list.forEach(function(item, index) {
              this.allMaterialsCount[item.ContractMaterialID]["all"] = JSON.parse(JSON.stringify(item.AvailableQuantity));//物料总和更新
              // this.allMaterialsCount[item.ContractMaterialID]["count"] = item.AvailableQuantity;//物料总和更新
              let materialCountArray = this.allMaterialsCount[item.ContractMaterialID]["quantities"];
              let materialCount = this.allMaterialsCount[item.ContractMaterialID]["all"];//物料总数
              let hadCount = 0;//订单已开出
              let diffCount = 0;//未开出物料个数
              materialCountArray.forEach(function(o, p) {
                hadCount += o;
              });
              diffCount = materialCount - hadCount;
              item.isError = false;
              if (diffCount >= 0) {
                item.AvailableQuantity = diffCount;
              } else {
                item.isError = true;
                this.windowService.alert({ message: "有其他订单抢先占用该物料，请在已经选择的该物料修改其数量", type: "fail" });
                item.AvailableQuantity = 0;
              }

              if (item.AvailableQuantity && item.AvailableQuantity == 0) {
                item["ifDisable"] = true;
              } else if (factory && (factory != item["Factory"] && otherFactory != item["Factory"])) {//禁止与已有物料，不同工厂的物料被选择
                item["ifDisable"] = true;
              }
              if (info.list[0]["Factory"] != item["Factory"] && !factory) {//若没有已添加物料，工厂相同则可全选，有不同工厂物料则不可全选。有已添加物料，再上一个if中不同工厂已经去掉，故可全选
                disAll = true;
              }
              //已添物料列表数量为待添加物料的可用数量
              item["Quantity"] = item["AvailableQuantity"];

            }, this)
            this.disAll = disAll;
          } else {
            this.defauls = true;
            // this.windowService.alert({ message: data.Message, type: "fail" });
          }
          this.materialList = info.list;
        } else {
          this.defauls = true;
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }

  ngOnInit() {

    //获得弹出框自身
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((data) => {
      if (data) {
        console.log(data);
        this.contractCode = data["contractCode"];
        this.salesOrderID = data["salesOrderID"];
        this.factory = data["Factory"];
        this.allMaterialsCount = data["allMaterialsCount"];
        //工厂首位为0或者A为同一工厂
        if (data["Factory"]) {
          this.OtherFactory = "A" + data["Factory"].slice(1);
        } else {
          this.OtherFactory = "";
        }
        this.initData()
      }
    })
  }

  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
  }
  search() {
    this.initData();
  }
  //保存数据
  save() {
    let selectedList = this.materialList.filter(item => item.checked == true);
    if (selectedList.length == 0) {
      if (this.materialList.length > 0) {
        this.windowService.alert({ message: "请选择物料！", type: "fail" });
      } else {
        this.hide();
      }
      return;
    }
    this.hide(selectedList);
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  //物料选择
  selected(item) {
    if (!this.factory && this.materialList.length > 0) {
      this.isDisabledSelect(item);
    }
  }
  /**
  **点击物料全选，物料是否允许选择
  */
  selectedAll() {
    if (!this.factory && this.materialList.length > 0) {
      let MList = this.materialList;
      let disAll = this.disAll;
      let factory = MList[0]["Factory"];
      let otherFactory = "A" + MList[0]["Factory"].slice(1);
      let fullChecked = this.fullChecked;
      MList.forEach(function(item, index) {
        if (item.AvailableQuantity && item.AvailableQuantity != 0) {//物料可用数量不为零，可选
          item["ifDisable"] = false;
        }
        if (fullChecked && factory != item.Factory && otherFactory != item.Factory) {//有不同物料，全选关闭
          disAll = true;
        }
      });
      this.disAll = disAll;
    }
  }
  /**
  **没有已选择物料情况下，物料是否允许选择
  */
  isDisabledSelect(selected?) {
    let MList = this.materialList;
    let checkedNum = this.checkedNum;
    let disAll = this.disAll;
    let factory = selected.Factory;
    let otherFactory = "A" + selected.Factory.slice(1);
    MList.forEach(function(item, index) {
      if (item.AvailableQuantity && item.AvailableQuantity == 0) {//物料可用数量为零，不可选
        item["ifDisable"] = true;
      } else if (checkedNum === 1 && selected.checked === true) {//取消最后一个物料时，全部放开，可选
        item["ifDisable"] = false;
        if (factory != item.Factory && otherFactory != item.Factory) {//有不同物料，全选关闭
          disAll = true;
        }
      } else if (!selected.checked) {//选择第一个物料时,全选放开
        disAll = false;
        if (factory != item.Factory && otherFactory != item.Factory) {//有不同物料，禁止选择
          item["ifDisable"] = true;
        }
      }
    });
    this.disAll = disAll;
  }
}
