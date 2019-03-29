import { Component, OnInit ,ViewChild} from '@angular/core';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { ActivatedRoute,Router } from "@angular/router";

import { ReqData,ReqEditMateriel,ReqExchangeRateData,CommonlyMaterielAndReturnService } from "../../services/materiel-commonlyMateriel&return.service";
import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";

import { MaterielCommunicationService } from "../../services/materiel-communication.service";

declare var window,localStorage;

const OptionSubjectSettingGroup=["33","36","37","38","39"];//当税收分类为“B”的，科目设置组的被选项
// reg = /[\u4e00-\u9fa5]+/g;//验证中文字符的正则表达式
const FloatReg:RegExp = /^[1-9]\d*[.]{1}\d{2}$/;//验证两位小数正则
const IntReg:RegExp=/^[1-9]\d*$/g;//验证正整数

@Component({
    selector: 'edit-newMateriel',
    templateUrl: 'edit-materiel-createNewMateriel.component.html',
    styleUrls:['edit-materiel-createNewMateriel.component.scss','../../scss/materiel.component.scss']
})


export class CreateNewMaterielComponent implements OnInit {
 
  reqData:ReqData=new ReqData();//初始化数据对象
  reqEditMateriel:ReqEditMateriel=new ReqEditMateriel();//编辑物料
  reqExchangeRateData:ReqExchangeRateData=new ReqExchangeRateData();//移动平均价
  recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();//实例化验证是否可编辑的请求参数

  unSelect:boolean=false;//当选择特定值时，判断对应的联动值，是否可以修改（用在税分类和科目设置的对应关系）

  editTitle:string="新建一般物料申请";//页面title

  isSubmit: boolean = false;//是否点击生成物料编号按钮

  isShow:boolean=true;//是否显示隐藏保存按钮

  //基础数据ngModel绑定数据
  allTemplate:any=["",""];//物料模版id+名称
  allFactory:any=["",""];//工厂id+名称
  allSupplierCodeSAP:any;//供应商物料编号id+名称
  allMaterialType:any=["",""];//物料类型id+名称
  allSerialNumParameter:any=["",""];//序列号参数id+名称
  allMaterialGroup:any=["",""];//物料组id+名称
  allTaxType:any=["",""];//税收分类id+名称
  allBrand:any=["",""];//品牌id+名称
  allBaseUnitOfMeasure:any=["",""];//基本计量单位id+名称
  allAvailabilityChecking:any=["",""];//可用性检查id+名称
  allSubjectSettingGroup:any=["",""];//科目设置组id+名称
  allTaxClassifications:any=["",""];//税分类id+名称
  allProductLevel:any=["",""];//产品层次

  applyType:number=1;//用来区分是一般物料，还是返款服务物料
 
  constructor(
    private windowService: WindowService,
    private commonlyMaterielService:CommonlyMaterielAndReturnService,
    private recordAllowEditStateService:RecordAllowEditStateService,
    private router:ActivatedRoute,
    private routerLink:Router,
    private materielCommunicationService:MaterielCommunicationService
  ) { }

  @ViewChild('form') public form: NgForm;
  
