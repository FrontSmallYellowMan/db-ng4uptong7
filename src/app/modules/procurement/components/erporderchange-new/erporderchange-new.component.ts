//ERP采购订单修改新建、编辑页面
import { Component, OnInit ,ViewChild,OnChanges} from "@angular/core";
import { Router, ActivatedRoute,ParamMap } from "@angular/router";
import { Person } from "app/shared/services/index";
import { WindowService } from "app/core";
import { NgForm,FormArray,FormControl,FormBuilder,FormGroup } from "@angular/forms";
import { HttpServer } from "app/shared/services/db.http.server";
import { dbomsPath,environment } from "../../../../../environments/environment";
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { ERPOrderChangeApiServices,ErpOrderChangeData, ERPOrderChangeMaterial,ERPOrderChangeApprover,VaildateResData} from "../../services/erporderchange-api.services";
import { PrepareApplyCommunicateService } from "../../services/communicate.service";
// import { switchMap } from 'rxjs/operators';

//弹出窗
import { ErpOrderChangePopMoreERPListComponent } from "../erporderchange-new/erporderchange-pop-moreERPList/erporderchange-pop-moreERPList.component";
import { ErporderchangePopStorageRCWAppprovers } from "../erporderchange-new/erporderchange-pop-storageRCWAppprovers/erporderchange-pop-storageRCWAppprovers.component";

import { ErpOrderChangeVerificationComponent } from "./erporderchange-verification.component";

declare var window,localStorage;

@Component({
  selector: "erporderchange-new",
  templateUrl: "erporderchange-new.component.html",
  styleUrls: [
    "erporderchange-new.component.scss",
    "../../scss/erp-order-change.scss"
  ]
})
export class ERPOrderChangeNewComponent implements OnInit {
  
  //弹出层
  modal: XcModalRef;
  storageRCWApproversModal:XcModalRef;//弹出层，库房冲红审批人
  loading:boolean=false;//是否显示遮罩层 

  //基础信息-strat
  userInfo = new Person(); //登录人头像
  erpOrderChangeData:ErpOrderChangeData=new ErpOrderChangeData();//实例化主体数据
  erpOrderChangeApprover:ERPOrderChangeApprover=new ERPOrderChangeApprover();//实例化获取审批流程接口参数
  erpOrderChangeVerificationComponent:ErpOrderChangeVerificationComponent=new ErpOrderChangeVerificationComponent();//实例化验证对象
  vaildateResData:VaildateResData=new VaildateResData();//实例化请求参数，验证是否可以创建采购订单修改

  departmentList: any[] = []; //保存事业部列表
  currencyList:any[]=[];//保存币种列表
  taxList:any[]=[];//保存税码列表
  pageTitle: string = "新建采购订单修改"; //页面标题
  originalMaterilaList:any[]=[];//保存通过ERP获取的到原始物料明细
  allSupplierCodeSAP:string='';//保存供应商编号和名称的绑定字段
  isSubmit:boolean=false;//是否提交了采购订单
  materialList:any[]=[new ERPOrderChangeMaterial()];//用来保存物料明细表
  contracts:any[]=[];//保存销售合同号列表

  notAllowEdit:boolean=false;//是否允许点击“创建新的采购订单”按钮
  

  OriginalData:string;//保存从erp获取的原始订单新信息，用以做比较
  newData:string;//保存新建的采购订单修改数据，用以做比较

  //基础信息-end

  //附件
  upFileApiLink: string = environment.server + "ERPOrderChange/UploadAccessory"; //用来保存上传附件的接口地址
  accessoryList: any; //附件对象
  alreadyfilelUpLoadList: any[] = []; // 用来保存上传过的附件列表
  filelUpLoadList: any[] = []; //用来保存新上传的附件列表

  //导出物料明细列表
  materialListfileUploadApi:string=environment.server + "ERPOrderChange/UploadERPOrderMaterial";//导入物料明细接口
  upLoadData:any;//导出物料明细列表的请求参数
  //附件 end

  //流程审批人信息 -start
  approvalDataConfigure:any = []; //审批人员流程配置信息
  SYBApprove:any[]=[];//事业部审批人
  //StorageRCWApprovers:any=[];//保存选择的库房冲红审批人
  StorageRCWApproversList:any[]=[];//保存库房冲红审批人列表
  approverValid:any={valid:false,errApprover:'请选择对应环节的审批人'};//保存审批人的验证信息
  

  allApproverListData:any=[
    {nodeName:'事业部审批',isApproval:true,list:[]},//事业部审批人
    {nodeName:'事业部二级',isApproval:false,list:[]},//事业部二级审批人
    {nodeName:'采购经理审批',isApproval:false,list:[]},//保存采购经理的审批人列表
    {nodeName:'采购员改单',isApproval:true,list:[]},//保存采购员的审批人列表
    {nodeName:'库房冲红',isApproval:false,list:[]},//保存选择的库房冲红审批人
    {nodeName:'采购员删单',isApproval:false,list:[]}//采购员删单的审批人列表
  ];
  

  approvalProcessID; //审批流程id
  wfHistory:any[]=[]; //审批记录
  //流程审批人信息 -end

  isUpLoadFile:boolean=false;//是否需要上传附件
  trackingNumber:string;//用来保存需求跟踪号
  
