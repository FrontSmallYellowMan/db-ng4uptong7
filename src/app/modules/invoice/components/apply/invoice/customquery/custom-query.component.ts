import { Component, OnInit } from '@angular/core';
import { XcModalService, XcModalRef } from 'app/shared/index';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';
import { environment } from "../../../../../../../environments/environment.prod";
@Component({
  templateUrl: './custom-query.component.html',
  styleUrls: ['../../../../scss/modal-data.component.scss','./custom-query.component.scss']
})
export class CustomQueryComponent implements OnInit {

  modal:XcModalRef;
  //查询条件
  public custom:string = "";
  public index=0;
  public loading:boolean=false;

  //列表list
  public customList: Array<any> = new Array<any>(); 
 
  constructor( 
    private windowService: WindowService,
    private xcModalService: XcModalService ,
    private http: Http) {  
  }

   ngOnInit(){
      //获得弹出框自身
      this.modal = this.xcModalService.getInstance(this);
      this.modal.onShow().subscribe((index?) => {
        this.index=index;
        this.custom="";
    })
  } 
  //关闭弹出框
  hide(data?: any) {
    this.modal.hide(data);
    this.customList = null;
  }

  changeCheck(customcode){
    this.customList.forEach(
      item => {
        if(item.KUNNR == customcode){
          item.checked = true;
        }else{
          item.checked = false;
        }
      }
    );
    this.save();
  }

  checkEnterKey(e){
    if(e==13){
      return false;
    }
  }
  
  //保存数据
  save(){
    let custom :any=null;
    this.customList.filter(item => item.checked === true).forEach(item => {
        custom = item;
        custom.index = this.index;
    });
    this.hide(custom);
  }

  searchCustom(){
    if(this.custom==""){
       alert("请输入查询条件");
       return;
    }
    this.loading = true;
    let params = this.custom;
    this.http.post(environment.server+`E_Contract/GetBuyerInfo/${params}`,{} )
          .map(res => res.json())
          .subscribe(res => {
              if(res.Data){
                  this.customList = JSON.parse(res.Data);
              }else{
                this.customList =null;
              }
              this.loading = false;
          });
  }

}
