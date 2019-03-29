import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { dbomsPath,environment } from "environments/environment";
import { Router } from "@angular/router";

import { SupplierService, SupplierList,ExtendSupplierData,SaveMyRemarksData,Syncro,SupplierClass, DelectSupplierIsShowTipsData } from "../../services/supplier.service";
import { EditSupplierExtendClassComponentd } from "../edit-supplier-extendClass/edit-supplier-extendClass.component";

@Component({
  selector: 'supplier-sm',
  templateUrl: 'supplier-supplierManage.component.html',
  styleUrls: ['supplier-supplierManage.component.scss', '../../scss/supplier.component.scss']
})

export class SupplierManageComponent implements OnInit {

  pagerData: any = new Pager();
  modal: XcModalRef;
  supplierList:SupplierList=new SupplierList();//初始化查询供应商
  extendSupplierData:ExtendSupplierData=new ExtendSupplierData();//扩展供应商字段
  saveMyRemarksData:SaveMyRemarksData=new SaveMyRemarksData();//保存我的关注
  syncro:Syncro=new Syncro();//初始化同步参数
  supplierClass:SupplierClass=new SupplierClass();

  //复选按钮所需字段
  fullChecked = false;
  fullCheckedIndeterminate = false;
  checkedNum = 0;

  loading: boolean = false;//是否显示loading效果

  isSearchResult: boolean = true;//是否显示搜索结果
  notSelect: boolean = true;//用来判断顶部的三个功能按钮是否可以点击
  //unEdit:boolean=true;//用来判断“我的关注”是否可以编辑

  searchList: any;//保存列表内容

  tempRequestData: any = [];//用来存储列表中选择的数据

  vendors:any=[];//用来保存要同步的供应商列表
  supplierClassVendors:any=[];//用来保存要分类的供应商

  supplierRole:number;//用来区分角色（1:采购岗，2:产品岗）

