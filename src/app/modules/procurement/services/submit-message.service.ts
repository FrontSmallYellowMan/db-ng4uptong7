import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { HttpServer } from 'app/shared/services/db.http.server';
import { Router } from "@angular/router";
import { WindowService } from 'app/core';
import { Person } from 'app/shared/services/index';

export class SubmitMessage {
    public main: any;
    public factory: any;
    public vendor;
    public vendorbizscope;
    public taxrate;
    public currency;
}
export class ApplyMyapplyQuery {
    public PageNo: number = 1;
    public PageSize: number = 10;
    public BBMC: string = '';
    public SYBMC: string = '';
    public User: string = '';
    public RequisitionType: string = '';
    public Vendor: string = '';
    public TraceNo: string = '';
    public IsModify: string = '';
    public Is2ERP: string = '';
    public StartAddTime: string = '';
    public EndAddTime: string = '';
    public TaskStatus: string = '';
    public PO:string;//厂商PO号
    public ProjectName:string;//项目名称
}
export class userData {
    constructor(
        public userID: string = '',
        public userEN: string = '',
        public userCN = ''
    ) { }
}
export class userArr {
    constructor(
        public NodeID: string = '',
        public NodeName: string = '',
        public userData: Array<userData>,
    ) { }
}

@Injectable()
export class SubmitMessageService {