  batchModifyStorageLocation:string;//批量修改库存地
  batchModifyBatch:string;//批量修改批次


  @ViewChild('form') public ngForm:NgForm;
  @ViewChild('IsChangeMaterial') public IsChangeMaterial:FormControl;//是否修改物料明细
  @ViewChild('TrackingNumber') public TrackingNumber:FormControl;//需求跟踪号
  @ViewChild('IsRedInvoice') public IsRedInvoice:FormControl;//是否冲红
  @ViewChild('SumNo') public SumNo:FormControl;//汇总号

  //注入服务实例
  constructor(
    private httpService: HttpServer,
    private windowService: WindowService,
    private routeInfo: ActivatedRoute,
    private Router: Router,
    private activatedRoute:ActivatedRoute,
    private erpOrderChangeApiServices: ERPOrderChangeApiServices,
    private xcModalService:XcModalService,
    private prepareApplyCommunicateService:PrepareApplyCommunicateService
  ) {}

  //初始化数据
  ngOnInit() {

    //在初始化的时候 创建模型
    this.modal = this.xcModalService.createModal(ErpOrderChangePopMoreERPListComponent);
    this.storageRCWApproversModal=this.xcModalService.createModal(ErporderchangePopStorageRCWAppprovers);
    
    //模型关闭的时候
    this.modal.onHide().subscribe((data?: any) => {
        if (data) {
            this.getERPDetail(data);
        }
    });
    //模型关闭的时候
    this.storageRCWApproversModal.onHide().subscribe((data?: any) => {
      if (data) {
        this.getSelectRCWApprover(data);//获取选择的库房冲红审批人
      }
  });

    this.getApplyData();//获取申请日期
    this.getApplyPerson();//获取登录人信息
    this.getCurrency();//获取币种币种列表
    this.getTaxCodeList();//获取税码列表
    // this.getStorageRCWApprovers();//获取库房冲红审批人
    this.watchFormChange();//监听表单元素的变化

    //获取路由参数
    this.getRouterPromise();

  }

  //获取路由参数
  getRouterPromise(){
   
    this.activatedRoute.paramMap.subscribe(data=>{
      if(data.get('id')!=="0"){
        this.erpOrderChangeData.Id=data.get('id');

        //获得详情
        this.getDetail(this.erpOrderChangeData.Id);
        //或得审批历史记录
        this.getHistory(this.erpOrderChangeData.Id);
      }else{
        this.getApprover();//获取流程审批人
      }
    });

  }
  

  //获取详情
  getDetail(Id){
    this.erpOrderChangeApiServices.getDetail(Id).then(data=>{
      console.log(data.Data);
      if(data.Result){
        this.erpOrderChangeData=data.Data;
        this.trackingNumber=this.erpOrderChangeData.TrackingNumber;//保存需求跟踪号

        //保存申请人
        this.userInfo["userID"] = this.erpOrderChangeData.ItCode;
        this.userInfo["userEN"] = this.erpOrderChangeData.ItCode.toLocaleLowerCase();
        this.userInfo["userCN"] = this.erpOrderChangeData.UserName;

        //保存绑定的供应商编号和名称
        this.allSupplierCodeSAP=this.erpOrderChangeData.VendorNo+' '+this.erpOrderChangeData.Vendor;
        //保存物料明细
        this.materialList=this.erpOrderChangeData.ERPOrderChangeMaterialList;
        //判断如果为原始物料，则对物料明细进行重新赋值
        this.restMaterialListData(this.materialList);
        //获取合同列表
        this.contracts=JSON.parse(this.erpOrderChangeData.Contracts);
        //保存附件列表
        this.getDetailUploadFile();
        //请求接口ERP详情接口，获取原始物料信息
        this.getOriginalMaterialList();
        //解析审批人列表
        // this.getDetailApproverList();
        
        //根据币种，工厂，税码，供应商的变化，判断是否需要锁定"创建新的采购订单"按钮
        this.erpKeyDataChangeFn();
        

      }else{
        this.windowService.alert({message:data.Message,type:"fail"})
      }
    });
  }

  /*
  *获取详情时，判断详情里返回的是原始物料还是修改后物料，
  *如果为原始物料，则重新赋值，以防止选择“修改物料明细时”，物料内容为空
  */
  restMaterialListData(materialList){
    if(materialList.length>0){
      if(!materialList[0].MaterialNumber&&!materialList[0].MaterialDescription&&!materialList[0].StorageLocation){
        this.assignmentMaterialList(materialList);
      }
    }
  }


  //获取详情中的附件列表
  getDetailUploadFile(){
    if(this.erpOrderChangeData.AccessoryList.length===0) return;
    this.alreadyfilelUpLoadList=this.erpOrderChangeData.AccessoryList;
    this.erpOrderChangeData.AccessoryList=[];//重置请求的附件字段为空数组
    this.alreadyfilelUpLoadList.forEach(item=>{
      item["name"] = item.AccessoryName;
    });
    //console.log( this.alreadyfilelUpLoadList);
  }