  highSearchShow: boolean = false;//高级搜索

  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private supplierService:SupplierService,
    private router:Router
  ) { }

  @ViewChild("form") public form: NgForm

  ngOnInit() {

    this.getUser();//用来判断用户角色

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(EditSupplierExtendClassComponentd);
    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
        if (data) {
            this.initData(this.supplierList);
        }
    })

    this.watchLocalStrong();//监听localstrong的变化，用来判断是否刷新列表

  }

  //打开高级搜索
  openSearch() {
    this.highSearchShow = true;
  }

  //收起高级搜索
  closeSearch() {
    this.highSearchShow = false;
  }


  //新建物料数据修改
  addData() {
    window.open(dbomsPath + 'supplier/edit-supplier-ncs/' + 0);
  }

  //检查是否全选
  CheckIndeterminate(e) {
    this.fullCheckedIndeterminate = e;
    //console.log(e);
  }
  //分页代码
  onChangePage(e: any) {
    
    this.supplierList.PageNo = e.pageNo;
    this.supplierList.PageSize = e.pageSize;
    this.initData(this.supplierList);
  }
  //向数据库发送请求
  initData(supplierList: SupplierList) {
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.checkedNum = 0;

    this.supplierService.searchSupplierLIst(this.supplierList).then(data => {

       if(data.success){
         console.log(data.data);
          //设置分页器
        this.pagerData.set(data.data.pager);
        //this.loading = false;      
        this.searchList = data.data.list;
        this.searchList.forEach(element => {
          element.unEdit=true;//增加unEdit属性
          if(!element.MyContent){//如果我的关注不存在值，则将内容置为“请填写我的关注”
            element.MyContent="请填写我的关注";   
                    
          }
        });
        console.log(this.searchList);
        if (this.searchList == "") {//判断如果查询列表为空，则显示缺省页面
            this.isSearchResult = false;//显示缺省页面 
        } else {
            this.isSearchResult = true;//隐藏缺省页
        }
       }else{
         this.windowService.alert({message:data.message,type:"fail"});
       }

    });
    this.extendSupplierData.Vendors=[];
    this.vendors=[];
    this.supplierClassVendors=[];
  }

  //搜索
  searchData() {
    this.supplierList.PageNo='1';
    //this.supplierList.SearchTxt=this.supplierList.SearchTxt?this.supplierList.SearchTxt.replace(/(^\s*)|(\s*$)/g,''):"";//过滤搜索关键词前后的空格
    this.initData(this.supplierList);
    this.extendSupplierData.Vendors=[];
   }

  //重置
  reset() {
    this.supplierList=new SupplierList();
  }

  //当按回车时，搜索数据
  enterSearch(e){
   if(e.keyCode == 13){
     this.searchData();
   }
  }

  //列表项是否选择
  getSelectList(isSelect, Id,i) {
    //console.log(isSelect, Id);
    
    this.extentSupplierList(isSelect,i);
    this.syncroSupplierList(isSelect,i);//同步供应商列表
    this.supplierClassList(isSelect,i);//供应商分类
    this.topButtonControl();////判断数组中是否为空，以决定顶部的三个功能按钮是否可以点击
  }

  //判断数组中是否为空，以决定顶部的三个功能按钮是否可以点击
  topButtonControl() {
    if (this.extendSupplierData.Vendors.length > 0) {
      this.notSelect = false;
    }else{
      this.notSelect = true;
    }
  }

  //当双击鼠标时，“我的关注”字段切换为编辑状态
  EditMyAtt(i){
    this.searchList[i].unEdit=false;
    this.searchList[i].MyContent=(this.searchList[i].MyContent==="请填写我的关注")?"":this.searchList[i].MyContent;
  }

  //当鼠标失去焦点时，提交数据，锁定文本框
  setMyAtt(i,myContent,Id,vendorId,vendorno){
    this.searchList[i].unEdit=true;
    if(!this.searchList[i].MyContent){
      this.searchList[i].MyContent="请填写我的关注";
    }
    this.saveMyRemarks(myContent,Id,vendorId,vendorno);
    
  }

  //扩展供应商,分类供应商
  extendClassSupplier(type){
    let parameter={type:type,parames:this.extendSupplierData.Vendors,supplierClass:this.supplierClassVendors}
    this.modal.show(parameter);//显示弹出框
  }

  //跳转到供应商详情页面
  getDetail(Id){
    window.open(dbomsPath + "supplier/edit-supplier-ssd/" + Id);    
  }

  //修改供应商详情页
  changeSupplier(Id){
   window.open(dbomsPath+`supplier/edit-supplier-ncs/${Id}?supplierchange=true&state=new`);
  }

  //保存我的关注
  saveMyRemarks(myContent,Id,vendorId,vendorno){
   this.saveMyRemarksData.Content=myContent;
   console.log(Id)
   Id===null?this.saveMyRemarksData.Id=0:this.saveMyRemarksData.Id=Id;
   this.saveMyRemarksData.VendorId=vendorId;
   this.saveMyRemarksData.VendorNo=vendorno;
   this.supplierService.saveMyRemarks(this.saveMyRemarksData).then(data=>{
     if(data.success){
       this.initData(this.supplierList);
     }
   });
  }

  //保存已选择的供应商列表，用来扩展供应商
  extentSupplierList(isSelect, I) {
    let VendorId=this.searchList[I].vendorid;
    let VendorNo=this.searchList[I].vendorno;
    let vendorObj=JSON.stringify({VendorId:VendorId,VendorNo:VendorNo});

    if (isSelect && this.extendSupplierData.Vendors.indexOf(vendorObj) === -1) {
      this.extendSupplierData.Vendors.push(vendorObj);//用来扩展供应商
    }
    //如果没有选中并且数组中存在所选项的ID，将ID从数组中删除
    if (!isSelect && this.extendSupplierData.Vendors.indexOf(vendorObj) > -1) {
      this.extendSupplierData.Vendors.splice(this.extendSupplierData.Vendors.indexOf(vendorObj), 1);
    }

    //console.log(this.extendSupplierData);
  }

  //保存已选择的供应商列表，用来同步供应商
  syncroSupplierList(isSelect,I){

    this.syncro.VendorId=this.searchList[I].vendorid;//保存供应商ID
    this.syncro.VendorNo=this.searchList[I].vendorno;//保存供应商编号
    this.syncro.PurchaseOrganization=this.searchList[I].purchaseorganization;//保存采购组织
    this.syncro.CompanyCode=this.searchList[I].companycode;//保存公司代码

    let syncroToString=JSON.stringify(this.syncro);

    if(isSelect&&this.vendors.indexOf(syncroToString)==-1){
      this.vendors.push(syncroToString);
    }

    if(!isSelect&&this.vendors.indexOf(syncroToString)>-1){
      this.vendors.splice(this.vendors.indexOf(syncroToString),1);
    }
    //console.log(this.vendors);
  }

  //获取供应商列表，用来做供应商分类
  supplierClassList(isSelect,I){
    this.supplierClass.vendor=this.searchList[I].vendor;//保存供应商名称
    this.supplierClass.vendorid=this.searchList[I].vendorid;//保存供应商id
    this.supplierClass.vendorno=this.searchList[I].vendorno;//保存供应商编号

    let supplierClassToString=JSON.stringify(this.supplierClass);

    if(isSelect&&this.supplierClassVendors.indexOf(supplierClassToString)==-1){
      this.supplierClassVendors.push(supplierClassToString);
    }

    if(!isSelect&&this.supplierClassVendors.indexOf(supplierClassToString)>-1){
      this.supplierClassVendors.splice(this.supplierClassVendors.indexOf(supplierClassToString),1);
    }
    //console.log(this.supplierClassVendors);

  }

  //同步供应商
  syncroSupplier(){
    this.vendors.forEach((element,index,input) => {
      input[index]=JSON.parse(element);
    });

    this.loading=true;
    this.supplierService.syncroSupplier({Vendors:this.vendors}).then(data=>{
      if(data.success){
        this.loading=false;
        this.windowService.alert({message:"同步成功",type:"success"});
        this.initData(this.supplierList);
      }else{
        this.windowService.alert({message:data.message,type:"fail"});
      }
    });
  }

  getSupplierList(SearchTxt){
    SearchTxt?SearchTxt=SearchTxt:SearchTxt='';
    this.supplierService.getSupplierExtendList(SearchTxt).subscribe(data=>{
      console.log(data);
      let blob = new Blob([data], {type: "application/vnd.ms-excel"});
      if('msSaveOrOpenBlob' in window.navigator){
        window.navigator.msSaveBlob(blob, '供应商列表.xls');
      }else{
        let objectUrl = URL.createObjectURL(blob);//创建链接
        this.aClick(objectUrl);
        URL.revokeObjectURL(objectUrl);//释放链接
      }
    });
    //this.aClick(environment.server + `vendor/download?SearchTxt=${SearchTxt}`);
  }

  //模拟a标签点击下载，此种接口请求window.open和window.location.href不可用
  aClick(link){
    console.log(link);
    let a=document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style","display:none");
    a.setAttribute("href",link);
    a.setAttribute("download","供应商列表");
    a.click();
    document.body.removeChild(a);  
  }

  //监听loaclstrong，用来确认是否刷新列表页
  watchLocalStrong(){
    let that=this;
    window.addEventListener("storage", function (e) {//监听localstorage
      //console.log(e.newValue,e);
      if(e.key==="editFinsh"&&e.newValue.search("tempSave")!=-1){//如果是暂存
        that.initData(that.supplierList);
        localStorage.removeItem('editFinsh');
      }else if(e.key==="editFinsh"&&e.newValue.search("submit")!=-1){//如果是提交
        that.initData(that.supplierList);
        console.log(e.newValue,e);
        localStorage.removeItem('editFinsh');
      }
  });
  }

  //获取角色权限
  getUser(){
    let user = JSON.parse(localStorage.getItem("UserInfo"));
    let itcode;
    if (user) {//获取登录人头像信息
      itcode = user["ITCode"];
      this.supplierService.getUser(itcode).then(data => {
        if(data.success){
         this.supplierRole=data.data.re;
         if(this.supplierRole==0){//如果无权访问页面
           return;
         }

        }else{
          this.supplierRole=0;
        }
      });
    }
  }

  /**
   * 2019-1-18 新增删除供应商
   */
   deleteSupplier() {
     if(this.searchList.every(item=>!item.checked)) return;

     let delArray=this.searchList.filter(item=>item.checked);// 保存需要删除的供应商列表
     let reqDeleteSupplierData:any=[];//保存删除供应商的请求字段
     console.log(delArray);

     delArray.forEach(element => {// 遍历要删除供应商列表，获取需要传递的请求参数

      let reqDeleteSupplierItem:DelectSupplierIsShowTipsData=new DelectSupplierIsShowTipsData();//要删除的供应商所需请求的字段
      reqDeleteSupplierItem.VendorBizdivisionClassID = element.VendorBizdivisionClassID;
      reqDeleteSupplierItem.VendorID = element.vendorid;
      reqDeleteSupplierItem.VendorNo = element.vendorno;
      
      reqDeleteSupplierData.push(reqDeleteSupplierItem);// 将单挑数据push进入请求参数

     });
     
     if(delArray.some(item=>item.ClassName === '核心')) {// 如果供应商为核心
       this.isSuppplierOnly(reqDeleteSupplierData);// 验证核心供应商是否唯一
     }else {
       this.deleteSupplierAPI(reqDeleteSupplierData);//删除供应商
     }


   }

   // 如果删除的供应商包含核心供应商，则需要请求接口，判断核心供应商是否唯一
   isSuppplierOnly(reqDeleteSupplierData) {
     this.supplierService.deleteSupplierIsShowTips(reqDeleteSupplierData).then(data=> {

       if(data.success&&data.data) {
         console.log(data);
        this.windowService.confirm({message:`对应的供应商跟踪中，供应商${data.data}的状态将被置为无效，是否继续删除？`}).subscribe(v=> {
          if(v) {
            this.deleteSupplierAPI(reqDeleteSupplierData);//删除供应商      
          }
        });

       }else if(data.success&&!data.data) {//表示所选供应商可以删除
         this.deleteSupplierAPI(reqDeleteSupplierData);// 删除供应商
       }
     });
   }

   //删除供应商API
   deleteSupplierAPI(reqDeleteSupplierData) {
     this.supplierService.deleteSupplier(reqDeleteSupplierData).then(data=> {
       if(data.success) {
         this.windowService.alert({message:'删除供应商成功！',type:'success'}).subscribe(()=> {
          this.initData(this.supplierList);
         });
       }else {
         this.windowService.alert({message:data.message,type:'fail'});
       }
     });
   }

}