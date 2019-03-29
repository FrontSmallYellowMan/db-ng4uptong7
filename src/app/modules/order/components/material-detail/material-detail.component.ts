import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { WindowService } from 'app/core';
import { DetailTipsComponent } from './errTips/detail-tips.component';
import { Person } from 'app/shared/services/index';
import { Pager, XcModalService, XcModalRef } from 'app/shared/index';
import { dbomsPath,environment } from "environments/environment";

import {
  MaterialForm, MaterialInfo, MaterialChangeInfo, MaterialInfoHisChange,
  MaterialDetailService
} from './../../services/material-detail.service';

import * as moment from 'moment';

declare var window,Blob,URL,document;



@Component({
  templateUrl: './material-detail.component.html',
  styleUrls: ['./material-detail.component.scss']
})
export class MaterialDetailComponent implements OnInit {
  public modalTips: XcModalRef;
  public materialInfoHisChange: MaterialInfoHisChange[] = [];//物料变更历史记录
  public loading = false;
  public formData: MaterialForm = new MaterialForm();//表单数据
  public displayMaterialList: MaterialInfo[] = [];//物料显示数据
  public isSubmit: boolean = false;//是否点击提交
  public fileUploadApi;//上传文件地址
  public hasNoCor = -1;//第几行无物料epr的标识
  public newAddMaterialIDCount = 1;//新加物料删除识别ID

  public fullChecked = false;//全选状态
  public fullCheckedIndeterminate = false;//半选状态
  public checkedNum = 0;//已选项数
  public currentUser = JSON.parse(localStorage.getItem("UserInfo"));
  // 物料搜索部分
  public searchMessage = '';// 物料搜索内容
  public isSearch = false;//控制搜索状态时，erp不存在是错误提示隐藏

  @ViewChildren('sale') saleDom;//表单控件DOM元素
  @ViewChildren('product') productDom;//表单控件DOM元素

  constructor(
    private router: Router,
    private routerInfo: ActivatedRoute,
    private xcModalService: XcModalService,
    private windowService: WindowService,
    private materialDetailService: MaterialDetailService
  ) { }

