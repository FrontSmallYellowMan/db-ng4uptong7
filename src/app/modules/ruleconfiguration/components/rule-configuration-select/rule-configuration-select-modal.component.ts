import { Component, OnInit } from '@angular/core';
import {Pager,XcModalService,XcBaseModal,XcModalRef} from "app/shared/index";

import { ContractRuleConfigService, QuerySYBMCData} from "../../services/contractruleconfig.service";
import { CommunicateService } from "../../services/communicate.service";
import { element } from 'protractor';

declare var Object;

@Component({
  selector: 'rule-configuration-select-modal',
  templateUrl: 'rule-configuration-select-modal.component.html',
  styleUrls:['rule-configuration-select-modal.component.scss','../../scss/ruleconfig.component.scss']
})

export class RuleConfigurationSelectModalComponent implements OnInit {
  
  querySYBMCData:QuerySYBMCData=new QuerySYBMCData();//实例化查询参数
  modal: XcModalRef;//声明弹窗
  pagerData = new Pager(); //分页对象

  reqAPI:string;//查询列表的接口地址
  saveParameterIndex:number;//需要保存显示的值得下标
  title:string;//保存弹出窗的名称
  saveValue:any;//保存选定的值
  saveValueList:any=[];//保存选定值的列表
  name:string;//保存组件的名称
  alreadyChosenData:any;//已选择值的列表
  showIndex:string;//保存要显示的列下标
  queryParameter:any; // 保存查询参数

  fullChecked = false; //全选状态
  fullCheckedIndeterminate = false; //半选状态
  checkedNum = 0; //已选项数

  searchList: any[] = []; //用来保存返回的列表数据
  titleList:any[]=[];//用来保存标题列表
  contentList:any[]=[];//重构后的内容列表


  constructor(
    private xcModalService:XcModalService,
    private contractRuleConfigService:ContractRuleConfigService,
    private communicateService:CommunicateService
  ) { }

  ngOnInit() { 

    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    this.showModal();//显示弹出窗

  }

  showModal(){
    this.modal.onShow().subscribe(data => {//显示弹窗
      if(data) {
        console.log(data);

        this.reqAPI=data.listAPI;//保存接口地址
        this.saveParameterIndex=parseInt(data.saveParameterIndex);//保存需要保存的值的下标
        this.title=data.title;//保存标题
        this.name=data.name;
        this.showIndex=data.showIndex;//保存要显示的下标
        this.saveValueList=data.alreadyChosenData!==undefined&&data.alreadyChosenData.length>0?JSON.parse(JSON.stringify(data.alreadyChosenData)):[];//保存已选择值得列表
        this.queryParameter=data.queryParameter;//保存查询参数

        this.mergeQueryParameter();// 合并查询参数

        this.initData(this.reqAPI);//获取列表
      }
 });
  }

  //请求接口获取列表数据
  initData(API){

    if(this.queryParameter) {

      for(let key in this.queryParameter) {
        if(key==='querycontent') {
          this.querySYBMCData[this.queryParameter[key]]=this.querySYBMCData.querycontent;
        }
      }
    }
    
    //请求接口获取列表数据
    this.getListAPI(API);
    
  }

  getListAPI(API) {
    this.contractRuleConfigService.getSYBMCDataAPI(API,this.querySYBMCData).then(data=>{
      console.log(data);
      if(data.Result){
        if(data.Data.pagedata){//如果存在数据
          this.contentList=[];//重置列表内容数组

          this.searchList=typeof data.Data.pagedata==='object'?data.Data.pagedata:JSON.parse(data.Data.pagedata);//保存搜索的列表数据
          
          if(this.showIndex) { // 如果存在显示下标

            let showIndexArray = this.showIndex.split('');// 分割传入的下标字符串
            this.titleList = [];// 重置title列表为为空
            showIndexArray.forEach(element=> { // 遍历下标列表
              this.titleList.push(data.Data.title[element]); // 将接口返回的title数据，按照对应下标规则push进入title列表
            });

            this.searchList.forEach((element,index)=>{// 遍历返回的数据列表
              this.contentList[index]=[];//初始化视图显示的列表项
              for(let key in element) { // 遍历返回数据的对象
                this.contentList[index].push(element[key]);//将列表内容转换为数组
              }
             
              let newContentList = []; // 声明一个新数组
              showIndexArray.forEach(item=> { // 将数据按照传入的下标，push进入新数组
                newContentList.push(this.contentList[index][item]);
              });

              this.contentList[index] = newContentList;// 将新数组保存进入对应的数据行
              // this.contentList = newContentList;

              
              // console.log(Object.values(element),element);
              // this.contentList.push(Object.values(element));//将列表内容转换为数组,ie下不支持此方法
            })

            console.log(this.titleList);
          }else {
            this.titleList=data.Data.title;//保存标题列表
            this.searchList.forEach((element,index)=>{
              this.contentList[index]=[];//初始化视图显示的列表项
              for(let key in element){
                this.contentList[index].push(element[key]);//将列表内容转换为数组
              }
              // console.log(Object.values(element),element);
              // this.contentList.push(Object.values(element));//将列表内容转换为数组,ie下不支持此方法
            })
          }
          
          this.fullChecked=false;// 重置全选状态
          this.fullCheckedIndeterminate=false;// 重置半选选按钮状态

          this.pagerData.set(data.Data.pager);
        }
      }
    });
  }

  //合并查询参数
  mergeQueryParameter() {

    if(this.queryParameter) {
      this.querySYBMCData=Object.assign(this.querySYBMCData,this.queryParameter);// 合并查询参数
      this.querySYBMCData.querycontent='';// 合并后，将默认查询字段置为空字符
    }
    
  }

  //如果存在指定要显示的列，则根据列下标重组显示的标题和内容
  rearrangeShowList(){
  }

  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  //切换分页
  onChangePager(e: any) {
    this.querySYBMCData.pageNo = e.pageNo;
    this.querySYBMCData.pageSize = e.pageSize;
    if(this.reqAPI) this.initData(this.reqAPI);
  }

  //搜索
  search(){
    this.querySYBMCData.pageNo=1;
    this.initData(this.reqAPI);

  }

  //获取选定的值
  getConent(I){

    //如果列表不存在选定的值则,则将值push进数组
    if(this.contentList[I].checked&&this.saveValueList.every(item=>item!==this.contentList[I][this.saveParameterIndex])){
       this.saveValueList.push(this.contentList[I][this.saveParameterIndex]);//将数据push进数组
    }else if(!this.contentList[I].checked&&this.saveValueList.some(item=>item==this.contentList[I][this.saveParameterIndex])){
       //删除数组中的一项
       this.saveValueList.splice(this.saveValueList.indexOf(this.contentList[I][this.saveParameterIndex]),1);
    }else if(!this.contentList[I].checked&&this.saveValueList.some(item=>item==this.contentList[I][this.saveParameterIndex])&&this.saveValueList.lenght===1){
      //如果选择项的数组只有一个值，且处于未选中状态，则清空数组
      this.saveValueList=[];
    }


    // this.communicateService.sendValue(JSON.stringify(this.saveValueList));//发送选择列表的值

    //console.log(this.saveValueList);
  }

  //取消，关闭窗口
  cancle(){
    this.modal.hide(JSON.stringify(this.saveValueList));
    this.pagerData=new Pager();
    this.fullChecked=false;// 重置全选状态
    this.fullCheckedIndeterminate=false;// 重置半选选按钮状态
  }


}