      ngOnInit() {
         
        //获取路由传递过来的值
         this.router.params.subscribe(params => {
  
          if(params.id!=0){
  
            this.recordAllowEditStateQuery.FunctionCode='41';//请求查询的模块代码
            this.recordAllowEditStateQuery.RecordID=params.id;//页面的主键ID
            this.recordAllowEditStateQuery.NotAllowEditLink=`mate/edit-scm/${params.id}#top`;
            this.recordAllowEditStateQuery.NotFoundRecordLink=`mate/m-c`;
            this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

            this.editTitle="编辑一般物料申请"
  
             this.reqEditMateriel.MaterialRecordID=params.id;
             this.reqEditMateriel.ApplyType="1";//查询类型为一般物料
             this.commonlyMaterielService.editMateriel(this.reqEditMateriel).then(data => {
               this.reqData = data.data.list[0];
  
               this.allTemplate=this.reqData.TemplateID?[this.reqData.TemplateID,this.reqData.TemplateName]:["",""];             
               this.allFactory=this.reqData.Factory?[this.reqData.Factory,this.reqData.FactoryName]:["",""];
               this.allSerialNumParameter=this.reqData.SerialNumParameter?[this.reqData.SerialNumParameter,this.reqData.SerialNumParameterName]:["",""];
               this.allMaterialType=this.reqData.MaterialType?[this.reqData.MaterialType,this.reqData.MaterialTypeName]:["",""];
              
               //供应商编号
               this.allSupplierCodeSAP=this.reqData.SupplierCodeSAP?(this.reqData.SupplierCodeSAP+" "+this.reqData.SupplierName):"";
              
               this.allMaterialGroup=this.reqData.MaterialGroup?[this.reqData.MaterialGroup,this.reqData.MaterialGroupName]:["",""];
               this.allBrand=this.reqData.Brand?[this.reqData.Brand,this.reqData.BrandName]:["",""];
               this.allBaseUnitOfMeasure=this.reqData.BaseUnitOfMeasure?[this.reqData.BaseUnitOfMeasure,this.reqData.BaseUnitOfMeasureName]:["",""];
               this.allAvailabilityChecking=this.reqData.AvailabilityChecking?[this.reqData.AvailabilityChecking,this.reqData.AvailabilityCheckingName]:["",""];
               this.allSubjectSettingGroup=this.reqData.SubjectSettingGroup?[this.reqData.SubjectSettingGroup,this.reqData.SubjectSettingGroupName]:["",""];
               this.allTaxClassifications=this.reqData.TaxClassifications?[this.reqData.TaxClassifications,this.reqData.TaxClassificationsName]:["",""];
               this.allTaxType=this.reqData.TaxTypeID?[this.reqData.TaxTypeID,this.reqData.TaxTypeName]:["",""];
               this.allProductLevel=this.reqData.ProductLevel?[this.reqData.ProductLevel,this.reqData.ProductLevelName]:["",""];
  
              //  console.log(this.allTemplate);
              //  console.log(JSON.stringify(this.reqData));

               //转换标示
               if(this.reqData.BatchManagement){
                   this.reqData.BatchManagement=true;
               }else{
                   this.reqData.BatchManagement=false;
               }
  
             });
          }       
          
      });
  
      }


submit(){//生成物料编号
  this.isSubmit = true;
  if (this.form.invalid) {
    return;
  }
}
  //点击生成物料编号或者暂存事件
  save(InfoStatus) {

    this.reqData.TemplateID=this.allTemplate[0]?this.allTemplate[0]:"";
    this.reqData.TemplateName=this.allTemplate[1]?this.allTemplate[1]:"";
    this.reqData.Factory=this.allFactory[0]?this.allFactory[0]:"";
    this.reqData.FactoryName=this.allFactory[1]?this.allFactory[1]:"";
    this.reqData.SerialNumParameter=this.allSerialNumParameter[0]?this.allSerialNumParameter[0]:"";
    this.reqData.SerialNumParameterName=this.allSerialNumParameter[1]?this.allSerialNumParameter[1]:"";
    this.reqData.MaterialType=this.allMaterialType[0]?this.allMaterialType[0]:"";
    this.reqData.MaterialTypeName=this.allMaterialType[1]?this.allMaterialType[1]:"";
   
    //供应商编号
    this.reqData.SupplierCodeSAP=this.allSupplierCodeSAP?this.allSupplierCodeSAP.split(" ")[0]:"";
    this.reqData.SupplierName=this.allSupplierCodeSAP?this.allSupplierCodeSAP.split(" ")[1]:"";
    
    this.reqData.MaterialGroup=this.allMaterialGroup[0]?this.allMaterialGroup[0]:"";
    this.reqData.MaterialGroupName=this.allMaterialGroup[1]?this.allMaterialGroup[1]:"";
    this.reqData.Brand=this.allBrand[0]?this.allBrand[0]:"";
    this.reqData.BrandName=this.allBrand[1]?this.allBrand[1]:"";
    this.reqData.BaseUnitOfMeasure=this.allBaseUnitOfMeasure[0]?this.allBaseUnitOfMeasure[0]:"";
    this.reqData.BaseUnitOfMeasureName=this.allBaseUnitOfMeasure[1]?this.allBaseUnitOfMeasure[1]:"";
    this.reqData.AvailabilityChecking=this.allAvailabilityChecking[0]?this.allAvailabilityChecking[0]:"";
    this.reqData.AvailabilityCheckingName=this.allAvailabilityChecking[1]?this.allAvailabilityChecking[1]:"";
    this.reqData.SubjectSettingGroup=this.allSubjectSettingGroup[0]?this.allSubjectSettingGroup[0]:"";
    this.reqData.SubjectSettingGroupName=this.allSubjectSettingGroup[1]?this.allSubjectSettingGroup[1]:"";
    this.reqData.TaxClassifications=this.allTaxClassifications[0]?this.allTaxClassifications[0]:"";
    this.reqData.TaxClassificationsName=this.allTaxClassifications[1]?this.allTaxClassifications[1]:"";
    this.reqData.ProductLevel=this.allProductLevel[0]?this.allProductLevel[0]:"";
    this.reqData.ProductLevelName=this.allProductLevel[1]?this.allProductLevel[1]:"";

    if(this.allTaxType){

      //如果税收分类为数组
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

    //验证所有物料模版的必填项是否为空
    let isMustFormIsFalse=this.reqData.Factory==""||this.reqData.MaterialType==""||this.reqData.SupplierCodeSAP==""||this.reqData.MaterialGroup==""||this.reqData.Brand==""||this.reqData.BaseUnitOfMeasure==""||this.reqData.AvailabilityChecking==""||this.reqData.SubjectSettingGroup==""||this.reqData.TaxClassifications=="";
    
    this.reqData.InfoStatus=InfoStatus;//通过获取InfoStatus的值，来判断是否生成物料编号
    
    this.reqData.ApplyType=1;//保存为一般物料

    //判断是否选取了批次管理，选取时值为1，不选时值为2
    if (this.reqData.BatchManagement) {
      this.reqData.BatchManagement = '1';
    } else {
      this.reqData.BatchManagement = '0';
    }
    
    //暂存
    if (this.reqData.InfoStatus == 0) {

      this.commonlyMaterielService.saveCommonlyMaterial(this.reqData).then(data => {
        // console.log(this.reqData);   
        if (!data.success) {//弹出错误提示
            this.windowService.alert({ message: "物料保存失败", type: "fail" });
        } else {

          if (this.reqData.MaterialRecordID == null) {//判断MaterialMasterID的值，提示是新建还是保存

            this.windowService.alert({ message: "一般物料申请保存成功", type: "success" }).subscribe(()=>{
              this.reqData.MaterialRecordID = data.data.data.MaterialRecordID;//如果保存成功，则写入返回的id
              localStorage.setItem('commonlyMaterial','save');

              window.close();
            });

          } else {
            this.windowService.alert({ message: "一般物料更新成功", type: "success" }).subscribe(()=>{
              localStorage.setItem('commonlyMaterial','save');
              window.close();
            });
          } 
        }
      });
    } else{//生成物料编号

      this.isSubmit = true;
      
          if (this.reqData.TaxClassifications === "B") {//判断税分类和科目设置组的值是否匹配
      
            let num: number = 1;
            for (let i = 0; i < OptionSubjectSettingGroup.length; i++) {
              if (this.reqData.SubjectSettingGroup === OptionSubjectSettingGroup[i]) {
                num++;
              }
            }
      
            if (num == 1) {
              this.windowService.alert({ message: "税分类为'B',科目设置组必须为'33','36','37','38',39", type: "fail" });
              return;
            }
      
          }
      
      
          if (this.form.invalid||isMustFormIsFalse) {
            this.windowService.alert({message:"表单填写有误，请检查后重新提交",type:"fail"});
            return;
          } else  {
            //console.log(this.reqData.AvailabilityChecking);
            this.commonlyMaterielService.saveCommonlyMaterial(this.reqData).then(data => {
                    //console.log(data);   
                  if (!data.success) {//弹出错误提示
        
                      this.windowService.alert({ message: data.message, type: "fail" });
                      this.reqData.MaterialRecordID=data.data.data.MaterialRecordID;//生成物料编号失败会保存物料ID
                    
                    } else {
                      this.windowService.alert({message:"物料号生成成功",type:"success"}).subscribe(()=>{
                        this.reqData.MaterialRecordID = data.data.data.MaterialRecordID;//如果保存成功，则写入返回的id
                        this.routerLink.navigate(['/mate/edit-scm',this.reqData.MaterialRecordID],{fragment:""});
                    });
                      
      
                      //this.form.resetForm();//清空数据
                      //this.isSubmit = false;//重置提交按钮验证值
      
                      //console.log(data);
                      
                    }
                  });
          }

    }  

  
  }

  cancel() {//关闭页面
    window.close();
    this.form.resetForm();//清空数据
  }

  selectTemplate(templateId) {//选择物料模板

    this.commonlyMaterielService.seeTemplate({ TemplateID: templateId }).then(data => {//选择是请求数据库，查询以建好的模板

      this.allFactory =data.data.list[0].Factory?[data.data.list[0].Factory,data.data.list[0].FactoryName]:['',''];
      this.allSerialNumParameter =data.data.list[0].SerialNumParameter?[data.data.list[0].SerialNumParameter,data.data.list[0].SerialNumParameterName]:['',''];
      this.allMaterialType = data.data.list[0].MaterialType?[data.data.list[0].MaterialType,data.data.list[0].MaterialTypeName]:['',''];
      this.allTaxType = data.data.list[0].TaxTypeID?[data.data.list[0].TaxTypeID,data.data.list[0].TaxTypeName]:['',''];
      this.allMaterialGroup = data.data.list[0].MaterialGroup?[data.data.list[0].MaterialGroup,data.data.list[0].MaterialGroupName]:['',''];
      this.allBaseUnitOfMeasure = data.data.list[0].BaseUnitOfMeasure?[data.data.list[0].BaseUnitOfMeasure,data.data.list[0].BaseUnitOfMeasureName]:['',''];
      this.allBrand = data.data.list[0].Brand?[data.data.list[0].Brand,data.data.list[0].BrandName]:['',''];
      this.allSupplierCodeSAP = data.data.list[0].SupplierCodeSAP?(data.data.list[0].SupplierCodeSAP+" "+data.data.list[0].SupplierName):'';

      //当选择模板时，判断是否存在供应商编号，如果存在，则根据供应商编号的前两位设置可用性检查的值
      if(data.data.list[0].SupplierCodeSAP){
        this.setAvailabilityChecking(data.data.list[0].SupplierCodeSAP);
      }else{
        this.allAvailabilityChecking=["",""];
        this.unSelect=true;
      }
      
      //this.allSubjectSettingGroup=[data.data.list[0].SubjectSettingGroup,data.data.list[0].SubjectSettingGroupName];
      //this.allTaxClassifications=[data.data.list[0].TaxClassifications,data.data.list[0].TaxClassificationsName]
      //console.log(typeof this.allFactory);

    });

  }

  SupplierCodeSAPVerify(e){//验证供应商物料编号如果为40开头，则可用性检查为02，否则为04
    
    this.unSelect=false;
    console.log(e);

    this.allSupplierCodeSAP=e[1]+" "+e[0];
    this.reqData.SupplierCodeSAP=e[1];//保存供应商编号
    this.reqData.SupplierName=e[0];//保存供应商名称
    
    //根据供应商编号的前两位，设置可用性检查的值
    this.setAvailabilityChecking(e[1]);

    // if(this.allTaxClassifications[0]==="0"){
    //     this.allSubjectSettingGroup=["04","技术服务"];
    //     this.unSelect=true;
    // }

  };

  //设置可用性检查的值
  setAvailabilityChecking(SupplierCodeSAP){

    if(SupplierCodeSAP.substring(0,2)==="40"){
      this.allAvailabilityChecking=["Z2","Z2"];
      this.unSelect=true;
   }else if(SupplierCodeSAP.substring(0,2)==="20"){
     this.allAvailabilityChecking=["02","02"];
     this.unSelect=true;
   }else{
     console.log("aafdafa");
    this.allAvailabilityChecking=["",""];
    this.unSelect=true;
   }
  }


    texClassLogic(){//税分类逻辑验证，当税分类为1时，科目设置组为03，当税收分类为0时，科目设置组为04
       this.unSelect=false;
       this.allSubjectSettingGroup=['',''];
       if(this.allTaxClassifications[0]==="1"){

          this.allSubjectSettingGroup=["03","商品"];
          this.unSelect=true;
       }

       //2018-12-14，注销此逻辑
      //  if(this.allTaxClassifications[0]==="0"){
      //      this.allSubjectSettingGroup=["04","技术服务"];
      //      this.unSelect=true;
      //  }

       if(this.allTaxClassifications[0]==="B"){
     
        this.applyType=2;
       }else{
        this.applyType=1;

       }

    }

    averagePrice(){//移动平均价，接口调用，自动转换汇率，生成港币和澳元

       //console.log(this.reqData.MovingAveragePrice.toString().search(this.IntReg))
    // if(this.reqData.MovingAveragePrice.toString().search(IntReg)!=-1){//验证输入的值是否是正整数
      //  this.reqData.MovingAveragePrice=this.reqData.MovingAveragePrice+".00";
       //console.log(this.reqData.MovingAveragePrice)
    // }
      

      //  if(this.reqData.MovingAveragePrice.toString().search(FloatReg)!=-1){
        //如果输入的移动平均价整数位等于0，那么就不从接口中获取港币和澳元，直接赋值为0；
        // if(this.reqData.MovingAveragePrice.toString().substring(0,this.reqData.MovingAveragePrice.toString().indexOf('.'))=='0'){
        //   this.reqData.StandardCostMC=0;
        //   this.reqData.StandardCostHK=0;
        //   return;
        // }
        
        this.commonlyMaterielService.rate({ "MovingAveragePrice": this.reqData.MovingAveragePrice }).then(data => {//请求数据库，返回转换汇率后的港币和澳元

          this.reqData.StandardCostMC=data.data.data.StandardCostMC;
          this.reqData.StandardCostHK=data.data.data.StandardCostHK;

         //console.log(data.data.data);
    });

      //  } 
      
    }   

}

