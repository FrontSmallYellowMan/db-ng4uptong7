import { Component, OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';


@Component({
  selector: 'edit-HUAWEI-typeList',
  templateUrl: 'edit-HUAWEI-promised-typeList.component.html',
  styleUrls:['edit-HUAWEI-promised-typeList.component.scss','../../../scss/promised.component.scss']
})

export class EditHUAWEIPromisedTypeListComponent implements OnInit {
  
  modal: XcModalRef;//声明弹窗
  promisedTypeList:any[]=[];//获取到的承诺类型

  selectTypes:any[]=[];//选择的类型数组

  checked:any;//临时变量

  constructor(
    private xcModalService: XcModalService
  ) { }

  ngOnInit() { 
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);
        
    this.modal.onShow().subscribe(data => {//显示弹窗
        if (data) {//如果有传递过来的值，则显示查看弹出框
          //console.log(data); 
          this.promisedTypeList=data;//将承诺类型赋值给列表字段
          this.promisedTypeList.forEach(element=>{
            element.checked=false;
          })
        }

    });


  }

  //获取承诺类型列表
  getTypeLlist(){
    this.selectTypes=this.promisedTypeList.filter(item=>item.checked);
    this.modal.hide(JSON.stringify(this.selectTypes));
    
  }

  //取消
  cancel(){
    this.modal.hide();
  }


  

}