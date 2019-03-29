import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { dbomsPath, environment } from "environments/environment";
import { WindowService } from "app/core";

import { ExtendMaterl, MaterielExtendMaterielService, AddMaterileList, ExtendMaterielDetail, NewExtendMaterielData, ApproveData,MaterielCodeFactory,DeleteExtendMaterileData } from '../../services/materiel-extendMateriel.service';
import { RecordAllowEditStateService,RecordAllowEditStateQuery } from "../../../../shared/services/recordalloweditstate.service";

declare var window;

@Component({
  templateUrl: 'edit-materiel-extendMateriel.component.html',
  styleUrls: ['edit-materiel-extendMateriel.component.scss']
})
export class EditMaterielExtendMaterielComponent implements OnInit {

  addMaterileList: AddMaterileList = new AddMaterileList();//添加的物料列表
  newExtendMaterielData: NewExtendMaterielData = new NewExtendMaterielData();
  extendMaterielDetail: ExtendMaterielDetail = new ExtendMaterielDetail();
  approveData: ApproveData = new ApproveData();
  materielCodeFactory:MaterielCodeFactory=new MaterielCodeFactory();
  deleteExtendMaterileData:DeleteExtendMaterileData=new DeleteExtendMaterileData();
  recordAllowEditStateQuery:RecordAllowEditStateQuery=new RecordAllowEditStateQuery();//实例化验证是否可编辑的请求参数

  extendType: string;
  extendList: any[] = [];

  materileList: string;//用来绑定添加的物料好字符串
  title: string = '编辑';//标题
  isAddingMateriel: boolean;//添加物料，防止重复添加
  factoryValid: boolean;//工厂合法
  hasError: boolean;//提交结果有错误
  hasSubmited: boolean;//已经提交过
  fileUploadApi: string;//文件导入api
  loading: boolean;//加载效果
  codeError: string = "";//物料编号错误信息

  isSeeDetail: boolean;//是否能够继续添加，显示或者隐藏提交按钮
  isReject: boolean;//是否是驳回，并带有错误信息的
  isRejectList: boolean = true;//用于检测删除驳回的订单时，列表里是否还存在错误的条目，如果不存在则将提交按钮隐藏，显示关闭按钮
  isShowbutton:boolean=true;//是否显示下载模版和导入列表按钮

  unSubmit: boolean = true;//是否点击提交按钮

  wfHistory: any[] = [];//保存审批历史记录

  status: string;//用来保存驳回状态，如果存在值，且值为7，表示为驳回

  materileNoTestArray:any=['80','81','82','83'];//用来验证是否为服务物料

  materialID:number=0;//用来存储添加的物料ID

  @ViewChild('form') form: NgForm;

  constructor(
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute,
    private materielExtendMaterielService: MaterielExtendMaterielService,
    private cdRef:ChangeDetectorRef,
    private recordAllowEditStateService:RecordAllowEditStateService) { }

  ngOnInit() {
    this.fileUploadApi = environment.server + "material/extension/import"

    this.getApprovalNodeinit();//获取审批节点初始化

    let id = this.activatedRoute.snapshot.params['id'];

    if (id == '0') {
      this.title = '新建';
      this.isSeeDetail = true;
      return;
    } else {
      this.approveData.ID = this.newExtendMaterielData.ExtendNo = id;

      // this.recordAllowEditStateQuery.FunctionCode='44';//请求查询的模块代码
      // this.recordAllowEditStateQuery.RecordID=this.approveData.ID;//页面的主键ID
      // this.recordAllowEditStateQuery.NotAllowEditLink=`mate/edit-em-approvaldetail/a${this.approveData.ID}`;
      // this.recordAllowEditStateQuery.NotFoundRecordLink=`mate/m-em/m-em-apply/a`;
      // this.recordAllowEditStateService.getRecordAllowEditState(this.recordAllowEditStateQuery);

      this.isSeeDetail = false;
      this.isShowbutton=false;//隐藏下载模版和导入列表按钮

      let url = window.location.search;//保存路由中的参数
      let paramsArray = url.split("&");

      this.approveData.instanceid = this.newExtendMaterielData.InstanceId = paramsArray[0].substring(paramsArray[0].indexOf("=") + 1);//将参数取出存入变量
      paramsArray[1] ? this.status = paramsArray[1].substring(paramsArray[1].indexOf("=") + 1) : this.status = "";
      console.log(this.status);
    }

    this.getApprovalHistory();//获取审批历史记录

    this.getDetail(id);//获取详情

  }