    constructor(private dbHttp: HttpServer, private router: Router, private WindowService: WindowService,private http:Http) { }
    //ng-select转换方法
    onTransSelectInfos(arr: Array<any>, id, text, other) {//ngSelect 选项 id, text, other(税率)-选项转化
        // debugger;
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['id'] = item[id];
            newItem['text'] = item[id] + "--" + item[text];
            newItem['other'] = item[other];
            newArr.push(newItem);
        });
        return newArr;
    }
    onTransSelectInfosOther(arr: Array<any>, id, text) {//ngSelect 选项 id, text(币种，平台)-选项转化
        let newArr = [];
        arr.map(function (item) {
            let newItem = {};
            newItem['id'] = item[id];
            newItem['text'] = item[text];
            newArr.push(newItem);
        });
        return newArr;
    }
    //验证四位字符
    checkFour(str) {
        let reg = /^\w{4}$/;
        if (!reg.test(str)) {
            this.WindowService.alert({ message: '请输入四位字符', type: 'success' });
        }
    }
    //日期转换方法
    ChangeDateFormat(val) {
        if (val != null) {
            let date = new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));
            //月份为0-11，所以+1，月份小于10时补个0
            let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            let currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            return date.getFullYear() + "-" + month + "-" + currentDate;
        }
        return "";
    }
    getPersonList(personLocal) {//编辑时 预审人数据格式转化
        let personArr = [];
        let personList = [];
        let list = [];
        let person = JSON.parse("{}");
        for (let i = 0, len = personLocal.length; i < len; i++) {
            if (personLocal[i].UserSettings != "[]") {
                personArr.push(JSON.parse(personLocal[i].UserSettings));
            }
        }
        for (let i = 0, len = personArr.length; i < len; i++) {
            person = {
                id: JSON.stringify(i),
                name: personArr[i][0].UserName,
                itcode: personArr[i][0].ITCode
            }
            list.push(new Person(person));
        }
        for (let i = 0, len = list.length; i < len; i++) {
            let arr = [];
            arr.push(new Person(list[i]));
            personList.push({ person: arr });
        }
        if(personList.length<4){//push最后一个空人员
            personList.push({ person: [] });
        }
        return personList;
    }
    preparePersonLength=4;//预审人员最大长度
    transformPreparePersonList(personLocal) {//流程信息发生改变时 预审人 数据格式转化
        let personArr = [];
        let personList = [];
        let list = [];
        let person = JSON.parse("{}");
        for (let i = 0, len = this.preparePersonLength; i < len; i++) {
            if (personLocal[i].IsOpened == 1) {
                personArr.push(JSON.parse(personLocal[i].ApproverList));
            }
        }
        for (let i = 0, len = personArr.length; i < len; i++) {
            if (JSON.stringify(personArr[i]) != "[]") {
                person = {
                    id: JSON.stringify(i),
                    name: personArr[i][0].UserName,
                    itcode: personArr[i][0].ITCode
                }
            } else {
                person = {}
            }
            list.push(new Person(person));
        }
        for (let i = 0, len = list.length; i < len; i++) {
            let arr = [];
            if (JSON.stringify(list[i]) != "{}") {
                arr.push(new Person(list[i]));
            }
            personList.push({ person: arr });
        } 
        return personList;
    }
    transformApprovePersonList(personLocal,_excludetaxmoney,_companycode,_Is2ERP,
        _RevolveDays=null,_StandardRevolveDays=null,_IsHaveContractInfo=false) {//流程信息发生改变时 审批人 数据格式转化

        let personArr = [];//要返回的展示人员数组
        //personLocal-后台返回需要展示的原数据
        let pushPersonItem=function(localItem){//push到personArr一个完整的item
            personArr.push(
                new userArr(
                    localItem.NodeID,
                    localItem.NodeName,
                    []
                )
            );
            let userlist=JSON.parse(localItem.ApproverList);
            for (let f = 0, lens = userlist.length; f < lens; f++) {
                personArr[personArr.length-1].userData.push(
                    new userData(
                        userlist[f].ITCode.toUpperCase(),
                        userlist[f].ITCode,
                        userlist[f].UserName
                    )
                );
            }
        }
        let replaceChar=function(str){//替换返回字符串中的变量 和 方法名
            // 约定变量名：
            //     采购含税金额：AmountMoney
            //     是否写入ERP：Is2ERP
            //     公司代码：CompanyCode
            //     标准周转天数：StandardRevolveDays
            //     实际周转天数：RevolveDays
            //     是否提交合同用印：IsHaveContractInfo
            if(str.indexOf("AmountMoney")!=-1){//存在
                str=str.replace(/\[AmountMoney\]/g,'_excludetaxmoney');//全部替换
            }
            if(str.indexOf("Is2ERP")!=-1){
                str=str.replace(/\[Is2ERP\]/g,'_Is2ERP');
            }
            if(str.indexOf("IsHaveContractInfo")!=-1){
                str=str.replace(/\[IsHaveContractInfo\]/g,'_IsHaveContractInfo');
            }
            if(str.indexOf("CompanyCode")!=-1){
                str=str.replace(/\[CompanyCode\]/g,'_companycode');
            }
            if(_StandardRevolveDays!=null && str.indexOf("StandardRevolveDays")!=-1){//备货申请 时
                str=str.replace(/\[StandardRevolveDays\]/g,'_StandardRevolveDays');
            }
            if(_RevolveDays!=null && str.indexOf("RevolveDays")!=-1){//备货申请 时
                str=str.replace(/\[RevolveDays\]/g,'_RevolveDays');
            }
            return str;
        }
        for (let i = this.preparePersonLength, len = personLocal.length; i < len; i++) {//分析人员数据 选择要展示的push进数组
            if (personLocal[i].IsOpened == 1) {//要展示
                pushPersonItem(personLocal[i]);
            }else{//IsOpened是0时需要 计算表达式
                let evalData = personLocal[i].RuleExpressionJSON.split(',')[0].split(':')[1];
                let executStr=replaceChar(evalData);//可计算的表达式
                if(eval(eval(executStr))){//计算为true 需要展示
                    pushPersonItem(personLocal[i]);
                }
            }
        }
        return personArr;
    }
    printDataContantToWhole(list,wholeDa){//把用印审批人信息 拼接近流程的整体数据中
        let arr=[];
        for (let i = 0, len = list.length; i < len; i++) {
            arr.push({
                "ITCode":list[i]["userID"],
                "UserName":list[i]["userCN"]
            })
        }
        for (let i = 4, len = wholeDa.length; i < len; i++) {
            if(wholeDa[i]["NodeID"]==18){
                wholeDa[i]["ApproverList"]=JSON.stringify(arr);
            }
        }
    }
    createApprovePrintUseData(UserSetting,departApprovalList){//当用印模块 改变时 动态改变 审批中用印部分的审批人显示
        let managesInfo=[];
        if(UserSetting){
            let pintUseDat=JSON.parse(UserSetting);
            let alrerdyPush=[];
            let checkAlready=function(id){
                for(let i=0,len=alrerdyPush.length;i<len;i++){
                    if(alrerdyPush[i]==id){
                        return i;
                    }
                }
                return -1;
            }
            for(let i=0,len=pintUseDat.length;i<len;i++){
                if(checkAlready(pintUseDat[i]["ITCode"])==-1){
                    alrerdyPush.push(pintUseDat[i]["ITCode"]);
                    managesInfo.push({
                        "userID": pintUseDat[i]["ITCode"],
                        "userEN":pintUseDat[i]["ITCode"],
                        "userCN":pintUseDat[i]["UserName"]
                    });
                }
            }
            for(let k=0,lenk=departApprovalList.length;k<lenk;k++){
                console.log(departApprovalList[k]["NodeID"]);
                if(departApprovalList[k]["NodeID"]==18){
                    departApprovalList[k]["userData"]=managesInfo;
                }
            }
            console.log(managesInfo,departApprovalList);
        }
        return managesInfo;
        
    }
    separateprintDataFromWhole(wholeDa){//编辑时 从主体流程数据中分离出 用印相关的流程数据
        let arr=[];
        for (let i = 4, len = wholeDa.length; i < len; i++) {
            if(wholeDa[i]["NodeID"]==18){
                let list=JSON.parse(wholeDa[i]["ApproverList"]);
                for(let k=0,lenk=list.length;k<lenk;k++){
                    arr.push({
                        "userID": list[k]["ITCode"],
                        "userEN":list[k]["ITCode"],
                        "userCN":list[k]["UserName"]
                    })
                }
            }
        }
        return arr;
    }
    removeRepeatApprovePrintData(UserSetting){//查看页面 用印审批人员 去重显示
        if(UserSetting){
            let pintUseDat=JSON.parse(UserSetting);
            let managesInfo=[];
            let alrerdyPush=[];
            let checkAlready=function(id){
                for(let i=0,len=alrerdyPush.length;i<len;i++){
                    if(alrerdyPush[i]==id){
                        return i;
                    }
                }
                return -1;
            }
            for(let i=0,len=pintUseDat.length;i<len;i++){
                if(checkAlready(pintUseDat[i]["ITCode"])==-1){
                    alrerdyPush.push(pintUseDat[i]["ITCode"]);
                    managesInfo.push(pintUseDat[i]);
                }
            }
            return managesInfo;
        }
    }


    /**
     * 日期：2018-10-29
     * 说明：修改采购申请流程配置，重写涉及获取审批流程的方法。
     */

     //获取审批流程
     getApproverList(saveData){
         return this.http.post(environment.server+'PurchaseManage/GetWorkFlowConfigInfo_Requisition',saveData).toPromise().then(Response=>Response.json());
     }

}
