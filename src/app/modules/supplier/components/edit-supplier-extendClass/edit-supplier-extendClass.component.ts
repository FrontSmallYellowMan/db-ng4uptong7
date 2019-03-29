import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { dbomsPath,environment } from "environments/environment";
import { Pager,XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';

import { SupplierService,Company,BusinessUnit,ExtendSupplierData,SupplierClass} from "../../services/supplier.service";

@Component({
  selector: 'edit-supplier-ec',
  templateUrl: 'edit-supplier-extendClass.component.html',
  styleUrls:['edit-supplier-extendClass.component.scss','../../scss/supplier.component.scss']
})

export class EditSupplierExtendClassComponentd implements OnInit {

  modal: XcModalRef;
  company:Company=new Company();//初始化参数
  businessUnit:BusinessUnit=new BusinessUnit();
  extendSupplierData:ExtendSupplierData=new ExtendSupplierData();

  //复选按钮所需字段
  fullCheckedPopup = false;
  fullCheckedIndeterminatePopup = false;
  checkedNumPopup = 0;

  checked:any;
  pagerData: any = new Pager();
  supplierClass:SupplierClass=new SupplierClass();

  isShow:string;//用来标示是否显示相应的组件
  companyListApi:string="InitData/GetPageDataCompany";//用来保存请求公司代码数据列表
  companyList:any;//用来保存公司列表数据
  companyTitle:any;//用来保存选中的公司

  classnamecode:string;//用来保存供应商分类
  classname:string;//用来保存供应商分类名称
  
  selectBD:any[]=[];//用来保存选择的事业部

  searchList:any;//用来保存事业部列表

  loading:boolean=false;//是否显示loading等待画面

  supplierClassList:any;//用来保存分类供应商列表
  extendSupplierLIst:any;//用来保存扩展供应商列表

  isShowAlert:boolean=false;//是否显示错误提示
  errorMessage:string;//错误提示

  isSubmit:boolean=false;//是否点击扩展按钮


  constructor(
    private windowService: WindowService,
    private xcModalService: XcModalService,
    private supplierService:SupplierService,
  ) { }

  @ViewChild("form") public form: NgForm

  ngOnInit() {
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.modal.onShow().subscribe(data => {//显示弹窗
      this.isShow=data.type;//获取触发显示的类型，是extend（扩展）还是class（分类）
      this.extendSupplierLIst=data.parames;
      console.log(this.extendSupplierData.Vendors);
      this.supplierClassList=data.supplierClass;
      //如果是“分类”
      if(this.isShow==='class'){
        this.isClass();
       }
    });

  }

  //检查是否全选
  CheckIndeterminatePopup(e) {
    this.fullCheckedIndeterminatePopup = e;
    //console.log(e);
  }
  //分页代码
  onChangePage(e: any) {
    //this.reqSearchData.Keyword = this.reqSearchData.Keyword || "";
    this.businessUnit.pageNo = e.pageNo;
    this.businessUnit.pageSize = 6;

    this.initData(this.businessUnit);
  }
  //向数据库发送请求
  initData(businessUnit: BusinessUnit) {
    this.fullCheckedPopup = false;
    this.fullCheckedIndeterminatePopup = false;
    this.checkedNumPopup = 0;

    this.supplierService.searchBusinessUnit(this.businessUnit).then(data => {

        //设置分页器
        this.pagerData.set(data.data.pager);
        console.log(this.pagerData);
        //this.loading = false;      
        this.searchList = data.data.rows;
        console.log(this.searchList);

    });
    this.selectBD=[];
  }

  //关闭弹窗
  cancel(){
    this.isSubmit=false;//重置为不点击按钮
    this.businessUnit.pageNo=1;//重置列表页为1
    this.companyTitle=undefined;//清空选择的欲扩展公司
    this.supplierClassList.classnamecode=this.classnamecode=undefined;//清空供应商分类
    this.extendSupplierData.CompanyCodeNew=undefined;//清空欲扩展公司代码
    this.supplierClassList.classname="";//清空供应商分类名称
    this.supplierClassList.syb=this.selectBD=[];//清空事业部泪飙
    this.errorMessage=undefined;//清空错误提示
    this.businessUnit.SearchTxt="";  
   this.modal.hide("yes");//关闭弹出框
  }

  //如果是显示分类窗口
  isClass(){
    this.businessUnit.pageNo=1;
    this.initData(this.businessUnit);//获取事业部列表
  }

  //搜索事业部
  searchBusinessUnit(){
    this.businessUnit.pageNo=1;
    this.initData(this.businessUnit);
  }

  //获取选中的公司
  getCompany(e){
    console.log(e[1]);
    this.extendSupplierData.CompanyCodeNew=e[1];//将获取到的公司存入变量
    this.extendSupplierData.CompanyNameNew=e[0];//将获取到的公司名称存入变量
    console.log(this.extendSupplierData.CompanyCodeNew);
  }

  //扩展供应商
  extendSupplier(){
    this.isSubmit=true;//点击扩展供应商按钮
    this.extendSupplierData.Vendors=JSON.parse(JSON.stringify(this.extendSupplierLIst));//将数组转换后存储，以免操作数组时出现错误

    this.extendSupplierData.Vendors.forEach((item,index,input) => {
      input[index]=JSON.parse(item);
    });

    if(!this.extendSupplierData.CompanyCodeNew){//如果扩展公司为空
      return;
    }

    this.loading=true;
    this.supplierService.extendSupplier(this.extendSupplierData).then(data=>{
      if(data.success){
        this.loading=false;
        this.windowService.alert({message:"扩展成功",type:"success"});
        this.cancel();
      }else{
        this.loading=false;
        this.windowService.alert({message:data.message,type:"fail"});
        this.cancel();
      }
    });
  }

  //获取供应商分类
  getSupplierClass(){
    switch (this.classnamecode) {
      case "0":
        this.classname = "核心";
        break;
      case "1":
        this.classname = "非核心";
        break;
      case "2":
        this.classname = "新产品";
        break;
      default:
        break;
    }
    console.log(this.classname);
  }

  //获取选中的事业部
  getSelectItem(isSelect,I){

    let BBMC:string=this.searchList[I].BBMC;
    let SYBMC:string=this.searchList[I].SYBMC;
    let SYB:any=JSON.stringify({BBMC:BBMC,bizdivision:SYBMC});

    if (isSelect && this.selectBD.indexOf(SYB)===-1) {
      this.selectBD.push(SYB);//用来扩展供应商
    }
    //如果没有选中并且数组中存在所选项的ID，将ID从数组中删除
    if (!isSelect && this.selectBD.indexOf(SYB)>-1) {
      this.selectBD.splice(this.selectBD.indexOf(SYB),1);
    }
    console.log(this.selectBD);
  }

  //提交供应商分类
  submitSupplierClass(){
    this.isSubmit=true;//点击提交按钮
    if(!this.classnamecode){
      this.isShowAlert=true;
      this.errorMessage="请选择供应商分类";
      return;
    }else if(this.selectBD.length===0){
      this.errorMessage="请选择事业部";
      return;
    }else{
      this.getSupplierClass();//获取供应商分类名称

      this.selectBD.forEach((item,index,input)=>{//将事业部列表转换为对象
        input[index]=JSON.parse(item);
      });

      this.supplierClassList.forEach((item,index,input) => {//赋值给请求参数里的对应字段
        input[index]=JSON.parse(item);
        input[index].syb=this.selectBD;
        input[index].classname=this.classname;
        input[index].classnamecode=this.classnamecode;
      });

      console.log(this.supplierClassList);
      this.loading=true;
      //请求分类接口
      this.supplierService.classSupplier(this.supplierClassList).then(data=>{
        if(data.success){
          this.loading=false;
          if(data.data){
            if(data.data.msg){
              this.windowService.alert({message:data.data.msg,type:"warn"});
            }
          }else{
            this.windowService.alert({message:"供应商修改分类成功",type:"success"});
          }
          
          this.cancel();
        }else{
          this.windowService.alert({message:data.message,type:"fail"});
        }
      });

    }

  }
  

}