  //获取详情
  getDetail(id) {
    this.materielExtendMaterielService.getMaterielDetail(id).then(result => {//获取详情
      this.extendType = result.data.list[0].ExtendType.toString();
      this.extendList = result.data.list;
      //console.log(this.extendList);
      this.extendList.forEach(item => {
        if (item.ExcepMsg) {//如果驳回后存在错误信息
          item.isSucceed = false;
          item.errorMsg = item.ExcepMsg;//将错误信息赋值给对应的错误提示字段
          this.isSeeDetail = true;//是否显示提交按钮
          this.unSubmit = false;//不允许编辑
          this.hasError = true;//表示存在错误
          this.isReject = true;//表示是驳回并带有错误信息的
        } else {
          item.isSucceed = true;
        }
      });

      //如果是驳回状态且没有错误信息，表示在驳回时是直接驳回，那么页面就保留编辑状态
      if (this.status === "7" && this.extendList.every(item => !item.ExcepMsg)) {

        this.extendList.forEach(item => {
          item.isSucceed = false;
        });
        this.isSeeDetail = true;
        this.unSubmit = false;//不允许编辑
        this.hasError = true;//表示存在错误
        this.isReject = true;//表示是驳回并带有错误信息的
      }

      this.hasSubmited = true;
    })
  }

  //添加物料
  addMateriel() {
    if (this.isAddingMateriel) { return };//防止连续点击
     
    if (this.materileList) {//如果存在物料号
      this.addMaterileList.MaterialList = this.materileList.split(",");//将获取的物料号转换为数组
      this.addMaterileList.MaterialList = this.addMaterileList.MaterialList.filter(item => item != "");//过滤出不为空的数组

      if(this.materileNoTestArray.some(item=>this.addMaterileList.MaterialList.some(element=>element.substring(0,2)===item))){
        this.windowService.alert({message:"添加的物料包含返款服务类物料，请删除后重新添加",type:"fail"});        
      }else{
        this.addMaterileNo();//添加物料接口
      }

    }

  }

  //添加物料接口
  addMaterileNo(){
    
    this.isAddingMateriel = true;//正在请求物料序列号
    this.materielExtendMaterielService.getSerialNumber(this.addMaterileList).then(result => {
      if (result.success && result.data.validLst.length > 0) {

        result.data.validLst.forEach((element, index) => {
          this.materialID++;
          element['materialID']=this.materialID;
          this.extendList.push(element);
        });

        //可以编辑
        this.extendList.forEach(item => { item.editAble = true});

        console.log(this.extendList);
        this.isRejectList=true;//在新建扩展工厂时，如果没有提交直接将新建项全部删除，提交按钮会隐藏，如果在添加会显示提交按钮

        if (result.data.novalidLst.length > 0) {//如果添加的物料号不存在，弹出提示
          this.windowService.alert({ message: `物料号 ${result.data.novalidLst.toString()} 不存在`, type: "fail" });
        }

      } else if (result.data.validLst.length == 0 && result.data.novalidLst.length > 0) {//全部都是错误的情况
        this.windowService.alert({ message: `物料号 ${result.data.novalidLst.toString()} 不存在`, type: "fail" });
      } else {
        this.windowService.alert({ message: result.message, type: "fail" });
      }
      this.isAddingMateriel = false;//请求完成
      console.log(result);
    });
  }

  //删除该行扩展
  removeExtend(i,materialID?) {
    if (this.extendList[i].isSucceed) { return };
    
    //console.log(this.form.invalid,this.extendType,this.isReject);
    this.deleteExtendMaterileData.SerialNumber=this.extendList[i].SerialNumber;//获取订单编号
    this.deleteExtendMaterileData.List.push(this.extendList[i]);//获取要删除的物料号
    this.extendList.splice(i, 1);//删除数组项

    /**
     * 因为删除视图上的列表时，formcontrols里的表单项并没有按照对应的下标删除，
     * 所以增加一个materialID,用来删除formcontrols里对应的表单项
     */
    
    for(let key in this.form.controls){
      if(key.indexOf(`-${materialID}`)!=-1){
        delete(this.form.controls[key]); 
      }
    }
    
    this.hasError = this.isRejectList = this.extendList.some(item => !item.isSucceed);
    this.deleteExtendMaterileData.IsComplete=this.hasError?"0":"1";//是否还包含扩展是失败的项目

    this.deleteExtendMaterielFail();//删除扩展失败的物料
    //console.log(this.form);
  }

  //下载模板
  download(et: string) {
    switch (et) {
      case "0":
        window.open(dbomsPath + 'assets/downloadtpl/扩展工厂模板.xlsx')
        break;
      case "1":
        window.open(dbomsPath + 'assets/downloadtpl/扩展批次模板.xlsx')
        break;
      case "2":
        window.open(dbomsPath + 'assets/downloadtpl/扩展库存地模板.xlsx')
        break;

      default:
        // code...
        break;
    }
  }

