import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Person } from "../../../../../../app/shared/services/index";
import { WindowService } from "../../../../../../app/core";
import { environment } from "../../../../../../environments/environment";
import { ActivatedRoute } from "@angular/router";
import { XcModalService,XcModalRef } from '../../../../../../app/shared/index';
import { dbomsPath } from '../../../../../../environments/environment';

import { BatchMaterialPricePopErrMesComponent } from "../batch-material-price-popErrMes/batch-material-price-popErrMes.component";
import { MaterialListData,SubmitData,BatchMaterialPriceListService } from "../../../services/material-batch-material-price.service";

declare let window,localStorage;

@Component({
  templateUrl: './batch-material-price-edit.component.html',
  styleUrls: ['./batch-material-price-edit.component.scss']
})

export class BatchMaterialPriceEditComponent implements OnInit {

  isEnter:boolean=false;//是否进入页面
  userInfo:any=new Person();//申请人信息
  applyTime:any=new Date();//申请日期
  submitData=new SubmitData();//实例化提交的物料列表对象
  pageTitle:string="新建物料批次价格维护";//页面显示标题
  materialList:any=[];//物料列表
  uploadFileAPI:string=environment.server+'MaterialModify/UploadMovingAveragePriceChangeDetails';//上传附件接口
  loading: boolean = false;//加载中效果
  notEdit:boolean=false;//是否允许编辑
  isSubmit:boolean=false;//是否提交申请
  modal:XcModalRef

  @ViewChild('form') form:NgForm;

  constructor(
    private windowService:WindowService,
    private batchMaterialPriceListService:BatchMaterialPriceListService,
    private activatedRoute:ActivatedRoute,
    private xcModalService: XcModalService,
  ) { }

  ngOnInit() { 

    this.getPerson();//获取申请的信息

    this.getRouterPromise();//获取路由里的值

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(BatchMaterialPricePopErrMesComponent);
    //模型关闭的时候 如果有改动，请求刷新
    this.modal.onHide().subscribe((data?: any) => {
        if (data) {}
    })

  }

  //获取人员基本信息
  getPerson() {
    const user = JSON.parse(localStorage.getItem("UserInfo"));
    if (user) {
      // 获取登录人头像信息
      this.userInfo["userID"] = user["ITCode"];
      this.userInfo["userEN"] = user["ITCode"].toLocaleLowerCase();
      this.userInfo["userCN"] = user["UserName"];
    } else {
      // this.router.navigate(['/login']); // 未登录 跳转到登录页面
    }
  }

  //获取路由里的参数
  getRouterPromise(){
    let Id:string=this.activatedRoute.snapshot.paramMap.get('id');//保存路由参数
    if(this.activatedRoute.snapshot.paramMap.get('id')!=='0'){//如果路由路由参数不等于0
     this.notEdit=true;
     this.pageTitle="查看物料批次价格维护";
     this.getDetail(Id);//获得详情
    }
  }

  //上传物料时，显示loading遮罩层
  isLoading(e){
    this.loading=true;
  }

  //导入物料
  fileUploadSuccess(e){
    if(e.Result){
      this.loading=false;
      this.submitData.PriceChangeList=JSON.parse(e.Data);//将导入成功的物料存入绑定数据
      this.toUppercaseForBatchAndFactory();

      this.testMaterialListLength();//判断上传物料的条数
      
    }else{
      this.loading=false;
      if(e.Message){
        this.windowService.alert({message:e.Message,type:'fail'});
      }else if(!e.Message&&e.Data){
        this.modal.show(JSON.parse(e.Data));
      }
    }
  }

