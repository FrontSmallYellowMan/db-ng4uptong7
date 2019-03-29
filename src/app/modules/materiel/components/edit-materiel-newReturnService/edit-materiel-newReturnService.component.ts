import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { ReqData,ReqEditMateriel,ReqDeleteList,ReqSearchData,CommonlyMaterielAndReturnService } from "../../services/materiel-commonlyMateriel&return.service";
import { WindowService } from "app/core";
import { ActivatedRoute,Router } from "@angular/router";

import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";


declare var window,localStorage;

@Component({
    selector: 'edit-nrs',
    templateUrl: 'edit-materiel-newReturnService.component.html',
    styleUrls:['edit-materiel-newReturnService.component.scss','../../scss/materiel.component.scss']
})


export class EditMaterielNewReturnService implements OnInit {

    reqData:ReqData=new ReqData();//初始化数据对象
    reqEditMateriel:ReqEditMateriel=new ReqEditMateriel();
    recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();//实例化验证是否可编辑的请求参数

    editTitle:string="新建返款服务";

    isSubmit:boolean;//是否点击提交按钮

    isShow:boolean=true;//是否显示隐藏保存按钮

    taxClass:string;//获取选择税分类，用来过滤科目设置组

    //基础数据ngModel绑定数据
    allTemplate: any;//物料模版id+名称
    allFactory: any;//工厂id+名称
    allSupplierCodeSAP: any;//供应商物料编号id+名称
    allMaterialType: any;//物料类型id+名称
    allSerialNumParameter: any;//序列号参数id+名称
    allMaterialGroup: any;//物料组id+名称
    allTaxType: any;//税收分类id+名称
    allBrand: any;//品牌id+名称
    allBaseUnitOfMeasure: any;//基本计量单位id+名称
    allAvailabilityChecking: any;//可用性检查id+名称
    allSubjectSettingGroup: any;//科目设置组id+名称
    allTaxClassifications: any;//税分类id+名称