  //监听表单的变化
  watchFormChange(){

    //如果选择修改物料明细，那么必须先查询需求跟踪号
    this.IsChangeMaterial.valueChanges.subscribe(data=>{
      if(data==1&&!this.erpOrderChangeData.OriginalERPOrderNo){
        this.windowService.alert({message:"请先查询需求跟踪号",type:"fail"}).subscribe(()=>{this.erpOrderChangeData.IsChangeMaterial=0});
      }else if(data==1&&this.erpOrderChangeData.OriginalERPOrderNo){
        //计算修改后总金额
        this.sumAmount();
      }

      //如果选择“是否修改物料明细”为否，那么将修改后的金额重置为修改前的金额
      if(data==0){
        this.erpOrderChangeData.OrderAmount=this.erpOrderChangeData.OriginalOrderAmount;//将修改后的金额恢复为修改前的金额
      }

      this.approvalStateChange('onChange');//传递事件，用来判断显示哪个审批环节

    });

    //当是否冲红变化时，触发审批人验证
    this.IsRedInvoice.valueChanges.subscribe(data=>{
      // if(data==1){
      //   this.allApproverListData[3].isApproval=true;//显示库房冲红审批人
      //   this.allApproverListData[4].isApproval=true;//显示采购员删单
      // }else{
      //   this.allApproverListData[3].isApproval=false;//隐藏库房冲红审批人
      //   this.allApproverListData[3].list=[];//重置库房冲红审批人
      //   this.allApproverListData[4].isApproval=false;//隐藏采购员删单
      // }

        this.approvalStateChange('onChange');

    });

    //当汇总号变化时，触发审批人验证
    this.SumNo.valueChanges.subscribe(data=>{
       this.approvalStateChange('onChange');
    });
   
  }

  //新建时获取申请日期
  getApplyData(){
    if(this.erpOrderChangeData.AddTime) return;
    this.erpOrderChangeData.AddTime=new Date();
  }

  //获取登录人信息
  getApplyPerson() {
    //登录人信息-Start
    let User = JSON.parse(localStorage.getItem("UserInfo"));
    if (User) {
      this.userInfo["userID"] = this.erpOrderChangeData.ItCode= User["ITCode"];
      this.userInfo["userEN"] = User["ITCode"].toLocaleLowerCase();
      this.userInfo["userCN"] = this.erpOrderChangeData.UserName = User["UserName"];
    } else {
      //this.Router.navigate(['/login']); // 未登录 跳转到登录页面
    }
    //登录人信息-End
    //获取登录人的事业部列表
    this.getDepartment(this.userInfo["userID"]);
  }

   /**
   * 附件上传 *START*
   */

  //上传附件成功的回调函数
  fileUploadSuccess(e) {
    if (e.Result) {
      this.accessoryList = e.Data;
      this.filelUpLoadList.push(this.accessoryList);
    } else {
      this.windowService.alert({ message: e.Message, type: "fail" });
    }
  }

  //删除上传附件的回调函数
  deleteUploadFile(e) {
    console.log(this.filelUpLoadList.length);
    if (this.filelUpLoadList.length !== 0 &&this.alreadyfilelUpLoadList.length !== 0) {
      this.filelUpLoadList.splice(Math.abs(e - this.alreadyfilelUpLoadList.length),1);
    } else if (this.filelUpLoadList.length !== 0 &&this.alreadyfilelUpLoadList.length === 0) {
      this.filelUpLoadList.splice(e, 1);
    }
  }
  /**
   * END
   */

   //获取登录人事业部
   getDepartment(itcode){
     this.erpOrderChangeApiServices.getDepart_BU_PlatFormByItCode(itcode).then(data=>{
       if(data.Result){
         //console.log(JSON.parse(data.Data));
         this.departmentList=JSON.parse(data.Data).SYCMC?JSON.parse(data.Data).SYCMC:[]; 
         if(this.departmentList.length>0){
           //获取登录人的基本信息，用来匹配事业部
           this.getUserInformation();
         }   
       }
     });
   }

   //获取登录人的基本信息，用来匹配事业部
   getUserInformation(){
    this.erpOrderChangeApiServices.getPersonInformation().then(data=>{
      if(data.Result){
        let userInfo=JSON.parse(data.Data);
        this.erpOrderChangeData.SYBMC=userInfo.SYBMC;
      }
    });
   }

   //获取币种列表
   getCurrency(){
     this.erpOrderChangeApiServices.getCurrencySelectInfo().then(data=>{
       if(data.Result){
         this.currencyList=JSON.parse(data.Data);
        // console.log(this.currencyList);
       }
     });
   }

   //币种改变触发的事件
   onChangeCurrency(CurrencyCode){
     this.currencyList.forEach(element => {
       //将对应代码的币种名称存入对应的字段
       if(element.currencycode===CurrencyCode) this.erpOrderChangeData.Currency=element.currencyname;
     });
     //根据币种的变化判断是否需要创建ERP订单
     this.erpKeyDataChangeFn();
   }

   //获取税码列表
   getTaxCodeList(){
     this.erpOrderChangeApiServices.getTaxrateSelectInfo().then(data=>{
       if(data.Result){
         this.taxList=JSON.parse(data.Data);
         //console.log(this.taxList);
       }
     });
   }