  //判断上传的物料是否超过100条
  testMaterialListLength(){
    let listId=1000;
    if(this.submitData.PriceChangeList.length<=100){//判断上传的物料项是否超过100条
      this.submitData.PriceChangeList.forEach(element => {
        element['signId']=listId++;//生成id，以防止删除物料列表项时，列表项出错
      });
    }else{
       this.windowService.alert({message:'添加的物料数量已达100条，超过100条记录请联系ERP工程师',type:'fail'}).subscribe(()=>{
         this.submitData.PriceChangeList=[];//重置物料列表为空
       });   
    }
  }

  //添加物料
  addMaterial(){
    if(this.submitData.PriceChangeList.length<100){
      this.submitData.PriceChangeList.unshift(new MaterialListData());
    }else{
      this.windowService.alert({message:'添加的物料数量已达100条，超过100条记录请联系ERP工程师',type:'fail'})
    }
  }

  //删除物料
  removeMaterial(I){
    if(this.submitData.PriceChangeList.length>1){
      this.submitData.PriceChangeList.splice(I,1);
    }
  }

  //重置物料列表
  resetMaterialList(){
    this.submitData.PriceChangeList=[new MaterialListData()];
  }

  //获得模板
  getTamplate(){
    window.open(dbomsPath+"assets/downloadtpl/批量维护物料价格模板.xlsx");
  }

  //验证物料是否重复
  textMaterialIdentical(I){

    if(this.submitData.PriceChangeList[I].MaterialCode&&this.submitData.PriceChangeList[I].Factory&&this.submitData.PriceChangeList[I].Batch){

      this.submitData.PriceChangeList.forEach((element,index) => {
         if(I!=index&&this.submitData.PriceChangeList[I].MaterialCode===element.MaterialCode&&
          this.submitData.PriceChangeList[I].Factory===element.Factory&&
          this.submitData.PriceChangeList[I].Batch===element.Batch){
            this.windowService.alert({message:"填写的物料已存在，请重新填写",type:'fail'}).subscribe(()=>{
              this.submitData.PriceChangeList[I].MaterialCode='';
              this.submitData.PriceChangeList[I].Factory='';
              this.submitData.PriceChangeList[I].Batch='';
            })
          }
    })

    
  }
}

  //转换批次和工厂为大写
  toUppercaseForBatchAndFactory(){
    this.submitData.PriceChangeList.forEach(element => {
      element.Batch=element.Batch.toUpperCase();
      element.Factory=element.Factory.toUpperCase();
    });
  }

  //提交
  submit(){
  
    this.isSubmit=true;

    if(this.form.invalid){
      this.windowService.alert({message:'物料列表填写有误，请检查后重新提交',type:'fail'})
    }else{
      this.submitDataAPI();//提交数据
    }

  }

  //调用提交修改API
  submitDataAPI(){
    this.loading=true;//显示遮罩层
    this.batchMaterialPriceListService.submitData(this.submitData).then(data=>{
      this.loading=false;
      if(data.Result){
        this.notEdit=true;//将页面设置为不可编辑
        if(data.Data) this.getDetail(data.Data);//如果存在Data内容，则获取内容，请求详情接口
      }else{
        this.windowService.alert({message:data.Message,type:'fail'});
      }
    })
  }

  //详情接口，获取提交的数据和错误信息
  getDetail(Id){
    this.batchMaterialPriceListService.getDetailAPI(Id).then(data=>{
      
      if(data.Result&&data.Data){
        let mainData=JSON.parse(data.Data);
        this.submitData.PriceChangeList=mainData.List;
        this.applyTime=mainData.Model.ApplyTime;//保存申请日期
        this.userInfo.UserName=mainData.Model.ApplyName;//保存申请人
        this.userInfo.userEN=mainData.Model.ApplyITCode.toLocaleLowerCase();//保存itcode
      }
    });
  }

  //取消
  cancle(){
    window.close();
  }

  //关闭页面写入列表页刷新标识
  close(){
    window.close().subscribe(()=>{
      localStorage.setItem('batchMaterialPrice','save');
    });
  }

  //切换显示样式
  ngAfterViewInit(){
    this.isEnter=true;
   }
}