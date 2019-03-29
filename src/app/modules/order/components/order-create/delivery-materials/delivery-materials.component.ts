import { Component, OnInit, ViewChild, ViewChildren, EventEmitter, Output, Input } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { XcModalService, XcModalRef } from 'app/shared/index';

import { WindowService } from 'app/core';
import { MaterialInfo, OrderCreateService, DeliveryMaterialInfo } from './../../../services/order-create.service';
import { AdvanceDepositsComponent } from '../select-advance-deposits/select-advance-deposits.component';
import { CommunicateService } from "../../../services/communicate.service";
import { dbomsPath } from '../../../../../../environments/environment';
import { environment } from '../../../../../../environments/environment.prod';

declare var window;

@Component({
  selector: 'oc-delivery-materials',
  templateUrl: 'delivery-materials.component.html',
  styleUrls: ['./delivery-materials.component.scss']
})
export class DeliveryMaterialsComponent implements OnInit {
  @Output() deliveryCallBack = new EventEmitter();
  @Output() retrunCheckCallBack = new EventEmitter();
  // @Input() isCheckReMoy;//是否选择预收款
  @Input() formData;//表单数据
  @Input() provinceCityInfo;//省市区信息
  @Input() deliveryTypeList;//发货方式
  @Input() rebateAmountVal;//返款方式
  @Input() isSubmit;//是否提交订单
  @Input() isValidMaterial;//是否校验物料信息
  @Input() returnMaterialList;//还借用物料数据
  @Input() reservationNo;//还借用预留号
  @Input() isReturnBorrow;//是否为还借用
  modalAdvance: XcModalRef;//预收款

  allMaterialsCount: object = new Object();//所有的物料数量控制
  allMaterialsList;//所有的物料

  loading:boolean = false;// 是否显示遮罩

  batchUploadShipToPartyAPI:any = environment.server + 'SaleOrder/BatchUploadSDFMaterialInfo';//标准和澳门销售订单 保存上传附件的接口地址
  batchUploadNoContractShipToPartyAPI:any = environment.server + 'SaleOrder/BatchUploadSDFMaterialInfoNoContract';//其他销售订单 保存上传附件的接口地址

  salesOrderIDPostData:any = {'salesOrderID':'','DepartmentProductGroupID':''};//保存salesOrderID

  isClickBatchButton:boolean = true; // 批量上传送达方按钮是否可以点击
  isDisabledButtonState:boolean = false;// 是否禁用添加按钮、删除按钮以及切换清空物料按钮

  constructor(
    private windowService: WindowService,
    private orderCreateService: OrderCreateService,
    private xcModalService: XcModalService,
    private communicateService:CommunicateService
  ) { }

  ngOnInit() {

    if (this.formData.Type !== 2) {
      this.getSCAllMaterialsCount();//需要SalesOrderData内参数
    }

    this.salesOrderIDPostData.salesOrderID = this.formData.SalesOrderData.SalesOrderID;//保存salesOrderID
    this.salesOrderIDPostData.DepartmentProductGroupID = this.formData.SalesOrderData.DepartmentProductGroupID;//把保存DepartmentProductGroupID
    console.log(this.salesOrderIDPostData.salesOrderID);

    //在初始化的时候 创建模型;;;;查询预收款
    this.modalAdvance = this.xcModalService.createModal(AdvanceDepositsComponent);//查询预收款
    this.modalAdvance.onHide().subscribe((data) => {
      //预收款点击取消和关闭直接hide没有data数据则不能删除，有数据代表选择了确定后可以删除
      if (data) {
        // this.checkReMoyCallBack.emit(data);
        if (data.advancelength > 0) {
          this.formData.DeliveryData[data.currentIndex].isCheckReMoy = true;
          this.communicateService.sendMsg('1');//1：选择了预收款
        } else {
          this.communicateService.sendMsg('0');//0:没选择预收款
          this.formData.DeliveryData[data.currentIndex].isCheckReMoy = false;
        }
        this.retrunCheckCallBack.emit(this.formData.DeliveryData);
      }
    });


    //删除预收款的处理事件
    this.communicateService.getSDFAdvance().subscribe(data=> {
      this.getSDFAdvanceChange(data);
    });

   //当新增物料或者批量上传送达方时，处理删除按钮和批量上传按钮的显示和隐藏
   this.communicateService.getIsClickBatchButton().subscribe(data => {
     this.chengBatchButton(data);
   });

  }