   //根据物料号获取物料内容
   getMaterialContent(I){
     if(this.materialList[I].MaterialNumber){
       this.erpOrderChangeApiServices.getMaterialContent(this.materialList[I].MaterialNumber).then(data=>{
         if(data.Result) {//保存物料名称
           this.materialList[I].MaterialDescription=data.Data.MAKTX_ZH;
        }else{
          this.windowService.alert({message:'物料号不存在',type:"fail"});
          this.materialList[I].MaterialNumber="";
        }
       });
     }
   }

   //供应商选择事件
   SupplierCodeSAPVerify(e){
     this.erpOrderChangeData.Vendor=e[0];
     this.erpOrderChangeData.VendorNo=e[1];
     this.allSupplierCodeSAP=e[1]+' '+e[0];

     //根据供应商的变化，执行相关逻辑
     this.erpKeyDataChangeFn();
   }

   //查询需求跟踪号,获取ERP订单信息
   searchERPList(TrackingNumber){
     if(!TrackingNumber) return;
     
     this.erpOrderChangeApiServices.getERPList(TrackingNumber).then(data=>{
      
      this.notAllowEdit=false;//是否锁定“新建采购订单”按钮

      if(data.Result&&data.Data.length>1){
        this.modal.show(data.Data);//显示弹出框
      }else if(data.Result&&data.Data.length===1){
        if(!data.Data[0].OrderNo) return;
        //请求接口获取erp订单的详情信息
        this.getERPDetail(data.Data[0].OrderNo);
      } else{  
        this.windowService.alert({message:"所查询的需求跟踪号不存在",type:"fail"}).subscribe(()=>{
          this.erpOrderChangeData.TrackingNumber="";//将需求跟踪号设置为空
        });
      }
     });
   }

   //查询ERP获取原始物料明细
   getOriginalMaterialList(){
     if(!this.erpOrderChangeData.OriginalERPOrderNo) return;
     this.erpOrderChangeApiServices.getERPDetail(this.erpOrderChangeData.OriginalERPOrderNo).then(data=>{
       if(data.Result){
        this.OriginalData=JSON.stringify(data.Data);//保存原始erp订单信息
        
        this.originalMaterilaList=data.Data.ChangeMaterialList;//保存物料明细列表
        this.assignmentMaterialList(this.originalMaterilaList);//对原始物料明细中的修改后数据进行赋值
        console.log(this.originalMaterilaList);
       }
     });
   }

   //当币种，税码，工厂，供应商，任何一个和原始的数据不同时，触发相关逻辑（1：设置是否创建新的采购订单的按钮，2：根据数量和金额的变化，重新计算ERP订单金额，3：判断是否此条物料是否修改，4：设置审批人）
   erpKeyDataChangeFn(){

    if(this.erpOrderChangeData.CurrencyCode===this.erpOrderChangeData.OriginalCurrencyCode&&
    this.erpOrderChangeData.FactoryCode===this.erpOrderChangeData.OriginalFactoryCode&&
    this.erpOrderChangeData.TaxFileNumber===this.erpOrderChangeData.OriginalTaxFileNumber&&
    this.erpOrderChangeData.VendorNo===this.erpOrderChangeData.OriginalVendorNo){
      //this.erpOrderChangeData.Is2ERP=this.notAllowEdit=false;
      this.notAllowEdit=false;
    }else{
      this.erpOrderChangeData.Is2ERP=1;
      this.notAllowEdit=true;//如果币种，税码，工厂，供应商任何一个修改那么创建新订单的按钮值设置为true，且不允许改为false
    }

    //如果修改后的税码和修改前不同，那么必须上传附件，显示事业部经理审批人
   if(this.erpOrderChangeData.TaxFileNumber!==this.erpOrderChangeData.OriginalTaxFileNumber){
     this.isUpLoadFile=true;
    //  this.allApproverListData[1].isApproval=true;//显示事业部经理审批人
   }else{
     this.isUpLoadFile=false;
   }

   //如果修改后的币种和修改前不同，那么需要显示事业部经理审批人
   if(this.erpOrderChangeData.CurrencyCode!==this.erpOrderChangeData.OriginalCurrencyCode){
    // this.allApproverListData[1].isApproval=true;//显示事业部经理审批人 
   }

   //如果币种和税码都没有变化，修改后的采购金额没有调高，则不显示事业部经理审批人
  //  this.hideBusinessManagerApprover();

   this.approvalStateChange('onChange');//发送消息，验证是否显示特定的审批环节
    
   }

   //隐藏事业部经理审批人
   hideBusinessManagerApprover(){

    if(this.erpOrderChangeData.TaxFileNumber===this.erpOrderChangeData.OriginalTaxFileNumber&&
      this.erpOrderChangeData.CurrencyCode===this.erpOrderChangeData.OriginalCurrencyCode&&
      this.erpOrderChangeData.OrderAmount.toFixed(2)<=this.erpOrderChangeData.OriginalOrderAmount){
        this.allApproverListData[1].isApproval=false;//显示事业部经理审批人
     }else if(this.erpOrderChangeData.TaxFileNumber!==this.erpOrderChangeData.OriginalTaxFileNumber||this.erpOrderChangeData.CurrencyCode!==this.erpOrderChangeData.OriginalCurrencyCode){
      this.allApproverListData[1].isApproval=true;//显示事业部经理审批人
     }
   }