  ngOnInit() {
    if (!this.currentUser) {
      this.windowService.confirm({ message: "当前登录信息失效，请重新登录!" }).subscribe({
        next: (v) => {
          if (v) {
            window.location.href = dbomsPath + "login";
          }
        }
      })
      return;
    }
    this.modalTips = this.xcModalService.createModal(DetailTipsComponent);
    // //模型关闭的时候 如果有改动，请求刷新
    this.modalTips.onHide().subscribe((data) => {
      // console.info(data);
    })
    this.fileUploadApi = environment.server+"SaleOrder/UploadMaterialFile";
    let contractNumber = this.routerInfo.snapshot.queryParams['ContractCode'];
    this.materialDetailService.getOrderMaterialData(contractNumber).subscribe(
      data => {
        if (data.Result) {
          this.getFormDataCallBack(data.Data);
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  /*
   *获取物料
   */
  getMaterialHistory() {
    let params = {
      ContractNo: this.formData.SaleContractInfo.MainContractCode
    }
    this.materialDetailService.MaterialInfoHisChange(params).subscribe(
      data => {
        if (data.success == true) {
          this.materialInfoHisChange = data.data.List;
        } else {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      });
  }
  //数据回调函数
  getFormDataCallBack(data) {
    this.formData = data;
    console.log(data);
    this.getMaterialHistory();
    let contractInfo = data["SaleContractInfo"];
    let materialList = data["MaterialList"];
    if (contractInfo) {
      //销售员人员
      let saleInfo = {
        userID: contractInfo["SalesITCode"],
        userEN: contractInfo["SalesITCode"].toLocaleLowerCase(),
        userCN: contractInfo["SalesName"]
      };
      this.saleDom._results[0].Obj = saleInfo;
      //产品岗人员
      let productPerson = {
        userID: contractInfo["ProductPostITCode"] || this.currentUser["ITCode"],
        userEN: (contractInfo["ProductPostITCode"] || this.currentUser["ITCode"]).toLocaleLowerCase(),
        userCN: contractInfo["ProductPostName"] || this.currentUser["UserName"]
      };
      this.productDom._results[0].Obj = productPerson;
      this.formData.SaleContractInfo.ProductPostITCode = productPerson.userID;
      this.formData.SaleContractInfo.ProductPostName = productPerson.userCN;
    };
    if (materialList && materialList.length > 0) {
      let infoList = [];
      materialList.forEach((item, i) => {
        item.originalAvailableCount = item.AvailableCount;
        item.isEditMaterialNumber=!!item.MaterialNumber?false:true;//如果存在物料编号，则不能编辑
        infoList.push(item);
      });
      // this.displayMaterialList = infoList;//此处数组未进行深拷贝，与this.formData.MaterialList产生关联
      this.formData.MaterialList = this.displayMaterialList = this.sortMaterialList(infoList);

    }
  }
  //添加物料信息
  addMaterial() {
    let material = new MaterialInfo();
    material["isEdit"] = true;
    material["Status"] = 1;
    material["AvailableCount"] = 1;
    material["MaxAvailableCount"] = 0;
    material["Count"] = 0;
    material["newAddMaterialID"] = this.newAddMaterialIDCount++;
    /**
     * 修改为push();
     */
    this.displayMaterialList.push(material);
    this.formData.MaterialList=this.displayMaterialList;
    //this.formData.MaterialList.unshift(material);
    this.displayMaterialList.forEach(element=>{
      element['isEditMaterialNumber']=true;
    });
    console.log(this.displayMaterialList);

  }

  //下载合同物料文档
  loadFile() {
    //window.location.href = this.materialDetailService.filesDownload(this.formData.SaleContractInfo.MainContractCode);
    this.materialDetailService.exportMaterileTemplate(this.formData.SaleContractInfo.MainContractCode).subscribe(data=>{
      //let blob=new Blod([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      let blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      let fileName="物料明细列表";
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, `${fileName}.xls`);
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl,fileName);
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    })
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link,fileName){
    let newDate = moment().format("YYYY-MM-DD hh:mm:ss");//获取当前时间
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link)
    a.setAttribute("download",`${fileName}${newDate}`);
    a.click();
    document.body.removeChild(a);
  }


  //文件上传回调函数
  onFileCallBack(e?) {
    if (e.Result) {
      let pushData = e.Data;
      let idCount = this.newAddMaterialIDCount;
      pushData.forEach((item, index) => {
        item["isEdit"] = true;
        item["newAddMaterialID"] = idCount++;
      })
      this.newAddMaterialIDCount = idCount;
      // pushData.reverse();

      e.Data.forEach(element => {
        element.Batch=element.Batch.toUpperCase();
      });

      this.formData.MaterialList = this.formData.MaterialList.concat(pushData);
      this.displayMaterialList = this.displayMaterialList.concat(pushData);
      this.formData.MaterialList = this.sortMaterialList(this.formData.MaterialList);
      this.displayMaterialList = this.sortMaterialList(this.displayMaterialList);

      this.windowService.alert({ message: '上传物料信息成功', type: "success" });
    } else if(this.isJSON(e.Message)) {
      this.modalTips.show(e.Message);
    }else {
      this.windowService.alert({message:e.Message,type:'fail'});
    }
  }

  //判断上传物料返回的错误信息是否为json格式
  isJSON(errorMessage) {
    if (errorMessage) {
       try {
         if(typeof JSON.parse(errorMessage)==='object') return true;
       }catch(e) {
       }
       return false;
    }
  }

  //物料列表分类排序
  sortMaterialList(materiallist){
    if (materiallist && materiallist.length > 0) {
      let newArrayStatusZero = materiallist.filter(item => { return item["Status"] === 0 });
      let newArrayStatusOther = materiallist.filter(item => { return item["Status"] !== 0 });
      newArrayStatusOther = newArrayStatusOther.concat(newArrayStatusZero);
      return newArrayStatusOther;
    }
  }
  //删除物料信息
  delMaterial(list, i, material) {
    if (i == this.hasNoCor) {//删除时候错误提示时候让为-1
      this.hasNoCor = -1;
    };
    if (material["MaterialRecordID"]) {
      let params = {
        MaterialRecordID: material["MaterialRecordID"],
        ContractCode: this.formData.SaleContractInfo.MainContractCode
      };
      this.windowService.confirm({ message: "确定删除该物料？" }).subscribe({
        next: (v) => {
          if (v) {
            this.materialDetailService.MaterialDeleteData(params).subscribe(data => {
              if (data.Result) {
                this.windowService.alert({ message: '物料删除成功！', type: "success" });
                list.splice(i, 1);
                this.deleteNewMaterial(material);
              } else {
                this.windowService.alert({ message: data.Message, type: "fail" });
              }
            });
          }
        }
      });
    } else {
      list.splice(i, 1);
      this.deleteNewMaterial(material);
    };
  };
  /*
   *在总数居中删除新添加的物料
   */
  deleteNewMaterial(material) {
    if (material["newAddMaterialID"]) {
      let newMaterialList = [];
      this.formData.MaterialList.forEach(function(item, index) {
        if (material["newAddMaterialID"] !== item["newAddMaterialID"]) {
          newMaterialList.push(item);
        }
      });
      let displayMaterial = [];
      this.displayMaterialList.forEach(function(item, index) {
        if (material["newAddMaterialID"] !== item["newAddMaterialID"]) {
          displayMaterial.push(item);
        }
      });
      this.displayMaterialList = displayMaterial;
      this.formData.MaterialList = newMaterialList;
    }
  }
  /*
   *1、填写数字，格式化为正整数 replace(//g, "")
   *2、以已填写的可用数量为准两列值相等，可用数量不能为0
   */
  formatNumber(item, key, i) {
    let str = item[key].toString();
    if (str.length > 0) {
      item[key] = Math.abs(parseInt(str.replace(/^0*/g, ""))) || 1;
      if (key === "Count") {
        item[key] = Math.abs(parseInt(str.replace(/^0*/g, ""))) || 0;
      }
    } else {
      item[key] = parseInt(str) || 1;
    }
    this.displayMaterialList[i]['Count'] = item[key];
    
  }
  /*
   *ERP商品编码格式为数字加-
   */
  erpCodePattern(item,I) {
    item["MaterialNumber"] = item["MaterialNumber"].replace(/[^\d\-]/g, '');
    this.getMaterialContent(I);//获取物料名称
  }

  //根据物料号获取物料内容
  getMaterialContent(I){
    if(this.displayMaterialList[I].MaterialNumber){
      this.materialDetailService.getMaterialContent(this.displayMaterialList[I].MaterialNumber).then(data=>{
        if(data.Result) {//保存物料名称
          this.displayMaterialList[I].MaterialDescription=data.Data.MAKTX_ZH;
       }else{
         this.windowService.alert({message:'物料号不存在',type:"fail"});
         this.displayMaterialList[I].MaterialNumber="";
       }
      });
    }
  }

  /*
   *查看物料变更历史记录
   */
  sawHistory(link) {
    window.open(link);
  }
  /*
   *搜索物料明细
   */
  searchMaterial() {
    this.searchMessage = this.searchMessage.trim();
    if (this.searchMessage) {//搜索内容不为空时候进行搜索
      this.isSearch = true;//不是搜索状态
      this.fullChecked = false;
      this.fullCheckedIndeterminate = false;//半选状态
      this.checkedNum = 0;//已选项数
      let keyWord = this.searchMessage;
      let matchNumber = this.formData.MaterialList.filter(item => item.MaterialNumber.indexOf(keyWord) != -1);//匹配物料号的
      let unMatchNumber = this.formData.MaterialList.filter(item => item.MaterialNumber.indexOf(keyWord) == -1);//不匹配物料号的
      let matchName = unMatchNumber.filter(item => item.MaterialDescription.indexOf(keyWord) != -1);//在不匹配物料号的物料中，选择匹配物料名称的数据。避免重复
      this.displayMaterialList = matchNumber.concat(matchName);
    } else {
      this.isSearch = false;//不是搜索状态
      this.displayMaterialList = this.formData.MaterialList.concat();
    }
  }
  // 查看全部
  resetMaterial() {
    this.searchMessage = "";
    this.searchMaterial();
  }
  /*
   *点击物料判断是否可以编辑
   */
  clickEdit(material?, param?) {
    if (material.IsSold) {
      return;
    };
    if (material.Status === 1) {
      material.isEdit = true;
      material["newAddMaterialID"] = this.newAddMaterialIDCount++;
    } else {
      if (param && (param === "Remark" || param === "SalesUnit")) {
        material.partEdit = true;
      }
    }
  }
  //提交
  submit(e?) {
    this.isSubmit = true;
    this.resetMaterial();//验证的是全部数据，故显示全部数据提示
    this.formData.MaterialList=this.displayMaterialList;
    let mlList = this.formData.MaterialList;
    console.log(mlList,this.displayMaterialList);
    if (mlList.length == 0) {
      this.windowService.alert({ message: '请添加物料后再保存', type: "warn" });
      return;
    }
    for (let i = 0; i < mlList.length; i++) {//所有物料验证采购数量不能小于可用数量可用数量不能为小于0的数字
      for (let key in mlList[i]) {
        if (mlList[i][key] && typeof mlList[i][key] === "string") {
          mlList[i][key] = mlList[i][key].trim();
        }
      };
      if (mlList[i]["isEdit"]) {
        // 新增是物料信息都不能为空
        if (!mlList[i]["MaterialNumber"] || !mlList[i]["MaterialDescription"] || !mlList[i]["AvailableCount"] || !mlList[i]["FactoryCode"] || !mlList[i]["Count"]) {
          this.windowService.alert({ message: '请正确填写物料信息！', type: "warn" });
          return;
        }

        //验证库存地是否合法
        if(mlList.some(item=>item.StorageLocation&&item.StorageLocation.length<4)){
          mlList.forEach((element,index)=>{
            if(element.StorageLocation&&element.StorageLocation.length<4){
              this.windowService.alert({message:`第${index+1}行的库存地必须是4位`,type:"fail"});
              element['StorageLocationInvalid']=true;
            }
          });
          return;
        }

        //验证工厂是否合法
        if(mlList.some(item=>item.FactoryCode.length<4)){
          mlList.forEach((element,index)=>{
            if(element.FactoryCode.length<4){
              this.windowService.alert({message:`第${index+1}行的工厂必须是4位`,type:"fail"});
              element['FactoryCodeInvalid']=true;
            }
          });
          return;
        }

        

      };
    }
    this.materialDetailService.SaveContracData(this.formData).subscribe(data => {
      if (data.Result) {
        this.windowService.alert({ message: data.Message, type: "success" });
        this.hasNoCor = -1;//物料不存在编号为默认-1
        setTimeout(() => {
          this.windowService.close();
          window.close();
        }, 1500);
      } else {
        try {
          let mes = JSON.parse(data.Message);
          // this.hasNoCor = mes.Index-1>0?mes.Index-1:1;//物料编号（index）不存在
          this.hasNoCor = mes.Index - 1 >= 0 ? mes.Index - 1 : 0;//物料编号（index）不存在
          this.windowService.alert({ message: '物料信息的第' + (mes.Index) + '行有误:' + mes.Message, type: "fail" });
        }
        catch (e) {
          this.windowService.alert({ message: data.Message, type: "fail" });
        }
      }
      this.isSubmit = false;
    });
  }
  /*
   *物料变更，数据赋值
   */
  changeMaterial() {
    let selectedMaterial = this.formData.MaterialList.filter(item => item.checked == true);
    let materialChangeList = [];
    let currentUser = this.currentUser;
    let contractCode = this.formData.SaleContractInfo['MainContractCode']
    selectedMaterial.forEach(function(item, index) {
      let materialChange = new MaterialChangeInfo();
      materialChange.ExportMaterialNo = item.MaterialNumber;//物料编号
      materialChange.ExportMaterial = item.MaterialDescription;//物料名称
      materialChange.ExportSC_Code = contractCode;//转出销售合同号
      materialChange.ExportSalesUnit = item.SalesUnit;//销售单位
      materialChange.ExportStorageLocation = item.StorageLocation;//转出库存地
      materialChange.ExportFactory = item.FactoryCode;//转出工厂
      materialChange.ExportBatch = item.Batch;//转出批次
      materialChange.ExportCount = item.AvailableCount;
      materialChange.ApplyName = currentUser.UserName;
      materialChange.ApplyItCode = currentUser.ITCode;
      materialChangeList.push(materialChange);
    });
    if (materialChangeList.length === 0) {
      this.windowService.alert({ message: '请先选择要变更的物料', type: "warn" });
      return;
    };
    let factory = materialChangeList[0].ExportFactory;
    for (var i = 0; i < materialChangeList.length; i++) {
      if (materialChangeList[i].ExportFactory != factory) {
        this.windowService.alert({ message: '发起物料变更必须是同一个工厂', type: "warn" });
        return;
      }
    }
    this.getChangeMaterial(materialChangeList);
  }
  /*
   *物料变更调用
   */
  getChangeMaterial(changeList) {
    this.loading = true;
    let param = {
      "Flag": 1,
      "Data": JSON.stringify(changeList)
    }
    this.materialDetailService.MaterialInfoChange(param).subscribe(data => {
      this.loading = false;
      if (data.success) {
        this.windowService.alert({ message: '物料变更请求成功', type: "success" });
        setTimeout(() => {
          this.windowService.close();
          window.open(dbomsPath + 'mate/edit-nmc/' + data.data);
        }, 1500);
      } else {
        this.windowService.alert({ message: '物料变更请求失败', type: "fail" });
      }
    });
  }
  back() {
    window.close();
  }

  //失去焦点时验证库存地
  testStorageLocationAndFactoryCode(i,key){

    if(!this.displayMaterialList[i][key]&&key==='StorageLocation') return;//如果库存地没有填写，则不验证

    if(this.displayMaterialList[i][key].length<4){//如果工厂或者库存地不足4位
      if(key==='StorageLocation'){
        this.displayMaterialList[i]['StorageLocationInvalid']=true;
      }else{
        this.displayMaterialList[i]['FactoryCodeInvalid']=true;
      }

    }else{
        this.displayMaterialList[i]['FactoryCodeInvalid']=false;
        this.displayMaterialList[i]['StorageLocationInvalid']=false;
    }
  }

  //清空物料
  emptyMaterial(){
    
    if(this.formData.SaleContractInfo.MainContractCode){
      this.materialDetailService.resetContractMaterial(this.formData.SaleContractInfo.MainContractCode).then(data=>{
        console.log(data);
        if(data.Result){
          this.formData.MaterialList=[];//清空物料
          this.displayMaterialList=[];//清空物料
        }else{
          this.windowService.alert({message:'清空合同物料失败',type:'fail'});
        }
      })
    }
  }

}
