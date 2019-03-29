import { Component, OnInit } from '@angular/core';
import { XcModalService, XcBaseModal, XcModalRef, Person } from 'app/shared/index';

declare var window;

@Component({
  selector: 'batch-popErrMes',
  templateUrl: 'batch-material-price-popErrMes.component.html',
  styleUrls:['batch-material-price-popErrMes.component.scss']
})

export class BatchMaterialPricePopErrMesComponent implements OnInit {

  modal:XcModalRef;//模态窗
  errorMessageList:any=[];//错误信息列表
  constructor(
    private xcModalService: XcModalService,
  ) { }

  ngOnInit() { 
    //获取对话框对象,不能放constructor里面
    this.modal = this.xcModalService.getInstance(this);

    //弹窗弹出时，展示内容
    this.modal.onShow().subscribe(data=>{

      if(data){
        this.errorMessageList=data;
      }
    });
  }

  //关闭窗口
  close(){
    this.modal.hide();
  }
}