   //增加物料
   addMaterial(){
     let ItemNo:number=10;//设置行号
     this.materialList.push(new ERPOrderChangeMaterial());
     console.log(this.materialList);
     this.materialList.forEach((element,index)=>{
       element.ItemNo=(index+1)*10;
     });
   }

   //删除一行物料
   deleteMaterial(I){
     if(!this.materialList[I].IsNew){
      this.materialList[I].IsDeleted=true;//删除物料所在行的删除标识字段值设置为true 
     }else{
       this.materialList.splice(I,1);
       this.materialList.forEach((element,index)=>{//重新计算行号
        element.ItemNo=(index+1)*10;
      });
     }
     
      //计算修改后总金额
      this.sumAmount();
   }

   //重置物料明细列表
   deleteList(){
     this.materialList=[new ERPOrderChangeMaterial()];
   }

   //excel导入模板下载
   downloadTpl(){
    window.open(dbomsPath+'assets/downloadtpl/ERP订单修改-物料明细模版.xlsx');
   }

   //导入物料明细列表
   getUploadFileMaterialList(e){
    if(e.Result){
      this.materialList=[...this.materialList,...e.Data];//合并导入的物料列表
      let ItemNo:number=10;//设置行号
      this.materialList.forEach((element,index)=>{
       element.ItemNo=(index+1)*10;
     });
     
     this.sumAmount();//重新计算总金额

    }
   }

   //请求接口，获取ERP订单的详细信息
   getERPDetail(erpCode){
     this.loading=true;
     this.trackingNumber=this.erpOrderChangeData.TrackingNumber;//保存需求跟踪号
     let applyTime=this.erpOrderChangeData.AddTime;//保存申请日期
     let applyItCode=this.erpOrderChangeData.ItCode;//保存itcode
     let applyName=this.erpOrderChangeData.UserName;//保存用户名
     let id=this.erpOrderChangeData.Id;//保存主键Id
     let applicantDepartment=this.erpOrderChangeData.SYBMC;//保存默认带出的申请人事业部
     this.erpOrderChangeApiServices.getERPDetail(erpCode).then(data=>{
       
      if(data.Result){
        this.loading=false;
        this.erpOrderChangeData=data.Data.OrderHeader;//保存表单主体数据
        this.OriginalData=JSON.stringify(data.Data);//保存原始订单信息
        this.contracts=JSON.parse(this.erpOrderChangeData.Contracts);//转换合同列表为JSON对象并保存
        
        this.erpOrderChangeData.TrackingNumber=this.trackingNumber;//因为返回的详情数据没有需求跟踪号，所以将之前保存的需求跟踪号赋值进表单实体的对应字段
        this.erpOrderChangeData.AddTime=applyTime;//因为直接返回的ERP存储的添加时间，所以需要将保存的申请日期重新赋值
        this.erpOrderChangeData.ItCode=applyItCode;//保存ItCode
        this.erpOrderChangeData.UserName=applyName;//保存UserName
        this.erpOrderChangeData.Id=id;//保存Id
        this.erpOrderChangeData.SYBMC=applicantDepartment;//保存事业部

        this.materialList=data.Data.ChangeMaterialList;//保存物料明细列表
        this.originalMaterilaList=JSON.parse(JSON.stringify(this.materialList));//保存原始的物料明细列表
        //this.erpOrderChangeData.Contracts=data.Data.Contracts;//保存合同列表


        //对获取到的物料明细列表进行赋值，将修改前字段的值赋值到修改后
        this.assignmentMaterialList(this.materialList);
        //对获取的ERP订单详情进行赋值
        this.assignmentProcurementInformation();
        this.windowService.alert({message:"查询成功",type:"success"}).subscribe(()=>{
          this.isCreateErpOrderChange(this.erpOrderChangeData.TrackingNumber,this.erpOrderChangeData.OriginalERPOrderNo);//验证是否可以创建采购订单修改
        });


      }else{
        this.windowService.alert({message:data.Message,type:"fail"}).subscribe(()=>{
          this.erpOrderChangeData=new ErpOrderChangeData();
        })
      }
    })
   }