    constructor(
        private returnService:CommonlyMaterielAndReturnService,
        private windowService:WindowService,
        private router:ActivatedRoute,
        private routerLink:Router,
        private recordAllowEditStateService:RecordAllowEditStateService
    ) {}

   
    save(InfoStatus) {//保存，通过传入值的不同，判断是否生成物料编号


        this.reqData.TemplateID=this.allTemplate?this.allTemplate[0]:"";
        this.reqData.TemplateName=this.allTemplate?this.allTemplate[1]:"";
        this.reqData.Factory=this.allFactory?this.allFactory[0]:"";
        this.reqData.FactoryName=this.allFactory?this.allFactory[1]:"";
        this.reqData.SerialNumParameter=this.allSerialNumParameter?this.allSerialNumParameter[0]:"";
        this.reqData.SerialNumParameterName=this.allSerialNumParameter?this.allSerialNumParameter[1]:"";
        this.reqData.MaterialType=this.allMaterialType?this.allMaterialType[0]:"";
        this.reqData.MaterialTypeName=this.allMaterialType?this.allMaterialType[1]:"";
        this.reqData.SupplierCodeSAP=this.allSupplierCodeSAP?this.allSupplierCodeSAP[0]:"";
        this.reqData.SupplierName=this.allSupplierCodeSAP?this.allSupplierCodeSAP[1]:"";
        this.reqData.MaterialGroup=this.allMaterialGroup?this.allMaterialGroup[0]:"";
        this.reqData.MaterialGroupName=this.allMaterialGroup?this.allMaterialGroup[1]:"";
        this.reqData.Brand=this.allBrand?this.allBrand[0]:"";
        this.reqData.BrandName=this.allBrand?this.allBrand[1]:"";
        this.reqData.BaseUnitOfMeasure=this.allBaseUnitOfMeasure?this.allBaseUnitOfMeasure[0]:"";
        this.reqData.BaseUnitOfMeasureName=this.allBaseUnitOfMeasure?this.allBaseUnitOfMeasure[1]:"";
        this.reqData.AvailabilityChecking=this.allAvailabilityChecking?this.allAvailabilityChecking[0]:"";
        this.reqData.AvailabilityCheckingName=this.allAvailabilityChecking?this.allAvailabilityChecking[1]:"";
        this.reqData.SubjectSettingGroup=this.allSubjectSettingGroup?this.allSubjectSettingGroup[0]:"";
        this.reqData.SubjectSettingGroupName=this.allSubjectSettingGroup?this.allSubjectSettingGroup[1]:"";
        this.reqData.TaxClassifications=this.allTaxClassifications?this.allTaxClassifications[0]:"";
        this.reqData.TaxClassificationsName=this.allTaxClassifications?this.allTaxClassifications[1]:"";
    
        if(this.allTaxType){
 
            if(this.allTaxType instanceof Array){
                this.reqData.TaxTypeID=this.allTaxType[0];
                this.reqData.TaxTypeName=this.allTaxType[1];
              }else{
                this.reqData.TaxTypeID=this.allTaxType.id;
                this.reqData.TaxTypeName=this.allTaxType.title;
              }

        }else{
            this.reqData.TaxTypeID="";
            this.reqData.TaxTypeName="";
        }

        this.reqData.InfoStatus = InfoStatus;//通过值不同，判断是暂存还是生成物料编号
        this.reqData.ApplyType = 2;//保存返款服务

        if(this.reqData.InfoStatus==0){//如果传入的值为0，则为暂存，1为生成物料编号
            this.returnService.saveCommonlyMaterial(this.reqData).then(data => {
                //console.log(data);
                if (!data.success) {//弹出错误提示
                    this.windowService.alert({message:data.message,type:"fail"});
                } else {

                    if (this.reqData.MaterialRecordID == null) {//判断MaterialMasterID的值，提示是新建还是保存
                       
                        this.windowService.alert({ message: "返款申请保存成功", type: "success" }).subscribe(()=>{
                            this.reqData.MaterialRecordID=data.data.data.MaterialRecordID;//如果保存成功，则写入返回的id
                            localStorage.setItem('returnMaterial','save');//写入localStorage
                            window.close();
                        });
                    
                    } else {
                        this.windowService.alert({ message: "返款申请更新成功", type: "success" }).subscribe(()=>{
                            localStorage.setItem('returnMaterial','save');//写入localStorage
                            window.close();
                        });
                    }
                    
                    //this.form.resetForm();//清空数据
                    //this.isSubmit = false;//重置提交按钮验证值
                }
            });

        }else{//生成物料编号

            this.isSubmit = true;

            if (this.form.invalid) {
                this.windowService.alert({message:"表单填写有误，请检查后重新提交",type:"fail"});
                return;
            } else {
    
                if (this.reqData.IsBatchManage) {//判断是否选取了批次管理，选取时值为1，不选时值为2
                    this.reqData.IsBatchManage = 1;
                } else {
                    this.reqData.IsBatchManage = 0;
                }
                
                
                this.returnService.saveCommonlyMaterial(this.reqData).then(data => {
                    //console.log(data);
                    if (!data.success) {//弹出错误提示
                        this.windowService.alert({message:data.message,type:"fail"});
                    } else {
    
                        this.windowService.alert({message:"物料号生成成功",type:"success"}).subscribe(()=>{
                            this.reqData.MaterialRecordID = data.data.data.MaterialRecordID;//如果保存成功，则写入返回的id
                            this.routerLink.navigate(['/mate/edit-srs',this.reqData.MaterialRecordID],{fragment:""});//跳转到详情页
                        });
                           
                        //this.form.resetForm();//清空数据
                        //this.isSubmit = false;//重置提交按钮验证值
                    }
                });
            }

        }

       

        

        
    }

    cancel(){//取消

        window.close();
        this.form.resetForm();//清空数据
        this.isSubmit = false;//重置提交按钮验证值

    }

