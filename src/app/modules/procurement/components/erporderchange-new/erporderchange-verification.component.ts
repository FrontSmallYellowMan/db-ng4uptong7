
export class ErpOrderChangeVerificationComponent{
  
  originalData:any;//erp原始数据
  newData:any;//新建时绑定的数据
  
  //原始采购信息
  originalProcurementInformation:any={
    'Currencycode':'',//币种
    'FactoryCode':'',//工厂
    'TaxFileNumber':'',//税码
    'VenderNo':'',//供应商
    'SumNo':'',//汇总号
  };

  //修改后的采购信息
  newProcurementInformation:any={
    'Currencycode':'',//币种
    'FactoryCode':'',//工厂
    'TaxFileNumber':'',//税码
    'VenderNo':'',//供应商
    'SumNo':'',//汇总号
  };

  //保存物料明细列表
  materialList:any=[];


  constructor(){}


  //验证修改后的采购订单是否与原始erp订单信息相同，如果相同，则返回错误信息，提示不允许创建
  verificationData(newData){

    let procurementInformationInvalid:boolean=true;//采购信息是否不合法
    let materialListInvalid:boolean=true;//物料明细列表是否不合法

    if(newData){
      this.newData=JSON.parse(newData);//保存修改后的订单信息

      console.log(this.newData);
      this.originalProcurementInformation.currencycode=this.newData.OriginalCurrencyCode;//保存原始币种代码
      this.originalProcurementInformation.factoryCode=this.newData.OriginalFactoryCode;//保存原始工厂代码
      this.originalProcurementInformation.taxFileNumber=this.newData.OriginalTaxFileNumber;//保存原始税码
      this.originalProcurementInformation.venderNo=this.newData.OriginalVendorNo;//保存原始供应商编号
      this.originalProcurementInformation.SumNo=this.newData.OriginalSumNo;//保存原始汇总号

      this.newProcurementInformation.currencycode=this.newData.CurrencyCode;//保存币种代码
      this.newProcurementInformation.factoryCode=this.newData.FactoryCode;//保存工厂代码
      this.newProcurementInformation.taxFileNumber=this.newData.TaxFileNumber;//保存税码
      this.newProcurementInformation.venderNo=this.newData.VendorNo;//保存供应商代码
      this.newProcurementInformation.SumNo=this.newData.SumNo;//保存汇总号

      this.materialList=this.newData.ERPOrderChangeMaterialList;//保存物料明细列表
      console.log(this.materialList);

      //判断采购信息是否相同
      if(JSON.stringify(this.originalProcurementInformation)===JSON.stringify(this.newProcurementInformation)){
        procurementInformationInvalid=true;
      }else{
        procurementInformationInvalid=false;
        // console.log(this.originalProcurementInformation,this.newProcurementInformation);
      }

      //判断物料明细列表是否相同
      if(this.newData.IsChangeMaterial=='1'){
        if(this.newData.ERPOrderChangeMaterialList.every(item=>item.OriginalMaterialNumber===item.MaterialNumber&&
          item.OriginalCount.toString()===item.Count.toString()&&
          parseInt(item.OriginalPrice).toFixed(2)===parseInt(item.Price).toFixed(2)&&
         item.OriginalStorageLocation===item.StorageLocation&&
         item.OriginalBatch===item.Batch&&
         item.OriginalSC_Code===item.SC_Code&&!item.IsDeleted)){
          materialListInvalid=true;     
         }else{
          materialListInvalid=false;
         }

      }

    }

    return procurementInformationInvalid&&materialListInvalid;
  }

}