   //是否可以创建采购订单修改
   isCreateErpOrderChange(TrackingNumber,OriginalERPOrderNo){
     this.vaildateResData.trackingNo=TrackingNumber;//保存需求跟踪号
     this.vaildateResData.orderNo=OriginalERPOrderNo;//保存erp订单号
     this.erpOrderChangeApiServices.validateCanCreate(this.vaildateResData).then(data=>{
       if(data.Result){
         if(!data.Data) this.windowService.alert({message:`ERP订单号：${ this.vaildateResData.orderNo }，处于修改中，不允许创建！`,type:"fail"}).subscribe(()=>{
          let applyDate=this.erpOrderChangeData.AddTime;//保存申请日期
          let businessDepartment = this.erpOrderChangeData.SYBMC;//保存事业部
          this.erpOrderChangeData=new ErpOrderChangeData();
          this.allSupplierCodeSAP='';
          this.erpOrderChangeData.AddTime=applyDate;//还原申请日期
          this.erpOrderChangeData.SYBMC=businessDepartment;//还原事业部

          });
       }else{
         this.windowService.alert({message:data.Message,type:"fail"});
       }
     })
   }

   
   //对获取的ERP订单详情进行赋值
   assignmentProcurementInformation(){
     this.erpOrderChangeData.CurrencyCode=this.erpOrderChangeData.OriginalCurrencyCode;//保存币种代码
     this.erpOrderChangeData.FactoryCode=this.erpOrderChangeData.OriginalFactoryCode;//保存工厂代码
     this.erpOrderChangeData.TaxFileNumber=this.erpOrderChangeData.OriginalTaxFileNumber;//保存税码
     this.erpOrderChangeData.OrderAmount=this.erpOrderChangeData.OriginalOrderAmount;//保存订单金额
     
     this.erpOrderChangeData.VendorNo=this.erpOrderChangeData.OriginalVendorNo=this.erpOrderChangeData.OriginalVendorNo.substring(this.erpOrderChangeData.OriginalVendorNo.search(/[1-9]/));//保存供应商编号
     this.erpOrderChangeData.Vendor=this.erpOrderChangeData.OriginalVendor;//保存供应商名称
     this.allSupplierCodeSAP=this.erpOrderChangeData.VendorNo+' '+this.erpOrderChangeData.Vendor;//合并为表单绑定字段

     this.erpOrderChangeData.SumNo=this.erpOrderChangeData.OriginalSumNo;//保存汇总号

     //获取币种名称
     this.onChangeCurrency(this.erpOrderChangeData.CurrencyCode);

   }

   //对获取到的物料明细列表进行赋值，将修改前字段的值赋值到修改后
   assignmentMaterialList(materialList){
    materialList.forEach(element=>{
      element.ItemNo=element.ItemNo.substring(element.ItemNo.search(/[1-9]/));//去掉编号前多余的零
      element.MaterialNumber=element.OriginalMaterialNumber=element.OriginalMaterialNumber.substring(element.OriginalMaterialNumber.search(/[1-9]/));//保存物料编号
      element.MaterialDescription=element.OriginalMaterialDescription;//保存物料描述
      element.Count=element.OriginalCount;//保存数量
      element.Price=element.OriginalPrice;//保存价格
      element.StorageLocation=element.OriginalStorageLocation;//保存库存地
      element.Batch=element.OriginalBatch;//保存批次
      element.SC_Code=element.OriginalSC_Code;//保存销售合同主键
      element.TrackingNo=element.OriginalTrackingNo;//保存需求跟踪号
      
      //获对应的取销售合同号
      this.contracts.forEach(item=>{
        if(item.SC_Code===element.OriginalSC_Code){
          element.MainContractCode=item.MainContractCode;//保存销售合同号
        };
      });
   
    });
   }

   //将附件存入请求实体
   saveUpLoadFile(){
    this.erpOrderChangeData.AccessoryList=[...this.alreadyfilelUpLoadList,...this.filelUpLoadList];//将附件存入请求实体
   }

   //格式化提交的数据
   formatFormData(){
     //如果工厂不存在，则将修改前工厂赋值到修改后工厂
     if(!this.erpOrderChangeData.FactoryCode) this.erpOrderChangeData.FactoryCode=this.erpOrderChangeData.OriginalFactoryCode;

     //如果汇总号不存在，则将修改前的汇总号复制到修改后的汇总号
     if(!this.erpOrderChangeData.SumNo) this.erpOrderChangeData.SumNo=this.erpOrderChangeData.OriginalSumNo;

     //如果“是否修改物料明细”选择的是“否”，那么将原始物料明细存入请求实体
     if(this.erpOrderChangeData.IsChangeMaterial==0){
      // console.log(this.originalMaterilaList);
       this.erpOrderChangeData.ERPOrderChangeMaterialList=this.originalMaterilaList;//保存物料明细列表
     }else{
       
       this.materialList.forEach(item=>{//如果物料明细中的需求跟踪号没有填写，则在提交时自动赋值为查询ERP详情的需求跟踪号
         if(this.erpOrderChangeData.TrackingNumber&&!item.TrackingNo) item.TrackingNo=this.erpOrderChangeData.TrackingNumber;
       });
       this.erpOrderChangeData.ERPOrderChangeMaterialList=this.materialList;//将修改后的物料明细存入请求实体
     }
   }

   //当物料明细中变化后，触发金额的重新计算
   sumAmount(){
     let totalAmountArray:any[]=[];//将每一行计算出的金额push进数组

     //过滤出数量和金额都不为空的物料
     this.materialList.filter(item=>item.Count&&item.Price&&!item.IsDeleted).forEach(element => {
      totalAmountArray.push(element.Count*element.Price);
     });
     this.erpOrderChangeData.OrderAmount=eval(totalAmountArray.join("+"));

     //如果修改后金额大于修改前金额，那么需要显示事业部经理审批人
     this.approvalStateChange('onChange');//变更检查，设置对应环节的审批人显示
     
    //  if(this.erpOrderChangeData.OrderAmount>this.erpOrderChangeData.OriginalOrderAmount){
    //    this.allApproverListData[1].isApproval=true;//显示事业部经理审批人
    //  }else{
    //   this.allApproverListData[1].isApproval=false;//隐藏事业部经理审批人
    //  }

     //判断是否隐藏事业部经理审批人
    //  this.hideBusinessManagerApprover();

   }

