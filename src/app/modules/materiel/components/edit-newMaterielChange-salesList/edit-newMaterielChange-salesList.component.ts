import { Component, OnInit, ViewChild } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';
import { NgForm } from "@angular/forms";
import { WindowService } from "app/core";
import { dbomsPath} from "environments/environment";
import { MaterielChangeData,MaterielChangeService,SalseList } from "../../services/materiel-materielChange.service";

@Component({
    selector: 'edit-nmc-salesList',
    templateUrl: 'edit-newMaterielChange-salesList.component.html',
    styleUrls:["edit-newMaterielChange-salesList.component.scss","../../scss/materiel.component.scss"]
})

export class EditNewMaterielChangeSalesListComponent implements OnInit {
    constructor(
        private windowService: WindowService,
        private xcModalService: XcModalService,
        private materielChangeService:MaterielChangeService) { }

        modal: XcModalRef;//声明弹窗

        salseList:SalseList=new SalseList;

        materielSales:any;//用来保存回传数据

        MainContractCode:string;//用来存储销售合同号
        AvailableQuantity:string;//用来存储次销售合同下，转出物料的可用数量

        salesContractList:any;//用来保存从列表页传递来的数据（销售合同列表）
        salesIndex:string;//用来保存是触发事件列表的下标，用于回传数据是绑定
        SC_Code:string;//用来保存路由跳转传递的值
        SC_Code_hand_input:string; // 保存手动输入的销售合同号

    ngOnInit() { 

        //获取对话框对象,不能放constructor里面
        this.modal = this.xcModalService.getInstance(this);
        
        this.modal.onShow().subscribe(data => {//显示弹窗
            console.log(data);
            if (data) {//如果有传递过来的值，则显示查看弹出框
                this.salesContractList=data[0];//存储传递来的销售合同列表数据
                this.salesIndex=data[1];//存储下标，用来回传回去时，确定绑定数据的位置
            }

        });
        

    }
    //确定
    getMainContractCode(){

         console.log(this.materielSales);
         this.modal.hide(this.materielSales);
         this.MainContractCode="";
         this.SC_Code_hand_input="";
    }

    //获取选择项的数
    getIndex(i){
     this.AvailableQuantity=this.salesContractList[i].AvailableQuantity;
     this.materielSales=[this.MainContractCode,this.salesIndex,this.AvailableQuantity];//保存选择的数据
    }

    cancel(){
        this.MainContractCode="";// 清除选择的销售合同号
        this.SC_Code_hand_input="";// 请求手动填写的销售合同号
        this.modal.hide();

    }

    goToSc(sc){//跳转到销售合同
      window.open(dbomsPath+"india/contractview?SC_Code="+sc);
    }


    //当手动输入销售合同号时的变化事件
    changeSC_Code() {

        if(this.SC_Code_hand_input) {
            this.materielSales=JSON.parse(JSON.stringify([this.SC_Code_hand_input.trim(),this.salesIndex,null]));// 保存销售合同号
            this.MainContractCode=null;
        }
     


    }


}