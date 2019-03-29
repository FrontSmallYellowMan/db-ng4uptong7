import {
  Component,
  OnInit,ViewChild
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { WindowService } from "app/core";
import { dbomsPath,environment,APIAddress } from "environments/environment";
import { DbWfviewComponent } from 'app/shared/index';

import { Person } from "app/shared/services/index";

import {
  ERPOrderChangeApiServices,
  ErpOrderChangeData,
  ERPOrderChangeMaterial,
  ERPOrderChangeApprover,ApproveData
} from "../../services/erporderchange-api.services";

declare var window;

@Component({
  selector: "erporderchange-view",
  templateUrl: "erporderchange-view.component.html",
  styleUrls: [
    "erporderchange-view.component.scss",
    "../../scss/erp-order-change.scss"
  ]
})
export class ERPOrderChangeViewComponent implements OnInit {
  userInfo = new Person(); //登录人头像
  erpOrderChangeData: ErpOrderChangeData = new ErpOrderChangeData(); //实例化主体数据
  approveData:ApproveData=new ApproveData();//实例化审批参数
  pageTitle: string = "查看采购订单修改详情"; //页面标题

  //保存修改前后的币种，工厂，税码汇总号信息
  procurementInformation:any=[
    {title:'币种',before:'',after:''},
    {title:'工厂',before:'',after:''},
    {title:'税码',before:'',after:''},
    {title:'供应商',before:'',after:''},
    {title:'汇总号',before:'',after:''}
  ]

  pageStatus: string; //保存状态，“我的申请(a)”,“我的审批(e)”

  materialList: any = []; //保存物料明细表
  contracts: any = []; //保存合同列表
  alreadyfilelUpLoadList: any = []; //保存附件列表

  taskState:string;//是否审批 0:未审批，1:已审批
  ADP:string;//是否加签
  isApproval:boolean=false;

  wfHistory: any = []; //保存审批历史记录
  wfviewData:any;//保存流程全景图

  constructor(
    private activatedRoute: ActivatedRoute,
    private erpOrderChangeApiServices: ERPOrderChangeApiServices,
    private WindowService: WindowService
  ) {}


  @ViewChild('wfView') public wfView: DbWfviewComponent;

  ngOnInit() {
    //获得路由id
    this.activatedRoute.paramMap.subscribe(data => {
      if (data.get("id") !== "0") {
        this.pageStatus = data.get("id").substring(0, 1); //保存标识状态
        //获得详情
        this.getDetail(data.get("id").substring(1));
      }
    });

    //获得路由查询参数
    this.getRouterPromise();
  }

  //获得详情
  getDetail(Id){
    this.erpOrderChangeApiServices.getDetail(Id).then(data => {
      if (data.Result) {
        this.erpOrderChangeData = data.Data;

        //保存申请人
        this.userInfo["userID"] = this.erpOrderChangeData.ItCode;
        this.userInfo["userEN"] = this.erpOrderChangeData.ItCode.toLocaleLowerCase();
        this.userInfo["userCN"] = this.erpOrderChangeData.UserName;

        console.log(this.erpOrderChangeData);
        //保存物料明细
        this.materialList = this.erpOrderChangeData.ERPOrderChangeMaterialList;
        //判断物料是否发生变更
        this.materialListIsChange(this.materialList);
        //获取合同列表
        this.contracts = JSON.parse(this.erpOrderChangeData.Contracts);
        //保存附件列表
        this.alreadyfilelUpLoadList = this.erpOrderChangeData.AccessoryList;

        //获取审批历史记录和流程全景图
        this.getHistoryAndFlow(this.erpOrderChangeData.Id);

        //保存修改前后的币种，工厂，税码，供应商和汇总号到指定字段
        this.getProcurementInformation();

        //如果采购订单状态属于已完成且没有生成新的采购订单号，那么需要将修改前的erp订单号赋值给修改后的erp订单号
        this.setERPOrderNo();

      } else {
        this.WindowService.alert({ message: data.Message, type: "fail" });
      }
    });
  }

  //获得路由里的查询参数
  getRouterPromise(){
    this.activatedRoute.queryParamMap.subscribe(data=>{
      if(data){
        this.approveData.nodeid=data.has('nodeid')?data.get('nodeid'):'';
        this.approveData.taskid=data.has('taskid')?data.get('taskid'):'';
        this.approveData.instanceid=data.has('instanceid')?data.get('instanceid'):'';
        this.taskState=data.has('TS')?'1':'0'//保存审批状态，0:未处理，1:已处理
        this.ADP=data.has('ADP')?'1':'0';//是否为加签审批，0：不是，1：是
        console.log(this.approveData);
      }
    })
  }


  //保存币种，工厂，税码，供应商和汇总号
  getProcurementInformation(){
    this.procurementInformation[0].before=this.erpOrderChangeData.OriginalCurrencyCode;//保存修改前币种
    this.procurementInformation[0].after=this.erpOrderChangeData.CurrencyCode;//保存修改后币种
    this.procurementInformation[1].before=this.erpOrderChangeData.OriginalFactoryCode;//保存修改前工厂
    this.procurementInformation[1].after=this.erpOrderChangeData.FactoryCode;//保存修改后工厂
    this.procurementInformation[2].before=this.erpOrderChangeData.OriginalTaxFileNumber;//保存修改前税码
    this.procurementInformation[2].after=this.erpOrderChangeData.TaxFileNumber;//保存修改后税码
    this.procurementInformation[3].before=this.erpOrderChangeData.OriginalVendor;//保存修改前供应商
    this.procurementInformation[3].after=this.erpOrderChangeData.Vendor;//保存修改后供应商
    this.procurementInformation[4].before=this.erpOrderChangeData.OriginalSumNo;//保存修改前汇总号
    this.procurementInformation[4].after=this.erpOrderChangeData.SumNo;//保存修改后汇总号
  }

  //判断每条物料明细是否发成变更
  materialListIsChange(materialList){
    materialList.forEach((element,index) => {
      if(element.MaterialNumber!=element.OriginalMaterialNumber||
      element.Count!=element.OriginalCount||
      element.Price!=element.OriginalPrice||
      element.StorageLocation!=element.OriginalStorageLocation||
      element.Batch!=element.OriginalBatch||
      element.TrackingNo!=element.OriginalTrackingNo||
      element.SC_Code!=element.OriginalSC_Code){
        materialList[index]['materialIsChange']=true;
      }else{
        materialList[index]['materialIsChange']=false;
      }
    });

    //重新排序物料列表
    this.materialListSort(materialList);
  }

  /**
   * 作用：重新排序物料列表
   * 说明：排序规则（新建物料→改变的物料→删除的物料→没有变化的物料）
   */
  materialListSort(materialList){
    let materialListNew:any=materialList.filter(item=>item.IsNew);//过滤出新建的物料
    let materialListChange:any=materialList.filter(item=>item.materialIsChange&&!item.IsNew);//过滤出修改过的物料
    let materialListDelete:any=materialList.filter(item=>item.IsDeleted||item.IsERPDeleted);//过滤出已删除的物料
    let materialListNotChange:any=materialList.filter(item=>!item.IsNew&&!item.materialIsChange&&!item.IsDeleted&&!item.IsERPDeleted);//过滤出无变化的物料

    this.materialList=[...materialListNew,...materialListChange,...materialListDelete,...materialListNotChange]
  }

  //查看附件
  seeFileUpLoad(url){
    window.open(APIAddress+url);
  }

  //获取审批历史记录
  getHistoryAndFlow(erpChangeId){
    this.erpOrderChangeApiServices.getHistoryAndProgress(erpChangeId).then(data=>{
      if(data.Result){
        this.wfHistory=JSON.parse(data.Data).wfHistory;
        console.log(this.wfHistory);
        if (this.wfHistory.length > 0 && this.wfHistory[0].approveresult === '驳回') {//增加申请人的审批节点
          this.wfviewData = [{ IsAlready: false, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//如果审批历史记录里的第一条数据为“驳回”，表示最后一次操作为“驳回”操作，那么全景区的申请人状态为“未提交”
        } else {
          this.wfviewData = [{ IsAlready: true, IsShow: true, NodeName: "申请人" }, ...JSON.parse(data.Data).wfProgress];//否则，全景图申请人状态为“已完成”
        }
         this.wfView.onInitData(this.wfviewData);

        }
    });
  }

  //将修改前的erp订单号赋值给修改后的erp订单号
  setERPOrderNo(){
    if(this.erpOrderChangeData.ApproveState===3&&!this.erpOrderChangeData.ERPOrderNo){
      this.erpOrderChangeData.ERPOrderNo=this.erpOrderChangeData.OriginalERPOrderNo;
    }
  }

  //允许审批
  writeType(){
    this.isApproval=true;
  }

  //审批成功，写入webStorage
  wariteStorage(){
    localStorage.setItem("erpOrderChange","approval");//保存标示，用来确认是否触发列表的刷新
  }

  //关闭
  cancle(){
    window.close();
  }


}