   //当失去焦点时，如果物料明细表列表中的数量或者金额为“”，则赋值为0，因为在保存时，后端数据库保存该字段为整型
   restPriceAndCount(I){
    this.materialList[I].Price=this.materialList[I].Price?this.materialList[I].Price:"0.00";
    this.materialList[I].Count=this.materialList[I].Count?this.materialList[I].Count:0;
   }

   //提交和暂存
   save(ApproveState){
      this.isSubmit=false;
      // this.erpOrderChangeData.ApproveState=this.erpOrderChangeData.ApproveState=='2'?this.erpOrderChangeData.ApproveState:ApproveState;//保存提交的状态（0：草稿，1：提交，2：驳回，3：已完成）
      this.erpOrderChangeData.ApproveState=ApproveState;//保存提交的状态（0：草稿，1：提交，2：驳回，3：已完成）
      this.saveUpLoadFile();//保存附件
      this.formatFormData();//格式化提交的数据
      // this.formatApproverList();//格式化审批人

      if(ApproveState===0){
        //暂存
        this.saveDataAPI(ApproveState);
      }else{
        //提交
        this.isSubmit=true;

        if(this.testIsUploadFile()) return;//验证是否上传附件
        
        if(this.testMaterialList()) return;//验证物料明细表

        // if(this.allApproverListData[0].list.length===0){//验证是否选择事业部审批人
        //   this.windowService.alert({message:"请选择事业部审批人",type:"fail"});
        //   return;
        // }

        // if(this.allApproverListData[4].isApproval&&this.allApproverListData[4].list.length===0){
        //   this.windowService.alert({message:"请选择库房冲红审批人",type:"fail"});
        //   return;
        // }
        if(!this.approverValid.valid){//验证审批人
          this.windowService.alert({message:this.approverValid.errApprover,type:'fail'});
          return;
        }

        if(this.ngForm.invalid){
          this.windowService.alert({message:"表单填写有误，请检查所有必填项是否填写",type:"fail"});
          return;
        }else if(this.erpOrderChangeVerificationComponent.verificationData(JSON.stringify(this.erpOrderChangeData))){//验证修改的采购订单信息与原始erp订单信息是否完全相同，如果相同则不允许提交
          this.windowService.alert({message:"修改前后内容一致，不能提交",type:"fail"});
          return;
        }else{
          this.saveDataAPI(ApproveState);
        }
      }
   }

   //验证需求跟踪号
   testTrackingNumber(trackingNumber){
     if(!this.trackingNumber) return;
     if(this.erpOrderChangeData.TrackingNumber!==this.trackingNumber){//如果需求跟踪号发生变化
      this.windowService.confirm({ message: `需求跟踪号已变更，是否重新查询` }).subscribe(v => {
            if (v) {
            this.searchERPList(trackingNumber);//重新查询
            }else{
              //点击取消恢复为修改前的需求跟踪号
              this.erpOrderChangeData.TrackingNumber=this.trackingNumber;
            }
          });
     }
   }

   //提交时的验证函数
   testMaterialList(){
    let isInValid:boolean=false;//是否通过验证
    if(this.erpOrderChangeData.IsChangeMaterial==1){//修改物料明细
      if(this.materialList.some(item=>item.Count=='0'||item.Price=='0.00')){
        isInValid=true;
        this.materialList.forEach((element,index)=>{
          if(element.Count=='0'){
            this.windowService.alert({message:`物料明细列表中，第${index+1}行的数量不能为0`,type:"fail"});
            return;
          }
          if(element.Price=='0.00'){
            this.windowService.alert({message:`物料明细列表中，第${index+1}行的金额不能为0`,type:"fail"});
            return;
          }
        });
      }else{
        isInValid=false;
      }
    }
    return isInValid;
   }

   //验证是否需要上传附件
   testIsUploadFile(){
    let isInValid:boolean=false;//是否通过验证
    if(this.isUpLoadFile&&this.erpOrderChangeData.AccessoryList.length===0){
     this.windowService.alert({message:"请上传至少一个附件",type:"fail"});
     isInValid=true;
    }else{
      isInValid=false;
    }
    return isInValid;
   }

   //保存表单API
  saveDataAPI(ApproveState){
    this.loading=true;
    this.erpOrderChangeApiServices.save(this.erpOrderChangeData).then(data=>{
      if(data.Result){
        this.loading=false;
        if(ApproveState===0){//暂存
          this.windowService.alert({message:"保存成功",type:"success"}).subscribe(()=>{
            localStorage.setItem('erpOrderChange','save');//保存标识
            window.close();
          });
        }else{//提交
            this.windowService.alert({message:"提交成功",type:"success"}).subscribe(()=>{
            localStorage.setItem('erpOrderChange','submit');//保存标识
            window.close();
          });

        }
      }else{
        this.windowService.alert({message:data.Message,type:"fail"});
        this.loading=false;
        return;
      }
    });
  }