  //获取个预收款的变更，将变更的预收款保存进入表单实体
  getSDFAdvanceChange(data) {
    if(!data) return;
    if(data.type==='add'){ // 如果是添加预收款
       this.formData.DeliveryData.forEach(element => {
          if(element.Deliverinfo.SDFID===data.SDFID) {
              element.ListPrePayment=JSON.parse(data.prePaymentList);
          }
       });
    }else if(data.type==='del') {
      this.formData.DeliveryData.forEach(element => {
        if(element.Deliverinfo.SDFID===data.SDFID) {
            element.ListPrePayment.splice(data.index,1);
        }
     });
    }
  }

  //处理批量上传送达方按钮和添加、删除按钮的显示和隐藏
  chengBatchButton(data) {
    if(data === '添加') {
      this.isClickBatchButton = false; // 设置按钮状态，不予许编辑
    }

    // 如果为删除，并且所有送达方下的物料均为空，则显示批量上传送达方按钮
    if((data === '删除'||data === '清空')&& this.formData.DeliveryData.every(item=>item.MaterialList.length===0||!item.MaterialList)) {
      this.isClickBatchButton = true;
      this.isDisabledButtonState = false;// 不禁用添加按钮，删除按钮以及切换清空物料按钮
    }

    //如果为’清空批量‘，则根据状态判断按钮状态
    if(data === '清空批量' && this.formData.DeliveryData.every(item=>item.MaterialList.length===0||!item.MaterialList)) {//如果所有送达方下的物料均为空
      this.isClickBatchButton = true;//允许显示批量上传送达方按钮
      this.isDisabledButtonState = false;// 不禁用添加按钮，删除按钮以及切换清空物料按钮
    }
    
  }