  //导入
  fileUpSuccess(data) {
    console.log(data);
    this.hasSubmited = true;
    data.forEach(item => {
      this.materialID++;
      item.editAble = true;
      item['materialID']=this.materialID;
    });
    this.extendList = this.extendList.concat(data);
  }

  //保存
  save() {

    if( this.extendList.length===0){
      this.windowService.alert({message:"请先添加要扩展的物料",type:"fail"});
      return;
    }

    this.extendList.forEach(item => {
      item.ExtendType = this.extendType;
      //item.valid = !!item.ReferFactory && !!item.ExtendFactory && item.ReferFactory.slice(-2) == item.ExtendFactory.slice(-2);
    });

    this.testIdenticalList();//过滤完全相同的提交项

    if (this.extendType === '0'&&this.extendList[0].ExtendFactory ? this.extendList.some((item) => item.ReferFactory.substring(2) != item.ExtendFactory.substring(2)) : false) {  
      this.newSave();
      console.log(this.extendType);
    } else if(this.extendType === '0'&&this.extendList[0].ExtendFactory ? this.extendList.every((item) => item.ReferFactory.substring(2) === item.ExtendFactory.substring(2)) : false) {
      
      let arrTmp = this.extendList.filter(item => !item.isSucceed);//过滤出未提交成功的项
      if (arrTmp.length == 0) { return };

      this.loading = true;
      this.isShowbutton=false;//当点击提交按钮后，隐藏下载模版和导入列表按钮

      this.materielExtendMaterielService.extendFactoryForDirect(arrTmp).then(data => {
        this.extendFactoAndStoreAndBatchForDirect(data);//直接扩展工厂
      });

    }else {
      let arrTmp = this.extendList.filter(item => !item.isSucceed);//过滤出未提交成功的项
      if (arrTmp.length == 0) { return };

      this.loading = true;
      this.isShowbutton=false;//当点击提交按钮后，隐藏下载模版和导入列表按钮
      this.materielExtendMaterielService.saveExtend(arrTmp).then(data => {

       // console.log(data);
        this.extendFactoAndStoreAndBatchForDirect(data);//直接扩展库存地和批次
      });
    }

  }

  //直接扩展工厂，库存地，批次
  extendFactoAndStoreAndBatchForDirect(data) {
    this.loading = false;
        this.hasSubmited = true;
        this.hasError = !data.success;

        this.extendList.forEach(item => {
          item.isSucceed = true;
          item.editAble = false;
        });

        this.unSubmit = false;

        if (!data.success) {
          this.extendList.forEach(item => {
            JSON.parse(data.message).forEach(obj => {
              item.SerialNumber=obj.SN;//将返回的订单号赋值给绑定数组的元素
              if (obj.MaterialCode == item.MaterialCode&&obj.ExtendFactory===item.ExtendFactory&&obj.ReferFactory===item.ReferFactory&&obj.ReferLocation===item.ReferLocation) {
                item.isSucceed = false;
                item.errorMsg = obj.Error;
              }
            })
          })
        } else {
          this.isSeeDetail = false;
        }
  }



  //修改
  modify() {
    this.extendList.forEach(item => {
      item.editAble = !item.isSucceed;
    })
    //this.hasError=false;
    this.isReject = false;//标示修改后，取消错误状态，是提交按钮可用
  }

  //取消
  cancel() {
    localStorage.setItem("extendMateriel", "closeWindow");//保存标示，用来确认是否触发列表的刷新       
    window.close();
  }

  //如果参考工厂和扩展工厂的后两位不相同，需要执行的方法
  newSave() {

    this.newExtendMaterielData.OrderType = 2;//提交类别（1:无审批，2:有审批）
    this.newExtendMaterielData.List = this.extendList.filter(item => !item.isSucceed);//过滤出出错的列表

    this.newExtendMaterielData.List.forEach(item => {
      item.errorMsg = "";//清空错误信息
      item.ExcepMsg = "";//清空错误信息
    });
    this.isShowbutton=false;//当点击提交按钮后，隐藏下载模版和导入列表按钮
    this.materielExtendMaterielService.haveApprovalFormExtendMaterial(this.newExtendMaterielData).then((data) => {
      if (data.success) {
        this.windowService.alert({ message: "提交成功，已进入审批流程", type: "success" }).subscribe(() => {
          localStorage.setItem("extendMateriel", "submit");//保存标示，用来确认是否触发列表的刷新   
          window.close();//关闭窗口       
        });
      } else {
        this.windowService.alert({ message: data.message, type: "fail" });
      }
    });

  }