  //获取审批历史记录
  getHistory(erpChangeId){
    this.erpOrderChangeApiServices.getHistoryAndProgress(erpChangeId).then(data=>{
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory;
        }
    });
  }

  //从详情中获取保存的审批人列表
  getDetailApproverList(){
    this.approvalDataConfigure=JSON.parse(this.erpOrderChangeData.WFApproveUserJSON);
    console.log(this.approvalDataConfigure);
    this.getApproverViewList(this.approvalDataConfigure);//从流程配置列表中解析出视图显示的列表    
  }

  //获得流程审批人
  getApprover(){
    let User = JSON.parse(localStorage.getItem("UserInfo"));
    if(User){
      this.erpOrderChangeApprover.BizScopeCode=User.YWFWDM;//保存申请人所属业务范围代码
      // this.erpOrderChangeApiServices.getFlowConfigInfo(this.erpOrderChangeApprover).then(data=>{
      //   if(data.Result){
      //     this.approvalDataConfigure=data.Data;//保存流程配置信息
      //     console.log(this.approvalDataConfigure);
      //     this.getApproverViewList(this.approvalDataConfigure);//从流程配置列表中解析出视图显示的列表
      //   }
      // });
    }
  }

  //从流程配置中保存视图上显示的审批人信息
  getApproverViewList(approvalDataConfigure:any){
    approvalDataConfigure.forEach(element => {//遍历流程配置信息列表

      this.allApproverListData.forEach(item => {//遍历审批人列表
        if(item.nodeName===element.NodeName){//找到审批人列表中对应流程配置中的审批人的列表项
          JSON.parse(element.ApproverList).forEach((content,index) => {//将流程配置中的审批人列表转换格式存入审批人列表
            item.list[index]={};
            item.list[index]["userID"]=content.ITCode
            item.list[index]["userEN"]=item.list[index]["ITCode"]=content.ITCode.toLocaleLowerCase();
            item.list[index]["userCN"]=item.list[index]["UserName"]=content.UserName;
           });
        }
      });
    });
  }

  //获取库房冲红审批人
  getStorageRCWApprovers(){
    this.erpOrderChangeApiServices.getStorageRCWApproversApi().then(data=>{
      if(data.Result){
        this.StorageRCWApproversList=data.Data;//保存库房冲红审批人
      }
    });
  }

  //弹出库房冲红审批人列表
  showStorangeRCWApproverList(){
    this.storageRCWApproversModal.show(this.StorageRCWApproversList);
  }

  //获得选择的库存冲红审批人
  getSelectRCWApprover(flatName){

    this.allApproverListData[4].list=[];//重置库房冲红审批人

    this.StorageRCWApproversList.forEach((element,index)=>{
      if(element.FlatName===flatName){
        this.allApproverListData[4].list.push({ userID: element.ItCode,ITCode: element.ItCode, userEN: element.ItCode, userCN: element.UserName,UserName: element.UserName});
        //this.allApproverListData[3].list[index]={ userID: element.ItCode,ITCode: element.ItCode, userEN: element.ItCode, userCN: element.UserName,UserName: element.UserName};
      }
    });
    
  }

  //获取事业部审批人
  getApprovalPerson(e){
    console.log(e);
   e.length>0?this.allApproverListData[0].list=[{"userID":e[0].itcode,"userEN":e[0].itcode,"userCN":e[0].name,"ITCode":e[0].itcode,"UserName":e[0].name}]:this.allApproverListData[0].list=[];
  }

  //格式化审批人列表
  formatApproverList(){

    // this.allApproverListData.forEach(element => {
      
    //   this.approvalDataConfigure.forEach(item => {
    //     if(element.nodeName===item.NodeName){
    //       item.ApproverList=JSON.stringify(element.list);
    //       item.UserSettings=JSON.stringify(element.list);
    //       item.IsOpened=element.isApproval?1:0;
    //     }
    //   });

    // });

    // this.erpOrderChangeData.WFApproveUserJSON=JSON.stringify(this.erpOrderChangeData.WFApproveUserJSON);
    console.log(this.erpOrderChangeData.WFApproveUserJSON);
  }

  //根据销售合同代码查询对应的销售合同号
  getMainContractCode(I){
    this.contracts.forEach(item=>{
      if(item.SC_Code===this.materialList[I].SC_Code){
        this.materialList[I].MainContractCode=item.MainContractCode;//保存销售合同号
      };
    });
  }

   //取消
   cancle(){
     window.close();
   }

   /**
    * 说明：新增逻辑，批量修改库存地和批次
    */
   batchModify(){
     if(!this.materialList||this.materialList.length===0) return;
     if(!this.batchModifyStorageLocation&&!this.batchModifyBatch) return;
     this.materialList.forEach(element=>{//遍历物料列表
      //如果批量修改库存地的值有效。将其赋值给所有物料的库存地字段
      this.batchModifyStorageLocation?element.StorageLocation=this.batchModifyStorageLocation:'';
      //如果批量修改批次字段的值有效，将其赋值给所有物料的批次字段
      this.batchModifyBatch?element.Batch=this.batchModifyBatch:'';//
     });
   }

   //当涉及审批环节变化的参数改变时，触发此方法，向子组件发送状态
   approvalStateChange(state){
     this.prepareApplyCommunicateService.erporderChangeSendState(state);
   }

   //获取审批人验证状态
   getApproverValid(e){
     this.approverValid=e;
   }

   //当是否创建新的采购订单时，触发审批人验证
   getIs2ERP(){
    this.approvalStateChange('onChange');//传递事件，用来判断显示哪个审批环节     
   }

}
