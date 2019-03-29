import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { ProductDetail } from '../entitytype/producdetail';
declare var $: any;
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WindowService } from "app/core";

@Component({
  selector: 'dbcontpl-productdetail',
  templateUrl: './productdetail.component.html',
  styleUrls: ['./productdetail.component.scss']
})
export class ProductdetailComponent implements OnInit {

  constructor(private windowService: WindowService) { }

  @Output() onTotalMoneyChange = new EventEmitter<boolean>();
  @Input() public products: ProductDetail[];
  @Input() public ProductRelated: any;
  @Input() public isView: boolean = false;
  @Input() public isHuaWei = true;//是否华为本部
  public isViewTpl: boolean = false;
  public ProductDetail: ProductDetail;
  public productNameRows: number = 1;
  public modelRows: number = 1;
  public Originalprice = 0.00;
  ngOnInit() {
    this.products.map(function (item) {
      item["showEditTpl"] = false;
    });
    this.ProductRelated.TotalMoneyUpper = this.DX(this.ProductRelated.TotalMoney);
  }

  //添加
  onAdd() {
    this.ProductDetail = new ProductDetail('', '', '', 0, 0.00, 0.00, '');
    this.ProductDetail["index"] = this.products.length + 1;
    this.isViewTpl = true;
  }
  //取消添加
  onCancelSave() {
    this.isViewTpl = false;
  }
  //添加--保存
  onAddSave(newProductDetail: ProductDetail) {
    let valieInfo = this.onCheckSave(newProductDetail);
    if (valieInfo.valid) {
      this.products.push(newProductDetail);
      this.isViewTpl = false;
      this.initProductIndex(this.products);
      this.onCalculateTotalAmount();
    } else {
      this.windowService.alert({ message: valieInfo.message, type: "warn" });
    }
  }
  //编辑
  onClickEdit(ProductDetail: ProductDetail) {
    if (this.onCheckSave(ProductDetail).valid && !this.isViewTpl) {
      this.onEditSave(ProductDetail);
      this.isViewTpl = false;
    }
    let index = this.products.indexOf(ProductDetail);
    this.products[index]["showEditTpl"] = true;
    for (let i = 0; i < this.products.length; i++) {
      if (i != index) {
        this.products[i]["showEditTpl"] = false;
      }
    }
    this.productNameRows = Math.ceil(ProductDetail["ProductName"].length / 20);
    this.modelRows = Math.ceil(ProductDetail["Model"].length / 10);
  }
  //取消 编辑 ？
  onCancelEditSave(item: ProductDetail) {
    item["showEditTpl"] = false;
  }
  //编辑--保存
  onEditSave(ProductDetail: ProductDetail) {
    let valieInfo = this.onCheckSave(ProductDetail);
    if (valieInfo.valid) {
      let index = this.products.indexOf(ProductDetail);
      this.products[index]["showEditTpl"] = false;
      this.products.splice(index, 1, ProductDetail);
      this.onCalculateTotalAmount();
    } else {
      this.windowService.alert({ message: valieInfo.message, type: "warn" });
    }
  }
  //删除
  onDel(item) {
    if (this.products.length > 1) {
      this.products.splice(this.products.indexOf(item), 1);
      this.initProductIndex(this.products);
      this.onCalculateTotalAmount();
    } else {
      this.windowService.alert({ message: "产品至少保留一行！", type: "warn" });
    }
  }
  //重新排序
  initProductIndex(array) {
    for (let i = 1; i <= this.products.length; i++) {
      this.products[i - 1]["index"] = i;
    }
  }
  //换行 产品
  onNewLinePro(event) {
    if (event.keyCode == 13) {
      event.target.rows += 1;
    }
    if (event.keyCode == 8) {
      if (event.target.rows == 1) {
        return;
      }
      event.target.rows -= 1;
    }
    if (event.keyCode == 86) {
      event.target.rows += Math.ceil(event.target.value.length / 22) - 1;
    }
    if (event.keyCode == 32 || event.keyCode == 8) {
      event.target.rows = Math.ceil(event.target.value.length / 22);
    }
  }
  //换行 型号
  onNewLineModel(event) {
    if (event.keyCode == 13) {
      event.target.rows += 1;
    }
    if (event.keyCode == 8) {
      if (event.target.rows == 1) {
        return;
      }
      event.target.rows -= 1;
    }
    if (event.keyCode == 86) {
      event.target.rows += Math.ceil(event.target.value.length / 9) - 1;
    }
    if (event.keyCode == 32 || event.keyCode == 8) {
      event.target.rows = Math.ceil(event.target.value.length / 9);
    }
  }
  onSelectMaxLen(event, maxLen: number) {
    let val = event.target.value.toString();
    if (val.length > maxLen) {
      event.target.value = "";
      this.windowService.alert({ message: "输入字数不得大于" + maxLen, type: "warn" });
      
    }
  }
  onInputToggle(event) {
    if (event.target.id === "discountRatio") {
      this.ProductRelated.DiscountMoney = null;
      //折扣不能大于100%
      if (this.ProductRelated.DiscountRatio > 100) {
        this.ProductRelated.DiscountRatio = 0;
        this.windowService.alert({ message: "折扣金额不能大于总计！ \n 请重新填写", type: "warn" });
        return;
      }
      this.onCalculateTotalAmount();
    }
    if (event.target.id === "discountMoney") {
      this.ProductRelated.DiscountRatio = null;
      if (this.ProductRelated.DiscountMoney > this.Originalprice) {
        this.ProductRelated.DiscountMoney = 0;
        this.windowService.alert({ message: "折扣金额不能大于总计！\n 请重新填写", type: "warn" });
        return;
      }
      this.onCalculateTotalAmount();
    }
  }
  //计算总价
  onCalculateTotalAmount() {
    let totalMoney = 0.00;
    this.products.map(function (item) {
      totalMoney += Number(item["TotalPrice"]);
    });
    this.Originalprice = totalMoney;
    if (this.ProductRelated.DiscountRatio) {
      this.ProductRelated.TotalMoney = totalMoney * (1 - Number(this.ProductRelated.DiscountRatio) / 100);
    } else if (this.ProductRelated.DiscountMoney) {
      this.ProductRelated.TotalMoney = totalMoney - Number(this.ProductRelated.DiscountMoney);
    } else {
      this.ProductRelated.TotalMoney = totalMoney;
    }
    this.ProductRelated.TotalMoney = Number(Number(this.ProductRelated.TotalMoney).toFixed(2));
    this.ProductRelated.TotalMoneyUpper = this.DX(this.ProductRelated.TotalMoney);
    this.onTotalMoneyChange.emit();
  }
  //数字转化为大写中文
  DX(n) {
    let isAbs = false;
    if(Number(n) < 0){
      isAbs = true;
      n = Math.abs(n);
    }
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
      return "数据非法";
    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
    n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
      n = n.substring(0, p) + n.substr(p + 1, 2);
    unit = unit.substr(unit.length - n.length);
    for (var i = 0; i < n.length; i++)
      str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    if(isAbs){
      return "负" + str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    }else{
      return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    }
  }
  //计算每行总价
  onCalItemTotalMoney(item: ProductDetail) {
    if (!/^[+]{0,1}(\d+)$/.test(item.Qty)) {
      this.windowService.alert({ message: "数量为正整数", type: "warn" });
      item.Qty = 0;
      return;
    }
    if (item.Qty > 0) {
      if (this.products.indexOf(item) >= 0) {
        this.products[this.products.indexOf(item)].TotalPrice = Number((item.Qty * item.Price).toFixed(2));
      } else {
        this.ProductDetail.TotalPrice = Number((item.Qty * item.Price).toFixed(2));
      }
    }
    if(item.Price && !isNaN(item.Price) && item.Price != 0){
      this.ProductDetail.Price = Number(item.Price.toFixed(2));
    }
    this.onCalculateTotalAmount();
  }
  //验证
  onCheckSave(item) {
    let validInfo = { valid: true, message: "请输入必填项" };
    for (let key in item) {
      if (key != 'Remark' && key != 'MaterialDescription' && !item[key]) {
        if (key != 'SC_Code') {
          validInfo.valid = false;
        }
      }
    }
    if (!validInfo.valid) {
      return validInfo;
    }
    if (this.isHuaWei) {
      //备注一样的行项目 单价是否一样
      let itemRemark = item["Remark"].toString().trim();
      let itemPrice = item["Price"];
      let sameItemArray = this.products.filter((item, index, array) => { return itemRemark && item["Remark"] == itemRemark });
      if (sameItemArray.length > 0 && itemPrice != sameItemArray[0].Price) {
        validInfo.valid = false;
        validInfo.message = "单价与备注不匹配";
      }
    }
    return validInfo;
  }
  //textarea换行处理
  onTextareaInput(str, ele, textareaEle, width) {
    $(ele).text(str);
    let strWidth = $(ele)[0].offsetWidth;
    let rows = Math.ceil(strWidth / width);
    if (strWidth < 15) {
      rows = 1;
    }
    textareaEle.target.rows = rows;
  }
}