  //格式化收入参数并且根据参考工厂获取相应的参考库存地
  formatInput(I,factory,type?) {
  
    this.extendList[I].ReferFactory = this.extendList[I].ReferFactory ? this.extendList[I].ReferFactory.toUpperCase() : "";//转换参考工厂为大写
    this.extendList[I].ExtendFactory = this.extendList[I].ExtendFactory ? this.extendList[I].ExtendFactory.toUpperCase() : "";//转换扩展工厂为大写
    this.extendList[I].ExtendBatch = this.extendList[I].ExtendBatch ? this.extendList[I].ExtendBatch.toUpperCase() : "";//转换扩展批次为大写
    this.extendList[I].ExtendLocation = this.extendList[I].ExtendLocation ? this.extendList[I].ExtendLocation.toUpperCase() : "";//转换扩展库存地为大写
    this.extendList[I].ReferLocation = this.extendList[I].ReferLocation ? this.extendList[I].ReferLocation.toUpperCase() : "";//转换扩展库存地为大写
    this.extendList[I].ReferSalesOrganization = this.extendList[I].ReferSalesOrganization ? this.extendList[I].ReferSalesOrganization.toUpperCase() : "";//转换销售组织为大写
    

    if(type==='referFactory'){
      this.testReferFactory(I);//验证参考工厂是否存在此物料

      if(this.extendList[I].ReferFactory) {
        this.extendList[I].ReferSalesOrganization=this.extendList[I].ReferFactory.substring(0,2)+'02';
      }

    }

    if(this.extendType==="0"&&this.extendList[I].ReferFactory&&type==='referFactory'){//如果为扩展工厂
      this.getReferenceReferLocation(I,factory);//根据参考工厂获取参考库存地 
    }else if(this.extendType==="0"&&!this.extendList[I].ReferFactory&&this.extendList[I].ReferLocation){//如果参考工厂不存在，但是参考库存地存在，则清空参考库存地
      this.extendList[I].ReferLocation="";
    }

    console.log(this.form.invalid,this.form);

  }

  //根据参考工厂获取参考库存地
  getReferenceReferLocation(I,factory){
  
      this.materielExtendMaterielService.getReferenceReferLocation(factory).then(data=>{

        if(data.data.list.length>0){
          this.extendList[I].ReferLocation=data.data.list[0].Location;
        }else{
          this.extendList[I].ReferLocation=null;
        }
      });
  }

  //获取审批结点初始化信息
  getApprovalNodeinit() {
    let WFCategory = "物料扩展工厂";
    this.materielExtendMaterielService.getApprovalNodeInit({ WFCategory: WFCategory }).then(data => {
      if (data.success) {
        this.newExtendMaterielData.WFApproveUserJSON = data.data;
        console.log(data);
      }
    });
  }

  //获取审批历史记录
  getApprovalHistory() {
    this.materielExtendMaterielService.getApprovalHistory(this.approveData).then(data => {
      if (data.success) {
        this.wfHistory = data.data;
      }
    });
  }

  //验证输入的参考工厂是否存在对应行的物料
  testReferFactory(I) {
    this.materielCodeFactory.Factory = this.extendList[I].ReferFactory;//获取查询参数
    this.materielCodeFactory.MaterialERPCode = this.extendList[I].MaterialCode;//获取物料编号

    if (this.materielCodeFactory.Factory && this.materielCodeFactory.MaterialERPCode) {
      
      this.materielExtendMaterielService.getMaterielInformation(this.materielCodeFactory).then(data => {
        if (!data.success) {
          this.windowService.alert({ message: data.message, type: "fail" }).subscribe(() => {
            this.extendList[I].ReferFactory = "";//清空参考工厂
          });
        }
      });

    }

  }

  //删除扩展失败的物料
  deleteExtendMaterielFail() {
    this.materielExtendMaterielService.deleteExtendMaterile(this.deleteExtendMaterileData).then(data => {
      if (data.success) {
        this.deleteExtendMaterileData = new DeleteExtendMaterileData();//重制请求参数
      }
    });
  }

  //验证是否提交列表中，包含完全相同的条目
  testIdenticalList(){
    let _extendList=JSON.parse(JSON.stringify(this.extendList));//复制提交的数组
    _extendList.forEach((item,index,arr)=>{//遍历数组，将数组中的对象转化为JSON字符串
      arr[index]=JSON.stringify(item);
    });

    _extendList=Array.from(new Set(_extendList));//过滤重复的数组项

    _extendList.forEach((item,index,arr)=>{//将数组项转化为对象
      arr[index]=JSON.parse(item);
    });

    this.extendList=JSON.parse(JSON.stringify(_extendList));//将过滤后的数组赋值到绑定数组
    //console.log(this.extendList);
  }

    

}