    selectTemplate(templateId){//选择物料模板

        this.returnService.seeTemplate({ TemplateID: templateId }).then(data => {//选择是请求数据库，查询以建好的模板

            // this.templateData = data.data.list[0];//当选择物料模板变化时，将数据存入模板数据

            //为了不把其他字段的数据清空，所以只能单个赋值

            this.allFactory = data.data.list[0].Factory?[data.data.list[0].Factory,data.data.list[0].FactoryName]:['',''];
            this.allSerialNumParameter = data.data.list[0].SerialNumParameter?[data.data.list[0].SerialNumParameter,data.data.list[0].SerialNumParameterName]:['',''];
            this.allMaterialType = data.data.list[0].MaterialType?[data.data.list[0].MaterialType,data.data.list[0].MaterialTypeName]:['',''];
            this.allTaxType = data.data.list[0].TaxTypeID?[data.data.list[0].TaxTypeID,data.data.list[0].TaxTypeName]:['',''];
            this.allMaterialGroup = data.data.list[0].MaterialGroup?[data.data.list[0].MaterialGroup,data.data.list[0].MaterialGroupName]:['',''];
            this.allBaseUnitOfMeasure = data.data.list[0].BaseUnitOfMeasure?[data.data.list[0].BaseUnitOfMeasure,data.data.list[0].BaseUnitOfMeasureName]:['',''];
            this.allBrand = data.data.list[0].Brand?[data.data.list[0].Brand,data.data.list[0].BrandName]:['',''];
            this.allSupplierCodeSAP = data.data.list[0].SupplierCodeSAP?[data.data.list[0].SupplierCodeSAP,data.data.list[0].SupplierName]:['',''];

            console.log(data.data.list[0]);

        });

    }



    @ViewChild('form') public form: NgForm;

    ngOnInit() {

       this.router.params.subscribe(params=>{
    
        if(params.id!=0){

            this.recordAllowEditStateQuery.FunctionCode='42';//请求查询的模块代码
            this.recordAllowEditStateQuery.RecordID=params.id;//页面的主键ID
            this.recordAllowEditStateQuery.NotAllowEditLink=`mate/edit-srs/${params.id}#top`;
            this.recordAllowEditStateQuery.NotFoundRecordLink=`mate/m-rs`;
            this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

          this.editTitle="编辑返款服务申请";
          this.reqEditMateriel.MaterialRecordID=params.id;
          this.reqEditMateriel.ApplyType="2"//查询类型为返款服务
          this.returnService.editMateriel(this.reqEditMateriel).then(data=>{
          this.reqData=data.data.list[0];          
          
          this.allTemplate=this.reqData.TemplateID?[this.reqData.TemplateID,this.reqData.TemplateName]:["",""];
          this.allFactory=this.reqData.Factory?[this.reqData.Factory,this.reqData.FactoryName]:["",""];
          this.allSerialNumParameter=this.reqData.SerialNumParameter?[this.reqData.SerialNumParameter,this.reqData.SerialNumParameterName]:["",""];
          this.allMaterialType=this.reqData.MaterialType?[this.reqData.MaterialType,this.reqData.MaterialTypeName]:["",""];
          this.allSupplierCodeSAP=this.reqData.SupplierCodeSAP?[this.reqData.SupplierCodeSAP,this.reqData.SupplierName]:["",""];
          this.allMaterialGroup=this.reqData.MaterialGroup?[this.reqData.MaterialGroup,this.reqData.MaterialGroupName]:["",""];
          this.allBrand=this.reqData.Brand?[this.reqData.Brand,this.reqData.BrandName]:["",""];
          this.allBaseUnitOfMeasure=this.reqData.BaseUnitOfMeasure?[this.reqData.BaseUnitOfMeasure,this.reqData.BaseUnitOfMeasureName]:["",""];
          this.allAvailabilityChecking=this.reqData.AvailabilityChecking?[this.reqData.AvailabilityChecking,this.reqData.AvailabilityCheckingName]:["",""];
          this.allSubjectSettingGroup=this.reqData.SubjectSettingGroup?[this.reqData.SubjectSettingGroup,this.reqData.SubjectSettingGroupName]:["",""];
          this.allTaxClassifications=this.reqData.TaxClassifications?[this.reqData.TaxClassifications,this.reqData.TaxClassificationsName]:["",""];
          this.allTaxType=this.reqData.TaxTypeID?[this.reqData.TaxTypeID,this.reqData.TaxTypeName]:["",""];

          });

        }

       });

     }

     //获取税分类
     getTaxClass(e){
         let arr=e.split(' ');
          this.taxClass=arr[0];
        console.log(this.taxClass);
     }

}