  //增加送达方及物料
  addShipTo() {
    this.formData.DeliveryData.push(new DeliveryMaterialInfo());
    let firstDeliverinfo = this.formData.DeliveryData[0]["Deliverinfo"];
    let info = this.formData.DeliveryData[this.formData.DeliveryData.length - 1]["Deliverinfo"]; info["SDFName"] = firstDeliverinfo["SDFName"];
    info["SDFAddress"] = firstDeliverinfo["SDFAddress"];
    info["SDFCode"] = "A";
    this.formData.DeliveryData[this.formData.DeliveryData.length - 1]["Deliverinfo"] = info;
    if (this.formData.Type !== 2) {
      //添加送达方，allMaterialsCount控制下的数组，对应添加相关数据
      this.allMaterialsList.forEach(function(item, index) {
        this.allMaterialsCount[item.ContractMaterialID]["quantities"].push(0);
      }, this);
    }

  }
  /*
  *送达方物料数据返回
  */
  shipToCallBack(data?) {
    if (data && data.type == "del") {
      this.formData.DeliveryData.splice(data.currentIndex, 1);
      //删除送达方，allMaterialsCount控制下的数组，对应删除相关数据
      this.allMaterialsList.forEach(function(item, index) {
        this.allMaterialsCount[item.ContractMaterialID]["quantities"].splice(data.currentIndex, 1);
      }, this);
      this.salesAmountCount();
    } else if (data && data.type == "add") {
      if (data.list && data.list.length > 0) {
        this.materialListCount(data.list, data.currentIndex);
      }
    } else if (data && data.type == "change") {
      //物料转移
      let acceptMaterialList = this.formData.DeliveryData[data.changeIndex]["MaterialList"];
      let material = data["list"][0];
      let currentCount = 0;
      if (acceptMaterialList && acceptMaterialList.length > 0) {
        let IDList = [];
        acceptMaterialList.forEach(function(item, index) {
          IDList.push(item["ContractMaterialID"]);
        })
        if (IDList.indexOf(material["ContractMaterialID"]) != -1) {
          let index = IDList.indexOf(material["ContractMaterialID"]);
          currentCount = acceptMaterialList[index]["Quantity"] + material["Quantity"];
          acceptMaterialList[index]["Quantity"] = currentCount;
        } else {
          acceptMaterialList.push(material);
        }
      } else {
        acceptMaterialList.push(material);
      }
      this.allMaterialsCount[material["ContractMaterialID"]]["quantities"][data.changeIndex] = currentCount;//转移后物料数量计算
      this.formData.DeliveryData[data.changeIndex]["MaterialList"] = acceptMaterialList;


    } else {
      this.salesAmountCount();
    };

    this.communicateService.sendMaterialAmount(true);// 发送状态，用来重新计算物料数量

  }
  unCShipToCallBack(data?) {
    if (data && data.type == "del") {
      this.formData.DeliveryData.splice(data.currentIndex, 1);
      this.salesAmountCount();
    } else if (data && data.type == "change") {
      //物料转移
      let acceptMaterialList = this.formData.DeliveryData[data.changeIndex]["MaterialList"];
      let material = data["list"][0];
      let currentCount = 0;
      if (acceptMaterialList && acceptMaterialList.length > 0) {
        let hasSameMaterial = false;
        acceptMaterialList.some(function(item, index) {//物料编码，物料名称，物料批次全相同。为同一种物料
          if (material["MaterialCode"] === item["MaterialCode"] && material["MaterialName"] === item["MaterialName"] && material["Batch"] === item["Batch"]) {
            item["Quantity"] = item["Quantity"] + material["Quantity"];
            hasSameMaterial = true;
            return;
          }
        });
        if (!hasSameMaterial) {
          acceptMaterialList.push(material);
        }
      } else {
        acceptMaterialList.push(material);
      }
      this.formData.DeliveryData[data.changeIndex]["MaterialList"] = acceptMaterialList;
    } else {
      this.salesAmountCount();
    };
    this.communicateService.sendMaterialAmount(true);// 发送状态，用来重新计算物料数量
  }
  //选择预收款
  selectAdvanceCallBack(data?) {
    if (data) {//预收款弹框显示
      this.modalAdvance.show(data);
    }
  }
  /*
   *订单金额计算
   */
  salesAmountCount() {
    let amountTotal = 0;
    let rebateAmountTotal = 0;
    if (this.formData.DeliveryData.length > 0) {
      this.formData.DeliveryData.forEach(function(item, index) {
        item.Deliverinfo.MaterialAmountMoney = typeof item.Deliverinfo.MaterialAmountMoney ==='string'?item.Deliverinfo.MaterialAmountMoney:!item.Deliverinfo.MaterialAmountMoney?0:item.Deliverinfo.MaterialAmountMoney.toFixed(2);
        let count = 0;
        if (item.MaterialList && item.MaterialList.length > 0) {
          item.MaterialList.forEach(function(m, i) {
            amountTotal += parseFloat(m.TotalPrice || 0);
            rebateAmountTotal += parseFloat(m.RebateAmount || 0);
            count += parseFloat(m.TotalPrice || 0);
          })
          item.Deliverinfo.MaterialAmountMoney = count.toFixed(2);

        }

      }, this);
    }

    this.formData.SalesOrderData.SalesAmountTotal = amountTotal.toFixed(2);
    // let RebateAmountTotalString=rebateAmountTotal.toString();//将返款总金额保存为字符串
    //因为js计算精度问题，所有需要将超过的部分进行截取
    // this.formData.SalesOrderData.RebateAmountTotal =RebateAmountTotalString.indexOf('.')!=-1?Number(RebateAmountTotalString.split('.')[1].length>2?RebateAmountTotalString.substr(0,RebateAmountTotalString.indexOf('.')+3):RebateAmountTotalString):Number(RebateAmountTotalString);
    this.formData.SalesOrderData.RebateAmountTotal=rebateAmountTotal.toFixed(2);

  }
  /*
   *获取合同全部物料可用数量
   */
  getSCAllMaterialsCount() {
    let params = {
      "ContractCode": this.formData.SalesOrderData.ContractCode,
      "SalesOrderID": this.formData.SalesOrderData.SalesOrderID,
      "MaterialInfo": ""
    };
    this.orderCreateService.getMaterialData(params).subscribe(
      data => {
        if (data.Result) {
          let info = JSON.parse(data.Data);
          if (info["list"] && info.list.length > 0) {
            this.allMaterialsList = info["list"];
            let length = this.formData.DeliveryData.length;
            info.list.forEach(function(item, index) {
              let obj = {};
              // obj["count"] = item.AvailableQuantity;
              obj["all"] = JSON.parse(JSON.stringify(item.AvailableQuantity));
              obj["quantities"] = new Array(length).fill(0);
              this.allMaterialsCount[item["ContractMaterialID"]] = obj;
            }, this);
            //数据初始化，对已存在物料数量进行计算
            this.formData.DeliveryData.forEach(function(item, index) {
              if (item.MaterialList && item.MaterialList.length > 0) {
                this.materialListCount(item.MaterialList, index);
              }
            }, this);
          }
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
    );
  }
  /*
   *对添加物料进行数量计算
   */
  materialListCount(MaterialList, index) {

    //如果物料不存在ContractMaterialID，则不进行物料数量计算
    if(MaterialList.some(item=>!item.ContractMaterialID)) {
      this.isDisabledButtonState=true;//如果送达方下的物料列表不存在ContractMaterialID，就禁用添加按钮、删除按钮、切换清空物料按钮
      return;
    };

    MaterialList.forEach(function(m, i) {
      let materialCountArray = this.allMaterialsCount[m.ContractMaterialID]["quantities"];
      let materialCount = this.allMaterialsCount[m.ContractMaterialID]["all"];//物料总数
      let hadCount = 0;//订单已开出
      let diffCount = 0;//未开出物料个数
      materialCountArray.forEach(function(o, p) {
        if (p !== index) {
          hadCount += o;
        }
      });
      diffCount = materialCount - hadCount;
      if (diffCount > 0) {
        materialCountArray[index] = m.Quantity > diffCount ? diffCount : m.Quantity;
        if( m.Quantity > diffCount) this.windowService.alert({message:'输入数量超出可用数量，请重新输入',type:"fail"});
      } else {
        materialCountArray[index] = 0;
      }
      m.Quantity = materialCountArray[index];
      this.allMaterialsCount[m.ContractMaterialID]["quantities"] = materialCountArray;
    }, this);
  }
  /*
   *还借用回掉函数
   */
  returnCallBack(e?) {
    e.forEach(function(item, index) {
      item["SaleOrderID"] = this.formData.SalesOrderData.SalesOrderID;
    }, this)
    this.returnMaterialList = e;
    this.deliveryCallBack.emit(e);
  }
  /*
   *验证送达方是否填写完整
   */
  checkDeliveries() {
    if (this.formData.DeliveryData.length > 0) {
      let errorMessage = "";
      let singleSDF = this.formData.DeliveryData.length != 1 ? false : true;
      let isCheck = this.formData.DeliveryData.length != 1 ? false : true;
      let deliveryData = this.formData.DeliveryData;
      let orderTypeId = this.formData.SalesOrderData.OrderTypeId;
      deliveryData.some(function(item, index) {
        if (!item.Deliverinfo["SDFID"]) {//送达方验证
          errorMessage = singleSDF ? "送达方地址未编辑！" : "第" + (index + 1) + "个送达方地址未编辑！";
          return true;
        }
        // if (this.formData.SalesOrderData.OrderTypeId == '0002') {
        //   if (!item.isCheckReMoy) {//送达方验证
        //     errorMessage = isCheck ? "预收款未选择！" : "第" + (index + 1) + "个预收款未选择！";
        //     return true;
        //   }
        // }

        if (this.isReturnBorrow && (item.Deliverinfo["SDFCode"] === "A" || item.Deliverinfo["SDFCode"] === "ALY")) {
          errorMessage = "还借用订单，不能为一次性送达方！";
          return true;
        }
        if (item.MaterialList && item.MaterialList.length == 0) {//物料验证
          errorMessage = singleSDF ? "送达方未选择物料！" : "第" + (index + 1) + "个送达方未选择物料！";
          return true;
        }

        //新增验证 2019-2-14 当销售订单类型为’0005‘或’0011‘时，验证库存地
        if((orderTypeId==='0005'||orderTypeId==='0011') && item.MaterialList.some(item=>!item.StorageLocation)) {
          errorMessage = "请填写库存地";
          return true;
        }

        let otherFactory = "A" + item.MaterialList[0]["Factory"].slice(1);//物料工厂验证
        if (item.MaterialList) {
          item.MaterialList.some(function(m, i) {
            if (!m.MaterialCode || !m.MaterialName || !m.Factory) {
              errorMessage = "请正确编辑物料信息！";
              return true;
            };
            if (m.Quantity === 0) {
              errorMessage = "物料数量不可为零！";
              return true;
            };
            let storageLocation = m.StorageLocation;

            //厂商直发，物料库存地必须为xx99
            if (storageLocation&&orderTypeId === "0005" && storageLocation.slice(- 2) !== "99") {
              errorMessage = "厂商直发，物料库存地必须为xx99！";
              return true;
            };
            // if (storageLocation && orderTypeId !== "0005" && storageLocation.slice(- 2) === "99") {
            //   errorMessage = "物料库存地为xx99,订单类型必须为厂商直发！";
            //   return true;
            // };
            //还借用，物料库存地必须为xx06
            if (storageLocation && orderTypeId === "0011" && storageLocation.slice(- 2) !== "06") {
              errorMessage = "还借用，物料库存地必须为xx06！"
              return true;
            };
            if (storageLocation && orderTypeId !== "0011" && storageLocation.slice(- 2) === "06") {
              errorMessage = "物料库存地为xx06，订单类型必须为还借用！";
              return true;
            };
            if (item.MaterialList.length > 1 && (i + 1) < item.MaterialList.length && (m["Factory"] != item.MaterialList[i + 1]["Factory"] && otherFactory != item.MaterialList[i + 1]["Factory"])) {
              errorMessage = "多个物料应出自同一家工厂！";
              return true;
            };
          })
          if (errorMessage) {
            return true;
          }
        }
        //多送达方之间工厂判断
        if (!singleSDF && (index + 1) < deliveryData.length && item.MaterialList && item.MaterialList.length > 0 && deliveryData[index + 1]["MaterialList"].length > 0) {
          if (item.MaterialList[0]["Factory"] != deliveryData[index + 1]["MaterialList"][0]["Factory"] && otherFactory != deliveryData[index + 1]["MaterialList"][0]["Factory"]) {
            errorMessage = "多送达方，物料应出自同一家工厂！"
            return true;
          }
        }
      }, this);
      if (errorMessage) {
        return errorMessage;
      }
      if (this.formData.SalesOrderData.DepartmentProductGroupID !== this.formData.DeliveryData[0].MaterialList[0]["Factory"].slice(2).toUpperCase()) {
        errorMessage = "部门产品组与物料工厂不匹配,请修改相关数据！"
        return errorMessage;
      }
      if (this.isReturnBorrow && this.returnMaterialList.length > 0) {
        this.returnMaterialList.some(item => {
          if (item.ReturnCount <= 0) {
            errorMessage = "还借用物料数量不可为零！";
            return true;
          }
        })
        if (errorMessage) {
          return errorMessage;
        }
      }
    }
  }

  //下载多送达方导入模板
  downLoadTemplate() {
     window.open(dbomsPath +'assets/downloadtpl/销售订单多送达方物料导入模板.xlsx' );
  }


  //当上传文件成功时显示loading
  isLoading(e) {
    if (e) {
      this.loading = true;
    }
  }


  //上传成功的回调函数
  fileUploadSuccess(e) {
    this.loading=false;
    if(e.Result) {
      this.formData.DeliveryData=JSON.parse(e.Data).DeliveryData;
      
      //传递状态，用来禁用单个送达方的添加按钮、删除按钮以及切换清空物料按钮
      this.isDisabledButtonState=true;
      this.communicateService.sendDisabledButton('批量上传');

    }else {
      this.windowService.alert({message:e.Message,type:'fail'});
    }
  }

}
